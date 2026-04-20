// components/sidebarConfig.js
import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreateIcon from '@mui/icons-material/Create';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckIcon from '@mui/icons-material/Check';
import SendIcon from '@mui/icons-material/Send';
import SmsFailedIcon from '@mui/icons-material/SmsFailed';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

// Navegación estática — ReactRouterAppProvider se encarga de resaltar
// el ítem activo automáticamente basándose en la URL actual.
export const NAVIGATION = [
    {
        segment: 'dashboard',
        title: 'Dashboard',
        icon: <DashboardIcon />,
    },
    {
        segment: 'CreateTemplatePage',
        title: 'Crear Plantillas',
        icon: <WhatsAppIcon />,
        children: [
            { segment: 'CreateTemplatePage', title: 'Texto, imagen y documento', icon: <CreateIcon /> },
            { segment: 'CreateTemplateCatalog', title: 'Catálogo', icon: <AutoAwesomeMosaicIcon /> },
            { segment: 'CreateTemplateCarousel', title: 'Carrusel', icon: <ViewCarouselIcon /> },
            { segment: 'CreateTemplateFlow', title: 'Flow', icon: <AccountTreeIcon /> }
        ]
    },
    { kind: 'divider' },
    { kind: 'header', title: 'Plantillas' },
    { segment: 'plantillas', title: 'Todas', icon: <DescriptionIcon />, children: [
        { segment: 'todas', title: 'Todas', icon: <DescriptionIcon /> },
        { segment: 'aprobadas', title: 'Aprobadas', icon: <CheckIcon /> },
        { segment: 'enviadas', title: 'Enviadas', icon: <SendIcon /> },
        { segment: 'fallidas', title: 'Fallidas', icon: <SmsFailedIcon /> },
        { segment: 'rechazadas', title: 'Rechazadas', icon: <ThumbDownIcon /> },
    ]},
];

export const getBranding = (theme) => ({
    title: 'TalkMe',
    logo: (
        <img
            src="https://www.talkme.pro/wp-content/uploads/2019/07/logoidentity.png"
            alt="TalkMe Logo"
            style={{ width: 'auto', height: 'auto' }}
        />
    ),
    titleStyle: { color: theme.palette.primary.main }
});