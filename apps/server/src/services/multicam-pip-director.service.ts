export type CameraAngle = 'full_host' | 'pip_corner' | 'split_screen' | 'fullscreen_diagram';

export interface SceneCameraDirective {
  sceneIndex: number;
  timecode: string;
  recommendedAngle: CameraAngle;
  angleLabel: string;
  rationale: string;
  alexHostPosition: {
    x: string;
    y: string;
    scale: string;
    shape: 'circular_pip' | 'fullscreen_centered' | 'left_split' | 'voiceover_only';
    borderStyle: string;
  };
  backgroundVisual: string;
}

export interface MultiCamDirectorPlan {
  contentId: string;
  totalScenes: number;
  varietyScore: number; // 0 - 100
  cameraTimeline: SceneCameraDirective[];
  directorGuidelines: {
    maxDurationPerAngleSeconds: number;
    eyeContactRestorationSeconds: number;
    safeZoneCompliance: boolean;
  };
}

export class MultiCamPipDirectorService {
  public generateDirectorPlan(contentId: string, sceneCount: number = 12): MultiCamDirectorPlan {
    const defaultTimeline: SceneCameraDirective[] = [
      {
        sceneIndex: 1,
        timecode: "00:00 - 01:00",
        recommendedAngle: "full_host",
        angleLabel: "Kamera 1: Alex Markazda (Yuqori Taranglik)",
        rationale: "Hook paytida tomoshabin bilan to'g'ridan-to'g'ri ko'z kontaktini o'rnatish va ishonch uyg'otish",
        alexHostPosition: {
          x: "50%",
          y: "48%",
          scale: "1.05x (Punch zoom)",
          shape: "fullscreen_centered",
          borderStyle: "none"
        },
        backgroundVisual: "Cyberpunk studiya foni va orqa plandagi qizil ogohlantirish server chiroqlari"
      },
      {
        sceneIndex: 2,
        timecode: "01:00 - 02:30",
        recommendedAngle: "split_screen",
        angleLabel: "Kamera 3: 50/50 Split Screen (Alex + Arxitektura)",
        rationale: "Muammo va echim o'rtasidagi tafovutni tushuntirish uchun chapda Alex, o'ngda tizim sxemasi",
        alexHostPosition: {
          x: "25%",
          y: "50%",
          scale: "0.95x",
          shape: "left_split",
          borderStyle: "border-r border-cyan-500/30 shadow-2xl"
        },
        backgroundVisual: "3D animatsiyalangan AI agentlar arxitekturasi va ma'lumotlar oqimi chizmasi"
      },
      {
        sceneIndex: 3,
        timecode: "02:30 - 04:00",
        recommendedAngle: "pip_corner",
        angleLabel: "Kamera 2: PIP Burchak (Kod Yozilishi)",
        rationale: "Asosiy e'tibor kodga qaratiladi, Alex esa pastki o'ng burchakdagi aylanada jonli sharhlab boradi",
        alexHostPosition: {
          x: "82%",
          y: "75%",
          scale: "0.24x",
          shape: "circular_pip",
          borderStyle: "border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)] rounded-full"
        },
        backgroundVisual: "To'liq ekranli VS Code muharriri va jonli sintaksis ranglari bilan yozilayotgan kod"
      },
      {
        sceneIndex: 4,
        timecode: "04:00 - 05:30",
        recommendedAngle: "fullscreen_diagram",
        angleLabel: "Kamera 4: To'liq Ekranli Terminal (Voiceover)",
        rationale: "Docker container build va loglar oqimida xalaqit bermaslik uchun Alex faqat ovozda gapiradi",
        alexHostPosition: {
          x: "0%",
          y: "0%",
          scale: "0x",
          shape: "voiceover_only",
          borderStyle: "none"
        },
        backgroundVisual: "Qora zamonaviy Linux terminali, 60fps tezlikdagi loglar oqimi va build muvaffaqiyati"
      },
      {
        sceneIndex: 5,
        timecode: "05:30 - 07:00",
        recommendedAngle: "pip_corner",
        angleLabel: "Kamera 2: PIP Burchak (Agent Testlash)",
        rationale: "Agent birinchi vazifani bajarayotganda Alexning qiziqish bilan kuzatishi",
        alexHostPosition: {
          x: "82%",
          y: "75%",
          scale: "0.24x",
          shape: "circular_pip",
          borderStyle: "border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] rounded-2xl"
        },
        backgroundVisual: "Veb brauzer avtomatizatsiyasi va agentning sahifadagi real harakatlari"
      },
      {
        sceneIndex: 6,
        timecode: "07:00 - 08:30",
        recommendedAngle: "full_host",
        angleLabel: "Kamera 1: Alex Markazda (Inqiroz & Xatolik)",
        rationale: "Crash yuz berganda dramatik taranglikni his qildirish uchun yana Alexga qaytish",
        alexHostPosition: {
          x: "50%",
          y: "48%",
          scale: "1.12x (Dramatik zoom)",
          shape: "fullscreen_centered",
          borderStyle: "none"
        },
        backgroundVisual: "Qizil glitsh effekti va orqa fonda ogohlantirish signallari miltillashi"
      },
      {
        sceneIndex: 7,
        timecode: "08:30 - 10:00",
        recommendedAngle: "split_screen",
        angleLabel: "Kamera 3: 50/50 Split (Self-Healing Loop)",
        rationale: "Self-healing qanday ishlashini o'ngda kodda ko'rsatib, chapda Alex tushuntirishi",
        alexHostPosition: {
          x: "25%",
          y: "50%",
          scale: "0.95x",
          shape: "left_split",
          borderStyle: "border-r border-purple-500/30 shadow-2xl"
        },
        backgroundVisual: "Avtomatik tuzatilayotgan diff fayl va yashil rangga kirayotgan test natijalari"
      },
      {
        sceneIndex: 8,
        timecode: "10:00 - 12:00",
        recommendedAngle: "full_host",
        angleLabel: "Kamera 1: Alex Markazda + End Screen Elementlari",
        rationale: "Xulosa qilish va YouTube End Screen elementlariga qo'l bilan ishora qilish",
        alexHostPosition: {
          x: "38%",
          y: "50%",
          scale: "1.0x",
          shape: "fullscreen_centered",
          borderStyle: "none"
        },
        backgroundVisual: "O'ng tomonda YouTube 'Eng mos video' va 'Obuna bo'lish' tugmalari"
      }
    ];

    return {
      contentId,
      totalScenes: defaultTimeline.length,
      varietyScore: 98,
      cameraTimeline: defaultTimeline,
      directorGuidelines: {
        maxDurationPerAngleSeconds: 90,
        eyeContactRestorationSeconds: 45,
        safeZoneCompliance: true
      }
    };
  }
}

export const multiCamPipDirectorService = new MultiCamPipDirectorService();
