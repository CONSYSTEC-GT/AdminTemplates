import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { alpha, Box, Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fade, FormControl, FormLabel, Input, InputAdornment, ListItemIcon, ListItemText, InputLabel, Menu, MenuItem, OutlinedInput, Select, Stack, styled, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';

// ICONOS
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
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

// MODAL PARA ELIMINAR
import DeleteModal from '../components/DeleteModal';
import { parseTemplateContent } from "../utils/parseTemplateContent";

import TemplateCardSkeleton from '../utils/SkeletonTemplates';

const TemplateAproved = () => {
  //PARA MANEJAR EL STATUS DE LAS PLANTILLAS | VARIABLES
  const { templateId } = useParams();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [activeFilter, setActiveFilter] = useState('todas');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tipoPlantillaFiltro, setTipoPlantillaFiltro] = useState('ALL');
  const [categoriaFiltro, setCategoriaFiltro] = useState('ALL');
  const [busquedaFiltro, setBusquedaFiltro] = useState('');

  const navigate = useNavigate(); // Inicializa useNavigate

  // Recupera el token del localStorage
  const token = localStorage.getItem('authToken');

  // Decodifica el token para obtener appId y authCode
  let appId, authCode;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      appId = decoded.app_id; // Extrae appId del token
      authCode = decoded.auth_code; // Extrae authCode del token
    } catch (error) {
      console.error('Error decodificando el token:', error);
    }
  }

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
        return data.templates.filter(template => template.status === 'APPROVED');
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

  useEffect(() => {
    let filtered = [...templates];

    if (tipoPlantillaFiltro !== 'ALL') {
      filtered = filtered.filter(template => template.templateType === tipoPlantillaFiltro);
    }

    if (categoriaFiltro && categoriaFiltro !== 'ALL') {
      filtered = filtered.filter(template => template.category === categoriaFiltro);
    }

    if (busquedaFiltro.trim() !== '') {
      filtered = filtered.filter(template =>
        template.elementName.toLowerCase().includes(busquedaFiltro.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  }, [tipoPlantillaFiltro, categoriaFiltro, busquedaFiltro, templates]);

  const handleFiltrarTipoPlantilla = (event) => {
    setTipoPlantillaFiltro(event.target.value);
  }

  const handleFiltrarCategoriaPlantilla = (event) => {
    setCategoriaFiltro(event.target.value);
  }

  //MODIFICAR EL COLOR DEPENDIENDO DEL STATUS DE LAS PLANTILLAS
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


  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event, template) => {
    console.log("Template seleccionado:", template); // Verifica el template seleccionado
    setAnchorEl(event.currentTarget); // Abre el menú
    setSelectedTemplate(template); // Guarda el template seleccionado en el estado
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (template) => {
    // Validar el estado del template primero
    if (template.status === "APPROVED" || template.status === "REJECTED" || template.status === "PAUSED") {
      // Redirigir según el tipo de template
      switch (template.templateType) {
        case 'CAROUSEL':
          navigate('/modify-template-carousel', { state: { template } });
          break;
        case 'CATALOGO':
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

  // Función para manejar el clic en eliminar
  const handleDeleteClick = () => {
    console.log("Template a eliminar:", selectedTemplate); // Verifica el template en el estado
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
      console.log('Eliminando plantilla:', selectedTemplate);

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

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Estilo personalizado para el menú
  const StyledMenu = styled((props) => (
    <Menu
      elevation={0}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      {...props}
    />
  ))(({ theme }) => ({
    '& .MuiPaper-root': {
      borderRadius: 6,
      marginTop: theme.spacing(1),
      minWidth: 180,
      color: 'rgb(55, 65, 81)',
      boxShadow:
        'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
      '& .MuiMenu-list': {
        padding: '4px 0',
      },
      '& .MuiMenuItem-root': {
        '& .MuiSvgIcon-root': {
          fontSize: 18,
          color: theme.palette.text.secondary,
          marginRight: theme.spacing(1.5),
        },
        '&:active': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity,
          ),
        },
      },
    },
  }));

  const [openReasonDialog, setOpenReasonDialog] = React.useState(false);
  const [selectedReason, setSelectedReason] = React.useState('');

  const handleOpenReasonDialog = (reason) => {
    setSelectedReason(reason);
    setOpenReasonDialog(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex' }}>

        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, p: 3 }}>
            {/* Título */}<Typography variant="h4" gutterBottom>
              Catálogo de Plantillas
            </Typography>

            <FormControl variant="outlined" sx={{ marginLeft: 'auto', minWidth: 400 }}>
              <InputLabel htmlFor="input-with-icon-adornment">
                Buscar plantillas por nombre
              </InputLabel>
              <OutlinedInput
                id="input-with-icon-adornment"
                endAdornment={
                  <InputAdornment position="end">
                    <SearchOutlinedIcon />
                  </InputAdornment>
                }
                label="With an end adornment"
                value={busquedaFiltro}
                onChange={(e) => setBusquedaFiltro(e.target.value)}
              />
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="Categoria">Categoría</InputLabel>
              <Select
                labelId="categoria-label"
                id="categoria-select"
                value={categoriaFiltro}
                label="Categoria"
                onChange={handleFiltrarCategoriaPlantilla}
              >
                <MenuItem value='ALL'>Todas</MenuItem>
                <MenuItem value='MARKETING'>Marketing</MenuItem>
                <MenuItem value='UTILITY'>Utilidad</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="Tipo">Tipo</InputLabel>
              <Select
                labelId="tipo-label"
                id="tipo-select"
                value={tipoPlantillaFiltro}
                label="Tipo"
                onChange={handleFiltrarTipoPlantilla}
              >
                <MenuItem value='ALL'>Todas</MenuItem>
                <MenuItem value='TEXT'>Texto</MenuItem>
                <MenuItem value='IMAGE'>Imagen</MenuItem>
                <MenuItem value='VIDEO'>Video</MenuItem>
                <MenuItem value='DOCUMENT'>Documento</MenuItem>
                <MenuItem value='CATALOG'>Cátalogo</MenuItem>
                <MenuItem value='CAROUSEL'>Carrusel</MenuItem>
              </Select>
            </FormControl>
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
              filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (

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
                          minHeight: 302, // Altura mínima en lugar de fija AMARILLA
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
                            {parseTemplateContent(template.data).buttons.map((button, index) => (
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
                          onClick={(event) => { console.log("Template seleccionado:", template); handleClick(event, template) }}
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
                ))
              ) : (
                <Typography variant="h6" sx={{ gridColumn: '1 / -1', textAlign: 'center', mt: 4 }}>
                  No hay plantillas disponibles para esta categoría.
                </Typography>
              )
            }
          </Box>
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
};

export default TemplateAproved;