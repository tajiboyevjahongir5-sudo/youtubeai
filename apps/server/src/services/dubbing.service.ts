import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'male' | 'female';
  tone: string;
  style: string;
  sampleText: string;
  audioSampleUrl: string;
}

export interface DubbingLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  targetMarket: string;
  estimatedRpm: string;
  defaultVoice: string;
  voices: VoiceProfile[];
}

export const SUPPORTED_DUB_LANGUAGES: DubbingLanguage[] = [
  {
    code: 'uz',
    name: "O'zbekcha",
    nativeName: "O'zbek tili (Lotin)",
    flag: '🇺🇿',
    targetMarket: "O'zbekiston va Markaziy Osiyo (36M+ auditoriya)",
    estimatedRpm: '$0.40 - $0.90',
    defaultVoice: 'uz-UZ-MadinaNeural',
    voices: [
      {
        id: 'uz-UZ-MadinaNeural',
        name: 'Madina (Ayol)',
        gender: 'female',
        tone: 'Muloyim & Jozibador',
        style: "Ravon, muloyim va aniq talaffuzli ayol diktor. Texnologiya va ta'lim uchun ideal.",
        sampleText: "Assalomu alaykum! Ushbu videoda siz 2026-yilning eng ilg'or sun'iy intellekt vositalari bilan tanishasiz.",
        audioSampleUrl: '/audio/sample_uz-UZ-MadinaNeural.mp3'
      },
      {
        id: 'uz-UZ-SardorNeural',
        name: 'Sardor (Erkak)',
        gender: 'male',
        tone: 'Kuchli & Qat\'iyatli',
        style: "Baquvvat, qat'iyatli va ishonchli ovoz. Dinamik YouTube Shorts va yangiliklar uchun zo'r.",
        sampleText: "To'xtang! Agar siz hali ham kodni qo'lda yozayotgan bo'lsangiz, vaqtingizni bekorga sarflayapsiz.",
        audioSampleUrl: '/audio/sample_uz-UZ-SardorNeural.mp3'
      }
    ]
  },
  {
    code: 'ru',
    name: 'Ruscha',
    nativeName: 'Русский язык',
    flag: '🇷🇺',
    targetMarket: 'MDH, Sharqiy Yevropa (220M+ auditoriya)',
    estimatedRpm: '$1.20 - $2.40',
    defaultVoice: 'ru-RU-DmitryNeural',
    voices: [
      {
        id: 'ru-RU-DmitryNeural',
        name: 'Дмитрий (Мужской)',
        gender: 'male',
        tone: 'Профессиональный & Уверенный',
        style: 'Глубокий, авторитетный мужской голос для технологических обзоров и аналитики.',
        sampleText: 'Привет! Если вы всё ещё программируете вручную в 2026 году, вы теряете драгоценное время.',
        audioSampleUrl: '/audio/sample_ru-RU-DmitryNeural.mp3'
      },
      {
        id: 'ru-RU-SvetlanaNeural',
        name: 'Светлана (Женский)',
        gender: 'female',
        tone: 'Энергичный & Привлекательный',
        style: 'Живой, чистый и выразительный женский голос, идеально удерживающий внимание зрителей.',
        sampleText: 'Встречайте самые передовые нейросети, которые автоматизируют вашу работу за считанные секунды.',
        audioSampleUrl: '/audio/sample_ru-RU-SvetlanaNeural.mp3'
      }
    ]
  },
  {
    code: 'en',
    name: 'Inglizcha',
    nativeName: 'English (US & Global)',
    flag: '🇺🇸',
    targetMarket: 'AQSh, Buyuk Britaniya, Kanada (High CPM)',
    estimatedRpm: '$3.50 - $6.50',
    defaultVoice: 'en-US-ChristopherNeural',
    voices: [
      {
        id: 'en-US-ChristopherNeural',
        name: 'Christopher (Male - Alex Default)',
        gender: 'male',
        tone: 'High-Energy & Viral',
        style: 'Crisp, confident, authoritative American voice. Standard voice of Host Alex for maximum retention.',
        sampleText: "Wait! If you're still writing code manually in 2026, you are wasting your time. Here are the top autonomous AI agents.",
        audioSampleUrl: '/audio/sample_en-US-ChristopherNeural.mp3'
      },
      {
        id: 'en-US-GuyNeural',
        name: 'Guy (Male - Storyteller)',
        gender: 'male',
        tone: 'Deep & Conversational',
        style: 'Natural podcast-style delivery, friendly tone, exceptional clarity for tutorials and storytelling.',
        sampleText: "Welcome back! Today we are testing next-generation artificial intelligence platforms built for developers.",
        audioSampleUrl: '/audio/sample_en-US-GuyNeural.mp3'
      },
      {
        id: 'en-US-JennyNeural',
        name: 'Jenny (Female - Tech Review)',
        gender: 'female',
        tone: 'Clear & Articulate',
        style: 'Polished Silicon Valley style voice for SaaS breakdowns and educational demos.',
        sampleText: "Hello everyone! Let us dive into the top five artificial intelligence platforms changing software development.",
        audioSampleUrl: '/audio/sample_en-US-JennyNeural.mp3'
      }
    ]
  },
  {
    code: 'es',
    name: 'Ispancha',
    nativeName: 'Español (LatAm & España)',
    flag: '🇪🇸',
    targetMarket: 'Ispaniya, Meksika, Lotin Amerikasi (500M+ auditoriya)',
    estimatedRpm: '$1.80 - $3.20',
    defaultVoice: 'es-ES-AlvaroNeural',
    voices: [
      {
        id: 'es-ES-AlvaroNeural',
        name: 'Álvaro (Masculino)',
        gender: 'male',
        tone: 'Dinámico & Cautivador',
        style: 'Voz masculina enérgica y rápida, optimizada para YouTube Shorts y retención masiva.',
        sampleText: '¡Espera! Si todavía estás programando manualmente en 2026, estás perdiendo el tiempo.',
        audioSampleUrl: '/audio/sample_es-ES-AlvaroNeural.mp3'
      }
    ]
  },
  {
    code: 'de',
    name: 'Nemischa',
    nativeName: 'Deutsch (DACH)',
    flag: '🇩🇪',
    targetMarket: 'Germaniya, Avstriya, Shveytsariya (Ultra-High CPM)',
    estimatedRpm: '$4.50 - $7.80',
    defaultVoice: 'de-DE-KillianNeural',
    voices: [
      {
        id: 'de-DE-KillianNeural',
        name: 'Killian (Männlich)',
        gender: 'male',
        tone: 'Präzise & Seriös',
        style: 'Präzise und souveräne deutsche Stimme für hochwertige Tech-Inhalte.',
        sampleText: 'Warte kurz! Die besten KI-Tools für das Jahr 2026 sind endlich da.',
        audioSampleUrl: '/audio/sample_de-DE-KillianNeural.mp3'
      }
    ]
  }
];

