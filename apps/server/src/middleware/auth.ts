import { clerkMiddleware, getAuth } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';
import { env } from '../env';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // If Clerk is configured with valid credentials, verify auth
  if (env.CLERK_SECRET_KEY && !env.CLERK_SECRET_KEY.includes('placeholder')) {
    try {
      const auth = getAuth(req);
      if (!auth.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (e) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  next();
};

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  let userId: string | undefined = undefined;
  if (env.CLERK_SECRET_KEY && !env.CLERK_SECRET_KEY.includes('placeholder')) {
    try {
      const auth = getAuth(req);
      userId = auth.userId || undefined;
    } catch (e) {
      // ignore
    }
  }

  // Fallback to dev user
  if (!userId) {
    userId = (req as any).auth?.userId || 'user_dev_workspace';
  }

  req.userId = userId;
  next();
};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      workspaceId?: string;
    }
  }
}
