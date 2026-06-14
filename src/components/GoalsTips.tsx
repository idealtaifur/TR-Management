import { useState, useEffect } from 'react';
import { eliteTips } from '../data/tips';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { enToBn } from '../utils';

const ICONS = [
  <svg key="1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  <svg key="2" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 10-4 4-4-4"/></svg>,
  <svg key="3" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11v1a10 10 0 1 1-9-10 10 10 0 0 1 9 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  <svg key="4" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
];

export function GoalsTips() {
  const [currentTipIdx, setCurrentTipIdx] = useState(0);
  const [showAllTips, setShowAllTips] = useState(false);
  const { balance, profile, dailyTarget } = useStore();

  const startBal = profile.startingBalance || 215;
  const currentProfit = Math.max(0, balance - startBal);
  
  // Daily Goal
  const dailyTargetAmount = startBal * (dailyTarget.dailyPct / 100);
  const dailyProgress = Math.min(100, Math.max(0, (currentProfit / dailyTargetAmount) * 100)) || 0;

  // Monthly Goal (30 days total)
  // Just an example logic for monthly target
  const monthlyTargetAmount = startBal * 1.5; 
  const monthlyProgress = Math.min(100, Math.max(0, (currentProfit / monthlyTargetAmount) * 100)) || 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIdx((prev) => (prev + 1) % eliteTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {showAllTips && (
        <div className="fixed inset-0 z-[100] bg-slate-100/95 dark:bg-black/95 flex flex-col p-4 backdrop-blur-md overflow-hidden">
           <div className="flex justify-between items-center mb-6 mt-4">
             <h2 className="text-[#facc15] text-xl font-bold flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="9" x2="15" y1="21" y2="21"/><path d="M5.8 11.3 2 22l10.7-3.8-2.6-2.6L12 14l-2.7-2.7Z"/><path d="M12.9 6.2 16.5 2.6c1.1-1.1 2.8-1.1 3.9 0l1 1c1.1 1.1 1.1 2.8 0 3.9l-3.6 3.6-4.9-4.9Z"/></svg>
               Elite Binary Tips
             </h2>
             <button onClick={() => setShowAllTips(false)} className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-full flex items-center justify-center text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-white/20">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
             </button>
           </div>
           <div className="flex-1 overflow-y-auto space-y-3 pb-24 pr-2">
             {eliteTips.map((tip, idx) => (
               <div key={idx} className="bg-white dark:bg-[#1c293c] p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex gap-3 shadow-lg">
                 <div className="bg-[#facc15]/20 text-yellow-600 dark:text-[#facc15] font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs">{idx + 1}</div>
                 <p className="text-sm text-slate-700 dark:text-primary/90 leading-snug">{tip}</p>
               </div>
             ))}
           </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 relative z-10 w-full mt-0 items-stretch">
        
        {/* Left: Goals */}
        <div className="glass-panel rounded-[1.5rem] p-3 flex flex-col justify-between h-[155px]">
          <div className="relative z-10 flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white/90 text-[13px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              Goals
            </div>
            <span className="text-[#059669] text-[10px] font-bold">View All</span>
          </div>

          {/* Monthly Goal */}
          <div className="relative z-10 mb-1">
            <div className="flex items-center gap-2 mb-1">
               <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center flex-shrink-0 text-[#059669]">
                 <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
               </div>
               <div className="flex justify-between flex-1 items-start">
                 <div className="flex flex-col">
                    <div className="text-slate-800 dark:text-white text-[12px] font-bold leading-none mb-0.5">Monthly</div>
                    <div className="text-slate-500 text-[9px] font-medium leading-none">৩০ days</div>
                 </div>
                 <div className="text-[#059669] font-bold text-[11.5px]">{monthlyProgress.toFixed(0)}%</div>
               </div>
            </div>
            <div className="text-slate-500 font-medium text-[9px] mb-0.5">
              ${currentProfit.toFixed(2)} / ${monthlyTargetAmount.toFixed(0)}
            </div>
            <div className="w-full bg-black/10 dark:bg-white/5 h-1 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-[#059669]" style={{ width: `${monthlyProgress}%` }}></div>
            </div>
          </div>

          {/* Daily Goal */}
          <div className="relative z-10 mt-1">
            <div className="flex items-center gap-2 mb-1">
               <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center flex-shrink-0 text-[#a855f7]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
               </div>
               <div className="flex justify-between flex-1 items-start">
                 <div className="flex flex-col">
                    <div className="text-slate-800 dark:text-white text-[12px] font-bold leading-none mb-0.5">Daily</div>
                    <div className="text-slate-500 text-[9px] font-medium leading-none">Day ২/৩০</div>
                 </div>
                 <div className="text-[#a855f7] font-bold text-[11.5px]">{dailyProgress.toFixed(0)}%</div>
               </div>
            </div>
            <div className="text-slate-500 font-medium text-[9px] mb-0.5">
              ${currentProfit.toFixed(2)} / ${dailyTargetAmount.toFixed(0)}
            </div>
            <div className="w-full bg-black/10 dark:bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="h-full bg-[#a855f7]" style={{ width: `${dailyProgress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Right: Elite Tips */}
        <div className="glass-panel rounded-[1.5rem] p-3 flex flex-col h-[155px] shrink-0">
           <div className="relative z-10 flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white/90 text-[13px]">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="9" x2="15" y1="21" y2="21"/><path d="M5.8 11.3 2 22l10.7-3.8-2.6-2.6L12 14l-2.7-2.7Z"/><path d="M12.9 6.2 16.5 2.6c1.1-1.1 2.8-1.1 3.9 0l1 1c1.1 1.1 1.1 2.8 0 3.9l-3.6 3.6-4.9-4.9Z"/></svg>
                 এলিট টিপস
                 <span className="text-[8px] bg-[#facc15]/20 text-[#facc15] px-1 py-0.5 rounded uppercase flex items-center font-bold tracking-wider ml-0.5">
                   <span className="w-1 h-1 bg-[#facc15] rounded-full mr-0.5 animate-pulse"></span>
                 </span>
              </div>
           </div>

           <div className="relative z-10 flex-1 mt-1 flex flex-col justify-start gap-1.5 overflow-hidden pointer-events-none">
              <AnimatePresence mode="popLayout">
                {[currentTipIdx, (currentTipIdx + 1) % eliteTips.length].map((idx, index) => (
                  <motion.div 
                    key={idx}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex items-start gap-2 bg-slate-100 dark:bg-white/[0.03] p-2 rounded-xl border border-slate-200 dark:border-white/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-none"
                  >
                     <div className={`mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${index === 0 ? 'bg-orange-500/20 text-orange-500' : 'bg-cyan-500/20 text-cyan-500'}`}>
                         {ICONS[idx % ICONS.length]}
                     </div>
                     <p className="text-[9.5px] text-slate-800 dark:text-slate-300 leading-[1.3] font-medium line-clamp-2">{eliteTips[idx]}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </>
  );
}

