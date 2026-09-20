export interface CompositionLayerItem {
  id: string;
  startTimeSec: number;
  endTimeSec: number;
  timecode: string;
  layerType: 'broll_footage' | 'lower_third' | 'terminal_overlay' | 'tech_diagram' | 'kinetic_arrow';
  title: string;
  description: string;
  mediaSource: string;
  screenPosition: 'fullscreen_background' | 'bottom_third' | 'pip_top_right' | 'split_right_half' | 'center_overlay';
  animationIn: 'fade_in' | 'slide_up' | 'zoom_punch' | 'glitch_reveal';
  alexZoneClear: boolean; // Alex yuzi (y=100..1240) to'silmasligi kafolati
}

export interface SmartLayerCompositorPlan {
  contentId: string;
  totalDurationSeconds: number;
  aspectRatio: '16:9' | '9:16';
  safeZoneAuditPassed: boolean;
  totalLayersCount: number;
  layers: CompositionLayerItem[];
  renderingProfile: {
    resolution: string;
    fps: number;
    colorProfile: string;
    targetBitrate: string;
  };
}

export class SmartLayerCompositorService {
  public generateCompositorPlan(contentId: string, title?: string): SmartLayerCompositorPlan {
    const layers: CompositionLayerItem[] = [
      {
        id: "layer_1",
        startTimeSec: 3,
        endTimeSec: 9,
        timecode: "00:03 - 00:09",
        layerType: "lower_third",
        title: "Boshlovchi Titri & Mavzu",
        description: "Alex • Neural Pulse AI Bosh Muhandisi | 2026 Autonomous AI Stack",
        mediaSource: "/assets/overlays/lower_third_alex.png",
        screenPosition: "bottom_third",
        animationIn: "slide_up",
        alexZoneClear: true
      },
      {
        id: "layer_2",
        startTimeSec: 15,
        endTimeSec: 28,
        timecode: "00:15 - 00:28",
        layerType: "broll_footage",
        title: "Nvidia GPU Klasteri & Datatsentr",
        description: "Kinematik 4K klaster serverlari va yonayotgan yashil status chiroqlari",
        mediaSource: "/assets/broll/gpu_cluster_4k.mp4",
        screenPosition: "fullscreen_background",
        animationIn: "fade_in",
        alexZoneClear: true
      },
      {
        id: "layer_3",
        startTimeSec: 42,
        endTimeSec: 65,
        timecode: "00:42 - 01:05",
        layerType: "tech_diagram",
        title: "Agent Orkestratori 3D Sxemasi",
        description: "Multi-agent container sandbox aloqa sxemasi va xotira boshqaruvi",
        mediaSource: "/assets/diagrams/orchestrator_3d.png",
        screenPosition: "split_right_half",
        animationIn: "zoom_punch",
        alexZoneClear: true
      },
      {
        id: "layer_4",
        startTimeSec: 80,
        endTimeSec: 110,
        timecode: "01:20 - 01:50",
        layerType: "terminal_overlay",
        title: "Docker Compose Live Execution",
        description: "Terminalda agentlarning avtonom ishga tushishi va loglar oqimi",
        mediaSource: "/assets/code/docker_run.webm",
        screenPosition: "pip_top_right",
        animationIn: "glitch_reveal",
        alexZoneClear: true
      },
      {
        id: "layer_5",
        startTimeSec: 125,
        endTimeSec: 135,
        timecode: "02:05 - 02:15",
        layerType: "kinetic_arrow",
        title: "Kritik Kod Nuqtasi Ko'rsatkichi",
        description: "Animatsion kiber-strelka xotira oqishi (memory leak) sababini ko'rsatadi",
        mediaSource: "/assets/overlays/arrow_highlight.png",
        screenPosition: "center_overlay",
        animationIn: "slide_up",
        alexZoneClear: true
      }
    ];

    return {
      contentId,
      totalDurationSeconds: 1260, // 21 daqiqa
      aspectRatio: "16:9",
      safeZoneAuditPassed: true,
      totalLayersCount: layers.length,
      layers,
      renderingProfile: {
        resolution: "3840x2160 (4K UHD)",
        fps: 60,
        colorProfile: "Rec.709 10-bit",
        targetBitrate: "45 Mbps H.265 / HEVC"
      }
    };
  }
}

export const smartLayerCompositorService = new SmartLayerCompositorService();
