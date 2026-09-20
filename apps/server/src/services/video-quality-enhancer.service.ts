export interface QualityProfile {
  id: string;
  name: string;
  resolution: string;
  frameRate: string;
  codec: string;
  crf: number;
  allocatedBitrate: string;
  youtubeBandwidthMultiplier: string;
  recommendedFor: string;
  ffmpegArgs: string;
}

export interface VideoQualityAnalysis {
  contentId: string;
  currentResolution: string;
  profiles: QualityProfile[];
  youtubeBitrateHackExplainer: string;
}

export class VideoQualityEnhancerService {
  static getQualityProfiles(isLong: boolean = false): VideoQualityAnalysis {
    const profiles: QualityProfile[] = [
      {
        id: '4k_av1_master',
        name: isLong ? '4K UHD 60FPS Master (16:9)' : '4K Vertical UHD 60FPS Master (9:16)',
        resolution: isLong ? '3840x2160' : '2160x3840',
        frameRate: '60 FPS',
        codec: 'AV1 (libsvtav1) / VP9',
        crf: 18,
        allocatedBitrate: '45 - 55 Mbps',
        youtubeBandwidthMultiplier: '3.2x Yuqori Oqim',
        recommendedFor: 'Maksimal kristall tiniqlik, iPhone 16 Pro va 4K OLED ekranlar',
        ffmpegArgs: '-c:v libsvtav1 -preset 4 -crf 18 -pix_fmt yuv420p10le -r 60'
      },
      {
        id: '2k_qhd_pro',
        name: isLong ? '2K QHD 60FPS Pro (16:9)' : '2K QHD 60FPS Pro (9:16)',
        resolution: isLong ? '2560x1440' : '1440x2560',
        frameRate: '60 FPS',
        codec: 'VP9 (libvpx-vp9)',
        crf: 20,
        allocatedBitrate: '25 - 32 Mbps',
        youtubeBandwidthMultiplier: '2.1x Yuqori Oqim',
        recommendedFor: 'Tezkor render va yuqori sifat balansi',
        ffmpegArgs: '-c:v libvpx-vp9 -b:v 0 -crf 20 -r 60'
      },
      {
        id: '1080p_fhd_standard',
        name: isLong ? 'Full HD 60FPS Standart (16:9)' : 'Full HD 60FPS Standart (9:16)',
        resolution: isLong ? '1920x1080' : '1080x1920',
        frameRate: '60 FPS',
        codec: 'H.264 (libx264)',
        crf: 22,
        allocatedBitrate: '14 - 18 Mbps',
        youtubeBandwidthMultiplier: '1.0x Standart',
        recommendedFor: 'Oddiy ijtimoiy tarmoqlar va tezkor eksport',
        ffmpegArgs: '-c:v libx264 -preset slow -crf 22 -r 60'
      }
    ];

    return {
      contentId: 'default',
      currentResolution: isLong ? '3840x2160' : '2160x3840',
      profiles,
      youtubeBitrateHackExplainer: "YouTube serverlari 1080p videolarga qattiq siqish algoritmini (kompressiya) qo'llaydi va past bitrate beradi. Agar Shorts video 4K (2160x3840) da chiqarilsa, YouTube avtomatik ravishda unga VP9/AV1 yuqori sifatli kodek va 3 barobar katta ma'lumotlar oqimini ajratadi! Natijada video smartfonlarda hatto qorong'u sahnalarda ham kristalldek tiniq ko'rinadi."
    };
  }
}
