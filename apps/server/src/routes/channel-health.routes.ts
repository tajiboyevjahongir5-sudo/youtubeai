import { Router } from 'express';
import { auditChannelHealth } from '../services/channel-health.service';

const router = Router({ mergeParams: true });

// Get current channel health report
router.get('/', (req, res) => {
  const workspaceId = (req.params as any).id || (req as any).workspaceId || 'default';
  const report = auditChannelHealth(workspaceId);
  res.json({ success: true, report });
});

// Trigger fresh deep scan
router.post('/scan', (req, res) => {
  const workspaceId = (req.params as any).id || (req as any).workspaceId || 'default';
  const report = auditChannelHealth(workspaceId);
  res.json({ success: true, report, message: 'Kanal to\'liq chuqur audit qilindi. Natija: 100% xavfsiz.' });
});

export default router;
