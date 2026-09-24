import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { workspaces, workspaceMembers, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getWorkspaceSettings, saveWorkspaceSettings, schedulerService } from '../services/scheduler.service';
import { requireWorkspace } from '../middleware/workspace';
import { analyzeAndSaveChannel } from '../services/channel-analysis.service';
import { youtubeService } from '../services/youtube.service';
import { contentStore } from '../services/content-store.service';

const router = Router();

const createWorkspaceSchema = z.object({
  name: z.string().min(1),
});

const updateSettingsSchema = z.object({
  settings: z.any(),
});

const onboardingSchema = z.object({
  niche: z.string().optional(),
  timezone: z.string().optional(),
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = createWorkspaceSchema.parse(req.body);
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const workspaceId = uuidv4();
    try {
      let user = await db.query.users.findFirst({ where: eq(users.id, userId) });
      if (!user) {
        await db.insert(users).values({ id: userId, clerkId: userId, email: `${userId}@jpilot.local` });
      }
      await db.insert(workspaces).values({
        id: workspaceId,
        name,
        ownerId: userId,
      });
      await db.insert(workspaceMembers).values({
        id: uuidv4(),
        workspaceId,
        userId,
        role: 'owner',
      });
    } catch (e) {
      // Dev mode fallback
    }

    res.status(201).json({ id: workspaceId, name });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requireWorkspace, async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const savedSettings = getWorkspaceSettings(id);
  try {
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, id),
    });
    if (workspace) {
      return res.json({
        ...workspace,
        settings: {
          ...(workspace.settings as any || {}),
          ...savedSettings,
        },
      });
    }
  } catch (error) {
    // Dev mode fallback
  }

  res.json({
    id: id,
    name: 'Tech Explorer English Studio',
    niche: savedSettings.niche || 'Technology & AI Automation',
    timezone: savedSettings.timezone || 'Asia/Tashkent',
    settings: savedSettings,
    createdAt: new Date().toISOString(),
  });
});

router.put('/:id/settings', requireWorkspace, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { settings } = updateSettingsSchema.parse(req.body);
    const persisted = saveWorkspaceSettings(req.params.id, settings);
    try {
      await db.update(workspaces)
        .set({ settings: persisted, updatedAt: new Date() })
        .where(eq(workspaces.id, req.params.id));
    } catch (e) {
      // Dev mode fallback
    }
    res.json({ success: true, settings: persisted });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/onboarding', requireWorkspace, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = onboardingSchema.parse(req.body);
    try {
      await db.update(workspaces)
        .set({ niche: data.niche, timezone: data.timezone, updatedAt: new Date() })
        .where(eq(workspaces.id, req.params.id));
    } catch (e) {
      // Dev mode fallback
    }
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

// YouTube Channel Analysis endpoint
const analyzeChannelSchema = z.object({
  channelUrl: z.string().min(1, 'YouTube kanal URL yoki @ handle kiritilishi kerak'),
});

router.post('/:id/analyze-channel', requireWorkspace, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { channelUrl } = analyzeChannelSchema.parse(req.body);
    const workspaceId = req.params.id;

    console.log(`[API] Channel analysis boshlandi: "${channelUrl}" [${workspaceId}]`);

    // Run analysis with a 60-second timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tahlil vaqti tugadi (60s). Qayta urinib ko\'ring.')), 60000)
    );

    const analysisPromise = analyzeAndSaveChannel(channelUrl, workspaceId);
    const result = await Promise.race([analysisPromise, timeoutPromise]) as any;

    // Also try to persist to DB
    try {
      await db.update(workspaces)
        .set({ settings: result.settings, updatedAt: new Date() })
        .where(eq(workspaces.id, workspaceId));
    } catch (e) {
      // Dev mode fallback — settings already saved to JSON file
    }

    res.json({
      success: true,
      analysis: result.analysis,
      settings: result.settings
    });
  } catch (error: any) {
    console.error(`[API] Channel analysis xatolik:`, error?.message || error);
    res.status(error?.message?.includes('API kaliti') ? 400 : 500).json({
      success: false,
      error: error?.message || 'Kanal tahlilida xatolik yuz berdi'
    });
  }
});

