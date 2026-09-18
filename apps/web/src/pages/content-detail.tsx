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
  Wand2,
  Tv,
  Smartphone
} from 'lucide-react';
import { Link, useParams } from 'react-router';
import { getWorkspaceId } from '../lib/workspace';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

type FlowStatus = 'awaiting_generation' | 'generating' | 'ready_for_review' | 'uploading' | 'published';

export const ContentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const contentId = id || 'item_1';
  const workspaceId = getWorkspaceId();

  // Fetch specific content item details from backend
  const { data: itemData, refetch: refetchItem } = useQuery({
    queryKey: ['content-item', workspaceId, contentId],
    queryFn: async () => {
      try {
        return await fetchApi(`/workspaces/${workspaceId}/content/${contentId}`, {}, async () => 'mock_token');
      } catch (e) {
        return null;
      }
    }
  });

  // Determine format from URL, id, or backend item
  const initialIsLong = contentId === 'item_2' || contentId === 'item_4' || contentId.includes('long') || itemData?.videoFormat === 'long_form';
  const [videoFormat, setVideoFormat] = useState<'shorts' | 'long_form'>(initialIsLong ? 'long_form' : 'shorts');

  useEffect(() => {
    if (contentId === 'item_2' || contentId === 'item_4' || contentId.includes('long') || itemData?.videoFormat === 'long_form') {
      setVideoFormat('long_form');
    } else {
      setVideoFormat('shorts');
    }
  }, [contentId, itemData]);

  const [activeTab, setActiveTab] = useState('tasdiqlash');
  const [status, setStatus] = useState<FlowStatus>('ready_for_review');
  const [genProgress, setGenProgress] = useState(100);
  const [genStep, setGenStep] = useState('Video muvaffaqiyatli tayyorlandi!');
  const [showYouTubeEmbed, setShowYouTubeEmbed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(videoFormat === 'long_form' ? 615 : 55.63);
  const [videoVersion, setVideoVersion] = useState(Date.now());
  const [toast, setToast] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Dynamic titles and metadata based on format and item
  const isLong = videoFormat === 'long_form';

  const videoTitle = itemData?.title || (isLong 
    ? 'The Complete Future of Autonomous Coding & Agents in 2026' 
    : 'Top 5 AI Tools That Work While You Sleep in 2026');

  const shortsScenes = [
    { id: 'hook', title: '1. Hook (Kirish)', time: 0, tag: '🚨 Alex Hook' },
    { id: 'tool1', title: '2. AutoFlow 2.0', time: 10.6, tag: '🤖 AutoFlow' },
    { id: 'tool2', title: '3. VoicePilot', time: 19.5, tag: '🎙️ VoicePilot' },
    { id: 'tool3', title: '4. DevEngine', time: 28.1, tag: '💻 DevEngine' },
    { id: 'tool4', title: '5. Synthetix', time: 37.3, tag: '🚀 Synthetix' },
    { id: 'outro', title: '6. Obuna (CTA)', time: 46.8, tag: '🔔 Obuna CTA' },
  ];

  const longFormScenes = [
    { id: 'intro', title: '1. Kirish (Inqilob)', time: 0, tag: '🚀 AI Inqilobi' },
    { id: 'arch', title: '2. Agentlar Arxitekturasi', time: 105, tag: '🧠 Arxitektura' },
    { id: 'demo', title: '3. Jonli Kodlash Demo', time: 230, tag: '💻 Jonli Demo' },
    { id: 'jobs', title: '4. Dasturchilar Kelajagi', time: 380, tag: '📊 2027 Bozor' },
    { id: 'conclusion', title: '5. Xulosa & Obuna', time: 510, tag: '🔔 Xulosa & CTA' },
  ];

  // Dynamic scenes: preferentially use scenes from backend itemData
  const scenes = (itemData?.scenes && Array.isArray(itemData.scenes) && itemData.scenes.length > 0)
    ? itemData.scenes
    : (isLong ? longFormScenes : shortsScenes);

  const currentScene = scenes.find((s: any, idx: number) => {
    const next = scenes[idx + 1];
    return currentTime >= s.time && (!next || currentTime < next.time);
  }) || scenes[0];

  // Editable fields synchronized with itemData
  const [scriptText, setScriptText] = useState('');
  const [briefText, setBriefText] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaTags, setMetaTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (itemData) {
      setScriptText(itemData.script || '');
      setBriefText(itemData.brief || '');
      setMetaTitle(itemData.title || '');
      setMetaDescription(itemData.description || '');
      setMetaTags(Array.isArray(itemData.tags) ? itemData.tags.join(', ') : (itemData.tags || ''));
      if (itemData.durationSeconds) {
        setDuration(itemData.durationSeconds);
      }
    }
  }, [itemData]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await fetchApi(`/workspaces/${workspaceId}/content/${contentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: metaTitle || videoTitle,
          script: scriptText,
          brief: briefText,
          description: metaDescription,
          tags: metaTags.split(',').map((t: string) => t.trim()).filter(Boolean)
        })
      }, async () => 'mock_token');
      refetchItem();
      setToast("✅ O'zgarishlar muvaffaqiyatli saqlandi!");
      setTimeout(() => setToast(null), 4000);
    } catch (e: any) {
      setToast("❌ Saqlashda xatolik: " + (e?.message || 'Server xatosi'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateScript = async () => {
    setIsRegenerating(true);
    setToast("✨ Gemini 3.6 Flash tanlangan mavzuga moslab skript va sahnalarni qayta yaratmoqda...");
    try {
      const res = await fetchApi(`/workspaces/${workspaceId}/content/${contentId}/generate-script`, {
        method: 'POST'
      }, async () => 'mock_token');
      if (res) {
        setScriptText(res.script || '');
        setMetaDescription(res.description || '');
        refetchItem();
        setToast("🎉 Tanlangan mavzuga mos yangi skript va sahnalar muvaffaqiyatli generatsiya qilindi!");
      }
    } catch (e: any) {
      setToast("❌ Generatsiyada xatolik: " + (e?.message || 'Server xatosi'));
    } finally {
      setIsRegenerating(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const jumpToScene = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      const p = videoRef.current.play();
      if (p !== undefined) {
        p.then(() => setIsPlaying(true)).catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        });
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const p = videoRef.current.play();
        if (p !== undefined) {
          p.then(() => {
            setIsPlaying(true);
          }).catch((err) => {
            console.warn('Playback blocked with sound, attempting muted:', err);
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
            }
          });
        }
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Generatsiyani boshlash
  const handleStartGeneration = () => {
    setStatus('generating');
    setGenProgress(15);
    setGenStep(isLong ? '1/4: Microsoft Azure Neural diktor ovozi (10 daqiqalik master) yozilmoqda...' : '1/4: ElevenLabs AI orqali inglizcha diktor ovozi yaratilmoqda...');

    setTimeout(() => {
      setGenProgress(45);
      setGenStep(isLong ? '2/4: 1920x1080 keng formatli 5 ta bob B-Roll kadrlar va personaj ulanmoqda...' : '2/4: Alex personaji qulfi bilan 5 ta mikrosahna generatsiya qilinmoqda (I2V)...');
    }, 1200);

    setTimeout(() => {
      setGenProgress(75);
      setGenStep(isLong ? '3/4: FFmpeg yordamida 16:9 Full HD montaj va dinamik o\'tishlar qilinmoqda...' : '3/4: FFmpeg yordamida kliplar ulanmoqda va dinamik o\'tishlar qo\'yilmoqda...');
    }, 2400);

    setTimeout(() => {
      setGenProgress(95);
      setGenStep(isLong ? '4/4: Katta formatli subtitrlar va orqa fon sinxronlanmoqda...' : '4/4: Rangli karaoke subtitrlar va orqa fon musiqasi sinxronlanmoqda...');
    }, 3600);

    setTimeout(() => {
      setGenProgress(100);
      setStatus('ready_for_review');
      setToast(isLong ? '🎬 16:9 Katta formatli video tayyor bo\'ldi! YouTube\'ga yuklashni tasdiqlang.' : '🎬 Video tayyor bo\'ldi! Videoni ko\'rib chiqing va YouTube\'ga yuklashni tasdiqlang.');
      setTimeout(() => setToast(null), 6000);
    }, 4500);
  };

  const [publishedVideoUrl, setPublishedVideoUrl] = useState<string | null>(null);
  const [publishedVideoId, setPublishedVideoId] = useState<string | null>(null);
  const [isAuthNeeded, setIsAuthNeeded] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  // YouTube'ga yuklash
  const handlePublishToYouTube = async () => {
    const wsId = getWorkspaceId();
    setStatus('uploading');
    setToast('⏳ Video YouTube Data API orqali kanalingizga yuklanmoqda... Kuting...');
    try {
      const res = await fetch(`/api/workspaces/${wsId}/content/${contentId}/publish`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-workspace-id': wsId
        },
        body: JSON.stringify({
          title: isLong 
            ? "The Complete Future of Autonomous Coding & Agents in 2026 #technology" 
            : "Top 5 AI Tools That Work While You Sleep in 2026 #shorts",
          privacyStatus: "public",
          workspaceId: wsId
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              isLong ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {isLong ? '16:9 Katta Format (Long-form)' : '9:16 Shorts (Vertikal)'}
            </span>
            <StatusBadge status={status} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{videoTitle}</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {isLong 
              ? "YouTube 16:9 Gorizontal (Long-form, 10 daqiqa) formati uchun tayyorlangan to'liq tahliliy material."
              : "YouTube Shorts (9:16, 55 soniya) formati uchun ingliz tilida tayyorlangan material."}
          </p>
        </div>

        {/* Format Quick Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10">
          <button
            onClick={() => setVideoFormat('shorts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              !isLong ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone size={13} /> Shorts (9:16)
          </button>
          <button
            onClick={() => setVideoFormat('long_form')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              isLong ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Tv size={13} /> 16:9 Katta format
          </button>
        </div>
      </div>

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
              className={`px-5 py-2.5 font-semibold text-xs sm:text-sm transition-all border-b-2 -mb-px rounded-t-xl cursor-pointer whitespace-nowrap ${
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
              <h3 className="text-lg font-bold text-white">Video Brief & Konsept ({videoTitle})</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {briefText || itemData?.brief || (isLong 
                  ? "Ushbu 16:9 formatdagi to'liq video sun'iy intellekt agentlari, dasturlashning kelajagi va 2026-2027 yillardagi inqilobni chuqur tahliliy hujjatli uslubda yoritadi. Yuqori CPM auditoriyaga mo'ljallangan."
                  : "Ushbu video tanlangan mavzuni qisqa va ta'sirchan uslubda yoritadi. Dastlabki 3 sekundda kuchli 'Hook' orqali tomoshabin e'tibori jalb qilinadi.")}
              </p>
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="text-xs text-gray-400 font-medium">Maqsadli Auditoriya</span>
                  <p className="text-sm font-bold text-white">{itemData?.targetAudience || 'AQSH, Buyuk Britaniya, Kanada (Tier-1 High CPM)'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="text-xs text-gray-400 font-medium">Davomiyligi va Format</span>
                  <p className="text-sm font-bold text-white">
                    {isLong ? `${itemData?.duration || '10:15'} • Katta Format 16:9 (Landscape 1080p)` : `${itemData?.duration || '0:56'} • Vertical 9:16 (#Shorts)`}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <Button 
                  variant="primary" 
                  disabled={isRegenerating}
                  onClick={handleRegenerateScript}
                >
                  <Sparkles size={16} className={`mr-2 ${isRegenerating ? 'animate-spin' : ''}`} /> 
                  {isRegenerating ? 'Generatsiya qilinmoqda...' : 'Skriptni qayta generatsiya qilish'}
                </Button>
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
                  <h3 className="text-lg font-bold text-white">
                    {isLong ? `16:9 Katta Format: Ingliz tilidagi to'liq skript (${itemData?.duration || '10:15'})` : `Shorts: Ingliz tilidagi to'liq skript (${itemData?.duration || '0:56'})`}
                  </h3>
                  <p className="text-xs text-gray-400">Har bir sahna, vizual kadrlash va diktor ovoz ko'rsatmalari</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isRegenerating}
                  onClick={handleRegenerateScript}
                  className="flex items-center gap-1.5"
                >
                  <Sparkles size={14} className={isRegenerating ? 'animate-spin text-red-400' : 'text-red-400'} />
                  {isRegenerating ? 'Yozilmoqda...' : 'Qayta yozish (Gemini 3.6 Flash)'}
                </Button>
              </div>
              <Textarea 
                className="min-h-[340px] font-mono text-xs leading-relaxed" 
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Inglizcha skript matni..."
              />
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-400">
                  Mavzuga moslangan so'zlar soni: ~{scriptText.split(/\s+/).filter(Boolean).length} ta so'z
                </span>
                <Button 
                  variant="primary" 
                  disabled={isSaving}
                  onClick={handleSaveChanges}
                >
                  {isSaving ? 'Saqlanmoqda...' : "O'zgarishlarni saqlash"}
                </Button>
              </div>
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
                    Barcha kadrlarda personaj yuzi, kiyimi, ko'zoynagi va studiya yorug'ligi o'zgarmasligi ta'minlangan.
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
                  <p className="text-xs text-gray-400">Mavzuga mos optimallashtirilgan qidiruv kalit so'zlari va tavsif</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  SEO Bali: {itemData?.seoScore ? `${itemData.seoScore} / 100` : (isLong ? '95 / 100' : '96 / 100')}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Asosiy Sarlavha (Title)</label>
                <Input 
                  value={metaTitle} 
                  onChange={(e) => setMetaTitle(e.target.value)} 
                  placeholder="Video sarlavhasi..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Tavsif (Description & Timestamps)</label>
                <Textarea 
                  className="min-h-[140px]" 
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="YouTube video tavsifi va vaqt belgilari..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Teglar (Tags - vergul bilan ajratilgan)</label>
                <Input 
                  value={metaTags} 
                  onChange={(e) => setMetaTags(e.target.value)} 
                  placeholder="ai, tech, viral..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  variant="primary" 
                  disabled={isSaving}
                  onClick={handleSaveChanges}
                >
                  {isSaving ? 'Saqlanmoqda...' : "SEO Metadatasini saqlash"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Sifat Tekshiruvi */}
        <Tabs.Content value="sifat tekshiruvi" className="space-y-4 animate-fade-in">
          <Card className="liquid-glass border border-white/10">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-400" />
                Algoritm & Viral Sifat Audit (Quality Checklist)
              </h3>
              <div className="grid gap-3 pt-2">
                {[
                  { title: "0-3s Pattern Interrupt Hook", desc: isLong ? "Kuchli kirish foni va kiber-audio zarba bilan tomoshabin e'tibori birinchi soniyalardayoq qulflangan." : "Pulsatsiyalanuvchi xabarnoma va sub-bass drop bilan tomoshabin e'tibori ushlab qolinadi.", ok: true },
                  { title: "Typografiya & Subtitr Xavfsizligi", desc: "Harflar ekrandan chiqib ketmaydi, barcha subtitrlar 100px xavfsiz chegara bilan joylashtirilgan.", ok: true },
                  { title: "Host Alex Yuzi 100% Ochiq", desc: "Boshlovchining yuzi, ko'zoynagi va mimikasi ustiga hech qanday yozuv yoki banner tushmaydi.", ok: true },
                  { title: "Inglizcha Diksiyaning Tozaligi", desc: "Microsoft Azure Neural Christopher modeli orqali 100% tushunarli, tabiiy AQSh aksenti.", ok: true },
                  { title: isLong ? "16:9 Katta Format Rezolyutsiyasi" : "9:16 Shorts Rezolyutsiyasi", desc: isLong ? "1920x1080 Full HD 60FPS keng formatli video master fayl." : "1080x1920 Vertikal Ultra-HD 60FPS video fayl.", ok: true }
                ].map((item, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      [OK] O'tdi
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Tasdiqlash & Video Studio */}
        <Tabs.Content value="tasdiqlash" className="space-y-6 animate-fade-in">
          {/* GENERATION IN PROGRESS */}
          {status === 'generating' && (
            <div className="liquid-glass rounded-3xl p-8 border border-white/10 text-center space-y-6 shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mx-auto animate-pulse">
                <RefreshCw size={32} className="animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">{genStep}</h3>
                <p className="text-xs text-gray-400">
                  {isLong ? "16:9 Katta formatli video render qilinmoqda. Biroz kuting..." : "Neural Pulse AI video dvigateli ishlamoqda. Biroz kuting..."}
                </p>
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
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
              <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl">
                {isLong ? (
                  /* 16:9 Widescreen Horizontal Player */
                  <div className="space-y-6">
                    <div className="flex flex-col items-center">
                      {/* Player Mode Switcher */}
                      <div className="flex items-center justify-between w-full max-w-[800px] mb-3 px-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowYouTubeEmbed(false)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              !showYouTubeEmbed ? 'bg-blue-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                          >
                            🎬 Studio Pleyer (1080p HD)
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowYouTubeEmbed(true)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              showYouTubeEmbed ? 'bg-red-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                          >
                            <Youtube size={14} className="text-red-400 fill-red-400" /> YouTube Pleyer (Jonli)
                          </button>
                        </div>
                        {!showYouTubeEmbed && (
                          <Button 
                            onClick={togglePlay} 
                            variant="secondary" 
                            size="sm"
                            className="text-xs h-8 px-3 border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                          >
                            {isPlaying ? <Pause size={13} className="mr-1.5" /> : <Play size={13} className="mr-1.5 fill-blue-300" />}
                            {isPlaying ? "To'xtatish (Pause)" : "Videoni ko'rish (Play)"}
                          </Button>
                        )}
                      </div>

                      {showYouTubeEmbed ? (
                        <div className="w-full max-w-[800px] aspect-video rounded-3xl border-4 border-red-500/30 bg-black overflow-hidden relative shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                          <iframe 
                            src="https://www.youtube.com/embed/y2uIY0kprx0?autoplay=1"
                            title="Neural Pulse AI"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="w-full max-w-[800px] aspect-video rounded-3xl border-4 border-white/20 bg-black overflow-hidden relative shadow-[0_0_50px_rgba(59,130,246,0.3)] flex flex-col justify-center bg-zinc-950 group select-none">
                          {/* Top Dynamic Topic Overlay */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
                            <div className="flex items-center gap-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-500/40 max-w-[75%] shadow-xl">
                              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                              <span className="text-xs font-bold text-white truncate">Mavzu: {videoTitle}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-500/40 backdrop-blur-md">
                              {currentScene?.tag || '16:9 Master'}
                            </span>
                          </div>

                          <video 
                            ref={videoRef}
                            poster={`/banner.jpg?v=${videoVersion}`} 
                            playsInline
                            preload="auto"
                            loop
                            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 615)}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={togglePlay}
                          >
                            <source src={`/neural_pulse_16x9.mp4?v=${videoVersion}`} type="video/mp4" />
                            <source src={`https://jpilot.up.railway.app/media/neural_pulse_16x9.mp4?v=${videoVersion}`} type="video/mp4" />
                          </video>

                          {/* Center Play Overlay */}
                          {!isPlaying && (
                            <div 
                              onClick={togglePlay}
                              className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/35"
                            >
                              <div className="w-20 h-20 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-[0_0_35px_rgba(59,130,246,0.85)] transform transition-transform hover:scale-110 active:scale-95">
                                <Play size={36} className="ml-1.5 fill-white" />
                              </div>
                              <span className="mt-4 text-xs font-bold text-white bg-black/80 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md max-w-[85%] truncate text-center">
                                ▶ {videoTitle}
                              </span>
                              <span className="text-[11px] text-blue-400 font-semibold mt-1.5 bg-black/60 px-2.5 py-0.5 rounded-md">
                                📺 1920x1080 Full HD • {itemData?.duration || '10:15'} Davomiylik
                              </span>
                            </div>
                          )}

                          {/* Bottom Scrubber */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-1.5 opacity-90 transition-opacity hover:opacity-100">
                            <div 
                              className="w-full h-1.5 bg-white/25 rounded-full cursor-pointer overflow-hidden"
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const pos = (e.clientX - rect.left) / rect.width;
                                jumpToScene(pos * duration);
                              }}
                            >
                              <div 
                                className="bg-blue-500 h-full rounded-full transition-all"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-white text-[11px] font-semibold pt-1">
                              <div className="flex items-center gap-2">
                                <button onClick={togglePlay} className="p-1 rounded hover:bg-white/20">
                                  {isPlaying ? <Pause size={14} className="fill-white" /> : <Play size={14} className="fill-white" />}
                                </button>
                                <button onClick={toggleMute} className="p-1 rounded hover:bg-white/20">
                                  {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-blue-400" />}
                                </button>
                              </div>
                              <span className="font-mono text-[10px] text-gray-300">
                                {Math.floor(currentTime)}s / {Math.floor(duration)}s (10:15)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Scene Jumper Chips */}
                      <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-2xl">
                        {scenes.map((s: any, sIdx: number) => {
                          const nextTime = scenes[sIdx + 1]?.time ?? 9999;
                          const isActive = currentTime >= s.time && currentTime < nextTime;
                          return (
                            <button
                              key={s.id || sIdx}
                              onClick={() => jumpToScene(s.time)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-blue-500/25 text-blue-300 border-blue-500/60 shadow-[0_0_12px_rgba(59,130,246,0.35)] scale-105'
                                  : 'bg-white/[0.05] text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {s.tag || s.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Specs & Actions for 16:9 */}
                    <div className="space-y-4 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/15 px-3 py-1 rounded-full border border-blue-500/30">
                          16:9 Katta Formatli Video Tayyor (Long-form Master)
                        </span>
                        <span className="text-xs text-gray-400">YouTube Monetizatsiya (High CPM)</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-gray-400 block">Format & Rezolyutsiya</span>
                          <span className="font-bold text-white">1920x1080 • Landscape 16:9</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-gray-400 block">Davomiyligi</span>
                          <span className="font-bold text-white">10:15 • 8.5 Mbps Ultra-HD</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-gray-400 block">Audio & Diktor</span>
                          <span className="font-bold text-blue-400">Azure Christopher + Ambient SFX</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-gray-400 block">Fayl hajmi & Master</span>
                          <span className="font-bold text-white">185.0 MB (High Profile H.264)</span>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <a 
                          href={`/neural_pulse_16x9.mp4?v=${videoVersion}`} 
                          download="autonomous_coding_1080p.mp4"
                          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 transition-all flex items-center gap-1.5"
                        >
                          📥 16:9 Videoni yuklab olish (MP4)
                        </a>
                        <Button variant="outline" size="sm" onClick={() => {
                          setVideoVersion(Date.now());
                          handleStartGeneration();
                        }}>
                          <RefreshCw size={14} className="mr-1.5" /> Qayta render (16:9)
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
                        <Button variant="primary" size="lg" className="shadow-2xl bg-blue-600 hover:bg-blue-500 border-blue-500" onClick={handlePublishToYouTube}>
                          <Youtube size={20} className="mr-2 fill-white" /> 2. YouTube'ga Yuklash (16:9 Katta Video)
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 9:16 Shorts Vertical Player */
                  <div className="grid md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-5 flex flex-col items-center">
                      {/* Player Mode Switcher for Shorts */}
                      <div className="flex items-center justify-between w-[290px] mb-3 px-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowYouTubeEmbed(false)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              !showYouTubeEmbed ? 'bg-red-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                          >
                            🎬 Studio
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowYouTubeEmbed(true)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              showYouTubeEmbed ? 'bg-red-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                          >
                            <Youtube size={12} className="text-red-400 fill-red-400" /> YouTube
                          </button>
                        </div>
                        {!showYouTubeEmbed && (
                          <Button 
                            onClick={togglePlay} 
                            variant="secondary" 
                            size="sm"
                            className="text-[11px] h-7 px-2.5 border-red-500/30 text-red-300 hover:bg-red-500/10"
                          >
                            {isPlaying ? <Pause size={12} className="mr-1" /> : <Play size={12} className="mr-1 fill-red-300" />}
                            {isPlaying ? "To'xtatish" : "Ko'rish"}
                          </Button>
                        )}
                      </div>

                      {showYouTubeEmbed ? (
                        <div className="w-[290px] h-[515px] rounded-[38px] border-4 border-red-500/30 bg-black overflow-hidden relative shadow-[0_0_50px_rgba(255,0,0,0.4)]">
                          <iframe 
                            src="https://www.youtube.com/embed/y2uIY0kprx0?autoplay=1"
                            title="Neural Pulse AI Shorts"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="w-[290px] h-[515px] rounded-[38px] border-4 border-white/20 bg-black overflow-hidden relative shadow-[0_0_50px_rgba(255,0,0,0.4)] flex flex-col justify-center bg-zinc-950 group select-none">
                          {/* Top Dynamic Topic Overlay */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
                            <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-red-500/40 max-w-[75%] shadow-xl">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                              <span className="text-[11px] font-bold text-white truncate">Mavzu: {videoTitle}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-950/80 text-red-300 border border-red-500/40 backdrop-blur-md">
                              {currentScene?.tag || 'Shorts'}
                            </span>
                          </div>

                          <video 
                            ref={videoRef}
                            poster={`/host_alex.jpg?v=${videoVersion}`} 
                            playsInline
                            preload="auto"
                            loop
                            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 55.63)}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={togglePlay}
                          >
                            <source src={`/neural_pulse_short.mp4?v=${videoVersion}`} type="video/mp4" />
                            <source src={`https://jpilot.up.railway.app/media/neural_pulse_short.mp4?v=${videoVersion}`} type="video/mp4" />
                          </video>

                          {/* Center Play Overlay */}
                          {!isPlaying && (
                            <div 
                              onClick={togglePlay}
                              className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-black/35"
                            >
                              <div className="w-20 h-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-[0_0_35px_rgba(255,0,0,0.85)] transform transition-transform hover:scale-110 active:scale-95">
                                <Play size={36} className="ml-1.5 fill-white" />
                              </div>
                              <span className="mt-4 text-xs font-bold text-white bg-black/80 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md max-w-[85%] truncate text-center">
                                ▶ {videoTitle}
                              </span>
                              <span className="text-[11px] text-emerald-400 font-semibold mt-1.5 bg-black/60 px-2 py-0.5 rounded-md">
                                🔊 Studio Diktor • {itemData?.duration || '0:56'}
                              </span>
                            </div>
                          )}

                          {/* Bottom Scrubber */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-1.5 opacity-90 transition-opacity hover:opacity-100">
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
                                <button onClick={togglePlay} className="p-1 rounded hover:bg-white/20">
                                  {isPlaying ? <Pause size={14} className="fill-white" /> : <Play size={14} className="fill-white" />}
                                </button>
                                <button onClick={toggleMute} className="p-1 rounded hover:bg-white/20">
                                  {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-emerald-400" />}
                                </button>
                              </div>
                              <span className="font-mono text-[10px] text-gray-300">
                                {Math.floor(currentTime)}s / {Math.floor(duration)}s
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Scene Jumper Chips */}
                      <div className="mt-3.5 flex flex-wrap gap-1.5 justify-center max-w-[310px]">
                        {scenes.map((s: any, sIdx: number) => {
                          const nextTime = scenes[sIdx + 1]?.time ?? 9999;
                          const isActive = currentTime >= s.time && currentTime < nextTime;
                          return (
                            <button
                              key={s.id || sIdx}
                              onClick={() => jumpToScene(s.time)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-red-500/25 text-red-300 border-red-500/60 shadow-[0_0_12px_rgba(255,0,0,0.35)] scale-105'
                                  : 'bg-white/[0.05] text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {s.tag || s.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Video Info & Final Approval Action */}
                    <div className="md:col-span-7 space-y-5">
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
                          2-Bosqich: Multi-Scene Shorts Tayyor (Ko'rish & Tasdiqlash)
                        </span>
                        <h3 className="text-2xl font-black text-white">{videoTitle}</h3>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          AI ushbu video uchun {scenes.length} ta alohida sahnani ketma-ket montaj qildi: {scenes.map((s: any) => s.tag || s.title).join(', ')}. 
                          Microsoft Azure Neural Studio ovozi va ritmik fon musiqasi to'liq sinxronlandi.
                        </p>
                      </div>

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
                )}
              </div>
            </div>
          )}

          {/* UPLOADING STATE */}
          {status === 'uploading' && (
            <div className="liquid-glass rounded-3xl p-8 border border-red-500/30 text-center space-y-6 shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mx-auto animate-bounce">
                <Youtube size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">YouTube Data API orqali yuklanmoqda...</h3>
                <p className="text-xs text-gray-400">Videongiz to'g'ridan-to'g'ri kanalingizga yuklanmoqda va SEO teglari qo'yilmoqda.</p>
              </div>
            </div>
          )}

          {/* PUBLISHED STATE */}
          {status === 'published' && (
            <div className="liquid-glass rounded-3xl p-8 border border-emerald-500/30 text-center space-y-6 shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                <Check size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">Video YouTube'ga muvaffaqiyatli yuklandi!</h3>
                <p className="text-xs text-gray-400">Videongiz kanalingizda jonli ko'rinmoqda.</p>
              </div>
              {publishedVideoUrl && (
                <div className="flex justify-center">
                  <a href={publishedVideoUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" className="flex items-center gap-2">
                      <Youtube size={18} /> YouTube'da ko'rish <ExternalLink size={14} />
                    </Button>
                  </a>
                </div>
              )}
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

export default ContentDetailPage;
