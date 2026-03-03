import { Box, Typography, Button, TextField, InputAdornment } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';

interface ContactsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewContact: () => void;
}

export default function ContactsHeader({
  searchTerm,
  onSearchChange,
  onNewContact
}: ContactsHeaderProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Meus Contatos
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={onNewContact}
        >
          Novo Contato
        </Button>
      </Box>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar por nome ou telefone..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
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
  );
}
