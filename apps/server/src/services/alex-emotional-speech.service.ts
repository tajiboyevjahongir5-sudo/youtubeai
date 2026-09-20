export interface EmotionalVocalPreset {
  sceneType: 'hook' | 'technical_deepdive' | 'critical_tension' | 'inspirational_outro';
  label: string;
  voiceName: string;
  rate: string;
  pitch: string;
  volume: string;
  inflectionStyle: string;
  breathPauseSeconds: number;
  sampleText: string;
  ssmlPreview: string;
}

export interface AlexEmotionalSpeechProfile {
  contentId: string;
  hostName: string;
  baseVoiceModel: string;
  audioLoudnessLUFS: number; // e.g. -14 LUFS standard for YouTube
  truePeakDb: number; // e.g. -0.98 dB
  presets: EmotionalVocalPreset[];
  recommendedMix: {
    voiceGain: number; // 0.88
    sfxGain: number; // 0.45
    musicBedGain: number; // 0.11
    duckingRatio: string; // -8dB auto-ducking during speech
  };
}

export class AlexEmotionalSpeechService {
  public getEmotionalProfile(contentId: string): AlexEmotionalSpeechProfile {
    const presets: EmotionalVocalPreset[] = [
      {
        sceneType: "hook",
        label: "1. Kirish & Xavf (Urgent & High Energy)",
        voiceName: "en-US-ChristopherNeural",
        rate: "+16%",
        pitch: "+2Hz",
        volume: "+0%",
        inflectionStyle: "dramatic_urgent",
        breathPauseSeconds: 0.12,
        sampleText: "Most AI agents fail in production. Here is the exact architecture that fixes it.",
        ssmlPreview: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="en-US-ChristopherNeural"><prosody rate="+16%" pitch="+2Hz">Most AI agents fail in production. Here is the exact architecture that fixes it.</prosody></voice></speak>`
      },
      {
        sceneType: "technical_deepdive",
        label: "2. Kod & Arxitektura (Calm Authority & Focus)",
        voiceName: "en-US-ChristopherNeural",
        rate: "+9%",
        pitch: "-1Hz",
        volume: "-2%",
        inflectionStyle: "calm_expert",
        breathPauseSeconds: 0.25,
        sampleText: "Notice how the orchestrator manages state across isolated container sandboxes without memory leaks.",
        ssmlPreview: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="en-US-ChristopherNeural"><prosody rate="+9%" pitch="-1Hz">Notice how the orchestrator manages state across isolated container sandboxes without memory leaks.</prosody></voice></speak>`
      },
      {
        sceneType: "critical_tension",
        label: "3. Kritik Xato / Avto-Tuzatish (Shock & Tension)",
        voiceName: "en-US-ChristopherNeural",
        rate: "+18%",
        pitch: "+3Hz",
        volume: "+2%",
        inflectionStyle: "high_tension",
        breathPauseSeconds: 0.08,
        sampleText: "Warning! The token limit triggered a cascade failure. Watch the agent self-recover in real-time.",
        ssmlPreview: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="en-US-ChristopherNeural"><prosody rate="+18%" pitch="+3Hz">Warning! The token limit triggered a cascade failure. Watch the agent self-recover in real-time.</prosody></voice></speak>`
      },
      {
        sceneType: "inspirational_outro",
        label: "4. Xulosa & Obuna (Inspirational & Confident CTA)",
        voiceName: "en-US-ChristopherNeural",
        rate: "+12%",
        pitch: "+1Hz",
        volume: "+0%",
        inflectionStyle: "inspirational_warm",
        breathPauseSeconds: 0.20,
        sampleText: "Drop a comment below with your favorite AI stack, and hit subscribe for next-gen engineering breakdowns.",
        ssmlPreview: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="en-US-ChristopherNeural"><prosody rate="+12%" pitch="+1Hz">Drop a comment below with your favorite AI stack, and hit subscribe for next-gen engineering breakdowns.</prosody></voice></speak>`
      }
    ];

    return {
      contentId,
      hostName: "Alex (Neural Pulse AI Host)",
      baseVoiceModel: "Microsoft Azure en-US-ChristopherNeural",
      audioLoudnessLUFS: -14.0,
      truePeakDb: -0.98,
      presets,
      recommendedMix: {
        voiceGain: 0.88,
        sfxGain: 0.45,
        musicBedGain: 0.11,
        duckingRatio: "-8 dB auto-ducking during voice speech"
      }
    };
  }
}

export const alexEmotionalSpeechService = new AlexEmotionalSpeechService();
