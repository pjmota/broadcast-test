import { Timestamp } from 'firebase-admin/firestore';

// --- Entidades ---

export interface User {
  id: string; // uid
  email: string;
  createdAt: Timestamp;
}

export interface Connection {
  id: string;
  clientId: string; // uid do usuário autenticado
  name: string;
  createdAt: Timestamp;
}

export interface Contact {
  id: string;
  clientId: string;
  connectionId: string;
  name: string;
  phone: string;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  clientId: string;
  connectionId: string;
  contactIds: string[];
  content: string;
  status: 'scheduled' | 'sent';
  scheduledAt: Timestamp | null;
  sentAt: Timestamp | null;
  createdAt: Timestamp;
}

// --- Coleções (Raiz) ---
export const COLLECTIONS = {
  USERS: 'users',
  CONNECTIONS: 'connections',
  CONTACTS: 'contacts',
  MESSAGES: 'messages'
} as const;
