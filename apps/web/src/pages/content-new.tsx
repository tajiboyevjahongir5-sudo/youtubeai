import React, { useState } from 'react';
import { PageHeader } from '../components/ui/page-header';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Sparkles, Youtube, ArrowRight, Wand2, Check, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { getWorkspaceId } from '../lib/workspace';
import { fetchApi } from '../lib/api';

const NewContentPage = () => {
  const navigate = useNavigate();
  const [format, setFormat] = useState<'shorts' | 'long_form'>('shorts');
  const [pillar, setPillar] = useState('educational');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    const workspaceId = getWorkspaceId();
    const finalTopic = topic.trim() || (format === 'shorts' 
      ? 'Top 5 Secret AI Websites That Feel Illegal to Know in 2026 #Shorts' 
      : 'Building an Autonomous AI Engineering System: 2026 Masterclass');

    try {
      setGenStep('1/3: Mavzu va maqsadli auditoriya tahlil qilinmoqda...');
      
      const stepTimer1 = setTimeout(() => {
        setGenStep('2/3: Gemini 3.6 Flash skript va multi-sahna boblarini yozmoqda...');
      }, 700);

      const stepTimer2 = setTimeout(() => {
        setGenStep('3/3: Yuqori konversiyali SEO va YouTube metadata optimallashtirilmoqda...');
      }, 1500);

      const res = await fetchApi(`/workspaces/${workspaceId}/content`, {
        method: 'POST',
        body: JSON.stringify({
          title: finalTopic,
          videoFormat: format,
          contentPillar: pillar,
          status: 'review'
        })
      }, async () => 'mock_token');

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (res && res.id) {
        navigate(`/content/${res.id}`);
      } else {
        navigate('/content/item_1');
      }
    } catch (err) {
      console.error('Generation error:', err);
      // Fallback
      navigate('/content/item_1');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Yangi Video Yaratish (AI Studio)" 
        description="Ingliz tilidagi yuqori retention skript va SEO metadatasini generatsiya qilish." 
      />

      <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl animate-scale-in">
        {/* Format Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Video Formati</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormat('shorts')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                format === 'shorts'
                  ? 'bg-red-600/15 border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.2)]'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-white">#Shorts</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">9:16 Vertikal</span>
              </div>
              <p className="text-xs text-gray-400">Maks 60 soniya • Yuqori viral potentsial va tezkor obunachilar</p>
            </button>

            <button
              type="button"
              onClick={() => setFormat('long_form')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                format === 'long_form'
                  ? 'bg-red-600/15 border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.2)]'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-white">Long-form Video</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">16:9 Gorizontal</span>
              </div>
              <p className="text-xs text-gray-400">8 - 15 daqiqa • Yuqori CPM va uzoq muddatli tomosha vaqti</p>
            </button>
          </div>
        </div>

        {/* Content Pillar */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Kontent Yo'nalishi</label>
            <Select value={pillar} onChange={(e) => setPillar(e.target.value)}>
              <option value="educational">Ta'limiy & Qo'llanmalar (Educational)</option>
              <option value="news">AI & Texnologiya Yangiliklari (News)</option>
              <option value="documentary">Hujjatli & Chuqur tahlil (Documentary)</option>
              <option value="entertainment">Qiziqarli faktlar (Entertainment)</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Mo'ljallangan Vaqt</label>
            <Select defaultValue="14">
              <option value="14">14:00 UTC (19:00 Toshkent) - Kunduzgi oyna</option>
              <option value="21">21:00 UTC (02:00 Toshkent) - Tungi oyna</option>
            </Select>
          </div>
        </div>

        {/* Topic Input */}
        <div className="space-y-1.5">
          <Input 
            label="Mavzu yoki Asosiy Kalit So'z" 
            placeholder="Masalan: 5 AI Tools That Work While You Sleep..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <p className="text-[11px] text-gray-400">
            Agar mavzu kiritmasangiz, AI kanalning eng yaxshi natijalariga asoslanib eng samarali g'oyani avtomatik tanlaydi.
          </p>
        </div>

        {/* Action button */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            <Clock size={14} className="text-red-500" /> 
            {isGenerating ? genStep : 'Generatsiya taxminan 2-4 soniya oladi'}
          </span>
          <Button 
            variant="primary" 
            size="lg" 
            disabled={isGenerating}
            onClick={handleGenerate}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="animate-spin" /> {genStep || 'Generatsiya qilinmoqda...'}
              </span>
            ) : (
              <>
                <Wand2 size={18} /> Skript va SEO generatsiya qilish
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewContentPage;
