import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton,
  IconButton,
  CircularProgress,
  Avatar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Person as PersonIcon
} from '@mui/icons-material';

import MessagesSidebar from './components/MessagesSidebar';
import ChatArea from './components/ChatArea';

import { useAuth } from '../../app/providers/AuthProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { messagesService, type Message, type MessageStatus } from '../../services/messages.service';
import { contactsService, type Contact } from '../../services/contacts.service';
import { connectionsService, type Connection } from '../../services/connections.service';
import { Timestamp } from 'firebase/firestore';

import { useConnection } from '../../app/providers/ConnectionProvider';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MessagesList() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { currentConnection, selectConnection } = useConnection();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<MessageStatus>('sent');
  
  // Connection selection state
  const [availableConnections, setAvailableConnections] = useState<Connection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  
  // Selection/Edit state
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form states
  const [contentInput, setContentInput] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Initial load and subscriptions
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeConnections: (() => void) | undefined;
    let unsubscribeMessages: (() => void) | undefined;
    let unsubscribeContacts: (() => void) | undefined;

    if (currentConnection) {
      setLoading(true);
      
      // Subscribe to messages
      unsubscribeMessages = messagesService.subscribe(currentUser.uid, currentConnection.id, currentTab, (data) => {
        setMessages(data);
        setLoading(false);
      });

      // Subscribe to contacts (for selector)
      unsubscribeContacts = contactsService.subscribe(currentUser.uid, currentConnection.id, (data) => {
        setContacts(data);
      });
      
      // Check for scheduled messages every minute
      const interval = setInterval(() => {
        checkScheduledMessages();
      }, 60000);

      // Initial check
      checkScheduledMessages();
      
      return () => {
        if (unsubscribeConnections) unsubscribeConnections();
        if (unsubscribeMessages) unsubscribeMessages();
        if (unsubscribeContacts) unsubscribeContacts();
        clearInterval(interval);
      };
    } 
    
    // Fallback if no connection selected
    setLoadingConnections(true);
    unsubscribeConnections = connectionsService.subscribe(currentUser.uid, (data) => {
      setAvailableConnections(data);
      setLoadingConnections(false);
    });

    return () => {
      if (unsubscribeConnections) unsubscribeConnections();
    };
  }, [currentUser, currentTab, currentConnection]);

  // Handle navigation from Contacts (pre-select contact)
  useEffect(() => {
    if (location.state && location.state.contactId && contacts.length > 0) {
      handleCreateNew();
      setSelectedContacts([location.state.contactId]);
      // Clear state to avoid reopening on refresh/tab change
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, contacts, navigate, location.pathname]);

  // Reset form when selection changes
  useEffect(() => {
    if (selectedMessage) {
      setSelectedContacts(selectedMessage.contactIds);
      
      // Se for agendada, permite editar. Se for enviada, prepara para nova mensagem.
      if (selectedMessage.status === 'scheduled') {
        setContentInput(selectedMessage.content);
        if (selectedMessage.scheduledAt) {
          const date = selectedMessage.scheduledAt.toDate();
          const isoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
          setScheduledDate(isoString);
        } else {
          setScheduledDate('');
        }
      } else {
        setContentInput('');
        setScheduledDate('');
      }
      setIsCreating(false);
    } else if (isCreating) {
      setContentInput('');
      setSelectedContacts([]);
      setScheduledDate('');
    }
  }, [selectedMessage, isCreating]);

  if (!currentConnection) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 600 }}>
          <Typography variant="h5" gutterBottom>
            Selecione uma Conexão
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Para gerenciar mensagens, você precisa selecionar uma conexão primeiro.
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
      </Box>
    );
  }

  const checkScheduledMessages = async () => {
    if (!currentUser || !currentConnection) return;
    try {
      const processedCount = await messagesService.processScheduledMessages(currentUser.uid);
      if (processedCount > 0) {
        showToast(`${processedCount} mensagens agendadas foram enviadas`, 'info');
      }
    } catch (error) {
      console.error('Error processing scheduled messages:', error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: MessageStatus) => {
    setCurrentTab(newValue);
    setSelectedMessage(null);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedMessage(null);
    setIsCreating(true);
    setContentInput('');
    setSelectedContacts([]);
    setScheduledDate('');
  };

  const handleSubmit = async () => {
    if (!contentInput.trim()) {
      showToast('O conteúdo da mensagem é obrigatório', 'warning');
      return;
    }
    if (selectedContacts.length === 0) {
      showToast('Selecione pelo menos um contato', 'warning');
      return;
    }

    if (!currentUser || !currentConnection) return;

    setSubmitting(true);
    try {
      const scheduledAtDate = scheduledDate ? new Date(scheduledDate) : undefined;
      
      // Só permite editar se for agendada. Caso contrário, cria nova.
      if (selectedMessage && selectedMessage.status === 'scheduled') {
        // Edit
        await messagesService.update(selectedMessage.id, {
          content: contentInput,
          contactIds: selectedContacts,
          scheduledAt: scheduledAtDate ? Timestamp.fromDate(scheduledAtDate) : Timestamp.now(),
          status: scheduledAtDate && scheduledAtDate > new Date() ? 'scheduled' : 'sent'
        });
        showToast('Mensagem atualizada com sucesso', 'success');
      } else {
        // Create
        await messagesService.create(currentUser.uid, currentConnection.id, contentInput, selectedContacts, scheduledAtDate);
        showToast(scheduledAtDate && scheduledAtDate > new Date() ? 'Mensagem agendada com sucesso' : 'Mensagem enviada com sucesso', 'success');
        
        // Reset form
        setContentInput('');
        setScheduledDate('');
        
        // Se estava criando do zero, limpa contatos. Se estava respondendo, mantém.
        if (isCreating) {
          setSelectedContacts([]);
        }
      }
    } catch (error) {
      console.error(error);
      showToast('Erro ao salvar mensagem', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (globalThis.confirm('Tem certeza que deseja excluir esta mensagem?')) {
      try {
        await messagesService.delete(id);
        showToast('Mensagem excluída com sucesso', 'success');
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      } catch (error) {
        console.error(error);
        showToast('Erro ao excluir mensagem', 'error');
      }
    }
  };

  const getContactNames = (ids: string[]) => {
    const names = ids.map(id => contacts.find(c => c.id === id)?.name || 'Desconhecido');
    if (names.length <= 2) return names.join(', ');
    return `${names[0]}, ${names[1]} e mais ${names.length - 2}`;
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', bgcolor: '#f0f2f5' }}>
      {/* Sidebar - Lista de Mensagens */}
      <MessagesSidebar
        messages={messages}
        contacts={contacts}
        loading={loading}
        selectedMessage={selectedMessage}
        currentTab={currentTab}
        searchTerm={searchTerm}
        onTabChange={handleTabChange}
        onSearchChange={setSearchTerm}
        onCreateNew={handleCreateNew}
        onSelectMessage={(msg) => {
          setSelectedMessage(msg);
          setIsCreating(false);
        }}
        getContactNames={getContactNames}
      />

      {/* Main Content - Detalhes/Formulário */}
      <ChatArea
        isCreating={isCreating}
        selectedMessage={selectedMessage}
        contacts={contacts}
        contentInput={contentInput}
        selectedContacts={selectedContacts}
        scheduledDate={scheduledDate}
        submitting={submitting}
        onContentChange={setContentInput}
        onContactsChange={setSelectedContacts}
        onDateChange={setScheduledDate}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        getContactNames={getContactNames}
      />
    </Box>
  );
}
