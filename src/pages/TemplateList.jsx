import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2'

import LoginRequired from './LoginRequired';
import { fetchMergedTemplates } from '../api/templatesServices';

import { alpha, Card, CardContent, Typography, CardActions, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fade, Button, ListItemIcon, ListItemText, Grid, Box, Menu, MenuItem, Stack, TextField, Paper, styled } from '@mui/material';
import { CircularProgress } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Link from '@mui/icons-material/Link';
import Phone from '@mui/icons-material/Phone';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ErrorIcon from '@mui/icons-material/Error';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CategoryIcon from '@mui/icons-material/Category';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';

import DeleteModal from '../components/DeleteModal';
import { parseTemplateContent } from "../utils/parseTemplateContent";

import TemplateCardSkeleton from '../utils/SkeletonTemplates';
import CardBase from '../components/CardBase';
import CardBaseCarousel from '../components/CardBaseCarousel';
import CardBaseSkeleton from '../components/CardBaseSkeleton';

const TemplateCard = ({ title, subtitle, description, onEdit, onDelete, whatsappStyle }) => (
  <Card
    sx={{
      minWidth: 275,
      border: '1px solid',
      borderColor: whatsappStyle ? '#25D366' : 'grey.200',
      backgroundColor: whatsappStyle ? '#ECE5DD' : 'white',
      borderRadius: whatsappStyle ? '16px' : '4px',
      boxShadow: whatsappStyle ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none',
    }}
  >
    <CardContent>
      <Typography
        gutterBottom
        sx={{
          color: whatsappStyle ? '#075E54' : 'text.secondary',
          fontSize: 14,
          fontWeight: whatsappStyle ? 'bold' : 'normal',
        }}
      >
        {subtitle}
      </Typography>
      <Typography variant="h5" component="div" sx={{ color: whatsappStyle ? '#075E54' : 'inherit' }}>
        {title}
      </Typography>
      <Typography
        sx={{
          color: whatsappStyle ? '#4F4F4F' : 'text.secondary',
          mb: 1.5,
          fontSize: whatsappStyle ? '14px' : 'inherit',
        }}
      >
        {description}
      </Typography>
    </CardContent>

  </Card>
);

