import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Connection } from '../../services/connections.service';

interface ConnectionContextType {
  currentConnection: Connection | null;
  selectConnection: (connection: Connection | null) => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [currentConnection, setCurrentConnection] = useState<Connection | null>(() => {
    const saved = localStorage.getItem('currentConnection');
    return saved ? JSON.parse(saved) : null;
  });

  const selectConnection = (connection: Connection | null) => {
    setCurrentConnection(connection);
    if (connection) {
      localStorage.setItem('currentConnection', JSON.stringify(connection));
    } else {
      localStorage.removeItem('currentConnection');
    }
  };

  return (
    <ConnectionContext.Provider value={{ currentConnection, selectConnection }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}
