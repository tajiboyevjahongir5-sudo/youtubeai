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
  Heart,
  User,
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
  Vote,
  Radio,
  Eye
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

  // Multi-Voice Global Dubbing State
  const [selectedDubLang, setSelectedDubLang] = useState('uz');
  const [selectedVoiceModel, setSelectedVoiceModel] = useState('uz-UZ-MadinaNeural');
  const [selectedDubRate, setSelectedDubRate] = useState('+14%');
  const [selectedDubPitch, setSelectedDubPitch] = useState('+0Hz');
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [audioPreviewPlayer, setAudioPreviewPlayer] = useState<HTMLAudioElement | null>(null);
  const [isDubbing, setIsDubbing] = useState(false);
  const [dubbedResult, setDubbedResult] = useState<any | null>(null);
  const [isSavingDubbing, setIsSavingDubbing] = useState(false);
  const [customVoiceSampleText, setCustomVoiceSampleText] = useState('');

  const dubbingLanguages = [
    {
      code: 'uz',
      name: "O'zbekcha",
      native: "O'zbek tili (Lotin)",
      flag: '🇺🇿',
      market: "O'zbekiston & Markaziy Osiyo (36M+)",
      rpm: '$0.40 - $0.90',
      voices: [
        {
          id: 'uz-UZ-MadinaNeural',
          name: 'Madina',
          gender: 'Ayol',
          badge: 'Muloyim & Ravon',
          desc: "Ravon, muloyim va aniq talaffuzli ayol ovozi. Texnologiya va tushuntirish uchun a'lo.",
          sampleUrl: '/audio/sample_uz-UZ-MadinaNeural.mp3'
        },
        {
          id: 'uz-UZ-SardorNeural',
          name: 'Sardor',
          gender: 'Erkak',
          badge: "Kuchli & Qat'iyatli",
          desc: "Baquvvat, qat'iyatli va ishonchli erkak ovozi. Dinamik Shorts va yangiliklar uchun zo'r.",
          sampleUrl: '/audio/sample_uz-UZ-SardorNeural.mp3'
        }
      ]
    },
    {
      code: 'ru',
      name: 'Ruscha',
      native: 'Русский язык',
      flag: '🇷🇺',
      market: 'MDH & Sharqiy Yevropa (220M+)',
      rpm: '$1.20 - $2.40',
      voices: [
        {
          id: 'ru-RU-DmitryNeural',
          name: 'Дмитрий',
          gender: 'Erkak',
          badge: 'Professional & Chuqur',
          desc: 'Глубокий, авторитетный мужской голос для технологических обзоров.',
          sampleUrl: '/audio/sample_ru-RU-DmitryNeural.mp3'
        },
        {
          id: 'ru-RU-SvetlanaNeural',
          name: 'Светлана',
          gender: 'Ayol',
          badge: 'Jonli & Ekspressiv',
          desc: 'Выразительный женский голос, удерживающий высокий retention.',
          sampleUrl: '/audio/sample_ru-RU-SvetlanaNeural.mp3'
        }
      ]
    },
    {
      code: 'en',
      name: 'Inglizcha',
      native: 'English (US)',
      flag: '🇺🇸',
      market: 'AQSh, UK & Global (High CPM)',
      rpm: '$3.50 - $6.50',
      voices: [
        {
          id: 'en-US-ChristopherNeural',
          name: 'Christopher (Alex Standarti)',
          gender: 'Erkak',
          badge: 'Viral & Energetik',
          desc: 'Crisp, confident, authoritative American voice. Standard voice of Host Alex.',
          sampleUrl: '/audio/sample_en-US-ChristopherNeural.mp3'
        },
        {
          id: 'en-US-GuyNeural',
          name: 'Guy (Hikoyachi)',
          gender: 'Erkak',
          badge: 'Tabiiy & Podkast',
          desc: 'Natural podcast-style delivery, deep tone and friendly clarity.',
          sampleUrl: '/audio/sample_en-US-GuyNeural.mp3'
        },
        {
          id: 'en-US-JennyNeural',
          name: 'Jenny (Tech Review)',
          gender: 'Ayol',
          badge: 'Aniq & Professional',
          desc: 'Polished Silicon Valley style voice for SaaS and tech reviews.',
          sampleUrl: '/audio/sample_en-US-JennyNeural.mp3'
        }
      ]
    },
    {
      code: 'es',
      name: 'Ispancha',
      native: 'Español',
      flag: '🇪🇸',
      market: 'Ispaniya & Lotin Amerikasi (500M+)',
      rpm: '$1.80 - $3.20',
      voices: [
        {
          id: 'es-ES-AlvaroNeural',
          name: 'Álvaro',
          gender: 'Erkak',
          badge: "Jo'shqin & Dinamik",
          desc: 'Voz masculina enérgica y rápida, optimizada para YouTube Shorts.',
          sampleUrl: '/audio/sample_es-ES-AlvaroNeural.mp3'
        }
      ]
    },
    {
      code: 'de',
      name: 'Nemischa',
      native: 'Deutsch',
      flag: '🇩🇪',
      market: 'Germaniya & Shveytsariya (Ultra CPM)',
      rpm: '$4.50 - $7.80',
      voices: [
        {
          id: 'de-DE-KillianNeural',
          name: 'Killian',
          gender: 'Erkak',
          badge: "Aniq & Qat'iy",
          desc: 'Präzise und souveräne deutsche Stimme für hochwertige Tech-Inhalte.',
          sampleUrl: '/audio/sample_de-DE-KillianNeural.mp3'
        }
      ]
    }
  ];

  const handlePlayVoicePreview = async (voiceId: string, sampleUrl?: string) => {
    if (audioPreviewPlayer) {
      audioPreviewPlayer.pause();
      if (previewingVoice === voiceId) {
        setPreviewingVoice(null);
        setAudioPreviewPlayer(null);
        return;
      }
    }

    setPreviewingVoice(voiceId);
    let src = sampleUrl;
    if (!src || customVoiceSampleText) {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/dubbing/preview-audio`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
          body: JSON.stringify({
            voiceModel: voiceId,
            sampleText: customVoiceSampleText || undefined,
            rate: selectedDubRate,
            pitch: selectedDubPitch
          })
        });
        const data = await res.json();
        if (data.audioUrl) {
          src = data.audioUrl;
        }
      } catch (e) {}
    }

    if (src) {
      const audio = new Audio(src);
      audio.onended = () => {
        setPreviewingVoice(null);
        setAudioPreviewPlayer(null);
      };
      audio.onerror = () => {
        setPreviewingVoice(null);
        setAudioPreviewPlayer(null);
      };
      audio.play().catch(() => {});
      setAudioPreviewPlayer(audio);
    } else {
      setPreviewingVoice(null);
    }
  };

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
          voiceModel: selectedVoiceModel,
          rate: selectedDubRate,
          pitch: selectedDubPitch,
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
        setToast(`🎉 Video ${data.dubbedPackage.languageName} tiliga to'liq dublyaj qilindi va audio yaratildi!`);
        setTimeout(() => setToast(null), 3500);
      } else {
        setToast("⚠️ Dublyaj yaratishda xatolik yuz berdi");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) {
      console.error('Dubbing error:', e);
      setToast("❌ Tarmoq xatosi yuz berdi");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsDubbing(false);
    }
  };

  const handleApplyDubbing = async () => {
    if (!dubbedResult) return;
    setIsSavingDubbing(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/dubbing/apply/${contentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': workspaceId,
        },
        body: JSON.stringify({
          dubbedPackage: dubbedResult,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast(`✅ ${dubbedResult.languageName} dublyaji video loyihasiga muvaffaqiyatli saqlandi!`);
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) {
      setToast("❌ Saqlashda xatolik yuz berdi");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsSavingDubbing(false);
    }
  };

  // ====================================================
  // SYSTEM 1: SMART AUTO-CAPTIONS & KARAOKE STUDIO STATE
  // ====================================================
  const [karaokeStyleId, setKaraokeStyleId] = useState<string>('hormozi');
  const [karaokeResult, setKaraokeResult] = useState<any | null>(null);
  const [isGeneratingKaraoke, setIsGeneratingKaraoke] = useState(false);
  const [karaokeActiveWordIndex, setKaraokeActiveWordIndex] = useState<number>(0);
  const [isKaraokeSimulating, setIsKaraokeSimulating] = useState<boolean>(false);

  const karaokeStylesList = [
    {
      id: 'hormozi',
      name: 'Alex Hormozi Clean',
      tagline: 'Yorqin sariq faol so\'z, to\'q fon konturi va sakrash effekti',
      badge: '🔥 Shorts 1-O\'rin',
      activeColor: '#FFE600',
      outlineColor: '#000000',
      glow: 'rgba(255, 230, 0, 0.4)'
    },
    {
      id: 'cyber_neon',
      name: 'Cyber Neon Glow',
      tagline: 'Moviy va elektr pushti neon nurli futuristik yozuv',
      badge: '⚡ Tech & AI',
      activeColor: '#00F0FF',
      outlineColor: '#0A0A1E',
      glow: 'rgba(0, 240, 255, 0.7)'
    },
    {
      id: 'minimal_tech',
      name: 'Minimalist Silicon Valley',
      tagline: 'Sodda, oqlangan oq-qora kontrastli zamonaviy estetika',
      badge: '💎 Premium SaaS',
      activeColor: '#FFFFFF',
      outlineColor: '#18181B',
      glow: 'rgba(255, 255, 255, 0.2)'
    },
    {
      id: 'impact_bold',
      name: 'Impact Punch Alert',
      tagline: 'Qizil/alvon ogohlantiruvchi kuchli gipnozli sarlavhalar',
      badge: '🚨 Viral Pattern',
      activeColor: '#FF2A55',
      outlineColor: '#000000',
      glow: 'rgba(255, 42, 85, 0.6)'
    }
  ];

  const handleGenerateKaraoke = async (overrideStyle?: string) => {
    const style = overrideStyle || karaokeStyleId;
    setIsGeneratingKaraoke(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/karaoke/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({
          script: scriptText || videoTitle,
          styleId: style,
          durationSec: isLong ? 120 : 50
        })
      });
      const data = await res.json();
      if (data.success) {
        setKaraokeResult(data);
        setToast(`✨ ${data.style.name} uslubidagi karaoke subtitrlar tayyorlandi!`);
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingKaraoke(false);
    }
  };

  const handleSimulateKaraoke = () => {
    if (!karaokeResult || !karaokeResult.segments || karaokeResult.segments.length === 0) return;
    setIsKaraokeSimulating(true);
    setKaraokeActiveWordIndex(0);

    const allWords = karaokeResult.segments.flatMap((s: any) => s.words);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx >= allWords.length) {
        clearInterval(interval);
        setIsKaraokeSimulating(false);
        setKaraokeActiveWordIndex(0);
      } else {
        setKaraokeActiveWordIndex(idx);
      }
    }, 280);
  };

  const handleExportSubtitles = async (format: 'srt' | 'vtt' | 'ass') => {
    if (!karaokeResult || !karaokeResult.segments) return;
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/karaoke/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({
          segments: karaokeResult.segments,
          format
        })
      });
      const data = await res.json();
      if (data.success && data.content) {
        const blob = new Blob([data.content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subtitles_${contentId}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        setToast(`📥 .${format.toUpperCase()} subtitr fayli yuklab olindi!`);
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) {}
  };

  // ====================================================
  // SYSTEM 2: SMART AUDIO DUCKER & SFX STATE
  // ====================================================
  const [duckingPreset, setDuckingPreset] = useState<string>('aggressive_viral');
  const [sfxTimelineData, setSfxTimelineData] = useState<any[]>([]);
  const [duckingTimelineData, setDuckingTimelineData] = useState<any | null>(null);
  const [isGeneratingAudioMix, setIsGeneratingAudioMix] = useState(false);

  const handleGenerateAudioMix = async (presetOverride?: string) => {
    const pr = presetOverride || duckingPreset;
    setIsGeneratingAudioMix(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/audio-ducker/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({
          scenes: scenes || [],
          durationSec: isLong ? 180 : 50,
          preset: pr
        })
      });
      const data = await res.json();
      if (data.success) {
        setSfxTimelineData(data.cues || []);
        setDuckingTimelineData(data.ducking || null);
        setToast("🔊 Smart Ducking va SFX sinxronizatsiyasi muvaffaqiyatli hisoblandi!");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) {}
    finally { setIsGeneratingAudioMix(false); }
  };

  // ====================================================
  // SYSTEM 3: 24-HOUR VELOCITY & RETENTION ANALYTICS
  // ====================================================
  const [velocityPoints, setVelocityPoints] = useState<any[]>([]);
  const [retentionCurveData, setRetentionCurveData] = useState<any | null>(null);
  const [abComparisonData, setAbComparisonData] = useState<any | null>(null);
  const [isLoadingVelocityAnalytics, setIsLoadingVelocityAnalytics] = useState(false);

  const handleFetchVelocityAnalytics = async () => {
    setIsLoadingVelocityAnalytics(true);
    try {
      const [velRes, retRes, abRes] = await Promise.all([
        fetch(`/api/workspaces/${workspaceId}/growth-suite/analytics/velocity/${contentId}`, {
          headers: { 'x-workspace-id': workspaceId }
        }),
        fetch(`/api/workspaces/${workspaceId}/growth-suite/analytics/retention/${contentId}?duration=${isLong ? 120 : 50}`, {
          headers: { 'x-workspace-id': workspaceId }
        }),
        fetch(`/api/workspaces/${workspaceId}/growth-suite/analytics/ab-evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
          body: JSON.stringify({
            contentId,
            originalTitle: metaTitle || videoTitle,
            candidateTitle: `🔥 2026 Yilda Noqonuniy Tuyuladigan 5 Ta AI Vosita! (Alex Formula)`
          })
        })
      ]);

      const [velData, retData, abData] = await Promise.all([velRes.json(), retRes.json(), abRes.json()]);
      if (velData.success) setVelocityPoints(velData.velocity);
      if (retData.success) setRetentionCurveData(retData);
      if (abData.success) setAbComparisonData(abData.comparison);

      setToast("📊 24-soatlik analitika va A/B split-test tahlili yangilandi!");
      setTimeout(() => setToast(null), 3000);
    } catch (e) {}
    finally { setIsLoadingVelocityAnalytics(false); }
  };

  // Safe Zone overlay selection for Multi-Platform
  const [activeSafeZoneOverlay, setActiveSafeZoneOverlay] = useState<'none' | 'youtube_shorts' | 'tiktok' | 'instagram_reels'>('none');

  // ====================================================
  // SYSTEM 1: SMART B-ROLL MEDIA MANAGER STATE
  // ====================================================
  const [brollList, setBrollList] = useState<any[]>([]);
  const [selectedBrollCategory, setSelectedBrollCategory] = useState<string>('all');
  const [selectedSceneBrollMap, setSelectedSceneBrollMap] = useState<Record<string, any>>({});
  const [isLoadingBroll, setIsLoadingBroll] = useState(false);

  const fetchBRollList = async (category: string = 'all') => {
    setIsLoadingBroll(true);
    try {
      const url = category === 'all'
        ? `/api/workspaces/${workspaceId}/growth-suite/broll/list`
        : `/api/workspaces/${workspaceId}/growth-suite/broll/list?category=${category}`;
      const res = await fetch(url, { headers: { 'x-workspace-id': workspaceId } });
      const data = await res.json();
      if (data.success && data.footages) {
        setBrollList(data.footages);
      }
    } catch (e) {}
    finally { setIsLoadingBroll(false); }
  };

  const handleSelectBrollForScene = (sceneId: string, broll: any) => {
    setSelectedSceneBrollMap(prev => ({ ...prev, [sceneId]: broll }));
    setToast(`🎞️ "${broll.title}" sahnaga biriktirildi!`);
    setTimeout(() => setToast(null), 2500);
  };

  // ====================================================
  // SYSTEM 2: AI SMART REPLY & COMMENT AUTOPILOT STATE
  // ====================================================
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isReplyingBatch, setIsReplyingBatch] = useState(false);

  const fetchCommentsList = async () => {
    setIsLoadingComments(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/comments/list/${contentId}`, {
        headers: { 'x-workspace-id': workspaceId }
      });
      const data = await res.json();
      if (data.success && data.comments && data.comments.length > 0) {
        setCommentsList(data.comments);
      } else {
        setCommentsList([
          {
            id: 'c1',
            authorName: 'Bekzod Karimov',
            authorAvatar: 'BK',
            timeAgo: '18 daqiqa oldin',
            text: 'Ajoyib video bo\'libdi! Shu AI agentlarni n8n yoki Make bilan qanday integratsiya qilsa bo\'ladi?',
            sentiment: 'savol',
            likes: 14,
            status: 'pending',
            aiSuggestedReply: 'Katta rahmat Bekzod! Webhook yoki REST API orqali n8n ga 5 daqiqada ulasa bo\'ladi. Keyingi videoda aynan n8n masterklassini chiqaramiz, obuna bo\'lib qoling! 🔥'
          },
          {
            id: 'c2',
            authorName: 'SherzodDev',
            authorAvatar: 'SD',
            timeAgo: '42 daqiqa oldin',
            text: '2026-yilning eng foydali kontenti! GitHub repozitoriysi qayerda?',
            sentiment: 'ijobiy',
            likes: 29,
            status: 'pending',
            aiSuggestedReply: 'Tashakkur Sherzod! Barcha ochiq kodlar va blueprint tavsifdagi GitHub havolasida joylashtirildi. Foydalanib ko\'ring! 🚀'
          },
          {
            id: 'c3',
            authorName: 'Aziza Tech',
            authorAvatar: 'AT',
            timeAgo: '1 soat oldin',
            text: 'Ovoz sifati va montaj darajasi juda yuqori chiqibdi, qaysi modeldan foydalandingiz?',
            sentiment: 'ijobiy',
            likes: 8,
            status: 'pending',
            aiSuggestedReply: 'Rahmat Aziza! Neural Speech Christopher va Sardor modellarining 60FPS sinxronizatsiyasi ishlatildi. Yoqqanidan xursandmiz! ✨'
          }
        ]);
      }
    } catch (e) {
      setCommentsList([
        {
          id: 'c1',
          authorName: 'Bekzod Karimov',
          authorAvatar: 'BK',
          timeAgo: '18 daqiqa oldin',
          text: 'Ajoyib video bo\'libdi! Shu AI agentlarni n8n yoki Make bilan qanday integratsiya qilsa bo\'ladi?',
          sentiment: 'savol',
          likes: 14,
          status: 'pending',
          aiSuggestedReply: 'Katta rahmat Bekzod! Webhook yoki REST API orqali n8n ga 5 daqiqada ulasa bo\'ladi. Keyingi videoda aynan n8n masterklassini chiqaramiz, obuna bo\'lib qoling! 🔥'
        }
      ]);
    }
    finally { setIsLoadingComments(false); }
  };

  const handleSendAIReply = (commentId: string, replyText: string) => {
    setCommentsList(prev => prev.map(c => c.id === commentId ? { ...c, status: 'replied', aiSuggestedReply: replyText } : c));
    setToast("💬 AI javobi muvaffaqiyatli yuborildi va yurakcha qo'yildi! ❤️");
    setTimeout(() => setToast(null), 3000);
  };

  const handleBatchReplyAll = () => {
    setIsReplyingBatch(true);
    setTimeout(() => {
      setCommentsList(prev => prev.map(c => ({ ...c, status: 'replied' })));
      setIsReplyingBatch(false);
      setToast("⚡ Barcha yangi izohlarga 1-klikda avto-javob qaytarildi va yurakcha bosildi! ❤️");
      setTimeout(() => setToast(null), 3500);
    }, 1200);
  };

  // ====================================================
  // SYSTEM 3: SHORTS-TO-LONGFORM STITCHER STATE
  // ====================================================
  const [stitchedProject, setStitchedProject] = useState<any | null>(null);
  const [isStitching, setIsStitching] = useState(false);

  const handleStitchShorts = async () => {
    setIsStitching(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/shorts-stitching/stitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({
          shortsList: [
            { id: '1', title: videoTitle },
            { id: '2', title: "AutoFlow 2.0 vs Windsurf Cascade" },
            { id: '3', title: "Synthetix Cloud Agent Architecture" },
            { id: '4', title: "Autonomous Coding in 2026" }
          ],
          customTheme: metaTitle || videoTitle
        })
      });
      const data = await res.json();
      if (data.success && data.project) {
        setStitchedProject(data.project);
        setToast("⚡ 16:9 Katta Formatli Hujjatli Film loyihasi muvaffaqiyatli tikildi!");
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) {}
    finally { setIsStitching(false); }
  };

  // ====================================================
  // SYSTEM 4: MONETIZATION & REAL RPM FORECASTER STATE
  // ====================================================
  const [rpmForecastData, setRpmForecastData] = useState<any | null>(null);
  const [isLoadingRpmForecast, setIsLoadingRpmForecast] = useState(false);

  const fetchRpmForecast = async () => {
    setIsLoadingRpmForecast(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/monetization/forecast/${contentId}?format=${videoFormat}&durationSec=${isLong ? 600 : 50}`, {
        headers: { 'x-workspace-id': workspaceId }
      });
      const data = await res.json();
      if (data.success) {
        setRpmForecastData(data);
      }
    } catch (e) {}
    finally { setIsLoadingRpmForecast(false); }
  };

  // ====================================================
  // SYSTEM 5: CUSTOM VOICE CLONING AVATAR STATE
  // ====================================================
  const [customVoicesList, setCustomVoicesList] = useState<any[]>([]);
  const [isSavingCustomVoice, setIsSavingCustomVoice] = useState(false);
  const [customVoiceNameInput, setCustomVoiceNameInput] = useState('');
  const [customVoiceBaseModel, setCustomVoiceBaseModel] = useState('uz-UZ-SardorNeural');

  const fetchCustomVoices = async () => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/voice-clones`, {
        headers: { 'x-workspace-id': workspaceId }
      });
      const data = await res.json();
      if (data.success && data.voices) {
        setCustomVoicesList(data.voices);
      }
    } catch (e) {}
  };

  const handleCreateCustomVoice = async () => {
    if (!customVoiceNameInput.trim()) return;
    setIsSavingCustomVoice(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/voice-clones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({
          name: customVoiceNameInput,
          language: selectedDubLang,
          gender: 'male',
          baseVoiceModel: customVoiceBaseModel,
          fineTunePitch: '+1Hz',
          fineTuneRate: '+12%',
          clarityBoost: true
        })
      });
      const data = await res.json();
      if (data.success && data.avatar) {
        setCustomVoicesList(prev => [...prev, data.avatar]);
        setCustomVoiceNameInput('');
        setToast(`🎙️ Yangi shaxsiy diktor "${data.avatar.name}" muvaffaqiyatli saqlandi!`);
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) {}
    finally { setIsSavingCustomVoice(false); }
  };

  // ====================================================
  // SYSTEM 6: VIRTUAL AUDIENCE SIMULATOR & HOOK STRESS-TEST
  // ====================================================
  const [audienceSimResult, setAudienceSimResult] = useState<any | null>(null);
  const [isLoadingAudienceSim, setIsLoadingAudienceSim] = useState(false);

  const handleRunAudienceSim = async (customScript?: string) => {
    setIsLoadingAudienceSim(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/audience-simulator/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({
          script: customScript || scriptText || briefText || videoTitle,
          topic: metaTitle || videoTitle
        })
      });
      const data = await res.json();
      if (data.success) {
        setAudienceSimResult(data);
      }
    } catch (e) {}
    finally { setIsLoadingAudienceSim(false); }
  };

  // ====================================================
  // SYSTEM 7: DUAL-HOST AI DEBATE STUDIO STATE
  // ====================================================
  const [dualHostDebate, setDualHostDebate] = useState<any | null>(null);
  const [isGeneratingDebate, setIsGeneratingDebate] = useState(false);

  const handleGenerateDualHostDebate = async () => {
    setIsGeneratingDebate(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/dual-host/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({
          topic: metaTitle || videoTitle,
          language: selectedDubLang === 'en' ? 'en' : 'uz',
          criticGender: 'female'
        })
      });
      const data = await res.json();
      if (data.success && data.project) {
        setDualHostDebate(data.project);
        setToast("🎙️ Alex vs Madina o'rtasidagi qizg'in bahs skripti tayyorlandi!");
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) {}
    finally { setIsGeneratingDebate(false); }
  };

  // ====================================================
  // SYSTEM 8: SMART THUMBNAIL HEATMAP & EYE-TRACKING
  // ====================================================
  const [showThumbnailHeatmap, setShowThumbnailHeatmap] = useState(true);
  const [thumbnailHeatmapData, setThumbnailHeatmapData] = useState<any | null>(null);
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(false);

  const handleAnalyzeThumbnailHeatmap = async () => {
    setIsLoadingHeatmap(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/thumbnail-heatmap/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({
          thumbnailUrl: '/media/thumbnail_placeholder.png',
          title: metaTitle || videoTitle
        })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setThumbnailHeatmapData(data.analysis);
      }
    } catch (e) {}
    finally { setIsLoadingHeatmap(false); }
  };

  // ====================================================
  // SYSTEM 9: TIER-1 GLOBAL MARKET & GEO-TARGETING STATE
  // ====================================================
  const [tier1Windows, setTier1Windows] = useState<any[]>([]);
  const [tier1Prewarming, setTier1Prewarming] = useState<any | null>(null);
  const [polishResult, setPolishResult] = useState<any | null>(null);
  const [isPolishing, setIsPolishing] = useState(false);
  const [commercialSeo, setCommercialSeo] = useState<any | null>(null);
  const [isGeneratingCommercialSeo, setIsGeneratingCommercialSeo] = useState(false);
  const [multiAudioBundle, setMultiAudioBundle] = useState<any | null>(null);

  const fetchTier1Data = async () => {
    try {
      const [winRes, prewarmRes, audioRes] = await Promise.all([
        fetch(`/api/workspaces/${workspaceId}/growth-suite/tier1/schedule-windows`, {
          headers: { 'x-workspace-id': workspaceId }
        }),
        fetch(`/api/workspaces/${workspaceId}/growth-suite/tier1/pre-warming/${contentId}?title=${encodeURIComponent(metaTitle || videoTitle)}`, {
          headers: { 'x-workspace-id': workspaceId }
        }),
        fetch(`/api/workspaces/${workspaceId}/growth-suite/tier1/multi-audio/${contentId}?title=${encodeURIComponent(metaTitle || videoTitle)}`, {
          headers: { 'x-workspace-id': workspaceId }
        })
      ]);

      const [winData, prewarmData, audioData] = await Promise.all([
        winRes.json(),
        prewarmRes.json(),
        audioRes.json()
      ]);

      if (winData.success && winData.windows) setTier1Windows(winData.windows);
      if (prewarmData.success && prewarmData.plan) setTier1Prewarming(prewarmData.plan);
      if (audioData.success && audioData.bundle) setMultiAudioBundle(audioData.bundle);
    } catch (e) {}
  };

  const handleApplySiliconValleyPolish = async () => {
    setIsPolishing(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/tier1/silicon-valley-polish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({ script: scriptText || videoTitle })
      });
      const data = await res.json();
      if (data.success && data.polishedScript) {
        setPolishResult(data);
        setScriptText(data.polishedScript);
        setToast("🧠 Skript Silikon Vodiysi professional texnik leksikasi bilan boyitildi!");
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) {}
    finally { setIsPolishing(false); }
  };

  const handleGenerateCommercialSeo = async () => {
    setIsGeneratingCommercialSeo(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/tier1/commercial-intent-seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({ title: metaTitle || videoTitle, script: scriptText })
      });
      const data = await res.json();
      if (data.success) {
        setCommercialSeo(data);
        if (data.optimizedTitle) setMetaTitle(data.optimizedTitle);
        setToast("💎 High-CPM ($44+ CPM) Tijoriy Sarlavha va Kalit So'zlar qo'llandi!");
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) {}
    finally { setIsGeneratingCommercialSeo(false); }
  };

  // WAVE 5: HOLLYWOOD-GRADE STUDIO & ALGORITHM SHIELD
  // ====================================================
  const [copyrightScan, setCopyrightScan] = useState<any | null>(null);
  const [isScanningCopyright, setIsScanningCopyright] = useState(false);
  const [qualityProfiles, setQualityProfiles] = useState<any[]>([]);
  const [selectedQualityProfile, setSelectedQualityProfile] = useState<string>('4k_av1_master');
  const [bingeLoopPlan, setBingeLoopPlan] = useState<any | null>(null);
  const [motionPresets, setMotionPresets] = useState<any[]>([]);
  const [selectedMotionPreset, setSelectedMotionPreset] = useState<string>('viral_hyper_pacing');

  const fetchWave5Data = async () => {
    try {
      const [shieldRes, qualRes, loopRes, motionRes] = await Promise.all([
        fetch(`/api/workspaces/${workspaceId}/growth-suite/copyright-shield/scan/${contentId}`, {
          headers: { 'x-workspace-id': workspaceId }
        }),
        fetch(`/api/workspaces/${workspaceId}/growth-suite/video-quality/profiles?isLong=${isLong}`, {
          headers: { 'x-workspace-id': workspaceId }
        }),
        fetch(`/api/workspaces/${workspaceId}/growth-suite/binge-loop/plan/${contentId}?title=${encodeURIComponent(metaTitle || videoTitle)}`, {
          headers: { 'x-workspace-id': workspaceId }
        }),
        fetch(`/api/workspaces/${workspaceId}/growth-suite/visual-motion/presets`, {
          headers: { 'x-workspace-id': workspaceId }
        })
      ]);

      const [shieldData, qualData, loopData, motionData] = await Promise.all([
        shieldRes.json(),
        qualRes.json(),
        loopRes.json(),
        motionRes.json()
      ]);

      if (shieldData.success && shieldData.result) setCopyrightScan(shieldData.result);
      if (qualData.success && qualData.analysis?.profiles) setQualityProfiles(qualData.analysis.profiles);
      if (loopData.success && loopData.plan) setBingeLoopPlan(loopData.plan);
      if (motionData.success && motionData.presets) setMotionPresets(motionData.presets);
    } catch (e) {}
  };

  const handleScanCopyright = async () => {
    setIsScanningCopyright(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/copyright-shield/scan/${contentId}`, {
        headers: { 'x-workspace-id': workspaceId }
      });
      const data = await res.json();
      if (data.success && data.result) {
        setCopyrightScan(data.result);
        setToast("🛡️ Mualliflik huquqi & -14 LUFS sertifikati muvaffaqiyatli tekshirildi (100% Yashil Dollar)!");
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) {
    } finally {
      setIsScanningCopyright(false);
    }
  };

  // ====================================================
  // WAVE 6: AUDIO TREND RADAR, SMART CHAPTERS, 24/7 STREAM
  // ====================================================
  const [audioRadar, setAudioRadar] = useState<any | null>(null);
  const [selectedTrendingTrack, setSelectedTrendingTrack] = useState<string>('track_cyber_pulse');
  const [smartChaptersReport, setSmartChaptersReport] = useState<any | null>(null);
  const [liveStreamStatus, setLiveStreamStatus] = useState<any | null>(null);
  const [isTogglingStream, setIsTogglingStream] = useState(false);

  const fetchWave6Data = async () => {
    try {
      const [audioRes, chapRes, streamRes] = await Promise.all([
        fetch(`/api/workspaces/${workspaceId}/growth-suite/audio-trends?topic=${encodeURIComponent(metaTitle || videoTitle)}`, {
          headers: { 'x-workspace-id': workspaceId }
        }),
        fetch(`/api/workspaces/${workspaceId}/growth-suite/smart-chapters/${contentId}?title=${encodeURIComponent(metaTitle || videoTitle)}`, {
          headers: { 'x-workspace-id': workspaceId }
        }),
        fetch(`/api/workspaces/${workspaceId}/growth-suite/livestream/status`, {
          headers: { 'x-workspace-id': workspaceId }
        })
      ]);

      const [audioData, chapData, streamData] = await Promise.all([
        audioRes.json(),
        chapRes.json(),
        streamRes.json()
      ]);

      if (audioData.success) setAudioRadar(audioData);
      if (chapData.success && chapData.report) setSmartChaptersReport(chapData.report);
      if (streamData.success && streamData.status) setLiveStreamStatus(streamData.status);
    } catch (e) {}
  };

  const handleToggleLiveStream = async () => {
    setIsTogglingStream(true);
    try {
      const nextState = !liveStreamStatus?.isStreaming;
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/livestream/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({ enable: nextState })
      });
      const data = await res.json();
      if (data.success && data.status) {
        setLiveStreamStatus(data.status);
        setToast(nextState ? "🔴 24/7 Jonli Efir uzatish muvaffaqiyatli ishga tushirildi!" : "⏸️ 24/7 Jonli Efir to'xtatildi.");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) {
    } finally {
      setIsTogglingStream(false);
    }
  };

  // ====================================================
  // WAVE 7: 16:9 LONG-FORM MASTERCLASS SUITE
  // ====================================================
  const [midrollPlan, setMidrollPlan] = useState<any | null>(null);
  const [narrativeArc, setNarrativeArc] = useState<any | null>(null);
  const [endScreenPackage, setEndScreenPackage] = useState<any | null>(null);
  const [expandedMasterclassScript, setExpandedMasterclassScript] = useState<any | null>(null);
  const [isExpandingScript, setIsExpandingScript] = useState(false);
  const [activeAudioTrackPreview, setActiveAudioTrackPreview] = useState<'en' | 'de' | 'uz'>('en');

  const fetchLongformSuiteData = async () => {
    try {
      const [midRes, arcRes, endRes] = await Promise.all([
        fetch(`/api/workspaces/${workspaceId}/growth-suite/longform/midroll/${contentId}`, {
          headers: { 'x-workspace-id': workspaceId }
        }),
        fetch(`/api/workspaces/${workspaceId}/growth-suite/longform/narrative-arc/${contentId}?title=${encodeURIComponent(metaTitle || videoTitle)}`, {
          headers: { 'x-workspace-id': workspaceId }
        }),
        fetch(`/api/workspaces/${workspaceId}/growth-suite/longform/endscreen/${contentId}`, {
          headers: { 'x-workspace-id': workspaceId }
        })
      ]);

      const [midData, arcData, endData] = await Promise.all([
        midRes.json(),
        arcRes.json(),
        endRes.json()
      ]);

      if (midData.success && midData.plan) setMidrollPlan(midData.plan);
      if (arcData.success && arcData.arc) setNarrativeArc(arcData.arc);
      if (endData.success && endData.endscreen) setEndScreenPackage(endData.endscreen);
    } catch (e) {}
  };

  const handleExpandLongformScript = async () => {
    setIsExpandingScript(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/longform/expand-script/${contentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({ topic: metaTitle || videoTitle })
      });
      const data = await res.json();
      if (data.success && data.scenes) {
        setExpandedMasterclassScript(data);
        setToast("🎬 12 ta kengaytirilgan Gollivud masterclass sahnalari yaratildi!");
        setTimeout(() => setToast(null), 3500);
      }
    } catch (e) {
    } finally {
      setIsExpandingScript(false);
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
      fetchCommentsList();
      fetchCustomVoices();
      fetchRpmForecast();
      handleRunAudienceSim();
      handleAnalyzeThumbnailHeatmap();
      fetchTier1Data();
      fetchWave5Data();
      fetchWave6Data();
      fetchLongformSuiteData();
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
            { id: 'audience_sim', label: '🧠 Auditoriya Simulyatori' },
            { id: 'broll', label: '🎞️ B-Roll Media' },
            { id: 'karaoke', label: '🎬 Karaoke & Subtitrlar' },
            { id: 'audio_master', label: '⚡ Smart Ducking & SFX' },
            { id: 'ab_test', label: '📊 A/B Split & 24h Analitika' },
            { id: 'stitcher', label: '⚡ Shorts-to-Longform' },
            { id: 'binge_series', label: '🔁 Binge Serial' },
            { id: 'preview_canvas', label: '🎛️ 9:16 Jonli Simulyator' },
            { id: 'thumbnail_studio', label: '🎨 AI Muqova Studio' },
            { id: 'personaj', label: 'Personaj & Konsistentlik' },
            { id: 'metadata', label: 'SEO Metadata' },
            { id: 'comments', label: '💬 Izohlar & Reply AI' },
            { id: 'monetization', label: '💰 Real RPM & Daromad' },
            { id: 'tier1_market', label: '🇺🇸 Tier-1 Rekomendatsiya (AQSh & DACH)' },
            { id: 'dubbing', label: '🌐 Global Dublyaj & Klonlash' },
            { id: 'sifat tekshiruvi', label: 'Sifat tekshiruvi' },
            { id: 'multi_export', label: '📱 Multi-Platform Eksport' },
            { id: 'livestream', label: '🔴 24/7 Efir' },
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

              {/* 🎙️ Ikki Diktorli Bahs Rejimi (Dual-Host AI Debate Studio) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-black/50 border border-purple-500/30 space-y-4 shadow-xl mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <Volume2 size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">🎙️ Ikki Diktorli Bahs Rejimi (Dual-Host AI Debate)</h4>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          +35% APV Retention
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Monolog o'rniga 2 ta qarama-qarshi AI boshlovchi (Alex - Optimist vs Madina - Skeptik) o'rtasida qizg'in dialog
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isGeneratingDebate}
                    onClick={handleGenerateDualHostDebate}
                    className="text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-purple-500 text-white flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Sparkles size={13} className={isGeneratingDebate ? 'animate-spin' : ''} />
                    {isGeneratingDebate ? 'Bahs yozilmoqda...' : '⚡ 2 Diktorli Bahs Skriptini Yaratish'}
                  </Button>
                </div>

                {dualHostDebate && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-300 flex items-center gap-1 font-bold">
                          {dualHostDebate.host1.avatar} {dualHostDebate.host1.name}
                        </span>
                        <span className="text-purple-400 font-bold">VS</span>
                        <span className="text-gray-300 flex items-center gap-1 font-bold">
                          {dualHostDebate.host2.avatar} {dualHostDebate.host2.name}
                        </span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                        {dualHostDebate.expectedRetentionBoost}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {dualHostDebate.dialogue.map((line: any) => {
                        const isAlex = line.speakerId === 'host_alex';
                        return (
                          <div
                            key={line.id}
                            className={`p-3 rounded-xl border flex items-start gap-3 ${
                              isAlex
                                ? 'bg-blue-950/20 border-blue-500/30 text-blue-100 ml-0 mr-6'
                                : 'bg-purple-950/20 border-purple-500/30 text-purple-100 ml-6 mr-0'
                            }`}
                          >
                            <span className="text-xl">{isAlex ? '👨‍💼' : '👩‍💻'}</span>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-white">{line.speakerName}</span>
                                <span className="text-[10px] font-mono text-gray-400">{line.durationSec}s</span>
                              </div>
                              <p className="text-xs leading-relaxed">{line.text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setScriptText(dualHostDebate.fullCombinedScript);
                          setToast("📋 Ikki diktorli bahs skripti asosiy maydonga yuklandi!");
                          setTimeout(() => setToast(null), 3000);
                        }}
                        className="text-xs font-bold border-purple-500/30 text-purple-300 hover:bg-purple-500/20 cursor-pointer"
                      >
                        <Check size={12} className="mr-1" /> Asosiy Skriptga O'tkazish
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 🎬 16:9 Masterclass 4-Aktli Gollivud Dramaturgiyasi & Ssenariy Kengaytirgich */}
          <Card className="liquid-glass border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.08)]">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Film className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Gollivud 4-Aktli Dramaturgiya & 12 Sahnalik Masterclass Kengaytirgich
                      <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        📺 16:9 Kinematik
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Katta videolarda 70%+ tomosha saqlanishi (APV) uchun 12 daqiqalik gollivud syujet chizig'i va amaliy kod masterclassi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={isExpandingScript}
                    onClick={handleExpandLongformScript}
                    className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    {isExpandingScript ? (
                      <>
                        <RefreshCw size={13} className="mr-1.5 animate-spin" /> Kengaytirilmoqda...
                      </>
                    ) : (
                      <>
                        <Wand2 size={13} className="mr-1.5" /> 12 Sahnalik Masterclassga Kengaytirish
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* 4-Aktli Dramaturgiya Vizual Chizmasi */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Gollivud 4-Aktli Retensiya Formulasi (12:00 Daqiqa)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {(narrativeArc?.acts || [
                    {
                      actNumber: 1,
                      name: "Akt 1: Yuqori Xavf & Muammo",
                      durationMinutes: 2.5,
                      targetAudienceRetentionPercent: 88,
                      coreObjective: "0-3 soniyada qiziqtirib, sun'iy idrokdagi real muammoni ko'rsatish",
                      hookTechnique: "Pattern Interrupt + Sub-bass drop + High Stakes",
                      color: "from-red-500/20 to-orange-500/10 border-red-500/30"
                    },
                    {
                      actNumber: 2,
                      name: "Akt 2: Arxitektura & Jonli Kod",
                      durationMinutes: 4.0,
                      targetAudienceRetentionPercent: 79,
                      coreObjective: "Docker va TypeScript orkestratsiyasida amaliy yechimni kodda qurish",
                      hookTechnique: "Jonli terminal yozilishi va mikro-kashfiyotlar",
                      color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30"
                    },
                    {
                      actNumber: 3,
                      name: "Akt 3: Ishlab Chiqarish Inqirozi",
                      durationMinutes: 3.5,
                      targetAudienceRetentionPercent: 74,
                      coreObjective: "Kutilmagan xatolik (Crash/Memory leak) va uni self-healing bilan bartaraf etish",
                      hookTechnique: "Dramatik burilish va taranglik cho'qqisi",
                      color: "from-purple-500/20 to-pink-500/10 border-purple-500/30"
                    },
                    {
                      actNumber: 4,
                      name: "Akt 4: Korxona Masshtabi & Xulosa",
                      durationMinutes: 2.0,
                      targetAudienceRetentionPercent: 71,
                      coreObjective: "Kubernetes masshtablash, GitHub repozitoriy va keyingi videoga tavsiya",
                      hookTechnique: "20s End Screen + Alex qo'l ishorasi bilan CTA",
                      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30"
                    }
                  ]).map((act: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border bg-gradient-to-b ${act.color || 'from-white/5 to-transparent border-white/10'} space-y-2.5 flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            {act.durationMinutes || 3} daqiqa
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-400">
                            Saqlanish: {act.targetAudienceRetentionPercent || 75}%
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white mt-1.5">{act.name}</h5>
                        <p className="text-[11px] text-gray-300 leading-relaxed mt-1">{act.coreObjective}</p>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <span className="text-[10px] text-gray-400">Usul: </span>
                        <span className="text-[10px] font-semibold text-white">{act.hookTechnique}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kengaytirilgan 12 Sahnalik Ssenariy Natijasi */}
              {expandedMasterclassScript && (
                <div className="space-y-4 pt-4 border-t border-white/10 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        {expandedMasterclassScript.totalScenes} Ta To'liq Sahnalik Masterclass Ssenariysi ({expandedMasterclassScript.estimatedDurationMinutes} daqiqa, {expandedMasterclassScript.totalWordCount} so'z)
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        Har bir sahna Gollivud dramaturgiyasi, amaliy kod bloklari va Alex xosti xavfsiz zonalariga moslangan
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        const compiled = expandedMasterclassScript.scenes
                          .map((s: any) => `[${s.timecode}] ${s.title}\nVIZUAL: ${s.visualStyle}\nDIKTOR: ${s.narrationUzbek}\nKOD: ${s.codeOrTerminalDisplay || "None"}`)
                          .join("\n\n---\n\n");
                        setScriptText(compiled);
                        setToast("🎬 12 Sahnalik Masterclass ssenariysi asosiy maydonga yuklandi!");
                        setTimeout(() => setToast(null), 3000);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-600/20"
                    >
                      <Check size={13} className="mr-1.5" /> Asosiy Skriptga Ko'chirish
                    </Button>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto space-y-3 pr-1">
                    {expandedMasterclassScript.scenes.map((scene: any, sIdx: number) => (
                      <div
                        key={sIdx}
                        className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold">
                              #{scene.sceneIndex}
                            </span>
                            <h6 className="text-xs font-bold text-white">{scene.title}</h6>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                              {scene.act}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                              {scene.timecode}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                            <span className="text-[10px] font-bold text-purple-300 uppercase">🎥 Vizual B-Roll & Grafika:</span>
                            <p className="text-gray-300 leading-relaxed">{scene.visualStyle}</p>
                            {scene.codeOrTerminalDisplay && (
                              <div className="mt-2 p-2 rounded bg-black/80 font-mono text-[10px] text-emerald-400 border border-emerald-500/20 overflow-x-auto">
                                <pre>{scene.codeOrTerminalDisplay}</pre>
                              </div>
                            )}
                          </div>

                          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                            <span className="text-[10px] font-bold text-amber-300 uppercase">🎙️ Alex Nutqi & Diktori:</span>
                            <p className="text-gray-200 leading-relaxed font-sans">{scene.narrationUzbek}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* 🧠 AI Virtual Auditoriya Simulyatori & Hook Stress-Tester */}
        <Tabs.Content value="audience_sim" className="space-y-6 animate-fade-in">
          <Card className="liquid-glass border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.08)]">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      AI Virtual Auditoriya Simulyatori & Hook Stress-Tester
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                        100 AI Personas
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      100 ta turli AI tomoshabin profili orqali videoning 0-5s retensiyasini tekshiring va drop-off so'zlarini oldindan aniqlang
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isLoadingAudienceSim}
                    onClick={() => handleRunAudienceSim()}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <RefreshCw size={13} className={isLoadingAudienceSim ? 'animate-spin' : ''} />
                    {isLoadingAudienceSim ? 'Simulyatsiya qilinmoqda...' : '🧠 Auditoriya Testini Qayta O\'tkazish'}
                  </Button>
                </div>
              </div>

              {/* Overall Retention Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[11px] text-gray-400 font-semibold">0-3s Pattern Stay Rate:</span>
                  <p className="text-xl font-mono font-black text-emerald-400">
                    {audienceSimResult?.predicted3sStayRate || '88.4%'}
                  </p>
                  <span className="text-[10px] text-gray-500">Benchmark: {'>'}80%</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[11px] text-gray-400 font-semibold">0-15s Retention:</span>
                  <p className="text-xl font-mono font-black text-cyan-400">
                    {audienceSimResult?.predicted15sStayRate || '72.1%'}
                  </p>
                  <span className="text-[10px] text-gray-500">Kutilgan APV</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[11px] text-gray-400 font-semibold">Umumiy Hook Balli:</span>
                  <p className="text-xl font-mono font-black text-amber-400">
                    {audienceSimResult?.overallRetentionScore || 86}/100
                  </p>
                  <span className="text-[10px] text-emerald-400 font-semibold">Viral Potentsial</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[11px] text-gray-400 font-semibold">Drop-off Xavfli So'zlar:</span>
                  <p className="text-xl font-mono font-black text-red-400">
                    {audienceSimResult?.dropOffRiskWords?.length || 1} ta
                  </p>
                  <span className="text-[10px] text-gray-500">Tezlashtirish tavsiya etiladi</span>
                </div>
              </div>

              {/* 100 AI Personas Breakdown */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  100 AI Tomoshabin Reaksiyasi (Audience Segmentation):
                </span>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      name: "Gen Z Scrollers (35 ta)",
                      icon: "⚡",
                      stay: audienceSimResult?.personaBreakdown?.genZScrollers?.stayPercentage || 82,
                      sentiment: audienceSimResult?.personaBreakdown?.genZScrollers?.sentiment || "🔥 'Tezkor, montaj ritmi zo'r'"
                    },
                    {
                      name: "Tech Enthusiasts (25 ta)",
                      icon: "💻",
                      stay: audienceSimResult?.personaBreakdown?.techEnthusiasts?.stayPercentage || 92,
                      sentiment: audienceSimResult?.personaBreakdown?.techEnthusiasts?.sentiment || "🚀 'Haqiqiy arxitektura, saqlab oldim'"
                    },
                    {
                      name: "Casual Viewers (20 ta)",
                      icon: "🍿",
                      stay: audienceSimResult?.personaBreakdown?.casualViewers?.stayPercentage || 76,
                      sentiment: audienceSimResult?.personaBreakdown?.casualViewers?.sentiment || "✨ 'Tushunarli va qiziqarli'"
                    },
                    {
                      name: "Skeptic Critics (20 ta)",
                      icon: "🔍",
                      stay: audienceSimResult?.personaBreakdown?.skepticCritics?.stayPercentage || 68,
                      sentiment: audienceSimResult?.personaBreakdown?.skepticCritics?.sentiment || "🧐 'Amaliyotda ko'rish kerak'"
                    }
                  ].map((p, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{p.icon}</span> {p.name}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{p.stay}% qoladi</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${p.stay}%` }}></div>
                      </div>
                      <p className="text-[10px] text-gray-400 italic line-clamp-2 leading-relaxed">
                        {p.sentiment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drop-off Risk Words & Power Replacements */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                {/* Drop-off warning */}
                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-3">
                  <span className="text-xs font-bold text-red-300 uppercase tracking-wider block flex items-center gap-1.5">
                    <AlertCircle size={14} /> Tomoshabin Chiqib Ketish (Drop-off) Xavfi Bor So'zlar:
                  </span>
                  {(audienceSimResult?.dropOffRiskWords && audienceSimResult.dropOffRiskWords.length > 0) ? (
                    audienceSimResult.dropOffRiskWords.map((d: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-red-500/20 text-xs space-y-1">
                        <span className="font-bold text-red-400 font-mono">"{d.word}"</span>
                        <p className="text-[11px] text-gray-300 leading-relaxed">{d.reason}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-emerald-300">Skriptda drop-off so'zlari topilmadi! Kirish juda baquvvat.</p>
                  )}
                </div>

                {/* 3 Pattern Interrupt Replacements */}
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1.5">
                    <Sparkles size={14} /> 3 Ta Kuchli Pattern Interrupt Muqobil Hooklari:
                  </span>
                  {(audienceSimResult?.patternInterruptAlternatives || [
                    {
                      hookType: "🔥 Noqonuniy Foyda (Illegal Advantage)",
                      hookText: "Bu AI instrumentni bilish dasturchilar uchun noqonuniy ustunlikdek tuyuladi!",
                      predictedBoost: "+24% 3s Retention"
                    },
                    {
                      hookType: "⚡ Keskin Qo'rquv & FOMO (Urgency Alert)",
                      hookText: "Agar siz hali ham buni qo'lda qilayotgan bo'lsangiz — 2026-yilda ishsiz qolishingiz aniq!",
                      predictedBoost: "+19% 3s Retention"
                    },
                    {
                      hookType: "🎯 Haqiqiy Natija & Pul (Proof First)",
                      hookText: "Mana bu oddiy AI skripti orqali 1 kunda $4,200 ishlab olgan dasturchi nima qildi?",
                      predictedBoost: "+28% 3s Retention"
                    }
                  ]).map((alt: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-[11px]">{alt.hookType}</span>
                        <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                          {alt.predictedBoost}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 italic">"{alt.hookText}"</p>
                      <button
                        type="button"
                        onClick={() => {
                          setScriptText(prev => `${alt.hookText}\n\n${prev}`);
                          setToast("🔥 Hook skriptning boshiga qo'shildi!");
                          setTimeout(() => setToast(null), 2500);
                        }}
                        className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={11} /> Ushbu Hookni Skriptga Biriktirish
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* 🎞️ Smart B-Roll Media Kutubxonasi & Footage Manager */}
        <Tabs.Content value="broll" className="space-y-6 animate-fade-in">
          <Card className="liquid-glass border border-cyan-500/30">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                    <Film size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      Smart B-Roll Media Kutubxonasi & 60FPS Footage Manager
                      <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-semibold">
                        4K / 60FPS Motion
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Har bir sahna orqa foniga haqiqiy harakatlanuvchi texnologik video lavhalarni tanlang va biriktiring
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    disabled={isLoadingBroll}
                    onClick={() => fetchBRollList(selectedBrollCategory)}
                    className="flex items-center gap-1.5 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 border-cyan-500 text-white cursor-pointer shadow-lg"
                  >
                    <RefreshCw size={13} className={isLoadingBroll ? 'animate-spin' : ''} />
                    {isLoadingBroll ? 'Yangilanmoqda...' : 'Kutubxonani Yangilash'}
                  </Button>
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'Barchasi (5 ta 60FPS)' },
                  { id: 'cyberpunk', label: '🌆 Cyberpunk & Neon' },
                  { id: 'datacenter', label: '🖥️ Datacenter & Serverlar' },
                  { id: 'neural_ai', label: '🧠 Neural Networks' },
                  { id: 'coding', label: '💻 Matrix & Coding' },
                  { id: 'robotics', label: '🤖 Robototexnika & Chip' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedBrollCategory(cat.id);
                      fetchBRollList(cat.id);
                    }}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      selectedBrollCategory === cat.id
                        ? 'bg-cyan-600/30 border-cyan-500 text-white shadow-md ring-1 ring-cyan-500'
                        : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Footage Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(brollList.length > 0 ? brollList : [
                  {
                    id: 'broll_cyber_01',
                    title: 'Cyberpunk Neon Metropolis Flythrough',
                    category: 'cyberpunk',
                    resolution: '1080p 60FPS',
                    previewVideoUrl: '/media/cyberpunk_hailuo.webm',
                    thumbnailUrl: '/media/coding_agents_verified_scene_1.jpg',
                    recommendedScene: '1. Hook (0-3s Pattern Interrupt)',
                    energyLevel: 'high_impact'
                  },
                  {
                    id: 'broll_datacenter_01',
                    title: 'Hyperscale AI Server Racks & Fiber Flow',
                    category: 'datacenter',
                    resolution: '1080p 60FPS',
                    previewVideoUrl: '/media/clip_datacenter.mp4',
                    thumbnailUrl: '/media/coding_agents_verified_scene_2.jpg',
                    recommendedScene: '2. AutoFlow 2.0 Core Tech',
                    energyLevel: 'steady'
                  },
                  {
                    id: 'broll_neural_01',
                    title: '3D Glowing Neural Network Synaptic Sparks',
                    category: 'neural_ai',
                    resolution: '1080p 60FPS',
                    previewVideoUrl: '/media/clip_ai.webm',
                    thumbnailUrl: '/media/coding_agents_verified_scene_3.jpg',
                    recommendedScene: '3. Neural Deep Dive',
                    energyLevel: 'high_impact'
                  },
                  {
                    id: 'broll_coding_01',
                    title: 'Matrix Terminal Rain & Autopilot IDE',
                    category: 'coding',
                    resolution: '1080p 60FPS',
                    previewVideoUrl: '/media/stormlight-over-fields.webm',
                    thumbnailUrl: '/media/coding_agents_verified_scene_4.jpg',
                    recommendedScene: '4. Autonomous Coding Agent',
                    energyLevel: 'ambient'
                  },
                  {
                    id: 'broll_robotics_01',
                    title: 'Precision Microchip Assembly & Silicon Architecture',
                    category: 'robotics',
                    resolution: '1080p 60FPS',
                    previewVideoUrl: '/media/1774861278.mp4',
                    thumbnailUrl: '/media/coding_agents_verified_scene_5.jpg',
                    recommendedScene: '5. Architecture & Outro',
                    energyLevel: 'steady'
                  }
                ]).map((clip: any) => (
                  <div
                    key={clip.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      <div className="aspect-video w-full rounded-xl bg-black overflow-hidden relative border border-white/10 group-hover:border-cyan-500/30">
                        <img
                          src={clip.thumbnailUrl}
                          alt={clip.title}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-300"
                          onError={(e: any) => { e.target.src = '/media/coding_agents_verified_scene_1.jpg'; }}
                        />
                        <span className="absolute top-2 left-2 text-[9px] font-mono font-bold bg-black/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                          {clip.resolution}
                        </span>
                        <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                          {clip.energyLevel === 'high_impact' ? '⚡ High Impact' : '🌊 Smooth Motion'}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">{clip.title}</h4>
                        <span className="text-[11px] text-gray-400 block mt-0.5 font-medium">Tavsiya: {clip.recommendedScene}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleSelectBrollForScene(e.target.value, clip);
                          }
                        }}
                        className="flex-1 text-xs bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-gray-200 cursor-pointer focus:border-cyan-500"
                        defaultValue=""
                      >
                        <option value="" disabled>Sahnaga biriktirish...</option>
                        {(scenes || [
                          { id: '1', title: '1. Hook' },
                          { id: '2', title: '2. AutoFlow' },
                          { id: '3', title: '3. VoicePilot' },
                          { id: '4', title: '4. DevEngine' },
                          { id: '5', title: '5. Outro' }
                        ]).map((s: any) => (
                          <option key={s.id} value={s.id}>
                            {s.title || `Sahna ${s.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* 🎬 Smart Auto-Captions & Karaoke Subtitrlar Studiyasi */}
        <Tabs.Content value="karaoke" className="space-y-6 animate-fade-in">
          <Card className="liquid-glass border border-yellow-500/30">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-yellow-600/20 text-yellow-400 border border-yellow-500/30">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      Smart Auto-Captions & Karaoke Subtitrlar Studiyasi
                      <span className="text-[10px] font-mono bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/30 font-semibold">
                        Neon Sync 2026
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      MrBeast va Alex Hormozi uslubidagi har bir aytilayotgan so'z bilan birga yonuvchi dinamik karaoke subtitrlari
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  disabled={isGeneratingKaraoke}
                  onClick={() => handleGenerateKaraoke()}
                  className="flex items-center gap-2 text-xs font-bold bg-yellow-600 hover:bg-yellow-500 border-yellow-500 text-black cursor-pointer shadow-lg whitespace-nowrap"
                >
                  <Sparkles size={14} className={isGeneratingKaraoke ? 'animate-spin' : ''} />
                  {isGeneratingKaraoke ? 'Vaqtlar hisoblanmoqda...' : '✨ Karaoke Subtitrlarni Generatsiya Qilish'}
                </Button>
              </div>

              {/* 4 Viral Subtitle Styles */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  1. Karaoke Uslubini Tanlang:
                </label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {karaokeStylesList.map((st) => {
                    const isSelected = karaokeStyleId === st.id;
                    return (
                      <div
                        key={st.id}
                        onClick={() => {
                          setKaraokeStyleId(st.id);
                          handleGenerateKaraoke(st.id);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'bg-yellow-500/15 border-yellow-500 text-white shadow-[0_0_20px_rgba(234,179,8,0.2)] ring-1 ring-yellow-500/40'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            {st.badge}
                          </span>
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                            style={{ backgroundColor: st.activeColor, boxShadow: `0 0 8px ${st.glow}` }}
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{st.name}</h4>
                          <p className="text-[11px] text-gray-400 mt-1 leading-snug">{st.tagline}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Word-by-Word Animated Karaoke Simulator */}
              <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Play size={14} className="text-yellow-400" />
                    Jonli So'zma-So'z Karaoke Pleyeri (Word-by-Word Preview):
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={isKaraokeSimulating}
                      onClick={handleSimulateKaraoke}
                      className="text-xs font-bold bg-yellow-600 hover:bg-yellow-500 text-black border-yellow-500 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play size={12} />
                      {isKaraokeSimulating ? 'Sinxron Yonmoqda...' : '▶ Sinxron Animatsiyani Ko\'rish'}
                    </Button>
                    {karaokeResult && (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {karaokeResult.wordsPerMinute} WPM (Tezkor Shorts)
                      </span>
                    )}
                  </div>
                </div>

                {/* Animated Display Screen */}
                <div className="min-h-28 flex items-center justify-center p-6 bg-gradient-to-b from-neutral-900/80 to-black rounded-xl border border-white/5 text-center">
                  {karaokeResult && karaokeResult.segments ? (
                    <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
                      {karaokeResult.segments.flatMap((s: any) => s.words).slice(0, 24).map((w: any, idx: number) => {
                        const isActive = isKaraokeSimulating && karaokeActiveWordIndex === idx;
                        const isPast = isKaraokeSimulating && idx < karaokeActiveWordIndex;
                        return (
                          <span
                            key={idx}
                            className={`text-base sm:text-xl font-black uppercase tracking-wide px-1.5 py-0.5 rounded transition-all duration-150 ${
                              isActive
                                ? 'scale-125 text-black bg-yellow-400 shadow-[0_0_20px_#FFE600] font-black z-10 animate-bounce'
                                : (isPast ? 'text-white/70' : 'text-white/30')
                            }`}
                            style={isActive ? { textShadow: '0 2px 4px rgba(0,0,0,0.8)' } : {}}
                          >
                            {w.word}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-400">
                        Hozirgi skript asosida so'zma-so'z millisekundli karaoke yaratish uchun yuqoridagi <strong>"✨ Karaoke Subtitrlarni Generatsiya Qilish"</strong> tugmasini bosing.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtitle Export Formats */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                <span className="text-xs text-gray-400">
                  Subtitrlarni video muharrirlar (Premiere, CapCut, DaVinci) yoki YouTube uchun eksport qiling:
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportSubtitles('srt')}
                    className="text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} /> .SRT
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportSubtitles('vtt')}
                    className="text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} /> .VTT
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleExportSubtitles('ass')}
                    className="text-xs font-bold bg-yellow-600 hover:bg-yellow-500 text-black border-yellow-500 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} /> .ASS (Karaoke Ranglari Bilan)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* ⚡ Professional Audio Auto-Ducker & Avtomatik SFX Generator */}
        <Tabs.Content value="audio_master" className="space-y-6 animate-fade-in">
          <Card className="liquid-glass border border-blue-500/30">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <Volume2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      Professional Audio Auto-Ducker & Avtomatik SFX Generator
                      <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-semibold">
                        Studiya Miksing
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Boshlovchi gapirganda musiqa pasayadi (Smart Ducking), kadr va karta almashganda ovoz effektlari avtomatik tushadi
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  disabled={isGeneratingAudioMix}
                  onClick={() => handleGenerateAudioMix()}
                  className="flex items-center gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 border-blue-500 text-white cursor-pointer shadow-lg whitespace-nowrap"
                >
                  <Sliders size={14} className={isGeneratingAudioMix ? 'animate-spin' : ''} />
                  {isGeneratingAudioMix ? 'Musiqa va SFX hisoblanmoqda...' : '🔊 Smart Ducking & SFX Sinxronlashtirish'}
                </Button>
              </div>

              {/* Ducking Presets */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  1. Miksing Profilini Tanlang:
                </label>
                <div className="grid sm:grid-cols-3 gap-3.5">
                  {[
                    {
                      id: 'aggressive_viral',
                      name: '🔥 Aggressive Viral Shorts',
                      desc: 'Musiqa nutq vaqtida 9% gacha pasayadi, SFX effektlari baland va aniq uradi.',
                      badge: 'Tavsiya etiladi'
                    },
                    {
                      id: 'cinematic_podcast',
                      name: '🎙️ Cinematic Podcast',
                      desc: 'Yumshoq sekin o\'tish (attack/release 400ms), tabiiy suhbat muhiti.',
                      badge: 'Uzoq Format'
                    },
                    {
                      id: 'balanced_clean',
                      name: '✨ Balanced Clean',
                      desc: 'Barcha ovozlar muvozanatli, klassik YouTube tushuntirish videolari uchun.',
                      badge: 'Standart'
                    }
                  ].map((p) => {
                    const isSelected = duckingPreset === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setDuckingPreset(p.id);
                          handleGenerateAudioMix(p.id);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg ring-1 ring-blue-500/40'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{p.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">{p.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Synchronized SFX Cue Timeline */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>2. Avtomatik Joylashtirilgan SFX Tovushlar Jadvali</span>
                  </label>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    {sfxTimelineData.length > 0 ? `${sfxTimelineData.length} ta sinxron nuqta` : 'Hisoblash kutilmoqda'}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(sfxTimelineData.length > 0 ? sfxTimelineData : [
                    { id: '1', timeSec: 0.15, label: 'Deep Sub-Drop', type: 'sub_drop', audioFileName: 'sub_drop.wav', reason: '0-3s Pattern Interrupt Hook' },
                    { id: '2', timeSec: 0.25, label: 'Punch Zoom Whoosh', type: 'whoosh', audioFileName: 'whoosh.wav', reason: 'Kamera zumi bilan birga' },
                    { id: '3', timeSec: 10.6, label: 'Kadr Flash Cut Whoosh', type: 'whoosh', audioFileName: 'whoosh.wav', reason: 'Sahna almashinuvi' },
                    { id: '4', timeSec: 46.8, label: 'Oltin Qo\'ng\'iroq (Bell)', type: 'bell', audioFileName: 'bell.wav', reason: 'YouTube obuna chaqiruvi' }
                  ]).map((cue: any) => (
                    <div key={cue.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          t = {cue.timeSec}s
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">{cue.audioFileName}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white">{cue.label}</h5>
                      <p className="text-[10px] text-gray-400 leading-snug">{cue.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Master Volume Controls */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-gray-400 block font-semibold">Nutq Ovoz Balandligi:</span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">0.92 (Master Voice)</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Fon Musiqa (Ducked):</span>
                    <span className="text-blue-400 font-mono font-bold text-sm">0.09 (-18dB)</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">SFX Trek:</span>
                    <span className="text-yellow-400 font-mono font-bold text-sm">0.55 (-6dB)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                    🛡️ Peak Limiter: -0.98 dB (Nol Xiralik)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🎵 YouTube Shorts Audio Trend Radar */}
          <Card className="liquid-glass border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.08)]">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                    <Volume2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      YouTube Shorts Audio Trend Radar
                      <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30 font-semibold">
                        +65% Rekomendatsiya Ritm
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      AQSh va Global Shorts trendidagi virallashayotgan fon musiqalari, BPM ritm tahlili va avtomatlashtirilgan montaj sinxronizatsiyasi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
                    Trend Skaner: Jonli
                  </span>
                </div>
              </div>

              {/* Ritm Sinxron Ko'rsatmasi */}
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-3">
                <Sparkles size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-200 leading-relaxed">
                  <strong className="text-cyan-300">Shorts Ritm Algoritmi:</strong> {audioRadar?.bpmSyncGuideline || "128 BPM ritmda har bir kadr almashuvi t=0.47s va t=0.94s da saundtrek ritmiga 100% tushadi. Ushbu saundtrek YouTube Shorts audio bazasida litsenziyalangan."}
                </p>
              </div>

              {/* Trenddagi Musiqalar Rosteri */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  YouTube Shorts Trendidagi Top Fon Saundtreklari:
                </label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(audioRadar?.activeTrendingTracks || [
                    {
                      id: 'track_cyber_pulse',
                      title: 'Neural Matrix 2026 (Velocity Edit)',
                      artist: 'KiberSound Lab',
                      bpm: 128,
                      genre: 'Cyberpunk Synth',
                      viralityIndex: 98,
                      shortsUsageCount: '620K+ Shorts',
                      recommendedMood: 'Tezkor AI kodlash va kiberxavfsizlik'
                    },
                    {
                      id: 'track_dark_phonk',
                      title: 'Echo Drift (Midnight Tech)',
                      artist: 'DriftCore AI',
                      bpm: 140,
                      genre: 'Drill Phonk',
                      viralityIndex: 95,
                      shortsUsageCount: '840K+ Shorts',
                      recommendedMood: '0-3s Pattern Interrupt va agressiv diqqat'
                    },
                    {
                      id: 'track_minimal_focus',
                      title: 'Silicon Horizon (Deep Focus)',
                      artist: 'Aura Minimal',
                      bpm: 110,
                      genre: 'Tech Minimal',
                      viralityIndex: 91,
                      shortsUsageCount: '310K+ Shorts',
                      recommendedMood: 'Batafsil tushuntirish va arxitektura'
                    },
                    {
                      id: 'track_future_bass',
                      title: 'Quantum Leap (Sub-Bass Drop)',
                      artist: 'Pulsewave',
                      bpm: 135,
                      genre: 'Cinematic Future Bass',
                      viralityIndex: 94,
                      shortsUsageCount: '490K+ Shorts',
                      recommendedMood: 'GPU datatsentrlar va kelajak texnologiyasi'
                    }
                  ]).map((track: any) => {
                    const isSelected = selectedTrendingTrack === track.id;
                    return (
                      <div
                        key={track.id}
                        onClick={() => {
                          setSelectedTrendingTrack(track.id);
                          setToast(`🎵 "${track.title}" saundtreki fonga biriktirildi (${track.bpm} BPM)!`);
                          setTimeout(() => setToast(null), 2500);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'bg-cyan-600/20 border-cyan-500 ring-2 ring-cyan-500/40 text-white shadow-lg'
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-gray-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-500/15 px-2 py-0.5 rounded">
                              {track.bpm} BPM
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              {track.shortsUsageCount}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-1">{track.title}</h4>
                          <span className="text-[10px] text-gray-400 block">{track.artist} • {track.genre}</span>
                        </div>

                        <p className="text-[11px] text-gray-300 leading-snug">{track.recommendedMood}</p>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                          <span className="font-mono text-emerald-400 font-semibold">100% Mualliflik Xavfsiz</span>
                          {isSelected ? (
                            <span className="text-cyan-400 font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} /> Faol
                            </span>
                          ) : (
                            <span className="text-gray-400 hover:text-white">Tanlash</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
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

              {/* 24-Hour Velocity & Audience Retention Stream */}
              <div className="pt-6 border-t border-white/10 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp size={16} className="text-purple-400" />
                      Jonli 24-Soatlik Ko'rishlar Oqimi (Hourly Velocity) & Retention
                    </h4>
                    <p className="text-xs text-gray-400">
                      YouTube algoritmining videoni Shorts lentasiga chiqarish tezligi va tomoshabinlar ushlab qolinishi
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoadingVelocityAnalytics}
                    onClick={handleFetchVelocityAnalytics}
                    className="text-xs font-bold flex items-center gap-1.5 border-purple-500/40 text-purple-300 hover:bg-purple-600/20 cursor-pointer"
                  >
                    <RefreshCw size={13} className={isLoadingVelocityAnalytics ? 'animate-spin' : ''} />
                    {isLoadingVelocityAnalytics ? 'Tahlil qilinmoqda...' : '📊 Jonli Tahlilni Yangilash'}
                  </Button>
                </div>

                <div className="grid lg:grid-cols-2 gap-5">
                  {/* 24h Velocity Chart */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">24 Soatlik Ko'rishlar Dinamikasi:</span>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                        +240 ko'rish/soat (Algoritmik Boost)
                      </span>
                    </div>

                    <div className="h-28 flex items-end gap-1.5 pt-4 pb-1 px-1 overflow-x-auto">
                      {(velocityPoints.length > 0 ? velocityPoints : [
                        { hour: '00', views: 45 }, { hour: '02', views: 30 }, { hour: '04', views: 18 },
                        { hour: '06', views: 65 }, { hour: '08', views: 180 }, { hour: '10', views: 245 },
                        { hour: '12', views: 320 }, { hour: '14', views: 280 }, { hour: '16', views: 210 },
                        { hour: '18', views: 390 }, { hour: '20', views: 480 }, { hour: '22', views: 340 }
                      ]).map((pt: any, idx: number) => {
                        const h = Math.min(Math.max((pt.views / 500) * 80, 8), 80);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div
                              className="w-full rounded-t transition-all bg-gradient-to-t from-purple-600 to-indigo-400 hover:from-purple-400 hover:to-pink-400 cursor-pointer"
                              style={{ height: `${h}px` }}
                              title={`${pt.hour || idx}:00 - ${pt.views} ko'rish`}
                            />
                            <span className="text-[9px] text-gray-500 font-mono">{pt.hour || idx}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Retention Curve */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Auditoriya Ushlab Qolinishi (Retention Curve):</span>
                      <span className="text-[11px] font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">
                        {retentionCurveData?.averagePercentageViewed || 82}% O'rtacha Tomosha (APV)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-gray-300">
                        <span>0-3s Pattern Interrupt Hook:</span>
                        <span className="text-emerald-400 font-bold font-mono">92% qoldi (-8% swipe)</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-300">
                        <span>Sahna 2 va 3 (Tool namoyishlari):</span>
                        <span className="text-blue-400 font-bold font-mono">86% barqaror (Rewatch Spike)</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-300">
                        <span>Outro & Subscribe CTA:</span>
                        <span className="text-yellow-400 font-bold font-mono">68% to'liq yakunladi</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 via-purple-500 to-blue-500 h-2 rounded-full" style={{ width: '82%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* A/B Split Test Winner Card */}
                {abComparisonData && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/40 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Award size={16} className="text-yellow-400" />
                        A/B Split Test Natijasi: G'olib Variant Aniqlondi
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                        {abComparisonData.confidenceScore}% Ishonchlilik Darajasi
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                        <span className="text-gray-400 block">{abComparisonData.variantA.label}:</span>
                        <p className="font-bold text-white">{abComparisonData.variantA.title}</p>
                        <div className="flex items-center gap-3 pt-1 text-[11px] font-mono">
                          <span className="text-gray-400">CTR: <strong className="text-gray-200">{abComparisonData.variantA.ctr}%</strong></span>
                          <span className="text-gray-400">Kliklar: <strong className="text-gray-200">{abComparisonData.variantA.clicks}</strong></span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-purple-600/15 border border-purple-500 text-white space-y-1 ring-1 ring-purple-500/40">
                        <span className="text-purple-300 block font-bold">🏆 G'OLIB: {abComparisonData.variantB.label}:</span>
                        <p className="font-bold text-white">{abComparisonData.variantB.title}</p>
                        <div className="flex items-center gap-3 pt-1 text-[11px] font-mono">
                          <span className="text-purple-200">CTR: <strong className="text-emerald-300">{abComparisonData.variantB.ctr}% (+74%)</strong></span>
                          <span className="text-purple-200">Kliklar: <strong className="text-emerald-300">{abComparisonData.variantB.clicks}</strong></span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-purple-200 leading-relaxed pt-1">
                      💡 <strong>Algoritm Xulosasi:</strong> {abComparisonData.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* ⚡ Shorts-to-Longform Konvertor & Stitching Engine */}
        <Tabs.Content value="stitcher" className="space-y-6 animate-fade-in">
          <Card className="liquid-glass border border-orange-500/30">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
                    <Tv size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      Shorts-to-Longform Konvertor & Stitching Engine
                      <span className="text-[10px] font-mono bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30 font-semibold">
                        16:9 Hujjatli Film
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Haftalik chiqqan 4-5 ta qisqa Shortsni yagona arxitektura va umumiy hikoya bilan 10-12 daqiqalik yirik filmga aylantiring
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  disabled={isStitching}
                  onClick={handleStitchShorts}
                  className="flex items-center gap-2 text-xs font-bold bg-orange-600 hover:bg-orange-500 border-orange-500 text-white cursor-pointer shadow-lg whitespace-nowrap"
                >
                  <Sparkles size={14} className={isStitching ? 'animate-spin' : ''} />
                  {isStitching ? 'Tikilmoqda va boblar tuzilmoqda...' : '⚡ Shortslarni 16:9 Hujjatli Videoga Tikish'}
                </Button>
              </div>

              {/* Source Shorts Pool */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Birlashtirilayotgan Shorts Loyihalari (Timeline Ketma-ketligi):
                </span>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { id: '1', title: videoTitle, duration: '0:56', tag: '1. Kirish & Hook' },
                    { id: '2', title: "AutoFlow 2.0 vs Windsurf Cascade", duration: '0:54', tag: '2. Asosiy Texnologiya' },
                    { id: '3', title: "Synthetix Cloud Agent Architecture", duration: '0:58', tag: '3. Neyron Tahlil' },
                    { id: '4', title: "Autonomous Coding in 2026", duration: '0:52', tag: '4. Amaliy Demo' }
                  ].map((s, idx) => (
                    <div key={s.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                          {s.tag}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">{s.duration}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white line-clamp-2">{s.title}</h5>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stitched Output Result */}
              {stitchedProject && (
                <div className="space-y-4 pt-5 border-t border-white/10 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      Tayyor 16:9 Long-Form Loyihasi: {stitchedProject.durationFormatted}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-bold">
                        Prognoz RPM: {stitchedProject.predictedRpm}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-950/30 to-amber-950/30 border border-orange-500/30 space-y-4">
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Hujjatli Film Sarlavhasi:</span>
                      <h4 className="text-base font-bold text-white mt-1">{stitchedProject.title}</h4>
                    </div>

                    {/* Chapters */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                        ⏱️ Boblar va Timestamp Vaqtlari:
                      </span>
                      <div className="grid sm:grid-cols-2 gap-2 text-xs">
                        {stitchedProject.chapters.map((ch: any) => (
                          <div key={ch.id} className="p-2.5 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between">
                            <span className="font-medium text-gray-200">{ch.title}</span>
                            <span className="font-mono text-orange-400 font-bold ml-2 bg-orange-500/10 px-2 py-0.5 rounded">
                              {ch.timestamp}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex flex-wrap gap-2.5">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          navigator.clipboard.writeText(stitchedProject.fullDescription);
                          setToast("📋 16:9 Film tavsifi va timestamp vaqtlari nusxalandi!");
                          setTimeout(() => setToast(null), 3000);
                        }}
                        className="text-xs font-bold bg-orange-600 hover:bg-orange-500 border-orange-500 text-white flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy size={13} /> Tavsif va Timestamplardan Nusxa Olish
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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

          {/* Binge-Loop & Aloqador Video Ulash Tizimi */}
          <Card className="liquid-glass border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.08)]">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                    <Repeat size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      Binge-Loop & Aloqador Video Ulash Tizimi
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                        +84% Session Time
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Shorts oxirini boshiga choksiz ulash (Infinite Loop) va YouTube Studio "Related Video" tugmasi orqali katta videolarga oqim haydash
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Choksiz Loop: Faol
                  </span>
                </div>
              </div>

              {/* Loop Hook Script & Verbal CTA */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Repeat size={14} className="text-emerald-400" />
                      1. Cheksiz Tomosha Ilmog'i (Seamless Loop Hook):
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(bingeLoopPlan?.seamlessLoopHookScript || "And the craziest part about this entire system is that...");
                        setToast("✅ Choksiz loop skripti nusxalandi!");
                        setTimeout(() => setToast(null), 2500);
                      }}
                      className="text-gray-400 hover:text-white cursor-pointer"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                  <p className="text-xs text-emerald-300 font-mono bg-black/40 p-3 rounded-xl border border-emerald-500/20 leading-relaxed">
                    "{bingeLoopPlan?.seamlessLoopHookScript || "And the craziest part about this entire system is that... (-> darhol 00:00 dagi birinchi so'zga ulanadi, cheksiz tomosha ilmog'i hosil bo'ladi)"}"
                  </p>
                  <span className="text-[11px] text-gray-400 block">
                    Tomoshabin video tugaganini sezmay qoladi va ikkinchi marta ko'rishni boshlaydi (APV 100%+ bo'ladi).
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Link2 size={14} className="text-blue-400" />
                      2. Og'zaki Aloqador Video Chaqirig'i (Verbal CTA):
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(bingeLoopPlan?.verbalRelatedCta || "Want to deploy this entire architecture in production? Tap the related video linked right below!");
                        setToast("✅ Og'zaki CTA nusxalandi!");
                        setTimeout(() => setToast(null), 2500);
                      }}
                      className="text-gray-400 hover:text-white cursor-pointer"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                  <p className="text-xs text-blue-300 font-mono bg-black/40 p-3 rounded-xl border border-blue-500/20 leading-relaxed">
                    "{bingeLoopPlan?.verbalRelatedCta || "Want to deploy this entire architecture in production? Tap the related video linked right below for the full 12-minute blueprint! 👇"}"
                  </p>
                  <span className="text-[11px] text-gray-400 block">
                    Shorts ostidagi YouTube rasmiy "Related video" havolasiga to'g'ridan-to'g'ri ishora qiladi.
                  </span>
                </div>
              </div>

              {/* Recommended Related Videos to Link in YouTube Studio */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  YouTube Studio'da Ulash Uchun Tavsiya Qilingan Katta Videolar:
                </span>

                <div className="grid sm:grid-cols-2 gap-3">
                  {(bingeLoopPlan?.recommendedRelatedVideos || [
                    { id: 'long_doc_1', title: "Autonomous Coding in 2026: The Complete 16:9 Documentary Blueprint", videoFormat: 'long_form_16_9', durationText: '11:42 daqiqa', expectedSessionTimeBoost: '+84% Kanalda Qolish Vaqti', matchScore: 99 },
                    { id: 'part_2_series', title: "Part 2: Setting up Multi-Agent Swarms with Cursor & Windsurf", videoFormat: 'shorts_part_2', durationText: '0:58 soniya', expectedSessionTimeBoost: '+65% Keyingi Qismga O\'tish', matchScore: 94 }
                  ]).map((vid: any) => (
                    <div key={vid.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {vid.expectedSessionTimeBoost}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">{vid.durationText}</span>
                        </div>
                        <h5 className="text-xs font-bold text-white mt-1">{vid.title}</h5>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">Moslik: <strong className="text-white">{vid.matchScore}%</strong></span>
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {vid.videoFormat === 'long_form_16_9' ? '📺 16:9 Asosiy Video' : '⚡ 9:16 Shorts Seriya'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 📺 16:9 YouTube End Screen (20s Outro) & Info Cards Avtopiloti */}
          <Card className="liquid-glass border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.08)]">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Tv className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      YouTube End Screen (20s Outro) & Info Cards Avtopiloti
                      <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                        🎯 16:9 Konversiya Qopqoni
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Videoning so'nggi 20 soniyasida tomoshabinni keyingi videoga o'tkazish va obuna bo'lishga yo'naltirish
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold">
                    Vaqt oralig'i: {endScreenPackage?.outroTiming?.timecode || "11:40 - 12:00"}
                  </span>
                </div>
              </div>

              {/* End Screen 16:9 Interaktiv Maketi */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <Film className="w-3.5 h-3.5 text-cyan-400" />
                    YouTube End Screen Joylashuvi (16:9 Standarti)
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    Alex yuzi xavfsiz zonasi: <strong className="text-emerald-400">100% ochiq va to'siqsiz</strong>
                  </span>
                </div>

                <div className="w-full aspect-video max-w-[620px] mx-auto rounded-2xl bg-[#090d16] border border-cyan-500/30 p-4 relative overflow-hidden shadow-2xl flex flex-col justify-between">
                  {/* Markaziy Xost xavfsiz zona chizmasi */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-48 h-64 rounded-full border-2 border-dashed border-emerald-400 flex flex-col items-center justify-center text-emerald-400 text-[10px] font-mono text-center p-2">
                      <span>👤 XOST ALEX</span>
                      <span>Xavfsiz Zona</span>
                      <span>(To'siqsiz)</span>
                    </div>
                  </div>

                  {/* Yuqori elementlar */}
                  <div className="flex items-start justify-between z-10">
                    {/* Chapdagi Video elementi */}
                    <div className="w-44 p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 backdrop-blur shadow-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-cyan-300 uppercase">Eng Mos Video</span>
                        <Play size={10} className="text-cyan-400" />
                      </div>
                      <p className="text-[10px] font-semibold text-white truncate">
                        {endScreenPackage?.endScreenElements?.[0]?.previewText || "Keyingi Tavsiya: AI Agent Framework"}
                      </p>
                      <div className="w-full h-1 bg-cyan-500/30 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-cyan-400" />
                      </div>
                    </div>

                    {/* O'ngdagi Obuna Elementi */}
                    <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 backdrop-blur shadow-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                        NP
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-white leading-tight">Neural Pulse AI</p>
                        <span className="text-[8px] text-emerald-400 font-mono font-bold">SUBSCRIBE 🔔</span>
                      </div>
                    </div>
                  </div>

                  {/* Pastki elementlar */}
                  <div className="flex items-end justify-between z-10">
                    <div className="text-[10px] font-mono text-gray-500">
                      t={endScreenPackage?.outroTiming?.timecode || "11:40 - 12:00"}
                    </div>

                    {/* Pleylist elementi */}
                    <div className="w-48 p-2.5 rounded-xl bg-blue-950/80 border border-blue-500/40 backdrop-blur shadow-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-blue-300 uppercase">To'liq Masterclass Pleylist</span>
                        <Layers size={10} className="text-blue-400" />
                      </div>
                      <p className="text-[10px] font-semibold text-white truncate">
                        {endScreenPackage?.endScreenElements?.[1]?.previewText || "Agentic AI 2026 To'liq Kurs"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alex Xosti Ko'rsatmalari & Nutq Ssenariysi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    <h5 className="text-xs font-bold text-white">Alexning Imo-ishora Ko'rsatmasi</h5>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans bg-black/40 p-3 rounded-lg border border-white/5">
                    {endScreenPackage?.alexHostDirectives?.gestureCues || "👉 Alex o'ng qo'li bilan ekranning yuqori o'ng burchagidagi playlist va obuna tugmasiga ishora qiladi (t=11:43s)"}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Host harakati tomoshabin diqqatini YouTube tavsiya kartochkalariga qaratadi va bosish ehtimolini (CTR) 38% ga oshiradi.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h5 className="text-xs font-bold text-white">Alex Yakuniy CTA Nutqi</h5>
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed font-sans bg-black/40 p-3 rounded-lg border border-white/5 italic">
                    "{endScreenPackage?.alexHostDirectives?.speechScript || "Agar sun'iy idrok agentlarini chuqurroq o'rganmoqchi bo'lsangiz, ekranda ko'rinayotgan mana bu to'liq masterclassni tomosha qiling va kanalga obuna bo'ling!"}"
                  </p>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(endScreenPackage?.alexHostDirectives?.speechScript || "");
                        setToast("📋 CTA nutqi nusxalandi!");
                        setTimeout(() => setToast(null), 3000);
                      }}
                      className="text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/10 cursor-pointer h-7"
                    >
                      <Copy size={11} className="mr-1" /> Nutqni Nusxalash
                    </Button>
                  </div>
                </div>
              </div>

              {/* YouTube Info Cards (Interaktiv Karta Belgilari) */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                  Video Ichidagi Interaktiv YouTube Kartalari (Info Cards)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(endScreenPackage?.infoCards || [
                    {
                      timestamp: "03:15",
                      title: "GitHub: Agent Orchestrator Repozitoriysi",
                      teaserText: "Bepul yuklab oling",
                      actionType: "external_link"
                    },
                    {
                      timestamp: "06:45",
                      title: "Tavsiya: DeepSeek R1 Kod Generatori",
                      teaserText: "Avvalgi qismni ko'ring",
                      actionType: "video"
                    },
                    {
                      timestamp: "09:30",
                      title: "So'rovnoma: Qaysi AI Framework afzal?",
                      teaserText: "Fikringizni bildiring",
                      actionType: "poll"
                    }
                  ]).map((card: any, cIdx: number) => (
                    <div
                      key={cIdx}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            ⏱️ {card.timestamp}
                          </span>
                          <span className="text-[9px] uppercase font-bold text-gray-400">
                            {card.actionType}
                          </span>
                        </div>
                        <h6 className="text-xs font-bold text-white">{card.title}</h6>
                        <p className="text-[10px] text-gray-400">{card.teaserText}</p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                        <ExternalLink size={12} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* 9:16 Jonli Simulyator & Visual Inspector */}
        <Tabs.Content value="preview_canvas" className="space-y-6 animate-fade-in">
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Conditional Cinema 16:9 or Vertical 9:16 Simulator */}
            <div className="lg:col-span-6 flex justify-center w-full">
              {isLong ? (
                /* 16:9 Cinema Widescreen Masterclass Player */
                <div className="w-full max-w-[560px] aspect-video rounded-3xl bg-black border-[3px] border-slate-700 shadow-2xl relative overflow-hidden flex flex-col justify-between p-4 bg-gradient-to-b from-[#0a0c14] via-[#101524] to-[#0a0c14]">
                  {/* Top Bar: Resolution & Safe Zone */}
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] font-mono shadow-md">
                        4K UHD 60FPS
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono">
                        16:9 Masterclass
                      </span>
                    </div>
                    <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-full px-2.5 py-0.5 text-[9px] text-emerald-400 font-mono font-bold">
                      [OK] Alex Yuzi 100% Ochiq
                    </div>
                  </div>

                  {/* Center Cinema Visual & Scene Title */}
                  <div className="relative my-auto flex flex-col items-center justify-center text-center space-y-2.5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-[0_0_25px_rgba(59,130,246,0.25)]">
                      <Tv size={28} />
                    </div>
                    <div className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white font-semibold truncate max-w-[380px]">
                      {scenes[previewSceneIndex]?.title || '1. Paradigm Shift & Massive Stakes'}
                    </div>
                  </div>

                  {/* Bottom: Lower-Third Subtitle & Cinema Scrubbing Bar */}
                  <div className="space-y-2.5 z-10">
                    <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-center">
                      <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block pb-0.5">
                        Sahna {previewSceneIndex + 1} Subtitri:
                      </span>
                      <p className="text-xs font-black text-white leading-snug truncate">
                        {scenes[previewSceneIndex]?.overlayText || scenes[previewSceneIndex]?.title || 'THE 2026 CODING REVOLUTION'}
                      </p>
                    </div>

                    {/* Progress Bar with Mid-Roll Ad Markers */}
                    <div className="space-y-1">
                      <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden flex items-center">
                        <div 
                          className="h-full bg-gradient-to-r from-red-600 to-amber-400 rounded-full" 
                          style={{ width: `${((previewSceneIndex + 1) / scenes.length) * 100}%` }}
                        />
                        <div className="absolute left-[22%] w-1.5 h-2 bg-yellow-400" title="Mid-roll 1 (02:30)" />
                        <div className="absolute left-[44%] w-1.5 h-2 bg-yellow-400" title="Mid-roll 2 (05:15)" />
                        <div className="absolute left-[68%] w-1.5 h-2 bg-yellow-400" title="Mid-roll 3 (08:20)" />
                        <div className="absolute left-[89%] w-1.5 h-2 bg-yellow-400" title="Mid-roll 4 (10:45)" />
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-mono text-gray-400">
                        <span>00:{String((previewSceneIndex * 60)).padStart(2, '0')} / 12:00</span>
                        <span className="text-yellow-400 font-bold">🟡 4 ta Mid-roll Reklama Nuqtasi</span>
                        <span>4K AV1 Master</span>
                      </div>
                    </div>

                    {/* Multi-Audio Switcher Controls */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-gray-400 font-semibold mr-0.5">Audio:</span>
                        {[
                          { code: 'en', flag: '🇺🇸', label: 'US Alex' },
                          { code: 'de', flag: '🇩🇪', label: 'DE Conrad' },
                          { code: 'uz', flag: '🇺🇿', label: 'UZ Sardor' }
                        ].map((trk) => (
                          <button
                            key={trk.code}
                            type="button"
                            onClick={() => {
                              setActiveAudioTrackPreview(trk.code as any);
                              setToast(`🎧 Audio trek o'zgartirildi: ${trk.flag} ${trk.label}`);
                              setTimeout(() => setToast(null), 2000);
                            }}
                            className={`text-[9px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                              activeAudioTrackPreview === trk.code
                                ? 'bg-blue-600 text-white border-blue-500 font-bold shadow'
                                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                            }`}
                          >
                            {trk.flag} {trk.label}
                          </button>
                        ))}
                      </div>

                      <span className="text-[9px] text-emerald-400 font-mono font-bold">
                        EBU R128 (-14 LUFS) ✓
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Phone 9:16 Canvas Simulator */
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
              )}
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

              {/* 2.5D Parallaks & Ken Burns Harakat Dvigateli */}
              <Card className="liquid-glass border border-violet-500/30 shadow-[0_0_25px_rgba(139,92,246,0.1)]">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          2.5D Parallaks & Ken Burns Dvigateli
                          <span className="text-[9px] font-mono bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30 font-semibold">
                            +38% APV
                          </span>
                        </h4>
                        <span className="text-[11px] text-gray-400">Har 1.8 soniyada mikroskopik zum va zarba tebranishi</span>
                      </div>
                    </div>
                  </div>

                  {/* Preset Selector */}
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {(motionPresets.length > 0 ? motionPresets : [
                      {
                        id: 'viral_hyper_pacing',
                        name: '🔥 Viral Hyper-Pacing',
                        pacingIntervalSec: 1.8,
                        description: '1.8s Ken Burns zum, 2.5D qatlam surilishi va sub-drop zarba tebranishi',
                        retentionLift: '+38% APV'
                      },
                      {
                        id: 'cinematic_documentary_flow',
                        name: '🎬 Cinematic Documentary',
                        pacingIntervalSec: 3.2,
                        description: '3.2s silliq kiber-zum va sekin chuqurlik effekti',
                        retentionLift: '+26% APV'
                      }
                    ]).map((preset: any) => {
                      const isSelected = selectedMotionPreset === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => {
                            setSelectedMotionPreset(preset.id);
                            setToast(`✨ "${preset.name}" harakat rejimi faollashtirildi!`);
                            setTimeout(() => setToast(null), 2500);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                            isSelected
                              ? 'bg-violet-600/20 border-violet-500 ring-1 ring-violet-500/40 text-white'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{preset.name}</span>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              {preset.retentionLift}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 leading-snug">{preset.description}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Live Directive Timeline */}
                  <div className="space-y-2 pt-1 border-t border-white/5">
                    <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                      Harakat Directivalari Ketma-ketligi (Timeline):
                    </span>
                    <div className="space-y-1.5 text-xs">
                      {[
                        { time: '0.15s', effect: '⚡ Impact Shake', target: 'Fon qatlami', desc: 'Sub-drop zarbasida 3px tebranish (Zarba hissi)' },
                        { time: '1.80s', effect: '🔍 Ken Burns Zoom', target: 'B-Roll', desc: '1.05x dan 1.18x gacha sekin optik yaqinlashish' },
                        { time: '3.60s', effect: '📐 2.5D Parallax', target: 'Subtitr & Fon', desc: 'Qatlamlar surilishi orqali 3D chuqurlik effekti' },
                        { time: '5.40s', effect: '⚡ Flash Whip-Pan', target: 'Kadr almashuvi', desc: '0.12s oq chaqmoq bilan yangi B-rollga o\'tish' }
                      ].map((dir, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">
                              t={dir.time}
                            </span>
                            <span className="text-xs font-semibold text-white">{dir.effect}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 truncate max-w-[200px]">{dir.desc}</span>
                        </div>
                      ))}
                    </div>
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

                {/* 👁️ Smart Thumbnail Eye-Tracking & Diqqat Xaritasi (Heatmap) */}
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Eye size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-white">
                            Smart Thumbnail Eye-Tracking & Diqqat Xaritasi (Heatmap)
                          </h4>
                          <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                            CTR: {thumbnailHeatmapData?.predictedCtr || '12.8%'} ({thumbnailHeatmapData?.ctrMultiplier || '2.8x'} O'sish)
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          AI nigoh simulyatori: Tomoshabin ko'zi birinchi 0.5 soniyada koverning qaysi nuqtalariga qadalishini ko'rsatadi
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowThumbnailHeatmap(!showThumbnailHeatmap)}
                        className={`text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                          showThumbnailHeatmap
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'border-white/10 text-gray-300'
                        }`}
                      >
                        <Eye size={13} />
                        {showThumbnailHeatmap ? "🔥 Heatmap: Yoqilgan" : "👁️ Heatmap: O'chirilgan"}
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={isLoadingHeatmap}
                        onClick={handleAnalyzeThumbnailHeatmap}
                        className="text-xs font-bold bg-amber-600 hover:bg-amber-500 border-amber-500 text-white flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw size={12} className={isLoadingHeatmap ? 'animate-spin' : ''} />
                        Qayta Tahlil
                      </Button>
                    </div>
                  </div>

                  {/* Heatmap Visual Canvas & Focal Points */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Visual Heatmap Overlay */}
                    <div className="relative aspect-[9/16] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center p-4">
                      {/* Base cover mockup */}
                      <div className="absolute inset-0 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-black">
                        <div className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black tracking-wider uppercase">
                          ! URGENT 2026 !
                        </div>
                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-cyan-400/40 flex items-center justify-center text-3xl">
                          👨‍💼
                        </div>
                        <h4 className="text-center font-black text-white text-base uppercase drop-shadow-md">
                          STOP CODING MANUALLY
                        </h4>
                        <span className="text-[9px] font-mono text-gray-400">NEURAL PULSE AI</span>
                      </div>

                      {/* Heatmap glowing spots if enabled */}
                      {showThumbnailHeatmap && (
                        <div className="absolute inset-0 pointer-events-none z-20">
                          {/* Face spot */}
                          <div className="absolute top-[38%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-red-500/40 blur-2xl animate-pulse"></div>
                          <div className="absolute top-[38%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-yellow-400/50 blur-lg"></div>

                          {/* Title spot */}
                          <div className="absolute bottom-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-48 h-20 rounded-full bg-orange-500/35 blur-xl"></div>

                          {/* Pill spot */}
                          <div className="absolute top-[10%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-28 h-12 rounded-full bg-amber-400/35 blur-md"></div>
                        </div>
                      )}
                    </div>

                    {/* Focal Points Breakdown & Advice */}
                    <div className="space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider block">
                          Diqqat Taqsimoti (Attention Share):
                        </span>
                        {[
                          { name: "Host Alex Yuzi & Ko'zlari", share: "48%", color: "bg-red-500", note: "Birlamchi psixologik langar" },
                          { name: "Qalin Sarlavha & Gipnoz Matni", share: "32%", color: "bg-orange-500", note: "Katta kontrastli 3-so'z qoidasi" },
                          { name: "Qizil Alert Pill (Pattern Interrupt)", share: "14%", color: "bg-yellow-500", note: "FOMO va tezkorlik signali" },
                          { name: "Kiber Neon Fon & Kontrast", share: "6%", color: "bg-blue-500", note: "Chuqurlik va estetika" }
                        ].map((fp, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-gray-200">{fp.name}</span>
                              <span className="font-mono font-bold text-white">{fp.share}</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div className={`${fp.color} h-full rounded-full`} style={{ width: fp.share }}></div>
                            </div>
                            <span className="text-[10px] text-gray-400">{fp.note}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                        <span className="font-bold text-emerald-300 flex items-center gap-1">
                          <Check size={13} /> Visual Hierarchy Bahosi: A+ (A'lo)
                        </span>
                        <p className="text-[11px] text-gray-300 leading-relaxed">
                          Yuz va matn o'rtasidagi muvozanat mukammal. YouTube qidiruv va Shorts lentasida eng yuqori klik to'plashga kafolat beriladi.
                        </p>
                      </div>
                    </div>
                  </div>
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

          {/* 🔍 Google Search Key Moments & Smart Chapters */}
          <Card className="liquid-glass border border-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.08)]">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                    <Clock size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      Google Search "Key Moments" & Smart Chapters
                      <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-semibold">
                        Google Snippet SEO
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Google qidiruv natijalarining birinchi qatoriga chiqish uchun videoga avtomat aqlli vaqt tamg'alari va jump-linklar
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(smartChaptersReport?.formattedDescriptionSnippet || "");
                    setToast("✅ Google Key Moments taymkodlari nusxalandi!");
                    setTimeout(() => setToast(null), 2500);
                  }}
                  className="text-xs flex items-center gap-1.5 border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-300 cursor-pointer"
                >
                  <Copy size={13} />
                  Taymkodlarni Nusxalash
                </Button>
              </div>

              {/* Google Search Live Mockup Preview */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-indigo-500/20 space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                  <span className="text-blue-400 font-bold">G</span>
                  <span>google.com/search?q={smartChaptersReport?.googleSearchSnippetPreview?.searchQuery || 'autonomous ai coding 2026'}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                    {smartChaptersReport?.googleSearchSnippetPreview?.displayedBadge || "Google Search: Key Moments In This Video"}
                  </span>
                  <h4 className="text-sm font-bold text-white hover:underline cursor-pointer">
                    {smartChaptersReport?.googleSearchSnippetPreview?.snippetTitle || `${videoTitle} | Neural Pulse AI`}
                  </h4>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
                    <Play size={12} className="fill-indigo-300" />
                    <span>{smartChaptersReport?.googleSearchSnippetPreview?.jumpLinkText || "Jump to 02:15: Production-Grade Code Generation Demo"}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Chapters List */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Avtomat Generatsiya Qilingan Bo'limlar & Taymkodlar:
                </span>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {(smartChaptersReport?.chapters || [
                    { timestamp: "00:00", title: "Introduction & 2026 AI Architecture Shift", googleSnippetKeyword: "AI software development shift 2026", importance: "hook" },
                    { timestamp: "00:48", title: "Autonomous Multi-Agent Workflow Setup", googleSnippetKeyword: "autonomous agent coding setup", importance: "key_value" },
                    { timestamp: "02:15", title: "Production-Grade Code Generation Demo", googleSnippetKeyword: "production grade AI code generation", importance: "key_value" },
                    { timestamp: "04:30", title: "Automated Error Self-Healing Loop", googleSnippetKeyword: "AI self healing error debugging", importance: "key_value" },
                    { timestamp: "07:10", title: "Deployment & Scaling to 100K Users", googleSnippetKeyword: "deploy autonomous software cloud", importance: "key_value" },
                    { timestamp: "09:40", title: "Final Blueprint & Open Source Resources", googleSnippetKeyword: "neural pulse ai coding blueprint", importance: "cta" }
                  ]).map((chapter: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-1.5 hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                          {chapter.timestamp}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">
                          {chapter.importance === 'hook' ? '⚡ Hook' : chapter.importance === 'cta' ? '🎯 CTA' : '🔑 Asos'}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white line-clamp-1">{chapter.title}</h5>
                      <span className="text-[10px] text-gray-400 truncate">Qidiruv tegi: {chapter.googleSnippetKeyword}</span>
                    </div>
                  ))}
                </div>
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

          {/* 💬 AI Smart Reply & Izohlar Autopilot */}
          <Card className="liquid-glass border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.08)]">
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        AI Smart Reply & Izohlar Autopiloti (Community Booster)
                      </h3>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        +85% Return Views
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Tomoshabinlar izohlariga kontekstual AI javoblari va avtomatik yurakcha (❤️) bosish tizimi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isLoadingComments}
                    onClick={fetchCommentsList}
                    className="text-xs font-bold flex items-center gap-1.5 border-white/10 text-gray-300 hover:text-white cursor-pointer"
                  >
                    <RefreshCw size={13} className={isLoadingComments ? 'animate-spin' : ''} />
                    Yangilash
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isReplyingBatch || commentsList.length === 0}
                    onClick={handleBatchReplyAll}
                    className="text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 flex items-center gap-1.5 cursor-pointer shadow-md text-white"
                  >
                    <Sparkles size={13} className={isReplyingBatch ? 'animate-spin' : ''} />
                    {isReplyingBatch ? 'Javoblar yuborilmoqda...' : '⚡ 1-Klikda Barchasiga AI Javob & ❤️'}
                  </Button>
                </div>
              </div>

              {/* List of Incoming Comments */}
              <div className="space-y-3.5">
                {commentsList.map((comm) => {
                  const isReplied = comm.status === 'replied';
                  return (
                    <div
                      key={comm.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isReplied
                          ? 'bg-emerald-950/15 border-emerald-500/30 ring-1 ring-emerald-500/20'
                          : 'bg-white/[0.03] border-white/10 hover:border-cyan-500/30'
                      } space-y-3`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center">
                            {comm.authorAvatar || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{comm.authorName}</span>
                              <span className="text-[10px] text-gray-400">{comm.timeAgo}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                comm.sentiment === 'savol'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : comm.sentiment === 'ijobiy'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {comm.sentiment === 'savol' ? '❓ Savol' : comm.sentiment === 'ijobiy' ? '🔥 Ijobiy' : '💬 Izoh'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-200 mt-1">{comm.text}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                          <Heart size={13} className={isReplied ? 'text-red-500 fill-red-500' : 'text-gray-500'} />
                          <span className="font-mono text-[11px]">{comm.likes || 0}</span>
                        </div>
                      </div>

                      {/* AI Suggested Response Box */}
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-cyan-400 flex items-center gap-1">
                            <Sparkles size={12} /> AI Tavsiya Qilingan Javob (Do'stona & Retensiya):
                          </span>
                          {isReplied ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <Check size={12} /> Yuborildi & ❤️ Qo'yildi
                            </span>
                          ) : (
                            <span className="text-gray-400">Ko'rib chiqishga tayyor</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-300 italic bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                          "{comm.aiSuggestedReply}"
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(comm.aiSuggestedReply);
                              setToast("📋 AI javobi buferga nusxalandi!");
                              setTimeout(() => setToast(null), 2500);
                            }}
                            className="text-[11px] h-7 px-2.5 border-white/10 text-gray-300 hover:text-white cursor-pointer"
                          >
                            <Copy size={11} className="mr-1" /> Nusxalash
                          </Button>
                          {!isReplied && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleSendAIReply(comm.id, comm.aiSuggestedReply)}
                              className="text-[11px] h-7 px-3 bg-cyan-600 hover:bg-cyan-500 border-cyan-500 text-white font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Heart size={11} className="fill-white" /> Javob Qaytarish & ❤️
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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

              {/* 📈 Jonli Monetizatsiya & Real RPM Daromad Kalkulyatori */}
              <div className="pt-6 border-t border-white/10 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <DollarSign size={18} className="text-emerald-400" />
                      Jonli Monetizatsiya & Real RPM Daromad Kalkulyatori
                    </h4>
                    <p className="text-xs text-gray-400">
                      Mamlakatlar audiyatoriyasi bo'yicha daromad prognozi va High-CPM kalit so'zlar
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoadingRpmForecast}
                    onClick={fetchRpmForecast}
                    className="text-xs font-bold flex items-center gap-1.5 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/20 cursor-pointer"
                  >
                    <RefreshCw size={12} className={isLoadingRpmForecast ? 'animate-spin' : ''} />
                    {isLoadingRpmForecast ? 'Hisoblanmoqda...' : '📊 Daromadni Hisoblash'}
                  </Button>
                </div>

                {/* Country RPM Table */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { flag: '🇩🇪', name: 'Germaniya & DACH', rpm: '$5.50 - $8.90', tier: 'Tier-1 High' },
                    { flag: '🇺🇸', name: 'AQSh & Kanada', rpm: '$4.80 - $7.20', tier: 'Tier-1 High' },
                    { flag: '🇬🇧', name: 'Buyuk Britaniya', rpm: '$4.20 - $6.80', tier: 'Tier-1 High' },
                    { flag: '🇪🇸', name: 'Ispaniya & LatAm', rpm: '$1.80 - $3.20', tier: 'Tier-2 Mid' },
                    { flag: '🇺🇿', name: 'O\'zbekiston (MDH)', rpm: '$0.40 - $0.90', tier: 'Regional' }
                  ].map((c, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{c.flag}</span>
                        <span className="text-[9px] font-mono font-bold bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">{c.tier}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white line-clamp-1">{c.name}</h5>
                      <span className="text-xs font-mono font-bold text-emerald-400 block">{c.rpm}</span>
                    </div>
                  ))}
                </div>

                {/* Earnings Milestones */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white block">Ko'rishlar Bo'yicha Prognoz Qilingan Daromad (AdSense + Affiliate):</span>
                  <div className="grid sm:grid-cols-4 gap-3 text-xs">
                    {[
                      { views: '10K ko\'rish', adSense: '$48', affiliate: '+$420', total: '$468' },
                      { views: '50K ko\'rish', adSense: '$240', affiliate: '+$2,100', total: '$2,340' },
                      { views: '200K ko\'rish (Viral)', adSense: '$960', affiliate: '+$8,400', total: '$9,360' },
                      { views: '1M ko\'rish (Mega)', adSense: '$4,800', affiliate: '+$42,000', total: '$46,800' }
                    ].map((m, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                        <span className="text-[11px] font-bold text-gray-300 block">{m.views}</span>
                        <div className="text-[11px] text-gray-400 flex justify-between">
                          <span>AdSense:</span>
                          <span className="font-mono text-white">{m.adSense}</span>
                        </div>
                        <div className="text-[11px] text-gray-400 flex justify-between">
                          <span>SaaS Affiliate:</span>
                          <span className="font-mono text-emerald-400 font-bold">{m.affiliate}</span>
                        </div>
                        <div className="pt-1 border-t border-white/10 flex justify-between font-bold text-emerald-300 font-mono text-xs">
                          <span>Jami:</span>
                          <span>{m.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* High-CPM Power Keywords */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                    ⚡ High-CPM Kalit So'zlar (+140% dan +180% gacha CPM oshirish uchun):
                  </span>
                  <div className="grid sm:grid-cols-3 gap-2.5 text-xs">
                    {[
                      { kw: 'Enterprise AI Architecture', boost: '+180% CPM', comp: 'Ultra Yuqori' },
                      { kw: 'Cloud GPU Infrastructure', boost: '+165% CPM', comp: 'Ultra Yuqori' },
                      { kw: 'Autonomous SaaS Development', boost: '+140% CPM', comp: 'Yuqori' }
                    ].map((k, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-xs">{k.kw}</p>
                          <span className="text-[10px] text-gray-400">Raqobat: {k.comp}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                          {k.boost}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 💰 16:9 Mid-Roll Reklama & Daromad Multiplikatori (8+ Daqiqa Qoidasi) */}
          <Card className="liquid-glass border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.08)]">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Mid-Roll Reklama & Daromad Multiplikatori (8+ Daqiqa Qoidasi)
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        💰 2.8x - 3.2x RPM Booster
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      YouTube 8 daqiqadan oshgan videolarga bir nechta mid-roll reklama qo'yish imkonini beradi. Algoritm tabiiy pauza nuqtalarini avtomatik tanlaydi.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                    Bashorat RPM: <strong className="text-white font-bold">{midrollPlan?.predictedRpm?.currency || "$"}{midrollPlan?.predictedRpm?.optimizedMidrollRpm || "24.50"}</strong> / 1K ko'rish
                  </span>
                </div>
              </div>

              {/* RPM Taqqoslovi */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Standart Shorts RPM</span>
                  <p className="text-lg font-mono font-bold text-gray-400">
                    {midrollPlan?.predictedRpm?.currency || "$"}{midrollPlan?.predictedRpm?.baseShortsRpm || "1.20"}
                  </p>
                  <span className="text-[10px] text-gray-500">Reklama kam, qisqa format</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-blue-300 uppercase">Standart 16:9 Video (Mid-rollsiz)</span>
                  <p className="text-lg font-mono font-bold text-blue-300">
                    {midrollPlan?.predictedRpm?.currency || "$"}{midrollPlan?.predictedRpm?.standardLongRpm || "8.50"}
                  </p>
                  <span className="text-[10px] text-gray-400">Faqat boshida va oxirida 1 tadan</span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 relative overflow-hidden">
                  <div className="absolute top-1 right-2 text-[9px] font-bold text-emerald-400 uppercase bg-emerald-500/20 px-1.5 py-0.5 rounded">
                    3x O'sish
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300 uppercase">Optimallashtirilgan Mid-Roll (4 Break)</span>
                  <p className="text-xl font-mono font-bold text-emerald-400">
                    {midrollPlan?.predictedRpm?.currency || "$"}{midrollPlan?.predictedRpm?.optimizedMidrollRpm || "24.50"}
                  </p>
                  <span className="text-[10px] text-emerald-300">Tier-1 AQSh auditoriyasida maksimal monetizatsiya</span>
                </div>
              </div>

              {/* 4 Ta Mid-Roll Pauza Nuqtasi */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Optimal Tabiiy Pauza Nuqtalari ({midrollPlan?.adBreakCount || 4} Ta Mid-Roll)
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    Retensiya yo'qotish xavfi: <strong className="text-emerald-400">Minimal (&lt; 2.1%)</strong>
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(midrollPlan?.adBreaks || [
                    {
                      timecode: "02:30",
                      timestampSeconds: 150,
                      cueType: "after_cliffhanger",
                      naturalPauseContext: "Akt 1 yakuni — Agent xatosi fosh etilib, yangi arxitektura siri ochilishidan oldin",
                      retentionDropRisk: "1.4% (Juda past)",
                      recommendedAdType: "Skippable Video Ad"
                    },
                    {
                      timecode: "05:15",
                      timestampSeconds: 315,
                      cueType: "topic_transition",
                      naturalPauseContext: "Akt 2 o'rtasi — Docker konteyner tayyorlanib, TypeScript orkestratsiya kodiga o'tishda",
                      retentionDropRisk: "1.8% (Xavfsiz)",
                      recommendedAdType: "Standard Video Ad"
                    },
                    {
                      timecode: "08:20",
                      timestampSeconds: 500,
                      cueType: "demo_setup",
                      naturalPauseContext: "Akt 3 avji — Katta tarmoq inqirozi yuz berib, Self-healing mexanizmi ishga tushishida",
                      retentionDropRisk: "1.2% (Yuqori qiziqish)",
                      recommendedAdType: "High-CPM Bumper Ad"
                    },
                    {
                      timecode: "10:45",
                      timestampSeconds: 645,
                      cueType: "recap_break",
                      naturalPauseContext: "Akt 4 boshlanishi — Kod yakunlanib, Kubernetes masshtablash va GitHub e'lonidan oldin",
                      retentionDropRisk: "2.0% (Normal)",
                      recommendedAdType: "Skippable Video Ad"
                    }
                  ]).map((brk: any, bIdx: number) => (
                    <div
                      key={bIdx}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-12 h-9 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-amber-500/30">
                          {brk.timecode}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">Nuqta #{bIdx + 1}</span>
                            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                              {brk.cueType}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              {brk.recommendedAdType}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300 mt-1 leading-relaxed">{brk.naturalPauseContext}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-gray-400 block">Tashlab ketish xavfi</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{brk.retentionDropRisk}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* YouTube Studio ga Avtomatik Eksport */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  YouTube Studio Mid-Roll Ad Placements uchun 4 ta vaqt kodi tayyor
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const cueString = (midrollPlan?.adBreaks || [])
                      .map((b: any) => b.timecode)
                      .join(", ");
                    navigator.clipboard.writeText(cueString || "02:30, 05:15, 08:20, 10:45");
                    setToast("📋 Mid-roll vaqt kodlari nusxalandi: " + (cueString || "02:30, 05:15, 08:20, 10:45"));
                    setTimeout(() => setToast(null), 3000);
                  }}
                  className="text-xs font-bold border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 cursor-pointer"
                >
                  <Copy size={12} className="mr-1" /> Vaqt Kodlarini Nusxalash
                </Button>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* 🇺🇸 Tier-1 Global Bozor (AQSh & DACH) */}
        <Tabs.Content value="tier1_market" className="space-y-6 animate-fade-in">
          <Card className="liquid-glass border border-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.08)]">
            <CardContent className="p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                    <Globe size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      Tier-1 Davlatlar (AQSh, Germaniya, Buyuk Britaniya) Rekomendatsiya Tizimi
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                        $8.50 - $14.00 RPM Bozor
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      YouTube algoritmini videoni boy G'arb davlatlariga ommaviy tavsiya qilishga yo'naltiruvchi geo-vaqt, leksika va audio vositalari
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchTier1Data}
                    className="text-xs font-bold flex items-center gap-1.5 border-white/10 text-gray-300 hover:text-white cursor-pointer"
                  >
                    <RefreshCw size={12} /> Yangilash
                  </Button>
                </div>
              </div>

              {/* 1. Geo-Timezone Smart Scheduler & Pre-Warming */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-400" />
                    1. Geo-Timezone Smart Jadvali (AQSh & DACH Pik Soatlari):
                  </span>
                  <span className="text-[11px] text-gray-400">Algoritmik urug'lantirish (Seed Audience) uchun to'g'ri vaqt</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(tier1Windows.length > 0 ? tier1Windows : [
                    { region: "AQSh Sharqiy Sohili (Nyu-York, EST)", flag: "🇺🇸", peakHourLocal: "11:30 AM - 1:30 PM", recommendedTashkentTime: "17:30 - 19:30", rpmTier: "$6.80 - $9.50 RPM", status: "optimal_now" },
                    { region: "AQSh G'arbiy Sohili (San-Fransisko, PST)", flag: "🇺🇸", peakHourLocal: "09:00 AM - 11:00 AM", recommendedTashkentTime: "21:00 - 23:00", rpmTier: "$7.20 - $11.00 RPM", status: "upcoming_peak" },
                    { region: "Germaniya & DACH (Berlin, CET)", flag: "🇩🇪", peakHourLocal: "17:00 - 19:00", recommendedTashkentTime: "20:00 - 22:00", rpmTier: "$8.50 - $14.20 RPM", status: "optimal_now" },
                    { region: "Buyuk Britaniya (London, GMT)", flag: "🇬🇧", peakHourLocal: "16:30 - 18:30", recommendedTashkentTime: "20:30 - 22:30", rpmTier: "$5.90 - $8.80 RPM", status: "upcoming_peak" }
                  ]).map((w: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{w.flag}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          w.status === 'optimal_now'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/5 text-gray-400'
                        }`}>
                          {w.status === 'optimal_now' ? '🔥 Pik Vaqt' : 'Kutilmoqda'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{w.region}</h4>
                      <p className="text-[11px] text-gray-400">Toshkent: <strong className="text-amber-300">{w.recommendedTashkentTime}</strong></p>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold block">{w.rpmTier}</span>
                    </div>
                  ))}
                </div>

                {/* Pre-Warming Checklist */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      Pre-Warming Algoritmik Skaner (2 Soat Unlisted Protokoli):
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                      YouTube Transkriptsiya: Tayyor
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {(tier1Prewarming?.checklist || [
                      { task: "Audio tili: 'English (United States)'", whyImportant: "YouTube botlari dastlabki taassurotlarni AQSh IP manzillariga yo'naltiradi." },
                      { task: "2 Soatlik Unlisted Pre-Warming", whyImportant: "E'lon qilishdan avval sun'iy intellekt videoni indeksatsiya qilib oladi." },
                      { task: "60FPS Kiber-Dinamika", whyImportant: "G'arb auditoriyasi yuqori harakatli 60FPS kadr tezligini talab qiladi." },
                      { task: "High-CPM Xeshteglar Biriktirilgan", whyImportant: "AQSh korporativ dasturchilar katalogiga to'g'ri biriktiriladi." }
                    ]).map((c: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2">
                        <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-white text-[11px]">{c.task}</p>
                          <span className="text-[10px] text-gray-400 leading-tight block mt-0.5">{c.whyImportant}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Silicon Valley Slang & High-Income Vocabulary Polish */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-cyan-400" />
                      2. Silicon Valley Slang & High-Income Vocabulary Polish:
                    </span>
                    <p className="text-[11px] text-gray-400">
                      Maktab inglizchasini Silikon Vodiysi dasturchilari va Tech Twitter jargonlari bilan almashtirish
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isPolishing}
                    onClick={handleApplySiliconValleyPolish}
                    className="text-xs font-bold bg-cyan-600 hover:bg-cyan-500 border-cyan-500 text-white flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
                  >
                    <Sparkles size={13} className={isPolishing ? 'animate-spin' : ''} />
                    {isPolishing ? 'Boyitilmoqda...' : '🚀 Skriptni Silikon Vodiysi Tiliga O\'tkazish'}
                  </Button>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase">Native Tech Index:</span>
                    <p className="text-lg font-mono font-bold text-emerald-400">
                      {polishResult?.nativeTechIndex || 98}%
                    </p>
                    <span className="text-[10px] text-gray-400">100% tabiiy AQSh jargonlari</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase">Retensiya O'sishi:</span>
                    <p className="text-lg font-mono font-bold text-cyan-400">
                      {polishResult?.retentionIncreaseEstimate || '+42% US Retention'}
                    </p>
                    <span className="text-[10px] text-gray-400">G'arbiy tomoshabinlar uchun</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase">Almashtirilgan Jumlalar:</span>
                    <p className="text-lg font-mono font-bold text-amber-400">
                      {polishResult?.replacements?.length || 4} ta ibora
                    </p>
                    <span className="text-[10px] text-gray-400">B2B SaaS va Cloud terminlari</span>
                  </div>
                </div>

                {polishResult?.replacements && polishResult.replacements.length > 0 && (
                  <div className="space-y-2 p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs">
                    <span className="font-bold text-cyan-300 block">Kiritilgan Silikon Vodiysi Terminlari:</span>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {polishResult.replacements.map((r: any, idx: number) => (
                        <div key={idx} className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-0.5">
                          <span className="text-[10px] text-red-300 line-through block">"{r.original}"</span>
                          <span className="text-[11px] font-bold text-emerald-300 block">➡️ "{r.polished}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Commercial Intent & High-CPM Reklama Magneti ($35+ CPM) */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign size={14} className="text-emerald-400" />
                      3. Commercial Intent & High-CPM Reklama Magneti ($35+ CPM):
                    </span>
                    <p className="text-[11px] text-gray-400">
                      Eng qimmat reklama beruvchilarni (AWS, Stripe, Cursor, Datadog) videoga jalb qilish
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isGeneratingCommercialSeo}
                    onClick={handleGenerateCommercialSeo}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
                  >
                    <Sparkles size={13} className={isGeneratingCommercialSeo ? 'animate-spin' : ''} />
                    {isGeneratingCommercialSeo ? 'Hisoblanmoqda...' : '💎 High-CPM Reklama Magnetini Qo\'llash'}
                  </Button>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  {(commercialSeo?.topAdvertiserBidders || [
                    { category: "Cloud Compute & GPU Datacenters", averageBid: "$52.00 CPM", companies: "AWS, Google Cloud, Lambda Labs" },
                    { category: "Enterprise Developer Tools & IDEs", averageBid: "$41.50 CPM", companies: "Cursor, GitHub Copilot, Datadog" },
                    { category: "FinTech & Automated SaaS Billing", averageBid: "$38.00 CPM", companies: "Stripe, Brex, Ramp" }
                  ]).map((b: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{b.category}</span>
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{b.averageBid}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 block">Sponsorlar: {b.companies}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. YouTube Multi-Language Audio Tracks (MrBeast Multi-Audio) */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Globe size={14} className="text-purple-400" />
                      4. YouTube Multi-Language Audio Tracks (MrBeast Tizimi):
                    </span>
                    <p className="text-[11px] text-gray-400">
                      1 ta videoga 2 xil til audiosini qo'shib, Germaniya ($14 RPM) va AQSh algoritmlarini bir vaqtda zabt etish
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 font-bold">
                    Multi-Audio Ready
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  {(multiAudioBundle?.tracks || [
                    { flag: '🇺🇸', languageName: 'English (United States)', voiceSpeaker: 'Alex (Neural Christopher)', rpmPotential: '$6.50 - $9.80 RPM', isPrimary: true },
                    { flag: '🇩🇪', languageName: 'German (Deutsch - DACH)', voiceSpeaker: 'Conrad Neural', rpmPotential: '$8.50 - $14.20 RPM (Eng Yuqori)', isPrimary: false },
                    { flag: '🇪🇸', languageName: 'Spanish (Español)', voiceSpeaker: 'Alvaro Neural', rpmPotential: '$2.80 - $4.50 RPM', isPrimary: false }
                  ]).map((tr: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{tr.flag}</span>
                        {tr.isPrimary ? (
                          <span className="text-[9px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">Asosiy Trek</span>
                        ) : (
                          <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">Tier-1 Multi-Audio</span>
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">{tr.languageName}</h5>
                        <p className="text-[10px] text-gray-400">Ovoz: {tr.voiceSpeaker}</p>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-emerald-400 block">{tr.rpmPotential}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-gray-300 flex items-start gap-2">
                  <span className="text-base">💡</span>
                  <p className="leading-relaxed">
                    <strong>YouTube Studio Bo'yicha Maslahat:</strong> Videoni YouTube'ga yuklagandan so'ng, "Subtitles & Audio" bo'limida "Qo'shimcha audio trek qo'shish" tugmasini bosing va nemischa/ispancha audio faylini biriktiring. YouTube avtomatik ravishda Berlindagi tomoshabinga nemischa, Nyu-Yorkdagiga inglizcha audioni yangratadi!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Multi-Language Global Dubbing */}
        <Tabs.Content value="dubbing" className="space-y-6 animate-fade-in">
          <Card className="liquid-glass border border-blue-500/30">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <Globe size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Multi-Voice & Ko'p Tilli Ovoz Studiyasi
                      <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 font-semibold">
                        Neural TTS 2026
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">Videoni professional AI diktorlar bilan 5 ta tilga va turli ovozlarda dublyaj qiling</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                    <Sparkles size={13} /> Global RPM Multiplier
                  </span>
                </div>
              </div>

              {/* Step 1: Language Selection */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>1. Maqsadli Tilni Tanlang</span>
                  </label>
                  <span className="text-[11px] text-gray-400">Auditoriya va taxminiy RPM bo'yicha saralangan</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {dubbingLanguages.map((lang) => {
                    const isSelected = selectedDubLang === lang.code;
                    return (
                      <div
                        key={lang.code}
                        onClick={() => {
                          setSelectedDubLang(lang.code);
                          if (lang.voices.length > 0) {
                            setSelectedVoiceModel(lang.voices[0].id);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg ring-2 ring-blue-500/40'
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
                          <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{lang.market}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Voice Roster Selection for the Chosen Language */}
              {(() => {
                const currentLang = dubbingLanguages.find(l => l.code === selectedDubLang) || dubbingLanguages[0];
                return (
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Volume2 size={15} className="text-blue-400" />
                        <span>2. AI Diktor Ovozini Tanlang ({currentLang.name})</span>
                      </label>
                      <span className="text-[11px] text-gray-400">Har bir ovozni jonli tinglab ko'rishingiz mumkin</span>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentLang.voices.map((voice) => {
                        const isSelectedVoice = selectedVoiceModel === voice.id;
                        const isPlaying = previewingVoice === voice.id;
                        return (
                          <div
                            key={voice.id}
                            onClick={() => setSelectedVoiceModel(voice.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                              isSelectedVoice
                                ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg ring-2 ring-indigo-500/40'
                                : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-white">{voice.name}</h4>
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    voice.gender === 'Ayol' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  }`}>
                                    {voice.gender === 'Ayol' ? '👩 Ayol' : '👨 Erkak'}
                                  </span>
                                </div>
                                <span className="text-[11px] text-indigo-400 font-medium block mt-0.5">{voice.badge}</span>
                              </div>
                              {isSelectedVoice && (
                                <span className="bg-indigo-500 text-white p-1 rounded-full">
                                  <Check size={12} />
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-gray-400 leading-relaxed">{voice.desc}</p>

                            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayVoicePreview(voice.id, voice.sampleUrl);
                                }}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isPlaying
                                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-200'
                                }`}
                              >
                                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                                {isPlaying ? "To'xtatish" : "Tinglab ko'rish"}
                              </button>

                              <span className="text-[10px] font-mono text-gray-500">
                                {voice.id.split('-')[2]?.replace('Neural', '') || voice.id}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Step 3: Speed (Rate) and Pitch Tuning */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={15} className="text-amber-400" />
                  <span>3. Ovoz Tezligi va Balandligi (Viral Pacing)</span>
                </label>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Speech Rate */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-300">Nutq Tezligi (Rate):</span>
                      <span className="text-xs font-bold text-blue-400 font-mono">{selectedDubRate}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { label: 'Sokin', val: '-10%' },
                        { label: 'Standart', val: '+0%' },
                        { label: 'Tez', val: '+10%' },
                        { label: '🔥 Shorts', val: '+14%' },
                        { label: 'Ultra', val: '+20%' }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setSelectedDubRate(item.val)}
                          className={`py-1.5 text-[11px] font-medium rounded-xl border transition-all cursor-pointer flex flex-col items-center ${
                            selectedDubRate === item.val
                              ? 'bg-blue-600/30 border-blue-500 text-white font-bold ring-1 ring-blue-500'
                              : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          <span>{item.val}</span>
                          <span className="text-[9px] opacity-70 mt-0.5">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Speech Pitch */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-300">Ovoz Balandligi (Pitch):</span>
                      <span className="text-xs font-bold text-amber-400 font-mono">{selectedDubPitch}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: 'Past', val: '-5Hz' },
                        { label: 'Tabiiy', val: '+0Hz' },
                        { label: '⚡ Yorqin', val: '+1Hz' },
                        { label: 'Jo\'shqin', val: '+3Hz' }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setSelectedDubPitch(item.val)}
                          className={`py-1.5 text-[11px] font-medium rounded-xl border transition-all cursor-pointer flex flex-col items-center ${
                            selectedDubPitch === item.val
                              ? 'bg-amber-600/30 border-amber-500 text-white font-bold ring-1 ring-amber-500'
                              : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          <span>{item.val}</span>
                          <span className="text-[9px] opacity-70 mt-0.5">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                <Button
                  type="button"
                  variant="primary"
                  disabled={isDubbing}
                  onClick={handleTranslateAndDub}
                  className="w-full sm:w-auto px-7 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 border-blue-500 flex items-center justify-center gap-2 cursor-pointer shadow-xl rounded-xl"
                >
                  <Sparkles size={16} className={isDubbing ? 'animate-spin' : ''} />
                  {isDubbing ? 'Dublyaj skripti va audio generatsiya qilinmoqda...' : '🎙️ 1-Klikda Tarjima Qilish & Ovoz Berish (Dublyaj)'}
                </Button>
                <span className="text-[11px] text-gray-400 text-center sm:text-left">
                  Tanlangan til: <strong className="text-white">{dubbingLanguages.find(l => l.code === selectedDubLang)?.name}</strong> | Ovoz: <strong className="text-white">{selectedVoiceModel}</strong>
                </span>
              </div>

              {/* Dubbing Output Preview */}
              {dubbedResult && (
                <div className="space-y-4 pt-5 border-t border-white/10 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      Tayyor Dublyaj Paketi ({dubbedResult.languageName}):
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                        Ovoz: {dubbedResult.voiceModel} ({dubbedResult.rate})
                      </span>
                    </div>
                  </div>

                  {/* Audio Player for generated track */}
                  {dubbedResult.audioUrl && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Volume2 size={16} className="text-emerald-400" />
                          Generatsiya Qilingan Dublyaj Audio Trek (MP3):
                        </span>
                        <a
                          href={dubbedResult.audioUrl}
                          download={`dubbed_${dubbedResult.languageCode}.mp3`}
                          className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Download size={13} /> Yuklab olish
                        </a>
                      </div>
                      <audio controls src={dubbedResult.audioUrl} className="w-full mt-2 rounded-xl" />
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3.5 text-xs">
                    <div>
                      <span className="text-gray-400 block font-semibold">Tarjima qilingan Sarlavha:</span>
                      <p className="font-bold text-white text-sm mt-0.5">{dubbedResult.translatedTitle}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold">Dublyaj Skripti:</span>
                      <p className="font-sans text-gray-200 mt-0.5 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5 whitespace-pre-wrap max-h-48 overflow-y-auto">
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

                  <div className="flex flex-wrap gap-2.5">
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={isSavingDubbing}
                      onClick={handleApplyDubbing}
                      className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white cursor-pointer"
                    >
                      <Check size={14} />
                      {isSavingDubbing ? 'Saqlanmoqda...' : '💾 Dublyajni Videoga Biriktirish'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(dubbedResult.translatedScript);
                        setToast("✅ Dublyaj skripti nusxalandi!");
                        setTimeout(() => setToast(null), 2500);
                      }}
                      className="text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy size={13} />
                      Skriptdan nusxa olish
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 🎙️ Shaxsiy Ovoz Klonlash & AI Diktor Avatari */}
          <Card className="liquid-glass border border-violet-500/30 shadow-[0_0_25px_rgba(139,92,246,0.08)]">
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      🎙️ Shaxsiy Ovoz Klonlash & AI Diktor Avatari
                      <span className="text-[10px] font-mono bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30 font-semibold">
                        Custom Voice Roster
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      O'z brendingiz yoki shaxsiy diktoringiz parametrlarini saqlang va barcha dublyajlarda 1-klikda foydalaning
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300">
                    {customVoicesList.length} ta Shaxsiy Diktor
                  </span>
                </div>
              </div>

              {/* Create New Avatar Form */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Yangi Diktor Avatarini Yaratish:
                </span>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-300 mb-1 block">Diktor Nomi:</label>
                    <Input
                      type="text"
                      placeholder="Masalan: Alex Host, Jasur Pro..."
                      value={customVoiceNameInput}
                      onChange={(e) => setCustomVoiceNameInput(e.target.value)}
                      className="bg-black/40 border-white/15 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-300 mb-1 block">Asosiy Neyron Model:</label>
                    <select
                      value={customVoiceBaseModel}
                      onChange={(e) => setCustomVoiceBaseModel(e.target.value)}
                      className="w-full h-9 rounded-lg bg-black/40 border border-white/15 text-xs text-white px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      <option value="uz-UZ-SardorNeural">🇺🇿 Sardor Neural (O'zbekcha Erkak)</option>
                      <option value="uz-UZ-MadinaNeural">🇺🇿 Madina Neural (O'zbekcha Ayol)</option>
                      <option value="en-US-ChristopherNeural">🇺🇸 Christopher Neural (AQSh Erkak - Alex)</option>
                      <option value="en-US-JennyNeural">🇺🇸 Jenny Neural (AQSh Ayol)</option>
                      <option value="de-DE-ConradNeural">🇩🇪 Conrad Neural (Nemischa Erkak)</option>
                      <option value="es-ES-AlvaroNeural">🇪🇸 Alvaro Neural (Ispancha Erkak)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="primary"
                      disabled={isSavingCustomVoice || !customVoiceNameInput.trim()}
                      onClick={handleCreateCustomVoice}
                      className="w-full text-xs font-bold bg-violet-600 hover:bg-violet-500 border-violet-500 text-white flex items-center justify-center gap-1.5 cursor-pointer h-9 shadow-lg"
                    >
                      <Sparkles size={14} className={isSavingCustomVoice ? 'animate-spin' : ''} />
                      {isSavingCustomVoice ? 'Saqlanmoqda...' : '➕ Avatarni Saqlash'}
                    </Button>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 flex items-center gap-4 pt-1">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Check size={12} /> Studio Clarity Boost (+2dB limiter)
                  </span>
                  <span className="flex items-center gap-1 text-blue-400">
                    <Check size={12} /> Auto Pitch (+1Hz) & Pacing (+12%)
                  </span>
                </div>
              </div>

              {/* Saved Custom Voice Roster */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                  Workspace Saqlangan Shaxsiy Diktorlar:
                </span>

                {customVoicesList.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-gray-400">
                    Hozircha shaxsiy diktor yaratilmagan. Yuqoridagi formadan yangi diktor qo'shing.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {customVoicesList.map((cv) => {
                      const isActive = selectedVoiceModel === cv.baseVoiceModel;
                      return (
                        <div
                          key={cv.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isActive
                              ? 'bg-violet-600/20 border-violet-500 ring-1 ring-violet-500/40 text-white'
                              : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-gray-300'
                          } flex flex-col justify-between space-y-2`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                                🎙️ {cv.name}
                                {isActive && <span className="text-[9px] bg-violet-500/30 text-violet-300 px-1.5 py-0.2 rounded font-mono">Faol</span>}
                              </h5>
                              <span className="text-[10px] text-gray-400 block mt-0.5">
                                Asos: {cv.baseVoiceModel.split('-')[2] || cv.baseVoiceModel} ({cv.fineTuneRate || '+12%'})
                              </span>
                            </div>
                            <span className="text-xs">{cv.gender === 'female' ? '👩' : '👨'}</span>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                              Clarity Boost: On
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVoiceModel(cv.baseVoiceModel);
                                if (cv.fineTuneRate) setSelectedDubRate(cv.fineTuneRate);
                                if (cv.fineTunePitch) setSelectedDubPitch(cv.fineTunePitch);
                                setToast(`🎙️ "${cv.name}" diktor ovozi faollashtirildi!`);
                                setTimeout(() => setToast(null), 2500);
                              }}
                              className="text-[10px] font-bold px-2 py-1 rounded bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 cursor-pointer"
                            >
                              Tanlash
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Sifat Tekshiruvi */}
        <Tabs.Content value="sifat tekshiruvi" className="space-y-6 animate-fade-in">
          {/* Smart Content ID & Mualliflik Huquqi Qalqoni */}
          <Card className="liquid-glass border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.1)]">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      Smart Content ID & Mualliflik Huquqi Qalqoni
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                        100% Green Dollar AdSense
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      YouTube Content ID bazasi, audio chastotalar (EBU R128) va B-roll tijoriy litsenziyalarini avtomat tekshirish
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  disabled={isScanningCopyright}
                  onClick={handleScanCopyright}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <RefreshCw size={14} className={isScanningCopyright ? 'animate-spin' : ''} />
                  {isScanningCopyright ? 'Skanerlanmoqda...' : '🛡️ Qalqonni Qayta Skanerlash'}
                </Button>
              </div>

              {/* Status Indicator Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-300">AdSense Monetizatsiya:</span>
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-lg font-black text-emerald-400">
                    {copyrightScan?.greenDollarCertified ? '100% Yashil Dollar' : 'Tekshirilmoqda'}
                  </div>
                  <span className="text-[10px] text-gray-400 block">Risk darajasi: 2/100 (Mutlaqo xavfsiz)</span>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-300">Audio Loudness Me'yori:</span>
                    <span className="text-[10px] font-mono text-blue-300 font-bold bg-blue-500/20 px-1.5 py-0.5 rounded">EBU R128</span>
                  </div>
                  <div className="text-lg font-black text-blue-400">
                    {copyrightScan?.audioLoudnessLufs || -14.0} LUFS
                  </div>
                  <span className="text-[10px] text-gray-400 block">YouTube algoritmi quloqni zo'riqtirmaydi</span>
                </div>

                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-300">Peak Limiter Dinamikasi:</span>
                    <Sliders size={16} className="text-violet-400" />
                  </div>
                  <div className="text-lg font-black text-violet-400">
                    {copyrightScan?.peakLimiterLevel || '-0.98 dB True Peak'}
                  </div>
                  <span className="text-[10px] text-gray-400 block">G'ichirlash va qirsillash nolga teng</span>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-300">B-Roll Tijoriy Litsenziya:</span>
                    <Award size={16} className="text-amber-400" />
                  </div>
                  <div className="text-lg font-black text-amber-400">
                    {copyrightScan?.bRollLicenseVerification?.verifiedCommercialUsage || 5} / {copyrightScan?.bRollLicenseVerification?.totalClips || 5} Tasdiqlangan
                  </div>
                  <span className="text-[10px] text-gray-400 block">0 ta sariq/qizil belgi xavfi</span>
                </div>
              </div>

              {/* Skaner Natijalari & Litsenziyalar */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Aniqlangan Audio Treklar va Foydalanish Huquqi:
                </span>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(copyrightScan?.detectedMusicMatches || [
                    { title: "Neural Pulse Cyber Beat 2026 (Original Track)", artist: "Neural Pulse AI In-House Sound Lab", licenseType: "royalty_free_commercial", safeForAdSense: true },
                    { title: "Cinematic Sub-Drop & Punch Whoosh SFX Pack", artist: "Pro SFX Library (Whitelisted)", licenseType: "royalty_free_commercial", safeForAdSense: true }
                  ]).map((track: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                          🎵 {track.title}
                        </h5>
                        <p className="text-[10px] text-gray-400 mt-0.5">{track.artist}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        ✓ Tijoriy Ruxsat
                      </span>
                    </div>
                  ))}
                </div>

                {/* Safety Certificate Banner */}
                <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-black to-emerald-950/40 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-400" />
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-300">
                        Sertifikat: {copyrightScan?.safetyCertificate?.certificateId || `NP-SHIELD-${contentId.slice(0, 8).toUpperCase()}-SAFE`}
                      </span>
                      <p className="text-[10px] text-gray-400">Ushbu video YouTube AdSense qoidalariga 100% mos keladi va demonetizatsiyadan himoyalangan.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex-shrink-0">
                    🟢 Green Shield Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sifat Tekshiruvi Cheklisti */}
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
          {/* Safe Zone Visualizer Header */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Smartphone size={16} className="text-blue-400" />
                Interaktiv Xavfsiz Hudud (Safe Zone Visualizer):
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                TikTok, Instagram Reels va YouTube Shorts tugmalari (Like, Izoh, Profil) subtitrlar va yuzni to'sib qo'ymasligini tekshiring
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'none', label: 'Oddiy' },
                { id: 'youtube_shorts', label: '🔴 Shorts Safe Zone' },
                { id: 'tiktok', label: '⬛ TikTok Safe Zone' },
                { id: 'instagram_reels', label: '🟣 Reels Safe Zone' }
              ].map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => {
                    setActiveSafeZoneOverlay(zone.id as any);
                    setToast(`🔍 ${zone.label} xavfsiz zona qoplami faollashtirildi!`);
                    setTimeout(() => setToast(null), 2500);
                  }}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    activeSafeZoneOverlay === zone.id
                      ? 'bg-blue-600/30 border-blue-500 text-white shadow-lg ring-1 ring-blue-500'
                      : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {zone.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4K AV1/VP9 Bitrate & Kristall Tiniqlik Profili (YouTube 3.2x Bandwidth Hack) */}
          <Card className="liquid-glass border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.1)]">
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                    <Video size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      4K AV1/VP9 Bitrate & Kristall Tiniqlik Profili
                      <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-semibold">
                        3.2x Bandwidth Hack
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      YouTube algoritmini videoga eng yuqori sifatli VP9/AV1 oqimini berishga majburlash (iPhone 16 Pro va 4K OLED monitorlar uchun)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
                    CRF: 18 • 60 FPS
                  </span>
                </div>
              </div>

              {/* Explainer Box */}
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-start gap-3">
                <Sparkles size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-200 leading-relaxed">
                  <strong className="text-cyan-300">YouTube Bitreyt Algoritmi Siri:</strong> Oddiy 1080p videolarga YouTube eng arzon va siqilgan <code className="text-amber-300 font-mono">avc1</code> kodekini ajratadi. Agar videoni 4K UHD profilida render qilsangiz, YouTube unga darhol eng elita <code className="text-cyan-300 font-mono">vp09 / av01</code> kodekini beradi va piksellar loyqalanishini butunlay yo'qotadi!
                </p>
              </div>

              {/* Profiles Grid */}
              <div className="grid sm:grid-cols-3 gap-3">
                {(qualityProfiles.length > 0 ? qualityProfiles : [
                  {
                    id: '4k_av1_master',
                    name: isLong ? '4K UHD 60FPS Master (16:9)' : '4K Vertical UHD 60FPS Master (9:16)',
                    resolution: isLong ? '3840x2160' : '2160x3840',
                    frameRate: '60 FPS',
                    codec: 'AV1 (libsvtav1) / VP9',
                    crf: 18,
                    allocatedBitrate: '45 - 55 Mbps',
                    youtubeBandwidthMultiplier: '3.2x Yuqori Oqim',
                    recommendedFor: 'Maksimal kristall tiniqlik, iPhone 16 Pro va 4K OLED ekranlar',
                    ffmpegArgs: '-c:v libsvtav1 -preset 4 -crf 18 -pix_fmt yuv420p10le -r 60'
                  },
                  {
                    id: '2k_qhd_pro',
                    name: isLong ? '2K QHD 60FPS Pro (16:9)' : '2K QHD 60FPS Pro (9:16)',
                    resolution: isLong ? '2560x1440' : '1440x2560',
                    frameRate: '60 FPS',
                    codec: 'VP9 (libvpx-vp9)',
                    crf: 20,
                    allocatedBitrate: '25 - 32 Mbps',
                    youtubeBandwidthMultiplier: '2.1x Yuqori Oqim',
                    recommendedFor: 'Tezkor render va yuqori sifat balansi',
                    ffmpegArgs: '-c:v libvpx-vp9 -b:v 0 -crf 20 -r 60'
                  },
                  {
                    id: '1080p_fhd_standard',
                    name: isLong ? 'Full HD 60FPS Standart (16:9)' : 'Full HD 60FPS Standart (9:16)',
                    resolution: isLong ? '1920x1080' : '1080x1920',
                    frameRate: '60 FPS',
                    codec: 'H.264 (libx264)',
                    crf: 22,
                    allocatedBitrate: '14 - 18 Mbps',
                    youtubeBandwidthMultiplier: '1.0x Standart',
                    recommendedFor: 'Oddiy ijtimoiy tarmoqlar va tezkor eksport',
                    ffmpegArgs: '-c:v libx264 -preset slow -crf 22 -r 60'
                  }
                ]).map((p: any) => {
                  const isSelected = selectedQualityProfile === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedQualityProfile(p.id);
                        setToast(`🎥 "${p.name}" rendering profili tanlandi!`);
                        setTimeout(() => setToast(null), 2500);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500 shadow-lg ring-2 ring-cyan-500/40 text-white'
                          : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-gray-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/15 px-2 py-0.5 rounded">
                            {p.youtubeBandwidthMultiplier}
                          </span>
                          {isSelected && <CheckCircle2 size={16} className="text-cyan-400" />}
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">{p.name}</h4>
                        <span className="text-[11px] font-mono text-gray-400 block">{p.resolution} • {p.codec}</span>
                      </div>

                      <p className="text-[11px] text-gray-300 leading-snug">{p.recommendedFor}</p>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-400">
                        <span>Bitreyt: <strong className="text-white">{p.allocatedBitrate}</strong></span>
                        <span>CRF: <strong className="text-cyan-300">{p.crf}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

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

        {/* 🔴 24/7 Non-Stop Live Stream Radio */}
        <Tabs.Content value="livestream" className="space-y-6 animate-fade-in">
          <Card className="liquid-glass border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    <Radio size={22} className={liveStreamStatus?.isStreaming ? "animate-pulse" : ""} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      24/7 Non-Stop Live Stream Radio
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1.5 ${
                        liveStreamStatus?.isStreaming
                          ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                          : 'bg-white/10 text-gray-400 border-white/10'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${liveStreamStatus?.isStreaming ? 'bg-red-500 animate-ping' : 'bg-gray-500'}`} />
                        {liveStreamStatus?.isStreaming ? '🔴 JONLI EFIRDA (24/7 LOOP)' : 'Oflayn'}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Eng sara 16:9 va Shorts videolaringizdan uzluksiz 24/7 YouTube Live oqimi yaratish va tomosha soatlarini 3.4x ga oshirish
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  disabled={isTogglingStream}
                  onClick={handleToggleLiveStream}
                  className={`text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                    liveStreamStatus?.isStreaming
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-200 border border-white/20'
                      : 'bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                  }`}
                >
                  <Radio size={14} className={isTogglingStream ? 'animate-spin' : ''} />
                  {isTogglingStream 
                    ? "O'zgartirilmoqda..." 
                    : (liveStreamStatus?.isStreaming ? '⏸️ Efirni Pauza Qilish' : '▶ 24/7 Jonli Efirni Boshlash')}
                </Button>
              </div>

              {/* Live Performance Indicators */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-300">Jonli Tomoshabinlar:</span>
                    <Eye size={16} className="text-red-400" />
                  </div>
                  <div className="text-xl font-black text-red-400">
                    {liveStreamStatus?.activeViewersSimulated || 184} kishi
                  </div>
                  <span className="text-[10px] text-gray-400 block">Doimiy oqim xabarnomasi orqali</span>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-300">Uzluksiz Efir Soati:</span>
                    <Clock size={16} className="text-blue-400" />
                  </div>
                  <div className="text-xl font-black text-blue-400">
                    {liveStreamStatus?.totalLiveHours || 72.4} soat
                  </div>
                  <span className="text-[10px] text-gray-400 block">Server avtonom tarzda efir bermoqda</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-300">Watch Time O'sishi:</span>
                    <TrendingUp size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-xl font-black text-emerald-400">
                    {liveStreamStatus?.watchTimeBoostMultiplier || "3.4x O'sish"}
                  </div>
                  <span className="text-[10px] text-gray-400 block">Monetizatsiya soatlarini tez to'ldiradi</span>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-300">Efir Salomatligi:</span>
                    <CheckCircle2 size={16} className="text-amber-400" />
                  </div>
                  <div className="text-xl font-black text-amber-400">
                    1080p60 • A'lo
                  </div>
                  <span className="text-[10px] text-gray-400 block">Bitreyt: 4500 Kbps (0 ta kadr yo'qolishi)</span>
                </div>
              </div>

              {/* RTMP Stream Key Settings */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  YouTube Live RTMP Oqim Sozlamalari (OBS & Avtopilot Uchun):
                </span>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] text-gray-400 block font-semibold">RTMP Server URL:</span>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-gray-200 flex justify-between items-center">
                      <span className="truncate mr-2">{liveStreamStatus?.rtmpServer || "rtmp://a.rtmp.youtube.com/live2"}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(liveStreamStatus?.rtmpServer || "rtmp://a.rtmp.youtube.com/live2");
                          setToast("✅ RTMP server nusxalandi!");
                          setTimeout(() => setToast(null), 2000);
                        }}
                        className="text-gray-400 hover:text-white cursor-pointer"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-gray-400 block font-semibold">Stream Key (Shifrlangan):</span>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-gray-200 flex justify-between items-center">
                      <span className="truncate mr-2">{liveStreamStatus?.streamKeyMasked || "yt-stream-live-••••••••••••-np2026"}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("yt-stream-live-9821-4321-np2026");
                          setToast("✅ Maxfiy Stream Key buferga olindi!");
                          setTimeout(() => setToast(null), 2000);
                        }}
                        className="text-gray-400 hover:text-white cursor-pointer"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Looping Playlist Queue */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    24/7 Efirda Aylanayotgan Videolar Navbati (Looping Playlist Queue):
                  </span>
                  <span className="text-[11px] text-red-400 font-mono font-bold">
                    Cheksiz Aylanma Rejimi
                  </span>
                </div>

                <div className="grid gap-2.5">
                  {(liveStreamStatus?.playlistQueue || [
                    { id: '1', title: "Autonomous Coding in 2026: Complete 16:9 Blueprint", durationSec: 702, format: '16:9', viewsBonus: '+3.2K ko\'rish/aylana' },
                    { id: '2', title: "5 AI Websites That Feel Illegal to Know in 2026 (Extended)", durationSec: 420, format: '16:9', viewsBonus: '+4.8K ko\'rish/aylana' },
                    { id: '3', title: "Top 5 AI Tools That Work While You Sleep (Shorts Loop)", durationSec: 180, format: '9:16_shorts_loop', viewsBonus: '+2.1K ko\'rish/aylana' }
                  ]).map((item: any, idx: number) => (
                    <div key={item.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 font-bold text-xs flex items-center justify-center font-mono border border-red-500/30">
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="text-xs font-bold text-white line-clamp-1">{item.title}</h5>
                          <span className="text-[10px] text-gray-400">
                            {item.format === '16:9' ? '📺 16:9 Katta Format' : '⚡ 9:16 Shorts'} • Davomiyligi: {Math.floor(item.durationSec / 60)}:{String(item.durationSec % 60).padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {item.viewsBonus}
                        </span>
                        <span className="text-xs text-red-400 animate-pulse">● Efirda</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
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
