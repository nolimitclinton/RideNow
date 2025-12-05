import 'react-native-get-random-values';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import type { Auth, Persistence } from 'firebase/auth';
import * as AuthMod from 'firebase/auth'; 
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

type RNGetPersistence = (storage: typeof AsyncStorage) => Persistence;
const getReactNativePersistence =
  (AuthMod as any).getReactNativePersistence as RNGetPersistence | undefined;

let auth: Auth;

if (Platform.OS === 'web') {
  auth = AuthMod.getAuth(app);
} else {
  try {
    if (getReactNativePersistence) {
      auth = AuthMod.initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } else {
      auth = AuthMod.initializeAuth(app, {});
    }
  } catch {
    auth = AuthMod.getAuth(app);
  }
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };