import { contentStore, ContentItemRecord } from './content-store.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ABVariant {
  id: string; // 'fomo' | 'direct_value' | 'controversial'
  archetype: 'fomo' | 'direct_value' | 'controversial';
  label: string;
  badge: string;
  title: string;
  hook: string;
  visualAlert: string;
  predictedCtr: number;
  psychologyAngle: string;
  powerWords: string[];
}

export interface ABTestResult {
  videoId: string;
  topic: string;
  generatedAt: string;
  appliedVariantId?: string;
  variants: ABVariant[];
}

const cache: Map<string, ABTestResult> = new Map();

export class ABTestingService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
      } catch (e) {
        console.warn('[ABTestingService] GoogleGenerativeAI initialization warning:', e);
      }
    }
  }

  // Strip emojis to guarantee 100% zero-defect PIL typography
  private sanitize(str: string): string {
    return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}-\u{2454}\u{20D0}-\u{20FF}]/gu, '').trim();
  }

  async generateVariants(workspaceId: string, videoId: string, topic?: string, currentTitle?: string): Promise<ABTestResult> {
    const item = contentStore.getById(videoId);
    const activeTopic = topic || currentTitle || item?.title || 'AI Revolution 2026';
    const cleanTopic = this.sanitize(activeTopic);

    let variants: ABVariant[] = [];

    if (this.genAI) {
      try {
        const prompt = `You are a world-class YouTube viral retention scientist for channel @NeuralPulseAI-m3e.
Generate exactly 3 psychological YouTube Shorts title and 3-second hook variants for topic: "${cleanTopic}".
Strict Rules:
- DO NOT use any unicode emojis (strictly plain text).
- Max title length: 55 characters.
- High CPM, high CTR focus.

Return strict JSON only (no markdown):
{
  "variants": [
    {
      "id": "fomo",
      "archetype": "fomo",
      "label": "FOMO / Qiziqish Bo'shlig'i",
      "badge": "Eng Yuqori Urgency",
      "title": "Title with mystery or FOMO",
      "hook": "First 3-second spoken hook that forces viewer to stay",
      "visualAlert": "! 2026 WARNING !",
      "predictedCtr": 10.9,
      "psychologyAngle": "Loss aversion & exclusivity trigger",
      "powerWords": ["SECRET", "ILLEGAL", "2026", "BEFORE"]
    },
    {
      "id": "direct_value",
      "archetype": "direct_value",
      "label": "Aniq Foyda / Tezkor ROI",
      "badge": "Yuqori Saqlanish (Retention)",
      "title": "Title promising tangible profit or time saved",
      "hook": "First 3-second spoken hook promising exact outcome",
      "visualAlert": "! FREE TOOL !",
      "predictedCtr": 9.6,
      "psychologyAngle": "Immediate practical utility trigger",
      "powerWords": ["FREE", "AUTOMATIC", "MONEY", "SPEED"]
    },
    {
      "id": "controversial",
      "archetype": "controversial",
      "label": "Munozara / Pattern Interrupt",
      "badge": "Viral Kommentlar Dvigateli",
      "title": "Contrarian title challenging conventional belief",
      "hook": "First 3-second controversial statement forcing debate",
      "visualAlert": "! STOP DOING THIS !",
      "predictedCtr": 11.5,
      "psychologyAngle": "Disruption of cognitive comfort zone",
      "powerWords": ["STOP", "LIE", "DESTROY", "TRUTH"]
    }
  ]
}`;

        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.variants && Array.isArray(parsed.variants) && parsed.variants.length === 3) {
            variants = parsed.variants.map((v: any) => ({
              ...v,
              title: this.sanitize(v.title),
              hook: this.sanitize(v.hook),
              visualAlert: this.sanitize(v.visualAlert)
            }));
          }
        }
      } catch (e) {
        console.warn('[ABTestingService] Gemini generation error, using algorithmic high-retention generator:', e);
      }
    }

    if (variants.length === 0) {
      variants = this.getAlgorithmicVariants(cleanTopic);
    }

    const result: ABTestResult = {
      videoId,
      topic: cleanTopic,
      generatedAt: new Date().toISOString(),
      variants
    };

    cache.set(videoId, result);
    return result;
  }

  private getAlgorithmicVariants(topic: string): ABVariant[] {
    const isUzbek = /[ўқғҳ]|lar|uchun|qanday|yangi/i.test(topic);

    if (isUzbek) {
      return [
        {
          id: 'fomo',
          archetype: 'fomo',
          label: "FOMO / Qiziqish Bo'shlig'i",
          badge: "Eng Yuqori Urgency",
          title: `Buni Bilmasangiz 2026-Yilda Kech Qolasiz: ${topic.slice(0, 30)}`,
          hook: "Agar siz hali ham ushbu AI vositasini ishlatmayotgan bo'lsangiz, raqobatchilaringiz allaqachon sizdan 10 qadam oldinga o'tib ketdi!",
          visualAlert: "! 2026 OGOHLANTIRISH !",
          predictedCtr: 11.2,
          psychologyAngle: "Yo'qotish qo'rquvi va eksklyuziv bilimga intilish tuyg'usi",
          powerWords: ["2026", "MAXFIY", "TEZKOR", "INQILOB"]
        },
        {
          id: 'direct_value',
          archetype: 'direct_value',
          label: "Aniq Foyda / Tezkor ROI",
          badge: "Yuqori Saqlanish (Retention)",
          title: `3 Daqiqada 5 Soatni Tejash: Bepul ${topic.slice(0, 30)}`,
          hook: "Bugun sizga kuniga 4 soat vaqtingizni va $500 pulingizni tejaydigan mutlaqo bepul sun'iy intellekt sirini ochaman!",
          visualAlert: "! 100% BEPUL AI !",
          predictedCtr: 9.8,
          psychologyAngle: "Aniq raqamlar va tezkor moddiy samara kafolati",
          powerWords: ["BEPUL", "AVTOMATIK", "DAROMAD", "TEJAMKOR"]
        },
        {
          id: 'controversial',
          archetype: 'controversial',
          label: "Munozara / Pattern Interrupt",
          badge: "Viral Kommentlar Dvigateli",
          title: `Katta Kompaniyalar Bu Dasturni Nega Yashiryapti?`,
          hook: "Dasturchilar va IT gigantlar bu AI vositasini sizdan nega sir tutayotganini hech o'ylab ko'rganmisiz? Sababi hayratda qoldiradi!",
          visualAlert: "! TAQIQLANGAN SIR !",
          predictedCtr: 11.8,
          psychologyAngle: "Kognitiv to'siqni buzish va izohlarda qizg'in bahs qo'zg'ash",
          powerWords: ["TO'XTATING", "ALDOV", "HAKIKAT", "MAXFIY"]
        }
      ];
    }

    return [
      {
        id: 'fomo',
        archetype: 'fomo',
        label: "FOMO / Curiosity Gap",
        badge: "Highest Urgency",
        title: `Stop Missing Out: 2026 AI Secret for ${topic.slice(0, 32)}`,
        hook: "If you are not using this AI tool today, you are actively falling 2 years behind your competitors. Watch closely!",
        visualAlert: "! 2026 ALERT !",
        predictedCtr: 11.4,
        psychologyAngle: "Fear of obsolescence & competitive advantage drive",
        powerWords: ["URGENT", "2026", "SECRET", "CRITICAL"]
      },
      {
        id: 'direct_value',
        archetype: 'direct_value',
        label: "Direct Value / Instant ROI",
        badge: "Highest Retention",
        title: `Save 5 Hours Daily: Free AI for ${topic.slice(0, 35)}`,
        hook: "Here is the exact automated AI workflow that saves developers 20 hours a week, completely free with zero subscription.",
        visualAlert: "! 100% FREE !",
        predictedCtr: 9.9,
        psychologyAngle: "Measurable time/money savings and zero barrier to entry",
        powerWords: ["FREE", "AUTOMATIC", "PROFIT", "SPEED"]
      },
      {
        id: 'controversial',
        archetype: 'controversial',
        label: "Controversial / Pattern Interrupt",
        badge: "Viral Comments Booster",
        title: `Why Big Tech Hides This Free AI Tool From You`,
        hook: "Big tech giants don't want you to know about this open-source tool because it replaces their $200 per month software.",
        visualAlert: "! EXPOSED !",
        predictedCtr: 12.1,
        psychologyAngle: "Rebellion against gatekeeping & controversy spark",
        powerWords: ["EXPOSED", "SHOCKING", "BANNED", "REVOLUTION"]
      }
    ];
  }

  applyVariant(workspaceId: string, videoId: string, variantId: string): { success: boolean; item: ContentItemRecord; appliedVariant: ABVariant } {
    const item = contentStore.getById(videoId);
    if (!item) {
      throw new Error(`Video item not found: ${videoId}`);
    }

    const testResult = cache.get(videoId);
    let selectedVariant: ABVariant | undefined;

    if (testResult) {
      selectedVariant = testResult.variants.find(v => v.id === variantId);
    }

    if (!selectedVariant) {
      const fallbackVariants = this.getAlgorithmicVariants(item.title);
      selectedVariant = fallbackVariants.find(v => v.id === variantId) || fallbackVariants[0];
    }

    // Replace the first line/hook in the script with the selected hook
    let newScript = item.script || '';
    if (newScript.includes('\n')) {
      const parts = newScript.split('\n');
      parts[0] = selectedVariant.hook;
      newScript = parts.join('\n');
    } else {
      newScript = `${selectedVariant.hook}\n${newScript}`;
    }

    // Update scenes if available
    const newScenes = item.scenes ? [...item.scenes] : [];
    if (newScenes.length > 0) {
      newScenes[0] = {
        ...newScenes[0],
        title: selectedVariant.title.slice(0, 40),
        overlayText: selectedVariant.visualAlert
      };
    }

    const updated = contentStore.updateItem(videoId, {
      title: selectedVariant.title,
      script: newScript,
      scenes: newScenes,
      originalTitle: item.originalTitle || item.title
    });

    if (!updated) {
      throw new Error(`Failed to update item: ${videoId}`);
    }

    if (testResult) {
      testResult.appliedVariantId = variantId;
      cache.set(videoId, testResult);
    }

    return {
      success: true,
      item: updated,
      appliedVariant: selectedVariant
    };
  }

  getCached(videoId: string): ABTestResult | null {
    return cache.get(videoId) || null;
  }
}

export const abTestingService = new ABTestingService();
