import React from 'react';
import { PageHeader } from '../components/ui/page-header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Lightbulb, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Sparkles, 
  Target, 
  FlaskConical, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const strategyLessons = [
  {
    id: '1',
    lesson: 'Raqamlar bilan boshlangan sarlavhalar CTR ni 4.8% dan 6.2% gacha oshirdi',
    metric: '+29% CTR o\'sishi',
    confidence: 'Yuqori',
    status: 'Faol',
    evidence: 'Oxirgi 6 ta videodan 4 tasida sinovdan o\'tkazildi',
    impact: 'Keyingi skriptlarda qo\'llanilmoqda'
  },
  {
    id: '2',
    lesson: 'Dastlabki 3 sekundda to\'g\'ridan-to\'g\'ri savol qo\'yish tomoshabin ushlab qolishini (retention) 68% ga chiqardi',
    metric: '68% 30s Retention',
    confidence: 'Yuqori',
    status: 'Faol',
    evidence: 'Shorts videolar tahlilida tasdiqlandi',
    impact: 'Barcha yangi Shorts skriptlariga kiritildi'
  },
  {
    id: '3',
    lesson: 'Texnik atamalarni me\'yoridan ortiq ishlatish boshlang\'ich tomoshabinlar chiqib ketishiga sabab bo\'ldi',
    metric: '-18% o\'rtacha ko\'rish vaqti',
    confidence: 'O\'rta',
    status: 'Taqiqlangan qoida',
    evidence: '3 ta murakkab qo\'llanmada kuzatildi',
    impact: 'Skriptlarda soddalashtirilgan tushuntirish talabi o\'rnatildi'
  }
];

const experiments = [
  {
    title: 'Shorts formatida ovoz balandligi va dinamik musiqani 1.2x tezlashtirish',
    hypothesis: 'Retention ko\'rsatkichini 70%+ darajaga olib chiqadi',
    status: 'Sinovda (2/5 video)',
    badge: 'Faol sinov'
  },
  {
    title: 'Thumbnailda kontrastli neon qizil va sariq matn kombinatsiyasi',
    hypothesis: 'Tavsiyalarda bosish foizini 5.5% ga oshiradi',
    status: 'Rejalashtirilgan',
    badge: 'Keyingi sinov'
  }
];

const StrategyPage = () => {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="AI Strategiya Xotirasi & O'rganish Sikli" 
        description="Har bir nashr etilgan videoning analitikasi o'rganilib, kelgusi kontent strategiyasiga kiritiladi."
        actions={
          <Button variant="primary" className="flex items-center gap-2">
            <Sparkles size={16} /> Yangi tahlilni ishga tushirish
          </Button>
        }
      />

      {/* Top Banner: Learning Engine Status */}
      <div className="liquid-glass-red rounded-3xl p-6 sm:p-8 border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl animate-scale-in">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-red-300 uppercase tracking-wider">
            <Brain size={16} className="text-red-500" />
            Doimiy Rivojlanish Dvigateli (Continuous Learning Loop)
          </div>
          <h2 className="text-2xl font-black text-white">Strategiya Xotirasi Faol (3 ta tasdiqlangan qoida)</h2>
          <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
            AI generatsiya qilinayotgan har bir yangi skript va SEO metadatasiga o'tmishdagi eng samarali tajribalarni avtomatik ravishda qo'shadi.
          </p>
        </div>
        <div className="px-4 py-3 rounded-2xl bg-white/[0.08] border border-white/10 backdrop-blur-md text-center">
          <span className="text-xs text-gray-400 block font-medium">Algoritmik ishonch</span>
          <span className="text-2xl font-black text-emerald-400">92%</span>
        </div>
      </div>

      {/* What Worked vs What Failed */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* What Worked */}
        <div className="liquid-glass rounded-2xl p-6 border border-emerald-500/20 shadow-xl space-y-4 animate-fade-in-up stagger-1">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base">
            <CheckCircle2 size={20} />
            Nima natija berdi (Takrorlash kerak bo'lgan naqshlar)
          </div>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start gap-2.5 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
              <span><strong>"Top 5..." va "How to..." sarlavhalari:</strong> Qidiruv va tavsiyalarda eng yuqori bosish darajasini (CTR) qayd etdi.</span>
            </li>
            <li className="flex items-start gap-2.5 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
              <span><strong>14:00 UTC vaqtidagi nashrlar:</strong> AQSH va Yevropa auditoriyasi uyg'onish paytiga to'g'ri kelib, birinchi soatda eng tez ko'rildi.</span>
            </li>
            <li className="flex items-start gap-2.5 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
              <span><strong>Har 4 sekundda vizual almashish:</strong> O'rtacha tomosha foizini 12% ga oshirdi.</span>
            </li>
          </ul>
        </div>

        {/* What Failed */}
        <div className="liquid-glass rounded-2xl p-6 border border-rose-500/20 shadow-xl space-y-4 animate-fade-in-up stagger-2">
          <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
            <XCircle size={20} />
            Nima ish bermadi (Oldini olish kerak bo'lgan xatolar)
          </div>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start gap-2.5 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
              <span><strong>Uzoq kirish (intro) so'zlari:</strong> Birinchi 5 sekundda "Welcome back to my channel" deyilgan videolarda 40% tomoshabin chiqib ketdi.</span>
            </li>
            <li className="flex items-start gap-2.5 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
              <span><strong>Ortiqcha teglarni tiqishtirish (Keyword stuffing):</strong> Qidiruv reytingiga ijobiy ta'sir qilmadi, aksincha relevance ballini pasaytirdi.</span>
            </li>
            <li className="flex items-start gap-2.5 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
              <span><strong>Noaniq thumbnail matni:</strong> Kichik shriftli matnlar mobil ilovada o'qilmadi.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Strategy Memory Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Target size={20} className="text-red-500" /> Tasdiqlangan darslar ro'yxati (Strategy Memory)
        </h3>

        <div className="grid gap-4">
          {strategyLessons.map((item, index) => (
            <div 
              key={item.id}
              className="liquid-glass rounded-2xl p-5 border border-white/10 hover:border-red-500/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    {item.confidence} ishonch
                  </span>
                  <span className="text-xs text-gray-400">{item.evidence}</span>
                </div>
                <h4 className="font-bold text-white text-base">{item.lesson}</h4>
                <p className="text-xs text-gray-400">{item.impact}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 block">{item.metric}</span>
                  <span className="text-[11px] text-gray-400">{item.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Experiments */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FlaskConical size={20} className="text-red-500" /> Keyingi sinovlar (Experiments)
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {experiments.map((exp, idx) => (
            <div key={idx} className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-2.5 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                  {exp.badge}
                </span>
                <span className="text-xs text-gray-400">{exp.status}</span>
              </div>
              <h4 className="font-bold text-white text-sm">{exp.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{exp.hypothesis}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StrategyPage;
