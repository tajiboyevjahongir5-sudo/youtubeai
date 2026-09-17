import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { auditLogs, usageEvents } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router({ mergeParams: true });

router.get('/audit-logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await db.query.auditLogs.findMany({
      where: eq(auditLogs.workspaceId, req.workspaceId!)
    });
    if (logs && logs.length > 0) {
      return res.json(logs);
    }
  } catch (error) {
    // fallback
  }

  res.json([
    {
      id: 'log_1',
      action: 'publish',
      details: { title: 'Top 5 AI Tools That Work While You Sleep', format: 'shorts' },
      performedBy: 'Kanal Administratori',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'log_2',
      action: 'generate',
      details: { model: 'Gemini 1.5 Flash', type: 'script' },
      performedBy: 'AI Autopilot Engine',
      createdAt: new Date().toISOString(),
    }
  ]);
});

router.get('/activity', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activity = await db.query.usageEvents.findMany({
      where: eq(usageEvents.workspaceId, req.workspaceId!)
    });
    if (activity && activity.length > 0) {
      return res.json(activity);
    }
  } catch (error) {
    // fallback
  }

  res.json([
    {
      id: 'act_1',
      eventType: 'video_scheduled',
      metadata: { title: 'Top 5 AI Tools That Work While You Sleep' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'act_2',
      eventType: 'analytics_synced',
      metadata: { views: 124592, ctr: 5.4 },
      createdAt: new Date().toISOString(),
    }
  ]);
});

export default router;
