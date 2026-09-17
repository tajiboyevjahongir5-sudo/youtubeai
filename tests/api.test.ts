import { describe, it, expect } from 'vitest';

const BASE_URL = 'http://localhost:3000';

describe('Jpilot Backend REST API Endpoints Verification', () => {
  it('GET /health returns 200 OK and valid status', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.product).toBe('Jpilot');
  });

  it('GET /api/me returns authenticated current user', async () => {
    const res = await fetch(`${BASE_URL}/api/me`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBeDefined();
    expect(data.email).toBeDefined();
  });

  it('GET /api/workspaces/default returns default workspace', async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/default`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe('default');
    expect(data.name).toBeDefined();
  });

  it('GET /api/workspaces/default/dashboard returns full studio metrics', async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/default/dashboard`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.channelConnected).toBe(true);
    expect(data.stats.scheduled).toBeGreaterThanOrEqual(1);
    expect(data.stats.needsApproval).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(data.recentActivity)).toBe(true);
  });

  it('GET /api/workspaces/default/content returns content items list', async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/default/content`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].title).toBeDefined();
  });

  it('POST /api/workspaces/default/content/ideas/generate generates AI video idea', async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/default/content/ideas/generate`, {
      method: 'POST',
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBeDefined();
    expect(data.confidenceLevel).toBeDefined();
  });

  it('POST /api/workspaces/default/content/item_1/generate-script generates script', async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/default/content/item_1/generate-script`, {
      method: 'POST',
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.hook).toBeDefined();
    expect(data.fullScript).toBeDefined();
  });

  it('POST /api/workspaces/default/content/item_1/generate-metadata generates SEO metadata', async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/default/content/item_1/generate-metadata`, {
      method: 'POST',
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.selectedTitle).toBeDefined();
    expect(data.metadataQualityScore).toBeGreaterThan(0);
  });

  it('POST /api/workspaces/default/content/item_1/quality-review performs AI quality review', async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/default/content/item_1/quality-review`, {
      method: 'POST',
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.score).toBeGreaterThan(0);
  });

  it('POST /api/workspaces/default/content/item_1/schedule creates a publishing job', async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/default/content/item_1/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ privacyStatus: 'public' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe('scheduled');
  });

  it('GET /api/workspaces/default/approvals returns approval queue', async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/default/approvals`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('POST /api/workspaces/default/approvals/appr_1/approve approves content item', async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/default/approvals/appr_1/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback: 'Approved by test' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe('approved');
  });

  it('GET /api/workspaces/default/analytics/summary returns analytics metrics', async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/default/analytics/summary`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.views).toBeGreaterThanOrEqual(0);
    expect(data.ctr).toBeGreaterThanOrEqual(0);
  });

  it('POST /api/workspaces/default/telegram/link returns one-time linking code', async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/default/telegram/link`, {
      method: 'POST',
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.linkCode).toBeDefined();
  });

  it('POST /api/workspaces/default/telegram/test sends notification successfully', async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/default/telegram/test`, {
      method: 'POST',
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('GET /api/workspaces/default/youtube/channel returns channel metadata', async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/default/youtube/channel`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.channelId).toBeDefined();
    expect(data.channelTitle).toBeDefined();
  });

  it('GET /api/workspaces/default/activity returns audit activity logs', async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/default/activity`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });
});
