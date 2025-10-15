import React, { useState } from 'react';
import { Alert, Modal, Box, Typography, Button, Snackbar } from '@mui/material';
import { Delete as DeleteIcon, Check as CheckIcon } from '@mui/icons-material';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { guardarLogArchivos } from "../api/templatesGSArchivosLogs";

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
  const [loading, setLoading] = useState(false);

  const token = sessionStorage.getItem('authToken');

  let appId, authCode, idUsuarioTalkMe, idNombreUsuarioTalkMe, empresaTalkMe, idBotRedes, idBot, urlTemplatesGS, urlWsFTP;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      appId = decoded.app_id;
      authCode = decoded.auth_code;
      idUsuarioTalkMe = decoded.id_usuario;
      idNombreUsuarioTalkMe = decoded.nombre_usuario;
      empresaTalkMe = decoded.empresa;
      idBotRedes = decoded.id_bot_redes;
      idBot = decoded.id_bot;
      urlTemplatesGS = decoded.urlTemplatesGS;
      urlWsFTP = decoded.urlWsFTP;
    } catch (error) {
      console.error('Error decodificando el token:', error);
    }
  }

  const iniciarRequest = async () => {
  if (loading) return;
  setLoading(true);
  
  try {
    const result = await handleDelete();
    
    if (result && result.status === "success") {
      const templateId = result.template.id;
      await handleDelete2(templateId, idNombreUsuarioTalkMe);

      onClose();
      onConfirm(template);

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
  } finally {
    // Esto se ejecuta SIEMPRE, sea éxito o error
    setLoading(false);
  }
};


const handleDelete = async () => {
  if (!template) return;

  const url = `https://partner.gupshup.io/partner/app/${appId}/template/${template.gupshup.elementName}`;
  const inicioPeticion = new Date().toISOString();

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: authCode,
      },
    });

    const finPeticion = new Date().toISOString();

    if (response.ok) {
      await guardarLogArchivos({
        NOMBRE_EVENTO: "PLANTILLAS_GUPSHUP_ELIMINAR_EXITOSO",
        TIPO_LOG: 1,
        URL_PETICION: url,
        PETICION: {
          method: 'DELETE',
          headers: {
            Authorization: authCode,
          },
          templateName: template.gupshup.elementName,
          appId: appId,
          templateData: {
            id: template.gupshup.id,
            category: template.gupshup.category,
            languageCode: template.gupshup.languageCode,
            templateType: template.gupshup.templateType,
          }
        },
        RESPUESTA: {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        },
        INICIO_PETICION: inicioPeticion,
        FIN_PETICION: finPeticion,
        CREADO_POR: idNombreUsuarioTalkMe,
      }, urlTemplatesGS);

      return { status: "success", template: { id: template.id } };
    } else {
      const errorText = await response.text();
      let errorResponse;
      try {
        errorResponse = JSON.parse(errorText);
      } catch (e) {
        errorResponse = { message: "Error no JSON", raw: errorText };
      }

      await guardarLogArchivos({
        NOMBRE_EVENTO: "PLANTILLAS_GUPSHUP_ELIMINAR_ERROR",
        TIPO_LOG: 2,
        URL_PETICION: url,
        PETICION: {
          method: 'DELETE',
          headers: {
            Authorization: authCode,
          },
          templateName: template.gupshup.elementName,
          appId: appId,
          templateData: {
            id: template.gupshup.id,
            category: template.gupshup.category,
            languageCode: template.gupshup.languageCode,
            templateType: template.gupshup.templateType,
          }
        },
        RESPUESTA: {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          error: errorResponse,
        },
        INICIO_PETICION: inicioPeticion,
        FIN_PETICION: finPeticion,
        CREADO_POR: idNombreUsuarioTalkMe,
      }, urlTemplatesGS);

      return { status: "error", message: errorResponse.message };
    }
  } catch (error) {
    const finPeticion = new Date().toISOString();
    
    await guardarLogArchivos({
      NOMBRE_EVENTO: "PLANTILLAS_GUPSHUP_ELIMINAR_EXCEPTION",
      TIPO_LOG: 2,
      URL_PETICION: url,
      PETICION: {
        method: 'DELETE',
        headers: {
          Authorization: authCode,
        },
        templateName: template.gupshup.elementName,
        appId: appId,
        templateData: {
          id: template.gupshup.id,
          category: template.gupshup.category,
          languageCode: template.gupshup.languageCode,
          templateType: template.gupshup.templateType,
        }
      },
      RESPUESTA: {
        error: error.message,
        stack: error.stack,
      },
      INICIO_PETICION: inicioPeticion,
      FIN_PETICION: finPeticion,
      CREADO_POR: idNombreUsuarioTalkMe,
    }, urlTemplatesGS);

    return { status: "error" };
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
        return null; 
      }

      const result = await response.json();
      
      return result;
    } catch (error) {
      console.error("Error en el segundo request:", error);
      return null;
    }
  };

  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
    onConfirm(template);
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
                  <strong>Nombre:</strong> {template.gupshup.elementName}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Estado:</strong> {template.gupshup.status}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Categoría:</strong> {template.gupshup.category}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Tipo:</strong> {template.gupshup.templateType}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Fecha de creación:</strong>{' '}
                  {new Date(template.gupshup.createdOn).toLocaleString()}
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
                  disabled={loading}
                >
                  {loading ? "Eliminando..." : "Eliminar plantilla"}
                </Button>
              </Box>
            </>
          
        </Box>
      </Modal>
    </>
  );
};

export default DeleteModal;