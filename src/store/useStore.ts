import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateTargetRecoveryStake } from '../utils';

export type Mood = '😊 ভালো' | '🧘 শান্ত' | '🎯 ফোকাসড' | '😰 চাপে' | '😔 হতাশ';

export interface JournalEntry {
  id: string;
  date: string;
  mood: Mood;
  note: string;
}

export type LossReason = 'তাড়াহুড়া করে ট্রেড' | 'ট্রেন্ডের বিপরীতে ট্রেড' | 'ইমোশনাল ট্রেড' | 'FOMO' | 'মার্কেট খারাপ' | 'এনালাইসিস করিনি' | 'অন্যান্য';

export interface Trade {
  id: string;
  type: 'WIN' | 'LOSS';
  amount: number;
  date: string;
  isMasaniello: boolean;
  lossReason?: LossReason;
}

interface State {
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  balance: number;
  updateBalance: (amount: number) => void;
  setBalance: (amount: number) => void;
  
  // Profile
  profile: {
    uid: string | null;
    name: string;
    email: string;
    phone: string;
    avatar: string | null;
    gender: string;
    age: string;
    address: string;
    experienceMonths: string;
    experienceYears: string;
    timezone: string;
    startingBalance: number;
    dailyProfitTarget: number;
    targetDays: number;
    preferredStrategy: 'masaniello' | 'target';
    isSetupComplete: boolean;
    status: 'pending' | 'approved' | 'rejected';
    role?: string;
  };
  updateProfile: (profile: Partial<State['profile']>) => void;

  dailyTarget: {
    dailyPct: number;
    slPct: number;
    totalDays: number;
    dayNum: number;
    currentStake: number;
    consecutiveLosses: number;
    coverAmountTracker: number;
    lastTradeDate: string | null;
    targetHit: boolean;
    slHit: boolean;
    payout: number;
    dayStartBalance: number;
    cooldownUntil?: string | null;
    resetCount: number;
    blockedUntil: string | null;
    allocatedBalance?: number;
    targetProfitAmount?: number;
    initialStake?: number;
    strategyMode?: 'smart_recovery' | 'fixed' | 'compound';
    sessionStartBalance?: number;
  };
  updateDailyTarget: (data: Partial<State['dailyTarget']>) => void;
  resetDailySession: () => void;
  startNewTargetSession: (newAllocatedBalance?: number, newDailyPct?: number, newInitialStake?: number) => void;
  resetToFreshStart: (newBalance: number) => void;
  resetTradingData: () => void;
  clearAllData: () => void;
  restartJourney: () => void;
  adjustBalance: (amount: number, type: 'deposit' | 'withdraw') => void;
  recordTrade: (isWin: boolean, profitAmount: number, lossReason?: LossReason) => void;

  // Masaniello
  masaniello: {
    events: number;
    winsNeeded: number;
    payout: number;
    currentWins: number;
    currentEvents: number;
    isFinished: boolean;
    sessionStartBalance: number;
    targetProfitPct?: number;
    targetProfitAmount?: number;
    capitalRatio?: number;
    cooldownUntil: string | null;
    consecutiveLosses: number;
    isConfigured?: boolean;
  };
  updateMasaniello: (data: Partial<State['masaniello']>) => void;

  // Journal
  journals: JournalEntry[];
  addJournal: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  deleteJournal: (id: string) => void;

