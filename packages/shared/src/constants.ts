// ============================================
// Jpilot — Shared Constants
// ============================================

/** Product information */
export const PRODUCT = {
  NAME: 'Jpilot',
  DESCRIPTION: 'AI yordamida YouTube kanalni boshqarish tizimi',
  VERSION: '0.1.0',
  UI_LANGUAGE: 'uz',
  CONTENT_LANGUAGE: 'en',
} as const;

/** Legal disclaimer — must be shown in the application */
export const DISCLAIMER =
  'Jpilot mavjud analitikaga asoslanib kontentni optimizatsiya qilishi mumkin, lekin YouTube tavsiyalari, viral natijalar, ko\'rishlar, obunachilar yoki daromadni kafolatlay olmaydi.';

export const DISCLAIMER_EN =
  'Jpilot can optimize content based on available analytics, but it cannot guarantee YouTube recommendations, viral results, views, subscribers, or revenue.';


/** Default configuration values */
export const DEFAULTS = {
  DAILY_UPLOAD_TARGET: 2,
  TIMEZONE: 'Asia/Tashkent',
  APPROVAL_MODE: 'manual' as const,
  VIDEO_FORMAT: 'both' as const,
  ENGLISH_VARIANT: 'us' as const,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_TAGS_TOTAL_LENGTH: 500,
  MAX_TAGS_COUNT: 20,
  THUMBNAIL_WIDTH: 1280,
  THUMBNAIL_HEIGHT: 720,
  SHORTS_MAX_DURATION_SECONDS: 60,
  /** Optimal publishing windows for US audience (UTC hours) */
  PUBLISHING_WINDOWS_UTC: [14, 21],
} as const;

/** YouTube API quota costs */
export const YOUTUBE_QUOTA = {
  VIDEOS_INSERT: 1, // per dedicated bucket (100/day limit)
  VIDEOS_INSERT_DAILY_LIMIT: 100,
  VIDEOS_UPDATE: 50,
  VIDEOS_LIST: 1,
  CHANNELS_LIST: 1,
  CHANNELS_UPDATE: 50,
  THUMBNAILS_SET: 50,
  SEARCH_LIST: 1, // per dedicated bucket (100/day limit)
  GENERAL_DAILY_LIMIT: 10000,
} as const;

/** YouTube OAuth scopes — minimum required */
export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
] as const;

/** Job retry configuration */
export const JOB_RETRY = {
  MAX_ATTEMPTS: 5,
  INITIAL_DELAY_MS: 1000,
  MAX_DELAY_MS: 300_000, // 5 minutes
  BACKOFF_MULTIPLIER: 2,
} as const;

/** Analytics sync intervals */
export const ANALYTICS_INTERVALS = {
  /** First sync after publishing (hours) */
  FIRST_SYNC_HOURS: 6,
  /** Regular sync interval (hours) */
  REGULAR_SYNC_HOURS: 24,
  /** Detailed sync period (days after publish) */
  DETAILED_PERIOD_DAYS: 7,
} as const;

/** Content quality review thresholds */
export const QUALITY_THRESHOLDS = {
  MIN_TITLE_LENGTH: 20,
  MAX_TITLE_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 100,
  MIN_TAGS_COUNT: 5,
  MAX_TAGS_COUNT: 20,
  MIN_HOOK_DURATION_SECONDS: 5,
  MAX_HOOK_DURATION_SECONDS: 15,
  /** CTR below this is considered underperforming */
  LOW_CTR_THRESHOLD: 0.03,
  /** CTR above this is considered high-performing */
  HIGH_CTR_THRESHOLD: 0.08,
  /** Average view duration percentage below this needs attention */
  LOW_RETENTION_THRESHOLD: 0.30,
  HIGH_RETENTION_THRESHOLD: 0.50,
} as const;

/** High CPM target countries (by language market, NOT guaranteed revenue) */
export const TARGET_MARKETS = [
  { code: 'US', name: 'United States', language: 'en' },
  { code: 'GB', name: 'United Kingdom', language: 'en' },
  { code: 'CA', name: 'Canada', language: 'en' },
  { code: 'AU', name: 'Australia', language: 'en' },
  { code: 'NZ', name: 'New Zealand', language: 'en' },
  { code: 'IE', name: 'Ireland', language: 'en' },
] as const;
