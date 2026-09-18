import { Router, Request, Response, NextFunction } from 'express';
import { seoRankService } from '../services/seo-rank.service';

const router = Router({ mergeParams: true });

// POST /api/workspaces/:id/seo-rank/analyze
router.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoId, title, description, tags } = req.body;
    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    const audit = seoRankService.analyze(videoId, title, description, tags);
    res.json(audit);
  } catch (error) {
    next(error);
  }
});

// POST /api/workspaces/:id/seo-rank/optimize
router.post('/optimize', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoId } = req.body;
    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    const result = seoRankService.optimizeTags(videoId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
