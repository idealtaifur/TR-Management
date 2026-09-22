import { useState, useMemo } from 'react';
import { enToBn, calculateTargetRecoveryStake } from '../utils';
import { Target, Shield, DollarSign, Percent, TrendingUp, HelpCircle, Check, X, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';

interface TargetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  currentDailyPct: number;
  currentPayout: number;
  currentAllocated?: number;
  currentTargetProfit?: number;
  currentInitialStake?: number;
  currentStrategy?: 'smart_recovery' | 'fixed' | 'compound';
  onApplyPlan: (plan: {
    mainBalance: number;
    targetPct: number;
    targetProfitAmount: number;
    allocatedBalance: number;
    payout: number;
    initialStake: number;
    strategyMode: 'smart_recovery' | 'fixed' | 'compound';
  }) => void;
}

export function TargetSettingsModal({
  isOpen,
  onClose,
  currentBalance,
  currentDailyPct,
  currentPayout,
  currentAllocated,
  currentTargetProfit,
  currentInitialStake,
  currentStrategy = 'smart_recovery',
  onApplyPlan
}: TargetSettingsModalProps) {
  // Main balance (user can use current wallet or custom reference)
  const [mainBalance, setMainBalance] = useState<number>(currentBalance > 0 ? currentBalance : 1000);
  // Target profit percentage from main balance
  const [targetPct, setTargetPct] = useState<number>(currentDailyPct || 10);
  // Allocated trading capital for this session (e.g. 200 out of 1000)
  const [allocatedBalance, setAllocatedBalance] = useState<number>(currentAllocated || 200);
  // Payout rate
  const [payout, setPayout] = useState<number>(currentPayout || 85);
  // Strategy
  const [strategyMode, setStrategyMode] = useState<'smart_recovery' | 'fixed' | 'compound'>(currentStrategy);
  // Custom initial stake (percentage of allocated or direct dollar)
  const defaultInitialStake = useMemo(() => {
    return Math.max(1, Number(((allocatedBalance || 200) * 0.05).toFixed(2)));
  }, [allocatedBalance]);
  const [initialStake, setInitialStake] = useState<number>(currentInitialStake || defaultInitialStake);

  // Synchronize initial stake if allocated changes and user hasn't explicitly customized
  const targetProfitAmount = useMemo(() => {
    return Number(((mainBalance * targetPct) / 100).toFixed(2));
  }, [mainBalance, targetPct]);

  // Generate step-by-step trade roadmap based on allocated budget & payout
  const tradeRoadmap = useMemo(() => {
    const payoutRate = (payout || 85) / 100;
    const base = Math.max(1, initialStake || 1);
    const steps: Array<{
      step: number;
      stake: number;
      winProfit: number;
      cumulativeLoss: number;
      isMaxRisk?: boolean;
    }> = [];

    let cumLoss = 0;
    let budget = allocatedBalance || 200;

    for (let i = 1; i <= 8; i++) {
      let stake = 0;
      if (i === 1) {
        stake = base;
      } else {
        if (strategyMode === 'fixed') {
          stake = base;
        } else {
          stake = calculateTargetRecoveryStake({
            cumulativeLoss: cumLoss,
            baseStake: base,
            payout,
            consecutiveLosses: i - 1,
            allocatedBudget: budget,
            strategyMode
          });
        }
      }

      if (cumLoss + stake > budget && i > 1) {
        // Last possible recovery step capped at remaining budget
        const remaining = Math.max(1, Number((budget - cumLoss).toFixed(2)));
        if (remaining >= 1) {
          const winProf = Number((remaining * payoutRate - cumLoss).toFixed(2));
          steps.push({
            step: i,
            stake: remaining,
            winProfit: winProf,
            cumulativeLoss: budget,
            isMaxRisk: true
          });
        }
        break;
      }

      const winProf = Number((stake * payoutRate - cumLoss).toFixed(2));
      cumLoss = Number((cumLoss + stake).toFixed(2));

      steps.push({
        step: i,
        stake,
        winProfit: winProf,
        cumulativeLoss: cumLoss,
        isMaxRisk: cumLoss >= budget * 0.85
      });

      if (cumLoss >= budget) break;
    }

    // Number of standard wins needed to achieve total target profit
    const avgWinProfit = base * payoutRate;
    const estimatedWinsNeeded = Math.ceil(targetProfitAmount / (avgWinProfit || 1));

    return {
      steps,
      estimatedWinsNeeded,
      avgWinProfit: Number(avgWinProfit.toFixed(2))
    };
  }, [mainBalance, targetProfitAmount, allocatedBalance, payout, initialStake, strategyMode]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyPlan({
      mainBalance,
      targetPct,
      targetProfitAmount,
      allocatedBalance,
      payout,
      initialStake: Math.max(1, initialStake),
      strategyMode
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-y-auto">
      <div 
        id="target-settings-modal"
        className="w-full sm:max-w-xl bg-white dark:bg-[#0c1322] border-t sm:border border-slate-200 dark:border-white/10 rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                টার্গেট মোড সেটিংস ও ট্রেড প্ল্যানার
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                বরাদ্দকৃত মূলধন দিয়ে নির্দিষ্ট টার্গেট অর্জনের স্মার্ট প্ল্যান
              </p>
            </div>
          </div>
          <button 
            id="close-target-settings-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Preset Helper Pill */}
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs flex items-start gap-2.5">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-purple-500" />
            <div className="leading-relaxed">
              <strong>স্মার্ট মানি প্রটেকশন:</strong> প্রধান একাউন্টের সম্পূর্ণ ব্যালেন্স রিস্কে পড়বে না। আপনি যে পরিমাণ মূলধন বরাদ্দ করবেন (যেমন: $২০০), শুধুমাত্র সেটি দিয়েই প্রধান একাউন্টের টার্গেট লাভ ($১০০) করার রোডম্যাপ তৈরি হবে।
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Main Account Balance */}
            <div className="bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200 dark:border-white/5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                প্রধান একাউন্ট ব্যালেন্স ($)
              </label>
              <input
                id="input-main-balance"
                type="number"
                min="10"
                value={mainBalance || ''}
                onChange={(e) => setMainBalance(Number(e.target.value))}
                className="w-full bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-base font-bold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">আপনার মূল একাউন্টের আকার</span>
            </div>

            {/* Target Profit % */}
            <div className="bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200 dark:border-white/5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-500" />
                টার্গেট লাভের শতাংশ (%)
              </label>
              <div className="flex gap-2">
                <input
                  id="input-target-pct"
                  type="number"
                  min="1"
                  max="100"
                  value={targetPct || ''}
                  onChange={(e) => setTargetPct(Number(e.target.value))}
                  className="w-full bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-base font-bold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
              <div className="flex gap-1.5 mt-2">
                {[5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTargetPct(pct)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                      targetPct === pct
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Allocated Trading Capital */}
            <div className="bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200 dark:border-white/5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-500" />
                ট্রেডের জন্য বরাদ্দকৃত মূলধন ($)
              </label>
              <input
                id="input-allocated-balance"
                type="number"
                min="10"
                max={mainBalance || 10000}
                value={allocatedBalance || ''}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAllocatedBalance(val);
                  setInitialStake(Math.max(1, Number((val * 0.05).toFixed(2))));
                }}
                className="w-full bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-base font-bold text-purple-600 dark:text-purple-400 focus:outline-none focus:border-purple-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                এই সেশনের জন্য সর্বোচ্চ বাজেট ও স্টপ লস
              </span>
            </div>

            {/* Broker Payout % */}
            <div className="bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200 dark:border-white/5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
                ব্রোকার পে-আউট রেট (%)
              </label>
              <input
                id="input-payout-rate"
                type="number"
                min="50"
                max="100"
                value={payout || ''}
                onChange={(e) => setPayout(Number(e.target.value))}
                className="w-full bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-base font-bold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 font-mono"
              />
              <div className="flex gap-1.5 mt-2">
                {[80, 85, 90, 92].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPayout(p)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                      payout === p
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Strategy Mode Selection */}
          <div className="bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200 dark:border-white/5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
              ট্রেড এক্সিকিউশন ও মানি ম্যানেজমেন্ট মেথড
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStrategyMode('smart_recovery')}
                className={`p-3 rounded-xl text-left border transition flex flex-col gap-1 ${
                  strategyMode === 'smart_recovery'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">স্মার্ট স্টেপ রিকভারি</span>
                  {strategyMode === 'smart_recovery' && <Check className="w-3.5 h-3.5 text-purple-500" />}
                </div>
                <span className="text-[10px] leading-tight opacity-80">
                  লস হলে পূর্বের লস কভার করে প্রফিট করার জন্য সুনির্দিষ্ট স্টেক হিসাব
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStrategyMode('fixed')}
                className={`p-3 rounded-xl text-left border transition flex flex-col gap-1 ${
                  strategyMode === 'fixed'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">ফিক্সড কনজারভেটিভ</span>
                  {strategyMode === 'fixed' && <Check className="w-3.5 h-3.5 text-purple-500" />}
                </div>
                <span className="text-[10px] leading-tight opacity-80">
                  প্রতি ট্রেডে নির্দিষ্ট স্থির স্টেক, লস হলেও স্টেক পরিবর্তন হবে না
                </span>
              </button>
            </div>

            {/* Safety Step Presets */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  ট্রেড সেফটি কুশন (কতটি ট্রেড ব্যাকআপ চান?)
                </label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  tradeRoadmap.steps.length >= 5
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {enToBn(tradeRoadmap.steps.length)}টি ট্রেড ব্যাকআপ
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setInitialStake(Math.max(1, Math.round(allocatedBalance * 0.03)))}
                  className={`py-2 px-1 rounded-xl border text-center transition flex flex-col items-center justify-center min-w-0 ${
                    initialStake === Math.max(1, Math.round(allocatedBalance * 0.03))
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-[11px] font-bold leading-tight truncate w-full">৬টি কুশন</span>
                  <span className="text-[10px] opacity-80 font-mono mt-0.5 truncate">${enToBn(Math.max(1, Math.round(allocatedBalance * 0.03)))}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInitialStake(Math.max(1, Math.round(allocatedBalance * 0.05)))}
                  className={`py-2 px-1 rounded-xl border text-center transition flex flex-col items-center justify-center min-w-0 ${
                    initialStake === Math.max(1, Math.round(allocatedBalance * 0.05))
                      ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold'
                      : 'border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-[11px] font-bold leading-tight truncate w-full">৫টি কুশন</span>
                  <span className="text-[10px] opacity-80 font-mono mt-0.5 truncate">${enToBn(Math.max(1, Math.round(allocatedBalance * 0.05)))}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInitialStake(Math.max(1, Math.round(allocatedBalance * 0.015)))}
                  className={`py-2 px-1 rounded-xl border text-center transition flex flex-col items-center justify-center min-w-0 ${
                    initialStake === Math.max(1, Math.round(allocatedBalance * 0.015))
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                      : 'border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-[11px] font-bold leading-tight truncate w-full">৭+ কুশন</span>
                  <span className="text-[10px] opacity-80 font-mono mt-0.5 truncate">${enToBn(Math.max(1, Math.round(allocatedBalance * 0.015)))}</span>
                </button>
              </div>
            </div>

            {/* Custom Initial Stake Slider/Input */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  কাস্টম শুরুর স্টেক (Initial Trade Stake)
                </span>
                <span className="text-[10px] text-slate-400">
                  বরাদ্দকৃত ${enToBn(allocatedBalance)} এর {((initialStake / (allocatedBalance || 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={allocatedBalance || 100}
                  value={initialStake || ''}
                  onChange={(e) => setInitialStake(Number(e.target.value))}
                  className="w-24 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-right font-bold text-sm text-slate-800 dark:text-white font-mono"
                />
                <span className="text-xs font-bold text-slate-500">$</span>
              </div>
            </div>
          </div>

          {/* Generated Plan Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                আপনার স্বয়ংক্রিয় ট্রেড প্ল্যান
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                টার্গেট: +${enToBn(targetProfitAmount.toFixed(2))}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1 text-center">
              <div className="bg-white/60 dark:bg-black/30 p-2 rounded-xl">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">মেইন একাউন্ট</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white font-mono">${enToBn(mainBalance.toFixed(0))}</span>
              </div>
              <div className="bg-white/60 dark:bg-black/30 p-2 rounded-xl">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">বরাদ্দকৃত ক্যাপিটাল</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400 font-mono">${enToBn(allocatedBalance.toFixed(0))}</span>
              </div>
              <div className="bg-white/60 dark:bg-black/30 p-2 rounded-xl">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">উইন দরকার (~গড়)</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">~{enToBn(tradeRoadmap.estimatedWinsNeeded)}টি</span>
              </div>
            </div>

            {/* Step-by-Step Recovery Roadmap Preview */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span>ধারাবাহিক লস হলে পরবর্তী পদক্ষেপ (Roadmap):</span>
                <span className="text-[10px] text-slate-400">সর্বোচ্চ বাজেট: ${enToBn(allocatedBalance)}</span>
              </div>
              <div className="space-y-1 text-xs">
                {tradeRoadmap.steps.map((st) => (
                  <div
                    key={st.step}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/70 dark:bg-black/20 border border-slate-200/50 dark:border-white/5 font-mono text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold flex items-center justify-center text-[10px]">
                        {st.step}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">
                        ট্রেড স্টেক: <strong className="text-slate-900 dark:text-white">${enToBn(st.stake.toFixed(st.stake % 1 === 0 ? 0 : 2))}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        উইনে নেট লাভ: +${enToBn(st.winProfit.toFixed(2))}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        (পুঞ্জীভূত লস: ${enToBn(st.cumulativeLoss.toFixed(2))})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition"
          >
            বাতিল করুন
          </button>
          <button
            id="apply-target-plan-btn"
            type="button"
            onClick={handleApply}
            className="flex-[2] py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            প্ল্যান সক্রিয় করুন ও ট্রেড শুরু করুন
          </button>
        </div>
      </div>
    </div>
  );
}
