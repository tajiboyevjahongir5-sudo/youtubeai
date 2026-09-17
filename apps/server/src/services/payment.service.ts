import fs from 'fs';
import path from 'path';

export interface AdminCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  bankName?: string;
  dailyLimit: number; // default 40
  isActive: boolean;
  priority: number;
}

export interface AdminSettings {
  cardNumber: string; // primary fallback
  cardHolder: string;
  basePrice: number; // default 60000
  adminPin: string; // default 7777
  tgBotToken: string;
  tgAdminChatId: string;
  cards: AdminCard[];
  maxDailyTransfersPerCard: number; // default 40
  tgUserSessionString?: string;
  tgConnectedUser?: any;
}

export interface PaymentInvoice {
  id: string;
  workspaceId: string;
  baseAmount: number;
  uniqueOffset: number; // 1 to 99
  totalAmount: number; // e.g. 60047
  status: 'pending' | 'paid' | 'expired';
  createdAt: string;
  expiresAt: string; // 20 minutes from creation
  paidAt: string | null;
  cardId?: string;
  cardNumber?: string;
  cardHolder?: string;
}


export interface UserSubscription {
  workspaceId: string;
  status: 'active' | 'expired' | 'trial';
  planPrice: number;
  activatedAt: string;
  expiresAt: string;
  totalPayments: number;
  userGmail?: string;
  userName?: string;
}

export class PaymentService {
  private baseDir: string;
  private settingsFile: string;
  private invoicesFile: string;
  private subsFile: string;

  constructor() {
    const rootDir = process.env.DATA_PATH || path.resolve(process.cwd(), 'data');
    this.baseDir = path.join(rootDir, 'payment');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
    this.settingsFile = path.join(this.baseDir, 'admin_settings.json');
    this.invoicesFile = path.join(this.baseDir, 'invoices.json');
    this.subsFile = path.join(this.baseDir, 'subscriptions.json');

    this.ensureDefaults();
  }

  private ensureDefaults() {
    if (!fs.existsSync(this.settingsFile)) {
      const defaultSettings: AdminSettings = {
        cardNumber: '9860 3501 4074 7741',
        cardHolder: 'Tojiboyev Jahongir',
        basePrice: 60000,
        adminPin: '7777',
        tgBotToken: '',
        tgAdminChatId: '',
        maxDailyTransfersPerCard: 40,
        cards: [
          {
            id: 'card_1',
            cardNumber: '9860 3501 4074 7741',
            cardHolder: 'Tojiboyev Jahongir',
            dailyLimit: 40,
            isActive: true,
            priority: 1,
          },
        ],
      };

      fs.writeFileSync(this.settingsFile, JSON.stringify(defaultSettings, null, 2));
    }

    if (!fs.existsSync(this.invoicesFile)) {
      fs.writeFileSync(this.invoicesFile, JSON.stringify([], null, 2));
    }

    if (!fs.existsSync(this.subsFile)) {
      fs.writeFileSync(this.subsFile, JSON.stringify({}, null, 2));
    }
  }

