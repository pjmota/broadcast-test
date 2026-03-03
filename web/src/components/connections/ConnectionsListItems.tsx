import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { type Connection } from '../../services/connections.service';

interface ConnectionsListItemsProps {
  connections: Connection[];
  loading: boolean;
  onSelect: (connection: Connection) => void;
  onEdit: (connection: Connection) => void;
  onDelete: (id: string) => void;
}

export default function ConnectionsListItems({
  connections,
  loading,
  onSelect,
  onEdit,
  onDelete
}: ConnectionsListItemsProps) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (connections.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
        Nenhuma conexão encontrada. Crie a primeira!
      </Typography>
    );
  }

  return (
    <List>
      {connections.map((connection) => (
        <ListItem 
          key={connection.id}
          divider
          component="div"
        >
          <ListItemText 
            primary={connection.name}
            secondary={`Criada em: ${connection.createdAt?.toDate().toLocaleDateString()}`}
          />
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="open" onClick={() => onSelect(connection)} sx={{ mr: 1 }} color="primary">
              <ArrowForwardIcon />
            </IconButton>
            <IconButton edge="end" aria-label="edit" onClick={(e) => { e.stopPropagation(); onEdit(connection); }} sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); onDelete(connection.id); }}>
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
}
