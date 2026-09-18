import { Router, Request, Response, NextFunction } from 'express';
import { seriesService } from '../services/series.service';

const router = Router({ mergeParams: true });

// GET /api/workspaces/:id/series
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = (req.params as any).id || (req as any).workspaceId || 'default';
    const list = seriesService.getSeriesList(workspaceId);
    res.json(list);
  } catch (error) {
    next(error);
  }
});

// POST /api/workspaces/:id/series
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = (req.params as any).id || (req as any).workspaceId || 'default';
    const { title, description, category, badge, targetEpisodes } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const created = seriesService.createSeries(workspaceId, {
      title,
      description,
      category,
      badge,
      targetEpisodes: targetEpisodes ? Number(targetEpisodes) : 10
    });

    res.json(created);
  } catch (error) {
    next(error);
  }
});

// POST /api/workspaces/:id/series/:seriesId/episodes
router.post('/:seriesId/episodes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = (req.params as any).id || (req as any).workspaceId || 'default';
    const { seriesId } = req.params;
    const { videoId, title } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    const updated = seriesService.addEpisode(workspaceId, seriesId, videoId, title);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// GET /api/workspaces/:id/series/video/:videoId
router.get('/video/:videoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = (req.params as any).id || (req as any).workspaceId || 'default';
    const { videoId } = req.params;
    const context = seriesService.getVideoSeriesContext(workspaceId, videoId);
    res.json(context);
  } catch (error) {
    next(error);
  }
});

export default router;
