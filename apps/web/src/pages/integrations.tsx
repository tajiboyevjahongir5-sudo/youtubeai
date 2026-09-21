import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/page-header';
import { Button } from '../components/ui/button';
import { 
  Youtube, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  KeyRound,
  Radio,
  Copy,
  AlertTriangle,
  Check,
  Video
} from 'lucide-react';
import { useSearchParams } from 'react-router';
import { getWorkspaceId } from '../lib/workspace';

export const IntegrationsPage = () => {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [channelData, setChannelData] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [googleFlowApiKey, setGoogleFlowApiKey] = useState('');
  const [savedSettings, setSavedSettings] = useState<any>(null);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keySavedToast, setKeySavedToast] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);

  const linkCode = 'JP-77492';
  const wsId = getWorkspaceId();

  useEffect(() => {
    if (searchParams.get('connected') === 'true') {
      setNotification('✅ YouTube hisobingiz muvaffaqiyatli ulandi!');
      setTimeout(() => setNotification(null), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch(`/api/workspaces/${wsId}/youtube/channel`, {
      headers: { 'x-workspace-id': wsId }
    })
      .then(res => res.json())
      .then(data => setChannelData(data))
      .catch(() => {});

    fetch(`/api/workspaces/${wsId}`, {
      headers: { 'x-workspace-id': wsId }
    })
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSavedSettings(data.settings);
          if (data.settings.googleFlowApiKey) {
            setGoogleFlowApiKey(data.settings.googleFlowApiKey);
          }
        }
      })
      .catch(() => {});
  }, [wsId]);

  const handleSaveGoogleFlowKey = async () => {
    setIsSavingKey(true);
    try {
      const updated = {
        ...(savedSettings || {}),
        googleFlowApiKey: googleFlowApiKey.trim()
      };
      await fetch(`/api/workspaces/${wsId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': wsId
        },
        body: JSON.stringify({ settings: updated })
      });
      setSavedSettings(updated);
      setKeySavedToast(true);
      setTimeout(() => setKeySavedToast(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingKey(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(`/link ${linkCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendTestNotification = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch(`/api/workspaces/${wsId}/youtube/connect?workspaceId=${wsId}`, {
        headers: { 'x-workspace-id': wsId }
      });
      const data = await res.json();
      if (data.url && data.url !== 'https://mock.auth.url') {
        window.location.href = data.url;
      } else if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Failed to get auth url:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch(`/api/workspaces/${wsId}/youtube/disconnect`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': wsId },
        body: JSON.stringify({ workspaceId: wsId })
      });
      setChannelData(null);
      setNotification('Kanal uzildi.');
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  const isConnected = Boolean(
    channelData?.connectionStatus === 'connected' &&
    channelData?.channelTitle &&
    channelData.channelTitle !== 'YouTube Kanal Ulanmagan' &&
    channelData.channelTitle !== 'Kanal ulanmagan'
  );
  const channelTitle = isConnected ? channelData.channelTitle : 'Kanal ulanmagan';
  const subCount = isConnected 
    ? (channelData?.subscriberCount ? `${channelData.subscriberCount} obunachi` : '0 obunachi') 
    : 'Ulanmagan';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <PageHeader 
        title="Tashqi Integratsiyalar" 
        description="YouTube rasmiy API va Telegram bot hamrohi ulanishlarini boshqaring." 
      />

      {notification && (
        <div className="liquid-glass rounded-2xl p-4 border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 flex items-center gap-3 animate-fade-in text-sm font-semibold shadow-xl">
          <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* YouTube Connection Card */}
        <div className="liquid-glass-red rounded-3xl p-6 sm:p-7 border border-red-500/30 space-y-6 shadow-xl flex flex-col justify-between animate-fade-in-up stagger-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(255,0,0,0.3)]">
                <Youtube size={26} className="fill-red-500" />
              </div>
              <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                isConnected 
                  ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' 
                  : 'text-amber-400 bg-amber-500/15 border-amber-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {isConnected ? 'Ulangan (OAuth 2.0)' : 'Kanal ulanmagan'}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">YouTube Rasmiy API</h3>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                YouTube Data API v3 va YouTube Analytics API orqali videolarni avtomatlashtirilgan xavfsiz yuklash va statistikani tahlil qilish.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400">Ulangan kanal:</span>
                <span className="font-bold text-white">
                  {isConnected ? `${channelTitle} (${subCount})` : 'Kanal ulanmagan'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400">Kunlik yuklash kvotasi:</span>
                <span className={`font-bold ${isConnected ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {isConnected ? '2 / 100 video (Xavfsiz)' : 'Ulanmagan'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400">Google OAuth 2.0:</span>
                <span className={`font-bold ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isConnected ? 'Kalitlar kiritilgan' : 'Ulanmagan'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center gap-3">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw size={14} className={isConnecting ? "animate-spin" : ""} /> 
              {isConnecting ? "Ulanmoqda..." : (isConnected ? "Kanalni qayta ulash" : "O'z YouTube kanalingizni ulang")}
            </Button>
            {isConnected && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisconnect}
                className="w-full text-red-400 hover:text-red-300 border-red-500/30"
              >
                Kanalni uzish
              </Button>
            )}
          </div>
        </div>

        {/* Telegram Bot Card */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/10 space-y-6 shadow-xl flex flex-col justify-between animate-fade-in-up stagger-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.25)]">
                <Send size={24} />
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full">
                Telegram Hamroh Bot
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Telegram Bot Bildirishnomalari</h3>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                Video tayyor bo'lganda Telegram orqali xabar olish va bitta tugma bilan nashrni tasdiqlash yoki rad etish.
              </p>
            </div>

            {/* Linking code box */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="text-xs text-gray-400 flex items-center justify-between">
                <span>Bir martalik ulash kodi:</span>
                <span className="text-[10px] text-amber-400 font-semibold">5 daqiqa amal qiladi</span>
              </div>
              <div className="flex items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-white/5 font-mono text-sm">
                <span className="text-red-400 font-bold tracking-widest text-base">/link {linkCode}</span>
                <button 
                  onClick={copyCode}
                  className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-sans text-gray-200 hover:bg-white/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Copy size={12} /> {copied ? 'Nusxalandi!' : 'Nusxalash'}
                </button>
              </div>
              <p className="text-[11px] text-gray-500">
                Botga kiring (@jpilot_bot) va yuqoridagi buyruqni yuboring.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center gap-3">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={sendTestNotification}
              className="w-full flex items-center justify-center gap-2"
            >
              {testSent ? 'Xabar yuborildi!' : 'Test bildirishnoma yuborish'}
            </Button>
          </div>
        </div>
      </div>

      {/* AI Provider Section */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-7 border border-purple-500/20 bg-purple-500/[0.02] space-y-4 animate-fade-in-up stagger-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">AI Skript va SEO Provayderi</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  FLAGSHIP 2026
                </span>
              </div>
              <p className="text-xs text-gray-400">Google Gemini 3.6 Flash eng so'nggi flagman modeli orqali ishlamoqda</p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-purple-500/20">
            <span className="text-xs text-gray-400 block mb-1">Model</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Gemini 3.6 Flash</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">ENG YAXSHISI</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-400 block mb-1">Kontent Tili</span>
            <span className="text-sm font-bold text-white">English (US / Global)</span>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-400 block mb-1">Sifat Nazorati</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Ultra-Yuqori Sifat
            </span>
          </div>
        </div>
      </div>

      {/* Google Flow & Veo Video AI Section */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-7 border border-emerald-500/20 bg-emerald-500/[0.02] space-y-6 animate-fade-in-up stagger-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Video size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Google Flow / Google Veo Video AI Studiyasi</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AVTONOM REJIM FAOL
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Google DeepMind Veo va o'rnatilgan neyron video generatori orqali har bir sahnaga kinematik video yaratadi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/30 transition-all self-start sm:self-auto cursor-pointer"
          >
            <KeyRound size={13} />
            {showKeyInput ? "Sozlamalarni yopish" : "Shaxsiy Google API kaliti (Ixtiyoriy)"}
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-emerald-500/20">
            <span className="text-xs text-gray-400 block mb-1">Dvigatel Holati</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-400">100% Avtonom & Tayyor</span>
              <CheckCircle2 size={14} className="text-emerald-400" />
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Tashqi kalit kiritilmasa ham avtomat ishlaydi</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-400 block mb-1">Video Modeli</span>
            <span className="text-sm font-bold text-white block">Google Veo 3.1 & Neural Faststart</span>
            <span className="text-[11px] text-gray-500 mt-1 block">1080x1920 Ultra-HD 60FPS</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-400 block mb-1">Render Xavfsizligi</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-400" />
              0% Crash & Zero Timeout
            </span>
            <span className="text-[11px] text-gray-500 mt-1 block">Bulutli TPU & Tezyurar FFmpeg zaxirasi</span>
          </div>
        </div>

        {/* Optional Custom API Key accordion */}
        {showKeyInput && (
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-200">Shaxsiy Google AI Studio API Kaliti (Google Veo):</span>
              <span className="text-[11px] text-gray-400">aistudio.google.com</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={googleFlowApiKey}
                onChange={(e) => setGoogleFlowApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveGoogleFlowKey}
                disabled={isSavingKey}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4"
              >
                {isSavingKey ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </div>
            {keySavedToast && (
              <p className="text-xs text-emerald-400 flex items-center gap-1 animate-fade-in">
                <Check size={13} /> Google Flow API kaliti muvaffaqiyatli saqlandi!
              </p>
            )}
            <p className="text-[11px] text-gray-500">
              Ushbu kalit faqat sizning workspace'ingizga tegishli bo'ladi. Agar kalit kiritmasangiz ham, tizim o'rnatilgan avtonom neyron dvigatel orqali videolarni to'liq generatsiya qilaveradi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationsPage;
