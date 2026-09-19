import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

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


const app = initializeApp(firebaseConfig);


export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;


export const database = getDatabase(app);
export const auth = getAuth(app);