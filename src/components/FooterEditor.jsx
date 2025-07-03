import React, { useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';

const FooterEditor = () => {
  const [footer, setFooter] = useState('');
  const charLimit = 60;

  const handleFooterChange = (e) => {
    if (e.target.value.length <= charLimit) {
      setFooter(e.target.value);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        Footer Editor
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Add a 60-character footer to your message. Variables are not supported in the footer.
      </Typography>
      <TextField
        fullWidth
        label="Footer text"
        value={footer}
        onChange={handleFooterChange}
        helperText={`${footer.length} / ${charLimit} characters`}
        sx={{ mb: 3 }}
      />
      <Typography variant="h6">Preview:</Typography>
      <Typography
        variant="body1"
        sx={{ backgroundColor: '#f4f4f4', p: 2, borderRadius: 1 }}
      >
        {footer || 'Sample Footer'}
      </Typography>
    </Box>
  );
};

export default FooterEditor;
