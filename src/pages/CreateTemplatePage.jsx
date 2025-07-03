import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TemplateForm from '../components/TemplateForm';

const CreateTemplatePage = () => {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate('/'); // Navega a la página Home
  };

  return (
    <Box sx={{ padding: 3 }}>
      {/*Titulo*/}<Typography variant="h4" component="h1" gutterBottom>
        Crear plantilla
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

      {/*Informacion inicial*/}<Box sx={{ backgroundColor: '#fdf3f5', padding: 2, borderRadius: 1, marginTop: 3 }}>
        <Typography variant="body1">
          Tenga en cuenta que ahora es obligatorio proporcionar muestras al crear plantillas de mensajes.
          <br />
          Las muestras son una forma de proporcionar un ejemplo de posibles datos para su plantilla. Esto nos
          ayuda durante el proceso de revisión y aprobación, para que podamos entender qué tipo de mensaje planeas enviar.
        </Typography>
      </Box>

      <TemplateForm />
    </Box>
  );
};

export default CreateTemplatePage;
