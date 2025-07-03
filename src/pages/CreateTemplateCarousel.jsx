import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TemplateFormCarousel from '../components/TemplateFormCarousel';
import TemplateFormCarouselV2 from '../components/TemplateFormCarouselV2';

const CreateTemplateCarousel = () => {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate('/'); // Navega a la página Home
  };

  return (
    <Box sx={{
      padding: 3,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/*Titulo*/}<Typography variant="h4" component="h1" gutterBottom>
        Crear Plantilla Carrusel
      </Typography>

      {/*Boton Regresar<Tooltip title="Volver al Dashboard">
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={handleHome}
          sx={{ marginBottom: 2 }}
        >
          Regresar
        </Button>
      </Tooltip>*/}

       {/*Informacion inicial<Box sx={{
        backgroundColor: '#fdf3f5',
        padding: 1,  // Reducido de 2 a 1
        borderRadius: 1,
        marginTop: 1, // Reducido de 3 a 2
        marginBottom: 2,
        fontSize: '0.875rem' // Tamaño de fuente ligeramente más pequeño
      }}>
        <Typography variant="body2"> {/* Cambiado a body2 que es más pequeño que body1 
          Tenga en cuenta que ahora es obligatorio proporcionar muestras al crear plantillas de mensajes.
          <br />
          Las muestras son una forma de proporcionar un ejemplo de posibles datos para su plantilla. Esto nos
          ayuda durante el proceso de revisión y aprobación, para que podamos entender qué tipo de mensaje planeas enviar.
        </Typography>
      </Box> */}

      <TemplateFormCarouselV2 />
    </Box>
  );
};

export default CreateTemplateCarousel;
