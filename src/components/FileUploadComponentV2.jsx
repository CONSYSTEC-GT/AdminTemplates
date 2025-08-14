import React, { useState, useRef } from 'react';
import { Box, Button, CircularProgress, Typography, Alert, Chip } from '@mui/material';
import { CloudUpload, CheckCircle, Error as ErrorIcon, Close } from '@mui/icons-material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { obtenerApiToken } from '../api/templatesGSApi';

/*
let appId, authCode, appName, idUsuarioTalkMe, idNombreUsuarioTalkMe, empresaTalkMe, idBotRedes, idBot, urlTemplatesGS, apiToken, urlWsFTP;

appId = '1fbd9a1e-074c-4e1e-801c-b25a0fcc9487'; // Extrae appId del token
authCode = 'sk_d416c60960504bab8be8bc3fac11a358'; // Extrae authCode del token
appName = 'DemosTalkMe55'; // Extrae el nombre de la aplicación
idUsuarioTalkMe = 78;  // Cambiado de idUsuario a id_usuario
idNombreUsuarioTalkMe = 'javier.colocho';  // Cambiado de nombreUsuario a nombre_usuario
empresaTalkMe = 2;
idBotRedes = 721;
idBot = 257;
urlTemplatesGS = 'http://localhost:3004/api/';
apiToken = 'TFneZr222V896T9756578476n9J52mK9d95434K573jaKx29jq';
urlWsFTP = 'https://dev.talkme.pro/WsFTP/api/ftp/upload';
*/

// Decodifica el token para obtener appId y authCode


// Recupera el token del localStorage
const token = localStorage.getItem('authToken');

let appId, authCode, idUsuarioTalkMe, idNombreUsuarioTalkMe, empresaTalkMe, idBotRedes, idBot, urlTemplatesGS, urlWsFTP;
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
    urlWsFTP = decoded.urlWsFTP;
    //apiToken = decoded.apiToken; 
    //
  } catch (error) {
    console.error('Error decodificando el token:', error);
  }
}

console.log("urlTemplatesGS: ", urlTemplatesGS);
console.log("urlWsFTP: ", urlWsFTP);

//

const ImprovedFileUpload = ({ onUploadSuccess, templateType, onImagePreview, onHeaderChange }) => {

  const [uploadState, setUploadState] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [imagePreview, setImagePreview] = useState(null); // Estado para la vista previa de la imagen

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
        400: 'Los datos enviados no son válidos. Por favor revisa la información.',
        401: `Existe un error en la configuración del cliente.`,
        403: 'No tienes permisos para acceder a este recurso.',
        404: 'El recurso solicitado no fue encontrado.',
        408: 'La solicitud tardó demasiado tiempo. Por favor intenta nuevamente.',
        409: 'Hay un conflicto con el estado actual del recurso.',
        422: 'Los datos proporcionados no pueden ser procesados.',
        429: 'Has realizado demasiadas solicitudes. Intenta más tarde.'
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
        title: 'Error del servidor',
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

    try {
      // === PRIMERA PARTE: SUBIDA A GUPSHUP ===
      try {
        const gupshupFormData = new FormData();
        gupshupFormData.append('file', file);
        gupshupFormData.append('file_type', file.type);

        const gupshupUrl = `https://partner.gupshup.io/partner/app/${appId}/upload/media`;

        const gupshupResponse = await axios.post(gupshupUrl, gupshupFormData, {
          headers: {
            Authorization: authCode,
          },
        });

        console.log('Request completo a Gupshup:', {
          url: gupshupUrl,
          method: 'POST',
          headers: {
            Authorization: authCode,
          },
          data: gupshupFormData,
        });

        // Validar respuesta de Gupshup
        if (!gupshupResponse.data || !gupshupResponse.data.handleId) {
          throw new Error('Respuesta de Gupshup incompleta o no válida');
        }

        mediaId = gupshupResponse.data.handleId.message;
        gupshupSuccess = true;

        // Mostrar alerta de éxito para Gupshup
        await showResponseAlert(gupshupResponse.status, gupshupResponse.data, 'subida de archivo a Gupshup');

      } catch (gupshupError) {
        console.error('Error específico de Gupshup:', gupshupError);

        // Determinar el código de estado del error
        const status = gupshupError.response?.status || 500;
        const errorData = gupshupError.response?.data || { message: gupshupError.message };

        // Mostrar alerta específica según el código de estado
        await showResponseAlert(status, errorData, 'subida de archivo a Gupshup');

        // Si falla Gupshup, no continúes con el segundo servicio
        throw new Error('Fallo en la subida a Gupshup');
      }

      // === SEGUNDA PARTE: SUBIDA AL SERVICIO PROPIO WSFTP ===
      try {
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

        // Validar respuesta del servicio propio
        if (!ownServiceResponse.data) {
          throw new Error('Respuesta del servicio propio incompleta o no válida');
        }

        const ownServiceData = ownServiceResponse.data;

        // Si ambos servicios fueron exitosos
        if (onUploadSuccess) {
          onUploadSuccess({ mediaId, url: ownServiceData.url });
        }

        // Mostrar alerta de éxito para el servicio propio
        await showResponseAlert(ownServiceResponse.status, ownServiceData, 'subida de archivo al Servicio Propio (WsFTP)');

        // Alerta final de éxito para ambos servicios
        await Swal.fire({
          icon: 'success',
          title: '¡Proceso Completo!',
          text: 'El archivo se ha subido correctamente a ambos servicios',
          confirmButtonText: 'Excelente',
          timer: 3000,
          timerProgressBar: true
        });

      } catch (ownServiceError) {
        console.error('Error específico del servicio propio WSFTP:', ownServiceError);

        // Determinar el código de estado del error
        const status = ownServiceError.response?.status || 500;
        const errorData = ownServiceError.response?.data || { message: ownServiceError.message };

        // Mostrar alerta específica según el código de estado
        await showResponseAlert(status, errorData, 'subida de archivo al Servicio Propio (WsFTP)');

        // Alerta adicional indicando que Gupshup sí funcionó
        await Swal.fire({
          icon: 'warning',
          title: 'Proceso Parcialmente Completado',
          html: `
          <p>✅ El archivo se subió correctamente a <strong>Gupshup</strong></p>
          <p>❌ Pero falló la subida al <strong>Servicio Propio (WsFTP)</strong></p>
          <p><small>Media ID de Gupshup: ${mediaId}</small></p>
        `,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f39c12'
        });
      }

    } catch (generalError) {
      // Este catch maneja errores generales no capturados por los anteriores
      console.error('Error general en el proceso de subida:', generalError);

      // Para errores generales, usar código 500 por defecto
      const status = generalError.response?.status || 500;
      const errorData = generalError.response?.data || { message: generalError.message };
      throw new Error('Fallo en la subida al servicio propio');

      await showResponseAlert(status, errorData, 'proceso general de subida de archivos');
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