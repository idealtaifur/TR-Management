import { useStore } from "../store/useStore";

export function StatsGrid() {
  const { balance, dailyTarget, profile } = useStore();
  const startBal = dailyTarget.dayStartBalance || profile.startingBalance || 215;
  const dailyGoalAmount = startBal * (dailyTarget.dailyPct / 100);
  const earned = Math.max(0, Math.min(balance - startBal, dailyGoalAmount));
  const displayEarned = Math.max(0, balance - startBal);
  
  const isComplete = displayEarned >= dailyGoalAmount;
  const targetDisplay = isComplete ? displayEarned : dailyGoalAmount;
  const remainingDisplay = isComplete ? 0 : Math.max(0, dailyGoalAmount - displayEarned);
  const remainingPct = isComplete ? 0 : Math.min(100, Math.max(0, (remainingDisplay / dailyGoalAmount) * 100));
  const progressPct = Math.min(100, Math.max(0, (displayEarned / dailyGoalAmount) * 100));

  return (
    <div className="grid grid-cols-3 gap-2.5 relative z-10 w-full mt-0">
      {/* Target */}
      <div className="glass-panel rounded-[1.2rem] py-2 flex flex-col items-center justify-center relative min-h-[64px]">
        <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-gradient-to-br from-[#ff4d4d]/20 to-transparent flex items-center justify-center text-[#ff4d4d] border border-[#ff4d4d]/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        </div>
        <div className="text-slate-500 dark:text-white/60 text-[8px] font-black tracking-[0.1em] mb-0.5 ml-4 uppercase">Today Target</div>
        <div className="text-slate-800 dark:text-slate-50 text-[13px] font-bold mb-0 tracking-tight">${targetDisplay.toFixed(2)}</div>
        <div className="text-[#ff4d4d] text-[7.5px] font-bold flex items-center gap-1 mt-0.5">
          {dailyTarget.dailyPct}% Goal
        </div>
      </div>

      {/* Progress */}
      <div className="glass-panel rounded-[1.2rem] py-2 flex flex-col items-center justify-center relative min-h-[64px]">
        <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-gradient-to-br from-[#00e676]/20 to-transparent flex items-center justify-center text-[#00e676] border border-[#00e676]/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
        </div>
        <div className="text-slate-500 dark:text-white/60 text-[8px] font-black tracking-[0.1em] mb-0.5 ml-4 uppercase">Progress</div>
        {isComplete ? (
          <div className="text-[#00e676] text-[11px] font-black mb-0 tracking-tight uppercase">Complete</div>
        ) : (
          <div className="text-slate-800 dark:text-slate-50 text-[13px] font-bold mb-0 tracking-tight">${displayEarned.toFixed(2)}</div>
        )}
        <div className="text-[#00e676] text-[7.5px] font-bold flex items-center gap-1 mt-0.5">
          {isComplete ? 'Goal Met ✓' : `${progressPct.toFixed(0)}% Done`}
        </div>
      </div>

      {/* Remaining */}
      <div className="glass-panel rounded-[1.2rem] py-2 flex flex-col items-center justify-center relative min-h-[64px]">
        <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-gradient-to-br from-[#a855f7]/20 to-transparent flex items-center justify-center text-[#a855f7] border border-[#a855f7]/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.5-1 2-1.52.4.67.6 1.45.6 2.02V20h4v-1.5c0-4.6-2-8.5-5.6-13.5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/></svg>
        </div>
        <div className="text-slate-500 dark:text-white/60 text-[8px] font-black tracking-[0.1em] mb-0.5 ml-6 uppercase">Remaining</div>
        <div className="text-slate-800 dark:text-slate-50 text-[13px] font-bold mb-0 tracking-tight">${remainingDisplay.toFixed(2)}</div>
        <div className="text-[#a855f7] text-[7.5px] font-bold flex items-center gap-1 mt-0.5">
           {isComplete ? '0% to go' : `${remainingPct.toFixed(0)}% to go`}
        </div>
      </div>
    </div>
  );
}

