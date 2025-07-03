import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

const DynamicMessage = () => {
  const [message, setMessage] = useState('Please provide feedback for {{}} by clicking on {{}}. Thanks!');
  const [variables, setVariables] = useState([{ key: '{{1}}', value: '' }, { key: '{{2}}', value: '' }]);

  const handleVariableChange = (index, field, value) => {
    const updatedVariables = [...variables];
    updatedVariables[index][field] = value;
    setVariables(updatedVariables);
  };

  const renderMessage = () => {
    let renderedMessage = message;
    variables.forEach(({ key, value }) => {
      renderedMessage = renderedMessage.replace(key, value || key);
    });
    return renderedMessage;
  };

  const addVariable = () => {
    setVariables([...variables, { key: `{{${variables.length + 1}}}`, value: '' }]);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600}}>
      <Typography variant="h6" gutterBottom>
        Dynamic Message Editor
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        sx={{ mb: 3 }}
      />
      {variables.map((variable, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            label={`Variable ${index + 1}`}
            value={variable.key}
            onChange={(e) => handleVariableChange(index, 'key', e.target.value)}
            sx={{ mr: 2, flex: 1 }}
          />
          <TextField
            label="Sample Value"
            value={variable.value}
            onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
            sx={{ flex: 1 }}
          />
        </Box>
      ))}
      <Button variant="contained" onClick={addVariable} sx={{ mb: 3 }}>
        Add Variable
      </Button>
      <Typography variant="h6">Rendered Message:</Typography>
      <Typography variant="body1" sx={{ backgroundColor: '#f4f4f4', p: 2, borderRadius: 1 }}>
        {renderMessage()}
      </Typography>
    </Box>
  );
};

export default DynamicMessage;
