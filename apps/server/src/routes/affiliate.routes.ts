import { Router } from 'express';
import { 
  getAllAffiliateLinks, 
  addCustomAffiliateLink, 
  matchAffiliateForContent, 
  recordAffiliateClick, 
  getAffiliateAnalytics 
} from '../services/affiliate.service';

const router = Router({ mergeParams: true });

// Get all affiliate links and stats
router.get('/', (req, res) => {
  const workspaceId = (req.params as any).id || (req as any).workspaceId || 'default';
  const links = getAllAffiliateLinks(workspaceId);
  const analytics = getAffiliateAnalytics(workspaceId);
  res.json({ success: true, links, analytics });
});

// Add custom affiliate link
router.post('/custom', (req, res) => {
  const workspaceId = (req.params as any).id || (req as any).workspaceId || 'default';
  const { name, url, category, commissionType, commissionRate, estimatedEpc, tags, ctaPhrase, badge } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'Nomi va URL manzili majburiy' });
  }

  const created = addCustomAffiliateLink(workspaceId, {
    name,
    url,
    category: category || 'Maxsus Hamkorlik',
    commissionType: commissionType || 'recurring',
    commissionRate: commissionRate || '20%',
    estimatedEpc: estimatedEpc || '$2.00',
    tags: Array.isArray(tags) ? tags : [name.toLowerCase()],
    ctaPhrase: ctaPhrase || `🔗 Try ${name}:`,
    badge: badge || 'Custom'
  });

  res.json({ success: true, link: created });
});

// Auto match affiliate for video topic
router.post('/match', (req, res) => {
  const workspaceId = (req.params as any).id || (req as any).workspaceId || 'default';
  const { topic, script } = req.body;
  const matched = matchAffiliateForContent(workspaceId, topic || '', script || '');
  res.json({ success: true, matched });
});

// Click tracking redirect or log
router.get('/click/:linkId', (req, res) => {
  const workspaceId = (req.params as any).id || (req as any).workspaceId || 'default';
  const { linkId } = req.params;
  const userAgent = req.headers['user-agent'];

  recordAffiliateClick(workspaceId, linkId, userAgent);

  const links = getAllAffiliateLinks(workspaceId);
  const target = links.find(l => l.id === linkId);

  if (req.headers.accept?.includes('application/json')) {
    return res.json({ success: true, redirectUrl: target?.url || '/' });
  }

  if (target?.url) {
    return res.redirect(target.url);
  }
  res.redirect('/');
});

export default router;
