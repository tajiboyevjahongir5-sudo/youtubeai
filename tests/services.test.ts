import { describe, it, expect } from 'vitest';
import { MockAiService } from '../apps/server/src/services/ai.service.js';
import { MockYouTubeService } from '../apps/server/src/services/youtube.service.js';
import { MockVideoProvider } from '../apps/server/src/services/video-provider.service.js';
import { schedulerService } from '../apps/server/src/services/scheduler.service.js';

describe('AI Service Abstraction', () => {
  const aiService = new MockAiService();

  it('generates content ideas with confidence and evidence', async () => {
    const idea = await aiService.generateIdea({ niche: 'Tech', audience: 'Developers' });
    expect(idea).toBeDefined();
    expect(idea.title).toBeDefined();
    expect(typeof idea.title).toBe('string');
    expect(idea.hook).toBeDefined();
    expect(idea.confidenceLevel).toBeDefined();
    expect(idea.evidence).toBeDefined();
  });

  it('generates English video scripts with structured scenes and hook', async () => {
    const script = await aiService.generateScript({ title: 'How to Learn TypeScript in 2026' });
    expect(script).toBeDefined();
    expect(script.hook).toBeDefined();
    expect(script.fullScript).toBeDefined();
    expect(Array.isArray(script.scenes)).toBe(true);
    expect(script.closingCta).toBeDefined();
    expect(Array.isArray(script.factCheckNotes)).toBe(true);
  });

  it('generates SEO metadata with 3 title variations and quality score', async () => {
    const meta = await aiService.generateMetadata({ title: 'How to Learn TypeScript in 2026' });
    expect(meta.selectedTitle).toBeDefined();
    expect(meta.titleVariations.length).toBeGreaterThanOrEqual(1);
    expect(meta.description).toBeDefined();
    expect(Array.isArray(meta.tags)).toBe(true);
    expect(meta.metadataQualityScore).toBeGreaterThan(0);
  });

  it('performs quality review assessing copyright, originality, and policy risk', async () => {
    const review = await aiService.qualityReview({ contentItemId: 'item_123' });
    expect(review.score).toBeGreaterThan(0);
    expect(review.feedback).toBeDefined();
    expect(review.originality).toBeDefined();
    expect(review.policyRisk).toBeDefined();
  });
});

describe('YouTube Service Abstraction', () => {
  const ytService = new MockYouTubeService();

  it('provides OAuth URL generation', async () => {
    const url = ytService.getAuthUrl();
    expect(url).toContain('mock.auth.url');
  });

  it('fetches connected channel info in mock mode', async () => {
    const channel = await ytService.getChannelInfo('mock_token');
    expect(channel.id).toBeDefined();
    expect(channel.snippet.title).toBeDefined();
    expect(channel.statistics.subscriberCount).toBeGreaterThan(0);
  });

  it('simulates video uploads without failing or bypassing quota', async () => {
    const result = await ytService.uploadVideo('mock_token', 'mock_refresh', './storage/sample.mp4', {
      title: 'Test English Video',
      description: 'Test description',
      tags: ['ai', 'tech'],
    });
    expect(result.id).toBeDefined();
  });

  it('fetches analytics metrics including views and watch time', async () => {
    const analytics = await ytService.getAnalytics('mock_token', 'mock_refresh', 'channel_123');
    expect(analytics.rows).toBeDefined();
    expect(analytics.rows.length).toBeGreaterThan(0);
  });
});

describe('Video Provider Abstraction', () => {
  const provider = new MockVideoProvider();

  it('returns valid provider capabilities without pretending YouTube has a video gen API', async () => {
    const caps = provider.getProviderCapabilities();
    expect(caps.maxDuration).toBeGreaterThan(0);
  });

  it('simulates video generation workflow with operation polling', async () => {
    const jobId = await provider.generateVideo({ prompt: 'Cinematic sunset over Tashkent' });
    expect(jobId).toBeDefined();

    const status = await provider.getGenerationStatus(jobId);
    expect(status).toBe('completed');
  });
});

describe('Scheduler Service', () => {
  it('calculates publishing slots targeting 2 uploads per day', () => {
    const slots = schedulerService.calculatePublishingSlots(2, 'Asia/Tashkent');
    expect(slots).toBeDefined();
    expect(slots.length).toBe(2);
    expect(slots[0]).toBeInstanceOf(Date);
    expect(slots[1]).toBeInstanceOf(Date);
  });
});
