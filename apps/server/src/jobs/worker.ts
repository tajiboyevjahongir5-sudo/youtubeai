import { Worker, Job } from 'bullmq';
import { env } from '../env';

export let worker: Worker | null = null;

try {
  const redisUrl = env.REDIS_URL;
  // Only connect if REDIS_URL is provided and not default localhost in production
  const isProd = process.env.NODE_ENV === 'production' || env.NODE_ENV === 'production';
  const shouldConnect = redisUrl && (!isProd || !redisUrl.includes('localhost'));

  if (shouldConnect) {
    worker = new Worker('publishing', async (job: Job) => {
      console.log(`Processing job ${job.id} of type ${job.name}`);
      // Handle job execution (e.g. upload to youtube)
    }, { 
      connection: { url: redisUrl, maxRetriesPerRequest: null } 
    });

    worker.on('completed', job => {
      console.log(`${job.id} has completed!`);
    });

    worker.on('failed', (job, err) => {
      console.log(`${job?.id} has failed with ${err.message}`);
    });

    worker.on('error', (err) => {
      console.warn('⚠️ [BullMQ Worker] Redis ulanish xatosi (xotira rejimida davom etilmoqda):', err.message);
    });
  } else {
    console.log('ℹ️ [BullMQ Worker] Redis ulanmagan. Xizmat xotira va avto-scheduler rejimida ishlamoqda.');
  }
} catch (e: any) {
  console.warn('⚠️ [BullMQ Worker] Worker ishga tushirilmadi:', e.message);
}
