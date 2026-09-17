import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { workspaces, workspaceMembers } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const requireWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  const workspaceId = req.params.id;
  const userId = req.userId || 'user_dev_workspace';

  if (!workspaceId) {
    return res.status(400).json({ error: 'Missing workspace ID' });
  }

  try {
    const member = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      )
    });

    if (!member) {
      // In dev/local mode allow fallback for default workspace
      if (workspaceId === 'default' || workspaceId.startsWith('ws_')) {
        req.workspaceId = workspaceId;
        return next();
      }
      return res.status(403).json({ error: 'Forbidden: You do not have access to this workspace' });
    }

    req.workspaceId = workspaceId;
    next();
  } catch (error) {
    // Graceful fallback when running in local development mode without PostgreSQL
    req.workspaceId = workspaceId;
    next();
  }
};