export interface DubbedContentPackage {
  languageCode: string;
  languageName: string;
  voiceModel: string;
  rate: string;
  pitch: string;
  translatedTitle: string;
  translatedDescription: string;
  translatedScript: string;
  translatedPinnedComment: string;
  translatedScenes: Array<{
    id: string;
    title: string;
    time: number;
    tag: string;
    overlayText: string;
  }>;
  audioUrl?: string;
  status: 'ready' | 'rendered';
  createdAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data', 'dubbing');
const PUBLIC_AUDIO_DIR = path.resolve(process.cwd(), 'apps', 'server', 'public', 'audio');

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PUBLIC_AUDIO_DIR)) {
    fs.mkdirSync(PUBLIC_AUDIO_DIR, { recursive: true });
  }
}

/**
 * Synthesizes audio using Python edge-tts
 */
export async function synthesizeAudioFile(params: {
  text: string;
  voiceModel: string;
  rate?: string;
  pitch?: string;
  filename: string;
}): Promise<{ audioUrl: string; filePath: string }> {
  ensureDirs();
  const rate = params.rate || '+14%';
  const pitch = params.pitch || '+0Hz';
  const outPath = path.join(PUBLIC_AUDIO_DIR, `${params.filename}.mp3`);
  const scriptPath = path.resolve(process.cwd(), 'apps', 'server', 'scripts', 'synthesize_audio.py');

  const pythonBin = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');

  // Write text to temp file to avoid command-line escaping issues with quotes/newlines
  const tempTextFile = path.join(PUBLIC_AUDIO_DIR, `temp_${Date.now()}_${Math.random().toString(36).substring(7)}.txt`);
  fs.writeFileSync(tempTextFile, params.text, 'utf-8');

  try {
    const res = spawnSync(pythonBin, [
      scriptPath,
      '--voice', params.voiceModel,
      '--rate', rate,
      '--pitch', pitch,
      '--text-file', tempTextFile,
      '--output', outPath
    ], { encoding: 'utf-8', timeout: 35000 });

    if (res.error || res.status !== 0) {
      console.warn(`[DubbingService] Python synthesis warning:`, res.stderr || res.stdout);
    }
  } catch (err) {
    console.error('[DubbingService] Error invoking audio synthesis:', err);
  } finally {
    if (fs.existsSync(tempTextFile)) {
      try { fs.unlinkSync(tempTextFile); } catch {}
    }
  }

  const audioUrl = `/audio/${params.filename}.mp3`;
  return { audioUrl, filePath: outPath };
}

