export interface CompetitorGapItem {
  competitorChannel: string;
  competitorVideoTitle: string;
  viewsCount: string;
  audienceComplaint: string;
  unsolvedQuestion: string;
  ourStrategicAdvantage: string;
  ourCounterHook: string;
  predictedAudienceStealBoost: string;
}

export interface CompetitorGapReport {
  contentId: string;
  analyzedCompetitorsCount: number;
  overallAudienceStealRate: string;
  gapItems: CompetitorGapItem[];
  tacticalKeywordsToTarget: string[];
  recommendationUz: string;
}

export class CompetitorGapAnalyzerService {
  public analyzeGaps(contentId: string, topic?: string): CompetitorGapReport {
    const gapItems: CompetitorGapItem[] = [
      {
        competitorChannel: "Fireship (@Fireship)",
        competitorVideoTitle: "AI Agents in 100 Seconds",
        viewsCount: "1.4M ko'rish",
        audienceComplaint: "Video juda qisqa va tez. Dasturchilar real ishlab chiqarishda (production) qanday ishlatishni tushunmay qolgan.",
        unsolvedQuestion: "Docker konteynerlarida xotira tozalash qanday qilinadi?",
        ourStrategicAdvantage: "To'liq 21 daqiqalik chuqur masterclass va 100% ishchi Docker Compose arxitekturasi beriladi.",
        ourCounterHook: "100 soniyalik shoular tugadi. Mana haqiqiy korxona darajasidagi avtonom AI arxitekturasi.",
        predictedAudienceStealBoost: "+42% tomoshabinlarni jalb qilish"
      },
      {
        competitorChannel: "Matthew Berman (@MatthewBerman)",
        competitorVideoTitle: "Autonomous AI Agents Just Got Crazy",
        viewsCount: "680K ko'rish",
        audienceComplaint: "Faqat tayyor platformalarni ko'rsatdi, lekin o'z serverida bepul ishga tushirish (self-hosting) yo'lini o'rgatmadi.",
        unsolvedQuestion: "API xarajatlari qancha bo'ladi va tokenni qanday tejash mumkin?",
        ourStrategicAdvantage: "Aniq xarajatlar kalkulyatori ($0.04/vazifa) va local fallback modellaridan foydalanish ko'rsatilgan.",
        ourCounterHook: "AI agentlar sizga oyiga $500 emas, atigi $12 ga tushishi uchun nima qilish kerak?",
        predictedAudienceStealBoost: "+36% qidiruv trafigi"
      },
      {
        competitorChannel: "All About AI (@AllAboutAI)",
        competitorVideoTitle: "Build Your First CrewAI Agent Today",
        viewsCount: "420K ko'rish",
        audienceComplaint: "Agent cheksiz siklga (infinite loop) tushib qolganda nima qilish kerakligi aytilmagan.",
        unsolvedQuestion: "Xatolik yuz berganda avto-tiklanish mexanizmi bormi?",
        ourStrategicAdvantage: "Cascade Failure avto-tiklanish zanjiri va 3-bosqichli xavfsizlik to'xtatuvchisi (circuit breaker) tushuntirilgan.",
        ourCounterHook: "Ko'pchilik AI agentlar dastlabki xatodanoq qulaydi. Mana bu kod uni o'zi avtomatik tuzatadi.",
        predictedAudienceStealBoost: "+29% konversiya"
      }
    ];

    return {
      contentId,
      analyzedCompetitorsCount: gapItems.length,
      overallAudienceStealRate: "+42% raqobatchilar qidiruvidan organik oqim",
      gapItems,
      tacticalKeywordsToTarget: [
        "ai agents fail production fix",
        "docker self hosted ai agent 2026",
        "autonomous agents token cost comparison",
        "prevent ai infinite loops tutorial"
      ],
      recommendationUz: "Raqobatchilar videolari ostidagi norozi tomoshabinlar sizning masterclassingizda to'liq, ishchi va xatosiz yechim topadi. Bu YouTube qidiruvida videongizni ularning videosi ostida 'Tavsiya qilinuvchi' (Suggested) sifatida birinchi o'ringa olib chiqadi."
    };
  }
}

export const competitorGapAnalyzerService = new CompetitorGapAnalyzerService();
