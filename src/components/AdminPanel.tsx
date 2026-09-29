import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useStore } from '../store/useStore';

export function AdminPanel({ onSwitchToDashboard }: { onSwitchToDashboard?: () => void }) {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    const usersRef = collection(db, 'users');
    const unsub = onSnapshot(usersRef, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setFetchError(error.message);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { status: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (e) {
      console.error("Error updating user:", e);
    }
  };

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className={`w-full min-h-[100dvh] flex flex-col ${isDark ? 'bg-[#050b14] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`w-full px-6 py-4 flex justify-between items-center shadow-md z-10 sticky top-0 ${isDark ? 'bg-[#0b121e]/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#059669] flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Admin Panel</h1>
            <p className="text-xs text-[#059669] font-medium">TR Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onSwitchToDashboard && (
            <button 
              onClick={onSwitchToDashboard}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#059669] hover:bg-[#047857] text-white transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>ট্রেডিং ড্যাশবোর্ড</span>
            </button>
          )}
          <button onClick={handleLogout} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
            লগআউট
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto p-6 overflow-y-auto w-full">
        <h2 className="text-xl font-bold mb-6">User Management</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#059669] border-t-transparent animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border ${isDark ? 'bg-[#0b121e] border-white/10' : 'bg-white border-slate-200'}`}>
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <svg className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>কোনো ইউজার নেই</h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              এখন পর্যন্ত কোনো ইউজার রেজিস্ট্রেশন করেনি। কেউ রেজিস্ট্রেশন করলে এখানে দেখতে পাবেন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(user => (
              <div key={user.id} className={`rounded-2xl p-5 border relative flex flex-col ${isDark ? 'bg-[#0b121e] border-white/10 shadow-lg' : 'bg-white border-slate-200 shadow-sm'}`}>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name || user.email} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white font-bold text-lg">
                           {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                         </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-base line-clamp-1">{user.name || (user.email ? user.email.split('@')[0] : 'অজ্ঞাত')}</h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                    </div>
                  </div>
                  
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    user.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                    user.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                    'bg-amber-500/10 text-amber-500'
                  }`}>
                    {user.status || 'pending'}
                  </span>
                </div>

                <div className="space-y-2 mb-6 flex-1">
                  <div className={`flex justify-between text-sm py-1.5 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>বয়স / জেন্ডার</span>
                    <span className="font-semibold">{user.age || 'N/A'} / {user.gender === 'Female' ? 'নারী' : 'পুরুষ'}</span>
                  </div>
                  <div className={`flex justify-between text-sm py-1.5 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                     <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ঠিকানা</span>
                     <span className="font-semibold truncate max-w-[150px] text-right" title={user.address}>{user.address || 'N/A'}</span>
                  </div>
                  <div className={`flex justify-between text-sm py-1.5 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>অভিজ্ঞতা</span>
                    <span className="font-semibold">{user.experienceYears || '0'} বছর</span>
                  </div>
                  <div className={`flex justify-between text-sm py-1.5 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                     <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>শুরুর ব্যালেন্স</span>
                     <span className="font-bold text-[#059669]">${user.startingBalance || '0'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                   {(!user.status || user.status === 'pending') ? (
                     <>
                        <button onClick={() => updateUserStatus(user.id, 'rejected')} className={`py-2 rounded-xl text-sm font-bold transition-colors ${isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                          Reject
                        </button>
                        <button onClick={() => updateUserStatus(user.id, 'approved')} className="bg-[#059669] hover:bg-[#00c853] text-white py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#059669]/20">
                          Approve
                        </button>
                     </>
                   ) : user.status === 'rejected' ? (
                      <button onClick={() => updateUserStatus(user.id, 'approved')} className="col-span-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 py-2 rounded-xl text-sm font-bold transition-all">
                        Approve Now
                      </button>
                   ) : (
                      <button onClick={() => updateUserStatus(user.id, 'rejected')} className="col-span-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 py-2 rounded-xl text-sm font-bold transition-all border border-red-500/20">
                        Revoke Access
                      </button>
                   )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
