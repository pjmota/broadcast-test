import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  CssBaseline,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Link as LinkIcon, 
  Contacts as ContactsIcon, 
  Message as MessageIcon, 
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../app/providers/AuthProvider';
import { useConnection } from '../app/providers/ConnectionProvider';

const drawerWidth = 240;

export const MainLayout: React.FC = () => {
  const { logout, currentUser } = useAuth();
  const { currentConnection, selectConnection } = useConnection();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleBackToConnections = () => {
    selectConnection(null);
    navigate('/');
  };

  const navItems = [
    { label: 'Mensagens', path: '/messages', icon: <MessageIcon /> },
    { label: 'Minhas Conexões', path: '/', icon: <LinkIcon /> },
    { label: 'Contatos', path: '/contacts', icon: <ContactsIcon /> },
  ];

  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: [1], flexDirection: 'column', py: 2 }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Broadcast SaaS
        </Typography>
        {currentConnection && (
          <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
            Conexão: <strong>{currentConnection.name}</strong>
          </Typography>
        )}
      </Toolbar>
      <Divider />
      <List>
        {currentConnection && (
           <ListItem disablePadding>
             <ListItemButton onClick={handleBackToConnections}>
               <ListItemIcon>
                 <ArrowBackIcon />
               </ListItemIcon>
               <ListItemText primary="Trocar Conexão" />
             </ListItemButton>
           </ListItem>
        )}
        <Divider />
        {navItems.filter(item => {
          if (currentConnection) {
            // Com conexão selecionada: Mostra itens contextuais (Mensagens, Contatos), oculta Home
            return item.path !== '/';
          } else {
            // Sem conexão: Mostra apenas a Home (Lista de Conexões), oculta itens contextuais
            return item.path === '/';
          }
        }).map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton 
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontWeight: location.pathname === item.path ? 'bold' : 'medium',
                  color: location.pathname === item.path ? 'primary.main' : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {currentUser?.email}
            </Typography>
            <IconButton color="inherit" onClick={handleLogout} title="Sair">
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          overflow: 'hidden'
        }}
      >
        <Toolbar />
        <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
