import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAT-f0NSIHFEaqedp8ErT7ZErMv3cGK1Ws",
  authDomain: "chesscraft-1.firebaseapp.com",
  databaseURL: "https://chesscraft-1-default-rtdb.firebaseio.com",
  projectId: "chesscraft-1",
  storageBucket: "chesscraft-1.firebasestorage.app",
  messagingSenderId: "696371420412",
  appId: "1:696371420412:web:04293c11a63afd11544b79",
  measurementId: "G-4DYFL7PD1D"
};

const canInitializeFirebase = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__chesscraft_firebase_probe__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

let app: FirebaseApp | null = null;
let database: Database | null = null;
let analytics: Analytics | null = null;

try {
  if (canInitializeFirebase()) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    database = getDatabase(app);
  }
} catch (error) {
  console.warn('Firebase unavailable in this browser context; app continues in local-only mode.', error);
}

export { analytics, database };