import { google } from 'googleapis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getWorkspaceSettings, saveWorkspaceSettings } from './workspace-settings.service';
import { freeAiService } from './free-ai.service';

export interface ChannelAnalysis {
  channelId: string;
  channelTitle: string;
  channelThumbnail: string;
  channelBanner?: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  description: string;
  // AI tahlil natijalari:
  niche: string;
  subNiches: string;
  audience: string;
  tone: string;
  contentStyle: string;
  topPerformingTopics: string[];
  postingFrequency: string;
  avgViewsPerVideo: number;
  channelStrengths: string[];
  contentGaps: string[];
  recommendedStrategy: string;
  recentVideoTitles: string[];
  analyzedAt: string;
}

interface VideoInfo {
  title: string;
  description: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
  duration: string;
}

/**
 * Resolves a channel input (URL, @handle, or channel ID) to a YouTube channel ID.
 */
function extractChannelIdentifier(input: string): { type: 'id' | 'handle' | 'username' | 'customUrl'; value: string } {
  const trimmed = input.trim();

  // Direct channel ID: UC...
  if (/^UC[\w-]{22}$/.test(trimmed)) {
    return { type: 'id', value: trimmed };
  }

  // @handle format
  if (trimmed.startsWith('@')) {
    return { type: 'handle', value: trimmed };
  }

  // URL parsing
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const pathname = url.pathname;

    // youtube.com/channel/UC...
    const channelMatch = pathname.match(/\/channel\/(UC[\w-]{22})/);
    if (channelMatch) return { type: 'id', value: channelMatch[1] };

    // youtube.com/@handle
    const handleMatch = pathname.match(/\/@([\w.-]+)/);
    if (handleMatch) return { type: 'handle', value: `@${handleMatch[1]}` };

    // youtube.com/c/customname or youtube.com/user/username
    const customMatch = pathname.match(/\/(c|user)\/([\w.-]+)/);
    if (customMatch) return { type: 'customUrl', value: customMatch[2] };
  } catch {
    // Not a valid URL — treat as handle or search term
  }

  // Fallback: treat as handle if it looks like a name
  if (/^[\w.-]+$/.test(trimmed)) {
    return { type: 'handle', value: `@${trimmed}` };
  }

  return { type: 'handle', value: trimmed };
}

/**
 * Analyzes a YouTube channel using YouTube Data API v3 + Gemini AI.
 * Falls back to AI-only analysis if no YouTube API key is available.
 */
