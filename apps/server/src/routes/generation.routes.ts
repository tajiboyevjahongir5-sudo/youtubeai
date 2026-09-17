import { Router, Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';

const router = Router({ mergeParams: true });

router.post('/:contentId/generate-script', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await aiService.generateScript(req.params.contentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:contentId/generate-metadata', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await aiService.generateMetadata(req.params.contentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:contentId/generate-storyboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await aiService.generateStoryboard(req.params.contentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:contentId/quality-review', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await aiService.qualityReview(req.params.contentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:contentId/request-approval', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Logic to request approval via telegram
    res.json({ success: true, message: 'Approval requested' });
  } catch (error) {
    next(error);
  }
});

export default router;
