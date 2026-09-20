export interface RotatorCombination {
  id: string;
  combinationName: string;
  title: string;
  thumbnailVariant: 'variant_a' | 'variant_b' | 'variant_c';
  thumbnailUrl: string;
  activeWindowHours: string;
  currentCTR: number;
  impressions: number;
  clicks: number;
  status: 'active' | 'queued' | 'evaluated' | 'winner';
}

export interface ABRotatorSchedule {
  contentId: string;
  isAutoRotationEnabled: boolean;
  rotationIntervalHours: number; // e.g. 4 hours
  testDurationHours: number; // e.g. 24 or 48 hours
  elapsedHours: number;
  totalCombinationsTested: number;
  activeCombinationId: string;
  winningCombinationId: string;
  projectedViewsBoost: string;
  combinations: RotatorCombination[];
}

export class ABTitleThumbnailRotatorService {
  public getRotatorPlan(contentId: string, customTitle?: string): ABRotatorSchedule {
    const baseTitle = customTitle || "Autonomous AI Agents 2026: Production Masterclass";

    const combinations: RotatorCombination[] = [
      {
        id: "combo_1",
        combinationName: "Kombinatsiya 1: Yuqori Xavf (MrBeast uslubi)",
        title: "90% of AI Agents Fail in Production (Here is Why)",
        thumbnailVariant: "variant_a",
        thumbnailUrl: "/thumbnails/variant_a.jpg",
        activeWindowHours: "0 - 4 soat (Premyera bosqichi)",
        currentCTR: 15.6,
        impressions: 42000,
        clicks: 6552,
        status: "winner"
      },
      {
        id: "combo_2",
        combinationName: "Kombinatsiya 2: Amaliy Yechim (Silicon Valley uslubi)",
        title: "I Built a Self-Healing Autonomous AI Agent with Docker",
        thumbnailVariant: "variant_b",
        thumbnailUrl: "/thumbnails/variant_b.jpg",
        activeWindowHours: "4 - 8 soat",
        currentCTR: 12.1,
        impressions: 38000,
        clicks: 4598,
        status: "evaluated"
      },
      {
        id: "combo_3",
        combinationName: "Kombinatsiya 3: Katta Masshtab (Korxona uslubi)",
        title: "The 2026 Autonomous AI Stack You Need to Know",
        thumbnailVariant: "variant_c",
        thumbnailUrl: "/thumbnails/variant_c.jpg",
        activeWindowHours: "8 - 12 soat",
        currentCTR: 9.8,
        impressions: 35000,
        clicks: 3430,
        status: "evaluated"
      }
    ];

    return {
      contentId,
      isAutoRotationEnabled: true,
      rotationIntervalHours: 4,
      testDurationHours: 24,
      elapsedHours: 12,
      totalCombinationsTested: combinations.length,
      activeCombinationId: "combo_1",
      winningCombinationId: "combo_1",
      projectedViewsBoost: "+58% ko'proq dastlabki ko'rishlar (G'olib kombinatsiya qulflanadi)",
      combinations
    };
  }
}

export const abTitleThumbnailRotatorService = new ABTitleThumbnailRotatorService();
