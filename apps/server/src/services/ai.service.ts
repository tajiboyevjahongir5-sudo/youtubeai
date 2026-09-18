import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../env';
import { analyticsService } from './analytics.service';

import { getWorkspaceSettings } from './workspace-settings.service';
import { aiCouncilService } from './ai-council.service';

export interface IAiService {
  generateIdea(context: any): Promise<any>;
  generateDailyTopic(workspaceId: string, uploadedTitles?: Set<string>): Promise<string>;
  generateScript(context: any): Promise<any>;
  generateMetadata(context: any): Promise<any>;
  generateStoryboard(context: any): Promise<any>;
  qualityReview(context: any): Promise<any>;
  localizeContent(item: any, targetLanguage: 'es' | 'uz'): Promise<any>;
}

export class GeminiAiService implements IAiService {
  private genAI: GoogleGenerativeAI;
  private primaryModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  private fallbackModel = 'gemini-2.0-flash';

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private async generateWithFallback(prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.primaryModel });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      console.warn(`⚠️ [${this.primaryModel}] so'rovida xatolik, zaxira modelga [${this.fallbackModel}] o'tilmoqda...`, err?.message || err);
      const fallback = this.genAI.getGenerativeModel({ model: this.fallbackModel });
      const result = await fallback.generateContent(prompt);
      return result.response.text();
    }
  }

  async generateIdea(context: any) {
    const wsId = typeof context === 'string' ? context : (context?.workspaceId || 'default');
    const settings = getWorkspaceSettings(wsId);

    const niche = (typeof context === 'object' && context.niche) ? context.niche : settings.niche;
    const subNiches = (typeof context === 'object' && context.subNiches) ? context.subNiches : settings.subNiches;
    const audience = (typeof context === 'object' && context.audience) ? context.audience : settings.audience;
    const tone = (typeof context === 'object' && context.tone) ? context.tone : settings.tone;

    const prompt = `You are a YouTube content strategist. Generate a video idea based on:
Niche: ${niche}
Sub-niches: ${subNiches}
Audience: ${audience}
Tone: ${tone}
Strategy Memory: ${typeof context === 'object' ? (context.strategyMemory || '') : ''}

Disclaimer: We do not guarantee recommendations.
Generate content in ENGLISH. Return JSON format with fields: title, contentPillar, viewerProblem, targetAudience, hook, suggestedStructure, expectedLengthMinutes, videoFormat, riskFlags (array), originalityNote, relevanceReason, confidenceLevel, evidence, status.`;
    const text = await this.generateWithFallback(prompt);
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    return JSON.parse(text.slice(jsonStart, jsonEnd));
  }

  async generateDailyTopic(workspaceId: string, uploadedTitles?: Set<string>): Promise<string> {
    const settings = getWorkspaceSettings(workspaceId);
    const niche = settings.niche || 'AI Tools & Tech 2026';
    const subNiches = settings.subNiches || 'Coding, SaaS, Productivity, Python';
    const audience = settings.audience || 'US, UK, Canada tech professionals';
    const tone = settings.tone || 'professional';

    // 1. Delegate to Agent 1: Trend & Deep Reasoning Strategist
    try {
      const trend = await aiCouncilService.runTrendStrategist({
        workspaceId,
        niche,
        subNiches,
        audience,
        pastTitles: uploadedTitles ? Array.from(uploadedTitles) : []
      });
      if (trend && trend.selectedTitle && trend.selectedTitle.length > 5) {
        console.log(`💡 [AI Council: Agent 1] Yangi mavzu [Nisha: ${niche}] asosan tanlandi: "${trend.selectedTitle}"`);
        return trend.selectedTitle;
      }
    } catch (councilErr) {
      console.warn('⚠️ [AI Council] Agent 1 fallback to direct Gemini:', councilErr);
    }

    const pastList = uploadedTitles ? Array.from(uploadedTitles).slice(0, 20).join('\n- ') : '';

    const prompt = `You are an elite YouTube Shorts viral strategist.
The user has configured their YouTube channel with the following EXACT settings:
- Channel Niche: ${niche}
- Focus Sub-Niches: ${subNiches}
- Target Audience: ${audience}
- Voice / Delivery Tone: ${tone}

PAST VIDEOS ALREADY PUBLISHED (DO NOT REPEAT OR DUPLICATE THESE):
${pastList ? `- ${pastList}` : '- None yet'}

Your task: Propose ONE breakthrough, viral 2026 YouTube Shorts video title tailored 100% to this exact niche, sub-niches, and audience.
Must have a powerful curiosity gap, high viewer retention, and immediate click appeal.
Return ONLY the raw title string, without quotes, formatting, or markdown.`;

    try {
      const text = await this.generateWithFallback(prompt);
      const clean = text.trim().replace(/^["']|["']$/g, '').split('\n')[0].trim();
      if (clean && clean.length > 5) {
        console.log(`💡 [AI Service] Yangi mavzu foydalanuvchi sozlamalariga [Nisha: ${niche}] asosan yaratildi: "${clean}"`);
        return clean;
      }
    } catch (e) {
      console.warn('⚠️ Gemini daily topic generation error:', e);
    }
    return `${niche}: 2026 Breakthrough Blueprint`;
  }

  async generateScript(context: any) {
    const isLong = context.videoFormat === 'long_form' || context.format === 'long_form';
    const cleanTitle = (context.title || 'AI Breakthrough in 2026').replace(/#shorts/gi, '').trim();
    const workspaceId = context.workspaceId || 'ws_j7ktjxw0';
    const settings = getWorkspaceSettings(workspaceId);

    const channelNiche = context.niche || settings.niche || 'AI Tools & Tech 2026';
    const subNiches = context.subNiches || settings.subNiches || 'Coding, SaaS, Productivity, Python';
    const targetAudience = context.audience || settings.audience || 'US, UK, Canada tech professionals';
    const rawTone = context.tone || settings.tone || 'professional';
    const rawLang = context.englishVariant || settings.englishVariant || 'us';

    // 1. Delegate to 5-Agent Council Pipeline
    try {
      const councilRes = await aiCouncilService.runCouncilPipeline({
        workspaceId,
        title: cleanTitle,
        niche: channelNiche,
        subNiches,
        audience: targetAudience,
        tone: rawTone,
        isLong
      });
      if (councilRes && councilRes.script && Array.isArray(councilRes.scenes) && councilRes.scenes.length >= 3) {
        return {
          script: councilRes.script,
          scenes: councilRes.scenes,
          titleVariants: councilRes.titleVariants,
          description: councilRes.description,
          tags: councilRes.tags,
          pinnedComment: councilRes.pinnedComment,
          loopTransition: councilRes.loopTransition,
          highCpmKeywords: councilRes.highCpmKeywords
        };
      }
    } catch (councilErr) {
      console.warn('⚠️ [AI Council Pipeline] Fallback to direct Gemini generation:', councilErr);
    }

    const toneMap: Record<string, string> = {
      professional: "Authoritative, crisp, analytical, high-credibility executive tone",
      friendly: "Warm, highly relatable, conversational, encouraging and accessible tone",
      dynamic: "High-octane, hyper-energetic, punchy, fast-paced retention driver",
      provocative: "Challenging conventional wisdom, bold pattern interrupt, urgent wake-up call"
    };
    const toneDescription = toneMap[rawTone] || toneMap.professional;

    const langMap: Record<string, string> = {
      us: "American English (US idioms, natural modern high-volume American phrasing)",
      uk: "British English (UK phrasing, structured elegance and vocabulary)",
      international: "Clear, globally accessible English with crisp, universally understood terminology"
    };
    const langDescription = langMap[rawLang] || langMap.us;

    const learnedDirectives = analyticsService.getLearnedDirectives(workspaceId);
    const learnedSection = learnedDirectives.length > 0
      ? `\n=== CRITICAL CHANNEL ALGORITHMIC DIRECTIVES (FROM PREVIOUS UPLOADED VIDEOS) ===
Past uploaded videos on this channel were analyzed for drop-offs, low like-rates, and low subscriber conversion.
You MUST strictly incorporate these corrective directives in this script:
${learnedDirectives.map((d, i) => `${i + 1}. ${d}`).join('\n')}
Make sure to include a clear mid-video Bookmark/Like Trigger ("Save this so you don't lose it") and a compelling Outro Subscribe Callout with an active community question in the pinned comment!\n`
      : '';

    const prompt = isLong ? `You are the lead executive producer for an elite YouTube documentary channel.
USER CHANNEL SETTINGS & STRATEGY:
- Core Niche: ${channelNiche}
- Focus Sub-Niches: ${subNiches}
- Target Audience Persona: ${targetAudience}
- Tone of Voice: ${toneDescription}
- Language Dialect: ${langDescription}

Write a MASTER-GRADE 16:9 Long-Form Documentary Script for: "${cleanTitle}".
Language: Strictly ENGLISH (${langDescription}).

${learnedSection}

Requirements:
1. CHAPTER TIMESTAMPS: Generate exactly 5 structured chapters with minute markers:
   - Chapter 1 (00:00 - 02:00): The Paradigm Shift & Core Hook
   - Chapter 2 (02:01 - 04:30): Technical Architecture & Deep Dive Mechanics
   - Chapter 3 (04:31 - 07:00): Live Hands-On Demo & Step-by-Step Execution
   - Chapter 4 (07:01 - 09:15): Strategic Scaling, Bottlenecks & 2027 Career Blueprint
   - Chapter 5 (09:16 - 10:15): Final Verdict, Community Question & Subscribe Call to Action
2. TOPIC SPECIFICITY: Include real technical terms, architecture components, CLI commands, and performance benchmarks specific to "${cleanTitle}".
3. ZERO UNICODE EMOJIS in overlay text (use standard ASCII tags like [OK], >>>, [VERIFIED]).
4. Return JSON format with fields:
{
  "script": string (full formatted script with [mm:ss] timestamps),
  "scenes": array of 5 objects: [
    { "id": "chap1", "title": "1. Paradigm Shift", "time": 0, "tag": "INTRO HOOK" },
    { "id": "chap2", "title": "2. Core Architecture", "time": 120, "tag": "TECH DEEP DIVE" },
    { "id": "chap3", "title": "3. Live Hands-On Demo", "time": 270, "tag": "CLI DEMO" },
    { "id": "chap4", "title": "4. 2027 Strategy Blueprint", "time": 420, "tag": "FUTURE SCALE" },
    { "id": "chap5", "title": "5. Final Verdict & CTA", "time": 555, "tag": "SUBSCRIBE" }
  ],
  "description": string (formatted description with timestamps and chapters),
  "tags": array of 15+ strings,
  "titleVariants": array of 3 objects: [
    { "title": "${cleanTitle}: The Complete 2026 Masterclass", "hookType": "roi", "predictedCtr": "9.4%", "tagline": "Authoritative Complete Guide" },
    { "title": "The Shocking Truth About ${cleanTitle} in 2026", "hookType": "curiosity", "predictedCtr": "11.9%", "tagline": "Maximum Curiosity & Click Appeal" },
    { "title": "Why Most People Fail at ${cleanTitle} (Avoid This)", "hookType": "urgency", "predictedCtr": "10.2%", "tagline": "Urgency & Mistake Prevention" }
  ],
  "pinnedComment": string (compelling question to trigger comments),
  "loopTransition": string,
  "highCpmKeywords": array of strings
}` : `You are the viral retention director for an elite YouTube Shorts channel.
USER CHANNEL SETTINGS & STRATEGY:
- Core Niche: ${channelNiche}
- Focus Sub-Niches: ${subNiches}
- Target Audience Persona: ${targetAudience}
- Tone of Voice: ${toneDescription}
- Language Dialect: ${langDescription}

Write a VIRAL, MASTER-GRADE 9:16 YouTube Shorts Script for: "${cleanTitle}".
Language: Strictly ENGLISH (${langDescription}, +14% pacing, crisp enunciation).

${learnedSection}

Requirements (2026 YouTube Shorts Retention Blueprint):
1. 0-3s EXPLOSIVE HOOK: Urgent pattern interrupt with bold curiosity gap tailored to ${targetAudience}.
2. HIGH DENSITY VALUE: 5 micro-scenes timed perfectly for 50-56 seconds total duration.
   - [0:00 - 0:04] HOOK (Fast camera zoom in & pulse graphic)
   - [0:05 - 0:17] SCENE 1 (The Core Problem / Shocking Bottleneck)
   - [0:18 - 0:31] SCENE 2 (The Secret Advantage, Like/Bookmark Trigger & How It Works)
   - [0:32 - 0:44] SCENE 3 (Real-World Results & 10x Performance Metrics)
   - [0:45 - 0:56] OUTRO & SEAMLESS LOOP (Community Question + Animated Subscribe CTA + seamless loop phrase)
3. SEAMLESS LOOP: The last sentence must end with an incomplete phrase that grammatically and logically flows right back into the 0:00 opening sentence!
4. TOPIC & NICHE SPECIFICITY: Deep facts, metrics, and tools relevant to "${cleanTitle}" in ${channelNiche}.
5. ZERO UNICODE EMOJIS in overlay text (use standard ASCII tags like [OK], >>>, [METRIC]).
6. Return JSON format with fields:
{
  "script": string (full script with [0:00 - 0:04] timestamps),
  "scenes": array of 5 objects: [
    { "id": "hook", "title": "1. Explosive Hook", "time": 0, "tag": "ALEX HOOK" },
    { "id": "part1", "title": "2. Core Problem", "time": 10.5, "tag": "KEY PROBLEM" },
    { "id": "part2", "title": "3. Secret Engine", "time": 21.0, "tag": "DEMO ENGINE" },
    { "id": "part3", "title": "4. 10x Results", "time": 33.0, "tag": "10X METRICS" },
    { "id": "outro", "title": "5. Outro & Loop", "time": 45.0, "tag": "SEAMLESS LOOP" }
  ],
  "description": string (formatted YouTube description with timestamps),
  "tags": array of 12+ strings,
  "titleVariants": array of 3 objects: [
    { "title": "Stop Doing This Manually! Use ${cleanTitle} #Shorts", "hookType": "urgency", "predictedCtr": "12.4%", "tagline": "Urgency / Stop Scrolling Hook" },
    { "title": "The Secret Breakthrough: ${cleanTitle} #Shorts", "hookType": "curiosity", "predictedCtr": "11.2%", "tagline": "Pure Curiosity & High VVSA" },
    { "title": "How ${cleanTitle} 10x'd Results in 24 Hours #Shorts", "hookType": "roi", "predictedCtr": "9.9%", "tagline": "Proof & Practical 10x Results" }
  ],
  "pinnedComment": string,
  "loopTransition": string,
}`;

    try {
      const text = await this.generateWithFallback(prompt);
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        return JSON.parse(text.slice(jsonStart, jsonEnd));
      }
    } catch (e) {
      console.warn('⚠️ Gemini script parsing fallback:', e);
    }
    return null;
  }

  async generateMetadata(context: any) {
    const prompt = `Generate metadata for video: ${context.title}. Generate content in ENGLISH.
Include: titleVariations (array of 3), selectedTitle, description, tags (array of 15+), hashtags (array), chapters (array), pinnedComment, metadataQualityScore (0-100). Return JSON.`;
    const text = await this.generateWithFallback(prompt);
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    return JSON.parse(text.slice(jsonStart, jsonEnd));
  }

  async generateStoryboard(context: any) {
    return { scenes: [{ description: 'Intro shot', timestamp: '0:00' }] };
  }

  async qualityReview(context: any) {
    return {
      score: 95,
      originality: 'High',
      policyRisk: 'Low',
      hookStrength: 'Strong',
      feedback: 'Good video, clear hook.'
    };
  }

  async localizeContent(item: any, targetLanguage: 'es' | 'uz'): Promise<any> {
    const langName = targetLanguage === 'es' ? 'Spanish (Español)' : "Uzbek (O'zbek tili)";
    const prompt = `You are an elite viral video translator and localization specialist.
Translate and adapt this YouTube video package into authentic, high-retention ${langName}.
Keep technical terms clear, natural, and engaging.

Original Video:
Title: ${item.title}
Script: ${item.script}
Description: ${item.description || ''}
Pinned Comment: ${item.pinnedComment || ''}
Scenes: ${JSON.stringify(item.scenes || [])}

Rules:
1. Translate Title to an irresistible viral title in ${langName}.
2. Translate Script with punchy phrasing suited for voiceover.
3. Translate overlayText for each scene (short, max 6 words).
4. Translate Description and Pinned Comment.
5. Provide relevant tags in ${langName}.

Return JSON strictly:
{
  "title": "...",
  "script": "...",
  "description": "...",
  "pinnedComment": "...",
  "scenes": [ { "id": "...", "title": "...", "time": 0, "tag": "...", "overlayText": "..." } ],
  "tags": ["..."]
}`;

    try {
      const text = await this.generateWithFallback(prompt);
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      return JSON.parse(text.slice(jsonStart, jsonEnd));
    } catch (e) {
      console.error('Localization AI error:', e);
      return {
        title: targetLanguage === 'uz' ? `${item.title} (O'zbekcha)` : `${item.title} (Español)`,
        script: item.script,
        description: item.description,
        pinnedComment: item.pinnedComment,
        scenes: item.scenes,
        tags: item.tags
      };
    }
  }
}

export class MockAiService implements IAiService {
  async generateIdea(context: any) {
    return {
      title: 'How to Learn TypeScript in 2026',
      contentPillar: 'educational',
      viewerProblem: 'TypeScript is confusing',
      targetAudience: 'Beginner Developers',
      hook: 'Tired of any?',
      suggestedStructure: 'Intro, Basics, Advanced, Outro',
      expectedLengthMinutes: 10,
      videoFormat: 'long_form',
      riskFlags: [],
      originalityNote: 'Unique perspective on new TS features',
      relevanceReason: 'TS is popular',
      confidenceLevel: 'high',
      evidence: 'High search volume',
      status: 'idea'
    };
  }
  async generateDailyTopic(workspaceId: string, uploadedTitles?: Set<string>): Promise<string> {
    const settings = getWorkspaceSettings(workspaceId);
    return `${settings.niche || 'Technology Breakthrough'}: 2026 Strategy Guide`;
  }
  async generateScript(context: any) {
    return { hook: 'Hey', fullScript: 'Welcome to this video.', scenes: [], closingCta: 'Subscribe!', factCheckNotes: [], copyrightRiskNotes: [] };
  }
  async generateMetadata(context: any) {
    return { titleVariations: ['Title 1', 'Title 2', 'Title 3'], selectedTitle: 'Title 1', description: 'Desc', tags: ['typescript'], hashtags: ['#ts'], chapters: [], pinnedComment: 'Hi', metadataQualityScore: 90 };
  }
  async generateStoryboard(context: any) { return { scenes: [] }; }
  async qualityReview(context: any) { return { score: 95, originality: 'High', policyRisk: 'Low', hookStrength: 'Strong', feedback: 'Great' }; }
  async localizeContent(item: any, targetLanguage: 'es' | 'uz'): Promise<any> {
    return {
      title: targetLanguage === 'uz' ? `${item.title} (O'zbekcha)` : `${item.title} (Español)`,
      script: item.script,
      description: item.description,
      pinnedComment: item.pinnedComment,
      scenes: item.scenes,
      tags: item.tags
    };
  }
}

export function createAiService(): IAiService {
  if (env.GEMINI_API_KEY) {
    return new GeminiAiService(env.GEMINI_API_KEY);
  }
  console.warn('⚠️ No GEMINI_API_KEY provided. Using MockAiService.');
  return new MockAiService();
}

export const aiService = createAiService();
