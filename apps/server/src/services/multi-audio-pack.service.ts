export interface AudioTrackItem {
  languageCode: string;
  languageName: string;
  flag: string;
  voiceModel: string;
  voiceSpeaker: string;
  targetMarket: string;
  rpmPotential: string;
  audioUrl: string;
  isPrimary: boolean;
  status: 'ready' | 'processing';
}

export interface MultiAudioBundle {
  contentId: string;
  videoTitle: string;
  tracks: AudioTrackItem[];
  youtubeStudioInstructions: string;
}

export class MultiAudioPackService {
  static getMultiAudioBundle(contentId: string, videoTitle: string): MultiAudioBundle {
    const tracks: AudioTrackItem[] = [
      {
        languageCode: 'en-US',
        languageName: 'English (United States)',
        flag: '🇺🇸',
        voiceModel: 'en-US-ChristopherNeural',
        voiceSpeaker: 'Alex (Neural Pulse AI)',
        targetMarket: 'AQSh, Kanada, Avstraliya',
        rpmPotential: '$6.50 - $9.80 RPM',
        audioUrl: `/media/audio_preview_en.mp3`,
        isPrimary: true,
        status: 'ready'
      },
      {
        languageCode: 'de-DE',
        languageName: 'German (Deutsch - DACH)',
        flag: '🇩🇪',
        voiceModel: 'de-DE-ConradNeural',
        voiceSpeaker: 'Conrad (Tech Pro)',
        targetMarket: 'Germaniya, Avstriya, Shveytsariya',
        rpmPotential: '$8.50 - $14.20 RPM (Eng Yuqori)',
        audioUrl: `/media/audio_preview_de.mp3`,
        isPrimary: false,
        status: 'ready'
      },
      {
        languageCode: 'es-ES',
        languageName: 'Spanish (Español)',
        flag: '🇪🇸',
        voiceModel: 'es-ES-AlvaroNeural',
        voiceSpeaker: 'Alvaro (Global Tech)',
        targetMarket: 'AQSh Ispaniyzabonlari, Ispaniya, Meksika',
        rpmPotential: '$2.80 - $4.50 RPM',
        audioUrl: `/media/audio_preview_es.mp3`,
        isPrimary: false,
        status: 'ready'
      }
    ];

    return {
      contentId,
      videoTitle: videoTitle || "Neural Pulse AI",
      tracks,
      youtubeStudioInstructions: "YouTube Studio -> Kontent -> Video tafsilotlari -> 'Audio treklari' (Multi-Audio) bo'limiga kiring va qo'shimcha Nemischa/Ispancha audio fayllarini biriktiring. YouTube avtomatik ravishda tomoshabin tiliga qarab to'g'ri audioni yangratadi!"
    };
  }
}
