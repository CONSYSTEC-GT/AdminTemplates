// components/CustomDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Slide
} from '@mui/material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const CustomDialog = ({
  open,
  onClose,
  title,
  message,
  severity = 'success',
  buttonText = 'Entendido',
  buttonVariant = 'contained',
  showIcon = true,
  fullWidthButton = true
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,  
        bgcolor: 'primary.light', 
        color: 'primary.contrastText', 
        py: 2, // Aumentado el padding vertical
        px: 3, // Aumentado el padding horizontal
        fontWeight: 'medium'
      }}>
        {title}
      </DialogTitle>
      
      <DialogContent sx={{ 
        pt: 3, // Espacio superior reducido
        pb: 1, // Espacio inferior reducido
        px: 3  // Padding horizontal consistente
      }}>
        <Alert
          severity={severity}
          sx={{ 
            my: 2, // Margen vertical
            width: '100%', // Ocupa todo el ancho disponible
            alignItems: 'flex-start' // Alinea el icono con el texto
          }}
          icon={showIcon ? undefined : false}
        >
          {message}
        </Alert>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, // Aumentado el padding inferior
        pt: 0  // Eliminado padding superior
      }}>
        <Button
          onClick={onClose}
          variant={buttonVariant}
          color="primary"
          fullWidth={fullWidthButton}
          size="large"
          sx={{
            borderRadius: 1,
            py: 1.5, // Padding vertical para el botón
            fontWeight: 'medium'
          }}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};