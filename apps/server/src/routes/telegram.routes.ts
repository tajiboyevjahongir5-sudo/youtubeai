import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router({ mergeParams: true });

router.post('/link', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const linkCode = uuidv4().substring(0, 8);
    // save to DB
    res.json({ linkCode });
  } catch (error) {
    next(error);
  }
});

router.post('/disconnect', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/test', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, message: 'Test message sent' });
  } catch (error) {
    next(error);
  }
});

export default router;
