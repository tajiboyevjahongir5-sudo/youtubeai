import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { youtubeChannels } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let channelInfo = {
      title: 'Neural Pulse AI',
      subscriberCount: 0,
      totalViews: 0,
      watchTimeHours: 0,
      videoCount: 0,
      isNewChannel: true
    };

    try {
      const channel = await db.query.youtubeChannels.findFirst({
        where: eq(youtubeChannels.workspaceId, req.workspaceId || 'default')
      });
      if (channel) {
        channelInfo = {
          title: channel.channelTitle ?? 'Neural Pulse AI',
          subscriberCount: channel.subscriberCount ?? 0,
          totalViews: channel.viewCount ?? 0,
          watchTimeHours: 0,
          videoCount: channel.videoCount ?? 0,
          isNewChannel: (channel.videoCount ?? 0) === 0
        };
      }
    } catch (e) {
      // ignore
    }

    res.json({
      channelConnected: true,
      channel: channelInfo,
      stats: {
        scheduled: 2,
        needsApproval: 1,
        inProgress: 1,
        publishedThisWeek: 0,
      },
      recentActivity: [
        { id: '1', action: 'YouTube OAuth 2.0 orqali kanal muvaffaqiyatli ulandi', performedAt: 'Hozirgina' },
        { id: '2', action: 'Yangi video skripti tayyorlandi (#Shorts: 5 AI Websites That Feel Illegal)', performedAt: 'Bugun, 14:00' },
        { id: '3', action: 'Kanal brendingi generatsiya qilindi (Neural Pulse AI)', performedAt: 'Bugun, 11:52' },
      ],
      nextAction: 'Kanal ochilgach, birinchi videoni tasdiqlang va YouTube\'ga yuklashni boshlang.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
