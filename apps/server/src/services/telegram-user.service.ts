import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage } from 'telegram/events';
import fs from 'fs';
import path from 'path';
import { paymentService } from './payment.service';

export interface TelegramUserLog {
  id: string;
  sender: string;
  text: string;
  date: string;
  matched: boolean;
  extractedAmount?: number;
  workspaceId?: string;
}

export class TelegramUserService {
  private client: TelegramClient | null = null;
  private sessionFilePath: string;
  private logsFilePath: string;
  private configFilePath: string;
  
  // Pending auth state
  private pendingAuth: {
    phoneNumber: string;
    phoneCodeHash: string;
    apiId: number;
    apiHash: string;
  } | null = null;

  private recentLogs: TelegramUserLog[] = [];
  private isListening: boolean = false;
  private connectedUser: any = null;

  // Default Telegram API credentials (Official Telegram Desktop client credentials)
  private defaultApiId = 2040;
  private defaultApiHash = 'b18441a1ff607e10a989891a5462e627';

  constructor() {
    const rootDir = process.env.DATA_PATH || path.resolve(process.cwd(), 'data');
    const dir = path.join(rootDir, 'payment');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    this.sessionFilePath = path.join(dir, 'tg_user_session.txt');
    this.logsFilePath = path.join(dir, 'tg_user_logs.json');
    this.configFilePath = path.join(dir, 'tg_user_config.json');

    this.loadLogs();
    this.autoConnect();
  }

  private loadLogs() {
    try {
      if (fs.existsSync(this.logsFilePath)) {
        this.recentLogs = JSON.parse(fs.readFileSync(this.logsFilePath, 'utf-8'));
      }
    } catch (e) {
      this.recentLogs = [];
    }
  }

  private saveLog(log: TelegramUserLog) {
    this.recentLogs.unshift(log);
    if (this.recentLogs.length > 50) this.recentLogs.pop();
    try {
      fs.writeFileSync(this.logsFilePath, JSON.stringify(this.recentLogs, null, 2));
    } catch (e) {}
  }

  private getConfig(): { apiId: number; apiHash: string } {
    try {
      if (fs.existsSync(this.configFilePath)) {
        const saved = JSON.parse(fs.readFileSync(this.configFilePath, 'utf-8'));
        if (saved && saved.apiId && saved.apiId !== 2496 && saved.apiHash) {
          return saved;
        }
      }
    } catch (e) {}
    return {
      apiId: Number(process.env.TELEGRAM_API_ID) || this.defaultApiId,
      apiHash: process.env.TELEGRAM_API_HASH || this.defaultApiHash,
    };
  }


  private saveConfig(config: { apiId: number; apiHash: string }) {
    try {
      fs.writeFileSync(this.configFilePath, JSON.stringify(config, null, 2));
    } catch (e) {}
  }

  /**
   * Auto-connect on server startup if session string exists
   */
  async autoConnect() {
    try {
      if (!fs.existsSync(this.sessionFilePath)) return;
      const sessionString = fs.readFileSync(this.sessionFilePath, 'utf-8').trim();
      if (!sessionString) return;

      const config = this.getConfig();
      console.log('🔄 Telegram shaxsiy akkauntiga avtomatik ulanilmoqda...');
      
      const stringSession = new StringSession(sessionString);
      this.client = new TelegramClient(stringSession, config.apiId, config.apiHash, {
        connectionRetries: 5,
      });

      await this.client.connect();
      const me = await this.client.getMe();
      if (me) {
        this.connectedUser = {
          id: String(me.id),
          firstName: (me as any).firstName || '',
          lastName: (me as any).lastName || '',
          username: (me as any).username || '',
          phone: (me as any).phone || '',
        };
        console.log(`✅ Telegram shaxsiy akkaunti ulandi: @${this.connectedUser.username || this.connectedUser.firstName}`);
        this.startMessageListener();
      }
    } catch (err: any) {
      console.error('❌ Telegram akkauntiga ulanishda xatolik:', err?.message || err);
      this.client = null;
    }
  }