// Clone Competitor Content & Fast Monetization endpoint
router.post('/:id/clone-channel-content', requireWorkspace, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.params.id;
    const settings = getWorkspaceSettings(workspaceId);
    let analysis = req.body?.analysis || settings.channelAnalysis;

    // If analysis is not yet cached on server, analyze on the fly
    const channelInput = req.body?.channelUrl || settings.sourceChannelUrl;
    if (!analysis && channelInput) {
      try {
        console.log(`[Clone Engine] Tahlil mavjud emas, avtomatik tahlil qilinmoqda: ${channelInput}`);
        const fresh = await analyzeAndSaveChannel(channelInput, workspaceId);
        analysis = fresh.analysis;
      } catch (err: any) {
        console.warn(`[Clone Engine] Avtomatik tahlil xatosi:`, err.message);
      }
    }

    if (!analysis) {
      return res.status(400).json({
        success: false,
        error: "Avval biror mashhur YouTube kanalni tahlil qiling yoki kanal @handle'ni kiriting"
      });
    }

    const blueprints = analysis.clonedVideoBlueprints || [];
    const topics = analysis.topPerformingTopics || [];

    let itemsToCreate: any[] = [];
    if (blueprints.length > 0) {
      itemsToCreate = blueprints.slice(0, 3);
    } else if (topics.length > 0) {
      itemsToCreate = topics.slice(0, 3).map((t: string) => ({
        title: t.includes('#Shorts') ? t : `${t} #Shorts`,
        hook: `Stop scrolling! Here is the secret behind ${t}`,
        viralScore: 98,
        highCpmTag: analysis.niche || "AI Tools",
        targetDuration: 55
      }));
    } else {
      const channelName = analysis.channelTitle || 'Viral Channel';
      itemsToCreate = [
        {
          title: `${channelName}: 3 Secrets Top Creators Hide in 2026 #Shorts`,
          hook: `Stop doing this! Here are the 3 secrets from ${channelName} that changed everything.`,
          viralScore: 99,
          highCpmTag: analysis.niche || 'Tech',
          targetDuration: 55
        },
        {
          title: `How ${channelName} Blew Up: The Viral Blueprint #Shorts`,
          hook: `Want 10x more reach? This exact technique from ${channelName} guarantees massive retention.`,
          viralScore: 98,
          highCpmTag: analysis.niche || 'Tech',
          targetDuration: 55
        },
        {
          title: `${channelName} Masterclass: Instant Monetization Hack #Shorts`,
          hook: `Never make content the old way again. Here is the fast monetization framework.`,
          viralScore: 97,
          highCpmTag: analysis.niche || 'Tech',
          targetDuration: 55
        }
      ];
    }

    const createdItems: any[] = [];
    for (const bp of itemsToCreate) {
      const title = bp.title.includes('#Shorts') ? bp.title : `${bp.title} #Shorts`;
      const itemScript = bp.hook
        ? `[00:00 - 00:05] HOOK: "${bp.hook}"\n[00:05 - 00:20] SCENE 1: "The breakthrough that transformed this entire niche starts right here. Watch every second carefully."\n[00:20 - 00:35] SCENE 2: "Step 1: Automate the workflow. Step 2: Implement high-retention editing. The results speak for themselves."\n[00:35 - 00:50] SCENE 3: "Top creators are already banking on this exact formula. Will you adapt or get left behind?"\n[00:50 - 00:55] OUTRO: "Which tool will you test first? Drop your thoughts below and subscribe for daily breakdowns!"`
        : `[00:00 - 00:05] HOOK: "Stop scrolling! Here is the blueprint behind ${title.replace('#Shorts', '')}."\n[00:05 - 00:25] SCENE 1: "This exact strategy generated millions of impressions across top channels."\n[00:25 - 00:45] SCENE 2: "Apply this workflow today to skyrocket your channel growth and monetization."\n[00:45 - 00:55] OUTRO: "Subscribe now for daily high-value breakdowns!"`;

      const item = contentStore.createItem({
        workspaceId,
        title,
        videoFormat: 'shorts',
        contentPillar: 'educational',
        status: 'review'
      });

      // Enrich with script and high CPM tags from cloned blueprint
      const highCpmKeywords = analysis.monetizationRoadmap?.highCpmKeywords || ['AI', 'Productivity', 'Tech', 'Workflow'];
      contentStore.updateItem(item.id, {
        script: itemScript,
        highCpmKeywords,
        tags: Array.from(new Set([...item.tags, ...highCpmKeywords])).slice(0, 12)
      });
      createdItems.push(item);
    }

    // Automatically activate Auto-Pilot tuned to this cloned channel
    saveWorkspaceSettings(workspaceId, {
      sourceChannelUrl: channelInput || settings.sourceChannelUrl,
      sourceChannelId: analysis.channelId || settings.sourceChannelId,
      channelAnalysis: analysis,
      clonedChannelBlueprint: analysis.clonedChannelBlueprint || analysis,
      autoPilotEnabled: true,
      enabled: true,
      dailyTarget: 2,
      publishTimes: ['14:00', '20:00'],
      niche: analysis.niche,
      subNiches: analysis.subNiches,
      audience: analysis.audience,
      tone: analysis.tone
    });

    console.log(`🚀 [Clone Engine] "${analysis.channelTitle}" uslubida 3 ta viral video qoralamasi yaratildi [${workspaceId}]`);

    res.json({
      success: true,
      count: createdItems.length,
      createdItems,
      channelTitle: analysis.channelTitle,
      message: `"${analysis.channelTitle}" uslubida 3 ta viral video muvaffaqiyatli tayyorlandi va Avtopilot ushbu kanal formulasiga sozlandi!`
    });
  } catch (error: any) {
    console.error(`[API] clone-channel-content xatolik:`, error?.message || error);
    res.status(500).json({
      success: false,
      error: error?.message || "Kanal uslubini klonlashda xatolik yuz berdi"
    });
  }
});

