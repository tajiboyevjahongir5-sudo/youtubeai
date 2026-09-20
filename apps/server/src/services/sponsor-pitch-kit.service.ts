export interface SponsorshipTier {
  tierName: string;
  priceUSD: number;
  placement: string;
  deliverables: string[];
  expectedBrandImpressions: string;
  recommendedFor: string;
}

export interface SponsorMediaKitPackage {
  channelName: string;
  channelHandle: string;
  niche: string;
  audienceDemographics: {
    topCountries: { country: string; flag: string; percent: number }[];
    professionBreakdown: { title: string; percent: number }[];
    ageGroup: string;
    averageViewerIncomeTier: string;
  };
  metrics: {
    monthlyImpressions: string;
    averageWatchTimeMinutes: string;
    averageLongFormAPV: string;
    subscribersCount: string;
  };
  pricingTiers: SponsorshipTier[];
  payoutMethods: {
    method: string;
    description: string;
    speed: string;
    supportedInUzbekistan: boolean;
  }[];
  outreachEmailTemplate: {
    subject: string;
    bodyText: string;
  };
}

export class SponsorPitchKitService {
  public generateMediaKit(contentId: string, customBrandName?: string): SponsorMediaKitPackage {
    const brand = customBrandName || "Cursor AI / Modal / Supabase";

    const pricingTiers: SponsorshipTier[] = [
      {
        tierName: "Dedicated Shoutout (30s Intro)",
        priceUSD: 1800,
        placement: "Video boshlanishida (00:45 - 01:15 oralig'ida)",
        deliverables: [
          "30 soniyalik dinamik Alex xosti tavsiyasi",
          "Video tavsifida (Description) eng yuqori 1-o'rindagi link",
          "Kanal Pinned izohida homiy havolasi"
        ],
        expectedBrandImpressions: "45,000 - 85,000 maqsadli dasturchilar",
        recommendedFor: "Tezkor trafik va mahsulot sinoviga chaqiruv"
      },
      {
        tierName: "Full Deep-Dive Integration (60-90s Mid-Roll)",
        priceUSD: 3800,
        placement: "Masterclass markazida (Akt 2 yoki Akt 3 - jonli kod bilan)",
        deliverables: [
          "60-90 soniyalik amaliy B-Roll va jonli demo",
          "Alex o'z kompyuterida vositadan foydalanib ko'rsatadi",
          "GitHub repozitoriyida brend logotipi va havolasi",
          "YouTube Community Tabda alohida homiylik posti"
        ],
        expectedBrandImpressions: "85,000 - 200,000 yuqori konversiyali texnik mutaxassislar",
        recommendedFor: "SaaS vositalar, Developer Tools, Cloud & AI infratuzilma"
      },
      {
        tierName: "Title Sponsor (Bosh Homiy - To'liq Masterclass)",
        priceUSD: 6500,
        placement: "Butun 12 daqiqalik video davomida 'Powered by [Brand]'",
        deliverables: [
          "Video boshida 'Brought to you by [Brand]' kinematik intro",
          "Video ichida 2 marta to'liq integratsiya",
          "Muqovada (Thumbnail) 'Official Partner' yozuvi",
          "Video nomida '(feat. [Brand])' ko'rinishi",
          "To'liq eksklyuzivlik (boshqa hech qanday raqobatchi reklama bo'lmaydi)"
        ],
        expectedBrandImpressions: "200,000 - 500,000+ global tomoshabinlar",
        recommendedFor: "Katta investitsiya kiritgan A-seriyadagi AI va Cloud kompaniyalar"
      }
    ];

    const payoutMethods = [
      {
        method: "Bank Wire Transfer (SWIFT)",
        description: "O'zbekistondagi istalgan bankning valyuta hisob raqamiga to'g'ridan-to'g'ri USD da tushadi",
        speed: "1 - 3 ish kuni",
        supportedInUzbekistan: true
      },
      {
        method: "Deel / Remote.com Shartnomasi",
        description: "AQSh kompaniyalari mustaqil pudratchi (Contractor) sifatida to'laydi. Deel'dan Uzcard/Humo kartalariga 1 soniyada chiqariladi",
        speed: "Darhol (Instant)",
        supportedInUzbekistan: true
      },
      {
        method: "Payoneer / Wise Invoice",
        description: "Xalqaro biznes hisob-faktura (Invoice) orqali to'lov qabul qilinadi",
        speed: "Bir necha soat",
        supportedInUzbekistan: true
      },
      {
        method: "Kriptovalyuta (USDT / USDC TRC-20)",
        description: "Web3 va AI startaplari to'g'ridan-to'g'ri stabil koinlarda to'laydi",
        speed: "5 daqiqa",
        supportedInUzbekistan: true
      }
    ];

    const outreachEmailTemplate = {
      subject: `Partnership Inquiry: Reaching 150K+ Autonomous AI Engineers with Neural Pulse AI`,
      bodyText: `Hi ${brand} Team,

I'm Jahongir, Producer at Neural Pulse AI (@NeuralPulseAI-m3e). We produce high-production, 4K masterclasses and technical deep-dives on Autonomous AI Agents, Production Infrastructure, and LLM Orchestration.

Our audience is 62% Tier-1 developers (US, UK, Germany) with an average long-form retention (APV) exceeding 72%. 

We are currently producing an upcoming masterclass: "Autonomous AI Agents 2026: Production Architecture & Self-Healing Loops" (12-minute deep dive with live Docker/TypeScript demos).

Given your industry leadership in developer tooling, we would love to feature ${brand} as our exclusive sponsor for this masterclass.

Our Partnership Kit:
• 60-90s Deep-Dive Live Demo & Code Showcase
• Pinned Comment & Top Description Placement
• GitHub Repository & Community Tab Feature

Would you be open to reviewing our media kit and exploring a sponsored integration for this episode?

Best regards,
Jahongir | Neural Pulse AI Media Studio
Email: partnerships@neuralpulse.ai
YouTube: @NeuralPulseAI-m3e`
    };

    return {
      channelName: "Neural Pulse AI",
      channelHandle: "@NeuralPulseAI-m3e",
      niche: "Autonomous AI, Software Engineering & Cloud Infrastructure",
      audienceDemographics: {
        topCountries: [
          { country: "AQSh (United States)", flag: "🇺🇸", percent: 48 },
          { country: "Buyuk Britaniya (UK)", flag: "🇬🇧", percent: 14 },
          { country: "Germaniya (Germany)", flag: "🇩🇪", percent: 11 },
          { country: "Kanada & Avstraliya", flag: "🇨🇦", percent: 9 },
          { country: "Boshqa Global", flag: "🌐", percent: 18 }
        ],
        professionBreakdown: [
          { title: "Senior & Staff Software Engineers", percent: 42 },
          { title: "AI/ML Engineers & Data Scientists", percent: 28 },
          { title: "CTO, Founders & Tech Leads", percent: 18 },
          { title: "Full-Stack Dasturchilar", percent: 12 }
        ],
        ageGroup: "24 - 44 yosh (Yuqori xarid qobiliyati)",
        averageViewerIncomeTier: "$85,000 - $160,000/yil (Tier-1 Tech)"
      },
      metrics: {
        monthlyImpressions: "1,200,000+ taassurot",
        averageWatchTimeMinutes: "8:45 daqiqa (16:9 masterclass)",
        averageLongFormAPV: "72.4% (YouTube sanoat o'rtachasidan 2.3x yuqori)",
        subscribersCount: "Yuqori faollikdagi texnik auditoriya"
      },
      pricingTiers,
      payoutMethods,
      outreachEmailTemplate
    };
  }
}

export const sponsorPitchKitService = new SponsorPitchKitService();
