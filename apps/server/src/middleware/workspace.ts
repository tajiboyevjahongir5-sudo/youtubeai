import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { workspaces, workspaceMembers } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { userAuthService } from '../services/user-auth.service';

export const requireWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Foydalanuvchi aniqlanmadi',
    });
  }

  // Candidate workspace from URL param or header or auth token
  const requestedWorkspaceId = req.params.id || (req.headers['x-workspace-id'] as string) || req.workspaceId;
  if (!requestedWorkspaceId) {
    return res.status(400).json({
      success: false,
      error: 'Workspace ID ko‘rsatilmagan',
    });
  }

  // 1. Verify against userAuthService user record
  const user = userAuthService.getUserById(userId);
  if (user && user.workspaceId === requestedWorkspaceId) {
    req.workspaceId = requestedWorkspaceId;
    return next();
  }

  // 2. Verify against database records if DB is active
  try {
    const member = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, requestedWorkspaceId),
        eq(workspaceMembers.userId, userId)
      ),
    });

    if (member) {
      req.workspaceId = requestedWorkspaceId;
      return next();
    }

    const ownedWorkspace = await db.query.workspaces.findFirst({
      where: and(
        eq(workspaces.id, requestedWorkspaceId),
        eq(workspaces.ownerId, userId)
      ),
    });

    if (ownedWorkspace) {
      req.workspaceId = requestedWorkspaceId;
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Forbidden: Ushbu ishchi muhitga (workspace) kirish huquqiga ega emassiz',
    });
  } catch (error) {
    // If DB check fails or error occurs, strictly enforce access restriction
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Ushbu ishchi muhitga (workspace) kirish huquqiga ega emassiz',
    });
  }
};
