export interface EndScreenElement {
  id: string;
  type: 'video_best_for_viewer' | 'playlist' | 'subscribe_button' | 'external_link';
  title: string;
  position: { xPercent: number; yPercent: number; widthPercent: number; heightPercent: number };
  startSeconds: number; // e.g. 700 (t=11:40)
  endSeconds: number; // e.g. 720 (t=12:00)
  previewText: string;
}

export interface EndScreenPackage {
  contentId: string;
  durationSeconds: number;
  outroDurationSec: number; // default 20s
  elements: EndScreenElement[];
  verbalCueScript: string;
  hostGestureDirective: string;
  youtubeStudioCopySnippet: string;
}

export class EndScreenCardBuilderService {
  static getEndScreenPackage(contentId: string, durationSec: number = 720): EndScreenPackage {
    const startOutro = Math.max(0, durationSec - 20);

    const elements: EndScreenElement[] = [
      {
        id: 'elem_best_video',
        type: 'video_best_for_viewer',
        title: "Keyingi Tavsiya: Autonomous Coding Agents 2026",
        position: { xPercent: 62, yPercent: 18, widthPercent: 33, heightPercent: 35 },
        startSeconds: startOutro,
        endSeconds: durationSec,
        previewText: "Tomoshabin qiziqishiga eng mos video (YouTube AI Recommendation)"
      },
      {
        id: 'elem_playlist',
        type: 'playlist',
        title: "Pleylist: 2026 AI Developer Masterclasses",
        position: { xPercent: 62, yPercent: 58, widthPercent: 33, heightPercent: 35 },
        startSeconds: startOutro,
        endSeconds: durationSec,
        previewText: "Kanalning barcha katta masterclasslari to'plami (+85% Session Time)"
      },
      {
        id: 'elem_subscribe',
        type: 'subscribe_button',
        title: "Neural Pulse AI Obuna Qilishi",
        position: { xPercent: 18, yPercent: 42, widthPercent: 18, heightPercent: 28 },
        startSeconds: startOutro,
        endSeconds: durationSec,
        previewText: "Markaziy brend logotipi va 1-bosishda obuna bo'lish tugmasi"
      }
    ];

    return {
      contentId,
      durationSeconds: durationSec,
      outroDurationSec: 20,
      elements,
      verbalCueScript: "If you want to master the full multi-agent swarm architecture in production, tap the video linked right here on your screen. I'll see you in the next masterclass!",
      hostGestureDirective: "Host Alex so'nggi 20 soniyada o'ng qo'li bilan ekranning o'ng tomonidagi kartochkaga aniq ishora qiladi va tabassum bilan xayrlashadi.",
      youtubeStudioCopySnippet: `📺 Watch Next Episode: [Video Havolasi]\n📁 Full Masterclass Playlist: [Pleylist Havolasi]\n🔔 Subscribe to Neural Pulse AI: [Kanal Havolasi]`
    };
  }
}
