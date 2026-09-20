import fs from 'fs';
import path from 'path';

export interface CountryRpmProfile {
  countryCode: string;
  countryName: string;
  flag: string;
  estimatedRpmMin: number;
  estimatedRpmMax: number;
  tier: 'Tier-1 High' | 'Tier-2 Mid' | 'Regional';
}

export const COUNTRY_RPM_PROFILES: CountryRpmProfile[] = [
  { countryCode: 'DE', countryName: 'Germaniya & DACH', flag: '🇩🇪', estimatedRpmMin: 5.50, estimatedRpmMax: 8.90, tier: 'Tier-1 High' },
  { countryCode: 'US', countryName: 'AQSh & Shimoliy Amerika', flag: '🇺🇸', estimatedRpmMin: 4.80, estimatedRpmMax: 7.20, tier: 'Tier-1 High' },
  { countryCode: 'UK', countryName: 'Buyuk Britaniya', flag: '🇬🇧', estimatedRpmMin: 4.20, estimatedRpmMax: 6.80, tier: 'Tier-1 High' },
  { countryCode: 'CA', countryName: 'Kanada', flag: '🇨🇦', estimatedRpmMin: 3.90, estimatedRpmMax: 6.40, tier: 'Tier-1 High' },
  { countryCode: 'UZ', countryName: "O'zbekiston & Markaziy Osiyo", flag: '🇺🇿', estimatedRpmMin: 0.40, estimatedRpmMax: 0.90, tier: 'Regional' }
];

export interface HighCpmKeyword {
  keyword: string;
  category: string;
  cpmMultiplier: string;
  advertiserCompetition: 'Ultra Yuqori' | 'Yuqori';
}

export const HIGH_CPM_KEYWORDS: HighCpmKeyword[] = [
  { keyword: 'Enterprise AI Architecture', category: 'Enterprise Tech', cpmMultiplier: '+180% CPM', advertiserCompetition: 'Ultra Yuqori' },
  { keyword: 'Cloud GPU Infrastructure', category: 'Cloud Computing', cpmMultiplier: '+165% CPM', advertiserCompetition: 'Ultra Yuqori' },
  { keyword: 'Autonomous SaaS Development', category: 'Software Dev', cpmMultiplier: '+140% CPM', advertiserCompetition: 'Yuqori' },
  { keyword: 'Cybersecurity Threat Detection', category: 'Security', cpmMultiplier: '+150% CPM', advertiserCompetition: 'Ultra Yuqori' },
  { keyword: 'Full-Stack Agentic Automation', category: 'AI Tools', cpmMultiplier: '+135% CPM', advertiserCompetition: 'Yuqori' }
];

/**
 * Calculates earnings forecast across different view milestones
 */
export function calculateEarningsForecast(params: {
  durationSec: number;
  format: 'shorts' | 'long_form';
  primaryCountry?: string;
}) {
  const isLong = params.format === 'long_form' || params.durationSec > 180;
  // Shorts RPM is typically $0.15 - $0.45 per 1,000 views, Long-form is $3.50 - $7.50
  const baseRpm = isLong ? 4.80 : 0.28;

  const milestones = [
    { views: 10000, label: '10K ko\'rish' },
    { views: 50000, label: '50K ko\'rish' },
    { views: 200000, label: '200K ko\'rish (Viral)' },
    { views: 1000000, label: '1M ko\'rish (Mega Viral)' }
  ].map(m => ({
    ...m,
    estimatedEarningsUsd: Number(((m.views / 1000) * baseRpm).toFixed(2)),
    affiliateEarningsUsd: Number((m.views * 0.0012 * 35).toFixed(2)) // projected 0.12% conversion to $35 affiliate tool
  }));

  return {
    format: params.format,
    baseRpmUsd: baseRpm,
    countryProfiles: COUNTRY_RPM_PROFILES,
    highCpmKeywords: HIGH_CPM_KEYWORDS,
    milestones,
    rpmBoostStrategy: isLong
      ? "16:9 katta formatda 8 daqiqadan oshiq videolarga 2 ta o'rta reklama (Mid-roll Ads) joylashtirish daromadni 2.2 barobarga oshiradi."
      : "Shorts formatida tomoshabinlarni qadalgan izoh (Pinned comment) orqali affiliate SaaS vositalariga yo'naltirish YouTube AdSense daromadidan 8 barobar ko'proq foyda keltiradi."
  };
}
