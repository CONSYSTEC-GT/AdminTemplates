import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Snackbar,
  Alert
} from '@mui/material';

const FileUploadComponent = ({ templateType = 'media' }) => {
  const charLimit = 60;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  // Estados
  const [header, setHeader] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');

  // Manejadores de eventos
  const handleHeaderChange = (event) => {
    setHeader(event.target.value);
  };

  const handleMediaTypeChange = (event) => {
    setMediaType(event.target.value);
    setSelectedFile(null); // Resetear archivo al cambiar tipo
    setUploadedUrl(''); // Resetear URL
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError('El archivo es demasiado grande. El tamaño máximo permitido es 5 MB.');
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor, selecciona un archivo.');
      return;
    }

    try {
      const base64Content = await convertToBase64(selectedFile);
      const payload = {
        idEmpresa: 2,
        idBot: 54,
        idBotRedes: 149,
        idUsuario: 48,
        tipoCarga: 3,
        nombreArchivo: selectedFile.name,
        contenidoArchivo: base64Content.split(',')[1],
      };

      const response = await fetch('/WsFTP/api/ftp/upload', {
        method: 'POST',
        headers: {
          'x-api-token': 'TFneZr222V896T9756578476n9J52mK9d95434K573jaKx29jq',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      setUploadedUrl(data.url);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al subir el archivo. Por favor, intenta nuevamente.');
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

  const getAcceptedFileTypes = () => {
    switch (mediaType) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt';
      default:
        return '';
    }
  };

  return (
    <Box sx={{ width: '100%', marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>

      {templateType === "text" ? (
        <>
          <Typography variant="h5" gutterBottom>
            Media
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Agregue un encabezado de 60 caracteres a su mensaje. Las variables no se admiten en el pie de página.
          </Typography>
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
          <Typography variant="h5" gutterBottom>
            Media
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Seleccione el tipo de media y cargue un archivo.
          </Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <RadioGroup
              row
              value={mediaType}
              onChange={handleMediaTypeChange}
            >
              <FormControlLabel value="image" control={<Radio />} label="Image" />
              <FormControlLabel value="video" control={<Radio />} label="Video" />
              <FormControlLabel value="document" control={<Radio />} label="Document" />
            </RadioGroup>
          </FormControl>

          {mediaType && (
            <Box sx={{ mt: 2 }}>
              <input
                accept={getAcceptedFileTypes()}
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <label htmlFor="file-upload">
                  <Button variant="contained" component="span">
                    Seleccionar Archivo
                  </Button>
                </label>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={!selectedFile}
                >
                  Subir Archivo
                </Button>
              </Box>

              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Archivo seleccionado: {selectedFile.name}
                </Typography>
              )}

              {uploadedUrl && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    URL del archivo subido:
                    <a
                      href={uploadedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginLeft: '8px' }}
                    >
                      {uploadedUrl}
                    </a>
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FileUploadComponent;