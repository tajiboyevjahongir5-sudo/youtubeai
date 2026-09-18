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

    const newItem = contentStore.createItem({
      workspaceId,
      title: data.title,
      videoFormat: data.videoFormat,
      contentPillar: data.contentPillar,
      status: data.status
    });

    try {
      await db.insert(contentItems).values({
        id: newItem.id,
        workspaceId,
        title: newItem.title,
        status: newItem.status,
        videoFormat: newItem.videoFormat,
        contentPillar: newItem.contentPillar,
        description: newItem.description
      });
    } catch (dbErr) {
      // Local or fallback mode
    }

    res.status(201).json(newItem);
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

  const regenerated = contentStore.generateTailoredItem({
    id: item.id,
    workspaceId: item.workspaceId,
    title: item.title,
    videoFormat: item.videoFormat,
    contentPillar: item.contentPillar,
    status: item.status
  });

  const updated = contentStore.updateItem(contentId, {
    script: regenerated.script,
    scenes: regenerated.scenes,
    description: regenerated.description,
    tags: regenerated.tags,
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
