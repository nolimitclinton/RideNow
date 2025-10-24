import 'react-native-get-random-values';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, type Persistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function resolveRnPersistence():
  | ((storage: any) => Persistence)
  | null {
  try {
    const modA = require('firebase/auth');
    if (modA?.getReactNativePersistence) return modA.getReactNativePersistence;

    const modB = require('firebase/auth/react-native');
    if (modB?.getReactNativePersistence) return modB.getReactNativePersistence;
  } catch {
    
  }
  return null;
}

let auth = getAuth(app);

if (Platform.OS !== 'web') {
  const getRNP = resolveRnPersistence();
  if (getRNP) {
    try {
      auth = initializeAuth(app, {
        persistence: getRNP(AsyncStorage),
      });
    } catch {
     
      auth = getAuth(app);
    }
  } else {
  
    try {
      auth = initializeAuth(app, {});
    } catch {
      auth = getAuth(app);
    }
  }
}

const db = getFirestore(app);

export { app, auth, db };