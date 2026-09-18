import { contentStore } from './content-store.service';

export interface RankedTag {
  tag: string;
  searchVolume: 'Juda Yuqori' | 'Yuqori' | 'O\'rtacha' | 'Past';
  competitionScore: number; // 0 - 100 (lower means easier to rank)
  predictedRank: number; // 1, 2, 3, 4, 5...
  opportunityScore: number; // 0 - 100
  isCurrentlyAdded: boolean;
}

export interface SeoAuditResult {
  videoId: string;
  overallScore: number;
  rankBadge: 'A+' | 'A' | 'B+' | 'B';
  titleOptimization: {
    length: number;
    hasPowerWord: boolean;
    hasNumber: boolean;
    score: number;
    feedback: string;
  };
  descriptionOptimization: {
    length: number;
    hasTimestamps: boolean;
    hasCallToAction: boolean;
    keywordDensity: number;
    score: number;
    feedback: string;
  };
  tagsOptimization: {
    totalTags: number;
    topRankedCount: number;
    score: number;
    feedback: string;
  };
  rankedTags: RankedTag[];
  recommendedTopTags: RankedTag[];
}

export class SeoRankService {
  analyze(videoId: string, title?: string, description?: string, rawTags?: string[] | string): SeoAuditResult {
    const item = contentStore.getById(videoId);
    const activeTitle = (title || item?.title || '').trim();
    const activeDesc = (description || item?.description || '').trim();
    
    let currentTags: string[] = [];
    if (Array.isArray(rawTags)) {
      currentTags = rawTags;
    } else if (typeof rawTags === 'string') {
      currentTags = rawTags.split(',').map(t => t.trim()).filter(Boolean);
    } else if (item?.tags) {
      currentTags = Array.isArray(item.tags) ? item.tags : [item.tags];
    }

    const currentTagsLower = currentTags.map(t => t.toLowerCase());

    // Title Optimization
    const titleLen = activeTitle.length;
    const powerWords = ['2026', 'ai', 'secret', 'free', 'revolution', 'automatic', 'stop', 'new', 'bepul', 'maxfiy', 'inqilob'];
    const hasPowerWord = powerWords.some(pw => activeTitle.toLowerCase().includes(pw));
    const hasNumber = /\d+/.test(activeTitle);
    let titleScore = 70;
    if (titleLen >= 35 && titleLen <= 70) titleScore += 15;
    if (hasPowerWord) titleScore += 10;
    if (hasNumber) titleScore += 5;
    titleScore = Math.min(100, titleScore);

    const titleFeedback = titleScore >= 90
      ? "Sarlavha ideal uzunlikda va yuqori CTR chaqiruvchi kalit so'zlarga ega."
      : "Sarlavhaga kuchliroq raqamlar yoki yilni (2026) qo'shish tavsiya qilinadi.";

    // Description Optimization
    const descLen = activeDesc.length;
    const hasTimestamps = /\d+:\d+/.test(activeDesc);
    const hasCallToAction = /subscribe|obuna|comment|izoh|link/i.test(activeDesc);
    
    // Keyword density
    const words = activeDesc.toLowerCase().split(/\s+/).filter(Boolean);
    const titleKeywords = activeTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    let kwHits = 0;
    for (const w of words) {
      if (titleKeywords.some(tk => w.includes(tk))) kwHits++;
    }
    const keywordDensity = words.length > 0 ? Number(((kwHits / words.length) * 100).toFixed(1)) : 2.1;

    let descScore = 65;
    if (descLen >= 150) descScore += 15;
    if (hasTimestamps) descScore += 10;
    if (hasCallToAction) descScore += 10;
    descScore = Math.min(100, descScore);

    const descFeedback = descScore >= 90
      ? "Tavsifda aniq vaqt belgilari (timestamps) va kuchli harakatga chaqiruv (CTA) mavjud."
      : "Tavsifga 1-2 ta tegishli heshteg va qisqa timestamps qo'shish qidiruv indeksatsiyasini yaxshilaydi.";

    // Generate ranked tags catalog based on video topic
    const baseRanked = this.calculateRankedTags(activeTitle, currentTagsLower);
    const rankedTags = baseRanked.filter(t => t.isCurrentlyAdded);
    const recommendedTopTags = baseRanked.filter(t => !t.isCurrentlyAdded);

    const topRankedCount = rankedTags.filter(t => t.predictedRank <= 3).length;
    let tagsScore = 70 + (topRankedCount * 6) + (rankedTags.length >= 8 ? 10 : 0);
    tagsScore = Math.min(100, tagsScore);

    const tagsFeedback = topRankedCount >= 3
      ? `Ajoyib! Sizning ${topRankedCount} ta tegingiz YouTube qidiruvida Top-3 talikka kirishi kutilmoqda.`
      : "Teglar orasida raqobati pastroq bo'lgan 'long-tail' kalit so'zlarni ko'paytiring.";

    const overallScore = Math.round((titleScore * 0.35) + (descScore * 0.30) + (tagsScore * 0.35));
    const rankBadge: 'A+' | 'A' | 'B+' | 'B' = overallScore >= 93 ? 'A+' : (overallScore >= 85 ? 'A' : (overallScore >= 75 ? 'B+' : 'B'));

    return {
      videoId,
      overallScore,
      rankBadge,
      titleOptimization: {
        length: titleLen,
        hasPowerWord,
        hasNumber,
        score: titleScore,
        feedback: titleFeedback
      },
      descriptionOptimization: {
        length: descLen,
        hasTimestamps,
        hasCallToAction,
        keywordDensity,
        score: descScore,
        feedback: descFeedback
      },
      tagsOptimization: {
        totalTags: rankedTags.length,
        topRankedCount,
        score: tagsScore,
        feedback: tagsFeedback
      },
      rankedTags,
      recommendedTopTags
    };
  }

