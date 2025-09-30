import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TokenHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl) {
      sessionStorage.setItem('authToken', tokenFromUrl);

      const previousPage = location.state?.from?.pathname || '/dashboard';
      navigate(previousPage, { replace: true });
    } else {
      const storedToken = sessionStorage.getItem('authToken');

      if (!storedToken) {
        navigate('/login-required', { replace: true });
      }
    }
  }, [navigate, location]);

  return null;
};

export default TokenHandler;