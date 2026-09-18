import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/page-header';
import { StatCard } from '../components/ui/stat-card';
import { Select } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  Eye, 
  MousePointerClick, 
  Clock, 
  UserPlus, 
  Play, 
  ThumbsUp, 
  TrendingUp, 
  Youtube, 
  Flame,
  ArrowUpRight,
  Info,
  Sparkles,
  Layers,
  RefreshCw,
  ExternalLink,
  Brain,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Target,
  MessageSquare,
  HelpCircle,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router';
import { getWorkspaceId } from '../lib/workspace';

const mockZeroData = [
  { name: 'Dush', views: 0, ctr: 0 },
  { name: 'Sesh', views: 0, ctr: 0 },
  { name: 'Chor', views: 0, ctr: 0 },
  { name: 'Pay', views: 0, ctr: 0 },
  { name: 'Jum', views: 0, ctr: 0 },
  { name: 'Shan', views: 0, ctr: 0 },
  { name: 'Yak', views: 0, ctr: 0 },
];

const mockBenchmarkData = [
  { name: 'Dush', views: 4200, ctr: 4.2 },
  { name: 'Sesh', views: 5100, ctr: 4.5 },
  { name: 'Chor', views: 3800, ctr: 4.1 },
  { name: 'Pay', views: 6400, ctr: 5.2 },
  { name: 'Jum', views: 7800, ctr: 5.6 },
  { name: 'Shan', views: 9200, ctr: 6.1 },
  { name: 'Yak', views: 11400, ctr: 6.4 },
];

const plannedVideos = [
  {
    id: '1',
    title: '5 AI Websites That Feel Illegal to Know in 2026 #Shorts',
    format: 'Shorts',
    date: 'Ertaga, 14:00 UTC',
    status: 'Tasdiqlash kutilmoqda',
    predictedViews: '40K - 120K',
    predictedCtr: '8.5%',
    seoScore: 98
  },
  {
    id: '2',
    title: 'The Death of Traditional Coding: Autonomous AI Agents Deep Dive',
    format: '16:9',
    date: 'Ertaga, 21:00 UTC',
    status: 'Rejalashtirilgan',
    predictedViews: '25K - 60K',
    predictedCtr: '6.2%',
    seoScore: 95
  },
  {
    id: '3',
    title: 'Top 5 AI Tools That Work While You Sleep in 2026',
    format: 'Shorts',
    date: 'Bugun, 14:00 UTC',
    status: 'Rejalashtirilgan',
    predictedViews: '15K - 35K',
    predictedCtr: '6.4%',
    seoScore: 94
  }
];

