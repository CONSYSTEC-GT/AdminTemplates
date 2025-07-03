// src/pages/LoginRequired.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip,
  styled 
} from '@mui/material';

const Cloud = styled('div')(({ theme }) => ({
  position: 'absolute',
  backgroundColor: '#9CDEFF',
  opacity: 0.2,
  borderRadius: '50%',
}));

const Background = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: '#f8fafc',
  zIndex: -2,
});

const LoginRequired = () => {
  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100vw',
        margin: 0,
        padding: '20px',
        boxSizing: 'border-box',
        position: 'fixed', // Cambiado de 'relative' a 'fixed'
        top: 0,
        left: 0,
        // Estas propiedades aseguran que ignore cualquier estilo padre
        zIndex: 1000,
      }}
    >
      <Background>
        <Cloud sx={{ width: '100px', height: '40px', top: '25%', left: '15%' }} />
        <Cloud sx={{ width: '150px', height: '60px', top: '40%', right: '20%' }} />
        <Cloud sx={{ width: '80px', height: '30px', bottom: '30%', left: '25%' }} />
      </Background>

      <Paper 
        elevation={3}
        sx={{
          maxWidth: 520,
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 2,
          padding: 4,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <img 
            src="https://s3.amazonaws.com/com.talkme/talkme/archivos_consola/ficohsa/ficohsa/talkme-messages-23692250514214636.png" 
            alt="Logo" 
            style={{ height: '24px' }}
          />
        </Box>

        <Typography variant="h4" sx={{ color: '#333333', mb: 2, fontWeight: 600 }}>
          Sesión Expirada - No Autorizado
        </Typography>
        
        <Typography variant="body1" sx={{ color: '#666666', mb: 3, lineHeight: 1.5 }}>
          Debes iniciar sesión nuevamente o proporcionar credenciales válidas para acceder a esta página.
        </Typography>

        <Chip
          label="Todos los Sistemas Operativos"
          sx={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #d0ebff',
            color: '#0a7bbd',
            mb: 3,
          }}
          icon={
            <Box 
              sx={{
                width: 8,
                height: 8,
                backgroundColor: '#10b981',
                borderRadius: '50%',
                mr: 1,
              }}
            />
          }
        />

        <Box sx={{ my: 4 }}>
          <img 
            src="https://s3.amazonaws.com/com.talkme/talkme/archivos_consola/ficohsa/ficohsa/TalkMeError-23692250514214632.png" 
            alt="Ilustración de Error" 
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: '#999999', mt: 4, fontSize: 13 }}>
          — Acceso restringido —
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginRequired;