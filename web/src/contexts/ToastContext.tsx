import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Snackbar, Alert, type AlertColor, LinearProgress, Box } from '@mui/material';

interface ToastContextType {
  showToast: (message: string, severity?: AlertColor) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');
  const [progress, setProgress] = useState(100);

  const showToast = useCallback((msg: string, type: AlertColor = 'info') => {
    setMessage(msg);
    setSeverity(type);
    setOpen(true);
    setProgress(100);
  }, []);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (open) {
      const duration = 5000;
      const startTime = Date.now();
      const interval = 50; // Aumentado para 50ms para reduzir carga de renderização

      timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingPercentage = 100 - (elapsedTime / duration) * 100;

        if (remainingPercentage <= 0) {
          setProgress(0);
          clearInterval(timer);
          setOpen(false);
        } else {
          setProgress(remainingPercentage);
        }
      }, interval);
    }
    return () => clearInterval(timer);
  }, [open]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar 
        open={open} 
        // autoHideDuration removido para ser controlado pela barra de progresso
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box sx={{ position: 'relative', width: '100%' }}>
          <Alert 
            onClose={handleClose} 
            severity={severity} 
            sx={{ width: '100%', pb: 1 }} // Adicionado padding bottom extra para a barra não colar no texto
            variant="filled"
          >
            {message}
          </Alert>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              height: 4,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white',
                transition: 'none' // Remove transição padrão para movimento linear fluido
              }
            }} 
          />
        </Box>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
