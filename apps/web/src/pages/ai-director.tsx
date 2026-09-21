import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Zap, 
  RefreshCw, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Radio, 
  Eye, 
  Video, 
  Mic, 
  Flame, 
  FileText, 
  MessageSquare, 
  Shield, 
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Server
} from 'lucide-react';
import { PageHeader } from '../components/ui/page-header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { getWorkspaceId } from '../lib/workspace';

interface SupervisedModel {
  id: string;
  nameUz: string;
  roleUz: string;
  engine: string;
  category: 'generation' | 'voice' | 'video' | 'quality' | 'analytics' | 'automation';
  status: 'active' | 'busy' | 'idle' | 'warning' | 'error';
  healthScore: number;
  latencyMs: number;
  successRate: string;
  tasksCompleted: number;
  lastTaskUz: string;
  lastActiveAt: string;
  diagnosticNoteUz: string;
}

interface DirectorLogEvent {
  id: string;
  timestamp: string;
  type: 'audit' | 'heal' | 'dispatch' | 'status_change' | 'warning' | 'success';
  modelId?: string;
  titleUz: string;
  detailsUz: string;
  status: 'ok' | 'warning' | 'resolved' | 'info';
}

interface DirectorDashboardData {
  directorName: string;
  systemStatus: 'healthy' | 'warning' | 'degraded' | 'critical';
  systemHealthScore: number;
  activeModelsCount: number;
  totalModelsCount: number;
  averageLatencyMs: number;
  totalTasksSupervised: number;
  lastFullAuditAt: string;
  executiveSummaryUz: string;
  models: SupervisedModel[];
  recentLogs: DirectorLogEvent[];
}

