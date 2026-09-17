import { describe, it, expect } from 'vitest';
import {
  PRODUCT,
  DISCLAIMER,
  DISCLAIMER_EN,
  DEFAULTS,
  YOUTUBE_QUOTA,
  ContentStatus,
  VideoFormat,
  ConfidenceLevel,
  ApprovalMode,
  EnglishVariant,
  uz,
} from '../packages/shared/src/index.js';

describe('Shared Package Constants & Enums', () => {
  it('has correct product configuration', () => {
    expect(PRODUCT.NAME).toBe('Jpilot');
    expect(PRODUCT.UI_LANGUAGE).toBe('uz');
    expect(PRODUCT.CONTENT_LANGUAGE).toBe('en');
  });

  it('contains obligatory legal disclaimers without viral/recommendation guarantees', () => {
    expect(DISCLAIMER).toContain('YouTube tavsiyalari');
    expect(DISCLAIMER).toContain('daromadni kafolatlay olmaydi');
    expect(DISCLAIMER_EN).toContain('cannot guarantee YouTube recommendations');
  });

  it('has correct upload target defaults', () => {
    expect(DEFAULTS.DAILY_UPLOAD_TARGET).toBe(2);
    expect(DEFAULTS.TIMEZONE).toBe('Asia/Tashkent');
    expect(DEFAULTS.APPROVAL_MODE).toBe('manual');
    expect(DEFAULTS.PUBLISHING_WINDOWS_UTC).toEqual([14, 21]);
  });

  it('defines valid YouTube quotas and limits', () => {
    expect(YOUTUBE_QUOTA.VIDEOS_INSERT_DAILY_LIMIT).toBe(100);
    expect(YOUTUBE_QUOTA.VIDEOS_INSERT).toBe(1);
    expect(YOUTUBE_QUOTA.GENERAL_DAILY_LIMIT).toBe(10000);
  });

  it('contains all lifecycle states for content items', () => {
    expect(ContentStatus.IDEA).toBe('idea');
    expect(ContentStatus.AWAITING_APPROVAL).toBe('awaiting_approval');
    expect(ContentStatus.SCHEDULED).toBe('scheduled');
    expect(ContentStatus.PUBLISHED).toBe('published');
    expect(ContentStatus.ANALYZED).toBe('analyzed');
  });

  it('has full Uzbek UI translations loaded', () => {
    expect(uz.productName).toBe('Jpilot');
    expect(uz.nav.dashboard).toBe('Boshqaruv paneli');
    expect(uz.nav.content).toBe('Kontent');
    expect(uz.nav.analytics).toBe('Analitika');
    expect(uz.nav.strategy).toBe('Strategiya');
    expect(uz.onboarding.cpmWarning).toBeDefined();
  });
});
