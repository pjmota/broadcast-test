import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button 
} from '@mui/material';
import { type Contact } from '../../services/contacts.service';

interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  contact: Contact | null;
  name: string;
  phone: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  submitting: boolean;
}

export default function ContactDialog({
  open,
  onClose,
  onSubmit,
  contact,
  name,
  phone,
  onNameChange,
  onPhoneChange,
  submitting
}: ContactDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{contact ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Nome"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          id="phone"
          label="Telefone"
          type="tel"
          fullWidth
          variant="outlined"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancelar</Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
