import React from 'react';
import { PageHeader } from '../components/ui/page-header';
import { Card, CardContent } from '../components/ui/card';
import { 
  Activity as ActivityIcon, 
  Youtube, 
  Sparkles, 
  CheckCircle, 
  ShieldCheck, 
  Send,
  Clock,
  User,
  Sliders
} from 'lucide-react';

const auditEntries = [
  {
    id: '1',
    action: 'Video muvaffaqiyatli rejalashtirildi',
    details: 'Shorts: "Top 5 AI Tools That Work While You Sleep in 2026" (14:00 UTC)',
    user: 'Kanal Administratori',
    time: 'Bugun, 14:00:12',
    type: 'publish'
  },
  {
    id: '2',
    action: 'AI Skript va SEO metadata yaratildi',
    details: 'Gemini 3.6 Flash orqali ingliz tilida 58s skript va 15 ta teglar tayyorlandi',
    user: 'AI Autopilot Engine',
    time: 'Bugun, 13:42:05',
    type: 'ai'
  },
  {
    id: '3',
    action: 'Telegram orqali tasdiqlash so\'rovi yuborildi',
    details: '@jpilot_bot inline tugmalar bilan xabar yetkazildi',
    user: 'Telegram Service',
    time: 'Bugun, 13:42:15',
    type: 'telegram'
  },
  {
    id: '4',
    action: 'YouTube Analytics sinxronlashtirildi',
    details: 'Oxirgi 7 kunlik views, impressions va CTR ko\'rsatkichlari yangilandi',
    user: 'Sync Worker (BullMQ)',
    time: 'Kecha, 18:30:00',
    type: 'youtube'
  },
  {
    id: '5',
    action: 'Strategiya xotirasiga yangi dars kiritildi',
    details: '"Raqamlar bilan boshlangan sarlavhalar CTR ni oshirdi" qoidasi tasdiqlandi',
    user: 'AI Learning Engine',
    time: '14 Oktabr, 22:15:00',
    type: 'strategy'
  },
  {
    id: '6',
    action: 'OAuth 2.0 token avtomatik yangilandi',
    details: 'Google OAuth refresh token orqali yangi access token olindi',
    user: 'Security Subsystem',
    time: '14 Oktabr, 12:00:00',
    type: 'security'
  }
];

const ActivityPage = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader 
        title="Tizim Faolligi & Audit Jurnali" 
        description="YouTube yuklashlari, AI jarayonlari, tasdiqlashlar va xavfsizlik loglari." 
      />

      <Card className="liquid-glass border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <ActivityIcon size={18} className="text-red-500" /> Barcha qayd etilgan amallar (Audit Log)
          </h3>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Jonli yozuv
          </span>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {auditEntries.map((entry, index) => (
              <div key={entry.id} className="p-5 hover:bg-white/[0.03] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up" style={{ animationDelay: `${index * 60}ms` }}>
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                    entry.type === 'publish' ? 'bg-red-600/15 border-red-500/30 text-red-400' :
                    entry.type === 'ai' ? 'bg-purple-600/15 border-purple-500/30 text-purple-400' :
                    entry.type === 'telegram' ? 'bg-blue-600/15 border-blue-500/30 text-blue-400' :
                    entry.type === 'youtube' ? 'bg-rose-600/15 border-rose-500/30 text-rose-400' :
                    'bg-emerald-600/15 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {entry.type === 'publish' && <Youtube size={18} />}
                    {entry.type === 'ai' && <Sparkles size={18} />}
                    {entry.type === 'telegram' && <Send size={18} />}
                    {entry.type === 'youtube' && <Youtube size={18} />}
                    {entry.type === 'strategy' && <CheckCircle size={18} />}
                    {entry.type === 'security' && <ShieldCheck size={18} />}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm">{entry.action}</h4>
                    <p className="text-xs text-gray-400">{entry.details}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <User size={12} /> {entry.user}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-400 font-mono flex items-center gap-1 flex-shrink-0">
                  <Clock size={12} /> {entry.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityPage;
