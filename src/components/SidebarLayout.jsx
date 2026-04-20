// components/SidebarLayout.jsx
import React, { Suspense, useMemo, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useTheme } from '@mui/material/styles';
import { IconButton, Tooltip } from '@mui/material';
import Swal from 'sweetalert2';
import LoadingSpinner from '../utils/LoadingSpinner';
import LogoutIcon from '@mui/icons-material/Logout';
import { NAVIGATION, getBranding } from './sidebarConfig';

export default function SidebarLayout() {
    const theme = useTheme();

    const branding = useMemo(() => getBranding(theme), [theme]);

    const handleLogout = useCallback(() => {
        Swal.fire({
            title: 'Cerrar sesión',
            text: "¿Estás seguro que deseas salir?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#00c3ff',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                sessionStorage.removeItem('authToken');
                sessionStorage.removeItem('initialRemainingMinutes');

                Swal.fire({
                    title: '¡Sesión cerrada!',
                    text: 'Has cerrado sesión exitosamente',
                    icon: 'success',
                    timer: 750,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = '/session-closed';
                });
            }
        });
    }, []);

    const toolbarActions = useMemo(() => {
        return () => (
            <Tooltip title="Cerrar sesión">
                <IconButton
                    onClick={handleLogout}
                    color="inherit"
                    sx={{
                        '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.1)' }
                    }}
                >
                    <LogoutIcon />
                </IconButton>
            </Tooltip>
        );
    }, [handleLogout]);

    return (
        <ReactRouterAppProvider
            navigation={NAVIGATION}
            theme={theme}
            branding={branding}
        >
            <DashboardLayout slots={{ toolbarActions }}>
                <Suspense fallback={<LoadingSpinner />}>
                    <Outlet />
                </Suspense>
            </DashboardLayout>
        </ReactRouterAppProvider>
    );
}