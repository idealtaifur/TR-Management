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