  getSettings(): AdminSettings {
    let settings: any = null;
    try {
      if (fs.existsSync(this.settingsFile)) {
        settings = JSON.parse(fs.readFileSync(this.settingsFile, 'utf-8'));
      }
    } catch (e) {}

    if (!settings) {
      settings = {
        cardNumber: '9860 3501 4074 7741',
        cardHolder: 'Tojiboyev Jahongir',
        basePrice: 60000,
        adminPin: '7777',
        tgBotToken: '',
        tgAdminChatId: '',
        maxDailyTransfersPerCard: 40,
        cards: [],
      };
    }

    // Auto-fix placeholder / dummy card if it was saved
    if (settings.cardNumber === '8600 0000 0000 0000' || settings.cardHolder === 'ADMINISTRATOR') {
      settings.cardNumber = '9860 3501 4074 7741';
      settings.cardHolder = 'Tojiboyev Jahongir';
    }

    // Ensure cards array exists and has at least the default card
    if (!settings.cards || !Array.isArray(settings.cards) || settings.cards.length === 0) {
      const defaultCard: AdminCard = {
        id: 'card_1',
        cardNumber: settings.cardNumber || '9860 3501 4074 7741',
        cardHolder: settings.cardHolder || 'Tojiboyev Jahongir',
        dailyLimit: settings.maxDailyTransfersPerCard || 40,
        isActive: true,
        priority: 1,
      };
      settings.cards = [defaultCard];
    } else {
      // Fix first card if it has the placeholder dummy card
      if (settings.cards[0]?.cardNumber === '8600 0000 0000 0000' || settings.cards[0]?.cardHolder === 'ADMINISTRATOR') {
        settings.cards[0].cardNumber = '9860 3501 4074 7741';
        settings.cards[0].cardHolder = 'Tojiboyev Jahongir';
        settings.cardNumber = '9860 3501 4074 7741';
        settings.cardHolder = 'Tojiboyev Jahongir';
      }
    }

    if (!settings.maxDailyTransfersPerCard) {
      settings.maxDailyTransfersPerCard = 40;
    }

    return settings as AdminSettings;
  }

