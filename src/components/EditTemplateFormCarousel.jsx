import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Accordion, AccordionSummary, AccordionDetails, Alert, Box, Button, Checkbox, Card, CardActions, CardContent, CardMedia, Chip, Container, Dialog, DialogTitle, DialogContent, DialogActions, Divider, FormControl, FormControlLabel, FormLabel, FormHelperText, Grid, Grid2, IconButton, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, Snackbar, Stack, TextField, Tooltip, Typography, alpha } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';

import { Smile } from "react-feather";
import EmojiPicker from "emoji-picker-react";

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
import { eliminarParametrosPlantilla, obtenerPantallasMedia, obtenerParametros, obtenerOpcionesParametro, saveTemplateParams } from '../api/templatesGSApi';
import { useClickOutside } from '../utils/emojiClick';

import { CustomDialog } from '../utils/CustomDialog';

const EditTemplateFormCarousel = () => {


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

  const location = useLocation();
  const navigate = useNavigate();
  const templateData = location.state?.template.gupshup || {};
  const [modoEdicionActiva, setModoEdicionActiva] = useState(false);
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

  const [languageCode, setLanguageCode] = useState("es");
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


  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showEmojiPickerCards, setShowEmojiPickerCards] = useState(false);
  const [variables, setVariables] = useState([]);
  const [variablesCard, setVariablesCard] = useState([]);


  const [variableExamples, setVariableExamples] = useState({});
  const [variableExamplesError, setvariableExamplesError] = useState(false);
  const [variableExamplesHelperText, setvariableExamplesHelperText] = useState("");
  const [variableErrors, setVariableErrors] = useState({});


  const [variableExamplesCard, setVariableExamplesCard] = useState({});
  const [variableExamplesErrorCard, setvariableExamplesErrorCard] = useState(false);
  const [variableExamplesHelperTextCard, setvariableExamplesHelperTextCard] = useState("");
  const [variableErrorsCard, setVariableErrorsCard] = useState({});


  const [variableDescriptions, setVariableDescriptions] = useState({});
  const [variableDescriptionsError, setvariableDescriptionsError] = useState(false);
  const [variableDescriptionsHelperText, setvariableDescriptionsHelperText] = useState("");

  const [variableDescriptionsCard, setVariableDescriptionsCard] = useState({});
  const [variableDescriptionsErrorCard, setvariableDescriptionsErrorCard] = useState(false);
  const [variableDescriptionsHelperTextCard, setvariableDescriptionsHelperTextCard] = useState("");


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
  const emojiPickerButtonRef = useRef(null);
  const emojiPickerComponentRef = useRef(null);

  const [emojiCount, setEmojiCount] = useState(0);

  const [variableTypes, setVariableTypes] = useState({});
  const [variableLists, setVariableLists] = useState({});
  const [editingOption, setEditingOption] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const listInputRefs = useRef({});


  useEffect(() => {
    const loadData = async () => {
      if (templateData) {
        setTemplateName(templateData.elementName || "");
        setSelectedCategory(templateData.category || "");
        setTemplateType(templateData.templateType || "");
        setLanguageCode(templateData.languageCode || "");
        setVertical(templateData.vertical || "");
        setIdTemplate(templateData.id);


        if (templateData.containerMeta) {
          try {
            const meta = JSON.parse(templateData.containerMeta);

            setMessage(meta.data || "");
            setExample(meta.sampleText || "");

            if (meta.cards && meta.cards.length > 0) {
              setCarouselType(meta.cards[0].headerType);
              if (meta.cards[0].buttons && meta.cards[0].buttons.length > 0) {
                setCantidadBotones(String(meta.cards[0].buttons.length));
                setTipoBoton(meta.cards[0].buttons[0].type || "QUICK_REPLY");
              }

              const destructuredCards = meta.cards.map((card, index) => {
                return {
                  id: `card-${index}`,
                  messageCard: card.body || "",
                  variablesCard: [],
                  variableDescriptions: {},
                  variableExamples: {},
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
          setIdPlantilla(info.id_plantilla || "");
        }
      } catch (error) {

      }
    };

    loadData();
  }, [templateData, urlTemplatesGS]);


  useEffect(() => {
    const loadParametros = async () => {
      if (!idPlantilla) return;

      try {
        const infoParametros = await obtenerParametros(urlTemplatesGS, idPlantilla);

        if (infoParametros === null || infoParametros.length === 0) {
          // Sin parámetros
        } else {
          const parametrosOrdenados = infoParametros.sort((a, b) => a.ORDEN - b.ORDEN);
          const variablesFormateadas = parametrosOrdenados.map((param, index) => `{{${index + 1}}}`);

          setVariables(variablesFormateadas);

          const descripcionesIniciales = {};
          const ejemplosIniciales = {};
          const tiposIniciales = {};
          const listasIniciales = {};

          // Procesar cada parámetro
          for (let index = 0; index < parametrosOrdenados.length; index++) {
            const param = parametrosOrdenados[index];
            const variableKey = `{{${index + 1}}}`;

            descripcionesIniciales[variableKey] = param.NOMBRE;
            tiposIniciales[variableKey] = 'normal';

            // Verificar si es una lista de opciones
            if (esListaOpciones(param.ID_PLANTILLA_TIPO_DATO)) {
              try {
                const opciones = await obtenerOpcionesParametro(
                  urlTemplatesGS,
                  param.ID_PLANTILLA_PARAMETRO
                );

                if (opciones && opciones.length > 0) {
                  // Establecer tipo como 'list'
                  tiposIniciales[variableKey] = 'list';

                  // Ordenar opciones por ORDEN y extraer los nombres
                  const opcionesOrdenadas = opciones
                    .sort((a, b) => a.ORDEN - b.ORDEN)
                    .map(opcion => opcion.NOMBRE);

                  listasIniciales[variableKey] = opcionesOrdenadas;
                } else {
                  ejemplosIniciales[variableKey] = param.PLACEHOLDER || '';
                }
              } catch (error) {
                console.error(`Error cargando opciones para ${variableKey}:`, error);
                ejemplosIniciales[variableKey] = param.PLACEHOLDER || '';
              }
            } else {
              ejemplosIniciales[variableKey] = param.PLACEHOLDER || '';
            }
          }

          setVariableDescriptions(descripcionesIniciales);
          setVariableExamples(ejemplosIniciales);
          setVariableTypes(tiposIniciales);
          setVariableLists(listasIniciales);
        }
      } catch (error) {
        console.error("Error en loadParametros:", error);
      }
    };

    loadParametros();
  }, [idPlantilla, urlTemplatesGS]);

  const esListaOpciones = (tipoData) => {
    return tipoData === 5;
  };

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

  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessageGupshup, setErrorMessageGupshup] = useState("La plantilla no pudo ser creada.");

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };


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


    } else {

    }

    if (!templateType || templateType.trim() === "") {

      setTemplateTypeError(true);
      setTemplateTypeHelperText("Este campo es requerido");
      isValid = false;
      if (templateTypeRef.current) templateTypeRef.current.focus();


    } else {

    }

    if (!languageCode || languageCode.trim() === "") {

      setLanguageTypeError(true);
      setLanguageTypeHelperText("Este campo es requerido");
      isValid = false;
      if (languageCodeRef.current) languageCodeRef.current.focus();


    } else {

    }

    if (!vertical || vertical.trim() === "") {

      setetiquetaPlantillaError(true);
      isValid = false;
      if (verticalRef.current) verticalRef.current.focus();


    } else {

    }

    if (!message || message.trim() === "") {

      setcontenidoPlantillaTypeError(true);
      setcontenidoPlantillaTypeHelperText("Este campo es requerido");
      isValid = false;
      if (messageRef.current) messageRef.current.focus();


    } else {

    }

    if (!example || example.trim() === "") {

      setejemploPlantillaError(true);
      setejemploPlantillaHelperText("Este campo es requerido");
      isValid = false;
      if (exampleRef.current) exampleRef.current.focus();


    } else {

    }

    if (!selectedCategory || selectedCategory.trim() === "") {

      setcategoriaPlantillaError(true);
      setcategoriaPlantillaHelperText("Este campo es requerido");
      isValid = false;
      if (selectedCategoryRef.current) selectedCategoryRef.current.focus();


    } else {

    }


    if (variables.length > 0) {
      const newErrors = {};
      for (const variable of variables) {
        if (variableTypes[variable] !== 'list' && !variableExamples[variable]?.trim()) {
          isValid = false;
          newErrors[variable] = "Este campo es requerido";
          if (exampleRefs.current[variable]) {
            exampleRefs.current[variable].focus();
          }
        } else {
          newErrors[variable] = "";
        }
      }
      setVariableErrors(newErrors);
      if (!isValid) {
      } else {
      }
    } else {
    }
    return isValid;
  };

  const getMediaType = (url) => {
    const extension = url.split('.').pop().toLowerCase();

    if (['png', 'jpeg', 'jpg', 'gif'].includes(extension)) {
      return 'IMAGE';
    } else if (['mp4', '3gp', 'mov', 'avi'].includes(extension)) {
      return 'VIDEO';
    } else if (['txt', 'xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'pdf'].includes(extension)) {
      return 'DOCUMENT';
    } else {
      return 'null';
    }
  };

  const iniciarRequest = async () => {
    try {
      if (!cards || cards.length === 0) {
        console.error("No hay tarjetas disponibles");
        return;
      }
      const formattedCards = formatCardsForGupshup(cards);
      const isValid = formattedCards.every(card =>
        card.mediaUrl && card.body
      );

      if (!isValid) {
        console.error("Algunas cards no tienen todos los datos requeridos");
        console.error(formattedCards);
        return;
      }

      const cardsToSendArray = [...cards];
      const cardsToSend = JSON.stringify([...cards]);

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
          carousel: JSON.stringify(formattedCards)
        },
        idTemplate,
        validateFields
      );

      /*const result = {
        status: "success",
        template: {
          id: "e885dbea-06e5-433d-82b6-6391e6d76ae9" // Puedes poner cualquier ID de prueba aquí
        }
      };*/

      if (result && result.status === "success") {

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


  const pantallasTalkMe = [
    '4 - Broadcast'
  ];


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


  const handleTemplateNameChange = (event) => {

    const newValue = event.target.value.replace(/\s+/g, '_');


    setTemplateName(newValue);


    if (newValue.trim() === "") {
      setTemplateNameError(true);
      setTemplateNameHelperText("Este campo es requerido");
    } else {
      setTemplateNameError(false);
      setTemplateNameHelperText("");
    }
  };


  const handleLanguageCodeChange = (event) => {
    const selectedLanguage = event.target.value;
    setLanguageCode(selectedLanguage);

    if (selectedLanguage.trim() === "") {
      setLanguageTypeError(true);
      setLanguageTypeHelperText("Este campo es requerido");
    } else {
      setLanguageTypeError(false);
      setLanguageTypeHelperText("");
    }
  };

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


  const handleVerticalChange = (event) => {
    setVertical(event.target.value)
  }


  const handleTemplateTypeChange = (event) => {
    const newType = event.target.value;
    setTemplateType(newType);


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


  const handleCarouselTypeChange = (event) => {
    setCarouselType(event.target.value)
  }

  const handleHeaderTemplateTypeChange = (event) => {
    setTemplateType(event.target.value);
    setHeader('');
  };

  const handleHeaderTypeChange = (event) => {
    const value = event.target.value;
    if (value.length <= charLimit) {
      setHeader(value);
    }
  };

  const [mediaType, setMediaType] = useState("");
  const [mediaURL, setMediaURL] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const MAX_IMG_SIZE = 5 * 1024 * 1024;
  const [error, setError] = useState('');

  const handleMediaTypeChange = (event) => {
    setMediaType(event.target.value);
  };

  const handleCloseError = () => {
    setError('');
  };

  const handleMediaURLChange = (event) => {
    setMediaURL(event.target.value);
  };

  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.size > MAX_IMG_SIZE) {
      setError('El archivo es demasiado grande. El tamaño máximo permitido es 5 MB.');
      setSelectedFile(null);
    } else {
      setError('');
      setSelectedFile(selectedFile);
    }
  };

  const handleHeaderChange = (e) => {
    if (e.target.value.length <= charLimit) {
      setHeader(e.target.value)
    }

  };

  const handleFooterChange = (e) => {
    if (e.target.value.length <= charLimit) {
      setFooter(e.target.value);
    }
  };

  const charLimit = 60;
  const maxButtons = 3;


  const addButton = () => {
    if (buttons.length < maxButtons) {
      setButtons([
        ...buttons,
        { id: Date.now(), type: "QUICK_REPLY", title: "", url: "", phoneNumber: "" }
      ]);
    }
  };

  const updateButtonsInAllCards = (newButtons) => {
    setCards(prevCards =>
      prevCards.map(card => ({
        ...card,
        buttons: [...newButtons]
      })))
  };

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

  const handleBodyMessageChange = (e) => {
    const newValue = event.target.value;
    setMessage(newValue);

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

    if (emojiCount > maxEmojis) {

      if (countEmojis(message) <= maxEmojis) {
        Swal.fire({
          title: 'Límite de emojis',
          text: 'Solo puedes incluir un máximo de 10 emojis',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00c3ff'
        });
      }
      return;
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

      setMessage(newText);

      setEmojiCount(emojiCount);


      const deletedVariables = [];
      variables.forEach(variable => {
        if (!newText.includes(variable)) {
          deletedVariables.push(variable);
        }
      });


      if (deletedVariables.length > 0) {

        const remainingVariables = variables.filter(v => !deletedVariables.includes(v));


        setVariables(remainingVariables);


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


    if (newEmojiCount > maxEmojis) {

      if (countEmojis(message) > maxEmojis) {
        Swal.fire({
          title: 'Límite de emojis',
          text: 'Solo puedes incluir un máximo de 10 emojis',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00c3ff'
        });
      }
      return;
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


        const currentVariables = card.variablesCard || [];


        const deletedVariables = currentVariables.filter(
          variable => !newText.includes(variable)
        );

        const remainingVariables = currentVariables.filter(
          v => !deletedVariables.includes(v)
        );


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

  const handleAddVariableCard = (cardId) => {
    setCards(prevCards =>
      prevCards.map(card => {
        if (card.id !== cardId) return card;

        const newVariable = `{{${card.variablesCard.length + 1}}}`;

        const textFieldRef = messageCardRefs.current[cardId];
        const cursorPosition = textFieldRef?.selectionStart || 0;

        const textBefore = card.messageCard.substring(0, cursorPosition);
        const textAfter = card.messageCard.substring(cursorPosition);

        const newMessageCard = `${textBefore}${newVariable}${textAfter}`;


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


        const newEmojiCountCard = countEmojis(newText);


        if (newEmojiCountCard > 10) {

          Swal.fire({
            title: 'Límite de emojis',
            text: 'Solo puedes incluir un máximo de 10 emojis',
            icon: 'warning',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#00c3ff'
          });
          setShowEmojiPickerCards(false);


          setTimeout(() => {
            if (input) {
              input.focus();
              input.setSelectionRange(cursor, cursor);
            }
          }, 100);

          return card;
        }


        return {
          ...card,
          messageCard: newText,
          emojiCountCard: newEmojiCountCard
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

  const deleteVariableCard = (cardId, variableToDelete) => {
    setCards(prevCards =>
      prevCards.map(card => {
        if (card.id !== cardId) return card;


        const newMessage = card.messageCard.replace(variableToDelete, '');


        const updatedVariables = card.variablesCard.filter(v => v !== variableToDelete);


        const renumberedVariables = [];
        const variableMapping = {};

        updatedVariables.forEach((v, index) => {
          const newVar = `{{${index + 1}}}`;
          renumberedVariables.push(newVar);
          variableMapping[v] = newVar;
        });


        let updatedMessage = newMessage;
        Object.entries(variableMapping).forEach(([oldVar, newVar]) => {
          updatedMessage = updatedMessage.replaceAll(oldVar, newVar);
        });


        const newVariableDescriptions = { ...card.variableDescriptions };
        const newVariableExamples = { ...card.variableExamples };
        const newVariableErrors = { ...card.variableErrors };


        delete newVariableDescriptions[variableToDelete];
        delete newVariableExamples[variableToDelete];
        delete newVariableErrors[variableToDelete];


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


  const generateExample = () => {
    let generatedExample = message;
    Object.keys(variableExamples).forEach(variable => {
      generatedExample = generatedExample.replace(new RegExp(variable, 'g'), variableExamples[variable]);
    });
    return generatedExample;
  };


  const replaceVariables = (text, variables) => {
    let result = text;


    Object.keys(variables).forEach(variable => {
      const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');

      result = result.replace(regex, variables[variable]);
    });


    return result;
  };


  const generateId = () => Math.random().toString(36).substr(2, 9);




  useEffect(() => {



    const newExample = replaceVariables(message, variableExamples);



    setExample(newExample);
  }, [message, variableExamples]);

  useEffect(() => {

    const handleClickOutside = (event) => {

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





  const updateButtonWithValidation = (id, field, value, setButtons, setValidationErrors) => {

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



      let mediaUrl = '';
      if (card.fileData && card.fileData.url) {
        mediaUrl = card.fileData.url;
      }





      return {
        headerType: "IMAGE",
        mediaUrl: mediaUrl,
        mediaId: card.fileData?.mediaId || null,
        exampleMedia: null,
        body: card.messageCard || "",
        sampleText: card.variableExamples?.messageCard || card.messageCard || "",
        buttons: transformedButtons
      };
    });
  };

  const [accordions, setAccordions] = useState([
  ]);

  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleFormChange = (id, field, value) => {
    setAccordions(accordions.map(accordion =>
      accordion.id === id ? { ...accordion, [field]: value } : accordion
    ));
  };

  const addAccordion = () => {

    if (cards.length >= 10) {
      alert("No puedes tener más de 10 acordeones");
      return;
    }

    const cantidad = parseInt(cantidadBotones, 10);
    const nuevaCard = {
      ...initialCardState,
      id: uuidv4(),
      buttons: generarBotones(cantidad, tipoBoton)
    };
    setCards([...cards, nuevaCard]);
  };

  const deleteAccordion = (id, e) => {
    e.stopPropagation();
    setCards(cards.filter(card => card.id !== id));
  };

  const updateCardField = (cardId, field, value) => {
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, [field]: value } : card
    ));
  };

  const generarBotones = (cantidad, tipo) => {
    const botones = [];
    for (let i = 0; i < cantidad; i++) {
      botones.push({
        id: generateId(),
        title: `Botón ${i + 1}`,
        type: tipo,
        ...(tipo === 'URL' && { url: '' }),
        ...(tipo === 'PHONE_NUMBER' && { phoneNumber: '' })
      });
    }
    return botones;
  };





  const onDragEnd = (result) => {

    if (!result.destination) return;

    const items = Array.from(accordions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setAccordions(items);
  };


  const initialCardState = {
    id: uuidv4(),
    carouselType: "IMAGEN",
    messageCard: "",
    variablesCard: [],
    variableDescriptionsCard: {},
    variableExamples: {},
    buttons: [],
    file: null
  };


  const [cards, setCards] = useState([initialCardState]);

  const currentCardId = cards[0].id;




  const handleFileUpload = (cardId, uploadResponse) => {


    if (uploadResponse) {

      const fileData = {
        url: uploadResponse.url,
        mediaId: uploadResponse.mediaId || null
      };



      setCards(prevCards => prevCards.map(card => {
        if (card.id === cardId) {
          return {
            ...card,
            fileData: fileData
          };
        }
        return card;
      }));
    } else {
      console.error("No se recibió respuesta de subida válida");
    }
  };


  const countEmojis = (text) => {

    const emojiRegex = /(\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*)/gu;
    const matches = text.match(emojiRegex);
    return matches ? matches.length : 0;
  };

  const handlePantallas = (event) => {
    const { target: { value } } = event;


    const selectedOptions = typeof value === 'string' ? value.split(',') : value;


    const numericValues = selectedOptions.map(option => {
      return option.split(' - ')[0].trim();
    });


    setPantallas(numericValues.join(','));


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

  const getDuplicateDescriptions = (descriptions) => {
    const descriptionCounts = {};
    const duplicates = new Set();


    Object.entries(descriptions).forEach(([variable, description]) => {
      if (description && description.trim()) {
        const cleanDesc = description.trim().toLowerCase();
        if (descriptionCounts[cleanDesc]) {
          descriptionCounts[cleanDesc].push(variable);
          duplicates.add(cleanDesc);
        } else {
          descriptionCounts[cleanDesc] = [variable];
        }
      }
    });


    const duplicateVariables = new Set();
    duplicates.forEach(desc => {
      descriptionCounts[desc].forEach(variable => {
        duplicateVariables.add(variable);
      });
    });

    return duplicateVariables;
  };

  const duplicateVariables = getDuplicateDescriptions(variableDescriptions);

  // BOTON AGREGAR VARIABLE
  const handleAddVariable = () => {
    const newVariable = `{{${variables.length + 1}}}`;

    if (message.length + newVariable.length > 550) {
      Swal.fire({
        title: 'Limite de caracteres',
        text: 'No se pueden agregar más variables porque excede el máximo de 550 caracteres',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#00c3ff'
      });
      return;
    }

    const cursorPosition = messageRef.current.selectionStart;
    const textBeforeCursor = message.substring(0, cursorPosition);
    const textAfterCursor = message.substring(cursorPosition);

    const newMessage = `${textBeforeCursor}${newVariable}${textAfterCursor}`;
    setMessage(newMessage);

    setVariables([...variables, newVariable]);

    setTimeout(() => {
      const newPosition = cursorPosition + newVariable.length;
      messageRef.current.focus();
      messageRef.current.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // BOTON BORRAR VARIABLES
  const deleteAllVariables = () => {
    let newMessage = message;
    variables.forEach(variable => {
      newMessage = newMessage.replaceAll(variable, '');
    });
    setMessage(newMessage);
    setVariables([]);
    setVariableDescriptions({});
    setVariableExamples({});
    setVariableErrors({});
    exampleRefs.current = {};

    messageRef.current?.focus();
  };

  // BOTON PARA BORRAR UNA VARIABLE EN ESPECIFICO
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

  // ACTUALIZA LA DESCRIPCION DE LA VARIABLE
  const handleUpdateDescriptions = (variable, event) => {
    const newValue = event.target.value.replace(/\s+/g, '_');
    setVariableDescriptions(prevDescriptions => ({
      ...prevDescriptions,
      [variable]: newValue
    }));
  };

  // ACTUALIZA EL EJEMPLO DE LA VARIABLE
  const handleUpdateExample = (variable, value) => {
    setVariableExamples(prevExamples => {
      const updatedExamples = { ...prevExamples, [variable]: value };

      return updatedExamples;
    });
  };

  // Función para actualizar el tipo de variable
  const handleUpdateVariableType = (variable, type) => {
    setVariableTypes(prev => ({
      ...prev,
      [variable]: type
    }));

    // Limpiar datos según el tipo
    if (type === 'list') {
      setVariableExamples(prev => {
        const newExamples = { ...prev };
        delete newExamples[variable];
        return newExamples;
      });
    } else {
      setVariableLists(prev => {
        const newLists = { ...prev };
        delete newLists[variable];
        return newLists;
      });
    }
  };

  // Función para agregar opción a la lista
  const handleAddListOption = (variable, option) => {
    if (!option.trim()) return;

    setVariableLists(prev => ({
      ...prev,
      [variable]: [...(prev[variable] || []), option.trim()]
    }));
  };

  // Función para eliminar opción de la lista
  const handleDeleteListOption = (variable, optionIndex) => {
    setVariableLists(prev => ({
      ...prev,
      [variable]: prev[variable].filter((_, index) => index !== optionIndex)
    }));
  };

  // Función para iniciar edición de opción
  const handleStartEditOption = (variable, index, currentValue) => {
    setEditingOption({
      variable,
      index,
      value: currentValue
    });
  };

  // Función para guardar edición de opción
  const handleSaveOptionEdit = (variable, index) => {
    if (editingOption && editingOption.value.trim()) {
      const newLists = { ...variableLists };
      newLists[variable][index] = editingOption.value.trim();
      setVariableLists(newLists);
    }
    setEditingOption(null);
  };

  // Funciones para drag & drop
  const handleDragStart = (e, variable, index) => {
    setDraggedItem({ variable, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, variable, targetIndex) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.variable !== variable) {
      setDraggedItem(null);
      return;
    }

    const sourceIndex = draggedItem.index;

    if (sourceIndex === targetIndex) {
      setDraggedItem(null);
      return;
    }

    const newLists = { ...variableLists };
    const items = [...newLists[variable]];
    const [removed] = items.splice(sourceIndex, 1);
    items.splice(targetIndex, 0, removed);

    newLists[variable] = items;
    setVariableLists(newLists);
    setDraggedItem(null);
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
                    border: categoriaPlantillaError && !selectedCategory ? "1px solid red" : "none",
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
                value={languageCode}
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
                  maxLength: 280,
                }}
                helperText={`${message.length}/550 caracteres | ${emojiCount}/10 emojis`}
                FormHelperTextProps={{
                  sx: {
                    textAlign: 'right',
                    color: message.length === 280 ? 'error.main' : 'text.secondary'
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
                        alignItems: 'flex-start',
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
                        sx={{ fontWeight: "500", mt: 1 }}
                        deleteIcon={
                          <Tooltip title="Borrar variable">
                            <DeleteIcon />
                          </Tooltip>
                        }
                        onDelete={() => deleteVariable(variable)}
                      />

                      <Stack sx={{ flexGrow: 1, gap: 1.5 }}>
                        {/* Selector de tipo de variable */}
                        <FormControl size="small" fullWidth>
                          <InputLabel>Tipo de variable</InputLabel>
                          <Select
                            value={variableTypes[variable] || 'normal'}
                            label="Tipo de variable"
                            onChange={(e) => handleUpdateVariableType(variable, e.target.value)}
                          >
                            <MenuItem value="normal">Variable normal</MenuItem>
                            <MenuItem value="list">Lista de opciones</MenuItem>
                          </Select>
                        </FormControl>

                        <TextField
                          size="small"
                          label="Descripción"
                          placeholder="¿Para qué sirve esta variable?"
                          value={variableDescriptions[variable] || ''}
                          onChange={(e) => handleUpdateDescriptions(variable, e)}
                          error={duplicateVariables.has(variable)}
                          helperText={
                            duplicateVariables.has(variable)
                              ? "Esta descripción ya existe en otra variable"
                              : ""
                          }
                          fullWidth
                        />

                        {/* Mostrar campo diferente según el tipo */}
                        {variableTypes[variable] === 'list' ? (
                          <Box>
                            {/* Campo de entrada con botón de agregar */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <TextField
                                size="small"
                                label="Agregar opción a la lista"
                                placeholder="Escribe una opción"
                                inputRef={(el) => (listInputRefs.current[variable] = el)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddListOption(variable, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                fullWidth
                              />
                              <Tooltip title="Agregar opción">
                                <IconButton
                                  color="primary"
                                  onClick={() => {
                                    const inputEl = listInputRefs.current[variable];
                                    if (inputEl && inputEl.value.trim()) {
                                      handleAddListOption(variable, inputEl.value);
                                      inputEl.value = '';
                                    }
                                  }}
                                  sx={{
                                    border: '1px solid',
                                    borderColor: 'primary.main',
                                    borderRadius: 1
                                  }}
                                >
                                  <AddIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            {/* Mostrar las opciones agregadas con numeración y drag & drop */}
                            {variableLists[variable]?.length > 0 && (
                              <Box sx={{ mt: 1.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                  Opciones (arrastra para reordenar):
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {variableLists[variable].map((option, optIndex) => (
                                    <Box
                                      key={optIndex}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, variable, optIndex)}
                                      onDragOver={(e) => handleDragOver(e)}
                                      onDrop={(e) => handleDrop(e, variable, optIndex)}
                                      sx={{
                                        cursor: 'move',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                          transform: 'scale(1.02)'
                                        }
                                      }}
                                    >
                                      {editingOption?.variable === variable && editingOption?.index === optIndex ? (
                                        // Modo edición
                                        <TextField
                                          size="small"
                                          autoFocus
                                          value={editingOption.value}
                                          onChange={(e) => setEditingOption({
                                            ...editingOption,
                                            value: e.target.value
                                          })}
                                          onBlur={() => handleSaveOptionEdit(variable, optIndex)}
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                              handleSaveOptionEdit(variable, optIndex);
                                            } else if (e.key === 'Escape') {
                                              setEditingOption(null);
                                            }
                                          }}
                                          sx={{ width: '150px' }}
                                        />
                                      ) : (
                                        // Modo visualización
                                        <Chip
                                          icon={
                                            <Box
                                              component="span"
                                              sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minWidth: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: 'primary.main',
                                                color: 'white',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                mr: 0.5
                                              }}
                                            >
                                              {optIndex + 1}
                                            </Box>
                                          }
                                          label={option}
                                          size="small"
                                          onClick={() => handleStartEditOption(variable, optIndex, option)}
                                          onDelete={() => handleDeleteListOption(variable, optIndex)}
                                          variant="outlined"
                                          deleteIcon={
                                            <Tooltip title="Eliminar">
                                              <DeleteIcon fontSize="small" />
                                            </Tooltip>
                                          }
                                          sx={{
                                            '& .MuiChip-icon': {
                                              ml: 0.5
                                            }
                                          }}
                                        />
                                      )}
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <TextField
                            size="small"
                            label="Texto de ejemplo"
                            value={variableExamples[variable] || ''}
                            onChange={(e) => handleUpdateExample(variable, e.target.value)}
                            fullWidth
                            inputRef={(el) => (exampleRefs.current[variable] = el)}
                            error={!!variableErrors[variable]}
                            helperText={variableErrors[variable]}
                          />
                        )}
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
                                    backgroundColor: '#f4fdff',
                                    borderTop: '3px solid #f4fdff',

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
                      mt: 'auto',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      px: 0
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