  // Trades
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'date'>) => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      balance: 228.35,
      updateBalance: (amount) => set((state) => ({ balance: state.balance + amount })),
      setBalance: (amount) => set(() => ({ balance: amount })),

      profile: { 
        uid: null,
        name: '',
        email: '',
        phone: '',
        avatar: null, 
        gender: '', 
        age: '', 
        address: '', 
        experienceMonths: '0', 
        experienceYears: '0', 
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, 
        startingBalance: 0, 
        dailyProfitTarget: 5, 
        targetDays: 30, 
        preferredStrategy: 'target',
        isSetupComplete: false,
        status: 'pending'
      },
      updateProfile: (data) => set((state) => ({ profile: { ...state.profile, ...data } })),

      dailyTarget: {
        dailyPct: 10,
        slPct: 20,
        totalDays: 30,
        dayNum: 1,
        currentStake: 10,
        consecutiveLosses: 0,
        coverAmountTracker: 0,
        lastTradeDate: null,
        targetHit: false,
        slHit: false,
        payout: 85,
        dayStartBalance: 1000,
        sessionStartBalance: 1000,
        resetCount: 0,
        blockedUntil: null,
        allocatedBalance: 200,
        initialStake: 10,
        targetProfitAmount: 100,
        strategyMode: 'smart_recovery',
      },
      updateDailyTarget: (data) => set((state) => ({ dailyTarget: { ...state.dailyTarget, ...data } })),
      startNewTargetSession: (newAllocatedBalance?: number, newDailyPct?: number, newInitialStake?: number) => {
        const state = get();
        const { balance, dailyTarget } = state;
        
        const currentBal = balance > 0 ? balance : 1000;
        const allocated = newAllocatedBalance || dailyTarget.allocatedBalance || 200;
        const pct = newDailyPct || dailyTarget.dailyPct || 10;
        const targetProfitAmount = (currentBal * pct) / 100;
        const baseStake = newInitialStake || dailyTarget.initialStake || Math.max(1, Math.round(allocated * 0.05)) || 10;

        set((state) => ({
          dailyTarget: {
            ...state.dailyTarget,
            allocatedBalance: allocated,
            dailyPct: pct,
            targetProfitAmount: Number(targetProfitAmount.toFixed(2)),
            initialStake: baseStake,
            currentStake: baseStake,
            consecutiveLosses: 0,
            coverAmountTracker: 0,
            targetHit: false,
            slHit: false,
            dayStartBalance: Number(currentBal.toFixed(2)),
            sessionStartBalance: Number(currentBal.toFixed(2)),
            lastTradeDate: new Date().toISOString(),
            resetCount: 0,
            blockedUntil: null,
            cooldownUntil: null
          }
        }));
      },
      resetDailySession: () => {
        const { balance, dailyTarget } = get();
        set((state) => ({
          dailyTarget: {
            ...state.dailyTarget,
            currentStake: Number(Math.max(1, balance * 0.01).toFixed(2)),
            consecutiveLosses: 0,
            coverAmountTracker: 0,
            targetHit: false,
            slHit: false,
            dayStartBalance: Number(balance.toFixed(2)),
          }
        }));
      },
      resetToFreshStart: (newBalance: number) => {
        set((state) => ({
          balance: Number(newBalance.toFixed(2)),
          profile: {
            ...state.profile,
            startingBalance: Number(newBalance.toFixed(2))
          },
          dailyTarget: {
            ...state.dailyTarget,
            dayNum: 1,
            dayStartBalance: Number(newBalance.toFixed(2)),
            currentStake: Number(Math.max(1, newBalance * 0.01).toFixed(2)),
            consecutiveLosses: 0,
            coverAmountTracker: 0,
            targetHit: false,
            slHit: false,
            lastTradeDate: new Date().toISOString()
          }
        }));
      },
      resetTradingData: () => {
        const { profile } = get();
        set({
          balance: 0,
          profile: {
            ...profile,
            startingBalance: 0,
            dailyProfitTarget: 5,
            targetDays: 30,
            isSetupComplete: false
          },
          dailyTarget: {
            dailyPct: 5,
            slPct: 10,
            totalDays: 30,
            dayNum: 1,
            currentStake: 1,
            consecutiveLosses: 0,
            coverAmountTracker: 0,
            lastTradeDate: null,
            targetHit: false,
            slHit: false,
            payout: 85,
            dayStartBalance: 0,
            resetCount: 0,
            blockedUntil: null,
          },
          masaniello: {
            events: 30,
            winsNeeded: 15,
            payout: 85,
            currentWins: 0,
            currentEvents: 0,
            isFinished: false,
            sessionStartBalance: 0,
            consecutiveLosses: 0,
            cooldownUntil: null
          },
          trades: [],
          journals: []
        });
      },
      clearAllData: () => {
        set({
          balance: 0,
          profile: {
            uid: null,
            name: '',
            email: '',
            phone: '',
            avatar: null,
            gender: '',
            age: '',
            address: '',
            experienceMonths: '0',
            experienceYears: '0',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            startingBalance: 0,
            dailyProfitTarget: 5,
            targetDays: 30,
            preferredStrategy: 'target',
            isSetupComplete: false,
            status: 'pending'
          },
          dailyTarget: {
            dailyPct: 5,
            slPct: 10,
            totalDays: 30,
            dayNum: 1,
            currentStake: 1,
            consecutiveLosses: 0,
            coverAmountTracker: 0,
            lastTradeDate: null,
            targetHit: false,
            slHit: false,
            payout: 85,
            dayStartBalance: 0,
            resetCount: 0,
            blockedUntil: null,
          },
          masaniello: {
            events: 30,
            winsNeeded: 15,
            payout: 85,
            currentWins: 0,
            currentEvents: 0,
            isFinished: false,
            sessionStartBalance: 0,
            consecutiveLosses: 0,
            cooldownUntil: null
          },
          trades: [],
          journals: []
        });
      },
      restartJourney: () => {
        const { profile } = get();
        set((state) => ({
          balance: profile.startingBalance,
          dailyTarget: {
            ...state.dailyTarget,
            dayNum: 1,
            dayStartBalance: profile.startingBalance,
            currentStake: profile.startingBalance > 0 ? Number(Math.max(1, profile.startingBalance * 0.01).toFixed(2)) : 1,
            consecutiveLosses: 0,
            coverAmountTracker: 0,
            targetHit: false,
            slHit: false,
            lastTradeDate: null,
          },
          masaniello: {
            ...state.masaniello,
            sessionStartBalance: profile.startingBalance,
            currentEvents: 0,
            currentWins: 0,
            isFinished: false
          },
          trades: [],
        }));
      },
      adjustBalance: (amount, type) => {
        set((state) => {
          const amt = Number(amount) || 0;
          const adjustment = type === 'deposit' ? amt : -amt;
          const newBalance = Math.max(0, Number(state.balance || 0) + adjustment);
          const newStartingBalance = Math.max(0, Number(state.profile.startingBalance || 0) + adjustment);
          const newDayStartBalance = Math.max(0, Number(state.dailyTarget.dayStartBalance || 0) + adjustment);
          const newSessionStartBalance = Math.max(0, Number(state.masaniello.sessionStartBalance || 0) + adjustment);

          const updatedState = {
            balance: newBalance,
            profile: { ...state.profile, startingBalance: newStartingBalance },
            dailyTarget: { ...state.dailyTarget, dayStartBalance: newDayStartBalance },
            masaniello: { ...state.masaniello, sessionStartBalance: newSessionStartBalance }
          };

          return updatedState;
        });
      },
      recordTrade: (isWin, profitAmount, lossReason) => {
        const { balance, dailyTarget } = get();
        const payoutRate = (dailyTarget.payout || 85) / 100;
        
        let newBalance = balance;
        let newConsecutive = dailyTarget.consecutiveLosses || 0;
        let newCover = dailyTarget.coverAmountTracker || 0;

        // Session start balance (ensuring reference is user's session balance, defaults to 1000 if not set)
        const sessionStartBal = (dailyTarget.sessionStartBalance && dailyTarget.sessionStartBalance > 0)
          ? dailyTarget.sessionStartBalance
          : (dailyTarget.dayStartBalance && dailyTarget.dayStartBalance > 300)
            ? dailyTarget.dayStartBalance
            : balance > 0 ? balance : 1000;

        // The user's allocated budget is their EXACT stop loss (e.g. $200). User can use all $200.
        const allocatedCap = (dailyTarget.allocatedBalance && dailyTarget.allocatedBalance > 0)
          ? dailyTarget.allocatedBalance
          : 200;

        // Target profit amount (e.g. 10% of 1000 = $100)
        const dailyPct = dailyTarget.dailyPct || 10;
        const targetProfitAmount = (dailyTarget.targetProfitAmount && dailyTarget.targetProfitAmount > 0)
          ? dailyTarget.targetProfitAmount
          : Number(((sessionStartBal * dailyPct) / 100).toFixed(2));

        // Base Stake: User's set initial stake (e.g. 10 or 12).
        // Fallback is 5% of allocatedCap (200 * 0.05 = 10) or 10. NEVER 5% of whole 1000 balance!
        const baseStake = Math.max(1, dailyTarget.initialStake || Math.round(allocatedCap * 0.05) || 10);

        let newStake = baseStake;

        if (isWin) {
          newBalance += profitAmount;
          newConsecutive = 0;
          newCover = 0;
          newStake = baseStake; // ALWAYS reset to base initial stake (e.g. 10 or 12) upon WIN / recovery
        } else {
          const currentStakeAmount = dailyTarget.currentStake || baseStake;
          newBalance -= currentStakeAmount;
          newConsecutive += 1;
          newCover += currentStakeAmount;

          newStake = calculateTargetRecoveryStake({
            cumulativeLoss: newCover,
            baseStake,
            payout: dailyTarget.payout || 85,
            consecutiveLosses: newConsecutive,
            allocatedBudget: allocatedCap,
            strategyMode: dailyTarget.strategyMode || 'smart_recovery'
          });
        }

        const targetLimit = Number((sessionStartBal + targetProfitAmount).toFixed(2));
        const remainingTarget = Number((targetLimit - newBalance).toFixed(2));

        // When not in recovery (consecutive = 0), if remaining target is small, don't overshoot
        if (newConsecutive === 0 && remainingTarget > 0 && remainingTarget < (newStake * payoutRate)) {
          const refinedStake = Number((remainingTarget / payoutRate).toFixed(2));
          if (refinedStake >= 1) {
            newStake = refinedStake;
          }
        }

        // Stop Loss:
        // The user can use the FULL allocated budget (e.g. $200).
        // Triggers ONLY if the unrecovered cumulative loss reaches the allocated budget,
        // OR total net drawdown in this session hits the full allocated budget.
        const sessionNetLoss = Number((sessionStartBal - newBalance).toFixed(2));
        const isSlHit = newCover >= allocatedCap || sessionNetLoss >= allocatedCap || newBalance <= 0;
        const isTargetHit = newBalance >= targetLimit;

        // When target is reached, trigger an automatic 10-minute cooldown to prevent greed & overtrading
        let newCooldown: string | null = null;
        if (isTargetHit) {
          const cdDate = new Date();
          cdDate.setMinutes(cdDate.getMinutes() + 10);
          newCooldown = cdDate.toISOString();
        }

        // Round all financial numbers to strictly 2 decimal places to prevent overflow
        newBalance = Number(newBalance.toFixed(2));
        newStake = Number(newStake.toFixed(2));
        newCover = Number(newCover.toFixed(2));

        get().addTrade({
          type: isWin ? 'WIN' : 'LOSS',
          amount: isWin ? profitAmount : (dailyTarget.currentStake || baseStake),
          isMasaniello: false,
          lossReason: isWin ? undefined : lossReason
        });

        set((state) => ({
          balance: newBalance,
          dailyTarget: {
            ...state.dailyTarget,
            allocatedBalance: allocatedCap,
            targetProfitAmount,
            initialStake: baseStake,
            currentStake: newStake,
            consecutiveLosses: newConsecutive,
            coverAmountTracker: newCover,
            targetHit: isTargetHit,
            slHit: isSlHit,
            sessionStartBalance: sessionStartBal,
            lastTradeDate: new Date().toISOString(),
            cooldownUntil: newCooldown
          }
        }));
      },

      masaniello: { events: 10, winsNeeded: 5, payout: 85, currentWins: 0, currentEvents: 0, isFinished: false, sessionStartBalance: 228.35, cooldownUntil: null, consecutiveLosses: 0, isConfigured: false },
      updateMasaniello: (data) => set((state) => ({ masaniello: { ...state.masaniello, ...data } })),

      journals: [],
      addJournal: (entry) => set((state) => ({
        journals: [{ id: crypto.randomUUID(), date: new Date().toISOString(), ...entry }, ...state.journals].slice(0, 100)
      })),
      deleteJournal: (id) => set((state) => ({
        journals: state.journals.filter(j => j.id !== id)
      })),

      trades: [],
      addTrade: (trade) => set((state) => ({
        trades: [{ id: crypto.randomUUID(), date: new Date().toISOString(), ...trade }, ...state.trades]
      })),
    }),
    { name: 'trading-app-storage' }
  )
);
