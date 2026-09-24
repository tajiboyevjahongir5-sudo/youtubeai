import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { contentItems } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { aiService } from '../services/ai.service';
import { youtubeService } from '../services/youtube.service';
import { contentStore } from '../services/content-store.service';
import { videoRenderService } from '../services/video-render.service';
import { videoInspectorService } from '../services/video-inspector.service';
import { getWorkspaceSettings } from '../services/workspace-settings.service';

const router = Router({ mergeParams: true });

router.post('/refresh-channel-ideas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
    const settings = getWorkspaceSettings(workspaceId);
    const analysis = settings.channelAnalysis || {
      channelTitle: settings.sourceChannelUrl || settings.niche || 'Kanal Mavzusi',
      niche: settings.niche || 'AI Tools & Tech 2026',
      subNiches: settings.subNiches || '',
      topPerformingTopics: [
        `${settings.niche || 'Trend'}: 3 Secrets Top Creators Use in 2026 #Shorts`,
        `The Shocking Truth About ${settings.niche || 'This Trend'} #Shorts`,
        `How to 10x Your Results With ${settings.niche || 'AI'} #Shorts`
      ]
    };

    const newItems = contentStore.refreshIdeasForChannel(workspaceId, analysis, true);
    res.json({
      success: true,
      count: newItems.length,
      items: newItems,
      channelTitle: analysis.channelTitle,
      niche: analysis.niche,
      message: `"${analysis.channelTitle || analysis.niche}" mavzusi asosida 3 ta yangi loyiha yaratildi!`
    });
  } catch (error) {
    next(error);
  }
});

router.post('/clear-old-drafts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
    contentStore.clearDrafts(workspaceId);
    res.json({ success: true, message: 'Barcha eski qoralamalar tozalandi' });
  } catch (error) {
    next(error);
  }
});

router.post('/ideas/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ideas = await aiService.generateIdea(req.workspaceId || 'default');
    res.json(ideas);
  } catch (error) {
    next(error);
  }
});

const createContentSchema = z.object({
  title: z.string().min(1),
  status: z.enum(['idea', 'scripting', 'storyboarding', 'generating', 'review', 'approved', 'scheduled', 'published', 'failed']).optional().default('review'),
  videoFormat: z.enum(['shorts', 'long_form']).optional(),
  contentPillar: z.enum(['educational', 'entertaining', 'promotional']).optional().default('educational')
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
    const data = createContentSchema.parse(req.body);

    let generatedFromAi: any = null;
    try {
      generatedFromAi = await aiService.generateScript({
        workspaceId,
        title: data.title,
        videoFormat: data.videoFormat,
        contentPillar: data.contentPillar
      });
    } catch (e) {
      console.warn('AI generateScript error on creation:', e);
    }

    const newItem = contentStore.createItem({
      workspaceId,
      title: data.title,
      videoFormat: data.videoFormat,
      contentPillar: data.contentPillar,
      status: 'idea'
    });

    if (generatedFromAi) {
      contentStore.updateItem(newItem.id, {
        script: generatedFromAi.script || newItem.script,
        scenes: (generatedFromAi.scenes && Array.isArray(generatedFromAi.scenes) && generatedFromAi.scenes.length > 0) ? generatedFromAi.scenes : newItem.scenes,
        description: generatedFromAi.description || newItem.description,
        tags: (generatedFromAi.tags && Array.isArray(generatedFromAi.tags)) ? generatedFromAi.tags : newItem.tags,
        titleVariants: generatedFromAi.titleVariants || newItem.titleVariants,
        pinnedComment: generatedFromAi.pinnedComment || newItem.pinnedComment,
        loopTransition: generatedFromAi.loopTransition || newItem.loopTransition,
        highCpmKeywords: generatedFromAi.highCpmKeywords || newItem.highCpmKeywords
      });
    }

    const finalItem = contentStore.getById(newItem.id, workspaceId) || newItem;

    try {
      await db.insert(contentItems).values({
        id: finalItem.id,
        workspaceId,
        title: finalItem.title,
        status: finalItem.status,
        videoFormat: finalItem.videoFormat,
        contentPillar: finalItem.contentPillar,
        description: finalItem.description
      });
    } catch (dbErr) {
      // Local or fallback mode
    }

    res.status(201).json(finalItem);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
  
  const isConnected = youtubeService.isAuthenticated(workspaceId);
  // Strict workspace isolation: unauthenticated workspaces do not see owner videos
  if (!isConnected && workspaceId !== 'ws_j7ktjxw0') {
    const customItems = contentStore.getAll(workspaceId);
    return res.json(customItems);
  }

  const items = contentStore.getAll(workspaceId);
  res.json(items);
});

