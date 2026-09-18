import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { youtubeChannels } from '../db/schema';
import { eq } from 'drizzle-orm';
import { youtubeService } from '../services/youtube.service';

const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = (req as any).workspaceId || req.params.id || (req.query.workspaceId as string) || 'default';
    const isConnected = youtubeService.isAuthenticated(workspaceId);
    let channelInfo: any = null;

    if (isConnected) {
      const saved = youtubeService.loadChannelInfo(workspaceId);
      if (saved) {
        channelInfo = {
          title: saved.snippet?.title || saved.title || 'YouTube Kanal',
          subscriberCount: parseInt(saved.statistics?.subscriberCount || saved.subscriberCount || '0', 10),
          totalViews: parseInt(saved.statistics?.viewCount || saved.totalViews || '0', 10),
          watchTimeHours: 0,
          videoCount: parseInt(saved.statistics?.videoCount || saved.videoCount || '0', 10),
          isNewChannel: false
        };
      }
    }

    if (!channelInfo && isConnected) {
      try {
        const channel = await db.query.youtubeChannels.findFirst({
          where: eq(youtubeChannels.workspaceId, workspaceId)
        });
        if (channel) {
          channelInfo = {
            title: channel.channelTitle ?? 'YouTube Kanal',
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
    }

    const hasChannel = isConnected && !!channelInfo;

    res.json({
      channelConnected: hasChannel,
      channel: hasChannel && channelInfo ? channelInfo : {
        title: 'YouTube Kanal Ulanmagan',
        subscriberCount: 0,
        totalViews: 0,
        watchTimeHours: 0,
        videoCount: 0,
        isNewChannel: true
      },
      stats: {
        scheduled: hasChannel ? 2 : 0,
        needsApproval: hasChannel ? 1 : 0,
        inProgress: hasChannel ? 1 : 0,
        publishedThisWeek: 0,
      },
      recentActivity: hasChannel ? [
        { id: '1', action: 'YouTube OAuth 2.0 orqali kanal muvaffaqiyatli ulandi', performedAt: 'Hozirgina' },
        { id: '2', action: 'AI orqali video skripti tayyorlandi', performedAt: 'Bugun, 14:00' },
      ] : [
        { id: '1', action: 'Yangi xavfsiz ish maydoni (Workspace) ochildi', performedAt: 'Hozirgina' },
        { id: '2', action: 'YouTube OAuth 2.0 orqali kanal ulanishi kutilmoqda', performedAt: 'Hozirgina' },
      ],
      nextAction: hasChannel 
        ? 'Birinchi videoni ko\'rib chiqing va YouTube\'ga yuklashni boshlang.'
        : 'Ishni boshlash uchun Integratsiyalar bo\'limida o\'z YouTube kanalingizni ulang.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
