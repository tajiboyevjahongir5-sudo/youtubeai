/**
 * YouTube Community Tab Autopilot Service
 * Automatically creates viral community polls, teaser posts, and debate starters for planned videos.
 */

import { contentStore } from './content-store.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../env';

export interface CommunityPoll {
  id: string;
  type: 'poll' | 'teaser' | 'debate';
  question: string;
  options?: string[];
  timing: '2h_before_video' | 'at_publish' | '24h_after_followup';
  timingLabel: string;
  expectedEngagement: string;
  contentId?: string;
  status: 'ready' | 'scheduled' | 'posted';
}

export class CommunityAutopilotService {
  private genAI?: GoogleGenerativeAI;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
  }

  public async generatePostsForVideo(
    contentId: string,
    topicTitle: string
  ): Promise<CommunityPoll[]> {
    const cleanTopic = topicTitle.replace(/#\w+/g, '').trim();

    // Default high-engagement templates tailored to the topic
    const defaultPosts: CommunityPoll[] = [
      {
        id: `poll_${contentId}_pre`,
        type: 'poll',
        question: `Be honest: With autonomous AI tools advancing this fast in 2026, which engineering workflow do you think is becoming OBSOLETE first? 🔥`,
        options: [
          'Writing manual CRUD & boilerplate code',
          'Debugging unit tests & CI/CD pipelines',
          'Junior frontend / CSS alignment',
          'None — human devs will always write 100% of code'
        ],
        timing: '2h_before_video',
        timingLabel: '⏰ Video chiqishidan 2 soat oldin (Auditoriyani qizdirish)',
        expectedEngagement: '85% Ovoz berish ehtimoli (3-5x odatiy postdan yuqori)',
        contentId,
        status: 'ready'
      },
      {
        id: `post_${contentId}_teaser`,
        type: 'teaser',
        question: `🚨 URGENT: We just benchmarked the newest cognitive AI model against human Senior Architects. The result was so shocking our team had to rerun the tests 3 times.\n\nFull breakdown dropping in 2 hours. Subscribe and turn on notifications so you don't miss the 2026 blueprint! ⚡`,
        timing: '2h_before_video',
        timingLabel: '⚡ Teaser Post (FOMO & Qiziqish O\'ti)',
        expectedEngagement: 'Yuqori ulashish va bildirishnomani yoqish',
        contentId,
        status: 'ready'
      },
      {
        id: `post_${contentId}_post`,
        type: 'debate',
        question: `Our new breakdown on "${cleanTopic}" is LIVE! 🎬\n\nQuestion for the community: If you were given an autonomous multi-agent cluster today, what would be the very first application or SaaS you'd command it to build? Drop your ideas below 👇`,
        timing: 'at_publish',
        timingLabel: '💬 Video chiqqan paytda (Munozara va Izohlar portlashi)',
        expectedEngagement: '120+ Faol izohlar va fikr almashinuvi',
        contentId,
        status: 'ready'
      }
    ];

    // Optional Gemini enhancement if key is provided
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `Generate one viral YouTube Community Poll for this tech/AI topic: "${cleanTopic}".
Return valid JSON with format: {"question": "...", "options": ["option1", "option2", "option3", "option4"]}.
Make it provocative, debate-sparking, and engaging. Return ONLY JSON.`;

        const res = await model.generateContent(prompt);
        const text = res.response.text();
        const jsonMatch = text.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.question && Array.isArray(parsed.options)) {
            defaultPosts[0].question = parsed.question;
            defaultPosts[0].options = parsed.options.slice(0, 4);
          }
        }
      } catch (e) {
        // Use algorithmic templates
      }
    }

    return defaultPosts;
  }
}

export const communityAutopilotService = new CommunityAutopilotService();
