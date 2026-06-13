import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

export function FloatingNav({ currentTab, setTab }: { currentTab: string, setTab: (t: string) => void }) {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const { theme } = useStore();

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        setIsKeyboardOpen(true);
      }
    };
    const handleBlur = () => {
      setTimeout(() => {
        if (!document.activeElement || !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
           setIsKeyboardOpen(false);
        }
      }, 100);
    };

    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', handleBlur);
    return () => {
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('focusout', handleBlur);
    };
  }, []);

  if (currentTab === 'home' || isKeyboardOpen) return null;

  const isDark = theme === 'dark';
  const navBgClass = isDark ? 'bg-[#182333]' : 'bg-white';

  const tabs = [
    { id: 'calculator', label: 'Calc', icon: <><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/></> },
    { id: 'masaniello', label: 'Masa', icon: <><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></> },
    { id: 'home',       label: 'Home', icon: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
    { id: 'target',     label: 'Target',icon:<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></> },
    { id: 'profile',    label: 'Profile',icon:<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> }
  ];

  const activeIndex = tabs.findIndex(t => t.id === currentTab);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[92%] max-w-[400px] z-[90]">
      <div className={`relative w-full h-[65px] rounded-3xl ${navBgClass} backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-between px-2`}>
        {/* Tab Buttons */}
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center relative z-30 h-full focus:outline-none"
            >
              <div className={`transition-all duration-200 flex flex-col items-center justify-center ${isActive ? 'text-[#ec4899]' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
                  {tab.icon}
                </svg>
                <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-[#ec4899] font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                  {tab.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );
}

