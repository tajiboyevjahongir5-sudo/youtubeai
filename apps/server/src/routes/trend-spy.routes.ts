import { Router, Request, Response, NextFunction } from 'express';
import { trendSpyService } from '../services/trend-spy.service';

const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
    const trends = await trendSpyService.getViralTrends(workspaceId);
    res.json({ trends });
  } catch (err) {
    next(err);
  }
});

router.post('/adopt', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const item = await trendSpyService.adoptTrendAsContent(workspaceId, title);
    res.status(201).json({ success: true, item });
  } catch (err) {
    next(err);
  }
});

export default router;