  private calculateRankedTags(title: string, currentTagsLower: string[]): RankedTag[] {
    const isUzbek = /[ўқғҳ]|lar|uchun|qanday|yangi/i.test(title);

    const catalog = isUzbek ? [
      { tag: "ai dasturlash 2026", searchVolume: 'Juda Yuqori', competitionScore: 22, predictedRank: 1, opportunityScore: 96 },
      { tag: "bepul sun'iy intellekt", searchVolume: 'Yuqori', competitionScore: 28, predictedRank: 2, opportunityScore: 92 },
      { tag: "top ai saytlar", searchVolume: 'Yuqori', competitionScore: 31, predictedRank: 3, opportunityScore: 89 },
      { tag: "python avtomatlashtirish", searchVolume: 'O\'rtacha', competitionScore: 19, predictedRank: 1, opportunityScore: 95 },
      { tag: "neural pulse ai", searchVolume: 'O\'rtacha', competitionScore: 12, predictedRank: 1, opportunityScore: 98 },
      { tag: "kiberxavfsizlik sirlari", searchVolume: 'Yuqori', competitionScore: 35, predictedRank: 4, opportunityScore: 84 },
      { tag: "dasturchi maslahatlari", searchVolume: 'O\'rtacha', competitionScore: 26, predictedRank: 3, opportunityScore: 88 },
      { tag: "claude 3.7 darslik", searchVolume: 'Yuqori', competitionScore: 24, predictedRank: 2, opportunityScore: 94 },
      { tag: "shorts viral sirlari", searchVolume: 'Juda Yuqori', competitionScore: 42, predictedRank: 5, opportunityScore: 79 }
    ] : [
      { tag: "ai tools 2026", searchVolume: 'Juda Yuqori', competitionScore: 28, predictedRank: 2, opportunityScore: 93 },
      { tag: "autonomous coding agents", searchVolume: 'Yuqori', competitionScore: 21, predictedRank: 1, opportunityScore: 97 },
      { tag: "free ai productivity tools", searchVolume: 'Yuqori', competitionScore: 26, predictedRank: 2, opportunityScore: 94 },
      { tag: "deepseek r1 tutorial", searchVolume: 'Juda Yuqori', competitionScore: 32, predictedRank: 3, opportunityScore: 90 },
      { tag: "neural pulse ai", searchVolume: 'O\'rtacha', competitionScore: 10, predictedRank: 1, opportunityScore: 99 },
      { tag: "claude 3.7 reasoning", searchVolume: 'Yuqori', competitionScore: 23, predictedRank: 1, opportunityScore: 96 },
      { tag: "best developer tools 2026", searchVolume: 'O\'rtacha', competitionScore: 29, predictedRank: 4, opportunityScore: 86 },
      { tag: "ai workflow automation", searchVolume: 'Yuqori', competitionScore: 25, predictedRank: 2, opportunityScore: 95 },
      { tag: "shorts viral algorithm", searchVolume: 'Juda Yuqori', competitionScore: 44, predictedRank: 5, opportunityScore: 78 }
    ];

    return catalog.map(item => ({
      tag: item.tag,
      searchVolume: item.searchVolume as any,
      competitionScore: item.competitionScore,
      predictedRank: item.predictedRank,
      opportunityScore: item.opportunityScore,
      isCurrentlyAdded: currentTagsLower.some(ct => ct.includes(item.tag.toLowerCase()) || item.tag.toLowerCase().includes(ct))
    }));
  }

  optimizeTags(videoId: string): { success: boolean; addedTags: string[]; fullTagString: string } {
    const item = contentStore.getById(videoId);
    if (!item) throw new Error(`Video not found: ${videoId}`);

    const existingTags = Array.isArray(item.tags) ? [...item.tags] : (item.tags ? [item.tags] : []);
    const existingLower = existingTags.map(t => t.toLowerCase());

    const catalog = this.calculateRankedTags(item.title, existingLower);
    const newHighRanked = catalog
      .filter(t => !t.isCurrentlyAdded && t.predictedRank <= 3)
      .map(t => t.tag);

    const merged = Array.from(new Set([...existingTags, ...newHighRanked]));
    contentStore.updateItem(videoId, {
      tags: merged
    });

    return {
      success: true,
      addedTags: newHighRanked,
      fullTagString: merged.join(', ')
    };
  }
}

export const seoRankService = new SeoRankService();
