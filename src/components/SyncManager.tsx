import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export function SyncManager() {
  const storeState = useStore();
  const isUpdatingFromRemote = useRef(false);
  const clientId = useRef(Math.random().toString(36).substring(2, 15));
  const hasReceivedInitialState = useRef(false);

  // Listen to remote changes
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
       if (user) {
          const unsubSnap = onSnapshot(doc(db, 'users', user.uid), (snap) => {
             hasReceivedInitialState.current = true;
             if (snap.exists()) {
                const data = snap.data();
                if (data.appState) {
                   try {
                      const parsed = JSON.parse(data.appState);
                      // If the remote state is from a different client
                      if (parsed.clientId && parsed.clientId !== clientId.current) {
                         isUpdatingFromRemote.current = true;
                         useStore.setState({
                            balance: parsed.balance !== undefined ? parsed.balance : storeState.balance,
                            trades: parsed.trades || [],
                            journals: parsed.journals || [],
                            dailyTarget: parsed.dailyTarget || storeState.dailyTarget,
                            masaniello: parsed.masaniello || storeState.masaniello,
                            profile: parsed.profile || storeState.profile
                         });
                         // Wait a bit before allowing local changes to sync back up
                         setTimeout(() => {
                            isUpdatingFromRemote.current = false;
                         }, 1000);
                      }
                   } catch (e) {
                      console.error("Failed to parse appState", e);
                   }
                }
             }
          });
          return () => unsubSnap();
       }
    });
    return () => unsubAuth();
  }, []);

  // Push local changes
  useEffect(() => {
    if (!auth.currentUser) return;
    if (isUpdatingFromRemote.current) return;
    if (!hasReceivedInitialState.current) return;
    
    const timeout = setTimeout(() => {
       const stateToSave = {
          balance: storeState.balance,
          trades: storeState.trades,
          journals: storeState.journals,
          dailyTarget: storeState.dailyTarget,
          masaniello: storeState.masaniello,
          profile: storeState.profile,
          timestamp: Date.now(),
          clientId: clientId.current
       };
       
       if (!auth.currentUser) return;
       
       updateDoc(doc(db, 'users', auth.currentUser.uid), {
          appState: JSON.stringify(stateToSave),
          currentBalance: storeState.balance,
          startingBalance: storeState.profile.startingBalance,
          name: storeState.profile.name || '',
          avatar: storeState.profile.avatar || null,
          address: storeState.profile.address || '',
          age: storeState.profile.age || '',
          gender: storeState.profile.gender || '',
          experienceYears: storeState.profile.experienceYears || '0',
          experienceMonths: storeState.profile.experienceMonths || '0',
          timezone: storeState.profile.timezone || 'Asia/Dhaka',
          dailyProfitTarget: storeState.profile.dailyProfitTarget || 5,
          targetDays: storeState.profile.targetDays || 30,
          preferredStrategy: storeState.profile.preferredStrategy || 'target'
       }).catch(() => {});
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [
     storeState.balance, 
     storeState.trades, 
     storeState.journals, 
     storeState.dailyTarget, 
     storeState.masaniello, 
     storeState.profile
  ]);

  return null;
}
