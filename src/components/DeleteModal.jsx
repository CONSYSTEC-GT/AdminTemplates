import React, { useState } from 'react';
import { Alert, Modal, Box, Typography, Button, Snackbar } from '@mui/material';
import { Delete as DeleteIcon, Check as CheckIcon } from '@mui/icons-material';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const DeleteModal = ({ open, onClose, onConfirm, template }) => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Recupera el token del localStorage
  const token = localStorage.getItem('authToken');

  // Decodifica el token para obtener appId y authCode
  let appId, authCode, idUsuarioTalkMe, idNombreUsuarioTalkMe, empresaTalkMe, idBotRedes, idBot, urlTemplatesGS, apiToken, urlWsFTP;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      appId = decoded.app_id; // Extrae appId del token
      authCode = decoded.auth_code; // Extrae authCode del token
      idUsuarioTalkMe = decoded.id_usuario;
      idNombreUsuarioTalkMe = decoded.nombre_usuario;
      empresaTalkMe = decoded.empresa;
      idBotRedes = decoded.id_bot_redes;
      idBot = decoded.id_bot;
      urlTemplatesGS = decoded.urlTemplatesGS;
      apiToken = decoded.apiToken;
      urlWsFTP = decoded.urlWsFTP;
    } catch (error) {
      console.error('Error decodificando el token:', error);
    }
  }

  /*

  let appId, authCode, appName, idUsuarioTalkMe, idNombreUsuarioTalkMe, empresaTalkMe, idBotRedes, idBot, urlTemplatesGS, apiToken, urlWsFTP;

  appId = '1fbd9a1e-074c-4e1e-801c-b25a0fcc9487'; // Extrae appId del token
  authCode = 'sk_d416c60960504bab8be8bc3fac11a358'; // Extrae authCode del token
  appName = 'DemosTalkMe55'; // Extrae el nombre de la aplicación
  idUsuarioTalkMe = 78;  // Cambiado de idUsuario a id_usuario
  idNombreUsuarioTalkMe = 'javier.colocho';  // Cambiado de nombreUsuario a nombre_usuario
  empresaTalkMe = 2;
  empresaTalkMe = 2;
  idBotRedes = 721;
  idBot = 257;
  urlTemplatesGS = 'http://localhost:3004/api/';
  apiToken = 'TFneZr222V896T9756578476n9J52mK9d95434K573jaKx29jq';
  urlWsFTP = 'https://dev.talkme.pro/WsFTP/api/ftp/upload';
  */

  const iniciarRequest = async () => {
    try {
      // Hacer el primer request
      const result = await handleDelete();

      // Verificar si el primer request fue exitoso
      if (result && result.status === "success") {
        // Extraer el valor de `id` del objeto `template`
        const templateId = result.template.id;

        // Hacer el segundo request, pasando el `id` como parámetro
        await handleDelete2(templateId, idNombreUsuarioTalkMe);

        // Cierra el modal y notifica al padre
        onClose(); // Cierra el modal de confirmación
        onConfirm(template); // Esto llama a handleDeleteConfirm en el padre

        // Mostrar confirmación de éxito
        Swal.fire({
          title: 'Eliminado',
          text: 'La plantilla fue eliminada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00c3ff'
        });
      } else {
        console.error("El primer request no fue exitoso o no tiene el formato esperado.");
        Swal.fire({
          title: 'Error',
          text: 'La plantilla no pudo ser eliminada correctamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00c3ff'
        });
      }
    } catch (error) {
      console.error("Ocurrió un error:", error);
      Swal.fire({
        title: 'Error',
        text: 'La plantilla no pudo ser eliminada correctamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00c3ff'
      });
    }
  };


  const handleDelete = async () => {
    if (!template) return;

    try {
      const response = await fetch(
        `https://partner.gupshup.io/partner/app/${appId}/template/${template.elementName}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: authCode,
          },
        }
      );

      if (response.ok) {
        return { status: "success", template: { id: template.id } }; // Devuelve el estado y el ID de la plantilla
      } else {
        return { status: "error" }; // Devuelve un estado de error
      }
    } catch (error) {
      
      return { status: "error" }; // Devuelve un estado de error
    }
  };

  const handleDelete2 = async (templateId, idNombreUsuarioTalkMe) => {
    const url = `${urlTemplatesGS}plantillas/${templateId}`;
    const headers = {
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: headers,
        body: JSON.stringify({ idNombreUsuarioTalkMe: idNombreUsuarioTalkMe })
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response:", errorResponse);
        return null; // Retornar null en caso de error
      }

      const result = await response.json();
      
      return result;
    } catch (error) {
      console.error("Error en el segundo request:", error);
      return null; // Retornar null en caso de error
    }
  };


  // Modificamos también esta función para manejar apropiadamente el cierre
  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
    onConfirm(template); // Ahora llamamos a onConfirm al cerrar el modal de confirmación
  };

  if (!template) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={!showConfirmationModal ? onClose : undefined}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <Box sx={modalStyle}>
            <>
              <Typography id="delete-modal-title" variant="h6" gutterBottom>
                ¿Estás seguro de eliminar esta plantilla?
              </Typography>
              <Typography id="delete-modal-description" sx={{ mb: 2 }}>
                La siguiente plantilla será eliminada permanentemente:
              </Typography>
              <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Nombre:</strong> {template.elementName}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Estado:</strong> {template.status}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Categoría:</strong> {template.category}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Tipo:</strong> {template.templateType}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Fecha de creación:</strong>{' '}
                  {new Date(template.createdOn).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={iniciarRequest}
                >
                  Eliminar
                </Button>
              </Box>
            </>
          
        </Box>
      </Modal>
    </>
  );
};

export default DeleteModal;