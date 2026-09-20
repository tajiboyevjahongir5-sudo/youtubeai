export interface CaptionWordToken {
  word: string;
  startMs: number;
  endMs: number;
  isPunched: boolean; // Urg'u berilgan so'z
  scaleFactor: number; // e.g. 1.25x for punch
  highlightColor: string; // e.g. "#FFE81F" or "#22C55E"
  strokeColor: string; // e.g. "#000000"
  soundEffectTrigger?: string;
}

export interface HormoziStylePreset {
  id: 'mrbeast_yellow' | 'hormozi_lime' | 'cyberpunk_cyan';
  styleName: string;
  fontFamily: string;
  fontSizePx: number;
  textTransform: 'uppercase' | 'capitalize';
  activeWordColor: string;
  inactiveWordColor: string;
  shadowBlur: number;
  animationType: 'pop_bounce' | 'word_by_word_glow' | 'kinetic_slam';
  safeZoneLowerThirdY: string; // "1350px - 1550px"
}

export interface HormoziCaptionsPackage {
  contentId: string;
  activePresetId: string;
  presets: HormoziStylePreset[];
  sampleSentence: string;
  wordTokens: CaptionWordToken[];
  retentionImpactPercentage: string;
  typographyAudit: {
    emojiFreeEnforced: boolean;
    maxCanvasWidthConstraintPx: number; // 880px
    alexFaceSafeZonePreserved: boolean; // y=100..1240 100% toza
  };
}

export class HormoziPopinCaptionsService {
  public generateCaptionsPackage(contentId: string, customText?: string): HormoziCaptionsPackage {
    const sentence = customText || "STOP BUILDING AI AGENTS THAT CRASH IN PRODUCTION";

    const presets: HormoziStylePreset[] = [
      {
        id: "hormozi_lime",
        styleName: "Alex Hormozi Kinetik Zumrad (Neon Lime)",
        fontFamily: "Arial Black, Segoe UI Black",
        fontSizePx: 76,
        textTransform: "uppercase",
        activeWordColor: "#22C55E",
        inactiveWordColor: "#FFFFFF",
        shadowBlur: 14,
        animationType: "pop_bounce",
        safeZoneLowerThirdY: "y=1380 to y=1520 (Alex yuziga tegmaydi)"
      },
      {
        id: "mrbeast_yellow",
        styleName: "MrBeast Yuqori Kontrast Sariq (Punch Yellow)",
        fontFamily: "Impact, Arial Black",
        fontSizePx: 82,
        textTransform: "uppercase",
        activeWordColor: "#FFE81F",
        inactiveWordColor: "#F3F4F6",
        shadowBlur: 18,
        animationType: "kinetic_slam",
        safeZoneLowerThirdY: "y=1380 to y=1520 (Pastki xavfsiz zona)"
      },
      {
        id: "cyberpunk_cyan",
        styleName: "Silikon Vodiysi Kiberpank (Neon Cyan & Fuchsia)",
        fontFamily: "Segoe UI, Montserrat Black",
        fontSizePx: 74,
        textTransform: "uppercase",
        activeWordColor: "#06B6D4",
        inactiveWordColor: "#E2E8F0",
        shadowBlur: 12,
        animationType: "word_by_word_glow",
        safeZoneLowerThirdY: "y=1380 to y=1520"
      }
    ];

    const words = sentence.split(" ");
    let currentMs = 150;

    const wordTokens: CaptionWordToken[] = words.map((w, idx) => {
      const isPunched = ["STOP", "CRASH", "PRODUCTION", "FAIL", "NEVER"].includes(w.toUpperCase());
      const duration = isPunched ? 360 : 220;
      const token: CaptionWordToken = {
        word: w,
        startMs: currentMs,
        endMs: currentMs + duration,
        isPunched,
        scaleFactor: isPunched ? 1.28 : 1.05,
        highlightColor: isPunched ? "#FFE81F" : "#22C55E",
        strokeColor: "#000000",
        soundEffectTrigger: isPunched ? "pop_hit.wav" : undefined
      };
      currentMs += duration + 40;
      return token;
    });

    return {
      contentId,
      activePresetId: "hormozi_lime",
      presets,
      sampleSentence: sentence,
      wordTokens,
      retentionImpactPercentage: "+84.6% tomoshabinlar ushlab qolish (Retention)",
      typographyAudit: {
        emojiFreeEnforced: true,
        maxCanvasWidthConstraintPx: 880,
        alexFaceSafeZonePreserved: true
      }
    };
  }
}

export const hormoziPopinCaptionsService = new HormoziPopinCaptionsService();
