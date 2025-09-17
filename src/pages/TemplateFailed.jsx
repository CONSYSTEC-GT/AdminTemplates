import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { alpha, Box, Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fade, FormControl, FormLabel, Input, InputAdornment, ListItemIcon, ListItemText, InputLabel, Menu, MenuItem, OutlinedInput, Select, Stack, styled, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2'

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
import { fetchMergedTemplates } from '../api/templatesServices';

const TemplateAproved = () => {
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

  const navigate = useNavigate();

  const token = localStorage.getItem('authToken');

  let appId, authCode, urlTemplatesGS;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      appId = decoded.app_id;
      authCode = decoded.auth_code;
      urlTemplatesGS = decoded.urlTemplatesGS;
    } catch (error) {
      console.error('Error decodificando el token:', error);
    }
  }

  const obtenerTemplatesMerge = async () => {
    try {
      const templates = await fetchMergedTemplates(appId, authCode, urlTemplatesGS);
      console.log('Templates obtenidos:', templates);
      const templatesAprobados = templates.filter(template =>
        template.gupshup?.status === 'FAILED'
      );
      return templatesAprobados;
    } catch (error) {
      console.error('Error al obtener templates:', error);
      return [];
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
      console.error('No se encontró appId, authCode o urlTemplatesGS en el token');
    }
  }, [appId, authCode, urlTemplatesGS]);

  useEffect(() => {
    let filtered = [...templates];

    if (tipoPlantillaFiltro !== 'ALL') {
      filtered = filtered.filter(template => template.gupshup.templateType === tipoPlantillaFiltro);
    }

    if (categoriaFiltro && categoriaFiltro !== 'ALL') {
      filtered = filtered.filter(template => template.gupshup.category === categoriaFiltro);
    }

    if (busquedaFiltro.trim() !== '') {
      filtered = filtered.filter(template =>
        template.gupshup.elementName.toLowerCase().includes(busquedaFiltro.toLowerCase())
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

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event, template) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (template) => {
    navigate('/modify-template', { state: { template } });
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

      const newTemplates = await obtenerTemplatesMerge();

      setTemplates(newTemplates);
      setLoading(false);
    } catch (error) {
      console.error('Error al eliminar la plantilla:', error);
      Swal.fire({
        title: 'La plantilla no puedo ser eliminada.',
        text: 'No se puede eliminar la plantilla.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#00c3ff'
      });
      setLoading(false);
    }
  };

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
            justifyItems: "center"
          }}>
            {loading ?
              Array.from(new Array(4)).map((_, index) => (
                <CardBaseSkeleton key={index} />
              ))
              :
              filteredTemplates.map((template) => {
                const CardComponent = CardComponents[template.templateType] || CardComponents.DEFAULT;

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
                  </motion.div>
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