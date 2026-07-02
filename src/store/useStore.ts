import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  };
  updateDailyTarget: (data: Partial<State['dailyTarget']>) => void;
  resetDailySession: () => void;
  startNewTargetSession: () => void;
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
        dayStartBalance: 228.35,
      },
      updateDailyTarget: (data) => set((state) => ({ dailyTarget: { ...state.dailyTarget, ...data } })),
      startNewTargetSession: () => {
        const { balance } = get();
        set((state) => ({
          dailyTarget: {
            ...state.dailyTarget,
            dayNum: state.dailyTarget.dayNum + 1,
            currentStake: Number(Math.max(1, balance * 0.01).toFixed(2)),
            consecutiveLosses: 0,
            coverAmountTracker: 0,
            targetHit: false,
            slHit: false,
            dayStartBalance: Number(balance.toFixed(2)),
            lastTradeDate: new Date().toISOString()
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
          const adjustment = type === 'deposit' ? amount : -amount;
          const newBalance = Math.max(0, state.balance + adjustment);
          const newStartingBalance = Math.max(0, state.profile.startingBalance + adjustment);
          const newDayStartBalance = Math.max(0, state.dailyTarget.dayStartBalance + adjustment);
          const newSessionStartBalance = Math.max(0, (state.masaniello.sessionStartBalance || 0) + adjustment);

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
        const payoutRate = dailyTarget.payout / 100;
        
        let newBalance = balance;
        let newStake = dailyTarget.currentStake;
        let newConsecutive = dailyTarget.consecutiveLosses;
        let newCover = dailyTarget.coverAmountTracker;
        
        if (isWin) {
          newBalance += profitAmount;
          newStake = Math.max(1, newBalance * 0.01);
          newConsecutive = 0;
          newCover = 0;
        } else {
          newBalance -= dailyTarget.currentStake;
          newConsecutive += 1;
          newCover += dailyTarget.currentStake;
          // Martingale: prev/payout + prev
          newStake = (newCover / payoutRate) + newCover; 
          newStake = Math.max(1, Math.min(newStake, newBalance * 0.5));
        }

        const targetPct = dailyTarget.dailyPct / 100;
        const startBal = dailyTarget.dayStartBalance;
        const targetLimit = Number((startBal * (1 + targetPct)).toFixed(2));
        const slLimit = Number((startBal * (1 - dailyTarget.slPct / 100)).toFixed(2));

        const remainingTarget = targetLimit - newBalance;
        if (remainingTarget > 0 && remainingTarget < (newStake * payoutRate)) {
            newStake = Math.max(1, remainingTarget / payoutRate);
        }

        // Round all financial numbers to strictly 2 decimal places to prevent overflow or weird UI artifacts
        newBalance = Number(newBalance.toFixed(2));
        newStake = Number(newStake.toFixed(2));
        newCover = Number(newCover.toFixed(2));

        get().addTrade({
          type: isWin ? 'WIN' : 'LOSS',
          amount: isWin ? profitAmount : dailyTarget.currentStake,
          isMasaniello: false,
          lossReason: isWin ? undefined : lossReason
        });

        set((state) => ({
          balance: newBalance,
          dailyTarget: {
            ...state.dailyTarget,
            currentStake: newStake,
            consecutiveLosses: newConsecutive,
            coverAmountTracker: newCover,
            targetHit: newBalance >= targetLimit,
            slHit: newBalance <= slLimit,
            lastTradeDate: new Date().toISOString(),
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
