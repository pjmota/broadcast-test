import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItemButton, 
  ListItemText,
  IconButton, 
  TextField, 
  CircularProgress,
  Tabs,
  Tab,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon, 
  Send as SendIcon, 
  Schedule as ScheduleIcon, 
  Search as SearchIcon
} from '@mui/icons-material';
import { type MessageStatus } from '../../services/messages.service';
import { type Contact } from '../../services/contacts.service';
import { type Conversation } from '../../hooks/useMessagesLogic';

interface MessagesSidebarProps {
  conversations: Conversation[];
  contacts: Contact[];
  loading: boolean;
  selectedConversationId: string | null;
  currentTab: MessageStatus;
  searchTerm: string;
  onTabChange: (event: React.SyntheticEvent, newValue: MessageStatus) => void;
  onSearchChange: (term: string) => void;
  onCreateNew: () => void;
  onSelectConversation: (conversation: Conversation) => void;
  getContactNames: (ids: string[]) => string;
}

export default function MessagesSidebar({
  conversations,
  contacts,
  loading,
  selectedConversationId,
  currentTab,
  searchTerm,
  onTabChange,
  onSearchChange,
  onCreateNew,
  onSelectConversation,
  getContactNames
}: MessagesSidebarProps) {
  
  return (
    <Paper sx={{ width: 350, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e0e0e0', zIndex: 1 }}>
        <Box sx={{ p: 2, bgcolor: '#f0f2f5' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Mensagens</Typography>
            <IconButton onClick={onCreateNew} color="primary" title="Nova Mensagem">
              <AddIcon />
            </IconButton>
          </Box>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { bgcolor: 'white', borderRadius: 2 }
            }}
          />
        </Box>
        
        <Tabs
          value={currentTab}
          onChange={onTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}
        >
          <Tab icon={<SendIcon fontSize="small" />} iconPosition="start" label="Enviadas" value="sent" sx={{ minHeight: 48 }} />
          <Tab icon={<ScheduleIcon fontSize="small" />} iconPosition="start" label="Agendadas" value="scheduled" sx={{ minHeight: 48 }} />
        </Tabs>

        <List sx={{ flex: 1, overflowY: 'auto', bgcolor: 'white' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : conversations.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              Nenhuma conversa encontrada.
            </Typography>
          ) : (
            conversations.map((conv) => (
              <ListItemButton 
                key={conv.id}
                selected={selectedConversationId === conv.id}
                onClick={() => onSelectConversation(conv)}
                divider
                sx={{ 
                  alignItems: 'flex-start',
                  '&.Mui-selected': { bgcolor: '#f0f2f5' }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle2" noWrap sx={{ maxWidth: '70%', fontWeight: 'bold' }}>
                        {getContactNames(conv.contactIds)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {conv.lastMessage.scheduledAt 
                          ? conv.lastMessage.scheduledAt.toDate().toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
                          : conv.lastMessage.createdAt.toDate().toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
                        }
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {conv.lastMessage.content}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Paper>
  );
}