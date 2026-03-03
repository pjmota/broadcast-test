import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Button, 
  CircularProgress 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { type Connection } from '../../services/connections.service';

interface NoConnectionStateProps {
  loading: boolean;
  connections: Connection[];
  onSelect: (connection: Connection) => void;
  moduleName?: string;
}

export default function NoConnectionState({ 
  loading, 
  connections, 
  onSelect,
  moduleName = 'este módulo'
}: NoConnectionStateProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 600 }}>
        <Typography variant="h5" gutterBottom>
          Selecione uma Conexão
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Para gerenciar {moduleName}, você precisa selecionar uma conexão primeiro.
        </Typography>
        
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {connections.map((conn) => (
              <ListItem 
                key={conn.id} 
                disablePadding
                sx={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 1, 
                  mb: 1
                }}
              >
                <ListItemButton onClick={() => onSelect(conn)}>
                  <ListItemText 
                    primary={conn.name} 
                    secondary={`Criado em: ${conn.createdAt?.toDate().toLocaleDateString()}`} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {connections.length === 0 && (
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
