import React, { createContext, useEffect, useState, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';

type Ctx = { user: User | null | undefined };
const AuthCtx = createContext<Ctx>({ user: undefined });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  return <AuthCtx.Provider value={{ user }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);