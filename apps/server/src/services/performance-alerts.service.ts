/**
 * Post-Publish Performance Alert System
 * Automated diagnostics at 2h, 12h, and 24h after publishing
 */

export interface PerformanceAlert {
  id: string;
  type: 'velocity' | 'ctr' | 'retention' | 'engagement' | 'milestone' | 'trend';
  severity: 'success' | 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  actionLabel?: string;
  actionType?: 'change_title' | 'change_thumbnail' | 'add_shorts' | 'pin_comment' | 'relaunch';
  timestamp: string;
}

export interface PerformanceReport {
  contentId: string;
  alerts: PerformanceAlert[];
  overallHealth: 'excellent' | 'good' | 'at_risk' | 'critical';
  checkpointLabel: string;
  nextCheckIn: string;
}

export function generatePerformanceAlerts(
  contentId: string,
  hoursSincePublished: number,
  currentViews: number,
  currentCtr: number,
  averageRetention: number,
  commentCount: number,
  likeCount: number,
  subscriberGain: number
): PerformanceReport {
  const alerts: PerformanceAlert[] = [];
  let idCounter = 0;
  const now = new Date().toISOString();

  // Determine checkpoint
  let checkpointLabel: string;
  let nextCheckIn: string;
  if (hoursSincePublished <= 3) {
    checkpointLabel = '2 Soatlik Tezkor Diagnostika';
    nextCheckIn = '10 soatdan keyin';
  } else if (hoursSincePublished <= 14) {
    checkpointLabel = '12 Soatlik O\'rta Muddatli Tahlil';
    nextCheckIn = '12 soatdan keyin';
  } else {
    checkpointLabel = '24 Soatlik To\'liq Natija Tahlili';
    nextCheckIn = 'Keyingi video nashrida';
  }

  // --- Velocity Alerts ---
  const expectedViews2h = 50;
  const expectedViews12h = 300;
  const expectedViews24h = 1000;
  
  if (hoursSincePublished <= 3) {
    if (currentViews >= expectedViews2h * 5) {
      alerts.push({
        id: `pa_${++idCounter}`, type: 'velocity', severity: 'success',
        title: '🚀 Viral Tezlik Aniqlandi!',
        message: `${currentViews} ko'rish 2 soat ichida — bu o'rtacha ko'rsatkichdan 5x yuqori! Video YouTube algoritmida "Explore" sahifasiga chiqish ehtimoli 85%.`,
        timestamp: now
      });
    } else if (currentViews < expectedViews2h) {
      alerts.push({
        id: `pa_${++idCounter}`, type: 'velocity', severity: 'warning',
        title: '⚠️ Boshlang\'ich Tezlik Past',
        message: `${currentViews} ko'rish 2 soat ichida (kutilgan: ${expectedViews2h}+). Sarlavhani yangilash yoki Viral Relaunch Engine'ni ishlatish tavsiya etiladi.`,
        actionLabel: 'Sarlavhani o\'zgartirish',
        actionType: 'change_title',
        timestamp: now
      });
    }
  } else if (hoursSincePublished <= 14) {
    if (currentViews >= expectedViews12h * 3) {
      alerts.push({
        id: `pa_${++idCounter}`, type: 'velocity', severity: 'success',
        title: '📈 Kuchli O\'sish Tendentsiyasi!',
        message: `${currentViews} ko'rish 12 soat ichida. Video organik o'sish fazasiga kirdi. Shu mavzuda yangi Shorts tayyorlash vaqti!`,
        actionLabel: 'Yangi Shorts yaratish',
        actionType: 'add_shorts',
        timestamp: now
      });
    } else if (currentViews < expectedViews12h) {
      alerts.push({
        id: `pa_${++idCounter}`, type: 'velocity', severity: 'critical',
        title: '🚨 Video Algoritmdan Qoldi',
        message: `${currentViews} ko'rish 12 soat ichida (kutilgan: ${expectedViews12h}+). Tezkor qayta tiriltirish paketi bilan sarlavha va muqovani yangilash kerak!`,
        actionLabel: 'Qayta Tiriltirish',
        actionType: 'relaunch',
        timestamp: now
      });
    }
  } else {
    if (currentViews >= expectedViews24h * 2) {
      alerts.push({
        id: `pa_${++idCounter}`, type: 'milestone', severity: 'success',
        title: '🎉 2,000+ Ko\'rish Milestoni!',
        message: `Video muvaffaqiyatli! ${currentViews} ko'rish 24 soat ichida. Bu kontent ustunini (content pillar) kuchaytirish va seriyaga aylantirish vaqti.`,
        timestamp: now
      });
    }
  }

  // --- CTR Alerts ---
  if (currentCtr < 4.0) {
    alerts.push({
      id: `pa_${++idCounter}`, type: 'ctr', severity: 'critical',
      title: '📉 CTR Juda Past — Muqovani O\'zgartiring!',
      message: `Joriy CTR: ${currentCtr}% (YouTube o'rtachasi: 4.5-6%). Sarlavha yoki thumbnail tomoshabinlarni qiziqtirmayapti.`,
      actionLabel: 'Thumbnailni yangilash',
      actionType: 'change_thumbnail',
      timestamp: now
    });
  } else if (currentCtr >= 8.0) {
    alerts.push({
      id: `pa_${++idCounter}`, type: 'ctr', severity: 'success',
      title: '🎯 Ajoyib CTR!',
      message: `CTR ${currentCtr}% — bu nishaning eng yuqori 10% ichida! Shu sarlavha formulasini keyingi videolarda ham qo'llang.`,
      timestamp: now
    });
  }

  // --- Retention Alerts ---
  if (averageRetention < 50) {
    alerts.push({
      id: `pa_${++idCounter}`, type: 'retention', severity: 'critical',
      title: '⏩ Tomoshabinlar Tez Tark Etmoqda',
      message: `O'rtacha saqlanish: ${averageRetention}% (kutilgan: 70%+). Skriptning o'rta qismida vizual qiziqishni oshirish kerak.`,
      timestamp: now
    });
  } else if (averageRetention >= 80) {
    alerts.push({
      id: `pa_${++idCounter}`, type: 'retention', severity: 'success',
      title: '🔄 Ajoyib Retention — Loop Potensiali!',
      message: `${averageRetention}% tomoshabinlar oxirigacha ko'rgan! Bu Seamless Loop qo'shish uchun ideal natija (APV 105%+ ga chiqishi mumkin).`,
      timestamp: now
    });
  }

  // --- Engagement Alerts ---
  const engagementRate = currentViews > 0 ? ((commentCount + likeCount) / currentViews) * 100 : 0;
  if (commentCount < 3 && hoursSincePublished > 6) {
    alerts.push({
      id: `pa_${++idCounter}`, type: 'engagement', severity: 'warning',
      title: '💬 Izohlar Kam — Qadalgan Izohni Yangilang',
      message: `Faqat ${commentCount} ta izoh. Munozara boshlash uchun provokatsion savol bilan yangi qadalgan izoh yozing.`,
      actionLabel: 'Qadalgan izohni yangilash',
      actionType: 'pin_comment',
      timestamp: now
    });
  }

  if (subscriberGain > 5) {
    alerts.push({
      id: `pa_${++idCounter}`, type: 'milestone', severity: 'success',
      title: `🔔 +${subscriberGain} Yangi Obunachi!`,
      message: `Bu video orqali ${subscriberGain} ta yangi obunachi qo'shildi. Kanalingiz organik o'sish yo'lida!`,
      timestamp: now
    });
  }

  // --- Overall health ---
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const successCount = alerts.filter(a => a.severity === 'success').length;

  let overallHealth: PerformanceReport['overallHealth'];
  if (criticalCount >= 2) overallHealth = 'critical';
  else if (criticalCount >= 1 || warningCount >= 2) overallHealth = 'at_risk';
  else if (successCount >= 2) overallHealth = 'excellent';
  else overallHealth = 'good';

  return {
    contentId,
    alerts,
    overallHealth,
    checkpointLabel,
    nextCheckIn,
  };
}
