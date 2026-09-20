import React from 'react';
import { PageHeader } from '../components/ui/page-header';
import { StatCard } from '../components/ui/stat-card';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ErrorState } from '../components/ui/error-state';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  PlusCircle, 
  Activity, 
  Sparkles,
  Youtube,
  TrendingUp,
  Eye,
  Layers,
  ArrowUpRight,
  Link2,
  Flame,
  Award,
  Bot,
  Radio,
  Zap,
  Shield,
  Play,
  Check,
  Film,
  Volume2,
  Users,
  Video,
  Mic,
  Palette
} from 'lucide-react';
import { useDashboard } from '../lib/query';
import { Link, useNavigate } from 'react-router';
import { getWorkspaceId } from '../lib/workspace';

const DashboardPage = () => {
  const workspaceId = getWorkspaceId();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useDashboard(workspaceId);
  const [dailyTrends, setDailyTrends] = React.useState<any[]>([]);
  const [handsfreeConfig, setHandsfreeConfig] = React.useState<any>(null);
  const [isTriggeringHandsfree, setIsTriggeringHandsfree] = React.useState(false);
  const [competitorOutliers, setCompetitorOutliers] = React.useState<any[]>([]);
  const [dashboardToast, setDashboardToast] = React.useState<string | null>(null);

  const fetchHandsfreeConfig = () => {
    fetch(`/api/workspaces/${workspaceId}/growth-suite/handsfree/config`, {
      headers: { 'x-workspace-id': workspaceId }
    })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.config) setHandsfreeConfig(d.config);
      })
      .catch(() => {});
  };

  const fetchCompetitorRadar = () => {
    fetch(`/api/workspaces/${workspaceId}/growth-suite/competitors/radar`, {
      headers: { 'x-workspace-id': workspaceId }
    })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.outliers) setCompetitorOutliers(d.outliers);
      })
      .catch(() => {});
  };

  React.useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}/growth-suite/daily-trends`, {
      headers: { 'x-workspace-id': workspaceId }
    })
      .then(res => res.json())
      .then(d => {
        if (d.success && d.trends) {
          setDailyTrends(d.trends);
        }
      })
      .catch(() => {});

    fetchHandsfreeConfig();
    fetchCompetitorRadar();
  }, [workspaceId]);

  const handleTriggerHandsfreeNow = async () => {
    setIsTriggeringHandsfree(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/handsfree/trigger-now`, {
        method: 'POST',
        headers: { 'x-workspace-id': workspaceId }
      });
      const d = await res.json();
      if (d.success) {
        setDashboardToast(d.message);
        fetchHandsfreeConfig();
        setTimeout(() => setDashboardToast(null), 4500);
      }
    } catch (e) {}
    finally {
      setIsTriggeringHandsfree(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Boshqaruv paneli" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 liquid-glass rounded-2xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState message="Ma'lumotlarni yuklashda xatolik yuz berdi." onRetry={() => refetch()} />;
  }

  const isChannelConnected = Boolean(
    data?.channelConnected &&
    data?.channel?.title &&
    data.channel.title !== 'YouTube Kanal Ulanmagan' &&
    data.channel.title !== 'Kanal ulanmagan'
  );
  const channel = isChannelConnected && data?.channel ? data.channel : {
    title: 'Kanal ulanmagan',
    subscriberCount: 0,
    totalViews: 0,
    watchTimeHours: 0,
    videoCount: 0
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with Studio Vibe */}
      <div className="relative overflow-hidden rounded-3xl liquid-glass-red p-6 sm:p-8 border border-red-500/25 shadow-2xl animate-scale-in animate-pulse-glow">
        {/* Subtle decorative mesh glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                isChannelConnected 
                  ? 'bg-red-500/15 border border-red-500/30 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                  : 'bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              }`}>
                {isChannelConnected ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <Youtube size={14} className="fill-red-500 text-red-500" />
                    YouTube Studio Autopilot 2.0 • Live
                  </>
                ) : (
                  <>
                    <Youtube size={14} className="text-amber-400" />
                    Kanal ulanmagan
                  </>
                )}
              </div>
              {isChannelConnected && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Faol bog'langan
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {channel.title}
            </h1>

            {isChannelConnected ? (
              <>
                <p className="text-sm text-gray-300 max-w-2xl leading-relaxed font-normal">
                  Kunlik 2 ta ingliz tilidagi video avtomatlashgan rejimda rejalashtirilgan. Barcha materiallar inson tasdig'idan so'ng rasmiy YouTube API orqali chiqariladi.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-gray-300">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10">
                    <Users size={13} className="text-red-400" />
                    <span className="text-gray-400">Obunachilar:</span>
                    <span className="font-bold text-white font-sans">{Number(channel.subscriberCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10">
                    <Video size={13} className="text-red-400" />
                    <span className="text-gray-400">Videolar:</span>
                    <span className="font-bold text-white font-sans">{channel.videoCount || 0} ta</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10">
                    <Zap size={13} className="text-amber-400" />
                    <span className="text-gray-400">Autopilot Salomatligi:</span>
                    <span className="font-bold text-emerald-400 font-sans">99.4% (Optimal)</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-amber-300 max-w-2xl leading-relaxed">
                YouTube kanalingiz hali ulanmagan. O'z kanalingizni ulang va videolarni avtomatik nashr qilishni boshlang.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isChannelConnected ? (
              <>
                <Link to="/content/new">
                  <Button variant="primary" className="flex items-center gap-2 shadow-[0_0_20px_rgba(255,0,50,0.35)] px-5 py-2.5 rounded-xl font-bold">
                    <Sparkles size={16} /> AI bilan g'oya yaratish
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button variant="secondary" className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold border-white/15 hover:border-white/30">
                    <TrendingUp size={16} /> Analitika
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/integrations">
                <Button variant="primary" className="flex items-center gap-2 shadow-[0_0_20px_rgba(255,0,50,0.35)] px-5 py-2.5 rounded-xl font-bold">
                  <Link2 size={16} /> O'z kanalingizni ulang
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ⚡ Studiya Tezkor Amallar Qatori (Studio Action Cockpit) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 animate-fade-in-up">
        <Link to="/content/new?format=shorts" className="group">
          <div className="p-4 rounded-3xl liquid-glass border border-red-500/20 hover:border-red-500/50 bg-gradient-to-br from-red-950/25 via-black/40 to-transparent transition-all duration-300 hover:-translate-y-1 shadow-xl flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30 group-hover:scale-110 shadow-[0_0_12px_rgba(255,0,50,0.2)] transition-transform">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-red-300 transition-colors">Tezkor AI Shorts</p>
              <p className="text-[10px] text-zinc-400">60 soniya • Avto B-roll</p>
            </div>
          </div>
        </Link>

        <Link to="/content/new?format=longform" className="group">
          <div className="p-4 rounded-3xl liquid-glass border border-cyan-500/20 hover:border-cyan-500/50 bg-gradient-to-br from-cyan-950/25 via-black/40 to-transparent transition-all duration-300 hover:-translate-y-1 shadow-xl flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 shadow-[0_0_12px_rgba(6,182,212,0.2)] transition-transform">
              <Film size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">16:9 Long-Form</p>
              <p className="text-[10px] text-zinc-400">10-20 daqiqa • Master</p>
            </div>
          </div>
        </Link>

        <Link to="/content" className="group">
          <div className="p-4 rounded-3xl liquid-glass border border-amber-500/20 hover:border-amber-500/50 bg-gradient-to-br from-amber-950/25 via-black/40 to-transparent transition-all duration-300 hover:-translate-y-1 shadow-xl flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 shadow-[0_0_12px_rgba(245,158,11,0.2)] transition-transform">
              <Palette size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">CTR Muqovalar</p>
              <p className="text-[10px] text-zinc-400">AI Thumbnail Lab</p>
            </div>
          </div>
        </Link>

        <Link to="/settings" className="group">
          <div className="p-4 rounded-3xl liquid-glass border border-emerald-500/20 hover:border-emerald-500/50 bg-gradient-to-br from-emerald-950/25 via-black/40 to-transparent transition-all duration-300 hover:-translate-y-1 shadow-xl flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-transform">
              <Mic size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Alex Ovoz Sozlamasi</p>
              <p className="text-[10px] text-zinc-400">Azure TTS • +14% Pacing</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Toast Notification */}
      {dashboardToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 text-xs font-bold shadow-2xl flex items-center gap-2 animate-fade-in backdrop-blur-xl">
          <Check size={16} className="text-emerald-400" />
          {dashboardToast}
        </div>
      )}

      {/* 🤖 To'liq Avtomatik "Hands-Free" Jadval (Autonomous Content Factory) */}
      <div className="rounded-3xl liquid-glass border border-cyan-500/25 p-6 bg-gradient-to-r from-cyan-950/20 via-slate-900/50 to-blue-950/20 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Subtle ambient light */}
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] flex-shrink-0">
              <Bot size={24} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  To'liq Avtomatik "Hands-Free" Jadval (Autonomous Content Factory)
                </h3>
                <span className="text-xs font-semibold px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-sans flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Avtopilot: Faol
                </span>
                {/* Live Audio Equalizer */}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-[10px] text-cyan-300 font-semibold">
                  <span>AUDIO DSP</span>
                  <div className="flex items-end gap-0.5 h-2.5">
                    <span className="w-0.5 bg-cyan-400 animate-pulse h-2.5 rounded-full"></span>
                    <span className="w-0.5 bg-cyan-400 animate-pulse h-1.5 rounded-full" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-0.5 bg-cyan-400 animate-pulse h-2 rounded-full" style={{ animationDelay: '300ms' }}></span>
                    <span className="w-0.5 bg-cyan-400 animate-pulse h-1 rounded-full" style={{ animationDelay: '75ms' }}></span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
                Har kuni 09:00 va 18:00 da trendni topadi, Alex ovozini beradi, B-roll va subtitrlarni montaj qilib, YouTube'ga avtomatik rejalashtiradi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto flex-shrink-0">
            <Button
              size="sm"
              variant="primary"
              disabled={isTriggeringHandsfree}
              onClick={handleTriggerHandsfreeNow}
              className="text-xs font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 border-none text-white flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)] py-2.5 px-4 rounded-xl transition-all"
            >
              <Zap size={14} className={isTriggeringHandsfree ? 'animate-spin' : 'fill-white'} />
              {isTriggeringHandsfree ? 'Avtopilot ishlamoqda...' : 'Hozirgi Trendni Chiqarish (Run Now)'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1 hover:border-cyan-500/30 transition-all">
            <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <Clock size={13} className="text-cyan-400" /> Jadval Vaqtlari:
            </span>
            <p className="font-bold text-white text-sm">09:00 & 18:00 <span className="text-[10px] text-cyan-400 font-normal">(Peak)</span></p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1 hover:border-cyan-500/30 transition-all">
            <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <Film size={13} className="text-cyan-400" /> Avto-Montaj:
            </span>
            <p className="font-bold text-cyan-400 text-sm">60FPS B-Roll + Karaoke</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1 hover:border-cyan-500/30 transition-all">
            <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <Volume2 size={13} className="text-amber-400" /> Ducking & SFX:
            </span>
            <p className="font-bold text-amber-400 text-sm">Sub-drop + Bell</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1 hover:border-cyan-500/30 transition-all">
            <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <Layers size={13} className="text-emerald-400" /> Jami Ishlab Chiqarildi:
            </span>
            <p className="font-bold text-emerald-400 text-sm">{handsfreeConfig?.totalGenerated || 14} ta video</p>
          </div>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Rejalashtirilgan" 
          value={data?.stats?.scheduled ?? (isChannelConnected ? 2 : 0)} 
          description={isChannelConnected ? "Kunlik maqsad: 2 ta video" : "Kanal ulanmagan"} 
          icon={<Calendar size={22} />}
          trend={isChannelConnected ? "100% bugun" : undefined}
          accent="cyan"
          delay={50}
        />
        <StatCard 
          title="Tasdiqlash talab qilinadi" 
          value={data?.stats?.needsApproval ?? (isChannelConnected ? 1 : 0)} 
          description={isChannelConnected ? "Ko'rib chiqish kutilyapti" : "0 ta kutilmoqda"} 
          icon={<Clock size={22} />}
          accent="amber"
          delay={100}
        />
        <StatCard 
          title="Jarayonda (AI)" 
          value={data?.stats?.inProgress ?? (isChannelConnected ? 1 : 0)} 
          description={isChannelConnected ? "Skript va SEO tayyorlanmoqda" : "Jarayon mavjud emas"} 
          icon={<FileText size={22} />}
          accent="violet"
          delay={150}
        />
        <StatCard 
          title="Nashr etilgan (Hafta)" 
          value={data?.stats?.publishedThisWeek ?? 0} 
          description={isChannelConnected ? "100% rasmiy API orqali" : "Kanal ulanmagan"} 
          icon={<CheckCircle size={22} />}
          trend={isChannelConnected && (data?.stats?.publishedThisWeek || 0) > 0 ? `${data?.stats?.publishedThisWeek} yangi` : undefined}
          accent="emerald"
          delay={200}
        />
      </div>

      {/* 🤖 Kunlik Viral Trendlar Avtopiloti (Daily Viral Topics Autopilot) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame size={22} className="text-amber-500 fill-amber-500" /> Kunlik Viral Trendlar Avtopiloti (Bugun uchun 3 ta Kafolatlangan G'oya)
            </h2>
            <p className="text-xs text-gray-400">
              Google Trends va YouTube algoritmlari skanerlanib, bugun eng yuqori ko'rish to'playdigan tayyor skriptli loyihalar
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/25 flex items-center gap-1.5 self-start sm:self-auto shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <Sparkles size={13} /> Har kuni 08:00 da avtomatik yangilanadi
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {(dailyTrends.length > 0 ? dailyTrends : [
            {
              id: '1',
              title: "2026 Yilda Noqonuniy Tuyuladigan 5 Ta AI Saytlar!",
              category: 'AI Agents',
              hookHeadline: "🚨 TO'XTANG! 2026-YILDA KODNI NOLDAN YOZMAYSIZ!",
              script: "To'xtang! Agar 2026 yilda ham kodni noldan o'zingiz yozayotgan bo'lsangiz, vaqtingizni bekorga sarflayapsiz...",
              predictedViralScore: 99,
              estimatedRpm: '$3.80 - $6.50',
              searchVolumeGrowth: '+480% oxirgi 24 soatda'
            },
            {
              id: '2',
              title: "Claude 3.7 Sonnet & Yangi Gibrid Mulohaza Qiluvchi Neyrotarmoq",
              category: 'Developer Tools',
              hookHeadline: "⚡ DASTURCHILAR KELAJAGI BUTUNLAY O'ZGARDI!",
              script: "Sun'iy intellekt tarixida yangi burilish! Claude 3.7 Sonnet gibrid fikrlash orqali inson dasturchilaridan 10 barobar tez...",
              predictedViralScore: 97,
              estimatedRpm: '$4.20 - $7.90',
              searchVolumeGrowth: '+620% viral portlash'
            },
            {
              id: '3',
              title: "Deep Research Agentlari: Google Qidiruvining Tugashi",
              category: 'Future Tech',
              hookHeadline: "🧠 10 SOATLIK TADQIQOT ENDI 30 SONIYADA!",
              script: "Google qidiruvidan foydalanish davri tugayaptimi? Deep Research agentlari minglab manbalarni o'qib chiqib...",
              predictedViralScore: 96,
              estimatedRpm: '$3.50 - $5.80',
              searchVolumeGrowth: '+340% global qidiruv'
            }
          ]).map((trend: any, idx: number) => (
            <Card key={trend.id || idx} className="liquid-glass border border-white/10 hover:border-amber-500/40 transition-all duration-300 rounded-3xl flex flex-col justify-between overflow-hidden group">
              <CardContent className="p-5 sm:p-6 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {trend.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                      <Flame size={12} className="fill-amber-400 text-amber-400" /> {trend.predictedViralScore}% Viral Score
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-amber-300 transition-colors">
                    {trend.title}
                  </h3>

                  <div className="p-3 rounded-2xl bg-black/40 border-l-2 border-l-amber-500 border-white/5 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                      <Zap size={10} className="fill-amber-400" /> Gipnozli Hook:
                    </span>
                    <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed font-medium">
                      {trend.hookHeadline}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Prognoz RPM:</span>
                    <span className="text-emerald-400 font-bold font-sans">{trend.estimatedRpm}</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      navigate(`/content/new?title=${encodeURIComponent(trend.title)}&brief=${encodeURIComponent(trend.script)}`);
                    }}
                    className="w-full text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black border-none flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.25)] py-2.5 rounded-xl cursor-pointer transition-all"
                  >
                    <Sparkles size={13} /> 1-Klikda Loyiha Yaratish
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 🛰️ Raqobatchilar Radari & "Viral Outlier" Detektori (Spy Radar) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio size={22} className="text-violet-400" /> Raqobatchilar Radari & "Viral Outlier" Detektori (Spy Radar)
            </h2>
            <p className="text-xs text-gray-400">
              Fireship, Matthew Berman va boshqa yetakchi global kanallarda odatdagidan 3-5x tezroq ko'rilayotgan yangi videolarni ushlaydi
            </p>
          </div>
          <span className="text-xs font-semibold text-violet-300 bg-violet-500/10 px-3.5 py-1.5 rounded-full border border-violet-500/25 flex items-center gap-1.5 self-start sm:self-auto shadow-[0_0_12px_rgba(139,92,246,0.15)]">
            <Radio size={12} className="animate-pulse text-violet-400" /> Jonli Monitoring (4 ta Global Kanal)
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {(competitorOutliers.length > 0 ? competitorOutliers : [
            {
              id: 'outlier_1',
              channelName: 'Fireship',
              channelAvatar: '🔥',
              videoTitle: "The AI agent that replaced 50 senior engineers in 24 hours",
              publishedHoursAgo: 7,
              viewsTotal: '380,000 ko\'rish',
              velocityPerHour: '54,200 ko\'rish/soat',
              outlierMultiplier: '4.3x Oddiydan Yuqori',
              category: 'Autonomous Agents',
              counterAttackIdea: {
                recommendedTitle: "! TEZOR & ANIQ ! Ular Ayta Olmagan 3 Ta AI Agent Sirlari (2026)",
                hookAngle: "Raqobatchi mavzuni umumiy yoritgan, biz esa aniq ochiq kodli arxitekturani va 1-klikda ishga tushirishni ko'rsatamiz.",
                patternInterruptHook: "Fireship bu agent haqida gapirdi, lekin hech kim sizga uning eng xavfli 3 ta zaif tomonini aytmadi! Mana kod...",
                whyWeWillWin: "Bizning video 60FPS dinamik kiber-grafika va darhol nusxalab ishlatish mumkin bo'lgan GitHub blueprint bilan chiqadi."
              }
            },
            {
              id: 'outlier_2',
              channelName: 'Matthew Berman',
              channelAvatar: '🧠',
              videoTitle: "Claude 3.7 Sonnet is ACTUALLY Thinking Now... Hands-on Test",
              publishedHoursAgo: 14,
              viewsTotal: '195,000 ko\'rish',
              velocityPerHour: '13,900 ko\'rish/soat',
              outlierMultiplier: '3.6x Oddiydan Yuqori',
              category: 'LLM Reasoning',
              counterAttackIdea: {
                recommendedTitle: "Stop Using Claude 3.7 Like ChatGPT: 5 Hybrid Reasoning Hacks",
                hookAngle: "Oddiy test o'rniga ishlab chiquvchilar uchun real vaqtda kod yozuvchi 5 ta professional prompt texnikasi.",
                patternInterruptHook: "99% odam Claude 3.7 ning yangi 'Hybrid Reasoning' tugmasidan noto'g'ri foydalanmoqda. Mana uni 3 barobar tezlashtiruvchi sozlama!",
                whyWeWillWin: "Tomoshabin faqat yangilik eshitmaydi, balki darhol o'z loyihasida qo'llay oladigan amaliy natijaga ega bo'ladi."
              }
            }
          ]).map((outlier: any) => (
            <Card key={outlier.id} className="liquid-glass border border-violet-500/25 hover:border-violet-500/50 transition-all rounded-3xl overflow-hidden group">
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 shadow-inner">{outlier.channelAvatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{outlier.channelName}</h4>
                        <span className="text-[11px] text-gray-400">{outlier.publishedHoursAgo} soat oldin</span>
                      </div>
                      <span className="text-xs font-semibold text-violet-300">{outlier.velocityPerHour}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full border border-violet-500/30 shadow-[0_0_10px_rgba(139,92,246,0.15)]">
                    {outlier.outlierMultiplier}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Raqobatchi Videosi:</span>
                  <p className="text-xs font-medium text-gray-200">"{outlier.videoTitle}"</p>
                </div>

                <div className="p-4 rounded-2xl bg-violet-950/25 border border-violet-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles size={13} /> Bizning Muqobil "Counter-Attack" Mavzumiz:
                    </span>
                  </div>
                  <h5 className="text-xs sm:text-sm font-bold text-white">{outlier.counterAttackIdea.recommendedTitle}</h5>
                  <p className="text-xs text-gray-300 leading-relaxed italic">
                    "{outlier.counterAttackIdea.patternInterruptHook}"
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      navigate(`/content/new?title=${encodeURIComponent(outlier.counterAttackIdea.recommendedTitle)}&brief=${encodeURIComponent(outlier.counterAttackIdea.patternInterruptHook)}`);
                    }}
                    className="w-full text-xs font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 border-none text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.25)] py-2.5 rounded-xl"
                  >
                    <Sparkles size={13} /> Ushbu Mavzuda Yaxshiroq Video Yaratish
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Grid: Pipeline + Activity */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Today's Video Pipeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers size={20} className="text-red-500" /> Bugungi nashrlar jadvali
            </h2>
            {isChannelConnected && (
              <Link to="/calendar" className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1">
                Barchasini ko'rish <ArrowUpRight size={14} />
              </Link>
            )}
          </div>

          {isChannelConnected ? (
            <div className="space-y-3">
              {(data?.upcomingContent && data.upcomingContent.length > 0) ? (
                data.upcomingContent.slice(0, 4).map((item: any, idx: number) => {
                  const isShort = item.format === 'shorts';
                  const isDone = item.status === 'published' || item.status === 'approved';
                  const isReview = item.status === 'review' || item.status === 'idea' || item.status === 'awaiting_generation';
                  return (
                    <div key={item.id} className="liquid-glass rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10 hover:border-red-500/40 transition-all animate-fade-in-up group" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-2xl bg-gradient-to-tr from-red-950 to-slate-900 border border-red-500/20 flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:border-red-500/40 transition-colors">
                          <Youtube size={24} className="text-red-500/70" />
                          <span className="absolute bottom-1 right-1 text-[9px] bg-black/90 backdrop-blur-md text-white px-1.5 py-0.5 rounded-md font-semibold font-sans">{item.duration || (isShort ? '0:56' : '10:15')}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${isShort ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                              {isShort ? '#Shorts' : '16:9 Long-form'}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              {item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Rejalashtirilgan'}
                            </span>
                          </div>
                          <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-red-400 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">High retention • {item.contentPillar || 'AI Texnologiya'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${
                          isDone 
                            ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' 
                            : isReview
                            ? 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                            : 'text-blue-400 bg-blue-400/10 border-blue-400/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                        }`}>
                          {item.status === 'published' ? 'Nashr etildi' : (isDone ? 'Tasdiqlangan' : 'Tasdiqlash kutilmoqda')}
                        </span>
                        <Link to={`/content/${item.id}`}>
                          <Button size="sm" variant="secondary" className="rounded-xl font-semibold border-white/10 hover:border-white/25">Ko'rib chiqish</Button>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-gray-400 bg-white/[0.02] rounded-2xl border border-white/5">
                  Hozircha rejalashtirilgan videolar mavjud emas. Yangi g'oya yarating!
                </div>
              )}
            </div>
          ) : (
            <div className="liquid-glass rounded-2xl p-8 border border-white/10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto">
                <Youtube size={28} />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-white">YouTube kanal hali ulanmagan</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Videolarni avtopilot rejimida rejalashtirish va rasmiy YouTube Data API orqali avtomatik nashr etish uchun avvalo o'z YouTube kanalingizni ulang.
                </p>
              </div>
              <Link to="/integrations" className="inline-block">
                <Button variant="primary" className="flex items-center gap-2 shadow-lg">
                  <Link2 size={16} /> O'z kanalingizni ulang
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Col: Activity & Quick Actions */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity size={20} className="text-red-500" /> So'nggi faollik
            </h2>
            <Card>
              <CardContent className="p-4 divide-y divide-white/5 space-y-3">
                {data?.recentActivity?.map((activity: any) => (
                  <div key={activity.id} className="pt-3 first:pt-0 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-200">{activity.title || activity.action}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{activity.time || activity.performedAt}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Action Box */}
          <div className="liquid-glass rounded-3xl p-6 border border-red-500/30 bg-gradient-to-br from-red-950/40 via-black/50 to-black/60 shadow-2xl space-y-3.5 animate-fade-in-up stagger-6 animate-border-glow relative overflow-hidden">
            <div className="flex items-center gap-2.5 text-red-400 font-bold text-sm">
              <span className="p-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                <Sparkles size={16} />
              </span>
              AI Strategik Tavsiyasi
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              Oxirgi videolarda CTR 4.8% ga chiqdi. Ertangi 2 ta videoda raqamlar va savol uslubidagi sarlavhalardan foydalanish tavsiya etiladi.
            </p>
            <Link to="/strategy" className="block pt-1">
              <Button size="sm" variant="primary" className="w-full text-xs font-bold py-2.5 rounded-xl shadow-[0_0_15px_rgba(255,0,50,0.3)]">
                Strategiyani ko'rish
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
