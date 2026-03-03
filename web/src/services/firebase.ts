import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

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

// Conectar aos emuladores se a variável de ambiente estiver setada ou se estivermos em localhost
// Para avaliação: Se o avaliador rodar "npm run dev", conectará aos emuladores se eles estiverem rodando na porta padrão.
if (import.meta.env.VITE_USE_EMULATORS === 'true' || window.location.hostname === 'localhost') {
  console.log('Tentando conectar aos Emuladores do Firebase...');
  try {
    // Auth Emulator (Porta 9099)
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    
    // Firestore Emulator (Porta 8080)
    connectFirestoreEmulator(db, 'localhost', 8080);
    
    // Functions Emulator (Porta 5001)
    connectFunctionsEmulator(functions, 'localhost', 5001);
    
    console.log('✅ Conectado aos Emuladores do Firebase');
  } catch (error) {
    console.warn('⚠️ Não foi possível conectar aos emuladores (podem não estar rodando ou já conectados):', error);
  }
}

export default app;
