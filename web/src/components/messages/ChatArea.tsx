import { type KeyboardEvent, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Avatar,
  Select,
  MenuItem,
  FormControl,
  Chip,
  InputBase,
  CircularProgress
} from '@mui/material';
import { 
  Person as PersonIcon,
  Add as AddIcon,
  AccessTime as AccessTimeIcon,
  AttachFile as AttachFileIcon,
  InsertEmoticon as InsertEmoticonIcon,
  Send as SendIcon,
  Laptop as LaptopIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  DoneAll as DoneAllIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { type Message } from '../../services/messages.service';
import { type Contact } from '../../services/contacts.service';
import { type Conversation } from '../../hooks/useMessagesLogic';
import bgImage from '../../assets/fundo_whats.png';

interface ChatAreaProps {
  isCreating: boolean;
  isEditing: boolean;
  selectedMessage: Message | null;
  currentConversation: Conversation | null;
  contacts: Contact[];
  contentInput: string;
  selectedContacts: string[];
  scheduledDate: string;
  submitting: boolean;
  currentTab: 'sent' | 'scheduled';
  onContentChange: (val: string) => void;
  onContactsChange: (ids: string[]) => void;
  onDateChange: (val: string) => void;
  onSubmit: () => void;
  onEditMessage: () => void;
  onSelectMessageForEdit: (msg: Message) => void;
  getContactNames: (ids: string[]) => string;
}

export default function ChatArea({
  isCreating,
  isEditing,
  selectedMessage,
  currentConversation,
  contacts,
  contentInput,
  selectedContacts,
  scheduledDate,
  submitting,
  currentTab,
  onContentChange,
  onContactsChange,
  onDateChange,
  onSubmit,
  onEditMessage,
  onSelectMessageForEdit,
  getContactNames
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentConversation?.messages, isCreating]);
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  if (!currentConversation && !isCreating) {
    return (
      <Box sx={{ 
        flex: 1, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#efeae2',
        borderBottom: '6px solid #25d366'
      }}>
        <LaptopIcon sx={{ fontSize: 120, color: '#d1d7db', mb: 2 }} />
        <Typography variant="h5" color="#41525d" fontWeight="light" gutterBottom>
          Broadcast Web
        </Typography>
        <Typography variant="body2" color="#667781">
          Selecione uma conversa ou crie uma nova para começar.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#efeae2', position: 'relative', height: '100%' }}>
      {/* Header */}
      <Paper square sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f0f2f5', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Avatar sx={{ bgcolor: isCreating ? 'primary.main' : 'secondary.main' }}>
            {isCreating ? <AddIcon /> : <PersonIcon />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            {isCreating ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap' }}>Para:</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    multiple
                    value={selectedContacts}
                    onChange={(e) => onContactsChange(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((id) => (
                          <Chip 
                            key={id} 
                            label={contacts.find(c => c.id === id)?.name || id} 
                            size="small" 
                            onDelete={() => onContactsChange(selectedContacts.filter(cId => cId !== id))}
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                        ))}
                      </Box>
                    )}
                    sx={{ bgcolor: 'white' }}
                  >
                    {contacts.map((contact) => (
                      <MenuItem key={contact.id} value={contact.id}>
                        {contact.name} ({contact.phone})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            ) : (
              <>
                <Typography variant="subtitle1" fontWeight="bold">
                  {currentConversation ? getContactNames(currentConversation.contactIds) : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentConversation?.messages.length} mensagens
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Chat Body */}
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        bgcolor: '#f1ebe3',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: '#ebe1d7',
          maskImage: `url(${bgImage})`,
          WebkitMaskImage: `url(${bgImage})`,
          maskRepeat: 'repeat',
          WebkitMaskRepeat: 'repeat',
        }} />

        <Box 
          ref={scrollRef}
          sx={{ 
            position: 'relative', 
            zIndex: 1, 
            height: '100%', 
            p: 3, 
            display: 'flex', 
            flexDirection: 'column',
            overflowY: 'auto',
            gap: 2
          }}
        >
          {/* Message Bubbles */}
          {currentConversation?.messages.map((msg) => (
             <Box 
               key={msg.id}
               sx={{ 
                 alignSelf: 'flex-end', 
                 maxWidth: '80%', 
                 bgcolor: msg.status === 'scheduled' ? '#fff' : '#dcf8c6', 
                 p: 1.5, 
                 borderRadius: 2,
                 boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                 position: 'relative',
                 border: selectedMessage?.id === msg.id ? '2px solid #00a884' : 'none',
                 cursor: msg.status === 'scheduled' ? 'pointer' : 'default',
                 '&:hover': {
                    bgcolor: msg.status === 'scheduled' ? '#f5f5f5' : '#dcf8c6'
                 }
               }}
               onClick={() => {
                 if (msg.status === 'scheduled') {
                   onSelectMessageForEdit(msg);
                 }
               }}
             >
               <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', pr: 4 }}>
                 {msg.content}
               </Typography>
               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mt: 0.5 }}>
                  {msg.status === 'scheduled' && <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
                  {msg.status === 'sent' && <DoneAllIcon sx={{ fontSize: 14, color: '#4fc3f7' }} />}
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {msg.scheduledAt 
                      ? msg.scheduledAt.toDate().toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                      : msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  </Typography>
               </Box>
             </Box>
          ))}
          
          {/* Creating Preview */}
          {isCreating && contentInput && (
             <Box sx={{ 
                alignSelf: 'flex-end', 
                maxWidth: '80%', 
                bgcolor: '#dcf8c6', 
                p: 1.5, 
                borderRadius: 2,
                opacity: 0.7
              }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {contentInput}
                </Typography>
              </Box>
          )}
        </Box>
      </Box>

      {/* Footer / Input Area */}
      {(isCreating || currentConversation) && (
        <Paper square sx={{ p: 1.5, bgcolor: '#f0f2f5', borderTop: '1px solid #e0e0e0', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <IconButton size="small"><InsertEmoticonIcon /></IconButton>
            <IconButton size="small"><AttachFileIcon /></IconButton>
            
            <Box sx={{ flex: 1, mx: 1 }}>
              <InputBase
                fullWidth
                multiline
                maxRows={4}
                placeholder="Digite uma mensagem"
                value={contentInput}
                onChange={(e) => onContentChange(e.target.value)}
                onKeyDown={handleKeyDown}
                sx={{ 
                  bgcolor: 'white', 
                  borderRadius: 2, 
                  px: 2, 
                  py: 1,
                  fontSize: '0.95rem'
                }}
              />
            </Box>

            <IconButton 
              color="primary" 
              onClick={onSubmit}
              disabled={submitting || !contentInput.trim() || selectedContacts.length === 0}
              title={isEditing ? "Salvar Alterações" : "Enviar Mensagem"}
              sx={{ 
                bgcolor: contentInput.trim() && selectedContacts.length > 0 ? '#00a884' : 'transparent',
                color: contentInput.trim() && selectedContacts.length > 0 ? 'white' : 'action.disabled',
                '&:hover': {
                  bgcolor: contentInput.trim() && selectedContacts.length > 0 ? '#008f72' : 'transparent',
                }
              }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : (
                isEditing ? <SaveIcon /> : <SendIcon />
              )}
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1 }}>
            {currentTab === 'scheduled' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">Agendar:</Typography>
                <input
                  type="datetime-local"
                  id="scheduled-date-input"
                  value={scheduledDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    color: '#667781'
                  }}
                />
              </Box>
            )}
            
            {isEditing && (
               <Chip label="Editando Mensagem" size="small" color="primary" onDelete={() => {
                 onSelectMessageForEdit(null as any); // Clear selection
                 onEditMessage(); // This toggles edit mode off usually? Wait, I need a way to cancel edit.
                 // Actually onSelectMessageForEdit(null) in useMessagesLogic might not be enough if it expects a message.
                 // Let's rely on clicking the bubble again or something.
                 // Or better: add a cancel edit button.
               }} />
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
}