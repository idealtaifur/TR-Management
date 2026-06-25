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
import { Onboarding } from "./components/Onboarding";
import { Login } from "./components/Login";
import { AdminPanel } from "./components/AdminPanel";
import { PendingApproval } from "./components/PendingApproval";
import { useStore } from "./store/useStore";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function App() {
  const [currentTab, setTab] = useState('home');
  const [showWelcome, setShowWelcome] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { theme, profile, updateProfile, resetDailySession, dailyTarget, updateDailyTarget } = useStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoadingProfile(true);
      setUser(firebaseUser);
      if (firebaseUser) {
         try {
            const currentProfileUid = useStore.getState().profile.uid;
            
            const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (snap.exists()) {
               // Exists in DB. Check if we need to clear local data if it's a different user
               if (currentProfileUid && currentProfileUid !== firebaseUser.uid) {
                  useStore.getState().clearAllData();
                  setTab('home');
               }
               const data = snap.data();
               const parsedData = { ...data, uid: firebaseUser.uid, email: firebaseUser.email || '' } as any;
               updateProfile(parsedData);
               
               // Restore local store basic variables if they had been cleared
               if (useStore.getState().balance === 0 && parsedData.startingBalance > 0) {
                  useStore.setState((state: any) => ({
                     balance: parsedData.startingBalance,
                     dailyTarget: {
                        ...state.dailyTarget,
                        dailyPct: parsedData.dailyProfitTarget || 5,
                        totalDays: parsedData.targetDays || 30,
                        dayStartBalance: parsedData.startingBalance,
                        currentStake: parsedData.startingBalance > 0 ? Number(Math.max(1, parsedData.startingBalance * 0.01).toFixed(2)) : 1,
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
                 isSetupComplete: false,
                 status: 'pending' as const
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
                   isSetupComplete: false,
                   status: 'pending'
                 });
               } catch (err: any) {
                 console.error("Failed to create initial user doc:", err);
                 alert("আপনার ডেটা সংরক্ষণ করতে সমস্যা হয়েছে: " + err.message);
               }
               
               setTab('home'); // Reset tab in case it was stuck on profile
            }
         } catch (e: any) {
            console.warn("Failed to load user profile from DB, falling back to local state", e.message);
            // Fallback to minimal profile if DB fetch fails
            const defaultName = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User');
            // Do not clear local data if it's the same user, just ensure they are logged in
            const currentProfileUid = useStore.getState().profile.uid;
            if (currentProfileUid !== firebaseUser.uid) {
               useStore.getState().clearAllData();
            }
            // Preserve their existing local isSetupComplete status if possible
            const currentIsSetupComplete = useStore.getState().profile.isSetupComplete;
            updateProfile({ 
              uid: firebaseUser.uid, 
              email: firebaseUser.email || '', 
              name: defaultName,
              avatar: firebaseUser.photoURL || null,
              isSetupComplete: currentIsSetupComplete 
            });
         }
      } else {
         useStore.getState().clearAllData();
         setTab('home'); // Ensure we land back on home when they log out so next login starts fresh and correctly routes.
      }
      setAuthInitialized(true);
      setLoadingProfile(false);
    });
    return () => unsub();
  }, [updateProfile]);

  useEffect(() => {
    // Check for daily reset using persistent Dhaka timezone
    const currentDay = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka' });
    const lastSessionDay = dailyTarget.lastTradeDate 
      ? new Date(dailyTarget.lastTradeDate).toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka' })
      : null;
      
    if (lastSessionDay !== currentDay) {
      resetDailySession();
      updateDailyTarget({
        lastTradeDate: new Date().toISOString(),
        dayNum: lastSessionDay ? dailyTarget.dayNum + 1 : dailyTarget.dayNum
      });
    }
  }, [dailyTarget.lastTradeDate, resetDailySession, updateDailyTarget, dailyTarget.dayNum]);

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

  const adminEmails = ['team.trmanagement@gmail.com'];
  const isAdmin = user?.email && adminEmails.includes(user.email.toLowerCase());

  if (isAdmin) {
    return <AdminPanel />;
  }

  if (!profile.isSetupComplete) {
    return <Onboarding onComplete={() => setTab('home')} />;
  }

  if (profile.status === 'pending' || profile.status === 'rejected') {
    return <PendingApproval status={profile.status} onLogout={() => auth.signOut()} />;
  }

  return (
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
        
        <div className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide z-10 flex flex-col px-3 pt-1 pb-3 space-y-4">
           <div className="pt-1 flex-shrink-0">
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
        
        {showWelcome && (
           <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050b14]/60 backdrop-blur-md px-4 pb-20">
              <HomeCard onStart={() => setShowWelcome(false)} />
           </div>
        )}
        
      </div>
    </div>
  );
}
