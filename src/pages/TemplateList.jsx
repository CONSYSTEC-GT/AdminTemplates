import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2'

import LoginRequired from './LoginRequired';

//componentes
import { alpha, Card, CardContent, Typography, CardActions, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fade, Button, ListItemIcon, ListItemText, Grid, Box, Menu, MenuItem, Stack, TextField, Paper, styled } from '@mui/material';
import { CircularProgress } from '@mui/material';

//iconos
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

// MODAL PARA ELIMINAR
import DeleteModal from '../components/DeleteModal';
import { parseTemplateContent } from "../utils/parseTemplateContent";

import TemplateCardSkeleton from '../utils/SkeletonTemplates';

// Componente reutilizable para las tarjetas
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

  // Estados
  const [templates, setTemplates] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  // const API_GUPSHUP_URL = process.env.API_GUPSHUP;


  // Recupera el token del localStorage
  const token = localStorage.getItem('authToken');

  // Decodifica el token para obtener appId y authCode
  let appId, authCode, appName, idUsuarioTalkMe, idNombreUsuarioTalkMe, empresaTalkMe, idBotRedes, idBot, urlTemplatesGS, urlWsFTP;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      appId = decoded.app_id; // Extrae appId del token
      authCode = decoded.auth_code; // Extrae authCode del token
      appName = decoded.app_name; // Extrae el nombre de la aplicación
      idUsuarioTalkMe = decoded.id_usuario;  // Cambiado de idUsuario a id_usuario
      idNombreUsuarioTalkMe = decoded.nombre_usuario;  // Cambiado de nombreUsuario a nombre_usuario
      empresaTalkMe = decoded.empresa;
      idBotRedes = decoded.id_bot_redes;
      idBot = decoded.id_bot;
      urlTemplatesGS = decoded.urlTemplatesGS;
      urlWsFTP = decoded.urlWsFTP;
    } catch (error) {
      console.error('Error decodificando el token:', error);
      
    }
  }
  
 /*

  let appId, authCode, appName, idUsuarioTalkMe, idNombreUsuarioTalkMe, empresaTalkMe;

  appId = '1fbd9a1e-074c-4e1e-801c-b25a0fcc9487'; // Extrae appId del token
  authCode = 'sk_d416c60960504bab8be8bc3fac11a358'; // Extrae authCode del token
  appName = 'DemosTalkMe55'; // Extrae el nombre de la aplicación
  idUsuarioTalkMe = 78;  // Cambiado de idUsuario a id_usuario
  idNombreUsuarioTalkMe = 'javier.colocho';  // Cambiado de nombreUsuario a nombre_usuario
  empresaTalkMe = 2;
*/


  // Función para obtener las plantillas
  const fetchTemplates = async (appId, authCode) => {
    try {
      const response = await fetch(`https://partner.gupshup.io/partner/app/${appId}/templates`, {
        method: 'GET',
        headers: {
          Authorization: authCode,
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        return data.templates.slice(0, 4); // Retorna los datos en lugar de establecer el estado
      }
      return []; // Retorna un array vacío si no hay éxito
    } catch (error) {
      console.error('Error fetching templates:', error);
      return []; // Retorna un array vacío en caso de error
    }
  };

  // useEffect para cargar datos
  useEffect(() => {
    if (appId && authCode) {
      setLoading(true); // Asegúrate de que loading esté en true al inicio
      fetchTemplates(appId, authCode)
        .then(data => {
          setTemplates(data);
          setLoading(false);
        });
    } else {
      console.error('No se encontró appId o authCode en el token');
    }
  }, [appId, authCode]);


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
        return '#d32f2f'; // Rojo oscuro para texto
      case 'FAILED':
        return '#e65100'; // Naranja oscuro para texto
      case 'APPROVED':
        return '#1B5E20';
      default:
        return '#616161'; // Gris oscuro para texto
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'REJECTED':
        return '#EF4444'; // Rojo
      case 'FAILED':
        return '#FF9900'; // Naranja
      case 'APPROVED':
        return '#34C759'; // Verde
      default:
        return '#000000';
    }
  };

  const handleCreateClick = () => {
    navigate('/CreateTemplatePage'); // Navega a la página para crear plantilla
  };

  const handleVerTemplates = () => {
    navigate('/plantillas/todas/'); // Navega a la página para editar la plantilla con su ID
  };

  const handleEdit = (template) => {
    // Validar el estado del template primero
    if (template.status === "APPROVED" || template.status === "REJECTED" || template.status === "PAUSED") {
      // Redirigir según el tipo de template
      switch (template.templateType) {
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
          // Ruta por defecto si no coincide con ningún tipo conocido
          navigate('/modify-template', { state: { template } });
      }
    } else {
      // Si el estado no es válido, mostrar un mensaje de error
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
     // Verifica el template seleccionado
    setAnchorEl(event.currentTarget); // Abre el menú
    setSelectedTemplate(template); // Guarda el template seleccionado en el estado
  };

  // Función para manejar el clic en eliminar
  const handleDeleteClick = () => {
     // Verifica el template en el estado
    setDeleteModalOpen(true); // Abre el modal
    handleClose(); // Cierra el menú
  };

  // Función para cancelar la eliminación
  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedTemplate(null);
  };

  // Función para confirmar la eliminación
  const handleDeleteConfirm = async () => {
    try {
      // Aquí iría tu lógica para eliminar la plantilla
      

      // Cierra el modal y limpia el estado
      setDeleteModalOpen(false);
      setSelectedTemplate(null);
      setLoading(true);

      // Recargar y actualizar el estado de plantillas
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
    setAnchorEl2(null); // Cierra el menú
  };

  const handleCrearPlantilla = (event) => {
    setAnchorEl2(event.currentTarget); // Abre el menú
  };

  const crearPlantillaTradicional = () => {
    handleClose2(); // Cierra el menú antes de navegar
    navigate("/CreateTemplatePage/CreateTemplatePage"); // Redirige a otra plantilla
  };

  const crearPlantillaCatalogo = () => {
    handleClose2(); // Cierra el menú antes de navegar
    navigate("/CreateTemplatePage/CreateTemplateCatalog"); // Redirige a otra plantilla
  };

  const crearPlantillaCarrusel = () => {
    handleClose2(); // Cierra el menú antes de navegar
    navigate("/CreateTemplatePage/CreateTemplateCarousel"); // Redirige a otra plantilla
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
            Array.from(new Array(4)).map((_, index) => ( // Usamos 4 como en tu slice
              <TemplateCardSkeleton key={index} />
            ))
            :
            // Mostrar los datos reales cuando termine de cargar
            templates.map((template) => (

              <Card
                key={template.id}
                sx={{
                  maxWidth: 300,
                  height: 500, // Fija la altura a 480px
                  borderRadius: 3,
                  mt: 3, // Aumenta la separación superior
                  mx: 2, // Agrega margen a los lados
                  border: '1px solid #e0e0e0',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                  overflow: 'visible',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  {/* Header Template Name */}
                  <Box sx={{ p: 2, pb: 0 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{
                        mb: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2, // muestra máximo 2 líneas
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {template.elementName}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {/* Status badge */}
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: getStatusColor(template.status),
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: getStatusDotColor(template.status),
                            mr: 0.5
                          }}
                        />
                        <Typography variant="caption" sx={{ color: getStatusTextColor(template.status), fontWeight: 500 }}>
                          {template.status}
                        </Typography>
                      </Box>

                      {/* Categoria badge */}
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#4B5563', fontWeight: 500 }}>
                          {template.category}
                        </Typography>
                      </Box>

                      {/* Tipo badge */}
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#4B5563', fontWeight: 500 }}>
                          {template.templateType}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Razón rechazo */}
                  {template.reason && (
                    <React.Fragment>
                      <Button
                        color="error"
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenReasonDialog(template.reason)}
                        startIcon={<ErrorOutlineIcon />}
                        sx={{
                          mt: 1,
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          borderRadius: 1,
                          py: 0.5,
                          px: 1,
                          ml: 2
                        }}
                      >
                        Razón de rechazo
                      </Button>

                      <Dialog
                        open={openReasonDialog}
                        onClose={() => setOpenReasonDialog(false)}
                        maxWidth="sm"
                        fullWidth
                      >
                        <DialogTitle sx={{
                          bgcolor: 'error.light',
                          color: 'error.contrastText',
                          py: 1,
                          px: 2
                        }}>
                          <Box display="flex" alignItems="center">
                            <ErrorIcon sx={{ mr: 1 }} />
                            <Typography variant="subtitle1">Razón de rechazo</Typography>
                          </Box>
                        </DialogTitle>
                        <DialogContent sx={{ py: 3, px: 2 }}>
                          <Typography>{selectedReason}</Typography>
                        </DialogContent>
                        <DialogActions sx={{ px: 2, py: 1 }}>
                          <Button
                            onClick={() => setOpenReasonDialog(false)}
                            variant="contained"
                            color="primary"
                            sx={{ borderRadius: 1 }}
                          >
                            Entendido
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </React.Fragment>
                  )}

                  {/* Content */}
                  <Box
                    sx={{
                      backgroundColor: '#FEF9F3', // Fondo amarillo
                      p: 2, // Aumentar padding para dar más espacio alrededor de la caja blanca
                      mx: 1,
                      my: 1,
                      borderRadius: 2,
                      height: 302, // Altura mínima en lugar de fija AMARILLA
                      width: 286,
                      display: 'flex',
                      flexDirection: 'column', // Ajusta la dirección del contenido a columna
                      alignItems: 'center', // Centra horizontalmente
                      justifyContent: 'flex-start', // Align content to the top
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: 'white',
                        p: 1,
                        mt: 1,
                        borderRadius: 4,
                        width: 284,
                        maxWidth: '100%',
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignSelf: 'center', 
                        height: 298,
                        overflowY: 'auto'
                      }}
                    >
                      {/* Imagen para plantillas tipo CAROUSEL o IMAGE */}
                      {(template.templateType === 'CAROUSEL' || template.templateType === 'IMAGE' || template.templateType === 'VIDEO') && (
                        <Box sx={{ mb: 2, width: '100%', height: 140, borderRadius: 2, overflow: 'hidden' }}>
                          <img
                            src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-UPVXEk3VrllOtMWXfyrUi4GVlt71zdxigtTGguOkqRgWmIX8_aT35EdrnTc0Jn5yy5c&usqp=CAU'
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              alignContent: 'center'
                            }}
                          />
                        </Box>
                      )}

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          width: 'fit-content', // Ensure typography width fits content
                          whiteSpace: 'normal', // Allow text to wrap
                          wordBreak: 'break-word', // Añadir esta propiedad para forzar el quiebre de palabras largas
                          overflowWrap: 'break-word' // Asegurar que las palabras largas se quiebren
                        }}
                      >
                        {parseTemplateContent(template.data).text}
                      </Typography>

                      {/* Botones */}
                      <Stack spacing={1} sx={{ mt: 2 }}>
                        {parseTemplateContent(template.data).buttons?.map((button, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              gap: 1,
                              border: "1px solid #ccc",
                              borderRadius: "20px",
                              p: 1,
                              backgroundColor: "#ffffff",
                              boxShadow: 1,
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                            }}
                          >
                            {button.type === "QUICK_REPLY" && (
                              <ArrowForward sx={{ fontSize: "16px", color: "#075e54" }} />
                            )}
                            {button.type === "URL" && (
                              <Link sx={{ fontSize: "16px", color: "#075e54" }} />
                            )}
                            {button.type === "PHONE_NUMBER" && (
                              <Phone sx={{ fontSize: "16px", color: "#075e54" }} />
                            )}
                            <Typography variant="body1" sx={{ fontWeight: "medium", color: "#075e54", fontSize: "14px" }}>
                              {button.title}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                </CardContent>

                {/* Acciones */}<CardActions
                  sx={{
                    mt: 'auto',           // Empuja el CardActions hacia abajo
                    justifyContent: 'flex-end', // Alinea contenido a la izquierda
                    padding: 2,           // Añade padding consistente
                    position: 'relative', // Necesario para el posicionamiento
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button
                      id="manage-button"
                      aria-controls={anchorEl ? 'manage-menu' : undefined}
                      aria-haspopup="true"
                      aria-expanded={anchorEl ? 'true' : undefined}
                      variant="contained"
                      disableElevation
                      onClick={(event) => {  }}
                      endIcon={<KeyboardArrowDownIcon />}
                      color="primary"
                      sx={{
                        borderRadius: 1,
                        textTransform: 'none',
                      }}
                    >
                      Administrar
                    </Button>
                  </motion.div>

                  <Menu
                    id="manage-menu"
                    MenuListProps={{
                      'aria-labelledby': 'manage-button',
                    }}
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    TransitionComponent={Fade}
                  >
                    {[
                      {
                        text: 'Editar',
                        onClick: () => handleEdit(selectedTemplate),
                        icon: <EditIcon fontSize="small" />
                      },
                      {
                        text: 'Eliminar',
                        onClick: handleDeleteClick,
                        icon: <DeleteIcon fontSize="small" />
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
                </CardActions>
              </Card>
            ))}
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
