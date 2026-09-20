import fs from 'fs';
import path from 'path';

export interface CommentItem {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  commentText: string;
  publishedAt: string;
  likeCount: number;
  sentiment: 'positive' | 'question' | 'debate' | 'critic';
  aiSuggestedReply: string;
  status: 'pending' | 'replied';
  replyPublishedAt?: string;
}

export type ReplyTone = 'creator_friendly' | 'mentor' | 'tech_pro' | 'punchy';

export const SAMPLE_COMMENTS: CommentItem[] = [
  {
    id: 'c_1',
    authorName: 'Sardorbek Dev',
    commentText: "AutoFlow 2.0 bepulmi yoki obuna talab qiladimi? O'zbekistonda kartalar o'tadimi?",
    publishedAt: '12 daqiqa oldin',
    likeCount: 14,
    sentiment: 'question',
    aiSuggestedReply: "Salom Sardorbek! AutoFlow 2.0 da bepul tier mavjud (oyiga 50 ta avtonom task). O'zbekiston kartalari ham to'liq qo'llab-quvvatlanadi. Pinned izohdagi havola orqali bepul sinab ko'rishingiz mumkin! 🚀",
    status: 'pending'
  },
  {
    id: 'c_2',
    authorName: 'Alex Tech Enthusiast',
    commentText: "Cursor vs Windsurf — which one has better autonomous terminal execution in your experience?",
    publishedAt: '45 daqiqa oldin',
    likeCount: 28,
    sentiment: 'debate',
    aiSuggestedReply: "Great question! Windsurf Cascade has faster context indexing, but Cursor's agent mode with Claude 3.7 gives deeper multi-file refactors. Which one is your daily driver right now?",
    status: 'pending'
  },
  {
    id: 'c_3',
    authorName: 'Nigora Usmanova',
    commentText: "Alex, kontent sifati juda oshibdi! 60FPS B-roll va animatsiyalar daxshat chiqibdi, obuna bo'ldim 🔥",
    publishedAt: '1 soat oldin',
    likeCount: 9,
    sentiment: 'positive',
    aiSuggestedReply: "Rahmat Nigora! Kanalimizga xush kelibsiz! Har kuni 2026-yilning eng yangi AI vositalarini birinchi bo'lib yoritamiz. Qo'ng'iroqchani yoqib qo'yishni unutmang! ❤️",
    status: 'pending'
  },
  {
    id: 'c_4',
    authorName: 'Dmitry Coding',
    commentText: "Неужели ручной кодинг реально исчезнет к 2027 году? Звучит слишком радикально.",
    publishedAt: '2 soat oldin',
    likeCount: 31,
    sentiment: 'debate',
    aiSuggestedReply: "Привет Дмитрий! Ручной синтаксис исчезает, но системная архитектура и логика становятся важнее, чем когда-либо. Программист 2026 года — это дирижёр ИИ-агентов. А как вы автоматизируете свою рутину?",
    status: 'pending'
  }
];

/**
 * Gets comments for a video project (mock or real)
 */
export function getVideoComments(contentId: string): CommentItem[] {
  return SAMPLE_COMMENTS;
}

/**
 * Generates an instant AI response tailored to a comment
 */
export function generateReplyForComment(commentText: string, tone: ReplyTone = 'creator_friendly'): string {
  const lower = commentText.toLowerCase();

  if (lower.includes('free') || lower.includes('bepul') || lower.includes('pullik') || lower.includes('price')) {
    return "Ushbu vositaning bepul boshlang'ich rejasi mavjud! To'liq ro'yxatdan o'tish havolasi qadalgan (pinned) izohimizda keltirilgan. Sinab ko'rib fikringizni yozing! 🚀";
  }

  if (lower.includes('?') || lower.includes('qanday') || lower.includes('how')) {
    return "Ajoyib savol! Ushbu funksiyani sozlash uchun 2 daqiqa yetarli. Ertangi videoda buni amaliy demo bilan ko'rsatamiz! Kanalga obuna bo'lib kuzatib boring 🔥";
  }

  if (lower.includes('zo\'r') || lower.includes('great') || lower.includes('super') || lower.includes('raxmat')) {
    return "Katta rahmat qo'llab-quvvatlaganingiz uchun! Sizning fikringiz biz uchun juda qadrli. Keyingi videoda qaysi AI vositasini ko'rishni xohlaysiz? ❤️";
  }

  return "Fikringiz uchun rahmat! Siz bilan 100% qo'shilaman. Siz o'zingiz bu vositani qaysi loyihada ishlatgan bo'lardingiz? 👇";
}
