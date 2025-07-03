import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Stack, 
  IconButton,
  Paper 
} from '@mui/material';


import ArrowForward from "@mui/icons-material/ArrowForward";
import Link from "@mui/icons-material/Link";
import Phone from "@mui/icons-material/Phone";
import DeleteIcon from '@mui/icons-material/Delete';

// Componente de vista previa del carrusel
export default function WhatsAppCarouselPreview({ 
  accordions, 
  carouselType, 
  cantidadBotones, 
  tipoBoton 
}) {
  // Estado para las tarjetas de la vista previa
  const [cards, setCards] = useState([]);
  
  // Efecto para sincronizar los acordeones del formulario con las tarjetas de la vista previa
  useEffect(() => {
    if (accordions && accordions.length > 0) {
      const newCards = accordions.map((accordion, index) => ({
        id: accordion.id,
        mediaUrl: accordion.mediaUrl || '/api/placeholder/350/180',
        title: `Tarjeta ${index + 1}`,
        body: accordion.messageCard || 'Descripción de la tarjeta',
        buttons: accordion.buttons || []
      }));
      
      setCards(newCards);
    } else {
      // Si no hay acordeones, mostrar una tarjeta de ejemplo
      setCards([{
        id: 'initial-card',
        mediaUrl: '/api/placeholder/350/180',
        title: 'Tarjeta de ejemplo',
        body: 'Agregue contenido a su tarjeta desde el formulario',
        buttons: []
      }]);
    }
  }, [accordions]);

  return (
    <Box sx={{ 
      backgroundColor: '#f5f5f5', 
      p: 3, 
      borderRadius: 2, 
      border: '1px solid #e0e0e0',
      marginTop: 4,
    }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Vista previa del Carrusel
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Así se verá tu carrusel en WhatsApp
      </Typography>
      
      {/* Contenedor del "teléfono" */}
      <Box 
        sx={{ 
          maxWidth: 400, 
          mx: 'auto',
          border: '12px solid #262626',
          borderRadius: 5,
          backgroundColor: '#fff',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          p: 0,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Barra de estado del teléfono */}
        <Box 
          sx={{ 
            p: 1.5, 
            backgroundColor: '#128C7E', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'medium' }}>
            WhatsApp
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'white', opacity: 0.6 }}></Box>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'white', opacity: 0.6 }}></Box>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'white', opacity: 0.6 }}></Box>
          </Box>
        </Box>
        
        {/* Fondo del chat */}
        <Box 
          sx={{ 
            height: 500, 
            backgroundImage: `url('/api/placeholder/400/500')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
            position: 'absolute',
            top: 45,
            left: 0,
            right: 0,
            bottom: 0,
            filter: 'blur(1px)'
          }}
        />

        {/* Contenido del chat */}
        <Box 
          sx={{ 
            p: 2, 
            pt: 3,
            height: 500,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}
        >
          {/* Mensaje de texto */}
          <Box 
            sx={{ 
              maxWidth: '80%', 
              backgroundColor: '#DCF8C6', 
              p: 1.5, 
              borderRadius: 2, 
              borderTopRightRadius: 0,
              mb: 3,
              ml: 'auto',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="body2">¡Mira este carrusel!</Typography>
          </Box>
          
          {/* Carrusel */}
          <Box 
            sx={{ 
              mb: 2,
              width: '100%'
            }}
          >
            <Swiper
              modules={[EffectCoverflow, Pagination]}
              effect={'coverflow'}
              spaceBetween={30}
              slidesPerView={'auto'}
              centeredSlides={true}
              pagination={{ clickable: true }}
              style={{ width: '100%' }}
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
            >
              {cards.map((card) => (
                <SwiperSlide key={card.id} style={{ width: '280px' }}>
                  <Card sx={{
                    width: '280px',       
                    height: '380px',      
                    margin: 'auto',
                    my: 2,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Contenedor de imagen con altura fija */}
                    <Box sx={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                      {card.mediaUrl ? (
                        <CardMedia
                          component="img"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          image={card.mediaUrl}
                          alt={card.title}
                        />
                      ) : (
                        <Box sx={{ height: '100%', width: '100%', bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Sin imagen</Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Contenedor de texto con altura fija */}
                    <CardContent sx={{ pt: 2, pb: 1, height: '110px', overflow: 'auto' }}>
                      <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        {card.title || "Título"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {card.body || "Descripción de la tarjeta"}
                      </Typography>
                    </CardContent>

                    {/* Contenedor de botones */}
                    <Box sx={{
                      p: 0,
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end'
                    }}>
                      <Stack spacing={0} sx={{ width: '100%' }}>
                        {card.buttons && card.buttons.slice(0, parseInt(cantidadBotones)).map((button, index) => (
                          <Box
                            key={button.id}
                            sx={{
                              width: '100%',
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              gap: 1,
                              borderTop: index === 0 ? "1px solid #e0e0e0" : "none",
                              borderBottom: "1px solid #e0e0e0",
                              p: 1.5,
                              backgroundColor: "#ffffff",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              borderRadius: 0,
                            }}
                          >
                            {button.type === "QUICK_REPLY" && (
                              <ArrowForward size={16} color="#075e54" />
                            )}
                            {button.type === "URL" && (
                              <Link size={16} color="#075e54" />
                            )}
                            {button.type === "PHONE_NUMBER" && (
                              <Phone size={16} color="#075e54" />
                            )}
                            <Typography variant="body1" sx={{ fontWeight: "medium", color: "#075e54", fontSize: "14px" }}>
                              {button.title || button.text || "Botón"}
                            </Typography>
                          </Box>
                        ))}
                        
                        {/* Si no hay botones definidos, mostrar botones de ejemplo basados en tipoBoton */}
                        {(!card.buttons || card.buttons.length === 0) && (
                          <>
                            <Box
                              sx={{
                                width: '100%',
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                gap: 1,
                                borderTop: "1px solid #e0e0e0",
                                borderBottom: cantidadBotones === "2" ? "none" : "1px solid #e0e0e0",
                                p: 1.5,
                                backgroundColor: "#ffffff",
                                cursor: "pointer",
                                "&:hover": {
                                  backgroundColor: "#f5f5f5",
                                },
                                borderRadius: 0,
                              }}
                            >
                              {tipoBoton === "QUICK_REPLY" && <ArrowForward size={16} color="#075e54" />}
                              {tipoBoton === "URL" && <Link size={16} color="#075e54" />}
                              {tipoBoton === "PHONE_NUMBER" && <Phone size={16} color="#075e54" />}
                              <Typography variant="body1" sx={{ fontWeight: "medium", color: "#075e54", fontSize: "14px" }}>
                                {tipoBoton === "QUICK_REPLY" && "Ver más"}
                                {tipoBoton === "URL" && "Visitar sitio"}
                                {tipoBoton === "PHONE_NUMBER" && "Llamar ahora"}
                              </Typography>
                            </Box>
                            
                            {cantidadBotones === "2" && (
                              <Box
                                sx={{
                                  width: '100%',
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-start",
                                  gap: 1,
                                  borderBottom: "1px solid #e0e0e0",
                                  p: 1.5,
                                  backgroundColor: "#ffffff",
                                  cursor: "pointer",
                                  "&:hover": {
                                    backgroundColor: "#f5f5f5",
                                  },
                                  borderRadius: 0,
                                }}
                              >
                                {tipoBoton === "QUICK_REPLY" && <ArrowForward size={16} color="#075e54" />}
                                {tipoBoton === "URL" && <Link size={16} color="#075e54" />}
                                {tipoBoton === "PHONE_NUMBER" && <Phone size={16} color="#075e54" />}
                                <Typography variant="body1" sx={{ fontWeight: "medium", color: "#075e54", fontSize: "14px" }}>
                                  {tipoBoton === "QUICK_REPLY" && "Más información"}
                                  {tipoBoton === "URL" && "Más detalles"}
                                  {tipoBoton === "PHONE_NUMBER" && "Contactar"}
                                </Typography>
                              </Box>
                            )}
                          </>
                        )}
                      </Stack>
                    </Box>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
          
          {/* Tiempo de envío */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.7rem' }}>
              10:45 AM
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}