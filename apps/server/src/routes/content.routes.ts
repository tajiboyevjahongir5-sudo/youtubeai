import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { contentItems } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { aiService } from '../services/ai.service';
import { youtubeService } from '../services/youtube.service';
import { contentStore } from '../services/content-store.service';
import { videoRenderService } from '../services/video-render.service';

const router = Router({ mergeParams: true });

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

  try {
    const result = await videoRenderService.renderVideo(item);
    res.json(result);
  } catch (error: any) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: error.message || 'Video render failed' });
  }
});

export default router;