  /**
   * STEP 1: Send code to admin's phone number
   */
  async sendLoginCode(phoneNumber: string, customApiId?: number, customApiHash?: string) {
    const apiId = customApiId || this.getConfig().apiId;
    const apiHash = customApiHash || this.getConfig().apiHash;
    this.saveConfig({ apiId, apiHash });

    const stringSession = new StringSession('');
    this.client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 3,
    });

    await this.client.connect();

    console.log(`📲 Telegram kod yuborilmoqda: ${phoneNumber}...`);
    const res = await this.client.sendCode(
      { apiId, apiHash },
      phoneNumber
    );

    this.pendingAuth = {
      phoneNumber,
      phoneCodeHash: res.phoneCodeHash,
      apiId,
      apiHash,
    };

    return {
      success: true,
      phoneNumber,
      phoneCodeHash: res.phoneCodeHash,
      message: `Telegram kod ${phoneNumber} raqamiga yuborildi. Iltimos, Telegram ilovangizga kelgan kodni kiriting.`,
    };
  }

  /**
   * STEP 2: Sign in with the code received in Telegram app
   */
  async signInWithCode(code: string, password?: string) {
    if (!this.pendingAuth || !this.client) {
      throw new Error('Avval telefon raqamga kod yuborish kerak.');
    }

    const { phoneNumber, phoneCodeHash, apiId, apiHash } = this.pendingAuth;

    console.log(`🔑 Telegram kod tekshirilmoqda (${code})...`);
    await (this.client as any).signInUser(
      { apiId, apiHash },
      {
        phoneNumber,
        phoneCodeHash,
        phoneCode: async () => code,
        password: async () => password || '',
        onError: (err: any) => { console.error('Telegram auth error:', err); },
      }
    );

    const sessionString = (this.client.session as any).save();
    fs.writeFileSync(this.sessionFilePath, sessionString, 'utf-8');

    const me = await this.client.getMe();
    this.connectedUser = {
      id: String(me.id),
      firstName: (me as any).firstName || '',
      lastName: (me as any).lastName || '',
      username: (me as any).username || '',
      phone: (me as any).phone || '',
    };

    this.pendingAuth = null;
    this.startMessageListener();

    console.log(`🎉 Telegram akkaunt muvaffaqiyatli ulandi va saqlandi! (@${this.connectedUser.username || this.connectedUser.firstName})`);

    return {
      success: true,
      user: this.connectedUser,
      message: 'Telegram shaxsiy akkauntingiz muvaffaqiyatli ulandi!',
    };
  }

  /**
   * STEP 2b: Connect directly using an existing StringSession
   */
  async connectWithStringSession(sessionString: string, apiId?: number, apiHash?: string) {
    const finalApiId = apiId || this.getConfig().apiId;
    const finalApiHash = apiHash || this.getConfig().apiHash;
    this.saveConfig({ apiId: finalApiId, apiHash: finalApiHash });

    const stringSession = new StringSession(sessionString.trim());
    this.client = new TelegramClient(stringSession, finalApiId, finalApiHash, {
      connectionRetries: 3,
    });

    await this.client.connect();
    const me = await this.client.getMe();
    if (!me) {
      throw new Error('Sessiya yaroqsiz yoki eskirgan.');
    }

    fs.writeFileSync(this.sessionFilePath, sessionString.trim(), 'utf-8');
    this.connectedUser = {
      id: String(me.id),
      firstName: (me as any).firstName || '',
      lastName: (me as any).lastName || '',
      username: (me as any).username || '',
      phone: (me as any).phone || '',
    };

    this.startMessageListener();
    return {
      success: true,
      user: this.connectedUser,
      message: 'Telegram akkaunt sessiya orqali ulandi!',
    };
  }

  /**
   * Start listening for CardXabar / HumoCard notifications
   */
  private startMessageListener() {
    if (this.isListening || !this.client) return;
    this.isListening = true;

    console.log('📡 Telegram Userbot faollashdi: CardXabar va HumoCard xabarlari jonli kuzatilmoqda...');

    this.client.addEventHandler(async (event: any) => {
      try {
        const message = event.message;
        if (!message || !message.text) return;

        let senderTitle = 'Noma\'lum';
        try {
          const sender = await message.getSender();
          if (sender) {
            senderTitle = sender.username ? `@${sender.username}` : (sender.title || sender.firstName || 'User');
          }
        } catch (e) {}

        const text = message.text;
        console.log(`\n📩 [Telegram Xabar] ${senderTitle}: ${text.substring(0, 80)}...`);

        // Check if message looks like a payment SMS from CardXabar / HumoCard / Bank
        const processResult = paymentService.parseAndProcessNotification(text);

        const logEntry: TelegramUserLog = {
          id: 'log_' + Date.now(),
          sender: senderTitle,
          text,
          date: new Date().toISOString(),
          matched: processResult.matched,
          extractedAmount: processResult.extractedAmount,
          workspaceId: processResult.workspaceId,
        };

        this.saveLog(logEntry);

        if (processResult.matched) {
          console.log(`🎉 [AUTO-PAYMENT] ${senderTitle} orqali kelgan ${processResult.extractedAmount} UZS to'lovi avtomatik tasdiqlandi! Workspace: ${processResult.workspaceId}`);
        }
      } catch (err: any) {
        console.error('Xabarni tahlil qilishda xatolik:', err);
      }
    }, new NewMessage({ incoming: true }));
  }

  /**
   * Get live status of Telegram user connection
   */
  getStatus() {
    const isConnected = !!(this.client && this.connectedUser);
    return {
      connected: isConnected,
      user: this.connectedUser,
      isListening: this.isListening,
      pendingStep: this.pendingAuth ? 'enter_code' : 'idle',
      pendingPhone: this.pendingAuth?.phoneNumber || null,
      monitoredChannels: [
        '@cardxabar_bot',
        '@humocardbot',
        '@payme_bot',
        '@clickuz',
        'Bank SMS xabarlari',
      ],
      recentLogs: this.recentLogs.slice(0, 15),
    };
  }

  /**
   * Disconnect and clear session
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.disconnect();
      }
      if (fs.existsSync(this.sessionFilePath)) {
        fs.unlinkSync(this.sessionFilePath);
      }
      this.client = null;
      this.connectedUser = null;
      this.isListening = false;
      this.pendingAuth = null;
      console.log('🔌 Telegram akkaunt uzildi.');
      return { success: true, message: 'Telegram akkaunti uzildi.' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}

export const telegramUserService = new TelegramUserService();
