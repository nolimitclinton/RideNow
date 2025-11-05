// src/store/AuthProvider.tsx
import React, { createContext, useEffect, useState, useContext } from 'react';
import { onAuthStateChanged, User, reload } from 'firebase/auth';
import { auth } from '../services/firebase';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';

type Ctx = {
  user: User | null | undefined;   // undefined: booting, null: signed out, User: signed in
  verified: boolean;               // emailVerified OR users/{uid}.verified
};
const AuthCtx = createContext<Ctx>({ user: undefined, verified: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [verified, setVerified] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    let unsubUserDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u ?? null);
      setVerified(false);

      if (!u) {
        if (unsubUserDoc) unsubUserDoc();
        unsubUserDoc = null;
        return;
      }

      // refresh emailVerified
      try { await reload(u); } catch {}

      // Watch users/{uid} so the UI auto-updates the instant we mark verified:true
      const ref = doc(db, 'users', u.uid);
      unsubUserDoc = onSnapshot(ref, (snap) => {
        const v = (snap.exists() && !!snap.data()?.verified) || !!u.emailVerified;
        setVerified(v);
      });
    });

    return () => {
      unsubAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, [db]);

  return <AuthCtx.Provider value={{ user, verified }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);