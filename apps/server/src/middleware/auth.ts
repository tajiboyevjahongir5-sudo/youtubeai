import { Request, Response, NextFunction } from 'express';
import { userAuthService } from '../services/user-auth.service';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined = undefined;

  // 1. First check httpOnly cookie
  if (req.cookies && req.cookies.jpilot_token) {
    token = req.cookies.jpilot_token;
  }

  // 2. Fallback to Authorization: Bearer <token> header for mobile or external clients
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Autentifikatsiyadan o‘tish talab qilinadi',
    });
  }

  const payload = userAuthService.verifyToken(token);
  if (!payload || (!payload.id && !payload.sub)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Yaroqsiz yoki muddati o‘tgan sessiya',
    });
  }

  const userId = payload.sub || payload.id;
  req.userId = userId;
  req.workspaceId = payload.workspaceId;

  next();
};

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Foydalanuvchi aniqlanmadi',
    });
  }
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
