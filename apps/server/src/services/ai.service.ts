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
  private primaryModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  private fallbackModel = 'gemini-1.5-flash';

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
    const prompt = `Write a high-retention, viral YouTube Shorts script for topic: ${context.title}. Generate content strictly in ENGLISH for high-CPM US/UK audience.
Follow the 2026 Viral Shorts Retention Blueprint:
1. 0-3s Explosive Hook: Urgent pattern interrupt with bold curiosity gap or pain point (e.g. "Stop scrolling! You are wasting hours...").
2. High-Paced Delivery: 4-5 micro-scenes, each delivering crisp, high-density value in 6-8 seconds. Total script length: 130-150 words (under 58 seconds at +14% pacing).
3. Visuals & Proof: Each scene must specify concrete dynamic B-roll (datacenter, cyberpunk city, active code terminal, UI automation cards).
4. No Emojis: Do NOT include unicode emojis in scene overlay text; specify clean text labels for vector icon overlays.
5. High-Engagement Outro: Ask a direct, controversial or opinion-based question to drive comment velocity, followed by a crisp subscribe CTA for "Neural Pulse AI".
Return JSON with fields:
- hook: string (explosive 0-3s opener)
- fullScript: string (full continuous voiceover text)
- scenes: array of objects { id, title, text, durationSeconds, visualBroll, overlayText, iconType }
- closingCta: string (comment question + channel subscription CTA)
- factCheckNotes: array of strings
- copyrightRiskNotes: array of strings`;
    const text = await this.generateWithFallback(prompt);
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    return JSON.parse(text.slice(jsonStart, jsonEnd));
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
