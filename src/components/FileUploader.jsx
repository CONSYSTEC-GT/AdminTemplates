import { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  IconButton,
  Alert,
  LinearProgress
} from '@mui/material';

const FileUploader = ({ 
  onUploadSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'success', 'error'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [mediaType, setMediaType] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setUploadStatus(null);
      setUploadProgress(0);
    }
  };

  const resetFileSelection = () => {
    setSelectedFile(null);
    setError('');
    setUploadStatus(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Por favor, selecciona un archivo.');
            return;
        }

        try {
            
            setUploadStatus('uploading');
            setUploadProgress(10);

            // Simular progreso gradual durante la conversión
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => prev < 40 ? prev + 5 : prev);
            }, 200);

            // Convertir archivo a Base64
            const base64Content = await convertToBase64(selectedFile);
            setUploadProgress(50);

            // Preparar payload para el servicio propio
            const payload = {
                idEmpresa: empresaTalkMe,
                idBot: 54,
                idBotRedes: 149,
                idUsuario: idUsuarioTalkMe,
                tipoCarga: 3,
                nombreArchivo: selectedFile.name,
                contenidoArchivo: base64Content.split(',')[1],
            };

            setUploadProgress(70);
            clearInterval(progressInterval);

            // Realizar la petición al servicio propio
            const ownServiceResponse = await fetch(
                'https://certificacion.talkme.pro/WsFTP/api/ftp/upload',
                {
                    method: 'POST',
                    headers: {
                        'x-api-token': 'TFneZr222V896T9756578476n9J52mK9d95434K573jaKx29jq',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!ownServiceResponse.ok) {
                throw new Error(`Error en la respuesta del servicio propio: ${ownServiceResponse.status}`);
            }

            const ownServiceData = await ownServiceResponse.json();
            

            // Notificar al componente padre con la URL
            if (onUploadSuccess) {
                onUploadSuccess(null, ownServiceData.url); // Solo pasamos la URL ahora
            }

            setUploadProgress(100);
            setUploadStatus('success');
            
        } catch (error) {
            console.error('Error en el proceso de subida:', error);

            setError(`Error al subir el archivo: ${error.message || 'Por favor, intenta nuevamente.'}`);
            setUploadStatus('error');
            setUploadProgress(0);
        }
    };

    const getAcceptedFileTypes = () => {
        const types = {
            image: '.jpeg, .png',
            video: '.mp4, .3gp',
            document: '.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt'
        };
        //
        return types[mediaType] || '';
    };

  return (
    <Box sx={{ mt: 2 }}>
      <input
        accept={getAcceptedFileTypes()}
        style={{ display: 'none' }}
        id="file-upload"
        type="file"
        onChange={handleFileChange}
        ref={fileInputRef}
      />

      {/* Cuando no hay archivo seleccionado */}
      {!selectedFile && (
        <label htmlFor="file-upload">
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 3,
              borderStyle: 'dashed',
              borderRadius: 1,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              {/* Ícono de subida */}
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </Box>
            <Typography variant="body1" sx={{ mt: 1, fontWeight: 'medium' }}>
              Haz clic para seleccionar un archivo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              o arrastra y suelta aquí
            </Typography>
          </Paper>
        </label>
      )}

      {/* Cuando hay un archivo seleccionado */}
      {selectedFile && (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Ícono de documento */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <Typography variant="body2" noWrap sx={{ maxWidth: '200px' }}>
                {selectedFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </Typography>
            </Box>
            <Box>
              {uploadStatus !== 'uploading' && (
                <IconButton size="small" onClick={resetFileSelection}>
                  {/* Ícono X para eliminar */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </IconButton>
              )}
            </Box>
          </Box>

          {uploadStatus === 'uploading' && (
            <Box sx={{ width: '100%', mt: 1 }}>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 6, borderRadius: 1 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Subiendo... {uploadProgress}%
              </Typography>
            </Box>
          )}

          {uploadStatus === 'success' && (
            <Alert 
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              } 
              severity="success" 
              sx={{ mt: 1 }}
            >
              Archivo subido exitosamente
            </Alert>
          )}

          {uploadStatus === 'error' && (
            <Alert 
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              } 
              severity="error" 
              sx={{ mt: 1 }}
            >
              {error}
            </Alert>
          )}

          {!uploadStatus && (
            <Button
              variant="contained"
              onClick={handleUpload}
              startIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              }
              fullWidth
              sx={{ mt: 1 }}
            >
              Subir Archivo
            </Button>
          )}

          {uploadStatus === 'success' && (
            <Button
              variant="outlined"
              onClick={resetFileSelection}
              fullWidth
              sx={{ mt: 1 }}
            >
              Subir otro archivo
            </Button>
          )}

          {uploadStatus === 'error' && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleUpload}
              fullWidth
              sx={{ mt: 1 }}
            >
              Reintentar
            </Button>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default FileUploader;