const AnalyticsPage = () => {
  const [period, setPeriod] = useState('7');
  const [mode, setMode] = useState<'real' | 'benchmark'>('real');
  const [channelInfo, setChannelInfo] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const wsId = getWorkspaceId();

  const fetchSummary = () => {
    fetch(`/api/workspaces/${wsId}/analytics/summary`, {
      headers: { 'x-workspace-id': wsId }
    })
      .then(res => res.json())
      .then(data => setChannelInfo(data))
      .catch(() => {});
  };

  const fetchDiagnostics = () => {
    fetch(`/api/workspaces/${wsId}/analytics/diagnostics`, {
      headers: { 'x-workspace-id': wsId }
    })
      .then(res => res.json())
      .then(data => {
        setDiagnostics(data);
        if (data?.videoDiagnostics && data.videoDiagnostics.length > 0) {
          setSelectedVideoId(prev => prev || data.videoDiagnostics[0].id);
        }
      })
      .catch(() => {});
  };

  const [retentionReport, setRetentionReport] = useState<any>(null);

  const fetchRetention = () => {
    fetch(`/api/workspaces/${wsId}/analytics/retention?contentId=latest`, {
      headers: { 'x-workspace-id': wsId }
    })
      .then(res => res.json())
      .then(data => {
        if (data?.curve) {
          setRetentionReport(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSummary();
    fetchDiagnostics();
    fetchRetention();
  }, [wsId]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch(`/api/workspaces/${wsId}/youtube/sync`, {
        method: 'POST',
        headers: { 'x-workspace-id': wsId }
      });
      fetchSummary();
      fetchDiagnostics();
    } catch (e) {
      console.error('Sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReanalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(`/api/workspaces/${wsId}/analytics/reanalyze`, {
        method: 'POST',
        headers: { 'x-workspace-id': wsId }
      });
      const data = await res.json();
      if (data?.diagnostics) {
        setDiagnostics(data.diagnostics);
        if (data.diagnostics.videoDiagnostics?.length > 0) {
          setSelectedVideoId(data.diagnostics.videoDiagnostics[0].id);
        }
      }
    } catch (e) {
      console.error('Re-analyze error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isReal = mode === 'real';
  const isConnected = channelInfo?.channelConnected !== false && channelInfo?.channelTitle !== 'YouTube Kanal Ulanmagan';
  const views = isReal ? (channelInfo?.views || 0) : '124,592';
  const impressions = isReal ? (channelInfo?.impressions || 0) : '1,203,441';
  const ctr = isReal ? `${channelInfo?.ctr || 0.0}%` : '5.4%';
  const watchTime = isReal ? `${channelInfo?.watchTimeHours || 0} soat` : '8,401 soat';
  const retention = isReal ? `${channelInfo?.avgViewPercentage || 0.0}%` : '58.4%';
  const subscribers = isReal ? `${channelInfo?.subscribers || 0}` : '+1,402';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Kanal Analitikasi (YouTube Studio)" 
        description="YouTube Analytics API orqali sinxronlashtirilgan ko'rsatkichlar." 
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              variant="outline"
              size="sm"
              className="gap-2 border-white/10 hover:border-red-500/40 text-xs font-semibold bg-white/[0.04]"
            >
              <RefreshCw size={13} className={isSyncing ? "animate-spin text-red-500" : "text-gray-400"} />
              {isSyncing ? "Sinxronlanmoqda..." : "Sinxronlash"}
            </Button>
            <div className="flex p-1 rounded-xl bg-white/[0.05] border border-white/10">
              <button 
                onClick={() => setMode('real')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isReal ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                Jonli Kanal ({channelInfo?.views ?? 0})
              </button>
              <button 
                onClick={() => setMode('benchmark')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!isReal ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                AI Prognozi
              </button>
            </div>
            <div className="w-36">
              <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="7">Oxirgi 7 kun</option>
                <option value="28">Oxirgi 28 kun</option>
                <option value="90">Oxirgi 90 kun</option>
              </Select>
            </div>
          </div>
        }
      />


      {/* Info notification about real channel state */}
      <div className="liquid-glass rounded-2xl p-4 border border-blue-500/30 bg-blue-500/10 flex items-start gap-3.5">
        <Info size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-gray-300 space-y-1">
          <p className="font-bold text-white">
            Ulangan kanal: <span className="text-red-400">{channelInfo?.channelTitle || 'YouTube Kanal Ulanmagan'}</span> {isConnected ? "(Google OAuth 2.0 bilan ulangan)" : "(Ulanmagan)"}
          </p>
          <p className="text-gray-400 leading-relaxed">
            {isConnected 
              ? "Kanal parametrlari YouTube API orqali sinxronlashtiriladi. Videolar joylangach, real ko'rishlar va CTR avtomatik tarzda ko'rinadi."
              : "Shaxsiy kanalingiz hali ulanmagan. O'z kanalingiz statistikasini ko'rish uchun Integratsiyalar sahifasida YouTube kanalingizni ulang."}
          </p>
        </div>
      </div>
      
      {/* Stat Cards with Glow */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Ko'rishlar (Views)" 
          value={views} 
          description={isReal ? (channelInfo?.views > 0 ? "YouTube API orqali tasdiqlangan" : "Hozircha videolar yuklanmagan") : "Oxirgi 7 kunda"}
          icon={<Eye size={20} className="text-red-500" />} 
          trend={isReal && channelInfo?.views > 0 ? `+${channelInfo.views} jonli ko'rish` : (isReal ? undefined : "+24.8% o'tgan haftaga nisbatan")}
          delay={50}
        />
        <StatCard 
          title="Ko'rsatishlar (Impressions)" 
          value={impressions} 
          description={isReal ? "Tavsiyalar va qidiruvda" : "Tavsiyalar va qidiruvda"}
          icon={<Play size={20} className="text-rose-500" />} 
          trend={isReal && channelInfo?.impressions > 0 ? "+100% yangi video" : (isReal ? undefined : "+18.2% o'sish")}
          delay={100}
        />
        <StatCard 
          title="CTR (Bosish darajasi)" 
          value={ctr} 
          description="O'rtacha me'yor: 4-8%"
          icon={<MousePointerClick size={20} className="text-amber-400" />} 
          trend={isReal && channelInfo?.ctr > 0 ? "Barqaror CTR" : (isReal ? undefined : "+0.6% yuqori")}
          delay={150}
        />
        <StatCard 
          title="Ko'rish vaqti (Soat)" 
          value={watchTime} 
          description="Monetizatsiya chegarasi: 4000s"
          icon={<Clock size={20} className="text-emerald-400" />} 
          trend={isReal ? undefined : "+14% ko'proq"}
          delay={200}
        />
        <StatCard 
          title="O'rtacha ko'rish foizi" 
          value={retention} 
          description="Shorts va Long-form o'rtacha"
          icon={<TrendingUp size={20} className="text-cyan-400" />} 
          trend={isReal ? undefined : "+4.2% retention"}
          delay={250}
        />
        <StatCard 
          title="Yangi obunachilar" 
          value={subscribers} 
          description="Sof o'sish"
          icon={<UserPlus size={20} className="text-purple-400" />} 
          trend={isReal ? undefined : "+320 yangi obunachi"}
          delay={300}
        />
      </div>

      {/* Chart Section */}
      <Card className="liquid-glass border border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame size={18} className="text-red-500" /> 
                {isReal ? "Ko'rishlar Dinamikasi (Jonli Kanal)" : "AI Prognozlangan Ko'rishlar Grafigi"}
              </h3>
              <p className="text-xs text-gray-400">
                {isReal ? "Birinchi videolar chiqqach, YouTube Analytics API orqali kunlik o'sish chiziladi" : "O'xshash nishadagi kanallarning haftalik o'sish benchmarki"}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.8)]"></span> Ko'rishlar
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={isReal ? mockZeroData : mockBenchmarkData}>
                <defs>
                  <linearGradient id="ytRedGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff0000" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ff0000" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} domain={[0, isReal ? 100 : 'auto']} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 15, 22, 0.9)', 
                    backdropFilter: 'blur(16px)',
                    borderRadius: '12px', 
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#ff0000" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#ytRedGlow)" 
                  dot={{r: 4, fill: '#ff0000', stroke: '#fff', strokeWidth: 1}} 
                  activeDot={{r: 6, fill: '#ff1a1a', stroke: '#fff', strokeWidth: 2}} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* YouTube Retention Heatmap & Drop-off Auditor */}
      <Card className="liquid-glass border border-cyan-500/30 overflow-hidden shadow-[0_8px_32px_rgba(0,240,255,0.08)]">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Clock size={18} />
              </span>
              <h3 className="font-extrabold text-white text-lg tracking-tight">
                YouTube Retention Heatmap & Drop-off Auditor (Soniyalik Retensiya)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wide">
                APV 85%+ Standarti
              </span>
            </div>
            <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
              Videoning 0-dan 56-soniyasigacha tomoshabinni ushlab qolish egri chizig'i. YouTube algoritmi APV &gt; 75% bo'lgan videolarni Shorts lentasida doimiy ravishda millionlab tomoshabinlarga tavsiya qiladi.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-right">
              <span className="text-[10px] text-gray-400 block font-medium">O'rtacha Ko'rish (APV)</span>
              <span className="text-sm font-bold text-cyan-300">
                {retentionReport?.averagePercentageViewed || 78.4}%
              </span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-right">
              <span className="text-[10px] text-gray-400 block font-medium">Retensiya Bali</span>
              <span className="text-sm font-bold text-amber-400">
                {retentionReport?.retentionScore || 88} / 100
              </span>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Curve Area Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <TrendingUp size={14} className="text-cyan-400" />
                Soniyama-soniya Tomoshabinlar Oqimi (0s - 56s)
              </span>
              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]"></span> Real Video Retensiyasi
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span> Viral Shorts Benchmark (80%)
                </span>
              </div>
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={retentionReport?.curve || [
                  { second: 0, retentionPercent: 100, benchmarkPercent: 100 },
                  { second: 2, retentionPercent: 91.5, benchmarkPercent: 98.5 },
                  { second: 6, retentionPercent: 88.0, benchmarkPercent: 95.5 },
                  { second: 12, retentionPercent: 85.0, benchmarkPercent: 91.0 },
                  { second: 18, retentionPercent: 80.2, benchmarkPercent: 86.5 },
                  { second: 26, retentionPercent: 77.0, benchmarkPercent: 80.5 },
                  { second: 36, retentionPercent: 74.5, benchmarkPercent: 73.0 },
                  { second: 46, retentionPercent: 71.0, benchmarkPercent: 65.5 },
                  { second: 56, retentionPercent: 68.2, benchmarkPercent: 58.0 }
                ]}>
                  <defs>
                    <linearGradient id="cyanRetentionGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="second" unit="s" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                  <YAxis domain={[40, 100]} unit="%" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(10, 16, 26, 0.95)',
                      backdropFilter: 'blur(16px)',
                      borderRadius: '12px',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="benchmarkPercent"
                    stroke="#6b7280"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    fillOpacity={0}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="retentionPercent"
                    stroke="#00e5ff"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#cyanRetentionGlow)"
                    dot={{r: 3, fill: '#00e5ff', stroke: '#fff', strokeWidth: 1}}
                    activeDot={{r: 6, fill: '#00e5ff', stroke: '#fff', strokeWidth: 2}}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3 Drop-Off Alert Cards */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-400" />
              Aniqlangan 3 Ta Kritik Chiqib Ketish Nuqtasi (Drop-off Bottlenecks) va AI Yechimlari:
            </span>

            <div className="grid md:grid-cols-3 gap-4">
              {(retentionReport?.dropOffAlerts || [
                {
                  timestamp: '0:02',
                  dropAmount: '-8.5%',
                  zone: 'Pattern Interrupt & Hook',
                  cause: 'Tomoshabin birinchi 2 soniyada vizual qiziqish sezmasa tez o\'tkazib yuboradi.',
                  aiFix: 'Qizil neon alert pill va kuchli sub-drop audio zarbani 0.15s dan boshlang.'
                },
                {
                  timestamp: '0:18',
                  dropAmount: '-4.8%',
                  zone: '2-Sahna O\'tish Nuqtasi',
                  cause: 'Kadr statik holatda 4 soniyadan ko\'proq harakatsiz qolgani sababli e\'tibor pasaygan.',
                  aiFix: 'Ken-Burns kamera masshtablash (Zoom-in 1.0 -> 1.08) va oq chiroq (flash transition) qo\'shildi.'
                },
                {
                  timestamp: '0:48',
                  dropAmount: '-6.2%',
                  zone: 'Obuna & Yakuniy Outro',
                  cause: 'Tomoshabin video tugayotganini his qilganida darhol keyingi Shorts\'ga o\'tib ketadi.',
                  aiFix: 'Xulosa o\'rniga munozarali savol bering va videoni birinchi sekundga bevosita tutashtiruvchi loop qiling.'
                }
              ]).map((alert: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      ⏱️ {alert.timestamp}
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      {alert.dropAmount}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{alert.zone}</h5>
                    <p className="text-[11px] text-gray-400 mt-1 leading-snug">{alert.cause}</p>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-[11px] text-emerald-300 font-medium leading-relaxed bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/15">
                    💡 <strong>AI Yechimi:</strong> {alert.aiFix}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Algorithmic Diagnostic & Self-Learning Center */}
      <Card className="liquid-glass border border-red-500/30 bg-gradient-to-br from-red-500/[0.04] via-black/40 to-amber-500/[0.02] overflow-hidden shadow-[0_8px_32px_rgba(255,0,0,0.08)]">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                <Brain size={18} className="animate-pulse" />
              </span>
              <h3 className="font-extrabold text-white text-lg tracking-tight">
                AI Algoritmik Tahlil & O'zini-O'zi Rivojlantirish Markazi
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                Self-Learning Faol
              </span>
            </div>
            <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
              Yuklangan videolarni YouTube algoritmi (VVSA, Retensiya, Like va Obuna konversiyasi) asosida chuqur tahlil qiladi. Aniqlangan xatoliklar kanal xotirasida saqlanadi va <strong>keyingi barcha videolar yaratilishida AI tomonidan avtomatik tuzatiladi</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-right">
              <span className="text-[10px] text-gray-400 block font-medium">Algoritmik Viral Salohiyat</span>
              <span className="text-sm font-bold text-red-400">
                {diagnostics?.channelViralScore || 45} <span className="text-[11px] text-gray-500 font-normal">/ 100</span>
              </span>
            </div>
            <Button
              onClick={handleReanalyze}
              disabled={isAnalyzing}
              variant="outline"
              size="sm"
              className="gap-2 border-red-500/40 hover:bg-red-500/20 text-xs font-semibold text-white bg-red-500/10 shadow-[0_0_12px_rgba(255,0,0,0.2)]"
            >
              <RefreshCw size={13} className={isAnalyzing ? "animate-spin text-red-400" : "text-red-400"} />
              {isAnalyzing ? "AI Tahlil Qilmoqda..." : "Qayta Analiz Qilish"}
            </Button>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Video Selector Tabs */}
          {diagnostics?.videoDiagnostics && diagnostics.videoDiagnostics.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Play size={13} className="text-red-400" /> Tahlil Qilingan Videolar (Bosing):
                </span>
                <span className="text-xs text-gray-400">
                  Jami tahlil qilingan: <strong>{diagnostics.totalVideosAnalyzed}</strong> ta video
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {diagnostics.videoDiagnostics.map((v: any) => {
                  const isSelected = selectedVideoId === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVideoId(v.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        isSelected 
                          ? 'border-red-500 bg-red-500/10 shadow-[0_0_16px_rgba(255,0,0,0.25)] ring-1 ring-red-500/50' 
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                      }`}
                    >
                      {v.thumbnail && (
                        <img 
                          src={v.thumbnail} 
                          alt={v.title} 
                          className="w-16 h-11 object-cover rounded-lg border border-white/10 shrink-0" 
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-white line-clamp-1 mb-1">
                          {v.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1.5">
                          <span className="text-red-400 font-bold flex items-center gap-0.5">
                            <Eye size={11} /> {v.views}
                          </span>
                          <span>•</span>
                          <span className="text-amber-400 flex items-center gap-0.5">
                            <ThumbsUp size={11} /> {v.likes}
                          </span>
                          <span>•</span>
                          <span>{v.comments} izoh</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          v.status === 'viral' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : v.status === 'performing'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {v.statusLabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Detailed 4-Pillar Algorithmic Breakdown for the Active Video */}
              {(() => {
                const active = diagnostics.videoDiagnostics.find((v: any) => v.id === selectedVideoId) || diagnostics.videoDiagnostics[0];
                if (!active) return null;

                return (
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
                          Chuqur Algoritmik Ekspertiza (Post-Mortem):
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          "{active.title}"
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">Like nisbati: <strong className="text-white">{active.likeRatio}%</strong></span>
                        <span className="text-gray-600">|</span>
                        <span className="text-gray-400">Izoh faolligi: <strong className="text-white">{active.commentRatio}%</strong></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Quadrant 1: Why Viral or Stalled */}
                      <div className="p-4 rounded-xl bg-red-500/[0.04] border border-red-500/20 space-y-2">
                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                          <TrendingDown size={15} />
                          Nega rekga to'liq chiqmadi (yoki to'xtadi)?
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {active.whyViralOrStalled}
                        </p>
                        <div className="text-[11px] text-gray-400 bg-white/[0.03] p-2 rounded-lg border border-white/5">
                          💡 <strong>Algoritm siri:</strong> Shorts algoritmi dastlab 100-150 ta tomoshabinda sinov o'tkazadi. Agar 0-3 soniyada o'tkazib yuborish (Swiped Away) 35% dan oshsa, video tavsiyalardan darhol olib tashlanadi.
                        </div>
                      </div>

                      {/* Quadrant 2: Why Low Likes */}
                      <div className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 space-y-2">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                          <ThumbsUp size={15} />
                          Nega layk kam ({active.likes} ta layk)?
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {active.whyLowLikes}
                        </p>
                        <div className="text-[11px] text-gray-400 bg-white/[0.03] p-2 rounded-lg border border-white/5">
                          💡 <strong>Algoritm siri:</strong> Tomoshabin layk bosishi uchun unga aniq amaliy sabab berilishi shart: "Bu promptni yo'qotmaslik uchun layk bosib saqlab oling".
                        </div>
                      </div>

                      {/* Quadrant 3: Why Low Subscribers */}
                      <div className="p-4 rounded-xl bg-blue-500/[0.04] border border-blue-500/20 space-y-2">
                        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                          <UserPlus size={15} />
                          Nega obuna kelmayapti?
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {active.whyLowSubscribers}
                        </p>
                        <div className="text-[11px] text-gray-400 bg-white/[0.03] p-2 rounded-lg border border-white/5">
                          💡 <strong>Algoritm siri:</strong> Outroda shunchaki "obuna bo'ling" deyish samarasiz. "Ertangi 2-qismda yangi AI arxitekturani ko'rsatamiz" kabi aniq ertangi va'da bo'lishi kerak.
                        </div>
                      </div>

                      {/* Quadrant 4: Key Corrective Directive */}
                      <div className="p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                          <Target size={15} />
                          Keyingi Video Uchun AI Tuzatish Direktivasi:
                        </div>
                        <p className="text-xs text-gray-200 leading-relaxed font-medium">
                          {active.keyCorrectiveDirective}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 size={13} /> Kelgusi video yaratilishida avtomatik qo'llaniladi
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="p-6 text-center border border-white/10 rounded-2xl bg-white/[0.02] space-y-2">
              <p className="text-xs text-gray-300 font-semibold">
                Kanalga birinchi video yuklangach, YouTube algoritmi reaksiyasi real vaqtda shu yerda tahlil qilinadi.
              </p>
              <p className="text-[11px] text-gray-500">
                Hozirda tizim bazaviy 2026 YouTube Shorts retention qoidalari asosida ishlamoqda.
              </p>
            </div>
          )}

          {/* Channel Strategy Memory & Active Directives for Upcoming Videos */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-amber-500/20 text-amber-400">
                  <Zap size={15} />
                </span>
                <h4 className="text-sm font-bold text-white">
                  Kanalning O'rganish Xotirasi (Keyingi Videolarga Biriktirilgan Qoidalar)
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 size={12} /> Gemini & Render Dvigateliga Ulangan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(diagnostics?.activeDirectivesForNextVideo || [
                "HOOK (0-3s): 1.25x tezkor zoom, qizil/amber 'URGENT' ogohlantirish va sub-bass zarbasi bilan tomoshabin e'tiborini 1-sekundda ushlang.",
                "LAYK TRIGGER (0:18s): Tomoshabinga 'Bu AI asbobni yo'qotib qo'ymaslik uchun layk bosib saqlab oling' deb vizual belgi bering.",
                "OBUNA VA'DASI (0:46s): Outroda 'Har kuni yangi 2026 AI blueprintlar uchun hoziroq obuna bo'ling' deb baland chaqiriq va Subscribe Pill ko'rsating.",
                "IZOHLAR VIRALLIGI: Pinned commentda tomoshabinlarni bahsga chorlaydigan 2 xil yechim o'rtasida tanlov savolini bering."
              ]).map((directive: string, idx: number) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-black/30 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {directive}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-white/5">
              <span>
                Oxirgi tahlil: {diagnostics?.lastAnalyzedAt ? new Date(diagnostics.lastAnalyzedAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Hozir'}
              </span>
              <span className="text-red-400 font-medium">
                Kelgusi video yaratilganda ushbu qoidalar avtomatik tarzda stsenariyga kiritiladi
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Uploaded Videos Table (from YouTube API) */}
      {channelInfo?.recentVideos && channelInfo.recentVideos.length > 0 && (
        <Card className="liquid-glass border border-red-500/20 bg-red-500/[0.02] overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Youtube size={18} className="text-red-500 fill-red-500" /> 
              YouTube'dagi Videolar (Jonli Ko'rsatkichlar)
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                {channelInfo.recentVideos.length} ta video
              </span>
            </h3>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Real-time sinxronizatsiya
            </span>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Video</th>
                    <th className="px-6 py-3.5 font-semibold">Ko'rishlar (Views)</th>
                    <th className="px-6 py-3.5 font-semibold">Layklar (Likes)</th>
                    <th className="px-6 py-3.5 font-semibold">Izohlar</th>
                    <th className="px-6 py-3.5 font-semibold">Yuklangan sana</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Harakat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {channelInfo.recentVideos.map((v: any) => (
                    <tr key={v.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {v.thumbnail && (
                            <img 
                              src={v.thumbnail} 
                              alt={v.title} 
                              className="w-16 h-10 object-cover rounded-lg border border-white/10 shadow"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                              {v.title}
                            </p>
                            <span className="text-[10px] text-gray-400">ID: {v.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-bold text-base flex items-center gap-1.5">
                          <Eye size={16} className="text-red-500" />
                          {v.views.toLocaleString()} marta
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300 font-semibold flex items-center gap-1">
                          <ThumbsUp size={14} className="text-amber-400" />
                          {v.likes}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{v.comments || 0}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`https://youtube.com/watch?v=${v.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 text-xs font-semibold transition-all"
                        >
                          YouTube'da ko'rish
                          <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Performance / Pipeline Table */}
      <Card className="liquid-glass border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">

          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Youtube size={18} className="text-red-500 fill-red-500" /> 
            Rejalashtirilgan Viral AI Videolar Pipeline'i
          </h3>
          <Link to="/content" className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold">
            Barcha videolarni ko'rish <ArrowUpRight size={14} />
          </Link>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Video nomi</th>
                  <th className="px-6 py-3.5 font-semibold">Format</th>
                  <th className="px-6 py-3.5 font-semibold">Nashr Vaqti</th>
                  <th className="px-6 py-3.5 font-semibold">Kutilayotgan ko'rishlar</th>
                  <th className="px-6 py-3.5 font-semibold">Kutilayotgan CTR</th>
                  <th className="px-6 py-3.5 font-semibold">SEO Bali</th>
                  <th className="px-6 py-3.5 font-semibold">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {plannedVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4 font-semibold text-white group-hover:text-red-400 transition-colors">
                      {video.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        video.format === 'Shorts' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {video.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{video.date}</td>
                    <td className="px-6 py-4 text-white font-bold">{video.predictedViews}</td>
                    <td className="px-6 py-4 font-bold text-amber-400">{video.predictedCtr}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">{video.seoScore}%</td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {video.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
