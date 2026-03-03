import { connectionsService } from '../../services/connections.service';
import { contactsService } from '../../services/contacts.service';
import { useAuth } from '../../app/providers/AuthProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { useState } from 'react';
import { Button } from '@mui/material';

export const TestDataGenerator = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateData = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      // 1. Criar conexão
      const connRef = await connectionsService.create(currentUser.uid, 'Conexão Teste 01');
      const connectionId = connRef.id;

      // 2. Criar 2 contatos
      await contactsService.create(currentUser.uid, connectionId, 'Contato Teste A', '11999990000');
      await contactsService.create(currentUser.uid, connectionId, 'Contato Teste B', '11999991111');

      showToast('Dados de teste gerados com sucesso!', 'success');
      // Recarregar página para ver mudanças
      window.location.reload();
    } catch (error) {
      console.error(error);
      showToast('Erro ao gerar dados de teste', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outlined" 
      color="secondary" 
      onClick={generateData} 
      disabled={loading}
      size="small"
    >
      {loading ? 'Gerando...' : 'Gerar Dados de Teste'}
    </Button>
  );
};