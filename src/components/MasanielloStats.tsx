import { useStore } from "../store/useStore";

export function MasanielloStats() {
  const { balance, masaniello } = useStore();
  const progressPct = Math.min(100, (masaniello.currentWins / masaniello.winsNeeded) * 100) || 0;
  const sessionProfit = balance - (masaniello.sessionStartBalance || balance);
  const eventsLeft = masaniello.events - masaniello.currentEvents;
  const winsLeft = masaniello.winsNeeded - masaniello.currentWins;

  return (
    <div className="grid grid-cols-3 gap-3 relative z-10 w-full mt-0">
      {/* Profit */}
      <div className="glass-panel py-1.5 px-2 rounded-[1.7rem] flex flex-col items-center justify-center h-[80px]">
         <div className="flex items-center gap-1 text-secondary text-[7px] font-bold tracking-wider mb-0.5">
           <div className={`w-3 h-3 rounded-full border border-gray-500/30 flex items-center justify-center ${sessionProfit >= 0 ? 'text-[#059669]' : 'text-[#ff4d4d]'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
           </div>
           SESSION PNL
         </div>
         <div className={`text-sm font-bold mb-0.5 ${sessionProfit >= 0 ? 'text-[#059669]' : 'text-[#ff4d4d]'}`}>
            {sessionProfit >= 0 ? '+' : '-'}${Math.abs(sessionProfit).toFixed(2)}
         </div>
         <div className="text-secondary text-[7px] font-semibold flex items-center">
            {masaniello.currentWins} উইন • {masaniello.currentEvents - masaniello.currentWins} লস
         </div>
      </div>

      {/* Progress */}
      <div className="glass-panel py-1.5 px-2 rounded-[1.7rem] flex flex-col items-center justify-center h-[80px]">
         <div className="flex items-center gap-1 text-secondary text-[7px] font-bold tracking-wider mb-0.5">
           <div className="w-3 h-3 rounded-full border border-gray-500/30 flex items-center justify-center text-[#ff4d4d]">
             <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
           </div>
           PROGRESS
         </div>
         <div className="text-sm font-bold text-primary mb-0.5">{masaniello.currentWins} / {masaniello.winsNeeded}</div>
         <div className="text-[#3b82f6] text-[7px] font-semibold flex items-center">
            {progressPct.toFixed(1)}% কমপ্লিট
         </div>
      </div>

      {/* Next Step */}
      <div className="glass-panel py-1.5 px-2 rounded-[1.7rem] flex flex-col items-center justify-center h-[80px]">
         <div className="flex items-center gap-1 text-secondary text-[7px] font-bold tracking-wider mb-0.5">
           <div className="w-3 h-3 rounded-full border border-gray-500/30 flex items-center justify-center text-[#a855f7]">
             <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.5-1 2-1.52.4.67.6 1.45.6 2.02V20h4v-1.5c0-4.6-2-8.5-5.6-13.5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/></svg>
           </div>
           REMAINING
         </div>
         <div className="text-sm font-bold text-primary mb-0.5">{eventsLeft}</div>
         <div className="text-[#a855f7] text-[7px] font-semibold flex items-center">
            ট্রেড বাকি
         </div>
      </div>
    </div>
  );
}
