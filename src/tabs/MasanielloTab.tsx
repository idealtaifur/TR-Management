import { useState, useMemo, useEffect } from "react";
import { useStore, LossReason } from "../store/useStore";
import { fraction, bankRatio } from "../lib/masaniello";
import { eliteTips } from "../data/tips";
import { motion, AnimatePresence } from "motion/react";
import { LossReasonModal } from "../components/LossReasonModal";

const enToBn = (num: number | string) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, match => bnDigits[parseInt(match)]);
};

export function MasanielloTab() {
  const { balance, setBalance, masaniello, updateMasaniello } = useStore();
  
  const [showSettings, setShowSettings] = useState(!masaniello.isConfigured);
  const [tipIdx, setTipIdx] = useState(0);
  const [showConsecutiveLossWarning, setShowConsecutiveLossWarning] = useState(false);
  const [showBadMarketWarning, setShowBadMarketWarning] = useState(false);
  const [now, setNow] = useState(Date.now());
  
  // Local state for setup
  const [events, setEvents] = useState(masaniello.events);
  const [winsNeeded, setWinsNeeded] = useState(masaniello.winsNeeded);
  const [payout, setPayout] = useState(masaniello.payout);
  const [sessionBalance, setSessionBalance] = useState(balance || 100);
  const [showAdvanced, setShowAdvanced] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % eliteTips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Update time for cooldown
  useEffect(() => {
    const intv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intv);
  }, []);

  const cooldownTime = masaniello.cooldownUntil ? new Date(masaniello.cooldownUntil).getTime() : 0;
  const isCooldownActive = cooldownTime > now;
  const cooldownRemaining = Math.max(0, cooldownTime - now);
  const cdMins = Math.floor(cooldownRemaining / 60000);
  const cdSecs = Math.floor((cooldownRemaining % 60000) / 1000);

  const eventsLeft = masaniello.events - masaniello.currentEvents;
  const winsLeft = masaniello.winsNeeded - masaniello.currentWins;
  const losses = masaniello.currentEvents - masaniello.currentWins;
  const sessionProfit = balance - (masaniello.sessionStartBalance || balance);

  const isMathImpossible = eventsLeft < winsLeft && winsLeft > 0;
  // Auto-finish if impossible or achieved
  const isCurrentlyFinished = masaniello.isFinished || isMathImpossible || winsLeft <= 0 || eventsLeft < 0;

  const currentFrac = useMemo(() => {
    return fraction(eventsLeft, winsLeft, masaniello.payout / 100);
  }, [eventsLeft, winsLeft, masaniello.payout]);

  const targetBankRatio = useMemo(() => {
    return bankRatio(masaniello.events, masaniello.winsNeeded, masaniello.payout / 100);
  }, [masaniello.events, masaniello.winsNeeded, masaniello.payout]);

  const currentVirtualBankroll = masaniello.sessionStartBalance || balance;

  const systemTargetBalance = currentVirtualBankroll * targetBankRatio;
  const neededProfit = Math.max(0, systemTargetBalance - balance);
  const maxStake = masaniello.payout > 0 ? neededProfit / (masaniello.payout / 100) : 0;
  
  let rawStake = currentVirtualBankroll * currentFrac;
  let currentStake = rawStake > 0 ? Math.max(1, rawStake) : 0;
  
  let isStakeReduced = false;
  if (currentStake > maxStake && maxStake > 0) {
    if (rawStake > maxStake) {
      isStakeReduced = true;
    }
    currentStake = Math.max(1, maxStake);
  }
  
  if (currentStake > balance && balance >= 1) {
    currentStake = balance;
  }
  
  if (currentStake < 1) {
    currentStake = 1;
  }

  const potentialWin = currentStake * (masaniello.payout / 100);

  const startNew = () => {
    // Make sure we have a positive session bankroll
    const sessionBank = sessionBalance > 0 ? sessionBalance : 100;
    updateMasaniello({
      events, winsNeeded, payout, currentWins: 0, currentEvents: 0, isFinished: false, sessionStartBalance: sessionBank, cooldownUntil: null, consecutiveLosses: 0, isConfigured: true
    });
    setBalance(sessionBank);
    setShowSettings(false);
  };

  const [showLossModal, setShowLossModal] = useState(false);

  const handleTrade = (isWin: boolean) => {
    if (isCurrentlyFinished || isCooldownActive) return;
    
    if (!isWin) {
      setShowLossModal(true);
      return;
    }
    
    executeTrade(true);
  };

  const handleLossSubmit = (reason: LossReason) => {
    executeTrade(false, reason);
    setShowLossModal(false);
  };

  const executeTrade = (isWin: boolean, lossReason?: LossReason) => {
    let newBalance = balance;
    let newWins = masaniello.currentWins;
    const newEvents = masaniello.currentEvents + 1;
    let newConsecutiveLosses = masaniello.consecutiveLosses;
    
    if (isWin) {
      newBalance += currentStake * (masaniello.payout / 100);
      newWins += 1;
      newConsecutiveLosses = 0;
    } else {
      newBalance -= currentStake;
      newConsecutiveLosses += 1;
    }

    useStore.getState().addTrade({
      type: isWin ? 'WIN' : 'LOSS',
      amount: isWin ? currentStake * (masaniello.payout / 100) : currentStake,
      isMasaniello: true,
      lossReason: isWin ? undefined : lossReason
    });

    setBalance(newBalance);
    
    let finished = false;
    let cooldownStr = masaniello.cooldownUntil;

    const evLeft = masaniello.events - newEvents;
    const wLeft = masaniello.winsNeeded - newWins;
    
    if (newWins >= masaniello.winsNeeded || newEvents >= masaniello.events || evLeft < wLeft || newBalance <= 1) {
      finished = true;
      // 5 min cooldown
      const cDate = new Date();
      cDate.setMinutes(cDate.getMinutes() + 5);
      cooldownStr = cDate.toISOString();
    } else {
      if (!isWin) {
        if (newConsecutiveLosses === 2) {
          setShowConsecutiveLossWarning(true);
        }
        if (newEvents >= Math.floor(masaniello.events * 0.6) && newWins <= 1 && evLeft > 0) {
          setShowBadMarketWarning(true);
        }
      }
    }

    updateMasaniello({ 
      currentWins: newWins, 
      currentEvents: newEvents, 
      isFinished: finished,
      consecutiveLosses: newConsecutiveLosses,
      cooldownUntil: cooldownStr
    });
  };

  const setBadMarketCooldown = () => {
    const cDate = new Date();
    cDate.setMinutes(cDate.getMinutes() + 30);
    updateMasaniello({ cooldownUntil: cDate.toISOString() });
    setShowBadMarketWarning(false);
  };

  const progressPct = Math.min(100, (masaniello.currentWins / masaniello.winsNeeded) * 100) || 0;

  return (
    <div className="flex flex-col pt-2 w-full z-10 px-3 pb-6 space-y-2.5 flex-1">
      
      {/* Small Elite Tip Top Bar */}
      <div className="glass-panel flex-shrink-0 bg-[#1c293c]/80 rounded-2xl h-10 border border-white/5 shadow-sm px-3 flex items-center gap-2 overflow-hidden relative">
         <div className="w-1.5 h-1.5 bg-[#facc15] rounded-full animate-pulse flex-shrink-0"></div>
         <span className="text-[#facc15] font-bold text-[10px] uppercase tracking-widest flex-shrink-0 border-r border-white/10 pr-2">টিপস</span>
         <div className="relative flex-1 h-full overflow-hidden">
            <AnimatePresence mode="popLayout">
               <motion.p
                  key={tipIdx}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="text-xs text-primary/90 absolute inset-0 flex items-center font-medium line-clamp-1"
               >
                 {eliteTips[tipIdx]}
               </motion.p>
            </AnimatePresence>
         </div>
      </div>

      <div className="flex-1 glass-panel rounded-[1.5rem] p-3 relative overflow-hidden flex flex-col">
        
        {/* Header & Progress */}
        <div className="mb-2">
          <div className="flex justify-between items-center text-xs font-semibold mb-1">
             <span className="text-secondary flex items-center gap-1.5">
               <div className="bg-white rounded p-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
               মাসনেলো
             </span>
             <span className="text-[#00e676]">{enToBn(masaniello.currentWins)}/{enToBn(masaniello.winsNeeded)} উইন</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-black/40 h-1.5 rounded-full overflow-hidden border border-slate-300 dark:border-white/5">
             <div className="h-full bg-gradient-to-r from-[#00e676] to-[#047857] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,230,118,0.5)]" style={{ width: `${progressPct}%` }}></div>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
           <div className="bg-gradient-to-br from-slate-100 to-white dark:from-white/10 dark:to-white/5 border border-slate-200 dark:border-white/10 rounded-[1.2rem] flex flex-col p-3 relative overflow-hidden shadow-sm dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
             <div className="absolute top-0 right-0 p-2 opacity-10">
               <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
             </div>
             <span className="text-secondary text-[11px] font-extrabold uppercase tracking-widest mb-1 drop-shadow-sm">মেইন ব্যালেন্স</span>
             <span className="text-slate-900 dark:text-white font-black text-2xl tracking-tighter">${enToBn(balance.toFixed(2))}</span>
           </div>
           
           <div className="bg-gradient-to-br from-[#00e676]/10 to-transparent border border-[#00e676]/20 rounded-[1.2rem] flex flex-col p-3 relative overflow-hidden shadow-sm dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
             <div className="absolute top-0 right-0 p-2 opacity-20 text-[#00e676]">
               <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
             </div>
             <span className="text-[#00c853] text-[11px] font-extrabold uppercase tracking-widest mb-1 drop-shadow-sm">সর্বমোট ট্রেড</span>
             <span className="text-[#00e676] font-black text-2xl tracking-tighter">{enToBn(masaniello.events)}<span className="text-[12px] text-[#00e676]/70 font-semibold ml-1 tracking-normal">টি</span></span>
           </div>
           
           <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-[1.2rem] flex flex-col p-3 relative overflow-hidden shadow-sm dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] text-left">
             <div className="absolute -top-1 -right-1 p-2 opacity-20 text-blue-500 transform rotate-12">
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
             </div>
             <span className="text-blue-500/90 text-[11px] font-extrabold uppercase tracking-widest mb-1 drop-shadow-sm">উইন দরকার</span>
             <span className="text-blue-500 font-black text-2xl tracking-tighter shadow-blue-500/20">{enToBn(winsLeft > 0 ? winsLeft : 0)}<span className="text-[12px] text-blue-500/60 font-semibold ml-1 tracking-normal">টি</span></span>
           </div>
           
           <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-[1.2rem] flex flex-col p-3 relative overflow-hidden shadow-sm dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] text-left">
             <div className="absolute top-0 right-0 p-2 opacity-20 text-red-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
             </div>
             <span className="text-red-500/90 text-[11px] font-extrabold uppercase tracking-widest mb-1 drop-shadow-sm">লস হয়েছে</span>
             <span className="text-red-500 font-black text-2xl tracking-tighter shadow-red-500/20">{enToBn(losses)}<span className="text-[12px] text-red-500/60 font-semibold ml-1 tracking-normal">টি</span></span>
           </div>
        </div>

          {/* Next Trade Box */}
          <div className="inner-glass rounded-[1.2rem] flex flex-col items-center justify-center py-6 mb-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1.5 flex gap-1">
                 <span className="text-[9px] bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-center border border-white/5">আর {enToBn(eventsLeft)} টি বাকি</span>
                 <span className="text-[9px] bg-blue-500/10 text-blue-500 dark:text-blue-400 px-1.5 py-0.5 rounded text-center border border-blue-500/20">{enToBn(masaniello.payout)}% Payout</span>
              </div>
              
              <div className="flex flex-col items-center mt-2">
                <span className="text-secondary text-[10px] uppercase font-black tracking-[0.2em] mb-1.5">পরবর্তী ট্রেড</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#00e676] to-[#047857] text-[2.75rem] leading-none font-black mb-1.5 drop-shadow-md tracking-tighter">${enToBn(currentStake.toFixed(2))}</span>
                <span className="text-[#00e676]/80 text-[11px] font-bold tracking-wide">উইনে: +${enToBn(potentialWin.toFixed(2))}</span>
              </div>

              {isStakeReduced && (
                <div className="mt-2 px-3 py-0.5 bg-orange-500/20 rounded-full text-orange-400 text-[10px] font-bold border border-orange-500/30">
                  ⚠️ স্টেক কমিয়ে আনা হয়েছে
                </div>
              )}
            {currentStake === 1 && rawStake < 1 && rawStake > 0 && (
              <div className="mt-2 text-center px-3 py-0.5 text-secondary text-[10px] font-medium">
                *মিনিমাম স্টেক ১ ডলারে সেট করা হয়েছে
              </div>
            )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button 
            onClick={() => handleTrade(true)}
            disabled={isCurrentlyFinished}
            className="bg-[#00e676] hover:bg-[#00e676]/90 text-slate-900 rounded-xl py-3 font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale shadow-[0_0_15px_rgba(0,230,118,0.2)] active:scale-95"
          >
             WIN
          </button>
          <button 
            onClick={() => handleTrade(false)}
            disabled={isCurrentlyFinished}
            className="bg-[#ff4d4d] hover:bg-[#ff4d4d]/90 text-white rounded-xl py-3 font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale shadow-[0_0_15px_rgba(255,77,77,0.2)] active:scale-95"
          >
            LOSS
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200 dark:border-white/5">
           <div className={`text-[10px] font-bold ${sessionProfit >= 0 ? 'text-[#00e676]' : 'text-[#ff4d4d]'}`}>
             সেশন লাভ: {sessionProfit >= 0 ? '+' : '-'}${enToBn(Math.abs(sessionProfit).toFixed(2))}
           </div>
           <div className="flex gap-2">
             <button onClick={() => updateMasaniello({ isFinished: !masaniello.isFinished })} className="text-secondary hover:text-slate-800 dark:hover:text-white text-[10px] font-bold uppercase transition flex items-center gap-1">
               <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
               রিসেট
             </button>
             <button onClick={() => setShowSettings(!showSettings)} className="text-secondary hover:text-slate-800 dark:hover:text-white text-[10px] font-bold uppercase transition flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                সেটিংস
             </button>
           </div>
        </div>

        {/* Overlay Modals Below */}
        {isCooldownActive && !isCurrentlyFinished && (
           <div className="absolute inset-0 bg-slate-100/80 dark:bg-[#0b1621]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-3">
             <div className="bg-white dark:bg-[#0b121e]/90 dark:backdrop-blur-xl p-6 rounded-2xl border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.2)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)] flex flex-col items-center text-center w-full">
                <span className="text-3xl font-bold text-blue-500 mb-2">⏳</span>
                <span className="text-lg font-bold text-slate-800 dark:text-white mb-2">কুলডাউন চলছে...</span>
                <span className="text-[#a855f7] text-2xl font-black mb-4 font-mono">{String(cdMins).padStart(2, '0')}:{String(cdSecs).padStart(2, '0')}</span>
                <span className="text-secondary text-xs">দয়া করে শান্তভাবে অপেক্ষা করুন।</span>
             </div>
           </div>
        )}

        {showConsecutiveLossWarning && (
           <div className="absolute inset-0 bg-slate-100/90 dark:bg-[#0b1621]/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-3">
             <div className="bg-white dark:bg-[#0b121e]/90 dark:backdrop-blur-xl p-6 rounded-2xl border border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)] flex flex-col items-center text-center w-full">
                <span className="text-4xl mb-4">⚠️</span>
                <span className="text-xl font-bold text-red-500 mb-2">সতর্কতা!</span>
                <span className="text-slate-800 dark:text-slate-300 text-sm mb-6 leading-relaxed">
                   আপনার পর পর ২টা লস হয়েছে। ইমোশনাল হয়ে ডাবল ট্রেড করবেন না। একটু শান্ত হোন, মার্কেট অ্যানালাইসিস করুন।
                </span>
                <button onClick={() => setShowConsecutiveLossWarning(false)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl w-full transition">ঠিক আছে, শান্ত হলাম</button>
             </div>
           </div>
        )}

        {showBadMarketWarning && (
           <div className="absolute inset-0 bg-slate-100/90 dark:bg-[#0b1621]/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-3">
             <div className="bg-white dark:bg-[#0b121e]/90 dark:backdrop-blur-xl p-6 rounded-2xl border border-orange-500/50 shadow-2xl dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)] flex flex-col items-center text-center w-full">
                <span className="text-4xl mb-4">📉</span>
                <span className="text-xl font-bold text-orange-500 mb-2">মার্কেট খারাপ!</span>
                <span className="text-slate-800 dark:text-slate-300 text-sm mb-6 leading-relaxed">
                   আপনার {enToBn(masaniello.events)} টি ট্রেডের মধ্যে কেবল {enToBn(masaniello.currentWins)} টি উইন হয়েছে। এখন ট্রেড করার দরকার নেই, লস হতে পারে।
                </span>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button onClick={() => setShowBadMarketWarning(false)} className="bg-transparent border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 font-bold py-3 pr-2 rounded-xl text-xs transition">আমি রিস্ক নিবো</button>
                  <button onClick={setBadMarketCooldown} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition">৩০ মিনিট রেস্ট</button>
                </div>
             </div>
           </div>
        )}

        {isCurrentlyFinished && (
           <div className="absolute inset-0 bg-slate-100/80 dark:bg-[#0b1621]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-3">
             <div className="bg-white dark:bg-[#0b121e]/90 dark:backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)] flex flex-col items-center text-center w-full">
                <span className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                   {isMathImpossible ? "রুটিন ব্যর্থ হয়েছে" : "রুটিন সফলভাবে সম্পন্ন হয়েছে"}
                </span>
                <span className="text-secondary text-xs mb-3">
                   {isMathImpossible ? "গাণিতিকভাবে এই সেশনে টার্গেট পূরণ করা সম্ভব নয়।" : "আপনার বর্তমান মাসানেলো রুটিন শেষ হয়েছে।"}
                </span>
                {isCooldownActive && (
                  <div className="bg-blue-500/10 text-blue-500 px-4 py-2 rounded-xl mb-4 font-mono font-bold">
                     পরবর্তী সেশন: {String(cdMins).padStart(2, '0')}:{String(cdSecs).padStart(2, '0')}
                  </div>
                )}
                <button 
                  onClick={() => updateMasaniello({ isFinished: false, currentWins: 0, currentEvents: 0, sessionStartBalance: balance, cooldownUntil: null, consecutiveLosses: 0 })} 
                  className="bg-[#00e676] text-black hover:bg-[#00e676]/90 font-bold py-2.5 px-6 rounded-xl w-full disabled:opacity-50"
                  disabled={isCooldownActive}
                >
                  নতুন করে শুরু করুন
                </button>
             </div>
           </div>
        )}

        {/* Settings / Planner Overlay */}
        {showSettings && (
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-[#0f1923] z-40 flex flex-col p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-6 pt-4">
                <button onClick={() => setShowSettings(false)} className="bg-white/10 p-2 rounded-full text-white hover:bg-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  <h3 className="text-xl font-bold text-white tracking-wide">মাসনেলো প্ল্যানার</h3>
                </div>
                <div className="w-9" /> {/* Spacer */}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-white/70 font-semibold mb-1.5 block">সেশন ব্যালেন্স ($)</label>
                    <input type="number" onFocus={e => e.target.select()} value={sessionBalance || ''} onChange={e => setSessionBalance(Number(e.target.value))} className="w-full bg-white/5 text-white border border-white/10 rounded-xl px-4 py-2.5 font-mono text-base focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[11px] text-white/70 font-semibold mb-1.5 block">পে-আউট (%)</label>
                    <input type="number" onFocus={e => e.target.select()} value={payout || ''} onChange={e => setPayout(Number(e.target.value))} className="w-full bg-white/5 text-white border border-white/10 rounded-xl px-4 py-2.5 font-mono text-base focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-colors" />
                  </div>
                </div>

                <div className="border-t border-white/10 mt-2 pt-4">
                  <div onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-bold mb-4 cursor-pointer select-none">
                    <svg className={`transition-transform duration-300 ${showAdvanced ? '-rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    অ্যাডভান্সড সেটিংস
                  </div>
                  {showAdvanced && (
                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                      <div>
                        <label className="text-[11px] text-white/70 font-semibold mb-1.5 block">মোট ট্রেড</label>
                        <input type="number" onFocus={e => e.target.select()} value={events || ''} onChange={e => setEvents(Number(e.target.value))} className="w-full bg-white/5 text-white border border-white/10 rounded-xl px-4 py-2.5 font-mono text-base focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-colors" />
                      </div>
                      <div>
                        <label className="text-[11px] text-white/70 font-semibold mb-1.5 block">টার্গেট উইন</label>
                        <input type="number" onFocus={e => e.target.select()} value={winsNeeded || ''} onChange={e => setWinsNeeded(Number(e.target.value))} className="w-full bg-white/5 text-white border border-white/10 rounded-xl px-4 py-2.5 font-mono text-base focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-colors" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-2xl p-4 mt-2">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-white/60 text-xs">সম্ভাব্য লাভ</span>
                     <span className="text-cyan-400 font-bold text-lg">${(sessionBalance * (bankRatio(events, winsNeeded, payout / 100) - 1)).toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-white/60 text-xs">ব্যালেন্স প্রবৃদ্ধি</span>
                     <span className="text-white font-semibold text-sm">{((bankRatio(events, winsNeeded, payout / 100) - 1) * 100).toFixed(2)}%</span>
                   </div>
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-white/60 text-xs">ঝুঁকির পরিমাণ</span>
                     <span className={`text-sm font-bold ${bankRatio(events, winsNeeded, payout / 100) > 1.2 ? 'text-red-400' : bankRatio(events, winsNeeded, payout / 100) > 1.1 ? 'text-yellow-400' : 'text-[#00e676]'}`}>
                       {bankRatio(events, winsNeeded, payout / 100) > 1.2 ? 'উচ্চ ঝুঁকি' : bankRatio(events, winsNeeded, payout / 100) > 1.1 ? 'মাঝারি ঝুঁকি' : 'নিম্ন ঝুঁকি'}
                     </span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-white/60 text-xs">সর্বোচ্চ লস করা যাবে</span>
                     <span className="text-rose-400 font-bold text-sm tracking-wide">{Math.max(0, events - winsNeeded)} টি</span>
                   </div>
                </div>

                <button onClick={startNew} className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black rounded-xl py-3.5 font-black text-[15px] flex items-center justify-center gap-2 mt-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                  সেশন শুরু
                </button>
              </div>
           </div>
        )}
      </div>

      <LossReasonModal 
        isOpen={showLossModal} 
        onSubmit={handleLossSubmit} 
        onClose={() => setShowLossModal(false)} 
      />
    </div>
  );
}