// Auto-Pilot Status endpoint
router.get('/:id/auto-pilot-status', requireWorkspace, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.params.id;
    const settings = getWorkspaceSettings(workspaceId);
    const isAutoEnabled = settings.enabled ?? (settings.autoPilotEnabled ?? true);

    let channelInfo: any = null;
    let isConnected = false;
    try {
      channelInfo = await youtubeService.getLiveStats(workspaceId) || youtubeService.loadChannelInfo(workspaceId);
      isConnected = youtubeService.isAuthenticated(workspaceId);
    } catch (e) {}

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayVideos = (channelInfo?.recentVideos || []).filter((v: any) => {
      if (!v.publishedAt) return false;
      try {
        return new Date(v.publishedAt).toISOString().slice(0, 10) === todayStr;
      } catch (e) { return false; }
    });

    res.json({
      success: true,
      workspaceId,
      autoPilotEnabled: isAutoEnabled,
      approvalMode: settings.approvalMode,
      publishTimes: settings.publishTimes || ['14:00', '20:00'],
      dailyTarget: settings.dailyTarget || 2,
      todayPublishedCount: todayVideos.length,
      isConnected,
      channelTitle: channelInfo?.title || channelInfo?.channelTitle || 'Ulanmagan',
      subscriberCount: channelInfo?.subscriberCount || '0',
      viewCount: channelInfo?.viewCount || '0',
      niche: settings.niche,
      activeAiModel: 'Pollinations GPT-4o / Gemini Flash + FLUX.1 + Azure Neural Voice'
    });
  } catch (error) {
    next(error);
  }
});

// Manual 1-Click Publish Now endpoint
router.post('/:id/trigger-publish', requireWorkspace, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.params.id;
    const result = await schedulerService.triggerImmediatePublish(workspaceId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'Video chiqarishda xatolik yuz berdi'
    });
  }
});

export default router;

