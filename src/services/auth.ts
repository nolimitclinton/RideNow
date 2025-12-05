import { auth, db, storage } from './firebase';
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
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export type SignUpPayload = {
  name: string;
  email: string;
  password: string;
  country?: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other' | '';
  profileImageUri?: string | null;
};

// --- helpers ---

function makeCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

async function createVerificationCode(uid: string): Promise<string> {
  const code = makeCode();
  await setDoc(doc(db, 'verificationCodes', uid), {
    code,
    createdAt: serverTimestamp(),
  });
  console.log('[DEV] Verification code for', uid, '→', code);
  return code;
}

async function isVerified(user: User): Promise<boolean> {
  await reload(user);
  if (user.emailVerified) return true;

  const snap = await getDoc(doc(db, 'users', user.uid));
  const v = snap.exists() ? !!snap.data()?.verified : false;
  return v;
}

// Upload profile image from local URI to Storage
async function uploadProfileImage(uid: string, uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const fileRef = ref(storage, `users/${uid}/avatar.jpg`);
  await uploadBytes(fileRef, blob);
  const url = await getDownloadURL(fileRef);
  return url;
}

// --- public API ---

export async function signUpEmail(payload: SignUpPayload) {
  const {
    name,
    email,
    password,
    country,
    phone,
    gender,
    profileImageUri,
  } = payload;

  const cred = await createUserWithEmailAndPassword(auth, email, password);

  let photoURL: string | null = cred.user.photoURL ?? null;

  // First set displayName, then handle avatar upload
  if (name) {
    await updateProfile(cred.user, { displayName: name });
  }

  if (profileImageUri) {
    try {
      const uploadedUrl = await uploadProfileImage(cred.user.uid, profileImageUri);
      photoURL = uploadedUrl;
      await updateProfile(cred.user, { photoURL });
    } catch (e) {
      console.warn('uploadProfileImage failed:', e);
    }
  }

  await setDoc(
    doc(db, 'users', cred.user.uid),
    {
      name: name || '',
      email: cred.user.email,
      photoURL,
      provider: 'password',
      country: country || null,
      phone: phone || null,
      gender: gender || null,
      verified: false,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  try {
    await sendEmailVerification(cred.user);
  } catch (e) {
    console.warn('sendEmailVerification failed (dev ok):', e);
  }

  // Dev-friendly code flow (for fake emails / simulator)
  await createVerificationCode(cred.user.uid);

  return cred.user;
}

export async function signInEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  const ok = await isVerified(cred.user);
  if (!ok) {
    await signOut(auth);
    const err: any = new Error('Account not verified');
    err.code = 'auth/account-not-verified';
    throw err;
  }
  return cred.user;
}

/**
 * Resends both the email and a dev 6-digit code.
 * Returns the code so the UI can show it in an Alert on the simulator.
 */
export async function resendVerificationEmail(): Promise<string> {
  if (!auth.currentUser) throw new Error('Not signed in');
  try {
    await sendEmailVerification(auth.currentUser);
  } catch (e) {
    console.warn('sendEmailVerification failed:', e);
  }
  const code = await createVerificationCode(auth.currentUser.uid);
  return code;
}

export async function verifyWithCode(inputCode: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');

  const ref = doc(db, 'verificationCodes', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('No verification code found');

  const real = String(snap.data()?.code || '');
  if (inputCode.trim() !== real) {
    throw new Error('Invalid code');
  }

  await updateDoc(doc(db, 'users', user.uid), { verified: true });
  await deleteDoc(ref);
  return true;
}

export async function refreshCurrentUser() {
  if (!auth.currentUser) throw new Error('Not signed in');
  await reload(auth.currentUser);
  return auth.currentUser;
}

export function logOut() {
  return signOut(auth);
}