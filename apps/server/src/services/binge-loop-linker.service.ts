export interface RelatedVideoRecommendation {
  id: string;
  title: string;
  videoFormat: 'long_form_16_9' | 'shorts_part_2';
  durationText: string;
  expectedSessionTimeBoost: string;
  matchScore: number; // 0 - 100
}

export interface BingeLoopProject {
  contentId: string;
  shortTitle: string;
  seamlessLoopHookScript: string;
  verbalRelatedCta: string;
  recommendedRelatedVideos: RelatedVideoRecommendation[];
  youtubeStudioCopySnippet: string;
}

export class BingeLoopLinkerService {
  static getBingeLoopPlan(contentId: string, title: string): BingeLoopProject {
    const cleanTitle = title || "Autonomous AI Architecture";

    return {
      contentId,
      shortTitle: cleanTitle,
      seamlessLoopHookScript: "And the craziest part about this entire system is that... (-> darhol 00:00 dagi birinchi so'zga ulanadi, cheksiz tomosha ilmog'i hosil bo'ladi)",
      verbalRelatedCta: "Want to deploy this entire architecture in production? Tap the related video linked right below for the full 12-minute blueprint! 👇",
      recommendedRelatedVideos: [
        {
          id: 'long_doc_1',
          title: "Autonomous Coding in 2026: The Complete 16:9 Documentary Blueprint",
          videoFormat: 'long_form_16_9',
          durationText: '11:42 daqiqa',
          expectedSessionTimeBoost: '+84% Kanalda Qolish Vaqti',
          matchScore: 99
        },
        {
          id: 'part_2_series',
          title: "Part 2: Setting up Multi-Agent Swarms with Cursor & Windsurf",
          videoFormat: 'shorts_part_2',
          durationText: '0:58 soniya',
          expectedSessionTimeBoost: '+65% Keyingi Qismga O\'tish',
          matchScore: 94
        }
      ],
      youtubeStudioCopySnippet: `📺 Watch Full 16:9 Masterclass & Get Code: [Tegishli Katta Video Havolasi]\n\n#neuralpulseai #shorts #aiagents`
    };
  }
}
