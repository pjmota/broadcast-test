import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User,
  type AuthError
} from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export const authService = {
  // Observar mudanças no estado de autenticação
  observeAuthState: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // Login
  login: async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  // Logout
  logout: async () => {
    return signOut(auth);
  },

  // Registro com criação de documento de usuário
  register: async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Criar documento do usuário no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      createdAt: Timestamp.now(),
      role: 'user', // papel padrão
      status: 'active'
    });

    return userCredential;
  },
  
  // Tratamento de erros
  getErrorMessage: (error: AuthError | any): string => {
    const errorCode = error?.code || '';
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso por outra conta.';
      case 'auth/invalid-email':
        return 'O endereço de e-mail é inválido.';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-mail ou senha incorretos.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas falhas. Tente novamente mais tarde.';
      default:
        return error?.message || 'Ocorreu um erro ao tentar autenticar. Tente novamente.';
    }
  }
};
