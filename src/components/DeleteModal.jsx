import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  LinearProgress,
  Fade,
  Slide,
} from '@mui/material';
import {
  DeleteForever as DeleteForeverIcon,
  Close as CloseIcon,
  WarningAmber as WarningIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Label as LabelIcon,
  CheckCircleOutline as StatusIcon,
  Description as TypeIcon,
} from '@mui/icons-material';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { guardarLogArchivos } from "../api/templatesGSArchivosLogs";

const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DeleteModal = ({ open, onClose, onConfirm, template }) => {
  const [loading, setLoading] = useState(false);

  const token = sessionStorage.getItem('authToken');

  let appId, authCode, idNombreUsuarioTalkMe, urlTemplatesGS;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      appId = decoded.app_id;
      authCode = decoded.auth_code;
      idNombreUsuarioTalkMe = decoded.nombre_usuario;
      urlTemplatesGS = decoded.urlTemplatesGS;
    } catch (error) {
      console.error('Error decodificando el token:', error);
    }
  }

  const iniciarRequest = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const validacion = await validarEliminacion(template.id);

      if (!validacion.puedeEliminar) {
        onClose(); // 👈 Cerrar el modal primero
        Swal.fire({
          title: 'No se puede eliminar',
          text: validacion.error,
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00c3ff',
          customClass: { container: 'swal-over-modal' },
          didOpen: () => {
            document.querySelector('.swal2-container').style.zIndex = '9999';
          },
        });
        return;
      }

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
          confirmButtonColor: '#00c3ff',
          didOpen: () => {
            document.querySelector('.swal2-container').style.zIndex = '9999';
          },
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'La plantilla no pudo ser eliminada de Gupshup.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00c3ff',
          didOpen: () => {
            document.querySelector('.swal2-container').style.zIndex = '9999';
          },
        });
      }
    } catch (error) {
      console.error("Ocurrió un error:", error);
      Swal.fire({
        title: 'Error',
        text: 'La plantilla no pudo ser eliminada correctamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00c3ff',
        didOpen: () => {
          document.querySelector('.swal2-container').style.zIndex = '9999';
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const validarEliminacion = async (templateId) => {
    const url = `${urlTemplatesGS}plantillas/${templateId}/contacto-programado`;
    console.log('Validando en:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
      return { puedeEliminar: false, error: data.error || "No se puede eliminar la plantilla." };
    }

    return data;
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
            headers: { Authorization: authCode },
            templateName: template.gupshup.elementName,
            appId: appId,
            templateData: {
              id: template.gupshup.id,
              category: template.gupshup.category,
              languageCode: template.gupshup.languageCode,
              templateType: template.gupshup.templateType,
            },
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
            headers: { Authorization: authCode },
            templateName: template.gupshup.elementName,
            appId: appId,
            templateData: {
              id: template.gupshup.id,
              category: template.gupshup.category,
              languageCode: template.gupshup.languageCode,
              templateType: template.gupshup.templateType,
            },
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
          headers: { Authorization: authCode },
          templateName: template.gupshup.elementName,
          appId: appId,
          templateData: {
            id: template.gupshup.id,
            category: template.gupshup.category,
            languageCode: template.gupshup.languageCode,
            templateType: template.gupshup.templateType,
          },
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
    const headers = { "Content-Type": "application/json" };

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: headers,
        body: JSON.stringify({ idNombreUsuarioTalkMe: idNombreUsuarioTalkMe }),
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

  if (!template) return null;

  const statusColorMap = {
    APPROVED: 'success',
    REJECTED: 'error',
    PENDING: 'warning',
    FAILED: 'error',
  };

  const statusColor = statusColorMap[template.gupshup.status?.toUpperCase()] || 'default';

  const infoItems = [
    {
      icon: <LabelIcon sx={{ fontSize: 20, color: '#ef5350' }} />,
      label: 'Nombre',
      value: template.gupshup.elementName,
    },
    {
      icon: <StatusIcon sx={{ fontSize: 20, color: '#ef5350' }} />,
      label: 'Estado',
      value: (
        <Chip
          label={template.gupshup.status}
          color={statusColor}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
        />
      ),
    },
    {
      icon: <CategoryIcon sx={{ fontSize: 20, color: '#ef5350' }} />,
      label: 'Categoría',
      value: template.gupshup.category,
    },
    {
      icon: <TypeIcon sx={{ fontSize: 20, color: '#ef5350' }} />,
      label: 'Tipo',
      value: template.gupshup.templateType,
    },
    {
      icon: <CalendarIcon sx={{ fontSize: 20, color: '#ef5350' }} />,
      label: 'Creado',
      value: new Date(template.gupshup.createdOn).toLocaleString(),
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      TransitionComponent={SlideTransition}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
        },
      }}
    >

      {loading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #ef5350, #f44336)',
            },
            backgroundColor: 'rgba(244,67,54,0.12)',
          }}
        />
      )}

      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 1,
          pt: 2.5,
          px: 3,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
            flexShrink: 0,
          }}
        >
          <WarningIcon sx={{ color: '#d32f2f', fontSize: 26 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#212121', lineHeight: 1.3 }}>
            Eliminar plantilla
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            Esta acción no se puede deshacer
          </Typography>
        </Box>
        {!loading && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.06)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Estás a punto de eliminar permanentemente la siguiente plantilla. Revisa la información antes de confirmar.
        </Typography>

        <Box
          sx={{
            border: '1px solid',
            borderColor: '#fee2e2',
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: 'rgba(239, 83, 80, 0.02)',
          }}
        >
          {infoItems.map((item, index) => (
            <Box key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25 }}>
                {React.cloneElement(item.icon, { sx: { color: '#ef5350', fontSize: 20 } })}

                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: '#424242', minWidth: 80, fontSize: '0.825rem' }}
                >
                  {item.label}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: '#616161', flex: 1, textAlign: 'right', fontSize: '0.825rem' }}
                >
                  {item.value}
                </Typography>
              </Box>
              {index < infoItems.length - 1 && (
                <Divider sx={{ borderColor: '#fee2e2' }} />
              )}
            </Box>
          ))}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            borderColor: '#00c3ff',
            color: '#0099cc',
            '&:hover': {
              borderColor: '#0099cc',
              backgroundColor: 'rgba(0, 195, 255, 0.05)',
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={iniciarRequest}
          disabled={loading}
          startIcon={!loading ? <DeleteForeverIcon /> : null}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            background: loading
              ? undefined
              : 'linear-gradient(135deg, #ef5350 0%, #d32f2f 100%)',
            boxShadow: loading
              ? undefined
              : '0 4px 12px rgba(211, 47, 47, 0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #e53935 0%, #c62828 100%)',
              boxShadow: '0 6px 16px rgba(211, 47, 47, 0.45)',
            },
            '&.Mui-disabled': {
              background: '#ef9a9a',
              color: '#fff',
            },
          }}
        >
          {loading ? 'Eliminando...' : 'Eliminar plantilla'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteModal;