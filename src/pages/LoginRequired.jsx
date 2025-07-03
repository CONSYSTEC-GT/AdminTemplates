// src/pages/LoginRequired.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const LoginRequired = () => {
  return (
    <Box sx={{ textAlign: 'center', mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Sesión expirada o no encontrada. Por favor inicie sesión nuevamente.
      </Typography>  
      <Typography variant='body1'>
        No se puede acceder a esta página hasta que se haya iniciado la sesión correctamente.
      </Typography>  
       
       
    </Box>

);

};

export default LoginRequired;