router.get('/:contentId', async (req: Request, res: Response, next: NextFunction) => {
  const contentId = req.params.contentId;
  const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';

  const item = contentStore.getById(contentId, workspaceId);
  if (!item) {
    return res.status(404).json({ error: 'Content item not found' });
  }

  res.json(item);
});

router.put('/:contentId', async (req: Request, res: Response, next: NextFunction) => {
  const contentId = req.params.contentId;
  const updated = contentStore.updateItem(contentId, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Content item not found' });
  }
  res.json(updated);
});

// Regenerate script and scenes dynamically for specific item
router.post('/:contentId/generate-script', async (req: Request, res: Response, next: NextFunction) => {
  const contentId = req.params.contentId;
  const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
  const item = contentStore.getById(contentId, workspaceId);

  if (!item) {
    return res.status(404).json({ error: 'Content item not found' });
  }

  let generatedFromAi: any = null;
  try {
    generatedFromAi = await aiService.generateScript({
      title: item.title,
      videoFormat: item.videoFormat,
      contentPillar: item.contentPillar
    });
  } catch (err) {
    console.warn('AI generateScript error on regeneration:', err);
  }

  const regenerated = contentStore.generateTailoredItem({
    id: item.id,
    workspaceId: item.workspaceId,
    title: item.title,
    videoFormat: item.videoFormat,
    contentPillar: item.contentPillar,
    status: item.status
  });

  const updated = contentStore.updateItem(contentId, {
    script: generatedFromAi?.script || regenerated.script,
    scenes: (generatedFromAi?.scenes && Array.isArray(generatedFromAi.scenes) && generatedFromAi.scenes.length > 0) ? generatedFromAi.scenes : regenerated.scenes,
    description: generatedFromAi?.description || regenerated.description,
    tags: (generatedFromAi?.tags && Array.isArray(generatedFromAi.tags)) ? generatedFromAi.tags : regenerated.tags,
    titleVariants: generatedFromAi?.titleVariants || regenerated.titleVariants,
    pinnedComment: generatedFromAi?.pinnedComment || regenerated.pinnedComment,
    loopTransition: generatedFromAi?.loopTransition || regenerated.loopTransition,
    highCpmKeywords: generatedFromAi?.highCpmKeywords || regenerated.highCpmKeywords,
    brief: regenerated.brief
  });

  res.json(updated || regenerated);
});

// Render dynamic MP4 video for specific topic item
router.post('/:contentId/generate-video', async (req: Request, res: Response, next: NextFunction) => {
  const contentId = req.params.contentId;
  const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
  const item = contentStore.getById(contentId, workspaceId);

  if (!item) {
    return res.status(404).json({ error: 'Content item not found' });
  }

  // Support optional dynamic overrides from request body
  if (req.body.voiceEmotionPreset) (item as any).voiceEmotionPreset = req.body.voiceEmotionPreset;
  if (req.body.backgroundMusicMood) (item as any).backgroundMusicMood = req.body.backgroundMusicMood;

  // Auto-inject series binge teaser into the outro if video is part of an episodic series
  try {
    const { seriesService } = await import('../services/series.service');
    const seriesCtx = seriesService.getVideoSeriesContext(workspaceId, contentId);
    if (seriesCtx.inSeries && seriesCtx.outroTeaser) {
      (item as any).bingeTeaser = seriesCtx.outroTeaser;
    }
  } catch (e) {}

  // Start rendering process in background
  const renderPromise = videoRenderService.renderVideo(item);

  // Railway Proxy Guard: If render takes more than 9s, respond 200 with status: 'rendering'
  // so the edge proxy never times out (502/504), while background render continues smoothly.
  const proxyGuardPromise = new Promise<any>((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        status: 'rendering',
        message: 'Video generatsiyasi davom etmoqda...',
        videoUrl: `/media/videos/${item.id}.mp4`,
        duration: item.durationSeconds || (item.videoFormat === 'long_form' ? 615 : 55)
      });
    }, 9000);
  });

  try {
    const result = await Promise.race([renderPromise, proxyGuardPromise]);
    res.json(result);
  } catch (error: any) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: error.message || 'Video render failed' });
  }
});

