import { Worker, Job } from 'bullmq';
import { env } from '../env';

export const worker = new Worker('publishing', async (job: Job) => {
  console.log(`Processing job ${job.id} of type ${job.name}`);
  // Handle job execution (e.g. upload to youtube)
}, { connection: { url: env.REDIS_URL } });

worker.on('completed', job => {
  console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});
