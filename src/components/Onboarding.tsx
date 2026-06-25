import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { enToBn } from '../utils';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export function Onboarding({ onComplete }: { onComplete?: () => void }) {
  const { profile, updateProfile, setBalance, updateDailyTarget } = useStore();
  
  const [step, setStep] = useState(1);
  
  // Form State
  const [name, setName] = useState(profile.name || '');
  const [age, setAge] = useState(profile.age || '');
  const [gender, setGender] = useState(profile.gender || 'Male');
  const [address, setAddress] = useState(profile.address || '');
  const [experience, setExperience] = useState(profile.experienceYears || '');
  
  const [balance, setValBalance] = useState(profile.startingBalance > 0 ? String(profile.startingBalance) : '100');
  const [targetPct, setTargetPct] = useState(String(profile.dailyProfitTarget));
  const [targetDays, setTargetDays] = useState(String(profile.targetDays));
  
  const honorific = gender === 'Female' ? "আপু" : "ভাইয়া";

  // Calculations
  const numBalance = parseFloat(balance) || 0;
  const numTargetPct = parseFloat(targetPct) || 0;
  const numTargetDays = parseInt(targetDays, 10) || 0;
  
  const finalBalance = useMemo(() => {
    return numBalance * Math.pow(1 + (numTargetPct / 100), numTargetDays);
  }, [numBalance, numTargetPct, numTargetDays]);
  
  const totalProfit = useMemo(() => {
    return finalBalance - numBalance;
  }, [finalBalance, numBalance]);

  const handleComplete = async () => {
    const newProfile = {
      name,
      age,
      gender,
      address,
      experienceYears: experience,
      startingBalance: numBalance,
      currentBalance: numBalance,
      dailyProfitTarget: numTargetPct,
      targetDays: numTargetDays,
      isSetupComplete: true,
      status: 'pending' as const,
    };
    
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          ...newProfile,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (e: any) {
        console.error("Error saving profile to firestore:", e);
        alert("Error saving profile: " + e.message);
      }
    }
    
    if (onComplete) onComplete();

    setBalance(numBalance);
    updateDailyTarget({
      dailyPct: numTargetPct,
      totalDays: numTargetDays,
      dayStartBalance: numBalance,
      dayNum: 1,
    });
    const { updateMasaniello } = useStore.getState();
    updateMasaniello({
      sessionStartBalance: numBalance
    });
    // Call this last because it triggers unmounting of Onboarding component
    updateProfile(newProfile);
  };

  const { theme } = useStore();
  const isDark = theme === 'dark';
  const inputClass = `w-full border rounded-xl px-4 py-3 outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/30 transition-all font-medium ${isDark ? 'bg-black/20 border-white/10 text-white placeholder-white/30' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'} shadow-sm`;

  return (
    <div className={`w-full min-h-[100dvh] flex flex-col justify-center items-center p-4 selection:bg-[#059669]/30 ${isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Background Gradients for Glassmorphism */}
      {isDark && (
        <>
          <div className="fixed top-[-10%] left-[-20%] w-[450px] h-[450px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="fixed top-[30%] right-[-30%] w-[450px] h-[450px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="fixed bottom-[-10%] left-[-20%] w-[450px] h-[450px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        </>
      )}

      <div className={`w-full max-w-[360px] rounded-[2rem] p-6 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col ${isDark ? 'bg-[#0b121e]/80 backdrop-blur-xl border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)]' : 'bg-white'}`}>
        
        {/* Decorative elements */}
        {isDark && (
          <>
            <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] bg-[#059669] rounded-full blur-[80px] opacity-[0.15] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[200px] h-[200px] bg-purple-500 rounded-full blur-[80px] opacity-[0.15] pointer-events-none"></div>
          </>
        )}
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 z-10 w-full relative">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#059669] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="font-bold text-slate-800">TR Setup</span>
          </div>
          <span className="text-sm font-semibold text-slate-500">{step}/3</span>
        </div>

        {/* Progress Bar */}
        <div className="flex space-x-1.5 mb-8 z-10 w-full relative">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-[#059669]' : 'bg-slate-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-[#059669]' : 'bg-slate-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-[#059669]' : 'bg-slate-200'}`} />
        </div>

        <div className="flex-1 flex flex-col justify-center w-full z-10 relative">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
              <h2 className={`text-xl font-bold mb-5 text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>আপনার ব্যক্তিগত তথ্য</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">নাম</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="আপনার নাম" />
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">বয়স</label>
                    <input type="number" value={age} onChange={e => setAge(e.target.value)} className={inputClass} placeholder="বয়স লিখুন" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">জেন্ডার</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className={inputClass}>
                      <option value="Male">পুরুষ</option>
                      <option value="Female">নারী</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ঠিকানা</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} className={inputClass} placeholder="আপনার ঠিকানা" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ট্রেডিং অভিজ্ঞতা (বছর)</label>
                  <input type="number" value={experience} onChange={e => setExperience(e.target.value)} className={inputClass} placeholder="অভিজ্ঞতার বছর" />
                </div>
              </div>

              <button 
                onClick={() => setStep(2)} 
                disabled={!name.trim()}
                className="w-full mt-8 bg-[#059669] hover:bg-[#00c853] disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#059669]/30">
                <span>পরবর্তী ধাপ</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
              <h2 className={`text-xl font-bold mb-5 text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>ট্রেডিং প্ল্যান</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">শুরুর ব্যালেন্স ($)</label>
                  <input type="number" value={balance} onChange={e => setValBalance(e.target.value)} className={inputClass + ' font-bold text-lg'} />
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">ডেইলি টার্গেট (%)</label>
                    <input type="number" value={targetPct} onChange={e => setTargetPct(e.target.value)} className={inputClass + ' font-bold text-lg'} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">টার্গেট দিন</label>
                    <input type="number" value={targetDays} onChange={e => setTargetDays(e.target.value)} className={inputClass + ' font-bold text-lg'} />
                  </div>
                </div>
                
                {/* Projection Box */}
                <div className={`mt-4 p-4 border rounded-xl ${isDark ? 'bg-[#1c293c]/50 border-white/5' : 'bg-[#f8fafc] border-slate-200'}`}>
                  <p className="text-xs text-slate-500 mb-2 font-medium text-center">{enToBn(numTargetDays)} দিন পর আপনার সম্ভাব্য ব্যালেন্স</p>
                  <div className="flex justify-center items-end space-x-1">
                    <span className="text-sm font-bold text-slate-400 mb-1">$</span>
                    <span className="text-3xl font-black text-[#059669]">{enToBn(finalBalance.toFixed(2))}</span>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-xs font-semibold text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-full">+${enToBn(totalProfit.toFixed(2))} প্রফিট</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8 w-full">
                <button 
                  onClick={() => setStep(1)} 
                  className={`w-full border-2 font-bold py-3.5 rounded-xl transition-all shadow-sm ${isDark ? 'bg-transparent border-white/20 text-slate-300 hover:bg-white/5' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                  পেছনে
                </button>
                <button 
                  onClick={() => setStep(3)} 
                  disabled={numBalance <= 0 || numTargetPct <= 0 || numTargetDays <= 0}
                  className="w-full bg-[#059669] hover:bg-[#00c853] disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-[#059669]/30">
                  <span>পরবর্তী</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center w-full">
              <div className="w-16 h-16 rounded-full bg-[#059669] flex items-center justify-center shadow-lg shadow-[#059669]/40 mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className={`text-2xl font-black mb-1 text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>স্বাগতম, {name} {honorific}!</h2>
              <p className={`text-sm mb-8 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>আপনার trading journey শুরু হচ্ছে</p>
              
              <div className={`w-full border rounded-2xl p-4 mb-8 ${isDark ? 'bg-white/5 border-white/10' : 'border-slate-200 bg-slate-50/50'}`}>
                <div className={`flex justify-between items-center py-2.5 border-b ${isDark ? 'border-white/10' : 'border-slate-200/60'}`}>
                   <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>শুরুর ব্যালেন্স</span>
                   <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>${enToBn(numBalance.toFixed(2))}</span>
                </div>
                <div className={`flex justify-between items-center py-2.5 border-b ${isDark ? 'border-white/10' : 'border-slate-200/60'}`}>
                   <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Daily target</span>
                   <span className="text-sm font-bold text-[#059669]">{enToBn(numTargetPct)}%</span>
                </div>
                <div className={`flex justify-between items-center py-2.5 border-b ${isDark ? 'border-white/10' : 'border-slate-200/60'}`}>
                   <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{enToBn(numTargetDays)} দিনে profit</span>
                   <span className="text-sm font-bold text-[#059669]">+{enToBn(totalProfit.toFixed(2))}</span>
                </div>
                <div className="flex justify-between items-center pt-2.5">
                   <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>শেষ ব্যালেন্স</span>
                   <span className="text-base font-black text-amber-500">${enToBn(finalBalance.toFixed(2))}</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3 w-full">
                <button 
                  onClick={() => setStep(2)} 
                  className={`col-span-2 border-2 font-bold py-3.5 rounded-xl transition-all shadow-sm ${isDark ? 'bg-transparent border-white/20 text-slate-300 hover:bg-white/5' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                  পেছনে
                </button>
                <button 
                  onClick={handleComplete} 
                  className="col-span-3 bg-[#059669] hover:bg-[#00c853] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#059669]/30">
                  <span>শুরু করুন</span>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
