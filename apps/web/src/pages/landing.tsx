import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Play, 
  Youtube, 
  TrendingUp, 
  BarChart3, 
  Sparkles, 
  Link2, 
  UserPlus, 
  Check, 
  ArrowRight,
  Shield,
  Clock,
  Video,
  Zap,
  Palette
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#07070a] text-gray-100 overflow-x-hidden selection:bg-red-500/30">
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none studio-grid-bg opacity-30"></div>
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[150px] pointer-events-none animate-float"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-rose-700/10 blur-[180px] pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a10]/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 p-[1.5px] shadow-[0_0_20px_rgba(255,0,50,0.3)]">
              <div className="w-full h-full bg-[#0d0d14] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <Play size={18} className="fill-red-500 text-red-500 ml-0.5 z-10" />
              </div>
            </div>
            <span className="text-xl font-black tracking-tight text-white">JPILOT</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">Xususiyatlar</a>
            <a href="#pricing" className="hover:text-white transition-colors">Narxlar</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="outline" className="hidden sm:inline-flex rounded-full">
                Kirish
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="primary" className="rounded-full shadow-[0_0_15px_rgba(255,0,50,0.4)]">
                Boshlash
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <div className="mb-8 p-1 animate-pulse-glow rounded-full">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 p-[2px]">
            <div className="w-full h-full bg-[#0a0a0f] rounded-full flex items-center justify-center">
              <Play size={40} className="fill-red-500 text-red-500 ml-2" />
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 max-w-4xl text-gradient-white animate-fade-in-up">
          YouTube Kanalingizni AI Bilan <span className="text-gradient-red">Avtonom Boshqaring</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl animate-fade-in-up stagger-1">
          Jpilot — videolar yaratishdan tortib YouTube'ga yuklashgacha bo'lgan barcha jarayonni sun'iy intellekt bilan avtomatlashtiradigan professional studiya platformasi.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up stagger-2">
          <Link to="/auth">
            <Button size="lg" className="rounded-full px-8 text-base shadow-[0_0_30px_rgba(255,0,50,0.3)]">
              Bepul Boshlash <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
          <a href="#features">
            <Button variant="outline" size="lg" className="rounded-full px-8 text-base">
              Batafsil Ma'lumot
            </Button>
          </a>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/10 bg-white/[0.02] backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Foydalanuvchilar" },
              { value: "10,000+", label: "Yaratilgan Videolar" },
              { value: "98%", label: "Avtomatlashtirish" },
              { value: "24/7", label: "AI Xizmati" }
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">Yagona Platforma, Cheksiz Imkoniyatlar</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">AI yordamida kanal o'sishini 10 barobarga tezlashtiring.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Video, title: "AI Video Yaratish", desc: "Script, ovoz, video — barchasi avtomatik", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
            { icon: Clock, title: "YouTube Avtopilot", desc: "Kuniga 2 ta video, to'liq avtomatik rejim", color: "text-red-400 bg-red-500/10 border-red-500/20" },
            { icon: TrendingUp, title: "Trend Radar", desc: "Real-vaqt trend tahlili va raqobatchi kuzatuvi", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
            { icon: BarChart3, title: "Chuqur Analitika", desc: "Ko'rishlar, CTR, auditoriya — batafsil hisobot", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            { icon: Palette, title: "CTR Optimizatsiya", desc: "AI muqova va sarlavha A/B testlari", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
            { icon: Link2, title: "YouTube Integratsiya", desc: "YouTube API v3 bilan to'liq bog'lanish", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" }
          ].map((feat, i) => (
            <Card key={i} className="liquid-card-hover group border border-white/5 bg-white/[0.02]">
              <CardContent className="p-8">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-6 ${feat.color}`}>
                  <feat.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-gray-400">{feat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-black/50 border-y border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">Qanday Ishlaydi?</h2>
            <p className="text-gray-400">3 ta oddiy qadam bilan studiyani ishga tushiring.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: UserPlus, title: "Ro'yxatdan O'ting", desc: "Shaxsiy hisob yarating." },
              { icon: Youtube, title: "YouTube Kanalni Ulang", desc: "API orqali xavfsiz ulanish." },
              { icon: Sparkles, title: "AI Ishga Tushsin", desc: "Videolar avtomatik yaratiladi." }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 relative">
                  <step.icon size={32} />
                  {i !== 2 && <div className="hidden md:block absolute top-1/2 left-full w-full h-[1px] bg-gradient-to-r from-red-500/30 to-transparent z-[-1] transform -translate-y-1/2" />}
                </div>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">Oddiy Narxlar</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border border-white/10 bg-white/[0.03]">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-2">Bepul Sinov</h3>
              <div className="text-4xl font-black text-white mb-6">0 UZS <span className="text-lg text-gray-500 font-normal">/3 kun</span></div>
              <ul className="space-y-4 mb-8">
                {["Cheklangan video yaratish", "Oddiy ovoz (TTS)", "Boshlang'ich analitika"].map((f, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <Check size={18} className="text-emerald-500 mr-3" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth">
                <Button variant="outline" className="w-full">Bepul Boshlash</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-red-500/40 bg-gradient-to-b from-red-900/20 to-black/20 shadow-[0_0_30px_rgba(255,0,50,0.15)] relative">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
              <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Eng Mashhur</span>
            </div>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-2">PRO</h3>
              <div className="text-4xl font-black text-white mb-6">60,000 UZS <span className="text-lg text-gray-500 font-normal">/oy</span></div>
              <ul className="space-y-4 mb-8">
                {["Cheksiz AI video", "Neural AI Ovoz (Premium)", "YouTube Avtopilot", "Trend Radar", "CTR Optimizator"].map((f, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <Check size={18} className="text-red-500 mr-3" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth">
                <Button variant="primary" className="w-full shadow-[0_0_20px_rgba(255,0,50,0.3)]">Obuna Bo'lish</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/10 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Play size={20} className="fill-red-500 text-red-500" />
          <span className="text-xl font-black text-white">JPILOT</span>
        </div>
        <p className="text-gray-500 text-sm mb-2">Jpilot Studio 2.0 — AI Creator Studio</p>
        <p className="text-gray-600 text-xs">Built by Neural Pulse AI team • Copyright 2026</p>
      </footer>
    </div>
  );
};

export default LandingPage;