  saveSettings(settings: Partial<AdminSettings>): AdminSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    if (updated.cards && updated.cards.length > 0) {
      updated.cardNumber = updated.cards[0].cardNumber;
      updated.cardHolder = updated.cards[0].cardHolder;
    }
    fs.writeFileSync(this.settingsFile, JSON.stringify(updated, null, 2));
    return updated;
  }

  /**
   * Get the active card based on daily transaction limit (default 40).
   * When Card #1 reaches 40 transfers today, auto-switches to Card #2, etc.
   */
  getActiveCard(): { card: AdminCard; todayCount: number; remainingToday: number } {
    const settings = this.getSettings();
    const invoices = this.getInvoices();
    const todayStr = new Date().toISOString().slice(0, 10);

    // Count today's paid transfers per card
    const cardUsage: Record<string, number> = {};
    for (const inv of invoices) {
      if (inv.status === 'paid' && inv.paidAt && inv.paidAt.slice(0, 10) === todayStr) {
        const cleanCard = (inv.cardNumber || settings.cardNumber).replace(/\s/g, '');
        cardUsage[cleanCard] = (cardUsage[cleanCard] || 0) + 1;
      }
    }

    // Active cards sorted by priority
    const activeCards = settings.cards
      .filter((c) => c.isActive !== false)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));

    // Pick first card that has not exceeded its daily limit
    for (const card of activeCards) {
      const cleanNum = card.cardNumber.replace(/\s/g, '');
      const count = cardUsage[cleanNum] || 0;
      const limit = card.dailyLimit || settings.maxDailyTransfersPerCard || 40;
      if (count < limit) {
        return { card, todayCount: count, remainingToday: limit - count };
      }
    }

    // Fallback if all cards reached their daily limits
    const fallback = activeCards[0] || settings.cards[0];
    const cleanNum = fallback.cardNumber.replace(/\s/g, '');
    const count = cardUsage[cleanNum] || 0;
    return { card: fallback, todayCount: count, remainingToday: 0 };
  }

  /**
   * Get all cards with live today's transfer statistics
   */
  getCardsWithStats(): {
    cards: (AdminCard & {
      todayCount: number;
      remainingToday: number;
      isCurrentActive: boolean;
    })[];
    currentActiveCardId: string;
    maxDailyLimit: number;
  } {
    const settings = this.getSettings();
    const invoices = this.getInvoices();
    const activeInfo = this.getActiveCard();
    const todayStr = new Date().toISOString().slice(0, 10);

    const cardUsage: Record<string, number> = {};
    for (const inv of invoices) {
      if (inv.status === 'paid' && inv.paidAt && inv.paidAt.slice(0, 10) === todayStr) {
        const cleanCard = (inv.cardNumber || settings.cardNumber).replace(/\s/g, '');
        cardUsage[cleanCard] = (cardUsage[cleanCard] || 0) + 1;
      }
    }

    const cardsWithStats = settings.cards.map((card) => {
      const clean = card.cardNumber.replace(/\s/g, '');
      const count = cardUsage[clean] || 0;
      const limit = card.dailyLimit || settings.maxDailyTransfersPerCard || 40;
      return {
        ...card,
        todayCount: count,
        remainingToday: Math.max(0, limit - count),
        isCurrentActive: card.id === activeInfo.card.id,
      };
    });

    return {
      cards: cardsWithStats,
      currentActiveCardId: activeInfo.card.id,
      maxDailyLimit: settings.maxDailyTransfersPerCard || 40,
    };
  }

  addCard(newCard: { cardNumber: string; cardHolder: string; dailyLimit?: number; bankName?: string }): AdminCard {
    const settings = this.getSettings();
    const cleanNum = newCard.cardNumber.trim();
    const id = 'card_' + Date.now();
    const card: AdminCard = {
      id,
      cardNumber: cleanNum,
      cardHolder: newCard.cardHolder.trim() || 'ADMIN',
      dailyLimit: newCard.dailyLimit && newCard.dailyLimit > 0 ? newCard.dailyLimit : (settings.maxDailyTransfersPerCard || 40),
      bankName: newCard.bankName?.trim() || '',
      isActive: true,
      priority: settings.cards.length + 1,
    };

    settings.cards.push(card);
    this.saveSettings(settings);
    console.log(`💳 Yangi karta qo'shildi: ${card.cardNumber} (${card.cardHolder}), Kunlik limit: ${card.dailyLimit} ta`);
    return card;
  }

  updateCard(id: string, updates: Partial<AdminCard>): AdminCard | null {
    const settings = this.getSettings();
    const card = settings.cards.find((c) => c.id === id);
    if (!card) return null;

    Object.assign(card, updates);
    this.saveSettings(settings);
    return card;
  }

  deleteCard(id: string): boolean {
    const settings = this.getSettings();
    if (settings.cards.length <= 1) {
      throw new Error('Kamida bitta karta qolishi shart! Oxirgi kartani o\'chirib bo\'lmaydi.');
    }
    const idx = settings.cards.findIndex((c) => c.id === id);
    if (idx === -1) return false;

    settings.cards.splice(idx, 1);
    if (settings.cards.length > 0) {
      settings.cardNumber = settings.cards[0].cardNumber;
      settings.cardHolder = settings.cards[0].cardHolder;
    }
    this.saveSettings(settings);
    return true;
  }


  private getInvoices(): PaymentInvoice[] {
    try {
      if (fs.existsSync(this.invoicesFile)) {
        return JSON.parse(fs.readFileSync(this.invoicesFile, 'utf-8'));
      }
    } catch (e) {}
    return [];
  }

  private saveInvoices(invoices: PaymentInvoice[]) {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Keraksiz va muddati o'tgan to'lanmagan invoyslarni avtomatik tozalash:
    const cleaned = invoices.filter((inv) => {
      // Barcha haqiqiy to'langan invoyslar saqlanadi
      if (inv.status === 'paid') return true;
      // To'lanmagan yoki eskirgan bo'lsa, faqat oxirgi 24 soatdagilarini saqlash
      return new Date(inv.createdAt).getTime() > oneDayAgo;
    });

    const trimmed = cleaned.slice(-100);
    fs.writeFileSync(this.invoicesFile, JSON.stringify(trimmed, null, 2));
  }

  /**
   * Keraksiz test ma'lumotlarini tozalash
   */
  cleanupUnnecessaryData() {
    // 1. Invoyslardan testlarni tozalash
    const invoices = this.getInvoices().filter((inv) => !inv.workspaceId.includes('test'));
    this.saveInvoices(invoices);

    // 2. Obunalardan testlarni tozalash
    const subs = this.getSubscriptions();
    for (const key of Object.keys(subs)) {
      if (key.includes('test') || key.includes('demo')) {
        delete subs[key];
      }
    }
    this.saveSubscriptions(subs);
    return { success: true, message: 'Keraksiz test ma\'lumotlari tozalandi' };
  }


  private getSubscriptions(): Record<string, UserSubscription> {
    try {
      if (fs.existsSync(this.subsFile)) {
        return JSON.parse(fs.readFileSync(this.subsFile, 'utf-8'));
      }
    } catch (e) {}
    return {};
  }

  private saveSubscriptions(subs: Record<string, UserSubscription>) {
    fs.writeFileSync(this.subsFile, JSON.stringify(subs, null, 2));
  }

  /**
   * Generates a payment invoice with a 1..99 unique offset.
   * Allows up to 99 simultaneous active transactions with zero collision!
   */
  createInvoice(workspaceId: string): PaymentInvoice {
    const settings = this.getSettings();
    const now = new Date();
    const invoices = this.getInvoices();

    // 1. Expire past invoices older than 20 minutes
    const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();
    for (const inv of invoices) {
      if (inv.status === 'pending' && inv.expiresAt < now.toISOString()) {
        inv.status = 'expired';
      }
    }

    // 2. Check if user already has an active pending invoice with time left
    const existing = invoices.find(
      (inv) => inv.workspaceId === workspaceId && inv.status === 'pending' && inv.expiresAt > now.toISOString()
    );
    if (existing) {
      this.saveInvoices(invoices);
      return existing;
    }

    // 3. Find an available unique offset between 1 and 99
    const activeOffsets = new Set(
      invoices
        .filter((inv) => inv.status === 'pending' && inv.expiresAt > now.toISOString())
        .map((inv) => inv.uniqueOffset)
    );

    let chosenOffset = 1;
    for (let o = 1; o <= 99; o++) {
      if (!activeOffsets.has(o)) {
        chosenOffset = o;
        break;
      }
    }

    // If all 99 offsets are somehow used, pick a random one
    if (activeOffsets.has(chosenOffset)) {
      chosenOffset = Math.floor(Math.random() * 99) + 1;
    }

    const expiresAt = new Date(now.getTime() + 20 * 60 * 1000).toISOString();
    const totalAmount = settings.basePrice + chosenOffset;

    // Kunlik 40 ta limit hisobga olingan faol kartani olish
    const activeCardInfo = this.getActiveCard();
    const activeCard = activeCardInfo.card;

    const newInvoice: PaymentInvoice = {
      id: 'inv_' + Math.random().toString(36).substring(2, 10),
      workspaceId,
      baseAmount: settings.basePrice,
      uniqueOffset: chosenOffset,
      totalAmount,
      status: 'pending',
      createdAt: now.toISOString(),
      expiresAt,
      paidAt: null,
      cardId: activeCard.id,
      cardNumber: activeCard.cardNumber,
      cardHolder: activeCard.cardHolder,
    };

    invoices.push(newInvoice);
    this.saveInvoices(invoices);

    console.log(`💳 [${workspaceId}] Yangi invoys: ${totalAmount} UZS (offset: +${chosenOffset}) -> Karta: ${activeCard.cardNumber} (${activeCard.cardHolder}, Bugun: ${activeCardInfo.todayCount}/${activeCard.dailyLimit} ta)`);
    return newInvoice;

  }

  /**
   * Check invoice status
   */
  getInvoice(invoiceId: string): PaymentInvoice | null {
    const invoices = this.getInvoices();
    return invoices.find((inv) => inv.id === invoiceId) || null;
  }

  /**
   * Get all invoices for admin
   */
  getAllInvoices(): PaymentInvoice[] {
    return this.getInvoices().reverse();
  }

  /**
   * Activates or extends a workspace subscription by X days (default 30 days)
   */
  activateSubscription(workspaceId: string, days: number = 30, metadata?: { userGmail?: string; userName?: string }): UserSubscription {
    const subs = this.getSubscriptions();
    const now = new Date();
    const currentSub = subs[workspaceId];

    let startDate = now;
    if (currentSub && currentSub.status === 'active' && new Date(currentSub.expiresAt) > now) {
      // Extend current active subscription
      startDate = new Date(currentSub.expiresAt);
    }

    const expiresAt = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
    const updatedSub: UserSubscription = {
      workspaceId,
      status: 'active',
      planPrice: 60000,
      activatedAt: now.toISOString(),
      expiresAt,
      totalPayments: (currentSub?.totalPayments || 0) + 1,
      userGmail: metadata?.userGmail || currentSub?.userGmail,
      userName: metadata?.userName || currentSub?.userName,
    };

    subs[workspaceId] = updatedSub;
    this.saveSubscriptions(subs);
    console.log(`✅ [${workspaceId}] Obuna ${days} kunga faollashtirildi! Tugash vaqti: ${expiresAt}`);
    return updatedSub;
  }

  /**
   * Checks subscription status for a workspace
   */
  getSubscriptionStatus(workspaceId: string): {
    isActive: boolean;
    status: 'active' | 'expired' | 'trial';
    expiresAt: string | null;
    daysLeft: number;
    planPrice: number;
  } {
    const subs = this.getSubscriptions();
    const sub = subs[workspaceId];
    const now = new Date();

    if (!sub) {
      // Default: 3-day free trial for fresh workspaces
      return {
        isActive: true,
        status: 'trial',
        expiresAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        daysLeft: 3,
        planPrice: 60000,
      };
    }

    const expDate = new Date(sub.expiresAt);
    const isActive = expDate > now;
    const daysLeft = Math.max(0, Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      isActive,
      status: isActive ? sub.status : 'expired',
      expiresAt: sub.expiresAt,
      daysLeft,
      planPrice: sub.planPrice,
    };
  }

  /**
   * CardXabar (@CardXabarBot) & HumoCard (@HUMOcardbot) precision notification parser.
   * Based on authentic bot message structures:
   *
   * 1. HUMO Card (@HUMOcardbot):
   *    🎉 To'ldirish
   *    ➕ 60.042,00 UZS
   *    📍 UB Visa to Humo P2P>
   *    💳 HUMOCARD *7741
   *    🕒 14:36 14.09.2026
   *    💰 451.893,27 UZS
   *
   * 2. CardXabar (@CardXabarBot):
   *    🟢 Perevod na kartu
   *    ➕ 60 042.00 UZS
   *    💳 ***2209
   *    📍 TBC EDIN EPOS H2U, UZ
   *    🕒 26.07.26 14:48
   *    💰 7 000.00 UZS
   */
  parseAndProcessNotification(rawText: string): {
    matched: boolean;
    extractedAmount?: number;
    invoice?: PaymentInvoice;
    workspaceId?: string;
    message: string;
    botType?: string;
  } {
    if (!rawText) {
      return { matched: false, message: 'Matn kiritilmadi' };
    }

    console.log('🔍 CardXabar / HumoCard xabari tahlil qilinmoqda:\n', rawText);

    // Filter out outgoing expense notifications (Platezh / To'lov / ➖)
    const isOutgoing = /(?:➖|\bplatezh\b|\byechish\b|\bspisanie\b)/i.test(rawText) && !/(?:➕|\bto[''`]?ldirish\b|\bperevod na kartu\b|\bpopolnenie\b)/i.test(rawText);
    if (isOutgoing) {
      return {
        matched: false,
        message: 'Bu chiqim (xarajat) xabarnomasi, kirim emas. E\'tiborga olinmadi.',
      };
    }

    let extractedAmount: number | null = null;
    let botType = 'Noma\'lum';

    // 1. Primary extractor: Find the exact incoming transfer line starting with ➕ or +
    // Example: "➕ 10.000,00 UZS" or "➕ 7 000.00 UZS"
    const plusLineMatch = rawText.match(/(?:➕|\+)\s*([0-9\s.,]+)\s*UZS/i);

    if (plusLineMatch && plusLineMatch[1]) {
      const rawNum = plusLineMatch[1].trim();

      if (rawNum.includes(',')) {
        // HUMO Card format: "60.042,00" (dot = thousands, comma = decimals)
        botType = 'HUMO Card (@HUMOcardbot)';
        const beforeComma = rawNum.split(',')[0].replace(/[^0-9]/g, '');
        extractedAmount = parseInt(beforeComma, 10);
      } else if (rawNum.includes('.')) {
        // CardXabar format: "60 042.00" (space = thousands, dot = decimals)
        botType = 'CardXabar (@CardXabarBot)';
        const beforeDot = rawNum.split('.')[0].replace(/[^0-9]/g, '');
        extractedAmount = parseInt(beforeDot, 10);
      } else {
        extractedAmount = parseInt(rawNum.replace(/[^0-9]/g, ''), 10);
      }
    }

    // 2. Fallback extractor: Search for any 60001..60099 number sequence
    if (!extractedAmount || isNaN(extractedAmount)) {
      const clean = rawText.replace(/\u00A0/g, ' ');
      const amountRegex = /(?:60[ ,.]?0[0-9]{2})/g;
      const matches = clean.match(amountRegex);
      if (matches && matches.length > 0) {
        const rawNumber = matches[0].replace(/[^0-9]/g, '');
        extractedAmount = parseInt(rawNumber, 10);
      }
    }

    if (!extractedAmount || isNaN(extractedAmount) || extractedAmount < 60001 || extractedAmount > 60099) {
      return {
        matched: false,
        extractedAmount: extractedAmount || undefined,
        message: extractedAmount 
          ? `Summa ${extractedAmount.toLocaleString()} UZS aniqlandi, lekin u 60,001 - 60,099 oralig'ida emas.`
          : 'Xabarda 60,001 dan 60,099 gacha bo\'lgan unikal to\'lov summasi topilmadi.',
      };
    }

    // 3. Find pending invoice matching this total amount
    const invoices = this.getInvoices();
    const now = new Date();

    const matchedInvoice = invoices.find(
      (inv) => inv.totalAmount === extractedAmount && inv.status === 'pending'
    );

    if (!matchedInvoice) {
      return {
        matched: false,
        extractedAmount,
        botType,
        message: `Summa ${extractedAmount.toLocaleString()} UZS (${botType}) aniqlandi, lekin bu summaga mos kutilayotgan invoys topilmadi.`,
      };
    }

    // 4. Mark invoice as paid
    matchedInvoice.status = 'paid';
    matchedInvoice.paidAt = now.toISOString();
    this.saveInvoices(invoices);

    // 5. Activate 30-day subscription
    this.activateSubscription(matchedInvoice.workspaceId, 30);

    const successMsg = `✅ To'lov tasdiqlandi! Manba: ${botType}, Workspace: ${matchedInvoice.workspaceId}, Summa: ${extractedAmount.toLocaleString()} UZS. Obuna 30 kunga faollashtirildi!`;
    console.log(successMsg);

    return {
      matched: true,
      extractedAmount,
      invoice: matchedInvoice,
      workspaceId: matchedInvoice.workspaceId,
      botType,
      message: successMsg,
    };
  }

  /**
   * Retrieves all users/workspaces across the system for the Admin Panel.
   * Gathers connected Gmail, YouTube Channel, subscription status, and token dates.
   */
  getAllUsersWithDetails(): any[] {
    const dataDir = process.env.DATA_PATH || path.resolve(process.cwd(), 'data');
    const tokensDir = path.join(dataDir, 'tokens');
    const channelsDir = path.join(dataDir, 'channels');
    const subs = this.getSubscriptions();

    const workspaceMap = new Map<string, any>();

    // 1. Read existing workspaces from tokens directory
    if (fs.existsSync(tokensDir)) {
      const files = fs.readdirSync(tokensDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const wsId = file.replace('.json', '');
          try {
            const tokenData = JSON.parse(fs.readFileSync(path.join(tokensDir, file), 'utf-8'));
            workspaceMap.set(wsId, {
              workspaceId: wsId,
              hasTokens: true,
              savedAt: tokenData.savedAt || null,
              tokenExpiry: tokenData.expiry_date || null,
              userGmail: tokenData.email || tokenData.userEmail || null,
            });
          } catch (e) {}
        }
      }
    }

    // 2. Read existing workspaces from channels directory
    if (fs.existsSync(channelsDir)) {
      const files = fs.readdirSync(channelsDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const wsId = file.replace('.json', '');
          try {
            const channelData = JSON.parse(fs.readFileSync(path.join(channelsDir, file), 'utf-8'));
            const existing = workspaceMap.get(wsId) || { workspaceId: wsId, hasTokens: false };
            existing.channel = {
              id: channelData.id,
              title: channelData.snippet?.title || 'YouTube Kanal',
              customUrl: channelData.snippet?.customUrl || null,
              thumbnailUrl: channelData.snippet?.thumbnails?.default?.url || null,
              subscriberCount: channelData.statistics?.subscriberCount || 0,
              videoCount: channelData.statistics?.videoCount || 0,
              viewCount: channelData.statistics?.viewCount || 0,
            };
            workspaceMap.set(wsId, existing);
          } catch (e) {}
        }
      }
    }

    // 3. Check legacy tokens & channels in dataDir root
    const legacyToken = path.join(dataDir, 'youtube_token.json');
    const legacyChannel = path.join(dataDir, 'youtube_channel.json');
    if (fs.existsSync(legacyToken) || fs.existsSync(legacyChannel)) {
      const existing = workspaceMap.get('default') || { workspaceId: 'default', hasTokens: false };
      try {
        if (fs.existsSync(legacyToken)) {
          const td = JSON.parse(fs.readFileSync(legacyToken, 'utf-8'));
          existing.hasTokens = true;
          existing.userGmail = td.email || td.userEmail || existing.userGmail;
        }
      } catch (e) {}
      try {
        if (fs.existsSync(legacyChannel)) {
          const cd = JSON.parse(fs.readFileSync(legacyChannel, 'utf-8'));
          existing.channel = {
            id: cd.id,
            title: cd.snippet?.title || 'YouTube Kanal',
            customUrl: cd.snippet?.customUrl || null,
            thumbnailUrl: cd.snippet?.thumbnails?.default?.url || null,
            subscriberCount: cd.statistics?.subscriberCount || 0,
            videoCount: cd.statistics?.videoCount || 0,
            viewCount: cd.statistics?.viewCount || 0,
          };
        }
      } catch (e) {}
      workspaceMap.set('default', existing);
    }

    // 4. Include workspaces from subscriptions
    for (const [wsId, sub] of Object.entries(subs)) {
      const existing = workspaceMap.get(wsId) || { workspaceId: wsId, hasTokens: false };
      existing.subscription = sub;
      workspaceMap.set(wsId, existing);
    }

    // 5. If no workspaces found at all, create default
    if (workspaceMap.size === 0) {
      workspaceMap.set('default', { workspaceId: 'default', hasTokens: false });
    }

    // 6. If 'default' exists but has NO tokens, NO channel, NO subscription AND another real workspace exists, remove dummy default
    if (workspaceMap.size > 1 && workspaceMap.has('default')) {
      const def = workspaceMap.get('default');
      if (!def.hasTokens && !def.channel && !def.subscription) {
        workspaceMap.delete('default');
      }
    }

    // 7. Build final list with computed status
    const result = Array.from(workspaceMap.values()).map((u) => {
      const subStatus = this.getSubscriptionStatus(u.workspaceId);
      return {
        workspaceId: u.workspaceId,
        userGmail: u.userGmail || (u.subscription?.userGmail) || (u.hasTokens ? 'Google OAuth orqali tasdiqlangan' : 'Ulanmagan'),
        hasYouTube: !!u.channel,
        channel: u.channel || null,
        hasTokens: !!u.hasTokens,
        savedAt: u.savedAt || null,
        subscription: {
          isActive: subStatus.isActive,
          status: subStatus.status,
          expiresAt: subStatus.expiresAt,
          daysLeft: subStatus.daysLeft,
          planPrice: subStatus.planPrice,
        },
      };
    });

    return result;
  }
}

export const paymentService = new PaymentService();
