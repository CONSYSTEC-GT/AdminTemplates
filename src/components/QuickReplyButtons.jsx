import React, { useState } from 'react';
import { Box, Button, IconButton, TextField, Typography, Stack } from '@mui/material';
import { Delete } from '@mui/icons-material';

const QuickReplyButtons = () => {
  const [buttons, setButtons] = useState([]);
  const maxButtons = 10;

  const addButton = () => {
    if (buttons.length < maxButtons) {
      setButtons([...buttons, { id: Date.now(), title: '' }]);
    }
  };

  const removeButton = (id) => {
    setButtons(buttons.filter((button) => button.id !== id));
  };

  const updateButtonTitle = (id, title) => {
    setButtons(
      buttons.map((button) =>
        button.id === id ? { ...button, title } : button
      )
    );
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600}}>
      <Typography variant="h6" gutterBottom>
        Buttons (Optional)
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Please choose buttons to be added to the template. You can choose up to {maxButtons} buttons.
      </Typography>

      <Button
        variant="contained"
        onClick={addButton}
        disabled={buttons.length >= maxButtons}
        sx={{ mb: 3 }}
      >
        + Add Button
      </Button>

      <Stack spacing={2}>
        {buttons.map((button, index) => (
          <Box
            key={button.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              border: '1px solid #ccc',
              borderRadius: 1,
              p: 2,
              backgroundColor: '#f9f9f9',
            }}
          >
            <TextField
              label={`Quick Reply Title`}
              value={button.title}
              onChange={(e) => updateButtonTitle(button.id, e.target.value)}
              fullWidth
            />
            <IconButton
              color="error"
              onClick={() => removeButton(button.id)}
            >
              <Delete />
            </IconButton>
          </Box>
        ))}
      </Stack>

      <Typography
        variant="body2"
        color={buttons.length >= maxButtons ? 'error' : 'text.secondary'}
        sx={{ mt: 2 }}
      >
        {buttons.length} / {maxButtons} buttons added
      </Typography>
    </Box>
  );
};

export default QuickReplyButtons;
