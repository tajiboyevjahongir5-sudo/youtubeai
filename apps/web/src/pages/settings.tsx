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
  Camera,
  Music,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  TrendingUp,
  Target,
  Layers,
  Zap,
  RefreshCw,
  Eye,
  Users,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { getWorkspaceId } from '../lib/workspace';
import { fetchApi } from '../lib/api';

const SettingsPage = () => {
  const wsId = getWorkspaceId();
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // YouTube Channel Analysis State
  const [analysisMode, setAnalysisMode] = useState<'channel' | 'manual'>('channel');
  const [channelUrl, setChannelUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [channelAnalysis, setChannelAnalysis] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisSuccess, setAnalysisSuccess] = useState('');
  const [showManualTuning, setShowManualTuning] = useState(false);

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
  const [backgroundMusicMood, setBackgroundMusicMood] = useState('neon_pulse');
  const [voiceEmotionPreset, setVoiceEmotionPreset] = useState('energetic');

  // Video B-Roll Pexels State
  const [pexelsApiKey, setPexelsApiKey] = useState('');
  const [isTestingPexels, setIsTestingPexels] = useState(false);
  const [pexelsTestResult, setPexelsTestResult] = useState<{ success: boolean; message: string; sampleVideos?: any[] } | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const handleTestPexelsKey = async () => {
    if (!pexelsApiKey.trim()) return;
    setIsTestingPexels(true);
    setPexelsTestResult(null);
    try {
      const res = await fetchApi('/broll/test-key', {
        method: 'POST',
        body: JSON.stringify({ apiKey: pexelsApiKey.trim() })
      }, async () => 'mock_token');
      setPexelsTestResult(res);
    } catch (err: any) {
      setPexelsTestResult({ success: false, message: err?.message || 'Tarmoq xatosi' });
    } finally {
      setIsTestingPexels(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword.length < 6) {
      setPwdError("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("Yangi parollar bir-biriga mos kelmadi");
      return;
    }

    setIsChangingPwd(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPwdError(data.error || "Parolni o'zgartirishda xatolik yuz berdi");
      } else {
        setPwdSuccess("Parolingiz muvaffaqiyatli yangilandi!");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPwdSuccess(''), 5000);
      }
    } catch (err: any) {
      setPwdError(err.message || "Tarmoq xatosi yuz berdi");
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleAnalyzeChannel = async () => {
    if (!channelUrl.trim()) {
      setAnalysisError("Iltimos, YouTube kanal havolasi yoki @handle'ni kiriting (masalan: @NeuralPulseAI-m3e)");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError('');
    setAnalysisSuccess('');
    try {
      const res = await fetchApi(`/workspaces/${wsId}/analyze-channel`, {
        method: 'POST',
        body: JSON.stringify({ channelUrl: channelUrl.trim() })
      }, async () => 'mock_token');

      if (res && res.success && res.analysis) {
        setChannelAnalysis(res.analysis);
        if (res.analysis.niche) setNiche(res.analysis.niche);
        if (res.analysis.subNiches) setSubNiches(res.analysis.subNiches);
        if (res.analysis.audience) setAudience(res.analysis.audience);
        if (res.analysis.tone) setTone(res.analysis.tone);
        setAnalysisSuccess(`✅ "${res.analysis.channelTitle || channelUrl}" kanali muvaffaqiyatli tahlil qilindi! Barcha parametrlar avtomatik sozlandi.`);
      } else {
        setAnalysisError(res?.error || "Kanalni tahlil qilishda xatolik yuz berdi");
      }
    } catch (err: any) {
      setAnalysisError(err?.message || "Kanalni tahlil qilishda tarmoq xatosi yuz berdi");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchApi(`/workspaces/${wsId}`, {}, async () => 'mock_token')
      .then((data: any) => {
        if (data?.settings) {
          const s = data.settings;
          if (s.analysisMode) setAnalysisMode(s.analysisMode);
          if (s.sourceChannelUrl) setChannelUrl(s.sourceChannelUrl);
          if (s.channelAnalysis) setChannelAnalysis(s.channelAnalysis);
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
          if (s.backgroundMusicMood) setBackgroundMusicMood(s.backgroundMusicMood);
          if (s.voiceEmotionPreset) setVoiceEmotionPreset(s.voiceEmotionPreset);
          if (s.pexelsApiKey) setPexelsApiKey(s.pexelsApiKey);
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
            analysisMode,
            sourceChannelUrl: channelUrl,
            channelAnalysis,
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
            backgroundMusicMood,
            voiceEmotionPreset,
            pexelsApiKey: pexelsApiKey.trim() || undefined,
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
        {/* Channel Strategy & AI Analysis Settings */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl animate-fade-in-up stagger-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
                <Youtube size={22} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  Kanal Profil Parametrlari
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    AI Auto-Pilot
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  YouTube kanalingizni AI tahlil qiladi va barcha videolarni shu tahlil asosida yuritadi
                </p>
              </div>
            </div>

            {/* Mode Selector Toggle */}
            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAnalysisMode('channel')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  analysisMode === 'channel'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles size={14} />
                YouTube Kanal Tahlili
              </button>
              <button
                type="button"
                onClick={() => setAnalysisMode('manual')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  analysisMode === 'manual'
                    ? 'bg-white/15 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sliders size={14} />
                Qo'lda Sozlash
              </button>
            </div>
          </div>

          {/* Mode 1: YouTube Channel AI Analysis */}
          {analysisMode === 'channel' && (
            <div className="space-y-5">
              {/* Channel URL Input Bar */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Search size={14} className="text-red-400" />
                    YouTube Kanal Nomi, @Handle yoki Havolasi
                  </label>
                  <span className="text-[11px] text-gray-400">Masalan: @NeuralPulseAI-m3e</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Input
                      placeholder="@KanalNomi yoki https://youtube.com/@handle"
                      value={channelUrl}
                      onChange={(e) => setChannelUrl(e.target.value)}
                      className="w-full bg-black/50 border-white/20 pl-3.5"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAnalyzeChannel}
                    disabled={isAnalyzing || !channelUrl.trim()}
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        AI Tahlil Qilmoqda...
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        Kanalni Tahlil Qilish
                      </>
                    )}
                  </Button>
                </div>

                {/* Notifications */}
                {analysisError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertTriangle size={16} className="flex-shrink-0" />
                    <span>{analysisError}</span>
                  </div>
                )}
                {analysisSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 size={16} className="flex-shrink-0" />
                    <span>{analysisSuccess}</span>
                  </div>
                )}
              </div>

              {/* Analyzed Channel Profile Card */}
              {channelAnalysis ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-cyan-500/30 space-y-4">
                  {/* Channel Header Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      {channelAnalysis.channelThumbnail ? (
                        <img
                          src={channelAnalysis.channelThumbnail}
                          alt={channelAnalysis.channelTitle}
                          className="w-12 h-12 rounded-full border-2 border-cyan-500/40 object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                          {channelAnalysis.channelTitle ? channelAnalysis.channelTitle.charAt(0).toUpperCase() : 'YT'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-white text-base flex items-center gap-2">
                          {channelAnalysis.channelTitle || 'Tahlil Qilingan Kanal'}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Faol Tahlil
                          </span>
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                          {channelAnalysis.subscriberCount && channelAnalysis.subscriberCount !== '0' && (
                            <span className="flex items-center gap-1">
                              <Users size={12} className="text-cyan-400" />
                              {channelAnalysis.subscriberCount} obunachi
                            </span>
                          )}
                          {channelAnalysis.videoCount && channelAnalysis.videoCount !== '0' && (
                            <span className="flex items-center gap-1">
                              <Eye size={12} className="text-purple-400" />
                              {channelAnalysis.videoCount} video
                            </span>
                          )}
                          {channelAnalysis.analyzedAt && (
                            <span className="text-[11px] text-gray-500">
                              Tahlil: {new Date(channelAnalysis.analyzedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                        Nisha: {channelAnalysis.niche}
                      </span>
                    </div>
                  </div>

                  {/* AI Extracted Parameters Grid */}
                  <div className="grid sm:grid-cols-2 gap-3.5 text-xs">
                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                      <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">
                        Asosiy Nisha & Sub-nishalar
                      </span>
                      <p className="text-white font-medium">{channelAnalysis.niche}</p>
                      {channelAnalysis.subNiches && (
                        <p className="text-gray-400 text-[11px] leading-relaxed mt-0.5">
                          {channelAnalysis.subNiches}
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                      <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">
                        Maqsadli Auditoriya
                      </span>
                      <p className="text-gray-200 leading-relaxed text-[11px]">
                        {channelAnalysis.audience || "Avtomatik aniqlangan"}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                      <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">
                        Kontent Uslubi & Ovoz Toni
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-semibold capitalize">
                          {channelAnalysis.tone || tone}
                        </span>
                        <span className="text-gray-300 text-[11px]">
                          {channelAnalysis.contentStyle || "Yuqori retentionli Shorts"}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                      <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">
                        O'rtacha Ko'rishlar / Chastota
                      </span>
                      <p className="text-gray-200 text-[11px]">
                        {channelAnalysis.avgViewsPerVideo > 0 ? `${channelAnalysis.avgViewsPerVideo.toLocaleString()} ko'rish / video` : channelAnalysis.postingFrequency || "Har kuni 1-2 ta"}
                      </p>
                    </div>
                  </div>

                  {/* Top Performing Topics */}
                  {Array.isArray(channelAnalysis.topPerformingTopics) && channelAnalysis.topPerformingTopics.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                        <TrendingUp size={13} className="text-emerald-400" />
                        AI Aniqlagan Viral Mavzular & Yo'nalishlar:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {channelAnalysis.topPerformingTopics.slice(0, 6).map((topic: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-medium"
                          >
                            🔥 {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Strategy Callout */}
                  {channelAnalysis.recommendedStrategy && (
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed flex items-start gap-2.5">
                      <Sparkles size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-cyan-300 block mb-0.5">AI Tavsiya Qilgan Strategiya:</strong>
                        <span>{channelAnalysis.recommendedStrategy}</span>
                      </div>
                    </div>
                  )}

                  {/* Bottom Success Guarantee Notice */}
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>
                      Ushbu kanal profili saqlangan. Barcha yangi video ssenariylari, g'oyalari va avtopilot ushbu tahlilga qarab kanalni yuritadi.
                    </span>
                  </div>
                </div>
              ) : (
                /* Empty state when no channel analyzed yet */
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/15 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
                    <Youtube size={20} />
                  </div>
                  <p className="text-sm font-semibold text-gray-200">
                    Hali kanal tahlil qilinmagan
                  </p>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Yuqoridagi maydonga YouTube kanalingiz nomini yoki havolasini kiriting (masalan: <code className="text-cyan-300 font-mono">@NeuralPulseAI-m3e</code>) va <strong>"Kanalni Tahlil Qilish"</strong> tugmasini bosing.
                  </p>
                </div>
              )}

              {/* Optional Fine-Tuning Accordion */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualTuning(!showManualTuning)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {showManualTuning ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>{showManualTuning ? "Qo'shimcha parametrlarni yashirish" : "Tahlil parametrlarini qo'lda ko'rish va sozlash (ixtiyoriy)"}</span>
                </button>

                {showManualTuning && (
                  <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4 animate-fade-in">
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
                )}
              </div>
            </div>
          )}

          {/* Mode 2: Manual Tuning Form */}
          {analysisMode === 'manual' && (
            <div className="space-y-4 animate-fade-in">
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
          )}
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

        {/* Viral Audio & Music Mood Matcher */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400">
                <Music size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Fon Musiqasi & Audio Kayfiyati (Viral Mood Matcher)</h3>
                <p className="text-xs text-gray-400">YouTube Shorts tomosha vaqtini 35% ga oshiruvchi no-copyright procedural saundtrek</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
              Auto-Ducking: -10dB Faol
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[
              {
                id: 'neon_pulse',
                name: '🔥 Neon Pulse',
                genre: 'Cyber Electronic Pulse',
                bpm: '124 BPM',
                badge: 'Standart',
                desc: 'Neural Pulse AI ning rasmiy brend musiqasi. Qat\'iy, zamonaviy va yuqori intellekt atmosferasi.',
                border: 'border-cyan-500/50',
                activeBg: 'bg-cyan-500/10'
              },
              {
                id: 'cyberpunk_phonk',
                name: '⚡ Cyber Drift Phonk',
                genre: 'Brazilian / Drift Phonk',
                bpm: '138 BPM',
                badge: 'TikTok Viral #1',
                desc: 'Kiberxavfsizlik, "illegal" saytlar, shoshilinch AI xabarlari va tezkor hooklar uchun mukammal.',
                border: 'border-purple-500/50',
                activeBg: 'bg-purple-500/10'
              },
              {
                id: 'dark_synthwave',
                name: '🌌 Dark Synthwave 2026',
                genre: 'Retro-Futuristic Arps',
                bpm: '118 BPM',
                badge: 'Cinematic',
                desc: 'Chuqur neyron tarmoqlar, sun\'iy aql falsafasi, Linux va kelajak dasturlash mavzulari.',
                border: 'border-indigo-500/50',
                activeBg: 'bg-indigo-500/10'
              },
              {
                id: 'epic_cinematic',
                name: '🎬 Epic Cinematic Hybrid',
                genre: 'Hybrid Orchestral',
                bpm: '124 BPM',
                badge: 'High Drama',
                desc: 'Katta kompaniyalar kurashi, global AI poygasi va yirik sanoat inqiloblari.',
                border: 'border-amber-500/50',
                activeBg: 'bg-amber-500/10'
              },
              {
                id: 'lofi_chill',
                name: '☕ Lo-Fi Tech Chill',
                genre: 'Chillhop / Coding Beats',
                bpm: '92 BPM',
                badge: 'Focus & Study',
                desc: 'Batafsil darsliklar, mahsuldorlik va passiv daromad strategiyalari uchun sokin ritm.',
                border: 'border-emerald-500/50',
                activeBg: 'bg-emerald-500/10'
              }
            ].map((mood) => {
              const isSelected = backgroundMusicMood === mood.id;
              return (
                <div
                  key={mood.id}
                  onClick={() => setBackgroundMusicMood(mood.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                    isSelected
                      ? `${mood.border} ${mood.activeBg} shadow-lg ring-1 ring-white/20`
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                      {mood.badge}
                    </span>
                    <span className="text-[11px] font-mono text-amber-400 font-bold">
                      {mood.bpm}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {mood.name}
                      {isSelected && <Check size={14} className="text-amber-400" />}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-medium">{mood.genre}</p>
                    <p className="text-[10px] text-gray-400 mt-1 leading-snug">{mood.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-gray-400">
            * Tanlangan musiqa nutq yangraganda avtomatik ravishda -10dB ga pasayadi (Auto-Ducking), diksiyani kristal toza eshittiradi va pauzalarda to'liq kuchga chiqadi.
          </p>
        </div>

        {/* Voice Emotion & Pace Modulator Studio */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
                <Mic size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Diksiyaning Hissiy Energiya Sozlagichi (Voice Emotion Studio)</h3>
                <p className="text-xs text-gray-400">Azure TTS SSML parametrlari orqali boshlovchi ovozining sur'ati va emotsiyasini boshqarish</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400">
              Preset: {voiceEmotionPreset.toUpperCase()}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'energetic',
                name: '⚡ Ultra Energetic',
                pace: '+16% Tezlik',
                pitch: '+2Hz Pitch',
                badge: 'Viral News #1',
                desc: 'Tezkor yangiliklar, yashirin vositalar va 0-3 soniyalik kuchli hooklar uchun eng ommabop dinamika.',
                border: 'border-violet-500/50',
                activeBg: 'bg-violet-500/10'
              },
              {
                id: 'mysterious',
                name: '🕵️ Mysterious & Deep',
                pace: '-5% Tezlik',
                pitch: '-2Hz Pitch',
                badge: 'Kiber & Darknet',
                desc: 'Kiberxavfsizlik, sirli internet sirlari va taqiqlangan mavzularda qiziqish uyg\'otuvchi chuqur tembr.',
                border: 'border-cyan-500/50',
                activeBg: 'bg-cyan-500/10'
              },
              {
                id: 'authoritative',
                name: '🎓 Confident Authority',
                pace: '+10% Tezlik',
                pitch: '+1Hz Pitch',
                badge: 'Senior Ekspert',
                desc: 'Dasturlash arxitekturasi, murakkab AI modellar tahlili va nufuzli ekspert tushuntirishi uchun ideal.',
                border: 'border-blue-500/50',
                activeBg: 'bg-blue-500/10'
              },
              {
                id: 'calm',
                name: '🧘 Calm Storyteller',
                pace: '0% Standart',
                pitch: '0Hz Tabiiy',
                badge: 'Darslik & Tahlil',
                desc: 'Shoshilmasdan har bir fikrni yetkazuvchi, tushunarli qo\'llanmalar va falsafiy texnologiya mavzulari.',
                border: 'border-emerald-500/50',
                activeBg: 'bg-emerald-500/10'
              }
            ].map((preset) => {
              const isSelected = voiceEmotionPreset === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setVoiceEmotionPreset(preset.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected 
                      ? `${preset.border} ${preset.activeBg} shadow-lg ring-1 ring-white/20` 
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                      {preset.badge}
                    </span>
                    <span className="text-[10px] font-mono text-violet-400 font-semibold">
                      {preset.pace}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {preset.name}
                      {isSelected && <Check size={14} className="text-violet-400" />}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-snug">{preset.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
                    <span>Tembr: {preset.pitch}</span>
                    <span className={isSelected ? 'text-violet-300 font-bold' : 'text-gray-500'}>
                      {isSelected ? '[OK] Faol' : 'Tanlash'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-gray-400">
            * Tanlangan emotsiya Azure TTS orqali nutq sintezlanishidan oldin avtomatik kiritiladi va diksiyaga jonli hayajon bag'ishlaydi.
          </p>
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

        {/* Video B-Roll Engine (Pexels & Pixabay HD Footage) */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  Video B-Roll Dvigateli (Pexels 4K/HD Jonli Kadrlar)
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    100% Bepul
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  Shorts videolarining har bir sahnasi uchun mavzuga mos professional vertikal HD video kadrlarni yuklash
                </p>
              </div>
            </div>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
              pexelsApiKey ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}>
              {pexelsApiKey ? 'Pexels HD: Ulangan' : 'Zaxira B-Roll Faol'}
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
                  Pexels API Kaliti
                </label>
                <a
                  href="https://www.pexels.com/api/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline underline-offset-2"
                >
                  Tekin API kalit olish (karta shart emas)
                  <ExternalLink size={11} />
                </a>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Input
                  type="password"
                  placeholder="Pexels API kalitini shu yerga kiriting..."
                  value={pexelsApiKey}
                  onChange={(e) => setPexelsApiKey(e.target.value)}
                  className="bg-black/50 border-white/20 text-xs font-mono flex-1"
                />
                <Button
                  type="button"
                  onClick={handleTestPexelsKey}
                  disabled={isTestingPexels || !pexelsApiKey.trim()}
                  className="bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap disabled:opacity-50"
                >
                  {isTestingPexels ? (
                    <>
                      <RefreshCw size={13} className="animate-spin mr-1.5" />
                      Tekshirilmoqda...
                    </>
                  ) : (
                    'Kalitni Tekshirish'
                  )}
                </Button>
              </div>
            </div>

            {/* Test result alert */}
            {pexelsTestResult && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                pexelsTestResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {pexelsTestResult.success ? <CheckCircle2 size={16} className="flex-shrink-0" /> : <AlertTriangle size={16} className="flex-shrink-0" />}
                <span>{pexelsTestResult.message}</span>
              </div>
            )}

            {/* Explanatory benefit callout */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 grid sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <strong className="text-white block font-semibold flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-400" />
                  5 Sahnali Montaj
                </strong>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Har bir sahna (Hook, Muammo, Yechim, Natija, Outro) o'ziga mos video kadr oladi.
                </p>
              </div>
              <div className="space-y-1">
                <strong className="text-white block font-semibold flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-400" />
                  GPU Talab Qilmaydi
                </strong>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Railway CPU va GTX 1660 Super NVENC orqali 20 soniyada to'liq HD render bo'ladi.
                </p>
              </div>
              <div className="space-y-1">
                <strong className="text-white block font-semibold flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-400" />
                  Litsenziyali & Xavfsiz
                </strong>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Barcha videolar YouTube monetization va Copyright qoidalariga 100% toza.
                </p>
              </div>
            </div>
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

      {/* Account Security & Password Change Card */}
      <div className="liquid-glass rounded-2xl border border-white/10 p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Hisob Xavfsizligi & Parolni O'zgartirish</h3>
            <p className="text-xs text-zinc-400">Jpilot platformasiga kirish uchun yangi maxfiy parol o'rnating.</p>
          </div>
        </div>

        {pwdSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
            <span>{pwdSuccess}</span>
          </div>
        )}

        {pwdError && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
            <span>{pwdError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="password"
              label="Joriy Parol"
              placeholder="Amaldagi parolingiz"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <Input
              type="password"
              label="Yangi Parol"
              placeholder="Kamida 6 ta belgi"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Yangi Parolni Tasdiqlash"
              placeholder="Parolni qayta kiriting"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isChangingPwd || !newPassword}
              className="flex items-center gap-2 text-xs shadow-md"
            >
              <KeyRound size={14} />
              <span>{isChangingPwd ? "Yangilanmoqda..." : "Parolni Yangilash"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
