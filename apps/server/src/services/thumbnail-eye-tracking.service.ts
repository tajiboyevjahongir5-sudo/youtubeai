export interface ThumbnailHeatmapZone {
  label: string;
  xPercent: number;
  yPercent: number;
  radiusPercent: number;
  attentionIntensity: number; // 0.0 - 1.0 (1.0 = Highest eye fixation)
  description: string;
}

export interface ThumbnailCTRVariant {
  id: string;
  variantName: string;
  headlineText: string;
  visualHook: string;
  predictedCTR: number; // e.g. 14.8%
  confidenceScore: number; // 0 - 100
  isWinner: boolean;
  eyeTrackingHeatmap: ThumbnailHeatmapZone[];
  strengths: string[];
  suggestedFixes: string[];
}

export interface EyeTrackingSimulationPackage {
  contentId: string;
  testedVariantsCount: number;
  winningVariantId: string;
  overallBestCTR: string;
  benchmarkShortsCTR: string;
  variants: ThumbnailCTRVariant[];
  algorithmAdvice: string;
}

export class ThumbnailEyeTrackingService {
  public simulateEyeTracking(contentId: string, customTitle?: string): EyeTrackingSimulationPackage {
    const title = customTitle || "Autonomous AI Agents 2026: Production Masterclass";

    const variants: ThumbnailCTRVariant[] = [
      {
        id: "variant_a",
        variantName: "Variant A: Yuqori Kontrast & Xavf Rejimi (Qizil / Sariq)",
        headlineText: "90% AI AGENTS CRASH IN PROD",
        visualHook: "Alex jiddiy yuz ifodasi, qizil server xatosi chiroqlari va yonayotgan Docker logotipi",
        predictedCTR: 15.4,
        confidenceScore: 96,
        isWinner: true,
        eyeTrackingHeatmap: [
          {
            label: "Alex Ko'zlari & Yuzi",
            xPercent: 32,
            yPercent: 42,
            radiusPercent: 18,
            attentionIntensity: 0.98,
            description: "Dastlabki 0.15 soniyada tomoshabin nigohi Alexning his-tuyg'usiga tushadi"
          },
          {
            label: "'90% CRASH' Qalin Matni",
            xPercent: 72,
            yPercent: 35,
            radiusPercent: 22,
            attentionIntensity: 0.92,
            description: "Qizil fonga sariq matn — xavf hissi orqali klik qilishga undaydi"
          },
          {
            label: "Glitshli Docker Belgisi",
            xPercent: 68,
            yPercent: 72,
            radiusPercent: 15,
            attentionIntensity: 0.74,
            description: "Dasturchilar e'tiborini tortuvchi texnik kontekst"
          }
        ],
        strengths: [
          "Inson ko'zi 0.2 soniyada kontrast matnni ilg'aydi",
          "MrBeast qoidasi: Yuqori his-tuyg'uli yuz ifodasi va xavf signali",
          "Yuz zonasi toza, hech qanday subtitr bilan to'silmagan"
        ],
        suggestedFixes: [
          "Matn soyasini 2px ga qalinlashtirilsa, mobil ekranda yana +0.4% CTR beradi"
        ]
      },
      {
        id: "variant_b",
        variantName: "Variant B: Minimalist Kibernetik Rejim (Kianit / Neon)",
        headlineText: "BUILD SELF-HEALING AI IN 3 LINES",
        visualHook: "Neon yashil kod terminali, 3D shisha kublar va Alex ishorasi",
        predictedCTR: 11.8,
        confidenceScore: 91,
        isWinner: false,
        eyeTrackingHeatmap: [
          {
            label: "Neon Yashil Kod Bloki",
            xPercent: 60,
            yPercent: 50,
            radiusPercent: 25,
            attentionIntensity: 0.85,
            description: "Texnik dasturchilar kodga qaraydi"
          },
          {
            label: "Alex Qo'l Ishorasi",
            xPercent: 25,
            yPercent: 55,
            radiusPercent: 16,
            attentionIntensity: 0.78,
            description: "Yo'naltiruvchi ishora"
          }
        ],
        strengths: [
          "Texnik mutaxassislar uchun juda qiziqarli",
          "Toza, premium Silicon Valley uslubi"
        ],
        suggestedFixes: [
          "Yuz ifodasi haddan tashqari xotirjam, biroz dramatiklik qo'shish tavsiya etiladi"
        ]
      },
      {
        id: "variant_c",
        variantName: "Variant C: Moliyaviy Rejim (Oltin / Daromad)",
        headlineText: "$50K/MO WITH AUTONOMOUS SAAS",
        visualHook: "O'sayotgan grafiklar, oltin nurlar va server ustunlari",
        predictedCTR: 9.4,
        confidenceScore: 88,
        isWinner: false,
        eyeTrackingHeatmap: [
          {
            label: "'$50K/MO' Matni",
            xPercent: 50,
            yPercent: 40,
            radiusPercent: 20,
            attentionIntensity: 0.82,
            description: "Pul miqdori diqqatni tortadi"
          }
        ],
        strengths: [
          "Tez boyish qiziquvchilarini tortadi"
        ],
        suggestedFixes: [
          "Haddan tashqari klikbeyt ko'rinishi mumkin, texnik auditoriyada ishonchsizlik uyg'otishi xavfi bor"
        ]
      }
    ];

    return {
      contentId,
      testedVariantsCount: variants.length,
      winningVariantId: "variant_a",
      overallBestCTR: "15.4% (G'olib — O'rtacha ko'rsatkichdan 2.1x yuqori)",
      benchmarkShortsCTR: "Standart YouTube Tech kanallarida o'rtacha CTR 6.5% - 8.2%",
      variants,
      algorithmAdvice: "Variant A tavsiya etiladi. Qizil/sariq kontrast va Alexning jiddiy nigohi mobil telefonda ko'rishayotganda bosh barmoqni to'xtatish (Thumb-Stop Rate) ehtimolini 89% ga yetkazadi."
    };
  }
}

export const thumbnailEyeTrackingService = new ThumbnailEyeTrackingService();
