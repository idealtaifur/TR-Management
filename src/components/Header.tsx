import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { getBnGreeting, getBnDate } from "../utils";

export function Header({ setTab }: { setTab?: (t: string) => void }) {
  const { profile, theme, toggleTheme } = useStore();
  const [showFullImage, setShowFullImage] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Simulate periodic sync
  useEffect(() => {
    const syncInterval = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000); // sync takes 2 seconds
    }, 30000); // every 30s
    return () => clearInterval(syncInterval);
  }, []);

  return (
    <>
      {showFullImage && profile.avatar && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md" 
          onClick={() => setShowFullImage(false)}
        >
          <img src={profile.avatar} className="max-w-full max-h-[80vh] rounded-3xl object-contain shadow-2xl" alt="Full Profile" />
        </div>
      )}
      <header className="flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="relative" onClick={() => setShowFullImage(true)}>
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-12 h-12 rounded-full ring-2 ring-[#00e676]/50 hover:ring-[#00e676] object-cover transition-all"
              />
            ) : (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ring-2 ring-[#00e676]/50 overflow-hidden relative ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'}`}>
                 <span className="text-xl font-bold">{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</span>
              </div>
            )}
            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${isSyncing ? 'bg-[#facc15] animate-pulse' : 'bg-[#00e676]'} border-2 border-[#071318] rounded-full transition-colors`}></div>
          </div>
          <div onClick={() => setTab?.('profile')}>
            <h1 className="text-lg font-bold text-primary flex items-center gap-1.5 leading-tight">
              {profile.name} <span role="img" aria-label="wave">👋</span>
            </h1>
            <p className="text-secondary text-xs font-medium">{getBnGreeting()} • {getBnDate()}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
        <button onClick={toggleTheme} className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-primary transition-colors hover:bg-white/20">
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          )}
        </button>
        <button onClick={() => setTab?.('profile')} className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-primary transition-colors hover:bg-white/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
    </header>
    </>
  );
}
