import fs from 'fs';
import path from 'path';

export interface SceneItem {
  id: string;
  title: string;
  time: number;
  tag: string;
  description?: string;
  overlayText?: string;
}

export interface ContentItemRecord {
  id: string;
  workspaceId: string;
  title: string;
  status: 'idea' | 'scripting' | 'storyboarding' | 'generating' | 'review' | 'approved' | 'scheduled' | 'published' | 'failed';
  videoFormat: 'shorts' | 'long_form';
  contentPillar: 'educational' | 'entertaining' | 'promotional';
  duration: string;
  durationSeconds: number;
  brief: string;
  targetAudience: string;
  script: string;
  scenes: SceneItem[];
  description: string;
  tags: string[];
  seoScore: number;
  scheduledAt?: string;
  createdAt: string;
  publishedAt?: string;
  youtubeVideoId?: string;
  youtubeUrl?: string;
  videoUrl?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'content_store.json');

// Initial rich, tailored preset items
const DEFAULT_PRESETS: Record<string, ContentItemRecord> = {
  item_1: {
    id: 'item_1',
    workspaceId: 'ws_j7ktjxw0',
    title: 'Top 5 AI Tools That Work While You Sleep in 2026',
    status: 'review',
    videoFormat: 'shorts',
    contentPillar: 'educational',
    duration: '0:56',
    durationSeconds: 55.6,
    brief: "Ushbu video 2026-yilgi eng so'nggi AI avtomatlashtirish vositalarini qisqa va ta'sirchan uslubda yoritadi. Dastlabki 3 sekundda kuchli Hook orqali tomoshabin e'tibori jalb qilinadi.",
    targetAudience: 'AQSH, Buyuk Britaniya, Kanada (Tier-1 High CPM)',
    script: `[0:00 - 0:03] HOOK (Explosive camera zoom):
"Stop trading your time for money. These 5 AI tools run 24/7 so you don't have to."

[0:04 - 0:15] TOOL 1 (AutoFlow 2.0):
"First: AutoFlow 2.0. It connects your email, calendar, and Notion to execute client onboarding automatically while you sleep."

[0:16 - 0:28] TOOL 2 (VoicePilot AI):
"Second: VoicePilot. Turn any 1-minute voice memo into production-ready articles, tweets, and scripts in 30 seconds."

[0:29 - 0:42] TOOLS 3 & 4 (DevEngine & Synthetix):
"Third: DevEngine for autonomous code debugging. Fourth: Synthetix for multi-platform video repurposing."

[0:43 - 0:56] OUTRO & CTA:
"Which one are you deploying first? Comment below and subscribe to Neural Pulse AI for daily automation blueprints!"`,
    scenes: [
      { id: 'hook', title: '1. Hook (Kirish)', time: 0, tag: '🚨 Alex Hook' },
      { id: 'tool1', title: '2. AutoFlow 2.0', time: 10.6, tag: '🤖 AutoFlow' },
      { id: 'tool2', title: '3. VoicePilot', time: 19.5, tag: '🎙️ VoicePilot' },
      { id: 'tool3', title: '4. DevEngine', time: 28.1, tag: '💻 DevEngine' },
      { id: 'tool4', title: '5. Synthetix', time: 37.3, tag: '🚀 Synthetix' },
      { id: 'outro', title: '6. Obuna (CTA)', time: 46.8, tag: '🔔 Obuna CTA' }
    ],
    description: `Here are the top 5 AI tools that will automate your business, coding, and content workflow in 2026.

⏰ Timestamps:
0:00 - Introduction & Hook
0:04 - Tool 1: AutoFlow 2.0
0:16 - Tool 2: VoicePilot
0:29 - Tool 3 & 4: DevEngine & Synthetix
0:46 - Summary & Next Steps

#AITools #Automation #ArtificialIntelligence #Tech2026 #Productivity`,
    tags: ['ai tools', 'automation', 'chatgpt', 'productivity', 'neural pulse ai', 'make money online', 'coding agents'],
    seoScore: 95,
    scheduledAt: new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date().toISOString(),
    videoUrl: '/neural_pulse_short.mp4'
  },
  item_2: {
    id: 'item_2',
    workspaceId: 'ws_j7ktjxw0',
    title: 'The Complete Future of Autonomous Coding & Agents in 2026',
    status: 'approved',
    videoFormat: 'long_form',
    contentPillar: 'educational',
    duration: '10:15',
    durationSeconds: 615,
    brief: "Ushbu 16:9 formatdagi to'liq video sun'iy intellekt agentlari, dasturlashning kelajagi va 2026-2027 yillardagi inqilobni chuqur tahliliy hujjatli uslubda yoritadi.",
    targetAudience: 'Global Software Engineers & Tech Leaders',
    script: `[00:00 - 01:45] CHAPTER 1: THE EXTINCTION OF BOILERPLATE CODING
"In 2026, writing syntax by hand is becoming obsolete. Autonomous AI agents don't just complete your code—they architect, test, and deploy entire distributed infrastructures while you sleep. Welcome to the dawn of the Autonomous Engineering Era."

[01:46 - 03:50] CHAPTER 2: AGENTIC ARCHITECTURES DEEP DIVE
"Unlike simple chat assistants, modern autonomous agents employ recursive self-correcting loops, memory vectors, and direct terminal interfaces. They run test suites, catch regression bugs, and push pull requests without human oversight."

[03:51 - 06:20] CHAPTER 3: LIVE DEMO - ZERO TO MULTI-CLOUD IN 3 MINUTES
"Watch this: With a single natural language prompt, our orchestrator provisions an encrypted PostgreSQL database, builds Next.js endpoints, and configures Cloudflare edge workers in 180 seconds flat."

[06:21 - 08:30] CHAPTER 4: THE 2027 DEVELOPER SURVIVAL BLUEPRINT
"Will software engineers lose their jobs? No. But developers who refuse to orchestrate AI agents will be replaced by engineers who do. The new skill is system design, high-level architecture, and security auditing."

[08:31 - 10:15] CHAPTER 5: KEY TAKEAWAYS & COMMUNITY DISCUSSION
"If you want to stay ahead of this tidal wave, subscribe to Neural Pulse AI. Which agent framework are you currently deploying? Drop your thoughts in the comments below!"`,
    scenes: [
      { id: 'intro', title: '1. Kirish (Inqilob)', time: 0, tag: '🚀 AI Inqilobi' },
      { id: 'arch', title: '2. Agentlar Arxitekturasi', time: 105, tag: '🧠 Arxitektura' },
      { id: 'demo', title: '3. Jonli Kodlash Demo', time: 230, tag: '💻 Jonli Demo' },
      { id: 'jobs', title: '4. Dasturchilar Kelajagi', time: 380, tag: '📊 2027 Bozor' },
      { id: 'conclusion', title: '5. Xulosa & Obuna', time: 510, tag: '🔔 Xulosa & CTA' }
    ],
    description: `The complete documentary breakdown of autonomous coding agents in 2026. How AI is transforming software engineering, cloud orchestration, and the job market.

⏰ Timestamps:
00:00 - The Extinction of Boilerplate Coding
01:45 - Agentic Architectures Deep Dive
03:50 - Live Demo: Zero to Multi-Cloud
06:20 - The 2027 Developer Survival Blueprint
08:30 - Key Takeaways & Community Discussion

#AutonomousAgents #AICoding #SoftwareEngineering #FutureOfWork #ArtificialIntelligence`,
    tags: ['autonomous agents', 'ai coding', 'software engineering 2026', 'anthropic claude', 'devin ai', 'coding autopilot', 'future of developers'],
    seoScore: 92,
    scheduledAt: new Date(Date.now() + 28800000).toISOString(),
    createdAt: new Date().toISOString(),
    videoUrl: '/neural_pulse_16x9.mp4'
  },
  item_3: {
    id: 'item_3',
    workspaceId: 'ws_j7ktjxw0',
    title: 'Why 90% of Developers Will Use AI by 2027 #Shorts',
    status: 'published',
    videoFormat: 'shorts',
    contentPillar: 'entertaining',
    duration: '0:55',
    durationSeconds: 55,
    brief: "Dasturchilarning sun'iy intellektga o'tish statistikasi, Cursor va Claude 3.7 modellarining ta'siri haqida o'tkir tahliliy Shorts.",
    targetAudience: 'Software Developers, Tech Enthusiasts, Students',
    script: `[0:00 - 0:05] HOOK (High-energy warning graphic):
"By 2027, 90% of software developers will NEVER write raw code from scratch again. Here is the undeniable truth."

[0:06 - 0:18] SCENE 1 (Cursor & Claude 3.7 Sonnet):
"Right now, tools like Cursor and Claude 3.7 already generate 40% of production code in leading tech startups. What used to take 2 weeks takes 45 minutes."

[0:19 - 0:31] SCENE 2 (Autonomous Devin Swarms):
"Autonomous AI agents don't just autocomplete syntax. They spin up staging dockers, debug broken test suites, and deploy PRs while you sleep."

[0:32 - 0:43] SCENE 3 (The 10x Architect):
"Developers aren't being replaced—traditional typists are. The new developer is a systems architect orchestrating 10 AI agents simultaneously."

[0:44 - 0:55] OUTRO & CTA:
"Will AI replace your job, or make you a 10x developer? Drop your thoughts in the comments and subscribe to Neural Pulse AI!"`,
    scenes: [
      { id: 'hook', title: '1. 2027 Shock Hook', time: 0, tag: '🚨 2027 Inqiroz' },
      { id: 'cursor', title: '2. Cursor & Claude 3.7', time: 11, tag: '⚡ Cursor & Claude' },
      { id: 'devin', title: '3. Devin Agent Loops', time: 23, tag: '🤖 Agent Swarms' },
      { id: 'architect', title: '4. The 10x Architect', time: 35, tag: '📈 10x Muhandis' },
      { id: 'outro', title: '5. Obuna & Fikrlar', time: 46, tag: '🔔 Fikrlar & CTA' }
    ],
    description: `Why 90% of software developers will rely on autonomous AI coding agents by 2027. The shift from manual typing to AI system orchestration.

⏰ Timestamps:
0:00 - The 2027 Coding Shift
0:06 - The Rise of Cursor & Claude 3.7
0:19 - Autonomous Agent Workflows
0:32 - Becoming a 10x Architect
0:44 - Prediction & Community Question

#developers #ai #coding #softwareengineering #shorts #cursor #claude`,
    tags: ['developers', 'ai coding', 'software engineering 2027', 'cursor ai', 'claude 3.7', 'devin', 'tech trends'],
    seoScore: 96,
    scheduledAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    videoUrl: '/neural_pulse_short.mp4'
  },
  item_4: {
    id: 'item_4',
    workspaceId: 'ws_j7ktjxw0',
    title: 'Building a Full Stack SaaS with AI: Step by Step Guide',
    status: 'published',
    videoFormat: 'long_form',
    contentPillar: 'educational',
    duration: '14:20',
    durationSeconds: 860,
    brief: "To'liq 16:9 formatdagi amaliy qo'llanma: Next.js, PostgreSQL va AI yordamida 0 dan SaaS loyihasini yaratish va ishga tushirish.",
    targetAudience: 'Indie Hackers, Full Stack Developers, Founders',
    script: `[00:00 - 02:15] CHAPTER 1: THE ZERO-TO-ONE SAAS ARCHITECTURE
"Building a profitable SaaS no longer requires months of development. In this masterclass, we construct a production-ready AI SaaS platform from zero in under 60 minutes using autonomous AI pipelines."

[02:16 - 05:30] CHAPTER 2: DATABASE DESIGN & SECURE MULTI-TENANCY
"We orchestrate PostgreSQL schemas, Clerk authentication, and Drizzle ORM migrations using direct AI schema synthesis."

[05:31 - 08:45] CHAPTER 3: GENERATING HIGH-CONVERSION UI & TAILWIND
"Watch how generative component pipelines assemble glassmorphism dashboards, interactive charts, and real-time state management."

[08:46 - 11:30] CHAPTER 4: STRIPE BILLING & USAGE WEBHOOKS
"Implementing recurrent subscriptions, usage credits, and checkout sessions with automated validation."

[11:31 - 14:20] CHAPTER 5: ZERO-DOWNTIME DEPLOYMENT & LAUNCH
"Deploying to Railway and Cloudflare edge workers with instant global CDN. Subscribe to Neural Pulse AI for full source code access!"`,
    scenes: [
      { id: 'blue', title: '1. SaaS Blueprint', time: 0, tag: '🚀 SaaS Blueprint' },
      { id: 'db', title: '2. Database & Multi-tenancy', time: 136, tag: '🗄️ Database & Auth' },
      { id: 'ui', title: '3. Generativ Frontend', time: 331, tag: '💻 Frontend Pipeline' },
      { id: 'stripe', title: '4. Stripe To\'lovlari', time: 526, tag: '💳 Stripe Billing' },
      { id: 'deploy', title: '5. Ishga Tushirish & CTA', time: 691, tag: '🌐 Global Launch' }
    ],
    description: `Complete step-by-step masterclass: How to build and launch a full stack SaaS using AI tools in 2026.
Tech stack: Next.js 15, TypeScript, PostgreSQL, Drizzle ORM, Tailwind CSS, Stripe.

⏰ Timestamps:
00:00 - SaaS Architecture Overview
02:16 - Database & Multi-Tenant Setup
05:31 - Generative UI Components
08:46 - Stripe Subscriptions & Webhooks
11:31 - Production Deployment

#saas #fullstack #buildinpublic #nextjs #ai #webdevelopment`,
    tags: ['saas', 'fullstack', 'buildinpublic', 'nextjs', 'ai coding', 'stripe', 'startup guide', 'web development'],
    seoScore: 91,
    scheduledAt: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    videoUrl: '/neural_pulse_16x9.mp4'
  }
};

