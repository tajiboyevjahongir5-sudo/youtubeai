import React, { useState } from 'react';
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
  Radio
} from 'lucide-react';
import { clsx } from 'clsx';

const AppLayout = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Boshqaruv paneli', icon: LayoutDashboard },
    { path: '/content', label: 'Kontent', icon: FileText },
    { path: '/calendar', label: 'Taqvim', icon: Calendar },
    { path: '/analytics', label: 'Analitika', icon: BarChart3 },
    { path: '/strategy', label: 'Strategiya', icon: Lightbulb },
    { path: '/integrations', label: 'Integratsiyalar', icon: Link2 },
    { path: '/settings', label: 'Sozlamalar', icon: Settings },
    { path: '/activity', label: 'Faollik jurnali', icon: Activity },
  ];

  const toggleSidebar = () => setIsMobileOpen(!isMobileOpen);

  return (
    <div className="flex h-screen bg-[#09090d] text-gray-100 overflow-hidden relative">
      {/* Ambient YouTube Liquid Glow Lights — animated float */}
      <div className="fixed top-[-15%] left-[15%] w-[550px] h-[550px] rounded-full bg-red-600/10 blur-[140px] pointer-events-none -z-10 glow-orb" />
      <div className="fixed bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-rose-700/8 blur-[160px] pointer-events-none -z-10 glow-orb-slow" />
      <div className="fixed top-[45%] right-[25%] w-[450px] h-[450px] rounded-full bg-red-500/5 blur-[120px] pointer-events-none -z-10 glow-orb" />

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden" onClick={toggleSidebar}></div>
      )}

      {/* Frosted Liquid Glass Sidebar */}
      <aside className={clsx(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0c0c12]/85 backdrop-blur-2xl border-r border-white/10 text-gray-300 flex flex-col p-4 space-y-4 transition-transform duration-200 ease-in-out md:translate-x-0 shadow-2xl",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-4 px-2 pt-2">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.45)] group-hover:scale-105 transition-transform">
              <Play size={18} className="fill-white text-white ml-0.5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                Jpilot
              </span>
              <span className="text-[10px] block font-bold text-red-400 tracking-wider uppercase -mt-1">
                Creator Studio
              </span>
            </div>
          </Link>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={toggleSidebar}>
            <X size={22} />
          </button>
        </div>

        {/* Live Channel Status Badge */}
        <div className="mx-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-gray-300 font-medium">Studio Online</span>
          </div>
          <span className="text-[11px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            2/kun
          </span>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 pt-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setIsMobileOpen(false)}
                className={clsx(
                  "flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative overflow-hidden animate-slide-in-left",
                  isActive 
                    ? "bg-gradient-to-r from-red-600/25 via-red-600/10 to-transparent text-white border-l-3 border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.15)]" 
                    : "text-gray-400 hover:bg-white/[0.06] hover:text-gray-100"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon size={18} className={clsx(
                  "transition-colors",
                  isActive ? "text-red-500" : "text-gray-400 group-hover:text-gray-200"
                )} /> 
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Studio Disclaimer Footer */}
        <div className="pt-3 border-t border-white/5 px-2 text-[11px] text-gray-400 leading-tight">
          YouTube rasmiy API integratsiyasi
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#0c0c12]/70 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 sm:px-8 shadow-lg z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10" onClick={toggleSidebar}>
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
                <Radio size={16} />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Neural Pulse AI</div>
                <div className="text-[11px] text-gray-400">Yangi Kanal • Global (US/EN)</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {typeof window !== 'undefined' && (window as any).__CLERK_CONFIGURED__ ? (
              <SignedIn>
                <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
              </SignedIn>
            ) : (
              <div className="flex items-center gap-2.5 bg-white/[0.06] border border-white/10 py-1.5 px-3 rounded-xl backdrop-blur-md">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  JP
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight">Administrator</div>
                  <div className="text-[10px] text-emerald-400 leading-tight">Faol</div>
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
    </div>
  );
};

export default AppLayout;
