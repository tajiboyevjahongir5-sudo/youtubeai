import React, { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { 
  Play, 
  Youtube, 
  TrendingUp, 
  BarChart3,
  Sparkles, 
  Link2, 
  Check, 
  ArrowRight,
  Clock, 
  Video, 
  Zap, 
  Palette,
  DollarSign,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Headphones,
  Award,
  HelpCircle
} from 'lucide-react';

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Jpilot nima va u qanday ishlaydi?",
      a: "Jpilot — bu YouTube kanallarini noldan boshqaradigan to'liq avtonom sun'iy intellekt media fabrikasidir. U global trendlarni aniqlaydi, virusli skriptlar yozadi, Alex ismli virtual boshlovchi orqali tabiiy amerika inglizchasida ovozlashtiradi, dinamik 60 FPS video montaj qiladi, diqqatni tortuvchi muqovalar yaratadi va rasmiy YouTube API orqali eng qizg'in soatlarda kanalingizga yuklaydi."
    },
    {
      q: "Mening yuzim yoki ingliz tilini bilishim shartmi?",
      a: "Yo'q, mutlaqo shart emas! Jpilot 100% 'Hands-Free' (yuzsiz va qo'lsiz) tizim asosida ishlaydi. Studiyaning doimiy virtual boshlovchisi Alex (Microsoft Azure Neural Speech texnologiyasi) ravon va professional tarzda gapiradi. Sizdan faqat bir marta o'z YouTube kanalingizni ulash talab etiladi."
    },
    {
      q: "Bundan keladigan pul qayerga tushadi va qanday yechiladi?",
      a: "Barcha daromad (YouTube AdSense reklamalari va homiylik tushumlari) to'g'ridan-to'g'ri sizning o'zingizning rasmiy YouTube Studio va Google AdSense hisobingizga tushadi. Google AdSense orqali mablag'lar har oyning 21-26 sanalarida siz ko'rsatgan O'zbekiston bank kartasiga (Visa / Mastercard) kelib tushadi. Jpilot sizning daromadingizdan hech qanday foiz ushlab qolmaydi — 100% pul sizniki!"
    },
    {
      q: "YouTube kanalim bloklanmaydimi yoki qoidalarga zid emasmi?",
      a: "Kanal mutlaqo xavfsiz. Jpilot faqat rasmiy Google YouTube API v3 orqali qonuniy ishlaydi. Yaratilgan barcha materiallar (skriptlar, litsenziyalangan B-roll kadrlar, mualliflik huquqidan xoli saundtreklar) YouTube hamjamiyati va monetizatsiya qoidalariga 100% mos keladi."
    },
    {
      q: "Yangi ochilgan, 0 obunachili kanalga ham to'g'ri keladimi?",
      a: "Ha, albatta! Jpilot tizimi aynan yangi kanallarni tez fursatda 0 dan 10,000+ obunachiga olib chiqish uchun optimallashtirilgan. Tizim AQSH va Yevropa auditoriyasi uchun yuqori CTR (Click-Through Rate) va 90%+ ushlab turish (Retention) algoritmlari asosida ishlaydi."
    },
    {
      q: "Nima uchun aynan kuniga 2 ta video yuklanadi?",
      a: "YouTube algoritmi muntazamlikni yaxshi ko'radi. Jpilot kuniga 2 ta strategik vaqtda nashr qiladi: 14:00 UTC (19:00 Toshkent) — AQSHda ertalabki eng qizg'in payt (Shorts); va 20:00 UTC (01:00 Toshkent) — AQSHda kechki eng yuqori tomosha vaqti (Long-form yoki ikkinchi Shorts). Bu 30 kunda 60 ta video deganidir."
    },
    {
      q: "Oylik obuna to'lovi qancha va qanday to'lanadi?",
      a: "Jpilot 3 kunlik to'liq bepul sinov muddatini taqdim etadi. Sinovdan so'ng cheksiz barcha funksiyalar (kunlik avtopilot, 60 FPS video render, Azure ovozlar) uchun oylik to'lov atigi 60 000 so'mni tashkil etadi. To'lovni O'zbekistonning istalgan Uzcard yoki Humo kartasi orqali 1 daqiqada amalga oshirish mumkin."
    },
    {
      q: "Videolarni YouTube'ga chiqishidan oldin ko'rib chiqishim mumkinmi?",
      a: "Ha! Sozlamalarda 2 ta rejim mavjud: 'To'liq Avtopilot' (tizim o'zi yaratadi va o'zi yuklaydi) yoki 'Inson Tasdig'i' (videolar tayyor bo'lgach, siz Dashboardda ko'rib chiqib, 'Tasdiqlash' tugmasini bosganingizdan so'ng yuklanadi)."
    }
  ];

  return (
    <div className="min-h-screen bg-[#07070a] text-gray-100 overflow-x-hidden selection:bg-red-500/30">
      {/* Background Ambient Lights */}
      <div className="fixed inset-0 pointer-events-none studio-grid-bg opacity-40"></div>
      <div className="fixed top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-red-600/10 blur-[160px] pointer-events-none animate-float"></div>
      <div className="fixed bottom-[-15%] right-[-10%] w-[650px] h-[650px] rounded-full bg-rose-700/10 blur-[180px] pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-[40%] right-[20%] w-[450px] h-[450px] rounded-full bg-cyan-600/5 blur-[150px] pointer-events-none"></div>

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#07070a]/90 backdrop-blur-2xl border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-[1.5px] shadow-[0_0_25px_rgba(255,0,50,0.35)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0d0d14] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <Play size={20} className="fill-red-500 text-red-500 ml-0.5 z-10" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">JPILOT</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-red-600/30 text-red-400 border border-red-500/30">2.0</span>
              </div>
              <span className="text-[10px] text-zinc-400 tracking-wider font-semibold">AI CREATOR STUDIO</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs xl:text-sm font-semibold text-zinc-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">Jarayon</a>
            <a href="#monetization" className="hover:text-white transition-colors flex items-center gap-1 text-emerald-400">
              <DollarSign size={14} /> Daromad
            </a>
            <a href="#features" className="hover:text-white transition-colors">Funksiyalar</a>
            <a href="#schedule" className="hover:text-white transition-colors">Jadval</a>
            <a href="#pricing" className="hover:text-white transition-colors">Tariflar</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="outline" className="hidden sm:inline-flex rounded-xl text-xs font-bold border-white/15 hover:border-red-500/40">
                Kirish
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="primary" className="rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(255,0,50,0.4)] px-5">
                Bepul Boshlash &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 sm:pt-44 pb-20 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in shadow-[0_0_20px_rgba(255,0,50,0.15)]">
          <Zap size={14} className="fill-red-400" />
          <span>Yangi Avlod Avtonom YouTube AI Media Fabrikasi</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 max-w-5xl text-white leading-[1.1]">
          YouTube Kanalingizni AI Bilan <br />
          <span className="text-gradient-red">To'liq Avtonom Boshqaring</span>
        </h1>
        
        <p className="text-base sm:text-lg lg:text-xl text-zinc-400 mb-10 max-w-3xl leading-relaxed">
          <strong className="text-white">Jpilot</strong> — bu AQSH va Tier-1 mamlakatlari auditoriyasiga mo'ljallangan yuqori daromadli (<span className="text-emerald-400 font-semibold">High CPM</span>) ingliz tilidagi videolarni sun'iy intellekt yordamida yaratuvchi, montaj qiluvchi va YouTube kanalingizga jadval asosida avtomatik yuklovchi <span className="text-white font-semibold">100% avtonom studiya</span>.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 text-xs font-semibold text-zinc-300">
          <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Alex AI Virtual Boshlovchi
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
            <Check size={14} className="text-red-400" />
            Kunlik 2 ta Video Avtopilotda
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
            <Check size={14} className="text-red-400" />
            Rasmiy Google YouTube API v3
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-1.5 text-emerald-300">
            <DollarSign size={14} />
            100% Daromad Sizning Kartangizga
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link to="/auth" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-xl px-8 py-3.5 text-base font-bold shadow-[0_0_35px_rgba(255,0,50,0.4)]">
              3 Kunlik Bepul Sinovni Boshlash <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
          <a href="#how-it-works" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl px-8 py-3.5 text-base font-semibold border-white/20 hover:border-white/40">
              Qanday Ishlaydi? (Batafsil)
            </Button>
          </a>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="border-y border-white/10 bg-white/[0.02] backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white">500+</div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-500 uppercase tracking-wider">Faol Studiyalar</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-gradient-red">10,000+</div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-500 uppercase tracking-wider">Yaratilgan Videolar</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">100%</div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-500 uppercase tracking-wider">Avtonom Ishlash</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white">$12-$25</div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-500 uppercase tracking-wider">AQSH O'rtacha CPM</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Live Studio Cockpit Preview */}
      <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-600/10 px-3 py-1 rounded-full border border-red-500/20">
            Jonli Studiya Paneli
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-3 mb-3">
            Kanal Boshqaruvi Hech Qachon Bu Qadar Oson Bo'lmagan
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
            Barcha murakkab texnik vazifalarni — g'oya qidirish, ssenariy yozish, montaj va SEO optimizatsiyani Jpilot o'z zimmasiga oladi.
          </p>
        </div>

        {/* Realistic Dashboard Cockpit Box */}
        <div className="liquid-glass rounded-3xl border border-white/15 p-4 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center font-bold text-white shadow-lg">
                <Youtube size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Sizning YouTube Kanalingiz</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> DEMO NAMUNA
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-medium">O'z kanalingizni ulang • Global (AQSH/EN) • 2 video/kun avtopilot</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-zinc-300 font-mono">
                Avtopilot: Faol (60 FPS)
              </span>
              <span className="text-xs px-3 py-1.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 font-semibold">
                Keyingi Nashr: Bugun, 19:00
              </span>
            </div>
          </div>

          {/* 3 Cockpit Action Cards Inside Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <Clock size={14} className="text-cyan-400" /> Bugungi 1-Video (Shorts)
              </span>
              <div className="text-sm font-bold text-white line-clamp-1">AI & Texnologiya Trend Shorts (Namuna)</div>
              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Render qilindi (100%)
                </span>
                <span className="text-zinc-500 font-mono">14:00 UTC</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <Clock size={14} className="text-amber-400" /> Bugungi 2-Video (Long-form)
              </span>
              <div className="text-sm font-bold text-white line-clamp-1">Avtomatlashtirilgan Masterclass Video (Namuna)</div>
              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Clock size={12} /> Ssenariy tayyor (92% SEO)
                </span>
                <span className="text-zinc-500 font-mono">20:00 UTC</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <Headphones size={14} className="text-rose-400" /> Alex AI Studio Ovoz
              </span>
              <div className="text-sm font-bold text-white">ChristopherNeural (AQSH)</div>
              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-zinc-400">Tezlik: +14% • Pitch: +1Hz</span>
                <span className="text-emerald-400 font-bold">42ms DSP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: MONETIZATION & DAROMAD MEXANIZMI */}
      <section id="monetization" className="scroll-mt-24 py-24 bg-gradient-to-b from-black/60 to-[#07070a] border-y border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Kanal Qanday Pul Topadi?
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 mb-4">
              AQSH Auditoriyasidan Yuqori Valyutada Daromad Oling
            </h2>
            <p className="text-zinc-400 max-w-3xl mx-auto text-sm sm:text-base">
              Nima uchun aynan ingliz tili va Tier-1 mamlakatlari? O'zbekiston yoki MDH auditoriyasi uchun YouTube CPM o'rtacha <strong>$0.5 - $1</strong> bo'lsa, AQSH, Buyuk Britaniya va Yevropa auditoriyasi uchun bu ko'rsatkich <strong>$8 dan $25 gacha</strong> yetadi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4 hover:border-emerald-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl">
                <DollarSign size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">1. YouTube AdSense (CPM $12+)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Videolaringiz boshida va orasida chiqadigan YouTube reklamalari uchun to'lov. AQSH texnologiya nishasida 100 000 ko'rish uchun <strong>$800 - $1,500</strong> daromad olish mumkin.
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4 hover:border-cyan-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xl">
                <Link2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">2. Hamkorlik (Affiliate) Havolalari</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Har bir video tavsifida AI instrumentlari, hosting yoki SaaS mahsulotlarining referal havolalari joylanadi. Har bir xariddan 20% dan 50% gacha komissiya to'lanadi.
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4 hover:border-amber-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl">
                <Award size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">3. Global Homiy va Sponsorlar</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Kanal 10,000+ obunachiga yetganda, xorijiy kompaniyalar o'z xizmatlarini videoda 15 soniya ko'rsatish uchun har bir videoga <strong>$300 - $1,000</strong> to'lashadi.
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4 hover:border-rose-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-xl">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">4. Pul To'g'ridan-to'g'ri Kartangizga</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Barcha tushumlar to'g'ridan-to'g'ri sizning rasmiy Google AdSense hisobingizga tushadi va har oy O'zbekiston bank kartangizga (Visa / Mastercard) o'tkaziladi. Jpilot daromadga teginmaydi!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: 6-STEP PIPELINE */}
      <section id="how-it-works" className="scroll-mt-24 py-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            6 Bosqichli Avtonom Ishlash Sxemasi
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 mb-4">
            G'oyadan Nashrgacha — 100% Sun'iy Intellekt
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
            Siz hech narsa yozmaysiz, ovoz bermaysiz va montaj qilmaysiz. Tizim to'liq mustaqil ishlaydi:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-3 relative">
            <span className="absolute top-5 right-5 text-2xl font-black text-white/10">01</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Global Trendlarni Skanerlash</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Jpilot real vaqt rejimida YouTube qidiruvlari va raqobatchi kanallarni kuzatadi. Hozirda AQSHda eng tez ko'rilayotgan mavzularni tanlab oladi.
            </p>
          </div>

          <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-3 relative">
            <span className="absolute top-5 right-5 text-2xl font-black text-white/10">02</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Viral Psixologik Skript</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tomoshabinni dastlabki 3 soniyada to'xtatuvchi ('Pattern Interrupt') va 90%+ ushlab turishni ta'minlaydigan professional inglizcha ssenariy yoziladi.
            </p>
          </div>

          <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-3 relative">
            <span className="absolute top-5 right-5 text-2xl font-black text-white/10">03</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Headphones size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Alex AI Ovoz Sintezi</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Microsoft Azure Neural Speech orqali jonli va ishonchli Amerika talaffuzida toza studio ovozi sintez qilinadi (+14% sur'at, kristal tiniqlik).
            </p>
          </div>

          <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-3 relative">
            <span className="absolute top-5 right-5 text-2xl font-black text-white/10">04</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Video size={20} />
            </div>
            <h3 className="text-base font-bold text-white">60 FPS B-Roll Montaj</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Matnga mos keluvchi yuqori sifatli video parchalar (datacenter, coding, texnologiya), silliq o'tishlar va sub-bass SFX tovushlar qatlam-qatlam birlashtiriladi.
            </p>
          </div>

          <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-3 relative">
            <span className="absolute top-5 right-5 text-2xl font-black text-white/10">05</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Palette size={20} />
            </div>
            <h3 className="text-base font-bold text-white">CTR Muqova & A/B Miniatyura</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              12%+ Click-Through Rate (bosish) beruvchi yorqin va professional miniatyuralar (Thumbnails) hamda jalb qiluvchi sarlavhalar avtomatik tayyorlanadi.
            </p>
          </div>

          <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-3 relative">
            <span className="absolute top-5 right-5 text-2xl font-black text-white/10">06</span>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center font-bold">
              <Youtube size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Pik Soatda YouTube'ga Nashr</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Rasmiy YouTube API orqali video avtomatik yuklanadi, to'liq SEO teglari qo'yiladi va auditoriya bilan muloqot uchun birinchi mahkamlangan izoh qoldiriladi.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: PUBLISHING SCHEDULE */}
      <section id="schedule" className="scroll-mt-24 py-24 bg-white/[0.01] border-y border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Optimal Avtopilot Rejimi
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 mb-4">
              Nima Uchun Aynan Kuniga 2 ta Video?
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
              YouTube algoritmi eng yuqori baholaydigan omil — bu muntazamlikdir. Tizim AQSHning 2 ta asosiy trafik to'lqiniga moslashtirilgan:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="liquid-glass rounded-3xl p-8 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  1-Slot: Ertalabki To'lqin
                </span>
                <span className="text-xs font-mono text-zinc-400">14:00 UTC (19:00 Toshkent)</span>
              </div>
              <h3 className="text-xl font-bold text-white">Viral YouTube Shorts (9:16)</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                AQSH va Yevropada ertalabki kofe va ishga borish vaqti. Shorts tasmasida yangi tomoshabinlar oqimini jalb qilish va kanalga tezda obunachi to'plash uchun xizmat qiladi.
              </p>
              <div className="pt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Maqsad: Yangi obunachilar va tezkor qamrov
              </div>
            </div>

            <div className="liquid-glass rounded-3xl p-8 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  2-Slot: Kechki Prime-Time
                </span>
                <span className="text-xs font-mono text-zinc-400">20:00 UTC (01:00 Toshkent)</span>
              </div>
              <h3 className="text-xl font-bold text-white">Long-Form Masterclass (16:9)</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                AQSHda kechki dam olish vaqti — tomosha soatlari va eng yuqori reklamalar tushadigan davr. 8-15 daqiqalik chuqur tahlillar orqali maksimal AdSense daromadi ishlanadi.
              </p>
              <div className="pt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Maqsad: 4000 soat tomosha va yuqori daromad
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-zinc-400">
              <strong className="text-white">Natija:</strong> 30 kun ichida kanalingizga <span className="text-emerald-400 font-bold">60 ta yuqori sifatli video</span> to'liq avtopilotda joylashtiriladi!
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: FEATURES LIST */}
      <section id="features" className="scroll-mt-24 py-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Platforma Imkoniyatlari
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 mb-4">
            Professional YouTube Studiya Asboblari
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
            Har bir modul YouTube algoritmi va organik auditoriya o'sishi qoidalariga asoslangan holda maxsus ishlab chiqilgan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Video size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Avtomatlashtirilgan Video Fabrika</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Mavzuni kiritishingiz bilan sun'iy intellekt skript, ovoz, subtitr va B-roll videolarni to'liq 60 FPS formatda o'zi tayyorlaydi.
            </p>
          </div>

          <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Hands-Free Avtopilot</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Kuniga 2 ta video — ertalab va kechqurun. Barchasi avtomatik tarzda YouTube API orqali kanalingizga yuklanadi.
            </p>
          </div>

          <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Trend Ovchisi (Radar)</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              AQSH va dunyo bo'ylab nishangizdagi eng ommabop mavzular va raqobatchilarning eng yaxshi ishlayotgan videolarini kuzatadi.
            </p>
          </div>

          <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Jonli YouTube Analitika</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tomosha soatlari, ko'rishlar, obunachilar soni va CTR ko'rsatkichlari real vaqtda to'g'ridan-to'g'ri YouTube API orqali yangilanadi.
            </p>
          </div>

          <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Palette size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">AI Miniatyura (Thumbnail Lab)</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Eng yuqori bosish ko'rsatkichini beruvchi yorqin va professional YouTube muqovalari avtomatik generatsiya qilinadi.
            </p>
          </div>

          <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Link2 size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Xavfsiz Google OAuth 2.0</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Kanal parolini hech kimga bermaysiz. Rasmiy Google xavfsizlik protokoli orqali kanalingizni 1 bosishda xavfsiz bog'laysiz.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: PRICING */}
      <section id="pricing" className="scroll-mt-24 py-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            Shaffof va Qulay Narxlar
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 mb-4">
            Oddiy va Hamyonbop Rejalar
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
            Hech qanday yashirin komissiyalarsiz. Barcha funksiyalarga to'liq kirish huquqi.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Trial */}
          <div className="liquid-glass rounded-3xl p-8 border border-white/10 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">Bepul Sinov</h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-zinc-300">3 Kunlik</span>
              </div>
              <div className="text-4xl font-black text-white mb-6">0 UZS <span className="text-sm text-zinc-500 font-normal">/3 kun</span></div>
              <p className="text-xs text-zinc-400 mb-6">Platformaning barcha imkoniyatlarini amalda sinab ko'rish uchun to'liq imkoniyat.</p>
              
              <ul className="space-y-3.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>YouTube kanalni bog'lash (OAuth 2.0)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>Trend Ovchisi va raqobatchi monitoringi</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>AI skript va ssenariy generatsiyasi</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>3 ta to'liq sinov videosi</span>
                </li>
              </ul>
            </div>

            <Link to="/auth" className="block pt-6">
              <Button variant="outline" className="w-full rounded-xl py-3 text-sm font-bold border-white/20 hover:border-red-500/40">
                Bepul Sinovni Boshlash
              </Button>
            </Link>
          </div>

          {/* PRO Plan */}
          <div className="liquid-glass rounded-3xl p-8 border-2 border-red-500/50 bg-gradient-to-b from-red-950/20 via-black/40 to-black/60 shadow-[0_0_50px_rgba(255,0,50,0.2)] space-y-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0">
              <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-md">
                Tavsiya Etiladi
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">Jpilot PRO</h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30">Cheksiz</span>
              </div>
              <div className="text-4xl font-black text-white mb-6">
                60,000 UZS <span className="text-sm text-zinc-500 font-normal">/oy</span>
              </div>
              <p className="text-xs text-zinc-400 mb-6">To'liq avtonom YouTube studio fabrikasi — barcha cheklovlar olib tashlangan.</p>
              
              <ul className="space-y-3.5 text-xs text-zinc-200">
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-red-500 flex-shrink-0" />
                  <span><strong>Kunlik 2 ta Video Avtopilotda</strong> (oyiga 60 ta video)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-red-500 flex-shrink-0" />
                  <span><strong>Alex AI Microsoft Azure Ovoz</strong> (kristal toza studiya)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-red-500 flex-shrink-0" />
                  <span><strong>60 FPS Dinamik Montaj & B-Roll</strong> animatsiyalari</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-red-500 flex-shrink-0" />
                  <span><strong>Avtomatik YouTube Nashr</strong> (AQSH pik soatlarida)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-red-500 flex-shrink-0" />
                  <span><strong>30 Kunlik Kontent Matritsasi</strong> to'liq tayyor</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-red-500 flex-shrink-0" />
                  <span>O'zbekiston kartalari (Uzcard / Humo) bilan to'lov</span>
                </li>
              </ul>
            </div>

            <Link to="/auth" className="block pt-6">
              <Button variant="primary" className="w-full rounded-xl py-3.5 text-sm font-bold shadow-[0_0_25px_rgba(255,0,50,0.4)]">
                PRO Obunani Faollashtirish &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION: FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section id="faq" className="scroll-mt-24 py-24 bg-white/[0.01] border-y border-white/10 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Savol-Javoblar
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 mb-4">
              Ko'p Beriladigan Savollar
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Jpilot haqida bilishingiz kerak bo'lgan barcha muhim savollarga ochiq va to'liq javoblar:
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className="liquid-glass rounded-2xl border border-white/10 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-base sm:text-lg font-bold text-white flex items-center gap-3">
                      <HelpCircle size={20} className="text-red-500 flex-shrink-0" />
                      {faq.q}
                    </span>
                    <span className="text-zinc-400 flex-shrink-0">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-zinc-300 leading-relaxed border-t border-white/5 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION (CTA) */}
      <section className="py-24 px-4 sm:px-6 max-w-5xl mx-auto text-center relative z-10">
        <div className="liquid-glass rounded-3xl p-8 sm:p-14 border border-red-500/30 bg-gradient-to-b from-red-950/20 via-black to-black shadow-[0_0_60px_rgba(255,0,50,0.15)] space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto shadow-lg">
            <Sparkles size={32} />
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Bugunoq O'z YouTube AI Fabrikangizni Ishga Tushiring
          </h2>
          
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Ro'yxatdan o'tish uchun atigi 1 daqiqa vaqt ketadi. Kanalingizni ulang va sun'iy intellekt siz uchun kechayu-kunduz kontent ishlab chiqarishni boshlasin.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-xl px-10 py-4 text-base font-bold shadow-[0_0_35px_rgba(255,0,50,0.4)]">
                Hisob Yaratish & Boshlash &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center relative z-10 bg-[#050507]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center">
                <Play size={16} className="fill-white text-white ml-0.5" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">JPILOT 2.0</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400">
              <a href="#how-it-works" className="hover:text-white transition-colors">Ishlash Jarayoni</a>
              <a href="#monetization" className="hover:text-white transition-colors">Monetizatsiya</a>
              <a href="#pricing" className="hover:text-white transition-colors">Tariflar</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              <Link to="/auth" className="hover:text-white transition-colors">Kirish</Link>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>Jpilot Studio 2.0 — Avtonom YouTube AI Creator Platformasi</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              YouTube Studio API v3 • Rasmiy Integratsiya
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
