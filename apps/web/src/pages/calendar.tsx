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
  AlertCircle 
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
      // Past day in current week
      slots.push({
        time: '19:00',
        utc: '14:00 UTC',
        title: 'Why 90% of Devs Use AI #Shorts',
        format: 'shorts',
        status: 'published',
        contentId: 'item_3'
      });
    } else {
      // Future day in current week
      slots.push({
        time: '19:00',
        utc: '14:00 UTC',
        title: `AI Blueprint & Tech Trends #${i + 1}`,
        format: i % 2 === 0 ? 'shorts' : 'long_form',
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
        title="Nashr taqvimi" 
        description="Kunlik 2 ta video rejasi (14:00 UTC va 21:00 UTC oynalari)."
        actions={
          <div className="flex items-center gap-3">
            <Link to="/content/new">
              <Button variant="primary" className="flex items-center gap-2">
                <Plus size={16} /> Yangi vaqtga rejalashtirish
              </Button>
            </Link>
          </div>
        }
      />

      {/* Week Header */}
      <div className="liquid-glass rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">Oktabr 2026, 3-hafta</h2>
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
    </div>
  );
};

export default CalendarPage;
