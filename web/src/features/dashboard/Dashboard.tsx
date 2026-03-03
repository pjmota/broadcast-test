import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { Typography, Button, Container, Paper, Grid, Box } from '@mui/material';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-gray-100 h-full">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Bem-vindo ao Painel
              </Typography>
              <Typography component="p" variant="body1">
                Você está autenticado e seus dados estão seguros no Firestore com isolamento por Client ID.
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Button variant="contained" onClick={() => navigate('/connections')}>
                  Gerenciar Conexões
                </Button>
              </Box>
              <Typography variant="caption" display="block" gutterBottom sx={{ mt: 2 }}>
                Client ID (UID): {currentUser?.uid}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
