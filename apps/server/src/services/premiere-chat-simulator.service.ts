export interface PremiereChatMessage {
  id: string;
  senderName: string;
  senderAvatarColor: string;
  timeOffset: string; // e.g. "00:15", "02:40"
  messageText: string;
  badge?: 'member' | 'moderator' | 'creator';
  isSuperChat?: boolean;
  superChatAmount?: string;
  superChatColor?: string;
}

export interface PremiereLiveChatPackage {
  contentId: string;
  totalSimulatedMessages: number;
  totalSuperChatVolume: string;
  chatVelocity: string;
  messages: PremiereChatMessage[];
}

export class PremiereChatSimulatorService {
  public generateLiveChatStream(contentId: string): PremiereLiveChatPackage {
    const messages: PremiereChatMessage[] = [
      {
        id: "chat_1",
        senderName: "Neural Pulse AI",
        senderAvatarColor: "from-amber-500 to-yellow-600",
        timeOffset: "00:02",
        messageText: "Premyeraga xush kelibsiz! Savollaringiz bo'lsa chatda yozib qoldiring, jonli efirda javob beramiz! 🚀",
        badge: "creator"
      },
      {
        id: "chat_2",
        senderName: "David Miller (San Francisco)",
        senderAvatarColor: "from-blue-500 to-cyan-500",
        timeOffset: "00:18",
        messageText: "Been waiting for this deep dive! Finally someone talking about self-healing loops.",
        badge: "member"
      },
      {
        id: "chat_3",
        senderName: "Sardor Developer",
        senderAvatarColor: "from-emerald-500 to-teal-500",
        timeOffset: "00:45",
        messageText: "Alex aka salom! Docker sandbox fayllarini GitHub'dan olsak bo'ladimi?",
      },
      {
        id: "chat_4",
        senderName: "Elena Rostova (Berlin)",
        senderAvatarColor: "from-purple-500 to-pink-500",
        timeOffset: "01:15",
        messageText: "The 4-act structure in tech videos is brilliant. Audio quality is next level!",
        badge: "member"
      },
      {
        id: "chat_5",
        senderName: "Kevin Zhang",
        senderAvatarColor: "from-yellow-400 to-amber-500",
        timeOffset: "02:10",
        messageText: "Keep up the phenomenal production! Super excited for the orchestration code.",
        isSuperChat: true,
        superChatAmount: "$20.00",
        superChatColor: "bg-amber-500"
      },
      {
        id: "chat_6",
        senderName: "Marcus Vance",
        senderAvatarColor: "from-red-500 to-orange-500",
        timeOffset: "03:50",
        messageText: "Wait, try-catch sending memory dump to DeepSeek R1? That's insane!",
      },
      {
        id: "chat_7",
        senderName: "AI Moderator",
        senderAvatarColor: "from-cyan-500 to-blue-600",
        timeOffset: "04:30",
        messageText: "📌 Barcha manba kodlari va GitHub repozitoriy tavsifdagi linkda joylashgan!",
        badge: "moderator"
      },
      {
        id: "chat_8",
        senderName: "Sarah Connor",
        senderAvatarColor: "from-green-500 to-emerald-600",
        timeOffset: "07:25",
        messageText: "OMG that production crash visualization gave me flashbacks from last Monday 😅",
      },
      {
        id: "chat_9",
        senderName: "Liam O'Connor (Dublin)",
        senderAvatarColor: "from-pink-500 to-rose-600",
        timeOffset: "08:45",
        messageText: "Self-healing worked in 1.2s?! Insane engineering. Best channel on YouTube.",
        isSuperChat: true,
        superChatAmount: "$50.00",
        superChatColor: "bg-red-600"
      },
      {
        id: "chat_10",
        senderName: "Neural Pulse AI",
        senderAvatarColor: "from-amber-500 to-yellow-600",
        timeOffset: "11:45",
        messageText: "Hammaga katta rahmat! Keyingi videoda Kubernetes masshtablashni ko'ramiz. Obuna bo'ling! 🔔",
        badge: "creator"
      }
    ];

    return {
      contentId,
      totalSimulatedMessages: messages.length,
      totalSuperChatVolume: "$70.00 (Jonli Premyera Homiyligi)",
      chatVelocity: "45 xabar / daqiqa (Yuqori Algoritmik Qiziqish)",
      messages
    };
  }
}

export const premiereChatSimulatorService = new PremiereChatSimulatorService();
