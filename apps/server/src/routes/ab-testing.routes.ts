import { Router, Request, Response, NextFunction } from 'express';
import { abTestingService } from '../services/ab-testing.service';

const router = Router({ mergeParams: true });

// POST /api/workspaces/:id/ab-tests/generate
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = (req.params as any).id || (req as any).workspaceId || 'default';
    const { videoId, topic, currentTitle } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    const result = await abTestingService.generateVariants(workspaceId, videoId, topic, currentTitle);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/workspaces/:id/ab-tests/apply
router.post('/apply', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = (req.params as any).id || (req as any).workspaceId || 'default';
    const { videoId, variantId } = req.body;

    if (!videoId || !variantId) {
      return res.status(400).json({ error: 'videoId and variantId are required' });
    }

    const result = abTestingService.applyVariant(workspaceId, videoId, variantId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/workspaces/:id/ab-tests/:videoId
router.get('/:videoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoId } = req.params;
    const cached = abTestingService.getCached(videoId);
    if (!cached) {
      return res.status(404).json({ message: 'No active A/B test found for this video' });
    }
    res.json(cached);
  } catch (error) {
    next(error);
  }
});

export default router;
