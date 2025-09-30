import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

const SessionManager = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [sessionWarning, setSessionWarning] = useState(false);
    const warningTimeoutRef = useRef(null);
    const inactivityTimeoutRef = useRef(null);
    const sessionTimeoutRef = useRef(null);
    const lastActivityRef = useRef(Date.now());
    const sessionStartRef = useRef(Date.now());
    const warningShownRef = useRef(false);

    // Obtener token del sessionStorage
    const token = sessionStorage.getItem('authToken');

    // Función para obtener minutos de inactividad desde sessionStorage
    const getInactivityMinutes = useCallback(() => {
        const savedMinutes = sessionStorage.getItem('initialRemainingMinutes');
        return savedMinutes ? parseInt(savedMinutes, 10) : 15; // 15 minutos por defecto
    }, []);

    // Función para limpiar timeouts
    const clearAllTimeouts = useCallback(() => {
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
            warningTimeoutRef.current = null;
        }
        if (inactivityTimeoutRef.current) {
            clearTimeout(inactivityTimeoutRef.current);
            inactivityTimeoutRef.current = null;
        }
        if (sessionTimeoutRef.current) {
            clearTimeout(sessionTimeoutRef.current);
            sessionTimeoutRef.current = null;
        }
    }, []);

    // Función para cerrar sesión
    const logout = useCallback(() => {
        clearAllTimeouts();
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('initialRemainingMinutes');
        sessionStorage.removeItem('sessionStartTime');
        sessionStorage.removeItem('lastActivityTime');
        navigate('/login-required');
    }, [navigate, clearAllTimeouts]);

    // Función para mostrar advertencia de sesión
    const showSessionWarning = useCallback(() => {
        if (warningShownRef.current) return;
        
        warningShownRef.current = true;
        setSessionWarning(true);

        Swal.fire({
            title: '¡Sesión por expirar!',
            text: 'Tu sesión expirará en 2 minutos por inactividad. ¿Deseas continuar?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar sesión',
            cancelButtonText: 'Cerrar sesión',
            timer: 120000, // 2 minutos para decidir
            timerProgressBar: true,
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then((result) => {
            setSessionWarning(false);
            warningShownRef.current = false;
            
            if (result.isConfirmed) {
                // Usuario quiere continuar - reiniciar timers y extender sesión
                extendSession();
            } else {
                // Usuario canceló o se agotó el tiempo - cerrar sesión
                logout();
            }
        });
    }, [logout]);

    // Función para extender la sesión (reinicia todos los timers)
    const extendSession = useCallback(() => {
        const now = Date.now();
        const inactivityMinutes = getInactivityMinutes();
        
        // Actualizar referencias de tiempo
        lastActivityRef.current = now;
        sessionStartRef.current = now;
        
        // Guardar en sessionStorage para persistencia en la misma pestaña
        sessionStorage.setItem('sessionStartTime', now.toString());
        sessionStorage.setItem('lastActivityTime', now.toString());
        
        // Limpiar timers existentes
        clearAllTimeouts();
        warningShownRef.current = false;
        
        const warningTime = (inactivityMinutes - 2) * 60 * 1000; // 2 minutos antes
        const logoutTime = inactivityMinutes * 60 * 1000; // tiempo total de inactividad
        
        // Timer para mostrar advertencia por inactividad
        warningTimeoutRef.current = setTimeout(() => {
            showSessionWarning();
        }, warningTime);
        
        // Timer para cerrar sesión por inactividad
        inactivityTimeoutRef.current = setTimeout(() => {
            if (!warningShownRef.current) {
                logout();
            }
        }, logoutTime);
        
    }, [getInactivityMinutes, showSessionWarning, logout, clearAllTimeouts]);

    // Función para manejar actividad del usuario
    const handleUserActivity = useCallback(() => {
        if (sessionWarning) return; // No reiniciar si ya se mostró la advertencia
        
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;
        
        // Solo extender sesión si ha pasado al menos 1 minuto desde la última actividad
        if (timeSinceLastActivity > 60000) {
            extendSession();
        }
    }, [sessionWarning, extendSession]);

    // Función para inicializar la sesión
    const initializeSession = useCallback(() => {
        const now = Date.now();
        
        // Verificar si hay una sesión previa guardada en sessionStorage
        const savedSessionStart = sessionStorage.getItem('sessionStartTime');
        const savedLastActivity = sessionStorage.getItem('lastActivityTime');
        
        if (savedSessionStart && savedLastActivity) {
            const sessionStart = parseInt(savedSessionStart, 10);
            const lastActivity = parseInt(savedLastActivity, 10);
            const inactivityMinutes = getInactivityMinutes();
            const maxInactivityTime = inactivityMinutes * 60 * 1000;
            
            // Verificar si la sesión anterior sigue siendo válida
            if (now - lastActivity < maxInactivityTime) {
                // Restaurar sesión anterior
                sessionStartRef.current = sessionStart;
                lastActivityRef.current = lastActivity;
                
                // Calcular tiempo restante para inactividad
                const timeElapsed = now - lastActivity;
                const remainingInactivityTime = maxInactivityTime - timeElapsed;
                const remainingWarningTime = remainingInactivityTime - (2 * 60 * 1000);
                
                if (remainingWarningTime > 0) {
                    // Aún hay tiempo antes de la advertencia
                    warningTimeoutRef.current = setTimeout(() => {
                        showSessionWarning();
                    }, remainingWarningTime);
                    
                    inactivityTimeoutRef.current = setTimeout(() => {
                        if (!warningShownRef.current) {
                            logout();
                        }
                    }, remainingInactivityTime);
                    
                } else {
                    // Ya debería mostrar advertencia
                    showSessionWarning();
                }
                
                return;
            }
        }
        
        // Inicializar nueva sesión
        extendSession();
    }, [getInactivityMinutes, extendSession, showSessionWarning, logout]);

    // Validar token y configurar sesión inicial
    useEffect(() => {
        if (!token) {
            navigate('/login-required');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            const remainingTimeInSeconds = decoded.exp - currentTime;
            const remainingMinutesOnly = Math.floor(remainingTimeInSeconds / 60);

            // Verificar si el token ya expiró
            if (remainingTimeInSeconds <= 0) {
                logout();
                return;
            }

            // Guardamos en sessionStorage solo si no existe un valor previo
            if (!sessionStorage.getItem('initialRemainingMinutes')) {
                sessionStorage.setItem('initialRemainingMinutes', remainingMinutesOnly);
            }

            
            // Inicializar sesión dinámica
            initializeSession();
            setIsLoading(false);

        } catch (error) {
            console.error('Error decodificando el token:', error);
            logout();
        }
    }, [token, navigate, logout, initializeSession]);

    // Eventos de actividad del usuario
    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, handleUserActivity, true);
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleUserActivity, true);
            });
            clearAllTimeouts();
        };
    }, [handleUserActivity, clearAllTimeouts]);

    // Limpiar timeouts cuando el componente se desmonte
    useEffect(() => {
        return () => {
            clearAllTimeouts();
        };
    }, [clearAllTimeouts]);

    // Verificar continuidad de sesión al cambiar de pestaña/ventana
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && !sessionWarning) {
                // Usuario volvió a la pestaña - considerar como actividad
                handleUserActivity();
            }
        };

        const handleFocus = () => {
            if (!sessionWarning) {
                handleUserActivity();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [handleUserActivity, sessionWarning]);

    if (isLoading) {
        return null; // O un spinner de carga
    }

    return null; // Este hook no renderiza nada
};

export default SessionManager;