export default function BasicCard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { templateId } = useParams();
  const [templates, setTemplates] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const token = sessionStorage.getItem('authToken');

  let appId, authCode, appName, idUsuarioTalkMe, idNombreUsuarioTalkMe, empresaTalkMe, idBotRedes, idBot, urlTemplatesGS, urlWsFTP;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      appId = decoded.app_id;
      authCode = decoded.auth_code;
      appName = decoded.app_name;
      idUsuarioTalkMe = decoded.id_usuario;
      idNombreUsuarioTalkMe = decoded.nombre_usuario;
      empresaTalkMe = decoded.empresa;
      idBotRedes = decoded.id_bot_redes;
      idBot = decoded.id_bot;
      urlTemplatesGS = decoded.urlTemplatesGS;
      urlWsFTP = decoded.urlWsFTP;
    } catch (error) {
      console.error('Error decodificando el token:', error);
    }
  }

  const obtenerTemplatesMerge = async () => {
    try {
      const templates = await fetchMergedTemplates(appId, authCode, urlTemplatesGS);
      return templates.slice(0, 4);
    } catch (error) {
      console.error('Error al obtener templates:', error);
    }
  };

  useEffect(() => {
    if (appId && authCode && urlTemplatesGS) {
      setLoading(true);
      obtenerTemplatesMerge()
        .then(data => {
          setTemplates(data);
          setLoading(false);
        });
    } else {
      console.error('No se encontró appId o authCode en el token');
    }
  }, [appId, authCode]);
  //


  const getStatusColor = (status) => {
    switch (status) {
      case 'REJECTED':
        return '#ffebee';
      case 'FAILED':
        return '#fff3e0';
      case 'APPROVED':
        return '#C8E6C9';
      default:
        return '#f5f5f5';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'REJECTED':
        return '#d32f2f';
      case 'FAILED':
        return '#e65100';
      case 'APPROVED':
        return '#1B5E20';
      default:
        return '#616161';
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'REJECTED':
        return '#EF4444';
      case 'FAILED':
        return '#FF9900';
      case 'APPROVED':
        return '#34C759';
      default:
        return '#000000';
    }
  };

  const handleCreateClick = () => {
    navigate('/CreateTemplatePage');
  };

  const handleVerTemplates = () => {
    navigate('/plantillas/todas/');
  };

  const handleEdit = (template) => {
    if (template.gupshup.status === "APPROVED" || template.gupshup.status === "REJECTED" || template.gupshup.status === "PAUSED") {
      switch (template.gupshup.templateType) {
        case 'CAROUSEL':
          navigate('/modify-template-carousel', { state: { template } });
          break;
        case 'CATALOG':
          navigate('/modify-template-catalogo', { state: { template } });
          break;
        case 'TEXT':
        case 'IMAGE':
        case 'DOCUMENT':
        case 'VIDEO':
          navigate('/modify-template', { state: { template } });

          break;
        default:
          navigate('/modify-template', { state: { template } });
      }
    } else {
      Swal.fire({
        title: 'La plantilla no puede ser editada.',
        text: 'No se puede editar la plantilla porque su estado no es "APPROVED", "REJECTED" o "PAUSED".',
        icon: 'error',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#00c3ff'
      });

    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event, template) => {

    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleDeleteClick = (template) => {
    setSelectedTemplate(template);
    setDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteModalOpen(false);
      setSelectedTemplate(null);
      setLoading(true);

      const newTemplates = await fetchTemplates(appId, authCode);
      setTemplates(newTemplates);
      setLoading(false);

    } catch (error) {
      console.error('Error al eliminar la plantilla:', error);
    }
  };

  const [openReasonDialog, setOpenReasonDialog] = React.useState(false);
  const [selectedReason, setSelectedReason] = React.useState('');

  const handleOpenReasonDialog = (reason) => {
    setSelectedReason(reason);
    setOpenReasonDialog(true);
  };

  const [anchorEl2, setAnchorEl2] = useState(null);
  const open2 = Boolean(anchorEl2);

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleCrearPlantilla = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const crearPlantillaTradicional = () => {
    handleClose2();
    navigate("/CreateTemplatePage/CreateTemplatePage");
  };

  const crearPlantillaCatalogo = () => {
    handleClose2();
    navigate("/CreateTemplatePage/CreateTemplateCatalog");
  };

  const crearPlantillaCarrusel = () => {
    handleClose2();
    navigate("/CreateTemplatePage/CreateTemplateCarousel");
  };

  const showReasonAlert = (reason) => {
    Swal.fire({
      title: '<strong>Razón de rechazo</strong>',
      icon: 'error',
      html: `<p>${reason}</p>`,
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#00c3ff',
      focusConfirm: false,
      customClass: {
        title: 'swal2-title-custom'
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const CardComponents = {
    CAROUSEL: CardBaseCarousel,
    DEFAULT: CardBase,
  };

  const mostrarInformacionToken = () => {
    Swal.fire({
      title: 'Información del Token:',
      html: `
      <div style="text-align: left;">
        <p><strong>Detalles del token:</strong></p>
        <p>App ID: ${appId}</p>
        <p>Auth Code: ${authCode}</p>
        <p>App Name: ${appName}</p>
        <p>Usuario: ${idNombreUsuarioTalkMe}</p>
        <p>Empresa: ${empresaTalkMe}</p>
        <p>ID Bot: ${idBot}</p>
        <p>url templatesGS: ${urlTemplatesGS}</p>
        <p>url wsFTP: ${urlWsFTP}</p>
      </div>
    `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#00c3ff'
    });
  };

  return (
    <Box sx={{ marginLeft: 2, marginRight: 2, marginTop: 3 }}>

      {/*TITULO PRIMER BLOQUE */}<Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Plantillas TalkMe
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box sx={{ maxWidth: "60%" }}>
            <Typography variant="body1" color="textSecondary">
              Mira el listado de plantillas que puedes utilizar
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Están aprobadas por WhatsApp para tu aplicación
            </Typography>
          </Box>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Button
              color="primary"
              variant="contained"
              size="large"
              onClick={handleCrearPlantilla}
              endIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Crear plantilla
            </Button>
            <Button
              color="primary"
              variant="contained"
              size="large"
              onClick={mostrarInformacionToken}
              sx={{
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Ver datos del token
            </Button>
          </motion.div>
          <Menu
            anchorEl={anchorEl2}
            open={open2}
            onClose={handleClose2}
            TransitionComponent={Fade}
          >
            {[
              {
                text: 'Texto, Imagén y Documento',
                onClick: crearPlantillaTradicional,
                icon: <InsertDriveFileIcon fontSize="small" />
              },
              {
                text: 'Catalogo',
                onClick: crearPlantillaCatalogo,
                icon: <AutoAwesomeMosaicIcon fontSize="small" />
              },
              {
                text: 'Carrusel',
                onClick: crearPlantillaCarrusel,
                icon: <ViewCarouselIcon fontSize="small" />
              }
            ].map((item, index) => (
              <MenuItem
                key={item.text}
                onClick={item.onClick}
                component={motion.div}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300
                }}
                sx={{
                  '&:hover': {
                    transform: 'scale(1.02)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText>{item.text}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Paper>

      {/*APP NAME TARJTA UNICA*/}<Box sx={{ padding: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Lista de Plantillas
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 3,
            justifyContent: "center",
          }}
        >
          <TemplateCard
            title={appName}
            subtitle="Nombre de la aplicación"
            onEdit={() => handleEditClick('unique-template-id')}
            onDelete={() => handleDeleteClick('unique-template-id')}
          />
        </Box>
      </Box>

      {/* Lista de tarjetas */}<Box sx={{ p: 3 }}>
        {/* Encabezado con título y botón */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3
        }}>
          <Typography variant="h5" fontWeight="bold">
            Últimas plantillas creadas
          </Typography>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Button
              color="primary"
              variant="contained"
              size="large"
              onClick={handleVerTemplates}
              endIcon={<FindInPageIcon />}
              sx={{ borderRadius: 2 }}
            >
              Ver Todas
            </Button>
          </motion.div>
        </Box>

        {/* Grid de tarjetas */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 3,
          justifyItems: "center" // Esto centrará las tarjetas en sus celdas de grid
        }}>
          {loading ?
            // Mostrar skeletons mientras carga
            Array.from(new Array(4)).map((_, index) => (
              <CardBaseSkeleton key={index} />
            ))
            :
            // Mostrar los datos reales cuando termine de cargar
            templates.map((template, index) => {
              const CardComponent = CardComponents[template.gupshup.templateType] || CardComponents.DEFAULT;

              return (
                <motion.div
                  key={template.id}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.05,
                    y: -10,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CardComponent
                    template={template}
                    handleEdit={handleEdit}
                    handleDeleteClick={handleDeleteClick}
                    showReasonAlert={showReasonAlert}
                    parseTemplateContent={parseTemplateContent}
                    getStatusColor={getStatusColor}
                    getStatusDotColor={getStatusDotColor}
                    getStatusTextColor={getStatusTextColor}
                  />
                </motion.div>
              );
            })}
        </Box>
      </Box>

      {/* Modal de Eliminación */}
      <DeleteModal
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        template={selectedTemplate}
      />

    </Box>
  );
}