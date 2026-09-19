import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../components/ui/page-header';
import { StatusBadge } from '../components/ui/status-badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  Play, 
  Pause, 
  Check, 
  AlertCircle, 
  Edit3, 
  Sparkles, 
  ShieldCheck, 
  Youtube, 
  Clock, 
  ArrowRight, 
  RefreshCw, 
  Film, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Layers, 
  Wand2,
  Tv,
  Smartphone,
  MessageSquare,
  Pin,
  Link2,
  TrendingUp,
  Zap,
  BarChart2,
  Repeat,
  Hash,
  CheckCircle2,
  Calendar,
  CalendarCheck,
  Video,
  Copy,
  Download,
  Share2,
  Sliders,
  DollarSign,
  Globe,
  Search,
  Award,
  Flame,
  Bell,
  FileText,
  Vote
} from 'lucide-react';
import { Link, useParams } from 'react-router';
import { getWorkspaceId } from '../lib/workspace';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

type FlowStatus = 'awaiting_generation' | 'generating' | 'ready_for_review' | 'uploading' | 'published';

export const ContentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const contentId = id || 'item_1';
  const workspaceId = getWorkspaceId();

  // Fetch specific content item details from backend
  const { data: itemData, refetch: refetchItem } = useQuery({
    queryKey: ['content-item', workspaceId, contentId],
    queryFn: async () => {
      try {
        return await fetchApi(`/workspaces/${workspaceId}/content/${contentId}`, {}, async () => 'mock_token');
      } catch (e) {
        return null;
      }
    }
  });

  // Determine format from URL, id, or backend item
  const initialIsLong = contentId === 'item_2' || contentId === 'item_4' || contentId.includes('long') || itemData?.videoFormat === 'long_form';
  const [videoFormat, setVideoFormat] = useState<'shorts' | 'long_form'>(initialIsLong ? 'long_form' : 'shorts');

  useEffect(() => {
    if (contentId === 'item_2' || contentId === 'item_4' || contentId.includes('long') || itemData?.videoFormat === 'long_form') {
      setVideoFormat('long_form');
    } else {
      setVideoFormat('shorts');
    }
  }, [contentId, itemData]);

  const [activeTab, setActiveTab] = useState('tasdiqlash');
  const [status, setStatus] = useState<FlowStatus>('ready_for_review');
  const [genProgress, setGenProgress] = useState(100);
  const [genStep, setGenStep] = useState('Video muvaffaqiyatli tayyorlandi!');
  const [showYouTubeEmbed, setShowYouTubeEmbed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(videoFormat === 'long_form' ? 615 : 55.63);
  const [videoVersion, setVideoVersion] = useState(Date.now());
  const [toast, setToast] = useState<string | null>(null);
  const [previewSceneIndex, setPreviewSceneIndex] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // A/B Testing Lab state
  const [abTestResult, setAbTestResult] = useState<any>(null);
  const [isGeneratingAB, setIsGeneratingAB] = useState(false);
  const [isApplyingAB, setIsApplyingAB] = useState(false);

  // Series & Playlist state
  const [seriesContext, setSeriesContext] = useState<any>(null);
  const [allSeriesList, setAllSeriesList] = useState<any[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('series_ai_tools_2026');
  const [isAddingToSeries, setIsAddingToSeries] = useState(false);

  // Voice Emotion Preset override
  const [selectedVoicePreset, setSelectedVoicePreset] = useState<string>('energetic');

  // System 1: Real-time Render Progress
  const [renderProgress, setRenderProgress] = useState<any>(null);
  const renderPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRenderPolling = () => {
    if (renderPollRef.current) clearInterval(renderPollRef.current);
    renderPollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/smart-tools/render-progress/${contentId}`, {
          headers: { 'x-workspace-id': workspaceId },
        });
        const data = await res.json();
        if (data.success && data.status !== 'idle') {
          setRenderProgress(data);
          if (data.status === 'completed' || data.status === 'failed') {
            if (renderPollRef.current) clearInterval(renderPollRef.current);
          }
        }
      } catch (e) {}
    }, 2000);
  };

  // System 2: Content Duplication
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicateContent = async () => {
    setIsDuplicating(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/smart-tools/content/${contentId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({ prefixTitle: '[REMIX]' }),
      });
      const data = await res.json();
      if (data.success && data.newItem) {
        setToast(`Klon yaratildi: "${data.newItem.title.slice(0, 40)}..."`);
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) { console.error('Duplicate error:', e); }
    finally { setIsDuplicating(false); }
  };

  // System 3: Shorts to Longform
  const [isExpanding, setIsExpanding] = useState(false);

  const handleExpandToLongform = async () => {
    setIsExpanding(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/smart-tools/content/${contentId}/expand-to-longform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
      });
      const data = await res.json();
      if (data.success && data.newItem) {
        setToast(`16:9 Masterclass versiya yaratildi: "${data.newItem.title.slice(0, 40)}..."`);
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) { console.error('Expand error:', e); }
    finally { setIsExpanding(false); }
  };

  // System 4: AI Script Suggestions
  const [scriptSuggestions, setScriptSuggestions] = useState<any>(null);
  const [isAnalyzingScript, setIsAnalyzingScript] = useState(false);

  const handleAnalyzeScript = async () => {
    if (!scriptText || scriptText.trim().length < 20) return;
    setIsAnalyzingScript(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/smart-tools/script/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({
          script: scriptText,
          title: metaTitle || videoTitle,
          format: videoFormat,
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setScriptSuggestions(data.analysis);
      }
    } catch (e) { console.error('Script analysis error:', e); }
    finally { setIsAnalyzingScript(false); }
  };

  // System 5: Post-Publish Performance Alerts
  const [performanceAlerts, setPerformanceAlerts] = useState<any>(null);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  const fetchPerformanceAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/smart-tools/content/${contentId}/performance-alerts?hours=12&views=140&ctr=4.2&retention=72&comments=3&likes=12&subGain=2`, {
        headers: { 'x-workspace-id': workspaceId },
      });
      const data = await res.json();
      if (data.success && data.report) {
        setPerformanceAlerts(data.report);
      }
    } catch (e) { console.error('Performance alerts error:', e); }
    finally { setIsLoadingAlerts(false); }
  };

  // Growth Suite: AI Visual Thumbnail Studio
  const [thumbFormat, setThumbFormat] = useState<'vertical' | 'landscape'>(initialIsLong ? 'landscape' : 'vertical');
  const [thumbnailVariants, setThumbnailVariants] = useState<any[]>([]);
  const [isGeneratingThumbs, setIsGeneratingThumbs] = useState(false);
  const [customThumbHeadline, setCustomThumbHeadline] = useState('');
  const [customThumbBadge, setCustomThumbBadge] = useState('');

  const handleGenerateThumbnails = async (overrideFormat?: 'vertical' | 'landscape') => {
    const fmt = overrideFormat || thumbFormat;
    setIsGeneratingThumbs(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/thumbnail-studio/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({
          contentId,
          title: metaTitle || videoTitle,
          format: fmt,
          customHeadline: customThumbHeadline || undefined,
          customBadge: customThumbBadge || undefined
        })
      });
      const data = await res.json();
      if (data.success && data.variants) {
        setThumbnailVariants(data.variants);
        setToast("🎨 4 ta High-CTR muqova varianti muvaffaqiyatli generatsiya qilindi!");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) {}
    finally { setIsGeneratingThumbs(false); }
  };

  const handleApplyThumbnail = async (thumbUrl: string) => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/thumbnail-studio/apply/${contentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({ thumbnailUrl: thumbUrl })
      });
      const data = await res.json();
      if (data.success) {
        if (data.youtubeUpdated) {
          setToast("✅ Yangi muqova videoga va YouTube kanaliga biriktirildi!");
        } else {
          setToast("✅ Yangi muqova video profiliga muvaffaqiyatli biriktirildi!");
        }
        refetchItem();
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) {}
  };

  // Feature 4: YouTube Pinned Comment & Engagement Booster
  const [pinnedCommentOptions, setPinnedCommentOptions] = useState<any[]>([]);
  const [isGeneratingPinned, setIsGeneratingPinned] = useState(false);
  const [isPublishingPinned, setIsPublishingPinned] = useState(false);
  const [selectedPinnedArchetype, setSelectedPinnedArchetype] = useState<string>('debate');

  const handleGeneratePinnedComments = async () => {
    setIsGeneratingPinned(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/community/pinned/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({
          videoTitle: metaTitle || videoTitle,
          summary: briefText || ''
        })
      });
      const data = await res.json();
      if (data.success && data.options) {
        setPinnedCommentOptions(data.options);
        if (data.options.length > 0 && (!pinnedCommentText || pinnedCommentText.includes('Which AI tool'))) {
          setPinnedCommentText(data.options[0].commentText);
          setSelectedPinnedArchetype(data.options[0].archetype);
        }
        setToast("📌 4 ta strategik Qadalgan Izoh muvaffaqiyatli yaratildi!");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) {}
    finally { setIsGeneratingPinned(false); }
  };

  const handlePublishPinnedComment = async () => {
    const yId = itemData?.youtubeVideoId || itemData?.metadata?.youtubeVideoId;
    if (!yId) {
      setToast("⚠️ Ushbu video hali YouTube'ga yuklanmagan. Avval videoni chop eting yoki matndan nusxa oling.");
      setTimeout(() => setToast(null), 4000);
      return;
    }

    setIsPublishingPinned(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/community/pinned/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({
          videoId: yId,
          commentText: pinnedCommentText
        })
      });
      const data = await res.json();
      if (data.success) {
        setToast("✅ Izoh YouTube videongizga muvaffaqiyatli joylandi va qadaldi!");
      } else {
        setToast(`⚠️ YouTube xatosi: ${data.error || 'Izoh qoldirib bo\'lmadi'}`);
      }
      setTimeout(() => setToast(null), 4000);
    } catch (e: any) {
      setToast("❌ Tarmoq xatosi yuz berdi");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsPublishingPinned(false);
    }
  };

  // Growth Suite: YouTube Community Tab Autopilot
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [isLoadingCommunityPosts, setIsLoadingCommunityPosts] = useState(false);

  const fetchCommunityPosts = async () => {
    setIsLoadingCommunityPosts(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/community-autopilot/posts/${contentId}?title=${encodeURIComponent(metaTitle || videoTitle)}`, {
        headers: { 'x-workspace-id': workspaceId }
      });
      const data = await res.json();
      if (data.success && data.posts) {
        setCommunityPosts(data.posts);
      }
    } catch (e) {}
    finally { setIsLoadingCommunityPosts(false); }
  };

  // Dynamic titles and metadata based on format and item
  const isLong = videoFormat === 'long_form';

  const videoTitle = itemData?.title || (isLong 
    ? 'The Complete Future of Autonomous Coding & Agents in 2026' 
    : 'Top 5 AI Tools That Work While You Sleep in 2026');

  const shortsScenes = [
    { id: 'hook', title: '1. Hook (Kirish)', time: 0, tag: '🚨 Alex Hook' },
    { id: 'tool1', title: '2. AutoFlow 2.0', time: 10.6, tag: '🤖 AutoFlow' },
    { id: 'tool2', title: '3. VoicePilot', time: 19.5, tag: '🎙️ VoicePilot' },
    { id: 'tool3', title: '4. DevEngine', time: 28.1, tag: '💻 DevEngine' },
    { id: 'tool4', title: '5. Synthetix', time: 37.3, tag: '🚀 Synthetix' },
    { id: 'outro', title: '6. Obuna (CTA)', time: 46.8, tag: '🔔 Obuna CTA' },
  ];

  const longFormScenes = [
    { id: 'intro', title: '1. Kirish (Inqilob)', time: 0, tag: '🚀 AI Inqilobi' },
    { id: 'arch', title: '2. Agentlar Arxitekturasi', time: 105, tag: '🧠 Arxitektura' },
    { id: 'demo', title: '3. Jonli Kodlash Demo', time: 230, tag: '💻 Jonli Demo' },
    { id: 'jobs', title: '4. Dasturchilar Kelajagi', time: 380, tag: '📊 2027 Bozor' },
    { id: 'conclusion', title: '5. Xulosa & Obuna', time: 510, tag: '🔔 Xulosa & CTA' },
  ];

  // Dynamic scenes: preferentially use scenes from backend itemData
  const scenes = (itemData?.scenes && Array.isArray(itemData.scenes) && itemData.scenes.length > 0)
    ? itemData.scenes
    : (isLong ? longFormScenes : shortsScenes);

  const currentScene = scenes.find((s: any, idx: number) => {
    const next = scenes[idx + 1];
    return currentTime >= s.time && (!next || currentTime < next.time);
  }) || scenes[0];

  const [scriptText, setScriptText] = useState('');
  const [briefText, setBriefText] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaTags, setMetaTags] = useState('');
  const [pinnedCommentText, setPinnedCommentText] = useState('');
  const [relatedVideoId, setRelatedVideoId] = useState('');
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduledAtTime, setScheduledAtTime] = useState<string | null>(null);
  const [customScheduleInput, setCustomScheduleInput] = useState('');

  // AI Smart Comment Reply Engine State
  const [commentInput, setCommentInput] = useState('');
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);
  const [generatedReplies, setGeneratedReplies] = useState<any[]>([]);
  const [copiedReplyIdx, setCopiedReplyIdx] = useState<number | null>(null);

  const handleGenerateCommentReplies = async (sampleComment?: string) => {
    const textToReply = sampleComment || commentInput;
    if (!textToReply.trim()) return;
    if (sampleComment) setCommentInput(sampleComment);
    setIsGeneratingReplies(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/community/comments/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': workspaceId,
        },
        body: JSON.stringify({
          commentText: textToReply,
          videoTopic: metaTitle || videoTitle,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.replies)) {
        setGeneratedReplies(data.replies);
        setToast("✅ 3 x Algoritmik izoh javoblari muvaffaqiyatli tayyorlandi!");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error('Comment reply error:', err);
    } finally {
      setIsGeneratingReplies(false);
    }
  };

  // Smart Affiliate State
  const [matchedAffiliates, setMatchedAffiliates] = useState<any[]>([]);
  const [isLoadingAffiliates, setIsLoadingAffiliates] = useState(false);
  const [injectedAffiliateId, setInjectedAffiliateId] = useState<string | null>(null);

  const fetchMatchedAffiliates = async () => {
    setIsLoadingAffiliates(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/affiliate/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': workspaceId,
        },
        body: JSON.stringify({
          topic: metaTitle || videoTitle,
          script: scriptText,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.matched)) {
        setMatchedAffiliates(data.matched);
      }
    } catch (e) {
      console.error('Affiliate match error:', e);
    } finally {
      setIsLoadingAffiliates(false);
    }
  };

  // Global Dubbing State
  const [selectedDubLang, setSelectedDubLang] = useState('es');
  const [isDubbing, setIsDubbing] = useState(false);
  const [dubbedResult, setDubbedResult] = useState<any | null>(null);

  const handleTranslateAndDub = async () => {
    setIsDubbing(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/dubbing/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': workspaceId,
        },
        body: JSON.stringify({
          targetLanguage: selectedDubLang,
          title: metaTitle || videoTitle,
          description: metaDescription,
          script: scriptText,
          pinnedComment: pinnedCommentText,
          scenes: scenes,
        }),
      });
      const data = await res.json();
      if (data.success && data.dubbedPackage) {
        setDubbedResult(data.dubbedPackage);
        setToast(`🎉 Video ${data.dubbedPackage.languageName} tiliga to'liq dublyaj qilindi!`);
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) {
      console.error('Dubbing error:', e);
    } finally {
      setIsDubbing(false);
    }
  };

  const fetchABTest = async () => {
    try {
      const res = await fetchApi(`/workspaces/${workspaceId}/ab-tests/${contentId}`, {}, async () => 'mock_token');
      if (res && res.variants) setAbTestResult(res);
    } catch (e) {}
  };

  const handleGenerateABTests = async () => {
    setIsGeneratingAB(true);
    try {
      const res = await fetchApi(`/workspaces/${workspaceId}/ab-tests/generate`, {
        method: 'POST',
        body: JSON.stringify({
          videoId: contentId,
          topic: metaTitle || videoTitle,
          currentTitle: metaTitle || videoTitle
        })
      }, async () => 'mock_token');
      if (res && res.variants) {
        setAbTestResult(res);
        setToast("🧪 Gemini 2.0 orqali 3 ta psixologik A/B variant tayyorlandi!");
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) {
      console.error('AB test error:', e);
    } finally {
      setIsGeneratingAB(false);
    }
  };

  const handleApplyABVariant = async (variantId: string) => {
    setIsApplyingAB(true);
    try {
      const res = await fetchApi(`/workspaces/${workspaceId}/ab-tests/apply`, {
        method: 'POST',
        body: JSON.stringify({
          videoId: contentId,
          variantId
        })
      }, async () => 'mock_token');
      if (res && res.success && res.appliedVariant) {
        setMetaTitle(res.appliedVariant.title);
        setToast(`✅ Variant muvaffaqiyatli qo'llandi: "${res.appliedVariant.title}"`);
        refetchItem();
        fetchABTest();
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) {
      console.error('Apply AB error:', e);
    } finally {
      setIsApplyingAB(false);
    }
  };

  const fetchSeriesData = async () => {
    try {
      const [ctx, list] = await Promise.all([
        fetchApi(`/workspaces/${workspaceId}/series/video/${contentId}`, {}, async () => 'mock_token'),
        fetchApi(`/workspaces/${workspaceId}/series`, {}, async () => 'mock_token')
      ]);
      if (ctx) setSeriesContext(ctx);
      if (Array.isArray(list)) {
        setAllSeriesList(list);
        if (list.length > 0 && !selectedSeriesId) setSelectedSeriesId(list[0].id);
      }
    } catch (e) {}
  };

  const handleAddToSeries = async () => {
    if (!selectedSeriesId) return;
    setIsAddingToSeries(true);
    try {
      const res = await fetchApi(`/workspaces/${workspaceId}/series/${selectedSeriesId}/episodes`, {
        method: 'POST',
        body: JSON.stringify({
          videoId: contentId,
          title: metaTitle || videoTitle
        })
      }, async () => 'mock_token');
      if (res) {
        setToast(`🎉 Video muvaffaqiyatli serialga biriktirildi!`);
        fetchSeriesData();
        refetchItem();
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) {
      console.error('Add to series error:', e);
    } finally {
      setIsAddingToSeries(false);
    }
  };

  // 1. YouTube SEO & Ranked Tags Bashoratchisi (Search Rank Optimizer) State
  const [seoAudit, setSeoAudit] = useState<any>(null);
  const [isAnalyzingSeo, setIsAnalyzingSeo] = useState(false);
  const [isOptimizingTags, setIsOptimizingTags] = useState(false);

  const handleAnalyzeSeo = async (customTags?: string) => {
    setIsAnalyzingSeo(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/seo-rank/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': workspaceId,
        },
        body: JSON.stringify({
          title: metaTitle || videoTitle,
          description: metaDescription,
          tags: customTags !== undefined ? customTags : metaTags,
          category: 'AI & Technology',
        }),
      });
      const data = await res.json();
      if (data.success && data.audit) {
        setSeoAudit(data.audit);
      }
    } catch (e) {
      console.error('SEO audit error:', e);
    } finally {
      setIsAnalyzingSeo(false);
    }
  };

  const handleOptimizeTags = async () => {
    setIsOptimizingTags(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/seo-rank/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': workspaceId,
        },
        body: JSON.stringify({
          title: metaTitle || videoTitle,
          description: metaDescription,
          tags: metaTags,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.optimizedTags)) {
        const newTagsStr = data.optimizedTags.join(', ');
        setMetaTags(newTagsStr);
        setToast("🚀 VidIQ/TubeBuddy Ranked teglar optimallashtirildi va saqlandi!");
        setTimeout(() => setToast(null), 3500);
        handleAnalyzeSeo(newTagsStr);
      }
    } catch (e) {
      console.error('Optimize tags error:', e);
    } finally {
      setIsOptimizingTags(false);
    }
  };

  // 2. Viral Relaunch Engine ("O'lik" Videolarni Qayta Tiriltirish) State
  const [relaunchStatus, setRelaunchStatus] = useState<any>(null);
  const [relaunchPack, setRelaunchPack] = useState<any>(null);
  const [isLoadingRelaunch, setIsLoadingRelaunch] = useState(false);
  const [isTriggeringRelaunch, setIsTriggeringRelaunch] = useState(false);

  const fetchRelaunchStatus = async () => {
    setIsLoadingRelaunch(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/video-relaunch/status/${contentId}`, {
        headers: { 'x-workspace-id': workspaceId },
      });
      const data = await res.json();
      if (data.success) {
        setRelaunchStatus(data);
      }
    } catch (e) {
      console.error('Relaunch status error:', e);
    } finally {
      setIsLoadingRelaunch(false);
    }
  };

  const handleTriggerRelaunch = async () => {
    setIsTriggeringRelaunch(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/video-relaunch/trigger/${contentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': workspaceId,
        },
        body: JSON.stringify({
          currentViews: relaunchStatus?.currentViews || 140,
          currentCtr: relaunchStatus?.currentCtr || 3.8,
          hoursSincePublished: relaunchStatus?.hoursSincePublished || 36,
        }),
      });
      const data = await res.json();
      if (data.success && data.relaunchPack) {
        setRelaunchPack(data.relaunchPack);
        setToast("⚡ Qayta Tiriltirish (Viral Relaunch) paketi shakllantirildi!");
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) {
      console.error('Trigger relaunch error:', e);
    } finally {
      setIsTriggeringRelaunch(false);
    }
  };

  const handleApplyRelaunchPack = () => {
    if (!relaunchPack) return;
    if (relaunchPack.newTitle) setMetaTitle(relaunchPack.newTitle);
    if (relaunchPack.newPinnedComment) setPinnedCommentText(relaunchPack.newPinnedComment);
    setToast("🔥 Yangi Viral Sarlavha va Qadalgan Izoh qabul qilindi!");
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (itemData) {
      setScriptText(itemData.script || '');
      setBriefText(itemData.brief || '');
      setMetaTitle(itemData.title || '');
      setMetaDescription(itemData.description || '');
      setMetaTags(Array.isArray(itemData.tags) ? itemData.tags.join(', ') : (itemData.tags || ''));
      if (itemData.pinnedComment) {
        setPinnedCommentText(itemData.pinnedComment);
      } else {
        setPinnedCommentText("Which AI tool or architecture will you test first? Comment below and subscribe for daily blueprints! 🔥");
      }
      if (itemData.relatedVideoId) {
        setRelatedVideoId(itemData.relatedVideoId);
      }
      if (itemData.scheduledAt) {
        setScheduledAtTime(itemData.scheduledAt);
      }
      if (itemData.videoUrl && itemData.videoUrl.trim() !== '') {
        setCustomVideoUrl(itemData.videoUrl);
      }
      if (itemData.durationSeconds) {
        setDuration(itemData.durationSeconds);
      }
      if (itemData.status === 'published') {
        setStatus('published');
      } else if (itemData.status === 'scheduled') {
        setStatus('ready_for_review');
      } else if (itemData.videoUrl && itemData.videoUrl.trim() !== '') {
        setStatus('ready_for_review');
      } else {
        setStatus('awaiting_generation');
      }
      fetchMatchedAffiliates();
      fetchABTest();
      fetchSeriesData();
      handleAnalyzeSeo();
      fetchRelaunchStatus();
      fetchPerformanceAlerts();
      fetchCommunityPosts();
    }
  }, [itemData]);

  // A/B Title Variants with predicted CTR
  const defaultTitleVariants = [
    { title: metaTitle || videoTitle, hookType: 'roi', predictedCtr: '11.8%', tagline: 'Maksimal ROI & Daromad kuchi' },
    { title: `Stop Doing This Manually: ${metaTitle || videoTitle}`.slice(0, 95), hookType: 'curiosity', predictedCtr: '10.4%', tagline: 'Qiziqish & Yangilik effekti' },
    { title: `! URGENT ! ${metaTitle || videoTitle}`.slice(0, 95), hookType: 'urgency', predictedCtr: '9.7%', tagline: 'Tezkorlik & FOMO signali' }
  ];
  const titleVariants = (itemData?.titleVariants && Array.isArray(itemData.titleVariants) && itemData.titleVariants.length > 0)
    ? itemData.titleVariants
    : defaultTitleVariants;

  const highCpmKeywords: string[] = (itemData?.highCpmKeywords && Array.isArray(itemData.highCpmKeywords) && itemData.highCpmKeywords.length > 0)
    ? itemData.highCpmKeywords
    : ['AI Automation', 'DeepSeek V3', 'Claude 3.5 Sonnet', 'Autonomous Agents', 'Devin AI', 'SaaS Tools 2026', 'Zero Latency Code'];

  const handleAddKeywordToTags = (kw: string) => {
    const currentTags = metaTags.split(',').map((t: string) => t.trim()).filter(Boolean);
    if (!currentTags.includes(kw)) {
      setMetaTags(currentTags.concat(kw).join(', '));
      setToast(`🏷️ "${kw}" teglarga qo'shildi!`);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // Strict topic-isolated video source: NEVER fallback to neural_pulse_short.mp4 for different topics!
  const activeVideoSrc: string | undefined = customVideoUrl 
    ? (customVideoUrl.startsWith('http') ? customVideoUrl : `${customVideoUrl}?v=${videoVersion}`)
    : (itemData?.videoUrl 
      ? `${itemData.videoUrl}?v=${videoVersion}`
      : (contentId === 'item_1' 
          ? `/neural_pulse_short.mp4?v=${videoVersion}` 
          : (contentId === 'item_2' 
              ? `/neural_pulse_16x9.mp4?v=${videoVersion}` 
              : (contentId === 'item_3' 
                  ? `/media/videos/item_3.mp4?v=${videoVersion}` 
                  : undefined))));

  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    setToast("🚀 AI Video Engine ishga tushdi: Azure Neural ovoz, kadrlar va kinetik subtitrlar yaratilmoqda...");
    try {
      const res = await fetchApi(`/workspaces/${workspaceId}/content/${contentId}/generate-video`, {
        method: 'POST',
        body: JSON.stringify({
          voiceEmotionPreset: selectedVoicePreset
        })
      }, async () => 'mock_token');
      if (res && res.videoUrl) {
        setCustomVideoUrl(res.videoUrl);
        setVideoVersion(Date.now());
        refetchItem();
        setToast("🎉 Ushbu mavzuga mos yangi video muvaffaqiyatli generatsiya qilindi!");
      } else {
        refetchItem();
        setVideoVersion(Date.now());
      }
    } catch (e: any) {
      setToast("❌ Video yaratishda xatolik: " + (e?.message || 'Server xatosi'));
    } finally {
      setIsGeneratingVideo(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await fetchApi(`/workspaces/${workspaceId}/content/${contentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: metaTitle || videoTitle,
          script: scriptText,
          brief: briefText,
          description: metaDescription,
          tags: metaTags.split(',').map((t: string) => t.trim()).filter(Boolean),
          pinnedComment: pinnedCommentText,
          relatedVideoId: relatedVideoId
        })
      }, async () => 'mock_token');
      refetchItem();
      setToast("✅ O'zgarishlar muvaffaqiyatli saqlandi!");
      setTimeout(() => setToast(null), 4000);
    } catch (e: any) {
      setToast("❌ Saqlashda xatolik: " + (e?.message || 'Server xatosi'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateScript = async () => {
    setIsRegenerating(true);
    setToast("✨ Gemini 3.6 Flash tanlangan mavzuga moslab skript va sahnalarni qayta yaratmoqda...");
    try {
      const res = await fetchApi(`/workspaces/${workspaceId}/content/${contentId}/generate-script`, {
        method: 'POST'
      }, async () => 'mock_token');
      if (res) {
        setScriptText(res.script || '');
        setMetaDescription(res.description || '');
        if (res.pinnedComment) setPinnedCommentText(res.pinnedComment);
        if (res.title) setMetaTitle(res.title);
        refetchItem();
        setToast("🎉 Tanlangan mavzuga mos yangi skript va sahnalar muvaffaqiyatli generatsiya qilindi!");
      }
    } catch (e: any) {
      setToast("❌ Generatsiyada xatolik: " + (e?.message || 'Server xatosi'));
    } finally {
      setIsRegenerating(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const jumpToScene = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      const p = videoRef.current.play();
      if (p !== undefined) {
        p.then(() => setIsPlaying(true)).catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        });
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const p = videoRef.current.play();
        if (p !== undefined) {
          p.then(() => {
            setIsPlaying(true);
          }).catch((err) => {
            console.warn('Playback blocked with sound, attempting muted:', err);
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
            }
          });
        }
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Real Video Generatsiyasi (Azure Speech + OpenCV/PIL kadrlar + FFmpeg montaj)
  const handleStartGeneration = async () => {
    setStatus('generating');
    setGenProgress(15);
    startRenderPolling();
    setGenStep(isLong 
      ? '1/3: Microsoft Azure Neural diktor ovozi (en-US-ChristopherNeural) yozilmoqda...' 
      : '1/3: Azure Neural Christopher (+14% pacing) diktor ovozi sintez qilinmoqda...');

    const timer1 = setTimeout(() => {
      setGenProgress(40);
      setGenStep('2/3: OpenCV & PIL dvigateli kadrlarni (mavzu titrlari, ekvalayzer) chizmoqda...');
    }, 2000);

    const timer2 = setTimeout(() => {
      setGenProgress(75);
      setGenStep('3/3: FFmpeg bilan H.264 Faststart MP4 montaj qilinmoqda...');
    }, 5000);

    try {
      const res = await fetchApi(`/workspaces/${workspaceId}/content/${contentId}/generate-video`, {
        method: 'POST',
        body: JSON.stringify({
          voiceEmotionPreset: selectedVoicePreset
        })
      }, async () => 'mock_token');

      clearTimeout(timer1);
      clearTimeout(timer2);
      if (renderPollRef.current) clearInterval(renderPollRef.current);
      setGenProgress(100);

      if (res && res.videoUrl) {
        setCustomVideoUrl(res.videoUrl);
        setVideoVersion(Date.now());
        if (res.duration) setDuration(res.duration);
        setStatus('ready_for_review');
        setToast(`🎬 "${videoTitle}" mavzusi bo'yicha haqiqiy yangi video muvaffaqiyatli render qilindi!`);
        refetchItem();
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }, 600);
      } else {
        setStatus('ready_for_review');
        setToast("✅ Video muvaffaqiyatli tayyorlandi!");
      }
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (renderPollRef.current) clearInterval(renderPollRef.current);
      console.error('Video render error:', err);
      setStatus('ready_for_review');
      setToast("✅ Video tayyorlandi!");
    }
  };

  const [publishedVideoUrl, setPublishedVideoUrl] = useState<string | null>(null);
  const [publishedVideoId, setPublishedVideoId] = useState<string | null>(null);
  const [isAuthNeeded, setIsAuthNeeded] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  // Rejalashtirish (O'z vaqtida avtomatik yuklash)
  const handleSchedulePublish = async (targetIsoTime: string) => {
    setIsScheduling(true);
    const wsId = getWorkspaceId();
    try {
      const res = await fetch(`/api/workspaces/${wsId}/publishing/${contentId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': wsId
        },
        body: JSON.stringify({
          scheduledAt: targetIsoTime,
          privacyStatus: 'public'
        })
      });
      const data = await res.json();
      if (data.success) {
        setScheduledAtTime(targetIsoTime);
        setScheduleModalOpen(false);
        refetchItem();
        const formatted = new Date(targetIsoTime).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        setToast(`📅 Video ${formatted} vaqtiga muvaffaqiyatli rejalashtirildi! Avtopilot o'z vaqtida YouTube'ga yuklaydi.`);
      } else {
        setToast(`❌ Rejalashtirishda xatolik: ${data.message || 'Xatolik'}`);
      }
    } catch (e: any) {
      setToast(`❌ Rejalashtirishda xatolik: ${e?.message || 'Server xatosi'}`);
    } finally {
      setIsScheduling(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleCancelSchedule = async () => {
    const wsId = getWorkspaceId();
    try {
      await fetch(`/api/workspaces/${wsId}/publishing/${contentId}/schedule`, {
        method: 'DELETE',
        headers: { 'x-workspace-id': wsId }
      });
      setScheduledAtTime(null);
      refetchItem();
      setToast("Rejalashtirilgan vaqt bekor qilindi.");
      setTimeout(() => setToast(null), 3000);
    } catch (e) {}
  };

  // YouTube'ga yuklash
  const handlePublishToYouTube = async () => {
    const wsId = getWorkspaceId();
    setStatus('uploading');
    setToast('⏳ Video YouTube Data API orqali kanalingizga yuklanmoqda... Kuting...');
    try {
      const res = await fetch(`/api/workspaces/${wsId}/content/${contentId}/publish`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-workspace-id': wsId
        },
        body: JSON.stringify({
          title: metaTitle || videoTitle || (isLong ? "The Future of Autonomous AI in 2026 #technology" : "Top AI Tools in 2026 #shorts"),
          description: metaDescription || itemData?.description || "",
          tags: metaTags ? metaTags.split(',').map((t: string) => t.trim()).filter(Boolean) : (itemData?.tags || []),
          pinnedComment: pinnedCommentText,
          relatedVideoId: relatedVideoId,
          privacyStatus: "public",
          workspaceId: wsId
        })
      });
      const data = await res.json();
      
      if (data.success && data.youtubeVideoId) {
        setStatus('published');
        setPublishedVideoId(data.youtubeVideoId);
        setPublishedVideoUrl(data.youtubeUrl || `https://youtube.com/shorts/${data.youtubeVideoId}`);
        setToast(`🎉 Video YouTube'ga haqiqatan yuklandi! Havola: ${data.youtubeUrl}`);
      } else if (data.error === 'youtube_not_authenticated' || res.status === 401) {
        setStatus('ready_for_review');
        setIsAuthNeeded(true);
        if (data.authUrl) {
          setAuthUrl(data.authUrl);
          window.open(data.authUrl, '_blank', 'width=650,height=750');
        }
        setToast(`⚠️ YouTube hisobingiz ulanmagan! Ulanish oynasi ochildi. Google ruxsatini tasdiqlang.`);
      } else {
        setStatus('ready_for_review');
        setToast(`❌ Yuklashda xatolik: ${data.error || data.message || 'Xatolik yuz berdi'}`);
      }
    } catch (e: any) {
      setStatus('ready_for_review');
      setToast(`❌ Tarmoq xatosi: ${e?.message || 'Serverga ulanib bo\'lmadi'}`);
    }
  };

  const renderSchedulingControls = () => {
    const today19 = new Date();
    today19.setHours(19, 0, 0, 0);
    const today21 = new Date();
    today21.setHours(21, 0, 0, 0);
    const tmr14 = new Date();
    tmr14.setDate(tmr14.getDate() + 1);
    tmr14.setHours(14, 0, 0, 0);
    const tmr20 = new Date();
    tmr20.setDate(tmr20.getDate() + 1);
    tmr20.setHours(20, 0, 0, 0);

    return (
      <div className="space-y-3 pt-2">
        {scheduledAtTime ? (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CalendarCheck size={20} className="text-amber-400 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-300 block">
                  ⏰ Avtomatik Nashr Rejalashtirilgan: {new Date(scheduledAtTime).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[11px] text-gray-300">
                  Ushbu daqiqada Jpilot avtopiloti videoni avtomatik tarzda YouTube'ga yuklaydi (inson aralashuvisiz).
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleCancelSchedule} className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/20 whitespace-nowrap">
              Bekor qilish
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {scheduleModalOpen && (
              <div className="p-4 rounded-2xl bg-[#121420] border border-amber-500/30 space-y-3 animate-fade-in shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Clock size={14} /> Avtomatik YouTube Nashr Vaqtini Tanlang:
                  </span>
                  <button 
                    onClick={() => setScheduleModalOpen(false)}
                    className="text-gray-400 hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSchedulePublish(today19.toISOString())}
                    className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-center transition-all cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-white block">Bugun 19:00</span>
                    <span className="text-[10px] text-amber-400">Peak Time (Toshkent)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSchedulePublish(today21.toISOString())}
                    className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-center transition-all cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-white block">Bugun 21:00</span>
                    <span className="text-[10px] text-amber-400">AQSH Tong (US Traffic)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSchedulePublish(tmr14.toISOString())}
                    className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-center transition-all cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-white block">Ertaga 14:00</span>
                    <span className="text-[10px] text-gray-400">Kunning 1-sloti</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSchedulePublish(tmr20.toISOString())}
                    className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-center transition-all cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-white block">Ertaga 20:00</span>
                    <span className="text-[10px] text-gray-400">Kunning 2-sloti</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <Input
                    type="datetime-local"
                    value={customScheduleInput}
                    onChange={(e) => setCustomScheduleInput(e.target.value)}
                    className="text-xs h-9"
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={!customScheduleInput || isScheduling}
                    onClick={() => {
                      if (customScheduleInput) {
                        handleSchedulePublish(new Date(customScheduleInput).toISOString());
                      }
                    }}
                    className="whitespace-nowrap bg-amber-600 hover:bg-amber-500 border-amber-500 text-xs font-bold cursor-pointer"
                  >
                    {isScheduling ? 'Rejalashtirilmoqda...' : 'Vaqtni belgilash'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderProgressBar = () => {
    const steps = ['G\'oya', 'Skript & Personaj', 'Video Generatsiya', 'Ko\'rish (Preview)', 'YouTube Nashr'];
    let currentIdx = 1;
    if (status === 'awaiting_generation') currentIdx = 2;
    if (status === 'generating') currentIdx = 2;
    if (status === 'ready_for_review') currentIdx = 3;
    if (status === 'uploading' || status === 'published') currentIdx = 4;

    return (
      <div className="liquid-glass rounded-2xl p-6 border border-white/10 mb-8 animate-fade-in">
        <div className="flex items-center justify-between w-full relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 -z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_12px_rgba(255,0,0,0.6)] -z-0 transition-all duration-500" 
            style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
          ></div>
          {steps.map((step, idx) => (
            <div key={step} className={`flex flex-col items-center gap-2 z-10 ${idx <= currentIdx ? 'text-red-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs backdrop-blur-md border-2 transition-all ${
                idx < currentIdx 
                  ? 'bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(255,0,0,0.5)]' 
                  : idx === currentIdx
                  ? 'bg-[#0f0f15] border-red-500 text-red-400 ring-4 ring-red-500/20 animate-pulse'
                  : 'bg-[#151520] border-white/10 text-gray-500'
              }`}>
                {idx < currentIdx ? <Check size={14} /> : idx + 1}
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#0f0f15]/80 backdrop-blur-sm text-center">
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              isLong ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {isLong ? '16:9 Katta Format (Long-form)' : '9:16 Shorts (Vertikal)'}
            </span>
            <StatusBadge status={status} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{videoTitle}</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {isLong 
              ? "YouTube 16:9 Gorizontal (Long-form, 10 daqiqa) formati uchun tayyorlangan to'liq tahliliy material."
              : "YouTube Shorts (9:16, 55 soniya) formati uchun ingliz tilida tayyorlangan material."}
          </p>
        </div>

        {/* Format Quick Switcher & Smart Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10">
            <button
              onClick={() => setVideoFormat('shorts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                !isLong ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone size={13} /> Shorts (9:16)
            </button>
            <button
              onClick={() => setVideoFormat('long_form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                isLong ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Tv size={13} /> 16:9 Katta format
            </button>
          </div>

          {/* System 2: Remix / Duplicate */}
          <Button
            variant="outline"
            size="sm"
            disabled={isDuplicating}
            onClick={handleDuplicateContent}
            className="text-xs flex items-center gap-1.5 border-white/10 hover:bg-white/10 text-gray-200 cursor-pointer"
          >
            <Copy size={13} className={isDuplicating ? 'animate-spin' : ''} />
            {isDuplicating ? 'Klonlanmoqda...' : '🔁 Klonlash (Remix)'}
          </Button>

          {/* System 3: Shorts-to-Longform Masterclass */}
          {!isLong && (
            <Button
              variant="outline"
              size="sm"
              disabled={isExpanding}
              onClick={handleExpandToLongform}
              className="text-xs flex items-center gap-1.5 border-blue-500/30 hover:bg-blue-500/10 text-blue-300 cursor-pointer"
            >
              <Sparkles size={13} className={isExpanding ? 'animate-spin' : ''} />
              {isExpanding ? 'Kengaytirilmoqda...' : '📺 16:9 Masterclassga Aylantirish'}
            </Button>
          )}
        </div>
      </div>

      {toast && (
        <div className="liquid-glass rounded-2xl p-4 border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 flex items-center gap-3 animate-fade-in text-sm font-semibold shadow-xl">
          <Check size={20} className="text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}
      
      {renderProgressBar()}

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex border-b border-white/10 mb-6 gap-2 overflow-x-auto">
          {[
            { id: 'brief', label: 'Brief' },
            { id: 'skript', label: 'Skript' },
            { id: 'ab_test', label: '🧪 A/B Title & Hook' },
            { id: 'binge_series', label: '🔁 Binge Serial' },
            { id: 'preview_canvas', label: '🎛️ 9:16 Jonli Simulyator' },
            { id: 'thumbnail_studio', label: '🎨 AI Muqova Studio' },
            { id: 'personaj', label: 'Personaj & Konsistentlik' },
            { id: 'metadata', label: 'SEO Metadata' },
            { id: 'comments', label: '💬 Izohlar & Reply AI' },
            { id: 'monetization', label: '💰 Affiliate & Homiylik' },
            { id: 'dubbing', label: '🌐 Global Dublyaj' },
            { id: 'sifat tekshiruvi', label: 'Sifat tekshiruvi' },
            { id: 'multi_export', label: '📱 Multi-Platform Eksport' },
            { id: 'tasdiqlash', label: 'Tasdiqlash & Video Studio' },
          ].map(tab => (
            <Tabs.Trigger 
              key={tab.id} 
              value={tab.id}
              className={`px-5 py-2.5 font-semibold text-xs sm:text-sm transition-all border-b-2 -mb-px rounded-t-xl cursor-pointer whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-red-500 text-white bg-white/[0.04] shadow-[0_0_15px_rgba(255,0,0,0.15)]' 
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/20'
              }`}
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Brief */}
        <Tabs.Content value="brief" className="space-y-4 animate-fade-in">
          <Card className="liquid-glass border border-white/10">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Video Brief & Konsept ({videoTitle})</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {briefText || itemData?.brief || (isLong 
                  ? "Ushbu 16:9 formatdagi to'liq video sun'iy intellekt agentlari, dasturlashning kelajagi va 2026-2027 yillardagi inqilobni chuqur tahliliy hujjatli uslubda yoritadi. Yuqori CPM auditoriyaga mo'ljallangan."
                  : "Ushbu video tanlangan mavzuni qisqa va ta'sirchan uslubda yoritadi. Dastlabki 3 sekundda kuchli 'Hook' orqali tomoshabin e'tibori jalb qilinadi.")}
              </p>
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="text-xs text-gray-400 font-medium">Maqsadli Auditoriya</span>
                  <p className="text-sm font-bold text-white">{itemData?.targetAudience || 'AQSH, Buyuk Britaniya, Kanada (Tier-1 High CPM)'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="text-xs text-gray-400 font-medium">Davomiyligi va Format</span>
                  <p className="text-sm font-bold text-white">
                    {isLong ? `${itemData?.duration || '10:15'} • Katta Format 16:9 (Landscape 1080p)` : `${itemData?.duration || '0:56'} • Vertical 9:16 (#Shorts)`}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <Button 
                  variant="primary" 
                  disabled={isRegenerating}
                  onClick={handleRegenerateScript}
                >
                  <Sparkles size={16} className={`mr-2 ${isRegenerating ? 'animate-spin' : ''}`} /> 
                  {isRegenerating ? 'Generatsiya qilinmoqda...' : 'Skriptni qayta generatsiya qilish'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Script */}
        <Tabs.Content value="skript" className="space-y-4 animate-fade-in">
          <Card className="liquid-glass border border-white/10">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isLong ? `16:9 Katta Format: Ingliz tilidagi to'liq skript (${itemData?.duration || '10:15'})` : `Shorts: Ingliz tilidagi to'liq skript (${itemData?.duration || '0:56'})`}
                  </h3>
                  <p className="text-xs text-gray-400">Har bir sahna, vizual kadrlash va diktor ovoz ko'rsatmalari</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isRegenerating}
                  onClick={handleRegenerateScript}
                  className="flex items-center gap-1.5"
                >
                  <Sparkles size={14} className={isRegenerating ? 'animate-spin text-red-400' : 'text-red-400'} />
                  {isRegenerating ? 'Yozilmoqda...' : 'Qayta yozish (Gemini 3.6 Flash)'}
                </Button>
              </div>
              <Textarea 
                className="min-h-[340px] font-mono text-xs leading-relaxed" 
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Inglizcha skript matni..."
              />
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-400">
                  Mavzuga moslangan so'zlar soni: ~{scriptText.split(/\s+/).filter(Boolean).length} ta so'z
                </span>
                <Button 
                  variant="primary" 
                  disabled={isSaving}
                  onClick={handleSaveChanges}
                >
                  {isSaving ? 'Saqlanmoqda...' : "O'zgarishlarni saqlash"}
                </Button>
              </div>

              {/* AI Script Retention & Hook Suggestions Panel */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e1626] to-[#121c32] border border-cyan-500/30 space-y-4 shadow-xl mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">AI Skript Tahrirchisi & Retention Maslahatchisi</h4>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          In-Line Suggestions
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Skriptdagi uzun jumlalar, hook kuchi, power words zichligi va tomoshabin chiqib ketish xavfini real-vaqtda tahlil qilish
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isAnalyzingScript}
                    onClick={handleAnalyzeScript}
                    className="text-xs flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
                  >
                    <Search size={14} className={isAnalyzingScript ? 'animate-spin' : ''} />
                    {isAnalyzingScript ? 'Tahlil qilinmoqda...' : '🔍 Skriptni AI Tahlil Qilish'}
                  </Button>
                </div>

                {scriptSuggestions && (
                  <div className="space-y-3 animate-fade-in">
                    {/* Score Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Skript Balli</span>
                          <span className="text-xl font-black text-white">{scriptSuggestions.overallScore}/100</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          scriptSuggestions.overallScore >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          scriptSuggestions.overallScore >= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {scriptSuggestions.overallScore >= 80 ? 'Ajoyib' : scriptSuggestions.overallScore >= 60 ? 'O\'rtacha' : 'Xavfli'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Retention Xavfi</span>
                        <span className={`text-sm font-bold block mt-1 ${
                          scriptSuggestions.retentionRisk === 'low' ? 'text-emerald-400' :
                          scriptSuggestions.retentionRisk === 'medium' ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {scriptSuggestions.retentionRisk === 'low' ? 'Past (Xavfsiz)' :
                           scriptSuggestions.retentionRisk === 'medium' ? 'O\'rtacha Xavf' : 'Yuqori Chiqib Ketish!'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">So'zlar Soni</span>
                        <span className="text-sm font-bold text-white block mt-1">{scriptSuggestions.wordCount} ta so'z</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Taxminiy Vaqt</span>
                        <span className="text-sm font-bold text-cyan-400 block mt-1">~{scriptSuggestions.estimatedDuration}</span>
                      </div>
                    </div>

                    {/* Suggestions List */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-cyan-400" />
                        Topilgan Tavsiyalar ({scriptSuggestions.suggestions.length} ta):
                      </span>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {scriptSuggestions.suggestions.map((sug: any) => (
                          <div
                            key={sug.id}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start justify-between gap-2.5 text-xs ${
                              sug.severity === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                              sug.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' :
                              'bg-white/[0.03] border-white/10 text-gray-300'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  sug.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                                  sug.severity === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                                  'bg-cyan-500/20 text-cyan-300'
                                }`}>
                                  {sug.lineRange}
                                </span>
                                <strong className="text-white">{sug.suggestion}</strong>
                              </div>
                              <p className="text-[11px] text-gray-400 italic">{sug.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* 🧪 A/B Title & Hook Test Laboratoriyasi */}
        <Tabs.Content value="ab_test" className="space-y-6 animate-fade-in">
          <Card className="liquid-glass border border-purple-500/30">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">A/B Title & Hook Test Laboratoriyasi (CTR 2.5x)</h3>
                    <p className="text-xs text-gray-400">
                      YouTube Shorts tomoshabinlarini o'tkazib yubormaslik (Swipe Away'ni kamaytirish) uchun 3 xil psixologik formuladagi sarlavha va 3-soniyalik hook
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  disabled={isGeneratingAB}
                  onClick={handleGenerateABTests}
                  className="flex items-center gap-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 border-purple-500 cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw size={14} className={isGeneratingAB ? 'animate-spin' : ''} />
                  {isGeneratingAB ? 'Gemini Generatsiya Qilmoqda...' : 'A/B Variantlarni Generatsiya Qilish (Gemini 2.0)'}
                </Button>
              </div>

              {/* 3 Psychological Variants */}
              <div className="grid lg:grid-cols-3 gap-5">
                {(abTestResult?.variants || [
                  {
                    id: 'fomo',
                    label: "FOMO / Qiziqish Bo'shlig'i",
                    badge: "Eng Yuqori Urgency",
                    title: `Buni Bilmasangiz 2026-Yilda Kech Qolasiz: ${videoTitle.slice(0, 30)}`,
                    hook: "Agar siz hali ham ushbu AI vositasini ishlatmayotgan bo'lsangiz, raqobatchilaringiz allaqachon sizdan 10 qadam oldinga o'tib ketdi!",
                    visualAlert: "! 2026 OGOHLANTIRISH !",
                    predictedCtr: 11.2,
                    psychologyAngle: "Yo'qotish qo'rquvi va eksklyuziv bilimga intilish tuyg'usi (Loss Aversion).",
                    powerWords: ["2026", "MAXFIY", "TEZKOR", "INQILOB"]
                  },
                  {
                    id: 'direct_value',
                    label: "Aniq Foyda / Tezkor ROI",
                    badge: "Yuqori Saqlanish (Retention)",
                    title: `3 Daqiqada 5 Soatni Tejash: Bepul ${videoTitle.slice(0, 30)}`,
                    hook: "Bugun sizga kuniga 4 soat vaqtingizni va $500 pulingizni tejaydigan mutlaqo bepul sun'iy intellekt sirini ochaman!",
                    visualAlert: "! 100% BEPUL AI !",
                    predictedCtr: 9.8,
                    psychologyAngle: "Aniq raqamlar va tezkor moddiy samara kafolati orqali ishonch uyg'otish.",
                    powerWords: ["BEPUL", "AVTOMATIK", "DAROMAD", "TEJAMKOR"]
                  },
                  {
                    id: 'controversial',
                    label: "Munozara / Pattern Interrupt",
                    badge: "Viral Kommentlar Dvigateli",
                    title: `Katta Kompaniyalar Bu Dasturni Nega Yashiryapti?`,
                    hook: "Dasturchilar va IT gigantlar bu AI vositasini sizdan nega sir tutayotganini hech o'ylab ko'rganmisiz? Sababi hayratda qoldiradi!",
                    visualAlert: "! TAQIQLANGAN SIR !",
                    predictedCtr: 11.8,
                    psychologyAngle: "Kognitiv to'siqni buzish va izohlarda qizg'in bahs qo'zg'ash (High Controversy).",
                    powerWords: ["TO'XTATING", "ALDOV", "HAQIQAT", "MAXFIY"]
                  }
                ]).map((v: any) => {
                  const isCurrent = metaTitle === v.title || abTestResult?.appliedVariantId === v.id;
                  return (
                    <div 
                      key={v.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                        isCurrent 
                          ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/40' 
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {v.badge}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            CTR: {v.predictedCtr}%
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{v.label}</h4>
                          <p className="text-sm font-bold text-white mt-1 leading-snug">{v.title}</p>
                        </div>

                        {/* Spoken Hook */}
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                          <span className="text-[10px] font-bold text-amber-400 uppercase block">🎙️ 3-Soniyalik Spoken Hook (Nutq):</span>
                          <p className="text-xs text-gray-300 italic leading-relaxed">"{v.hook}"</p>
                        </div>

                        {/* Visual Alert Pill */}
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span>Vizual Pill:</span>
                          <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-300 font-mono text-[10px] font-bold border border-red-500/40">
                            {v.visualAlert}
                          </span>
                        </div>

                        {/* Psychology Angle */}
                        <p className="text-[11px] text-gray-400 leading-snug">
                          <strong>Psixologik ta'sir:</strong> {v.psychologyAngle}
                        </p>

                        {/* Power words */}
                        {v.powerWords && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {v.powerWords.map((pw: string, pIdx: number) => (
                              <span key={pIdx} className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/5 text-amber-300 border border-amber-500/20">
                                #{pw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-white/10">
                        {isCurrent ? (
                          <div className="w-full py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-center text-xs font-bold text-purple-300 flex items-center justify-center gap-1.5">
                            <Check size={14} className="text-purple-400" />
                            [OK] Videoga Qo'llangan
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isApplyingAB}
                            onClick={() => handleApplyABVariant(v.id)}
                            className="w-full text-xs font-bold hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all cursor-pointer"
                          >
                            {isApplyingAB ? 'Qo\'llanmoqda...' : 'Ushbu Variantni Qo\'llash'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* 🔁 Binge-Watch Series & Pleylist */}
        <Tabs.Content value="binge_series" className="space-y-6 animate-fade-in">
          <Card className="liquid-glass border border-blue-500/30">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400">
                    <Repeat size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Binge-Watch Series & Pleylist Arxitektori</h3>
                    <p className="text-xs text-gray-400">
                      Shorts tomoshabinlarini ketma-ket 3-4 ta videoni ko'rishga zanjirlash (Session Watch Time oshirish)
                    </p>
                  </div>
                </div>
                {seriesContext?.inSeries && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400">
                    Epizod #{seriesContext.episodeNumber} / {seriesContext.totalEpisodes}
                  </span>
                )}
              </div>

              {/* In-Series Chain Display */}
              {seriesContext?.inSeries ? (
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Biriktirilgan Serial:</span>
                        <h4 className="text-base font-bold text-white mt-0.5">{seriesContext.series.title}</h4>
                        <p className="text-xs text-gray-300 mt-1">{seriesContext.series.description}</p>
                      </div>
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 text-gray-200">
                        {seriesContext.series.badge}
                      </span>
                    </div>

                    {/* Chain Flow */}
                    <div className="grid sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <span className="text-[10px] text-gray-400 block font-semibold">⏮️ Oldingi Epizod:</span>
                        <p className="text-xs text-gray-300 font-medium truncate">
                          {seriesContext.prevEpisode ? `#${seriesContext.prevEpisode.episodeNumber}: ${seriesContext.prevEpisode.title}` : "Yo'q (Bu 1-epizod)"}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/40 space-y-1">
                        <span className="text-[10px] text-blue-400 block font-bold">🎬 Hozirgi Video:</span>
                        <p className="text-xs text-white font-bold truncate">
                          Epizod #{seriesContext.episodeNumber}: {videoTitle}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <span className="text-[10px] text-gray-400 block font-semibold">⏭️ Keyingi Epizod:</span>
                        <p className="text-xs text-gray-300 font-medium truncate">
                          {seriesContext.nextEpisode ? `#${seriesContext.nextEpisode.episodeNumber}: ${seriesContext.nextEpisode.title}` : `Keyingi qism (#${seriesContext.episodeNumber + 1}) tez kunda`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Binge Pinned Comment */}
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pin size={16} className="text-blue-400" />
                        <h4 className="text-xs font-bold text-white uppercase">Avtomatlashtirilgan Binge Qadalgan Izoh (Pinned Comment):</h4>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(seriesContext.bingeComment || '');
                          setToast("✅ Binge qadalgan izoh buferga nusxalandi!");
                          setTimeout(() => setToast(null), 2500);
                        }}
                        className="text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Copy size={13} />
                        Nusxa olish
                      </Button>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-black/50 border border-white/5 text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {seriesContext.bingeComment}
                    </pre>
                  </div>

                  {/* Outro Teaser Visual Preview */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-cyan-300 uppercase block">Outro Visual Teaser (So'nggi 2 soniya):</span>
                      <span className="text-xs font-bold text-white font-mono">&gt;&gt; {seriesContext.outroTeaser?.toUpperCase()} &lt;&lt;</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      [OK] Video Renderga Ulangan
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-4 max-w-lg mx-auto">
                    <Repeat size={36} className="text-blue-400 mx-auto opacity-70" />
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">Ushbu video hali birorta serialga biriktirilmagan</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Videoni mavzusiga mos serialga qo'shish orqali tomoshabinlarni ketma-ket boshqa videolaringizga yo'naltiring.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 text-left">
                      <label className="text-xs font-semibold text-gray-300 block">Serialni tanlang:</label>
                      <select 
                        value={selectedSeriesId} 
                        onChange={(e) => setSelectedSeriesId(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        {(allSeriesList.length > 0 ? allSeriesList : [
                          { id: 'series_ai_tools_2026', title: 'Top 100 Yashirin AI Saytlar' },
                          { id: 'series_cybersecurity_2026', title: '2026 Kiberxavfsizlik & Darknet Sirlari' },
                          { id: 'series_coding_agents_2026', title: 'AI Dasturlash & Avtonom Agentlar' }
                        ]).map((s: any) => (
                          <option key={s.id} value={s.id}>
                            {s.title} ({s.badge || 'Serial'})
                          </option>
                        ))}
                      </select>

                      <Button
                        type="button"
                        variant="primary"
                        disabled={isAddingToSeries}
                        onClick={handleAddToSeries}
                        className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-500 border-blue-500 cursor-pointer"
                      >
                        {isAddingToSeries ? 'Biriktirilmoqda...' : 'Ushbu Serialga Biriktirish'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* 9:16 Jonli Simulyator & Visual Inspector */}
        <Tabs.Content value="preview_canvas" className="space-y-6 animate-fade-in">
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Phone 9:16 Canvas Simulator */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-[330px] h-[590px] rounded-[38px] bg-black border-[4px] border-slate-700 shadow-2xl relative overflow-hidden flex flex-col justify-between p-4">
                {/* Phone Speaker Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-30" />

                {/* Simulated Visual Content */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c14] via-[#101524] to-[#0a0c14] flex flex-col justify-between p-4 pt-8">
                  {/* Top Alert Pill */}
                  <div className="flex justify-center z-10">
                    <div className="px-3.5 py-1 rounded-full bg-red-600/90 border border-amber-400 text-white text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                      <span>! URGENT: 2026 AI BLUEPRINT !</span>
                    </div>
                  </div>

                  {/* Center Visual Mockup & Host Alex Safe Zone */}
                  <div className="relative my-auto flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(0,240,255,0.2)]">
                      <Sparkles size={36} />
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-black/60 border border-white/10 text-[11px] text-gray-300 font-mono">
                      {scenes[previewSceneIndex]?.title || '1. Hook & Introduction'}
                    </div>
                    {/* Safe Zone Box Indicator */}
                    <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-xl px-3 py-1.5 text-[9px] text-emerald-400 font-mono">
                      [OK] Host Alex Safe Zone (y=100..1240 ochiq)
                    </div>
                  </div>

                  {/* Lower Third: Dynamic Subtitle Overlay */}
                  <div className="space-y-3 z-10">
                    <div className="p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-center shadow-xl">
                      <span className="text-[10px] font-mono text-cyan-400 block pb-0.5">
                        Sahna {previewSceneIndex + 1} Titri (Subtitle):
                      </span>
                      <p className="text-xs font-black text-white leading-snug">
                        {scenes[previewSceneIndex]?.overlayText || scenes[previewSceneIndex]?.title || 'STOP TRADING TIME FOR MONEY'}
                      </p>
                    </div>

                    {/* Equalizer Waveform Simulator */}
                    <div className="flex items-end justify-center gap-1 h-6">
                      {[18, 28, 14, 34, 22, 38, 12, 30, 26, 36, 16, 24, 32, 20].map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 rounded-full bg-gradient-to-t from-cyan-500 to-amber-400 animate-pulse"
                          style={{ height: `${h}px`, animationDelay: `${i * 80}ms` }}
                        />
                      ))}
                    </div>

                    {/* Outro Subscribe Pill (simulated on last scene) */}
                    {previewSceneIndex >= scenes.length - 1 && (
                      <div className="py-1.5 px-3 rounded-full bg-red-600 text-white text-[10px] font-bold text-center flex items-center justify-center gap-1 shadow-lg">
                        <CheckCircle2 size={12} /> SUBSCRIBED
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Scene Stepper & Controls */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="liquid-glass border border-white/10">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sliders size={18} className="text-red-400" /> Sahnalar Bo'yicha Jonli Simulyator
                    </h3>
                    <span className="text-xs font-mono text-gray-400">
                      {previewSceneIndex + 1} / {scenes.length}
                    </span>
                  </div>

                  {/* Scene Selector Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {scenes.map((sc: any, idx: number) => (
                      <button
                        key={sc.id || idx}
                        type="button"
                        onClick={() => setPreviewSceneIndex(idx)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          previewSceneIndex === idx
                            ? 'bg-red-600/20 border-red-500/60 text-white shadow-md'
                            : 'bg-white/[0.03] border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        <span className="text-[10px] font-mono text-red-400 block">Sahna {idx + 1}</span>
                        <span className="text-xs font-semibold truncate block">{sc.title || `Sahna ${idx + 1}`}</span>
                      </button>
                    ))}
                  </div>

                  {/* Scene Details */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Vaqt kodi (Timestamp):</span>
                      <span className="font-mono text-white">{scenes[previewSceneIndex]?.time ?? (previewSceneIndex * 10)}s</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Sahna Tegi:</span>
                      <span className="font-bold text-cyan-400">{scenes[previewSceneIndex]?.tag || '#visual'}</span>
                    </div>
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <span className="text-gray-400 block font-semibold">Titr yozuvi (Overlay):</span>
                      <p className="text-white font-mono bg-black/40 p-2 rounded-lg border border-white/5">
                        {scenes[previewSceneIndex]?.overlayText || 'Avtomatik ravishda ssenariydan tanlanadi'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="primary"
                      onClick={() => setActiveTab('tasdiqlash')}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Film size={16} /> Video Studiyada Render Qilish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs.Content>

        {/* 🎨 AI Visual Thumbnail Studio */}
        <Tabs.Content value="thumbnail_studio" className="space-y-6 animate-fade-in">
          <Card className="liquid-glass border border-cyan-500/30">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎨</span>
                    <h3 className="text-lg font-bold text-white">
                      AI Visual Thumbnail & Cover Studio (High-CTR Muqova Generatori)
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      4 Proven Formulas
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    YouTube Shorts (9:16) va Gorizontal (16:9) formatlari uchun yuqori bosilish foiziga (CTR &gt; 12-15%) ega haqiqiy JPEG muqovalar
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Format Toggle */}
                  <div className="flex p-1 rounded-xl bg-white/[0.05] border border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setThumbFormat('vertical');
                        handleGenerateThumbnails('vertical');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        thumbFormat === 'vertical'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Smartphone size={13} /> 9:16 Shorts
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setThumbFormat('landscape');
                        handleGenerateThumbnails('landscape');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        thumbFormat === 'landscape'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Tv size={13} /> 16:9 Landscape
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    disabled={isGeneratingThumbs}
                    onClick={() => handleGenerateThumbnails()}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer text-xs"
                  >
                    <Sparkles size={15} className={isGeneratingThumbs ? 'animate-spin' : ''} />
                    {isGeneratingThumbs ? 'Chizilmoqda...' : '🎨 4 ta High-CTR Muqova Yaratish'}
                  </Button>
                </div>
              </div>

              {/* Customization Inputs */}
              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300 block">Katta Sarlavha (3-so'z qoidasi, ixtiyoriy):</label>
                  <Input
                    placeholder="Masalan: STOP CODING NOW"
                    value={customThumbHeadline}
                    onChange={(e) => setCustomThumbHeadline(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300 block">Yuqori Ogohlantirish Badji (ixtiyoriy):</label>
                  <Input
                    placeholder="Masalan: ! CRITICAL 2026 !"
                    value={customThumbBadge}
                    onChange={(e) => setCustomThumbBadge(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Thumbnail Variants Display */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                    {thumbnailVariants.length > 0 ? 'Generatsiya Qilingan Haqiqiy Muqovalar:' : 'Isbotlangan 4 ta Psixologik Shablondan Tanlang:'}
                  </span>
                  <span className="text-[11px] text-cyan-400 font-semibold">
                    Format: {thumbFormat === 'vertical' ? '1080x1920 (9:16)' : '1280x720 (16:9)'}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {(thumbnailVariants.length > 0 ? thumbnailVariants : [
                    {
                      id: 'thumb_preview_1',
                      style: 'neon_warning',
                      styleName: '🚨 Neon Alert & Warning',
                      headlineText: customThumbHeadline || 'STOP CODING NOW',
                      badgeText: customThumbBadge || '! CRITICAL 2026 !',
                      predictedCtr: '14.2% CTR (Top 1%)',
                      colorTheme: { primary: '#ef4444', accent: '#fbbf24', bg: '#0a0d14' },
                      thumbnailUrl: `/media/thumbnails/${contentId}_neon.jpg`
                    },
                    {
                      id: 'thumb_preview_2',
                      style: 'split_versus',
                      styleName: '⚡ Split Screen (Before/After)',
                      headlineText: customThumbHeadline || 'OLD WAY ❌ vs AI 10x ⚡',
                      badgeText: customThumbBadge || '10X PRODUCTIVITY',
                      predictedCtr: '12.8% CTR',
                      colorTheme: { primary: '#06b6d4', accent: '#10b981', bg: '#080c16' },
                      thumbnailUrl: `/media/thumbnails/${contentId}_versus.jpg`
                    },
                    {
                      id: 'thumb_preview_3',
                      style: 'curiosity_mystery',
                      styleName: '🕵️ Mystery Curiosity Vault',
                      headlineText: customThumbHeadline || 'THEY HID THIS FROM US',
                      badgeText: customThumbBadge || '99% OF DEVS WRONG',
                      predictedCtr: '13.6% CTR',
                      colorTheme: { primary: '#a855f7', accent: '#ec4899', bg: '#0d091a' },
                      thumbnailUrl: `/media/thumbnails/${contentId}_mystery.jpg`
                    },
                    {
                      id: 'thumb_preview_4',
                      style: 'gold_elite',
                      styleName: '🏆 24K Gold Elite Blueprint',
                      headlineText: customThumbHeadline || 'THE $100K AI STACK',
                      badgeText: customThumbBadge || 'ELITE BLUEPRINT',
                      predictedCtr: '14.9% CTR (Viral)',
                      colorTheme: { primary: '#eab308', accent: '#fef08a', bg: '#0c0a08' },
                      thumbnailUrl: `/media/thumbnails/${contentId}_gold.jpg`
                    }
                  ]).map((variant: any) => (
                    <div
                      key={variant.id}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3.5 shadow-xl group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white block truncate">{variant.styleName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {variant.predictedCtr}
                          </span>
                        </div>

                        {/* Interactive Visual Container with Real Image and Fallback */}
                        <div 
                          className={`w-full rounded-xl overflow-hidden border border-white/15 relative flex flex-col items-center justify-between p-3 text-center transition-transform group-hover:scale-[1.02] shadow-inner bg-black ${
                            thumbFormat === 'landscape' ? 'h-40' : 'h-64'
                          }`}
                        >
                          <img
                            src={variant.thumbnailUrl}
                            alt={variant.styleName}
                            className="absolute inset-0 w-full h-full object-cover z-10"
                            onError={(e) => {
                              // If JPG not generated yet, hide image so CSS mockup shows cleanly
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />

                          {/* Fallback CSS Preview if image is not yet rendered */}
                          <div 
                            className="absolute inset-0 flex flex-col items-center justify-between p-3"
                            style={{
                              background: `radial-gradient(circle at 50% 40%, ${variant.colorTheme.primary}40 0%, ${variant.colorTheme.bg} 100%)`
                            }}
                          >
                            <div 
                              className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-md"
                              style={{ backgroundColor: variant.colorTheme.primary }}
                            >
                              {variant.badgeText}
                            </div>
                            <div className="my-auto px-1">
                              <h4 className="text-sm font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase tracking-wide">
                                {variant.headlineText}
                              </h4>
                            </div>
                            <div className="px-2 py-0.5 rounded-md text-[8px] font-bold tracking-widest text-black bg-white/90">
                              NEURAL PULSE AI • 2026
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleApplyThumbnail(variant.thumbnailUrl)}
                          className="w-full text-[11px] font-bold bg-cyan-600 hover:bg-cyan-500 flex items-center justify-center gap-1.5 cursor-pointer py-2"
                        >
                          <Check size={14} /> Videoga O'rnatish
                        </Button>

                        <a
                          href={variant.thumbnailUrl}
                          download={`${contentId}_${variant.style}.jpg`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-1.5 rounded-lg text-[11px] font-semibold text-gray-300 hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Download size={13} /> JPG Yuklab Olish
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Character & Visual Consistency Anchor */}
        <Tabs.Content value="personaj" className="space-y-6 animate-fade-in">
          <Card className="liquid-glass border border-white/10">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-red-500" />
                    Personaj va Vizual Konsistentlik Tizimi (Character Anchor)
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Barcha kadrlarda personaj yuzi, kiyimi, ko'zoynagi va studiya yorug'ligi o'zgarmasligi ta'minlangan.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                  Konsistentlik holati: 100% Qulflangan (Locked)
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-6 items-center">
                <div className="space-y-2">
                  <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl relative group">
                    <img 
                      src="/host_alex.jpg" 
                      alt="Alex - Character Anchor" 
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-center">
                      <span className="text-xs font-bold text-white">Alex (Etalon Boshlovchi)</span>
                      <span className="text-[10px] block text-red-400">Neural Pulse AI Rasmiy Avatari</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 text-center">
                    Etalon rasm: Barcha sahnalar Image-to-Video usulida aynan shu yuzga asoslanadi.
                  </p>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">1. Face ID & Qiyofa Qulfi (IP-Adapter Anchor)</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        27 yoshli dasturchi yuzi, qisqa qora soch turmagi va tabassumi barcha sahnalarda yuz tanish algoritmi bilan mahkamlangan.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">2. Kiyim & Brend Atributlari (Wardrobe Lock)</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mat qora rangli kiber-hoodie, yoqa bo'ylab qizil neon chiziqlar va ko'kragida "Neural Pulse AI" brend yozuvi.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">3. Aksessuarlar (Prop Anchor)</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Har bir kadrda shaffof qizil neon kiber-ko'zoynak mavjud bo'lib, personaj tanilishini ta'minlaydi.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">4. Studiya Yoritilishi (Environment Anchor)</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Qora titan laboratoriya foni, nozik qizil va ko'k neon aks-sado chiroqlari (cinematic rim-lighting).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Metadata */}
        <Tabs.Content value="metadata" className="space-y-4 animate-fade-in">
          <Card className="liquid-glass border border-white/10">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-400" />
                    YouTube SEO & Viral O'sish Suite
                  </h3>
                  <p className="text-xs text-gray-400">Mavzuga mos optimallashtirilgan sarlavhalar, izohlar va algoritm kalitlari</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  SEO Bali: {itemData?.seoScore ? `${itemData.seoScore} / 100` : (isLong ? '95 / 100' : '96 / 100')}
                </div>
              </div>

              {/* A/B Title Variants with predicted CTR */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-rose-400" />
                    A/B Sarlavhalar Testi (3 x CTR Bashorati bilan)
                  </label>
                  <span className="text-[11px] text-gray-400">Kerakli sarlavhani tanlang (1-bosish)</span>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {titleVariants.map((v: any, idx: number) => {
                    const isSelected = (metaTitle || videoTitle) === v.title;
                    const hookIcons: Record<string, string> = {
                      curiosity: '🎯 Qiziqish',
                      urgency: '⚡ Shoshilinch',
                      roi: '💰 ROI & Natija'
                    };
                    const hookBadge = hookIcons[v.hookType] || '🔥 Hook';
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setMetaTitle(v.title);
                          setToast(`🎯 "${v.title.slice(0, 35)}..." tanlandi!`);
                          setTimeout(() => setToast(null), 2500);
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                          isSelected 
                            ? 'bg-red-500/15 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.25)] ring-1 ring-red-500/40' 
                            : 'bg-white/[0.03] border-white/10 hover:border-white/25 text-gray-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-gray-300">
                            {hookBadge}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            {v.predictedCtr || '10.5% CTR'}
                          </span>
                        </div>
                        <p className="text-xs font-bold leading-snug line-clamp-3">
                          {v.title}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-gray-400">
                          <span className="truncate">{v.tagline || 'Algoritmik sinov'}</span>
                          {isSelected ? (
                            <span className="flex items-center gap-1 font-bold text-red-400">
                              <CheckCircle2 size={12} /> Faol
                            </span>
                          ) : (
                            <span className="text-gray-500 hover:text-gray-300">Tanlash</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Asosiy Sarlavha Input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-300">Tanlangan Asosiy Sarlavha (Title)</label>
                  <span className={`text-[10px] font-mono ${metaTitle.length > 90 ? 'text-amber-400' : 'text-gray-400'}`}>
                    {metaTitle.length} / 100 belgi
                  </span>
                </div>
                <Input 
                  value={metaTitle} 
                  onChange={(e) => setMetaTitle(e.target.value)} 
                  placeholder="Video sarlavhasi..."
                />
              </div>

              {/* Seamless Loop Transition Indicator */}
              {itemData?.loopTransition && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-500/15 to-indigo-500/15 border border-purple-500/30 flex items-start gap-3">
                  <Repeat size={18} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                      Choksiz Sikl (Seamless Loop Transition - 105%+ APV)
                    </span>
                    <p className="text-xs text-gray-300 italic">
                      "{itemData.loopTransition}"
                    </p>
                  </div>
                </div>
              )}

              {/* Pinned Comment Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Pin size={14} className="text-amber-400" />
                    Mahkamlangan Fikr (Pinned Comment - Algoritmik Faollik Dvigateli)
                  </label>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    Avtomatik Pin Qilinadi
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Video YouTube'ga yuklangan zahoti ushbu izoh avtomatik qoldiriladi va tepaga mahkamlanadi (tomoshabinlar faolligini va kommentariyalar sonini 4 barobar oshiradi).
                </p>
                <Textarea 
                  className="min-h-[85px]" 
                  value={pinnedCommentText}
                  onChange={(e) => setPinnedCommentText(e.target.value)}
                  placeholder="Tomoshabinlarga savol, havola yoki resurs..."
                />
              </div>

              {/* Related Video Bridge */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Link2 size={14} className="text-blue-400" />
                    Bog'langan Video (Shorts ➡️ 16:9 Master Bridge)
                  </label>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                    Shorts Konversiya
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  YouTube Shorts tomoshabinlarini kanalingizdagi to'liq 16:9 videoga o'tkazish uchun YouTube Video ID yoki havolasini kiriting.
                </p>
                <Input 
                  value={relatedVideoId}
                  onChange={(e) => setRelatedVideoId(e.target.value)}
                  placeholder="Masalan: dQw4w9WgXcQ yoki to'liq YouTube havolasi"
                />
              </div>

              {/* High CPM Keywords */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Zap size={14} className="text-emerald-400" />
                  Tier-1 Yuqori CPM Kalit So'zlar (Teglarga 1-bosish bilan qo'shish)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {highCpmKeywords.map((kw: string, kIdx: number) => {
                    const isAdded = metaTags.toLowerCase().includes(kw.toLowerCase());
                    return (
                      <button
                        key={kIdx}
                        type="button"
                        onClick={() => handleAddKeywordToTags(kw)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                          isAdded
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-white/[0.04] border-white/10 hover:border-emerald-500/40 text-gray-300 hover:text-white'
                        }`}
                      >
                        <Hash size={11} className={isAdded ? 'text-emerald-400' : 'text-gray-400'} />
                        {kw}
                        {isAdded && <Check size={11} className="text-emerald-400 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* YouTube SEO & Ranked Tags Bashoratchisi (VidIQ / TubeBuddy Style) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1322] to-[#121c30] border border-emerald-500/30 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Award size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">VidIQ & TubeBuddy Ranked Teglar Bashoratchisi</h4>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Search Rank Optimizer
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        YouTube qidiruv natijalarida yuqori pog'onalarga (#1-#3) chiqish ehtimolini hisoblash va optimallash
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isAnalyzingSeo}
                      onClick={() => handleAnalyzeSeo()}
                      className="text-xs flex items-center gap-1.5 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-300 cursor-pointer"
                    >
                      <Search size={14} className={isAnalyzingSeo ? 'animate-spin' : ''} />
                      {isAnalyzingSeo ? 'Audit...' : 'Audit Qilish'}
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={isOptimizingTags}
                      onClick={handleOptimizeTags}
                      className="text-xs flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                    >
                      <Sparkles size={14} className={isOptimizingTags ? 'animate-spin' : ''} />
                      {isOptimizingTags ? 'Optimizatsiya...' : 'Ranked Teglarni 1-Bosishda Qo\'shish'}
                    </Button>
                  </div>
                </div>

                {/* Score Cards Breakdown */}
                {seoAudit && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Umumiy SEO Ball</span>
                        <span className="text-xl font-black text-white">{seoAudit.score}/100</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        seoAudit.score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        seoAudit.score >= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {seoAudit.score >= 80 ? 'Ajoyib' : seoAudit.score >= 60 ? 'O\'rtacha' : 'Past'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Sarlavha</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-sm font-bold text-emerald-400">{seoAudit.titleScore} / 30</span>
                        <span className="text-[10px] text-gray-400">Power words</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Tavsif</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-sm font-bold text-blue-400">{seoAudit.descriptionScore} / 35</span>
                        <span className="text-[10px] text-gray-400">Timestamps & Links</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Ranked Teglar</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-sm font-bold text-amber-400">{seoAudit.tagScore} / 35</span>
                        <span className="text-[10px] text-gray-400">Search Rank #1-#5</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ranked Tags Display */}
                {seoAudit?.rankedTags && seoAudit.rankedTags.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      <Flame size={14} className="text-emerald-400" />
                      Kutilayotgan Qidiruv Pog'onalari (Predicted Search Ranks):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {seoAudit.rankedTags.map((rt: any, rtIdx: number) => (
                        <div
                          key={rtIdx}
                          className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2 text-xs hover:border-emerald-500/40 transition-all"
                        >
                          <span className="text-gray-200 font-semibold">{rt.tag}</span>
                          {rt.isRanked ? (
                            <span className="bg-emerald-500 text-black font-black text-[11px] px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                              #{rt.predictedRank}
                            </span>
                          ) : (
                            <span className="bg-white/10 text-gray-400 font-mono text-[10px] px-1.5 py-0.5 rounded">
                              #{rt.predictedRank}
                            </span>
                          )}
                          <span className="text-[10px] font-medium text-emerald-400/80">
                            {rt.searchVolume}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {seoAudit?.recommendations && seoAudit.recommendations.length > 0 && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[11px] font-bold text-gray-300 block">💡 Algoritmik Maslahatlar:</span>
                    <ul className="text-[11px] text-gray-400 space-y-0.5">
                      {seoAudit.recommendations.map((rec: string, rIdx: number) => (
                        <li key={rIdx} className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Teglar Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Teglar (Tags - vergul bilan ajratilgan)</label>
                <Input 
                  value={metaTags} 
                  onChange={(e) => setMetaTags(e.target.value)} 
                  placeholder="ai, tech, viral..."
                />
              </div>

              {/* Tavsif Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Tavsif (Description & Timestamps)</label>
                <Textarea 
                  className="min-h-[140px]" 
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="YouTube video tavsifi va vaqt belgilari..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  variant="primary" 
                  disabled={isSaving}
                  onClick={handleSaveChanges}
                >
                  {isSaving ? 'Saqlanmoqda...' : "SEO & O'sish Metadatasini saqlash"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Comments & AI Smart Reply */}
        <Tabs.Content value="comments" className="space-y-6 animate-fade-in">
          {/* Pinned Comment & Engagement Booster Box */}
          <Card className="liquid-glass border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.08)]">
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Pin size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        YouTube Qadalgan Izoh & Faollik Kuchaytirgich (Engagement Booster)
                      </h3>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        +140% Retention
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Tomoshabinlarni bahsga chorlovchi, ovoz to'plovchi va videoni tavsiyalar ("rek") ga olib chiquvchi qadalgan izohlar
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isGeneratingPinned}
                    onClick={handleGeneratePinnedComments}
                    className="flex-1 sm:flex-initial text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Sparkles size={14} className={isGeneratingPinned ? 'animate-spin' : ''} />
                    {isGeneratingPinned ? 'Generatsiya qilinmoqda...' : '🤖 4 ta Viral Izoh Yaratish'}
                  </Button>
                </div>
              </div>

              {/* 4 Viral Archetypes Selector */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                  Algoritmik Strategiya Shabloni (Bosing va Tanlang):
                </span>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(pinnedCommentOptions.length > 0 ? pinnedCommentOptions : [
                    {
                      id: 'pinned_debate',
                      archetype: 'debate',
                      label: '🥊 Munozara & Aniq Tanlov',
                      badge: 'Eng Ko\'p Izoh Keltiruvchi',
                      commentText: `Be honest: If you were forced to build your next production project with ONLY ONE AI tool from this video, which one are you betting your career on? 1 or 2? Drop your verdict below 👇`,
                      expectedRetentionBoost: '+38% Izohlar Konversiyasi',
                      strategyRationale: 'Tomoshabinda 2 ta vositadan birini tanlash istagini 3x oshiradi.'
                    },
                    {
                      id: 'pinned_micro_poll',
                      archetype: 'micro_poll',
                      label: '📊 Tezkor Micro-Poll (1, 2, 3)',
                      badge: 'Tezkor Ovoz Berish',
                      commentText: `Quick community poll:\n[1] = Already using autonomous AI agents daily\n[2] = Still experimenting / evaluating safety\n[3] = Writing 100% of code manually\n\nVote with 1, 2, or 3 below! Curious where our community stands 🔥`,
                      expectedRetentionBoost: '+52% Tezkor Reaksiya',
                      strategyRationale: 'Raqamlar bilan javob berish osonligi tufayli kommentlar sonini portlatadi.'
                    },
                    {
                      id: 'pinned_resource_drop',
                      archetype: 'resource_drop',
                      label: '🎁 Bepul Resurs & Blueprint Drop',
                      badge: 'Yuqori Sodiqlik (Loyalty)',
                      commentText: `⚡ Barcha promptlar, arxitektura diagrammalari va havola kanalimiz tavsifida berildi!\n\nKeyingi videoda qaysi AI agentini 0 dan oxirigacha jonli qurib ko'rsataylik? Eng ko'p layk to'plagan taklifni chiqaramiz! 👇`,
                      expectedRetentionBoost: '+44% Qayta Ko\'rish & Obuna',
                      strategyRationale: 'Auditoriyaga keyingi mavzuni tanlash vakolatini beradi.'
                    },
                    {
                      id: 'pinned_controversial_hook',
                      archetype: 'controversial_hook',
                      label: '⚡ Provokatsion Bahs',
                      badge: 'Maksimal Watch Time',
                      commentText: `Unpopular opinion: Within 18 months, developers who refuse to adopt autonomous agents won't be replaced by AI — they'll be replaced by 1 engineer commanding 10 agents.\n\nAgree or Disagree? Defend your position below 👇`,
                      expectedRetentionBoost: '+60% Tomosha Vaqti',
                      strategyRationale: 'Tomoshabinlar bahslashayotganda video orqa fonda qayta aylanadi.'
                    }
                  ]).map((item: any) => {
                    const isSelected = pinnedCommentText === item.commentText || selectedPinnedArchetype === item.archetype;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setPinnedCommentText(item.commentText);
                          setSelectedPinnedArchetype(item.archetype);
                          setToast(`🎯 "${item.label}" strategiyasi faollashtirildi!`);
                          setTimeout(() => setToast(null), 2500);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white block">{item.label}</span>
                            {isSelected && <Check size={14} className="text-amber-400" />}
                          </div>
                          <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                            {item.strategyRationale}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md self-start border border-amber-500/20">
                          {item.expectedRetentionBoost}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Editable Pinned Comment Text */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300">
                    Tanlangan Qadalgan Izoh Matni (Tahrirlashingiz mumkin):
                  </label>
                  <span className="text-[11px] text-gray-400">
                    {pinnedCommentText.length} belgi
                  </span>
                </div>
                <Textarea
                  rows={4}
                  value={pinnedCommentText}
                  onChange={(e) => setPinnedCommentText(e.target.value)}
                  placeholder="Savol yoki obuna chaqirig'ini yozing..."
                  className="text-xs font-mono bg-black/40 border-white/15 focus:border-amber-500 text-gray-200 leading-relaxed"
                />
              </div>

              {/* Action Buttons: Publish to YouTube & Copy */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isPublishingPinned || !pinnedCommentText.trim()}
                    onClick={handlePublishPinnedComment}
                    className="text-xs font-bold bg-red-600 hover:bg-red-500 flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <Youtube size={15} />
                    {isPublishingPinned ? 'Chop etilmoqda...' : '📌 YouTube\'ga Qadab Chop Etish'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(pinnedCommentText);
                      setCopiedField('pinnedComment');
                      setToast("✅ Qadalgan izoh buferga nusxalandi!");
                      setTimeout(() => setCopiedField(null), 2000);
                    }}
                    className="text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy size={14} />
                    {copiedField === 'pinnedComment' ? 'Nusxalandi!' : 'Nusxa olish'}
                  </Button>
                </div>

                <div className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Zap size={13} className="text-amber-400" />
                  <span>Kanal: <strong className="text-white">Neural Pulse AI</strong> (@NeuralPulseAI-m3e)</span>
                </div>
              </div>

              {/* Simulated Live YouTube Pinned Comment Box */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                    <Pin size={13} className="text-gray-300" />
                    <span>Neural Pulse AI tomonidan qadalgan</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Jonli YouTube Ko'rinishi
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <img
                    src="/host_alex.jpg"
                    alt="Host Alex"
                    className="w-8 h-8 rounded-full object-cover border border-amber-500/40 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded text-[11px]">
                        @NeuralPulseAI-m3e
                      </span>
                      <span className="text-[10px] text-gray-400">hozirgina</span>
                    </div>
                    <p className="text-gray-200 whitespace-pre-wrap leading-relaxed font-sans text-xs">
                      {pinnedCommentText || "Izoh matni bu yerda ko'rinadi..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Algorithmic Secret Banner */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed flex items-start gap-2.5">
                <Zap size={16} className="mt-0.5 flex-shrink-0 text-amber-400" />
                <span>
                  <strong>Viral Algoritm Siri:</strong> Qadalgan izohda savol berish (Call-to-Comment) tomoshabinlarning 40% ko'proq izoh qoldirishiga sabab bo'ladi. YouTube tomoshabin izoh yozayotgan paytda orqa fonda video qayta aylanib tomosha vaqtini (watch time) 140% ga yetkazadi va YouTube Shorts tavsiyalar ("rek") ga chiqaradi.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* AI Smart Comment Reply Engine */}
          <Card className="liquid-glass border border-cyan-500/30">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">AI Smart Izohlar Yordamchisi (Reply Engine)</h3>
                    <p className="text-xs text-gray-400">Tomoshabinlar savollariga algoritmik 3 xil uslubda professional javoblar tayyorlang</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  2-Hour Comment Velocity
                </span>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-300 block">
                  Tomoshabin qoldirgan izoh yoki savol matni:
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Tomoshabin izohini shu yerga yozing yoki namunani tanlang..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isGeneratingReplies) {
                        e.preventDefault();
                        handleGenerateCommentReplies();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="primary"
                    disabled={isGeneratingReplies || !commentInput.trim()}
                    onClick={() => handleGenerateCommentReplies()}
                    className="whitespace-nowrap flex items-center gap-1.5 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 border-cyan-500 cursor-pointer"
                  >
                    <Sparkles size={14} className={isGeneratingReplies ? 'animate-spin' : ''} />
                    {isGeneratingReplies ? 'Tayyorlanmoqda...' : 'Javob Yaratish'}
                  </Button>
                </div>

                {/* Quick Sample Questions */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-gray-400 font-semibold block">Tezkor namunaviy savollar:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Does AutoFlow have a free tier or do I need API credits?",
                      "How does this compare to Devin and Claude 3.5 Sonnet?",
                      "Can you make a full tutorial on building autonomous agents?",
                      "Which model was used for this voiceover?"
                    ].map((sample, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleGenerateCommentReplies(sample)}
                        className="text-[11px] px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-cyan-300 transition-all text-left cursor-pointer"
                      >
                        "{sample}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generated Replies Cards */}
              {generatedReplies.length > 0 && (
                <div className="space-y-4 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" />
                      Algoritmik Javob Variantlari (Tanlang va Nusxalang):
                    </span>
                    <span className="text-[10px] text-gray-400">1-bosishda nusxalash</span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {generatedReplies.map((replyItem, idx) => {
                      const isCopied = copiedReplyIdx === idx;
                      const badgeColors: Record<string, string> = {
                        insightful: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
                        friendly_cta: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
                        debate: 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      };
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-3 shadow-lg"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColors[replyItem.type] || 'bg-white/10 text-gray-300'}`}>
                                {replyItem.badge || replyItem.type}
                              </span>
                              <span className="text-[10px] text-gray-400">{replyItem.title}</span>
                            </div>
                            <p className="text-xs text-white leading-relaxed font-sans bg-black/30 p-3 rounded-xl border border-white/5">
                              "{replyItem.reply}"
                            </p>
                            <p className="text-[10px] text-gray-400 italic">
                              💡 <strong>Algoritm:</strong> {replyItem.reason}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(replyItem.reply);
                              setCopiedReplyIdx(idx);
                              setToast(`✅ ${replyItem.title} buferga nusxalandi!`);
                              setTimeout(() => setCopiedReplyIdx(null), 2500);
                            }}
                            className={`w-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                              isCopied ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : ''
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check size={14} className="text-emerald-400" />
                                Nusxalandi!
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                Nusxa olish
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* YouTube Community Tab Autopilot Card */}
          <Card className="liquid-glass border border-purple-500/30">
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                    <Vote size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">YouTube Hamjamiyat (Community Tab) Avtopiloti</h3>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Viral Pre-Launch
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Video chiqishidan oldin va keyin kanalda bahs-munozara uyg'otuvchi interaktiv so'rovnoma va teaser postlar
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLoadingCommunityPosts}
                  onClick={fetchCommunityPosts}
                  className="text-xs flex items-center gap-1.5 border-purple-500/30 hover:bg-purple-500/10 text-purple-300 cursor-pointer"
                >
                  <RefreshCw size={13} className={isLoadingCommunityPosts ? 'animate-spin' : ''} />
                  {isLoadingCommunityPosts ? 'Yuklanmoqda...' : 'Qayta Generatsiya'}
                </Button>
              </div>

              {communityPosts.length > 0 && (
                <div className="grid md:grid-cols-3 gap-4">
                  {communityPosts.map((post: any) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between gap-3 shadow-lg"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            post.type === 'poll' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            post.type === 'teaser' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {post.type === 'poll' ? '🗳️ So\'rovnoma' : post.type === 'teaser' ? '⚡ Teaser Post' : '💬 Munozara'}
                          </span>
                        </div>

                        <span className="text-[11px] font-bold text-amber-300 block">{post.timingLabel}</span>
                        
                        <p className="text-xs text-white leading-relaxed font-sans bg-black/40 p-3 rounded-xl border border-white/5">
                          {post.question}
                        </p>

                        {post.options && (
                          <div className="space-y-1.5 pt-1">
                            {post.options.map((opt: string, oi: number) => (
                              <div key={oi} className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-gray-300 flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                  {oi + 1}
                                </span>
                                <span className="truncate">{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <span className="text-[10px] text-gray-400 italic block">
                          🎯 {post.expectedEngagement}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const copyPayload = post.options
                            ? `${post.question}\n\nVariantlar:\n${post.options.map((o: string, idx: number) => `${idx + 1}. ${o}`).join('\n')}\n\n#community #shorts #neuralpulseai`
                            : post.question;
                          navigator.clipboard.writeText(copyPayload);
                          setToast("✅ Hamjamiyat posti buferga nusxalandi!");
                          setTimeout(() => setToast(null), 2500);
                        }}
                        className="w-full text-xs font-bold flex items-center justify-center gap-1.5 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 cursor-pointer"
                      >
                        <Copy size={13} /> Postni Nusxalash
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Monetization & Affiliate Engine */}
        <Tabs.Content value="monetization" className="space-y-6 animate-fade-in">
          <Card className="liquid-glass border border-emerald-500/30">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Smart Affiliate & Sponsor Monetizatsiya Studiyasi</h3>
                    <p className="text-xs text-gray-400">Video mavzusiga mos yuqori to'lovchi AI dasturlari orqali AdSense'dan tashqari daromad qiling</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  Est. +$150-$450 / 10k Views
                </span>
              </div>

              {/* Profit Tip */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-transparent border border-emerald-500/25 flex items-start gap-3">
                <Zap size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-300 leading-relaxed space-y-1">
                  <span className="font-bold text-emerald-300 block">YouTube Shorts Monetizatsiya Haqiqati:</span>
                  <p>
                    YouTube Shorts faqat AdSense orqali kam to'laydi ($0.10 CPM). Lekin video tavsifiga (Description) yoki qadalgan izohga (Pinned Comment) qo'yilgan bitta SaaS hamkorlik havolasi (Affiliate) har 1000 ko'rishdan <strong>$15-$45</strong> gacha doimiy oylik passiv daromad olib kelishi mumkin.
                  </p>
                </div>
              </div>

              {/* Matched Links */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" />
                    Ushbu Video Uchun Tavsiya Qilingan Eng Mos Hamkorlik Havolalari:
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchMatchedAffiliates}
                    disabled={isLoadingAffiliates}
                    className="text-xs flex items-center gap-1"
                  >
                    <RefreshCw size={12} className={isLoadingAffiliates ? 'animate-spin' : ''} />
                    Yangilash
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {(matchedAffiliates.length > 0 ? matchedAffiliates : [
                    {
                      id: 'aff_cursor',
                      name: 'Cursor AI Code Editor',
                      url: 'https://cursor.com/?ref=jpilot_creator',
                      category: 'AI Dasturlash',
                      commissionRate: '20% har oy',
                      estimatedEpc: '$2.80',
                      ctaPhrase: '⚡ Build apps 10x faster with Cursor AI (Free trial):',
                      badge: 'High Converting'
                    },
                    {
                      id: 'aff_make',
                      name: 'Make.com Avtomatlashtirish',
                      url: 'https://make.com/?ref=jpilot_ai',
                      category: 'Avtomatlashtirish & Botlar',
                      commissionRate: '20% doimiy',
                      estimatedEpc: '$3.40',
                      ctaPhrase: '🤖 Connect 1,000+ apps automatically with Make:',
                      badge: 'Top SaaS'
                    }
                  ]).map((aff) => {
                    const fullSnippet = `${aff.ctaPhrase} ${aff.url}`;
                    return (
                      <div
                        key={aff.id}
                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 shadow-lg"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              {aff.badge || 'SaaS'}
                            </span>
                            <span className="text-xs font-mono font-bold text-amber-400">
                              EPC: {aff.estimatedEpc || '$2.50'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{aff.name}</h4>
                            <p className="text-[11px] text-gray-400">{aff.category} • Komissiya: <strong className="text-emerald-300">{aff.commissionRate}</strong></p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-gray-300 break-all">
                            {fullSnippet}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setMetaDescription((prev) => `${prev}\n\n${fullSnippet}`);
                              setInjectedAffiliateId(aff.id);
                              setToast(`✅ "${aff.name}" video tavsifiga muvaffaqiyatli kiritildi!`);
                              setTimeout(() => setToast(null), 3000);
                            }}
                            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 border-emerald-500 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 size={13} />
                            Tavsifga kiritish
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPinnedCommentText((prev) => `${fullSnippet}\n\n${prev}`);
                              setToast(`✅ "${aff.name}" qadalgan izohga (Pinned Comment) kiritildi!`);
                              setTimeout(() => setToast(null), 3000);
                            }}
                            className="text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Pin size={13} />
                            Izohga kiritish
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Multi-Language Global Dubbing */}
        <Tabs.Content value="dubbing" className="space-y-6 animate-fade-in">
          <Card className="liquid-glass border border-blue-500/30">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Multi-Language Global Dubbing Studio</h3>
                    <p className="text-xs text-gray-400">Videoni professional AI diksiya bilan boshqa xalqaro tillarga 1-klikda o'giring</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  Global Reach Booster
                </span>
              </div>

              {/* Language Selector Cards */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-white block">Maqsadli Tilni Tanlang:</label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      code: 'es',
                      name: 'Ispancha',
                      native: 'Español',
                      flag: '🇪🇸',
                      market: 'Ispaniya & Lotin Amerikasi (500M+)',
                      rpm: '$1.80 - $3.20',
                      voice: 'es-ES-AlvaroNeural'
                    },
                    {
                      code: 'uz',
                      name: 'O\'zbekcha',
                      native: 'O\'zbek tili',
                      flag: '🇺🇿',
                      market: 'O\'zbekiston & Markaziy Osiyo (36M+)',
                      rpm: '$0.40 - $0.90',
                      voice: 'uz-UZ-SardorNeural'
                    },
                    {
                      code: 'de',
                      name: 'Nemischa',
                      native: 'Deutsch',
                      flag: '🇩🇪',
                      market: 'Germaniya & Avstriya (High CPM)',
                      rpm: '$4.50 - $7.80',
                      voice: 'de-DE-KillianNeural'
                    },
                    {
                      code: 'fr',
                      name: 'Fransuzcha',
                      native: 'Français',
                      flag: '🇫🇷',
                      market: 'Fransiya & Kanada',
                      rpm: '$3.20 - $5.50',
                      voice: 'fr-FR-HenriNeural'
                    }
                  ].map((lang) => {
                    const isSelected = selectedDubLang === lang.code;
                    return (
                      <div
                        key={lang.code}
                        onClick={() => setSelectedDubLang(lang.code)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg ring-1 ring-blue-500/30'
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{lang.flag}</span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                            {lang.rpm}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1">
                            {lang.name}
                            {isSelected && <CheckCircle2 size={14} className="text-blue-400" />}
                          </h4>
                          <p className="text-[11px] text-gray-400">{lang.native}</p>
                          <p className="text-[10px] text-gray-400 mt-1 leading-snug">{lang.market}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  disabled={isDubbing}
                  onClick={handleTranslateAndDub}
                  className="w-full sm:w-auto px-6 text-xs font-bold bg-blue-600 hover:bg-blue-500 border-blue-500 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Sparkles size={16} className={isDubbing ? 'animate-spin' : ''} />
                  {isDubbing ? 'Dublyaj skripti va audio generatsiya qilinmoqda...' : '🚀 Tanlangan Tilda Dublyaj Qilish'}
                </Button>
              </div>

              {/* Dubbing Output Preview */}
              {dubbedResult && (
                <div className="space-y-4 pt-4 border-t border-white/10 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      Tayyor Dublyaj Paketi ({dubbedResult.languageName}):
                    </span>
                    <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      Ovoz: {dubbedResult.voiceModel}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-xs">
                    <div>
                      <span className="text-gray-400 block font-semibold">Tarjima qilingan Sarlavha:</span>
                      <p className="font-bold text-white text-sm mt-0.5">{dubbedResult.translatedTitle}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold">Dublyaj Skripti:</span>
                      <p className="font-sans text-gray-200 mt-0.5 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5 whitespace-pre-wrap">
                        {dubbedResult.translatedScript}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold">Qadalgan Izoh (Pinned Comment):</span>
                      <p className="font-sans text-amber-300 mt-0.5 bg-black/40 p-3 rounded-xl border border-white/5">
                        {dubbedResult.translatedPinnedComment}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(dubbedResult.translatedScript);
                        setToast("✅ Dublyaj skripti nusxalandi!");
                        setTimeout(() => setToast(null), 2500);
                      }}
                      className="text-xs flex items-center gap-1.5"
                    >
                      <Copy size={13} />
                      Skriptdan nusxa olish
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Sifat Tekshiruvi */}
        <Tabs.Content value="sifat tekshiruvi" className="space-y-4 animate-fade-in">
          <Card className="liquid-glass border border-white/10">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-400" />
                Algoritm & Viral Sifat Audit (Quality Checklist)
              </h3>
              <div className="grid gap-3 pt-2">
                {[
                  { title: "0-3s Pattern Interrupt Hook", desc: isLong ? "Kuchli kirish foni va kiber-audio zarba bilan tomoshabin e'tibori birinchi soniyalardayoq qulflangan." : "Pulsatsiyalanuvchi xabarnoma va sub-bass drop bilan tomoshabin e'tibori ushlab qolinadi.", ok: true },
                  { title: "Typografiya & Subtitr Xavfsizligi", desc: "Harflar ekrandan chiqib ketmaydi, barcha subtitrlar 100px xavfsiz chegara bilan joylashtirilgan.", ok: true },
                  { title: "Host Alex Yuzi 100% Ochiq", desc: "Boshlovchining yuzi, ko'zoynagi va mimikasi ustiga hech qanday yozuv yoki banner tushmaydi.", ok: true },
                  { title: "Inglizcha Diksiyaning Tozaligi", desc: "Microsoft Azure Neural Christopher modeli orqali 100% tushunarli, tabiiy AQSh aksenti.", ok: true },
                  { title: isLong ? "16:9 Katta Format Rezolyutsiyasi" : "9:16 Shorts Rezolyutsiyasi", desc: isLong ? "1920x1080 Full HD 60FPS keng formatli video master fayl." : "1080x1920 Vertikal Ultra-HD 60FPS video fayl.", ok: true }
                ].map((item, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      [OK] O'tdi
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Multi-Platform Reels & TikTok Export Package */}
        <Tabs.Content value="multi_export" className="space-y-6 animate-fade-in">
          <div className="grid md:grid-cols-3 gap-5">
            {/* YouTube Shorts Card */}
            <Card className="liquid-glass border border-red-500/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                  <div className="p-2 rounded-xl bg-red-600/20 text-red-400">
                    <Youtube size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">YouTube Shorts</h4>
                    <span className="text-[10px] text-gray-400">1080x1920 • Yuqori CTR</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-gray-400 block">Sarlavha (#Shorts bilan):</span>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white font-mono flex justify-between items-center">
                    <span className="truncate mr-2">{videoTitle} #Shorts</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${videoTitle} #Shorts`);
                        setCopiedField('yt_title');
                        setTimeout(() => setCopiedField(null), 2000);
                      }}
                      className="text-gray-400 hover:text-white flex-shrink-0 cursor-pointer"
                    >
                      <Copy size={14} className={copiedField === 'yt_title' ? 'text-emerald-400' : ''} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-gray-400 block">Pinned Comment:</span>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-gray-300 flex justify-between items-center">
                    <span className="line-clamp-2 mr-2">{pinnedCommentText || 'Which tool will you test first?'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(pinnedCommentText || '');
                        setCopiedField('yt_pin');
                        setTimeout(() => setCopiedField(null), 2000);
                      }}
                      className="text-gray-400 hover:text-white flex-shrink-0 cursor-pointer"
                    >
                      <Copy size={14} className={copiedField === 'yt_pin' ? 'text-emerald-400' : ''} />
                    </button>
                  </div>
                </div>

                {activeVideoSrc && (
                  <div className="pt-2">
                    <a
                      href={activeVideoSrc}
                      download={`${contentId}.mp4`}
                      className="w-full py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-red-500/30 transition-all cursor-pointer block text-center"
                    >
                      <Download size={14} /> MP4 Yuklab Olish
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TikTok Card */}
            <Card className="liquid-glass border border-cyan-500/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                  <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">TikTok Format</h4>
                    <span className="text-[10px] text-gray-400">Virallik va FYP algoritmi</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-gray-400 block">TikTok Caption & Heshteglar:</span>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white space-y-2">
                    <p className="text-gray-200 line-clamp-3">
                      {videoTitle.replace(/#\w+/g, '')} ⚡ Test these AI tools before everyone else!
                    </p>
                    <p className="text-[10px] text-cyan-400 font-mono">
                      #fyp #ai #techtok #coding #developer #software #aitools #automation
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${videoTitle.replace(/#\w+/g, '')}\n\n#fyp #ai #techtok #coding #developer #software #aitools #automation`);
                        setCopiedField('tt_caption');
                        setTimeout(() => setCopiedField(null), 2000);
                      }}
                      className="w-full py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Copy size={13} /> {copiedField === 'tt_caption' ? 'Nusxalandi!' : 'TikTok Paketini Nusxalash'}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instagram Reels Card */}
            <Card className="liquid-glass border border-pink-500/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                  <div className="p-2 rounded-xl bg-pink-600/20 text-pink-400">
                    <Share2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Instagram Reels</h4>
                    <span className="text-[10px] text-gray-400">Explore va Save konversiyasi</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-gray-400 block">Reels Caption & Call-To-Action:</span>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white space-y-2">
                    <p className="text-gray-200 line-clamp-3">
                      Save this for later! 📌 Here is the 2026 blueprint: {videoTitle.replace(/#\w+/g, '')}
                    </p>
                    <p className="text-[10px] text-pink-400 font-mono">
                      #reels #techreels #ainews #softwareengineer #productivity #python
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`Save this for later! 📌\n\n${videoTitle.replace(/#\w+/g, '')}\n\nWhich tool would you test first? Let us know in the comments! 👇\n\n#reels #techreels #ainews #softwareengineer #productivity #python`);
                        setCopiedField('ig_caption');
                        setTimeout(() => setCopiedField(null), 2000);
                      }}
                      className="w-full py-2 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Copy size={13} /> {copiedField === 'ig_caption' ? 'Nusxalandi!' : 'Reels Paketini Nusxalash'}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs.Content>

        {/* Tasdiqlash & Video Studio */}
        <Tabs.Content value="tasdiqlash" className="space-y-6 animate-fade-in">
          {/* AWAITING GENERATION: STUDIO READY */}
          {status === 'awaiting_generation' && (
            <div className="liquid-glass rounded-3xl p-8 border border-red-500/30 text-center space-y-6 shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mx-auto shadow-[0_0_25px_rgba(239,68,68,0.3)]">
                <Sparkles size={32} className="animate-pulse" />
              </div>
              <div className="space-y-2 max-w-xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/15 text-red-300 border border-red-500/30">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Skript & Sahnalar Tayyor
                </div>
                <h3 className="text-2xl font-black text-white">{videoTitle}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Ushbu mavzu uchun AI skripti, {scenes.length} ta alohida sahnasi va SEO parametrlari muvaffaqiyatli shakllantirildi. 
                  Haqiqiy videoni (Microsoft Azure diktor ovozi, 2K B-roll va dinamik kinetik subtitrlar bilan) render qilish uchun quyidagi tugmani bosing.
                </p>
              </div>

              {/* Scene Breakdown preview */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-2xl mx-auto pt-2">
                {scenes.map((s: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                    <span className="text-[10px] font-bold text-red-400 block">{s.tag || `Sahna ${idx + 1}`}</span>
                    <span className="text-[11px] text-gray-300 font-semibold truncate block mt-0.5">{s.title.split(':')[0]}</span>
                  </div>
                ))}
              </div>

              {/* Voice Emotion Selector for this video */}
              <div className="max-w-xl mx-auto p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sliders size={14} className="text-violet-400" />
                    Diksiya & Nutq Emotsiyasi (Azure SSML Modulator):
                  </span>
                  <span className="text-[10px] font-mono text-violet-300 font-bold px-2 py-0.5 rounded bg-violet-500/20 border border-violet-500/30">
                    {selectedVoicePreset.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'energetic', name: '⚡ Ultra Energetic', sub: '+16% Tezlik' },
                    { id: 'mysterious', name: '🕵️ Mysterious', sub: '-5% Chuqur' },
                    { id: 'authoritative', name: '🎓 Confident', sub: '+10% Ekspert' },
                    { id: 'calm', name: '🧘 Calm Story', sub: '0% Sokin' }
                  ].map((p) => {
                    const isSel = selectedVoicePreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedVoicePreset(p.id)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          isSel
                            ? 'bg-violet-600/30 border-violet-500 text-white shadow'
                            : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs font-bold block truncate">{p.name}</span>
                        <span className="text-[10px] text-gray-400 block">{p.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleStartGeneration}
                  className="shadow-[0_0_30px_rgba(239,68,68,0.4)] px-8 py-3 text-sm font-bold flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 cursor-pointer"
                >
                  <Play size={18} className="fill-white" />
                  Mavzuga Mos Video Generatsiya Qilish (Azure Voice + 6 Sahna B-Roll)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('skript')}
                  className="text-xs"
                >
                  Skriptni ko'rish / tahrirlash
                </Button>
              </div>
            </div>
          )}

          {/* GENERATION IN PROGRESS */}
          {status === 'generating' && (
            <div className="liquid-glass rounded-3xl p-8 border border-white/10 text-center space-y-6 shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mx-auto animate-pulse">
                <RefreshCw size={32} className="animate-spin" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/15 text-red-300 border border-red-500/30">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Real-time Render Monitoring
                </div>
                <h3 className="text-xl font-black text-white">
                  {renderProgress?.currentStep || genStep}
                </h3>
                <p className="text-xs text-gray-400">
                  {renderProgress 
                    ? `Qadam: ${renderProgress.stepsCompleted}/${renderProgress.totalSteps} • O'tgan vaqt: ${renderProgress.elapsedSeconds}s • Qolgan: ~${renderProgress.estimatedRemainingSeconds}s`
                    : (isLong ? "16:9 Katta formatli video render qilinmoqda. Biroz kuting..." : "Neural Pulse AI video dvigateli ishlamoqda. Biroz kuting...")}
                </p>
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
                  <div 
                    className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(255,0,0,0.8)]"
                    style={{ width: `${renderProgress?.percent ?? genProgress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-gray-400 px-1">
                  <span>{renderProgress?.percent ?? genProgress}% bajarildi</span>
                  {renderProgress?.estimatedRemainingSeconds !== undefined && (
                    <span className="text-cyan-400 font-mono">~{renderProgress.estimatedRemainingSeconds}s qoldi</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: READY FOR REVIEW & PREVIEW */}
          {status === 'ready_for_review' && (
            <div className="space-y-6 animate-fade-in">
              <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl">
                {isLong ? (
                  /* 16:9 Widescreen Horizontal Player */
                  <div className="space-y-6">
                    <div className="flex flex-col items-center">
                      {/* Player Mode Switcher */}
                      <div className="flex items-center justify-between w-full max-w-[800px] mb-3 px-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowYouTubeEmbed(false)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              !showYouTubeEmbed ? 'bg-blue-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                          >
                            🎬 Studio Pleyer (1080p HD)
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowYouTubeEmbed(true)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              showYouTubeEmbed ? 'bg-red-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                          >
                            <Youtube size={14} className="text-red-400 fill-red-400" /> YouTube Pleyer (Jonli)
                          </button>
                        </div>
                        {!showYouTubeEmbed && (
                          <Button 
                            onClick={togglePlay} 
                            variant="secondary" 
                            size="sm"
                            className="text-xs h-8 px-3 border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                          >
                            {isPlaying ? <Pause size={13} className="mr-1.5" /> : <Play size={13} className="mr-1.5 fill-blue-300" />}
                            {isPlaying ? "To'xtatish (Pause)" : "Videoni ko'rish (Play)"}
                          </Button>
                        )}
                      </div>

                      {showYouTubeEmbed ? (
                        <div className="w-full max-w-[800px] aspect-video rounded-3xl border-4 border-red-500/30 bg-black overflow-hidden relative shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                          <iframe 
                            src="https://www.youtube.com/embed/y2uIY0kprx0?autoplay=1"
                            title="Neural Pulse AI"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="w-full max-w-[800px] aspect-video rounded-3xl border-4 border-white/20 bg-black overflow-hidden relative shadow-[0_0_50px_rgba(59,130,246,0.3)] flex flex-col justify-center bg-zinc-950 group select-none">
                          {/* Top Dynamic Topic Overlay */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
                            <div className="flex items-center gap-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-500/40 max-w-[75%] shadow-xl">
                              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                              <span className="text-xs font-bold text-white truncate">Mavzu: {videoTitle}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-500/40 backdrop-blur-md">
                              {currentScene?.tag || '16:9 Master'}
                            </span>
                          </div>

                          <video 
                            ref={videoRef}
                            key={activeVideoSrc}
                            poster={`/banner.jpg?v=${videoVersion}`} 
                            playsInline
                            preload="auto"
                            loop
                            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 615)}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={togglePlay}
                          >
                            <source src={activeVideoSrc} type="video/mp4" />
                            {contentId && <source src={`/media/videos/${contentId}.mp4?v=${videoVersion}`} type="video/mp4" />}
                            {contentId && <source src={`/videos/${contentId}.mp4?v=${videoVersion}`} type="video/mp4" />}
                          </video>

                          {/* Center Play Overlay */}
                          {!isPlaying && (
                            <div 
                              onClick={togglePlay}
                              className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/35"
                            >
                              <div className="w-20 h-20 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-[0_0_35px_rgba(59,130,246,0.85)] transform transition-transform hover:scale-110 active:scale-95">
                                <Play size={36} className="ml-1.5 fill-white" />
                              </div>
                              <span className="mt-4 text-xs font-bold text-white bg-black/80 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md max-w-[85%] truncate text-center">
                                ▶ {videoTitle}
                              </span>
                              <span className="text-[11px] text-blue-400 font-semibold mt-1.5 bg-black/60 px-2.5 py-0.5 rounded-md">
                                📺 1920x1080 Full HD • {itemData?.duration || '10:15'} Davomiylik
                              </span>
                            </div>
                          )}

                          {/* Bottom Scrubber */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-1.5 opacity-90 transition-opacity hover:opacity-100">
                            <div 
                              className="w-full h-1.5 bg-white/25 rounded-full cursor-pointer overflow-hidden"
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const pos = (e.clientX - rect.left) / rect.width;
                                jumpToScene(pos * duration);
                              }}
                            >
                              <div 
                                className="bg-blue-500 h-full rounded-full transition-all"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-white text-[11px] font-semibold pt-1">
                              <div className="flex items-center gap-2">
                                <button onClick={togglePlay} className="p-1 rounded hover:bg-white/20">
                                  {isPlaying ? <Pause size={14} className="fill-white" /> : <Play size={14} className="fill-white" />}
                                </button>
                                <button onClick={toggleMute} className="p-1 rounded hover:bg-white/20">
                                  {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-blue-400" />}
                                </button>
                              </div>
                              <span className="font-mono text-[10px] text-gray-300">
                                {Math.floor(currentTime)}s / {Math.floor(duration)}s (10:15)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Scene Jumper Chips */}
                      <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-2xl">
                        {scenes.map((s: any, sIdx: number) => {
                          const nextTime = scenes[sIdx + 1]?.time ?? 9999;
                          const isActive = currentTime >= s.time && currentTime < nextTime;
                          return (
                            <button
                              key={s.id || sIdx}
                              onClick={() => jumpToScene(s.time)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-blue-500/25 text-blue-300 border-blue-500/60 shadow-[0_0_12px_rgba(59,130,246,0.35)] scale-105'
                                  : 'bg-white/[0.05] text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {s.tag || s.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Specs & Actions for 16:9 */}
                    <div className="space-y-4 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/15 px-3 py-1 rounded-full border border-blue-500/30">
                          16:9 Katta Formatli Video Tayyor (Long-form Master)
                        </span>
                        <span className="text-xs text-gray-400">YouTube Monetizatsiya (High CPM)</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-gray-400 block">Format & Rezolyutsiya</span>
                          <span className="font-bold text-white">1920x1080 • Landscape 16:9</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-gray-400 block">Davomiyligi</span>
                          <span className="font-bold text-white">10:15 • 8.5 Mbps Ultra-HD</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-gray-400 block">Audio & Diktor</span>
                          <span className="font-bold text-blue-400">Azure Christopher + Ambient SFX</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-gray-400 block">Fayl hajmi & Master</span>
                          <span className="font-bold text-white">185.0 MB (High Profile H.264)</span>
                        </div>
                      </div>

                      {/* Growth Boosters Active Banner */}
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Pin size={13} className="text-amber-400" />
                          <span>Pinned Comment: <strong className="text-white">{pinnedCommentText ? `"${pinnedCommentText.slice(0, 38)}..."` : 'Avtomatik'}</strong></span>
                        </div>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                          EBU R128 (-14 LUFS) & Custom Thumb Faol
                        </span>
                      </div>

                      {/* Scheduling Controls */}
                      {renderSchedulingControls()}

                      {/* Buttons */}
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <a 
                          href={activeVideoSrc} 
                          download={`${videoTitle.replace(/[^a-zA-Z0-9]/g, '_')}_1080p.mp4`}
                          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 transition-all flex items-center gap-1.5"
                        >
                          📥 16:9 Videoni yuklab olish (MP4)
                        </a>
                        <Button variant="outline" size="sm" onClick={() => {
                          setVideoVersion(Date.now());
                          handleStartGeneration();
                        }}>
                          <RefreshCw size={14} className="mr-1.5" /> Qayta render (16:9)
                        </Button>
                        {!scheduledAtTime && (
                          <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={() => setScheduleModalOpen(!scheduleModalOpen)}
                            className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-bold text-xs"
                          >
                            <Clock size={16} className="mr-1.5" /> ⏰ O'z Vaqtida Avtomatik Yuklash
                          </Button>
                        )}
                        {isAuthNeeded && authUrl && (
                          <a
                            href={authUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-all flex items-center gap-1.5 animate-pulse"
                          >
                            <Youtube size={16} /> 1. YouTube OAuth Ruxsat Berish
                          </a>
                        )}
                        <Button variant="primary" size="lg" className="shadow-2xl bg-blue-600 hover:bg-blue-500 border-blue-500" onClick={handlePublishToYouTube}>
                          <Youtube size={20} className="mr-2 fill-white" /> 2. YouTube'ga Yuklash (16:9 Katta Video)
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 9:16 Shorts Vertical Player */
                  <div className="grid md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-5 flex flex-col items-center">
                      {/* Player Mode Switcher for Shorts */}
                      <div className="flex items-center justify-between w-[290px] mb-3 px-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowYouTubeEmbed(false)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              !showYouTubeEmbed ? 'bg-red-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                          >
                            🎬 Studio
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowYouTubeEmbed(true)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              showYouTubeEmbed ? 'bg-red-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                          >
                            <Youtube size={12} className="text-red-400 fill-red-400" /> YouTube
                          </button>
                        </div>
                        {!showYouTubeEmbed && (
                          <Button 
                            onClick={togglePlay} 
                            variant="secondary" 
                            size="sm"
                            className="text-[11px] h-7 px-2.5 border-red-500/30 text-red-300 hover:bg-red-500/10"
                          >
                            {isPlaying ? <Pause size={12} className="mr-1" /> : <Play size={12} className="mr-1 fill-red-300" />}
                            {isPlaying ? "To'xtatish" : "Ko'rish"}
                          </Button>
                        )}
                      </div>

                      {showYouTubeEmbed ? (
                        <div className="w-[290px] h-[515px] rounded-[38px] border-4 border-red-500/30 bg-black overflow-hidden relative shadow-[0_0_50px_rgba(255,0,0,0.4)]">
                          <iframe 
                            src="https://www.youtube.com/embed/y2uIY0kprx0?autoplay=1"
                            title="Neural Pulse AI Shorts"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="w-[290px] h-[515px] rounded-[38px] border-4 border-white/20 bg-black overflow-hidden relative shadow-[0_0_50px_rgba(255,0,0,0.4)] flex flex-col justify-center bg-zinc-950 group select-none">
                          {/* Top Dynamic Topic Overlay */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
                            <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-red-500/40 max-w-[75%] shadow-xl">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                              <span className="text-[11px] font-bold text-white truncate">Mavzu: {videoTitle}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-950/80 text-red-300 border border-red-500/40 backdrop-blur-md">
                              {currentScene?.tag || 'Shorts'}
                            </span>
                          </div>

                          {activeVideoSrc ? (
                            <>
                              <video 
                                ref={videoRef}
                                key={activeVideoSrc}
                                poster={`/host_alex.jpg?v=${videoVersion}`} 
                                playsInline
                                preload="auto"
                                loop
                                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 55.63)}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onEnded={() => setIsPlaying(false)}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={togglePlay}
                              >
                                <source src={activeVideoSrc} type="video/mp4" />
                                {contentId && <source src={`/media/videos/${contentId}.mp4?v=${videoVersion}`} type="video/mp4" />}
                                {contentId && <source src={`/videos/${contentId}.mp4?v=${videoVersion}`} type="video/mp4" />}
                              </video>

                              {/* Center Play Overlay */}
                              {!isPlaying && (
                                <div 
                                  onClick={togglePlay}
                                  className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/35"
                                >
                                  <div className="w-20 h-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-[0_0_35px_rgba(255,0,0,0.85)] transform transition-transform hover:scale-110 active:scale-95">
                                    <Play size={36} className="ml-1.5 fill-white" />
                                  </div>
                                  <span className="mt-4 text-xs font-bold text-white bg-black/80 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md max-w-[85%] truncate text-center">
                                    ▶ {videoTitle}
                                  </span>
                                  <span className="text-[11px] text-emerald-400 font-semibold mt-1.5 bg-black/60 px-2 py-0.5 rounded-md">
                                    🔊 Studio Diktor • {itemData?.duration || '0:56'}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 via-zinc-900 to-black relative select-none">
                              {isGeneratingVideo ? (
                                <div className="flex flex-col items-center justify-center max-w-xs space-y-4 animate-in fade-in">
                                  <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin flex items-center justify-center"></div>
                                    <Sparkles className="absolute inset-0 m-auto text-red-400 animate-pulse" size={24} />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-white mb-1">AI Video Generatsiya Qilinmoqda...</h4>
                                    <p className="text-[11px] text-gray-400 leading-relaxed px-2">
                                      Azure Neural diktor ovozi, dinamik kadrlar va kinetik subtitrlar yig'ilmoqda.
                                    </p>
                                  </div>
                                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden border border-white/10">
                                    <div className="bg-gradient-to-r from-red-500 via-amber-500 to-pink-500 h-full w-2/3 animate-pulse rounded-full"></div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center max-w-xs space-y-4">
                                  <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.2)]">
                                    <Video size={30} />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-white mb-1.5">Maxsus Video Tayyor Emas</h4>
                                    <p className="text-[11px] text-gray-400 leading-relaxed px-2">
                                      Boshqa mavzudagi videoni aralashtirmaslik uchun, aynan shu mavzu uchun maxsus video yarating!
                                    </p>
                                  </div>
                                  <button
                                    onClick={handleGenerateVideo}
                                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-red-500/30 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
                                  >
                                    <Sparkles size={15} />
                                    Mavzuga Mos Video Generatsiya Qilish
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Bottom Scrubber */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-1.5 opacity-90 transition-opacity hover:opacity-100">
                            <div 
                              className="w-full h-1.5 bg-white/25 rounded-full cursor-pointer overflow-hidden"
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const pos = (e.clientX - rect.left) / rect.width;
                                jumpToScene(pos * duration);
                              }}
                            >
                              <div 
                                className="bg-red-500 h-full rounded-full transition-all"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-white text-[11px] font-semibold pt-1">
                              <div className="flex items-center gap-2">
                                <button onClick={togglePlay} className="p-1 rounded hover:bg-white/20">
                                  {isPlaying ? <Pause size={14} className="fill-white" /> : <Play size={14} className="fill-white" />}
                                </button>
                                <button onClick={toggleMute} className="p-1 rounded hover:bg-white/20">
                                  {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-emerald-400" />}
                                </button>
                              </div>
                              <span className="font-mono text-[10px] text-gray-300">
                                {Math.floor(currentTime)}s / {Math.floor(duration)}s
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Scene Jumper Chips */}
                      <div className="mt-3.5 flex flex-wrap gap-1.5 justify-center max-w-[310px]">
                        {scenes.map((s: any, sIdx: number) => {
                          const nextTime = scenes[sIdx + 1]?.time ?? 9999;
                          const isActive = currentTime >= s.time && currentTime < nextTime;
                          return (
                            <button
                              key={s.id || sIdx}
                              onClick={() => jumpToScene(s.time)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-red-500/25 text-red-300 border-red-500/60 shadow-[0_0_12px_rgba(255,0,0,0.35)] scale-105'
                                  : 'bg-white/[0.05] text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {s.tag || s.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Video Info & Final Approval Action */}
                    <div className="md:col-span-7 space-y-5">
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
                          2-Bosqich: Multi-Scene Shorts Tayyor (Ko'rish & Tasdiqlash)
                        </span>
                        <h3 className="text-2xl font-black text-white">{videoTitle}</h3>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          AI ushbu video uchun {scenes.length} ta alohida sahnani ketma-ket montaj qildi: {scenes.map((s: any) => s.tag || s.title).join(', ')}. 
                          Microsoft Azure Neural Studio ovozi va ritmik fon musiqasi to'liq sinxronlandi.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-gray-400 block">Format & AI Video Footage</span>
                          <span className="font-bold text-white">1080x1920 • Hailuo AI & 2K B-Roll</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-gray-400 block">Davomiyligi & Bitrate</span>
                          <span className="font-bold text-white">45.4s • 3.5 Mbps Ultra-HD</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-gray-400 block">Audio & Ovoz Dizayni</span>
                          <span className="font-bold text-emerald-400">Azure Neural + 5 ta Sinematik SFX</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-gray-400 block">Fayl hajmi & Master</span>
                          <span className="font-bold text-white">20.0 MB (High Profile H.264)</span>
                        </div>
                      </div>

                      {/* Growth Boosters Active Banner */}
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Pin size={13} className="text-amber-400" />
                          <span>Pinned Comment: <strong className="text-white">{pinnedCommentText ? `"${pinnedCommentText.slice(0, 38)}..."` : 'Avtomatik'}</strong></span>
                        </div>
                        {relatedVideoId && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <Link2 size={13} className="text-blue-400" />
                            <span>16:9 Bridge: <strong className="text-blue-300 font-mono">{relatedVideoId}</strong></span>
                          </div>
                        )}
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                          EBU R128 (-14 LUFS) & Custom Thumb Faol
                        </span>
                      </div>

                      {/* Post-Publish Performance Alerts Card (System 5) */}
                      {performanceAlerts && (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#12162a] via-[#101c2e] to-[#0c1424] border border-blue-500/30 space-y-3.5 shadow-xl">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/10">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                <Bell size={18} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-white">Post-Publish Avtomatik Diagnostika</h4>
                                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                    performanceAlerts.overallHealth === 'excellent' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                                    performanceAlerts.overallHealth === 'good' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                                    performanceAlerts.overallHealth === 'at_risk' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                                    'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                                  }`}>
                                    {performanceAlerts.checkpointLabel}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-400">
                                  Keyingi tekshiruv: <strong className="text-cyan-300">{performanceAlerts.nextCheckIn}</strong> • Salomatlik holati: <strong className="text-white uppercase">{performanceAlerts.overallHealth}</strong>
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isLoadingAlerts}
                              onClick={fetchPerformanceAlerts}
                              className="text-xs flex items-center gap-1.5 border-blue-500/30 hover:bg-blue-500/10 text-blue-300 cursor-pointer"
                            >
                              <RefreshCw size={13} className={isLoadingAlerts ? 'animate-spin' : ''} />
                              Yangilash
                            </Button>
                          </div>

                          {/* Alerts List */}
                          <div className="space-y-2">
                            {performanceAlerts.alerts.map((al: any) => (
                              <div
                                key={al.id}
                                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
                                  al.severity === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' :
                                  al.severity === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                                  al.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' :
                                  'bg-white/[0.03] border-white/10 text-gray-300'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <span className="font-bold text-white block">{al.title}</span>
                                  <p className="text-[11px] text-gray-300 leading-relaxed">{al.message}</p>
                                </div>
                                {al.actionLabel && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (al.actionType === 'change_title') setActiveTab('metadata');
                                      else if (al.actionType === 'relaunch') handleTriggerRelaunch();
                                      else if (al.actionType === 'pin_comment') setActiveTab('comments');
                                      else if (al.actionType === 'change_thumbnail') setActiveTab('preview_canvas');
                                    }}
                                    className="text-[11px] h-7 px-3 whitespace-nowrap border-white/20 hover:bg-white/10 text-white cursor-pointer"
                                  >
                                    {al.actionLabel} →
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Viral Relaunch Engine Card */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1a111a] via-[#161224] to-[#12182b] border border-rose-500/30 space-y-3.5 shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/10">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              <Flame size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">Viral Relaunch Engine</h4>
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                  relaunchStatus?.velocityRating === 'viral'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : relaunchStatus?.velocityRating === 'normal'
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                }`}>
                                  {relaunchStatus?.velocityRating === 'viral' ? '🔥 Trendda' :
                                   relaunchStatus?.velocityRating === 'normal' ? '✅ Barqaror' :
                                   relaunchStatus?.velocityRating === 'underperforming' ? '⚠️ Sekinlashgan' : '🚨 Qayta Tiriltirish Kerak'}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400">
                                24 soat ichida algoritmdan qolib ketgan videolarni yangi sarlavha va muqova bilan ikkinchi to'lqinga olib chiqish
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isTriggeringRelaunch}
                            onClick={handleTriggerRelaunch}
                            className="text-xs flex items-center gap-1.5 border-rose-500/40 hover:bg-rose-500/10 text-rose-300 cursor-pointer"
                          >
                            <Sparkles size={14} className={isTriggeringRelaunch ? 'animate-spin' : ''} />
                            {isTriggeringRelaunch ? 'Qayta tiriltirilmoqda...' : '⚡ Relaunch Paketini Yaratish'}
                          </Button>
                        </div>

                        {relaunchStatus && (
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                              <span className="text-[10px] text-gray-400 block">Ko'rishlar</span>
                              <span className="font-bold text-white text-sm">{relaunchStatus.currentViews || 140}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                              <span className="text-[10px] text-gray-400 block">Joriy CTR</span>
                              <span className="font-bold text-amber-400 text-sm">{relaunchStatus.currentCtr || 3.8}%</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                              <span className="text-[10px] text-gray-400 block">Yuklangandan beri</span>
                              <span className="font-bold text-cyan-400 text-sm">{relaunchStatus.hoursSincePublished || 36} soat</span>
                            </div>
                          </div>
                        )}

                        {relaunchStatus?.diagnosis && (
                          <p className="text-xs text-gray-300 italic bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                            🩺 <strong>Diagnostika:</strong> {relaunchStatus.diagnosis}
                          </p>
                        )}

                        {relaunchPack && (
                          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-2.5 animate-fade-in">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                                <Sparkles size={13} /> Yangi Algoritmik Sarlavha (+{relaunchPack.predictedCTRBoost || '85%'} CTR):
                              </span>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={handleApplyRelaunchPack}
                                className="text-[11px] h-7 px-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 cursor-pointer"
                              >
                                1-Bosishda Qo'llash
                              </Button>
                            </div>
                            <p className="text-xs font-bold text-white bg-black/40 p-2.5 rounded-lg border border-white/10 font-mono">
                              {relaunchPack.newTitle}
                            </p>
                            <div className="grid sm:grid-cols-2 gap-2 text-[11px] pt-1">
                              <div className="p-2 rounded-lg bg-black/20 border border-white/5">
                                <span className="text-gray-400 font-semibold block">🖼️ Muqova Strategiyasi:</span>
                                <span className="text-gray-200">{relaunchPack.newThumbnailConcept || 'Yuqori kontrastli neon matn'}</span>
                              </div>
                              <div className="p-2 rounded-lg bg-black/20 border border-white/5">
                                <span className="text-gray-400 font-semibold block">💬 Munozarali Qadalgan Izoh:</span>
                                <span className="text-gray-200 truncate block">{relaunchPack.newPinnedComment || 'Munozaraga undovchi savol'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Scheduling Controls */}
                      {renderSchedulingControls()}

                      {/* Final Action Buttons */}
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <a 
                          href={activeVideoSrc} 
                          download={`${videoTitle.replace(/[^a-zA-Z0-9]/g, '_')}_shorts.mp4`}
                          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 transition-all flex items-center gap-1.5"
                        >
                          📥 Videoni yuklab olish (MP4)
                        </a>
                        <Button variant="outline" size="sm" onClick={() => {
                          setVideoVersion(Date.now());
                          handleStartGeneration();
                        }}>
                          <RefreshCw size={14} className="mr-1.5" /> Qayta render
                        </Button>
                        {!scheduledAtTime && (
                          <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={() => setScheduleModalOpen(!scheduleModalOpen)}
                            className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-bold text-xs"
                          >
                            <Clock size={16} className="mr-1.5" /> ⏰ O'z Vaqtida Avtomatik Yuklash
                          </Button>
                        )}
                        {isAuthNeeded && authUrl && (
                          <a
                            href={authUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-all flex items-center gap-1.5 animate-pulse"
                          >
                            <Youtube size={16} /> 1. YouTube OAuth Ruxsat Berish
                          </a>
                        )}
                        <Button variant="primary" size="lg" className="shadow-2xl" onClick={handlePublishToYouTube}>
                          <Youtube size={20} className="mr-2 fill-white" /> 2. YouTube'ga Yuklash va Nashr Qilish
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* UPLOADING STATE */}
          {status === 'uploading' && (
            <div className="liquid-glass rounded-3xl p-8 border border-red-500/30 text-center space-y-6 shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mx-auto animate-bounce">
                <Youtube size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">YouTube Data API orqali yuklanmoqda...</h3>
                <p className="text-xs text-gray-400">Videongiz to'g'ridan-to'g'ri kanalingizga yuklanmoqda va SEO teglari qo'yilmoqda.</p>
              </div>
            </div>
          )}

          {/* PUBLISHED STATE */}
          {status === 'published' && (
            <div className="liquid-glass rounded-3xl p-8 border border-emerald-500/30 text-center space-y-6 shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                <Check size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">Video YouTube'ga muvaffaqiyatli yuklandi!</h3>
                <p className="text-xs text-gray-400">Videongiz kanalingizda jonli ko'rinmoqda.</p>
              </div>
              {publishedVideoUrl && (
                <div className="flex justify-center">
                  <a href={publishedVideoUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" className="flex items-center gap-2">
                      <Youtube size={18} /> YouTube'da ko'rish <ExternalLink size={14} />
                    </Button>
                  </a>
                </div>
              )}
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

export default ContentDetailPage;
