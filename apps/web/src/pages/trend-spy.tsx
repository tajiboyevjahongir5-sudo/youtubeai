import React, { useState } from 'react';
import { PageHeader } from '../components/ui/page-header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Youtube, 
  RefreshCw, 
  ArrowRight, 
  Copy, 
  Check, 
  Eye, 
  Zap, 
  MessageSquare, 
  Vote, 
  ShieldCheck 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getWorkspaceId } from '../lib/workspace';
import { fetchApi } from '../lib/api';
import { useNavigate } from 'react-router';

export const TrendSpyPage = () => {
  const workspaceId = getWorkspaceId();
  const navigate = useNavigate();
  const [adoptingId, setAdoptingId] = useState<string | null>(null);
  const [copiedPollId, setCopiedPollId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // 1. Fetch Viral Trends
  const { data: trendsData, isLoading: isTrendsLoading, refetch: refetchTrends } = useQuery({
    queryKey: ['viral-trends', workspaceId],
    queryFn: async () => {
      try {
        const res = await fetchApi(`/workspaces/${workspaceId}/trends`, {}, async () => 'mock_token');
        return res?.trends || [];
      } catch (e) {
        return [];
      }
    },
    staleTime: 60000,
  });

  // 2. Fetch Community Polls
  const { data: pollsData, isLoading: isPollsLoading, refetch: refetchPolls } = useQuery({
    queryKey: ['community-polls', workspaceId],
    queryFn: async () => {
      try {
        const res = await fetchApi(`/workspaces/${workspaceId}/community/polls`, {}, async () => 'mock_token');
        return res?.polls || [];
      } catch (e) {
        return [];
      }
    },
    staleTime: 60000,
  });

  const handleAdoptTrend = async (trend: any) => {
    setAdoptingId(trend.id);
    try {
      const res = await fetchApi(`/workspaces/${workspaceId}/trends/adopt`, {
        method: 'POST',
        body: JSON.stringify({ title: trend.title })
      }, async () => 'mock_token');

      if (res?.item?.id) {
        setToast(`🎉 "${trend.title}" trendi asosida yangi video loyihasi yaratildi!`);
        setTimeout(() => {
          navigate(`/content/${res.item.id}`);
        }, 1200);
      }
    } catch (e: any) {
      setToast('❌ Xatolik yuz berdi: ' + (e?.message || 'Server xatosi'));
    } finally {
      setAdoptingId(null);
    }
  };

  const copyPollText = (poll: any) => {
    const formatted = `${poll.question}\n\n${poll.context}\n\nVariantlar:\n${poll.options.map((opt: string, i: number) => `${i + 1}. ${opt}`).join('\n')}\n\n#shorts #tech #ai #discussion`;
    navigator.clipboard.writeText(formatted);
    setCopiedPollId(poll.id);
    setTimeout(() => setCopiedPollId(null), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <PageHeader 
        title="AI Trend Ovchisi (Competitor Trend Spy)"
        description="YouTube'da ayni daqiqada eng ko'p ko'rilayotgan viral Shorts formulalari va Hamjamiyat so'rovnomalari."
        actions={
          <Button 
            variant="secondary" 
            onClick={() => { refetchTrends(); refetchPolls(); }}
            disabled={isTrendsLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw size={15} className={isTrendsLoading ? 'animate-spin text-red-400' : ''} />
            {isTrendsLoading ? 'Skanerlanmoqda...' : 'Trendlarni Yangilash'}
          </Button>
        }
      />

      {toast && (
        <div className="liquid-glass rounded-2xl p-4 border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 flex items-center gap-3 animate-fade-in text-sm font-semibold shadow-xl">
          <Check size={20} className="text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Strategic Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl liquid-glass border border-white/10 space-y-1">
          <span className="text-xs text-gray-400 font-semibold block">Skanerlash Radiusi:</span>
          <span className="text-base font-black text-white flex items-center gap-1.5">
            <Flame size={18} className="text-red-500 fill-red-500" /> So'nggi 7 Kunlik Shorts
          </span>
        </div>
        <div className="p-4 rounded-2xl liquid-glass border border-white/10 space-y-1">
          <span className="text-xs text-gray-400 font-semibold block">O'rtacha Viral CTR:</span>
          <span className="text-base font-black text-emerald-400">12.8% - 14.5%</span>
        </div>
        <div className="p-4 rounded-2xl liquid-glass border border-white/10 space-y-1">
          <span className="text-xs text-gray-400 font-semibold block">G'oya Generatori:</span>
          <span className="text-base font-black text-cyan-400 flex items-center gap-1.5">
            <Sparkles size={16} /> Gemini + Council 1
          </span>
        </div>
        <div className="p-4 rounded-2xl liquid-glass border border-white/10 space-y-1">
          <span className="text-xs text-gray-400 font-semibold block">Avtomatlashtirish:</span>
          <span className="text-base font-black text-amber-400">1-Klikda Loyiha</span>
        </div>
      </div>

      {/* SECTION 1: TRENDING COMPETITOR VIDEOS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-red-500" />
            Eng Yuqori Bosilish Ko'rsatkichiga Ega Viral Trendlar
          </h3>
          <span className="text-xs text-gray-400">Top 4 ta viral namuna</span>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {trendsData && trendsData.map((trend: any) => (
            <Card key={trend.id} className="liquid-glass border border-white/10 hover:border-red-500/40 transition-all group">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        Viral Score: {trend.viralScore}/100
                      </span>
                      <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                        <Eye size={12} /> {trend.viewsFormatted}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white group-hover:text-red-400 transition-colors pt-1">
                      {trend.title}
                    </h4>
                    <p className="text-xs text-gray-400">Muallif / Kanal: {trend.channelTitle}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hook Turi (Qarmoq):</span>
                    <span className="font-semibold text-cyan-400">{trend.hookPattern}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Kutilayotgan CTR:</span>
                    <span className="font-bold text-emerald-400">{trend.predictedCtr}</span>
                  </div>
                  <div className="pt-1.5 border-t border-white/5 text-[11px] text-gray-300">
                    <span className="text-amber-400 font-semibold block mb-0.5">Kanalimizga Moslash Rejasi:</span>
                    {trend.adaptationIdea}
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={() => handleAdoptTrend(trend)}
                  disabled={adoptingId === trend.id}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-lg text-xs font-bold py-2.5 cursor-pointer"
                >
                  <Zap size={14} className={adoptingId === trend.id ? 'animate-spin' : ''} />
                  {adoptingId === trend.id ? 'Loyiha Yaratilmoqda...' : 'Ushbu Trend Asosida Video Yaratish'}
                  <ArrowRight size={14} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* SECTION 2: YOUTUBE COMMUNITY POLLS GENERATOR */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Vote size={20} className="text-blue-400" />
              YouTube Hamjamiyat So'rovnomalari (Community Polls)
            </h3>
            <p className="text-xs text-gray-400">Videolar orasidagi kunlarda kanal reytingini va obunachilarni ushlab turuvchi so'rovnomalar</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {pollsData && pollsData.map((poll: any) => (
            <Card key={poll.id} className="liquid-glass border border-blue-500/25 space-y-3">
              <CardContent className="p-6 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      Kutilayotgan ovozlar: {poll.predictedVotes}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {poll.question}
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {poll.context}
                  </p>
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">So'rovnoma Variantlari:</span>
                    {poll.options.map((opt: string, oi: number) => (
                      <div key={oi} className="p-2 rounded-lg bg-white/[0.04] border border-white/5 text-xs text-gray-200 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {oi + 1}
                        </span>
                        <span className="truncate">{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="text-[11px] text-gray-400 flex justify-between">
                    <span>Tavsiya vaqti:</span>
                    <span className="text-amber-400 font-semibold">{poll.recommendedPostTime}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyPollText(poll)}
                    className="w-full py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-blue-500/30 transition-all cursor-pointer"
                  >
                    <Copy size={13} /> {copiedPollId === poll.id ? 'Nusxalandi!' : 'So\'rovnomani Nusxalash'}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendSpyPage;
