import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { obtenerApiToken } from '../api/templatesGSApi';

const FileUploadComponent = ({ templateType = 'media', onUploadSuccess, onImagePreview, onHeaderChange }) => {

  // Recupera el token del localStorage
  const token = localStorage.getItem('authToken');

  // Decodifica el token para obtener appId y authCode
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
    } catch (error) {
      console.error('Error decodificando el token:', error);
    }
  }



  const charLimit = 60;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const APP_ID = 'f63360ab-87b0-44da-9790-63a0d524f9dd';
  const TOKEN = 'sk_2662b472ec0f4eeebd664238d72b61da';

  // Estados
  const [header, setHeader] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaId, setMediaId] = useState('');
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [imagePreview, setImagePreview] = useState(null); // Estado para la vista previa de la imagen
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);


  // Manejadores de eventos

  const handleHeaderChange = (e) => {
    const newHeader = e.target.value;
    setHeader(newHeader);

    // Añade esta línea para notificar al componente padre
    if (onHeaderChange) onHeaderChange(newHeader);
  };


  const handleMediaTypeChange = (event) => {
    
    setMediaType(event.target.value);
    setSelectedFile(null);
    setMediaId('');
    // Eliminado: setImagePreview(null); // No limpiar la vista previa aquí
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    

    if (!file) return;

    // Verificar el tamaño del archivo
    if (file.size > MAX_FILE_SIZE) {
      setError('El archivo es demasiado grande.');
      Swal.fire({
                title: 'Error',
                text: 'El tamaño del archivo es superior al permitido.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#00c3ff'
              });
      setSelectedFile(null);
      setImagePreview(null);
      return;
    }

    setError('');
    setSelectedFile(file);

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

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor, selecciona un archivo.');
      console.error('Error: No se ha seleccionado ningún archivo.');
      return;
    }

    try {
      
      setIsLoading(true);

      // Subir archivo a Gupshup
      //
      const gupshupFormData = new FormData();
      gupshupFormData.append('file', selectedFile);
      gupshupFormData.append('file_type', selectedFile.type);
      

      const gupshupUrl = `https://partner.gupshup.io/partner/app/${appId}/upload/media`;

      
      setUploadStatus('Subiendo archivo a Gupshup...');

      const gupshupResponse = await axios.post(gupshupUrl, gupshupFormData, {
        headers: {
          Authorization: authCode,
        },
      });   

      if (gupshupResponse.status !== 200 || !gupshupResponse.data) {
        console.error('Error en la respuesta de Gupshup:', {
          status: gupshupResponse.status,
          statusText: gupshupResponse.statusText,
          errorDetails: gupshupResponse.data,
        });
        throw new Error(`Error en la respuesta de Gupshup: ${gupshupResponse.status}`);
      }

      const gupshupData = gupshupResponse.data;
      

      if (!gupshupData.handleId) {
        console.error('Error: Respuesta de Gupshup incompleta o no válida');
        throw new Error('Respuesta de Gupshup incompleta o no válida');
      }

      const mediaId = gupshupData.handleId.message;
      
      //

      //obtengo el API_TOKEN desde templatesGS

      let apiToken;

      try {
         apiToken = await obtenerApiToken(urlTemplatesGS, empresaTalkMe); // Solo recibes el string del token
        
        // Aquí puedes guardarlo en el estado, localStorage, o usarlo directamente
      } catch (error) {
        console.error("Fallo al obtener token:", error);
      }




      // Subir archivo al servicio propio
      
      const base64Content = await convertToBase64(selectedFile);
      

      const payload = {
        idEmpresa: empresaTalkMe,
        idBot: idBot,
        idBotRedes: idBotRedes,
        idUsuario: idUsuarioTalkMe,
        tipoCarga: 3,
        nombreArchivo: selectedFile.name,
        contenidoArchivo: base64Content.split(',')[1],
      };

      
      setUploadStatus('Subiendo archivo al servicio propio...');

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
      

      // Notificar al componente padre con el mediaId y la URL
      if (onUploadSuccess) {
        
        onUploadSuccess(mediaId, ownServiceData.url); // Pasar ambos valores
        setIsLoading(false);
      }

      

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

      setError(`Error al subir el archivo: ${error.message || 'Por favor, intenta nuevamente.'}`);
      setIsLoading(false);
      //setUploadStatus('Error al subir el archivo');
      // Mostrar SweetAlert de error detallado
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

  const getAcceptedFileTypes = () => {
    const types = {
      image: '.jpeg, .jpg, .png',  // Formatos de imagen
      video: '.mp4, .3gp',         // Formatos de video
      document: '.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt'  // Formatos de documentos
    };
    return types[templateType] || '';  // Usamos templateType en lugar de mediaType
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  return (
    <Box>
      {templateType === "text" ? (
        <>
          <TextField
            fullWidth
            label="Header"
            value={header}
            onChange={handleHeaderChange}
            helperText={`${header.length} / ${charLimit} caracteres`}
            sx={{ mb: 3 }}
          />
        </>
      ) : (
        <>
          <FormControl fullWidth>
            <FormLabel>Archivos</FormLabel>
          </FormControl>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Seleccione el tipo de media y cargue un archivo.
          </Typography>

          {templateType !== "text" && (
            <Box sx={{ mt: 2 }}>
              <input
                accept={getAcceptedFileTypes()}
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Botón Agregar/Cambiar imagen */}
                <label htmlFor="file-upload">
                  <Button
                    variant="contained"
                    component="span"
                    sx={{ height: '100%' }}
                  >
                    {selectedFile ? 'Cambiar imagen' : 'Agregar imagen'}
                  </Button>
                </label>
                {/* Área de dropzone */}
                <label htmlFor="file-upload" style={{
                  flex: 1,
                  display: 'block',
                  padding: '10px 15px',
                  border: '1px dashed #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#666'
                  }
                }}>
                  {selectedFile ? (
                    <Typography variant="body1">{selectedFile.name}</Typography>
                  ) : (
                    <Typography variant="body1">Haz clic o arrastra un archivo aquí</Typography>
                  )}
                </label>


              </Box>

              <Button
                loading={isLoading}
                loadingPosition="end"
                startIcon={<SaveIcon />}
                variant="contained"
                onClick={handleUpload}
                disabled={!selectedFile}
                sx={{ mt: 2 }}
              >
                Subir Archivo
              </Button>

              {/* Barra de progreso */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="caption" display="block" textAlign="center">
                    {uploadProgress}% completado
                  </Typography>
                </Box>
              )}

              {imagePreview && mediaType === 'image' && (
                <Box sx={{ mt: 2 }}>
                  <img src={imagePreview} alt="Vista previa" style={{ width: '100%', borderRadius: 2 }} />
                </Box>
              )}

              {mediaId && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Media ID: {mediaId}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </>
      )}

      {/* Mensajes de estado */}


    </Box>
  );
};

export default FileUploadComponent;