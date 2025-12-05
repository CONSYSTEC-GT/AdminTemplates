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
      try {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');

        if (token) {
          console.log("Token recibido en URL:", token);

          try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
              console.error('Token expirado');
              sessionStorage.removeItem('authToken');
              sessionStorage.removeItem('initialRemainingMinutes');
              navigate('/login-required');
              setIsLoading(false);
              return;
            }

            sessionStorage.setItem('authToken', token);
            console.log("Token guardado en sessionStorage");

            const remainingTimeInSeconds = decoded.exp - currentTime;
            const remainingMinutesOnly = Math.floor(remainingTimeInSeconds / 60);

            if (!sessionStorage.getItem('initialRemainingMinutes')) {
              sessionStorage.setItem('initialRemainingMinutes', remainingMinutesOnly);
            }

            window.history.replaceState({}, document.title, window.location.pathname);

          } catch (error) {
            console.error('Token inválido', error);
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('initialRemainingMinutes');
            navigate('/login-required');
            setIsLoading(false);
            return;
          }
        }

        setIsLoading(false);

      } catch (error) {
        console.error('Error al procesar el token:', error);
        setIsLoading(false);
      }
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
