export interface DebateLine {
  id: string;
  speakerId: 'host_alex' | 'host_critic';
  speakerName: string;
  voiceModel: string;
  roleDescription: string;
  emotion: 'confident_optimist' | 'skeptical_challenging' | 'shocked' | 'convinced';
  text: string;
  durationSec: number;
}

export interface DualHostDebateProject {
  topic: string;
  format: 'shorts_fast_debate' | 'long_podcast_deepdive';
  estimatedDurationSec: number;
  expectedRetentionBoost: string; // e.g. "+38% APV"
  host1: {
    id: string;
    name: string;
    archetype: string;
    voiceModel: string;
    avatar: string;
  };
  host2: {
    id: string;
    name: string;
    archetype: string;
    voiceModel: string;
    avatar: string;
  };
  dialogue: DebateLine[];
  fullCombinedScript: string;
}

export class DualHostDebateService {
  static generateDebate(
    topic: string,
    language: 'uz' | 'en' = 'uz',
    criticGender: 'female' | 'male' = 'female'
  ): DualHostDebateProject {
    const isUz = language === 'uz';

    const host1Voice = isUz ? 'uz-UZ-SardorNeural' : 'en-US-ChristopherNeural';
    const host2Voice = isUz
      ? (criticGender === 'female' ? 'uz-UZ-MadinaNeural' : 'uz-UZ-SardorNeural')
      : (criticGender === 'female' ? 'en-US-JennyNeural' : 'en-US-GuyNeural');

    const host1Name = "Alex (AI Visionary)";
    const host2Name = criticGender === 'female' ? "Madina (Senior Architect)" : "Sardor (Senior Architect)";

    let dialogue: DebateLine[] = [];

    if (isUz) {
      dialogue = [
        {
          id: 'd1',
          speakerId: 'host_alex',
          speakerName: host1Name,
          voiceModel: host1Voice,
          roleDescription: "Texnologiya optimisti",
          emotion: 'confident_optimist',
          text: `Eshitdingizmi? 2026-yilga kelib kichik dasturchilar guruhiga umuman hojat qolmaydi — barcha kodni avtonom AI agentlar yozadi!`,
          durationSec: 6.5
        },
        {
          id: 'd2',
          speakerId: 'host_critic',
          speakerName: host2Name,
          voiceModel: host2Voice,
          roleDescription: "Skeptik muhandis",
          emotion: 'skeptical_challenging',
          text: `Kuting, Alex! Marketing gaplarini bir chetga suraylik. Qaysi korxona o'zining million dollarlik ma'lumotlar bazasini gallyutsinatsiya qiluvchi botga ishonib topshiradi?`,
          durationSec: 7.2
        },
        {
          id: 'd3',
          speakerId: 'host_alex',
          speakerName: host1Name,
          voiceModel: host1Voice,
          roleDescription: "Texnologiya optimisti",
          emotion: 'confident_optimist',
          text: `Gap oddiy bot haqida ketmayapti! Yangi gibrid mulohaza tarmoqlari o'z kodini o'zi unit-testdan o'tkazadi va xatoni real vaqtda tuzatadi. Mana, faktlarga qarang!`,
          durationSec: 8.0
        },
        {
          id: 'd4',
          speakerId: 'host_critic',
          speakerName: host2Name,
          voiceModel: host2Voice,
          roleDescription: "Skeptik muhandis",
          emotion: 'shocked',
          text: `Buni inkor qilib bo'lmaydi... Lekin arxitektura va xavfsizlikni kim nazorat qiladi? Dasturchi baribir boshqaruvchi sifatida qoladi!`,
          durationSec: 6.8
        },
        {
          id: 'd5',
          speakerId: 'host_alex',
          speakerName: host1Name,
          voiceModel: host1Voice,
          roleDescription: "Texnologiya optimisti",
          emotion: 'convinced',
          text: `Aynan shunday! AI dasturchini yo'qotmaydi, balki 1 ta dasturchini butun boshli IT kompaniyaga aylantiradi. Siz qaysi tomondasiz? Izohlarda yozib qoldiring!`,
          durationSec: 8.5
        }
      ];
    } else {
      dialogue = [
        {
          id: 'd1',
          speakerId: 'host_alex',
          speakerName: host1Name,
          voiceModel: host1Voice,
          roleDescription: "Tech Optimist",
          emotion: 'confident_optimist',
          text: `Mark my words: by the end of 2026, traditional software development teams will be replaced by autonomous agent swarms!`,
          durationSec: 6.0
        },
        {
          id: 'd2',
          speakerId: 'host_critic',
          speakerName: host2Name,
          voiceModel: host2Voice,
          roleDescription: "Skeptic Architect",
          emotion: 'skeptical_challenging',
          text: `Hold on, Alex! Let's cut the marketing hype. No enterprise is going to hand over their multi-million dollar backend to an LLM prone to hallucinations!`,
          durationSec: 7.0
        },
        {
          id: 'd3',
          speakerId: 'host_alex',
          speakerName: host1Name,
          voiceModel: host1Voice,
          roleDescription: "Tech Optimist",
          emotion: 'confident_optimist',
          text: `These aren't chatbots anymore. Hybrid reasoning models write their own unit tests and patch zero-day vulnerabilities in under four seconds!`,
          durationSec: 7.5
        },
        {
          id: 'd4',
          speakerId: 'host_critic',
          speakerName: host2Name,
          voiceModel: host2Voice,
          roleDescription: "Skeptic Architect",
          emotion: 'shocked',
          text: `Fair point on the automated tests... But system architecture and security still require a human in the loop!`,
          durationSec: 6.5
        },
        {
          id: 'd5',
          speakerId: 'host_alex',
          speakerName: host1Name,
          voiceModel: host1Voice,
          roleDescription: "Tech Optimist",
          emotion: 'convinced',
          text: `Exactly! AI won't replace engineers, it turns a single engineer into an entire tech startup. Which side are you on? Drop your take below!`,
          durationSec: 8.0
        }
      ];
    }

    const fullCombinedScript = dialogue.map(d => `${d.speakerName}: "${d.text}"`).join('\n\n');

    return {
      topic,
      format: 'shorts_fast_debate',
      estimatedDurationSec: Math.round(dialogue.reduce((acc, d) => acc + d.durationSec, 0)),
      expectedRetentionBoost: '+38% APV (Audience Retention)',
      host1: {
        id: 'host_alex',
        name: host1Name,
        archetype: "Kiber-Optimist & Visioner",
        voiceModel: host1Voice,
        avatar: '👨‍💼'
      },
      host2: {
        id: 'host_critic',
        name: host2Name,
        archetype: "Skeptik Tizim Arxitektori",
        voiceModel: host2Voice,
        avatar: criticGender === 'female' ? '👩‍💻' : '👨‍💻'
      },
      dialogue,
      fullCombinedScript
    };
  }
}
