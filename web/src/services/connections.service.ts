import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

export interface Connection {
  id: string;
  name: string;
  userId: string;
  createdAt: Timestamp;
}

const COLLECTION_NAME = 'connections';

export const connectionsService = {
  // Criar nova conexão
  create: async (userId: string, name: string) => {
    return addDoc(collection(db, COLLECTION_NAME), {
      name,
      userId,
      createdAt: Timestamp.now()
    });
  },

  // Listar conexões do usuário (Real-time)
  subscribe: (userId: string, callback: (connections: Connection[]) => void) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const connections = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Connection))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      callback(connections);
    });
  },

  // Listar conexões do usuário (One-time fetch - Legacy/Backup)
  getAll: async (userId: string) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Connection))
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  },

  // Atualizar conexão
  update: async (id: string, name: string) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    return updateDoc(docRef, { name });
  },

  // Deletar conexão
  delete: async (id: string) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    return deleteDoc(docRef);
  }
};
