import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Accordion, AccordionSummary, AccordionDetails, Alert, Box, Button, Checkbox, Card, CardActions, CardContent, CardMedia, Chip, Container, Dialog, DialogTitle, DialogContent, DialogActions, Divider, FormControl, FormControlLabel, FormLabel, FormHelperText, Grid, Grid2, IconButton, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, Snackbar, Stack, TextField, Tooltip, Typography, alpha } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';




import { Smile } from "react-feather"; // Icono para emojis
import EmojiPicker from "emoji-picker-react"; // Selector de emojis

// Import Swiper styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Delete from '@mui/icons-material/Delete';
import ArrowForward from "@mui/icons-material/ArrowForward";
import Link from "@mui/icons-material/Link";
import Phone from "@mui/icons-material/Phone";
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import WhatsAppCarouselPreview from './WhatsappCarouselPreview';
import FileUploadCarousel from './FileUploadCarouselV2';
import { isValidURL, updateButtonWithValidation } from '../utils/validarUrl';
import { editTemplateCarouselGupshup } from '../api/gupshupApi';
import { saveTemplateToTalkMe } from '../api/templatesGSApi';
import { editTemplateToTalkMe } from '../api/templatesGSApi';
import { eliminarParametrosPlantilla, obtenerPantallasMedia, obtenerParametros, saveTemplateParams } from '../api/templatesGSApi';
import { useClickOutside } from '../utils/emojiClick';

import { CustomDialog } from '../utils/CustomDialog';

