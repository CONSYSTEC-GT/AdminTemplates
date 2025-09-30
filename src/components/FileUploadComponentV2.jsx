import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography, Alert, Chip } from '@mui/material';
import { CloudUpload, CheckCircle, Error as ErrorIcon, Close } from '@mui/icons-material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { obtenerApiToken } from '../api/templatesGSApi';
import { guardarLogArchivos } from '../api/templatesGSArchivosLogs';

const ImprovedFileUpload = ({ onUploadSuccess, templateType, onImagePreview, onHeaderChange }) => {

  const [uploadState, setUploadState] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [imagePreview, setImagePreview] = useState(null); // Estado para la vista previa de la imagen

  let appId, appName, authCode, idUsuarioTalkMe, idNombreUsuarioTalkMe, empresaTalkMe, idBotRedes, idBot, urlTemplatesGS, urlWsFTP;
  useEffect(() => {
  const token = sessionStorage.getItem('authToken');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      appId = decoded.app_id;
      appName = decoded.app_name;
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
}, []);

  // Función utilitaria para mostrar alertas según el código de estado HTTP
  const showResponseAlert = (status, data = null, context = 'operación') => {
    let config = {};

    if (status >= 100 && status <= 199) {
      // Respuestas informativas (100-199)
      config = {
        icon: 'info',
        title: 'Procesando...',
        text: `La ${context} se está procesando. Por favor espera un momento.`,
        confirmButtonText: 'Entendido',
        timer: 3000,
        timerProgressBar: true
      };
    } else if (status >= 200 && status <= 299) {
      // Respuestas satisfactorias (200-299)
      config = {
        icon: 'success',
        title: '¡Éxito!',
        text: `La ${context} se completó correctamente.`,
        confirmButtonText: 'Perfecto',
        timer: 2000,
        timerProgressBar: true
      };
    } else if (status >= 300 && status <= 399) {
      // Redirecciones (300-399)
      config = {
        icon: 'warning',
        title: 'Redirección',
        text: `La ${context} requiere redirección. Serás redirigido automáticamente.`,
        confirmButtonText: 'Continuar',
        showCancelButton: false
      };
    } else if (status >= 400 && status <= 499) {
      // Errores del cliente (400-499)
      const clientErrorMessages = {
        400: "La información enviada no es válida. Revisa los datos e inténtalo de nuevo.",
        401: "Ocurrió un error inesperado. Vuelve a iniciar sesión e inténtalo nuevamente.",
        403: "No tienes permisos para realizar esta acción. Vuelve a iniciar sesión e inténtalo nuevamente.",
        404: "El recurso solicitado no fue encontrado. Intenta nuevamente.",
        408: "La solicitud tardó demasiado. Vuelve a intentarlo.",
        409: "Hay un conflicto con los datos enviados. Intenta nuevamente.",
        422: "Los datos no pueden ser procesados. Revisa la información e intenta nuevamente.",
        429: "Has hecho demasiadas solicitudes. Espera un momento e inténtalo de nuevo."
      };

      config = {
        icon: 'error',
        title: `Error en la solicitud ${context}`,
        html: `
        <p>${clientErrorMessages[status] || `Error del cliente (${status})`}</p>
        <p><strong>Sugerencia:</strong> Consulta a soporte técnico.</p>
        ${data?.message ? `<p><small><strong>Detalle:</strong> ${data.message}</small></p>` : ''}
      `,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6',
      };
    } else if (status >= 500 && status <= 599) {
      // Errores del servidor (500-599)
      const serverErrorMessages = {
        500: `Error interno del servidor. Intenta nuevamente ${context}.`,
        502: `El servidor no está disponible temporalmente. Intenta nuevamente ${context}.`,
        503: `El servicio no está disponible en este momento. Intenta nuevamente ${context}.`,
        504: `El servidor tardó demasiado en responder. Intenta nuevamente ${context}.`,
        507: `El servidor no tiene espacio suficiente para procesar la solicitud. Intenta nuevamente ${context}.`
      };

      config = {
        icon: 'error',
        title: `Error en la solicitud ${context}`,
        html: `
        <p>${serverErrorMessages[status] || `Error del servidor (${status})`}</p>
        <p><strong>Recomendación:</strong> Intenta nuevamente en unos minutos.</p>
        <p><small>Si el problema persiste, contacta al soporte técnico.</small></p>
      `,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6',
      };
    } else {
      // Códigos de estado desconocidos
      config = {
        icon: 'question',
        title: `Respuesta inesperada ${context}.`,
        text: `Se recibió un código de estado desconocido (${status}). Por favor contacta al soporte.`,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#6c757d'
      };
    }

    return Swal.fire(config);
  };

  // Configuración según el tipo
  const getFileConfig = () => {
    // Normalizar el tipo a minúsculas para comparación
    const normalizedType = templateType.toLowerCase();

    // Definir arrays de tipos válidos en inglés y español
    const imageTypes = ['image', 'imagen'];
    const videoTypes = ['video', 'video']; // video es igual en ambos idiomas
    const documentTypes = ['document', 'documento'];

    // Función helper para verificar si el tipo está en algún array
    const isType = (typeArray) => typeArray.includes(normalizedType);

    if (isType(imageTypes)) {
      return {
        accept: '.jpg, .jpeg, .png',
        maxSize: 5 * 1024 * 1024, // 5MB para imágenes
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        typeLabel: 'imagen'
      };
    } else if (isType(videoTypes)) {
      return {
        accept: '.mp4',
        maxSize: 16 * 1024 * 1024, // 16MB para videos
        allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'],
        typeLabel: 'video'
      };
    } else if (isType(documentTypes)) {
      return {
        accept: '.pdf , .doc, .docx, .xls, .xlsx, .csv, .pptx',
        maxSize: 20 * 1024 * 1024,
        allowedTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ],
        typeLabel: 'documento'
      };
    }

    return {
      accept: '',
      maxSize: 0,
      allowedTypes: [],
      typeLabel: ''
    };
  };

  const fileConfig = getFileConfig();

  const validateFile = (file) => {
    const errors = [];

    // Mostrar detalles del archivo







    // Validar tipo de archivo
    if (!fileConfig.allowedTypes.includes(file.type)) {
      console.warn('⚠️ Tipo de archivo no válido:', file.type);
      errors.push('Tipo de archivo no válido.');
      Swal.fire({
        title: 'Advertencia',
        text: 'Tipo de archivo no válido.',
        icon: 'warning',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#00c3ff'
      });
    }

    // Validar tamaño
    if (file.size > fileConfig.maxSize) {
      console.warn('⚠️ El tamaño del archivo supera el permitido:', file.size);
      errors.push('El tamaño del archivo es superior al permitido.');
      Swal.fire({
        title: 'Advertencia',
        text: 'El tamaño del archivo es superior al permitido.',
        icon: 'warning',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#00c3ff'
      });
    }

    return errors;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar archivo
    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      setUploadState('error');
      setErrorMessage(validationErrors.join(' '));
      return;
    }

    setSelectedFile(file);
    setUploadState('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      // Primero subir el archivo
      await realUpload(file);

      // Solo si la subida fue exitosa, crear la vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setUploadState('success');

        // Notificar al componente padre con la vista previa
        if (onImagePreview) {
          onImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);

    } catch (error) {
      setUploadState('error');
      setErrorMessage(error.message || 'Error al subir el archivo');
      // No creamos la vista previa en caso de error
    }
  };

  const handleHeaderChange = (e) => {
    const newHeader = e.target.value;
    setHeader(newHeader);

    // Añade esta línea para notificar al componente padre
    if (onHeaderChange) onHeaderChange(newHeader);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const realUpload = async (file) => {
    let gupshupSuccess = false;
    let mediaId = null;

    const crearLogBase = (nombreEvento, urlPeticion) => ({
      ID_CATEGORIA: null,
      ID_CONVERSACION: null,
      CLAVE_REGISTRO: null,
      IP: "127.0.0.1",
      NOMBRE_EVENTO: nombreEvento,
      TIPO_LOG: 0,
      URL_PETICION: urlPeticion,
      PETICION: "",
      RESPUESTA: "",
      INICIO_PETICION: new Date().toISOString(),
      FIN_PETICION: new Date().toISOString(),
      LOCAL_PAYMENT_HASH: null,
      NOTIFICACION_PAYMENT_HASH: null,
      CREADO_POR: idNombreUsuarioTalkMe || "USUARIO_DESCONOCIDO"
    });

    // === PRIMERA PARTE: SUBIDA A GUPSHUP ===
    let logGupshup = null;
    try {
        const gupshupStartTime = new Date();
        const gupshupUrl = `https://partner.gupshup.io/partner/app/${appId}/upload/media`;

        // Inicializar log para Gupshup
        logGupshup = crearLogBase("SUBIDA_ARCHIVO_GUPSHUP", gupshupUrl);
        logGupshup.INICIO_PETICION = gupshupStartTime.toISOString();

        const gupshupFormData = new FormData();
        gupshupFormData.append('file', file);
        gupshupFormData.append('file_type', file.type);

        const peticionGupshup = {
          metodo: 'POST',
          headers: {
            Authorization: authCode,
            'Content-Type': 'multipart/form-data'
          },
          payload: {
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            app_id: appId
          },
          metadata: {
            idEmpresa: empresaTalkMe,
            idBot: idBot,
            idBotRedes: idBotRedes,
            idUsuario: idUsuarioTalkMe,
          }
        };

        logGupshup.PETICION = JSON.stringify(peticionGupshup);

        const gupshupResponse = await axios.post(gupshupUrl, gupshupFormData, {
          headers: {
            Authorization: authCode,
          },
        });

        // Actualizar log con respuesta exitosa
        const gupshupEndTime = new Date();
        logGupshup.FIN_PETICION = gupshupEndTime.toISOString();

        const respuestaGupshup = {
          status: gupshupResponse.status,
          statusText: gupshupResponse.statusText,
          headers: {
            'content-type': gupshupResponse.headers['content-type'],
            'content-length': gupshupResponse.headers['content-length']
          },
          data: gupshupResponse.data,
          duracion_ms: gupshupEndTime.getTime() - gupshupStartTime.getTime(),
          exitoso: true
        };

        logGupshup.RESPUESTA = JSON.stringify(respuestaGupshup);
        logGupshup.NOMBRE_EVENTO = "SUBIDA_ARCHIVO_GUPSHUP_EXITOSO";

        // Validar respuesta de Gupshup
        if (!gupshupResponse.data || !gupshupResponse.data.handleId) {
          throw new Error('Respuesta de Gupshup incompleta o no válida');
        }

        mediaId = gupshupResponse.data.handleId.message;
        gupshupSuccess = true;

        // Guardar log exitoso de Gupshup
        try {
          await guardarLogArchivos(logGupshup, urlTemplatesGS);
        } catch (logError) {
        }

    } catch (gupshupError) {
        // Actualizar log con error
        if (logGupshup) {
          const gupshupEndTime = new Date();
          logGupshup.FIN_PETICION = gupshupEndTime.toISOString();
          logGupshup.NOMBRE_EVENTO = "SUBIDA_ARCHIVO_GUPSHUP_FALLIDO";

          const respuestaErrorGupshup = {
            error: true,
            message: gupshupError.message,
            stack: gupshupError.stack,
            duracion_ms: gupshupEndTime.getTime() - new Date(logGupshup.INICIO_PETICION).getTime()
          };

          if (gupshupError.response) {
            respuestaErrorGupshup.status = gupshupError.response.status;
            respuestaErrorGupshup.statusText = gupshupError.response.statusText;
            respuestaErrorGupshup.headers = gupshupError.response.headers;
            respuestaErrorGupshup.data = gupshupError.response.data;
          }

          logGupshup.RESPUESTA = JSON.stringify(respuestaErrorGupshup);

          // Guardar log de error de Gupshup
          try {
            await guardarLogArchivos(logGupshup, urlTemplatesGS);
          } catch (logError) {
          }
        }

        console.error('Error específico de Gupshup:', gupshupError);

        const status = gupshupError.response?.status || 500;
        const errorData = gupshupError.response?.data || { message: gupshupError.message };

        await showResponseAlert(status, errorData, 'subida de archivo a Gupshup');

        setUploadState('error');
        setErrorMessage('Error al subir el archivo a Gupshup');
        
        // ✅ LANZAR ERROR PARA QUE EL COMPONENTE LO CAPTURE
        throw new Error('Error al subir el archivo a Gupshup');
    }

    // === SEGUNDA PARTE: SUBIDA AL SERVICIO PROPIO WSFTP ===
    // Solo se ejecuta si Gupshup fue exitoso
    let logWsftp = null;
    try {
        const wsftpStartTime = new Date();

        // Inicializar log para WSFTP
        logWsftp = crearLogBase("SUBIDA_ARCHIVO_WSFTP", urlWsFTP);
        logWsftp.INICIO_PETICION = wsftpStartTime.toISOString();

        let apiToken;

        try {
          apiToken = await obtenerApiToken(urlTemplatesGS, empresaTalkMe);
        } catch (tokenError) {
          throw new Error(`Fallo al obtener token: ${tokenError.message}`);
        }

        const base64Content = await convertToBase64(file);

        const payload = {
          idEmpresa: empresaTalkMe,
          idBot: idBot,
          idBotRedes: idBotRedes,
          idUsuario: idUsuarioTalkMe,
          tipoCarga: 3,
          nombreArchivo: file.name,
          contenidoArchivo: base64Content.split(',')[1],
        };

        // Preparar datos de petición para el log
        const peticionWsftp = {
          metodo: 'POST',
          headers: {
            'x-api-token': apiToken,
            'Content-Type': 'application/json'
          },
          payload: {
            idEmpresa: empresaTalkMe,
            idBot: idBot,
            idBotRedes: idBotRedes,
            idUsuario: idUsuarioTalkMe,
            tipoCarga: 3,
            nombreArchivo: file.name,
            contenidoArchivo: '***BASE64_CONTENT***',
            tamanoOriginal: file.size,
            tipoArchivo: file.type
          },
          metadata: {
            gupshupMediaId: mediaId,
            procesoCompleto: true
          }
        };

        logWsftp.PETICION = JSON.stringify(peticionWsftp);

        const ownServiceResponse = await axios.post(
          urlWsFTP,
          payload,
          {
            headers: {
              'x-api-token': apiToken,
              'Content-Type': 'application/json',
            },
          }
        );

        // Actualizar log con respuesta exitosa
        const wsftpEndTime = new Date();
        logWsftp.FIN_PETICION = wsftpEndTime.toISOString();

        // Validar respuesta del servicio propio
        if (!ownServiceResponse.data) {
          throw new Error('Respuesta del servicio propio incompleta o no válida');
        }

        const ownServiceData = ownServiceResponse.data;

        const respuestaWsftp = {
          status: ownServiceResponse.status,
          statusText: ownServiceResponse.statusText,
          headers: {
            'content-type': ownServiceResponse.headers['content-type'],
            'content-length': ownServiceResponse.headers['content-length']
          },
          data: ownServiceData,
          duracion_ms: wsftpEndTime.getTime() - wsftpStartTime.getTime(),
          exitoso: true,
          urlArchivo: ownServiceData.url
        };

        logWsftp.RESPUESTA = JSON.stringify(respuestaWsftp);
        logWsftp.NOMBRE_EVENTO = "SUBIDA_ARCHIVO_WSFTP_EXITOSO";

        // Guardar log exitoso de WSFTP
        try {
          await guardarLogArchivos(logWsftp, urlTemplatesGS);
        } catch (logError) {
        }

        // ✅ AMBOS SERVICIOS EXITOSOS - ACTUALIZAR ESTADO AQUÍ
        setUploadState('success');
        
        // Si ambos servicios fueron exitosos
        if (gupshupSuccess && onUploadSuccess) {
          onUploadSuccess({ mediaId, url: ownServiceData.url });
        }

        // Alerta final de éxito para ambos servicios
        await Swal.fire({
          icon: 'success',
          title: '¡Archivo cargado!',
          text: 'El archivo se ha subido correctamente',
          confirmButtonText: 'Excelente',
          timer: 3000,
          timerProgressBar: true,
          confirmButtonColor: '#00c3ff'
        });

    } catch (ownServiceError) {
        // Actualizar log con error de WSFTP
        if (logWsftp) {
          const wsftpEndTime = new Date();
          logWsftp.FIN_PETICION = wsftpEndTime.toISOString();
          logWsftp.NOMBRE_EVENTO = "SUBIDA_ARCHIVO_WSFTP_FALLIDO";

          const respuestaErrorWsftp = {
            error: true,
            message: ownServiceError.message,
            stack: ownServiceError.stack,
            duracion_ms: wsftpEndTime.getTime() - new Date(logWsftp.INICIO_PETICION).getTime()
          };

          if (ownServiceError.response) {
            respuestaErrorWsftp.status = ownServiceError.response.status;
            respuestaErrorWsftp.statusText = ownServiceError.response.statusText;
            respuestaErrorWsftp.headers = ownServiceError.response.headers;
            respuestaErrorWsftp.data = ownServiceError.response.data;
          }

          logWsftp.RESPUESTA = JSON.stringify(respuestaErrorWsftp);

          // Guardar log de error de WSFTP
          try {
            await guardarLogArchivos(logWsftp, urlTemplatesGS);
          } catch (logError) {
          }
        }

        console.error('Error específico del servicio propio WSFTP:', ownServiceError);

        const status = ownServiceError.response?.status || 500;
        const errorData = ownServiceError.response?.data || { message: ownServiceError.message };

        await showResponseAlert(status, errorData, 'subida de archivo al Servicio Propio (WsFTP)');
        
        // ✅ ACTUALIZAR ESTADO Y LANZAR ERROR
        setUploadState('error');
        setErrorMessage('Error al subir el archivo al Servicio Propio (WsFTP)');
        throw new Error('Error al subir el archivo al Servicio Propio (WsFTP)');
    }
};



  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadState('idle');
    setUploadProgress(0);
    setErrorMessage('');

    // LIMPIAR LA VISTA PREVIA DE LA IMAGEN
    setImagePreview(null);

    // Notificar al componente padre que se quitó la imagen
    if (onImagePreview) {
      onImagePreview(null);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileInputKey(prev => prev + 1);
  };

  const handleRetry = () => {
    if (selectedFile) {
      setUploadState('uploading');
      setErrorMessage('');
      
      realUpload(selectedFile)
        .then(() => {
          // Ya no necesitas setUploadState('success') aquí
          // porque realUpload ya lo maneja internamente
        })
        .catch((error) => {
          // Este catch SÍ se ejecutará ahora porque realUpload lanza errores
          setUploadState('error');
          setErrorMessage(error.message || 'Error al subir el archivo');
        });
    }
  };

  const renderUploadButton = () => {
    if (uploadState === 'idle' || uploadState === 'error') {
      return (
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUpload />}
          size="large"
          sx={{
            minHeight: 56,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          Seleccionar y Subir Archivo
        </Button>
      );
    }

    return null;
  };

  const renderFileStatus = () => {
    if (!selectedFile) return null;

    return (
      <Box sx={{ mt: 2, width: '100%' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 2,
          border: 1,
          borderColor: uploadState === 'success' ? 'success.light' :
            uploadState === 'error' ? 'error.light' : 'grey.300',
          borderRadius: 2,
          bgcolor: uploadState === 'success' ? 'success.lighter' :
            uploadState === 'error' ? 'error.lighter' : 'grey.50',
        }}>
          {uploadState === 'uploading' && (
            <CircularProgress size={24} />
          )}

          {uploadState === 'success' && (
            <CheckCircle color="action" />
          )}

          {uploadState === 'error' && (
            <ErrorIcon color="action" />
          )}

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight="medium">
              {selectedFile.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </Typography>

            {uploadState === 'uploading' && (
              <Typography variant="caption" color="primary">
                Subiendo archivo...
              </Typography>
            )}

            {uploadState === 'success' && (
              <Typography variant="caption" color="success.main">
                Archivo subido exitosamente
              </Typography>
            )}

            {uploadState === 'error' && (
              <Typography variant="caption" color="error.main">
                {errorMessage}
              </Typography>
            )}
          </Box>

          {uploadState === 'success' && (
            <Chip
              label="Completado"
              color="success"
              size="small"
              variant="outlined"
            />
          )}

          {uploadState === 'error' && (
            <Button
              size="small"
              onClick={handleRetry}
              variant="outlined"
              color="error"
            >
              Reintentar
            </Button>
          )}

          <Button
            size="small"
            onClick={handleRemoveFile}
            sx={{ minWidth: 'auto', p: 0.5 }}
          >
            <Close fontSize="small" />
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ mb: 2 }}>
      <input
        accept={fileConfig.accept}
        style={{ display: 'none' }}
        id={`file-upload-${fileInputKey}`}
        type="file"
        onChange={handleFileChange}
        ref={fileInputRef}
        key={fileInputKey}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {(uploadState === 'idle' || uploadState === 'error') && (
          <label htmlFor={`file-upload-${fileInputKey}`}>
            {renderUploadButton()}
          </label>
        )}

        {renderFileStatus()}

        {(uploadState === 'idle' || uploadState === 'error') && templateType === "IMAGE" && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Formatos permitidos: JPG, JPEG, PNG. Máximo 5 MB
          </Typography>
        )}
        {(uploadState === 'idle' || uploadState === 'error') && templateType === "VIDEO" && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Formatos permitidos: MP4. Máximo 15 MB
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ImprovedFileUpload;