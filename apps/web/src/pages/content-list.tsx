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
  ExternalLink
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
    id: 'item_1',
    title: 'Top 5 AI Tools That Work While You Sleep in 2026',
    format: 'shorts',
    duration: '0:58',
    status: 'awaiting_approval',
    scheduledAt: 'Bugun, 14:00 UTC',
    contentPillar: "Ta'limiy",
    viewsPrediction: '15K - 35K',
    seoScore: 94,
    tags: ['ai tools', 'productivity', 'automation', 'chatgpt']
  },
  {
    id: 'item_2',
    title: 'The Complete Future of Autonomous Coding & Agents',
    format: 'long_form',
    duration: '8:42',
    status: 'scheduled',
    scheduledAt: 'Bugun, 21:00 UTC',
    contentPillar: 'Hujjatli',
    viewsPrediction: '8K - 18K',
    seoScore: 91,
    tags: ['software engineering', 'ai coding', 'future tech']
  },
  {
    id: 'item_3',
    title: 'Why 90% of Developers Will Use AI by 2027 #Shorts',
    format: 'shorts',
    duration: '0:45',
    status: 'published',
    scheduledAt: 'Kecha, 14:00 UTC',
    contentPillar: 'Yangiliklar',
    viewsPrediction: '45.2K ko\'rildi',
    seoScore: 96,
    tags: ['developers', 'trends', 'tech']
  },
  {
    id: 'item_4',
    title: 'Building a Full Stack SaaS with AI: Step by Step Guide',
    format: 'long_form',
    duration: '14:20',
    status: 'published',
    scheduledAt: '12 Oktabr 2026',
    contentPillar: "Qo'llanma",
    viewsPrediction: '12.4K ko\'rildi',
    seoScore: 89,
    tags: ['saas', 'startup', 'web development']
  },
  {
    id: 'item_5',
    title: '5 AI Websites That Feel Illegal to Know in 2026 #Shorts',
    format: 'shorts',
    duration: '0:52',
    status: 'awaiting_approval',
    scheduledAt: 'Ertaga, 14:00 UTC',
    contentPillar: "Ta'limiy",
    viewsPrediction: '40K - 120K',
    seoScore: 98,
    tags: ['ai websites', 'productivity', 'free tools', 'viral']
  },
  {
    id: 'item_6',
    title: 'The Death of Traditional Coding: Autonomous AI Agents Deep Dive',
    format: 'long_form',
    duration: '11:15',
    status: 'scheduled',
    scheduledAt: 'Ertaga, 21:00 UTC',
    contentPillar: 'Tahliliy',
    viewsPrediction: '25K - 60K',
    seoScore: 95,
    tags: ['ai agents', 'future of work', 'software engineering', 'anthropic']
  }
];

const ContentListPage = () => {
  const workspaceId = getWorkspaceId();
  const queryClient = useQueryClient();
  const [filterTab, setFilterTab] = useState<'all' | 'approval' | 'scheduled' | 'published'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchChannel(), refetchContent()]);
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
      let mappedStatus: 'awaiting_approval' | 'scheduled' | 'published' = 'awaiting_approval';
      if (item.status === 'scheduled' || item.status === 'approved') mappedStatus = 'scheduled';
      else if (item.status === 'published') mappedStatus = 'published';

      return {
        id: item.id || `item_${Math.random()}`,
        title: item.title,
        format: isShort ? 'shorts' : 'long_form',
        duration: isShort ? '0:58' : '10:15',
        status: mappedStatus,
        scheduledAt: item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Rejalashtirilgan',
        contentPillar: item.contentPillar === 'educational' ? "Ta'limiy" : (item.contentPillar === 'entertaining' ? 'Qiziqarli' : 'Tahliliy'),
        viewsPrediction: mappedStatus === 'published' ? '12.4K ko\'rildi' : '20K - 50K kutilmoqda',
        seoScore: 95,
        tags: ['ai', 'automation', 'productivity'],
      };
    });

    // Merge: Avoid duplicating title if real YouTube video already has it
    pipelineVideos.forEach(pv => {
      if (!allVideos.some(v => v.title.toLowerCase().includes(pv.title.toLowerCase().slice(0, 20)))) {
        allVideos.push(pv);
      }
    });
  }

  // If list is still minimal and channel is connected, supplement with fallback items
  if (isChannelConnected && allVideos.length < fallbackVideos.length) {
    fallbackVideos.forEach(fv => {
      if (!allVideos.some(v => v.title.toLowerCase() === fv.title.toLowerCase())) {
        allVideos.push(fv);
      }
    });
  }

  // Filter logic
  const filteredVideos = allVideos.filter(video => {
    if (filterTab === 'approval' && video.status !== 'awaiting_approval') return false;
    if (filterTab === 'scheduled' && video.status !== 'scheduled') return false;
    if (filterTab === 'published' && video.status !== 'published') return false;
    if (searchQuery && !video.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const countApproval = allVideos.filter(v => v.status === 'awaiting_approval').length;
  const countScheduled = allVideos.filter(v => v.status === 'scheduled').length;
  const countPublished = allVideos.filter(v => v.status === 'published').length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Kontent boshqaruvi" 
        description="Barcha video loyihalari, qoralamalar va YouTube'dagi jonli videolar."
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
            Nashr etilgan ({countPublished})
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
                  <StatusBadge status={video.status} />
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
              {video.status === 'awaiting_approval' && (
                <Link to={`/content/${video.id}`}>
                  <Button variant="primary" size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,0,0,0.4)]">
                    <CheckCircle2 size={13} /> Tasdiqlash
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
