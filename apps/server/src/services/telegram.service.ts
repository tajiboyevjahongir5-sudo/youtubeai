import { Bot, InlineKeyboard } from 'grammy';
import { env } from '../env';

export class TelegramService {
  private bot: Bot | null = null;

  constructor() {
    if (env.TELEGRAM_BOT_TOKEN) {
      this.bot = new Bot(env.TELEGRAM_BOT_TOKEN);
      this.setupListeners();
      this.bot.start().catch(e => console.error('Telegram bot error:', e));
    } else {
      console.warn('⚠️ No TELEGRAM_BOT_TOKEN provided. Telegram bot is disabled.');
    }
  }

  private setupListeners() {
    if (!this.bot) return;
    
    this.bot.command('start', (ctx) => ctx.reply('Welcome to Jpilot! Use /link to connect your workspace.'));
    
    this.bot.command('link', (ctx) => {
      // Logic to ask for link code
      ctx.reply('Please reply with your one-time link code.');
    });

    this.bot.command('status', (ctx) => ctx.reply('Your workspace is connected and running.'));
    
    this.bot.command('help', (ctx) => ctx.reply('Available commands: /start, /link, /status, /help'));

    // Handle button clicks
    this.bot.on('callback_query:data', async (ctx) => {
      const data = ctx.callbackQuery.data;
      if (data.startsWith('approve_')) {
        await ctx.answerCallbackQuery('Approved!');
        await ctx.editMessageText('✅ Video approved.');
      } else if (data.startsWith('reject_')) {
        await ctx.answerCallbackQuery('Rejected!');
        await ctx.editMessageText('❌ Video rejected.');
      }
    });
  }

  async sendApprovalRequest(chatId: string, title: string, contentId: string) {
    if (!this.bot) return;
    const keyboard = new InlineKeyboard()
      .text('Approve', `approve_${contentId}`)
      .text('Reject', `reject_${contentId}`);
    
    await this.bot.api.sendMessage(chatId, `Review requested for video: ${title}`, { reply_markup: keyboard });
  }

  async sendNotification(chatId: string, message: string) {
    if (this.bot) {
      await this.bot.api.sendMessage(chatId, message);
    }
  }
}

export const telegramService = new TelegramService();
