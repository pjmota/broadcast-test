import { useState } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Typography,
  Box,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Message as MessageIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { type Contact } from '../../services/contacts.service';

interface ContactsListItemsProps {
  contacts: Contact[];
  loading: boolean;
  searchTerm: string;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onMessage: (contact: Contact, action?: 'send' | 'schedule') => void;
}

export default function ContactsListItems({
  contacts,
  loading,
  searchTerm,
  onEdit,
  onDelete,
  onMessage
}: ContactsListItemsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, contact: Contact) => {
    setAnchorEl(event.currentTarget);
    setSelectedContact(contact);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContact(null);
  };

  const handleAction = (action: 'send' | 'schedule') => {
    if (selectedContact) {
      onMessage(selectedContact, action);
    }
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (contacts.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
        {searchTerm ? 'Nenhum contato encontrado para a busca.' : 'Nenhum contato encontrado. Crie o primeiro!'}
      </Typography>
    );
  }

  return (
    <>
      <List>
        {contacts.map((contact) => (
          <ListItem key={contact.id} divider>
            <ListItemText 
              primary={contact.name} 
              secondary={contact.phone} 
            />
            <ListItemSecondaryAction>
              <IconButton 
                edge="end" 
                aria-label="message options" 
                onClick={(e) => handleMenuOpen(e, contact)} 
                sx={{ mr: 1 }} 
                color="primary"
              >
                <MessageIcon />
              </IconButton>
              <IconButton edge="end" aria-label="edit" onClick={() => onEdit(contact)} sx={{ mr: 1 }}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => onDelete(contact.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('send')}>
          <ListItemIcon>
            <SendIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Enviar Mensagem</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('schedule')}>
          <ListItemIcon>
            <ScheduleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Agendar Mensagem</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
