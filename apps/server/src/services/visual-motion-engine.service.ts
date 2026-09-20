export interface MotionDirective {
  timestampSec: number;
  effect: 'ken_burns_zoom' | 'parallax_layer_shift' | 'impact_shake' | 'flash_whip_pan';
  intensity: 'subtle' | 'medium' | 'high';
  targetLayer: 'b_roll_background' | 'host_alex_midground' | 'hud_typography_foreground';
  description: string;
}

export interface VisualMotionPreset {
  id: string;
  name: string;
  pacingIntervalSec: number;
  description: string;
  retentionLift: string;
  directives: MotionDirective[];
}

export class VisualMotionEngineService {
  static getMotionPresets(): VisualMotionPreset[] {
    return [
      {
        id: 'viral_hyper_pacing',
        name: '🔥 Viral Hyper-Pacing (1.8s Ken Burns & Parallaks)',
        pacingIntervalSec: 1.8,
        description: 'Har 1.8 soniyada kamera zumi va yengil silkinish orqali tomoshabin e\'tiborini 100% ushlab turuvchi gipnoz harakati',
        retentionLift: '+38% APV',
        directives: [
          {
            timestampSec: 0.15,
            effect: 'impact_shake',
            intensity: 'high',
            targetLayer: 'b_roll_background',
            description: "Sub-drop zarbasi bilan bir vaqtda 3-pikselli mikroskopik kamera silkinishi (Zarba hissi)"
          },
          {
            timestampSec: 1.8,
            effect: 'ken_burns_zoom',
            intensity: 'medium',
            targetLayer: 'b_roll_background',
            description: "Orqa fondagi kiber-tarmoqqa sekin 1.05x dan 1.18x gacha yaqinlashish"
          },
          {
            timestampSec: 3.6,
            effect: 'parallax_layer_shift',
            intensity: 'subtle',
            targetLayer: 'hud_typography_foreground',
            description: "Subtitr va fon orasida 2.5D chuqurlik effekti (3D qatlamlar surilishi)"
          },
          {
            timestampSec: 5.4,
            effect: 'flash_whip_pan',
            intensity: 'medium',
            targetLayer: 'b_roll_background',
            description: "Tezkor oq rangli 0.12s chaqmoq va keyingi B-roll kadriga o'tish"
          }
        ]
      },
      {
        id: 'cinematic_documentary_flow',
        name: '🎬 Cinematic Documentary Flow (3.2s Silliq Ken Burns)',
        pacingIntervalSec: 3.2,
        description: '16:9 Katta formatli filmlar uchun chuqur, xotirjam va jiddiy kino effekti',
        retentionLift: '+25% APV',
        directives: [
          {
            timestampSec: 0.5,
            effect: 'ken_burns_zoom',
            intensity: 'subtle',
            targetLayer: 'b_roll_background',
            description: "Keng burchakli sekin gorizontal harakat (Smooth Pan)"
          },
          {
            timestampSec: 3.2,
            effect: 'parallax_layer_shift',
            intensity: 'subtle',
            targetLayer: 'host_alex_midground',
            description: "Boshlovchi va fon o'rtasida 4K optik linza effekti"
          }
        ]
      }
    ];
  }
}
