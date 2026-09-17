import { pgTable, text, timestamp, boolean, jsonb, integer, real, date, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const workspaceRoleEnum = pgEnum('workspace_role', ['owner', 'admin', 'member']);
export const connectionStatusEnum = pgEnum('connection_status', ['disconnected', 'connected', 'error']);
export const englishVariantEnum = pgEnum('english_variant', ['us', 'uk', 'global']);
export const videoFormatEnum = pgEnum('video_format', ['shorts', 'long_form']);
export const approvalModeEnum = pgEnum('approval_mode', ['manual', 'auto']);
export const aiProviderEnum = pgEnum('ai_provider', ['gemini', 'openai', 'claude']);
export const contentPillarTypeEnum = pgEnum('content_pillar_type', ['educational', 'entertaining', 'promotional']);
export const contentStatusEnum = pgEnum('content_status', ['idea', 'scripting', 'storyboarding', 'generating', 'review', 'approved', 'scheduled', 'published', 'failed']);
export const confidenceLevelEnum = pgEnum('confidence_level', ['low', 'medium', 'high']);
export const privacyStatusEnum = pgEnum('privacy_status', ['public', 'private', 'unlisted']);
export const publishingJobStatusEnum = pgEnum('publishing_job_status', ['pending', 'processing', 'completed', 'failed']);
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected']);
export const jobStatusEnum = pgEnum('job_status', ['pending', 'processing', 'completed', 'failed']);
export const jobTypeEnum = pgEnum('job_type', ['generate_script', 'generate_video', 'publish_video', 'sync_analytics']);
export const auditActionEnum = pgEnum('audit_action', ['create', 'update', 'delete', 'login', 'generate']);

// Tables
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  ownerId: text('owner_id').references(() => users.id).notNull(),
  niche: text('niche'),
  timezone: text('timezone'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workspaceMembers = pgTable('workspace_members', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  role: workspaceRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const youtubeChannels = pgTable('youtube_channels', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  channelId: text('channel_id').notNull(),
  channelTitle: text('channel_title'),
  thumbnailUrl: text('thumbnail_url'),
  subscriberCount: integer('subscriber_count'),
  videoCount: integer('video_count'),
  viewCount: integer('view_count'),
  connectionStatus: connectionStatusEnum('connection_status').notNull(),
  lastSyncAt: timestamp('last_sync_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const youtubeOauthConnections = pgTable('youtube_oauth_connections', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  accessTokenEncrypted: text('access_token_encrypted').notNull(),
  refreshTokenEncrypted: text('refresh_token_encrypted'),
  tokenExpiresAt: timestamp('token_expires_at'),
  scopes: text('scopes').array(),
  channelId: text('channel_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const telegramConnections = pgTable('telegram_connections', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  chatId: text('chat_id'),
  username: text('username'),
  connectionStatus: connectionStatusEnum('connection_status').notNull(),
  linkCode: text('link_code'),
  linkCodeExpiresAt: timestamp('link_code_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const channelSettings = pgTable('channel_settings', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id).unique().notNull(),
  niche: text('niche'),
  subNiches: text('sub_niches').array(),
  audienceProfile: text('audience_profile'),
  toneOfVoice: text('tone_of_voice'),
  englishVariant: englishVariantEnum('english_variant'),
  forbiddenTopics: text('forbidden_topics').array(),
  brandWords: text('brand_words').array(),
  wordsToAvoid: text('words_to_avoid').array(),
  targetVideoLengthMinutes: integer('target_video_length_minutes'),
  dailyUploadTarget: integer('daily_upload_target'),
  publishingWindowsUtc: integer('publishing_windows_utc').array(),
  timezone: text('timezone'),
  videoFormat: videoFormatEnum('video_format'),
  approvalMode: approvalModeEnum('approval_mode'),
  monetizationSafe: boolean('monetization_safe').default(true),
  contentPillarTypes: text('content_pillar_types').array(),
  targetMarkets: text('target_markets').array(),
  aiProvider: aiProviderEnum('ai_provider'),
  videoProvider: text('video_provider'), // ENUM?
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contentPillars = pgTable('content_pillars', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: contentPillarTypeEnum('type').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contentIdeas = pgTable('content_ideas', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  title: text('title').notNull(),
  contentPillar: contentPillarTypeEnum('content_pillar'),
  viewerProblem: text('viewer_problem'),
  targetAudience: text('target_audience'),
  hook: text('hook'),
  suggestedStructure: text('suggested_structure'),
  expectedLengthMinutes: integer('expected_length_minutes'),
  videoFormat: videoFormatEnum('video_format'),
  riskFlags: text('risk_flags').array(),
  originalityNote: text('originality_note'),
  relevanceReason: text('relevance_reason'),
  confidenceLevel: confidenceLevelEnum('confidence_level'),
  evidence: text('evidence'),
  status: contentStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contentItems = pgTable('content_items', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  ideaId: text('idea_id').references(() => contentIdeas.id),
  status: contentStatusEnum('status').notNull(),
  videoFormat: videoFormatEnum('video_format'),
  title: text('title'),
  description: text('description'),
  contentPillar: contentPillarTypeEnum('content_pillar'),
  scheduledAt: timestamp('scheduled_at'),
  publishedAt: timestamp('published_at'),
  youtubeVideoId: text('youtube_video_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const scripts = pgTable('scripts', {
  id: text('id').primaryKey(),
  contentItemId: text('content_item_id').references(() => contentItems.id).notNull(),
  hook: text('hook'),
  fullScript: text('full_script'),
  scenes: jsonb('scenes'),
  closingCta: text('closing_cta'),
  factCheckNotes: text('fact_check_notes').array(),
  copyrightRiskNotes: text('copyright_risk_notes').array(),
  syntheticMediaDisclosure: boolean('synthetic_media_disclosure').default(false),
  aiProvider: aiProviderEnum('ai_provider'),
  aiModel: text('ai_model'),
  version: integer('version').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const storyboards = pgTable('storyboards', {
  id: text('id').primaryKey(),
  contentItemId: text('content_item_id').references(() => contentItems.id).notNull(),
  scenes: jsonb('scenes'),
  version: integer('version'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const mediaAssets = pgTable('media_assets', {
  id: text('id').primaryKey(),
  contentItemId: text('content_item_id').references(() => contentItems.id).notNull(),
  type: text('type').notNull(), // ENUM?
  storagePath: text('storage_path'),
  mimeType: text('mime_type'),
  sizeBytes: integer('size_bytes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const thumbnails = pgTable('thumbnails', {
  id: text('id').primaryKey(),
  contentItemId: text('content_item_id').references(() => contentItems.id).notNull(),
  prompt: text('prompt'),
  textOptions: text('text_options').array(),
  storagePath: text('storage_path'),
  selected: boolean('selected').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const videoMetadata = pgTable('video_metadata', {
  id: text('id').primaryKey(),
  contentItemId: text('content_item_id').references(() => contentItems.id).notNull(),
  titleVariations: text('title_variations').array(),
  selectedTitle: text('selected_title'),
  description: text('description'),
  tags: text('tags').array(),
  hashtags: text('hashtags').array(),
  chapters: jsonb('chapters'),
  pinnedComment: text('pinned_comment'),
  thumbnailPrompt: text('thumbnail_prompt'),
  thumbnailTextOptions: text('thumbnail_text_options').array(),
  metadataQualityScore: integer('metadata_quality_score'),
  policyRiskFlags: text('policy_risk_flags').array(),
  category: text('category'),
  defaultLanguage: text('default_language').default('en'),
  version: integer('version'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const publishingJobs = pgTable('publishing_jobs', {
  id: text('id').primaryKey(),
  contentItemId: text('content_item_id').references(() => contentItems.id).notNull(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  status: publishingJobStatusEnum('status').notNull(),
  scheduledAt: timestamp('scheduled_at'),
  privacyStatus: privacyStatusEnum('privacy_status'),
  attemptCount: integer('attempt_count').default(0),
  maxAttempts: integer('max_attempts').default(5),
  lastError: text('last_error'),
  idempotencyKey: text('idempotency_key').unique(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const publishedVideos = pgTable('published_videos', {
  id: text('id').primaryKey(),
  contentItemId: text('content_item_id').references(() => contentItems.id).notNull(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  youtubeVideoId: text('youtube_video_id').notNull(),
  publishedAt: timestamp('published_at'),
  privacyStatus: privacyStatusEnum('privacy_status'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const analyticsSnapshots = pgTable('analytics_snapshots', {
  id: text('id').primaryKey(),
  publishedVideoId: text('published_video_id').references(() => publishedVideos.id).notNull(),
  contentItemId: text('content_item_id').references(() => contentItems.id).notNull(),
  snapshotDate: date('snapshot_date').notNull(),
  views: integer('views'),
  impressions: integer('impressions'),
  impressionsCtr: real('impressions_ctr'),
  watchTimeMinutes: real('watch_time_minutes'),
  avgViewDurationSeconds: real('avg_view_duration_seconds'),
  avgPercentageViewed: real('avg_percentage_viewed'),
  likes: integer('likes'),
  comments: integer('comments'),
  shares: integer('shares'),
  subscribersGained: integer('subscribers_gained'),
  subscribersLost: integer('subscribers_lost'),
  trafficSources: jsonb('traffic_sources'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const analyticsInsights = pgTable('analytics_insights', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  whatWorked: text('what_worked').array(),
  whatFailed: text('what_failed').array(),
  likelyReasons: text('likely_reasons').array(),
  confidenceLevel: confidenceLevelEnum('confidence_level'),
  evidence: text('evidence'),
  recommendedChanges: text('recommended_changes').array(),
  patternsToRepeat: text('patterns_to_repeat').array(),
  patternsToAvoid: text('patterns_to_avoid').array(),
  experimentsToRun: text('experiments_to_run').array(),
  conclusionStrength: confidenceLevelEnum('conclusion_strength'), // Assuming same enum
  relatedVideoIds: text('related_video_ids').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const strategyMemory = pgTable('strategy_memory', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  lesson: text('lesson'),
  supportingMetrics: jsonb('supporting_metrics'),
  relatedVideoIds: text('related_video_ids').array(),
  confidenceLevel: confidenceLevelEnum('confidence_level'),
  active: boolean('active').default(true),
  lastReviewedAt: timestamp('last_reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const approvalRequests = pgTable('approval_requests', {
  id: text('id').primaryKey(),
  contentItemId: text('content_item_id').references(() => contentItems.id).notNull(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  status: approvalStatusEnum('status').notNull(),
  requestedAt: timestamp('requested_at'),
  respondedAt: timestamp('responded_at'),
  respondedBy: text('responded_by'),
  feedback: text('feedback'),
  telegramMessageId: text('telegram_message_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const backgroundJobs = pgTable('background_jobs', {
  id: text('id').primaryKey(),
  type: jobTypeEnum('type').notNull(),
  status: jobStatusEnum('status').notNull(),
  priority: integer('priority'),
  attemptCount: integer('attempt_count').default(0),
  maxAttempts: integer('max_attempts').default(5),
  payload: jsonb('payload'),
  result: jsonb('result'),
  scheduledAt: timestamp('scheduled_at'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  lastError: text('last_error'),
  idempotencyKey: text('idempotency_key').unique(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  contentItemId: text('content_item_id').references(() => contentItems.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  action: auditActionEnum('action').notNull(),
  details: jsonb('details'),
  performedBy: text('performed_by'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const integrationErrors = pgTable('integration_errors', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  integration: text('integration'),
  errorCode: text('error_code'),
  errorMessage: text('error_message'),
  details: jsonb('details'),
  resolved: boolean('resolved').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usageEvents = pgTable('usage_events', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').references(() => workspaces.id).notNull(),
  eventType: text('event_type'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
