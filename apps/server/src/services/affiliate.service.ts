import fs from 'fs';
import path from 'path';

export interface AffiliateLinkItem {
  id: string;
  name: string;
  url: string;
  category: string;
  commissionType: 'recurring' | 'one_time';
  commissionRate: string;
  estimatedEpc: string; // Earnings per click e.g. "$1.45"
  tags: string[];
  ctaPhrase: string;
  badge: string;
  isCustom?: boolean;
}

export interface AffiliateClickRecord {
  linkId: string;
  clickedAt: string;
  userAgent?: string;
}

export interface WorkspaceAffiliateData {
  customLinks: AffiliateLinkItem[];
  clicks: AffiliateClickRecord[];
}

const DEFAULT_CATALOG: AffiliateLinkItem[] = [
  {
    id: 'aff_cursor',
    name: 'Cursor AI Code Editor',
    url: 'https://cursor.com/?ref=jpilot_creator',
    category: 'AI Dasturlash',
    commissionType: 'recurring',
    commissionRate: '20% har oy',
    estimatedEpc: '$2.80',
    tags: ['coding', 'developer', 'python', 'agent', 'software', 'programming', 'code', 'ide'],
    ctaPhrase: '⚡ Build apps 10x faster with Cursor AI (Free trial):',
    badge: 'High Converting'
  },
  {
    id: 'aff_make',
    name: 'Make.com Avtomatlashtirish',
    url: 'https://make.com/?ref=jpilot_ai',
    category: 'Avtomatlashtirish & Botlar',
    commissionType: 'recurring',
    commissionRate: '20% doimiy',
    estimatedEpc: '$3.40',
    tags: ['automation', 'workflow', 'autoflow', 'nocode', 'agent', 'productivity', 'tools'],
    ctaPhrase: '🤖 Connect 1,000+ apps automatically with Make:',
    badge: 'Top SaaS'
  },
  {
    id: 'aff_elevenlabs',
    name: 'ElevenLabs AI Ovoz Studiyasi',
    url: 'https://elevenlabs.io/?ref=jpilot_voice',
    category: 'AI Ovoz & Diksiya',
    commissionType: 'recurring',
    commissionRate: '22% har oy',
    estimatedEpc: '$2.15',
    tags: ['voice', 'audio', 'tts', 'speech', 'clone', 'speech-to-text', 'podcast'],
    ctaPhrase: '🎙️ Generate hyper-realistic AI voices in seconds:',
    badge: 'Creator Choice'
  },
  {
    id: 'aff_perplexity',
    name: 'Perplexity Pro AI Research',
    url: 'https://perplexity.ai/pro?ref=jpilot_search',
    category: 'Qidiruv & Tadqiqot',
    commissionType: 'one_time',
    commissionRate: '$10 har bir a’zolik',
    estimatedEpc: '$1.90',
    tags: ['research', 'search', 'perplexity', 'phind', 'learning', 'knowledge', 'ai'],
    ctaPhrase: '🔍 Get instant cited answers with Perplexity Pro ($10 off):',
    badge: 'Popular'
  },
  {
    id: 'aff_hostinger',
    name: 'Hostinger Cloud & VPS Hosting',
    url: 'https://hostinger.com/?ref=jpilot_cloud',
    category: 'Bulut & Serverlar',
    commissionType: 'one_time',
    commissionRate: '40% komissiya',
    estimatedEpc: '$4.50',
    tags: ['hosting', 'server', 'deploy', 'vps', 'cloud', 'linux', 'docker'],
    ctaPhrase: '🚀 Host your AI bots and web apps with 75% off:',
    badge: 'Highest Payout'
  }
];

const DATA_DIR = path.resolve(process.cwd(), 'data', 'affiliate');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getFilePath(workspaceId: string): string {
  ensureDataDir();
  return path.join(DATA_DIR, `${workspaceId}.json`);
}

function loadAffiliateData(workspaceId: string): WorkspaceAffiliateData {
  const fp = getFilePath(workspaceId);
  if (!fs.existsSync(fp)) {
    return { customLinks: [], clicks: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf-8'));
  } catch {
    return { customLinks: [], clicks: [] };
  }
}

function saveAffiliateData(workspaceId: string, data: WorkspaceAffiliateData) {
  const fp = getFilePath(workspaceId);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf-8');
}

export function getAllAffiliateLinks(workspaceId: string): AffiliateLinkItem[] {
  const data = loadAffiliateData(workspaceId);
  return [...data.customLinks, ...DEFAULT_CATALOG];
}

export function addCustomAffiliateLink(workspaceId: string, link: Omit<AffiliateLinkItem, 'id'>): AffiliateLinkItem {
  const data = loadAffiliateData(workspaceId);
  const newLink: AffiliateLinkItem = {
    ...link,
    id: `custom_${Date.now()}`,
    isCustom: true
  };
  data.customLinks.unshift(newLink);
  saveAffiliateData(workspaceId, data);
  return newLink;
}

export function matchAffiliateForContent(workspaceId: string, topic: string, script?: string): AffiliateLinkItem[] {
  const allLinks = getAllAffiliateLinks(workspaceId);
  const corpus = `${topic} ${script || ''}`.toLowerCase();

  const scored = allLinks.map(link => {
    let score = 0;
    for (const tag of link.tags) {
      if (corpus.includes(tag.toLowerCase())) {
        score += 3;
      }
    }
    if (corpus.includes(link.name.toLowerCase())) {
      score += 10;
    }
    return { link, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter(s => s.score > 0).map(s => s.link).slice(0, 2).concat(
    scored.filter(s => s.score === 0).map(s => s.link).slice(0, 1)
  ).slice(0, 2);
}

export function recordAffiliateClick(workspaceId: string, linkId: string, userAgent?: string) {
  const data = loadAffiliateData(workspaceId);
  data.clicks.push({
    linkId,
    clickedAt: new Date().toISOString(),
    userAgent
  });
  saveAffiliateData(workspaceId, data);
}

export function getAffiliateAnalytics(workspaceId: string) {
  const data = loadAffiliateData(workspaceId);
  const allLinks = getAllAffiliateLinks(workspaceId);
  
  const clickCountByLink: Record<string, number> = {};
  for (const c of data.clicks) {
    clickCountByLink[c.linkId] = (clickCountByLink[c.linkId] || 0) + 1;
  }

  const totalClicks = data.clicks.length;
  // Estimated revenue calculation: avg $2.20 per click conversion rate ~3%
  const estimatedRevenue = (totalClicks * 1.85).toFixed(2);

  const linkStats = allLinks.map(l => ({
    ...l,
    clicks: clickCountByLink[l.id] || 0,
    estimatedEarned: ((clickCountByLink[l.id] || 0) * 1.85).toFixed(2)
  }));

  return {
    totalClicks,
    estimatedRevenue,
    linkStats,
    recentClicks: data.clicks.slice(-10).reverse()
  };
}