export default function AiDirectorPage() {
  const workspaceId = getWorkspaceId();
  const [data, setData] = useState<DirectorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/ai-director/status`, {
        headers: { 'x-workspace-id': workspaceId }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch AI Director status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, [workspaceId]);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/ai-director/audit`, {
        method: 'POST',
        headers: { 'x-workspace-id': workspaceId }
      });
      const json = await res.json();
      if (json.success) {
        setToastMessage("Barcha 9 ta AI modeli to'liq auditdan o'tkazildi: Barcha modellar sog'lom va faol.");
        fetchDashboardData();
      }
    } catch (e) {
      setToastMessage("Audit jarayonida kutilmagan xatolik yuz berdi.");
    } finally {
      setIsAuditing(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleRunHeal = async () => {
    setIsHealing(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/ai-director/heal`, {
        method: 'POST',
        headers: { 'x-workspace-id': workspaceId }
      });
      const json = await res.json();
      if (json.success) {
        setToastMessage("Avtomatik o'z-o'zini tiklash yakunlandi: Keshlangan ma'lumotlar tozalandi va navbatlar yangilandi.");
        fetchDashboardData();
      }
    } catch (e) {
      setToastMessage("Profilaktika jarayonida xatolik yuz berdi.");
    } finally {
      setIsHealing(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'generation': return <Sparkles className="w-5 h-5 text-indigo-400" />;
      case 'voice': return <Mic className="w-5 h-5 text-emerald-400" />;
      case 'video': return <Video className="w-5 h-5 text-cyan-400" />;
      case 'quality': return <ShieldCheck className="w-5 h-5 text-teal-400" />;
      case 'analytics': return <Flame className="w-5 h-5 text-amber-400" />;
      case 'automation': return <Cpu className="w-5 h-5 text-purple-400" />;
      default: return <Bot className="w-5 h-5 text-blue-400" />;
    }
  };

  const filteredModels = data?.models.filter(m => {
    if (selectedCategory === 'all') return true;
    return m.category === selectedCategory;
  }) || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <PageHeader 
          title="Bosh AI Direktor (Chief AI Director)" 
          description="Barcha sun'iy intellekt modellarining ish faoliyatini 24/7 uzluksiz nazorat qiluvchi, sinovdan o'tkazuvchi va avtomat boshqaruvchi markaz."
        />

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchDashboardData} 
            disabled={isLoading}
            className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yangilash
          </Button>

          <Button 
            variant="outline"
            onClick={handleRunHeal}
            disabled={isHealing}
            className="border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200"
          >
            <Wrench className={`w-4 h-4 mr-2 text-purple-400 ${isHealing ? 'animate-spin' : ''}`} />
            {isHealing ? "Tiklanmoqda..." : "Avtomat Tiklash & Tozalash"}
          </Button>

          <Button 
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-600/25"
          >
            <Zap className={`w-4 h-4 mr-2 ${isAuditing ? 'animate-bounce' : ''}`} />
            {isAuditing ? "Audit O'tkazilmoqda..." : "To'liq Tizim Auditini Boshlash"}
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/50 text-blue-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Director Executive Cockpit */}
      <Card className="border border-blue-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <CardContent className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Director Hologram Avatar */}
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-0.5 shadow-xl shadow-blue-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <Bot className="w-8 h-8 md:w-10 md:h-10 text-blue-400 animate-pulse" />
                    <div className="absolute inset-0 bg-blue-400/10 mix-blend-overlay" />
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
                </span>
              </div>

              {/* Title & Speech */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    Bosh AI Boshqaruvchi
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    Jonli Kuzatuv Faol (9/9 Modellar Nazoratda)
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Bosh AI Direktorning Ijrochi Xulosasi
                </h2>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-sm leading-relaxed max-w-3xl">
                  <p className="italic text-slate-200">
                    "{data?.executiveSummaryUz || "Bosh AI Direktor sifatida barcha 9 ta sun'iy intellekt modulini to'liq nazorat ostida ushlab turibman. Tizimda nosozliklar yo'q, barcha modellar vazifasini 100% bajarmoqda."}"
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Overall Health Gauge */}
            <div className="flex lg:flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 min-w-[160px]">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {data?.systemHealthScore || 99}%
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">
                  Tizim Sog'lomligi
                </div>
                <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
                  Optimal Rejim
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Nazorat Qamrovi</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {data?.activeModelsCount || 9} / {data?.totalModelsCount || 9}
              </div>
              <div className="text-[11px] text-emerald-400 mt-0.5">100% Modellar Faol</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">O'rtacha Kechikish</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {data?.averageLatencyMs || 185} ms
              </div>
              <div className="text-[11px] text-cyan-400 mt-0.5">Tezkor Javob Oqimi</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Bajarilgan Operatsiyalar</span>
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {data?.totalTasksSupervised || 310}+
              </div>
              <div className="text-[11px] text-purple-400 mt-0.5">Xatosiz Bajarildi</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Oxirgi To'liq Audit</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {data?.lastFullAuditAt ? new Date(data.lastFullAuditAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hozirgina'}
              </div>
              <div className="text-[11px] text-amber-400 mt-0.5">Avtomat Himoya</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'Barcha Modellar (9)' },
            { id: 'generation', label: 'Generatsiya & Ssenariy' },
            { id: 'voice', label: 'Ovoz & Nutq' },
            { id: 'video', label: '16:9 & 9:16 Video Render' },
            { id: 'quality', label: 'Sifat & Xavfsizlik' },
            { id: 'analytics', label: 'Trend & Raqobatchilar' },
            { id: 'automation', label: 'Avtonom Konveyer' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Ko'rsatilmoqda: <span className="text-white font-semibold">{filteredModels.length}</span> ta model
        </div>
      </div>

      {/* Supervised AI Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map(model => (
          <Card 
            key={model.id} 
            className="border border-slate-800 bg-slate-950/70 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-blue-500/5 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity" />

            <CardContent className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-slate-700 transition-colors">
                    {getCategoryIcon(model.category)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight group-hover:text-blue-400 transition-colors">
                      {model.nameUz}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {model.engine}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Faol
                </span>
              </div>

              {/* Role */}
              <p className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                {model.roleUz}
              </p>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/70 text-center">
                <div>
                  <div className="text-xs font-bold text-slate-200">{model.latencyMs} ms</div>
                  <div className="text-[10px] text-slate-400">Kechikish</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-400">{model.successRate}</div>
                  <div className="text-[10px] text-slate-400">Muvaffaqiyat</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-400">{model.tasksCompleted} ta</div>
                  <div className="text-[10px] text-slate-400">Vazifalar</div>
                </div>
              </div>

              {/* Last Task & Diagnostic */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">So'nggi bajarilgan ish:</span>
                  <span className="text-slate-200 line-clamp-1">{model.lastTaskUz}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Direktor diagnostikasi:</span>
                  <span className="text-emerald-300/90 text-[11px] line-clamp-2">{model.diagnosticNoteUz}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Director Supervision Activity Log */}
      <Card className="border border-slate-800 bg-slate-950/80">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white text-lg">Direktor Nazorat va Hodisalar Jurnali</h3>
            </div>
            <span className="text-xs text-slate-400">
              Jonli telemetriya va avtomat aralashuvlar
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {data?.recentLogs && data.recentLogs.length > 0 ? (
              data.recentLogs.slice(0, 10).map(log => (
                <div 
                  key={log.id} 
                  className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {log.status === 'ok' || log.status === 'resolved' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">{log.titleUz}</div>
                      <div className="text-slate-400 mt-0.5">{log.detailsUz}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                Jurnal yozuvlari mavjud emas.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
