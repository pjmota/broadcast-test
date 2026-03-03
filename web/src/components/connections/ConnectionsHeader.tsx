import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface ConnectionsHeaderProps {
  onNewConnection: () => void;
}

export default function ConnectionsHeader({ onNewConnection }: ConnectionsHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h5" component="h2">
        Minhas Conexões
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={onNewConnection}
        >
          Nova Conexão
        </Button>
      </Box>
    </Box>
  );
}
