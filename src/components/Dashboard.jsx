import { Typography, Paper, Grid, Button } from '@mui/material';

const Dashboard = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Bienvenido a tu Dashboard
          </Typography>
          <Typography variant="body1">
            Este es un ejemplo de cómo el texto y los colores cambian según la configuración del tema.
          </Typography>

          <Button variant="contained" color="primary">
        Test Button
      </Button>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;