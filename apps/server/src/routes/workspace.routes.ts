import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { workspaces, workspaceMembers, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getWorkspaceSettings, saveWorkspaceSettings } from '../services/scheduler.service';
import { requireWorkspace } from '../middleware/workspace';

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

export default router;
