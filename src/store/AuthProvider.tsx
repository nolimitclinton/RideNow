// src/store/AuthProvider.tsx
import React, { createContext, useEffect, useState, useContext } from 'react';
import { onAuthStateChanged, User, reload } from 'firebase/auth';
import { auth } from '../services/firebase';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';

type Ctx = {
  user: User | null | undefined;   
  verified: boolean;               
  authReady: boolean;              
};

const AuthCtx = createContext<Ctx>({
  user: undefined,
  verified: false,
  authReady: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [verified, setVerified] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    let unsubUserDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setAuthReady(false);
      setUser(u ?? null);
      setVerified(false);

      if (!u) {
        if (unsubUserDoc) unsubUserDoc();
        unsubUserDoc = null;
        setAuthReady(true); 
        return;
      }

      try {
        await reload(u);
      } catch {
        
      }

      const ref = doc(db, 'users', u.uid);
      if (unsubUserDoc) unsubUserDoc();
      unsubUserDoc = onSnapshot(
        ref,
        (snap) => {
          const v =
            (snap.exists() && !!snap.data()?.verified) || !!u.emailVerified;
          setVerified(v);
          setAuthReady(true); 
        },
        () => {
          setVerified(!!u.emailVerified);
          setAuthReady(true);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, [db]);

  return (
    <AuthCtx.Provider value={{ user, verified, authReady }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);