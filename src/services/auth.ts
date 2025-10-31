import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
  reload,
  signOut,
  User,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';

let notify: ((code: string) => Promise<void>) | null = null;
export function setVerificationNotifier(fn: (code: string) => Promise<void>) {
  notify = fn;
}

const makeCode = () => Math.floor(100000 + Math.random() * 900000).toString();

async function createVerificationCode(uid: string) {
  const code = makeCode();
  await setDoc(doc(db, 'verificationCodes', uid), { code, createdAt: serverTimestamp() });
  console.log('[DEV] Verification code for', uid, '→', code);
  if (notify) await notify(code); 
  return code;
}

async function isVerified(user: User) {
  await reload(user);
  if (user.emailVerified) return true;
  const snap = await getDoc(doc(db, 'users', user.uid));
  return snap.exists() ? !!snap.data()?.verified : false;
}

export async function signUpEmail(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });

  await setDoc(
    doc(db, 'users', cred.user.uid),
    {
      name: name || '',
      email: cred.user.email,
      photoURL: cred.user.photoURL ?? null,
      provider: 'password',
      verified: false,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  try { await sendEmailVerification(cred.user); } catch {}

  await createVerificationCode(cred.user.uid);

  return cred.user;
}

export async function signInEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  if (!(await isVerified(cred.user))) {
    await signOut(auth);
    const err: any = new Error('Account not verified');
    err.code = 'auth/account-not-verified';
    throw err;
  }
  return cred.user;
}

export async function resendVerificationEmail() {
  if (!auth.currentUser) throw new Error('Not signed in');
  try { await sendEmailVerification(auth.currentUser); } catch {}
  await createVerificationCode(auth.currentUser.uid); 
}

export async function verifyWithCode(inputCode: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');

  const ref = doc(db, 'verificationCodes', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('No verification code found');

  const real = String(snap.data()?.code || '');
  if (inputCode.trim() !== real) throw new Error('Invalid code');

  await setDoc(doc(db, 'users', user.uid), { verified: true }, { merge: true });
  await deleteDoc(ref);
  return true;
}

export async function refreshCurrentUser() {
  if (!auth.currentUser) throw new Error('Not signed in');
  await reload(auth.currentUser);
  return auth.currentUser;
}

export function logOut() { return signOut(auth); }