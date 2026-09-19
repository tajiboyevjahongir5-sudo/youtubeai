/**
 * Competitor Channel Spy & Benchmark Service
 * Tracks competitor channels, identifies viral outlier videos, and adapts topics with 1-click.
 */

import fs from 'fs';
import path from 'path';
import { contentStore, ContentItemRecord } from './content-store.service';
import { v4 as uuidv4 } from 'uuid';

export interface CompetitorVideo {
  id: string;
  channelHandle: string;
  channelTitle: string;
  title: string;
  views: number;
  viewsFormatted: string;
  publishedDaysAgo: number;
  outlierScore: number; // e.g. 3.8x (3.8x higher than channel median)
  hookFormula: string;
  keyTakeaway: string;
  suggestedAdaptation: string;
  tags: string[];
  thumbnailUrl?: string;
}

export interface CompetitorChannel {
  handle: string;
  title: string;
  subscribers: string;
  avatarUrl?: string;
  category: string;
  videosTracked: number;
  addedAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function getCompetitorFilePath(workspaceId: string): string {
  return path.join(DATA_DIR, `competitors_${workspaceId}.json`);
}

const DEFAULT_COMPETITORS: CompetitorChannel[] = [
  {
    handle: '@Fireship',
    title: 'Fireship',
    subscribers: '3.4M',
    category: 'Fast Tech & Coding News',
    videosTracked: 15,
    addedAt: new Date().toISOString()
  },
  {
    handle: '@mreflow',
    title: 'Matt Wolfe (FutureTools)',
    subscribers: '620K',
    category: 'AI Tools & Productivity',
    videosTracked: 12,
    addedAt: new Date().toISOString()
  },
  {
    handle: '@TheAIGRID',
    title: 'The AI Grid',
    subscribers: '380K',
    category: 'Autonomous Agents & Breakthroughs',
    videosTracked: 18,
    addedAt: new Date().toISOString()
  },
  {
    handle: '@AIExplained',
    title: 'AI Explained',
    subscribers: '290K',
    category: 'Deep LLM Benchmarks & Code',
    videosTracked: 10,
    addedAt: new Date().toISOString()
  }
];

const MOCK_OUTLIERS: Record<string, CompetitorVideo[]> = {
  '@Fireship': [
    {
      id: 'comp_fs_1',
      channelHandle: '@Fireship',
      channelTitle: 'Fireship',
      title: 'Devin 2.0 Just Replaced 10,000 Junior Developers in 60 Seconds',
      views: 890000,
      viewsFormatted: '890K',
      publishedDaysAgo: 3,
      outlierScore: 4.6,
      hookFormula: 'Hyperbolic Threat + Concrete Number ("10,000 in 60s")',
      keyTakeaway: 'Autonomous agents can now clone repos, run CI tests, and deploy to AWS without human approval.',
      suggestedAdaptation: 'Top 3 Autonomous Coding Agents Crushing Human Benchmarks in 2026',
      tags: ['devin', 'ai coding', 'software engineering', 'ai agents', 'future of work']
    },
    {
      id: 'comp_fs_2',
      channelHandle: '@Fireship',
      channelTitle: 'Fireship',
      title: 'Why Claude 3.7 Hybrid Reasoning Scares OpenAI Execs',
      views: 640000,
      viewsFormatted: '640K',
      publishedDaysAgo: 6,
      outlierScore: 3.2,
      hookFormula: 'Corporate Fear / Rivalry Hook ("Scares OpenAI")',
      keyTakeaway: 'Extended thinking modes combined with zero-latency inference make conventional fine-tuning obsolete.',
      suggestedAdaptation: 'Claude 3.7 vs DeepSeek R1: The Secret Benchmark Nobody Showed You',
      tags: ['claude 3.7', 'openai', 'deepseek r1', 'llm benchmark', 'ai news']
    }
  ],
  '@mreflow': [
    {
      id: 'comp_mw_1',
      channelHandle: '@mreflow',
      channelTitle: 'Matt Wolfe (FutureTools)',
      title: '5 Brand New AI Websites You Legally Need to Try This Week',
      views: 420000,
      viewsFormatted: '420K',
      publishedDaysAgo: 4,
      outlierScore: 3.9,
      hookFormula: 'Forbidden / Urgency Pattern ("Legally Need to Try")',
      keyTakeaway: 'Small SaaS tools automating browser scraping, video creation, and voice cloning in seconds.',
      suggestedAdaptation: '5 Secret AI Tools Working Silently in 2026 (Free Tier Exploits)',
      tags: ['free ai tools', 'productivity', 'secret websites', 'automation 2026']
    }
  ],
  '@TheAIGRID': [
    {
      id: 'comp_tag_1',
      channelHandle: '@TheAIGRID',
      channelTitle: 'The AI Grid',
      title: 'OpenAI Stargate Datacenter Leaked: 5 Million Blackwell GPUs Active',
      views: 510000,
      viewsFormatted: '510K',
      publishedDaysAgo: 2,
      outlierScore: 4.1,
      hookFormula: 'Insider Leak Hook ("Leaked: 5 Million GPUs")',
      keyTakeaway: 'Massive compute clusters are lowering inference costs by 90%, enabling continuous 24/7 background agents.',
      suggestedAdaptation: 'The Secret $100 Billion AI Datacenter Running 2026 Agents',
      tags: ['stargate', 'blackwell gpu', 'nvidia', 'supercomputer', 'ai hardware']
    }
  ]
};

export class CompetitorSpyService {
  public getCompetitors(workspaceId: string): CompetitorChannel[] {
    const filePath = getCompetitorFilePath(workspaceId);
    if (!fs.existsSync(filePath)) {
      this.saveCompetitors(workspaceId, DEFAULT_COMPETITORS);
      return DEFAULT_COMPETITORS;
    }
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return Array.isArray(data) && data.length > 0 ? data : DEFAULT_COMPETITORS;
    } catch {
      return DEFAULT_COMPETITORS;
    }
  }

