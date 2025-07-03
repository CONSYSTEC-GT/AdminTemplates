import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TokenHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl) {
      localStorage.setItem('authToken', tokenFromUrl);

      // Si el usuario ya estaba en una página específica, lo regresamos ahí
      const previousPage = location.state?.from?.pathname || '/dashboard';
      navigate(previousPage, { replace: true });
    } else {
      const storedToken = localStorage.getItem('authToken');
      if (!storedToken) {
        navigate('/login-required', { replace: true });
      }
    }
  }, [navigate, location]);

  return null;
};

export default TokenHandler;