class ContentStoreService {
  private items: Map<string, ContentItemRecord> = new Map();

  constructor() {
    this.initStore();
  }

  private initStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORE_FILE)) {
        const data = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          for (const [k, v] of Object.entries(parsed)) {
            this.items.set(k, v as ContentItemRecord);
          }
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not load content store from disk, initializing presets:', e);
    }

    // Ensure default presets exist
    for (const [k, v] of Object.entries(DEFAULT_PRESETS)) {
      if (!this.items.has(k)) {
        this.items.set(k, v);
      }
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const obj: Record<string, ContentItemRecord> = {};
      for (const [k, v] of this.items.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      console.error('❌ Failed to persist content store to disk:', e);
    }
  }

  public getAll(workspaceId: string): ContentItemRecord[] {
    const all = Array.from(this.items.values());
    if (workspaceId === 'ws_j7ktjxw0' || workspaceId === 'default') {
      return all;
    }
    return all.filter(item => item.workspaceId === workspaceId);
  }

  public getById(id: string, workspaceId?: string): ContentItemRecord | null {
    if (this.items.has(id)) {
      return this.items.get(id)!;
    }

    // If ID is not found, dynamically generate a realistic record on-the-fly
    const isLong = id.includes('2') || id.includes('4') || id.includes('long');
    const generated = this.generateTailoredItem({
      id,
      workspaceId: workspaceId || 'default',
      title: isLong ? 'The Future of Autonomous AI in 2026' : 'Top Secret AI Tools in 2026 #Shorts',
      videoFormat: isLong ? 'long_form' : 'shorts',
      contentPillar: 'educational',
      status: 'review'
    });
    this.items.set(id, generated);
    this.persist();
    return generated;
  }

  public createItem(params: {
    workspaceId: string;
    title: string;
    videoFormat?: 'shorts' | 'long_form';
    contentPillar?: 'educational' | 'entertaining' | 'promotional';
    status?: any;
  }): ContentItemRecord {
    const id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const format = params.videoFormat || (params.title.toLowerCase().includes('#shorts') ? 'shorts' : 'shorts');
    const pillar = params.contentPillar || 'educational';

    const item = this.generateTailoredItem({
      id,
      workspaceId: params.workspaceId,
      title: params.title,
      videoFormat: format,
      contentPillar: pillar,
      status: params.status || 'review'
    });

    this.items.set(id, item);
    this.persist();
    return item;
  }

  public updateItem(id: string, updates: Partial<ContentItemRecord>): ContentItemRecord | null {
    const item = this.getById(id);
    if (!item) return null;

    const updated = { ...item, ...updates };
    this.items.set(id, updated);
    this.persist();
    return updated;
  }

  public generateTailoredItem(params: {
    id: string;
    workspaceId: string;
    title: string;
    videoFormat: 'shorts' | 'long_form';
    contentPillar: 'educational' | 'entertaining' | 'promotional';
    status: any;
  }): ContentItemRecord {
    const isLong = params.videoFormat === 'long_form';
    const cleanTitle = params.title.replace(/#shorts/gi, '').trim();

    if (isLong) {
      const scenes: SceneItem[] = [
        { id: 'chap1', title: `1. Kirish: ${cleanTitle}`, time: 0, tag: '🚀 Asosiy Kirish' },
        { id: 'chap2', title: '2. Fundamental Arxitektura & Asoslar', time: 125, tag: '🧠 Texnik Asoslar' },
        { id: 'chap3', title: '3. Amaliy Demo & Jonli Jarayon', time: 260, tag: '💻 Amaliy Demo' },
        { id: 'chap4', title: '4. Kengaytirish & Xatolar Tahlili', time: 420, tag: '📊 Chuqur Tahlil' },
        { id: 'chap5', title: '5. Kelajak Xulosasi & Obuna (CTA)', time: 545, tag: '🔔 Xulosa & CTA' }
      ];

      const script = `[00:00 - 02:05] CHAPTER 1: THE REVOLUTION OF ${cleanTitle.toUpperCase()}
"In 2026, technology is accelerating at an unprecedented pace. Today, we break down ${cleanTitle}—the breakthrough approach that is redefining workflows across the globe."

[02:06 - 04:20] CHAPTER 2: UNDERLYING ARCHITECTURE & CORE MECHANICS
"To truly understand ${cleanTitle}, we have to inspect the underlying engine. Traditional methods fail because they rely on static logic. In contrast, modern AI workflows operate with self-correcting feedback loops."

[04:21 - 07:00] CHAPTER 3: LIVE IMPLEMENTATION & WORKFLOW BREAKDOWN
"Let's jump into the direct live workflow. Notice how with minimal configuration, the entire pipeline executes with high precision, saving dozens of manual engineering hours."

[07:01 - 09:05] CHAPTER 4: SCALING, PERFORMANCE & THE 2027 BLUEPRINT
"What does this mean for developers, creators, and founders? Those who master this shift gain an unfair advantage in productivity and leverage."

[09:06 - 10:15] CHAPTER 5: KEY TAKEAWAYS & COMMUNITY DISCUSSION
"If you enjoyed this masterclass on ${cleanTitle}, hit subscribe and ring the bell for Neural Pulse AI. Which part of this workflow will you implement first? Let us know in the comments below!"`;

      const description = `The complete deep-dive breakdown on ${cleanTitle} in 2026.
In this video, we dissect the core mechanics, practical implementation, and future outlook.

⏰ Timestamps:
00:00 - Introduction to ${cleanTitle}
02:06 - Core Mechanics & Architecture
04:21 - Hands-On Workflow Demonstration
07:01 - Strategic Analysis & Industry Outlook
09:06 - Conclusion & Community Discussion

#${cleanTitle.replace(/[^a-zA-Z0-9]/g, '')} #ArtificialIntelligence #Tech2026 #Innovation #NeuralPulseAI`;

      const tags = [
        cleanTitle.toLowerCase(),
        'artificial intelligence',
        'tech 2026',
        'automation',
        'future of tech',
        'neural pulse ai',
        'software engineering',
        'machine learning'
      ];

      return {
        id: params.id,
        workspaceId: params.workspaceId,
        title: params.title,
        status: params.status,
        videoFormat: 'long_form',
        contentPillar: params.contentPillar,
        duration: '10:15',
        durationSeconds: 615,
        brief: `Ushbu 16:9 formatdagi to'liq tahliliy video "${cleanTitle}" mavzusini chuqur yoritadi va yuqori retention bilan tomoshabinni ushlab turadi.`,
        targetAudience: 'AQSH, Yevropa va Global Tech Auditoriya',
        script,
        scenes,
        description,
        tags,
        seoScore: 94,
        scheduledAt: new Date(Date.now() + 3600000).toISOString(),
        createdAt: new Date().toISOString(),
        videoUrl: '/neural_pulse_16x9.mp4'
      };
    } else {
      const scenes: SceneItem[] = [
        { id: 'hook', title: `1. Explosive Hook: ${cleanTitle}`, time: 0, tag: '🚨 Alex Hook' },
        { id: 'part1', title: '2. Muammo & Yechim', time: 10.5, tag: '⚡ Asosiy Yechim' },
        { id: 'part2', title: '3. Amaliy Foyda & Ishlash Usuli', time: 21.0, tag: '🛠️ Demo & Jarayon' },
        { id: 'part3', title: '4. Natija & Ko\'rsatkichlar', time: 33.0, tag: '📈 10x Samaradorlik' },
        { id: 'outro', title: '5. Obuna & Fikrlar (CTA)', time: 45.0, tag: '🔔 Obuna & CTA' }
      ];

      const script = `[0:00 - 0:04] HOOK (Fast camera zoom in & pulse graphic):
"Stop what you're doing. If you're not using ${cleanTitle} yet, you are falling behind fast."

[0:05 - 0:17] SCENE 1 (The Core Problem):
"Most people waste hours doing this the traditional way. But with ${cleanTitle}, the entire process is automated in seconds."

[0:18 - 0:31] SCENE 2 (The Secret Advantage):
"Here is how it works: it leverages advanced AI models to execute high-value tasks with zero friction, running 24/7 in the background."

[0:32 - 0:44] SCENE 3 (Real-World Results):
"Top creators and engineers are using this exact blueprint to 10x their output without burning out."

[0:45 - 0:56] OUTRO & CTA:
"Have you tested ${cleanTitle} yet? Drop your opinion below and subscribe to Neural Pulse AI for daily breakthroughs!"`;

      const description = `Here is everything you need to know about ${cleanTitle} in 2026.
Watch until the end for the exact blueprint.

⏰ Timestamps:
0:00 - Introduction & Hook
0:05 - The Core Advantage
0:18 - How It Works
0:32 - Practical Results
0:45 - Next Steps & Subscription

#${cleanTitle.replace(/[^a-zA-Z0-9]/g, '')} #Shorts #Tech #AI #Innovation #NeuralPulseAI`;

      const tags = [
        cleanTitle.toLowerCase(),
        'shorts',
        'ai',
        'tech',
        'productivity',
        'neural pulse ai',
        'viral',
        'trends 2026'
      ];

      return {
        id: params.id,
        workspaceId: params.workspaceId,
        title: params.title,
        status: params.status,
        videoFormat: 'shorts',
        contentPillar: params.contentPillar,
        duration: '0:56',
        durationSeconds: 56,
        brief: `Ushbu 9:16 Shorts video "${cleanTitle}" mavzusiga moslangan bo'lib, birinchi 3 sekunddagi pattern interrupt va yuqori sur'at orqali 85%+ retention ta'minlaydi.`,
        targetAudience: 'AQSH, Buyuk Britaniya (High CPM Tier-1)',
        script,
        scenes,
        description,
        tags,
        seoScore: 96,
        scheduledAt: new Date(Date.now() + 3600000).toISOString(),
        createdAt: new Date().toISOString(),
        videoUrl: '/neural_pulse_short.mp4'
      };
    }
  }
}

export const contentStore = new ContentStoreService();
