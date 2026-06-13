export function BottomNav({ currentTab, setTab }: { currentTab: string, setTab: (t: string) => void }) {
  return (
    <div className="flex justify-between gap-2.5 relative w-[95%] mx-auto mt-0 pb-3">
      
      {/* Target Mode */}
      <button onClick={() => setTab('target')} className={`flex flex-col items-center justify-center flex-1 h-[80px] transition-all rounded-[1.5rem] relative ${currentTab === 'target' ? 'glass-panel bg-gradient-to-br from-white/80 via-white/50 to-white/20 dark:from-[#00e676]/30 dark:to-transparent border border-white/80 border-t-white dark:border-[#00e676]/50 shadow-[0_8px_16px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_15px_rgba(0,230,118,0.3)]' : 'inner-glass bg-white/20 dark:bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-white/5'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-transform shadow-inner ${currentTab === 'target' ? 'bg-[#00e676] text-white shadow-[0_0_10px_rgba(0,230,118,0.5)] scale-110 border border-[#00e676]/20' : 'bg-black/5 dark:bg-[#00e676]/20 text-[#00e676]'}`} >
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        </div>
        <span className={`text-[10px] font-bold tracking-wide relative z-10 ${currentTab === 'target' ? 'text-[#00e676]' : 'text-slate-500 dark:text-slate-400'}`}>Target</span>
      </button>

      {/* Masaniello */}
      <button onClick={() => setTab('masaniello')} className={`flex flex-col items-center justify-center flex-1 h-[80px] transition-all rounded-[1.5rem] relative ${currentTab === 'masaniello' ? 'glass-panel bg-gradient-to-br from-white/80 via-white/50 to-white/20 dark:from-[#3b82f6]/30 dark:to-transparent border border-white/80 border-t-white dark:border-[#3b82f6]/50 shadow-[0_8px_16px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_15px_rgba(59,130,246,0.3)]' : 'inner-glass bg-white/20 dark:bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-white/5'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-transform shadow-inner ${currentTab === 'masaniello' ? 'bg-[#3b82f6] text-white shadow-[0_0_10px_rgba(59,130,246,0.5)] scale-110 border border-[#3b82f6]/20' : 'bg-black/5 dark:bg-[#3b82f6]/20 text-[#3b82f6]'}`}>
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </div>
        <span className={`text-[10px] font-bold tracking-wide relative z-10 ${currentTab === 'masaniello' ? 'text-[#3b82f6]' : 'text-slate-500 dark:text-slate-400'}`}>Masaniello</span>
      </button>

      {/* Calculator */}
      <button onClick={() => setTab('calculator')} className={`flex flex-col items-center justify-center flex-1 h-[80px] transition-all rounded-[1.5rem] relative ${currentTab === 'calculator' ? 'glass-panel bg-gradient-to-br from-white/80 via-white/50 to-white/20 dark:from-[#a855f7]/30 dark:to-transparent border border-white/80 border-t-white dark:border-[#a855f7]/50 shadow-[0_8px_16px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_15px_rgba(168,85,247,0.3)]' : 'inner-glass bg-white/20 dark:bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-white/5'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-transform shadow-inner ${currentTab === 'calculator' ? 'bg-[#a855f7] text-white shadow-[0_0_10px_rgba(168,85,247,0.5)] scale-110 border border-[#a855f7]/20' : 'bg-black/5 dark:bg-[#a855f7]/20 text-[#a855f7]'}`}>
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/></svg>
        </div>
        <span className={`text-[10px] font-bold tracking-wide relative z-10 ${currentTab === 'calculator' ? 'text-[#a855f7]' : 'text-slate-500 dark:text-slate-400'}`}>Calculator</span>
      </button>

      {/* Journal */}
      <button onClick={() => setTab('journal')} className={`flex flex-col items-center justify-center flex-1 h-[80px] transition-all rounded-[1.5rem] relative ${currentTab === 'journal' ? 'glass-panel bg-gradient-to-br from-white/80 via-white/50 to-white/20 dark:from-[#ec4899]/30 dark:to-transparent border border-white/80 border-t-white dark:border-[#ec4899]/50 shadow-[0_8px_16px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_15px_rgba(236,72,153,0.3)]' : 'inner-glass bg-white/20 dark:bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-white/5'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-transform shadow-inner ${currentTab === 'journal' ? 'bg-[#ec4899] text-white shadow-[0_0_10px_rgba(236,72,153,0.5)] scale-110 border border-[#ec4899]/20' : 'bg-black/5 dark:bg-[#ec4899]/20 text-[#ec4899]'}`}>
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <span className={`text-[10px] font-bold tracking-wide relative z-10 ${currentTab === 'journal' ? 'text-[#ec4899]' : 'text-slate-500 dark:text-slate-400'}`}>Journal</span>
      </button>

    </div>
  );
}
