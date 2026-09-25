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

export interface TitleVariant {
  title: string;
  hookType: 'curiosity' | 'urgency' | 'roi';
  predictedCtr: string;
  tagline: string;
}

export interface ContentItemRecord {
  id: string;
  workspaceId: string;
  title: string;
  titleVariants?: TitleVariant[];
  pinnedComment?: string;
  relatedVideoId?: string;
  loopTransition?: string;
  highCpmKeywords?: string[];
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
  thumbnailUrl?: string;
  voiceModel?: string;
  targetLanguage?: string;
  parentContentId?: string;
  abTestStatus?: 'initial' | 'testing' | 'switched' | 'completed';
  abTestSwitchedAt?: string;
  originalTitle?: string;
  aiQualityReport?: any;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'content_store.json');

// Initial rich, tailored preset items
const DEFAULT_PRESETS: Record<string, ContentItemRecord> = {
  item_1: {
    id: 'item_1',
    workspaceId: 'ws_j7ktjxw0',
    title: 'Top 5 AI Tools That Work While You Sleep in 2026',
    status: 'published',
    videoFormat: 'shorts',
    contentPillar: 'educational',
    duration: '0:56',
    durationSeconds: 55.6,
    brief: "Ushbu video 2026-yilgi eng so'nggi AI avtomatlashtirish vositalarini qisqa va ta'sirchan uslubda yoritadi.",
    targetAudience: 'AQSH, Buyuk Britaniya, Kanada (Tier-1 High CPM)',
    script: `[0:00 - 0:03] HOOK: "Stop trading your time for money. These 5 AI tools run 24/7 so you don't have to."`,
    scenes: [
      { id: 'hook', title: '1. Hook (Kirish)', time: 0, tag: '🚨 Alex Hook' },
      { id: 'tool1', title: '2. AutoFlow 2.0', time: 10.6, tag: '🤖 AutoFlow' },
      { id: 'outro', title: '3. Obuna (CTA)', time: 46.8, tag: '🔔 Obuna CTA' }
    ],
    description: `Here are the top 5 AI tools in 2026.`,
    tags: ['ai tools', 'automation', 'productivity'],
    seoScore: 95,
    scheduledAt: '2026-09-17T08:46:51Z',
    createdAt: '2026-09-17T07:01:00Z',
    publishedAt: '2026-09-17T08:46:51Z',
    youtubeVideoId: 'y2uIY0kprx0',
    youtubeUrl: 'https://youtube.com/shorts/y2uIY0kprx0',
    videoUrl: '/neural_pulse_short.mp4'
  },
  item_coding_agents: {
    id: 'item_coding_agents',
    workspaceId: 'ws_j7ktjxw0',
    title: 'Top 5 Autonomous Coding Agents in 2026 #Shorts',
    status: 'review',
    videoFormat: 'shorts',
    contentPillar: 'educational',
    duration: '0:56',
    durationSeconds: 56,
    brief: "2026-yilning eng tezkor 5 ta avtonom AI dasturlash agentlari (Cursor, Devin, Claude 3.7, Aider, Cline) tahlili.",
    targetAudience: 'Global Software Developers, Tech Leaders',
    script: `[0:00 - 0:04] HOOK (Explosive camera zoom in):
"Stop writing boilerplate code by hand! These 5 autonomous AI coding agents build full-stack apps in minutes."

[0:05 - 0:17] AGENT 1 (Devin 2.0 & Cursor):
"First: Cursor and Devin 2.0. They don't just autocomplete—they resolve Github issues, test edge cases, and deploy pull requests while you sleep."

[0:18 - 0:31] AGENT 2 & 3 (Claude 3.7 & Cline):
"Second: Claude 3.7 hybrid reasoning. It maps your entire repo architecture. Hit like and save this video right now so you don't lose the setup!"

[0:32 - 0:44] AGENT 4 & 5 (Aider & Sweep):
"Third: Aider for instant terminal workflows. Senior engineers using this stack are outputting 10x more code with zero burnout."

[0:45 - 0:56] OUTRO & CTA:
"Which coding agent are you using today? Comment below, subscribe for daily blueprints, and that is the exact reason why..."`,
    scenes: [
      { id: 'hook', title: '1. Explosive Hook: Coding Agents', time: 0, tag: '🚨 Alex Hook' },
      { id: 'part1', title: '2. Devin & Cursor Swarms', time: 10.5, tag: '🤖 Devin & Cursor' },
      { id: 'part2', title: '3. Claude 3.7 & Save Trigger', time: 21.0, tag: '💾 Like & Save' },
      { id: 'part3', title: '4. Aider & 10x Output', time: 33.0, tag: '⚡ 10x Muhandis' },
      { id: 'outro', title: '5. Obuna & Loop (CTA)', time: 45.0, tag: '🔔 Obuna & Loop' }
    ],
    description: `Top 5 Autonomous Coding Agents in 2026 that build production software while you sleep.\n\n#aicoding #devin #cursor #softwareengineering #shorts #neuralpulseai`,
    tags: ['ai coding', 'autonomous agents', 'cursor ai', 'claude 3.7', 'devin', 'programming', 'shorts'],
    seoScore: 98,
    scheduledAt: new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date().toISOString(),
    videoUrl: '/media/videos/item_coding_agents.mp4'
  },
  item_illegal_websites: {
    id: 'item_illegal_websites',
    workspaceId: 'ws_j7ktjxw0',
    title: '5 AI Websites That Feel Illegal to Know in 2026 #Shorts',
    status: 'review',
    videoFormat: 'shorts',
    contentPillar: 'educational',
    duration: '0:54',
    durationSeconds: 54,
    brief: "Kunlik ishlarni 10x tezlashtiradigan 5 ta sirli va bepul AI veb-saytlar tahlili.",
    targetAudience: 'Creators, Founders, Productivity Seekers',
    script: `[0:00 - 0:04] HOOK:
"These 5 AI websites feel completely illegal to know, but they are 100% free right now."

[0:05 - 0:17] WEBSITE 1 & 2:
"Number 1: Gamma AI for instant investor pitch decks. Number 2: Perplexity Pro for zero-hallucination web research."

[0:18 - 0:31] WEBSITE 3:
"Number 3: Phind for instant technical debugging. Save this video before it gets taken down!"

[0:32 - 0:44] WEBSITE 4 & 5:
"Number 4: Synthesia for avatar synthesis. Number 5: ElevenLabs for voice cloning."

[0:45 - 0:54] OUTRO:
"Which website are you trying first? Drop a comment, subscribe to Neural Pulse AI, and that is why..."`,
    scenes: [
      { id: 'hook', title: '1. Illegal AI Websites Hook', time: 0, tag: '🚨 Alex Hook' },
      { id: 'part1', title: '2. Gamma & Perplexity', time: 10.5, tag: '⚡ Top Saytlar' },
      { id: 'part2', title: '3. Phind & Save Trigger', time: 21.0, tag: '💾 Like Trigger' },
      { id: 'part3', title: '4. Voice & Avatars', time: 33.0, tag: '🎙️ AI Vositalar' },
      { id: 'outro', title: '5. Obuna & Loop', time: 45.0, tag: '🔔 Obuna CTA' }
    ],
    description: `5 AI websites that feel illegal to know in 2026.\n\n#aiwebsites #productivity #freetools #shorts #neuralpulseai`,
    tags: ['ai websites', 'productivity', 'free tools', 'automation', 'shorts'],
    seoScore: 97,
    scheduledAt: new Date(Date.now() + 7200000).toISOString(),
    createdAt: new Date().toISOString(),
    videoUrl: '/media/videos/item_illegal_websites.mp4'
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
    videoUrl: '/media/videos/item_2.mp4',
    thumbnailUrl: '/media/videos/item_2_thumb.jpg'
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
    videoUrl: '/videos/item_3.mp4'
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
  },
  item_prompt_secrets: {
    id: 'item_prompt_secrets',
    workspaceId: 'ws_j7ktjxw0',
    title: '7 Secret AI Prompts That Will Replace 90% of Junior Devs #Shorts',
    status: 'approved',
    videoFormat: 'shorts',
    contentPillar: 'educational',
    duration: '0:56',
    durationSeconds: 56,
    videoUrl: '/media/videos/item_prompt_secrets.mp4',
    thumbnailUrl: '/media/videos/item_prompt_secrets_thumb.jpg',
    brief: "Dasturchilar va AI muhandislari uchun ish unumdorligini 10 barobar oshiruvchi 7 ta maxfiy ChatGPT va Claude promptlari.",
    targetAudience: 'Global Developers, Freelancers, Tech Founders',
    script: `[0:00 - 0:04] HOOK (Fast camera punch-zoom):
"Stop asking ChatGPT to write code like a junior! These 7 master prompts generate production architectures in 10 seconds."

[0:05 - 0:18] PROMPT 1 & 2 (The Senior Architect & Reverse Prompt):
"Prompt 1: 'Act as a Principal Engineer at Google. Critique this TypeScript implementation for edge case memory leaks.' Prompt 2: 'Reverse engineering prompt: Ask me 5 clarifying questions before writing a single line of code.'"

[0:19 - 0:32] PROMPT 3 & 4 (Deterministic Testing & Docker):
"Prompt 3: 'Generate full Vitest test suites with 100% boundary mutation coverage.' Hit like and save this video so you don't lose the exact syntax!"

[0:33 - 0:44] PROMPT 5, 6 & 7 (Regex, Drizzle & Tailwind):
"Prompts 5 to 7: Instant schema migrations, regex decoders, and zero-runtime Tailwind layouts."

[0:45 - 0:56] OUTRO & CTA:
"Which prompt will you use today? Drop a comment, subscribe to Neural Pulse AI for daily coding blueprints, and that is why..."`,
    scenes: [
      { id: 'hook', title: '1. Secret Prompts Hook', time: 0, tag: '🚨 Alex Hook' },
      { id: 'part1', title: '2. Principal Engineer Prompt', time: 11, tag: '⚡ Google Prompt' },
      { id: 'part2', title: '3. Vitest & Save Trigger', time: 22, tag: '💾 Like & Save' },
      { id: 'part3', title: '4. Drizzle & Tailwind', time: 34, tag: '💻 Full-Stack' },
      { id: 'outro', title: '5. Obuna & Loop', time: 46, tag: '🔔 Obuna CTA' }
    ],
    description: `7 secret AI prompts that high-earning developers use to 10x their coding productivity in 2026.\n\n#promptengineering #chatgpt #claude #coding #shorts #neuralpulseai`,
    tags: ['prompt engineering', 'chatgpt', 'claude 3.7', 'ai coding', 'software engineering', 'shorts'],
    seoScore: 98,
    scheduledAt: new Date(Date.now() + 14400000).toISOString(),
    createdAt: new Date().toISOString()
  },
  item_deepseek_vs_gemini: {
    id: 'item_deepseek_vs_gemini',
    workspaceId: 'ws_j7ktjxw0',
    title: 'DeepSeek R1 vs OpenAI o3: Which AI Is ACTUALLY Smarter? #Shorts',
    status: 'review',
    videoFormat: 'shorts',
    contentPillar: 'educational',
    duration: '0:49',
    durationSeconds: 48.98,
    videoUrl: '/media/videos/item_deepseek_vs_gemini.mp4',
    thumbnailUrl: '/media/videos/item_deepseek_vs_gemini_thumb.jpg',
    brief: "DeepSeek R1 va OpenAI o3 o'rtasidagi real kodlash, mantiq va matematik taqqoslash benchmarki.",
    targetAudience: 'Tech Leaders, AI Engineers, Students',
    script: `[0:00 - 0:04] HOOK:
"Can a free open-source model like DeepSeek R1 beat a 200-dollar-a-month OpenAI o3 subscription? We ran 100 benchmark tests."

[0:05 - 0:17] ROUND 1 (Competitive Coding & LeetCode Hard):
"Round 1: Complex algorithmic DP optimization. DeepSeek solved it in 18 seconds using recursive chain-of-thought. OpenAI matched it with 2% fewer tokens."

[0:18 - 0:31] ROUND 2 (Cost & Open Source Privacy):
"Round 2: Economics. Running DeepSeek locally costs virtually zero dollars per million tokens, while cloud proprietary models drain your budget."

[0:32 - 0:43] THE VERDICT:
"OpenAI still edges out in raw edge-case reasoning, but DeepSeek is the indisputable champion of price-to-performance."

[0:44 - 0:54] OUTRO & CTA:
"Which model are you using in production? Comment below, subscribe to Neural Pulse AI, and see you tomorrow!"`,
    scenes: [
      { id: 'hook', title: '1. Shock Benchmark Hook', time: 0, tag: '🚨 DeepSeek vs o3' },
      { id: 'round1', title: '2. LeetCode Coding Test', time: 10, tag: '⚡ Kodlash Testi' },
      { id: 'round2', title: '3. Narx & Maxfiylik', time: 22, tag: '💰 Xarajat Tahlili' },
      { id: 'verdict', title: '4. Aniq Hukm', time: 33, tag: '🏆 G\'olib Model' },
      { id: 'outro', title: '5. Obuna & CTA', time: 45, tag: '🔔 Obuna CTA' }
    ],
    description: `DeepSeek R1 vs OpenAI o3 head-to-head benchmark comparison. Cost, coding reasoning, and local deployment.\n\n#deepseek #openai #benchmarks #ai #shorts #tech`,
    tags: ['deepseek r1', 'openai o3', 'gemini 2.5', 'ai benchmark', 'coding', 'shorts'],
    seoScore: 99,
    scheduledAt: new Date(Date.now() + 28800000).toISOString(),
    createdAt: new Date().toISOString()
  },
  item_ai_automation_agency: {
    id: 'item_ai_automation_agency',
    workspaceId: 'ws_j7ktjxw0',
    title: 'The Complete Step-by-Step Blueprint to Building an AI Agency in 2026',
    status: 'idea',
    videoFormat: 'long_form',
    contentPillar: 'educational',
    duration: '12:45',
    durationSeconds: 765,
    brief: "To'liq 16:9 formatdagi masterclass: 2026-yilda 0 dan AI Avtomatlashtirish Agentligini (AAA) qurish, mijozlar topish va $10,000/oy daromadga chiqish.",
    targetAudience: 'Agency Founders, Freelancers, Entrepreneurs',
    script: `[00:00 - 02:15] CHAPTER 1: THE $10K/MONTH AI AGENCY MODEL
"The traditional digital agency model is completely dead. Today, clients do not pay for manual hours—they pay for autonomous systems that generate revenue on autopilot. Here is how to build a 6-figure AI agency in 2026."

[02:16 - 05:20] CHAPTER 2: HIGH-TICKET SERVICE OFFERINGS
"Three services clients gladly pay $5,000/month for: Autonomous Customer Support Swarms, Automated Cold Inbound Engines, and Internal Knowledge Graph Agents."

[05:21 - 08:30] CHAPTER 3: THE MODERN TECH STACK
"We deploy Voiceflow, Make.com, LangGraph, and Supabase vectors. Fast to deliver, bulletproof reliability, and zero ongoing maintenance overhead."

[08:31 - 10:45] CHAPTER 4: OUTREACH & CLIENT ACQUISITION
"How to close international clients in the US and Europe using interactive video audits and ROI calculators."

[10:46 - 12:45] CHAPTER 5: CONTRACT TEMPLATES & SCALING
"Complete operational blueprints and legal agreement structures. Subscribe to Neural Pulse AI for the full workflow repository!"`,
    scenes: [
      { id: 'c1', title: '1. Agency Modeli 2026', time: 0, tag: '💼 Biznes Model' },
      { id: 'c2', title: '2. Qimmatbaho Takliflar', time: 135, tag: '💰 $5K Retainer' },
      { id: 'c3', title: '3. Zamonaviy Texnologiyalar', time: 320, tag: '⚙️ Texnologik Stack' },
      { id: 'c4', title: '4. Xalqaro Mijozlar Topish', time: 510, tag: '🌐 Mijozlar Oqimi' },
      { id: 'c5', title: '5. Masshtablash & Obuna', time: 645, tag: '🚀 Masshtab & CTA' }
    ],
    description: `Complete step-by-step masterclass: How to launch and scale a 6-figure AI Automation Agency (AAA) in 2026.\n\nTimestamps:\n00:00 - The $10K/Month AI Agency Model\n02:16 - High-Ticket Offers\n05:21 - The Modern Tech Stack\n08:31 - Client Acquisition\n10:46 - Scaling & Blueprint\n\n#aiagency #automation #entrepreneurship #business2026 #saas #neuralpulseai`,
    tags: ['ai automation agency', 'make money online', 'entrepreneur', 'saas 2026', 'freelancing', 'b2b sales'],
    seoScore: 97,
    scheduledAt: new Date(Date.now() + 43200000).toISOString(),
    createdAt: new Date().toISOString()
  },
  item_claude_hybrid: {
    id: 'item_claude_hybrid',
    workspaceId: 'ws_j7ktjxw0',
    title: 'Why Anthropic\'s New Claude 3.7 Sonnet Changes Everything for Programmers #Shorts',
    status: 'idea',
    videoFormat: 'shorts',
    contentPillar: 'entertaining',
    duration: '0:55',
    durationSeconds: 55,
    brief: "Anthropic kompaniyasining gibrid fikrlovchi Claude 3.7 Sonnet modeli dasturchilar hayotini qanday o'zgartirishi haqida.",
    targetAudience: 'Software Engineers, Web Developers',
    script: `[0:00 - 0:04] HOOK:
"Anthropic just dropped Claude 3.7 Sonnet with hybrid reasoning, and it completely destroyed every coding benchmark on Earth."

[0:05 - 0:17] FEATURE 1 (Hybrid Speed vs Deep Reasoning):
"You can now toggle between instant millisecond autocomplete and deep recursive architectural reasoning on the fly."

[0:18 - 0:31] FEATURE 2 (Full Repository Comprehension):
"It reads your entire 50,000-line codebase without hallucinating API imports. Hit like and save this video before starting your next sprint!"

[0:32 - 0:43] FEATURE 3 (Autonomous Refactoring):
"It refactors spaghetti legacy code into idiomatic clean architecture with full TypeScript type safety in one single prompt."

[0:44 - 0:55] OUTRO & CTA:
"Are you switching to Claude 3.7 or sticking with Cursor? Comment below and subscribe to Neural Pulse AI!"`,
    scenes: [
      { id: 'hook', title: '1. Claude 3.7 Shock Hook', time: 0, tag: '🚨 Claude 3.7 Inqilobi' },
      { id: 'hybrid', title: '2. Gibrid Fikrlash', time: 11, tag: '🧠 Hybrid Reasoning' },
      { id: 'repo', title: '3. Katta Kod Bazasini O\'qish', time: 22, tag: '💾 Like & Save' },
      { id: 'refactor', title: '4. Avtomat Refaktoring', time: 33, tag: '⚡ Toza Kod' },
      { id: 'outro', title: '5. Obuna & Fikrlar', time: 45, tag: '🔔 Fikrlar & Obuna' }
    ],
    description: `Why Anthropic Claude 3.7 Sonnet hybrid reasoning is a generational breakthrough for software engineers in 2026.\n\n#claude37 #anthropic #aicoding #programming #shorts #techtrends`,
    tags: ['claude 3.7', 'anthropic', 'ai coding', 'cursor ai', 'programming', 'shorts'],
    seoScore: 98,
    scheduledAt: new Date(Date.now() + 57600000).toISOString(),
    createdAt: new Date().toISOString()
  },
  item_local_llm_beast: {
    id: 'item_local_llm_beast',
    workspaceId: 'ws_j7ktjxw0',
    title: 'How to Run 100% Private Uncensored AI Locally on Your PC in 2026',
    status: 'idea',
    videoFormat: 'long_form',
    contentPillar: 'educational',
    duration: '11:20',
    durationSeconds: 680,
    brief: "O'z kompyuteringizda internetga ulanmasdan, 100% maxfiy va bepul sun'iy intellekt modellarini (Ollama, DeepSeek, Llama 3) ishga tushirish bo'yicha to'liq qo'llanma.",
    targetAudience: 'Privacy Enthusiasts, Data Scientists, Developers',
    script: `[00:00 - 02:00] CHAPTER 1: WHY LOCAL AI IS CRITICAL IN 2026
"Never send your proprietary code, customer data, or personal documents to public cloud AI servers again. Today, we build a local AI powerhouse."

[02:01 - 04:30] CHAPTER 2: HARDWARE & OLLAMA SETUP
"Installing Ollama and configuring GPU VRAM quantization for maximum tokens-per-second performance."

[04:31 - 07:00] CHAPTER 3: DEEPSEEK & LLAMA 3 INTEGRATION
"Running DeepSeek R1 and Llama 3.3 locally with zero subscription fees and zero rate limits."

[07:01 - 09:15] CHAPTER 4: CONNECTING TO VS CODE & APPS
"Plugging local LLMs directly into Continue.dev and OpenWebUI for a private ChatGPT clone."

[09:16 - 11:20] CHAPTER 5: BENCHMARKS & FINAL BLUEPRINT
"Comparing local inference speeds against OpenAI cloud. Subscribe to Neural Pulse AI for the configuration dotfiles!"`,
    scenes: [
      { id: 'c1', title: '1. Maxfiy AI Muhimligi', time: 0, tag: '🔒 100% Maxfiylik' },
      { id: 'c2', title: '2. Ollama & GPU Sozlash', time: 120, tag: '⚡ Ollama & VRAM' },
      { id: 'c3', title: '3. DeepSeek & Llama O\'rnatish', time: 270, tag: '🤖 Mahalliy Modellar' },
      { id: 'c4', title: '4. VS Code & UI Birlashtirish', time: 420, tag: '💻 IDE Integratsiyasi' },
      { id: 'c5', title: '5. Benchmark & Obuna', time: 555, tag: '🔔 Xulosa & Obuna' }
    ],
    description: `Complete guide on running 100% private, uncensored, zero-cost AI models locally on your Windows/Mac PC in 2026.\n\n#localai #ollama #deepseek #privacy #opensource #neuralpulseai`,
    tags: ['local ai', 'ollama', 'deepseek r1', 'llama 3', 'privacy', 'open source', 'masterclass'],
    seoScore: 96,
    scheduledAt: new Date(Date.now() + 72000000).toISOString(),
    createdAt: new Date().toISOString()
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

    // Only populate default presets if the store is completely empty on fresh install
    if (this.items.size === 0) {
      for (const [k, v] of Object.entries(DEFAULT_PRESETS)) {
        this.items.set(k, v);
      }
      this.persist();
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

  public setItem(item: ContentItemRecord): void {
    this.items.set(item.id, item);
    this.persist();
  }

  public updateItem(id: string, updates: Partial<ContentItemRecord>): ContentItemRecord | null {
    const item = this.getById(id);
    if (!item) return null;

    const updated = { ...item, ...updates };
    this.items.set(id, updated);
    this.persist();
    return updated;
  }

  public deleteItem(id: string): boolean {
    const deleted = this.items.delete(id);
    if (deleted) this.persist();
    return deleted;
  }

  public clearDrafts(workspaceId: string): void {
    for (const [id, item] of this.items.entries()) {
      if ((item.workspaceId === workspaceId || workspaceId === 'ws_j7ktjxw0') && item.status !== 'published') {
        this.items.delete(id);
      }
    }
    this.persist();
  }

  public buildTopicAdaptiveBlueprint(rawTitle: string, nicheHint: string = ''): {
    script: string;
    scenes: SceneItem[];
    tags: string[];
    highCpmKeywords: string[];
    brief: string;
  } {
    const cleanTitle = rawTitle.replace(/#shorts/gi, '').trim();
    const t = `${cleanTitle} ${nicheHint}`.toLowerCase();

    // 1. ANIMALS / WILDLIFE / BREEDING / DEFORMED
    if (t.match(/animal|creature|deform|breed|dog|cat|mutat|wild|nature|beast|monster|fish|species/i)) {
      const script = `[00:00 - 00:05] HOOK: "Humans have created some of the most bizarre and deformed animals on Earth. The last one will truly shock you."
[00:05 - 00:18] SCENE 1: "Take the Bubble Eye Goldfish, bred with massive fluid sacks beneath their eyes that impair basic swimming."
[00:18 - 00:30] SCENE 2: "Or the Belgian Blue cattle, genetically forced with double-muscling mutations until their bodies resemble bodybuilders."
[00:30 - 00:43] SCENE 3: "Even beloved French Bulldogs now suffer chronic respiratory collapse purely due to selective skull deformation."
[00:43 - 00:55] OUTRO: "Did human breeding go too far? Share your honest thoughts in the comments below and subscribe!"`;
      const scenes: SceneItem[] = [
        { id: 'sc1', title: '1. Human Breeding Hook', time: 0, tag: '🐾 Shocking Animals' },
        { id: 'sc2', title: '2. Bubble Eye Goldfish', time: 5, tag: '🐟 Extreme Breeding' },
        { id: 'sc3', title: '3. Double-Muscled Cattle', time: 18, tag: '🧬 Genetic Mutations' },
        { id: 'sc4', title: '4. Skull Deformation Reality', time: 30, tag: '🐶 Anatomical Defects' },
        { id: 'sc5', title: '5. Ethical Question & CTA', time: 43, tag: '🔔 Subscribe & Debate' }
      ];
      return {
        script,
        scenes,
        tags: ['animals', 'wildlife', 'shocking facts', 'genetics', 'nature documentary', 'shorts'],
        highCpmKeywords: ['Wildlife Documentaries ($18.50 CPM)', 'Animal Science ($16.20 CPM)', 'Educational Nature ($19.10 CPM)'],
        brief: `Insonlar tomonidan sun'iy chatishtirish va seleksiya oqibatida yaratilgan eng g'alati va o'zgargan hayvonlar haqida viral Shorts.`
      };
    }

    // 2. SPACE / UNIVERSE / RAREST / COSMOS
    if (t.match(/universe|space|planet|star|galaxy|rare|rarest|cosmos|moon|astronomy|void/i)) {
      const script = `[00:00 - 00:05] HOOK: "What is the single rarest thing in our entire universe? It is NOT gold or diamonds. Watch this."
[00:05 - 00:18] SCENE 1: "At number one is Antimatter. Creating just one single gram would cost over 62 trillion dollars."
[00:18 - 00:30] SCENE 2: "Deep in the cosmos, 55 Cancri e is an entire exoplanet made of pure crystal diamond twice the size of Earth."
[00:30 - 00:43] SCENE 3: "On Earth, Painite was once so scarce that only two crystals were ever known to exist."
[00:43 - 00:55] OUTRO: "Which of these cosmic rarities shocked you the most? Drop a comment and subscribe for more mind-blowing universe facts!"`;
      const scenes: SceneItem[] = [
        { id: 'sc1', title: '1. Shocking Universe Hook', time: 0, tag: '🌌 Space Discovery' },
        { id: 'sc2', title: '2. $62 Trillion Antimatter', time: 5, tag: '💎 Rarest Matter' },
        { id: 'sc3', title: '3. Pure Diamond Planet', time: 18, tag: '🪐 Diamond Exoplanet' },
        { id: 'sc4', title: '4. Rare Earth Painite', time: 30, tag: '✨ Painite Crystal' },
        { id: 'sc5', title: '5. Community Question & CTA', time: 43, tag: '🔔 Subscribe & Comment' }
      ];
      return {
        script,
        scenes,
        tags: ['universe', 'space facts', 'astronomy', 'rarest things', 'science documentary', 'shorts'],
        highCpmKeywords: ['Space Science ($22.40 CPM)', 'Astrophysics ($24.80 CPM)', 'Science Facts ($20.10 CPM)'],
        brief: `Koinotdagi eng noyob moddalar, qimmatbaho antimateriya va olmos sayyoralar haqida o'ta qiziqarli ilmiy Shorts.`
      };
    }

    // 3. WAR / HISTORY / MILITARY / ENDED
    if (t.match(/war|ended|history|soldier|battle|message|army|ancient|empire|conquer|treaty/i)) {
      const script = `[00:00 - 00:05] HOOK: "Imagine fighting a brutal war for 30 years after it officially ended because nobody told you. Here is the true story."
[00:05 - 00:18] SCENE 1: "In 1945 World War 2 ended, but Japanese intelligence officer Hiroo Onoda remained stationed on Lubang Island."
[00:18 - 00:30] SCENE 2: "He dismissed surrender leaflets as allied psychological warfare, continuing covert guerrilla operations alone."
[00:30 - 00:43] SCENE 3: "For 29 agonizing years he survived on coconuts, evading search patrols until his former commander personally relieved him in 1974."
[00:43 - 00:55] OUTRO: "Could you survive 30 years isolated in a jungle? Tell us below and subscribe for legendary history stories!"`;
      const scenes: SceneItem[] = [
        { id: 'sc1', title: '1. The 30-Year War Hook', time: 0, tag: '⚔️ Forgotten Soldier' },
        { id: 'sc2', title: '2. The Message Never Received', time: 5, tag: '📜 1945 WW2 End' },
        { id: 'sc3', title: '3. Jungle Guerrilla Survival', time: 18, tag: '🌴 Lubang Island' },
        { id: 'sc4', title: '4. The 1974 Final Surrender', time: 30, tag: '🎖️ Relieved of Duty' },
        { id: 'sc5', title: '5. History Question & CTA', time: 43, tag: '🔔 Subscribe & History' }
      ];
      return {
        script,
        scenes,
        tags: ['history', 'war stories', 'world war 2', 'hiroo onoda', 'historical facts', 'shorts'],
        highCpmKeywords: ['Military History ($21.20 CPM)', 'Historical Mysteries ($19.80 CPM)', 'True Stories ($23.50 CPM)'],
        brief: `Urush tugaganini bilmay 30 yil davomida tropik o'rmonda yashirinib jang qilgan yapon askari haqidagi hayratlanarli tarixiy voqea.`
      };
    }

    // 4. PUNISHMENT / CRIME / DARK / LAW
    if (t.match(/punish|prison|jail|torture|crime|illegal|execution|sentence|dark/i)) {
      const script = `[00:00 - 00:05] HOOK: "You won't believe that these ancient, terrifying punishments are STILL completely legal in the modern world."
[00:05 - 00:18] SCENE 1: "Public caning and judicial corporal punishment remain actively enforced in multiple countries for minor infractions."
[00:18 - 00:30] SCENE 2: "Extreme sensory deprivation cells, known as White Torture, plunge inmates into total silence and white light, shattering sanity."
[00:30 - 00:43] SCENE 3: "In remote sub-zero penal colonies, prisoners endure grueling physical labor under temperatures reaching minus 40 degrees."
[00:43 - 00:55] OUTRO: "Should these medieval practices be banned worldwide? Drop your opinion below and subscribe for more eye-opening truths!"`;
      const scenes: SceneItem[] = [
        { id: 'sc1', title: '1. Ancient Punishments Hook', time: 0, tag: '⚖️ Dark Justice' },
        { id: 'sc2', title: '2. Judicial Caning Sentence', time: 5, tag: '🚨 Modern Penalties' },
        { id: 'sc3', title: '3. Sensory Deprivation White Room', time: 18, tag: '👁️ White Torture' },
        { id: 'sc4', title: '4. Sub-Zero Penal Colonies', time: 30, tag: '❄️ Harsh Realities' },
        { id: 'sc5', title: '5. Debate Question & CTA', time: 43, tag: '🔔 Subscribe & Debate' }
      ];
      return {
        script,
        scenes,
        tags: ['punishments', 'dark history', 'prisons', 'law and crime', 'shocking facts', 'shorts'],
        highCpmKeywords: ['True Crime & Law ($25.40 CPM)', 'Documentary ($21.80 CPM)', 'Global Facts ($18.90 CPM)'],
        brief: `Hozirgi zamonda hamon qonuniy qo'llanib kelinayotgan eng daxshatli va qadimiy jazo usullari haqidagi tahliliy video.`
      };
    }

    // 5. MONEY / WEALTH / FINANCE / BUSINESS
    if (t.match(/money|rich|dollar|billion|wealth|business|profit|million|crypto|income/i)) {
      const script = `[00:00 - 00:05] HOOK: "Stop chasing traditional income in 2026. Here is the undeniable truth about how modern wealth is built."
[00:05 - 00:18] SCENE 1: "The top 1% never trade linear hours for dollars. They construct scalable digital assets that compound around the clock."
[00:18 - 00:30] SCENE 2: "Step 1: Identify high-leverage workflows. Step 2: Automate distribution. The profit margins speak for themselves."
[00:30 - 00:43] SCENE 3: "Those who adapt this shift gain massive financial sovereignty, while traditional workers get squeezed by inflation."
[00:43 - 00:55] OUTRO: "Are you building leverage this year, or trading hours? Drop your thoughts below and subscribe for wealth blueprints!"`;
      const scenes: SceneItem[] = [
        { id: 'sc1', title: '1. Modern Wealth Shock Hook', time: 0, tag: '💰 Wealth Blueprint' },
        { id: 'sc2', title: '2. The Linear Trap vs Leverage', time: 5, tag: '📈 Scalable Assets' },
        { id: 'sc3', title: '3. The 2-Step Multiplier', time: 18, tag: '⚙️ High Leverage' },
        { id: 'sc4', title: '4. Financial Sovereignty', time: 30, tag: '🏆 1% Strategy' },
        { id: 'sc5', title: '5. Community Question & CTA', time: 43, tag: '🔔 Subscribe & Wealth' }
      ];
      return {
        script,
        scenes,
        tags: ['wealth', 'finance 2026', 'make money online', 'investing', 'passive income', 'shorts'],
        highCpmKeywords: ['Personal Finance ($34.20 CPM)', 'Wealth Building ($31.80 CPM)', 'Business Strategy ($28.50 CPM)'],
        brief: `Zamonaviy boylik orttirish qoidalari, passiv daromad va moliyaviy erkinlikka erishish sirlari.`
      };
    }

    // 6. DEFAULT / GENERAL MINDBLOWING STORY OR DISCOVERY
    const script = `[00:00 - 00:05] HOOK: "Stop scrolling! Here is the shocking truth behind ${cleanTitle} that nobody tells you."
[00:05 - 00:18] SCENE 1: "The origin of this mystery started with an unexpected breakthrough that stunned researchers worldwide."
[00:18 - 00:30] SCENE 2: "When the evidence was first analyzed, the results contradicted everything experts believed for decades."
[00:30 - 00:43] SCENE 3: "Today, this exact phenomenon continues to captivate millions of curious minds across the globe."
[00:43 - 00:55] OUTRO: "Did you already know about this, or is this your first time hearing it? Tell us below and subscribe!"`;
    const scenes: SceneItem[] = [
      { id: 'sc1', title: `1. Hook: ${cleanTitle.slice(0, 24)}`, time: 0, tag: '🔥 Shocking Hook' },
      { id: 'sc2', title: '2. The Unexpected Discovery', time: 5, tag: '⚡ Breakthrough' },
      { id: 'sc3', title: '3. The Unbelievable Evidence', time: 18, tag: '📊 Direct Proof' },
      { id: 'sc4', title: '4. Global Impact & Fascination', time: 30, tag: '🌍 Global Impact' },
      { id: 'sc5', title: '5. Question & Subscribe CTA', time: 43, tag: '🔔 Subscribe CTA' }
    ];
    return {
      script,
      scenes,
      tags: ['viral facts', 'unbelievable truths', 'curiosity', 'mindblowing', 'documentary', 'shorts'],
      highCpmKeywords: ['Educational Entertainment ($21.40 CPM)', 'Viral Facts ($18.60 CPM)', 'Documentaries ($22.10 CPM)'],
      brief: `"${cleanTitle}" mavzusidagi eng qiziqarli va hayratlanarli faktlarni ochib beruvchi viral video.`
    };
  }

  public refreshIdeasForChannel(workspaceId: string, channelAnalysis: any, clearOldDrafts: boolean = true): ContentItemRecord[] {
    if (clearOldDrafts) {
      this.clearDrafts(workspaceId);
    }

    const channelName = channelAnalysis.channelTitle || 'Viral Channel';
    const channelNiche = channelAnalysis.niche || '';
    
    // 1. Extract genuine video topics from recent videos or top performing topics
    const genuineTopics: string[] = [
      ...(Array.isArray(channelAnalysis.recentVideoTitles) ? channelAnalysis.recentVideoTitles : []),
      ...(Array.isArray(channelAnalysis.topPerformingTopics) ? channelAnalysis.topPerformingTopics : [])
    ].filter((t: string) => t && t.trim().length > 5 && !t.toLowerCase().includes('concept') && !t.toLowerCase().includes('placeholder'));

    // Deduplicate topics
    const uniqueTopics = Array.from(new Set(genuineTopics));

    // 2. Extract valid blueprints
    const validBlueprints = (channelAnalysis.clonedVideoBlueprints || []).filter((bp: any) => 
      bp.title && !bp.title.toLowerCase().includes('concept') && !bp.title.toLowerCase().includes('placeholder')
    );

    let itemsToCreate: any[] = [];
    if (uniqueTopics.length > 0) {
      // Pick top 4 genuine video topics directly from the target channel!
      itemsToCreate = uniqueTopics.slice(0, 4).map((t: string) => {
        const cleanT = t.replace(/#shorts/gi, '').trim();
        return {
          title: `${cleanT} #Shorts`,
          hook: `Stop scrolling! You won't believe what happens in "${cleanT}". Watch every single second!`,
          viralScore: 99,
          highCpmTag: channelNiche || "Viral",
          targetDuration: 55
        };
      });
    } else if (validBlueprints.length > 0) {
      itemsToCreate = validBlueprints.slice(0, 3);
    } else {
      itemsToCreate = [
        {
          title: `${channelName}: The Shocking Truth Revealed #Shorts`,
          hook: `Stop scrolling! Here is the blueprint behind ${channelName}'s fastest-growing videos.`,
          viralScore: 99,
          highCpmTag: channelNiche || 'Viral',
          targetDuration: 55
        },
        {
          title: `How ${channelName} Dominates YouTube in 2026 #Shorts`,
          hook: `Want 10x more reach? This exact technique from ${channelName} guarantees massive retention.`,
          viralScore: 98,
          highCpmTag: channelNiche || 'Viral',
          targetDuration: 55
        },
        {
          title: `${channelName} Masterclass: Instant Viral Formula #Shorts`,
          hook: `Never create content the old way again. Here is the fast monetization framework.`,
          viralScore: 97,
          highCpmTag: channelNiche || 'Viral',
          targetDuration: 55
        }
      ];
    }

    const created: ContentItemRecord[] = [];
    for (const bp of itemsToCreate) {
      const title = bp.title.includes('#Shorts') ? bp.title : `${bp.title} #Shorts`;
      const adaptive = this.buildTopicAdaptiveBlueprint(title, channelNiche);

      const item = this.createItem({
        workspaceId,
        title,
        videoFormat: 'shorts',
        contentPillar: 'educational',
        status: 'idea'
      });

      this.updateItem(item.id, {
        script: adaptive.script,
        scenes: adaptive.scenes,
        brief: adaptive.brief,
        highCpmKeywords: adaptive.highCpmKeywords,
        tags: adaptive.tags,
        videoUrl: ''
      });
      created.push(this.getById(item.id, workspaceId) || item);
    }

    this.persist();
    return created;
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

      const titleVariants: TitleVariant[] = [
        {
          title: `${cleanTitle}: The Complete 2026 Masterclass`,
          hookType: 'roi',
          predictedCtr: '9.2%',
          tagline: 'High-Authority Comprehensive Guide'
        },
        {
          title: `The Shocking Truth About ${cleanTitle} in 2026`,
          hookType: 'curiosity',
          predictedCtr: '11.8%',
          tagline: 'Maximum Curiosity & Click Appeal'
        },
        {
          title: `Why Most Engineers Fail at ${cleanTitle} (Avoid This)`,
          hookType: 'urgency',
          predictedCtr: '10.1%',
          tagline: 'Urgency & Mistake Prevention'
        }
      ];

      const pinnedComment = `Which phase of ${cleanTitle} are you implementing first? Drop your questions below and we'll reply to every comment! 👇 (P.S. Code blueprint and resources linked in description)`;
      const loopTransition = `And that brings us right back to why mastering this architecture is essential in 2026.`;
      const highCpmKeywords = [
        'Artificial Intelligence ($28.40 CPM)',
        'Cloud Architecture ($32.10 CPM)',
        'Software Engineering ($24.80 CPM)',
        'DevOps Automation ($29.50 CPM)'
      ];

      return {
        id: params.id,
        workspaceId: params.workspaceId,
        title: params.title,
        titleVariants,
        pinnedComment,
        loopTransition,
        highCpmKeywords,
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
        videoUrl: ''
      };
    } else {
      const adaptive = this.buildTopicAdaptiveBlueprint(cleanTitle);
      const scenes = adaptive.scenes;
      const script = adaptive.script;
      const description = `${cleanTitle} haqida to'liq va hayratlanarli ma'lumotlar.\n\n#Shorts #${cleanTitle.replace(/[^a-zA-Z0-9]/g, '')} #viral #facts`;
      const tags = adaptive.tags;

      const titleVariants: TitleVariant[] = [
        {
          title: `Stop Doing This Manually! Use ${cleanTitle} #Shorts`,
          hookType: 'urgency',
          predictedCtr: '12.4%',
          tagline: 'Urgency / Stop Scrolling Hook'
        },
        {
          title: `The Secret AI Breakthrough: ${cleanTitle} #Shorts`,
          hookType: 'curiosity',
          predictedCtr: '11.1%',
          tagline: 'Pure Curiosity & High VVSA'
        },
        {
          title: `How ${cleanTitle} 10x'd Our Workflow in 24 Hours #Shorts`,
          hookType: 'roi',
          predictedCtr: '9.8%',
          tagline: 'Proof & Practical 10x Results'
        }
      ];

      const pinnedComment = `Are you already testing ${cleanTitle}, or still doing it manually? Comment below and subscribe to Neural Pulse AI for daily breakthroughs! 👇 (Full 16:9 breakdown linked in related video)`;
      const loopTransition = `...and that is the exact reason why... [Flows directly back into 0:00 Hook]`;
      const highCpmKeywords = [
        'AI Automation ($26.80 CPM)',
        'Productivity Tech ($22.40 CPM)',
        'Future of Work ($25.10 CPM)'
      ];

      return {
        id: params.id,
        workspaceId: params.workspaceId,
        title: params.title,
        titleVariants,
        pinnedComment,
        loopTransition,
        highCpmKeywords,
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
        videoUrl: ''
      };
    }
  }
}

export const contentStore = new ContentStoreService();
