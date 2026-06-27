import { useStore } from "../store/useStore";
import { enToBn } from "../utils";

export function HomeCard({ onStart }: { onStart: () => void }) {
  const { profile, balance, dailyTarget } = useStore();

  const honorific = profile.gender?.toLowerCase() === 'female' ? "আপু" : "ভাই";
  
  const today = new Date();
  const dayNameBn = new Intl.DateTimeFormat('bn-BD', { weekday: 'long' }).format(today);
  const monthNameBn = new Intl.DateTimeFormat('bn-BD', { month: 'long' }).format(today);
  const dayBn = enToBn(today.getDate());
  const yearBn = enToBn(today.getFullYear());
  const dateString = `আজ ${dayBn} ${monthNameBn} ${yearBn} ${dayNameBn}`;

  // Compounding math based on daily target
  const targetPct = dailyTarget.dailyPct / 100;
  
  // Actual starting balance of today
  const actualStartBalance = dailyTarget.dayStartBalance > 0 ? dailyTarget.dayStartBalance : profile.startingBalance;
  const todayTargetProfit = actualStartBalance * targetPct;
  const expectedTotalBalance = actualStartBalance * Math.pow(1 + targetPct, Math.max(1, dailyTarget.totalDays - dailyTarget.dayNum + 1));
  
  const daysLeft = Math.max(0, dailyTarget.totalDays - dailyTarget.dayNum);
  
  // Progress calculation
  const sessionProfit = balance - actualStartBalance;
  const progressPct = Math.max(0, Math.min(100, (sessionProfit / todayTargetProfit) * 100)) || 0;
  const remaining = Math.max(0, todayTargetProfit - sessionProfit);

  return (
    <div className="glass-panel rounded-[1.25rem] p-4 relative overflow-hidden w-full max-w-[340px] mx-auto">
        <div className="flex flex-col items-center mb-3">
            <span className="text-3xl mb-1 drop-shadow-md">🤝</span>
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-slate-50 tracking-wide">
                {profile.name}, {honorific} কি অবস্থা?
            </h2>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{dateString}</p>
        </div>

        <div className="inner-glass rounded-[1rem] p-3 mb-3 relative">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] text-slate-600 dark:text-slate-400">মেইন ব্যালেন্স:</span>
                <span className="text-[11px] font-black text-[#3b82f6]">${enToBn(balance.toFixed(2))}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] text-slate-600 dark:text-slate-400">আজকের টার্গেট:</span>
                <span className="text-[11px] font-black text-[#52d669]">${enToBn((todayTargetProfit).toFixed(2))}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] text-slate-600 dark:text-slate-400">লক্ষ্যের দিন:</span>
                <span className="text-[11px] font-bold text-[#52d669]">{enToBn(dailyTarget.dayNum)} তম দিন • আর {enToBn(daysLeft)} দিন বাকি</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-600 dark:text-slate-400">লক্ষ্য পূরণ হলে:</span>
                <span className="text-[11px] font-black text-[#52d669]">${enToBn(expectedTotalBalance.toFixed(2))}</span>
            </div>
        </div>

        <div className="inner-glass rounded-[1rem] p-3 relative mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] text-slate-800 dark:text-slate-300 font-bold">আজকের অগ্রগতি</span>
                <span className="text-[11px] font-black text-[#52d669]">{enToBn(progressPct.toFixed(0))}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-300 dark:bg-black/40 rounded-full h-1.5 mb-2 overflow-hidden shadow-inner">
                <div 
                    className="bg-[#52d669] h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${progressPct}%` }}
                ></div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-400 mb-3">
                <span>পূরণ হয়েছে: <span className="text-[#52d669]">${enToBn(Math.max(0, sessionProfit).toFixed(2))}</span></span>
                <span>বাকি: <span className="text-[#facc15]">${enToBn(remaining.toFixed(2))}</span></span>
            </div>

            {progressPct >= 100 ? (
                <p className="text-[10px] text-center text-[#52d669] font-medium leading-relaxed">
                    {honorific} আজকের টার্গেট তো সম্পূর্ণ করে ফেলেছেন, এখন একটু রেস্ট করেন না। অনেক সময় সামান্য লোভের কারণে পুরো ব্যালেন্স জিরো হয়ে যায় তাই বলছে আজকের মতো এখানেই থাক। আর যদি চান একটু ঘুরে আসতে পারেন।
                </p>
            ) : (
                <p className="text-[10px] text-center text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                    আপনি আজকের টার্গেটের {enToBn(progressPct.toFixed(0))}% পূরণ করে ফেলেছেন। ইনশাআল্লাহ্ আপনি পারবেন 💪
                </p>
            )}
        </div>

        <button onClick={onStart} className="w-full bg-[#52d669] shadow-[0_4px_12px_rgba(82,214,105,0.25)] hover:shadow-[0_6px_16px_rgba(82,214,105,0.35)] text-black font-black tracking-wide text-[13px] py-3 rounded-[1rem] transition-all duration-300 active:scale-[0.98] border border-black/10">
            {progressPct >= 100 ? 'আচ্ছা একটু ঘুরেই আসি' : 'চলুন শুরু করি'}
        </button>
    </div>
  );
}
