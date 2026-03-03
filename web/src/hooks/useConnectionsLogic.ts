import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/providers/AuthProvider';
import { useToast } from '../app/providers/ToastProvider';
import { useConnection } from '../app/providers/ConnectionProvider';
import { connectionsService, type Connection } from '../services/connections.service';

export function useConnectionsLogic() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { selectConnection } = useConnection();
  const navigate = useNavigate();
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentConnection, setCurrentConnection] = useState<Connection | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Reset connection on mount to ensure user is in "no connection" context when in list
    selectConnection(null);
    
    if (currentUser) {
      const unsubscribe = connectionsService.subscribe(currentUser.uid, (data) => {
        setConnections(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleSelectConnection = (connection: Connection) => {
    selectConnection(connection);
    navigate('/contacts');
  };

  const handleOpenDialog = (connection?: Connection) => {
    if (connection) {
      setCurrentConnection(connection);
      setNameInput(connection.name);
    } else {
      setCurrentConnection(null);
      setNameInput('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentConnection(null);
    setNameInput('');
  };

  const handleSubmit = async () => {
    if (!nameInput.trim()) {
      showToast('O nome da conexão é obrigatório', 'warning');
      return;
    }

    if (!currentUser) return;

    setSubmitting(true);
    try {
      if (currentConnection) {
        await connectionsService.update(currentConnection.id, nameInput);
        showToast('Conexão atualizada com sucesso', 'success');
      } else {
        await connectionsService.create(currentUser.uid, nameInput);
        showToast('Conexão criada com sucesso', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      console.error(error);
      showToast('Erro ao salvar conexão', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conexão?')) {
      try {
        await connectionsService.delete(id);
        showToast('Conexão excluída com sucesso', 'success');
      } catch (error) {
        console.error(error);
        showToast('Erro ao excluir conexão', 'error');
      }
    }
  };

  return {
    connections,
    loading,
    openDialog,
    currentConnection,
    nameInput,
    submitting,
    
    setNameInput,
    
    handleSelectConnection,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleDelete
  };
}
