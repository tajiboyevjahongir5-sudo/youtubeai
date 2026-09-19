/**
 * AI Script Editor Suggestions Service
 * Provides real-time writing suggestions using Gemini Flash
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../env';

export interface ScriptSuggestion {
  id: string;
  type: 'retention_risk' | 'power_word' | 'simplify' | 'hook_boost' | 'pacing' | 'cta';
  severity: 'info' | 'warning' | 'critical';
  lineRange: string;
  originalText: string;
  suggestion: string;
  reason: string;
}

export interface ScriptAnalysisResult {
  suggestions: ScriptSuggestion[];
  overallScore: number;
  retentionRisk: 'low' | 'medium' | 'high';
  estimatedWatchTime: string;
  wordCount: number;
  estimatedDuration: string;
}

export async function analyzeScript(
  script: string,
  title: string,
  format: 'shorts' | 'long_form' = 'shorts'
): Promise<ScriptAnalysisResult> {
  const words = script.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  // ~150 words per minute for energetic delivery
  const estMinutes = wordCount / 150;
  const estSeconds = Math.round(estMinutes * 60);
  const estimatedDuration = estSeconds >= 60
    ? `${Math.floor(estSeconds / 60)}:${String(estSeconds % 60).padStart(2, '0')}`
    : `0:${String(estSeconds).padStart(2, '0')}`;

  const suggestions: ScriptSuggestion[] = [];
  let idCounter = 0;

  // Rule-based analysis (always works, no API needed)

  // 1. Check for long sentences (retention risk)
  const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 10);
  sentences.forEach((sent, idx) => {
    const sentWords = sent.trim().split(/\s+/).length;
    if (sentWords > 25) {
      suggestions.push({
        id: `sug_${++idCounter}`,
        type: 'simplify',
        severity: 'warning',
        lineRange: `Jumla ${idx + 1}`,
        originalText: sent.trim().slice(0, 60) + '...',
        suggestion: `Bu jumlani 2-3 ta qisqa jumlaga bo'ling (hozir ${sentWords} so'z, tavsiya: max 15)`,
        reason: '25+ so\'zli jumlalar tomoshabinlarning 18% ko\'proq tark etishiga sabab bo\'ladi'
      });
    }
  });

  // 2. Check first 20 words for hook
  const first20 = words.slice(0, 20).join(' ').toLowerCase();
  const hookWords = ['stop', 'warning', 'urgent', 'secret', 'illegal', 'never', 'mistake', 'what if', 'imagine', 'did you know'];
  const hasHook = hookWords.some(hw => first20.includes(hw));
  if (!hasHook && format === 'shorts') {
    suggestions.push({
      id: `sug_${++idCounter}`,
      type: 'hook_boost',
      severity: 'critical',
      lineRange: 'Dastlabki 3 soniya',
      originalText: words.slice(0, 12).join(' '),
      suggestion: 'Birinchi jumlada "Stop", "Warning", "What if", yoki "Secret" kabi Pattern Interrupt so\'z ishlating',
      reason: 'Dastlabki 3 soniyada kuchli hook bo\'lmasa, tomoshabinlarning 60% darhol chiqib ketadi'
    });
  }

  // 3. Power words density
  const powerWords = ['revolutionary', 'breakthrough', 'insane', 'game-changing', 'mind-blowing', 'zero', 'unlimited', 'impossible', 'fastest', 'deadliest'];
  const scriptLower = script.toLowerCase();
  const powerCount = powerWords.filter(pw => scriptLower.includes(pw)).length;
  if (powerCount < 2 && wordCount > 50) {
    suggestions.push({
      id: `sug_${++idCounter}`,
      type: 'power_word',
      severity: 'info',
      lineRange: 'Butun skript',
      originalText: `Topilgan power words: ${powerCount}`,
      suggestion: `"revolutionary", "game-changing", "breakthrough" kabi 3-5 ta power word qo'shing`,
      reason: 'Power words ishlatish CTR ni o\'rtacha 22% ga oshiradi'
    });
  }

  // 4. CTA check
  const hasCta = scriptLower.includes('subscribe') || scriptLower.includes('comment') || scriptLower.includes('follow');
  if (!hasCta) {
    suggestions.push({
      id: `sug_${++idCounter}`,
      type: 'cta',
      severity: 'warning',
      lineRange: 'Yakuniy qism',
      originalText: 'CTA topilmadi',
      suggestion: 'Skript oxirida "Comment below which tool you\'ll try first!" kabi CTA qo\'shing',
      reason: 'CTA bo\'lmagan videolarda izoh va obuna ko\'rsatkichi 40% past bo\'ladi'
    });
  }

  // 5. Pacing - check for scene transitions
  const sceneMarkers = (script.match(/\[.*?\]/g) || []).length;
  if (format === 'shorts' && sceneMarkers < 3 && wordCount > 80) {
    suggestions.push({
      id: `sug_${++idCounter}`,
      type: 'pacing',
      severity: 'info',
      lineRange: 'Butun skript',
      originalText: `Sahna belgilari: ${sceneMarkers}`,
      suggestion: 'Har 6-9 soniyada [SAHNA] yoki [CUT] belgilari qo\'shing — vizual ritmni saqlang',
      reason: '6-9 soniyalik kadr almashish YouTube Shorts algoritmida eng yuqori retention beradi'
    });
  }

  // 6. Duration check for shorts
  if (format === 'shorts' && estSeconds > 62) {
    suggestions.push({
      id: `sug_${++idCounter}`,
      type: 'retention_risk',
      severity: 'critical',
      lineRange: 'Butun skript',
      originalText: `Taxminiy davomiylik: ${estimatedDuration} (${wordCount} so'z)`,
      suggestion: `Shorts uchun 55-60 soniya optimal. Skriptni ${wordCount - Math.round(55 * 2.5)} so'z qisqartiring`,
      reason: '60 soniyadan uzun Shorts videolar algoritmda 35% kam tavsiya etiladi'
    });
  }

  // Try Gemini for advanced suggestions
  if (env.GEMINI_API_KEY && suggestions.length < 5) {
    try {
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `Analyze this YouTube ${format === 'shorts' ? 'Shorts' : 'long-form'} script for retention optimization. Title: "${title}". Script (first 500 chars): "${script.slice(0, 500)}". Return 1-2 specific, actionable suggestions in JSON array format: [{"suggestion":"...","reason":"...","type":"retention_risk|hook_boost|simplify"}]. Only JSON, no markdown.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const aiSugs = JSON.parse(jsonMatch[0]);
        aiSugs.forEach((s: any) => {
          suggestions.push({
            id: `sug_${++idCounter}`,
            type: s.type || 'retention_risk',
            severity: 'info',
            lineRange: 'AI Tavsiya',
            originalText: '',
            suggestion: s.suggestion,
            reason: s.reason
          });
        });
      }
    } catch (e) {
      // Gemini not available, algorithmic suggestions are sufficient
    }
  }

  const overallScore = Math.max(40, 100 - suggestions.filter(s => s.severity === 'critical').length * 15 - suggestions.filter(s => s.severity === 'warning').length * 8 - suggestions.filter(s => s.severity === 'info').length * 3);
  const retentionRisk: 'low' | 'medium' | 'high' = overallScore >= 80 ? 'low' : overallScore >= 60 ? 'medium' : 'high';

  return {
    suggestions,
    overallScore,
    retentionRisk,
    estimatedWatchTime: estimatedDuration,
    wordCount,
    estimatedDuration,
  };
}
