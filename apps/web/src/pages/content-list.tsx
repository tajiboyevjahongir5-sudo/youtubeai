import React, { useState } from 'react';
import { PageHeader } from '../components/ui/page-header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { StatusBadge } from '../components/ui/status-badge';
import { Link } from 'react-router';
import { 
  FileText, 
  PlusCircle, 
  Search, 
  Filter, 
  Sparkles, 
  Youtube, 
  Play, 
  Clock, 
  Eye, 
  CheckCircle2, 
  MoreVertical,
  Calendar,
  RefreshCw,
  ExternalLink,
  Globe,
  Languages,
  Target,
  Trash2,
  Check
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getWorkspaceId } from '../lib/workspace';
import { fetchApi } from '../lib/api';

interface VideoItem {
  id: string;
  title: string;
  format: 'shorts' | 'long_form';
  duration: string;
  status: 'awaiting_approval' | 'scheduled' | 'published';
  rawStatus?: string;
  hasVideo?: boolean;
  scheduledAt: string;
  contentPillar: string;
  viewsPrediction: string;
  seoScore: number;
  tags: string[];
  thumbnailUrl?: string;
  youtubeUrl?: string;
  isRealYoutube?: boolean;
}

const fallbackVideos: VideoItem[] = [
  {
    id: 'item_coding_agents',
    title: 'Top 5 Autonomous Coding Agents in 2026 #Shorts',
    format: 'shorts',
    duration: '0:56',
    status: 'awaiting_approval',
    scheduledAt: 'Bugun, 14:00 UTC',
    contentPillar: "Ta'limiy",
    viewsPrediction: '45K - 95K',
    seoScore: 98,
    tags: ['ai coding', 'devin', 'cursor', 'software engineering']
  },
  {
    id: 'item_illegal_websites',
    title: '5 AI Websites That Feel Illegal to Know in 2026 #Shorts',
    format: 'shorts',
    duration: '0:52',
    status: 'awaiting_approval',
    scheduledAt: 'Bugun, 20:00 UTC',
    contentPillar: "Ta'limiy",
    viewsPrediction: '60K - 140K',
    seoScore: 98,
    tags: ['ai websites', 'productivity', 'free tools', 'viral']
  },
  {
    id: 'item_claude_vs_gemini',
    title: 'Claude 3.7 vs Gemini 2.0: The Ultimate Coding Test #Shorts',
    format: 'shorts',
    duration: '0:54',
    status: 'scheduled',
    scheduledAt: 'Ertaga, 14:00 UTC',
    contentPillar: 'Tahliliy',
    viewsPrediction: '50K - 120K',
    seoScore: 96,
    tags: ['claude 3.7', 'gemini 2.0', 'ai benchmark', 'coding']
  },
  {
    id: 'item_2',
    title: 'The Complete Future of Autonomous Coding & Agents in 2026',
    format: 'long_form',
    duration: '10:15',
    status: 'scheduled',
    scheduledAt: 'Ertaga, 21:00 UTC',
    contentPillar: 'Hujjatli',
    viewsPrediction: '25K - 60K',
    seoScore: 95,
    tags: ['software engineering', 'ai coding', 'future tech']
  },
  {
    id: 'item_swarms',
    title: 'Why Most Developers Are Coding 10x Faster with AI Swarms #Shorts',
    format: 'shorts',
    duration: '0:50',
    status: 'awaiting_approval',
    scheduledAt: 'Indinga, 14:00 UTC',
    contentPillar: "Ta'limiy",
    viewsPrediction: '40K - 80K',
    seoScore: 95,
    tags: ['ai agents', 'productivity', 'swarms', 'tech']
  },
  {
    id: 'item_saas',
    title: 'Building an Autonomous Full Stack SaaS with AI: 2026 Guide',
    format: 'long_form',
    duration: '14:20',
    status: 'scheduled',
    scheduledAt: 'Indinga, 21:00 UTC',
    contentPillar: "Qo'llanma",
    viewsPrediction: '20K - 45K',
    seoScore: 93,
    tags: ['saas', 'startup', 'web development', 'ai']
  }
];

