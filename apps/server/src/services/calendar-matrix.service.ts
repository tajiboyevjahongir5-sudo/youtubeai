/**
 * 30-Day Content Calendar Matrix & Auto-Fill Autopilot Service
 * Generates an automated 30-day publishing matrix (Shorts + Long-form) synchronized to US peak hours.
 */

import { contentStore, ContentItemRecord } from './content-store.service';
import { v4 as uuidv4 } from 'uuid';

export interface CalendarHeatmapSlot {
  day: string; // 'Mon', 'Tue', etc.
  hour: number; // 0-23
  utcHour: number;
  engagementScore: number; // 0-100 (100 = peak viral traffic)
  isPeak: boolean;
  recommendedFormat: 'shorts' | 'long_form' | 'none';
}

export interface AutoFillSummary {
  totalShortsCreated: number;
  totalLongformCreated: number;
  startDate: string;
  endDate: string;
  itemsCreated: ContentItemRecord[];
}

const TOPIC_TEMPLATES = [
  { title: "Top 5 Secret AI Websites That Feel Illegal to Know in 2026", pillar: "educational" as const, format: "shorts" as const },
  { title: "Devin 2.0 vs Claude 3.7: Which One Replaces Developers?", pillar: "educational" as const, format: "shorts" as const },
  { title: "Stop Coding Manually: The 60-Second Multi-Agent Workflow", pillar: "educational" as const, format: "shorts" as const },
  { title: "The Dark Truth About AI Coding Assistants in 2026", pillar: "entertaining" as const, format: "shorts" as const },
  { title: "How 10x Engineers Build Entire SaaS Apps in 1 Hour", pillar: "educational" as const, format: "shorts" as const },
  { title: "Why Senior Software Engineers Are Terrified of DeepSeek R1", pillar: "entertaining" as const, format: "shorts" as const },
  { title: "3 Free AI Tools That Actually Make You Money While Sleeping", pillar: "promotional" as const, format: "shorts" as const },
  { title: "The $100 Billion AI Datacenter Leaked: What It Means for You", pillar: "entertaining" as const, format: "shorts" as const },
  { title: "Automating Your Entire Life with Local Python LLM Agents", pillar: "educational" as const, format: "shorts" as const },
  { title: "The Death of Traditional Web Development: 2026 Reality Check", pillar: "entertaining" as const, format: "shorts" as const },
  { title: "Building a Full-Stack SaaS with Autonomous Agents: Complete Masterclass", pillar: "educational" as const, format: "long_form" as const },
  { title: "The Complete 2026 AI Architecture Deep Dive: From Zero to Production", pillar: "educational" as const, format: "long_form" as const }
];

export class CalendarMatrixService {
  /**
   * Generates a 7x24 engagement heatmap for viewer traffic
   */
  public getTrafficHeatmap(): CalendarHeatmapSlot[] {
    const days = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
    const slots: CalendarHeatmapSlot[] = [];

    days.forEach((day, dIdx) => {
      for (let h = 0; h < 24; h++) {
        // Peak hours are usually 14:00 UTC (9:00 AM EST) and 20:00 UTC (3:00 PM EST)
        let score = 20;
        if (h >= 13 && h <= 15) score = 92; // Morning US peak
        else if (h >= 19 && h <= 21) score = 98; // Evening US peak
        else if (h >= 16 && h <= 18) score = 75; // Afternoon steady
        else if (h >= 8 && h <= 12) score = 60; // European prime
        else score = 15; // Low night traffic

        // Weekend boost
        if (dIdx >= 4) score = Math.min(100, score + 6);

        const isPeak = score >= 85;
        let recFormat: 'shorts' | 'long_form' | 'none' = 'none';
        if (isPeak) {
          recFormat = (h === 20 && (dIdx === 2 || dIdx === 6)) ? 'long_form' : 'shorts';
        }

        slots.push({
          day,
          hour: h,
          utcHour: h,
          engagementScore: score,
          isPeak,
          recommendedFormat: recFormat
        });
      }
    });

    return slots;
  }

