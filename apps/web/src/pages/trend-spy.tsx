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

  // 3. Competitor Channels & Outliers
  const [newCompHandle, setNewCompHandle] = useState('');
  const [isAddingComp, setIsAddingComp] = useState(false);

  const { data: competitorsData, refetch: refetchCompetitors } = useQuery({
    queryKey: ['competitors', workspaceId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/competitors`, {
          headers: { 'x-workspace-id': workspaceId }
        });
        const data = await res.json();
        return data.competitors || [];
      } catch (e) { return []; }
    }
  });

  const { data: outliersData, refetch: refetchOutliers } = useQuery({
    queryKey: ['competitor-outliers', workspaceId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/competitors/outliers`, {
          headers: { 'x-workspace-id': workspaceId }
        });
        const data = await res.json();
        return data.outliers || [];
      } catch (e) { return []; }
    }
  });

  const competitorsList = competitorsData || [];
  const outliersList = outliersData || [];

  const handleAddCompetitor = async () => {
    if (!newCompHandle.trim()) return;
    setIsAddingComp(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/competitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId },
        body: JSON.stringify({ handle: newCompHandle.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setNewCompHandle('');
        refetchCompetitors();
        refetchOutliers();
        setToast(`✅ ${newCompHandle} muvaffaqiyatli kuzatuvga qo'shildi!`);
        setTimeout(() => setToast(null), 3000);
      }
    } catch (e) {}
    finally { setIsAddingComp(false); }
  };

  const handleRemoveCompetitor = async (handle: string) => {
    try {
      await fetch(`/api/workspaces/${workspaceId}/growth-suite/competitors/${encodeURIComponent(handle)}`, {
        method: 'DELETE',
        headers: { 'x-workspace-id': workspaceId }
      });
      refetchCompetitors();
      refetchOutliers();
    } catch (e) {}
  };

  const handleAdaptCompetitorVideo = async (videoId: string) => {
    setAdoptingId(videoId);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/competitors/adapt/${videoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId }
      });
      const data = await res.json();
      if (data.success && data.newItem) {
        setToast(`🎉 "${data.newItem.title.slice(0, 35)}..." loyihasi shakllantirildi!`);
        setTimeout(() => {
          navigate(`/content/${data.newItem.id}`);
        }, 1200);
      }
    } catch (e) {
      setToast('❌ Adaptatsiya qilishda xatolik yuz berdi');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setAdoptingId(null);
    }
  };

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

      {/* SECTION 0: RAQOBATCHILAR KANALLARI & OUTLIER SPY */}
      <div className="space-y-4 p-5 rounded-3xl bg-gradient-to-br from-[#121424] to-[#0d101c] border border-cyan-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🕵️‍♂️</span>
              <h3 className="text-lg font-bold text-white">Raqobatchilar Ayg'oqchisi (Outlier Benchmarking)</h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Ethical Steal Engine
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Raqobatchilar kanallaridagi odatiy ko'rishlardan 3x-5x yuqori natija ko'rsatgan "Outlier" videolarni topish va o'zimizga moslash
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Masalan: @Fireship"
              value={newCompHandle}
              onChange={(e) => setNewCompHandle(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/60"
            />
            <Button
              size="sm"
              variant="primary"
              disabled={isAddingComp || !newCompHandle.trim()}
              onClick={handleAddCompetitor}
              className="text-xs whitespace-nowrap bg-cyan-600 hover:bg-cyan-500 cursor-pointer"
            >
              + Kanal Qo'shish
            </Button>
          </div>
        </div>

        {/* Tracked Channels Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs text-gray-400 self-center font-medium">Kuzatilayotgan kanallar:</span>
          {competitorsList.map((comp: any) => (
            <div
              key={comp.handle}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2 text-xs text-gray-200"
            >
              <Youtube size={14} className="text-red-500" />
              <strong className="text-white">{comp.title || comp.handle}</strong>
              <span className="text-[10px] font-mono text-cyan-400">({comp.subscribers})</span>
              <button
                type="button"
                onClick={() => handleRemoveCompetitor(comp.handle)}
                className="text-gray-400 hover:text-red-400 ml-1 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Outlier Viral Videos Grid */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
            🔥 Raqobatchilarning Eng Portlovchi (Outlier) Videolari:
          </span>
          <div className="grid md:grid-cols-2 gap-4">
            {outliersList.map((outlier: any) => (
              <div
                key={outlier.id}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3 shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                      <Youtube size={13} className="text-red-500" /> {outlier.channelTitle}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ⚡ {outlier.outlierScore}x Outlier ({outlier.viewsFormatted} ko'rish)
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    "{outlier.title}"
                  </h4>
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-cyan-400 block">Viral Formulaning Siri:</span>
                    <p className="text-gray-300 italic">{outlier.hookFormula}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    <strong className="text-gray-300">Tavsiya qilingan adaptatsiya:</strong> {outlier.suggestedAdaptation}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  disabled={adoptingId === outlier.id}
                  onClick={() => handleAdaptCompetitorVideo(outlier.id)}
                  className="w-full text-xs font-bold bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
                >
                  <Sparkles size={13} className={adoptingId === outlier.id ? 'animate-spin' : ''} />
                  {adoptingId === outlier.id ? 'Loyiha Yaratilmoqda...' : '🎯 Ushbu Mavzuni Bizga Moslab Yaratish'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
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
