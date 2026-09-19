import { Router, Request, Response, NextFunction } from 'express';
import { communityEngagementService } from '../services/community-engagement.service';

const router = Router({ mergeParams: true });

router.get('/polls', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
    const polls = await communityEngagementService.generateCommunityPolls(workspaceId);
    res.json({ polls });
  } catch (err) {
    next(err);
  }
});

router.post('/polls/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
    const { topic } = req.body;
    const polls = await communityEngagementService.generateCommunityPolls(workspaceId, topic);
    res.json({ polls });
  } catch (err) {
    next(err);
  }
});

router.post('/comments/reply', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
    const { videoTitle, comment } = req.body;
    if (!comment) {
      return res.status(400).json({ error: 'Comment text is required' });
    }
    const result = await communityEngagementService.generateCommentReplies(
      workspaceId,
      videoTitle || 'Neural Pulse AI Video',
      comment
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/pinned/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
    const { videoTitle, summary } = req.body || {};
    const options = await communityEngagementService.generatePinnedComments(
      workspaceId,
      videoTitle || 'Neural Pulse AI Video',
      summary
    );
    res.json({ success: true, options });
  } catch (err) {
    next(err);
  }
});

router.post('/pinned/publish', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.workspaceId || (req.query.workspaceId as string) || 'default';
    const { videoId, commentText } = req.body || {};
    if (!commentText) {
      return res.status(400).json({ success: false, error: 'commentText talab qilinadi' });
    }
    const result = await communityEngagementService.publishPinnedComment(
      workspaceId,
      videoId,
      commentText
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
