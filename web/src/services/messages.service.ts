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
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'messages';

export type MessageStatus = 'sent' | 'scheduled';

export interface Message {
  id: string;
  userId: string;
  connectionId: string;
  content: string;
  contactIds: string[]; // IDs dos contatos selecionados
  status: MessageStatus;
  scheduledAt: Timestamp; // Se for envio imediato, usa o momento atual
  createdAt: Timestamp;
}

export const messagesService = {
  // Criar nova mensagem (enviada ou agendada)
  create: async (userId: string, connectionId: string, content: string, contactIds: string[], scheduledAt?: Date) => {
    const now = new Date();
    const isScheduled = scheduledAt && scheduledAt > now;
    
    return addDoc(collection(db, COLLECTION_NAME), {
      userId,
      connectionId,
      content,
      contactIds,
      status: isScheduled ? 'scheduled' : 'sent',
      scheduledAt: Timestamp.fromDate(scheduledAt || now),
      createdAt: Timestamp.now()
    });
  },

  // Listar mensagens da conexão (Real-time)
  subscribe: (userId: string, connectionId: string, status: MessageStatus | undefined, callback: (messages: Message[]) => void) => {
    let q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('connectionId', '==', connectionId)
    );

    if (status) {
      q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('connectionId', '==', connectionId),
        where('status', '==', status)
      );
    }
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Message))
        .sort((a, b) => b.scheduledAt.toMillis() - a.scheduledAt.toMillis());
      callback(messages);
    });
  },

  // Listar mensagens da conexão (One-time fetch - Legacy/Backup)
  getAll: async (userId: string, connectionId: string, status?: MessageStatus) => {
    let q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('connectionId', '==', connectionId)
    );

    if (status) {
      q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('connectionId', '==', connectionId),
        where('status', '==', status)
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message))
      .sort((a, b) => b.scheduledAt.toMillis() - a.scheduledAt.toMillis());
  },

  // Atualizar mensagem
  update: async (id: string, data: Partial<Omit<Message, 'id' | 'userId' | 'createdAt'>>) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    return updateDoc(docRef, data);
  },

  // Deletar mensagem
  delete: async (id: string) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    return deleteDoc(docRef);
  },

  // Verificar e processar mensagens agendadas que já deveriam ter sido enviadas
  processScheduledMessages: async (userId: string) => {
    const now = Timestamp.now();
    
    // Busca mensagens agendadas do usuário
    // Nota: Filtramos por data no cliente para evitar necessidade de índice composto
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('status', '==', 'scheduled')
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return 0;

    const batch = writeBatch(db);
    let count = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data() as Message;
      // Verifica se a data agendada já passou
      if (data.scheduledAt && data.scheduledAt.toMillis() <= now.toMillis()) {
        batch.update(doc.ref, { status: 'sent' });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }
    
    return count;
  },

  // Buscar última mensagem individual com um contato
  getLastMessageWithContact: async (userId: string, connectionId: string, contactId: string) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('connectionId', '==', connectionId),
      where('contactIds', 'array-contains', contactId)
    );

    const snapshot = await getDocs(q);
    
    // Filtrar no cliente por mensagens individuais (tamanho 1) e ordenar por data
    const individualMessages = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Message))
      .filter(msg => msg.contactIds.length === 1 && msg.contactIds[0] === contactId)
      .sort((a, b) => b.scheduledAt.toMillis() - a.scheduledAt.toMillis());

    return individualMessages.length > 0 ? individualMessages[0] : null;
  }
};
