import { FirebaseApp, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';

// These come from a .env file at the project root (see .env.example), each prefixed with VITE_
// so Vite exposes it to the browser. None of these values are secret - a Firebase web app's
// config is meant to be visible in the client, real protection lives in the Firestore Security
// Rules (see firestore.rules).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/** True once the person has filled in .env with a real Firebase project. */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

/** Lazily initializes Firebase and returns the Firestore instance, or null if not configured. */
export function getDb(): Firestore | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) app = initializeApp(firebaseConfig);
  if (!db) db = getFirestore(app);
  return db;
}
