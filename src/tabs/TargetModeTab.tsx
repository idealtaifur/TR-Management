import { useEffect, useState } from "react";
import { LossReason, useStore } from "../store/useStore";
import { enToBn } from "../utils";
import { LossReasonModal } from "../components/LossReasonModal";

export function TargetModeTab() {
  const { balance, dailyTarget, recordTrade, resetDailySession, updateDailyTarget, profile } = useStore();
  const [showLossModal, setShowLossModal] = useState(false);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const intv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intv);
  }, []);

  const cooldownTime = dailyTarget.cooldownUntil ? new Date(dailyTarget.cooldownUntil).getTime() : 0;
  const isCooldownActive = cooldownTime > now;

  const handleTrade = (isWin: boolean) => {
    if (dailyTarget.targetHit || dailyTarget.slHit || isCooldownActive) return;
    
    if (!isWin) {
      setShowLossModal(true);
      return;
    }
    
    recordTrade(true, dailyTarget.currentStake * (dailyTarget.payout / 100));
  };

  const handleLossSubmit = (reason: LossReason) => {
    recordTrade(false, 0, reason);
    setShowLossModal(false);
  };

  const targetPct = dailyTarget.dailyPct / 100;
  const startBal = dailyTarget.dayStartBalance;
  const targetProfitAmount = startBal * targetPct;
  const targetAmount = startBal + targetProfitAmount;
  
  const currentSlLimit = startBal * (1 - dailyTarget.slPct / 100);
  
  // Calculate progress percentage
  const currentProfit = balance - startBal;
  const daysProgressPct = Math.max(0, Math.min(100, (currentProfit / targetProfitAmount) * 100)) || 0;

  return (
    <div className="flex flex-col pt-2 w-full z-10 px-3 pb-6 space-y-3 flex-1">
      
      <div className="flex-1 glass-panel rounded-[1.5rem] p-3 relative overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 text-slate-800 dark:text-white font-bold text-sm">
          <div className="bg-slate-100 dark:bg-white rounded p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          ডেইলি টার্গেট মুড
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between items-center text-[11px] font-semibold mb-1">
             <span className="text-secondary">দিনের অগ্রগতি</span>
             <span className="text-[#a855f7]">{enToBn(daysProgressPct.toFixed(0))}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-black/40 h-1.5 rounded-full overflow-hidden border border-slate-300 dark:border-white/5">
             <div className="h-full bg-gradient-to-r from-[#a855f7] to-[#7e22ce] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" style={{ width: `${daysProgressPct}%` }}></div>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
           <div className="inner-glass rounded-xl flex flex-col items-center justify-center py-2.5">
             <span className="text-secondary text-[10px] mb-0.5 tracking-wide">বর্তমান ব্যালেন্স</span>
             <span className="text-slate-900 dark:text-slate-50 font-bold text-base drop-shadow-sm">${enToBn((balance || 0).toFixed(2))}</span>
           </div>
           <div className="inner-glass rounded-xl flex flex-col items-center justify-center py-2.5">
             <span className="text-secondary text-[10px] mb-0.5 tracking-wide">টার্গেট ব্যালেন্স</span>
             <span className="text-[#059669] font-black text-base drop-shadow-sm">${enToBn((targetAmount || 0).toFixed(2))}</span>
           </div>
           <div className="inner-glass rounded-xl flex flex-col items-center justify-center py-2.5">
             <span className="text-secondary text-[10px] mb-0.5 tracking-wide">স্টপ লস</span>
             <span className="text-[#ff4d4d] font-bold text-base drop-shadow-sm">${enToBn((currentSlLimit || 0).toFixed(2))}</span>
           </div>
           <div className="inner-glass rounded-xl flex flex-col items-center justify-center py-2.5">
             <span className="text-secondary text-[10px] mb-0.5 tracking-wide">লস স্ট্রিক</span>
             <span className="text-[#facc15] font-bold text-base drop-shadow-sm">{enToBn(dailyTarget.consecutiveLosses || 0)}</span>
           </div>
        </div>

        {/* Next Trade Box */}
        <div className="inner-glass rounded-[1.2rem] flex flex-col items-center justify-center py-6 mb-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1.5">
               <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded text-center border border-blue-500/20">কভার: ${enToBn((dailyTarget.coverAmountTracker || 0).toFixed(2))}</span>
            </div>
            <span className="text-secondary text-[10px] uppercase font-black tracking-[0.2em] mb-1.5 mt-1">পরবর্তী স্টেক</span>
            <span className="text-[#a855f7] dark:text-[#c084fc] text-[2.75rem] leading-none font-bold mb-1.5 drop-shadow-md tracking-tighter">${enToBn((dailyTarget.currentStake || 1).toFixed(2))}</span>
            <span className="text-[#059669]/90 text-[11px] font-bold tracking-wide">উইনে: +${enToBn(((dailyTarget.currentStake || 1) * ((dailyTarget.payout || 85) / 100)).toFixed(2))}</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-auto mb-2">
          <button 
            onClick={() => handleTrade(true)}
            disabled={dailyTarget.targetHit || dailyTarget.slHit || isCooldownActive}
            className="bg-[#059669] hover:bg-[#059669]/90 text-slate-900 rounded-xl py-3 font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95"
          >
             WIN
          </button>
          <button 
            onClick={() => handleTrade(false)}
            disabled={dailyTarget.targetHit || dailyTarget.slHit || isCooldownActive}
            className="bg-[#ff4d4d] hover:bg-[#ff4d4d]/90 text-white rounded-xl py-3 font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale shadow-[0_0_15px_rgba(255,77,77,0.2)] active:scale-95"
          >
            LOSS
          </button>
        </div>

        {/* Overlays */}
        {isCooldownActive && !dailyTarget.targetHit && !dailyTarget.slHit && (
           <div className="absolute inset-0 bg-slate-100/90 dark:bg-[#0b1621]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4">
             <div className="bg-white dark:bg-[#0b121e]/90 dark:backdrop-blur-xl p-6 rounded-2xl border border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)] flex flex-col items-center text-center w-full">
                <span className="text-4xl mb-4">⚠️</span>
                <span className="text-xl font-bold text-red-500 mb-2">সতর্কতা!</span>
                <span className="text-slate-800 dark:text-slate-300 text-sm mb-4 leading-relaxed">
                   আপনার পর পর ২টা লস হয়েছে। ইমোশনাল হয়ে ওভারট্রেড করবেন না। একটু বিরতি নিন এবং মার্কেট অ্যানালাইসিস করুন।
                </span>
                <button onClick={() => updateDailyTarget({ cooldownUntil: null })} className="text-xs text-slate-400 hover:text-slate-500 underline mt-2">আমি এখন শান্ত, ট্রেড শুরু করতে চাই</button>
             </div>
           </div>
        )}

        {dailyTarget.targetHit && (
           <div className="absolute inset-0 bg-slate-100/80 dark:bg-[#0b1621]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-3">
             <div className="bg-white dark:bg-[#0b121e]/90 dark:backdrop-blur-xl p-6 rounded-2xl border border-[#059669]/30 shadow-[0_0_40px_rgba(16,185,129,0.2)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)] flex flex-col items-center text-center w-full">
                <span className="text-3xl font-bold text-[#059669] mb-2">🎉</span>
                <span className="text-lg font-bold text-slate-800 dark:text-white mb-2">টার্গেট পূরণ!</span>
                <span className="text-secondary text-xs mb-4">লভ্যাংশ বাঁচিয়ে রাখুন। অ্যাপ ২৪ ঘণ্টা পর খুলবে (লোভ থেকে বাঁচাতে)।</span>
             </div>
           </div>
        )}

        {dailyTarget.slHit && (
           <div className="absolute inset-0 bg-slate-100/80 dark:bg-[#0b1621]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-3">
             <div className="bg-white dark:bg-[#0b121e]/90 dark:backdrop-blur-xl p-6 rounded-2xl border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)] flex flex-col items-center text-center w-full">
                <span className="text-3xl font-bold text-red-500 mb-2">🛑</span>
                <span className="text-lg font-bold text-slate-800 dark:text-white mb-2">স্টপ লস হিট!</span>
                <span className="text-secondary text-xs mb-4">আজকের জন্য ট্রেডিং বন্ধ রাখুন। অ্যাপ ২৪ ঘণ্টা পর খুলবে।</span>
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
