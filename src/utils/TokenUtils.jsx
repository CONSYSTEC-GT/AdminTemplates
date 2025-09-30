import { jwtDecode } from 'jwt-decode';

class TokenManager {
  // Método para obtener el token
  static getToken() {
    return sessionStorage.getItem('authToken');
  }

  // Método para guardar el token
  static setToken(token) {
    sessionStorage.setItem('authToken', token);
  }

  // Método para eliminar el token
  static removeToken() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('initialRemainingMinutes');
  }

  // Método para verificar si el token existe
  static hasToken() {
    return !!this.getToken();
  }

  // Método para verificar si el token es válido
  static isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return false;
    }
  }

  // Método para obtener datos del token
  static getTokenData() {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  // Método para obtener tiempo restante en minutos
  static getRemainingMinutes() {
    const tokenData = this.getTokenData();
    if (!tokenData) return 0;

    const currentTime = Date.now() / 1000;
    const remainingTimeInSeconds = tokenData.exp - currentTime;
    return Math.floor(remainingTimeInSeconds / 60);
  }
}

export default TokenManager;