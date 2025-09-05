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
import ReplyIcon from '@mui/icons-material/Reply';
import Link from '@mui/icons-material/Link';
import Phone from '@mui/icons-material/Phone';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ErrorIcon from '@mui/icons-material/Error';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CategoryIcon from '@mui/icons-material/Category';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';

// Import Swiper styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

import FechaModificacion from '../utils/FechaModificacion';

const CardBaseCarousel = ({
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
    handleDeleteClick(selectedTemplate);
    handleClose();
  };

  const container = JSON.parse(template.containerMeta); // o donde tengas el objeto
  const cards = container.cards || [];

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
              component={template.reason ? "button" : "div"}
              onClick={template.reason ? () => showReasonAlert(template.reason) : undefined}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: getStatusColor(template.status),
                borderRadius: 1,
                px: 1,
                py: 0.5,
                border: template.reason ? '1px dashed rgba(255,255,255,0.3)' : 'none',
                cursor: template.reason ? 'pointer' : 'default',
                '&:hover': template.reason ? {
                  opacity: 0.8,
                  transform: 'scale(1.02)'
                } : {},
                transition: 'all 0.2s ease'
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

        {/* Content */}
        <Box
          sx={{
            backgroundColor: '#FEF9F3',
            p: 1,
            mx: 1,
            mt: 1,
            borderRadius: 2,
            height: 350,
            width: 286,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflowY: 'auto'

          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              p: 1,
              mt: 0,
              mb: 1,
              borderRadius: 4,
              width: 284,
              maxWidth: '100%',
              display: 'inline-flex',
              flexDirection: 'column',
              alignSelf: 'center',
              //overflowY: 'auto'
            }}
          >

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                width: 'fit-content',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                flexDirection: "column"
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
                    <ArrowForward sx={{ fontSize: "16px", color: "#297c86" }} />
                  )}
                  {button.type === "URL" && (
                    <Link sx={{ fontSize: "16px", color: "#297c86" }} />
                  )}
                  {button.type === "PHONE_NUMBER" && (
                    <Phone sx={{ fontSize: "16px", color: "#297c86" }} />
                  )}
                  <Typography variant="body1" sx={{ fontWeight: "medium", color: "#297c86", fontSize: "14px" }}>
                    {button.title}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>




          <Box sx={{ flex: 1, width: '100%', minHeight: 0 }}>
            <Swiper
              modules={[Pagination]}
              effect="coverflow"
              spaceBetween={10}
              slidesPerView={1.1}
              centeredSlides={true}
              pagination={{ clickable: true }}
              style={{ width: '100%', paddingBottom: '2rem', flex: 1, minHeight: 0, }}
            >
              {cards.map((card, index) => (
                <SwiperSlide key={index}>
                  <Box
                    sx={{
                      borderRadius: 3,
                      border: '1px solid #ccc',
                      backgroundColor: '#fdfdfd',
                      overflow: 'hidden',
                      boxShadow: 1,
                      p: 1,
                      height: 'auto'
                    }}
                  >
                    {card.headerType === "IMAGE" && (
                      <img
                        src={card.mediaUrl}
                        alt="Card Header"
                        style={{ width: '100%', maxHeight: '100px', borderRadius: 8 }}
                      />
                    )}

                    <Typography
                      variant="body2"
                      sx={{ mt: 1, mb: 1, fontWeight: 500 }}
                    >
                      {card.body}
                    </Typography>

                    <Box
                      sx={{
                        mt: 'auto', // empuja el botón al fondo si usas flexDirection: column
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 1,
                        flexWrap: 'wrap',
                        borderTop: '1px solid #eee',
                        pt: 1,
                      }}
                    >
                      {card.buttons.map((button, btnIdx) => {
                        let styles = {
                          borderRadius: 20,
                          px: 2,
                          py: 0.5,
                          fontSize: 12,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        };

                        if (button.type === 'QUICK_REPLY') {
                          styles = {
                            ...styles,
                            backgroundColor: '#ffffff',
                            color: '#297c86'
                          };
                        } else if (button.type === 'URL') {
                          styles = {
                            ...styles,
                            backgroundColor: '#ffffff',
                            border: '1px solid #ccc',
                            color: '#297c86',
                          };
                        } else if (button.type === 'PHONE_NUMBER') {
                          styles = {
                            ...styles,
                            backgroundColor: '#ffffff',
                            color: '#297c86',
                          };
                        }

                        return (
                          <Box key={btnIdx} sx={styles}>
                            {button.type === 'QUICK_REPLY' && <ReplyIcon size={14} />}
                            {button.type === 'URL' && <Link size={14} />}
                            {button.type === 'PHONE_NUMBER' && <Phone size={14} />}
                            {button.text}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>

            <Typography sx={{ marginTop: 'auto', alignSelf: 'center' }}>
              <FechaModificacion timestamp={template.modifiedOn} />
            </Typography>
          </Box>






        </Box>

      </CardContent>

      {/* Acciones */}
      <CardActions
        sx={{
          mt: 'auto',
          justifyContent: 'flex-start',
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
          anchorOrigin={{
            vertical: 'bottom',   // Posición vertical respecto al botón (puedes usar 'top' o 'bottom')
            horizontal: 'right',  // Posición horizontal respecto al botón (queremos que salga a la derecha)
          }}
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

export default CardBaseCarousel;