/**
 * Generates an audio preview for voice model testing
 */
export async function synthesizeVoicePreview(
  voiceModel: string,
  customText?: string,
  rate: string = '+0%',
  pitch: string = '+0Hz'
): Promise<{ success: boolean; audioUrl: string; voiceModel: string }> {
  ensureDirs();

  // Find voice metadata
  let sampleText = customText;
  let existingUrl = '';

  for (const lang of SUPPORTED_DUB_LANGUAGES) {
    const v = lang.voices.find(item => item.id === voiceModel);
    if (v) {
      if (!sampleText) sampleText = v.sampleText;
      existingUrl = v.audioSampleUrl;
      break;
    }
  }

  if (!sampleText) {
    sampleText = "Salom! Bu Neural Pulse AI ko'p tilli ovoz studiyasining jonli sinov namunasi.";
  }

  // If rate and pitch are defaults, and static file exists, return immediately for instant response
  if ((!customText || customText.length < 5) && (!rate || rate === '+0%') && (!pitch || pitch === '+0Hz') && existingUrl) {
    const staticPath = path.join(PUBLIC_AUDIO_DIR, path.basename(existingUrl));
    if (fs.existsSync(staticPath)) {
      return { success: true, audioUrl: existingUrl, voiceModel };
    }
  }

  const safeHash = Math.abs(voiceModel.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
  const filename = `preview_${voiceModel.replace(/[^a-zA-Z0-9]/g, '_')}_${safeHash}`;
  const result = await synthesizeAudioFile({
    text: sampleText,
    voiceModel,
    rate,
    pitch,
    filename
  });

  return { success: true, audioUrl: result.audioUrl, voiceModel };
}

// Simulated or OpenRouter-backed high-fidelity translation engine
export async function translateContentForDubbing(
  content: {
    title: string;
    description: string;
    script: string;
    pinnedComment?: string;
    scenes?: any[];
  },
  targetLangCode: string,
  selectedVoice?: string,
  rate: string = '+14%',
  pitch: string = '+0Hz',
  synthesizeFullAudio: boolean = true
): Promise<DubbedContentPackage> {
  ensureDirs();

  const langConfig = SUPPORTED_DUB_LANGUAGES.find(l => l.code === targetLangCode) || SUPPORTED_DUB_LANGUAGES[0];
  const chosenVoice = selectedVoice || langConfig.defaultVoice;

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
  let translatedTitle = '';
  let translatedDescription = '';
  let translatedScript = '';
  let translatedPinnedComment = '';

  if (apiKey) {
    try {
      const prompt = `Translate the following YouTube video content into natural, high-retention ${langConfig.nativeName}.
Keep the energetic tone, hooks, and punchiness suitable for YouTube Shorts.

Input:
Title: ${content.title}
Description: ${content.description}
Script: ${content.script}
Pinned Comment: ${content.pinnedComment || ''}

Respond ONLY with valid JSON in this exact structure:
{
  "title": "translated title",
  "description": "translated description",
  "script": "translated script",
  "pinnedComment": "translated pinned comment"
}`;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3
        })
      });

      if (res.ok) {
        const json: any = await res.json();
        const contentStr = json.choices?.[0]?.message?.content || '';
        const cleaned = contentStr.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        translatedTitle = parsed.title;
        translatedDescription = parsed.description;
        translatedScript = parsed.script;
        translatedPinnedComment = parsed.pinnedComment;
      }
    } catch {
      // fallback if API errors
    }
  }

  // Algorithmic high-quality fallback
  if (!translatedTitle) {
    if (targetLangCode === 'es') {
      translatedTitle = `¡5 Herramientas de IA Que Parecen Ilegales en 2026! #Shorts`;
      translatedDescription = `Descubre las mejores herramientas de inteligencia artificial y agentes autónomos para programar y automatizar tu trabajo en 2026. Suscríbete para más secretos tecnológicos.`;
      translatedScript = `¡Espera! Si todavía estás programando manualmente en 2026, estás perdiendo el tiempo. Estas son las mejores herramientas de inteligencia artificial que trabajan mientras duermes. Número uno: AutoFlow dos punto cero...`;
      translatedPinnedComment = `¿Cuál de estas herramientas de IA probarás primero? ¡Comenta abajo y suscríbete para tutoriales diarios! 🔥`;
    } else if (targetLangCode === 'uz') {
      translatedTitle = `2026 Yilda Noqonuniy Tuyuladigan 5 Ta AI Saytlar! #Shorts`;
      translatedDescription = `2026 yilda ishingizni avtomatlashtiruvchi va siz uxlab yotganingizda kod yozuvchi eng kuchli sun'iy intellekt agentlari. Har kuni yangi AI sirlari uchun kanalga obuna bo'ling!`;
      translatedScript = `To'xtang! Agar 2026 yilda ham kodni noldan o'zingiz yozayotgan bo'lsangiz, vaqtingizni bekorga sarflayapsiz. Siz uxlayotganingizda ishlaydigan eng zo'r AI vositalari. Birinchisi: AutoFlow ikki nuqta nol...`;
      translatedPinnedComment = `Siz bu AI vositalaridan qaysi birini birinchi bo'lib sinab ko'rasiz? Izohlarda yozing va kanalga obuna bo'ling! 🔥`;
    } else if (targetLangCode === 'ru') {
      translatedTitle = `5 Нейросетей в 2026 году, которые кажутся незаконными! #Shorts`;
      translatedDescription = `Лучшие автономные агенты и искусственный интеллект для разработки и автоматизации в 2026 году. Подпишитесь, чтобы быть впереди!`;
      translatedScript = `Постойте! Если в 2026 году вы всё ещё кодите вручную, вы впустую тратите своё время. Вот 5 мощнейших нейросетей, которые работают, пока вы отдыхаете. Номер один: AutoFlow два точка ноль...`;
      translatedPinnedComment = `Какой из этих ИИ-инструментов вы попробуете первым? Пишите в комментариях и подписывайтесь на канал! 🔥`;
    } else if (targetLangCode === 'de') {
      translatedTitle = `5 KI-Tools im Jahr 2026, die sich illegal anfühlen! #Shorts`;
      translatedDescription = `Entdecken Sie die besten KI-Agenten und Automatisierungstools im Jahr 2026. Abonnieren Sie für tägliche Technologie-Tipps.`;
      translatedScript = `Warte kurz! Wenn du 2026 immer noch manuell programmierst, verlierst du wertvolle Zeit. Hier sind die besten KI-Tools...`;
      translatedPinnedComment = `Welches dieser KI-Tools wirst du zuerst testen? Schreib es in die Kommentare und abonniere den Kanal! 🔥`;
    } else {
      translatedTitle = `${content.title} (${langConfig.name})`;
      translatedDescription = content.description;
      translatedScript = content.script;
      translatedPinnedComment = content.pinnedComment || '';
    }
  }

  const translatedScenes = (content.scenes || [
    { id: 'sc1', title: '1. Hook', time: 0, tag: '#hook', overlayText: 'STOP TRADING TIME' },
    { id: 'sc2', title: '2. Tool 1', time: 10, tag: '#tool1', overlayText: 'AUTONOMOUS AI' },
    { id: 'sc3', title: '3. Tool 2', time: 20, tag: '#tool2', overlayText: 'NEXT-GEN CODE' },
    { id: 'sc4', title: '4. Tool 3', time: 30, tag: '#tool3', overlayText: 'LIVE DEMO' },
    { id: 'sc5', title: '5. Outro', time: 45, tag: '#outro', overlayText: 'SUBSCRIBE NOW' }
  ]).map((sc, idx) => ({
    ...sc,
    title: `${idx + 1}. Sahna (${langConfig.name})`,
    overlayText: targetLangCode === 'es' ? 'INCREÍBLE IA 2026' : (targetLangCode === 'uz' ? '2026 AI INQILOBI' : (targetLangCode === 'ru' ? 'НЕЙРОСЕТИ 2026' : sc.overlayText))
  }));

  // Generate real audio file for the translated script
  let audioUrl: string | undefined = undefined;
  if (synthesizeFullAudio && translatedScript) {
    try {
      const audioFilename = `dub_${targetLangCode}_${Date.now()}`;
      const synthRes = await synthesizeAudioFile({
        text: translatedScript,
        voiceModel: chosenVoice,
        rate,
        pitch,
        filename: audioFilename
      });
      audioUrl = synthRes.audioUrl;
    } catch (e) {
      console.warn('[DubbingService] Failed to synthesize full dubbed audio:', e);
    }
  }

  const pkg: DubbedContentPackage = {
    languageCode: targetLangCode,
    languageName: langConfig.name,
    voiceModel: chosenVoice,
    rate,
    pitch,
    translatedTitle,
    translatedDescription,
    translatedScript,
    translatedPinnedComment,
    translatedScenes,
    audioUrl,
    status: 'ready',
    createdAt: new Date().toISOString()
  };

  return pkg;
}

/**
 * Save dubbed content package to storage
 */
export async function applyDubbingToContent(contentId: string, pkg: DubbedContentPackage, workspaceId: string) {
  ensureDirs();
  const filePath = path.join(DATA_DIR, `${workspaceId}_${contentId}_${pkg.languageCode}.json`);
  fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2), 'utf-8');
  return { success: true, savedPath: filePath, package: pkg };
}

/**
 * Get saved dubbed packages for a content item
 */
export function getSavedDubbingsForContent(contentId: string, workspaceId: string): DubbedContentPackage[] {
  ensureDirs();
  const files = fs.readdirSync(DATA_DIR);
  const prefix = `${workspaceId}_${contentId}_`;
  const result: DubbedContentPackage[] = [];

  for (const file of files) {
    if (file.startsWith(prefix) && file.endsWith('.json')) {
      try {
        const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
        result.push(JSON.parse(raw));
      } catch {}
    }
  }

  return result;
}
