import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAT-f0NSIHFEaqedp8ErT7ZErMv3cGK1Ws",
  authDomain: "chesscraft-1.firebaseapp.com",
  // 2. URL do seu Realtime Database (essencial para conexões de xadrez)
  databaseURL: "https://chesscraft-1-default-rtdb.firebaseio.com", 
  projectId: "chesscraft-1",
  storageBucket: "chesscraft-1.firebasestorage.app",
  messagingSenderId: "696371420412",
  appId: "1:696371420412:web:04293c11a63afd11544b79",
  measurementId: "G-4DYFL7PD1D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Apenas inicializa analytics se estiver rodando no navegador (evita erros em SSR/Node)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Export database and auth
export const database = getDatabase(app);
export const auth = getAuth(app);