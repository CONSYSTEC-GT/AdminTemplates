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
    console.log('idBot:', idBot);
    console.log('idBotRedes:', idBotRedes);
    console.log('urlTemplatesGS', urlTemplatesGS);
    //console.log('apiToken', apiToken);
  } catch (error) {
    console.error('Error decodificando el token:', error);
  }
}

//

const ImprovedFileUpload = ({ onUploadSuccess, templateType, onImagePreview, onHeaderChange }) => {

  const [uploadState, setUploadState] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [imagePreview, setImagePreview] = useState(null); // Estado para la vista previa de la imagen

  // Configuración según el tipo
  const getFileConfig = () => {
    if (templateType === 'image') {
      return {
        accept: '.jpg, .jpeg, .png',
        maxSize: 5 * 1024 * 1024, // 5MB para imágenes
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        typeLabel: 'imagen'
      };
    } else if (templateType === 'video') {
      return {
        accept: '.mp4',
        maxSize: 16 * 1024 * 1024, // 16MB para videos
        allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'],
        typeLabel: 'video'
      };
    } else if (templateType === 'document') {
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
    console.log("📁 Validando archivo:");
    console.log("Nombre:", file.name);
    console.log("Tipo MIME:", file.type);
    console.log("Tamaño (bytes):", file.size);
    console.log("Tipos permitidos:", fileConfig.allowedTypes);
    console.log("Tamaño máximo permitido (bytes):", fileConfig.maxSize);

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
      console.log('Errores de validación:', validationErrors);
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

    // Crear una vista previa de la imagen
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);

      // Notificar al componente padre con la vista previa
      if (onImagePreview) {
        onImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);


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

    try {
      console.log('Iniciando proceso de subida de archivo...');

      // Subir archivo a Gupshup

      const gupshupFormData = new FormData();
      gupshupFormData.append('file', file);
      gupshupFormData.append('file_type', file.type);
      console.log('filetype', setSelectedFile.type);

      const gupshupUrl = `https://partner.gupshup.io/partner/app/${appId}/upload/media`;

      console.log('Preparando solicitud a Gupshup...');

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

      console.log('Respuesta de Gupshup recibida:', gupshupResponse);

      if (gupshupResponse.status !== 200 || !gupshupResponse.data) {
        console.error('Error en la respuesta de Gupshup:', {
          status: gupshupResponse.status,
          statusText: gupshupResponse.statusText,
          errorDetails: gupshupResponse.data,
        });
        throw new Error(`Error en la respuesta de Gupshup: ${gupshupResponse.status}`);
      }

      const gupshupData = gupshupResponse.data;
      console.log('Datos de Gupshup:', gupshupData);

      if (!gupshupData.handleId) {
        console.error('Error: Respuesta de Gupshup incompleta o no válida');
        throw new Error('Respuesta de Gupshup incompleta o no válida');
      }

      const mediaId = gupshupData.handleId.message;
      console.log('Media ID obtenido de Gupshup:', mediaId);

      //### SERVICIO WSFTP PROPIO DE CONSYSTEC

      let apiToken;

      try {
        apiToken = await obtenerApiToken(urlTemplatesGS, empresaTalkMe); // Solo recibes el string del token
        console.log("Token:", apiToken);
        // Aquí puedes guardarlo en el estado, localStorage, o usarlo directamente
      } catch (error) {
        console.error("Fallo al obtener token:", error);
      }

      // Subir archivo al servicio propio
      console.log('Convirtiendo archivo a Base64...');
      const base64Content = await convertToBase64(file);
      console.log('Archivo convertido a Base64.');

      const payload = {
        idEmpresa: empresaTalkMe,
        idBot: idBot,
        idBotRedes: idBotRedes,
        idUsuario: idUsuarioTalkMe,
        tipoCarga: 3,
        nombreArchivo: file.name,
        contenidoArchivo: base64Content.split(',')[1],
      };

      console.log('Preparando solicitud al servicio propio...');

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

      console.log('Respuesta del servicio propio recibida:', ownServiceResponse);

      if (ownServiceResponse.status !== 200 || !ownServiceResponse.data) {
        console.error('Error en la respuesta del servicio propio:', {
          status: ownServiceResponse.status,
          statusText: ownServiceResponse.statusText,
          errorDetails: ownServiceResponse.data,
        });

        // Mostrar SweetAlert de error
        await Swal.fire({
          icon: 'error',
          title: 'Error en la subida',
          text: 'Hubo un problema con la respuesta del servidor',
          footer: `Código de estado: ${ownServiceResponse.status}`,
        });

        throw new Error('Error en la respuesta del servicio propio');
      }

      const ownServiceData = ownServiceResponse.data;
      console.log('Datos del servicio propio:', ownServiceData);

      // Notificar al componente padre con el mediaId y la URL
      if (onUploadSuccess) {
        console.log('Notificando al componente padre con el mediaId y la URL...');
        onUploadSuccess({ mediaId, url: ownServiceData.url });
      }

      console.log('Proceso de subida completado exitosamente.');

      // Mostrar SweetAlert de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Archivo subido!',
        text: 'El archivo se ha subido correctamente',
        timer: 3000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error en el proceso de subida:', error);

      // Imprimir el request completo en caso de error
      if (error.config) {
        console.error('Request completo que causó el error:', {
          url: error.config.url,
          method: error.config.method,
          headers: error.config.headers,
          data: error.config.data,
        });
      }
      await Swal.fire({
        icon: 'error',
        title: 'Error en la subida',
        html: `
      <p>No se pudo subir el archivo.</p>
      <p><strong>Razón:</strong> ${error.message || 'Error desconocido'}</p>
      ${error.response?.data ? `<p><small>${JSON.stringify(error.response.data)}</small></p>` : ''}
    `,
        confirmButtonText: 'Entendido'
      });

    }
  };



  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadState('idle');
    setUploadProgress(0);
    setErrorMessage('');
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