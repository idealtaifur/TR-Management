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
  
  // Settings State
  const [events, setEvents] = useState(masaniello.events || 10);
  const [winsNeeded, setWinsNeeded] = useState(masaniello.winsNeeded || 5);
  const [payout, setPayout] = useState(masaniello.payout || 85);
  const [sessionBalance, setSessionBalance] = useState(masaniello.sessionStartBalance || balance || 100);
  const [syncMainBalance, setSyncMainBalance] = useState(false);

  // Target Profit settings states
  const plannerBankRatio = useMemo(() => {
    return bankRatio(events, winsNeeded, payout / 100);
  }, [events, winsNeeded, payout]);

  const maxGrowthPct = useMemo(() => {
    return Math.max(0, (plannerBankRatio - 1) * 100);
  }, [plannerBankRatio]);

  const maxPossibleProfit = useMemo(() => {
    return Math.max(0, sessionBalance * (plannerBankRatio - 1));
  }, [sessionBalance, plannerBankRatio]);

  const base1stFraction = useMemo(() => {
    return fraction(events, winsNeeded, payout / 100);
  }, [events, winsNeeded, payout]);

  // Target profit states (can be customized by % or $)
  const [targetProfitPct, setTargetProfitPct] = useState<number>(() => {
    if (masaniello.targetProfitPct && masaniello.targetProfitPct > 0) {
      return masaniello.targetProfitPct;
    }
    return Number(maxGrowthPct.toFixed(2));
  });

  const [targetProfitAmount, setTargetProfitAmount] = useState<number>(() => {
    if (masaniello.targetProfitAmount && masaniello.targetProfitAmount > 0) {
      return masaniello.targetProfitAmount;
    }
    return Number(maxPossibleProfit.toFixed(2));
  });

  // Track if user explicitly customized profit or wants 100% max
  const [isCustomMode, setIsCustomMode] = useState<boolean>(() => {
    return !!(masaniello.capitalRatio && masaniello.capitalRatio < 0.999);
  });

  // Sync target profit when events/wins/payout/balance change (if not customized)
  useEffect(() => {
    if (!isCustomMode) {
      setTargetProfitPct(Number(maxGrowthPct.toFixed(2)));
      setTargetProfitAmount(Number(maxPossibleProfit.toFixed(2)));
    } else {
      // Re-cap if current custom amount exceeds new maximum
      if (targetProfitAmount > maxPossibleProfit && maxPossibleProfit > 0) {
        setTargetProfitAmount(Number(maxPossibleProfit.toFixed(2)));
        setTargetProfitPct(Number(maxGrowthPct.toFixed(2)));
      }
    }
  }, [events, winsNeeded, payout, sessionBalance, maxGrowthPct, maxPossibleProfit, isCustomMode]);

  // Handle Target Profit % change
  const handleProfitPctChange = (newPct: number) => {
    setIsCustomMode(true);
    const validPct = Math.max(0.1, Number(newPct) || 0);
    const cappedPct = Math.min(maxGrowthPct, validPct);
    setTargetProfitPct(cappedPct);
    const calculatedAmt = Number(((sessionBalance * cappedPct) / 100).toFixed(2));
    setTargetProfitAmount(calculatedAmt);
  };

  // Handle Target Profit $ change
  const handleProfitAmountChange = (newAmt: number) => {
    setIsCustomMode(true);
    const validAmt = Math.max(0.1, Number(newAmt) || 0);
    const cappedAmt = Math.min(maxPossibleProfit, validAmt);
    setTargetProfitAmount(cappedAmt);
    const calculatedPct = sessionBalance > 0 ? Number(((cappedAmt / sessionBalance) * 100).toFixed(2)) : 0;
    setTargetProfitPct(calculatedPct);
  };

  // Preset percentage chips
  const applyPresetRatio = (ratio: number) => {
    if (ratio >= 1) {
      setIsCustomMode(false);
      setTargetProfitPct(Number(maxGrowthPct.toFixed(2)));
      setTargetProfitAmount(Number(maxPossibleProfit.toFixed(2)));
    } else {
      setIsCustomMode(true);
      const newPct = Number((maxGrowthPct * ratio).toFixed(2));
      const newAmt = Number((maxPossibleProfit * ratio).toFixed(2));
      setTargetProfitPct(newPct);
      setTargetProfitAmount(newAmt);
    }
  };

  // Preview calculations for settings modal
  const effectiveTargetProfit = Math.min(maxPossibleProfit, isCustomMode ? targetProfitAmount : maxPossibleProfit);
  const effectiveScaleFactor = maxPossibleProfit > 0 ? Math.min(1, Math.max(0.01, effectiveTargetProfit / maxPossibleProfit)) : 1;
  const previewAllocatedCapital = sessionBalance * effectiveScaleFactor;
  const preview1stStake = Math.max(1, previewAllocatedCapital * base1stFraction);
  const previewProfitPct = sessionBalance > 0 ? (effectiveTargetProfit / sessionBalance) * 100 : 0;

  // Active Trading Calculations
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

  const targetBankRatio = useMemo(() => {
    return bankRatio(masaniello.events, masaniello.winsNeeded, masaniello.payout / 100);
  }, [masaniello.events, masaniello.winsNeeded, masaniello.payout]);

  const activeCapitalRatio = masaniello.capitalRatio ?? 1;
  const effectiveStartBankroll = (masaniello.sessionStartBalance || balance) * activeCapitalRatio;
  const sessionTargetProfit = masaniello.targetProfitAmount ?? (effectiveStartBankroll * Math.max(0, targetBankRatio - 1));

  const isTargetAchieved = (sessionTargetProfit > 0 && sessionProfit >= (sessionTargetProfit - 0.05)) || winsLeft <= 0;
  const isCurrentlyFinished = masaniello.isFinished || isMathImpossible || isTargetAchieved || eventsLeft < 0;

  const currentFrac = useMemo(() => {
    return fraction(eventsLeft, winsLeft, masaniello.payout / 100);
  }, [eventsLeft, winsLeft, masaniello.payout]);

  // Remaining profit required to achieve session target
  const neededProfit = Math.max(0, sessionTargetProfit - sessionProfit);
  const maxStakeForTarget = masaniello.payout > 0 ? neededProfit / (masaniello.payout / 100) : 0;

  // Dynamic stake calculation based on effective capital
  let rawStake = effectiveStartBankroll * currentFrac;
  let currentStake = rawStake > 0 ? Math.max(1, rawStake) : 0;

  if (isCurrentlyFinished) {
    currentStake = 0;
  }

  let isStakeReduced = false;
  if (currentStake > maxStakeForTarget && maxStakeForTarget > 0) {
    if (rawStake > maxStakeForTarget) {
      isStakeReduced = true;
    }
    currentStake = Math.max(1, maxStakeForTarget);
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
    const pRatio = bankRatio(events, winsNeeded, payout / 100);
    const maxP = sessionBank * Math.max(0, pRatio - 1);
    const finalTargetProfit = isCustomMode ? Math.min(maxP, targetProfitAmount) : maxP;
    const finalScale = maxP > 0 ? Math.min(1, Math.max(0.01, finalTargetProfit / maxP)) : 1;
    const finalPct = sessionBank > 0 ? (finalTargetProfit / sessionBank) * 100 : 0;

    updateMasaniello({
      events,
      winsNeeded,
      payout,
      currentWins: 0,
      currentEvents: 0,
      isFinished: false,
      sessionStartBalance: sessionBank,
      targetProfitPct: Number(finalPct.toFixed(2)),
      targetProfitAmount: Number(finalTargetProfit.toFixed(2)),
      capitalRatio: finalScale,
      cooldownUntil: null,
      consecutiveLosses: 0,
      isConfigured: true
    });

    if (syncMainBalance || balance <= 0) {
      setBalance(sessionBank);
    }
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
    const newProfit = newBalance - (masaniello.sessionStartBalance || balance);
    const targetHit = sessionTargetProfit > 0 && newProfit >= (sessionTargetProfit - 0.05);

    if (newWins >= masaniello.winsNeeded || newEvents >= masaniello.events || evLeft < wLeft || newBalance <= 1 || targetHit) {
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
  const profitProgressPct = sessionTargetProfit > 0 ? Math.min(100, Math.max(0, (sessionProfit / sessionTargetProfit) * 100)) : 0;

  return (
    <div className="flex flex-col pt-1 w-full z-10 px-3 pb-6 space-y-3 flex-1 overflow-y-auto">
      
      {/* Masaniello Header Bar */}
      <div className="flex items-center justify-between px-1 text-slate-800 dark:text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#059669]/10 dark:bg-[#059669]/20 text-[#059669] flex items-center justify-center font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight">মাসনেলো মানি ম্যানেজমেন্ট</h2>
            <p className="text-[10px] text-secondary">
              ক্যাপিটাল: ${enToBn(masaniello.sessionStartBalance || balance)} • লক্ষ্য: {enToBn(masaniello.winsNeeded)}/{enToBn(masaniello.events)} উইন • টার্গেট: +${enToBn(sessionTargetProfit.toFixed(2))} ({enToBn((masaniello.targetProfitPct || ((sessionTargetProfit / (masaniello.sessionStartBalance || 1)) * 100)).toFixed(1))}%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-masaniello-settings-btn"
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#059669]/10 text-[#059669] dark:text-emerald-400 hover:bg-[#059669]/20 text-xs font-bold transition active:scale-95 border border-[#059669]/20 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>সেটিংস</span>
          </button>
          <button
            id="reset-masaniello-session-btn"
            onClick={() => {
              if (window.confirm("মাসনেলো সেশন রিসেট করতে চান?")) {
                updateMasaniello({ currentWins: 0, currentEvents: 0, isFinished: false, consecutiveLosses: 0, cooldownUntil: null });
              }
            }}
            title="সেশন রিসেট"
            className="p-1.5 rounded-xl bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        </div>
      </div>

      {/* 3D Balance Panel */}
      <div className="glass-panel-3d rounded-[2rem] flex flex-col items-center justify-center relative w-full mt-1 min-h-[160px] p-4 shadow-2xl transition-transform">
          <div className="absolute top-0 right-0 p-4 flex gap-2">
             <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5 shadow-sm font-sans tracking-widest">বাকি: {enToBn(eventsLeft)}টি</span>
             <span className="text-[9px] uppercase font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 tracking-widest">{enToBn(masaniello.payout)}%</span>
          </div>
          <div className="absolute top-0 left-0 p-4 flex gap-2">
             <button onClick={() => updateMasaniello({ isFinished: !masaniello.isFinished })} className="text-secondary hover:text-slate-800 dark:hover:text-white transition flex items-center justify-center" title="স্টপ / রিজ্যুম">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
             </button>
             <button onClick={() => setShowSettings(!showSettings)} className="text-secondary hover:text-slate-800 dark:hover:text-white transition flex items-center justify-center" title="প্ল্যানার">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
             </button>
          </div>
          
          <div className="flex flex-col items-center mt-2">
            <span className="text-secondary text-[10px] uppercase font-black tracking-[0.2em] mb-1 drop-shadow-sm">পরবর্তী স্টেক</span>
            <span className="text-[#059669] text-[3rem] leading-none font-black mb-1 drop-shadow-md tracking-tighter">${enToBn(currentStake.toFixed(2))}</span>
            <span className="text-slate-600 dark:text-[#059669]/80 text-[11px] font-bold tracking-widest uppercase bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full border border-slate-200 dark:border-[#059669]/10">উইনে: +${enToBn(potentialWin.toFixed(2))}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
            {activeCapitalRatio < 0.999 && (
              <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-bold border border-emerald-500/20">
                🎯 টার্গেট প্রফিট: ${enToBn(sessionTargetProfit.toFixed(2))} ({enToBn((masaniello.targetProfitPct || 0).toFixed(1))}%)
              </span>
            )}
            {isStakeReduced && (
              <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-500 dark:text-orange-400 rounded-full text-[9px] font-black border border-orange-500/30 tracking-widest uppercase">
                স্টেক সীমিত
              </span>
            )}
            {currentStake === 1 && rawStake < 1 && rawStake > 0 && (
              <span className="px-2.5 py-0.5 text-secondary text-[9px] font-black tracking-widest uppercase">
                মিনিমাম $১
              </span>
            )}
          </div>
      </div>

      {/* Progress & Target Bar */}
      <div className="glass-panel rounded-[1.5rem] py-3.5 px-4 flex flex-col items-center justify-center relative w-full shadow-sm flex-shrink-0 gap-2">
        <div className="w-full flex justify-between items-center text-[9px] font-black tracking-[0.15em] uppercase">
           <span className="text-slate-500 dark:text-white/60">উইন প্রোগ্রেস</span>
           <span className="text-[#059669]">{enToBn(masaniello.currentWins)} / {enToBn(masaniello.winsNeeded)} সম্পন্ন</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-black/40 h-2.5 rounded-full overflow-hidden border border-slate-300 dark:border-white/5 relative">
           <div className="h-full bg-gradient-to-r from-[#059669] to-[#065f46] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${progressPct}%` }}></div>
        </div>

        <div className="w-full flex justify-between items-center text-[9px] font-bold text-slate-500 dark:text-white/50 pt-0.5">
           <span>টার্গেট লাভ: +${enToBn(sessionTargetProfit.toFixed(2))}</span>
           <span className={sessionProfit >= 0 ? "text-emerald-500 font-bold" : "text-red-500 font-bold"}>
             বর্তমান লাভ: {sessionProfit >= 0 ? '+' : '-'}${enToBn(Math.abs(sessionProfit).toFixed(2))} ({enToBn(profitProgressPct.toFixed(0))}%)
           </span>
        </div>
      </div>

      {/* Main Balance Display */}
      <div className="glass-panel w-full rounded-[1.5rem] py-4 px-5 flex flex-col items-center justify-center relative shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border-t border-white/50 dark:border-white/10 mb-1 bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-800/80 dark:to-slate-900/40 flex-shrink-0">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#059669]/50 to-transparent"></div>
          <span className="text-slate-500 dark:text-white/60 text-[10px] font-black tracking-[0.1em] mb-0.5 uppercase flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              মেইন ব্যালেন্স
          </span>
          <span className="text-slate-900 dark:text-white text-3xl font-black tracking-tight drop-shadow-sm">${enToBn(balance.toFixed(2))}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 w-full flex-shrink-0 mb-2">
           {/* Trades Taken & Left */}
           <div className="glass-panel rounded-2xl p-2.5 flex flex-col items-center justify-center relative min-h-[50px] shadow-sm border border-slate-200/50 dark:border-white/5">
             <span className="text-slate-500 dark:text-white/60 text-[9px] font-black tracking-[0.1em] mb-0.5 uppercase text-center w-full block">ট্রেড হয়েছে</span>
             <span className="text-slate-800 dark:text-white text-xl font-black tracking-tight flex items-baseline justify-center gap-0.5 leading-none mt-1 w-full text-center">
               {enToBn(masaniello.currentEvents)}<span className="text-[10px] font-bold text-slate-500 dark:text-white/50">টি</span>
             </span>
             <span className="text-[#3b82f6] text-[9px] font-bold mt-1 text-center w-full block">বাকি: {enToBn(Math.max(0, masaniello.events - masaniello.currentEvents))}টি</span>
           </div>
           
           {/* Wins Needed */}
           <div className="glass-panel rounded-2xl p-2.5 flex flex-col items-center justify-center relative min-h-[50px] shadow-sm border border-slate-200/50 dark:border-white/5">
             <span className="text-slate-500 dark:text-white/60 text-[9px] font-black tracking-[0.1em] mb-0.5 uppercase text-center w-full block">দরকার উইন</span>
             <span className="text-[#059669] text-2xl font-black tracking-tight flex items-baseline justify-center gap-0.5 leading-none mt-1 w-full text-center">
               {enToBn(winsLeft > 0 ? winsLeft : 0)}<span className="text-[11px] font-bold text-[#059669]/60">টি</span>
             </span>
           </div>
           
           {/* Losses */}
           <div className="glass-panel rounded-2xl p-2.5 flex flex-col items-center justify-center relative min-h-[50px] shadow-sm border border-slate-200/50 dark:border-white/5">
             <span className="text-slate-500 dark:text-white/60 text-[9px] font-black tracking-[0.1em] mb-0.5 uppercase text-center w-full block">লস হয়েছে</span>
             <span className="text-[#ef4444] text-2xl font-black tracking-tight flex items-baseline justify-center gap-0.5 leading-none mt-1 w-full text-center">
               {enToBn(losses)}<span className="text-[11px] font-bold text-[#ef4444]/60">টি</span>
             </span>
           </div>
           
           {/* Remaining Trades */}
           <div className="glass-panel rounded-2xl p-2.5 flex flex-col items-center justify-center relative min-h-[50px] shadow-sm overflow-hidden border border-slate-200/50 dark:border-white/5">
             <span className="text-slate-500 dark:text-white/60 text-[9px] font-black tracking-[0.1em] mb-0.5 uppercase z-10 text-center w-full block">অবশিষ্ট সুযোগ</span>
             <div className={`text-[#ef4444] text-3xl font-black tracking-tight flex items-center justify-center mt-1 z-10 leading-none w-full text-center ${Math.max(0, masaniello.events - masaniello.currentEvents) <= 3 ? (Math.max(0, masaniello.events - masaniello.currentEvents) <= 1 ? 'animate-heartbeat-critical' : 'animate-heartbeat-fast') : 'animate-heartbeat-slow'}`}>
                {enToBn(Math.max(0, masaniello.events - masaniello.currentEvents))}
             </div>
           </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-3 pb-2 flex-shrink-0">
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

      {/* Bottom Session Profit Tag */}
      <div className="flex items-center justify-center w-full pb-4">
         <div className={`glass-panel px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm ${sessionProfit >= 0 ? 'text-[#059669]' : 'text-[#ef4444]'}`}>
           সেশন লাভ: {sessionProfit >= 0 ? '+' : '-'}${enToBn(Math.abs(sessionProfit).toFixed(2))}
         </div>
      </div>

      {/* Cooldown Overlay */}
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

      {/* Consecutive Loss Warning */}
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

      {/* Bad Market Warning */}
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

      {/* Session Finished / Target Hit Modal */}
      {isCurrentlyFinished && (
         <div className="fixed inset-0 bg-slate-100/80 dark:bg-[#0b1621]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
           <div className="bg-white dark:bg-[#0b121e]/90 dark:backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.1)] flex flex-col items-center text-center w-full max-w-sm animate-in zoom-in-95 duration-200">
              <div className="text-4xl mb-2">
                {isMathImpossible ? "❌" : isTargetAchieved ? "🎉" : "🏁"}
              </div>
              <span className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                 {isMathImpossible 
                   ? "রুটিন ব্যর্থ হয়েছে" 
                   : isTargetAchieved 
                     ? "লক্ষ্য পূরণ হয়েছে! 🎉" 
                     : "মাসনেলো রুটিন সম্পন্ন"}
              </span>
              <span className="text-secondary text-xs mb-3">
                 {isMathImpossible 
                   ? "গাণিতিকভাবে এই সেশনে টার্গেট পূরণ করা সম্ভব নয়।" 
                   : isTargetAchieved 
                     ? `অভিনন্দন! আপনার সেশন টার্গেট লাভ ($${enToBn(sessionProfit.toFixed(2))}) সফলভাবে অর্জিত হয়েছে।`
                     : "আপনার বর্তমান মাসানেলো রুটিন শেষ হয়েছে।"}
              </span>

              <div className="bg-slate-100 dark:bg-white/5 rounded-2xl p-3 w-full mb-4 border border-slate-200 dark:border-white/10 flex justify-around text-xs">
                <div>
                  <span className="text-secondary block text-[10px]">সেশন লাভ</span>
                  <span className={`font-bold font-mono text-sm ${sessionProfit >= 0 ? 'text-[#059669]' : 'text-red-500'}`}>
                    {sessionProfit >= 0 ? '+' : '-'}${enToBn(Math.abs(sessionProfit).toFixed(2))}
                  </span>
                </div>
                <div className="border-l border-slate-300 dark:border-white/10 pl-3">
                  <span className="text-secondary block text-[10px]">মোট উইন</span>
                  <span className="font-bold text-slate-800 dark:text-white font-mono text-sm">
                    {enToBn(masaniello.currentWins)}/{enToBn(masaniello.currentEvents)}
                  </span>
                </div>
              </div>
              
              {globalRemainingTarget <= 0 ? (
                <div className="bg-[#059669]/10 text-[#059669] px-4 py-3 rounded-xl w-full text-center font-bold text-sm">
                   আপনার আজকের ডেইলি টার্গেট পূর্ণ হয়েছে। আজকের মতো ট্রেড থেকে বিরতি নিন।
                </div>
              ) : (
                <>
                  {isCooldownActive && (
                    <div className="bg-blue-500/10 text-blue-500 px-4 py-2 rounded-xl mb-4 font-mono font-bold text-xs">
                       পরবর্তী সেশন কুলডাউন: {String(cdMins).padStart(2, '0')}:{String(cdSecs).padStart(2, '0')}
                    </div>
                  )}
                  <button 
                    onClick={() => updateMasaniello({ isFinished: false, currentWins: 0, currentEvents: 0, sessionStartBalance: balance, cooldownUntil: null, consecutiveLosses: 0 })} 
                    className="bg-[#059669] text-white hover:bg-[#059669]/90 font-bold py-3 px-6 rounded-2xl w-full disabled:opacity-50 transition shadow-lg active:scale-95 text-sm"
                    disabled={isCooldownActive}
                  >
                    নতুন করে শুরু করুন
                  </button>
                  <button
                    onClick={() => {
                      updateMasaniello({ isFinished: false });
                      setShowSettings(true);
                    }}
                    className="text-xs text-secondary mt-2.5 hover:underline"
                  >
                    সেটিংস পরিবর্তন করুন
                  </button>
                </>
              )}
           </div>
         </div>
      )}

      {/* Settings / Planner Overlay */}
      {showSettings && (
         <div className="fixed inset-0 bg-slate-100/95 dark:bg-[#0b1621]/95 backdrop-blur-md z-50 flex flex-col pt-safe-top animate-in fade-in duration-200">
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
              
              {/* Presets */}
              <div>
                <label className="text-[11px] text-secondary font-semibold mb-2 block">জনপ্রিয় স্ট্র্যাটেজি প্রিসেট</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '১০ এ ৩ উইন (৩০%)', e: 10, w: 3 },
                    { label: '১০ এ ৫ উইন (৫০%)', e: 10, w: 5 },
                    { label: '১২ এ ৬ উইন (৫০%)', e: 12, w: 6 },
                    { label: '১৫ এ ৭ উইন (৪৭%)', e: 15, w: 7 },
                    { label: '২০ এ ৯ উইন (৪৫%)', e: 20, w: 9 },
                  ].map((pr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEvents(pr.e);
                        setWinsNeeded(pr.w);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-left border text-xs font-semibold transition ${
                        events === pr.e && winsNeeded === pr.w
                          ? 'border-[#059669] bg-[#059669]/15 text-[#059669] dark:text-emerald-400'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-secondary font-semibold mb-1.5 block">সেশন ব্যালেন্স ($)</label>
                  <input 
                    type="number" 
                    onFocus={e => e.target.select()} 
                    value={sessionBalance || ''} 
                    onChange={e => setSessionBalance(Math.max(1, Number(e.target.value) || 0))} 
                    className="w-full bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-mono text-base focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/50 transition-colors" 
                  />
                  <span className="text-[9px] text-secondary mt-1 block">মাসনেলোর মোট বাজেট</span>
                </div>
                <div>
                  <label className="text-[11px] text-secondary font-semibold mb-1.5 block">পে-আউট (%)</label>
                  <input 
                    type="number" 
                    onFocus={e => e.target.select()} 
                    value={payout || ''} 
                    onChange={e => setPayout(Math.max(1, Number(e.target.value) || 0))} 
                    className="w-full bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-mono text-base focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/50 transition-colors" 
                  />
                  <span className="text-[9px] text-secondary mt-1 block">ব্রোকার প্রফিট রেট</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-[11px] text-secondary font-semibold mb-1.5 block">মোট ট্রেড / ইভেন্ট</label>
                  <input 
                    type="number" 
                    onFocus={e => e.target.select()} 
                    value={events || ''} 
                    onChange={e => setEvents(Math.max(1, Number(e.target.value) || 0))} 
                    className="w-full bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-mono text-base focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/50 transition-colors" 
                  />
                </div>
                <div>
                  <label className="text-[11px] text-secondary font-semibold mb-1.5 block">টার্গেট উইন সংখ্যা</label>
                  <input 
                    type="number" 
                    onFocus={e => e.target.select()} 
                    value={winsNeeded || ''} 
                    onChange={e => setWinsNeeded(Math.max(1, Math.min(events, Number(e.target.value) || 0)))} 
                    className="w-full bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-mono text-base focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/50 transition-colors" 
                  />
                </div>
              </div>

              {/* TARGET PROFIT & RISK CONTROL SECTION */}
              <div className="bg-slate-100/90 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🎯</span>
                    <label className="text-xs font-bold text-slate-800 dark:text-white">
                      টার্গেট প্রফিট ও ঝুঁকি নিয়ন্ত্রণ
                    </label>
                  </div>
                  <span className="text-[10px] font-bold text-[#059669] bg-[#059669]/10 px-2 py-0.5 rounded-full border border-[#059669]/20">
                    সর্বোচ্চ লাভ: {maxGrowthPct.toFixed(1)}% (${maxPossibleProfit.toFixed(2)})
                  </span>
                </div>

                <p className="text-[10px] text-secondary leading-relaxed">
                  আপনি চাইলে সর্বোচ্চ লাভের চেয়ে কম পারসেন্টেজ বেছে নিতে পারেন। এতে আপনার ১ম ট্রেড ও পরবর্তী সব ট্রেডের সাইজ কমে আসবে এবং রিস্ক অনেক কমে যাবে।
                </p>

                {/* Quick Presets for Target Profit */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    { label: '১০০% (সর্বোচ্চ)', r: 1 },
                    { label: '৭৫%', r: 0.75 },
                    { label: '৫০% (অর্ধেক ঝুঁকি)', r: 0.5 },
                    { label: '৩৫% (সেফ)', r: 0.35 },
                    { label: '২৫%', r: 0.25 }
                  ].map((p, idx) => {
                    const isSelected = !isCustomMode && p.r === 1 ? true : (isCustomMode && Math.abs(effectiveScaleFactor - p.r) < 0.05);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyPresetRatio(p.r)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition border ${
                          isSelected
                            ? 'bg-[#059669] text-white border-[#059669] shadow-sm'
                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Two linked Inputs: Target Profit % and Target Profit $ */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] text-secondary font-semibold mb-1 block">
                      টার্গেট লাভ (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max={maxGrowthPct}
                        onFocus={e => e.target.select()}
                        value={isCustomMode ? targetProfitPct : Number(maxGrowthPct.toFixed(1))}
                        onChange={e => handleProfitPctChange(Number(e.target.value))}
                        className="w-full bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 font-mono text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/50 transition-colors pr-7"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary">%</span>
                    </div>
                    <span className="text-[8px] text-secondary mt-0.5 block">সর্বোচ্চ: {maxGrowthPct.toFixed(1)}%</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-secondary font-semibold mb-1 block">
                      টার্গেট লাভ ($)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0.1"
                        max={maxPossibleProfit}
                        onFocus={e => e.target.select()}
                        value={isCustomMode ? targetProfitAmount : Number(maxPossibleProfit.toFixed(2))}
                        onChange={e => handleProfitAmountChange(Number(e.target.value))}
                        className="w-full bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 font-mono text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/50 transition-colors pl-6"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary">$</span>
                    </div>
                    <span className="text-[8px] text-secondary mt-0.5 block">সর্বোচ্চ: ${maxPossibleProfit.toFixed(2)}</span>
                  </div>
                </div>

                {/* Range Slider */}
                <div className="pt-1">
                  <div className="flex justify-between text-[9px] text-secondary mb-1">
                    <span>কম রিস্ক (ছোট স্টেক)</span>
                    <span className="font-bold text-[#059669]">টার্গেট স্কেল: {(effectiveScaleFactor * 100).toFixed(0)}%</span>
                    <span>সর্বোচ্চ লাভ</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={Math.round(effectiveScaleFactor * 100)}
                    onChange={e => applyPresetRatio(Number(e.target.value) / 100)}
                    className="w-full accent-[#059669] cursor-pointer h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg"
                  />
                </div>
              </div>

              {/* Optional Wallet Sync */}
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none pt-0.5">
                <input
                  type="checkbox"
                  checked={syncMainBalance}
                  onChange={(e) => setSyncMainBalance(e.target.checked)}
                  className="rounded border-slate-300 text-[#059669] focus:ring-[#059669]"
                />
                <span>আমার প্রধান একাউন্ট ব্যালেন্সকে এই সেশন ব্যালেন্সে সিঙ্ক করুন</span>
              </label>

              {/* Live Preview calculation */}
              <div className="bg-slate-100/80 dark:bg-[#059669]/10 border border-slate-200 dark:border-[#059669]/20 rounded-2xl p-4 mt-1">
                 <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-[#059669]/20 pb-2 mb-2.5">
                   <span className="text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5">
                     <span>⚡</span> ১ম ট্রেডের সাইজ (1st Stake)
                   </span>
                   <span className="text-[#059669] font-black text-xl font-mono">
                     ${preview1stStake.toFixed(2)}
                     <span className="text-[10px] text-secondary font-normal ml-1">
                       ({((preview1stStake / (sessionBalance || 1)) * 100).toFixed(1)}%)
                     </span>
                   </span>
                 </div>

                 <div className="flex justify-between items-center mb-2">
                   <span className="text-secondary text-xs">টার্গেট পূরণ হলে মোট লাভ</span>
                   <span className="text-[#059669] font-bold text-base font-mono">
                     +${effectiveTargetProfit.toFixed(2)} 
                     <span className="text-xs font-semibold ml-1 text-slate-700 dark:text-slate-300">
                       (+{previewProfitPct.toFixed(1)}%)
                     </span>
                   </span>
                 </div>

                 <div className="flex justify-between items-center mb-2">
                   <span className="text-secondary text-xs">সর্বোচ্চ সম্ভাব্য লাভ (Max)</span>
                   <span className="text-slate-700 dark:text-slate-300 font-semibold text-xs font-mono">
                     +${maxPossibleProfit.toFixed(2)} (+{maxGrowthPct.toFixed(1)}%)
                   </span>
                 </div>

                 <div className="flex justify-between items-center mb-2">
                   <span className="text-secondary text-xs">রিস্ক ক্যাপিটাল (বরাদ্দ)</span>
                   <span className="text-slate-800 dark:text-white font-semibold text-xs font-mono">
                     ${previewAllocatedCapital.toFixed(2)} 
                     <span className="text-[9px] text-[#059669] ml-1">
                       (বাকি ${(sessionBalance - previewAllocatedCapital).toFixed(2)} নিরাপদ)
                     </span>
                   </span>
                 </div>

                 <div className="flex justify-between items-center mb-2">
                   <span className="text-secondary text-xs">উইন রেট প্রয়োজন</span>
                   <span className="text-slate-800 dark:text-white font-semibold text-xs font-mono">{((winsNeeded / (events || 1)) * 100).toFixed(1)}% ({winsNeeded}/{events})</span>
                 </div>

                 <div className="flex justify-between items-center">
                   <span className="text-secondary text-xs">সর্বোচ্চ লস করা যাবে</span>
                   <span className="text-red-500 font-bold text-xs tracking-wide">{Math.max(0, events - winsNeeded)} টি</span>
                 </div>
              </div>

              <button 
                id="save-masaniello-settings-btn"
                onClick={startNew} 
                className="bg-[#059669] hover:bg-[#059669]/90 text-white rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 mt-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                সেটিংস সংরক্ষণ করুন ও নতুন সেশন শুরু করুন
              </button>
            </div>
            </div>
         </div>
      )}

      {/* Global Daily Target Modal */}
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
