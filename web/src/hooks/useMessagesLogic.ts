import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/providers/AuthProvider';
import { useToast } from '../app/providers/ToastProvider';
import { useConnection } from '../app/providers/ConnectionProvider';
import { messagesService, type Message, type MessageStatus } from '../services/messages.service';
import { contactsService, type Contact } from '../services/contacts.service';
import { connectionsService, type Connection } from '../services/connections.service';
import { Timestamp } from 'firebase/firestore';

export interface Conversation {
  id: string; // contactIds joined
  contactIds: string[];
  messages: Message[];
  lastMessage: Message;
  hasSent: boolean;
  hasScheduled: boolean;
}

export function useMessagesLogic() {
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
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null); // For editing specific message
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
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
      
      // Subscribe to ALL messages (no status filter)
      unsubscribeMessages = messagesService.subscribe(currentUser.uid, currentConnection.id, undefined, (data) => {
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
  }, [currentUser, currentConnection]);

  // Group messages into conversations
  const conversations = useMemo(() => {
    const groups = new Map<string, Message[]>();
    messages.forEach(msg => {
      const key = [...msg.contactIds].sort().join(',');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(msg);
    });
    
    return Array.from(groups.entries()).map(([id, msgs]) => {
      // Sort messages by date (oldest first for chat history)
      const sortedMsgs = msgs.sort((a, b) => {
        const dateA = a.scheduledAt ? a.scheduledAt.toMillis() : a.createdAt.toMillis();
        const dateB = b.scheduledAt ? b.scheduledAt.toMillis() : b.createdAt.toMillis();
        return dateA - dateB;
      });

      const lastMsg = sortedMsgs[sortedMsgs.length - 1];
      
      return {
        id,
        contactIds: sortedMsgs[0].contactIds,
        messages: sortedMsgs,
        lastMessage: lastMsg,
        hasSent: msgs.some(m => m.status === 'sent'),
        hasScheduled: msgs.some(m => m.status === 'scheduled')
      } as Conversation;
    }).sort((a, b) => {
      // Sort conversations by last message date (newest first)
      const dateA = a.lastMessage.scheduledAt ? a.lastMessage.scheduledAt.toMillis() : a.lastMessage.createdAt.toMillis();
      const dateB = b.lastMessage.scheduledAt ? b.lastMessage.scheduledAt.toMillis() : b.lastMessage.createdAt.toMillis();
      return dateB - dateA;
    });
  }, [messages]);

  // Filter conversations based on current tab and search term
  const filteredConversations = useMemo(() => {
    const filtered = conversations.filter(conv => {
      // Tab filter
      if (currentTab === 'sent' && !conv.hasSent) return false;
      if (currentTab === 'scheduled' && !conv.hasScheduled) return false;

      // Search filter
      const contactNames = getContactNames(conv.contactIds, contacts).toLowerCase();
      const contentMatch = conv.messages.some(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return contactNames.includes(searchTerm.toLowerCase()) || contentMatch;
    });

    // Update lastMessage based on tab and re-sort
    return filtered.map(conv => {
      // Find the last message that matches the current tab
      const tabMessages = conv.messages.filter(m => m.status === currentTab);
      // If we are in 'sent' tab, we want the last sent message.
      // If we are in 'scheduled' tab, we want the last scheduled message.
      // Fallback to original lastMessage if something goes wrong (shouldn't if filter passed)
      const lastTabMessage = tabMessages.length > 0 ? tabMessages[tabMessages.length - 1] : conv.lastMessage;
      
      return {
        ...conv,
        lastMessage: lastTabMessage
      };
    }).sort((a, b) => {
      // Re-sort based on the displayed message date
      const dateA = a.lastMessage.scheduledAt ? a.lastMessage.scheduledAt.toMillis() : a.lastMessage.createdAt.toMillis();
      const dateB = b.lastMessage.scheduledAt ? b.lastMessage.scheduledAt.toMillis() : b.lastMessage.createdAt.toMillis();
      return dateB - dateA;
    });
  }, [conversations, currentTab, searchTerm, contacts]);

  // Get current conversation messages
  const currentConversation = useMemo(() => {
    if (!selectedConversationId) return null;
    const conversation = conversations.find(c => c.id === selectedConversationId);
    if (!conversation) return null;

    // Filter messages based on active tab
    const filteredMessages = conversation.messages.filter(msg => 
      msg.status === currentTab
    );

    return {
      ...conversation,
      messages: filteredMessages
    };
  }, [conversations, selectedConversationId, currentTab]);

  // Helper to get contact names (hoisted for use in memo)
  function getContactNames(contactIds: string[], contactsList: Contact[] = contacts) {
    return contactIds
      .map(id => contactsList.find(c => c.id === id)?.name || 'Desconhecido')
      .join(', ');
  }

  // Handle navigation from Contacts
  useEffect(() => {
    const handleNavigation = async () => {
      if (location.state && location.state.contactId && currentUser && currentConnection) {
        const { contactId, action } = location.state;
        
        if (action === 'schedule') {
          setCurrentTab('scheduled');
          
          // Check if conversation exists
          const conversationKey = [contactId].sort().join(',');
          const exists = conversations.find(c => c.id === conversationKey);

          if (exists) {
            setSelectedConversationId(conversationKey);
            setIsCreating(false);
            setSelectedContacts(exists.contactIds);
          } else {
            setSelectedConversationId(null);
            setIsCreating(true);
            setSelectedContacts([contactId]);
          }

          setSelectedMessage(null);
          setIsEditing(false);
          setContentInput('');
          
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(9, 0, 0, 0);
          const isoString = new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
          setScheduledDate(isoString);
          
          navigate(location.pathname, { replace: true, state: {} });
          return;
        }

        // Check if conversation exists
        const conversationKey = [contactId].sort().join(',');
        const exists = conversations.find(c => c.id === conversationKey);

        if (exists) {
          // Open existing conversation
          setSelectedConversationId(conversationKey);
          setIsCreating(false);
          
          // Switch tab if needed
          if (exists.hasScheduled && !exists.hasSent) setCurrentTab('scheduled');
          else setCurrentTab('sent');
          
        } else {
          // Create new conversation
          handleCreateNew();
          setSelectedContacts([contactId]);
        }
        
        navigate(location.pathname, { replace: true, state: {} });
      }
    };

    if (conversations.length > 0 || loading === false) {
       handleNavigation();
    }
  }, [location.state, currentUser, currentConnection, navigate, location.pathname, conversations, loading]);

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
    setSelectedContacts(conversation.contactIds);
    setSelectedMessage(null); // Reset specific message selection
    setIsCreating(false);
    setIsEditing(false);
    setContentInput('');
    
    // Set scheduled date based on context (if viewing scheduled tab, maybe default to next scheduled?)
    // For now, keep empty unless editing
    setScheduledDate('');
  };

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
    setSelectedConversationId(null);
    setSelectedMessage(null);
    setIsCreating(false);
    setContentInput('');
    setSelectedContacts([]);
    setScheduledDate('');
  };

  const handleCreateNew = () => {
    setSelectedConversationId(null);
    setSelectedMessage(null);
    setIsCreating(true);
    setIsEditing(false);
    setContentInput('');
    setSelectedContacts([]);
    setScheduledDate('');
  };

  const handleEditMessage = () => {
    if (selectedMessage) {
      setContentInput(selectedMessage.content);
      if (selectedMessage.scheduledAt) {
        const date = selectedMessage.scheduledAt.toDate();
        const isoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setScheduledDate(isoString);
      }
      setIsEditing(true);
      setIsCreating(false);
    }
  };

  // Helper to select a specific message for editing (called from ChatArea bubbles)
  const handleSelectMessageForEdit = (msg: Message) => {
     setSelectedMessage(msg);
     handleEditMessage(); // Pre-fill form
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
      
      // Só permite editar se for agendada E estiver em modo de edição.
      if (isEditing && selectedMessage && selectedMessage.status === 'scheduled') {
        // Update
        await messagesService.update(selectedMessage.id, {
          content: contentInput,
          contactIds: selectedContacts,
          scheduledAt: scheduledAtDate ? Timestamp.fromDate(scheduledAtDate) : Timestamp.now(),
          status: scheduledAtDate && scheduledAtDate > new Date() ? 'scheduled' : 'sent'
        });
        showToast('Mensagem atualizada com sucesso', 'success');
        
        setIsEditing(false);
        setSelectedMessage(null);
        setContentInput('');
        setScheduledDate('');
      } else {
        // Create
        await messagesService.create(currentUser.uid, currentConnection.id, contentInput, selectedContacts, scheduledAtDate);
        showToast(scheduledAtDate && scheduledAtDate > new Date() ? 'Mensagem agendada com sucesso' : 'Mensagem enviada com sucesso', 'success');
        
        // Reset form
        setContentInput('');
        setScheduledDate('');
        
        // If we are creating from "New Message" screen, stay there? 
        // Or if we are in a conversation, stay in conversation.
        if (isCreating) {
           // If it was a new conversation, we should switch to it.
           // The subscription will update 'conversations', and we can auto-select it?
           // For now, let's just clear contacts if it was explicit "Create New".
           // But if we are in a conversation, selectedContacts remains set.
           if (!selectedConversationId) {
             setSelectedContacts([]);
           } else {
             setIsCreating(false); // Ensure we are not in "creating" mode overlay
           }
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
          setIsEditing(false);
          setContentInput('');
          setScheduledDate('');
        }
      } catch (error) {
        console.error(error);
        showToast('Erro ao excluir mensagem', 'error');
      }
    }
  };

  return {
    currentUser,
    currentConnection,
    selectConnection,
    
    messages, // Raw messages
    conversations, // All conversations
    filteredConversations, // Filtered for Sidebar
    currentConversation, // Selected conversation for ChatArea
    
    contacts,
    loading,
    currentTab,
    availableConnections,
    loadingConnections,
    selectedMessage,
    selectedConversationId,
    isCreating,
    isEditing,
    contentInput,
    selectedContacts,
    scheduledDate,
    submitting,
    searchTerm,
    
    setSearchTerm,
    setSelectedMessage,
    setSelectedConversationId,
    setContentInput,
    setSelectedContacts,
    setScheduledDate,
    setIsCreating,
    setIsEditing,
    
    handleTabChange,
    handleCreateNew,
    handleEditMessage,
    handleSelectMessageForEdit,
    handleSelectConversation,
    handleSubmit,
    handleDelete,
    getContactNames
  };
}
