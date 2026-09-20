import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { SignedIn, UserButton } from '@clerk/clerk-react';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  BarChart3, 
  Lightbulb, 
  Link2, 
  Settings, 
  Activity, 
  Menu, 
  X,
  Play,
  Radio,
  RotateCcw,
  ShieldCheck,
  Zap,
  Flame,
  Sparkles,
  Plus,
  Cpu,
  CheckCircle2,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { getWorkspaceId, resetWorkspace } from '../lib/workspace';
import { SubscriptionModal } from '../components/subscription-modal';

const AppLayout = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelStatus, setChannelStatus] = useState('');
  const wsId = getWorkspaceId();

  useEffect(() => {
    fetch(`/api/workspaces/${wsId}/youtube/channel`, {
      headers: { 'x-workspace-id': wsId }
    })
      .then(res => res.json())
      .then(data => {
        if (
          data.connectionStatus === 'connected' && 
          data.channelTitle && 
          data.channelTitle !== 'YouTube Kanal Ulanmagan' && 
          data.channelTitle !== 'Kanal ulanmagan'
        ) {
          setChannelName(data.channelTitle);
          setChannelStatus('Ulangan');
        } else {
          setChannelName('Kanal ulanmagan');
          setChannelStatus('Ulanmagan');
        }
      })
      .catch(() => {
        setChannelName('Kanal ulanmagan');
        setChannelStatus('Ulanmagan');
      });
  }, [wsId]);

  interface NavItem {
    path: string;
    label: string;
    icon: React.ComponentType<any>;
    badge?: string;
    isChannel?: boolean;
  }

  const navGroups: { title: string; items: NavItem[] }[] = [
    {
      title: 'STUDIO & KONTENT',
      items: [
        { path: '/dashboard', label: 'Boshqaruv paneli', icon: LayoutDashboard },
        { path: '/content', label: 'Kontent Fabrikasi', icon: FileText },
        { path: '/trends', label: 'Trend Ovchisi (Radar)', icon: Flame, badge: 'HOT' },
        { path: '/calendar', label: 'Nashrlar Taqvim', icon: Calendar },
      ]
    },
    {
      title: "O'SISH & DAROMAD",
      items: [
        { path: '/analytics', label: 'Auditoriya & Analitika', icon: BarChart3 },
        { path: '/strategy', label: 'Kanal Strategiyasi', icon: Lightbulb },
        { path: '/integrations', label: 'YouTube Integratsiya', icon: Link2, isChannel: true },
      ]
    },
    {
      title: 'TIZIM & MONITORING',
      items: [
        { path: '/settings', label: 'Studiya Sozlamalari', icon: Settings },
        { path: '/activity', label: 'Jonli Faollik Jurnali', icon: Activity },
      ]
    }
  ];

  const toggleSidebar = () => setIsMobileOpen(!isMobileOpen);

  return (
    <div className="flex h-screen bg-[#07070a] text-gray-100 overflow-hidden relative studio-grid-bg">
      {/* Ambient YouTube Liquid Glow Lights — animated float */}
      <div className="fixed top-[-15%] left-[10%] w-[600px] h-[600px] rounded-full bg-red-600/10 blur-[150px] pointer-events-none -z-10 glow-orb" />
      <div className="fixed bottom-[-10%] right-[5%] w-[650px] h-[650px] rounded-full bg-rose-700/8 blur-[180px] pointer-events-none -z-10 glow-orb-slow" />
      <div className="fixed top-[40%] right-[30%] w-[400px] h-[400px] rounded-full bg-cyan-600/5 blur-[140px] pointer-events-none -z-10 glow-orb" />

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden animate-fade-in" onClick={toggleSidebar}></div>
      )}

      {/* Frosted Liquid Glass Sidebar */}
      <aside className={clsx(
        "fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0a0a10]/90 backdrop-blur-2xl border-r border-white/[0.08] text-gray-300 flex flex-col p-4 space-y-4 transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl overflow-y-auto",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Header / Logo */}
        <div className="flex items-center justify-between px-2 pt-1">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            {/* Custom High-Tech SVG Emblem */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-[1.5px] shadow-[0_0_25px_rgba(255,0,50,0.4)] group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#0d0d14] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent pointer-events-none" />
                <Play size={18} className="fill-red-500 text-red-500 ml-0.5 relative z-10 transition-transform group-hover:scale-110" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">
                  JPILOT
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  2.0
                </span>
              </div>
              <span className="text-[10px] block font-semibold text-zinc-400 tracking-wider uppercase">
                AI CREATOR STUDIO
              </span>
            </div>
          </Link>
          <button className="md:hidden text-gray-400 hover:text-white p-1 rounded-lg" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        {/* Live Channel Status Pill */}
        <div className="mx-1 px-3 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                channelStatus === 'Ulangan' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                channelStatus === 'Ulangan' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <span className="text-zinc-300 font-medium text-[11px] truncate max-w-[120px]">
              {channelStatus === 'Ulangan' ? channelName : 'Kanal Ulanmagan'}
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            channelStatus === 'Ulangan'
              ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25'
              : 'text-amber-300 bg-amber-500/10 border-amber-500/25'
          }`}>
            {channelStatus === 'Ulangan' ? '60 FPS' : 'Kutish'}
          </span>
        </div>
        
        {/* Categorized Navigation */}
        <nav className="flex-1 space-y-4 pt-1">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 select-none">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path} 
                      onClick={() => setIsMobileOpen(false)}
                      className={clsx(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative overflow-hidden",
                        isActive 
                          ? "bg-gradient-to-r from-red-600/25 via-red-600/10 to-transparent text-white border-l-2 border-red-500 shadow-[inset_0_0_15px_rgba(255,0,50,0.15)]" 
                          : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={17} className={clsx(
                          "transition-colors duration-200",
                          isActive ? "text-red-500" : "text-zinc-400 group-hover:text-zinc-200"
                        )} /> 
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.badge}
                        </span>
                      )}
                      {item.isChannel && channelStatus === 'Ulangan' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Live Alex Voice Engine & Studio Status */}
        <div className="mx-1 p-3.5 rounded-2xl bg-gradient-to-br from-red-950/40 via-black/60 to-black/80 border border-red-500/25 space-y-2.5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Cpu size={14} className="text-red-400" /> Alex Studio Engine
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> 42ms
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            60FPS render + Microsoft Azure Neural Speech tayyor.
          </p>
          <button
            onClick={() => setIsSubModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-[0_0_18px_rgba(255,0,50,0.3)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Sparkles size={13} /> PRO Obunani Yoqish
          </button>
        </div>

        {/* Studio Disclaimer Footer */}
        <div className="pt-2 border-t border-white/[0.06] px-2 flex items-center justify-between text-[11px] text-zinc-500">
          <span>YouTube Studio API v3</span>
          <span className="text-[10px] text-emerald-400 font-semibold">● 100% Online</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#0a0a10]/80 backdrop-blur-2xl border-b border-white/[0.08] flex items-center justify-between px-4 sm:px-8 shadow-xl z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-300 hover:text-white p-2 rounded-xl hover:bg-white/10" onClick={toggleSidebar}>
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner ${
                channelStatus === 'Ulangan' 
                  ? 'bg-red-600/15 border-red-500/30 text-red-400 shadow-[0_0_12px_rgba(255,0,50,0.2)]' 
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              }`}>
                <Radio size={16} className={channelStatus === 'Ulangan' ? 'animate-pulse' : ''} />
              </div>
              <div>
                <div className="font-bold text-white text-sm tracking-tight flex items-center gap-2">
                  {channelName || 'Kanal ulanmagan'}
                  {channelStatus === 'Ulangan' && (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="text-[11px]">
                  {channelStatus === 'Ulangan' ? (
                    <span className="text-zinc-400 font-medium">Ulangan • Global (US/EN) • 2 video/kun</span>
                  ) : (
                    <Link to="/integrations" className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
                      Ulanmagan • O'z kanalingizni ulang &rarr;
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Action: New Content */}
            <Link to="/content/new" className="hidden lg:block">
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer">
                <Plus size={14} className="text-red-400" />
                <span>Yangi Video</span>
              </button>
            </Link>

            {/* PRO Obuna Header Button */}
            <button
              onClick={() => setIsSubModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600/20 to-rose-600/20 border border-red-500/40 text-red-300 text-xs font-bold hover:from-red-600/30 hover:to-rose-600/30 transition-all shadow-[0_0_15px_rgba(255,0,50,0.15)] cursor-pointer"
            >
              <Zap size={14} className="text-red-400 fill-red-400" />
              <span className="hidden sm:inline">PRO Obuna (60 000 UZS)</span>
              <span className="sm:hidden">PRO</span>
            </button>

            {/* Workspace Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-xl">
              <span className="text-[11px] text-zinc-400 font-mono">{wsId.substring(0, 10)}</span>
              <button
                onClick={() => { resetWorkspace(); window.location.reload(); }}
                className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                title="Yangi maydon (workspace)"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            {typeof window !== 'undefined' && (window as any).__CLERK_CONFIGURED__ ? (
              <SignedIn>
                <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
              </SignedIn>
            ) : (
              <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] py-1.5 px-3 rounded-2xl backdrop-blur-md">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                  JP
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight">Admin Studio</div>
                  <div className="text-[10px] text-emerald-400 font-medium leading-tight">● Online</div>
                </div>
              </div>
            )}
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 page-enter" key={location.pathname}>
          <Outlet />
        </div>
      </main>

      {/* Subscription Paywall Modal */}
      <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />
    </div>
  );
};

export default AppLayout;

