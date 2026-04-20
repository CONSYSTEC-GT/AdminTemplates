import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { alpha, Box, FormControl, InputAdornment, InputLabel, Menu, MenuItem, OutlinedInput, Pagination, Select, styled, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

import DeleteModal from '../components/DeleteModal';
import { parseTemplateContent } from "../utils/parseTemplateContent";
import { fetchMergedTemplates } from '../api/templatesServices';
import CardBase from '../components/common/CardBase';
import CardBaseCarousel from '../components/common/CardBaseCarousel';
import CardBaseSkeleton from '../components/common/CardBaseSkeleton';
import ListBase from '../components/common/ListBase';

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
  const [viewMode, setViewMode] = useState('grid');

  // 🆕 Estados y constantes para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Puedes ajustar este valor (9, 12, 15, etc.)

  const navigate = useNavigate();

  const { appId, authCode, urlTemplatesGS } = useMemo(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) return {};
    try {
      const decoded = jwtDecode(token);
      return {
        appId: decoded.app_id,
        authCode: decoded.auth_code,
        urlTemplatesGS: decoded.urlTemplatesGS,
      };
    } catch {
      return {};
    }
  }, [])

  const obtenerTemplatesMerge = async () => {
    try {
      const templates = await fetchMergedTemplates(appId, authCode, urlTemplatesGS);
      const templatesAprobados = templates.filter(template =>
        template.gupshup?.status === 'APPROVED'
      );
      return templatesAprobados;
    } catch (error) {
      console.error('Error al obtener templates:', error);
      return [];
    }
  };

  useEffect(() => {
    if (!appId || !authCode || !urlTemplatesGS) return;
    setLoading(true);
    obtenerTemplatesMerge().then(data => {
      setTemplates(data);
      setLoading(false);
    });
  }, [appId, authCode, urlTemplatesGS]);

  useEffect(() => {
    let filtered = [...templates];

    if (tipoPlantillaFiltro !== 'ALL') {
      if (tipoPlantillaFiltro === 'FLOW') {
        filtered = filtered.filter(template => template.gupshup.buttonSupported === 'FLOW');
      } else {
        filtered = filtered.filter(template =>
          template.gupshup.templateType === tipoPlantillaFiltro &&
          template.gupshup.buttonSupported !== 'FLOW'
        );
      }
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

  // 🆕 Reiniciar a página 1 cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [tipoPlantillaFiltro, categoriaFiltro, busquedaFiltro]);

  // 🆕 Cálculo de elementos actuales y total de páginas
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTemplates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);

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
    if (template.gupshup.status === "APPROVED" || template.gupshup.status === "REJECTED" || template.gupshup.status === "PAUSED") {
      switch (template.gupshup.templateType) {
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

  useEffect(() => {
    obtenerTemplatesMerge();
  }, []);

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

  // 🆕 Manejador de cambio de página
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex' }}>

        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, p: 3 }}>
            {/* Título */}<Typography variant="h4" gutterBottom>
              Catálogo de Plantillas
            </Typography>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              aria-label="vista"
              size="small"
              sx={{
                marginLeft: { xs: 0, md: 'auto' },
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.5
                }
              }}
            >
              <ToggleButton value="grid" aria-label="vista grid">
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="list" aria-label="vista lista">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>

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
                <MenuItem value='FLOW'>Flow</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Contenido de plantillas */}
          {loading ? (
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 3,
              justifyItems: "center"
            }}>
              {Array.from({ length: 4 }).map((_, index) => <CardBaseSkeleton key={index} />)}
            </Box>
          ) : currentItems.length > 0 ? (
            viewMode === 'grid' ? (
              /* 👇 VISTA GRID */
              <Box sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 3,
                justifyItems: "center"
              }}>
                {currentItems.map((template) => {
                  const CardComponent = CardComponents[template.gupshup.templateType] || CardComponents.DEFAULT;
                  return (
                    <motion.div
                      key={template.gupshup.id || template.id}
                      variants={cardVariants}
                      whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.2 } }}
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
            ) : (
              /* 👇 VISTA LISTA */
              <ListBase
                templates={currentItems}
                handleEdit={handleEdit}
                handleDeleteClick={handleDeleteClick}
                showReasonAlert={showReasonAlert}
                parseTemplateContent={parseTemplateContent}
                getStatusColor={getStatusColor}
                getStatusDotColor={getStatusDotColor}
                getStatusTextColor={getStatusTextColor}
              />
            )
          ) : (
            /* Estado vacío para ambas vistas */
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 300,
              textAlign: 'center',
              p: 4
            }}>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                No se encontraron plantillas con los filtros actuales.
              </Typography>
            </Box>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                shape="rounded"
                siblingCount={1}
                boundaryCount={1}
              />
            </Box>
          )}

          <DeleteModal
            open={deleteModalOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            template={selectedTemplate}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default TemplateAproved;