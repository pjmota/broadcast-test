import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button 
} from '@mui/material';
import { type Connection } from '../../services/connections.service';

interface ConnectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  connection: Connection | null;
  name: string;
  onNameChange: (value: string) => void;
  submitting: boolean;
}

export default function ConnectionDialog({
  open,
  onClose,
  onSubmit,
  connection,
  name,
  onNameChange,
  submitting
}: ConnectionDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{connection ? 'Editar Conexão' : 'Nova Conexão'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Nome da Conexão"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
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
