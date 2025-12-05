import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography, Alert, Chip } from '@mui/material';
import { CloudUpload, CheckCircle, Error as ErrorIcon, Close } from '@mui/icons-material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { obtenerApiToken } from '../api/templatesGSApi';
import { guardarLogArchivos } from '../api/templatesGSArchivosLogs';

const ImprovedFileUpload = ({ onUploadSuccess, carouselType }) => {

  const [uploadState, setUploadState] = useState('idle');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [imagePreview, setImagePreview] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setTokenData({
          appId: decoded.app_id,
          appName: decoded.app_name,
          authCode: decoded.auth_code,
          idUsuarioTalkMe: decoded.id_usuario,
          idNombreUsuarioTalkMe: decoded.nombre_usuario,
          empresaTalkMe: decoded.empresa,
          idBotRedes: decoded.id_bot_redes,
          idBot: decoded.id_bot,
          urlTemplatesGS: decoded.urlTemplatesGS,
          urlWsFTP: decoded.urlWsFTP
        });
      } catch (error) {
        console.error('Error decodificando el token:', error);
        setTokenError(true);
      }
    } else {
      setTokenError(true);
    }
  }, []);

  // 👇 Función helper para validar datos del token
  const validarTokenData = () => {
    if (!tokenData) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay datos de autenticación disponibles. Por favor, inicia sesión nuevamente.',
      });
      return false;
    }

    // Validar campos críticos
    const camposCriticos = {
      'App ID': tokenData.appId,
      'Empresa': tokenData.empresaTalkMe,
      'ID Bot': tokenData.idBot,
      'ID Bot Redes': tokenData.idBotRedes,
      'ID Usuario': tokenData.idUsuarioTalkMe,
      'URL Templates': tokenData.urlTemplatesGS,
      'URL wsFTP': tokenData.urlWsFTP
    };

    const camposFaltantes = Object.entries(camposCriticos)
      .filter(([_, valor]) => !valor)
      .map(([nombre, _]) => nombre);

    if (camposFaltantes.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Datos incompletos',
        text: `Faltan los siguientes datos: ${camposFaltantes.join(', ')}`,
      });
      return false;
    }

    return true;
  };

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
    if (carouselType === 'IMAGE') {
      return {
        accept: '.jpg, .jpeg, .png',
        maxSize: 5 * 1024 * 1024, // 5MB para imágenes
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        typeLabel: 'imagen'
      };
    } else if (carouselType === 'VIDEO') {
      return {
        accept: '.mp4',
        maxSize: 16 * 1024 * 1024, // 16MB para videos
        allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'],
        typeLabel: 'video'
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

  // Validaciones de archivo
  const validateFile = (file) => {
    const errors = [];

    // Validar tipo de archivo
    if (!fileConfig.allowedTypes.includes(file.type)) {
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
      return; // Esto ahora sí debería detener la ejecución
    }

    setSelectedFile(file);
    setUploadState('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      // Usar tu función real de upload
      await realUpload(file);
      setUploadState('success');
    } catch (error) {
      setUploadState('error');
      setErrorMessage(error.message || 'Error al subir el archivo');
    }


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

    if (!validarTokenData()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay datos de autenticación disponibles. Por favor, inicia sesión nuevamente.',
        confirmButtonColor: '#00c3ff'
      });
      return;
    }

    let logWsftp = null;

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
      CREADO_POR: tokenData.idNombreUsuarioTalkMe || "USUARIO_DESCONOCIDO"
    });

    try {
      const wsftpStartTime = new Date();
      const base64Content = await convertToBase64(file);

      // Inicializar log para WSFTP
      logWsftp = crearLogBase("SUBIDA_ARCHIVO_WSFTP_CAROUSEL", tokenData.urlWsFTP);
      logWsftp.INICIO_PETICION = wsftpStartTime.toISOString();

      const payload = {
        idEmpresa: tokenData.empresaTalkMe,
        idBot: tokenData.idBot,
        idBotRedes: tokenData.idBotRedes,
        idUsuario: tokenData.idUsuarioTalkMe,
        tipoCarga: 3,
        nombreArchivo: file.name,
        contenidoArchivo: base64Content.split(',')[1],
      };

      let apiToken;

      // Primer request - Obtener token de GupShup
      try {
        apiToken = await obtenerApiToken(tokenData.urlTemplatesGS, tokenData.empresaTalkMe);
      } catch (error) {
        console.error('Error al obtener token de GupShup:', error);

        Swal.fire({
          icon: 'error',
          title: 'Error de Autenticación',
          text: 'No se pudo obtener el token de autenticación del servicio GupShup. Por favor, intenta nuevamente.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00c3ff'
        });

        throw new Error('GUPSHUP_SERVICE_ERROR: Error al obtener token de autenticación');
      }

      // Preparar datos de petición para el log
      const peticionWsftp = {
        metodo: 'POST',
        headers: {
          'x-api-token': apiToken,
          'Content-Type': 'application/json'
        },
        payload: {
          idEmpresa: tokenData.empresaTalkMe,
          idBot: tokenData.idBot,
          idBotRedes: tokenData.idBotRedes,
          idUsuario: tokenData.idUsuarioTalkMe,
          tipoCarga: 3,
          nombreArchivo: file.name,
          contenidoArchivo: '***BASE64_CONTENT***',
          tamanoOriginal: file.size,
          tipoArchivo: file.type
        },
        metadata: {
          procesoCompleto: true
        }
      };

      logWsftp.PETICION = JSON.stringify(peticionWsftp);

      // Segundo request - Subir archivo a servicio propio WSFTP
      let response;
      try {
        response = await axios.post(
          tokenData.urlWsFTP,
          payload,
          {
            headers: {
              'x-api-token': apiToken,
              'Content-Type': 'application/json',
            },
          }
        );

        // ✅ RESPUESTA EXITOSA
        const wsftpEndTime = new Date();
        logWsftp.FIN_PETICION = wsftpEndTime.toISOString();
        logWsftp.NOMBRE_EVENTO = "SUBIDA_ARCHIVO_WSFTP_CAROUSEL_EXITOSO";

        const respuestaWsftp = {
          status: response.status,
          statusText: response.statusText,
          headers: {
            'content-type': response.headers['content-type'],
            'content-length': response.headers['content-length']
          },
          data: response.data,
          duracion_ms: wsftpEndTime.getTime() - wsftpStartTime.getTime(),
          exitoso: true,
          urlArchivo: response.data.url
        };

        logWsftp.RESPUESTA = JSON.stringify(respuestaWsftp);

        try {
          await guardarLogArchivos(logWsftp, tokenData.urlTemplatesGS);
        } catch (logError) {
          console.error('❌ Error al guardar log de WSFTP:', logError);
        }

      } catch (error) {
        console.error('Error en servicio WSFTP:', error);

        // ❌ ACTUALIZAR LOG CON ERROR
        const wsftpEndTime = new Date();
        logWsftp.FIN_PETICION = wsftpEndTime.toISOString();
        logWsftp.NOMBRE_EVENTO = "SUBIDA_ARCHIVO_WSFTP_CAROUSEL_FALLIDO";

        const respuestaErrorWsftp = {
          error: true,
          message: error.message,
          stack: error.stack,
          duracion_ms: wsftpEndTime.getTime() - wsftpStartTime.getTime()
        };

        if (error.response) {
          respuestaErrorWsftp.status = error.response.status;
          respuestaErrorWsftp.statusText = error.response.statusText;
          respuestaErrorWsftp.headers = error.response.headers;
          respuestaErrorWsftp.data = error.response.data;
        }

        logWsftp.RESPUESTA = JSON.stringify(respuestaErrorWsftp);

        try {
          await guardarLogArchivos(logWsftp, tokenData.urlTemplatesGS);
        } catch (logError) {
          console.error('❌ Error al guardar log de error de WSFTP:', logError);
        }

        Swal.fire({
          icon: 'error',
          title: 'Error de Carga',
          text: 'No se pudo cargar el archivo en nuestro servicio de archivos. Por favor, verifica tu conexión e intenta nuevamente.',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#00c3ff'
        });

        throw new Error('WSFTP_SERVICE_ERROR: Error en el servicio de carga de archivos');
      }

      // Validar respuesta del servicio WSFTP
      if (response.status !== 200 || !response.data) {
        console.error('Respuesta inválida del servicio WSFTP:', response);

        Swal.fire({
          icon: 'warning',
          title: 'Respuesta Inválida',
          text: 'El servicio de carga respondió de forma inesperada. Por favor, intenta nuevamente.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00c3ff'
        });

        throw new Error('WSFTP_INVALID_RESPONSE: Error en la respuesta del servicio');
      }

      const mediaIdFinal = response.data.mediaId || response.data.id || `media-${Date.now()}`;

      // Llamar al callback de éxito
      if (onUploadSuccess) {
        onUploadSuccess({
          mediaId: mediaIdFinal,
          url: response.data.url,
          type: file.type.includes('image') ? 'image' : 'video'
        });
      }

      // SweetAlert de éxito
      Swal.fire({
        icon: 'success',
        title: 'Archivo Cargado',
        text: 'El archivo se ha cargado exitosamente.',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        confirmButtonColor: '#00c3ff'
      });

      return { mediaId: mediaIdFinal, url: response.data.url };

    } catch (error) {
      console.error('Error general en realUpload:', error);

      if (!error.message.includes('GUPSHUP_SERVICE_ERROR') &&
        !error.message.includes('WSFTP_SERVICE_ERROR') &&
        !error.message.includes('WSFTP_INVALID_RESPONSE')) {

        Swal.fire({
          icon: 'error',
          title: 'Error Inesperado',
          text: 'Ocurrió un error inesperado durante la carga del archivo. Por favor, intenta nuevamente.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00c3ff'
        });
      }

      throw error;
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
        .then(() => setUploadState('success'))
        .catch((error) => {
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

        {(uploadState === 'idle' || uploadState === 'error') && carouselType === "IMAGE" && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Formatos permitidos: JPG, JPEG, PNG. Máximo 5 MB
          </Typography>
        )}
        {(uploadState === 'idle' || uploadState === 'error') && carouselType === "VIDEO" && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Formatos permitidos: MP4. Máximo 15 MB
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ImprovedFileUpload;