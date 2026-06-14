export function BottomNav({ currentTab, setTab }: { currentTab: string, setTab: (t: string) => void }) {
  return (
    <div className="flex justify-between gap-2.5 relative w-[95%] mx-auto mt-0 pb-3">
      
      {/* Target Mode */}
      <button onClick={() => setTab('target')} className={`flex flex-col items-center justify-center flex-1 h-[70px] transition-all rounded-2xl border backdrop-blur-md relative ${currentTab === 'target' ? 'bg-gradient-to-br from-[#00e676] to-[#00b25e] border-transparent shadow-[0_8px_20px_rgba(0,230,118,0.4)] text-white' : 'bg-emerald-50/70 dark:bg-emerald-900/30 border-emerald-200/60 dark:border-emerald-700/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-transform ${currentTab === 'target' ? 'scale-110' : ''}`} >
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        </div>
        <span className={`text-[10px] font-bold tracking-wide relative z-10 ${currentTab === 'target' ? '' : ''}`}>Target</span>
      </button>

      {/* Masaniello */}
      <button onClick={() => setTab('masaniello')} className={`flex flex-col items-center justify-center flex-1 h-[70px] transition-all rounded-2xl border backdrop-blur-md relative ${currentTab === 'masaniello' ? 'bg-gradient-to-br from-[#3b82f6] to-[#2563eb] border-transparent shadow-[0_8px_20px_rgba(59,130,246,0.4)] text-white' : 'bg-blue-50/70 dark:bg-blue-900/30 border-blue-200/60 dark:border-blue-700/40 hover:bg-blue-100/80 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-transform ${currentTab === 'masaniello' ? 'scale-110' : ''}`}>
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </div>
        <span className={`text-[10px] font-bold tracking-wide relative z-10 ${currentTab === 'masaniello' ? '' : ''}`}>Masaniello</span>
      </button>

      {/* Calculator */}
      <button onClick={() => setTab('calculator')} className={`flex flex-col items-center justify-center flex-1 h-[70px] transition-all rounded-2xl border backdrop-blur-md relative ${currentTab === 'calculator' ? 'bg-gradient-to-br from-[#a855f7] to-[#9333ea] border-transparent shadow-[0_8px_20px_rgba(168,85,247,0.4)] text-white' : 'bg-purple-50/70 dark:bg-purple-900/30 border-purple-200/60 dark:border-purple-700/40 hover:bg-purple-100/80 dark:hover:bg-purple-800/50 text-purple-600 dark:text-purple-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-transform ${currentTab === 'calculator' ? 'scale-110' : ''}`}>
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/></svg>
        </div>
        <span className={`text-[10px] font-bold tracking-wide relative z-10 ${currentTab === 'calculator' ? '' : ''}`}>Calculator</span>
      </button>

      {/* Journal */}
      <button onClick={() => setTab('journal')} className={`flex flex-col items-center justify-center flex-1 h-[70px] transition-all rounded-2xl border backdrop-blur-md relative ${currentTab === 'journal' ? 'bg-gradient-to-br from-[#ec4899] to-[#db2777] border-transparent shadow-[0_8px_20px_rgba(236,72,153,0.4)] text-white' : 'bg-pink-50/70 dark:bg-pink-900/30 border-pink-200/60 dark:border-pink-700/40 hover:bg-pink-100/80 dark:hover:bg-pink-800/50 text-pink-600 dark:text-pink-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-transform ${currentTab === 'journal' ? 'scale-110' : ''}`}>
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <span className={`text-[10px] font-bold tracking-wide relative z-10 ${currentTab === 'journal' ? '' : ''}`}>Journal</span>
      </button>
    </div>
  );
}
