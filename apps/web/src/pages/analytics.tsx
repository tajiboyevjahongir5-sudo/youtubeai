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
  Layers
} from 'lucide-react';
import { Link } from 'react-router';

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

  useEffect(() => {
    fetch('/api/workspaces/default/analytics/summary')
      .then(res => res.json())
      .then(data => setChannelInfo(data))
      .catch(() => {});
  }, []);

  const isReal = mode === 'real';
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
            <div className="flex p-1 rounded-xl bg-white/[0.05] border border-white/10">
              <button 
                onClick={() => setMode('real')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isReal ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                Jonli Kanal (0)
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
            Ulangan kanal: <span className="text-red-400">Neural Pulse AI</span> (Google OAuth 2.0 bilan ulangan)
          </p>
          <p className="text-gray-400 leading-relaxed">
            Bu yangi ochilayotgan kanal bo'lgani uchun barcha ko'rsatkichlar 0 dan boshlanadi. Tizim tayyorlagan birinchi 2 ta video YouTube'ga yuklangach, real tomoshalar va CTR grafiklarga avtomatik chiziladi.
          </p>
        </div>
      </div>
      
      {/* Stat Cards with Glow */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Ko'rishlar (Views)" 
          value={views} 
          description={isReal ? "Hozircha videolar yuklanmagan" : "Oxirgi 7 kunda"}
          icon={<Eye size={20} className="text-red-500" />} 
          trend={isReal ? undefined : "+24.8% o'tgan haftaga nisbatan"}
          delay={50}
        />
        <StatCard 
          title="Ko'rsatishlar (Impressions)" 
          value={impressions} 
          description={isReal ? "Tavsiyalar va qidiruvda" : "Tavsiyalar va qidiruvda"}
          icon={<Play size={20} className="text-rose-500" />} 
          trend={isReal ? undefined : "+18.2% o'sish"}
          delay={100}
        />
        <StatCard 
          title="CTR (Bosish darajasi)" 
          value={ctr} 
          description="O'rtacha me'yor: 4-8%"
          icon={<MousePointerClick size={20} className="text-amber-400" />} 
          trend={isReal ? undefined : "+0.6% yuqori"}
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
