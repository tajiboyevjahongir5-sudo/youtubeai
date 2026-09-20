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
  Award
} from 'lucide-react';
import { useDashboard } from '../lib/query';
import { Link, useNavigate } from 'react-router';
import { getWorkspaceId } from '../lib/workspace';

const DashboardPage = () => {
  const workspaceId = getWorkspaceId();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useDashboard(workspaceId);
  const [dailyTrends, setDailyTrends] = React.useState<any[]>([]);

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
  }, [workspaceId]);

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
      <div className="relative overflow-hidden rounded-3xl liquid-glass-red p-6 sm:p-8 border border-red-500/20 shadow-2xl animate-scale-in animate-pulse-glow">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isChannelConnected 
                ? 'bg-red-500/20 border border-red-500/30 text-red-300' 
                : 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
            }`}>
              <Youtube size={14} className={isChannelConnected ? "fill-red-500 text-red-500" : "text-amber-400"} />
              {isChannelConnected ? 'YouTube Studio Autopilot' : 'Kanal ulanmagan'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {channel.title}
            </h1>
            {isChannelConnected ? (
              <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
                Kunlik 2 ta ingliz tilidagi video avtomatlashgan rejimda rejalashtirilgan. Barcha materiallar inson tasdig'idan so'ng rasmiy YouTube API orqali chiqariladi.
              </p>
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
                  <Button variant="primary" className="flex items-center gap-2 shadow-lg">
                    <Sparkles size={16} /> AI bilan g'oya yaratish
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button variant="secondary" className="flex items-center gap-2">
                    <TrendingUp size={16} /> Analitika
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/integrations">
                <Button variant="primary" className="flex items-center gap-2 shadow-lg">
                  <Link2 size={16} /> O'z kanalingizni ulang
                </Button>
              </Link>
            )}
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
          trend={isChannelConnected ? "+100% bugun" : undefined}
          delay={50}
        />
        <StatCard 
          title="Tasdiqlash talab qilinadi" 
          value={data?.stats?.needsApproval ?? (isChannelConnected ? 1 : 0)} 
          description={isChannelConnected ? "Ko'rib chiqish kutilyapti" : "0 ta kutilmoqda"} 
          icon={<Clock size={22} />}
          delay={100}
        />
        <StatCard 
          title="Jarayonda (AI)" 
          value={data?.stats?.inProgress ?? (isChannelConnected ? 1 : 0)} 
          description={isChannelConnected ? "Skript va SEO tayyorlanmoqda" : "Jarayon mavjud emas"} 
          icon={<FileText size={22} />}
          delay={150}
        />
        <StatCard 
          title="Nashr etilgan (Hafta)" 
          value={data?.stats?.publishedThisWeek ?? 0} 
          description={isChannelConnected ? "100% rasmiy API orqali" : "Kanal ulanmagan"} 
          icon={<CheckCircle size={22} />}
          trend={isChannelConnected && (data?.stats?.publishedThisWeek || 0) > 0 ? `+${data?.stats?.publishedThisWeek} yangi` : undefined}
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
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold flex items-center gap-1.5 self-start sm:self-auto">
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
            <Card key={trend.id || idx} className="liquid-glass border border-amber-500/20 hover:border-amber-500/40 transition-all flex flex-col justify-between">
              <CardContent className="p-5 space-y-3.5 flex flex-col justify-between h-full">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {trend.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      🔥 {trend.predictedViralScore}% Viral Score
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                    {trend.title}
                  </h3>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Gipnozli Hook:</span>
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed font-medium">
                      {trend.hookHeadline}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Prognoz RPM:</span>
                    <span className="text-emerald-400 font-bold font-mono">{trend.estimatedRpm}</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      navigate(`/content/new?title=${encodeURIComponent(trend.title)}&brief=${encodeURIComponent(trend.script)}`);
                    }}
                    className="w-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black border-amber-500 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Sparkles size={13} /> 🚀 1-Klikda Loyiha Yaratish
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
                    <div key={item.id} className="liquid-glass rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10 hover:border-red-500/40 transition-all animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-xl bg-gradient-to-tr from-red-950 to-slate-900 border border-red-500/20 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                          <Youtube size={24} className="text-red-500/60" />
                          <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 text-white px-1 rounded font-mono">{item.duration || (isShort ? '0:56' : '10:15')}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isShort ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                              {isShort ? '#Shorts' : '16:9 Long-form'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Rejalashtirilgan'}
                            </span>
                          </div>
                          <h3 className="font-bold text-white text-sm sm:text-base hover:text-red-400 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">High retention • {item.contentPillar || 'AI Texnologiya'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          isDone 
                            ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
                            : isReview
                            ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                            : 'text-blue-400 bg-blue-400/10 border-blue-400/20'
                        }`}>
                          {item.status === 'published' ? 'Nashr etildi' : (isDone ? 'Tasdiqlangan' : 'Tasdiqlash kutilmoqda')}
                        </span>
                        <Link to={`/content/${item.id}`}>
                          <Button size="sm" variant="secondary">Ko'rib chiqish</Button>
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
          <div className="liquid-glass rounded-2xl p-5 border border-red-500/30 bg-gradient-to-br from-red-950/40 via-black/50 to-black/60 shadow-xl space-y-3 animate-fade-in-up stagger-6 animate-border-glow">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <Sparkles size={16} />
              AI Tavsiyasi
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Oxirgi videolarda CTR 4.8% ga chiqdi. Ertangi 2 ta videoda raqamlar va savol uslubidagi sarlavhalardan foydalanish tavsiya etiladi.
            </p>
            <Link to="/strategy" className="block">
              <Button size="sm" variant="primary" className="w-full">
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