const EditTemplateFormCarousel = () => {

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

let appId, authCode, appName, idUsuarioTalkMe, idNombreUsuarioTalkMe, empresaTalkMe, idBotRedes, idBot, urlTemplatesGS, apiToken, urlWsFTP;

appId = '1fbd9a1e-074c-4e1e-801c-b25a0fcc9487'; // Extrae appId del token
authCode = 'sk_d416c60960504bab8be8bc3fac11a358'; // Extrae authCode del token
appName = 'DemosTalkMe55'; // Extrae el nombre de la aplicación
idUsuarioTalkMe = 78;  // Cambiado de idUsuario a id_usuario
idNombreUsuarioTalkMe = 'javier.colocho';  // Cambiado de nombreUsuario a nombre_usuario
empresaTalkMe = 2;
idBotRedes = 721;
idBot = 257;
urlTemplatesGS = 'http://localhost:3004/api/';
apiToken = 'TFneZr222V896T9756578476n9J52mK9d95434K573jaKx29jq';
urlWsFTP = 'https://dev.talkme.pro/WsFTP/api/ftp/upload';
*/

  const location = useLocation();
  const navigate = useNavigate();
  const templateData = location.state?.template || {}; // Datos del template

  //MODO DE EDICION || ESTO ES UN FLAG 
  const [modoEdicionActiva, setModoEdicionActiva] = useState(false);


  //CAMPOS DEL FORMULARIO PARA EL REQUEST
  const [idPlantilla, setIdPlantilla] = useState(";")
  const [templateName, setTemplateName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [templateType, setTemplateType] = useState("CAROUSEL");
  const [pantallas, setPantallas] = useState(["4 - Broadcast"]);
  const [displayPantallas, setDisplayPantallas] = useState([]);
  const [carouselType, setCarouselType] = useState("");
  const [templateNameHelperText, setTemplateNameHelperText] = useState("El nombre debe hacer referencia al texto de su plantilla.");
  const [templateNameError, setTemplateNameError] = useState(false);
  const [vertical, setVertical] = useState("");
  const [message, setMessage] = useState("");
  const [idTemplate, setIdTemplate] = useState("");

  //carousel
  const [messageCard, setMessageCard] = useState("");
  const messageCardRefs = useRef({});
  const [cantidadBotones, setCantidadBotones] = useState("");
  const [tipoBoton, setTipoBoton] = useState("QUICK_REPLY")

  const [header, setHeader] = useState("");
  const [footer, setFooter] = useState("");
  const [buttons, setButtons] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [example, setExample] = useState("");
  const [exampleMedia, setExampleMedia] = useState("");


  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");


  const [languageCode, setLanguageCode] = useState("es"); // Valor predeterminado: español
  const [languageTypeError, setLanguageTypeError] = useState(false);
  const [languageTypeHelperText, setLanguageTypeHelperText] = useState("");

  const [categoriaPlantilla, setcategoriaPlantilla] = useState("");
  const [categoriaPlantillaError, setcategoriaPlantillaError] = useState(false);
  const [categoriaPlantillaHelperText, setcategoriaPlantillaHelperText] = useState("");

  const [etiquetaPlantilla, setetiquetaPlantilla] = useState("");
  const [etiquetaPlantillaError, setetiquetaPlantillaError] = useState(false);
  const [etiquetaPlantillaHelperText, setetiquetaPlantillaHelperText] = useState("");

  const [contenidoPlantilla, setcontenidoPlantilla] = useState("");
  const [contenidoPlantillaTypeError, setcontenidoPlantillaTypeError] = useState(false);
  const [contenidoPlantillaTypeHelperText, setcontenidoPlantillaTypeHelperText] = useState("");

  const [ejemploPlantilla, setejemploPlantilla] = useState("");
  const [ejemploPlantillaError, setejemploPlantillaError] = useState(false);
  const [ejemploPlantillaHelperText, setejemploPlantillaHelperText] = useState("");

  //const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showEmojiPickerCards, setShowEmojiPickerCards] = useState(false);
  const [variables, setVariables] = useState([]);
  const [variablesCard, setVariablesCard] = useState([]);

  // Estado para almacenar ejemplos de variables
  const [variableExamples, setVariableExamples] = useState({});
  const [variableExamplesError, setvariableExamplesError] = useState(false);
  const [variableExamplesHelperText, setvariableExamplesHelperText] = useState("");
  const [variableErrors, setVariableErrors] = useState({});

  // Estado para almacenar ejemplos de variables
  const [variableExamplesCard, setVariableExamplesCard] = useState({});
  const [variableExamplesErrorCard, setvariableExamplesErrorCard] = useState(false);
  const [variableExamplesHelperTextCard, setvariableExamplesHelperTextCard] = useState("");
  const [variableErrorsCard, setVariableErrorsCard] = useState({});

  // Estado para almacenar descripciones de variables
  const [variableDescriptions, setVariableDescriptions] = useState({});
  const [variableDescriptionsError, setvariableDescriptionsError] = useState(false);
  const [variableDescriptionsHelperText, setvariableDescriptionsHelperText] = useState("");

  const [variableDescriptionsCard, setVariableDescriptionsCard] = useState({});
  const [variableDescriptionsErrorCard, setvariableDescriptionsErrorCard] = useState(false);
  const [variableDescriptionsHelperTextCard, setvariableDescriptionsHelperTextCard] = useState("");

  //ESTE ES PARA EL EXAMPLE MEDIA
  const [mediaId, setMediaId] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const templateNameRef = useRef(null);
  const templateTypeRef = useRef(null);
  const carouselTypeRef = useRef(null);
  const languageCodeRef = useRef(null);
  const verticalRef = useRef(null);
  const messageRef = useRef(null);
  const messageCardRef = useRef(null);
  const exampleRef = useRef(null);
  const exampleCardRef = useRef(null);
  const selectedCategoryRef = useRef(null);
  const exampleRefs = useRef({});
  const exampleCardRefs = useRef({});


  const emojiPickerRef = useRef(null);
  const emojiPickerCardRef = useRef(null);
  const emojiPickerButtonRef = useRef(null); // Para el botón
  const emojiPickerComponentRef = useRef(null); // Para el componente del picker

  const [emojiCount, setEmojiCount] = useState(0);

  // Cargar los datos en el formulario al montar el componente
  useEffect(() => {
    const loadData = async () => {
      if (templateData) {
        setTemplateName(templateData.elementName || "");
        setSelectedCategory(templateData.category || "");
        setTemplateType(templateData.templateType || "");
        setLanguageCode(templateData.languageCode || "");
        setVertical(templateData.vertical || "");
        setIdTemplate(templateData.id);

        // Parsear containerMeta si existe
        if (templateData.containerMeta) {
          try {
            const meta = JSON.parse(templateData.containerMeta);

            setMessage(meta.data || "");
            setExample(meta.sampleText || "");

            // Detectar el tipo de carrusel basado en la primera tarjeta
            if (meta.cards && meta.cards.length > 0) {

              setCarouselType(meta.cards[0].headerType);

              // Detectar cantidad de botones y su tipo basado en la primera tarjeta
              if (meta.cards[0].buttons && meta.cards[0].buttons.length > 0) {
                setCantidadBotones(String(meta.cards[0].buttons.length));



                setTipoBoton(meta.cards[0].buttons[0].type || "QUICK_REPLY");
              }

              // Configurar las tarjetas con sus datos
              const destructuredCards = meta.cards.map((card, index) => {
                return {
                  id: `card-${index}`, // Genera un ID único para cada tarjeta
                  messageCard: card.body || "",
                  variablesCard: [], // Si tienes variables en el body, deberías extraerlas aquí
                  variableDescriptions: {}, // Mapeo para descripciones de variables
                  variableExamples: {}, // Mapeo para ejemplos de variables
                  fileData: card.mediaUrl ? {
                    url: card.mediaUrl,
                    id: card.mediaId || `media-${Date.now()}-${index}`,
                    type: card.headerType === "IMAGE" ? "image" : "video",
                  } : null,
                  buttons: card.buttons ? card.buttons.map((button, buttonIndex) => ({
                    id: `button-${index}-${buttonIndex}`,
                    title: button.text || "",
                    type: button.type || "QUICK_REPLY",
                    url: button.url || "",
                    phoneNumber: button.phone_number || ""
                  })) : []
                };
              });

              setCards(destructuredCards);
            }
          } catch (error) {
            console.error("Error al parsear containerMeta:", error);
          }
        }
      }

      // Segundo bloque try-catch movido dentro de loadData
      try {
        const info = await obtenerPantallasMedia(urlTemplatesGS, templateData.id);
        if (info === null) {

        } else {
          const pantallasFromAPI = info.pantallas || "";
          setPantallas(pantallasFromAPI);

          const displayValues = procesarPantallasAPI(pantallasFromAPI);
          setDisplayPantallas(displayValues);

          setMediaURL(info.url || "");
          setImagePreview(info.url || "");
          setIdPlantilla(info.id_plantilla || ""); // Esto se establece aquí
        }
      } catch (error) {

      }
    };

    loadData(); // Llamada a la función dentro del useEffect
  }, [templateData, urlTemplatesGS]);

  // Segundo useEffect que se ejecuta cuando idPlantilla cambia
  useEffect(() => {
    const loadParametros = async () => {
      if (!idPlantilla) return; // No hacer nada si idPlantilla está vacío

      try {
        const infoParametros = await obtenerParametros(urlTemplatesGS, idPlantilla);
        if (infoParametros === null || infoParametros.length === 0) {

        } else {
          const parametrosOrdenados = infoParametros.sort((a, b) => a.ORDEN - b.ORDEN);
          const variablesFormateadas = parametrosOrdenados.map((param, index) => `{{${index + 1}}}`);

          setVariables(variablesFormateadas);

          const descripcionesIniciales = {};
          const ejemplosIniciales = {};

          parametrosOrdenados.forEach((param, index) => {
            const variableKey = `{{${index + 1}}}`;
            descripcionesIniciales[variableKey] = param.NOMBRE;
            ejemplosIniciales[variableKey] = param.PLACEHOLDER || '';
          });

          setVariableDescriptions(descripcionesIniciales);
          setVariableExamples(ejemplosIniciales);




        }
      } catch (error) {

      }
    };

    loadParametros();
  }, [idPlantilla, urlTemplatesGS]); // Se ejecuta cuando idPlantilla cambia

  const resetForm = () => {
    setTemplateName("");
    setSelectedCategory("");
    setLanguageCode("");
    setVertical("");
    setMessage("");
    setMediaId("");
    setButtons([]);
    setExample("");
    setCards([initialCardState]);
    setUploadedUrl("");
    setVariables([]);
    setVariableDescriptions([]);
    // Agrega cualquier otro estado relacionado
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessageGupshup, setErrorMessageGupshup] = useState("La plantilla no pudo ser creada.");

  // Función para mostrar Snackbar
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Función para cerrar Snackbar
  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const validateFields = () => {
    let isValid = true;



    if (!templateName || templateName.trim() === "") {

      setTemplateNameError(true);
      setTemplateNameHelperText("Este campo es requerido");
      isValid = false;
      if (templateNameRef.current) templateNameRef.current.focus();

      // No retornar aquí, continuar con la validación de otros campos
    } else {

    }

    if (!templateType || templateType.trim() === "") {

      setTemplateTypeError(true);
      setTemplateTypeHelperText("Este campo es requerido");
      isValid = false;
      if (templateTypeRef.current) templateTypeRef.current.focus();

      // No retornar aquí, continuar con la validación de otros campos
    } else {

    }

    if (!languageCode || languageCode.trim() === "") {

      setLanguageTypeError(true);
      setLanguageTypeHelperText("Este campo es requerido");
      isValid = false;
      if (languageCodeRef.current) languageCodeRef.current.focus();

      // No retornar aquí, continuar con la validación de otros campos
    } else {

    }

    if (!vertical || vertical.trim() === "") {

      setetiquetaPlantillaError(true);
      isValid = false;
      if (verticalRef.current) verticalRef.current.focus();

      // No retornar aquí, continuar con la validación de otros campos
    } else {

    }

    if (!message || message.trim() === "") {

      setcontenidoPlantillaTypeError(true);
      setcontenidoPlantillaTypeHelperText("Este campo es requerido");
      isValid = false;
      if (messageRef.current) messageRef.current.focus();

      // No retornar aquí, continuar con la validación de otros campos
    } else {

    }

    if (!example || example.trim() === "") {

      setejemploPlantillaError(true);
      setejemploPlantillaHelperText("Este campo es requerido");
      isValid = false;
      if (exampleRef.current) exampleRef.current.focus();

      // No retornar aquí, continuar con la validación de otros campos
    } else {

    }

    if (!selectedCategory || selectedCategory.trim() === "") {

      setcategoriaPlantillaError(true);
      setcategoriaPlantillaHelperText("Este campo es requerido");
      isValid = false;
      if (selectedCategoryRef.current) selectedCategoryRef.current.focus();

      // No retornar aquí, continuar con la validación de otros campos
    } else {

    }

    // Validar que todas las variables tengan un texto de ejemplo
    if (variables.length > 0) {

      const newErrors = {}; // Objeto para almacenar los errores

      for (const variable of variables) {
        if (!variableExamples[variable] || variableExamples[variable].trim() === "") {

          isValid = false;
          newErrors[variable] = "Este campo es requerido"; // Asignar mensaje de error

          // Colocar el foco en el campo de texto de ejemplo vacío
          if (exampleRefs.current[variable]) {
            exampleRefs.current[variable].focus();
          }
        } else {

          newErrors[variable] = ""; // Sin error
        }
      }

      // Actualizar el estado de errores
      setVariableErrors(newErrors);

      // Si hay errores, no retornar aquí, continuar con el flujo
      if (!isValid) {

      } else {

      }
    } else {

    }


    return isValid; // Retornar el valor final de isValid
  };

  // Función para determinar el tipo de archivo basado en la extensión
  const getMediaType = (url) => {
    // Extraer la extensión del archivo de la URL
    const extension = url.split('.').pop().toLowerCase();

    // Determinar el tipo de archivo basado en la extensión
    if (['png', 'jpeg', 'jpg', 'gif'].includes(extension)) {
      return 'IMAGE';
    } else if (['mp4', '3gp', 'mov', 'avi'].includes(extension)) {
      return 'VIDEO';
    } else if (['txt', 'xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'pdf'].includes(extension)) {
      return 'DOCUMENT';
    } else {
      return 'null'; // En caso de que la extensión no sea reconocida
    }
  };

  const iniciarRequest = async () => {
    try {
      // Hacer debug de las cards antes de formatear

      // Primero verifica que cards esté definido
      if (!cards || cards.length === 0) {
        console.error("No hay tarjetas disponibles");
        return;
      }

      // Luego formatea las cards
      const formattedCards = formatCardsForGupshup(cards);

      // Ahora sí puedes hacer log de formattedCards

      // Asegúrate de que todas las cards tengan los datos necesarios
      const isValid = formattedCards.every(card =>
        card.mediaUrl && card.body // Añade aquí más validaciones si son necesarias
      );

      if (!isValid) {
        console.error("Algunas cards no tienen todos los datos requeridos");
        console.error(formattedCards);
        return;
      }

      //
      const cardsToSendArray = [...cards]; // Esto es un array de objetos
      const cardsToSend = JSON.stringify([...cards]); // Convertir a JSON string

      // COMENTADO EL PRIMER REQUEST


      const result = await editTemplateCarouselGupshup(
        appId,
        authCode,
        {
          templateName,
          selectedCategory,
          languageCode,
          templateType,
          vertical,
          message,
          header,
          footer,
          mediaId,
          buttons,
          example,
          carousel: JSON.stringify(formattedCards) // Enviar como string JSON
        },
        idTemplate,
        validateFields
      );
      //

      /*const result = {
        status: "success",
        template: {
          id: "e885dbea-06e5-433d-82b6-6391e6d76ae9" // Puedes poner cualquier ID de prueba aquí
        }
      };*/

      // Verificar si el primer request fue exitoso
      if (result && result.status === "success") {

        // Hacer el segundo request a TalkMe API
        
        const result2 = await editTemplateToTalkMe(
          idTemplate,
          {
            templateName,
            selectedCategory,
            message,
            uploadedUrl,
            templateType
          },
          idNombreUsuarioTalkMe || "Sistema.TalkMe",
          variables,
          variableDescriptions,
          cardsToSendArray,
          urlTemplatesGS,
          idBotRedes
        );

        // Si el segundo request también fue exitoso
        if (result2) {
          Swal.fire({
            title: 'Éxito',
            text: 'La plantilla se actualizó correctamente.',
            icon: 'success',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#00c3ff'
          });

          navigate('/Dashboard');

        } else {
          Swal.fire({
            title: 'Error al actualizar',
            text: `Ocurrió un problema al actualizar la plantilla. Error: ${result2.message || 'Ocurrió un problema al actualizar la plantilla, intenta nuevamente.'}`,
            icon: 'error',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#00c3ff'
          });

        }
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: `Ocurrió un problema al actualizar la plantilla. Error: ${error.message || 'Ocurrió un problema al actualizar la plantilla, intenta nuevamente.'}`,
        icon: 'error',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#00c3ff'
      });
    }
  };

  // PANTALLAS
  const pantallasTalkMe = [
    '4 - Broadcast'
  ];

  // CATEGORIAS
  const categories = [
    {
      id: 'MARKETING',
      title: 'Marketing',
      description: 'Envía ofertas promocionales, ofertas de productos y más para aumentar la conciencia y el compromiso.',
      icon: <EmailOutlinedIcon />,
    },
    {
      id: 'utility',
      title: 'Utilidad',
      description: 'Envía actualizaciones de cuenta, actualizaciones de pedidos, alertas y más para compartir información importante.',
      icon: <NotificationsNoneOutlinedIcon />,
    },
    {
      id: 'authentication',
      title: 'Autenticación',
      description: 'Envía códigos que permiten a tus clientes acceder a su cuenta.',
      icon: <VpnKeyOutlinedIcon />,
      disabled: true
    }
  ];
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  //NOMBRE PLANTILLA
  const handleTemplateNameChange = (event) => {
    // Reemplazar espacios con guiones bajos
    const newValue = event.target.value.replace(/\s+/g, '_');

    // Actualizar el estado con el nuevo valor
    setTemplateName(newValue);

    // Validar si el campo está vacío
    if (newValue.trim() === "") {
      setTemplateNameError(true);
      setTemplateNameHelperText("Este campo es requerido");
    } else {
      setTemplateNameError(false);
      setTemplateNameHelperText("");
    }
  };

  //IDIOMA PLANTILLA
  const handleLanguageCodeChange = (event) => {
    const selectedLanguage = event.target.value; // Esto ya es el código de idioma ("es", "en", "fr")
    setLanguageCode(selectedLanguage); // Actualiza el estado directamente con el código

    if (selectedLanguage.trim() === "") {
      setLanguageTypeError(true);
      setLanguageTypeHelperText("Este campo es requerido");
    } else {
      setLanguageTypeError(false);
      setLanguageTypeHelperText("");
    }
  };

  // Mapeo de idiomas (código -> nombre)
  const languageMap = {
    es: "Español",
    en: "Inglés",
    fr: "Francés",
  };

  const reverseLanguageMap = {
    es: "español",
    en: "inglés",
    fr: "frances",
  };

  //VERTICAL PLANTILLA
  const handleVerticalChange = (event) => {
    setVertical(event.target.value)
  }

  //TIPO PLANTILLA
  const handleTemplateTypeChange = (event) => {
    const newType = event.target.value;
    setTemplateType(newType);

    // Solo limpiar header si el nuevo tipo NO es "TEXT"
    if (newType !== "TEXT") {
      setHeader("");
    }

    setMediaType("");
    setMediaURL("");

    if (newType.trim() === "") {
      setTemplateTypeError(true);
      setTemplateTypeHelperText("Este campo es requerido");
    } else {
      setTemplateTypeError(false);
      setTemplateTypeHelperText("");
    }
  };

  //CAROUSEL PLANTILLA
  const handleCarouselTypeChange = (event) => {
    setCarouselType(event.target.value)
  }

  const handleHeaderTemplateTypeChange = (event) => {
    setTemplateType(event.target.value);
    setHeader(''); // Resetear el header al cambiar el tipo
  };

  const handleHeaderTypeChange = (event) => {
    const value = event.target.value;
    if (value.length <= charLimit) {
      setHeader(value);
    }
  };

  //HEADER PLANTILLA
  const [mediaType, setMediaType] = useState(""); // Tipo de media (image, video, etc.)
  const [mediaURL, setMediaURL] = useState(""); // URL del media
  const [selectedFile, setSelectedFile] = useState(null);
  const MAX_IMG_SIZE = 5 * 1024 * 1024; // 5 MB en bytes
  const [error, setError] = useState(''); // Estado para manejar errores

  const handleMediaTypeChange = (event) => {
    setMediaType(event.target.value);
  };

  const handleCloseError = () => {
    setError(''); // Cerrar el mensaje de error
  };

  const handleMediaURLChange = (event) => {
    setMediaURL(event.target.value);
  };

  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.size > MAX_IMG_SIZE) {
      setError('El archivo es demasiado grande. El tamaño máximo permitido es 5 MB.');
      setSelectedFile(null);//Limpiar el archivo seleccionado
    } else {
      setError(''); //Limpio el mensaje de error
      setSelectedFile(selectedFile);

    }
  };

  const handleHeaderChange = (e) => {
    if (e.target.value.length <= charLimit) {
      setHeader(e.target.value)
    }

  };

  //FOOTER PLANTILLA
  const handleFooterChange = (e) => {
    if (e.target.value.length <= charLimit) {
      setFooter(e.target.value);
    }
  };

  const charLimit = 60;
  const maxButtons = 3;

  //BOTONES PLANTILLA
  const addButton = () => {
    if (buttons.length < maxButtons) {
      setButtons([
        ...buttons,
        { id: Date.now(), type: "QUICK_REPLY", title: "", url: "", phoneNumber: "" }
      ]);
    }
  };

  // Función para actualizar botones en todas las cards
  const updateButtonsInAllCards = (newButtons) => {
    setCards(prevCards =>
      prevCards.map(card => ({
        ...card,
        buttons: [...newButtons] // Copia los nuevos botones a todas las cards
      })))
  };

  // Función para actualizar un botón específico
  const updateButton = (id, key, value) => {
    setCards(prevCards => {
      return prevCards.map(card => ({
        ...card,
        buttons: card.buttons.map(button =>
          button.id === id ? { ...button, [key]: value } : button
        ),
      }));
    });
  };



  const removeButton = (id) => {
    setButtons(buttons.filter((button) => button.id !== id));
  };

  // VARIABLES DEL BODY MESSAGE
  // Función actualizada con límite de emojis
  const handleBodyMessageChange = (e) => {
    const newValue = event.target.value;
    setMessage(newValue);


    // Validar si el campo está vacío
    if (newValue.trim() === "") {
      setcontenidoPlantillaTypeError(true);
      setcontenidoPlantillaTypeHelperText("Este campo es requerido");
    } else {
      setcontenidoPlantillaTypeError(false);
      setcontenidoPlantillaTypeHelperText("");
    }


    const newText = e.target.value;
    const maxLength = 549;
    const emojiCount = countEmojis(newText);
    const maxEmojis = 10;

    // Verificar si se excede el límite de emojis
    if (emojiCount > maxEmojis) {
      // Opcional: Mostrar una alerta solo cuando se supera el límite por primera vez
      if (countEmojis(message) <= maxEmojis) {
        Swal.fire({
          title: 'Límite de emojis',
          text: 'Solo puedes incluir un máximo de 10 emojis',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00c3ff'
        });
      }
      return; // No actualizar el texto si excede el límite de emojis
    }

    if (newText.length > maxLength) {
      Swal.fire({
        title: 'Limite de caracteres',
        text: 'Solo puedes incluir un máximo de 550 caracteres',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#00c3ff'
      });
      return;
    }

    if (newText.length <= maxLength) {
      // Guardar el nuevo texto
      setMessage(newText);
      // Actualizar el contador de emojis (necesitas agregar este estado)
      setEmojiCount(emojiCount);

      // Verificar qué variables se han eliminado del texto
      const deletedVariables = [];
      variables.forEach(variable => {
        if (!newText.includes(variable)) {
          deletedVariables.push(variable);
        }
      });

      // Si se eliminaron variables, actualiza el estado
      if (deletedVariables.length > 0) {
        // Filtrar las variables eliminadas
        const remainingVariables = variables.filter(v => !deletedVariables.includes(v));

        // Actualizar el estado de las variables
        setVariables(remainingVariables);

        // Actualizar las descripciones y ejemplos
        const newDescriptions = { ...variableDescriptions };
        const newExamples = { ...variableExamples };
        const newErrors = { ...variableErrors };

        deletedVariables.forEach(v => {
          delete newDescriptions[v];
          delete newExamples[v];
          delete newErrors[v];
        });

        setVariableDescriptions(newDescriptions);
        setVariableExamples(newExamples);
        setVariableErrors(newErrors);
      }
    }
  };

  const handleBodyMessageCardChange = (e, cardId) => {
    const newText = e.target.value;
    const maxLength = 280;
    const newEmojiCount = countEmojis(newText);
    const maxEmojis = 10;

    // Verificar si se excede el límite de emojis
    if (newEmojiCount > maxEmojis) {
      // Opcional: Mostrar una alerta solo cuando se supera el límite por primera vez
      if (countEmojis(message) > maxEmojis) {
        Swal.fire({
          title: 'Límite de emojis',
          text: 'Solo puedes incluir un máximo de 10 emojis',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00c3ff'
        });
      }
      return; // No actualizar el texto si excede el límite de emojis
    }

    if (newText.length > maxLength) {
      Swal.fire({
        title: 'Limite de caracteres',
        text: 'Solo puedes incluir un máximo de 550 caracteres',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#00c3ff'
      });
      return;
    }

    setCards(prevCards =>
      prevCards.map(card => {
        if (card.id !== cardId) return card;

        // Variables actuales del mensaje
        const currentVariables = card.variablesCard || [];

        // Identificar variables eliminadas
        const deletedVariables = currentVariables.filter(
          variable => !newText.includes(variable)
        );

        const remainingVariables = currentVariables.filter(
          v => !deletedVariables.includes(v)
        );

        // Actualizar descripciones y ejemplos
        const updatedDescriptions = { ...card.variableDescriptionsCard };
        const updatedExamples = { ...card.variableExamples };

        deletedVariables.forEach(v => {
          delete updatedDescriptions[v];
          delete updatedExamples[v];
        });

        return {
          ...card,
          messageCard: newText,
          variablesCard: remainingVariables,
          variableDescriptionsCard: updatedDescriptions,
          variableExamples: updatedExamples,
          emojiCountCard: newEmojiCount
        };
      })
    );
  };


  // VARIABLES DEL BODY MESSAGE
  const handleAddVariable = () => {
    const newVariable = `{{${variables.length + 1}}}`;

    // Obtener la posición actual del cursor
    const cursorPosition = messageRef.current.selectionStart;

    // Dividir el texto en dos partes: antes y después del cursor
    const textBeforeCursor = message.substring(0, cursorPosition);
    const textAfterCursor = message.substring(cursorPosition);

    // Insertar la variable en la posición del cursor
    const newMessage = `${textBeforeCursor}${newVariable}${textAfterCursor}`;
    setMessage(newMessage);

    // Actualizar el array de variables
    setVariables([...variables, newVariable]);

    // OPCIONAL: Colocar el cursor después de la variable insertada
    setTimeout(() => {
      const newPosition = cursorPosition + newVariable.length;
      messageRef.current.focus();
      messageRef.current.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleAddVariableCard = (cardId) => {
    setCards(prevCards =>
      prevCards.map(card => {
        if (card.id !== cardId) return card;

        const newVariable = `{{${card.variablesCard.length + 1}}}`;
        // Usa la referencia específica de esta tarjeta
        const textFieldRef = messageCardRefs.current[cardId];
        const cursorPosition = textFieldRef?.selectionStart || 0;

        const textBefore = card.messageCard.substring(0, cursorPosition);
        const textAfter = card.messageCard.substring(cursorPosition);

        const newMessageCard = `${textBefore}${newVariable}${textAfter}`;

        // OPCIONAL: Actualizar descripción y ejemplos también
        const updatedDescriptions = { ...card.variableDescriptionsCard, [newVariable]: "" };
        const updatedExamples = { ...card.variableExamples, [newVariable]: "" };

        return {
          ...card,
          messageCard: newMessageCard,
          variablesCard: [...card.variablesCard, newVariable],
          variableDescriptionsCard: updatedDescriptions,
          variableExamples: updatedExamples
        };
      })
    );
  };



  const handleEmojiClick = (emojiObject) => {
    const cursor = messageRef.current.selectionStart;
    const newText = message.slice(0, cursor) + emojiObject.emoji + message.slice(cursor);

    setMessage(newText);
    setShowEmojiPicker(false);

    // Aumenta el tiempo de espera para asegurar que el estado se actualiza
    setTimeout(() => {
      if (messageRef.current) {
        messageRef.current.focus();
        messageRef.current.setSelectionRange(cursor + emojiObject.emoji.length, cursor + emojiObject.emoji.length);
      }
    }, 100);
  };

  const handleEmojiClickCarousel = (emojiObject, cardId) => {
      const input = messageCardRefs.current[cardId];
      const cursor = input?.selectionStart || 0;
  
      setCards(prevCards =>
        prevCards.map(card => {
          if (card.id !== cardId) return card;
  
          const newText =
            card.messageCard.slice(0, cursor) +
            emojiObject.emoji +
            card.messageCard.slice(cursor);
  
          // Contar los emojis en el nuevo texto
          const newEmojiCountCard = countEmojis(newText);
  
          // Verificar si excedería el límite de 10 emojis
          if (newEmojiCountCard > 10) {
            // Mostrar alerta
            Swal.fire({
              title: 'Límite de emojis',
              text: 'Solo puedes incluir un máximo de 10 emojis',
              icon: 'warning',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#00c3ff'
            });
            setShowEmojiPickerCards(false);
  
            // Mantener el foco en el campo de texto
            setTimeout(() => {
              if (input) {
                input.focus();
                input.setSelectionRange(cursor, cursor);
              }
            }, 100);
  
            return card; // No actualizar el texto
          }
  
          // Si está dentro del límite, actualizar el mensaje
          return {
            ...card,
            messageCard: newText,
            emojiCountCard: newEmojiCountCard // Asumiendo que tienes este campo en el objeto card
          };
        })
      );
  
      setShowEmojiPickerCards(false);
  
      setTimeout(() => {
        if (input) {
          const newPos = cursor + emojiObject.emoji.length;
          input.focus();
          input.setSelectionRange(newPos, newPos);
        }
      }, 100);
    };




  // Función para borrar una variable específica
  const deleteVariable = (variableToDelete) => {
    // Eliminar la variable del texto
    const newMessage = message.replace(variableToDelete, '');
    setMessage(newMessage);

    // Eliminar la variable de la lista de variables
    const updatedVariables = variables.filter(v => v !== variableToDelete);

    // Renumerar las variables restantes para mantener el orden secuencial
    const renumberedVariables = [];
    const variableMapping = {}; // Mapeo de variable antigua a nueva

    updatedVariables.forEach((v, index) => {
      const newVar = `{{${index + 1}}}`;
      renumberedVariables.push(newVar);
      variableMapping[v] = newVar;
    });

    // Actualizar el texto con las variables renumeradas
    let updatedMessage = newMessage;
    Object.entries(variableMapping).forEach(([oldVar, newVar]) => {
      updatedMessage = updatedMessage.replaceAll(oldVar, newVar);
    });

    // Crear nuevos objetos para descripciones y ejemplos de variables
    const newVariableDescriptions = {};
    const newVariableExamples = {};
    const newVariableErrors = { ...variableErrors };

    // Eliminar la variable eliminada de los errores
    delete newVariableErrors[variableToDelete];

    // Copiar las descripciones y ejemplos con las nuevas claves
    Object.entries(variableMapping).forEach(([oldVar, newVar]) => {
      if (variableDescriptions[oldVar]) {
        newVariableDescriptions[newVar] = variableDescriptions[oldVar];
      }
      if (variableExamples[oldVar]) {
        newVariableExamples[newVar] = variableExamples[oldVar];
      }
      if (variableErrors[oldVar]) {
        newVariableErrors[newVar] = variableErrors[oldVar];
        delete newVariableErrors[oldVar];
      }
    });

    // Actualizar todos los estados
    setMessage(updatedMessage);
    setVariables(renumberedVariables);
    setVariableDescriptions(newVariableDescriptions);
    setVariableExamples(newVariableExamples);
    setVariableErrors(newVariableErrors);

    // Actualizar las referencias
    const newExampleRefs = {};
    renumberedVariables.forEach(v => {
      newExampleRefs[v] = exampleRefs.current[variableMapping[v]] || null;
    });
    exampleRefs.current = newExampleRefs;

    messageRef.current?.focus();
  };


  // Función para borrar una variable específica de la tarjeta
  const deleteVariableCard = (cardId, variableToDelete) => {
    setCards(prevCards =>
      prevCards.map(card => {
        if (card.id !== cardId) return card;

        // 1. Eliminar la variable del mensaje
        const newMessage = card.messageCard.replace(variableToDelete, '');

        // 2. Filtrar la variable a eliminar
        const updatedVariables = card.variablesCard.filter(v => v !== variableToDelete);

        // 3. Renumerar variables restantes
        const renumberedVariables = [];
        const variableMapping = {};

        updatedVariables.forEach((v, index) => {
          const newVar = `{{${index + 1}}}`;
          renumberedVariables.push(newVar);
          variableMapping[v] = newVar;
        });

        // 4. Actualizar el mensaje con nuevas variables
        let updatedMessage = newMessage;
        Object.entries(variableMapping).forEach(([oldVar, newVar]) => {
          updatedMessage = updatedMessage.replaceAll(oldVar, newVar);
        });

        // 5. Actualizar descripciones, ejemplos y errores
        const newVariableDescriptions = { ...card.variableDescriptions };
        const newVariableExamples = { ...card.variableExamples };
        const newVariableErrors = { ...card.variableErrors };

        // Eliminar la variable que se está borrando
        delete newVariableDescriptions[variableToDelete];
        delete newVariableExamples[variableToDelete];
        delete newVariableErrors[variableToDelete];

        // Actualizar las demás variables con nueva numeración
        Object.entries(variableMapping).forEach(([oldVar, newVar]) => {
          if (newVariableDescriptions[oldVar]) {
            newVariableDescriptions[newVar] = newVariableDescriptions[oldVar];
            delete newVariableDescriptions[oldVar];
          }
          if (newVariableExamples[oldVar]) {
            newVariableExamples[newVar] = newVariableExamples[oldVar];
            delete newVariableExamples[oldVar];
          }
          if (newVariableErrors[oldVar]) {
            newVariableErrors[newVar] = newVariableErrors[oldVar];
            delete newVariableErrors[oldVar];
          }
        });

        return {
          ...card,
          messageCard: updatedMessage,
          variablesCard: renumberedVariables,
          variableDescriptions: newVariableDescriptions,
          variableExamples: newVariableExamples,
          variableErrors: newVariableErrors
        };
      })
    );
  };


  // Función para borrar todas las variables
  const deleteAllVariables = () => {
    let newMessage = message;
    variables.forEach(variable => {
      newMessage = newMessage.replaceAll(variable, '');
    });
    setMessage(newMessage);
    setVariables([]);

    // Limpiar todos los estados relacionados con variables
    setVariableDescriptions({});
    setVariableExamples({});
    setVariableErrors({});
    exampleRefs.current = {};

    messageRef.current?.focus();
  };

  // Nueva función para borrar todas las variables
  const deleteAllVariablesCard = (cardId) => {
    setCards(prevCards =>
      prevCards.map(card => {
        if (card.id !== cardId) return card;

        let newMessage = card.messageCard;
        card.variablesCard.forEach(variable => {
          newMessage = newMessage.replaceAll(variable, '');
        });

        return {
          ...card,
          messageCard: newMessage,
          variablesCard: [],
          variableDescriptionsCard: {},
          variableExamples: {}
        };
      })
    );

    messageCardRef.current?.focus();
  };


  // Función para previsualizar el mensaje con ejemplos aplicados
  const previewMessage = () => {
    let previewHeader = header;
    let previewFooter = footer;
    let previewText = message;
    Object.entries(variableExamples).forEach(([variable, example]) => {
      previewHeader = previewHeader.replaceAll(variable, example);
      previewFooter = previewFooter.replaceAll(variable, example);
      previewText = previewText.replaceAll(variable, example);
    });
  }

  const handleUpdateExample = (variable, value) => {
    setVariableExamples(prevExamples => {
      const updatedExamples = { ...prevExamples, [variable]: value };

      return updatedExamples;
    });
  };

  const handleUpdateDescriptions = (variable, value) => {
    const newValue = event.target.value.replace(/\s+/g, '_');
    setVariableDescriptions(prevDescriptions => ({
      ...prevDescriptions,
      [variable]: newValue
    }));
  };

  const handleUpdateDescriptionsCard = (cardId, variable, value) => {
    setCards(prevCards =>
      prevCards.map(card => {
        if (card.id !== cardId) return card;

        return {
          ...card,
          variableDescriptions: {
            ...card.variableDescriptions,
            [variable]: value
          }
        };
      })
    );
  };

  const handleUpdateExampleCard = (cardId, variable, value) => {
    setCards(prevCards =>
      prevCards.map(card => {
        if (card.id !== cardId) return card;

        return {
          ...card,
          variableExamples: {
            ...card.variableExamples,
            [variable]: value
          }
        };
      })
    );
  };

  // Función para generar el ejemplo combinando el mensaje y los valores de las variables
  const generateExample = () => {
    let generatedExample = message;
    Object.keys(variableExamples).forEach(variable => {
      generatedExample = generatedExample.replace(new RegExp(variable, 'g'), variableExamples[variable]);
    });
    return generatedExample;
  };

  // Función para reemplazar las variables en el mensaje con sus ejemplos
  const replaceVariables = (text, variables) => {
    let result = text;


    Object.keys(variables).forEach(variable => {
      const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g'); // 🔥 Búsqueda exacta de {{variable}}

      result = result.replace(regex, variables[variable]);
    });


    return result;
  };

  // Generar IDs únicos para los botones
  const generateId = () => Math.random().toString(36).substr(2, 9);



  // Actualizar el campo "example" y "message" cuando cambie el mensaje o los ejemplos de las variables
  useEffect(() => {



    const newExample = replaceVariables(message, variableExamples);



    setExample(newExample);
  }, [message, variableExamples]);

  useEffect(() => {
    // Función que maneja los clics fuera del componente
    const handleClickOutside = (event) => {
      // Verificar si el clic fue fuera tanto del botón como del picker
      if (
        showEmojiPicker &&
        emojiPickerButtonRef.current &&
        emojiPickerComponentRef.current &&
        !emojiPickerButtonRef.current.contains(event.target) &&
        !emojiPickerComponentRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }

      if (
        showEmojiPickerCards &&
        emojiPickerCardRef.current &&
        !emojiPickerCardRef.current.contains(event.target)
      ) {
        setShowEmojiPickerCards(false);
      }
    }
  }
  )

  /* Inicializar botones basado en la cantidad seleccionada
  // Efecto para inicializar botones

  useEffect(() => {
    setCards(prevCards =>
      prevCards.map(card => {
        if (card.buttons.length > 0) return card; // ← ¡Evita sobreescribir si ya tiene botones!
  
        const newButtons = [];
        for (let i = 0; i < cantidadBotones; i++) {
          newButtons.push({
            id: generateId(),
            title: `Botón ${i + 1}`,
            type: tipoBoton,
            ...(tipoBoton === 'URL' && { url: '' }),
            ...(tipoBoton === 'PHONE_NUMBER' && { phoneNumber: '' })
          });
        }
  
        return {
          ...card,
          buttons: newButtons
        };
      })
    );
  }, [cantidadBotones, tipoBoton]); */

  const regenerarBotones = (cantidad, tipo) => {
    setCards(prevCards =>
      prevCards.map(card => {
        const newButtons = [];

        for (let i = 0; i < cantidad; i++) {
          newButtons.push({
            id: generateId(),
            title: `Botón ${i + 1}`,
            type: tipo,
            ...(tipo === 'URL' && { url: '' }),
            ...(tipo === 'PHONE_NUMBER' && { phoneNumber: '' })
          });
        }

        return {
          ...card,
          buttons: newButtons
        };
      })
    );
  };

  const handleCantidadChange = (e) => {
    const nuevaCantidad = Number(e.target.value);
    setCantidadBotones(nuevaCantidad);
    regenerarBotones(nuevaCantidad, tipoBoton);
  };

  const handleTipoBotonChange = (e) => {
    const nuevoTipo = e.target.value;
    setTipoBoton(nuevoTipo);
    regenerarBotones(cantidadBotones, nuevoTipo);
  };




  // Validación para URLs
  const updateButtonWithValidation = (id, field, value, setButtons, setValidationErrors) => {
    // Validación simple de URL
    const isValid = value === '' || /^(ftp|http|https):\/\/[^ "]+$/.test(value);

    setButtons(prevButtons =>
      prevButtons.map(button =>
        button.id === id ? { ...button, [field]: value } : button
      )
    );

    setValidationErrors(prevErrors => ({
      ...prevErrors,
      [id]: isValid ? undefined : 'URL no válida'
    }));
  };


  const formatCardsForGupshup = (cards) => {
    return cards.map(card => {
      // Transformar botones al formato requerido por Gupshup
      const transformedButtons = card.buttons.map(button => {
        if (button.type === "URL") {
          return {
            type: "URL",
            text: button.title,
            url: button.url,
            buttonValue: button.url.split("{{")[0] || button.url,
            suffix: "",
            example: [button.url]
          };
        } else if (button.type === "QUICK_REPLY") {
          return {
            type: "QUICK_REPLY",
            text: button.title
          };
        } else if (button.type === "PHONE_NUMBER") {
          return {
            type: "PHONE_NUMBER",
            text: button.title,
            phoneNumber: button.phoneNumber
          };
        }
        return null;
      }).filter(button => button !== null);

      // Obtener la URL independientemente de la estructura de file
      // Obtener la URL de manera más robusta
      let mediaUrl = '';
      if (card.fileData && card.fileData.url) {
        mediaUrl = card.fileData.url;
      }




      // Crear el formato requerido por Gupshup
      return {
        headerType: "IMAGE",
        mediaUrl: mediaUrl,
        mediaId: card.fileData?.mediaId || null,  // Usa el mediaId si existe
        exampleMedia: null,
        body: card.messageCard || "",
        sampleText: card.variableExamples?.messageCard || card.messageCard || "",
        buttons: transformedButtons
      };
    });
  };

  // Uso de la función
  //const formattedCardsForGupshup = formatCardsForGupshup(cards);
  //


  // Estado para los acordeones - solo guardamos el ID único y el contenido del formulario
  const [accordions, setAccordions] = useState([
  ]);

  // Estado para controlar qué acordeón está expandido
  const [expanded, setExpanded] = useState(false);

  // Manejar cambios en la expansión del acordeón
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Manejar cambios en los formularios
  const handleFormChange = (id, field, value) => {
    setAccordions(accordions.map(accordion =>
      accordion.id === id ? { ...accordion, [field]: value } : accordion
    ));
  };

  // Agregar nueva tarjeta
  const addAccordion = () => {
    // Verificar si ya hay 10 acordeones
    if (cards.length >= 10) {
      alert("No puedes tener más de 10 acordeones"); // Opcional: mostrar mensaje al usuario
      return; // Salir de la función sin agregar más
    }

    const cantidad = parseInt(cantidadBotones, 10);
    const nuevaCard = {
      ...initialCardState,
      id: uuidv4(),
      buttons: generarBotones(cantidad, tipoBoton)
    };
    setCards([...cards, nuevaCard]);
  };


  // Eliminar tarjeta
  const deleteAccordion = (id, e) => {
    e.stopPropagation();
    setCards(cards.filter(card => card.id !== id));
  };

  // Actualizar cualquier campo de una tarjeta
  const updateCardField = (cardId, field, value) => {
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, [field]: value } : card
    ));
  };

  const generarBotones = (cantidad, tipo) => {
    const botones = [];
    for (let i = 0; i < cantidad; i++) {
      botones.push({
        id: generateId(), // o uuidv4() si preferís
        title: `Botón ${i + 1}`,
        type: tipo,
        ...(tipo === 'URL' && { url: '' }),
        ...(tipo === 'PHONE_NUMBER' && { phoneNumber: '' })
      });
    }
    return botones;
  };




  // Manejar el fin del arrastre
  const onDragEnd = (result) => {
    // Si no hay destino válido, no hacer nada
    if (!result.destination) return;

    const items = Array.from(accordions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setAccordions(items);
  };

  // Estado inicial para cada tarjeta del carrusel
  const initialCardState = {
    id: uuidv4(), // o algún otro método para generar IDs únicos
    carouselType: "IMAGEN",
    messageCard: "",
    variablesCard: [],
    variableDescriptionsCard: {},
    variableExamples: {},
    buttons: [],
    file: null, // para almacenar el archivo subido
    // otros campos que necesites
  };

  // Estado principal que contiene todas las tarjetas
  const [cards, setCards] = useState([initialCardState]);

  const currentCardId = cards[0].id;



  // Función para manejar la subida de archivos para una card específica
  const handleFileUpload = (cardId, uploadResponse) => {


    if (uploadResponse) {
      // Estructura esperada del uploadResponse después de las modificaciones
      const fileData = {
        url: uploadResponse.url,
        mediaId: uploadResponse.mediaId || null
      };



      setCards(prevCards => prevCards.map(card => {
        if (card.id === cardId) {
          return {
            ...card,
            fileData: fileData // Guardar los datos del archivo en la tarjeta
          };
        }
        return card;
      }));
    } else {
      console.error("No se recibió respuesta de subida válida");
    }
  };

  // Función para contar emojis en un texto
  const countEmojis = (text) => {
    // Esta regex detecta la mayoría de los emojis, incluyendo emojis con modificadores
    const emojiRegex = /(\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*)/gu;
    const matches = text.match(emojiRegex);
    return matches ? matches.length : 0;
  };

  const handlePantallas = (event) => {
    const { target: { value } } = event;

    // Procesar los valores seleccionados
    const selectedOptions = typeof value === 'string' ? value.split(',') : value;

    // Extraer solo los números
    const numericValues = selectedOptions.map(option => {
      return option.split(' - ')[0].trim();
    });

    // Guardar como string con comas para la API
    setPantallas(numericValues.join(','));

    // Guardar el texto completo para mostrar (displayPantallas)
    setDisplayPantallas(selectedOptions);
  };

  const procesarPantallasAPI = (pantallasString) => {
    if (!pantallasString) return [];

    const pantallasArray = pantallasString.split(',');
    const displayValues = pantallasArray.map(pantallaNum => {
      const pantallaOption = pantallasTalkMe.find(option =>
        option.startsWith(pantallaNum.trim() + ' -')
      );
      return pantallaOption || pantallaNum;
    });

    return displayValues;
  };


  return (
    <Grid container sx={{ height: 'calc(100vh - 16px)' }}>

      {/* Notificaciones */}<Snackbar
        open={openSnackbar}
        autoHideDuration={10000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Formulario (70%) */}
      <Grid item xs={8} sx={{ height: '100%' }}>
        <Box sx={{ height: '100%', overflowY: 'auto', pr: 2, px: 2, py: 2 }}>

          {/* Template Name */}<Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="template-name-input">
                *Nombre de la plantilla
              </FormLabel>
              <TextField
                id="template-name-input"
                aria-required="true"
                helperText={templateNameHelperText}
                error={templateNameError}
                value={templateName}
                onChange={handleTemplateNameChange}
                fullWidth
                inputRef={templateNameRef}
                disabled
              />
            </FormControl>
          </Box>

          {/*Categoría --data-urlencode 'category*/}<Box sx={{ maxWidth: '100%', border: "1px solid #ddd", borderRadius: 2, marginTop: 2, p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControl fullWidth>
                <FormLabel>
                  *Categoría
                </FormLabel>
              </FormControl>
              <Tooltip title="Tu plantilla debe pertencer a una de estas categorías">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <RadioGroup value={selectedCategory} onChange={handleCategoryChange}>
              <Stack spacing={2}>
                {categories.map((category) => (
                  <Paper key={category.id} sx={{
                    p: 2,
                    cursor: category.disabled ? "default" : "pointer",
                    opacity: category.disabled ? 0.5 : 1,
                    border: categoriaPlantillaError && !selectedCategory ? "1px solid red" : "none", // Resaltar en rojo si hay error
                    "&:hover": {
                      bgcolor: category.disabled
                        ? "transparent"
                        : (theme) => alpha(theme.palette.primary.main, 0.04),
                    },
                  }}>
                    <FormControlLabel
                      value={category.id}
                      disabled={category.disabled}
                      control={<Radio />}
                      label={
                        <Box sx={{ ml: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            {category.icon}
                            <Typography variant="subtitle1" component="span">
                              {category.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {category.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ margin: 0, width: '100%' }}
                    />
                  </Paper>
                ))}
              </Stack>
            </RadioGroup>
            {/* Mensaje de error */}
            {categoriaPlantillaError && (
              <FormHelperText error={categoriaPlantillaError}>
                {categoriaPlantillaHelperText}
              </FormHelperText>
            )}
          </Box>

          {/* Tipo de plantilla --data-urlencode templateType*/}<Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormControl fullWidth>
              <FormLabel>
                *Tipo de plantilla
              </FormLabel>
            </FormControl>

            <FormControl fullWidth>
              <Select labelId="template-type-label" id="template-type" value={templateType} onChange={handleTemplateTypeChange} label="Select" ref={templateTypeRef}>
                <MenuItem value="CAROUSEL">CARRUSEL</MenuItem>
              </Select>
              <FormHelperText>
                Escoge el tipo de plantilla que se va a crear
              </FormHelperText>
            </FormControl>
          </Box>

          {/* Selección de pantallas TalkMe */}<Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormControl fullWidth>
              <FormLabel>
                Aplicar en estas pantallas
              </FormLabel>
            </FormControl>
            <FormControl fullWidth sx={{ m: 1 }}>
              <InputLabel id="demo-multiple-checkbox-label">Selecciona una o más opciones</InputLabel>
              <Select
                labelId="demo-multiple-checkbox-label"
                id="demo-multiple-checkbox"
                multiple
                value={displayPantallas}
                onChange={handlePantallas}
                input={<OutlinedInput label="Selecciona una o más opciones" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {pantallasTalkMe.map((name) => (
                  <MenuItem key={name} value={name}>
                    <Checkbox checked={displayPantallas.indexOf(name) > -1} />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/*Idioma --data-urlencodeo languageCode */}<Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormControl fullWidth>
              <FormLabel>*Idioma de plantilla</FormLabel>
            </FormControl>

            <FormControl fullWidth error={languageTypeError}>
              <InputLabel id="languageCode">Selección</InputLabel>
              <Select
                labelId="languageCode"
                id="languageCode"
                label="Escoge el idioma"
                aria-required="true"
                value={languageCode} // Usamos directamente el código de idioma
                onChange={handleLanguageCodeChange}
                ref={languageCodeRef}
              >
                {Object.entries(languageMap).map(([code, name]) => (
                  <MenuItem key={code} value={code}>
                    {name} ({code.toUpperCase()})
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {languageTypeError ? languageTypeHelperText : "Escoge el idioma de plantilla que se va a crear"}
              </FormHelperText>
            </FormControl>
          </Box>

          {/*Etiquetas de plantilla --data-urlencode vertical*/}<Box sx={{ width: '100%', marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormControl fullWidth>
              <FormLabel>
                *Etiquetas de plantilla
              </FormLabel>
            </FormControl>
            <TextField
              fullWidth
              aria-required="true"
              error={etiquetaPlantillaError}
              value={vertical}
              helperText="Defina para qué caso de uso, por ejemplo, actualización de cuenta, OTP, etc, en 2 o 3 palabras"
              onChange={handleVerticalChange}
              inputRef={verticalRef}
            />
          </Box>

          {/* BodyMessage --data-urlencode content */}<Box
            sx={{
              width: "100%",
              marginTop: 2,
              p: 4,
              border: "1px solid #ddd",
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",

            }}
          >
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: "1.1rem", fontWeight: "500", color: "#333" }}>
                *Contenido
              </FormLabel>
            </FormControl>

            {/* Campo de texto con soporte para emojis y variables */}
            <Box sx={{ position: "relative" }}>
              <TextField
                fullWidth
                multiline
                aria-required="true"
                error={contenidoPlantillaTypeError}
                rows={4}
                label="Escribe"
                placeholder="Ingresa el contenido de tu mensaje aquí..."
                value={message}
                onChange={handleBodyMessageChange}
                sx={{
                  mb: 3,
                  mt: 4,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    "&:hover fieldset": {
                      borderColor: "primary.main",
                    }
                  }
                }}
                inputRef={messageRef}
                inputProps={{
                  maxLength: 280, // Esto limita físicamente la entrada
                }}
                helperText={`${message.length}/550 caracteres | ${emojiCount}/10 emojis`}
                FormHelperTextProps={{
                  sx: {
                    textAlign: 'right', // Alinea el contador a la derecha
                    color: message.length === 280 ? 'error.main' : 'text.secondary' // Cambia color si llega al límite
                  }
                }}
              />


              {/* Botones de emojis y acciones en una barra de herramientas mejor diseñada */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  mb: 2,
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: "rgba(0,0,0,0.02)"
                }}
              >
                <Tooltip title="Agregar emojis">
                  <IconButton
                    color="primary"
                    ref={emojiPickerButtonRef}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    sx={{ borderRadius: 1 }}
                  >
                    <Smile size={20} />
                  </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem />

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddVariable}
                  sx={{ borderRadius: 1 }}
                >
                  Agregar Variable
                </Button>

                {variables.length > 0 && (
                  <Button
                    color="error"
                    variant="outlined"
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={deleteAllVariables}
                    sx={{ ml: "auto", borderRadius: 1 }}
                  >
                    Borrar todas
                  </Button>
                )}
              </Stack>

              {/* Selector de emojis */}
              {showEmojiPicker && (
                <Paper
                  ref={emojiPickerRef}
                  elevation={3}
                  sx={{
                    position: "absolute",
                    zIndex: 1000,
                    mt: 1
                  }}
                >
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </Paper>
              )}

              {/* Variables disponibles como chips con campos de texto para ejemplos y descripción */}
              {variables.length > 0 && (
                <Paper
                  sx={{
                    my: 2,
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid #ddd",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                    Agrega una descripción y un ejemplo a tu variable:
                  </Typography>

                  {variables.map((variable, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                        mb: 2,
                        p: 1.5,
                        backgroundColor: "#fff",
                        borderRadius: 1,
                        border: "1px solid #e0e0e0"
                      }}
                    >
                      <Chip
                        label={variable}
                        color="primary"
                        sx={{ fontWeight: "500" }}
                        deleteIcon={
                          <Tooltip title="Borrar variable">
                            <DeleteIcon />
                          </Tooltip>
                        }
                        onDelete={() => deleteVariable(variable)}
                      />

                      <Stack sx={{ flexGrow: 1, gap: 1 }}>
                        <TextField
                          size="small"
                          label="Descripción"
                          placeholder="¿Para qué sirve esta variable?"
                          value={variableDescriptions[variable] || ''}
                          onChange={(e) => handleUpdateDescriptions(variable, e.target.value)}
                          sx={{ flexGrow: 1 }}
                        />

                        <TextField
                          size="small"
                          label="Texto de ejemplo"
                          value={variableExamples[variable] || ''}
                          onChange={(e) => handleUpdateExample(variable, e.target.value)}
                          sx={{ flexGrow: 1 }}
                          inputRef={(el) => (exampleRefs.current[variable] = el)}
                          error={!!variableErrors[variable]}
                          helperText={variableErrors[variable]}
                        />

                      </Stack>
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
          </Box>

          {/* Carrusel - with improvements */}
          <Box sx={{ width: '100%', marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <Box>
              <FormControl fullWidth>
                <FormLabel sx={{ fontSize: "1.1rem", fontWeight: "500", color: "#333", mb: 2 }}>
                  *Carrusel
                </FormLabel>

                <FormLabel sx={{ mb: 2 }}>
                  Agregue medios, botones y descripciones de tarjetas para sus tarjetas de carrusel.
                </FormLabel>

                <TextField
                  id="carousel-type"
                  select
                  label="Tipo de carrusel"
                  value={carouselType}
                  onChange={handleCarouselTypeChange}
                  inputRef={carouselTypeRef}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="IMAGE">Imagen</MenuItem>
                  <MenuItem value="VIDEO">Video</MenuItem>
                  {/* Agrega más opciones si quieres */}

                </TextField>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>


              {/* Segundo Select Cantidad de botones */}
              <TextField
                id="carousel-style"
                select
                label="Cantidad de botones"
                fullWidth
                value={cantidadBotones}
                onChange={handleCantidadChange}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
              </TextField>

              {/* Tercer Select TIPO DE BOTONES */}
              <TextField
                id="carousel-animation"
                select
                label="Tipo de botones"
                fullWidth
                value={tipoBoton}
                onChange={handleTipoBotonChange}
              >
                <MenuItem value="QUICK_REPLY">Respuesta rápida</MenuItem>
                <MenuItem value="URL">Link</MenuItem>
                <MenuItem value="PHONE_NUMBER">Teléfono</MenuItem>
              </TextField>


            </Box>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="cards">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {cards.map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps}>
                            <Accordion expanded={expanded === card.id} onChange={handleChange(card.id)}
                              sx={{
                                mb: 2,
                                transition: 'all 0.3s ease'

                              }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`${card.id}-content`}
                                id={`${card.id}-header`}
                                sx={{
                                  '& .MuiAccordionSummary-content': {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%',
                                    backgroundColor: '#f4fdff', // Color de fondo del encabezado
                                    borderTop: '3px solid #f4fdff', // Ejemplo de borde superior con el mismo color

                                  },
                                  cursor: 'default'
                                }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    cursor: 'grab',
                                    '&:active': {
                                      cursor: 'grabbing'
                                    }
                                  }}
                                  {...provided.dragHandleProps}
                                >
                                  <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                  {/* Usamos el índice + 1 para mostrar el número correcto en el título */}
                                  <Typography>Tarjeta {index + 1}</Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={(e) => deleteAccordion(card.id, e)}
                                  sx={{ ml: 2 }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Box component="form" sx={{ '& .MuiTextField-root': { mb: 2, width: '100%' } }}>
                                  {/*<FileUploadCarousel
                                    initialFile={card.fileData}  // <- Archivo actual de la API
                                    onUploadSuccess={(nuevosDatos) => {
                                      // Actualiza el estado reemplazando el archivo viejo
                                      handleFileUpload(card.id, nuevosDatos);
                                    }}
                                  />*/}
                                  <FileUploadCarousel
                                    carouselType={carouselType}
                                    onUploadSuccess={(uploadData) => {

                                      handleFileUpload(card.id, uploadData);
                                    }}
                                  />




                                  <Box sx={{ position: "relative" }}>
                                    <TextField
                                      fullWidth
                                      multiline
                                      rows={4}
                                      label="Escribe"
                                      placeholder="Ingresa el contenido de tu mensaje aquí..."
                                      value={card.messageCard}
                                      onChange={(e) => handleBodyMessageCardChange(e, card.id)}
                                      inputRef={(el) => (messageCardRefs.current[card.id] = el)}
                                      inputProps={{ maxLength: 280 }}
                                      helperText={`${card.messageCard.length}/280 caracteres | ${card.emojiCountCard || 0}/10 emojis`}
                                      FormHelperTextProps={{
                                        sx: {
                                          textAlign: 'right',
                                          color: card.messageCard.length === 280 ? 'error.main' : 'text.secondary'
                                        }
                                      }}
                                      sx={{
                                        mb: 3,
                                        mt: 4,
                                        "& .MuiOutlinedInput-root": {
                                          borderRadius: 1.5,
                                          "&:hover fieldset": {
                                            borderColor: "primary.main",
                                          }
                                        }
                                      }}
                                    />


                                    {/* Botones de emojis y acciones en una barra de herramientas mejor diseñada */}
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      sx={{
                                        mb: 2,
                                        p: 1,
                                        borderRadius: 1,
                                        backgroundColor: "rgba(0,0,0,0.02)"
                                      }}
                                    >
                                      <Tooltip title="Agregar emojis">
                                        <IconButton
                                          color="primary"
                                          ref={emojiPickerButtonRef}
                                          onClick={() => setShowEmojiPickerCards(!showEmojiPickerCards)}
                                          sx={{ borderRadius: 1 }}
                                        >
                                          <Smile size={20} />
                                        </IconButton>
                                      </Tooltip>

                                      <Divider orientation="vertical" flexItem />

                                      {/*<Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() => handleAddVariableCard(card.id)}
                                        sx={{ borderRadius: 1 }}
                                      >
                                        Agregar Variable
                                      </Button> */}

                                      {card.variablesCard.length > 0 && (
                                        <Button
                                          color="error"
                                          variant="outlined"
                                          size="small"
                                          startIcon={<ClearIcon />}
                                          onClick={() => deleteAllVariablesCard(card.id)}
                                          sx={{ ml: "auto", borderRadius: 1 }}
                                        >
                                          Borrar todas
                                        </Button>
                                      )}
                                    </Stack>

                                    {/* Selector de emojis */}
                                    {showEmojiPickerCards && (
                                      <Paper
                                        ref={emojiPickerCardRef}
                                        elevation={3}
                                        sx={{
                                          position: "absolute",
                                          zIndex: 1000,
                                          mt: 1
                                        }}
                                      >
                                        <EmojiPicker onEmojiClick={(emoji) => handleEmojiClickCarousel(emoji, card.id)} />

                                      </Paper>
                                    )}

                                    {/* Variables disponibles como chips con campos de texto para ejemplos y descripción */}
                                    {card.variablesCard.length > 0 && (
                                      <Paper
                                        sx={{
                                          my: 2,
                                          p: 2,
                                          borderRadius: 2,
                                          border: "1px solid #ddd",
                                        }}
                                      >
                                        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                                          Agrega una descripción y un ejemplo a tu variable:
                                        </Typography>

                                        {card.variablesCard.map((variableCard, index) => (
                                          <Box
                                            key={index}
                                            sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              flexWrap: 'wrap',
                                              gap: 2,
                                              mb: 2,
                                              p: 1.5,
                                              backgroundColor: "#fff",
                                              borderRadius: 1,
                                              border: "1px solid #e0e0e0"
                                            }}
                                          >
                                            <Chip
                                              label={variableCard}
                                              color="primary"
                                              sx={{ fontWeight: "500" }}
                                              deleteIcon={
                                                <Tooltip title="Borrar variable">
                                                  <DeleteIcon />
                                                </Tooltip>
                                              }
                                              onDelete={() => deleteVariableCard(card.id, variableCard)}
                                            />

                                            <Stack sx={{ flexGrow: 1, gap: 1 }}>
                                              <TextField
                                                size="small"
                                                label="Descripción"
                                                placeholder="¿Para qué sirve esta variable?"
                                                value={card.variableDescriptions?.[variableCard] || ''}
                                                onChange={(e) => handleUpdateDescriptionsCard(card.id, variableCard, e.target.value)}
                                                sx={{ flexGrow: 1 }}
                                              />

                                              <TextField
                                                size="small"
                                                label="Texto de ejemplo"
                                                value={card.variableExamples?.[variableCard] || ''}
                                                onChange={(e) => handleUpdateExampleCard(card.id, variableCard, e.target.value)}
                                                sx={{ flexGrow: 1 }}
                                                inputRef={(el) => (exampleCardRefs.current[variableCard] = el)}
                                                error={!!variableErrorsCard[variableCard]}
                                                helperText={variableErrorsCard[variableCard]}
                                              />

                                            </Stack>
                                          </Box>
                                        ))}
                                      </Paper>
                                    )}
                                  </Box>

                                </Box>
                                <Stack spacing={2}>
                                  {card.buttons.map((button, index) => (
                                    <Box
                                      key={button.id}
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        border: "1px solid #ccc",
                                        borderRadius: 2,
                                        p: 2,
                                        backgroundColor: "#f9f9f9",
                                      }}
                                    >
                                      {/* Campo de texto para el título del botón */}
                                      <TextField
                                        label="Titulo del botón"
                                        value={button.title}
                                        onChange={(e) => updateButton(button.id, "title", e.target.value)}
                                        fullWidth
                                      />

                                      {/* Selector de tipo de botón */}
                                      <Select
                                        value={button.type}
                                        onChange={(e) => updateButton(button.id, "type", e.target.value)}
                                        sx={{ minWidth: 150 }}
                                        disabled
                                      >
                                        <MenuItem value="QUICK_REPLY">Respuesta rápida</MenuItem>
                                        <MenuItem value="URL">URL</MenuItem>
                                        <MenuItem value="PHONE_NUMBER">Número de teléfono</MenuItem>
                                      </Select>

                                      {/* Campo adicional según el tipo de botón */}
                                      {button.type === "URL" && (
                                        <TextField
                                          label="URL"
                                          value={button.url || ''}
                                          onChange={(e) => updateButtonWithValidation(
                                            button.id,
                                            "url",
                                            e.target.value,
                                            setButtons,
                                            setValidationErrors
                                          )}
                                          fullWidth
                                          error={validationErrors[button.id] !== undefined}
                                          helperText={validationErrors[button.id]}
                                        />
                                      )}

                                      {button.type === "PHONE_NUMBER" && (
                                        <TextField
                                          label="Phone Number"
                                          value={button.phoneNumber}
                                          onChange={(e) => updateButton(button.id, "phoneNumber", e.target.value)}
                                          fullWidth
                                        />
                                      )}

                                      {/* Icono según el tipo de botón */}
                                      {button.type === "QUICK_REPLY" && <ArrowForward />}
                                      {button.type === "URL" && <Link />}
                                      {button.type === "PHONE_NUMBER" && <Phone />}

                                      {/* Botón para eliminar */}
                                      <IconButton color="error" onClick={() => removeButton(button.id)}>
                                        <Delete />
                                      </IconButton>
                                    </Box>
                                  ))}
                                </Stack>
                              </AccordionDetails>
                            </Accordion>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addAccordion}
              sx={{ mt: 2 }}

            >
              Añadir tarjeta
            </Button>
          </Box>

          {/*Boton Guardar Plantilla*/}<Box sx={{ display: "flex", justifyContent: "flex-end", p: 2, mb: 20 }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={iniciarRequest}
              sx={{ mt: 3, mb: 3 }}
            >
              Enviar solicitud
            </Button>
          </Box>

          {/* Diálogo de éxito */}
          <CustomDialog
            open={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            title="¡Éxito!"
            message="La plantilla fue editada correctamente."
            severity="success"
            buttonVariant="contained"
          />

          {/* Diálogo de error */}
          <CustomDialog
            open={showErrorModal}
            onClose={() => setShowErrorModal(false)}
            title="Error al crear plantilla"
            message={errorMessageGupshup}
            severity="error"
            buttonVariant="contained"
          />
        </Box>
      </Grid>

      {/* Preview (30%) */}
      <Grid item xs={4}>
        <Box sx={{ position: "sticky", top: 0, height: "100vh", mt: 2, borderRadius: 2 }}>
          <Box
            sx={{
              p: 3,
              bgcolor: "#fef9f3",
              height: "100%",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Vista previa
            </Typography>

            {/* Mensaje de WhatsApp */}
            <Box
              sx={{
                bgcolor: "#ffffff",
                p: 1,
                borderRadius: 2,
                alignSelf: "flex",
                maxWidth: "100%",
                display: "block",
                flexDirection: "column",
                gap: 0.5,
                boxShadow: 1,
              }}
            >
              <Typography variant="body1" color="text.primary" sx={{ fontFamily: "Helvetica Neue, Arial, sans-serif", whiteSpace: "pre-line" }}>
                {message}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "flex-end" }}>
                {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: true })}
              </Typography>

            </Box>

            <Swiper
              modules={[Pagination]}
              effect={'coverflow'}
              spaceBetween={10}
              slidesPerView={2}
              centeredSlides={false}
              pagination={{ clickable: true }}
              style={{ width: '100%' }}
            >
              {cards.map((card) => (
                <SwiperSlide key={card.id}>
                  <Card sx={{
                    Width: '350px',
                    height: '450px',
                    margin: 'auto',
                    my: 2,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Delete button positioned top right */}
                    {card.id !== 'initial-card' && (
                      <IconButton
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          zIndex: 2,
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                          }
                        }}
                        onClick={() => handleRemoveCard(card.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}

                    <Box sx={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                      {(card.fileData && card.fileData.url) ? (
                        <CardMedia
                          component="img"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          image={card.fileData.url}
                          alt={card.title}
                        />
                      ) : (
                        <Box sx={{
                          height: '100%',
                          width: '100%',
                          bgcolor: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Typography variant="body2" color="text.secondary">Sin imagen</Typography>
                        </Box>
                      )}
                    </Box>


                    {/* Contenedor de texto con altura fija */}
                    <CardContent sx={{ pt: 2, pb: 1, height: '120px', overflow: 'auto' }}>
                      <Typography variant="body2" color="text.secondary" sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {card.messageCard || "Descripción de la tarjeta"}
                      </Typography>
                    </CardContent>

                    {/* Contenedor de botones con altura fija - MODIFICADO */}
                    <Box sx={{
                      mt: 'auto', // Empuja los botones hacia abajo
                      width: '100%', // Asegura que ocupe todo el ancho
                      display: 'flex',
                      flexDirection: 'column',
                      px: 0 // Quita el padding horizontal
                    }}>
                      <Stack spacing={0} sx={{ width: '100%' }}>
                        {card.buttons.map((button, index) => (
                          <Box
                            key={button.id}
                            sx={{
                              width: '100%',
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
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
                            <Box sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1
                            }}>
                              {button.type === "QUICK_REPLY" && (
                                <ArrowForward sx={{ fontSize: "16px", color: "#075e54" }} />
                              )}
                              {button.type === "URL" && (
                                <Link sx={{ fontSize: "16px", color: "#075e54" }} />
                              )}
                              {button.type === "PHONE_NUMBER" && (
                                <Phone sx={{ fontSize: "16px", color: "#075e54" }} />
                              )}
                              <Typography variant="body1" sx={{ fontWeight: "medium", color: "#075e54", fontSize: "14px", textAlign: "center" }}>
                                {button.title || button.text}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>


        </Box>

      </Grid>
    </Grid>


  );
};

export default EditTemplateFormCarousel;