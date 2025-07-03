import { Card, CardContent, Typography, TextField, Box } from '@mui/material';

const ThemeCustomizer = ({ settings, onSettingsChange }) => {
  const fonts = ['Roboto', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia'];

  const handleChange = (property) => (event) => {
    onSettingsChange({
      ...settings,
      [property]: event.target.value,
    });
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Personalizar Tema
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Color Primario"
            type="color"
            value={settings.primaryColor}
            onChange={handleChange('primaryColor')}
            sx={{ width: 200 }}
          />
          <TextField
            label="Color Secundario"
            type="color"
            value={settings.secondaryColor}
            onChange={handleChange('secondaryColor')}
            sx={{ width: 200 }}
          />
          <TextField
            select
            label="Tipo de Letra"
            value={settings.fontFamily}
            onChange={handleChange('fontFamily')}
            sx={{ width: 200 }}
          >
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </TextField>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ThemeCustomizer;