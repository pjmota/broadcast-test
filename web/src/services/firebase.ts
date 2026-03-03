import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Fallback para hardcoded values caso o .env falhe
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDFVbdOqsmH5yI0pACxxZkJUWBypz0tR9M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "broadcast-saas-dev.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "broadcast-saas-dev",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "broadcast-saas-dev.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "578319146863",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:578319146863:web:9ed74b8bf82df05f7b529a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
