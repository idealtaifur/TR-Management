import React, { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { useStore } from '../store/useStore';

export function Login() {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('পাসওয়ার্ড রিসেট করতে প্রথমে আপনার ইমেইলটি লিখুন।');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('পাসওয়ার্ড রিসেট লিঙ্ক আপনার ইমেইলে পাঠানো হয়েছে।');
    } catch (err: any) {
      console.error("Firebase Reset Error", err);
      if (err.code === 'auth/user-not-found') {
        setError('এই ইমেইলের কোনো একাউন্ট পাওয়া যায়নি।');
      } else {
        setError(err.message || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে।');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('এই ইমেইল দিয়ে ইতমধ্যেই একটি একাউন্ট খোলা হয়েছে।');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('ইমেইল অথবা পাসওয়ার্ড ভুল।');
      } else if (err.code === 'auth/weak-password') {
        setError('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('ইমেইল/পাসওয়ার্ড লগইন চালু নেই। দয়া করে গুগল দিয়ে লগইন করুন।');
      } else {
        console.error("Firebase Auth Error", err);
        setError(err.message || 'একটি সমস্যা হয়েছে, আবার চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google Auth Error", err);
      setError(err.message || 'গুগল লগইন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full bg-black/40 border-t border-l border-white/10 border-b border-r border-black/50 rounded-2xl px-4 py-3 outline-none focus:border-[#00e676]/50 focus:ring-1 focus:ring-[#00e676]/30 transition-all font-medium text-white placeholder-white/30 shadow-[inset_2px_4px_16px_rgba(0,0,0,0.6)] text-sm`;

  return (
    <div className={`w-full min-h-[100dvh] flex flex-col justify-center items-center p-4 selection:bg-[#00e676]/30 relative overflow-hidden ${isDark ? 'bg-[#050b14]' : 'bg-slate-100'}`}>
      
      {/* Background Ambience */}
      <div className={`absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none ${isDark ? 'bg-[#00e676]/10' : 'bg-[#00e676]/20'}`}></div>
      <div className={`absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none ${isDark ? 'bg-[#4facfe]/10' : 'bg-purple-300/30'}`}></div>

      <div className={`w-full max-w-[360px] relative z-10 p-7 rounded-[2rem] ${isDark ? 'bg-[#0a1120]/60 border-t border-l border-white/10 border-b border-r border-black/80 shadow-[10px_20px_40px_rgba(0,0,0,0.8),inset_1px_1px_0px_rgba(255,255,255,0.05)]' : 'bg-white/80 border-t border-l border-white border-b border-slate-300 shadow-[10px_20px_40px_rgba(0,0,0,0.1),inset_1px_1px_0px_rgba(255,255,255,1)]'} backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-8 duration-700`}>
        
        {/* 3D Logo Container */}
        <div className="flex justify-center mb-6 relative">
           <div className={`absolute inset-0 blur-[30px] rounded-full scale-[1.3] ${isDark ? 'bg-[#00e676]/20' : 'bg-[#00e676]/30'}`}></div>
           <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center p-1.5 overflow-hidden group transform hover:scale-[1.03] transition-all duration-500 ${isDark ? 'bg-gradient-to-br from-white/10 to-black/60 shadow-[4px_8px_16px_rgba(0,0,0,0.6),inset_1px_1px_2px_rgba(255,255,255,0.2)] border-t border-l border-white/10 border-b border-r border-black/80' : 'bg-gradient-to-br from-white to-slate-200 shadow-[4px_8px_16px_rgba(0,0,0,0.15),inset_1px_1px_2px_rgba(255,255,255,1)] border-t border-l border-white border-b border-slate-300'}`}>
              <div className="absolute inset-0 flex items-center justify-center relative z-10 bg-white rounded-[1rem]">
                 <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-[#00e676] to-[#047857] drop-shadow-sm font-sans tracking-tight">TR</span>
              </div>
           </div>
        </div>

        <div className="text-center mb-6">
           <h1 className={`text-2xl font-black tracking-tight mb-2 ${isDark ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-slate-800'}`}>
             {isLogin ? 'স্বাগতম' : 'নতুন একাউন্ট'}
           </h1>
           <p className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
             {isLogin ? 'আপনার ড্যাশবোর্ডে প্রবেশ করুন' : 'ট্রেডিং জার্নি শুরু করতে রেজিস্টার করুন'}
           </p>
        </div>

        {error && (
           <div className="mb-6 p-3 bg-red-500/10 border-t border-l border-red-400/30 border-b border-r border-red-900/50 rounded-xl text-red-400 text-xs font-semibold text-center animate-in fade-in slide-in-from-top-2 shadow-[inset_0_2px_10px_rgba(255,0,0,0.1)] backdrop-blur-md">
             {error}
           </div>
        )}

        {message && (
           <div className="mb-6 p-3 bg-[#00e676]/10 border-t border-l border-[#00e676]/30 border-b border-r border-[#00e676]/50 rounded-xl text-[#00e676] text-xs font-semibold text-center animate-in fade-in slide-in-from-top-2 shadow-[inset_0_2px_10px_rgba(0,255,100,0.1)] backdrop-blur-md">
             {message}
           </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
             <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
               <svg className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-slate-400'} group-focus-within:text-[#00e676] transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
             </div>
             <input 
               type="email" 
               required
               value={email}
               onChange={e => setEmail(e.target.value)}
               className={`${inputClass} !pl-10 ${!isDark && '!bg-white/50 !text-slate-800 !placeholder-slate-400 !shadow-[inset_2px_4px_10px_rgba(0,0,0,0.05)] !border-white/50'}`} 
               placeholder="hi@example.com" 
             />
          </div>
          <div className="relative group">
             <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
               <svg className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-slate-400'} group-focus-within:text-[#00e676] transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             </div>
             <input 
               type={showPassword ? "text" : "password"} 
               required
               value={password}
               onChange={e => setPassword(e.target.value)}
               className={`${inputClass} !pl-10 !pr-10 ${!isDark && '!bg-white/50 !text-slate-800 !placeholder-slate-400 !shadow-[inset_2px_4px_10px_rgba(0,0,0,0.05)] !border-white/50'}`} 
               placeholder="••••••••" 
               minLength={6}
             />
             <button 
               type="button"
               onClick={() => setShowPassword(!showPassword)}
               className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#00e676] transition-colors"
             >
               {showPassword ? (
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
               ) : (
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
               )}
             </button>
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={handleResetPassword}
                className={`text-xs font-semibold transition-colors ${isDark ? 'text-white/50 hover:text-white/80' : 'text-slate-500 hover:text-slate-800'}`}
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full relative overflow-hidden py-3 px-4 rounded-xl shadow-[0_6px_20px_rgba(0,230,118,0.3),inset_0_1px_3px_rgba(255,255,255,0.4)] hover:shadow-[0_10px_25px_rgba(0,230,118,0.4),inset_0_1px_3px_rgba(255,255,255,0.5)] active:translate-y-0.5 transition-all mt-6 flex justify-center items-center gap-2 group ${isDark ? 'bg-gradient-to-b from-[#00e676] to-[#047857] border-t border-[#00e676] border-b border-[#022c22]' : 'bg-gradient-to-b from-[#22c55e] to-[#16a34a] border-t border-[#4ade80] border-b border-[#14532d]'}`}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out"></div>
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span className="text-white font-bold tracking-wide text-sm drop-shadow-md">
                {isLogin ? 'লগইন করুন' : 'রেজিস্টার করুন'}
              </span>
            )}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between">
           <span className="border-b border-white/10 w-1/5 lg:w-1/4"></span>
           <span className={`text-xs text-center uppercase ${isDark ? 'text-white/40' : 'text-slate-400'}`}>অথবা</span>
           <span className="border-b border-white/10 w-1/5 lg:w-1/4"></span>
        </div>

        <button 
           onClick={handleGoogleSignIn}
           disabled={loading}
           className={`w-full mt-4 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-sm hover:shadow-md active:translate-y-0.5 ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-white' : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'}`}
        >
           <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" fillRule="evenodd" d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
           </svg>
           {isLogin ? 'গুগল দিয়ে লগইন' : 'গুগল দিয়ে রেজিস্টার'}
        </button>

        <div className="mt-8 text-center">
           <button 
             type="button"
             onClick={() => { setIsLogin(!isLogin); setError(''); }}
             className={`text-xs font-bold transition-all hover:scale-105 inline-block pb-1 border-b-2 border-transparent hover:border-[#00e676] ${isDark ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
           >
             {isLogin ? 'একাউন্ট নেই? রেজিস্ট্রেশন করুন' : 'ইতমধ্যেই একাউন্ট আছে? লগইন করুন'}
           </button>
        </div>

      </div>
    </div>
  );
}
