import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Box } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import AppRoutes from './routes';
import LoadingSpinner from './utils/LoadingSpinner';
import SessionManager from './hooks/SessionManager';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [themeSettings, setThemeSettings] = useState({
    primaryColor: '#00C3FF',
    secondaryColor: '#DBDBDB',
    fontFamily: 'Helvetica',
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const checkToken = async () => {
    const searchParams = new URLSearchParams(location.search);
    const urlToken = searchParams.get('token');
    const storedToken = sessionStorage.getItem('authToken');
    
    // Si no hay token en absoluto
    if (!urlToken && !storedToken) {
      navigate('/login-required');
      return;
    }

    try {
      // Usar token de URL si existe, sino el almacenado
      const tokenToValidate = urlToken || storedToken;
      const decoded = jwtDecode(tokenToValidate);
      const currentTime = Date.now() / 1000;

      // Token expirado
      if (decoded.exp < currentTime) {
        cleanStorageAndRedirect();
        return;
      }

      // Si hay nuevo token de URL, actualizar storage
      if (urlToken && urlToken !== storedToken) {
        sessionStorage.setItem('authToken', urlToken);
        
        const remainingTimeInSeconds = decoded.exp - currentTime;
        const remainingMinutesOnly = Math.floor(remainingTimeInSeconds / 60);
        
        sessionStorage.setItem('initialRemainingMinutes', remainingMinutesOnly.toString());
        
        // Limpiar token de la URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      setIsLoading(false);
      
    } catch (error) {
      console.error('Error procesando token:', error);
      cleanStorageAndRedirect();
    }
  };

  const cleanStorageAndRedirect = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('initialRemainingMinutes');
    navigate('/login-required');
  };

  checkToken();
}, [location.search, navigate]);


  const theme = useMemo(() =>
    createTheme({
      palette: {
        primary: {
          main: themeSettings.primaryColor,
          contrastText: '#fff'
        },
        secondary: {
          main: themeSettings.secondaryColor,
        },
      },
      typography: {
        fontFamily: themeSettings.fontFamily,
      },
    }),
    [themeSettings]
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionManager />
      <Box sx={{ display: "flex" }}>
        <AppRoutes />
      </Box>
    </ThemeProvider>
  );
}

export default App;
