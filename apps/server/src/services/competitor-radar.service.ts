export interface CompetitorChannel {
  id: string;
  name: string;
  avatar: string;
  subscribers: string;
  averageVelocityPerHour: string;
  status: 'active' | 'outlier_detected';
}

export interface CompetitorOutlier {
  id: string;
  channelName: string;
  channelAvatar: string;
  videoTitle: string;
  publishedHoursAgo: number;
  viewsTotal: string;
  velocityPerHour: string;
  outlierMultiplier: string; // e.g. "4.8x"
  category: string;
  counterAttackIdea: {
    recommendedTitle: string;
    hookAngle: string;
    patternInterruptHook: string;
    whyWeWillWin: string;
    suggestedTags: string[];
  };
}

export class CompetitorRadarService {
  static getMonitoredChannels(): CompetitorChannel[] {
    return [
      {
        id: 'c_fireship',
        name: 'Fireship',
        avatar: '🔥',
        subscribers: '3.4M',
        averageVelocityPerHour: '12,500/soat',
        status: 'outlier_detected'
      },
      {
        id: 'c_mberman',
        name: 'Matthew Berman',
        avatar: '🧠',
        subscribers: '840K',
        averageVelocityPerHour: '4,200/soat',
        status: 'outlier_detected'
      },
      {
        id: 'c_aiexplained',
        name: 'AI Explained',
        avatar: '⚡',
        subscribers: '450K',
        averageVelocityPerHour: '3,800/soat',
        status: 'active'
      },
      {
        id: 'c_nchuck',
        name: 'NetworkChuck',
        avatar: '☕',
        subscribers: '4.1M',
        averageVelocityPerHour: '14,000/soat',
        status: 'active'
      }
    ];
  }

  static getViralOutliers(): CompetitorOutlier[] {
    return [
      {
        id: 'outlier_1',
        channelName: 'Fireship',
        channelAvatar: '🔥',
        videoTitle: "The AI agent that replaced 50 senior engineers in 24 hours",
        publishedHoursAgo: 7,
        viewsTotal: '380,000 ko\'rish',
        velocityPerHour: '54,200 ko\'rish/soat',
        outlierMultiplier: '4.3x Oddiydan Yuqori',
        category: 'Autonomous Agents',
        counterAttackIdea: {
          recommendedTitle: "! TEZOR & ANIQ ! Ular Ayta Olmagan 3 Ta AI Agent Sirlari (2026)",
          hookAngle: "Raqobatchi mavzuni umumiy yoritgan, biz esa aniq ochiq kodli arxitekturani va 1-klikda ishga tushirishni ko'rsatamiz.",
          patternInterruptHook: "Fireship bu agent haqida gapirdi, lekin hech kim sizga uning eng xavfli 3 ta zaif tomonini aytmadi! Mana kod...",
          whyWeWillWin: "Bizning video 60FPS dinamik kiber-grafika va darhol nusxalab ishlatish mumkin bo'lgan GitHub blueprint bilan chiqadi.",
          suggestedTags: ['aiagents', 'autonomousai', 'fireship', 'softwareengineer', 'shorts', 'neuralpulseai']
        }
      },
      {
        id: 'outlier_2',
        channelName: 'Matthew Berman',
        channelAvatar: '🧠',
        videoTitle: "Claude 3.7 Sonnet is ACTUALLY Thinking Now... Hands-on Test",
        publishedHoursAgo: 14,
        viewsTotal: '195,000 ko\'rish',
        velocityPerHour: '13,900 ko\'rish/soat',
        outlierMultiplier: '3.6x Oddiydan Yuqori',
        category: 'LLM Reasoning',
        counterAttackIdea: {
          recommendedTitle: "Stop Using Claude 3.7 Like ChatGPT: 5 Hybrid Reasoning Hacks",
          hookAngle: "Oddiy test o'rniga ishlab chiquvchilar uchun real vaqtda kod yozuvchi 5 ta professional prompt texnikasi.",
          patternInterruptHook: "99% odam Claude 3.7 ning yangi 'Hybrid Reasoning' tugmasidan noto'g'ri foydalanmoqda. Mana uni 3 barobar tezlashtiruvchi sozlama!",
          whyWeWillWin: "Tomoshabin faqat yangilik eshitmaydi, balki darhol o'z loyihasida qo'llay oladigan amaliy natijaga ega bo'ladi.",
          suggestedTags: ['claude37', 'anthropic', 'promptengineering', 'codingagent', 'techtrends']
        }
      }
    ];
  }
}
