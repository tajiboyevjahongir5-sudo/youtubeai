import { Router } from 'express';
import authRoutes from './auth.routes';
import workspaceRoutes from './workspace.routes';
import dashboardRoutes from './dashboard.routes';
import youtubeRoutes from './youtube.routes';
import contentRoutes from './content.routes';
import generationRoutes from './generation.routes';
import approvalRoutes from './approval.routes';
import publishingRoutes from './publishing.routes';
import analyticsRoutes from './analytics.routes';
import telegramRoutes from './telegram.routes';
import auditRoutes from './audit.routes';
import adminRoutes from './admin.routes';
import billingRoutes from './billing.routes';
import trendSpyRoutes from './trend-spy.routes';
import communityRoutes from './community.routes';
import affiliateRoutes from './affiliate.routes';
import dubbingRoutes from './dubbing.routes';
import { requireAuth, requireUser } from '../middleware/auth';
import { requireWorkspace } from '../middleware/workspace';

const router = Router();

// Public routes & Admin routes (Admin has PIN-based auth)
router.use('/youtube', youtubeRoutes);
router.use('/admin', adminRoutes);
router.use('/billing', billingRoutes);

// Protected routes
router.use(requireAuth);
router.use(requireUser);

router.use('/me', authRoutes);
router.use('/workspaces', workspaceRoutes);

// Workspace specific routes
const workspaceRouter = Router({ mergeParams: true });
workspaceRouter.use(requireWorkspace);

workspaceRouter.use('/dashboard', dashboardRoutes);
workspaceRouter.use('/youtube', youtubeRoutes); // Some youtube routes might not need workspace ID in params directly, adjust as needed. We assume /api/workspaces/:id/youtube for channel info
workspaceRouter.use('/content', contentRoutes);
workspaceRouter.use('/content', generationRoutes);
workspaceRouter.use('/content', publishingRoutes);
workspaceRouter.use('/publishing-jobs', publishingRoutes);
workspaceRouter.use('/approvals', approvalRoutes);
workspaceRouter.use('/analytics', analyticsRoutes);
workspaceRouter.use('/trends', trendSpyRoutes);
workspaceRouter.use('/community', communityRoutes);
workspaceRouter.use('/affiliate', affiliateRoutes);
workspaceRouter.use('/dubbing', dubbingRoutes);
workspaceRouter.use('/telegram', telegramRoutes);
workspaceRouter.use('/billing', billingRoutes);
workspaceRouter.use('/', auditRoutes); // For /audit-logs and /activity

router.use('/workspaces/:id', workspaceRouter);

export default router;
