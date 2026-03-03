import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/providers/AuthProvider';
import { useToast } from '../app/providers/ToastProvider';
import { useConnection } from '../app/providers/ConnectionProvider';
import { contactsService, type Contact } from '../services/contacts.service';
import { connectionsService, type Connection } from '../services/connections.service';

export function useContactsLogic() {
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

  const handleNavigateToMessage = (contact: Contact, action: 'send' | 'schedule' = 'send') => {
    navigate('/messages', { state: { contactId: contact.id, action } });
  };

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

  return {
    currentUser,
    currentConnection,
    selectConnection,
    
    contacts,
    loading,
    openDialog,
    currentContact,
    availableConnections,
    loadingConnections,
    
    nameInput,
    phoneInput,
    submitting,
    searchTerm,
    filteredContacts,
    
    setSearchTerm,
    setNameInput,
    setPhoneInput,
    
    handleNavigateToMessage,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleDelete
  };
}