  /**
   * Auto-fills 30 days of scheduled videos into contentStore
   */
  public autoFill30Days(workspaceId: string): AutoFillSummary {
    const createdItems: ContentItemRecord[] = [];
    const now = new Date();
    let shortsCount = 0;
    let longCount = 0;

    for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
      const targetDate1 = new Date(now);
      targetDate1.setDate(now.getDate() + dayOffset);
      targetDate1.setUTCHours(14, 0, 0, 0); // 14:00 UTC

      const targetDate2 = new Date(now);
      targetDate2.setDate(now.getDate() + dayOffset);
      targetDate2.setUTCHours(20, 0, 0, 0); // 20:00 UTC

      // Pick procedural topic 1 (Shorts)
      const t1 = TOPIC_TEMPLATES[(dayOffset * 2) % TOPIC_TEMPLATES.length];
      const item1 = this.createScheduledItem(workspaceId, t1, targetDate1.toISOString(), dayOffset, 1);
      createdItems.push(item1);
      shortsCount++;

      // Pick procedural topic 2 (Wednesdays & Sundays are Long-form, others Shorts)
      const dayOfWeek = targetDate2.getUTCDay(); // 0 is Sun, 3 is Wed
      const isLongDay = dayOfWeek === 0 || dayOfWeek === 3;
      
      const t2 = isLongDay 
        ? TOPIC_TEMPLATES[10 + (dayOffset % 2)] 
        : TOPIC_TEMPLATES[(dayOffset * 2 + 1) % TOPIC_TEMPLATES.length];

      const item2 = this.createScheduledItem(workspaceId, t2, targetDate2.toISOString(), dayOffset, 2);
      createdItems.push(item2);
      if (isLongDay) longCount++;
      else shortsCount++;
    }

    const startDate = new Date(now.getTime() + 86400000).toLocaleDateString('uz-UZ');
    const endDate = new Date(now.getTime() + 30 * 86400000).toLocaleDateString('uz-UZ');

    console.log(`📅 [CalendarMatrix] 30 kunlik avtopilot to'ldirildi: ${shortsCount} Shorts, ${longCount} Long-form (${createdItems.length} jami)`);

    return {
      totalShortsCreated: shortsCount,
      totalLongformCreated: longCount,
      startDate,
      endDate,
      itemsCreated: createdItems
    };
  }

  private createScheduledItem(
    workspaceId: string,
    tmpl: typeof TOPIC_TEMPLATES[0],
    scheduledIso: string,
    dayNum: number,
    slotNum: number
  ): ContentItemRecord {
    const isLong = tmpl.format === 'long_form';
    const id = `item_cal_${Date.now()}_d${dayNum}_s${slotNum}`;
    const fullTitle = `${tmpl.title} ${isLong ? '' : '#Shorts'}`.trim();

    const item: ContentItemRecord = {
      id,
      workspaceId,
      title: fullTitle,
      status: 'scheduled',
      videoFormat: tmpl.format,
      contentPillar: tmpl.pillar,
      duration: isLong ? '10:15' : '0:55',
      durationSeconds: isLong ? 615 : 55,
      brief: `30 kunlik avtopilot taqvimi bo'yicha rejalashtirilgan ${isLong ? '16:9 Long-form masterclass' : '9:16 Shorts'}.`,
      targetAudience: 'Tier-1 High CPM (AQSH, Buyuk Britaniya, Kanada)',
      script: `[SCENE 1: HOOK]\nHost: "Here is why ${fullTitle} is dominating the 2026 tech landscape..."`,
      scenes: [
        { id: 'sc_1', title: 'Viral Pattern Interrupt', time: 0, tag: 'HOOK' },
        { id: 'sc_2', title: 'Core Insight & Demonstration', time: isLong ? 60 : 15, tag: 'CONTENT' },
        { id: 'sc_3', title: 'Community Outro & CTA', time: isLong ? 550 : 45, tag: 'CTA' }
      ],
      description: `${fullTitle}\n\nAutomated high-retention release by Neural Pulse AI.\n\nSubscribe for daily updates!\n#AI #Coding #Tech`,
      tags: ['ai', 'tech', 'coding', 'automation', '2026', tmpl.format],
      seoScore: 92,
      scheduledAt: scheduledIso,
      pinnedComment: `Which tool will you test first? Drop your thoughts below! 🔥`,
      createdAt: new Date().toISOString()
    };

    contentStore.setItem(item);
    return item;
  }
}

export const calendarMatrixService = new CalendarMatrixService();
