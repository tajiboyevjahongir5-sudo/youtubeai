export interface VideoChapter {
  timestamp: string; // e.g. "00:00"
  seconds: number;
  title: string;
  tagline: string;
  googleSnippetKeyword: string;
  importance: 'hook' | 'key_value' | 'cta';
}

export interface SmartChapterReport {
  contentId: string;
  videoTitle: string;
  chapters: VideoChapter[];
  googleSearchSnippetPreview: {
    searchQuery: string;
    displayedBadge: string;
    snippetTitle: string;
    jumpLinkText: string;
  };
  formattedDescriptionSnippet: string;
}

export class SmartChapterSeoService {
  static generateChapters(contentId: string, title?: string, scenes?: any[]): SmartChapterReport {
    const cleanTitle = title || "Autonomous AI Coding in 2026";

    // Default chapters if scenes are short or long
    const chapters: VideoChapter[] = [
      {
        timestamp: "00:00",
        seconds: 0,
        title: "Introduction & 2026 AI Architecture Shift",
        tagline: "Nima uchun an'anaviy dasturlash o'zgarmoqda",
        googleSnippetKeyword: "AI software development shift 2026",
        importance: 'hook'
      },
      {
        timestamp: "00:48",
        seconds: 48,
        title: "Autonomous Multi-Agent Workflow Setup",
        tagline: "Cursor, Windsurf va Claude 3.7 sinxronizatsiyasi",
        googleSnippetKeyword: "autonomous agent coding setup",
        importance: 'key_value'
      },
      {
        timestamp: "02:15",
        seconds: 135,
        title: "Production-Grade Code Generation Demo",
        tagline: "Mikroservislarni real vaqtda generatsiya qilish",
        googleSnippetKeyword: "production grade AI code generation",
        importance: 'key_value'
      },
      {
        timestamp: "04:30",
        seconds: 270,
        title: "Automated Error Self-Healing Loop",
        tagline: "Kompilyatsiya xatolarini neyrotarmoq tomonidan tuzatish",
        googleSnippetKeyword: "AI self healing error debugging",
        importance: 'key_value'
      },
      {
        timestamp: "07:10",
        seconds: 430,
        title: "Deployment & Scaling to 100K Users",
        tagline: "Bulutli infratuzilmaga avtomat chiqarish",
        googleSnippetKeyword: "deploy autonomous software cloud",
        importance: 'key_value'
      },
      {
        timestamp: "09:40",
        seconds: 580,
        title: "Final Blueprint & Open Source Resources",
        tagline: "GitHub repozitoriy va keyingi qadamlar",
        googleSnippetKeyword: "neural pulse ai coding blueprint",
        importance: 'cta'
      }
    ];

    const formattedLines = chapters.map(c => `${c.timestamp} - ${c.title}`).join('\n');
    const formattedDescriptionSnippet = `⏳ CHAPTERS & KEY MOMENTS:\n${formattedLines}\n\n#neuralpulseai #keymoments #aicoding #googlefeatured`;

    return {
      contentId,
      videoTitle: cleanTitle,
      chapters,
      googleSearchSnippetPreview: {
        searchQuery: `how to build autonomous ai agents 2026`,
        displayedBadge: "Google Search: Key Moments In This Video",
        snippetTitle: `${cleanTitle} | Neural Pulse AI`,
        jumpLinkText: `Jump to 02:15: Production-Grade Code Generation Demo`
      },
      formattedDescriptionSnippet
    };
  }
}
