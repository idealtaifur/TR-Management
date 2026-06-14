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
                        dayStartBalance: parsedData.startingBalance,
                        currentStake: parsedData.startingBalance > 0 ? Number(Math.max(1, parsedData.startingBalance * 0.01).toFixed(2)) : 1,
                     },
                     masaniello: {
                        ...state.masaniello,
                        sessionStartBalance: parsedData.startingBalance
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
    // Check for daily reset
    const today = new Date().toDateString();
    const lastSessionDate = dailyTarget.lastTradeDate 
      ? new Date(dailyTarget.lastTradeDate).toDateString()
      : null;
      
    if (lastSessionDate !== today) {
      resetDailySession();
      updateDailyTarget({
        lastTradeDate: new Date().toISOString(),
        dayNum: lastSessionDate ? dailyTarget.dayNum + 1 : dailyTarget.dayNum
      });
    }
  }, [dailyTarget.lastTradeDate, resetDailySession, updateDailyTarget, dailyTarget.dayNum]);

  if (!authInitialized || loadingProfile) {
    return (
      <div className={`w-full min-h-[100dvh] flex items-center justify-center ${isDark ? 'bg-[#050b14]' : 'bg-slate-50'}`}>
        <div className="w-8 h-8 rounded-full border-2 border-[#00e676] border-t-transparent animate-spin"></div>
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
    <div className={`w-full h-[100dvh] flex justify-center selection:bg-[#00e676]/30 ${isDark ? 'bg-[#050b14] dark' : 'bg-slate-50'}`}>
      <div className={`w-full min-h-[100dvh] h-full max-w-[420px] relative overflow-y-auto overflow-x-hidden scrollbar-hide font-sans shadow-2xl ${isDark ? 'bg-[#0a101d] text-white' : 'bg-slate-50 text-slate-900'}`}>
        
        {/* Background Gradients for Glassmorphism */}
        <div className="fixed top-0 h-[100dvh] w-full max-w-[420px] overflow-hidden z-0 pointer-events-none">
          {isDark ? (
            <>
              {/* Visible Floating Circles - Bright & Various Sizes */}
              <div className="absolute top-[2%] left-[-5%] w-[220px] h-[220px] rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600/80 blur-[10px] shadow-[0_0_40px_rgba(52,211,153,0.6)] opacity-90"></div>
              <div className="absolute top-[20%] right-[-10%] w-[150px] h-[150px] rounded-full bg-gradient-to-bl from-blue-400 to-indigo-600/80 blur-[12px] shadow-[0_0_45px_rgba(96,165,250,0.6)] opacity-90"></div>
              <div className="absolute top-[45%] left-[-15%] w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-purple-400 to-purple-600/80 blur-[18px] shadow-[0_0_50px_rgba(192,132,252,0.6)] opacity-90"></div>
              <div className="absolute top-[75%] right-[-5%] w-[180px] h-[180px] rounded-full bg-gradient-to-bl from-pink-400 to-rose-600/80 blur-[10px] shadow-[0_0_40px_rgba(244,114,182,0.6)] opacity-90"></div>
              <div className="absolute top-[35%] left-[20%] w-[120px] h-[120px] rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600/80 blur-[8px] shadow-[0_0_35px_rgba(34,211,238,0.6)] opacity-90"></div>
              <div className="absolute bottom-[5%] left-[10%] w-[200px] h-[200px] rounded-full bg-gradient-to-br from-amber-400 to-orange-600/80 blur-[12px] shadow-[0_0_45px_rgba(251,191,36,0.6)] opacity-90"></div>
            </>
          ) : (
            <>
              {/* Visible Floating Circles - Light Mode - Brighter */}
              <div className="absolute top-[2%] left-[-5%] w-[200px] h-[200px] rounded-full bg-gradient-to-br from-emerald-400 to-emerald-300/80 blur-[12px] shadow-[0_0_30px_rgba(52,211,153,0.4)] opacity-95"></div>
              <div className="absolute top-[20%] right-[-10%] w-[180px] h-[180px] rounded-full bg-gradient-to-bl from-blue-400 to-blue-300/80 blur-[15px] shadow-[0_0_35px_rgba(96,165,250,0.4)] opacity-95"></div>
              <div className="absolute top-[45%] left-[-15%] w-[280px] h-[280px] rounded-full bg-gradient-to-tr from-purple-400 to-purple-300/80 blur-[20px] shadow-[0_0_40px_rgba(192,132,252,0.4)] opacity-95"></div>
              <div className="absolute top-[75%] right-[-5%] w-[160px] h-[160px] rounded-full bg-gradient-to-bl from-rose-400 to-rose-300/80 blur-[12px] shadow-[0_0_30px_rgba(251,113,133,0.4)] opacity-95"></div>
              <div className="absolute top-[35%] left-[20%] w-[110px] h-[110px] rounded-full bg-gradient-to-tr from-cyan-400 to-cyan-300/80 blur-[8px] shadow-[0_0_25px_rgba(34,211,238,0.4)] opacity-95"></div>
              <div className="absolute bottom-[5%] left-[10%] w-[150px] h-[150px] rounded-full bg-gradient-to-br from-amber-400 to-yellow-300/80 blur-[10px] shadow-[0_0_30px_rgba(251,191,36,0.4)] opacity-95"></div>
            </>
          )}
        </div>
        
        <div className="relative z-10 flex flex-col px-3 pt-1 pb-3 space-y-4 min-h-full">
           <div className="pt-1">
             <Header setTab={setTab} />
           </div>

           <div className={`w-full relative flex flex-col flex-1 ${currentTab === 'home' ? 'pb-2' : 'pb-24'}`}>
             {currentTab === 'home' && <HomeTab setTab={setTab} currentTab={currentTab} />}
             {currentTab === 'target' && <TargetModeTab />}
             {currentTab === 'masaniello' && <MasanielloTab />}
             {currentTab === 'calculator' && <CalculatorTab />}
             {currentTab === 'journal' && <JournalTab />}
             {currentTab === 'profile' && <ProfileTab />}
           </div>

           <FloatingNav currentTab={currentTab} setTab={setTab} />
           
           {showWelcome && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050b14]/60 backdrop-blur-md px-4 pb-20">
                 <HomeCard onStart={() => setShowWelcome(false)} />
              </div>
           )}
        </div>
        
      </div>
    </div>
  );
}
