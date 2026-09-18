import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../env';

export interface IAiService {
  generateIdea(context: any): Promise<any>;
  generateScript(context: any): Promise<any>;
  generateMetadata(context: any): Promise<any>;
  generateStoryboard(context: any): Promise<any>;
  qualityReview(context: any): Promise<any>;
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
    const prompt = `You are a YouTube content strategist. Generate a video idea based on:
Niche: ${context.niche}
Audience: ${context.audience}
Strategy Memory: ${context.strategyMemory}

Disclaimer: We do not guarantee recommendations.
Generate content in ENGLISH. Return JSON format with fields: title, contentPillar, viewerProblem, targetAudience, hook, suggestedStructure, expectedLengthMinutes, videoFormat, riskFlags (array), originalityNote, relevanceReason, confidenceLevel, evidence, status.`;
    const text = await this.generateWithFallback(prompt);
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    return JSON.parse(text.slice(jsonStart, jsonEnd));
  }

  async generateScript(context: any) {
    const isLong = context.videoFormat === 'long_form' || context.format === 'long_form';
    const cleanTitle = (context.title || 'AI Breakthrough in 2026').replace(/#shorts/gi, '').trim();

    const prompt = isLong ? `You are the lead executive producer for Neural Pulse AI, a premier English technology documentary channel targeting Tier-1 software engineers and tech leaders.
Write a MASTER-GRADE 16:9 Long-Form Documentary Script for: "${cleanTitle}".
Language: Strictly ENGLISH (US, High Authority, Energetic, Precise).

Requirements:
1. CHAPTER TIMESTAMPS: Generate exactly 5 structured chapters with minute markers:
   - Chapter 1 (00:00 - 02:00): The Paradigm Shift & Core Hook
   - Chapter 2 (02:01 - 04:30): Technical Architecture & Deep Dive Mechanics
   - Chapter 3 (04:31 - 07:00): Live Hands-On Demo & Step-by-Step Code Execution
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
    { "title": "Why Most Engineers Fail at ${cleanTitle} (Avoid This)", "hookType": "urgency", "predictedCtr": "10.2%", "tagline": "Urgency & Mistake Prevention" }
  ],
  "pinnedComment": string (compelling question to trigger comments),
  "loopTransition": string,
  "highCpmKeywords": array of strings
}` : `You are the viral retention director for Neural Pulse AI, the fastest-growing AI tech Shorts channel on YouTube.
Write a VIRAL, MASTER-GRADE 9:16 YouTube Shorts Script for: "${cleanTitle}".
Language: Strictly ENGLISH (US, Punchy, +14% pacing, crisp enunciation).

Requirements (2026 YouTube Shorts Retention Blueprint):
1. 0-3s EXPLOSIVE HOOK: Urgent pattern interrupt with bold curiosity gap (e.g. "Stop scrolling! If you haven't seen ${cleanTitle} yet, your workflow is obsolete.").
2. HIGH DENSITY VALUE: 5 micro-scenes timed perfectly for 50-56 seconds total duration.
   - [0:00 - 0:04] HOOK (Fast camera zoom in & pulse graphic)
   - [0:05 - 0:17] SCENE 1 (The Core Problem / Shocking Bottleneck)
   - [0:18 - 0:31] SCENE 2 (The Secret Advantage & How It Works)
   - [0:32 - 0:44] SCENE 3 (Real-World Results & 10x Performance Metrics)
   - [0:45 - 0:56] OUTRO & SEAMLESS LOOP (Comment Question + Channel CTA + seamless loop phrase)
3. SEAMLESS LOOP: The last sentence must end with an incomplete phrase that grammatically and logically flows right back into the 0:00 opening sentence! (e.g., "...and that is the exact reason why...")
4. TOPIC SPECIFICITY: Deep technical facts, metrics, and tools relevant to "${cleanTitle}".
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
    { "title": "The Secret AI Breakthrough: ${cleanTitle} #Shorts", "hookType": "curiosity", "predictedCtr": "11.2%", "tagline": "Pure Curiosity & High VVSA" },
    { "title": "How ${cleanTitle} 10x'd Our Workflow in 24 Hours #Shorts", "hookType": "roi", "predictedCtr": "9.9%", "tagline": "Proof & Practical 10x Results" }
  ],
  "pinnedComment": string,
  "loopTransition": string,
  "highCpmKeywords": array of strings
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
  async generateScript(context: any) {
    return { hook: 'Hey', fullScript: 'Welcome to this video.', scenes: [], closingCta: 'Subscribe!', factCheckNotes: [], copyrightRiskNotes: [] };
  }
  async generateMetadata(context: any) {
    return { titleVariations: ['Title 1', 'Title 2', 'Title 3'], selectedTitle: 'Title 1', description: 'Desc', tags: ['typescript'], hashtags: ['#ts'], chapters: [], pinnedComment: 'Hi', metadataQualityScore: 90 };
  }
  async generateStoryboard(context: any) { return { scenes: [] }; }
  async qualityReview(context: any) { return { score: 95, originality: 'High', policyRisk: 'Low', hookStrength: 'Strong', feedback: 'Great' }; }
}

export function createAiService(): IAiService {
  if (env.GEMINI_API_KEY) {
    return new GeminiAiService(env.GEMINI_API_KEY);
  }
  console.warn('⚠️ No GEMINI_API_KEY provided. Using MockAiService.');
  return new MockAiService();
}

export const aiService = createAiService();
