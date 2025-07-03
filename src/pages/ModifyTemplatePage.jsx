import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import EditTemplateForm from '../components/EditTemplateForm';



const ModifyTemplatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const template = location.state?.template || {}; // Si no hay plantilla, usa un objeto vacío



  const handleHome = () => {
    navigate('/'); // Navega a la página Home
  };

  return (
    <Box sx={{ padding: 3 }}>
      {/*Titulo*/}<Typography variant="h4" component="h1" gutterBottom>
        Modificar Template
      </Typography>

      {/*Boton Regresar*/}<Tooltip title="Volver al Dashboard">
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={handleHome}
          sx={{ marginBottom: 2 }}
        >
          Regresar
        </Button>
      </Tooltip>

      {/* Pasa el objeto template a TemplateForm */}
      <EditTemplateForm />
      

    </Box>
  );
};

export default ModifyTemplatePage;
