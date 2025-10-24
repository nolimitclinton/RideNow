import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function signUpEmail(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });

  await setDoc(doc(db, 'users', cred.user.uid), {
    name: name || '',
    email: cred.user.email,
    photoURL: cred.user.photoURL ?? null,
    createdAt: serverTimestamp(),
  }, { merge: true });

  return cred.user;
}

export async function signInEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export function logOut() {
  return signOut(auth);
}