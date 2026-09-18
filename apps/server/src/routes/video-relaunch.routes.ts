import { Router, Request, Response, NextFunction } from 'express';
import { videoRelaunchService } from '../services/video-relaunch.service';

const router = Router({ mergeParams: true });

// GET /api/workspaces/:id/video-relaunch/status/:videoId
router.get('/status/:videoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = (req.params as any).id || (req as any).workspaceId || 'default';
    const { videoId } = req.params;
    const status = videoRelaunchService.getStatus(workspaceId, videoId);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

// POST /api/workspaces/:id/video-relaunch/trigger/:videoId
router.post('/trigger/:videoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = (req.params as any).id || (req as any).workspaceId || 'default';
    const { videoId } = req.params;
    const result = await videoRelaunchService.triggerRelaunch(workspaceId, videoId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
