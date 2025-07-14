import React, { useState } from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, FormControl, Button, TextField } from '@mui/material';

const CustomHeader = () => {
  //const [templateType, setTemplateType] = useState('text');
  //const [mediaType, setMediaType] = useState('');
  //const [selectedFile, setSelectedFile] = useState(null);
  //const [header, setHeader] = useState('');
  //const charLimit = 60;

  //const handleMediaTypeChange = (event) => {
  //  setMediaType(event.target.value);
  //};

  //const handleFileChange = (event) => {
  //const file = event.target.files[0];
  //setSelectedFile(file);
  //
  //};

  //const handleHeaderChange = (event) => {
  //  setHeader(event.target.value);
  //};

  return (
    <Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
      <Typography variant="h5" mb={2}>
        Header
      </Typography>
      {templateType === "text" && (
        <>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Agregue un encabezado de 60 caracteres a su mensaje. Las variables no se admiten en el pie de página.
          </Typography>
          <TextField
            fullWidth
            label="Header"
            value={header}
            onChange={handleHeaderChange}
            helperText={`${header.length} / ${charLimit} characters`}
            sx={{ mb: 3 }}
          />
        </>
      )}

      {templateType !== "text" && (
        <>
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
                accept={
                  mediaType === 'image' ? 'image/*' :
                  mediaType === 'video' ? 'video/*' :
                  mediaType === 'document' ? 'application/pdf, .doc, .docx, .txt' : ''
                }
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
                <Button variant="contained" component="span">
                  Seleccionar Archivo
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Archivo seleccionado: {selectedFile.name}
                </Typography>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default CustomHeader;
