import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Safe configuration with fallbacks
const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || metaEnv.VITE_FIREBASE_API_KEY || '',
  authDomain: firebaseConfigJson.authDomain || metaEnv.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: firebaseConfigJson.projectId || metaEnv.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: firebaseConfigJson.storageBucket || metaEnv.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: firebaseConfigJson.messagingSenderId || metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: firebaseConfigJson.appId || metaEnv.VITE_FIREBASE_APP_ID || '',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  
  const customDatabaseId = firebaseConfigJson.firestoreDatabaseId;
  if (customDatabaseId && customDatabaseId !== '(default)' && customDatabaseId.trim() !== '') {
    db = getFirestore(app, customDatabaseId);
  } else {
    db = getFirestore(app);
  }
} catch (err) {
  console.warn('Firebase initialization notice:', err);
  // Fallback graceful instance if offline or missing credentials
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export { app, auth, db };
