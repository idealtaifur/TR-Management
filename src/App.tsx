import { useState, useEffect } from "react";
import { BottomNav } from "./components/BottomNav";
import { FloatingNav } from "./components/FloatingNav";
import { HomeTab } from "./tabs/HomeTab";
import { TargetModeTab } from "./tabs/TargetModeTab";
import { MasanielloTab } from "./tabs/MasanielloTab";
import { CalculatorTab } from "./tabs/CalculatorTab";
import { JournalTab } from "./tabs/JournalTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { Header } from "./components/Header";
import { HomeCard } from "./components/HomeCard";
import { WelcomeMessage } from "./components/WelcomeMessage";
import { Onboarding } from "./components/Onboarding";
import { Login } from "./components/Login";
import { AdminPanel } from "./components/AdminPanel";
import { PendingApproval } from "./components/PendingApproval";
import { SyncManager } from "./components/SyncManager";
import { useStore } from "./store/useStore";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function App() {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [currentTab, setTab] = useState('home');
  const [showQuote, setShowQuote] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { theme, profile, updateProfile, resetDailySession, dailyTarget, updateDailyTarget } = useStore();
  const isDark = theme === 'dark';

  const adminEmails = ['team.trmanagement@gmail.com'];

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const intv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intv);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoadingProfile(true);
      setUser(firebaseUser);
      if (firebaseUser) {
         try {
            const currentProfileUid = useStore.getState().profile.uid;
            const userEmail = (firebaseUser.email || '').toLowerCase().trim();
            const isUserAdmin = Boolean(userEmail && adminEmails.includes(userEmail));
            
            const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (snap.exists()) {
               // Exists in DB. Check if we need to clear local data if it's a different user
               if (currentProfileUid && currentProfileUid !== firebaseUser.uid) {
                  useStore.getState().clearAllData();
                  setTab('home');
               }
               const data = snap.data();
               const parsedData = { ...data, uid: firebaseUser.uid, email: firebaseUser.email || '' } as any;
               if (isUserAdmin) {
                 parsedData.status = 'approved';
               }
               updateProfile(parsedData);
               
               // Restore local store basic variables if they had been cleared
               if (useStore.getState().balance === 0 && parsedData.startingBalance > 0) {
                  const restoredBalance = parsedData.currentBalance !== undefined ? parsedData.currentBalance : parsedData.startingBalance;
                  useStore.setState((state: any) => ({
                     balance: restoredBalance,
                     dailyTarget: {
                        ...state.dailyTarget,
                        dailyPct: parsedData.dailyProfitTarget || 5,
                        totalDays: parsedData.targetDays || 30,
                        dayStartBalance: parsedData.startingBalance,
                        currentStake: restoredBalance > 0 ? Number(Math.max(1, restoredBalance * 0.01).toFixed(2)) : 1,
                     },
                     masaniello: {
                        ...state.masaniello,
                        sessionStartBalance: parsedData.startingBalance
                     }
                  }));
               } else {
                  // Ensure existing state still syncs target settings from profile
                  useStore.setState((state: any) => ({
                     dailyTarget: {
                        ...state.dailyTarget,
                        dailyPct: parsedData.dailyProfitTarget || state.dailyTarget.dailyPct,
                        totalDays: parsedData.targetDays || state.dailyTarget.totalDays
                     }
                  }));
               }
            } else {
               // New user! Clear all potential old local data
               useStore.getState().clearAllData();
               const defaultName = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User');
               
               const newProfile = {
                 uid: firebaseUser.uid, 
                 email: firebaseUser.email || '', 
                 name: defaultName,
                 avatar: firebaseUser.photoURL || null,
                 isSetupComplete: isUserAdmin ? true : false,
                 status: isUserAdmin ? ('approved' as const) : ('pending' as const)
               };
               
               updateProfile(newProfile);
               
               // Save to firestore so Admin can see them immediately
               try {
                 const { serverTimestamp } = await import('firebase/firestore');
                 await setDoc(doc(db, 'users', firebaseUser.uid), {
                   uid: firebaseUser.uid,
                   email: firebaseUser.email || '',
                   name: defaultName,
                   createdAt: serverTimestamp(),
                   updatedAt: serverTimestamp(),
                   avatar: firebaseUser.photoURL || null,
                   isSetupComplete: isUserAdmin ? true : false,
                   status: isUserAdmin ? 'approved' : 'pending'
                 });
               } catch (err: any) {
                 console.error("Failed to create initial user doc:", err);
               }
               
               setTab('home'); // Reset tab in case it was stuck on profile
            }
         } catch (e: any) {
            console.warn("Failed to load user profile from DB, falling back to local state", e.message);
            const defaultName = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User');
            const currentProfileUid = useStore.getState().profile.uid;
            if (currentProfileUid !== firebaseUser.uid) {
               useStore.getState().clearAllData();
            }
            const currentIsSetupComplete = useStore.getState().profile.isSetupComplete;
            const userEmail = (firebaseUser.email || '').toLowerCase().trim();
            const isUserAdmin = Boolean(userEmail && adminEmails.includes(userEmail));
            updateProfile({ 
              uid: firebaseUser.uid, 
              email: firebaseUser.email || '', 
              name: defaultName,
              avatar: firebaseUser.photoURL || null,
              isSetupComplete: isUserAdmin ? true : currentIsSetupComplete,
              status: isUserAdmin ? 'approved' : 'pending'
            });
         }
      } else {
         useStore.getState().clearAllData();
         setTab('home');
      }
      setAuthInitialized(true);
      setLoadingProfile(false);
    });
    return () => unsub();
  }, [updateProfile]);

  useEffect(() => {
    const checkDailyReset = () => {
      const state = useStore.getState();
      if (!state.profile.isSetupComplete) return;
      
      const currentDay = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka' });
      const lastSessionDay = state.dailyTarget.lastTradeDate 
        ? new Date(state.dailyTarget.lastTradeDate).toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka' })
        : null;
        
      if (lastSessionDay !== currentDay) {
        state.resetDailySession();
        state.updateDailyTarget({
          lastTradeDate: new Date().toISOString(),
          dayNum: lastSessionDay ? state.dailyTarget.dayNum + 1 : state.dailyTarget.dayNum
        });
      }
    };

    // Check immediately on mount and auth change
    checkDailyReset();
    
    // Check every minute if midnight passed
    const intervalId = setInterval(checkDailyReset, 60000);
    return () => clearInterval(intervalId);
  }, [authInitialized, dailyTarget.lastTradeDate]);

  if (!authInitialized || loadingProfile) {
    return (
      <div className={`w-full min-h-[100dvh] flex items-center justify-center ${isDark ? 'bg-[#050b14]' : 'bg-slate-50'}`}>
        <div className="w-8 h-8 rounded-full border-2 border-[#059669] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const userEmail = (user?.email || '').toLowerCase().trim();
  const isAdmin = Boolean((userEmail && adminEmails.includes(userEmail)) || profile?.role === 'admin');

  if (isAdmin && showAdminPanel) {
    return (
      <>
        <SyncManager />
        <AdminPanel onSwitchToDashboard={() => setShowAdminPanel(false)} />
      </>
    );
  }

  if (!isAdmin && !profile.isSetupComplete) {
    return (
      <>
        <SyncManager />
        <Onboarding onComplete={() => setTab('home')} />
      </>
    );
  }

  if (!isAdmin && (profile.status === 'pending' || profile.status === 'rejected')) {
    return (
      <>
        <SyncManager />
        <PendingApproval status={profile.status} onLogout={() => auth.signOut()} />
      </>
    );
  }

  return (
    <>
    <SyncManager />
    <div className={`w-full h-[100dvh] flex items-center justify-center selection:bg-[#059669]/30 ${isDark ? 'bg-[#050b14] dark' : 'bg-slate-100'}`}>
      
      {/* Global Colorful Modern Background */}
      <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden z-0 pointer-events-none flex justify-center">
        {isDark ? (
          <>
            <div className="absolute top-[0%] left-[10%] w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px]" />
            <div className="absolute top-[30%] right-[10%] w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[0%] left-[20%] w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px]" />
          </>
        ) : (
          <>
            <div className="absolute top-[0%] left-[10%] w-[400px] h-[400px] bg-emerald-300/40 rounded-full blur-[120px]" />
            <div className="absolute top-[30%] right-[10%] w-[350px] h-[350px] bg-blue-300/40 rounded-full blur-[120px]" />
            <div className="absolute bottom-[0%] left-[20%] w-[450px] h-[450px] bg-purple-300/40 rounded-full blur-[140px]" />
          </>
        )}
      </div>

      <div className={`w-full h-[100dvh] max-w-[420px] relative font-sans overflow-hidden ${isDark ? 'bg-[#0b1120]/40 backdrop-blur-3xl text-slate-100' : 'bg-white/40 backdrop-blur-3xl text-slate-900'}`}>
        
        <div className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide z-10 flex flex-col px-3 pt-1 pb-3 space-y-3">
           {isAdmin && (
             <div className="pt-1 flex-shrink-0">
               <div className="flex items-center justify-between px-3 py-1.5 bg-[#059669]/15 border border-[#059669]/30 rounded-xl text-xs backdrop-blur-md">
                 <span className="text-[#059669] font-bold flex items-center gap-1.5">
                   <span>🛡️</span> এডমিন অ্যাকাউন্ট
                 </span>
                 <button 
                   onClick={() => setShowAdminPanel(true)} 
                   className="px-2.5 py-1 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-bold text-[11px] shadow-sm transition-all active:scale-95"
                 >
                   এডমিন প্যানেল
                 </button>
               </div>
             </div>
           )}

           <div className="pt-0.5 flex-shrink-0">
             <Header setTab={setTab} />
           </div>

           <div className={`w-full relative flex flex-col flex-1 flex-shrink-0 ${currentTab === 'home' ? 'pb-2' : 'pb-24'}`}>
             {currentTab === 'home' && <HomeTab setTab={setTab} currentTab={currentTab} />}
             {currentTab === 'target' && <TargetModeTab />}
             {currentTab === 'masaniello' && <MasanielloTab />}
             {currentTab === 'calculator' && <CalculatorTab />}
             {currentTab === 'journal' && <JournalTab />}
             {currentTab === 'profile' && <ProfileTab />}
           </div>
        </div>

        <FloatingNav currentTab={currentTab} setTab={setTab} />
        
        {showQuote && (
           <WelcomeMessage onContinue={() => setShowQuote(false)} />
        )}

        {!showQuote && showWelcome && (
           <div className="absolute inset-0 z-[90] flex flex-col items-center justify-center bg-[#050b14]/60 backdrop-blur-md px-4 pb-20">
              <HomeCard onStart={() => setShowWelcome(false)} />
           </div>
        )}
        
        {dailyTarget.blockedUntil && new Date(dailyTarget.blockedUntil).getTime() > now && (
           <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-white/95 dark:bg-[#050b14]/95 backdrop-blur-xl px-6 text-center animate-in fade-in duration-500">
             <div className="max-w-md w-full flex flex-col items-center bg-slate-50 dark:bg-[#0b121e] p-8 rounded-3xl border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                <span className="text-6xl mb-6 drop-shadow-md">🛑</span>
                <h2 className="text-xl font-bold text-red-500 mb-4 leading-relaxed tracking-wide">
                  আপনি অনেক বেশি ট্রেডিং করে ফেলেছেন!
                </h2>
                <p className="text-slate-700 dark:text-slate-300 text-sm mb-8 leading-relaxed">
                  একদিনে বড়লোক হবার ধান্দা নাকি? অপেক্ষা করুন, মাথা ঠান্ডা করে চিন্তা করুন, মার্কেট পালিয়ে যাচ্ছে না। ধীরে ধীরে সব হবে।
                </p>
                <div className="bg-red-500/10 text-red-600 dark:text-red-500 px-6 py-3 rounded-xl font-mono text-xl font-bold border border-red-500/30">
                   {Math.floor((new Date(dailyTarget.blockedUntil).getTime() - now) / 60000)}:
                   {Math.floor(((new Date(dailyTarget.blockedUntil).getTime() - now) % 60000) / 1000).toString().padStart(2, '0')}
                </div>
             </div>
           </div>
        )}
        
      </div>
    </div>
    </>
  );
}
