import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../env';
import { getWorkspaceSettings } from './workspace-settings.service';
import { youtubeService } from './youtube.service';

export interface CommunityPoll {
  id: string;
  question: string;
  context: string;
  options: string[];
  engagementGoal: string;
  predictedVotes: string;
  recommendedPostTime: string;
}

export interface CommentReplySuggestion {
  originalComment: string;
  replies: {
    type: 'insightful' | 'friendly_cta' | 'contrarian_debate';
    label: string;
    text: string;
  }[];
}

export interface PinnedCommentOption {
  id: string;
  archetype: 'debate' | 'micro_poll' | 'resource_drop' | 'controversial_hook';
  label: string;
  badge: string;
  commentText: string;
  expectedRetentionBoost: string;
  strategyRationale: string;
}

export class CommunityEngagementService {
  private genAI?: GoogleGenerativeAI;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
  }

  public async generateCommunityPolls(workspaceId: string, customTopic?: string): Promise<CommunityPoll[]> {
    const settings = getWorkspaceSettings(workspaceId);
    const niche = settings.niche || 'Artificial Intelligence & Software Engineering';

    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `You are a YouTube community engagement growth strategist.
For niche: "${niche}" ${customTopic ? `(Focus topic: ${customTopic})` : ''}, create 3 highly viral, controversial YouTube Community Polls designed to generate thousands of votes and heated debate in the comments.

Return strictly a JSON array:
[
  {
    "id": "poll_1",
    "question": "Which AI Coding Assistant will dominate 2026?",
    "context": "Devin and Cursor are both claiming 10x developer productivity, but who actually delivers for complex production repos?",
    "options": ["Cursor (AI IDE)", "Devin / Devin 2.0", "Claude 3.7 Code / Gemini", "Manual Coding is Still King"],
    "engagementGoal": "Trigger debates in comments & increase channel impressions",
    "predictedVotes": "15K - 40K votes",
    "recommendedPostTime": "17:00 Toshkent vaqti bilan"
  }
]`;
        const res = await model.generateContent(prompt);
        const text = res.response.text();
        const jsonStart = text.indexOf('[');
        const jsonEnd = text.lastIndexOf(']') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          return JSON.parse(text.slice(jsonStart, jsonEnd));
        }
      } catch (e) {
        console.warn('Community poll AI error, using presets:', e);
      }
    }

    return [
      {
        id: 'poll_dev_future',
        question: "Will Junior Developers still be hired in 2027 with Autonomous AI Agents?",
        context: "With Devin, Windsurf, and Claude Code writing end-to-end full-stack SaaS in minutes, how should beginners prepare?",
        options: [
          "Yes, but role shifts to System Architect",
          "No, junior roles will decrease by 80%",
          "Salaries will drop significantly",
          "AI creates more jobs than it destroys"
        ],
        engagementGoal: "Drive high comment volume and debate on channel",
        predictedVotes: "25K - 60K votes",
        recommendedPostTime: "Bugun, 18:00 (Peak Audience)"
      },
      {
        id: 'poll_best_stack',
        question: "What is the best tech stack for building Autonomous AI Micro-SaaS in 2026?",
        context: "Solo founders are shipping 2-3 profitable apps per month using AI pipelines.",
        options: [
          "Next.js + TypeScript + Supabase",
          "Python FastAPI + React + PostgreSQL",
          "Flutter + Go + SQLite",
          "Full No-Code / Cursor Prompts Only"
        ],
        engagementGoal: "Auditoriya fikrini bilish va keyingi video mavzusini tanlash",
        predictedVotes: "18K - 35K votes",
        recommendedPostTime: "Ertaga, 14:00"
      },
      {
        id: 'poll_model_preference',
        question: "Which LLM writes the cleanest, zero-bug production code right now?",
        context: "Benchmarks vs real-world developer experience often differ wildly.",
        options: [
          "Claude 3.7 Sonnet (Hybrid Reasoning)",
          "DeepSeek R1 / V3",
          "OpenAI o3-mini / GPT-4o",
          "Google Gemini 2.0 Flash / Pro"
        ],
        engagementGoal: "Xalqaro dasturchilar hamjamiyatini jalb qilish",
        predictedVotes: "30K - 80K votes",
        recommendedPostTime: "Bugun, 21:00 (US Peak)"
      }
    ];
  }

  public async generateCommentReplies(workspaceId: string, videoTitle: string, commentText: string): Promise<CommentReplySuggestion> {
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `You are a viral YouTube channel host responding to a viewer's comment.
Video: "${videoTitle}"
Viewer Comment: "${commentText}"

Generate 3 distinct, high-engagement replies in natural English:
1. Insightful / Thought-Leader (Adds technical value)
2. Friendly / Community CTA (Appreciates comment and asks follow-up question)
3. Friendly Contrarian / Debate (Sparks further replies to boost YouTube algorithm)

Return strictly JSON format:
{
  "originalComment": "${commentText}",
  "replies": [
    { "type": "insightful", "label": "Texnik & Nufuzli", "text": "..." },
    { "type": "friendly_cta", "label": "Samimiy & Savol berish", "text": "..." },
    { "type": "contrarian_debate", "label": "Munozarani kuchaytirish", "text": "..." }
  ]
}`;
        const res = await model.generateContent(prompt);
        const text = res.response.text();
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          return JSON.parse(text.slice(jsonStart, jsonEnd));
        }
      } catch (e) {
        console.warn('Comment reply AI error:', e);
      }
    }

    return {
      originalComment: commentText,
      replies: [
        {
          type: 'insightful',
          label: 'Texnik & Nufuzli',
          text: "Spot on! That's exactly why we emphasize autonomous pipelines over simple chat bots. Once you wire the memory feedback loop, execution speed jumps 5x."
        },
        {
          type: 'friendly_cta',
          label: 'Samimiy & Savol berish',
          text: "Thanks for watching! Which feature or tool are you planning to integrate into your workflow first? Would love to cover it in our next breakdown!"
        },
        {
          type: 'contrarian_debate',
          label: 'Munozarani kuchaytirish',
          text: "Interesting perspective! But what happens when agent autonomy reaches 95% test pass rates? Do you think manual review will still be viable?"
        }
      ]
    };
  }

  public async generatePinnedComments(workspaceId: string, videoTitle: string, transcriptSummary?: string): Promise<PinnedCommentOption[]> {
    const cleanTitle = (videoTitle || 'AI Video').replace(/#\w+/g, '').trim();

    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `You are a viral YouTube Shorts growth strategist.
For this video: "${cleanTitle}", generate 4 high-converting Pinned Comment strategies designed to trigger replies and keep viewers retention over 100%:
1. Debate (sparks friendly controversy/choice)
2. Micro Poll (numbered options 1, 2, 3)
3. Resource Drop (free blueprint/tools link in bio)
4. Controversial Hook (unpopular opinion / future forecast)

Return strictly a JSON array of 4 items with structure:
[
  {
    "id": "pinned_debate",
    "archetype": "debate",
    "label": "🥊 Munozara & Tanlov",
    "badge": "Eng Yuqori Izohlar",
    "commentText": "...",
    "expectedRetentionBoost": "+35% Izohlar Faolligi",
    "strategyRationale": "Tomoshabinlarni 2 ta vositadan birini tanlashga undaydi."
  },
  ...
]`;
        const res = await model.generateContent(prompt);
        const text = res.response.text();
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']') + 1;
        if (start !== -1 && end > start) {
          const parsed = JSON.parse(text.slice(start, end));
          if (Array.isArray(parsed) && parsed.length >= 3) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Pinned comment AI error, using algorithmic defaults:', e);
      }
    }

    return [
      {
        id: 'pinned_debate',
        archetype: 'debate',
        label: '🥊 Munozara & Aniq Tanlov',
        badge: 'Eng Ko\'p Izoh Keltiruvchi',
        commentText: `Be honest: If you were forced to build your next production project with ONLY ONE AI tool from this video, which one are you betting your career on? 1 or 2? Drop your verdict below 👇`,
        expectedRetentionBoost: '+38% Izohlar Konversiyasi',
        strategyRationale: 'Ikkita vosita o\'rtasida aniq tanlov qo\'yish tomoshabinda o\'z fikrini bildirish istagini 3x oshiradi.'
      },
      {
        id: 'pinned_micro_poll',
        archetype: 'micro_poll',
        label: '📊 Tezkor Micro-Poll (1, 2, 3)',
        badge: 'Tezkor Ovoz Berish',
        commentText: `Quick community poll:\n[1] = Already using autonomous AI agents daily\n[2] = Still experimenting / evaluating safety\n[3] = Writing 100% of code manually\n\nVote with 1, 2, or 3 below! Curious where our community stands 🔥`,
        expectedRetentionBoost: '+52% Tezkor Reaksiya',
        strategyRationale: 'Raqamlar bilan javob berish juda oson, bu YouTube algoritmiga video juda qizg\'in muhokama qilinayotganini ko\'rsatadi.'
      },
      {
        id: 'pinned_resource_drop',
        archetype: 'resource_drop',
        label: '🎁 Bepul Resurs & Blueprint Drop',
        badge: 'Yuqori Sodiqlik (Loyalty)',
        commentText: `⚡ Barcha promptlar, arxitektura diagrammalari va havola kanalimiz tavsifida berildi!\n\nKeyingi videoda qaysi AI agentini 0 dan oxirigacha jonli qurib ko'rsataylik? Eng ko'p layk to'plagan taklifni chiqaramiz! 👇`,
        expectedRetentionBoost: '+44% Qayta Ko\'rish & Obuna',
        strategyRationale: 'Keyingi kontent mavzusini auditoriyaga topshirish ularni kanalga bog\'laydi.'
      },
      {
        id: 'pinned_controversial_hook',
        archetype: 'controversial_hook',
        label: '⚡ Provokatsion Bahs (Retention Magnet)',
        badge: 'Maksimal Tomosha Vaqti',
        commentText: `Unpopular opinion: Within 18 months, developers who refuse to adopt autonomous agents won't be replaced by AI — they'll be replaced by 1 engineer commanding 10 agents.\n\nAgree or Disagree? Defend your position below 👇`,
        expectedRetentionBoost: '+60% Tomosha Vaqti (Watch Time)',
        strategyRationale: 'Tomoshabinlar izoh yozish yoki boshqalarning bahsini o\'qish paytida video fonda qayta aylanib tomosha vaqtini 140% ga yetkazadi.'
      }
    ];
  }

  public async publishPinnedComment(workspaceId: string, videoId: string, commentText: string): Promise<{ success: boolean; commentId?: string; error?: string }> {
    if (!videoId) {
      return { success: false, error: 'YouTube Video ID mavjud emas. Video avval YouTube\'ga yuklangan bo\'lishi kerak.' };
    }
    if (!commentText || !commentText.trim()) {
      return { success: false, error: 'Izoh matni bo\'sh bo\'lishi mumkin emas.' };
    }

    return await youtubeService.postComment(workspaceId, videoId, commentText);
  }
}

export const communityEngagementService = new CommunityEngagementService();
