export const enToBn = (num: number | string) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, match => bnDigits[parseInt(match)]);
};

export const getBnGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'শুভ সকাল';
  if (hour >= 12 && hour < 16) return 'শুভ দুপুর';
  if (hour >= 16 && hour < 18) return 'শুভ বিকেল';
  if (hour >= 18 && hour < 20) return 'শুভ সন্ধ্যা';
  return 'শুভ রাত্রি';
};

export const getBnDate = () => {
  const date = new Date();
  const day = enToBn(date.getDate());
  const year = enToBn(date.getFullYear());
  const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  
  return `${day} ${months[date.getMonth()]} ${year} ${days[date.getDay()]}`;
};

/**
 * Calculates recovery trade stake:
 * Recovers previous cumulative loss plus a small net profit,
 * exactly matching user requirements:
 * e.g. Base 10 -> Loss 10 -> Step 2: 13 (covers 10 + profit 1)
 * -> Loss 23 -> Step 3: 30 (covers 23 + profit 2.5)
 * -> Loss 53 -> Step 4: 66 (covers 53 + profit 3.1)
 * -> Step 5: Remaining budget (e.g. 81 out of 200)
 */
export function calculateTargetRecoveryStake({
  cumulativeLoss,
  baseStake,
  payout,
  consecutiveLosses,
  allocatedBudget,
  strategyMode = 'smart_recovery'
}: {
  cumulativeLoss: number;
  baseStake: number;
  payout: number;
  consecutiveLosses: number;
  allocatedBudget: number;
  strategyMode?: 'smart_recovery' | 'fixed' | 'compound';
}): number {
  const payoutRate = (payout || 85) / 100;
  const safeBase = Math.max(1, baseStake || 1);

  if (consecutiveLosses <= 0 || cumulativeLoss <= 0) {
    return safeBase;
  }

  if (strategyMode === 'fixed') {
    return safeBase;
  }

  // Small net profit margin above cumulative loss:
  // Step 2 (loss count 1): profit 1
  // Step 3 (loss count 2): profit 2
  // Step 4 (loss count 3): profit 3
  const targetNetProfit = Math.max(1, Math.round(consecutiveLosses * 1.0));
  const rawStake = (cumulativeLoss + targetNetProfit) / payoutRate;
  
  // If baseStake is whole number, round cleanly to whole number (13, 30, 66)
  const isWhole = Number.isInteger(safeBase);
  let cleanStake = isWhole ? Math.ceil(rawStake) : Number(rawStake.toFixed(2));

  // Cap at remaining allocated budget
  const remainingBudget = Math.max(0, allocatedBudget - cumulativeLoss);
  if (remainingBudget > 0 && cleanStake > remainingBudget) {
    cleanStake = isWhole ? Math.floor(remainingBudget) : Number(remainingBudget.toFixed(2));
    if (cleanStake < 1 && remainingBudget >= 1) cleanStake = 1;
  }

  return Math.max(1, cleanStake);
}