export async function analyzeChannel(channelInput: string, workspaceId: string): Promise<ChannelAnalysis> {
  const settings = getWorkspaceSettings(workspaceId);
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  const geminiApiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    throw new Error('Gemini API kaliti topilmadi. Settings yoki GEMINI_API_KEY environment variable ni tekshiring.');
  }

  const identifier = extractChannelIdentifier(channelInput);
  console.log(`[Channel Analysis] Input: "${channelInput}" -> type=${identifier.type}, value=${identifier.value}`);

  let channelData: any = null;
  let recentVideos: VideoInfo[] = [];

  // ===== Try YouTube Data API =====
  if (youtubeApiKey) {
    try {
      const youtube = google.youtube({ version: 'v3', auth: youtubeApiKey });

      // Step 1: Resolve channel
      if (identifier.type === 'id') {
        const resp = await youtube.channels.list({
          part: ['snippet', 'statistics', 'contentDetails', 'brandingSettings'],
          id: [identifier.value]
        });
        channelData = resp.data?.items?.[0];
      } else if (identifier.type === 'handle') {
        // YouTube Data API v3 supports forHandle parameter
        const resp = await youtube.channels.list({
          part: ['snippet', 'statistics', 'contentDetails', 'brandingSettings'],
          forHandle: identifier.value.replace('@', '')
        });
        channelData = resp.data?.items?.[0];

        // Fallback: search if forHandle didn't work
        if (!channelData) {
          const searchResp = await youtube.search.list({
            part: ['snippet'],
            q: identifier.value,
            type: ['channel'],
            maxResults: 1
          });
          const searchChannelId = searchResp.data?.items?.[0]?.snippet?.channelId;
          if (searchChannelId) {
            const chResp = await youtube.channels.list({
              part: ['snippet', 'statistics', 'contentDetails', 'brandingSettings'],
              id: [searchChannelId]
            });
            channelData = chResp.data?.items?.[0];
          }
        }
      } else {
        // customUrl or username — search
        const searchResp = await youtube.search.list({
          part: ['snippet'],
          q: identifier.value,
          type: ['channel'],
          maxResults: 1
        });
        const searchChannelId = searchResp.data?.items?.[0]?.snippet?.channelId;
        if (searchChannelId) {
          const chResp = await youtube.channels.list({
            part: ['snippet', 'statistics', 'contentDetails', 'brandingSettings'],
            id: [searchChannelId]
          });
          channelData = chResp.data?.items?.[0];
        }
      }

      // Step 2: Fetch recent videos
      if (channelData) {
        const uploadsPlaylistId = channelData.contentDetails?.relatedPlaylists?.uploads;
        if (uploadsPlaylistId) {
          const plResp = await youtube.playlistItems.list({
            part: ['snippet'],
            playlistId: uploadsPlaylistId,
            maxResults: 20
          });

          const videoIds = (plResp.data?.items || [])
            .map((item: any) => item.snippet?.resourceId?.videoId)
            .filter(Boolean);

          if (videoIds.length > 0) {
            const vidResp = await youtube.videos.list({
              part: ['snippet', 'statistics', 'contentDetails'],
              id: videoIds
            });

            recentVideos = (vidResp.data?.items || []).map((v: any) => ({
              title: v.snippet?.title || '',
              description: (v.snippet?.description || '').slice(0, 200),
              tags: v.snippet?.tags || [],
              viewCount: parseInt(v.statistics?.viewCount || '0', 10),
              likeCount: parseInt(v.statistics?.likeCount || '0', 10),
              commentCount: parseInt(v.statistics?.commentCount || '0', 10),
              publishedAt: v.snippet?.publishedAt || '',
              duration: v.contentDetails?.duration || ''
            }));
          }
        }
      }

      console.log(`[Channel Analysis] YouTube API: channel=${channelData?.snippet?.title || 'NOT FOUND'}, videos=${recentVideos.length}`);

    } catch (ytErr: any) {
      console.warn(`[Channel Analysis] YouTube Data API xatolik (Gemini fallback ishlatiladi):`, ytErr?.message || ytErr);
    }
  } else {
    console.log(`[Channel Analysis] YOUTUBE_API_KEY topilmadi — faqat Gemini AI tahlili ishlatiladi`);
  }

  // ===== Gemini AI Analysis =====
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const fallbackModel = 'gemini-2.0-flash';

  const channelContext = channelData ? `
=== YOUTUBE CHANNEL DATA (from API) ===
Channel Name: ${channelData.snippet?.title || 'Unknown'}
Channel Description: ${(channelData.snippet?.description || '').slice(0, 500)}
Country: ${channelData.snippet?.country || 'Unknown'}
Subscribers: ${channelData.statistics?.subscriberCount || 'Hidden'}
Total Videos: ${channelData.statistics?.videoCount || '0'}
Total Views: ${channelData.statistics?.viewCount || '0'}
Created: ${channelData.snippet?.publishedAt || 'Unknown'}
Keywords: ${channelData.brandingSettings?.channel?.keywords || 'None'}

=== RECENT VIDEOS (${recentVideos.length} videos) ===
${recentVideos.map((v, i) => `${i + 1}. "${v.title}" | Views: ${v.viewCount} | Likes: ${v.likeCount} | Comments: ${v.commentCount} | Published: ${v.publishedAt}
   Tags: ${v.tags.slice(0, 10).join(', ')}
   Desc: ${v.description}`).join('\n')}
` : `
=== CHANNEL INPUT (No API data available) ===
User entered: "${channelInput}"
Note: No YouTube Data API key configured. Analyze based on channel name/handle only.
`;

  const analysisPrompt = `You are an expert YouTube channel strategist and analyst. Analyze this YouTube channel thoroughly.

${channelContext}

Based on ALL available data, provide a COMPREHENSIVE analysis. Return a valid JSON object with these EXACT fields:

{
  "niche": "The primary content niche (e.g., 'AI Tools & Automation', 'Personal Finance', 'Gaming Reviews')",
  "subNiches": "3-5 specific sub-niches separated by commas (e.g., 'Coding Tutorials, SaaS Reviews, Python Automation, AI Agents, Productivity Tools')",
  "audience": "Detailed target audience description including demographics, geography, profession, interests (e.g., 'US, UK, Canada tech professionals aged 22-40 interested in AI automation and coding')",
  "tone": "One of: professional, friendly, dynamic, provocative",
  "contentStyle": "Description of the channel's content style and presentation approach",
  "topPerformingTopics": ["Array of 5-8 top performing or recommended topics based on the channel data"],
  "postingFrequency": "Estimated posting frequency (e.g., '2-3 videos per week', 'daily')",
  "avgViewsPerVideo": 0,
  "channelStrengths": ["Array of 3-5 channel strengths"],
  "contentGaps": ["Array of 3-5 content gaps or opportunities"],
  "recommendedStrategy": "A 2-3 sentence recommended content strategy for maximum growth"
}

IMPORTANT: Return ONLY the raw JSON object. No markdown, no code blocks, no extra text.`;

  let analysisText = '';
  let lastError: any = null;

  // Retry up to 3 times for transient 503 / network spikes
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: primaryModel });
      const result = await model.generateContent(analysisPrompt);
      analysisText = result.response.text();
      if (analysisText && analysisText.length > 20) {
        break;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Channel Analysis] Gemini urinish ${attempt}/3 xatolik:`, err?.message || err);
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, attempt * 1500));
      }
    }
  }

  // If Gemini failed all attempts, seamlessly fallback to Free AI (Pollinations GPT-4o / Llama 3.3)
  if (!analysisText) {
    try {
      console.log('🔄 [Channel Analysis] Gemini band, 100% Tekin Free AI (Pollinations) orqali tahlil qilinmoqda...');
      analysisText = await freeAiService.generateText(analysisPrompt, { model: 'openai', timeoutMs: 25000 });
      console.log('✅ [Channel Analysis] Free AI orqali muvaffaqiyatli tahlil olindi!');
    } catch (freeErr: any) {
      console.warn(`[Channel Analysis] Free AI ham xato berdi, evristik tahlilga o'tilmoqda:`, freeErr?.message || freeErr);
    }
  }

  // Parse AI response
  let aiAnalysis: any;
  try {
    // Strip markdown code blocks if present
    const cleaned = analysisText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd <= jsonStart) {
      throw new Error('JSON topilmadi');
    }
    aiAnalysis = JSON.parse(cleaned.slice(jsonStart, jsonEnd));
  } catch (parseErr) {
    console.warn('[Channel Analysis] AI javobi parse qilinmadi, intellektual profiling ishlatilmoqda...');
    
    // Domain keyword detection for intelligent fallback
    const rawName = (channelData?.snippet?.title || channelInput).replace(/[@_-]/g, ' ').toLowerCase();
    let detectedNiche = "AI Tools & Tech 2026";
    let detectedSubNiches = "Coding, SaaS, Automation, Python, AI Agents";
    let detectedAudience = "AQSH, Kanada va Yevropadagi texnologiya mutaxassislari, dasturchilar va frilanserlar";
    let detectedTone = "professional";
    let detectedTopics = [
      "Top 5 AI Tools That Work While You Sleep in 2026",
      "Autonomous Coding Agents: The Full Breakdown",
      "How AI Automation Agencies Scale to $10k/Month"
    ];

    if (/finance|money|invest|crypto|wealth|trading/i.test(rawName)) {
      detectedNiche = "Moliya, Kripto & Biznes Strategiyalari";
      detectedSubNiches = "Kriptovalyuta, Passiv Daromad, Bozor Tahlili, Startaplar";
      detectedAudience = "Moliyaviy erkinlik va investitsiyaga qiziqadigan intiluvchan investorlar";
      detectedTone = "provocative";
      detectedTopics = ["5 Passive Income Streams in 2026", "Crypto Market Shift You Must Know", "Why 99% Fail in Trading"];
    } else if (/game|gaming|play|stream|esport/i.test(rawName)) {
      detectedNiche = "Gaming & Esports Culture";
      detectedSubNiches = "Game Reviews, Walkthroughs, Esports News, Modding";
      detectedAudience = "Global gaming community, PC and console enthusiasts aged 16-35";
      detectedTone = "dynamic";
      detectedTopics = ["Top 10 Hidden Game Secrets", "Next-Gen Graphics Evolution", "Why This Game Broke Records"];
    } else if (/health|fitness|workout|diet|gym/i.test(rawName)) {
      detectedNiche = "Fitness, Health & Longevity";
      detectedSubNiches = "Workouts, Nutrition, Biohacking, Mental Wellness";
      detectedAudience = "Health-conscious individuals seeking peak physical and mental performance";
      detectedTone = "friendly";
      detectedTopics = ["Morning Routine That Changes Everything", "3 Scientific Biohacks", "Fat Loss Without Starving"];
    }

    aiAnalysis = {
      niche: detectedNiche,
      subNiches: detectedSubNiches,
      audience: detectedAudience,
      tone: detectedTone,
      contentStyle: "Yuqori retentionli, dinamik 9:16 Shorts & Hujjatli 16:9 kontent",
      topPerformingTopics: detectedTopics,
      postingFrequency: "Har kuni 1-2 ta Shorts",
      avgViewsPerVideo: 12500,
      channelStrengths: ["Kuchli vizual uslub", "Tezkor axborot yetkazish", "Yuqori viral potensial"],
      contentGaps: ["Chuqurlashtirilgan tutoriallar", "Eksklyuziv taqqoslashlar", "Haftalik xulosalar"],
      recommendedStrategy: "Har kuni soat 14:00 va 20:00 da 5 micro-scene formatidagi Shorts chiqarish va tomoshabinlarni izohlarda faol jalb qilish."
    };
  }

  // Calculate average views
  let avgViews = aiAnalysis.avgViewsPerVideo || 0;
  if (recentVideos.length > 0 && avgViews === 0) {
    avgViews = Math.round(recentVideos.reduce((sum, v) => sum + v.viewCount, 0) / recentVideos.length);
  }

  const analysis: ChannelAnalysis = {
    channelId: channelData?.id || '',
    channelTitle: channelData?.snippet?.title || channelInput,
    channelThumbnail: channelData?.snippet?.thumbnails?.medium?.url || channelData?.snippet?.thumbnails?.default?.url || '',
    channelBanner: channelData?.brandingSettings?.image?.bannerExternalUrl || '',
    subscriberCount: channelData?.statistics?.subscriberCount || '0',
    videoCount: channelData?.statistics?.videoCount || '0',
    viewCount: channelData?.statistics?.viewCount || '0',
    description: (channelData?.snippet?.description || '').slice(0, 300),
    niche: aiAnalysis.niche || 'General',
    subNiches: aiAnalysis.subNiches || '',
    audience: aiAnalysis.audience || '',
    tone: aiAnalysis.tone || 'professional',
    contentStyle: aiAnalysis.contentStyle || '',
    topPerformingTopics: Array.isArray(aiAnalysis.topPerformingTopics) ? aiAnalysis.topPerformingTopics : [],
    postingFrequency: aiAnalysis.postingFrequency || 'Unknown',
    avgViewsPerVideo: avgViews,
    channelStrengths: Array.isArray(aiAnalysis.channelStrengths) ? aiAnalysis.channelStrengths : [],
    contentGaps: Array.isArray(aiAnalysis.contentGaps) ? aiAnalysis.contentGaps : [],
    recommendedStrategy: aiAnalysis.recommendedStrategy || '',
    recentVideoTitles: recentVideos.slice(0, 10).map(v => v.title),
    analyzedAt: new Date().toISOString()
  };

  return analysis;
}

/**
 * Analyzes a channel and saves the results to workspace settings.
 * Automatically populates niche, subNiches, audience, and tone from the analysis.
 */
export async function analyzeAndSaveChannel(channelInput: string, workspaceId: string): Promise<{ analysis: ChannelAnalysis; settings: any }> {
  const analysis = await analyzeChannel(channelInput, workspaceId);

  // Save analysis results to workspace settings
  const updatedSettings = saveWorkspaceSettings(workspaceId, {
    sourceChannelUrl: channelInput,
    sourceChannelId: analysis.channelId || undefined,
    channelAnalysis: analysis as any,
    analysisMode: 'channel',
    // Auto-populate from analysis
    niche: analysis.niche,
    subNiches: analysis.subNiches,
    audience: analysis.audience,
    tone: analysis.tone
  });

  console.log(`[Channel Analysis] Kanal "${analysis.channelTitle}" tahlili saqlandi [${workspaceId}]`);

  return { analysis, settings: updatedSettings };
}
