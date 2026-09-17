import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../components/ui/page-header';
import { StatusBadge } from '../components/ui/status-badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  Play, 
  Pause, 
  Check, 
  AlertCircle, 
  Edit3, 
  Sparkles, 
  ShieldCheck, 
  Youtube, 
  Clock, 
  ArrowRight, 
  RefreshCw, 
  Film, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Layers, 
  Wand2 
} from 'lucide-react';
import { Link } from 'react-router';

type FlowStatus = 'awaiting_generation' | 'generating' | 'ready_for_review' | 'uploading' | 'published';

export const ContentDetailPage = () => {
  const [activeTab, setActiveTab] = useState('tasdiqlash');
  const [status, setStatus] = useState<FlowStatus>('ready_for_review');
  const [genProgress, setGenProgress] = useState(100);
  const [genStep, setGenStep] = useState('Video muvaffaqiyatli tayyorlandi!');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(55.63);
  const [videoVersion, setVideoVersion] = useState(Date.now());
  const [toast, setToast] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const scenes = [
    { id: 'hook', title: '1. Hook (Kirish)', time: 0, tag: '🚨 Alex Hook' },
    { id: 'tool1', title: '2. AutoFlow 2.0', time: 10.6, tag: '🤖 AutoFlow' },
    { id: 'tool2', title: '3. VoicePilot', time: 19.5, tag: '🎙️ VoicePilot' },
    { id: 'tool3', title: '4. DevEngine', time: 28.1, tag: '💻 DevEngine' },
    { id: 'tool4', title: '5. Synthetix', time: 37.3, tag: '🚀 Synthetix' },
    { id: 'outro', title: '6. Obuna (CTA)', time: 46.8, tag: '🔔 Obuna CTA' },
  ];

  const jumpToScene = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // 1-bosqich: Generatsiyani boshlash
  const handleStartGeneration = () => {
    setStatus('generating');
    setGenProgress(15);
    setGenStep('1/4: ElevenLabs AI orqali inglizcha diktor ovozi yaratilmoqda...');

    setTimeout(() => {
      setGenProgress(45);
      setGenStep('2/4: Alex personaji qulfi bilan 5 ta mikrosahna generatsiya qilinmoqda (I2V)...');
    }, 1200);

    setTimeout(() => {
      setGenProgress(75);
      setGenStep('3/4: FFmpeg yordamida kliplar ulanmoqda va dinamik o\'tishlar qo\'yilmoqda...');
    }, 2400);

    setTimeout(() => {
      setGenProgress(95);
      setGenStep('4/4: Rangli karaoke subtitrlar va orqa fon musiqasi sinxronlanmoqda...');
    }, 3600);

    setTimeout(() => {
      setGenProgress(100);
      setStatus('ready_for_review');
      setToast('🎬 Video tayyor bo\'ldi! Videoni ko\'rib chiqing va YouTube\'ga yuklashni tasdiqlang.');
      setTimeout(() => setToast(null), 6000);
    }, 4500);
  };

  const [publishedVideoUrl, setPublishedVideoUrl] = useState<string | null>(null);
  const [publishedVideoId, setPublishedVideoId] = useState<string | null>(null);
  const [isAuthNeeded, setIsAuthNeeded] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  // 2-bosqich: YouTube'ga yuklash
  const handlePublishToYouTube = async () => {
    setStatus('uploading');
    setToast('⏳ Video YouTube Data API orqali Neural Pulse AI kanaliga yuklanmoqda... Kuting...');
    try {
      const res = await fetch('/api/workspaces/default/content/item_1/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Top 5 AI Tools That Work While You Sleep in 2026 #shorts",
          privacyStatus: "public"
        })
      });
      const data = await res.json();
      
      if (data.success && data.youtubeVideoId) {
        setStatus('published');
        setPublishedVideoId(data.youtubeVideoId);
        setPublishedVideoUrl(data.youtubeUrl || `https://youtube.com/shorts/${data.youtubeVideoId}`);
        setToast(`🎉 Video YouTube'ga haqiqatan yuklandi! Havola: ${data.youtubeUrl}`);
      } else if (data.error === 'youtube_not_authenticated' || res.status === 401) {
        setStatus('ready_for_review');
        setIsAuthNeeded(true);
        if (data.authUrl) {
          setAuthUrl(data.authUrl);
          window.open(data.authUrl, '_blank', 'width=650,height=750');
        }
        setToast(`⚠️ YouTube hisobingiz ulanmagan! Ulanish oynasi ochildi. Google ruxsatini tasdiqlang.`);
      } else {
        setStatus('ready_for_review');
        setToast(`❌ Yuklashda xatolik: ${data.error || data.message || 'Xatolik yuz berdi'}`);
      }
    } catch (e: any) {
      setStatus('ready_for_review');
      setToast(`❌ Tarmoq xatosi: ${e?.message || 'Serverga ulanib bo\'lmadi'}`);
    }
  };

  const renderProgressBar = () => {
    const steps = ['G\'oya', 'Skript & Personaj', 'Video Generatsiya', 'Ko\'rish (Preview)', 'YouTube Nashr'];
    let currentIdx = 1;
    if (status === 'awaiting_generation') currentIdx = 2;
    if (status === 'generating') currentIdx = 2;
    if (status === 'ready_for_review') currentIdx = 3;
    if (status === 'uploading' || status === 'published') currentIdx = 4;

    return (
      <div className="liquid-glass rounded-2xl p-6 border border-white/10 mb-8 animate-fade-in">
        <div className="flex items-center justify-between w-full relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 -z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_12px_rgba(255,0,0,0.6)] -z-0 transition-all duration-500" 
            style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
          ></div>
          {steps.map((step, idx) => (
            <div key={step} className={`flex flex-col items-center gap-2 z-10 ${idx <= currentIdx ? 'text-red-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs backdrop-blur-md border-2 transition-all ${
                idx < currentIdx 
                  ? 'bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(255,0,0,0.5)]' 
                  : idx === currentIdx
                  ? 'bg-[#0f0f15] border-red-500 text-red-400 ring-4 ring-red-500/20 animate-pulse'
                  : 'bg-[#151520] border-white/10 text-gray-500'
              }`}>
                {idx < currentIdx ? <Check size={14} /> : idx + 1}
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#0f0f15]/80 backdrop-blur-sm text-center">
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <PageHeader 
        title="Top 5 AI Tools That Work While You Sleep in 2026" 
        description="YouTube Shorts formati uchun ingliz tilida tayyorlangan material."
        actions={<StatusBadge status={status} />} 
      />

      {toast && (
        <div className="liquid-glass rounded-2xl p-4 border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 flex items-center gap-3 animate-fade-in text-sm font-semibold shadow-xl">
          <Check size={20} className="text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}
      
      {renderProgressBar()}

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex border-b border-white/10 mb-6 gap-2 overflow-x-auto">
          {[
            { id: 'brief', label: 'Brief' },
            { id: 'skript', label: 'Skript' },
            { id: 'personaj', label: 'Personaj & Konsistentlik' },
            { id: 'metadata', label: 'SEO Metadata' },
            { id: 'sifat tekshiruvi', label: 'Sifat tekshiruvi' },
            { id: 'tasdiqlash', label: 'Tasdiqlash & Video Studio' },
          ].map(tab => (
            <Tabs.Trigger 
              key={tab.id} 
              value={tab.id}
              className={`px-5 py-2.5 font-semibold text-xs sm:text-sm transition-all border-b-2 -mb-px rounded-t-xl cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-red-500 text-white bg-white/[0.04] shadow-[0_0_15px_rgba(255,0,0,0.15)]' 
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/20'
              }`}
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Brief */}
        <Tabs.Content value="brief" className="space-y-4 animate-fade-in">
          <Card className="liquid-glass border border-white/10">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Video Brief & Konsept</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Ushbu video 2026-yilgi eng so'nggi AI avtomatlashtirish vositalarini qisqa va ta'sirchan uslubda yoritadi.
                Dastlabki 3 sekundda kuchli "Hook" orqali tomoshabin e'tibori jalb qilinadi.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="text-xs text-gray-400 font-medium">Maqsadli Auditoriya</span>
                  <p className="text-sm font-bold text-white">AQSH, Buyuk Britaniya, Kanada (High CPM)</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="text-xs text-gray-400 font-medium">Davomiyligi va Format</span>
                  <p className="text-sm font-bold text-white">58 soniya • Vertical 9:16 (#Shorts)</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <Button variant="secondary"><Edit3 size={16} className="mr-2" /> Briefni tahrirlash</Button>
                <Button variant="primary"><Sparkles size={16} className="mr-2" /> Skriptni qayta generatsiya qilish</Button>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Script */}
        <Tabs.Content value="skript" className="space-y-4 animate-fade-in">
          <Card className="liquid-glass border border-white/10">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">Ingliz tilidagi to'liq skript (52-58s)</h3>
                  <p className="text-xs text-gray-400">Har bir sahna va ovoz ko'rsatmalari</p>
                </div>
                <Button variant="outline" size="sm">Qayta yozish (AI)</Button>
              </div>
              <Textarea 
                className="min-h-[300px] font-mono text-xs leading-relaxed" 
                defaultValue={`[0:00 - 0:03] HOOK (Fast camera zoom in):
"Stop trading your time for money. These 5 AI tools run 24/7 so you don't have to."

[0:04 - 0:15] TOOL 1 (On screen text: AutoFlow 2.0):
"First: AutoFlow 2.0. It connects your email, calendar, and Notion to execute tasks automatically while you sleep."

[0:16 - 0:28] TOOL 2 (Visual demonstration):
"Second: VoicePilot. Turn any 1-minute voice memo into full production-ready articles and scripts in 30 seconds."

[0:29 - 0:45] TOOLS 3 & 4:
"Third: DevEngine for autonomous code debugging. Fourth: Synthetix for social media repurposing."

[0:46 - 0:58] CTA & CLOSING:
"Which one are you trying first? Comment below and subscribe to Neural Pulse AI for daily blueprints!"`} 
              />
              <Button variant="primary">O'zgarishlarni saqlash</Button>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Character & Visual Consistency Anchor */}
        <Tabs.Content value="personaj" className="space-y-6 animate-fade-in">
          <Card className="liquid-glass border border-white/10">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-red-500" />
                    Personaj va Vizual Konsistentlik Tizimi (Character Anchor)
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Barcha 5 ta sahnada personaj yuzi, kiyimi, ko'zoynagi va studiya yorug'ligi o'zgarmasligi ta'minlangan.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                  Konsistentlik holati: 100% Qulflangan (Locked)
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-6 items-center">
                <div className="space-y-2">
                  <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl relative group">
                    <img 
                      src="/host_alex.jpg" 
                      alt="Alex - Character Anchor" 
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-center">
                      <span className="text-xs font-bold text-white">Alex (Etalon Boshlovchi)</span>
                      <span className="text-[10px] block text-red-400">Neural Pulse AI Rasmiy Avatari</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 text-center">
                    Etalon rasm: Barcha sahnalar Image-to-Video usulida aynan shu yuzga asoslanadi.
                  </p>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">1. Face ID & Qiyofa Qulfi (IP-Adapter Anchor)</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        27 yoshli dasturchi yuzi, qisqa qora soch turmagi va tabassumi barcha sahnalarda yuz tanish algoritmi bilan mahkamlangan.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">2. Kiyim & Brend Atributlari (Wardrobe Lock)</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mat qora rangli kiber-hoodie, yoqa bo'ylab qizil neon chiziqlar va ko'kragida "Neural Pulse AI" brend yozuvi.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">3. Aksessuarlar (Prop Anchor)</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Har bir kadrda shaffof qizil neon kiber-ko'zoynak mavjud bo'lib, personaj tanilishini ta'minlaydi.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">4. Studiya Yoritilishi (Environment Anchor)</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Qora titan laboratoriya foni, nozik qizil va ko'k neon aks-sado chiroqlari (cinematic rim-lighting).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Metadata */}
        <Tabs.Content value="metadata" className="space-y-4 animate-fade-in">
          <Card className="liquid-glass border border-white/10">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">YouTube SEO Metadata</h3>
                  <p className="text-xs text-gray-400">Qidiruv va tavsiyalarga moslashtirilgan</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  SEO Bali: 94 / 100
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Asosiy Sarlavha (Title)</label>
                <Input defaultValue="Top 5 AI Tools That Work While You Sleep in 2026" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Tavsif (Description)</label>
                <Textarea 
                  className="min-h-[120px]" 
                  defaultValue={`Here are the top 5 AI tools that will automate your business, coding, and content workflow in 2026.

⏰ Timestamps:
0:00 - Introduction & Hook
0:04 - Tool 1: Workflow Automation
0:16 - Tool 2: Voice Repurposing
0:29 - Tool 3: Autonomous Coding
0:46 - Summary & Next Steps

#AITools #Automation #ArtificialIntelligence #Tech2026 #Productivity`} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Teglar (Tags)</label>
                <Input defaultValue="ai tools 2026, automation, productivity, chatgpt, artificial intelligence, make money with ai, coding agents" />
              </div>

              <Button variant="primary">Metadatani saqlash</Button>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Quality Review */}
        <Tabs.Content value="sifat tekshiruvi" className="space-y-4 animate-fade-in">
          <div className="liquid-glass rounded-2xl p-6 border border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Avtomatik Sifat Tekshiruvi Natijalari</h3>
                <p className="text-xs text-gray-400">YouTube hamjamiyat qoidalari va mualliflik huquqi tekshiruvi</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">Mualliflik huquqi xavfi (Copyright):</span>
                <span className="font-bold text-emerald-400">Xavfsiz (100% original)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">Spam / Deceptive xavfi:</span>
                <span className="font-bold text-emerald-400">Past xavf</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">Hook kuchi (Birinchi 3s):</span>
                <span className="font-bold text-emerald-400">Juda kuchli (92%)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">Synthetic Media Disclosure:</span>
                <span className="font-bold text-blue-400">Belgilandi (AI disclosure)</span>
              </div>
            </div>
          </div>
        </Tabs.Content>

        {/* Approval & Two-Stage Video Studio */}
        <Tabs.Content value="tasdiqlash" className="space-y-6 animate-fade-in">
          {/* STAGE 1: AWAITING GENERATION */}
          {status === 'awaiting_generation' && (
            <div className="liquid-glass-red rounded-3xl p-8 border border-red-500/30 text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mx-auto">
                <Film size={32} />
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                  1-Bosqich: Skript & Personajni Tasdiqlash
                </span>
                <h3 className="text-2xl font-black text-white">Videoni generatsiya qilishga ruxsat berasizmi?</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Inglizcha skript, Alex boshlovchi personaji va SEO metadatalari tayyor. Tasdiqlaganingizdan so'ng AI ovoz, 5 ta kadr va montajni amalga oshiradi. 
                  <strong className="text-white block mt-1">Video tayyor bo'lgach, sizga to'liq ko'rsatiladi va ikkinchi marta tasdiqlaganingizdagina YouTube'ga yuklanadi!</strong>
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Button variant="outline" className="px-8">
                  Skriptni o'zgartirish
                </Button>
                <Button variant="primary" className="px-10 shadow-xl" onClick={handleStartGeneration}>
                  <Wand2 size={18} className="mr-2" /> 1. Videoni Generatsiya Qilishni Boshlash
                </Button>
              </div>
            </div>
          )}

          {/* GENERATING PROGRESS */}
          {status === 'generating' && (
            <div className="liquid-glass rounded-3xl p-8 border border-white/15 text-center space-y-6 shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mx-auto animate-spin">
                <RefreshCw size={32} />
              </div>
              <div className="space-y-3 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-white">AI Video Studio Render Qilmoqda...</h3>
                <p className="text-xs text-red-400 font-mono animate-pulse">{genStep}</p>
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div 
                    className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(255,0,0,0.8)]"
                    style={{ width: `${genProgress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-400 block">{genProgress}% bajarildi</span>
              </div>
            </div>
          )}

          {/* STAGE 2: READY FOR REVIEW & PREVIEW */}
          {status === 'ready_for_review' && (
            <div className="space-y-6 animate-fade-in">
              <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/15 grid md:grid-cols-12 gap-8 items-center shadow-2xl">
                {/* Vertical Shorts Real HTML5 Video Player */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="w-[290px] h-[515px] rounded-[38px] border-4 border-white/20 bg-black overflow-hidden relative shadow-[0_0_50px_rgba(255,0,0,0.4)] flex flex-col justify-center bg-zinc-950 group select-none">
                    <video 
                      ref={videoRef}
                      src={`/neural_pulse_short.mp4?v=${videoVersion}`} 
                      poster={`/host_alex.jpg?v=${videoVersion}`} 
                      playsInline
                      loop
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                      onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 55.63)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={togglePlay}
                    />

                    {/* Big Center Play Overlay (when paused) */}
                    {!isPlaying && (
                      <div 
                        onClick={togglePlay}
                        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/35"
                      >
                        <div className="w-20 h-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-[0_0_35px_rgba(255,0,0,0.85)] transform transition-transform hover:scale-110 active:scale-95">
                          <Play size={36} className="ml-1.5 fill-white" />
                        </div>
                        <span className="mt-4 text-xs font-bold text-white bg-black/75 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
                          ▶ Videoni tomosha qilish
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold mt-1.5 bg-black/60 px-2 py-0.5 rounded-md">
                          🔊 Tabiiy Studio Diktor Ovozli
                        </span>
                      </div>
                    )}

                    {/* Bottom Custom Control Bar */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-1.5 opacity-90 transition-opacity hover:opacity-100">
                      {/* Scrubber track */}
                      <div 
                        className="w-full h-1.5 bg-white/25 rounded-full cursor-pointer overflow-hidden"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const pos = (e.clientX - rect.left) / rect.width;
                          jumpToScene(pos * duration);
                        }}
                      >
                        <div 
                          className="bg-red-500 h-full rounded-full transition-all"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-white text-[11px] font-semibold pt-1">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={togglePlay}
                            className="p-1 rounded hover:bg-white/20 transition-colors"
                          >
                            {isPlaying ? <Pause size={14} className="fill-white" /> : <Play size={14} className="fill-white" />}
                          </button>
                          <button 
                            onClick={toggleMute}
                            className="p-1 rounded hover:bg-white/20 transition-colors"
                          >
                            {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-emerald-400" />}
                          </button>
                        </div>
                        <span className="font-mono text-[10px] text-gray-300">
                          {Math.floor(currentTime)}s / {Math.floor(duration)}s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Scene Jumper Chips */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5 justify-center max-w-[310px]">
                    {scenes.map(s => {
                      const isActive = currentTime >= s.time && (s.id === 'outro' || currentTime < (scenes[scenes.indexOf(s)+1]?.time || 999));
                      return (
                        <button
                          key={s.id}
                          onClick={() => jumpToScene(s.time)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-red-500/25 text-red-300 border-red-500/60 shadow-[0_0_12px_rgba(255,0,0,0.35)] scale-105'
                              : 'bg-white/[0.05] text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {s.tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Video Info & Final Approval Action */}
                <div className="md:col-span-7 space-y-5">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
                      2-Bosqich: Multi-Scene Video Tayyor (Ko'rish & Tasdiqlash)
                    </span>
                    <h3 className="text-2xl font-black text-white">Video to'liq tayyor! YouTube'ga yuklaymizmi?</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      AI 6 ta alohida sahnani ketma-ket montaj qildi: <strong>Alex personaji</strong>, <strong>AutoFlow 2.0</strong>, <strong>VoicePilot</strong>, <strong>DevEngine</strong> va <strong>Synthetix</strong>. 
                      Microsoft Azure Neural Studio ovozi va ritmik fon musiqasi to'liq sinxronlandi.
                    </p>
                  </div>

                  {/* Video Specs Table */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-gray-400 block">Format & AI Video Footage</span>
                      <span className="font-bold text-white">1080x1920 • Hailuo AI & 2K B-Roll</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-gray-400 block">Davomiyligi & Bitrate</span>
                      <span className="font-bold text-white">45.4s • 3.5 Mbps Ultra-HD</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-gray-400 block">Audio & Ovoz Dizayni</span>
                      <span className="font-bold text-emerald-400">Azure Neural + 5 ta Sinematik SFX</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-gray-400 block">Fayl hajmi & Master</span>
                      <span className="font-bold text-white">20.0 MB (High Profile H.264)</span>
                    </div>
                  </div>

                  {/* Final Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <a 
                      href={`/neural_pulse_short.mp4?v=${videoVersion}`} 
                      download="neural_pulse_short.mp4"
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 transition-all flex items-center gap-1.5"
                    >
                      📥 Videoni yuklab olish (MP4)
                    </a>
                    <Button variant="outline" size="sm" onClick={() => {
                      setVideoVersion(Date.now());
                      handleStartGeneration();
                    }}>
                      <RefreshCw size={14} className="mr-1.5" /> Qayta render
                    </Button>
                    {isAuthNeeded && authUrl && (
                      <a
                        href={authUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-all flex items-center gap-1.5 animate-pulse"
                      >
                        <Youtube size={16} /> 1. YouTube OAuth Ruxsat Berish
                      </a>
                    )}
                    <Button variant="primary" size="lg" className="shadow-2xl" onClick={handlePublishToYouTube}>
                      <Youtube size={20} className="mr-2 fill-white" /> 2. YouTube'ga Yuklash va Nashr Qilish
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* UPLOADING STATE */}
          {status === 'uploading' && (
            <div className="liquid-glass rounded-3xl p-8 border border-red-500/30 text-center space-y-6 shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mx-auto animate-bounce">
                <Youtube size={32} />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-white">YouTube Studio'ga Yuklanmoqda...</h3>
                <p className="text-xs text-gray-300">
                  YouTube Data API v3 orqali <strong>Neural Pulse AI</strong> kanaliga yuklanmoqda (Resumable Upload)...
                </p>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-600 h-full w-4/5 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: PUBLISHED */}
          {status === 'published' && (
            <div className="liquid-glass rounded-3xl p-8 border border-emerald-500/40 bg-emerald-950/20 text-center space-y-6 shadow-2xl animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <Check size={42} />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20">
                  Muvaffaqiyatli Nashr Etildi!
                </span>
                <h3 className="text-2xl font-black text-white">Video Neural Pulse AI kanalida jonli!</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Video YouTube hamjamiyat qoidalariga to'liq mos holda rasmiy API orqali kanalingizga yuklandi. Endi u tavsiyalar va Shorts tasmasida ko'rina boshlaydi.
                </p>
                {publishedVideoId && (
                  <div className="inline-block mt-2">
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                      YouTube Video ID: {publishedVideoId}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <a 
                  href={publishedVideoUrl || (publishedVideoId ? `https://youtube.com/shorts/${publishedVideoId}` : "https://youtube.com/@NeuralPulseAI-m3e")} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-xl transition-all flex items-center gap-2"
                >
                  <Youtube size={18} className="fill-white" /> To'g'ridan-to'g'ri Shorts'da Ko'rish <ExternalLink size={14} />
                </a>
                <a 
                  href="https://youtube.com/@NeuralPulseAI-m3e" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 transition-all flex items-center gap-2"
                >
                  Kanalni ko'rish <ExternalLink size={14} />
                </a>
                <Link to="/content">
                  <Button variant="outline" className="px-8 py-3">
                    Boshqa videolarni ko'rish
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

export default ContentDetailPage;
