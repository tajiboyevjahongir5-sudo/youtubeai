export interface NarrativeAct {
  actNumber: number;
  name: string;
  timeRange: string;
  dramaticGoal: string;
  pacingDirectives: string[];
  visualPatternInterrupt: string;
  expectedRetention: string;
}

export interface LongformNarrativeArc {
  contentId: string;
  title: string;
  totalActs: number;
  acts: NarrativeAct[];
  retentionFormulaDescription: string;
  pacingIntervalSec: number;
}

export class LongformNarrativeEngineService {
  static getNarrativeArc(contentId: string, title?: string): LongformNarrativeArc {
    const cleanTitle = title || "Autonomous AI Architecture in 2026";

    return {
      contentId,
      title: cleanTitle,
      totalActs: 4,
      pacingIntervalSec: 50,
      retentionFormulaDescription: "Gollivud 4-Aktli dramaturgiya: har 50 soniyada yangi vizual qatlam va hissiy burilish kiritish orqali 12 daqiqa davomida APV 70%+ darajasida ushlab turiladi.",
      acts: [
        {
          actNumber: 1,
          name: "Act 1: Massive Stakes & The Catalyst (00:00 - 01:45)",
          timeRange: "00:00 - 01:45",
          dramaticGoal: "Nima uchun ushbu muammoni hal qilmaslik tomoshabinning karyerasi yoki kompaniyasi uchun xavfli ekanligini ko'rsatish.",
          pacingDirectives: [
            "00:15 - Deep sub-bass drop va 3D server xonasi B-rolli",
            "00:45 - Alex: 'Everything we learned in computer science is shifting right now'",
            "01:20 - Ekrandagi so'rov va qiyinchilik statistikasi"
          ],
          visualPatternInterrupt: "Kiber-neon shkalasi va qizil ogohlantirish grafikalari",
          expectedRetention: "92% (Kirish qismi)"
        },
        {
          actNumber: 2,
          name: "Act 2: The Core Architecture & Hands-on Demo (01:45 - 05:30)",
          timeRange: "01:45 - 05:30",
          dramaticGoal: "Amaliy yechimni bosqichma-bosqich ko'rsatish: terminal kodlash, avtonom agentlar va ish oqimi.",
          pacingDirectives: [
            "02:30 - Jonli terminal kodi (VS Code / Cursor ekran yozuvi)",
            "03:40 - 2.5D arxitektura diagrammasi (Swarm Agents sxemasi)",
            "04:50 - Tezkor natija va sinovdan o'tgan mikroxizmat"
          ],
          visualPatternInterrupt: "Katta kod bloklari, rangli sintaksis va terminal yashil shrifti",
          expectedRetention: "81% (Amaliy qism)"
        },
        {
          actNumber: 3,
          name: "Act 3: The Critical Bottleneck & Breakthrough (05:30 - 09:00)",
          timeRange: "05:30 - 09:00",
          dramaticGoal: "Ko'pchilik qoqiladigan kutilmagan to'siq (bottleneck) va uni bartaraf etuvchi master-usul.",
          pacingDirectives: [
            "06:15 - Kutilmagan tokenlar cheklovi va xotira yo'qolishi xatosi",
            "07:30 - Self-Healing Loop va neyron xotira arxitekturasi joriy etilishi",
            "08:45 - Benchmark tezligi: 10x arzonroq va 0 kechikish"
          ],
          visualPatternInterrupt: "Qizil xato loglari va yashil muvaffaqiyat tasdiqlovchi grafiklar",
          expectedRetention: "76% (Kulminatsiya)"
        },
        {
          actNumber: 4,
          name: "Act 4: Production Scaling & Open Blueprint Outro (09:00 - 12:00)",
          timeRange: "09:00 - 12:00",
          dramaticGoal: "Yakuniy xulosa, GitHub ochiq manbali kodlar va tomoshabinni keyingi videoga yo'naltiruvchi End Screen.",
          pacingDirectives: [
            "09:45 - 100K foydalanuvchiga mo'ljallangan bulutli klaster ko'rinishi",
            "10:50 - Pinned comment va tavsifdagi GitHub repository havola chaqirig'i",
            "11:40 - 20s YouTube End Screen: Alex o'ng tomondagi keyingi epizodga ishora qiladi"
          ],
          visualPatternInterrupt: "Oltin ramka, YouTube obuna nishoni va keyingi masterclass preview kartasi",
          expectedRetention: "71% (Binge Outro)"
        }
      ]
    };
  }
}