// Multi-Language Auto-Localization (Spanish / Uzbek)
router.post('/:contentId/localize', async (req: Request, res: Response, next: NextFunction) => {
  const contentId = req.params.contentId;
  const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
  const item = contentStore.getById(contentId, workspaceId);

  if (!item) {
    return res.status(404).json({ error: 'Content item not found' });
  }

  const targetLanguage = req.body.targetLanguage === 'es' ? 'es' : 'uz';

  try {
    console.log(`🌐 [Localization] "${item.title}" videoni ${targetLanguage.toUpperCase()} tiliga tarjima qilinmoqda...`);
    const localized = await aiService.localizeContent(item, targetLanguage);

    const voiceModel = targetLanguage === 'uz' ? 'uz-UZ-SardorNeural' : 'es-ES-AlvaroNeural';

    const newItem = contentStore.createItem({
      workspaceId,
      title: localized.title || `${item.title} (${targetLanguage.toUpperCase()})`,
      videoFormat: item.videoFormat,
      contentPillar: item.contentPillar,
      status: 'review'
    });

    contentStore.updateItem(newItem.id, {
      script: localized.script || item.script,
      scenes: (localized.scenes && Array.isArray(localized.scenes) && localized.scenes.length > 0) ? localized.scenes : item.scenes,
      description: localized.description || item.description,
      tags: localized.tags || item.tags,
      pinnedComment: localized.pinnedComment || item.pinnedComment,
      voiceModel,
      targetLanguage,
      parentContentId: item.id
    });

    const finalLocalized = contentStore.getById(newItem.id, workspaceId);
    console.log(`✅ [Localization] Yangi lokalizatsiyalangan kontent yaratildi: ${newItem.id} (${voiceModel})`);
    res.status(201).json(finalLocalized);
  } catch (error: any) {
    console.error('Localization error:', error);
    res.status(500).json({ error: error.message || 'Localization failed' });
  }
});

// AI Video Inspector & Quality Analysis (Gemini Multimodal & Neural Pulse QA)
router.post('/:contentId/ai-inspect', async (req: Request, res: Response, next: NextFunction) => {
  const contentId = req.params.contentId;
  const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
  const item = contentStore.getById(contentId, workspaceId);

  if (!item) {
    return res.status(404).json({ error: 'Content item not found' });
  }

  try {
    console.log(`🔍 [AI Video Inspector] "${item.title}" videoni tahlil qilish boshlandi...`);
    const report = await videoInspectorService.inspectVideo(item);
    res.json({ success: true, report });
  } catch (err: any) {
    console.error('AI Video Inspector error:', err);
    res.status(500).json({ error: err.message || 'AI Video inspection failed' });
  }
});

router.get('/:contentId/ai-inspect', async (req: Request, res: Response, next: NextFunction) => {
  const contentId = req.params.contentId;
  const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
  const item = contentStore.getById(contentId, workspaceId);

  if (!item) {
    return res.status(404).json({ error: 'Content item not found' });
  }

  if (item.aiQualityReport) {
    return res.json({ success: true, report: item.aiQualityReport });
  }

  try {
    const report = await videoInspectorService.inspectVideo(item);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Inspection failed' });
  }
});

export default router;
