import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppBar, Toolbar, Typography, Button, Container, Paper, Grid } from '@mui/material';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Broadcast SaaS
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {currentUser?.email}
          </Typography>
          <Button color="inherit" onClick={logout}>Sair</Button>
        </Toolbar>
      </AppBar>

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
