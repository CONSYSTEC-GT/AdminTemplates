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
import CardBase from '../components/CardBase';
import CardBaseCarousel from '../components/CardBaseCarousel';
import CardBaseSkeleton from '../components/CardBaseSkeleton';

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
        return data.templates.filter(template => template.status === 'REJECTED');
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
    // Verifica el template seleccionado
    setAnchorEl(event.currentTarget); // Abre el menú
    setSelectedTemplate(template); // Guarda el template seleccionado en el estado
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (template) => {
    // Validar el estado del template
    if (template.status === "APPROVED" || template.status === "REJECTED" || template.status === "PAUSED") {
      // Si el estado es válido, navegar a la página de edición
      navigate('/modify-template', { state: { template } });
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

  const CardComponents = {
    CAROUSEL: CardBaseCarousel,
    DEFAULT: CardBase,
    // Agrega más tipos según necesites
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
              Array.from(new Array(4)).map((_, index) => (
                <CardBaseSkeleton key={index} />
              ))
              :
              // Mostrar los datos reales cuando termine de cargar
              templates.map((template) => {
                // Obtener el componente adecuado (usamos DEFAULT si el tipo no está definido)
                const CardComponent = CardComponents[template.templateType] || CardComponents.DEFAULT;

                return (
                  <CardComponent
                    key={template.id}
                    template={template}
                    handleEdit={handleEdit}
                    handleDeleteClick={handleDeleteClick}
                    showReasonAlert={showReasonAlert}
                    parseTemplateContent={parseTemplateContent}
                    getStatusColor={getStatusColor}
                    getStatusDotColor={getStatusDotColor}
                    getStatusTextColor={getStatusTextColor}
                  />
                );
              })}
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