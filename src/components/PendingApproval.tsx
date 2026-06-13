import { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useStore } from '../store/useStore';

export function PendingApproval({ status, onLogout }: { status: string, onLogout: () => void }) {
  const { theme, profile, updateProfile } = useStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!profile.uid) return;
    
    // Listen for status changes from admin panel
    const unsubscribe = onSnapshot(doc(db, 'users', profile.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.status && data.status !== profile.status) {
          updateProfile({ status: data.status });
        }
      }
    });
    
    return () => unsubscribe();
  }, [profile.uid, profile.status, updateProfile]);

  return (
    <div className={`w-full min-h-[100dvh] flex items-center justify-center p-6 ${isDark ? 'bg-[#050b14] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`w-full max-w-[400px] p-8 rounded-3xl text-center shadow-xl ${isDark ? 'bg-[#0b121e] border border-white/5' : 'bg-white'}`}>
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 bg-amber-500/10">
          {status === 'pending' ? (
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        
        <h2 className={`text-2xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {status === 'pending' ? 'অ্যাকাউন্ট রিভিউতে আছে' : 'অ্যাকাউন্ট বাতিল করা হয়েছে'}
        </h2>
        
        <p className={`text-sm mb-8 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {status === 'pending' 
            ? 'আপনার অ্যাকাউন্টটি এডমিন প্যানেল থেকে অ্যাপ্রুভ হওয়ার আগ পর্যন্ত আপনি লগইন করতে পারবেন না। দয়া করে অপেক্ষা করুন।' 
            : 'আপনার অ্যাকাউন্ট আবেদনটি গ্রহণ করা সম্ভব হয়নি।'}
        </p>

        <button 
          onClick={onLogout}
          className={`px-6 py-3 rounded-xl font-bold transition-all w-full flex items-center justify-center space-x-2 ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>লগআউট করুন</span>
        </button>
      </div>
    </div>
  );
}
