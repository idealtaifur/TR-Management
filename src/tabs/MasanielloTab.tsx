import { useState, useMemo, useEffect } from "react";
import { useStore, LossReason } from "../store/useStore";
import { fraction, bankRatio } from "../lib/masaniello";
import { eliteTips } from "../data/tips";
import { LossReasonModal } from "../components/LossReasonModal";

const enToBn = (num: number | string) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, match => bnDigits[parseInt(match)]);
};

export function MasanielloTab() {
  const { balance, setBalance, masaniello, updateMasaniello, dailyTarget } = useStore();
  
  const [showSettings, setShowSettings] = useState(!masaniello.isConfigured);
  const [tipIdx, setTipIdx] = useState(0);
  const [showConsecutiveLossWarning, setShowConsecutiveLossWarning] = useState(false);
  const [showBadMarketWarning, setShowBadMarketWarning] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [showGlobalTargetReached, setShowGlobalTargetReached] = useState(false);
  const [hasDismissedGlobalTarget, setHasDismissedGlobalTarget] = useState(false);
  
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
  
  if (isCurrentlyFinished) {
    currentStake = 0;
  }
  
  let isStakeReduced = false;
  if (currentStake > maxStake && maxStake > 0) {
    if (rawStake > maxStake) {
      isStakeReduced = true;
    }
    currentStake = Math.max(1, maxStake);
  }

  // Cap by global daily target
  const globalTargetPct = dailyTarget.dailyPct / 100;
  const globalStartBal = dailyTarget.dayStartBalance > 0 ? dailyTarget.dayStartBalance : (useStore.getState().profile.startingBalance || 0);
  const globalTargetLimit = globalStartBal * (1 + globalTargetPct);
  const globalRemainingTarget = globalTargetLimit - balance;
  
  if (globalRemainingTarget > 0 && masaniello.payout > 0) {
    const globalMaxStake = globalRemainingTarget / (masaniello.payout / 100);
    if (currentStake > globalMaxStake) {
      currentStake = Math.max(1, globalMaxStake);
      isStakeReduced = true;
    }
  }
  
  if (currentStake > balance && balance >= 1) {
    currentStake = balance;
  }
  
  if (currentStake < 1 && !isCurrentlyFinished) {
    currentStake = 1;
  }

  const potentialWin = currentStake * (masaniello.payout / 100);

  const startNew = () => {
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

    if (newBalance >= globalTargetLimit && !hasDismissedGlobalTarget) {
      setShowGlobalTargetReached(true);
    }

    const evLeft = masaniello.events - newEvents;
    const wLeft = masaniello.winsNeeded - newWins;
    
    if (newWins >= masaniello.winsNeeded || newEvents >= masaniello.events || evLeft < wLeft || newBalance <= 1) {
      finished = true;
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
    <div className="flex flex-col pt-1 w-full z-10 px-3 pb-6 space-y-4 flex-1 overflow-y-auto">
      
      {/* 3D Balance Panel */}
      <div className="glass-panel-3d rounded-[2rem] flex flex-col items-center justify-center relative w-full mt-1 min-h-[160px] p-4 shadow-2xl transition-transform">
          <div className="absolute top-0 right-0 p-4 flex gap-2">
             <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5 shadow-sm font-sans tracking-widest">বাকি: {enToBn(eventsLeft)}টি</span>
             <span className="text-[9px] uppercase font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 tracking-widest">{enToBn(masaniello.payout)}%</span>
          </div>
          <div className="absolute top-0 left-0 p-4 flex gap-2">
             <button onClick={() => updateMasaniello({ isFinished: !masaniello.isFinished })} className="text-secondary hover:text-slate-800 dark:hover:text-white transition flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
             </button>
             <button onClick={() => setShowSettings(!showSettings)} className="text-secondary hover:text-slate-800 dark:hover:text-white transition flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
             </button>
          </div>
          
          <div className="flex flex-col items-center mt-2">
            <span className="text-secondary text-[10px] uppercase font-black tracking-[0.2em] mb-1 drop-shadow-sm">পরবর্তী স্টেক</span>
            <span className="text-[#059669] text-[3rem] leading-none font-black mb-1 drop-shadow-md tracking-tighter">${enToBn(currentStake.toFixed(2))}</span>
            <span className="text-slate-600 dark:text-[#059669]/80 text-[11px] font-bold tracking-widest uppercase bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full border border-slate-200 dark:border-[#059669]/10">উইনে: +${enToBn(potentialWin.toFixed(2))}</span>
          </div>

          {isStakeReduced && (
            <div className="mt-2 px-3 py-1 bg-orange-500/20 rounded-full text-orange-500 dark:text-orange-400 text-[9px] font-black border border-orange-500/30 tracking-widest uppercase">
              স্টেক কমানো হয়েছে
            </div>
          )}
          {currentStake === 1 && rawStake < 1 && rawStake > 0 && (
            <div className="mt-2 text-center px-3 py-1 text-secondary text-[9px] font-black tracking-widest uppercase">
              মিনিমাম স্টেক $১
            </div>
          )}
      </div>

      {/* Progress */}
      <div className="glass-panel rounded-[1.5rem] py-4 px-5 flex flex-col items-center justify-center relative w-full shadow-sm flex-shrink-0">
        <div className="w-full flex justify-between items-center text-[9px] font-black tracking-[0.15em] uppercase mb-2.5">
           <span className="text-slate-500 dark:text-white/60">মাসনেলো প্রোগ্রেস</span>
           <span className="text-[#059669]">{enToBn(masaniello.currentWins)} / {enToBn(masaniello.winsNeeded)} সম্পন্ন</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-black/40 h-2.5 rounded-full overflow-hidden border border-slate-300 dark:border-white/5 relative">
           <div className="h-full bg-gradient-to-r from-[#059669] to-[#065f46] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${progressPct}%` }}></div>
        </div>
      </div>

      {/* Balance Panel */}
      <div className="glass-panel w-full rounded-[1.5rem] py-6 px-5 flex flex-col items-center justify-center relative shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border-t border-white/50 dark:border-white/10 mb-3 bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-800/80 dark:to-slate-900/40 flex-shrink-0">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#059669]/50 to-transparent"></div>
          <span className="text-slate-500 dark:text-white/60 text-[10px] font-black tracking-[0.1em] mb-1 uppercase flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              মেইন ব্যালেন্স
          </span>
          <span className="text-slate-900 dark:text-white text-3xl font-black tracking-tight drop-shadow-sm">${enToBn(balance.toFixed(2))}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 w-full flex-shrink-0 mb-3">
           
           {/* Trades Taken & Left */}
           <div className="glass-panel rounded-2xl p-2 flex flex-col items-center justify-center relative min-h-[50px] shadow-sm border border-slate-200/50 dark:border-white/5">
             <span className="text-slate-500 dark:text-white/60 text-[9px] font-black tracking-[0.1em] mb-0.5 uppercase text-center w-full block">ট্রেড হয়েছে</span>
             <span className="text-slate-800 dark:text-white text-xl font-black tracking-tight flex items-baseline justify-center gap-0.5 leading-none mt-1 w-full text-center">
               {enToBn(masaniello.currentEvents)}<span className="text-[10px] font-bold text-slate-500 dark:text-white/50">টি</span>
             </span>
             <span className="text-[#3b82f6] text-[9px] font-bold mt-1 text-center w-full block">বাকি: {enToBn(Math.max(0, masaniello.events - masaniello.currentEvents))}টি</span>
           </div>
           
           {/* Wins Needed */}
           <div className="glass-panel rounded-2xl p-2 flex flex-col items-center justify-center relative min-h-[50px] shadow-sm border border-slate-200/50 dark:border-white/5">
             <span className="text-slate-500 dark:text-white/60 text-[9px] font-black tracking-[0.1em] mb-0.5 uppercase text-center w-full block">দরকার উইন</span>
             <span className="text-[#059669] text-2xl font-black tracking-tight flex items-baseline justify-center gap-0.5 leading-none mt-1 w-full text-center">
               {enToBn(winsLeft > 0 ? winsLeft : 0)}<span className="text-[11px] font-bold text-[#059669]/60">টি</span>
             </span>
           </div>
           
           {/* Losses */}
           <div className="glass-panel rounded-2xl p-2 flex flex-col items-center justify-center relative min-h-[50px] shadow-sm border border-slate-200/50 dark:border-white/5">
             <span className="text-slate-500 dark:text-white/60 text-[9px] font-black tracking-[0.1em] mb-0.5 uppercase text-center w-full block">লস হয়েছে</span>
             <span className="text-[#ef4444] text-2xl font-black tracking-tight flex items-baseline justify-center gap-0.5 leading-none mt-1 w-full text-center">
               {enToBn(losses)}<span className="text-[11px] font-bold text-[#ef4444]/60">টি</span>
             </span>
           </div>
           
           {/* Remaining Trades Heartbeat */}
           <div className="glass-panel rounded-2xl p-2 flex flex-col items-center justify-center relative min-h-[50px] shadow-sm overflow-hidden border border-slate-200/50 dark:border-white/5">
             <span className="text-slate-500 dark:text-white/60 text-[9px] font-black tracking-[0.1em] mb-0.5 uppercase z-10 text-center w-full block">অবশিষ্ট ট্রেড</span>
             <div className={`text-[#ef4444] text-3xl font-black tracking-tight flex items-center justify-center mt-1 z-10 leading-none w-full text-center ${Math.max(0, masaniello.events - masaniello.currentEvents) <= 3 ? (Math.max(0, masaniello.events - masaniello.currentEvents) <= 1 ? 'animate-heartbeat-critical' : 'animate-heartbeat-fast') : 'animate-heartbeat-slow'}`}>
                {enToBn(Math.max(0, masaniello.events - masaniello.currentEvents))}
             </div>
           </div>
      </div>
{/* Actions */}
      <div className="grid grid-cols-2 gap-3 mt-4 pb-8 flex-shrink-0">
        <button 
          onClick={() => handleTrade(true)}
          disabled={isCurrentlyFinished}
          className="bg-gradient-to-r from-[#059669] to-[#047857] text-white rounded-[1.5rem] py-4 font-black text-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale shadow-[0_8px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:scale-95"
        >
           WIN
        </button>
        <button 
          onClick={() => handleTrade(false)}
          disabled={isCurrentlyFinished}
          className="bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white rounded-[1.5rem] py-4 font-black text-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale shadow-[0_8px_16px_rgba(239,68,68,0.3)] hover:shadow-[0_10px_20px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 active:scale-95"
        >
          LOSS
        </button>
      </div>

      {/* Bottom Actions Info */}
      <div className="flex items-center justify-center w-full pb-4">
         <div className={`glass-panel px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm ${sessionProfit >= 0 ? 'text-[#059669]' : 'text-[#ef4444]'}`}>
           সেশন লাভ: {sessionProfit >= 0 ? '+' : '-'}${enToBn(Math.abs(sessionProfit).toFixed(2))}
         </div>
      </div>

      {/* Overlay Modals Below */}
      {isCooldownActive && !isCurrentlyFinished && (
         <div className="fixed inset-0 bg-slate-100/80 dark:bg-[#0b1621]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
           <div className="bg-white dark:bg-[#0b121e]/90 dark:backdrop-blur-xl p-6 rounded-2xl border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.2)] flex flex-col items-center text-center w-full max-w-sm">
              <span className="text-3xl font-bold text-blue-500 mb-2">⏳</span>
              <span className="text-lg font-bold text-slate-800 dark:text-white mb-2">কুলডাউন চলছে...</span>
              <span className="text-[#a855f7] dark:text-[#c084fc] text-2xl font-black mb-4 font-mono">{String(cdMins).padStart(2, '0')}:{String(cdSecs).padStart(2, '0')}</span>
              <span className="text-secondary text-xs">দয়া করে শান্তভাবে অপেক্ষা করুন।</span>
           </div>
         </div>
      )}

      {showConsecutiveLossWarning && (
         <div className="fixed inset-0 bg-slate-100/90 dark:bg-[#0b1621]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
           <div className="bg-white dark:bg-[#0b121e]/90 dark:backdrop-blur-xl p-6 rounded-2xl border border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)] flex flex-col items-center text-center w-full max-w-sm">
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
         <div className="fixed inset-0 bg-slate-100/90 dark:bg-[#0b1621]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
           <div className="bg-white dark:bg-[#0b121e]/90 dark:backdrop-blur-xl p-6 rounded-2xl border border-orange-500/50 shadow-[0_0_40px_rgba(249,115,22,0.2)] flex flex-col items-center text-center w-full max-w-sm">
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
         <div className="fixed inset-0 bg-slate-100/80 dark:bg-[#0b1621]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
           <div className="bg-white dark:bg-[#0b121e]/90 dark:backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.1)] flex flex-col items-center text-center w-full max-w-sm">
              <span className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                 {isMathImpossible ? "রুটিন ব্যর্থ হয়েছে" : "রুটিন সফলভাবে সম্পন্ন হয়েছে"}
              </span>
              <span className="text-secondary text-xs mb-3">
                 {isMathImpossible ? "গাণিতিকভাবে এই সেশনে টার্গেট পূরণ করা সম্ভব নয়।" : "আপনার বর্তমান মাসানেলো রুটিন শেষ হয়েছে।"}
              </span>
              
              {globalRemainingTarget <= 0 ? (
                <div className="bg-[#059669]/10 text-[#059669] px-4 py-3 rounded-xl w-full text-center font-bold text-sm">
                   আপনার আজকের ডেইলি টার্গেট পূর্ণ হয়েছে। আজকের মতো ট্রেড থেকে বিরতি নিন।
                </div>
              ) : (
                <>
                  {isCooldownActive && (
                    <div className="bg-blue-500/10 text-blue-500 px-4 py-2 rounded-xl mb-4 font-mono font-bold">
                       পরবর্তী সেশন: {String(cdMins).padStart(2, '0')}:{String(cdSecs).padStart(2, '0')}
                    </div>
                  )}
                  <button 
                    onClick={() => updateMasaniello({ isFinished: false, currentWins: 0, currentEvents: 0, sessionStartBalance: balance, cooldownUntil: null, consecutiveLosses: 0 })} 
                    className="bg-[#059669] text-black hover:bg-[#059669]/90 font-bold py-2.5 px-6 rounded-xl w-full disabled:opacity-50"
                    disabled={isCooldownActive}
                  >
                    নতুন করে শুরু করুন
                  </button>
                </>
              )}
           </div>
         </div>
      )}

      {/* Settings / Planner Overlay */}
      {showSettings && (
         <div className="fixed inset-0 bg-slate-100/95 dark:bg-[#0b1621]/95 backdrop-blur-md z-50 flex flex-col pt-safe-top">
            <div className="w-full h-full overflow-y-auto shrink-0 pb-20 p-4">
            <div className="flex items-center justify-between mb-4 mt-2">
              <button onClick={() => setShowSettings(false)} className="bg-white dark:bg-white/10 p-2 rounded-full text-slate-700 dark:text-white shadow-sm hover:bg-slate-200 dark:hover:bg-white/20 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide">মাসনেলো প্ল্যানার</h3>
              </div>
              <div className="w-9" />
            </div>

            <div className="inner-glass rounded-3xl p-5 shadow-lg flex flex-col gap-4 relative">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-secondary font-semibold mb-1.5 block">সেশন ব্যালেন্স ($)</label>
                  <input type="number" onFocus={e => e.target.select()} value={sessionBalance || ''} onChange={e => setSessionBalance(Number(e.target.value))} className="w-full bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-mono text-base focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/50 transition-colors" />
                </div>
                <div>
                  <label className="text-[11px] text-secondary font-semibold mb-1.5 block">পে-আউট (%)</label>
                  <input type="number" onFocus={e => e.target.select()} value={payout || ''} onChange={e => setPayout(Number(e.target.value))} className="w-full bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-mono text-base focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/50 transition-colors" />
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-white/10 mt-2 pt-4">
                <div onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center justify-center gap-2 text-[#059669] text-xs font-bold mb-4 cursor-pointer select-none">
                  <svg className={`transition-transform duration-300 ${showAdvanced ? '-rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  অ্যাডভান্সড সেটিংস
                </div>
                {showAdvanced && (
                  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    <div>
                      <label className="text-[11px] text-secondary font-semibold mb-1.5 block">মোট ট্রেড</label>
                      <input type="number" onFocus={e => e.target.select()} value={events || ''} onChange={e => setEvents(Number(e.target.value))} className="w-full bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-mono text-base focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/50 transition-colors" />
                    </div>
                    <div>
                      <label className="text-[11px] text-secondary font-semibold mb-1.5 block">টার্গেট উইন</label>
                      <input type="number" onFocus={e => e.target.select()} value={winsNeeded || ''} onChange={e => setWinsNeeded(Number(e.target.value))} className="w-full bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-mono text-base focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/50 transition-colors" />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-100/80 dark:bg-[#059669]/10 border border-slate-200 dark:border-[#059669]/20 rounded-2xl p-4 mt-2">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-secondary text-xs">সম্ভাব্য লাভ</span>
                   <span className="text-[#059669] font-bold text-lg">${(sessionBalance * (bankRatio(events, winsNeeded, payout / 100) - 1)).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-secondary text-xs">ব্যালেন্স প্রবৃদ্ধি</span>
                   <span className="text-slate-800 dark:text-white font-semibold text-sm">{((bankRatio(events, winsNeeded, payout / 100) - 1) * 100).toFixed(2)}%</span>
                 </div>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-secondary text-xs">ঝুঁকির পরিমাণ</span>
                   <span className={`text-sm font-bold ${bankRatio(events, winsNeeded, payout / 100) > 1.2 ? 'text-red-500' : bankRatio(events, winsNeeded, payout / 100) > 1.1 ? 'text-amber-500' : 'text-[#059669]'}`}>
                     {bankRatio(events, winsNeeded, payout / 100) > 1.2 ? 'উচ্চ ঝুঁকি' : bankRatio(events, winsNeeded, payout / 100) > 1.1 ? 'মাঝারি ঝুঁকি' : 'নিম্ন ঝুঁকি'}
                   </span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-secondary text-xs">সর্বোচ্চ লস করা যাবে</span>
                   <span className="text-red-500 font-bold text-sm tracking-wide">{Math.max(0, events - winsNeeded)} টি</span>
                 </div>
              </div>

              <button onClick={startNew} className="bg-[#059669] hover:bg-[#059669]/90 text-slate-900 rounded-xl py-3.5 font-black text-[15px] flex items-center justify-center gap-2 mt-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                সেশন শুরু
              </button>
            </div>
            </div>
         </div>
      )}

      {showGlobalTargetReached && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-4">অভিনন্দন! 🎉</h3>
            <p className="text-[13px] text-center text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
              {useStore.getState().profile.gender?.toLowerCase() === 'female' ? 'আপু' : 'ভাইয়া'}, আজকের টার্গেট পূরণ হয়ে গেলো, আর ট্রেড না করায় ভালো। অল্প অল্প করে অনেক দূরে যেতে হবে।
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowGlobalTargetReached(false);
                  updateMasaniello({ isFinished: true });
                }}
                className="w-full py-3 rounded-full bg-[#059669] text-white font-bold text-sm"
              >
                আচ্ছা ঠিক আছে
              </button>
              <button
                onClick={() => {
                  setShowGlobalTargetReached(false);
                  setHasDismissedGlobalTarget(true);
                }}
                className="w-full py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm"
              >
                চালিয়ে যেতে চাই
              </button>
            </div>
          </div>
        </div>
      )}

      <LossReasonModal 
        isOpen={showLossModal} 
        onSubmit={handleLossSubmit} 
        onClose={() => setShowLossModal(false)} 
      />
    </div>
  );
}
