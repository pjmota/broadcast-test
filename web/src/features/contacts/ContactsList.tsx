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
  ListItemButton,
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, Search as SearchIcon, Message as MessageIcon } from '@mui/icons-material';
import { InputAdornment } from '@mui/material';
import { useAuth } from '../../app/providers/AuthProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { contactsService, type Contact } from '../../services/contacts.service';
import { connectionsService, type Connection } from '../../services/connections.service';

import { useConnection } from '../../app/providers/ConnectionProvider';
import { useNavigate } from 'react-router-dom';

export default function ContactsList() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { currentConnection, selectConnection } = useConnection();
  const navigate = useNavigate();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  
  // Connection selection state
  const [availableConnections, setAvailableConnections] = useState<Connection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  // Form states
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    contact.phone.includes(searchTerm)
  );

  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeConnections: (() => void) | undefined;
    let unsubscribeContacts: (() => void) | undefined;

    if (!currentConnection) {
      setLoadingConnections(true);
      unsubscribeConnections = connectionsService.subscribe(currentUser.uid, (data) => {
        setAvailableConnections(data);
        setLoadingConnections(false);
      });
    } else {
      setLoading(true);
      unsubscribeContacts = contactsService.subscribe(currentUser.uid, currentConnection.id, (data) => {
        setContacts(data);
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribeConnections) unsubscribeConnections();
      if (unsubscribeContacts) unsubscribeContacts();
    };
  }, [currentUser, currentConnection]);

  const handleNavigateToMessage = (contact: Contact) => {
    navigate('/messages', { state: { contactId: contact.id } });
  };

  if (!currentConnection) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Selecione uma Conexão
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Para gerenciar contatos, você precisa selecionar uma conexão primeiro.
          </Typography>
          
          {loadingConnections ? (
            <CircularProgress />
          ) : (
            <List>
              {availableConnections.map((conn) => (
                <ListItem 
                  key={conn.id} 
                  disablePadding
                  sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1, 
                    mb: 1
                  }}
                >
                  <ListItemButton onClick={() => selectConnection(conn)}>
                    <ListItemText 
                      primary={conn.name} 
                      secondary={`Criado em: ${conn.createdAt?.toDate().toLocaleDateString()}`} 
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              {availableConnections.length === 0 && (
                <Typography color="text.secondary">
                  Nenhuma conexão encontrada. Crie uma na tela de Conexões.
                </Typography>
              )}
            </List>
          )}
          
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Voltar para Conexões
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleOpenDialog = (contact?: Contact) => {
    if (contact) {
      setCurrentContact(contact);
      setNameInput(contact.name);
      setPhoneInput(contact.phone);
    } else {
      setCurrentContact(null);
      setNameInput('');
      setPhoneInput('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentContact(null);
    setNameInput('');
    setPhoneInput('');
  };

  const handleSubmit = async () => {
    if (!nameInput.trim()) {
      showToast('O nome do contato é obrigatório', 'warning');
      return;
    }
    if (!phoneInput.trim()) {
      showToast('O telefone do contato é obrigatório', 'warning');
      return;
    }

    if (!currentUser || !currentConnection) return;

    setSubmitting(true);
    try {
      if (currentContact) {
        // Edit
        await contactsService.update(currentContact.id, {
          name: nameInput,
          phone: phoneInput
        });
        showToast('Contato atualizado com sucesso', 'success');
      } else {
        // Create
        await contactsService.create(currentUser.uid, currentConnection.id, nameInput, phoneInput);
        showToast('Contato criado com sucesso', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      console.error(error);
      showToast('Erro ao salvar contato', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contato?')) {
      try {
        await contactsService.delete(id);
        showToast('Contato excluído com sucesso', 'success');
      } catch (error) {
        console.error(error);
        showToast('Erro ao excluir contato', 'error');
      }
    }
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 3, bgcolor: 'background.default' }}>
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="h2">
                Meus Contatos
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => handleOpenDialog()}
              >
                Novo Contato
              </Button>
            </Box>
            
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredContacts.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              {searchTerm ? 'Nenhum contato encontrado para a busca.' : 'Nenhum contato encontrado. Crie o primeiro!'}
            </Typography>
          ) : (
            <List>
              {filteredContacts.map((contact) => (
                <ListItem key={contact.id} divider>
                  <ListItemText 
                    primary={contact.name} 
                    secondary={contact.phone} 
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="send message" onClick={() => handleNavigateToMessage(contact)} sx={{ mr: 1 }} color="primary">
                      <MessageIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(contact)} sx={{ mr: 1 }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(contact.id)}>
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
        <DialogTitle>{currentContact ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nome"
            type="text"
            fullWidth
            variant="outlined"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="phone"
            label="Telefone"
            type="tel"
            fullWidth
            variant="outlined"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
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
