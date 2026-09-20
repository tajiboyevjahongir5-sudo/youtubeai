import React, { useState } from 'react';
import { PageHeader } from '../components/ui/page-header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Youtube, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Flame,
  Check
} from 'lucide-react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getWorkspaceId } from '../lib/workspace';
import { fetchApi } from '../lib/api';

interface ScheduleSlot {
  day: string;
  date: string;
  isToday?: boolean;
  slots: {
    time: string;
    utc: string;
    title: string;
    format: 'shorts' | 'long_form';
    status: 'scheduled' | 'needs_approval' | 'published' | 'empty';
    contentId?: string;
  }[];
}

const CalendarPage = () => {
  const workspaceId = getWorkspaceId();

  const { data: contentItems } = useQuery({
    queryKey: ['calendar-content', workspaceId],
    queryFn: async () => {
      try {
        return await fetchApi(`/workspaces/${workspaceId}/content`, {}, async () => 'mock_token');
      } catch (e) {
        return [];
      }
    },
    staleTime: 15000,
  });

  const [viewMode, setViewMode] = useState<'weekly' | 'heatmap'>('weekly');
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { data: heatmapData } = useQuery({
    queryKey: ['traffic-heatmap', workspaceId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/calendar-matrix/heatmap`, {
          headers: { 'x-workspace-id': workspaceId }
        });
        const data = await res.json();
        return data.heatmap || [];
      } catch (e) { return []; }
    }
  });

  const handleAutoFill30Days = async () => {
    setIsAutoFilling(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/growth-suite/calendar-matrix/autofill-30days`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': workspaceId }
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setToast(`🚀 30 kunlik reja to'ldirildi: ${data.summary.totalShortsCreated} Shorts, ${data.summary.totalLongformCreated} Long-form!`);
        setTimeout(() => setToast(null), 4000);
      }
    } catch (e) {
      setToast('❌ Rejalashtirishda xatolik yuz berdi');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Calculate current week days (Dushanba - Yakshanba)
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
  const dayNames = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
  
  const scheduleData: ScheduleSlot[] = dayNames.map((name, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - currentDayOfWeek + i);
    const isToday = i === currentDayOfWeek;
    const dateStr = d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });

    // Match content items for this day
    const dayItems = (Array.isArray(contentItems) ? contentItems : []).filter((item: any) => {
      if (!item.scheduledAt) return false;
      const itemDate = new Date(item.scheduledAt);
      return itemDate.getDate() === d.getDate() && itemDate.getMonth() === d.getMonth();
    });

    // Slots array
    const slots: ScheduleSlot['slots'] = [];

    if (dayItems.length > 0) {
      dayItems.forEach((item: any) => {
        const itemTime = item.scheduledAt ? new Date(item.scheduledAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '19:00';
        let status: 'scheduled' | 'needs_approval' | 'published' = 'scheduled';
        if (item.status === 'published') status = 'published';
        else if (item.status === 'review' || item.status === 'idea') status = 'needs_approval';

        slots.push({
          time: itemTime,
          utc: '14:00 UTC',
          title: item.title,
          format: item.videoFormat || 'shorts',
          status,
          contentId: item.id
        });
      });
    } else if (isToday) {
      // For today, if no items matched exact date, provide items from pipeline
      const allItems = Array.isArray(contentItems) ? contentItems : [];
      if (allItems.length > 0) {
        const first = allItems[0];
        slots.push({
          time: '19:00',
          utc: '14:00 UTC',
          title: first.title,
          format: first.videoFormat || 'shorts',
          status: first.status === 'published' ? 'published' : 'needs_approval',
          contentId: first.id
        });
      }
      if (allItems.length > 1) {
        const second = allItems[1];
        slots.push({
          time: '02:00',
          utc: '21:00 UTC',
          title: second.title,
          format: second.videoFormat || 'long_form',
          status: second.status === 'published' ? 'published' : 'scheduled',
          contentId: second.id
        });
      }
    } else if (i < currentDayOfWeek) {
      // Past day in current week — 2 ta video: 1 Shorts + 1 Long-form
      slots.push({
        time: '19:00',
        utc: '14:00 UTC',
        title: `Why 90% of Devs Use AI #Shorts`,
        format: 'shorts',
        status: 'published',
        contentId: `item_past_${i}_1`
      });
      slots.push({
        time: '01:00',
        utc: '20:00 UTC',
        title: `Building a Full Stack SaaS with AI Step-by-Step Guide`,
        format: 'long_form',
        status: 'published',
        contentId: `item_past_${i}_2`
      });
    } else {
      // Future day in current week — 2 ta video: 1 Shorts + 1 Long-form
      slots.push({
        time: '19:00',
        utc: '14:00 UTC',
        title: `AI Blueprint & Tech Trends #${i + 1}`,
        format: 'shorts',
        status: 'scheduled'
      });
      slots.push({
        time: '01:00',
        utc: '20:00 UTC',
        title: `Top AI Autonomous Coding Agents of 2026 #Shorts`,
        format: 'long_form',
        status: 'scheduled'
      });
    }

    return {
      day: name,
      date: dateStr,
      isToday,
      slots
    };
  });
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Nashr taqvimi & 30 Kunlik Matritsa" 
        description="Kunlik 2 ta Shorts (AQSH eng qizg'in 14:00 va 20:00 UTC) va haftalik 2 ta Long-form avtopilot jadvali."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'weekly' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Haftalik Jadval
              </button>
              <button
                type="button"
                onClick={() => setViewMode('heatmap')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'heatmap' ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                🔥 7x24 Traffic Heatmap
              </button>
            </div>

            <Button 
              variant="primary" 
              disabled={isAutoFilling}
              onClick={handleAutoFill30Days}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer text-xs"
            >
              <Sparkles size={15} className={isAutoFilling ? 'animate-spin' : ''} />
              {isAutoFilling ? 'Rejalashtirilmoqda...' : '⚡ 30 Kunlik Avtopilotni To\'ldirish'}
            </Button>

            <Link to="/content/new">
              <Button variant="secondary" size="sm" className="flex items-center gap-1.5 text-xs">
                <Plus size={14} /> Yangi qo'shish
              </Button>
            </Link>
          </div>
        }
      />

      {toast && (
        <div className="liquid-glass rounded-2xl p-4 border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 flex items-center gap-3 animate-fade-in text-sm font-semibold shadow-xl">
          <Check size={20} className="text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* HEATMAP VIEW */}
      {viewMode === 'heatmap' && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121424] to-[#0c0f1c] border border-amber-500/30 space-y-4 shadow-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame size={18} className="text-amber-400" />
                7x24 YouTube Tomoshabinlar Faolligi Issiqlik Xaritasi (Audience Heatmap)
              </h3>
              <p className="text-xs text-gray-400">
                AQSH va Tier-1 mamlakatlari bo'yicha eng yuqori tomosha ko'rsatkichiga ega eng qizg'in soatlar
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-gray-400">
                <span className="w-3 h-3 rounded bg-white/5 border border-white/10"></span> Tinch (&lt;50)
              </span>
              <span className="flex items-center gap-1 text-teal-400">
                <span className="w-3 h-3 rounded bg-teal-500/30 border border-teal-500/40"></span> Barqaror (50-80)
              </span>
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <span className="w-3 h-3 rounded bg-amber-500 text-black"></span> Viral Pik (85+)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px] space-y-2">
              <div className="grid grid-cols-25 gap-1 text-[10px] text-gray-400 font-mono text-center">
                <span>Kun</span>
                {Array.from({ length: 24 }).map((_, h) => (
                  <span key={h} className={h === 14 || h === 20 ? 'text-amber-300 font-bold' : ''}>
                    {h}h
                  </span>
                ))}
              </div>

              {['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'].map((day) => {
                const daySlots = (heatmapData || []).filter((s: any) => s.day === day);
                return (
                  <div key={day} className="grid grid-cols-25 gap-1 items-center">
                    <span className="text-xs font-bold text-gray-300">{day}</span>
                    {daySlots.length > 0 ? (
                      daySlots.map((slot: any) => (
                        <div
                          key={slot.hour}
                          title={`${day} ${slot.hour}:00 UTC — Ball: ${slot.engagementScore}/100 ${slot.isPeak ? '🔥 VIRAL PIK!' : ''}`}
                          className={`h-7 rounded-md flex items-center justify-center text-[9px] font-mono transition-all cursor-pointer ${
                            slot.isPeak
                              ? 'bg-gradient-to-t from-amber-600 to-rose-600 text-white font-black shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-105 z-10'
                              : slot.engagementScore >= 70
                              ? 'bg-teal-600/40 text-teal-200 border border-teal-500/30'
                              : slot.engagementScore >= 50
                              ? 'bg-white/10 text-gray-300'
                              : 'bg-white/[0.02] text-gray-600'
                          }`}
                        >
                          {slot.isPeak ? '⚡' : slot.engagementScore}
                        </div>
                      ))
                    ) : (
                      Array.from({ length: 24 }).map((_, h) => (
                        <div key={h} className="h-7 rounded-md bg-white/[0.02]"></div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] text-amber-300 italic pt-1">
            💡 <strong>Algoritmik qoida:</strong> Jpilot avtopiloti har kuni aynan <strong>14:00 UTC</strong> (Shorts #1) va <strong>20:00 UTC</strong> (Shorts #2 / Masterclass) da video chiqaradi.
          </p>
        </div>
      )}

      {/* WEEKLY HEADER */}
      {viewMode === 'weekly' && (
        <>
          <div className="liquid-glass rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
                <CalendarIcon size={20} />
              </div>
              <div>
                <h2 className="font-bold text-white text-base">Haftalik Jadval</h2>
                <p className="text-xs text-gray-400">Toshkent vaqti bilan ko'rsatilmoqda (UTC+5)</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Nashr etilgan
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Tasdiqlash kutilmoqda
              </div>
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Rejalashtirilgan
              </div>
            </div>
          </div>

      {/* 7-Day Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {scheduleData.map((day, dayIdx) => (
          <div 
            key={day.day}
            className={`liquid-glass rounded-2xl p-3 border transition-all flex flex-col justify-between animate-fade-in-up ${
              day.isToday 
                ? 'border-red-500/50 bg-red-950/20 shadow-[0_0_20px_rgba(255,0,0,0.15)] animate-pulse-glow' 
                : 'border-white/10'
            }`}
            style={{ animationDelay: `${dayIdx * 60}ms` }}
          >
            {/* Day Title */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div>
                <span className="text-xs font-bold text-gray-300">{day.day}</span>
                <span className="text-[11px] block text-gray-500">{day.date}</span>
              </div>
              {day.isToday && (
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white shadow-sm">
                  Bugun
                </span>
              )}
            </div>

            {/* Slots for this day */}
            <div className="space-y-2.5 flex-1">
              {day.slots.map((slot, idx) => (
                <div 
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                    slot.status === 'published' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                      : slot.status === 'needs_approval'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                      : 'bg-white/[0.04] border-white/10 text-gray-300 hover:border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[10px] text-gray-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {slot.time}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded font-bold ${slot.format === 'shorts' ? 'bg-red-500/30 text-red-300' : 'bg-blue-500/30 text-blue-300'}`}>
                      {slot.format === 'shorts' ? 'Shorts' : '16:9'}
                    </span>
                  </div>

                  <p className="font-semibold text-[11px] text-white line-clamp-2 leading-snug">
                    {slot.title}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className={`font-bold ${
                      slot.status === 'published' ? 'text-emerald-400' :
                      slot.status === 'needs_approval' ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {slot.status === 'published' ? 'Nashr etildi' :
                       slot.status === 'needs_approval' ? 'Tasdiqlash!' : 'Tayyor'}
                    </span>

                    {slot.contentId && (
                      <Link to={`/content/${slot.contentId}`} className="text-red-400 hover:underline">
                        Ochish →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  );
};

export default CalendarPage;
