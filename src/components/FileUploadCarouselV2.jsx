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

const ImprovedFileUpload = ({ onUploadSuccess, carouselType }) => {

  const [uploadState, setUploadState] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

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

      let apiToken;

      try {
        apiToken = await obtenerApiToken(urlTemplatesGS, empresaTalkMe);
        console.log("Token:", apiToken);
      } catch (error) {
        console.error("Fallo al obtener token:", error);
        throw new Error('Error al obtener token de autenticación');
      }

      console.log('📤 Payload enviado:', payload);

      const response = await axios.post(
        urlWsFTP,
        payload,
        {
          headers: {
            'x-api-token': apiToken,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📥 Respuesta recibida:', response);

      if (response.status !== 200 || !response.data) {
        throw new Error('Error en la respuesta del servicio');
      }

      const mediaId = response.data.mediaId || response.data.id || `media-${Date.now()}`;

      // Llamar al callback de éxito
      if (onUploadSuccess) {
        onUploadSuccess({
          mediaId: mediaId,
          url: response.data.url,
          type: file.type.includes('image') ? 'image' : 'video'
        });
      }

      // SweetAlert removido - el componente ya muestra el estado visual

      return { mediaId, url: response.data.url };

    } catch (error) {
      console.error('❌ Error en el proceso de subida:', error);

      // SweetAlert removido - el componente ya muestra el estado de error

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