const ContentListPage = () => {
  const workspaceId = getWorkspaceId();
  const queryClient = useQueryClient();
  const [filterTab, setFilterTab] = useState<'all' | 'pipeline' | 'approval' | 'scheduled' | 'published'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localizingId, setLocalizingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleLocalize = async (contentId: string, targetLanguage: 'uz' | 'es') => {
    setLocalizingId(contentId);
    try {
      const realId = contentId.startsWith('yt_') ? 'item_1' : contentId;
      await fetchApi(`/workspaces/${workspaceId}/content/${realId}/localize`, {
        method: 'POST',
        body: JSON.stringify({ targetLanguage })
      }, async () => 'mock_token');
      await refetchContent();
      setActiveMenuId(null);
    } catch (e) {
      console.error('Localization error:', e);
    } finally {
      setLocalizingId(null);
    }
  };

  // 1. Fetch channel info & real YouTube uploaded videos
  const { data: channelData, refetch: refetchChannel } = useQuery({
    queryKey: ['youtube-channel-videos', workspaceId],
    queryFn: async () => {
      try {
        return await fetchApi(`/workspaces/${workspaceId}/youtube/channel`, {}, async () => 'mock_token');
      } catch (e) {
        return null;
      }
    },
    staleTime: 30000,
  });

  // 2. Fetch content items pipeline from backend
  const { data: contentData, refetch: refetchContent } = useQuery({
    queryKey: ['content-pipeline', workspaceId],
    queryFn: async () => {
      try {
        return await fetchApi(`/workspaces/${workspaceId}/content`, {}, async () => 'mock_token');
      } catch (e) {
        return null;
      }
    },
    staleTime: 30000,
  });

  // 3. Fetch workspace settings to know active source channel & niche
  const { data: settingsData, refetch: refetchSettings } = useQuery({
    queryKey: ['workspace-settings', workspaceId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}`, {
          headers: { 'x-workspace-id': workspaceId }
        });
        const data = await res.json();
        return data?.settings || null;
      } catch (e) {
        return null;
      }
    },
    staleTime: 30000,
  });

  const [quickChannelInput, setQuickChannelInput] = useState('');
  const [isAnalyzingQuickChannel, setIsAnalyzingQuickChannel] = useState(false);
  const [isRefreshingIdeas, setIsRefreshingIdeas] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeChannelTitle = settingsData?.channelAnalysis?.channelTitle || settingsData?.sourceChannelUrl;
  const activeNiche = settingsData?.channelAnalysis?.niche || settingsData?.niche || 'AI Tools & Tech 2026';

  const handleQuickChannelClone = async () => {
    if (!quickChannelInput.trim()) return;
    setIsAnalyzingQuickChannel(true);
    setToastMessage(`🔍 "${quickChannelInput}" kanali tahlil qilinmoqda va 0-dan yangi g'oyalar olinmoqda...`);
    try {
      const res = await fetchApi(`/workspaces/${workspaceId}/analyze-channel`, {
        method: 'POST',
        body: JSON.stringify({ channelUrl: quickChannelInput.trim() })
      }, async () => 'mock_token');

      if (res && res.success) {
        setToastMessage(`✅ "${res.analysis?.channelTitle || quickChannelInput}" kanali asosida 3 ta yangi viral g'oya yaratildi!`);
        setQuickChannelInput('');
        await Promise.all([refetchContent(), refetchSettings()]);
      } else {
        setToastMessage(`❌ Xatolik: ${res?.error || 'Kanal tahlil qilinmadi'}`);
      }
    } catch (e: any) {
      setToastMessage(`❌ Xatolik: ${e?.message || 'Tarmoq xatosi'}`);
    } finally {
      setIsAnalyzingQuickChannel(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleRefreshChannelIdeas = async () => {
    setIsRefreshingIdeas(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/content/refresh-channel-ideas`, {
        method: 'POST',
        headers: { 'x-workspace-id': workspaceId }
      });
      const data = await res.json();
      if (data && data.success) {
        setToastMessage(`✨ ${data.message}`);
        await refetchContent();
      }
    } catch (e) {}
    finally {
      setIsRefreshingIdeas(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleClearOldDrafts = async () => {
    try {
      await fetch(`/api/workspaces/${workspaceId}/content/clear-old-drafts`, {
        method: 'POST',
        headers: { 'x-workspace-id': workspaceId }
      });
      setToastMessage("🗑️ Eski qoralama g'oyalar tozalandi");
      await refetchContent();
    } catch (e) {}
    finally {
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchChannel(), refetchContent(), refetchSettings()]);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const isChannelConnected = Boolean(channelData?.connectionStatus === 'connected');

  // 3. Construct unified live video list
  let allVideos: VideoItem[] = [];

  // A. Add real YouTube uploaded videos from the channel ONLY if channel is connected
  if (isChannelConnected && channelData?.recentVideos && Array.isArray(channelData.recentVideos) && channelData.recentVideos.length > 0) {
    const realYtVideos: VideoItem[] = channelData.recentVideos.map((v: any) => {
      const pubDate = v.publishedAt ? new Date(v.publishedAt).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Bugun';
      return {
        id: `yt_${v.id}`,
        title: v.title || 'YouTube Video',
        format: 'shorts',
        duration: '0:56',
        status: 'published',
        scheduledAt: pubDate,
        contentPillar: 'AI Texnologiya',
        viewsPrediction: `${v.views ?? 0} ko'rildi`,
        seoScore: 98,
        tags: ['neuralpulse', 'ai', 'shorts', 'youtube'],
        thumbnailUrl: v.thumbnail || `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`,
        youtubeUrl: `https://youtube.com/shorts/${v.id}`,
        isRealYoutube: true
      };
    });
    allVideos = [...realYtVideos];
  }

  // B. Add pipeline videos (or fallback if empty)
  if (contentData && Array.isArray(contentData) && contentData.length > 0) {
    const pipelineVideos: VideoItem[] = contentData.map((item: any) => {
      const isShort = (item.videoFormat || 'shorts') === 'shorts';
      const hasVideo = Boolean(item.videoUrl && item.videoUrl.trim() !== '' && item.status !== 'idea');
      let mappedStatus: 'awaiting_approval' | 'scheduled' | 'published' = 'awaiting_approval';
      if (item.status === 'scheduled' || item.status === 'approved') mappedStatus = 'scheduled';
      else if (item.status === 'published') mappedStatus = 'published';

      return {
        id: item.id || `item_${Math.random()}`,
        title: item.title,
        format: isShort ? 'shorts' : 'long_form',
        duration: isShort ? '0:58' : '10:15',
        status: mappedStatus,
        rawStatus: item.status,
        hasVideo,
        thumbnailUrl: item.thumbnailUrl,
        scheduledAt: item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Rejalashtirilgan',
        contentPillar: item.contentPillar === 'educational' ? "Ta'limiy" : (item.contentPillar === 'entertaining' ? 'Qiziqarli' : 'Tahliliy'),
        viewsPrediction: mappedStatus === 'published' ? '12.4K ko\'rildi' : '20K - 50K kutilmoqda',
        seoScore: 95,
        tags: Array.isArray(item.tags) ? item.tags : ['ai', 'automation', 'productivity'],
      };
    });

    // Merge: Avoid duplicating title if real YouTube video already has it
    pipelineVideos.forEach(pv => {
      const isAlreadyOnYoutube = allVideos.some(v => v.id.startsWith('yt_') && (
        v.title.toLowerCase().trim() === pv.title.toLowerCase().trim() ||
        (pv.status === 'published' && v.title.toLowerCase().includes(pv.title.toLowerCase().slice(0, 25)))
      ));
      if (!isAlreadyOnYoutube && !allVideos.some(v => v.id === pv.id)) {
        allVideos.push(pv);
      }
    });
  }

  // Filter logic: Default 'pipeline' tab hides published videos to focus on NEW content
  const countPipeline = allVideos.filter(v => v.status !== 'published').length;
  const countApproval = allVideos.filter(v => v.status === 'awaiting_approval').length;
  const countScheduled = allVideos.filter(v => v.status === 'scheduled').length;
  const countPublished = allVideos.filter(v => v.status === 'published').length;

  const filteredVideos = allVideos.filter(video => {
    if (filterTab === 'all') {
      if (searchQuery && !video.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }
    if (filterTab === 'pipeline' && video.status === 'published') return false;
    if (filterTab === 'approval' && video.status !== 'awaiting_approval') return false;
    if (filterTab === 'scheduled' && video.status !== 'scheduled') return false;
    if (filterTab === 'published' && video.status !== 'published') return false;
    if (searchQuery && !video.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Kontent boshqaruvi" 
        description="Yangi video loyihalari, tasdiqlash navbati va ishlab chiqarish quvuri (Pipeline)."
        actions={
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-red-400' : ''} />
              {isRefreshing ? 'Yangilanmoqda...' : 'Sinxronlash'}
            </Button>
            <Link to="/content/new">
              <Button variant="primary" className="flex items-center gap-2">
                <PlusCircle size={16} /> Yangi video yaratish
              </Button>
            </Link>
          </div>
        }
      />

      {/* Disconnected Workspace Banner */}
      {!isChannelConnected && (
        <div className="liquid-glass rounded-2xl p-5 border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-black/40 to-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Youtube size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Kanal ulanmagan</h3>
              <p className="text-xs text-gray-300">
                Ushbu workspace'ga YouTube kanali hali ulanmagan. Videolarni avtomatik yuklash va jonli ko'rishlar statistikasini kuzatish uchun o'z kanalingizni ulang.
              </p>
            </div>
          </div>
          <Link to="/integrations">
            <Button variant="primary" size="sm" className="whitespace-nowrap shadow-lg">
              O'z kanalingizni ulang
            </Button>
          </Link>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-400 flex-shrink-0 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white cursor-pointer ml-3 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Active Channel & Niche Bar */}
      <div className="liquid-glass rounded-2xl p-4 sm:p-5 border border-cyan-500/30 bg-gradient-to-r from-[#0d1424] via-[#0b101c] to-[#0a0d18] shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">
              <Target size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400">Faol Kanal & Mavzu:</span>
                <strong className="text-white text-sm font-bold">{activeChannelTitle || activeNiche}</strong>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Avtopilot Faol
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                  {activeNiche}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Barcha yangi video g'oyalari va avtopilot aynan ushbu kanal formati va auditoriyasi bo'yicha shakllanadi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefreshChannelIdeas}
              disabled={isRefreshingIdeas}
              className="text-xs text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/10 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Aktiv mavzu bo'yicha 3 ta yangi video g'oyasi yaratish"
            >
              <Sparkles size={13} className={isRefreshingIdeas ? 'animate-spin' : ''} />
              {isRefreshingIdeas ? "G'oyalar olinmoqda..." : "⚡ Mavzuga Mos Yangi G'oyalar (+3)"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearOldDrafts}
              className="text-xs border-white/10 hover:bg-red-500/10 hover:text-red-300 text-gray-400 flex items-center gap-1 cursor-pointer"
              title="Eski mavzudagi qoralama g'oyalarni tozalash"
            >
              <Trash2 size={12} /> Tozalash
            </Button>
            <Link to="/settings">
              <Button variant="outline" size="sm" className="text-xs border-white/15 hover:bg-white/5 text-gray-300">
                Kanalni O'zgartirish
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Channel Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Boshqa kanalni tahlil qilib, darhol g'oyalar olish: masalan @Fireship, @GOODENOUGHANIMATION..."
              value={quickChannelInput}
              onChange={(e) => setQuickChannelInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleQuickChannelClone();
              }}
              className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/60 transition-all"
            />
          </div>
          <Button
            size="sm"
            variant="primary"
            disabled={isAnalyzingQuickChannel || !quickChannelInput.trim()}
            onClick={handleQuickChannelClone}
            className="w-full sm:w-auto text-xs font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-500 hover:to-teal-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/20 whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={13} className={isAnalyzingQuickChannel ? 'animate-spin' : ''} />
            {isAnalyzingQuickChannel ? "Kanal tahlil qilinmoqda..." : "🎯 Ushbu Kanal G'oyalarini Olish"}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 w-full sm:w-auto overflow-x-auto">
          <button 
            onClick={() => setFilterTab('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${filterTab === 'all' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Barchasi ({allVideos.length})
          </button>
          <button 
            onClick={() => setFilterTab('pipeline')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${filterTab === 'pipeline' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Yangi G'oyalar ({countPipeline})
          </button>
          <button 
            onClick={() => setFilterTab('approval')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${filterTab === 'approval' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Tasdiqlash kutilmoqda ({countApproval})
          </button>
          <button 
            onClick={() => setFilterTab('scheduled')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${filterTab === 'scheduled' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Rejalashtirilgan ({countScheduled})
          </button>
          <button 
            onClick={() => setFilterTab('published')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${filterTab === 'published' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            YouTube'da Nashr Etilgan ({countPublished})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Sarlavha bo'yicha qidiruv..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white placeholder:text-gray-500 backdrop-blur-md focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20"
          />
        </div>
      </div>

      {/* Video List */}
      {filteredVideos.length === 0 ? (
        <div className="liquid-glass rounded-2xl p-12 text-center border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-gray-400 mx-auto">
            <FileText size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Hozircha videolar mavjud emas</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {isChannelConnected 
                ? "Ushbu parametr bo'yicha hech qanday video topilmadi." 
                : "Ushbu ish maydonida hech qanday video mavjud emas. Yangi video yarating yoki o'z YouTube kanalingizni ulang."}
            </p>
          </div>
          {!isChannelConnected && (
            <Link to="/integrations" className="inline-block">
              <Button variant="primary" size="sm">O'z kanalingizni ulang</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
        {filteredVideos.map((video, index) => (
          <div 
            key={video.id}
            className={`liquid-glass rounded-2xl p-5 border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group animate-fade-in-up ${
              video.isRealYoutube 
                ? 'border-red-500/40 bg-gradient-to-r from-red-950/20 via-black/40 to-black/20 hover:border-red-500/70 shadow-[0_4px_25px_rgba(239,68,68,0.1)]' 
                : 'border-white/10 hover:border-red-500/30'
            }`}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            {/* Thumbnail + Details */}
            <div className="flex items-start gap-4">
              <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl bg-gradient-to-tr from-red-950/80 to-slate-900 border border-white/10 flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-102 transition-transform">
                {video.thumbnailUrl ? (
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <Play size={22} className="text-white fill-white/80" />
                )}
                <span className="absolute bottom-1 right-1 text-[9px] bg-black/85 text-white px-1.5 py-0.2 rounded font-mono font-bold backdrop-blur-xs">
                  {video.duration}
                </span>
                <div className="absolute top-1 left-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm ${video.format === 'shorts' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {video.format === 'shorts' ? 'Shorts' : '16:9'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={video.rawStatus === 'idea' ? 'idea' : (video.hasVideo ? 'ready_for_review' : video.status)} />
                  {video.isRealYoutube && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                      <Youtube size={12} className="text-red-500 fill-red-500" /> Jonli YouTube
                    </span>
                  )}
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} /> {video.scheduledAt}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    SEO {video.seoScore}%
                  </span>
                  <span className="text-xs font-semibold text-white/90 bg-white/[0.06] px-2 py-0.5 rounded-md">
                    👁️ {video.viewsPrediction}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-red-400 transition-colors">
                  {video.title}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {video.tags.map(tag => (
                    <span key={tag} className="text-[10px] text-gray-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/5">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
              {video.youtubeUrl && (
                <a 
                  href={video.youtubeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="sm" className="flex items-center gap-1.5 text-red-400 border-red-500/30 hover:bg-red-500/10">
                    <Youtube size={14} className="text-red-500" /> YouTube'da ko'rish
                    <ExternalLink size={12} />
                  </Button>
                </a>
              )}
              <Link to={`/content/${video.id.startsWith('yt_') ? 'item_1' : video.id}`}>
                <Button variant="secondary" size="sm">
                  Tafsilotlar
                </Button>
              </Link>

              {/* Multi-Language Localization Menu */}
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveMenuId(activeMenuId === video.id ? null : video.id)}
                  disabled={localizingId === video.id}
                  className="flex items-center gap-1.5 text-xs text-blue-400 border-blue-500/30 hover:bg-blue-500/10 cursor-pointer"
                  title="Videoni boshqa tillarga lokalizatsiya qilish (UZ / ES)"
                >
                  <Globe size={13} className={localizingId === video.id ? 'animate-spin' : ''} />
                  {localizingId === video.id ? 'Tarjima...' : 'Lokalizatsiya'}
                </Button>
                {activeMenuId === video.id && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-slate-900 border border-white/15 p-2 shadow-2xl z-30 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-2 py-1">
                      AI Lokalizatsiya Qilish:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleLocalize(video.id, 'uz')}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/10 text-white flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>🇺🇿 O'zbek tili</span>
                      <span className="text-[10px] text-gray-400">Sardor Neural</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLocalize(video.id, 'es')}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/10 text-white flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>🇪🇸 Ispan tili</span>
                      <span className="text-[10px] text-gray-400">Alvaro Neural</span>
                    </button>
                  </div>
                )}
              </div>

              {video.status === 'awaiting_approval' && !video.hasVideo && (
                <Link to={`/content/${video.id}?tab=tasdiqlash&autostart=true`}>
                  <Button variant="primary" size="sm" className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.4)] cursor-pointer">
                    <Sparkles size={13} /> 🎬 Video Generatsiya Qilish
                  </Button>
                </Link>
              )}
              {video.status === 'awaiting_approval' && video.hasVideo && (
                <Link to={`/content/${video.id}?tab=tasdiqlash`}>
                  <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.4)] cursor-pointer">
                    <CheckCircle2 size={13} /> 👁️ Ko'rish & Nashr Qilish
                  </Button>
                </Link>
              )}
              {video.status === 'scheduled' && (
                <Link to={`/content/${video.id}`}>
                  <Button variant="outline" size="sm" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20 bg-amber-500/10 flex items-center gap-1.5 text-xs font-semibold">
                    <Clock size={13} /> Rejani boshqarish
                  </Button>
                </Link>
              )}

            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
};

export default ContentListPage;
