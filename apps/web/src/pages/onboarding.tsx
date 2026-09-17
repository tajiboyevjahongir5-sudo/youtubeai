import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import { AlertTriangle, CheckCircle, Youtube, MessageCircle, Sparkles, Check } from 'lucide-react';
import { useNavigate } from 'react-router';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    niche: '',
    subNiches: '',
    pillar: 'Ta\'lim',
    audience: '',
    tone: 'Professional',
    format: 'Ikkalasi',
    englishVariant: 'International',
    videoLength: 10,
    timezone: 'Asia/Tashkent',
    dailyTarget: 2,
    approvalMode: 'Qo\'lda',
  });

  const updateForm = (key: string, value: any) => setFormData({ ...formData, [key]: value });

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  const handleFinish = () => navigate('/dashboard');

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* Header Stepper */}
      <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          {[
            { num: 1, label: 'Nisha' },
            { num: 2, label: 'Auditoriya' },
            { num: 3, label: 'Format' },
            { num: 4, label: 'Nashr' },
            { num: 5, label: 'Integratsiya' }
          ].map(s => (
            <div key={s.num} className="flex items-center gap-1.5">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                step > s.num 
                  ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                  : step === s.num 
                  ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(255,0,0,0.5)] ring-2 ring-red-500/30' 
                  : 'bg-white/10 text-gray-400'
              }`}>
                {step > s.num ? <Check size={12} /> : s.num}
              </span>
              <span className={`hidden sm:inline ${step >= s.num ? 'text-white font-bold' : 'text-gray-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(255,0,0,0.5)]" 
            style={{ width: `${(step / 5) * 100}%` }} 
          />
        </div>
      </div>

      <Card className="liquid-glass border border-white/10 shadow-2xl animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles size={20} className="text-red-500" />
            {step === 1 && "Kanal nishasi va yo'nalishi"}
            {step === 2 && "Auditoriya parametrlari"}
            {step === 3 && "Kontent formati"}
            {step === 4 && "Nashr sozlamalari"}
            {step === 5 && "Integratsiyalar"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <Input label="Asosiy nisha" value={formData.niche} onChange={e => updateForm('niche', e.target.value)} placeholder="Masalan: Texnologiyalar & AI" />
              <Input label="Ostki nishalar (vergul bilan)" value={formData.subNiches} onChange={e => updateForm('subNiches', e.target.value)} placeholder="Sun'iy intellekt, dasturlash, SaaS" />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase">Kontent yo'nalishi (Pillar)</label>
                <Select value={formData.pillar} onChange={e => updateForm('pillar', e.target.value)}>
                  <option value="Ta'lim">Ta'limiy & Qo'llanmalar (Educational)</option>
                  <option value="Ko'ngilochar">Yangiliklar & Tahlillar (News & Tech)</option>
                  <option value="Hujjatli">Hujjatli & Chuqur tahlil (Documentary)</option>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <Textarea label="Maqsadli auditoriya" value={formData.audience} onChange={e => updateForm('audience', e.target.value)} placeholder="Auditoriyangiz kimlardan iborat? (Masalan: AQSH va Yevropadagi texnologiya ixlosmandlari)" />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase">Ovoz ohangi (Tone)</label>
                <Select value={formData.tone} onChange={e => updateForm('tone', e.target.value)}>
                  <option value="Professional">Professional & Jiddiy</option>
                  <option value="Do'stona">Samimiy & Tushunarli</option>
                  <option value="Dinamik">Tezkor & Qiziqarli</option>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 uppercase">Format</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
                    <input type="radio" checked={formData.format === 'Uzun'} onChange={() => updateForm('format', 'Uzun')} className="accent-red-500" /> Uzun videolar (16:9)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
                    <input type="radio" checked={formData.format === 'Shorts'} onChange={() => updateForm('format', 'Shorts')} className="accent-red-500" /> Shorts (9:16)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
                    <input type="radio" checked={formData.format === 'Ikkalasi'} onChange={() => updateForm('format', 'Ikkalasi')} className="accent-red-500" /> Ikkalasi (Tavsiya)
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase">Ingliz tili varianti</label>
                <Select value={formData.englishVariant} onChange={e => updateForm('englishVariant', e.target.value)}>
                  <option value="US">Amerika (US - Eng yuqori hajm)</option>
                  <option value="UK">Britaniya (UK)</option>
                  <option value="International">Xalqaro sodda ingliz tili</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase">Video davomiyligi: {formData.videoLength} daqiqa</label>
                <input type="range" min="1" max="60" value={formData.videoLength} onChange={e => updateForm('videoLength', parseInt(e.target.value))} className="w-full accent-red-500" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="liquid-glass rounded-xl p-4 border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-start gap-3 text-xs leading-relaxed">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                <p><strong>Ogohlantirish:</strong> Yuqori CPM davlatlarini nishonga olish daromadni kafolatlamaydi. Natijalar organik ravishda shakllanadi.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase">Vaqt mintaqasi</label>
                <Select value={formData.timezone} onChange={e => updateForm('timezone', e.target.value)}>
                  <option value="Asia/Tashkent">Toshkent (UTC+5)</option>
                  <option value="UTC">UTC (Standart)</option>
                  <option value="America/New_York">New York (EST)</option>
                </Select>
              </div>
              <Input type="number" label="Kunlik maqsad (video soni)" value={formData.dailyTarget} onChange={e => updateForm('dailyTarget', e.target.value)} />
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 uppercase">Tasdiqlash rejimi</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
                    <input type="radio" checked={formData.approvalMode === 'Qo\'lda'} onChange={() => updateForm('approvalMode', 'Qo\'lda')} className="accent-red-500" /> Qo'lda (Inson nazorati)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
                    <input type="radio" checked={formData.approvalMode === 'Avtomatik'} onChange={() => updateForm('approvalMode', 'Avtomatik')} className="accent-red-500" /> Avtomatik (Auto-publish)
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-red-500/30 text-white hover:bg-red-500/10">
                <Youtube className="w-5 h-5 text-red-500" /> YouTube kanalni ulash (OAuth 2.0)
              </Button>
              <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-blue-500/30 text-white hover:bg-blue-500/10">
                <MessageCircle className="w-5 h-5 text-blue-400" /> Telegram botni ulash (@jpilot_bot)
              </Button>
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm py-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <CheckCircle className="w-5 h-5 text-emerald-400" /> Tizim tayyor, boshqaruv paneliga o'tishingiz mumkin
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-white/10">
            <Button variant="outline" onClick={prevStep} disabled={step === 1}>Orqaga</Button>
            {step < 5 ? (
              <Button variant="primary" onClick={nextStep}>Keyingi</Button>
            ) : (
              <Button variant="primary" onClick={handleFinish}>Tugatish va Boshlash</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;
