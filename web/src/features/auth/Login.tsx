import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Paper,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../app/providers/ToastProvider';
import { useAuth } from '../../app/providers/AuthProvider';
import { authService } from '../../services/auth.service';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentUser } = useAuth();

  // Redireciona se já estiver logado
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Função auxiliar para validar email simples
  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Função auxiliar para validar senha forte
  const validatePassword = (pass: string) => {
    if (pass.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
    if (!/[A-Z]/.test(pass)) return 'A senha deve conter pelo menos uma letra maiúscula.';
    if (!/[0-9]/.test(pass)) return 'A senha deve conter pelo menos um número.';
    // Opcional: caracteres especiais
    // if (!/[!@#$%^&*]/.test(pass)) return 'A senha deve conter pelo menos um caractere especial.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validação de e-mail (para Login e Cadastro)
    if (!validateEmail(email)) {
      const msg = 'Por favor, insira um endereço de e-mail válido.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    // Validação de senha forte apenas no cadastro (opcional no login, mas bom ter)
    if (!isLogin) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        showToast(passwordError, 'error');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await authService.login(email, password);
        showToast('Login realizado com sucesso!', 'success');
      } else {
        await authService.register(email, password);
        showToast('Conta criada com sucesso!', 'success');
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      const errorMessage = authService.getErrorMessage(err);
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" className="mb-4 font-bold text-gray-800">
            {isLogin ? 'Entrar no Broadcast SaaS' : 'Criar Nova Conta'}
          </Typography>

          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Endereço de Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
