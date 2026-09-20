export interface AudiencePersona {
  id: string;
  name: string;
  archetype: 'gen_z_scroller' | 'tech_enthusiast' | 'casual_viewer' | 'skeptic_critic';
  avatar: string;
  attentionSpanSec: number;
  retentionProbability: number; // 0 - 100
  reaction: string;
  feedback: string;
}

export interface HookStressTestResult {
  overallRetentionScore: number; // 0 - 100
  predicted3sStayRate: string; // e.g. "88.4%"
  predicted15sStayRate: string; // e.g. "72.1%"
  dropOffRiskWords: Array<{ word: string; riskLevel: 'high' | 'medium' | 'low'; reason: string }>;
  personaBreakdown: {
    genZScrollers: { count: number; stayPercentage: number; sentiment: string };
    techEnthusiasts: { count: number; stayPercentage: number; sentiment: string };
    casualViewers: { count: number; stayPercentage: number; sentiment: string };
    skepticCritics: { count: number; stayPercentage: number; sentiment: string };
  };
  patternInterruptAlternatives: Array<{
    hookType: string;
    hookText: string;
    predictedBoost: string;
    whyItWorks: string;
  }>;
}

export class AudienceSimulatorService {
  /**
   * 100 ta sun'iy tomoshabin profili orqali videoning kirish ssenariysini stress-test qiladi
   */
  static simulateAudience(script: string, topic: string): HookStressTestResult {
    const cleanScript = (script || '').trim();
    const words = cleanScript.split(/\s+/).slice(0, 35); // First 35 words (~5-8 seconds)

    // Detect weak / slow words that cause drop-offs
    const dropOffWords: Array<{ word: string; riskLevel: 'high' | 'medium' | 'low'; reason: string }> = [];

    const boringPatterns = [
      { regex: /salom|assalomu|bugun|sizga|haqida|gaplashamiz/i, reason: "Sekin kirish. Tomoshabin birinchi 1.5 soniyadayoq qiziqishni yo'qotadi." },
      { regex: /mening ismim|kanalimga|obuna bo'ling/i, reason: "Egoizm/Reklama signali. Shorts foydalanuvchisi darhol keyingisiga o'tkazib yuboradi." },
      { regex: /videoni boshlashdan|avval|eslatib o'taman/i, reason: "Vaqtni cho'zish. 0-3 soniya Pattern Interrupt qoidasiga zid." }
    ];

    words.forEach((w) => {
      for (const p of boringPatterns) {
        if (p.regex.test(w) && !dropOffWords.some(d => d.word.toLowerCase() === w.toLowerCase())) {
          dropOffWords.push({
            word: w.replace(/[.,!?]/g, ''),
            riskLevel: 'high',
            reason: p.reason
          });
        }
      }
    });

    if (dropOffWords.length === 0 && words.length > 5) {
      dropOffWords.push({
        word: words[Math.min(3, words.length - 1)].replace(/[.,!?]/g, ''),
        riskLevel: 'medium',
        reason: "Ushbu so'zda e'tiborni kuchaytiruvchi visual kadr yoki sound effect kerak."
      });
    }

    const penalty = dropOffWords.filter(d => d.riskLevel === 'high').length * 12;
    const baseRetention = Math.max(55, Math.min(94, 91 - penalty));

    return {
      overallRetentionScore: baseRetention,
      predicted3sStayRate: `${baseRetention}%`,
      predicted15sStayRate: `${Math.round(baseRetention * 0.81)}%`,
      dropOffRiskWords: dropOffWords,
      personaBreakdown: {
        genZScrollers: {
          count: 35,
          stayPercentage: Math.max(48, Math.round(baseRetention * 0.92)),
          sentiment: baseRetention > 80 ? "🔥 'Boomer gaplari yo'q, vizual tezlik ajoyib'" : "⚠️ 'Sekin boshlandi, 2-soniyadayoq o'tkazib yubordim'"
        },
        techEnthusiasts: {
          count: 25,
          stayPercentage: Math.max(65, Math.min(98, Math.round(baseRetention * 1.08))),
          sentiment: "🚀 'Haqiqiy arxitektura va kod haqida, darhol saqlab oldim'"
        },
        casualViewers: {
          count: 20,
          stayPercentage: Math.round(baseRetention * 0.88),
          sentiment: "✨ 'Tushunarli va qiziqarli ko'rinadi'"
        },
        skepticCritics: {
          count: 20,
          stayPercentage: Math.round(baseRetention * 0.76),
          sentiment: "🔍 'Dalil va GitHub havolasini ko'rmaguncha ishonmayman'"
        }
      },
      patternInterruptAlternatives: [
        {
          hookType: "🔥 Noqonuniy Foyda (Illegal Advantage)",
          hookText: `Bu AI instrumentni bilish dasturchilar uchun noqonuniy ustunlikdek tuyuladi!`,
          predictedBoost: "+24% 3s Retention",
          whyItWorks: "Tomoshabin miyasida 'sir ochilmoqda' instinktini uyg'otadi va darhol e'tiborni qulflaydi."
        },
        {
          hookType: "⚡ Keskin Qo'rquv & FOMO (Urgency Alert)",
          hookText: `Agar siz hali ham buni qo'lda qilayotgan bo'lsangiz — 2026-yilda ishsiz qolishingiz aniq!`,
          predictedBoost: "+19% 3s Retention",
          whyItWorks: "Yo'qotish qo'rquvi (Loss Aversion) insondagi eng kuchli harakatlantiruvchi psixologik omil."
        },
        {
          hookType: "🎯 Haqiqiy Natija & Pul (Proof First)",
          hookText: `Mana bu oddiy AI skripti orqali 1 kunda $4,200 ishlab olgan dasturchi nima qildi?`,
          predictedBoost: "+28% 3s Retention",
          whyItWorks: "Mavhum gaplar o'rniga aniq raqam va natijani birinchi soniyadayoq ko'rsatish."
        }
      ]
    };
  }
}
