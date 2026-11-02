import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import defaultFirebaseConfig from '../../firebase-applet-config.json';

// Dynamic Resolution: Priority given to GitHub Secrets / Environment Variables (VITE_FIREBASE_*)
// with safe fallback to firebase-applet-config.json
const env = (typeof import.meta !== 'undefined' && import.meta.env) 
  ? import.meta.env 
  : ({} as Record<string, string | undefined>);

export const firebaseConfig = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  appId: env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
  apiKey: env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  firestoreDatabaseId: 
    env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || 
    env.VITE_FIREBASE_DATABASE_ID || 
    defaultFirebaseConfig.firestoreDatabaseId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || defaultFirebaseConfig.measurementId || '',
  oAuthClientId: env.VITE_FIREBASE_OAUTH_CLIENT_ID || defaultFirebaseConfig.oAuthClientId || '',
  recaptchaSiteKey: env.VITE_FIREBASE_RECAPTCHA_SITE_KEY || defaultFirebaseConfig.recaptchaSiteKey || ''
};

// Initialize Firebase App (reuse app if already initialized)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Informative flag indicating whether secrets were injected
export const isLoadedFromSecrets = Boolean(
  env.VITE_FIREBASE_PROJECT_ID || 
  env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || 
  env.VITE_FIREBASE_API_KEY
);

// Connectivity validation helper
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
      return false;
    }
    // Any permission or missing document error means server is connected and reachable
    return true;
  }
}