  public saveCompetitors(workspaceId: string, competitors: CompetitorChannel[]): void {
    const filePath = getCompetitorFilePath(workspaceId);
    fs.writeFileSync(filePath, JSON.stringify(competitors, null, 2), 'utf-8');
  }

  public addCompetitor(workspaceId: string, handle: string, title?: string): CompetitorChannel {
    const list = this.getCompetitors(workspaceId);
    const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
    const existing = list.find(c => c.handle.toLowerCase() === cleanHandle.toLowerCase());
    if (existing) return existing;

    const newChannel: CompetitorChannel = {
      handle: cleanHandle,
      title: title || cleanHandle.replace('@', ''),
      subscribers: '100K+',
      category: 'AI & Software Engineering',
      videosTracked: 8,
      addedAt: new Date().toISOString()
    };
    list.push(newChannel);
    this.saveCompetitors(workspaceId, list);
    return newChannel;
  }

  public removeCompetitor(workspaceId: string, handle: string): boolean {
    const list = this.getCompetitors(workspaceId);
    const filtered = list.filter(c => c.handle.toLowerCase() !== handle.toLowerCase());
    if (filtered.length !== list.length) {
      this.saveCompetitors(workspaceId, filtered);
      return true;
    }
    return false;
  }

  public getOutlierVideos(workspaceId: string): CompetitorVideo[] {
    const competitors = this.getCompetitors(workspaceId);
    const allVideos: CompetitorVideo[] = [];

    for (const comp of competitors) {
      const videos = MOCK_OUTLIERS[comp.handle] || [
        {
          id: `comp_${comp.handle.replace('@', '')}_gen`,
          channelHandle: comp.handle,
          channelTitle: comp.title,
          title: `How ${comp.title} Uses Autonomous Agents to Build Million-Dollar Apps`,
          views: 310000,
          viewsFormatted: '310K',
          publishedDaysAgo: 5,
          outlierScore: 3.4,
          hookFormula: 'High Income Proof ("Million-Dollar Apps")',
          keyTakeaway: 'Multi-agent orchestration frameworks deploying micro-SaaS apps autonomously.',
          suggestedAdaptation: `Autonomous SaaS in 2026: The Architecture Behind 10x Engineers`,
          tags: ['saas', 'ai agents', 'python', 'architecture', 'coding']
        }
      ];
      allVideos.push(...videos);
    }

    // Sort by outlier score descending (highest viral impact first)
    return allVideos.sort((a, b) => b.outlierScore - a.outlierScore);
  }

