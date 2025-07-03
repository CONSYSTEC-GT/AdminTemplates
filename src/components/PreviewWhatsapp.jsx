import React from 'react';
import { Box, Typography, Paper, Button, Stack } from '@mui/material';

const PreviewWhatsAppStyle = ({ templateName, categories, selectedCategory }) => {
  const quickReplies = ['Yes', 'No', 'Maybe']; // Ejemplo de respuestas rápidas

  

  return (
    <Box sx={{p: 3, bgcolor: 'grey.100', height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2,}}>
      <Typography variant="h6" gutterBottom>
        Preview
      </Typography>

      <Box sx={{ bgcolor: '#e1ffc7', p: 2, borderRadius: 2, alignSelf: 'flex-end', maxWidth: '70%'}}>
        <Typography variant="body1" color="text.primary">
          {templateName || 'No name provided'}
        </Typography>
      </Box>

      <Box sx={{ bgcolor: '#fff', p: 2, borderRadius: 2, alignSelf: 'flex-start', maxWidth: '70%', border: '1px solid #ddd',}}>
        <Typography variant="subtitle2" color="text.secondary">
          Category:
        </Typography>

      </Box>

      {/* Botones de Quick Reply */}
      <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-start' }}>
        {quickReplies.map((reply, index) => (
          <Button
            key={index}
            variant="outlined"
            sx={{
              borderRadius: 20,
              textTransform: 'none',
              fontSize: '0.875rem',
              borderColor: '#25D366', // Verde de WhatsApp
              color: '#25D366',
              '&:hover': {
                bgcolor: '#e1ffc7',
                borderColor: '#25D366',
              },
            }}
          >
            {reply}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

export default PreviewWhatsAppStyle;
