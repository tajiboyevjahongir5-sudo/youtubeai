/**
 * Content Duplication & Remix Service
 * Clone existing content items with optional angle/topic modification
 */

import { contentStore, ContentItemRecord } from './content-store.service';
import { v4 as uuidv4 } from 'uuid';

export interface DuplicateOptions {
  newAngle?: string;
  newFormat?: 'shorts' | 'long_form';
  prefixTitle?: string;
}

export function duplicateContent(
  sourceId: string,
  workspaceId: string,
  options: DuplicateOptions = {}
): ContentItemRecord | null {
  const source = contentStore.getById(sourceId);
  if (!source) return null;

  const newId = `item_${uuidv4().split('-')[0]}`;
  const now = new Date().toISOString();

  const titlePrefix = options.prefixTitle || '[REMIX]';
  const newTitle = options.newAngle
    ? options.newAngle
    : `${titlePrefix} ${source.title}`;

  const newItem: ContentItemRecord = {
    ...source,
    id: newId,
    title: newTitle,
    status: 'review',
    videoUrl: '',
    thumbnailUrl: undefined,
    videoFormat: options.newFormat || source.videoFormat || 'shorts',
    publishedAt: undefined,
    scheduledAt: undefined,
    youtubeVideoId: undefined,
    youtubeUrl: undefined,
    createdAt: now,
  };

  contentStore.setItem(newItem);
  console.log(`[ContentDuplicate] Klon yaratildi: ${sourceId} -> ${newId} ("${newTitle}")`);
  return newItem;
}

/**
 * Expand a Shorts item into a Long-form 16:9 version
 * Generates expanded script structure for 8-12 minute deep-dive
 */
export function expandShortsToLongform(
  sourceId: string,
  workspaceId: string
): ContentItemRecord | null {
  const source = contentStore.getById(sourceId);
  if (!source) return null;

  const newId = `item_${uuidv4().split('-')[0]}`;
  const now = new Date().toISOString();

  // Build expanded script from shorts script
  const originalScript = source.script || '';
  const expandedScript = buildExpandedScript(source.title, originalScript);

  // Build 7 scenes for longform
  const expandedScenes = buildLongformScenes(source.title);

  const newItem: ContentItemRecord = {
    ...source,
    id: newId,
    title: `[DEEP DIVE] ${source.title.replace('#Shorts', '').replace('#shorts', '').trim()} - Complete 2026 Masterclass`,
    status: 'review',
    videoUrl: '',
    thumbnailUrl: undefined,
    videoFormat: 'long_form',
    script: expandedScript,
    scenes: expandedScenes,
    duration: '10:15',
    durationSeconds: 615,
    publishedAt: undefined,
    scheduledAt: undefined,
    youtubeVideoId: undefined,
    youtubeUrl: undefined,
    createdAt: now,
  };

  contentStore.setItem(newItem);
  console.log(`[ShortsToLongform] Shorts -> 16:9 kengaytirildi: ${sourceId} -> ${newId}`);
  return newItem;
}

function buildExpandedScript(title: string, shortsScript: string): string {
  const cleanTitle = title.replace('#Shorts', '').replace('#shorts', '').trim();
  return `[INTRO - 0:00-0:45]
Host (energetic): "What if I told you that everything you know about ${cleanTitle.toLowerCase().includes('ai') ? 'AI development' : 'this technology'} is about to change dramatically? In this deep-dive masterclass, I'll walk you through every single detail — from architecture to real-world implementation."

[CHAPTER 1: THE PROBLEM - 0:45-2:30]
Host: "Let's start with why this matters RIGHT NOW. In the last 90 days alone..."
${shortsScript ? `\n--- Original Shorts Script (Reference) ---\n${shortsScript}\n--- End Reference ---\n` : ''}
[CHAPTER 2: THE SOLUTION LANDSCAPE - 2:30-4:15]
Host: "There are exactly 5 approaches being used by top engineering teams worldwide..."

[CHAPTER 3: LIVE DEMONSTRATION - 4:15-6:30]
Host: "Now let me SHOW you exactly how this works in practice. Watch carefully..."

[CHAPTER 4: ADVANCED TECHNIQUES - 6:30-8:00]
Host: "Here's where it gets really interesting. The top 1% of developers are doing something most people don't even know about..."

[CHAPTER 5: BENCHMARK & RESULTS - 8:00-9:15]
Host: "The numbers don't lie. Let me show you the actual benchmark results..."

[OUTRO & CTA - 9:15-10:15]
Host: "If you found this masterclass valuable, smash that subscribe button and turn on notifications. Drop a comment below — which technique will you implement first? See you in the next deep-dive."`;
}

function buildLongformScenes(title: string): any[] {
  return [
    { id: 'sc_intro', title: 'Cinematic Intro & Hook', time: 0, tag: 'INTRO', overlayText: title },
    { id: 'sc_ch1', title: 'Chapter 1: The Problem', time: 45, tag: 'MUAMMO' },
    { id: 'sc_ch2', title: 'Chapter 2: Solution Landscape', time: 150, tag: 'YECHIM' },
    { id: 'sc_ch3', title: 'Chapter 3: Live Demo', time: 255, tag: 'DEMO' },
    { id: 'sc_ch4', title: 'Chapter 4: Advanced Techniques', time: 390, tag: 'ILGOR' },
    { id: 'sc_ch5', title: 'Chapter 5: Benchmarks', time: 480, tag: 'NATIJA' },
    { id: 'sc_outro', title: 'CTA & Subscribe Outro', time: 555, tag: 'CTA' },
  ];
}
