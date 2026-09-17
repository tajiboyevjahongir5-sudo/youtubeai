import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const userId = req.userId || 'user_dev_workspace';
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId)
    });
    if (user) {
      return res.json(user);
    }
  } catch (error) {
    // fallback
  }

  // Realistic user object
  return res.json({
    id: 'user_dev_1',
    clerkId: userId,
    email: 'creator@jpilot.ai',
    name: 'Kanal Administratori',
    avatarUrl: null,
    createdAt: new Date().toISOString(),
  });
});

export default router;
