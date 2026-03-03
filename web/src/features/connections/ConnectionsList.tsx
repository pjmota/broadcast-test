import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { useAuth } from '../../app/providers/AuthProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { useConnection } from '../../app/providers/ConnectionProvider';
import { connectionsService, type Connection } from '../../services/connections.service';
import { useNavigate } from 'react-router-dom';

export default function ConnectionsList() {
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
        // Edit
        await connectionsService.update(currentConnection.id, nameInput);
        showToast('Conexão atualizada com sucesso', 'success');
      } else {
        // Create
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

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 3, bgcolor: 'background.default' }}>
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Minhas Conexões
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => handleOpenDialog()}
              >
                Nova Conexão
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : connections.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              Nenhuma conexão encontrada. Crie a primeira!
            </Typography>
          ) : (
            <List>
            {connections.map((connection) => (
              <ListItem 
                key={connection.id}
                divider
                component="div"
              >
                <ListItemText 
                  primary={connection.name}
                  secondary={`Criada em: ${connection.createdAt.toDate().toLocaleDateString()}`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="open" onClick={() => handleSelectConnection(connection)} sx={{ mr: 1 }} color="primary">
                    <ArrowForwardIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="edit" onClick={(e) => { e.stopPropagation(); handleOpenDialog(connection); }} sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); handleDelete(connection.id); }}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{currentConnection ? 'Editar Conexão' : 'Nova Conexão'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nome da Conexão"
            type="text"
            fullWidth
            variant="outlined"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
