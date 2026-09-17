import fs from 'fs';
import path from 'path';

export interface AdminSettings {
  cardNumber: string;
  cardHolder: string;
  basePrice: number; // default 60000
  adminPin: string; // default 7777
  tgBotToken: string;
  tgAdminChatId: string;
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
    this.baseDir = path.resolve(process.cwd(), 'data', 'payment');
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
        cardNumber: '8600 0000 0000 0000',
        cardHolder: 'ADMINISTRATOR',
        basePrice: 60000,
        adminPin: '7777',
        tgBotToken: '',
        tgAdminChatId: '',
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
    try {
      if (fs.existsSync(this.settingsFile)) {
        return JSON.parse(fs.readFileSync(this.settingsFile, 'utf-8'));
      }
    } catch (e) {}
    return {
      cardNumber: '8600 0000 0000 0000',
      cardHolder: 'ADMINISTRATOR',
      basePrice: 60000,
      adminPin: '7777',
      tgBotToken: '',
      tgAdminChatId: '',
    };
  }

  saveSettings(settings: Partial<AdminSettings>): AdminSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    fs.writeFileSync(this.settingsFile, JSON.stringify(updated, null, 2));
    return updated;
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
    // Keep last 500 invoices to prevent unbounded file growth
    const trimmed = invoices.slice(-500);
    fs.writeFileSync(this.invoicesFile, JSON.stringify(trimmed, null, 2));
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
    };

    invoices.push(newInvoice);
    this.saveInvoices(invoices);

    console.log(`💳 [${workspaceId}] Yangi invoys yaratildi: ${totalAmount} UZS (offset: +${chosenOffset})`);
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
   * CardXabar & HumoCard notification parser.
   * Parses SMS/Telegram text from payment bots.
   * Example texts:
   *  - "Karta: *4589. Kirim: +60 047 UZS. Qoldiq: 1 250 000 UZS"
   *  - "HumoCard: Kirim: 60023 sum. Karta: *7890"
   *  - "Kirim: 60,099 so'm. Vaqt: 14:25"
   *  - "To'lov: 60012 UZS"
   */
  parseAndProcessNotification(rawText: string): {
    matched: boolean;
    extractedAmount?: number;
    invoice?: PaymentInvoice;
    workspaceId?: string;
    message: string;
  } {
    if (!rawText) {
      return { matched: false, message: 'Matn kiritilmadi' };
    }

    console.log('🔍 CardXabar / HumoCard xabari tahlil qilinmoqda:', rawText);

    // Normalize text: lowercase, remove non-breaking spaces
    const clean = rawText.replace(/\u00A0/g, ' ');

    // 1. Look for numbers between 60001 and 60099
    // Patterns with or without separators: 60 047, 60047, 60,047, 60.047
    const amountRegex = /(?:60[ ,.]?0[0-9]{2})/g;
    const matches = clean.match(amountRegex);

    if (!matches || matches.length === 0) {
      return {
        matched: false,
        message: 'Xabarda 60,001 dan 60,099 gacha bo\'lgan unikal summa topilmadi.',
      };
    }

    // Extract exact integer (e.g. "60 047" -> 60047)
    const rawNumber = matches[0].replace(/[^0-9]/g, '');
    const amount = parseInt(rawNumber, 10);

    if (isNaN(amount) || amount < 60001 || amount > 60099) {
      return {
        matched: false,
        extractedAmount: amount,
        message: `Summa ${amount} UZS aniqlandi, lekin u 60,001 - 60,099 oralig'ida emas.`,
      };
    }

    // 2. Find pending invoice matching this total amount
    const invoices = this.getInvoices();
    const now = new Date();

    const matchedInvoice = invoices.find(
      (inv) => inv.totalAmount === amount && inv.status === 'pending'
    );

    if (!matchedInvoice) {
      return {
        matched: false,
        extractedAmount: amount,
        message: `Summa ${amount} UZS topildi, lekin bu summaga mos kutishdagi (pending) to'lov topilmadi.`,
      };
    }

    // 3. Mark as paid
    matchedInvoice.status = 'paid';
    matchedInvoice.paidAt = now.toISOString();
    this.saveInvoices(invoices);

    // 4. Activate 30-day subscription
    this.activateSubscription(matchedInvoice.workspaceId, 30);

    const successMsg = `✅ To'lov tasdiqlandi! Workspace: ${matchedInvoice.workspaceId}, Summa: ${amount} UZS. Obuna 30 kunga faollashtirildi!`;
    console.log(successMsg);

    return {
      matched: true,
      extractedAmount: amount,
      invoice: matchedInvoice,
      workspaceId: matchedInvoice.workspaceId,
      message: successMsg,
    };
  }

  /**
   * Retrieves all users/workspaces across the system for the Admin Panel.
   * Gathers connected Gmail, YouTube Channel, subscription status, and token dates.
   */
  getAllUsersWithDetails(): any[] {
    const dataDir = path.resolve(process.cwd(), 'data');
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

    // 3. Include workspaces from subscriptions
    for (const [wsId, sub] of Object.entries(subs)) {
      const existing = workspaceMap.get(wsId) || { workspaceId: wsId, hasTokens: false };
      existing.subscription = sub;
      workspaceMap.set(wsId, existing);
    }

    // 4. Ensure at least 'default' workspace is present
    if (!workspaceMap.has('default')) {
      workspaceMap.set('default', { workspaceId: 'default', hasTokens: false });
    }

    // 5. Build final list with computed status
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
