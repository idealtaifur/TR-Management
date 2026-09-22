import { useEffect, useState, useMemo } from "react";
import { LossReason, useStore } from "../store/useStore";
import { enToBn, calculateTargetRecoveryStake } from "../utils";
import { LossReasonModal } from "../components/LossReasonModal";
import { TargetSettingsModal } from "../components/TargetSettingsModal";
import { 
  Target, 
  Settings, 
  RotateCcw, 
  TrendingUp, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  ListOrdered,
  X,
  Clock,
  Sparkles,
  Coffee,
  Trophy,
  Award
} from "lucide-react";

export function TargetModeTab() {
  const { balance, dailyTarget, recordTrade, startNewTargetSession, updateDailyTarget, profile } = useStore();
  const [showLossModal, setShowLossModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRoadmapDrawer, setShowRoadmapDrawer] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const intv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intv);
  }, []);

  const cooldownTime = dailyTarget.cooldownUntil ? new Date(dailyTarget.cooldownUntil).getTime() : 0;
  const isCooldownActive = cooldownTime > now;
  const remainingSeconds = Math.max(0, Math.ceil((cooldownTime - now) / 1000));
  const cdMinutes = Math.floor(remainingSeconds / 60);
  const cdSeconds = remainingSeconds % 60;
  const cdFormatted = `${String(cdMinutes).padStart(2, '0')}:${String(cdSeconds).padStart(2, '0')}`;

  const handleTrade = (isWin: boolean) => {
    if (dailyTarget.targetHit || dailyTarget.slHit || isCooldownActive) return;
    
    if (!isWin) {
      setShowLossModal(true);
      return;
    }
    
    recordTrade(true, dailyTarget.currentStake * ((dailyTarget.payout || 85) / 100));
  };

  const handleLossSubmit = (reason: LossReason) => {
    recordTrade(false, 0, reason);
    setShowLossModal(false);
  };

  const sessionStartBal = (dailyTarget.sessionStartBalance && dailyTarget.sessionStartBalance > 0)
    ? dailyTarget.sessionStartBalance
    : (dailyTarget.dayStartBalance && dailyTarget.dayStartBalance > 300)
      ? dailyTarget.dayStartBalance
      : balance > 0 ? balance : 1000;

  const allocatedBudget = (dailyTarget.allocatedBalance && dailyTarget.allocatedBalance > 0)
    ? dailyTarget.allocatedBalance
    : 200;

  const targetProfitAmount = (dailyTarget.targetProfitAmount && dailyTarget.targetProfitAmount > 0)
    ? dailyTarget.targetProfitAmount
    : Number(((sessionStartBal * (dailyTarget.dailyPct || 10)) / 100).toFixed(2));

  const targetAmount = sessionStartBal + targetProfitAmount;
  
  // Safe base initial stake (10 or 12)
  const baseStake = Math.max(1, dailyTarget.initialStake || 10);

  // Self-heal: If trader has 0 consecutive losses and no loss to cover,
  // ensure stake is reset to baseStake (e.g. 10 or 12) instead of an old stuck 50
  useEffect(() => {
    if (
      dailyTarget.consecutiveLosses === 0 &&
      dailyTarget.coverAmountTracker === 0 &&
      dailyTarget.currentStake > 20 &&
      baseStake <= 20
    ) {
      updateDailyTarget({
        currentStake: baseStake,
        initialStake: baseStake,
        allocatedBalance: allocatedBudget,
        sessionStartBalance: sessionStartBal
      });
    }
  }, [dailyTarget.consecutiveLosses, dailyTarget.coverAmountTracker, dailyTarget.currentStake, baseStake, allocatedBudget, sessionStartBal, updateDailyTarget]);

  // Calculate progress percentage
  const currentProfit = balance - sessionStartBal;
  const daysProgressPct = Math.max(0, Math.min(100, (currentProfit / (targetProfitAmount || 1)) * 100)) || 0;

  // Approximate wins needed
  const payoutRate = (dailyTarget.payout || 85) / 100;
  const singleWinProfit = baseStake * payoutRate;
  const estimatedRemainingWins = Math.max(0, Math.ceil((targetProfitAmount - currentProfit) / (singleWinProfit || 1)));

  // Next loss prediction stake for trader awareness
  const nextLossPrediction = useMemo(() => {
    const simulatedCover = (dailyTarget.coverAmountTracker || 0) + (dailyTarget.currentStake || baseStake);
    const nextConsecutive = (dailyTarget.consecutiveLosses || 0) + 1;
    
    return calculateTargetRecoveryStake({
      cumulativeLoss: simulatedCover,
      baseStake,
      payout: dailyTarget.payout || 85,
      consecutiveLosses: nextConsecutive,
      allocatedBudget,
      strategyMode: dailyTarget.strategyMode || 'smart_recovery'
    });
  }, [dailyTarget, allocatedBudget, baseStake]);

  const handleApplyPlan = (plan: {
    mainBalance: number;
    targetPct: number;
    targetProfitAmount: number;
    allocatedBalance: number;
    payout: number;
    initialStake: number;
    strategyMode: 'smart_recovery' | 'fixed' | 'compound';
  }) => {
    const currentBal = balance > 0 ? balance : plan.mainBalance;
    updateDailyTarget({
      dayStartBalance: currentBal,
      sessionStartBalance: currentBal,
      allocatedBalance: plan.allocatedBalance,
      targetProfitAmount: plan.targetProfitAmount,
      dailyPct: plan.targetPct,
      payout: plan.payout,
      initialStake: plan.initialStake,
      currentStake: plan.initialStake,
      strategyMode: plan.strategyMode,
      consecutiveLosses: 0,
      coverAmountTracker: 0,
      targetHit: false,
      slHit: false,
      cooldownUntil: null
    });
    setShowSettingsModal(false);
  };

  return (
    <div className="flex flex-col pt-2 w-full z-10 px-3 pb-6 space-y-3 flex-1 overflow-y-auto">
      
      {/* Header Bar - Kept outside glass-panel so settings/reset are ALWAYS accessible */}
      <div className="flex items-center justify-between px-1 text-slate-800 dark:text-white">
        <div className="flex items-center gap-2 font-bold text-sm">
          <div className="bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg p-1.5">
            <Target className="w-4 h-4" />
          </div>
          <span>ডেইলি টার্গেট মুড</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-target-settings-btn"
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-600/20 text-xs font-bold transition active:scale-95 border border-purple-500/20 shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>সেটিংস ও প্ল্যানার</span>
          </button>
          <button
            id="reset-target-session-btn"
            onClick={() => {
              if (window.confirm("আপনি কি আজকের সেশন নতুন করে শুরু করতে চান?")) {
                startNewTargetSession();
              }
            }}
            title="সেশন রিসেট করুন"
            className="p-1.5 rounded-xl bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-[1.5rem] p-3.5 relative overflow-hidden flex flex-col">

        {/* Live Cooldown Top Banner */}
        {isCooldownActive && (
          <div className={`mb-3 p-2.5 rounded-xl border flex items-center justify-between text-xs transition shadow-sm ${
            dailyTarget.targetHit
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${dailyTarget.targetHit ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
                {dailyTarget.targetHit ? <Trophy className="w-4 h-4 animate-bounce" /> : <Clock className="w-4 h-4 animate-pulse" />}
              </div>
              <div className="min-w-0">
                <span className="font-bold block truncate">
                  {dailyTarget.targetHit ? '🎉 লক্ষ্য অর্জিত! ১০ মিনিট কুলডাউন চলছে' : '⚠️ পর পর লস বিরতি (কুলডাউন)'}
                </span>
                <span className="text-[10px] opacity-80 block truncate">
                  {dailyTarget.targetHit ? 'লোভ সংবরণ করুন ও লাভ সুরক্ষিত রাখুন' : 'মন শান্ত করুন ও অতিরিক্ত ট্রেড এড়িয়ে চলুন'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
              <span className="font-mono font-bold text-xs sm:text-sm bg-white/70 dark:bg-black/50 px-2.5 py-1 rounded-lg border border-emerald-500/20 shadow-inner">
                ⏱️ {enToBn(cdFormatted)}
              </span>
            </div>
          </div>
        )}

        {/* Active Plan Pill */}
        {dailyTarget.allocatedBalance ? (
          <div className="mb-3 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-semibold min-w-0">
              <Shield className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
              <span className="truncate">কাস্টম প্ল্যান: ${enToBn(dailyTarget.allocatedBalance)} বরাদ্দ দিয়ে +${enToBn(targetProfitAmount.toFixed(0))} লক্ষ্য</span>
            </div>
            <button 
              onClick={() => setShowSettingsModal(true)} 
              className="text-purple-600 dark:text-purple-400 font-bold hover:underline text-[10px] flex-shrink-0"
            >
              পরিবর্তন
            </button>
          </div>
        ) : null}

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center text-[11px] font-semibold mb-1">
             <span className="text-secondary flex items-center gap-1">
               সেশনের অগ্রগতি
               {currentProfit > 0 && <span className="text-emerald-500 font-bold">(+${enToBn(currentProfit.toFixed(2))})</span>}
             </span>
             <span className="text-purple-600 dark:text-purple-400 font-bold font-mono">
               {enToBn(daysProgressPct.toFixed(0))}%
             </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-black/40 h-2 rounded-full overflow-hidden border border-slate-300 dark:border-white/5">
             <div 
               className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" 
               style={{ width: `${daysProgressPct}%` }}
             />
          </div>
        </div>

        {/* 4 Stats Grid - Uniform, responsive and visually balanced */}
        <div className="grid grid-cols-2 gap-2 mb-3">
           <div className="inner-glass rounded-xl flex flex-col justify-between py-2 px-2.5 min-h-[66px] text-center border border-slate-200/50 dark:border-white/5 shadow-sm">
             <span className="text-secondary text-[10px] mb-0.5 tracking-wide leading-tight truncate">প্রধান একাউন্ট ব্যালেন্স</span>
             <span className="text-slate-900 dark:text-slate-50 font-bold text-base drop-shadow-sm font-mono truncate">
               ${enToBn((balance || 0).toFixed(2))}
             </span>
           </div>

           <div className="inner-glass rounded-xl flex flex-col justify-between py-2 px-2.5 min-h-[66px] text-center border border-slate-200/50 dark:border-white/5 shadow-sm">
             <span className="text-secondary text-[10px] mb-0.5 tracking-wide leading-tight truncate">টার্গেট লাভ ({enToBn(dailyTarget.dailyPct)}%)</span>
             <span className="text-[#059669] font-black text-base drop-shadow-sm font-mono truncate">
               +${enToBn((targetProfitAmount || 0).toFixed(2))}
             </span>
           </div>

           <div className="inner-glass rounded-xl flex flex-col justify-between py-2 px-2.5 min-h-[66px] text-center border border-slate-200/50 dark:border-white/5 shadow-sm">
             <span className="text-secondary text-[10px] mb-0.5 tracking-wide leading-tight truncate">
               {dailyTarget.allocatedBalance ? 'বরাদ্দ বাজেট (SL)' : 'স্টপ লস সীমা'}
             </span>
             <span className="text-[#ff4d4d] font-bold text-base drop-shadow-sm font-mono truncate">
               ${enToBn(allocatedBudget.toFixed(2))}
             </span>
           </div>

           <div className="inner-glass rounded-xl flex flex-col justify-between py-2 px-2.5 min-h-[66px] text-center border border-slate-200/50 dark:border-white/5 shadow-sm">
             <span className="text-secondary text-[10px] mb-0.5 tracking-wide leading-tight truncate">বর্তমান সেশন লাভ/ক্ষতি</span>
             <span className={`font-bold text-base drop-shadow-sm font-mono truncate ${currentProfit >= 0 ? 'text-[#059669]' : 'text-red-500'}`}>
               {currentProfit >= 0 ? '+' : ''}${enToBn(currentProfit.toFixed(2))}
             </span>
           </div>
        </div>

        {/* Next Trade Box & Live Recovery Guidance */}
        <div className="inner-glass rounded-[1.2rem] flex flex-col items-center justify-center p-3.5 mb-3 relative border border-purple-500/20 shadow-inner">
            
            {/* Top row with Title on Left, Badges on Right - No absolute overlap! */}
            <div className="w-full flex items-center justify-between mb-2 pb-2 border-b border-slate-200/60 dark:border-white/5 gap-2">
              <span className="text-secondary text-[10px] uppercase font-black tracking-wider truncate">
                {dailyTarget.consecutiveLosses > 0 ? 'স্মার্ট রিকভারি স্টেক' : 'পরবর্তী ট্রেড স্টেক'}
              </span>

              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {dailyTarget.coverAmountTracker > 0 ? (
                  <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">
                    ধাপ {enToBn((dailyTarget.consecutiveLosses || 0) + 1)} রিকভারি
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                    স্বাভাবিক ট্রেড
                  </span>
                )}
                <span className="text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 font-mono">
                  {enToBn(dailyTarget.payout || 85)}% পে-আউট
                </span>
              </div>
            </div>

            {/* Target Reached State inside Next Trade Card */}
            {dailyTarget.targetHit ? (
              <div className="py-3 text-center flex flex-col items-center w-full">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-2 border border-emerald-500/20 shadow-sm text-2xl">
                  🏆
                </div>
                <span className="text-lg font-black text-[#059669] mb-0.5">
                  টার্গেট সম্পন্ন! +${enToBn(targetProfitAmount.toFixed(2))}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mb-2">
                  অভিনন্দন! আজকের লক্ষ্যমাত্রা সফলভাবে অর্জিত হয়েছে।
                </p>
                {isCooldownActive && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-bold font-mono">
                      ১০ মি. প্রফিট কুলডাউন: {enToBn(cdFormatted)} বাকি
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Large Stake Display */}
                <div className="my-1 text-center">
                  <span className="text-purple-600 dark:text-purple-400 text-4xl sm:text-[2.75rem] leading-none font-black drop-shadow-md tracking-tighter font-mono">
                    ${enToBn((dailyTarget.currentStake || baseStake).toFixed(2))}
                  </span>
                </div>

                {/* Quick Base Stake Switcher when NOT in recovery */}
                {dailyTarget.consecutiveLosses === 0 && (
                  <div className="flex items-center gap-1.5 my-2 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold px-1">বেস স্টেক:</span>
                    <button
                      type="button"
                      onClick={() => updateDailyTarget({ initialStake: 10, currentStake: 10 })}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition font-mono ${
                        (dailyTarget.initialStake || 10) === 10
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white/40'
                      }`}
                    >
                      $১০
                    </button>
                    <button
                      type="button"
                      onClick={() => updateDailyTarget({ initialStake: 12, currentStake: 12 })}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition font-mono ${
                        (dailyTarget.initialStake || 10) === 12
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white/40'
                      }`}
                    >
                      $১২
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSettingsModal(true)}
                      className="px-2 py-0.5 rounded-lg text-[10px] text-slate-500 dark:text-slate-400 hover:text-purple-600 transition"
                    >
                      কাস্টম...
                    </button>
                  </div>
                )}

                {/* Dynamic Recovery Tip when trader has consecutive losses */}
                {dailyTarget.consecutiveLosses > 0 && (
                  <div className="my-1.5 py-1.5 px-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center max-w-sm">
                    <p className="text-[11px] text-purple-700 dark:text-purple-300 font-medium leading-relaxed">
                      পূর্বের লস <strong>${enToBn((dailyTarget.coverAmountTracker || 0).toFixed(2))}</strong> কভারের স্টেক। 
                      উইন হলেই স্টেক সাথে সাথে আবার বেস স্টেক <strong>${enToBn(baseStake)}</strong> এ ফিরে যাবে।
                    </p>
                  </div>
                )}

                {/* Projection Badges */}
                <div className="flex items-center gap-2 flex-wrap justify-center text-xs mt-1 w-full">
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#059669] font-bold text-[11px] flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 inline" />
                    <span>
                      {dailyTarget.consecutiveLosses > 0
                        ? `উইনে নেট লাভ: +$${enToBn(Math.max(0.5, ((dailyTarget.currentStake || baseStake) * payoutRate) - (dailyTarget.coverAmountTracker || 0)).toFixed(2))}`
                        : `উইনে লাভ: +$${enToBn(((dailyTarget.currentStake || baseStake) * payoutRate).toFixed(2))}`
                      }
                    </span>
                  </div>

                  {dailyTarget.strategyMode !== 'fixed' && (
                    <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 text-[11px] font-medium shadow-sm">
                      লস হলে পরবর্তী স্টেক: <strong className="text-purple-600 dark:text-purple-400 font-mono">${enToBn(nextLossPrediction.toFixed(2))}</strong>
                    </div>
                  )}
                </div>
              </>
            )}
        </div>

        {/* Actions: WIN / LOSS Buttons or Target Done Actions */}
        <div className="mt-auto mb-1">
          {dailyTarget.targetHit ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="py-3 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Settings className="w-4 h-4" />
                <span>নতুন টার্গেট ও বাজেট</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("আপনি কি নতুন টার্গেট নিয়ে আরেকটি সেশন শুরু করতে চান?")) {
                    startNewTargetSession();
                  }
                }}
                className="py-3 px-3 rounded-xl bg-[#059669] hover:bg-[#059669]/90 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>নতুন সেশন শুরু</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button 
                id="target-trade-win-btn"
                onClick={() => handleTrade(true)}
                disabled={dailyTarget.targetHit || dailyTarget.slHit || isCooldownActive}
                className="bg-[#059669] hover:bg-[#059669]/90 text-white rounded-xl py-3.5 font-black text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale shadow-[0_0_15px_rgba(16,185,129,0.25)] active:scale-95"
              >
                 WIN
              </button>
              <button 
                id="target-trade-loss-btn"
                onClick={() => handleTrade(false)}
                disabled={dailyTarget.targetHit || dailyTarget.slHit || isCooldownActive}
                className="bg-[#ff4d4d] hover:bg-[#ff4d4d]/90 text-white rounded-xl py-3.5 font-black text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale shadow-[0_0_15px_rgba(255,77,77,0.25)] active:scale-95"
              >
                LOSS
              </button>
            </div>
          )}
        </div>

        {/* Overlays */}

        {/* 1. Loss Cooldown Alert Overlay (Only if not target hit) */}
        {isCooldownActive && !dailyTarget.targetHit && !dailyTarget.slHit && (
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4">
             <div className="bg-white dark:bg-[#0b121e] p-6 rounded-2xl border border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.25)] flex flex-col items-center text-center w-full max-w-sm">
                <span className="text-4xl mb-3">⚠️</span>
                <span className="text-lg font-bold text-red-500 mb-2">সতর্কতা! কুলডাউন সক্রিয়</span>
                <span className="text-slate-700 dark:text-slate-300 text-xs mb-3 leading-relaxed">
                   আপনার পর পর লস হয়েছে। ইমোশনাল হয়ে তাড়াহুড়ো করে ওভারট্রেড করবেন না। একটু বিরতি নিন এবং মাথা ঠান্ডা করুন।
                </span>
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-center mb-3">
                  <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                    ⏱️ অবশিষ্ট সময়: {enToBn(cdFormatted)}
                  </span>
                </div>
                <button 
                  onClick={() => updateDailyTarget({ cooldownUntil: null })} 
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                >
                  আমি এখন শান্ত, ট্রেড শুরু করতে চাই
                </button>
             </div>
           </div>
        )}

        {/* 2. Target Hit Celebration & 10-Minute Cooldown Modal */}
        {dailyTarget.targetHit && (
           <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4">
             <div className="bg-white dark:bg-[#0c1424] p-5 sm:p-6 rounded-3xl border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col items-center text-center w-full max-w-sm relative animate-in fade-in zoom-in-95 duration-200">
                
                {/* Close X */}
                <button
                  onClick={() => updateDailyTarget({ targetHit: false })}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition"
                  title="বন্ধ করুন"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Celebration Header Icon */}
                <div className="relative mb-3">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-purple-500/20 to-amber-500/20 flex items-center justify-center border border-emerald-500/30 shadow-lg text-3xl">
                    🏆
                  </div>
                  <span className="absolute -top-1 -right-1 text-lg">✨</span>
                  <span className="absolute -bottom-1 -left-1 text-lg">🎉</span>
                </div>

                {/* Badge */}
                <div className="mb-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>আলহামদুলিল্লাহ! দৈনিক টার্গেট অর্জিত</span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1.5">
                  অভিনন্দন {profile?.name || 'ট্রেডার'}!
                </h3>

                <p className="text-slate-600 dark:text-slate-300 text-xs mb-3.5 leading-relaxed">
                  আপনি চমৎকার শৃঙ্খলা ও নিখুঁত মানি ম্যানেজমেন্ট অনুসরণ করে আজকের লক্ষ্য সফলভাবে সম্পন্ন করেছেন!
                </p>

                {/* Target Recap Stats */}
                <div className="grid grid-cols-2 gap-2 w-full mb-3.5">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-2xl">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold mb-0.5">অর্জিত লাভ</span>
                    <span className="text-base font-black text-[#059669] font-mono">+${enToBn(targetProfitAmount.toFixed(2))}</span>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-2xl">
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 block font-semibold mb-0.5">বর্তমান ব্যালেন্স</span>
                    <span className="text-base font-black text-purple-600 dark:text-purple-400 font-mono">${enToBn(balance.toFixed(2))}</span>
                  </div>
                </div>

                {/* 10-Minute Cooldown & Greed Prevention Box */}
                <div className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl p-3 mb-4 text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      ১০ মিনিটের প্রফিট সুরক্ষা বিরতি
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      {enToBn(cdFormatted)} বাকি
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    🧠 <strong>ট্রেডার নিয়ম:</strong> টার্গেট পূরণের পর অতিরিক্ত আত্মবিশ্বাসে ওভারট্রেড করলেই অর্জিত প্রফিট হারিয়ে যায়। ১০ মিনিট স্ক্রিন থেকে চোখ সরিয়ে একটু রিল্যাক্স করুন।
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={() => updateDailyTarget({ targetHit: false })}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    <span>প্রফিট সেভ করে বিরতি নিলাম (১০ মি. কুলডাউন)</span>
                  </button>

                  <button
                    id="set-new-target-win-overlay-btn"
                    onClick={() => {
                      updateDailyTarget({ targetHit: false });
                      setShowSettingsModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>নতুন টার্গেট ও পরবর্তী সেশন নির্ধারণ করুন</span>
                  </button>
                </div>
             </div>
           </div>
        )}

        {/* 3. Stop Loss Hit Modal */}
        {dailyTarget.slHit && (
           <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4">
             <div className="bg-white dark:bg-[#0b121e] p-6 rounded-3xl border border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.25)] flex flex-col items-center text-center w-full max-w-sm relative">
                <button
                  onClick={() => updateDailyTarget({ slHit: false })}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
                  title="বন্ধ করুন"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="text-4xl mb-2">🛑</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white mb-2">স্টপ লস সীমা পৌঁছেছে!</span>
                <span className="text-slate-600 dark:text-slate-300 text-xs mb-4 leading-relaxed">
                  আপনার এই সেশনের বরাদ্দকৃত ${enToBn(allocatedBudget.toFixed(0))} বাজেট ব্যবহৃত হয়েছে। মূল একাউন্টের বাকি ব্যালেন্স সুরক্ষিত আছে। আপনি নতুন বাজেট ও টার্গেট সেট করে পুনরায় শুরু করতে পারেন।
                </span>
                <div className="flex flex-col gap-2 w-full">
                  <button
                    id="set-new-target-sl-overlay-btn"
                    onClick={() => setShowSettingsModal(true)}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    নতুন টার্গেট ও বাজেট সেট করুন
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("আপনি কি স্টপ লস রিসেট করে নতুন সেশন নিতে চান?")) {
                        startNewTargetSession();
                      }
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs transition"
                  >
                    আগের সেটিংসে রিস্টার্ট করুন
                  </button>
                </div>
             </div>
           </div>
        )}

      </div>

      {/* Target Mode Settings & Trade Planner Modal */}
      <TargetSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentBalance={balance}
        currentDailyPct={dailyTarget.dailyPct}
        currentPayout={dailyTarget.payout}
        currentAllocated={dailyTarget.allocatedBalance}
        currentTargetProfit={dailyTarget.targetProfitAmount}
        currentInitialStake={dailyTarget.initialStake}
        currentStrategy={dailyTarget.strategyMode}
        onApplyPlan={handleApplyPlan}
      />

      <LossReasonModal 
        isOpen={showLossModal} 
        onSubmit={handleLossSubmit} 
        onClose={() => setShowLossModal(false)} 
      />
    </div>
  );
}
