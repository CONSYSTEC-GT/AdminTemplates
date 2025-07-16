import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Fade
} from '@mui/material';
import { motion } from 'framer-motion';
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

const TemplateCard = ({
  template,
  handleEdit,
  handleDeleteClick,
  showReasonAlert,
  parseTemplateContent,
  getStatusColor,
  getStatusDotColor,
  getStatusTextColor
}) => {
  // Estados locales del componente
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Funciones del menú
  const handleClick = (event, template) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  const handleEditClick = () => {
    handleEdit(selectedTemplate);
    handleClose();
  };

  const handleDeleteClickLocal = () => {
  console.log('selectedTemplate:', selectedTemplate);
  console.log('handleDeleteClick function:', handleDeleteClick);
  handleDeleteClick(selectedTemplate);
  handleClose();      
};

  return (
    <Card
      sx={{
        maxWidth: 350,
        height: 500,
        borderRadius: 3,
        mt: 3,
        mx: 2,
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
              WebkitLineClamp: 2,
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
              onClick={() => showReasonAlert(template.reason)}
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
          </React.Fragment>
        )}

        {/* Content */}
        <Box
          sx={{
            backgroundColor: '#FEF9F3',
            p: 2,
            mx: 1,
            my: 1,
            borderRadius: 2,
            height: 302,
            width: 286,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
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
                width: 'fit-content',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                flexDirection: "column",
                overflowY: "auto",
                overflowX: "hidden"
              }}
              component="div"
            >
              {parseTemplateContent(template.data).text.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
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

      {/* Acciones */}
      <CardActions
        sx={{
          mt: 'auto',
          justifyContent: 'flex-end',
          padding: 2,
          position: 'relative',
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Button
            id="manage-button"
            variant="contained"
            disableElevation
            onClick={(event) => handleClick(event, template)}
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
              onClick: handleEditClick,
              icon: <EditIcon fontSize="small" />
            },
            {
              text: 'Eliminar',
              onClick: handleDeleteClickLocal,
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
  );
};

export default TemplateCard;