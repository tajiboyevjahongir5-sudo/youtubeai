import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/page-header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { 
  Settings as SettingsIcon, 
  Youtube, 
  Clock, 
  ShieldAlert, 
  Check, 
  Save, 
  Sliders,
  Globe,
  Bell
} from 'lucide-react';
import { getWorkspaceId } from '../lib/workspace';
import { fetchApi } from '../lib/api';

const SettingsPage = () => {
  const wsId = getWorkspaceId();
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [niche, setNiche] = useState("Texnologiya & AI Avtomatlashtirish");
  const [subNiches, setSubNiches] = useState("Coding, SaaS, Productivity, Python");
  const [audience, setAudience] = useState("AQSH, Kanada va Yevropadagi dasturchilar, frilanserlar va texnologiyaga qiziquvchi mutaxassislar (English speakers).");
  const [englishVariant, setEnglishVariant] = useState("us");
  const [tone, setTone] = useState("professional");
  const [dailyTarget, setDailyTarget] = useState(2);
  const [timezone, setTimezone] = useState("Asia/Tashkent");
  const [approvalMode, setApprovalMode] = useState("manual");

  useEffect(() => {
    fetchApi(`/workspaces/${wsId}`, {}, async () => 'mock_token')
      .then((data: any) => {
        if (data?.settings) {
          const s = data.settings;
          if (s.niche) setNiche(s.niche);
          if (s.subNiches) setSubNiches(s.subNiches);
          if (s.audience) setAudience(s.audience);
          if (s.englishVariant) setEnglishVariant(s.englishVariant);
          if (s.tone) setTone(s.tone);
          if (s.dailyTarget) setDailyTarget(s.dailyTarget);
          if (s.timezone) setTimezone(s.timezone);
          if (s.approvalMode) setApprovalMode(s.approvalMode);
        } else if (data?.niche) {
          setNiche(data.niche);
        }
      })
      .catch(() => {});
  }, [wsId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetchApi(`/workspaces/${wsId}/settings`, {
        method: 'PUT',
        body: JSON.stringify({
          settings: {
            niche,
            subNiches,
            audience,
            englishVariant,
            tone,
            dailyTarget,
            timezone,
            approvalMode
          }
        })
      }, async () => 'mock_token');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader 
        title="Kanal va Tizim Sozlamalari" 
        description="YouTube avtopiloti, nashr vaqtlari va AI parametrlarini sozlang." 
      />

      {/* Legal Policy Alert */}
      <div className="liquid-glass rounded-2xl p-5 border border-amber-500/30 bg-amber-500/5 flex items-start gap-4 animate-fade-in">
        <ShieldAlert size={22} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-gray-300 leading-relaxed space-y-1">
          <span className="font-bold text-amber-300 block">Muhim Ogohlantirish (Disclaimer)</span>
          <p>
            Jpilot mavjud analitikaga asoslanib kontentni optimizatsiya qilishi mumkin, lekin YouTube tavsiyalari, viral natijalar, ko'rishlar, obunachilar yoki daromadni kafolatlay olmaydi. Yuqori CPM davlatlarini tanlash tavsiya hisoblanadi.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Channel Strategy Settings */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5 shadow-xl animate-fade-in-up stagger-1">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-500">
              <Youtube size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Kanal Profil Parametrlari</h3>
              <p className="text-xs text-gray-400">AI kontentni moslashtirishi uchun asosiy nisha</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input 
              label="Asosiy Nisha (Niche)" 
              value={niche} 
              onChange={(e) => setNiche(e.target.value)} 
            />
            <Input 
              label="Sub-nishalar (vergul bilan)" 
              value={subNiches} 
              onChange={(e) => setSubNiches(e.target.value)} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Maqsadli Auditoriya (Target Audience)</label>
            <Textarea 
              value={audience} 
              onChange={(e) => setAudience(e.target.value)} 
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Kontent Ingliz Tili Uslubi</label>
              <Select value={englishVariant} onChange={(e) => setEnglishVariant(e.target.value)}>
                <option value="us">American English (AQSH - Eng yuqori hajm)</option>
                <option value="uk">British English (Buyuk Britaniya)</option>
                <option value="international">Xalqaro soddalashtirilgan Ingliz tili</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Ovoz Toni</label>
              <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                <option value="professional">Professional, jiddiy va ta'sirchan</option>
                <option value="friendly">Samimiy, tushunarli va do'stona</option>
                <option value="dynamic">Tezkor, dinamik va qiziqarli</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Publishing & Automation Rules */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5 shadow-xl animate-fade-in-up stagger-2">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Nashr Qilish Qoidalari</h3>
              <p className="text-xs text-gray-400">Kunlik maqsad va inson tasdig'i</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Kunlik Yuklash Maqsadi</label>
              <Input 
                type="number" 
                value={dailyTarget} 
                onChange={(e) => setDailyTarget(Number(e.target.value))} 
                min="1" 
                max="5" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Vaqt Mintaqasi</label>
              <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
                <option value="UTC">UTC (Standart)</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Tasdiqlash Rejimi</label>
              <Select value={approvalMode} onChange={(e) => setApprovalMode(e.target.value)}>
                <option value="manual">Qo'lda tasdiqlash (Inson nazorati)</option>
                <option value="auto">Avtomatik nashr qilish</option>
              </Select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-white block">Telegram Bildirishnomalari</span>
              <span className="text-gray-400">Har bir video tayyor bo'lganda Telegram'da tasdiqlash tugmasini chiqarish</span>
            </div>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Yoqilgan</span>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Check size={16} /> Sozlamalar saqlandi!
            </span>
          )}
          <Button type="submit" variant="primary" size="lg" className="flex items-center gap-2 shadow-lg">
            <Save size={18} /> Sozlamalarni saqlash
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
