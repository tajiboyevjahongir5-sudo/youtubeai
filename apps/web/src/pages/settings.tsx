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
  Bell,
  Mic,
  Sparkles,
  User,
  Camera
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
  const [approvalMode, setApprovalMode] = useState("auto");
  const [autoPilotEnabled, setAutoPilotEnabled] = useState(true);
  const [publishTime1, setPublishTime1] = useState("14:00");
  const [publishTime2, setPublishTime2] = useState("20:00");
  const [autoGenerateIfEmpty, setAutoGenerateIfEmpty] = useState(true);
  const [voiceModel, setVoiceModel] = useState("en-US-ChristopherNeural");
  const [autoTitleAbTest, setAutoTitleAbTest] = useState(true);
  const [hostAvatar, setHostAvatar] = useState('alex');
  const [customHostImage, setCustomHostImage] = useState('');

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
          if (s.autoPilotEnabled !== undefined) setAutoPilotEnabled(s.autoPilotEnabled);
          if (s.autoGenerateIfEmpty !== undefined) setAutoGenerateIfEmpty(s.autoGenerateIfEmpty);
          if (s.voiceModel) setVoiceModel(s.voiceModel);
          if (s.autoTitleAbTest !== undefined) setAutoTitleAbTest(s.autoTitleAbTest);
          if (s.hostAvatar) setHostAvatar(s.hostAvatar);
          if (s.customHostImage) setCustomHostImage(s.customHostImage);
          if (Array.isArray(s.publishTimes)) {
            if (s.publishTimes[0]) setPublishTime1(s.publishTimes[0]);
            if (s.publishTimes[1]) setPublishTime2(s.publishTimes[1]);
          }
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
            approvalMode,
            autoPilotEnabled,
            autoGenerateIfEmpty,
            voiceModel,
            autoTitleAbTest,
            hostAvatar,
            customHostImage,
            publishTimes: [publishTime1, publishTime2].filter(Boolean)
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

        {/* Multi-Voice Studio & Sound Architecture */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5 shadow-xl animate-fade-in-up stagger-2">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
              <Mic size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Multi-Voice Studio (AI Ovoz Studiyasi)</h3>
              <p className="text-xs text-gray-400">Microsoft Azure Neural Speech asosidagi yuqori sifatli ovoz modellari</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Standart Ovoz Modeli</label>
            <Select value={voiceModel} onChange={(e) => setVoiceModel(e.target.value)}>
              <option value="en-US-ChristopherNeural">Alex (en-US-ChristopherNeural) — Jiddiy, Texnologik & AI Ekspert (Standart)</option>
              <option value="en-US-GuyNeural">Brian (en-US-GuyNeural) — Yuqori Energiya & Tezkor Viral Ovoz</option>
              <option value="en-US-EricNeural">Eric (en-US-EricNeural) — Hujjatli Film & Nufuzli Ovoz</option>
              <option value="en-US-JennyNeural">Jenny (en-US-JennyNeural) — Samimiy & Jonli Ayol Ovozi</option>
              <option value="en-US-AriaNeural">Aria (en-US-AriaNeural) — Dinamik Texnologik Hikoyachi (Ayol)</option>
              <option value="uz-UZ-SardorNeural">Sardor (uz-UZ-SardorNeural) — Tabiiy O'zbek Tili Ovoz Modeli</option>
              <option value="es-ES-AlvaroNeural">Alvaro (es-ES-AlvaroNeural) — Standart Ispan Tili Ovoz Modeli</option>
            </Select>
            <p className="text-[11px] text-gray-400 mt-1">
              * Tanlangan ovoz modeli video generatsiyasida nutq tezligi (+14%) va intonatsiyani avtomatik moslashtiradi.
            </p>
          </div>
        </div>

        {/* Multi-Host & Avatar Studio */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Multi-Host & Avatar Studiyasi (Virtual Boshlovchilar)</h3>
                <p className="text-xs text-gray-400">Videolarda chiqadigan doimiy inson siymosi va xavfsiz yuz zonasi (100% Safe Zone)</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              Host: {hostAvatar.toUpperCase()}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'alex',
                name: 'Alex',
                badge: 'Standart',
                role: 'AI & Tech Mutaxassisi',
                desc: 'Neural Pulse AI ning rasmiy yuzi. Ishonchli, texnologik va nufuzli ko\'rinish.',
                border: 'border-cyan-500/50',
                activeBg: 'bg-cyan-500/10'
              },
              {
                id: 'sarah',
                name: 'Sarah',
                badge: 'Futuristik',
                role: 'AI Tadqiqotchi',
                desc: 'Chuqur neyron tarmoqlar, yangi modellar va ilmiy kashfiyotlar uchun ideal.',
                border: 'border-purple-500/50',
                activeBg: 'bg-purple-500/10'
              },
              {
                id: 'marcus',
                name: 'Marcus',
                badge: 'Kiberxavfsizlik',
                role: 'DevOps & Kiber Ekspert',
                desc: 'Xavfsizlik, Linux, dark web tahlillari va backend tizimlariga mos.',
                border: 'border-emerald-500/50',
                activeBg: 'bg-emerald-500/10'
              },
              {
                id: 'elena',
                name: 'Elena',
                badge: 'SaaS Asoschisi',
                role: 'Biznes & Monetizatsiya',
                desc: 'Passiv daromad, AI bilan startap qurish va marketing strategiyalari.',
                border: 'border-amber-500/50',
                activeBg: 'bg-amber-500/10'
              }
            ].map((avatar) => {
              const isSelected = hostAvatar === avatar.id;
              return (
                <div
                  key={avatar.id}
                  onClick={() => setHostAvatar(avatar.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected 
                      ? `${avatar.border} ${avatar.activeBg} shadow-lg ring-1 ring-white/20` 
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-white/10 to-white/20 flex items-center justify-center font-bold text-sm text-white">
                      {avatar.name[0]}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                      {avatar.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {avatar.name}
                      {isSelected && <Check size={14} className="text-cyan-400" />}
                    </h4>
                    <p className="text-[11px] text-cyan-400/90 font-medium">{avatar.role}</p>
                    <p className="text-[10px] text-gray-400 mt-1 leading-snug">{avatar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Host / Face Zone Guarantee */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <Camera size={16} className="text-gray-400" />
              <span className="text-xs font-bold text-white">Shaxsiy Avatar / Surat Yo'li (Ixtiyoriy)</span>
            </div>
            <div className="flex gap-3">
              <Input
                placeholder="Fayl yo'li yoki avatar identifikatori (masalan: custom_avatar.png)"
                value={customHostImage}
                onChange={(e) => {
                  setCustomHostImage(e.target.value);
                  if (e.target.value) setHostAvatar('custom');
                }}
                className="text-xs"
              />
              {customHostImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCustomHostImage('');
                    setHostAvatar('alex');
                  }}
                  className="whitespace-nowrap text-xs"
                >
                  Tozalash
                </Button>
              )}
            </div>
            <p className="text-[11px] text-gray-400">
              * Neural Pulse AI standarti bo'yicha: Boshlovchining yuzi (y: 100-1240) hech qachon sarlavha yoki subtitr bilan to'silmaydi (100% Unobstructed Safe Zone).
            </p>
          </div>
        </div>

        {/* Publishing & Automation Rules */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">YouTube Avtopilot & Kunlik Nashr Qoidalari</h3>
                <p className="text-xs text-gray-400">Har kuni o'z vaqtida inson aralashuvisiz YouTube'ga avtomatik yuklash</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                autoPilotEnabled ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-400'
              }`}>
                {autoPilotEnabled ? 'Avtopilot: Faol (24/7)' : 'Avtopilot: O\'chirilgan'}
              </span>
            </div>
          </div>

          {/* Auto-Pilot Toggle Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-transparent border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-sm font-bold text-white block">Har Kuni O'z Vaqtida Avtomatik Nashr Qilish</span>
              <span className="text-xs text-gray-300">
                Belgilangan soatlarda tizim avtomatik ravishda videoni render qiladi va kanalingizga yuklaydi.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAutoPilotEnabled(!autoPilotEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                autoPilotEnabled ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg' : 'bg-white/10 hover:bg-white/15 text-gray-300'
              }`}
            >
              {autoPilotEnabled ? '✅ Yoqilgan' : 'O\'chirilgan'}
            </button>
          </div>

          {/* Daily Schedule Slots */}
          <div className="space-y-3">
            <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase block">
              Kunlik Aniq Yuklash Soatlari (Toshkent vaqti bilan)
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <span className="text-xs text-gray-400 font-semibold block">1-Slot (Kunduzgi nashr):</span>
                <Input 
                  type="time" 
                  value={publishTime1} 
                  onChange={(e) => setPublishTime1(e.target.value)} 
                  className="font-mono text-sm"
                />
                <span className="text-[10px] text-gray-400">Tavsiya: 14:00 (O'zbekiston & Markaziy Osiyo aud.)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <span className="text-xs text-gray-400 font-semibold block">2-Slot (Kechki / US Peak):</span>
                <Input 
                  type="time" 
                  value={publishTime2} 
                  onChange={(e) => setPublishTime2(e.target.value)} 
                  className="font-mono text-sm"
                />
                <span className="text-[10px] text-amber-400">Tavsiya: 20:00 (AQSH va Yevropa auditoriyasi uyg'onishi)</span>
              </div>
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
                <option value="auto">Avtomatik nashr qilish (Avtopilot)</option>
                <option value="manual">Qo'lda tasdiqlash (Inson nazorati)</option>
              </Select>
            </div>
          </div>

          {/* Autonomous Topic Fallback */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Avtomatik AI Kontent Generator (Smart Pipeline)</span>
              <span className="text-gray-400">
                Agar rejalashtirilgan video qolmasa, Gemini o'zi yangi dolzarb mavzuni topib, o'z vaqtida videoni chiqaradi.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAutoGenerateIfEmpty(!autoGenerateIfEmpty)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                autoGenerateIfEmpty ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-gray-400'
              }`}
            >
              {autoGenerateIfEmpty ? 'Yoqilgan' : 'O\'chirilgan'}
            </button>
          </div>

          {/* Auto A/B Title Switcher */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Avtomatik A/B Sarlavha Almashtirish (Auto Title Switcher)</span>
              <span className="text-gray-400">
                Agar video dastlabki 8-24 soat ichida past CTR ko'rsatsa (&lt;300 views), YouTube sarlavhasi avtomatik 2-variant (Urgency/Curiosity hook)ga o'zgartiriladi.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAutoTitleAbTest(!autoTitleAbTest)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                autoTitleAbTest ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-gray-400'
              }`}
            >
              {autoTitleAbTest ? 'Yoqilgan' : 'O\'chirilgan'}
            </button>
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
