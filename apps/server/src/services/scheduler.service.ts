import { Queue } from 'bullmq';
import { env } from '../env';

export class SchedulerService {
  private queue?: Queue;

  constructor() {
    if (env.REDIS_URL) {
      try {
        this.queue = new Queue('publishing', { connection: { url: env.REDIS_URL } });
      } catch (err) {
        console.warn('⚠️ Could not connect to Redis for BullMQ. Operating in memory-only mode.');
      }
    }
  }

  async scheduleJob(jobId: string, data: any, delay: number) {
    if (this.queue) {
      await this.queue.add('publish', data, { jobId, delay });
    } else {
      console.log(`[Scheduler mock] Job ${jobId} scheduled with delay ${delay}ms`);
    }
  }

  /**
   * Calculates daily upload slots based on upload target and timezone.
   * Default target is 2 uploads per day (e.g. 14:00 UTC and 21:00 UTC).
   */
  calculatePublishingSlots(dailyTarget: number = 2, timezone: string = 'Asia/Tashkent'): Date[] {
    const defaultHoursUtc = [14, 21];
    const now = new Date();
    const slots: Date[] = [];

    for (let i = 0; i < dailyTarget; i++) {
      const slot = new Date(now);
      const targetHourUtc = defaultHoursUtc[i % defaultHoursUtc.length] ?? 14 + (i * 4);
      slot.setUTCHours(targetHourUtc, 0, 0, 0);
      if (slot.getTime() <= now.getTime()) {
        slot.setUTCDate(slot.getUTCDate() + 1);
      }
      slots.push(slot);
    }

    return slots;
  }
}

export const schedulerService = new SchedulerService();
