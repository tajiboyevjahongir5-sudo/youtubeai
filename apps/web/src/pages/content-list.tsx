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
  Calendar
} from 'lucide-react';
import { useContentList } from '../lib/query';

const sampleVideos = [
  {
    id: 'item_1',
    title: 'Top 5 AI Tools That Work While You Sleep in 2026',
    format: 'shorts',
    duration: '0:58',
    status: 'awaiting_approval',
    scheduledAt: 'Bugun, 14:00 UTC',
    contentPillar: 'Ta\'limiy',
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
    contentPillar: 'Qo\'llanma',
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
    contentPillar: 'Ta\'limiy',
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
  const [filterTab, setFilterTab] = useState<'all' | 'approval' | 'scheduled' | 'published'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = sampleVideos.filter(video => {
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
        description="Barcha video loyihalari, qoralamalar va nashr etilgan videolar."
        actions={
          <div className="flex items-center gap-3">
            <Link to="/content/new">
              <Button variant="primary" className="flex items-center gap-2">
                <PlusCircle size={16} /> Yangi video yaratish
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 w-full sm:w-auto">
          <button 
            onClick={() => setFilterTab('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterTab === 'all' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Barchasi ({sampleVideos.length})
          </button>
          <button 
            onClick={() => setFilterTab('approval')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterTab === 'approval' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Tasdiqlash kutilmoqda (1)
          </button>
          <button 
            onClick={() => setFilterTab('scheduled')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterTab === 'scheduled' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Rejalashtirilgan (1)
          </button>
          <button 
            onClick={() => setFilterTab('published')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterTab === 'published' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Nashr etilgan (2)
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
      <div className="grid gap-4">
        {filteredVideos.map((video, index) => (
          <div 
            key={video.id}
            className="liquid-glass rounded-2xl p-5 border border-white/10 hover:border-red-500/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group animate-fade-in-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {/* Thumbnail + Details */}
            <div className="flex items-start gap-4">
              <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl bg-gradient-to-tr from-red-950/80 to-slate-900 border border-white/10 flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-102 transition-transform">
                <Play size={22} className="text-white fill-white/80" />
                <span className="absolute bottom-1 right-1 text-[9px] bg-black/85 text-white px-1.5 py-0.2 rounded font-mono font-bold">
                  {video.duration}
                </span>
                <div className="absolute top-1 left-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${video.format === 'shorts' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {video.format === 'shorts' ? 'Shorts' : '16:9'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={video.status} />
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} /> {video.scheduledAt}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    SEO {video.seoScore}%
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
              <Link to={`/content/${video.id}`}>
                <Button variant="secondary" size="sm">
                  Tafsilotlar
                </Button>
              </Link>
              {video.status === 'awaiting_approval' && (
                <Link to={`/content/${video.id}`}>
                  <Button variant="primary" size="sm">
                    Tasdiqlash
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentListPage;