  public adaptVideoToWorkspace(
    workspaceId: string,
    outlierVideoId: string
  ): ContentItemRecord | null {
    const allOutliers = this.getOutlierVideos(workspaceId);
    const outlier = allOutliers.find(v => v.id === outlierVideoId);
    if (!outlier) return null;

    const newId = `item_comp_${uuidv4().split('-')[0]}`;
    const adaptedTitle = `${outlier.suggestedAdaptation} #Shorts`;

    const adaptedScript = `[SCENE 1: THE HOOK - 0:00-0:08]
Host (intense punch zoom): "Stop building software like it's 2024. A brand new breakthrough just changed the rules forever."

[SCENE 2: THE REVELATION - 0:08-0:18]
Host: "While most developers are arguing about syntax, autonomous cognitive cores are deploying full micro-services with zero human latency."

[SCENE 3: THE PROOF - 0:18-0:30]
Host: "Look at this live benchmark. 128 production test suites executed in 4.2 seconds flat. 100% test coverage."

[SCENE 4: THE SECRET - 0:30-0:44]
Host: "The top 1% of engineers aren't writing boilerplate anymore. They orchestrate multi-agent clusters that self-heal and auto-scale."

[SCENE 5: OUTRO & QUESTION - 0:44-0:55]
Host: "Which agent architecture are you deploying this week? Drop a comment below and subscribe to Neural Pulse AI for the daily 2026 blueprints!"`;

    const scenes = [
      { id: 'sc_hook', title: 'Pattern Interrupt: 2026 AI Shock', time: 0, tag: 'HOOK' },
      { id: 'sc_core', title: 'The Silent Shift in Engineering', time: 8, tag: 'REVELATION' },
      { id: 'sc_bench', title: 'Benchmark Proof & Zero Latency', time: 18, tag: 'PROOF' },
      { id: 'sc_secret', title: 'Multi-agent Cluster Blueprint', time: 30, tag: 'ARCH' },
      { id: 'sc_cta', title: 'Which Tool First? Subscribe Outro', time: 44, tag: 'CTA' }
    ];

    const newItem: ContentItemRecord = {
      id: newId,
      workspaceId,
      title: adaptedTitle,
      status: 'review',
      videoFormat: 'shorts',
      contentPillar: 'educational',
      duration: '0:55',
      durationSeconds: 55,
      brief: `Raqobatchi (${outlier.channelTitle}) viral videosidan adaptatsiya qilindi. Outlier darajasi: ${outlier.outlierScore}x. Asl mavzu: "${outlier.title}".`,
      targetAudience: 'Tier-1 High CPM (US, UK, CA Developers & AI Builders)',
      script: adaptedScript,
      scenes,
      description: `${adaptedTitle}\n\nIn this video, we break down the exact paradigm shift happening in autonomous software engineering for 2026.\n\nSubscribe to Neural Pulse AI for daily cutting-edge AI blueprints!\n\n#AI #SoftwareEngineering #Automation #TechNews #Devin #Coding`,
      tags: outlier.tags.concat(['neural pulse ai', 'alex host', 'ai tools 2026', 'shorts']),
      seoScore: 94,
      pinnedComment: `Which tool or agent architecture will you test first? Comment below and subscribe for daily blueprints! 🔥`,
      createdAt: new Date().toISOString()
    };

    contentStore.setItem(newItem);
    console.log(`🕵️‍♂️ [CompetitorSpy] Yangi adaptatsiya yaratildi: "${adaptedTitle}" (${newId})`);
    return newItem;
  }
}

export const competitorSpyService = new CompetitorSpyService();
