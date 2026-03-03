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

const COLLECTION_NAME = 'contacts';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  userId: string;
  connectionId: string;
  createdAt: Timestamp;
}

export const contactsService = {
  // Criar novo contato
  create: async (userId: string, connectionId: string, name: string, phone: string) => {
    return addDoc(collection(db, COLLECTION_NAME), {
      name,
      phone,
      userId,
      connectionId,
      createdAt: Timestamp.now()
    });
  },

  // Listar todos os contatos da conexão (Real-time)
  subscribe: (userId: string, connectionId: string, callback: (contacts: Contact[]) => void) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('connectionId', '==', connectionId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const contacts = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Contact))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      callback(contacts);
    });
  },

  // Listar todos os contatos da conexão (One-time fetch - Legacy/Backup)
  getAll: async (userId: string, connectionId: string) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('connectionId', '==', connectionId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Contact))
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  },

  // Atualizar contato
  update: async (id: string, data: { name: string; phone: string }) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    return updateDoc(docRef, data);
  },

  // Deletar contato
  delete: async (id: string) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    return deleteDoc(docRef);
  }
};
