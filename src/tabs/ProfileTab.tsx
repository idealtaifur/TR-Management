import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { exportAllDataJSON } from "../lib/download";
import { ImageCropper } from "../components/ImageCropper";
import { SlideButton } from "../components/SlideButton";
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

export function ProfileTab() {
  const store = useStore();
  const { theme, profile, updateProfile, balance, setBalance, resetDailySession, restartJourney, dailyTarget } = store;
  const isDark = theme === 'dark';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (profile.uid !== user.uid) {
           updateProfile({ uid: user.uid, email: user.email || profile.email, name: user.displayName || profile.name, avatar: user.photoURL || profile.avatar });
        }
      } else {
        if (profile.uid) {
           updateProfile({ uid: null });
        }
      }
    });
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Login error', e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  const [uncroppedImage, setUncroppedImage] = useState<string | null>(null);
  const [expType, setExpType] = useState<'years' | 'months'>(Number(profile.experienceYears) > 0 ? 'years' : 'months');
  const [showFullImage, setShowFullImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
           setUncroppedImage(reader.result as string);
        };
        reader.readAsDataURL(e.target.files[0]);
     }
  };

  const handleCropComplete = (croppedImage: string) => {
    updateProfile({ avatar: croppedImage });
    setUncroppedImage(null);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  const handleExport = () => {
     exportAllDataJSON({
       profile: store.profile,
       balance: store.balance,
       dailyTarget: store.dailyTarget,
       masaniello: store.masaniello,
       journals: store.journals,
       trades: store.trades
     });
  };

  const timezones = [
    { value: "Asia/Dhaka", label: "Bangladesh Time (Dhaka)" },
    { value: "Asia/Kolkata", label: "India Standard Time (Kolkata)" },
    ...Intl.supportedValuesOf('timeZone').filter(tz => tz !== "Asia/Dhaka" && tz !== "Asia/Kolkata").map(tz => ({ value: tz, label: tz }))
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (profile.uid) {
        const { updateDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        await updateDoc(doc(db, 'users', profile.uid), {
           name: profile.name || '',
           avatar: profile.avatar || null,
           address: profile.address || '',
           age: profile.age || '',
           gender: profile.gender || '',
           experienceYears: profile.experienceYears || '0',
           experienceMonths: profile.experienceMonths || '0',
           timezone: profile.timezone || 'Asia/Dhaka',
           startingBalance: profile.startingBalance || 0,
           currentBalance: store.balance || 0,
           dailyProfitTarget: profile.dailyProfitTarget || 5,
           targetDays: profile.targetDays || 30,
           preferredStrategy: profile.preferredStrategy || 'target'
        });
      }
    } catch (e) {
      console.error("Failed to save profile", e);
    }
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="flex flex-col pt-4 w-full z-10 px-2 space-y-4 pb-6 flex-1">
      {showFullImage && profile.avatar && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md" 
          onClick={() => setShowFullImage(false)}
        >
          <img src={profile.avatar} className="max-w-full max-h-[80vh] rounded-3xl object-contain shadow-2xl" alt="Full Profile" />
        </div>
      )}
      {uncroppedImage && (
        <ImageCropper 
          imageSrc={uncroppedImage} 
          onCropComplete={handleCropComplete} 
          onCancel={() => setUncroppedImage(null)} 
        />
      )}
      
      <div className="glass-panel rounded-[2rem] p-5 space-y-5 relative overflow-hidden">
         
         <div className="flex flex-col items-center">
            <div className="relative group">
               <div 
                 className="cursor-pointer w-24 h-24 rounded-full bg-slate-200 dark:bg-black/40 ring-2 ring-[#059669]/50 hover:ring-[#059669] shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all overflow-hidden flex items-center justify-center p-1"
                 onClick={() => setShowFullImage(true)}
               >
                  <div className="w-full h-full rounded-full overflow-hidden bg-black/40 flex items-center justify-center">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full relative flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'}`}>
                        <span className="text-4xl font-bold">{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</span>
                      </div>
                    )}
                  </div>
               </div>
               <label className="absolute bottom-0 right-0 cursor-pointer">
                 <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                 <div className="bg-[#059669] text-slate-900 p-1.5 rounded-full shadow-lg border-2 border-[#0b1621] hover:scale-110 transition-transform">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                 </div>
               </label>
            </div>
            <span className="text-[10px] text-[#059669] mt-4 font-bold uppercase tracking-wider">Change Photo</span>
            <button onClick={handleLogout} className="mt-4 bg-red-500/10 text-red-500 font-bold py-2.5 px-6 rounded-full text-xs shadow hover:bg-red-500/20 transition-colors">
              Log Out
            </button>
         </div>

         <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
               <label className="text-[10px] text-secondary font-semibold mb-1 block uppercase">নাম (Name)</label>
               <input type="text" onFocus={handleFocus} value={profile.name} onChange={e => updateProfile({ name: e.target.value })} className="w-full inner-glass text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:border-[#059669] focus:outline-none transition-colors" />
            </div>
            <div className="col-span-2">
               <label className="text-[10px] text-secondary font-semibold mb-1 block uppercase">ঠিকানা (Address)</label>
               <input type="text" onFocus={handleFocus} value={profile.address} onChange={e => updateProfile({ address: e.target.value })} className="w-full inner-glass text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:border-[#059669] focus:outline-none transition-colors" />
            </div>
            
            <div>
               <label className="text-[10px] text-secondary font-semibold mb-1 block uppercase">বয়স (Age)</label>
               <input type="number" onFocus={handleFocus} value={profile.age} onChange={e => updateProfile({ age: e.target.value })} className="w-full inner-glass text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:border-[#059669] focus:outline-none transition-colors" />
            </div>
            <div>
               <label className="text-[10px] text-secondary font-semibold mb-1 block uppercase">জেন্ডার (Gender)</label>
               <select value={profile.gender?.charAt(0).toUpperCase() + profile.gender?.slice(1)} onChange={e => updateProfile({ gender: e.target.value })} className="w-full inner-glass text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:border-[#059669] focus:outline-none transition-colors">
                 <option value="">Select...</option>
                 <option value="Male">Male</option>
                 <option value="Female">Female</option>
                 <option value="Other">Other</option>
               </select>
            </div>

            <div className="col-span-2">
               <label className="text-[10px] text-secondary font-semibold mb-2 block uppercase">অভিজ্ঞতা (Experience)</label>
               <div className="flex bg-slate-200/50 dark:bg-black/30 rounded-xl p-1 border border-slate-300 dark:border-white/10 mb-2">
                 <button onClick={() => setExpType('years')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${expType === 'years' ? 'bg-white dark:bg-white/20 text-slate-800 dark:text-white shadow' : 'text-secondary hover:text-slate-800 dark:hover:text-white'}`}>
                   Years
                 </button>
                 <button onClick={() => setExpType('months')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${expType === 'months' ? 'bg-white dark:bg-white/20 text-slate-800 dark:text-white shadow' : 'text-secondary hover:text-slate-800 dark:hover:text-white'}`}>
                   Months
                 </button>
               </div>
               
               {expType === 'years' ? (
                  <select value={profile.experienceYears} onChange={e => updateProfile({ experienceYears: e.target.value, experienceMonths: '0' })} className="w-full inner-glass text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:border-[#059669] focus:outline-none transition-colors">
                    <option value="0">0 Years</option>
                    <option value="1">1 Year</option>
                    {[2,3,4,5,6,7,8,9,10].map(y => <option key={y} value={y}>{y} Years</option>)}
                    <option value="10+">10+ Years</option>
                  </select>
               ) : (
                  <select value={profile.experienceMonths} onChange={e => updateProfile({ experienceMonths: e.target.value, experienceYears: '0' })} className="w-full inner-glass text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:border-[#059669] focus:outline-none transition-colors">
                    {[0,1,2,3,4,5,6,7,8,9,10,11].map(m => <option key={m} value={m}>{m} Months</option>)}
                  </select>
               )}
            </div>

            <div className="col-span-2">
               <label className="text-[10px] text-secondary font-semibold mb-1 block uppercase">টাইম জোন (Time Zone)</label>
               <select value={profile.timezone} onChange={e => updateProfile({ timezone: e.target.value })} className="w-full inner-glass text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:border-[#059669] focus:outline-none transition-colors">
                 {timezones.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
               </select>
            </div>
            
            <div className="col-span-2 mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
               <label className="text-xs font-bold text-slate-800 dark:text-white mb-2 block">অ্যাকাউন্ট সেটিংস (Account Settings)</label>
               <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-[10px] text-secondary font-semibold mb-1 block uppercase truncate">Start Bal / শুরু</label>
                    <input type="number" step="0.01" onFocus={handleFocus} value={profile.startingBalance ? Number(Number(profile.startingBalance).toFixed(2)) : ''} onChange={e => {
                       const newStartBal = Number(e.target.value);
                       updateProfile({ startingBalance: newStartBal });
                       if (newStartBal > 0 && newStartBal === balance) {
                           store.resetToFreshStart(newStartBal);
                       }
                    }} className="w-full inner-glass text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:border-[#059669] focus:outline-none transition-colors" />
                 </div>
                 <div>
                    <label className="text-[10px] text-secondary font-semibold mb-1 block uppercase truncate">Curr Bal / বর্তমান</label>
                    <input type="number" step="0.01" onFocus={handleFocus} value={balance !== undefined ? Number(Number(balance).toFixed(2)) : ''} onChange={e => {
                       const newBal = Number(e.target.value);
                       setBalance(newBal);
                       if (profile.uid) {
                          import('../lib/firebase').then(({ db }) => {
                             import('firebase/firestore').then(({ doc, updateDoc }) => {
                                updateDoc(doc(db, 'users', profile.uid!), { currentBalance: newBal }).catch(() => {});
                             });
                          }).catch(() => {});
                       }
                       if (profile.startingBalance > 0 && newBal === profile.startingBalance) {
                           store.resetToFreshStart(newBal);
                       } else {
                           const targetPct = dailyTarget.dailyPct / 100;
                           if (profile.startingBalance > 0 && targetPct > 0 && newBal >= profile.startingBalance) {
                              let n = Math.log(newBal / profile.startingBalance) / Math.log(1 + targetPct);
                              if (n < 0) n = 0;
                              const potentialDay = Math.floor(n) + 1;
                              store.updateDailyTarget({ dayNum: potentialDay });
                           }
                       }
                    }} className="w-full inner-glass text-[#059669] font-bold rounded-xl px-3 py-2.5 text-sm focus:border-[#059669] focus:outline-none transition-colors" />
                 </div>
                 
                 <div>
                    <label className="text-[10px] text-secondary font-semibold mb-1 block uppercase truncate">Daily Prf / টার্গেট</label>
                    <input type="number" step="0.01" onFocus={handleFocus} value={profile.dailyProfitTarget ? Number(Number(profile.dailyProfitTarget).toFixed(2)) : ''} onChange={e => { updateProfile({ dailyProfitTarget: Number(e.target.value) }); store.updateDailyTarget({ dailyPct: Number(e.target.value) }); }} className="w-full inner-glass text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:border-[#059669] focus:outline-none transition-colors" />
                 </div>
                 <div>
                    <label className="text-[10px] text-secondary font-semibold mb-1 block uppercase truncate">Tgt Days / দিন</label>
                    <input type="number" onFocus={handleFocus} value={profile.targetDays || ''} onChange={e => { updateProfile({ targetDays: Number(e.target.value) }); store.updateDailyTarget({ totalDays: Number(e.target.value) }); }} className="w-full inner-glass text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:border-[#059669] focus:outline-none transition-colors" />
                 </div>
                 <div>
                    <label className="text-[10px] text-secondary font-semibold mb-1 block uppercase truncate">Curr Day / বর্তমান দিন</label>
                    <input type="number" onFocus={handleFocus} value={dailyTarget.dayNum || ''} onChange={e => store.updateDailyTarget({ dayNum: Number(e.target.value) })} className="w-full inner-glass text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:border-[#059669] focus:outline-none transition-colors" />
                 </div>
                 <div>
                    <label className="text-[10px] text-secondary font-semibold mb-1 block uppercase truncate">Payout / পেআউট (%)</label>
                    <input type="number" onFocus={handleFocus} value={dailyTarget.payout || ''} onChange={e => store.updateDailyTarget({ payout: Number(e.target.value) })} className="w-full inner-glass text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:border-[#059669] focus:outline-none transition-colors" />
                 </div>
               </div>
            </div>

            <div className="col-span-2 mt-2">
               <label className="text-[10px] text-secondary font-semibold mb-2 block uppercase">হোম পেজ ডিসপ্লে (Home Page Display Strategy)</label>
               <div className="flex bg-slate-200/50 dark:bg-black/30 rounded-xl p-1 border border-slate-300 dark:border-white/10">
                 <button onClick={() => updateProfile({ preferredStrategy: 'masaniello' })} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${profile.preferredStrategy === 'masaniello' ? 'bg-[#059669] text-black shadow' : 'text-secondary hover:text-slate-800 dark:hover:text-white'}`}>
                   Masaniello
                 </button>
                 <button onClick={() => updateProfile({ preferredStrategy: 'target' })} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${profile.preferredStrategy === 'target' ? 'bg-[#059669] text-black shadow' : 'text-secondary hover:text-slate-800 dark:hover:text-white'}`}>
                   Daily Target
                 </button>
               </div>
            </div>
         </div>

         <div className="pt-2">
            <button onClick={handleSave} className={`w-full shadow-[0_0_15px_rgba(5,150,105,0.3)] py-3 rounded-xl font-extrabold text-sm hover:scale-[1.02] transition-all flex justify-center items-center gap-2 ${isSaving ? 'bg-[#065f46] text-white scale-[0.98]' : 'bg-[#047857] text-white hover:bg-[#065f46] shadow-lg'}`}>
               {isSaving ? (
                 <>
                   <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Saved!
                 </>
               ) : 'Save Settings'}
            </button>
         </div>

         <div className="pt-4 space-y-3 border-t border-slate-200 dark:border-white/10">
             <SlideButton 
                onSlideComplete={() => {
                   store.startNewTargetSession();
                }} 
             />
             <button onClick={() => setShowDeleteConfirm(true)} className="w-full bg-red-500/10 text-red-500 border border-red-500/30 py-3 rounded-xl font-bold text-xs hover:bg-red-500/20 transition-colors">
                সব তথ্য মুছুন
             </button>
             <button onClick={() => setShowExportModal(true)} className="w-full bg-blue-500/10 text-blue-400 border border-blue-500/30 py-3 rounded-xl font-bold text-xs hover:bg-blue-500/20 transition-colors">
                Export All Data
             </button>
         </div>

      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-5 backdrop-blur-md">
           <div className="glass-panel p-6 rounded-3xl w-full max-w-sm flex flex-col items-center text-center relative border border-white/10">
             <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
             </div>
             <h3 className="text-xl font-black text-white mb-2">আপনি কি নিশ্চিত?</h3>
             <p className="text-slate-400 text-sm mb-6">আপনার সমস্ত ট্রেডিং হিস্ট্রি এবং টার্গেট সম্পূর্ণ মুছে যাবে এবং প্রথম থেকে শুরু হবে।</p>
             <div className="flex gap-3 w-full">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors">
                   না, বাতিল করুন
                </button>
                <button onClick={() => {
                   setShowDeleteConfirm(false);
                   store.resetTradingData();
                }} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                   হ্যাঁ, মুছুন
                </button>
             </div>
           </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="glass-panel p-4 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col relative border border-white/10">
             <button onClick={() => setShowExportModal(false)} className="absolute top-3 right-3 text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
             </button>
             <h2 className="text-white font-bold mb-4">Exported Data JSON</h2>
             <div className="flex-1 overflow-auto bg-[#0b1621] p-3 rounded-xl border border-white/5 mb-4 text-[10px] text-green-400 font-mono text-left whitespace-pre-wrap">
                {JSON.stringify({ profile, balance, dailyTarget, masaniello: store.masaniello, journals: store.journals, trades: store.trades }, null, 2)}
             </div>
             <div className="flex justify-between items-center">
                <span className="text-secondary text-[10px]">Ready to copy or save</span>
                <button onClick={handleExport} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                   Download JSON
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
