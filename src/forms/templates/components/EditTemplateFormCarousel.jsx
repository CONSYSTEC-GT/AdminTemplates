import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Accordion, AccordionSummary, AccordionDetails, Alert, Box, Button, Checkbox, Card, CardContent, CardMedia, Chip, Divider, FormControl, FormControlLabel, FormLabel, FormHelperText, Grid, IconButton, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, Snackbar, Stack, TextField, Tooltip, Typography, alpha } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editTemplateCarouselFormSchema } from "../schemas/EditTemplateCarouselFormSchema.js";

import { Smile } from "react-feather";
import EmojiPicker from "emoji-picker-react";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

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

import FileUploadCarousel from '../../../components/form-controls/FileUploadCarouselV2.jsx';
import { editTemplateCarouselGupshup } from '../../../api/gupshupApi.jsx';
import { editTemplateToTalkMe, obtenerPantallasMedia, obtenerParametros } from '../../../api/templatesGSApi.jsx';
import { useClickOutside } from '../../../utils/emojiClick.jsx';
import { CustomDialog } from '../../../utils/CustomDialog.jsx';

const CATEGORY_OPTIONS = [
  {
    id: 'MARKETING',
    title: 'Marketing',
    description: 'Envía ofertas promocionales, offertas de productos y más para aumentar la conciencia y el compromiso.',
    icon: <EmailOutlinedIcon />,
  },
  {
    id: 'UTILITY',
    title: 'Utilidad',
    description: 'Envía actualizaciones de cuenta, actualizaciones de pedidos, alertas y más para compartir información importante.',
    icon: <NotificationsNoneOutlinedIcon />,
  },
  {
    id: 'AUTHENTICATION',
    title: 'Autenticación',
    description: 'Envía códigos que permiten a tus clientes acceder a su cuenta.',
    icon: <VpnKeyOutlinedIcon />,
    disabled: true,
  },
];

const PANTALLAS_TALKME = ['4 - Broadcast'];

const LANGUAGE_MAP = {
  es: "Español",
  en: "Inglés",
  fr: "Francés",
};

const CHAR_LIMIT = 60;
const MAX_CARDS = 10;

const generateId = () => Math.random().toString(36).substr(2, 9);

const EditTemplateFormCarousel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const templateData = location.state?.template.gupshup || {};

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

  const [loading, setLoading] = useState(false);
  const [idPlantilla, setIdPlantilla] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showEmojiPickerCards, setShowEmojiPickerCards] = useState(false);
  const [currentEmojiCardId, setCurrentEmojiCardId] = useState(null);
  const [emojiCount, setEmojiCount] = useState(0);
  const [mediaURL, setMediaURL] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [displayPantallas, setDisplayPantallas] = useState([]);
  const [pantallasIniciales, setPantallasIniciales] = useState([]);
  const [pantallasState, setPantallasState] = useState([]);
  const [pantallasError, setPantallasError] = useState(false);
  const [pantallasHelperText, setPantallasHelperText] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [example, setExample] = useState("");

  const messageRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiPickerCardRef = useRef(null);
  const messageCardRefs = useRef({});

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(editTemplateCarouselFormSchema),
    defaultValues: {
      templateName: "",
      selectedCategory: "",
      templateType: "CAROUSEL",
      languageCode: "es",
      vertical: "",
      message: "",
      carouselType: "IMAGE",
      cantidadBotones: 1,
      tipoBoton: "QUICK_REPLY",
      cards: [],
      variables: {},
    },
  });

  const watchedTemplateType = watch("templateType");
  const watchedMessage = watch("message");
  const watchedVariables = watch("variables") ?? {};
  const watchedCards = watch("cards") ?? [];

  // Cargar datos iniciales desde templateData
  useEffect(() => {
    const loadData = async () => {
      if (templateData) {
        console.log("templateData: ", templateData);

        setValue("templateName", templateData.elementName || "", { shouldValidate: false });
        setValue("selectedCategory", templateData.category || "", { shouldValidate: false });
        setValue("templateType", "CAROUSEL", { shouldValidate: false });
        setValue("languageCode", templateData.languageCode || "es", { shouldValidate: false });
        setValue("vertical", templateData.vertical || "", { shouldValidate: false });

        if (templateData.containerMeta) {
          try {
            const meta = JSON.parse(templateData.containerMeta);
            setValue("message", meta.data || "", { shouldValidate: false });

            if (meta.cards && meta.cards.length > 0) {
              setValue("carouselType", meta.cards[0].headerType || "IMAGE", { shouldValidate: false });

              const buttonsCount = meta.cards[0].buttons?.length || 1;
              setValue("cantidadBotones", buttonsCount, { shouldValidate: false });
              setValue("tipoBoton", meta.cards[0].buttons?.[0]?.type || "QUICK_REPLY", { shouldValidate: false });

              const formattedCards = meta.cards.map((card, index) => ({
                id: `card-${index}`,
                messageCard: card.body || "",
                variablesCard: [],
                variableDescriptions: {},
                variableExamples: {},
                fileData: card.mediaUrl ? {
                  url: card.mediaUrl,
                  mediaId: card.mediaId || null,
                } : null,
                buttons: card.buttons ? card.buttons.map((button, buttonIndex) => ({
                  id: `button-${index}-${buttonIndex}`,
                  title: button.text || "",
                  type: button.type || "QUICK_REPLY",
                  url: button.url || "",
                  phoneNumber: button.phone_number || ""
                })) : []
              }));

              setValue("cards", formattedCards, { shouldValidate: false });
            }
          } catch (error) {
            console.error("❌ Error al parsear containerMeta:", error);
          }
        }

        try {
          const info = await obtenerPantallasMedia(urlTemplatesGS, templateData.id);
          if (info !== null) {
            const pantallasFromAPI = info.pantallas || "";
            const pantallasArray = pantallasFromAPI.split(',').filter(p => p);
            setPantallasState(pantallasArray);
            setPantallasIniciales(pantallasArray);
            const displayValues = procesarPantallasAPI(pantallasFromAPI);
            setDisplayPantallas(displayValues);
            setMediaURL(info.url || "");
            setImagePreview(info.url || "");
            setIdPlantilla(info.id_plantilla || "");
            setValue("idPlantilla", info.id_plantilla || "");
          }
        } catch (error) {
          console.error("❌ Error al cargar pantallas/media:", error);
        }
      }
    };

    loadData();
  }, [templateData, setValue]);

  // Cargar parámetros/variables
  useEffect(() => {
    const loadParametros = async () => {
      if (!idPlantilla) return;

      try {
        const infoParametros = await obtenerParametros(urlTemplatesGS, idPlantilla);
        if (infoParametros && infoParametros.length > 0) {
          const parametrosOrdenados = infoParametros.sort((a, b) => a.ORDEN - b.ORDEN);
          const variablesObj = {};

          parametrosOrdenados.forEach((param, index) => {
            const variableKey = `{{${index + 1}}}`;
            variablesObj[variableKey] = {
              description: param.NOMBRE || "",
              example: param.PLACEHOLDER || "",
            };
          });

          setValue("variables", variablesObj, { shouldValidate: false });
        }
      } catch (error) {
        console.error("Error cargando parámetros:", error);
      }
    };

    loadParametros();
  }, [idPlantilla, urlTemplatesGS, setValue]);

  useEffect(() => {
    const examplesMap = Object.fromEntries(
      Object.entries(watchedVariables).map(([k, v]) => [k, v.example ?? ""])
    );
    setExample(replaceVariables(watchedMessage, examplesMap));
  }, [watchedMessage, watchedVariables]);

  const procesarPantallasAPI = (pantallasString) => {
    if (!pantallasString) return [];
    const pantallasArray = pantallasString.split(',');
    return pantallasArray.map(pantallaNum => {
      const pantallaOption = PANTALLAS_TALKME.find(option =>
        option.startsWith(pantallaNum.trim() + ' -')
      );
      return pantallaOption || pantallaNum;
    });
  };

  const handlePantallasChange = (event) => {
    const { target: { value } } = event;
    const selectedOptions = typeof value === 'string' ? value.split(',') : value;
    const numericValues = selectedOptions.map(option => option.split(' - ')[0].trim());
    setPantallasState(numericValues);
    setDisplayPantallas(selectedOptions);
    if (numericValues.length > 0) {
      setPantallasError(false);
      setPantallasHelperText("");
    }
  };

  const countEmojis = (text) => {
    const emojiRegex = /(\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*)/gu;
    const matches = text.match(emojiRegex);
    return matches ? matches.length : 0;
  };

  const replaceVariables = (text, vars) => {
    let result = text || "";
    Object.keys(vars).forEach(variable => {
      const cleanVariable = variable.replace(/[{}]/g, '');
      const regex = new RegExp(`\\{\\{${cleanVariable}\\}\\}`, 'g');
      result = result.replace(regex, vars[variable]);
    });
    return result;
  };

  const renumberVariables = (text) => {
    const variableMap = new Map();
    let counter = 1;
    return text.replace(/\{\{\d+\}\}/g, (match) => {
      if (!variableMap.has(match)) {
        variableMap.set(match, `{{${counter}}}`);
        counter++;
      }
      return variableMap.get(match);
    });
  };

  const extractVariables = (text) => {
    const regex = /\{\{\d+\}\}/g;
    return [...new Set(text.match(regex) || [])];
  };

  const handleEmojiClick = (emojiObject) => {
    const currentMessage = getValues("message") || "";
    const cursor = messageRef.current?.selectionStart || 0;
    const newText = currentMessage.slice(0, cursor) + emojiObject.emoji + currentMessage.slice(cursor);
    const newEmojiCount = countEmojis(newText);

    if (newEmojiCount > 10) {
      Swal.fire({
        title: 'Límite de emojis',
        text: 'Máximo 10 emojis',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#00c3ff'
      });
      setShowEmojiPicker(false);
      return;
    }

    if (newText.length > 550) {
      Swal.fire({
        title: 'Límite de caracteres',
        text: 'Máximo 550 caracteres',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#00c3ff'
      });
      setShowEmojiPicker(false);
      return;
    }

    setValue("message", newText);
    setEmojiCount(newEmojiCount);
    setShowEmojiPicker(false);
    setTimeout(() => {
      if (messageRef.current) {
        messageRef.current.focus();
        messageRef.current.setSelectionRange(cursor + emojiObject.emoji.length, cursor + emojiObject.emoji.length);
      }
    }, 100);
  };

  const handleAddVariable = () => {
    const currentVariables = getValues("variables") ?? {};
    const currentMessage = getValues("message") || "";
    const nextIndex = Object.keys(currentVariables).length + 1;
    const newVariable = `{{${nextIndex}}}`;

    if (currentMessage.length + newVariable.length > 550) {
      Swal.fire({
        title: 'Límite de caracteres',
        text: 'No se pueden agregar más variables porque excede el máximo de 550 caracteres',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#00c3ff'
      });
      return;
    }

    const cursorPosition = messageRef.current?.selectionStart || currentMessage.length;
    const newMessage = `${currentMessage.substring(0, cursorPosition)}${newVariable}${currentMessage.substring(cursorPosition)}`;

    setValue("message", newMessage);
    setValue("variables", {
      ...currentVariables,
      [newVariable]: { description: "", example: "" },
    });

    setTimeout(() => {
      if (messageRef.current) {
        messageRef.current.focus();
        messageRef.current.setSelectionRange(cursorPosition + newVariable.length, cursorPosition + newVariable.length);
      }
    }, 0);
  };

  const deleteVariable = (variableToDelete) => {
    const currentVariables = getValues("variables") ?? {};
    const currentMessage = getValues("message") || "";

    const remaining = Object.entries(currentVariables)
      .filter(([key]) => key !== variableToDelete);

    const newVariables = {};
    const mapping = {};

    remaining.forEach(([oldKey, val], index) => {
      const newKey = `{{${index + 1}}}`;
      newVariables[newKey] = val;
      mapping[oldKey] = newKey;
    });

    let newMessage = currentMessage.replace(variableToDelete, "");
    Object.entries(mapping).forEach(([oldVar, newVar]) => {
      newMessage = newMessage.replaceAll(oldVar, newVar);
    });

    setValue("message", newMessage);
    setValue("variables", newVariables);
    messageRef.current?.focus();
  };

  const deleteAllVariables = () => {
    const currentMessage = getValues("message") || "";
    const currentVars = Object.keys(getValues("variables") ?? {});
    let newMessage = currentMessage;
    currentVars.forEach(v => {
      newMessage = newMessage.replaceAll(v, "");
    });
    setValue("message", newMessage);
    setValue("variables", {});
    messageRef.current?.focus();
  };

  const handleUpdateDescriptions = (variable, value) => {
    const newValue = value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/gi, "n")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");

    const currentVariables = getValues("variables") ?? {};
    setValue("variables", {
      ...currentVariables,
      [variable]: { ...currentVariables[variable], description: newValue },
    });
  };

  const handleUpdateExample = (variable, value) => {
    const currentVariables = getValues("variables") ?? {};
    setValue("variables", {
      ...currentVariables,
      [variable]: { ...currentVariables[variable], example: value },
    });
  };

  // Card Handlers
  const handleBodyMessageCardChange = (cardId, newText) => {
    const cards = getValues("cards") || [];
    const updatedCards = cards.map(card => {
      if (card.id !== cardId) return card;
      return { ...card, messageCard: newText };
    });
    setValue("cards", updatedCards);
  };

  const handleAddVariableCard = (cardId) => {
    const cards = getValues("cards") || [];
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = cards[cardIndex];
    const currentVars = card.variablesCard || [];
    const newVariable = `{{${currentVars.length + 1}}}`;
    const currentMessage = card.messageCard || "";

    const input = messageCardRefs.current[cardId];
    const cursorPosition = input?.selectionStart || currentMessage.length;
    const newMessage = `${currentMessage.substring(0, cursorPosition)}${newVariable}${currentMessage.substring(cursorPosition)}`;

    const updatedCards = [...cards];
    updatedCards[cardIndex] = {
      ...card,
      messageCard: newMessage,
      variablesCard: [...currentVars, newVariable],
      variableDescriptions: { ...(card.variableDescriptions || {}), [newVariable]: "" },
      variableExamples: { ...(card.variableExamples || {}), [newVariable]: "" },
    };
    setValue("cards", updatedCards);

    setTimeout(() => {
      if (input) {
        input.focus();
        input.setSelectionRange(cursorPosition + newVariable.length, cursorPosition + newVariable.length);
      }
    }, 0);
  };

  const deleteVariableCard = (cardId, variableToDelete) => {
    const cards = getValues("cards") || [];
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = cards[cardIndex];
    const currentVars = card.variablesCard || [];
    let newMessage = card.messageCard.replace(variableToDelete, '');

    const updatedVars = currentVars.filter(v => v !== variableToDelete);
    const mapping = {};
    const renumberedVars = updatedVars.map((v, idx) => {
      const newVar = `{{${idx + 1}}}`;
      mapping[v] = newVar;
      return newVar;
    });

    Object.entries(mapping).forEach(([oldVar, newVar]) => {
      newMessage = newMessage.replaceAll(oldVar, newVar);
    });

    const newDescriptions = { ...(card.variableDescriptions || {}) };
    const newExamples = { ...(card.variableExamples || {}) };

    delete newDescriptions[variableToDelete];
    delete newExamples[variableToDelete];

    Object.entries(mapping).forEach(([oldVar, newVar]) => {
      if (newDescriptions[oldVar]) {
        newDescriptions[newVar] = newDescriptions[oldVar];
        delete newDescriptions[oldVar];
      }
      if (newExamples[oldVar]) {
        newExamples[newVar] = newExamples[oldVar];
        delete newExamples[oldVar];
      }
    });

    const updatedCards = [...cards];
    updatedCards[cardIndex] = {
      ...card,
      messageCard: newMessage,
      variablesCard: renumberedVars,
      variableDescriptions: newDescriptions,
      variableExamples: newExamples,
    };
    setValue("cards", updatedCards);
  };

  const deleteAllVariablesCard = (cardId) => {
    const cards = getValues("cards") || [];
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = cards[cardIndex];
    let newMessage = card.messageCard;
    (card.variablesCard || []).forEach(v => {
      newMessage = newMessage.replaceAll(v, "");
    });

    const updatedCards = [...cards];
    updatedCards[cardIndex] = {
      ...card,
      messageCard: newMessage,
      variablesCard: [],
      variableDescriptions: {},
      variableExamples: {},
    };
    setValue("cards", updatedCards);
  };

  const handleEmojiClickCarousel = (emojiObject, cardId) => {
    const input = messageCardRefs.current[cardId];
    const cursor = input?.selectionStart || 0;

    const cards = getValues("cards") || [];
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = cards[cardIndex];
    const newText = card.messageCard.slice(0, cursor) + emojiObject.emoji + card.messageCard.slice(cursor);
    const newEmojiCount = countEmojis(newText);

    if (newEmojiCount > 10) {
      Swal.fire({
        title: 'Límite de emojis',
        text: 'Máximo 10 emojis',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#00c3ff'
      });
      setShowEmojiPickerCards(false);
      return;
    }

    const updatedCards = [...cards];
    updatedCards[cardIndex] = { ...card, messageCard: newText, emojiCountCard: newEmojiCount };
    setValue("cards", updatedCards);
    setShowEmojiPickerCards(false);

    setTimeout(() => {
      if (input) {
        input.focus();
        input.setSelectionRange(cursor + emojiObject.emoji.length, cursor + emojiObject.emoji.length);
      }
    }, 100);
  };

  const handleUpdateDescriptionsCard = (cardId, variable, value) => {
    const cards = getValues("cards") || [];
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const updatedCards = [...cards];
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      variableDescriptions: {
        ...(updatedCards[cardIndex].variableDescriptions || {}),
        [variable]: value
      }
    };
    setValue("cards", updatedCards);
  };

  const handleUpdateExampleCard = (cardId, variable, value) => {
    const cards = getValues("cards") || [];
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const updatedCards = [...cards];
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      variableExamples: {
        ...(updatedCards[cardIndex].variableExamples || {}),
        [variable]: value
      }
    };
    setValue("cards", updatedCards);
  };

  const updateButton = (cardId, buttonId, key, value) => {
    const cards = getValues("cards") || [];
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const updatedCards = [...cards];
    const updatedButtons = (updatedCards[cardIndex].buttons || []).map(btn =>
      btn.id === buttonId ? { ...btn, [key]: value } : btn
    );
    updatedCards[cardIndex] = { ...updatedCards[cardIndex], buttons: updatedButtons };
    setValue("cards", updatedCards);
  };

  const addCard = () => {
    const cards = getValues("cards") || [];
    if (cards.length >= MAX_CARDS) {
      Swal.fire({
        title: 'Límite de tarjetas',
        text: `Máximo ${MAX_CARDS} tarjetas permitidas`,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#00c3ff'
      });
      return;
    }

    const cantidadBotones = getValues("cantidadBotones") || 1;
    const tipoBoton = getValues("tipoBoton") || "QUICK_REPLY";

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

    const newCard = {
      id: generateId(),
      messageCard: "",
      variablesCard: [],
      variableDescriptions: {},
      variableExamples: {},
      fileData: null,
      buttons: newButtons,
      emojiCountCard: 0,
    };
    setValue("cards", [...cards, newCard]);
  };

  const deleteCard = (cardId) => {
    const cards = getValues("cards") || [];
    const filteredCards = cards.filter(c => c.id !== cardId);
    setValue("cards", filteredCards);
  };

  const handleRemoveCard = (cardId) => {
    deleteCard(cardId);
  };

  const handleFileUpload = (cardId, uploadResponse) => {
    if (!uploadResponse) return;

    const cards = getValues("cards") || [];
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const fileData = {
      url: uploadResponse.url,
      mediaId: uploadResponse.mediaId || null,
    };

    const updatedCards = [...cards];
    updatedCards[cardIndex] = { ...updatedCards[cardIndex], fileData };
    setValue("cards", updatedCards);
  };

  const handleCantidadChange = (e) => {
    const nuevaCantidad = Number(e.target.value);
    setValue("cantidadBotones", nuevaCantidad);

    const tipoBoton = getValues("tipoBoton");
    const cards = getValues("cards") || [];

    const updatedCards = cards.map(card => {
      const newButtons = [];
      for (let i = 0; i < nuevaCantidad; i++) {
        const existingButton = card.buttons?.[i];
        newButtons.push({
          id: existingButton?.id || generateId(),
          title: existingButton?.title || `Botón ${i + 1}`,
          type: tipoBoton,
          ...(tipoBoton === 'URL' && { url: existingButton?.url || '' }),
          ...(tipoBoton === 'PHONE_NUMBER' && { phoneNumber: existingButton?.phoneNumber || '' })
        });
      }
      return { ...card, buttons: newButtons };
    });
    setValue("cards", updatedCards);
  };

  const handleTipoBotonChange = (e) => {
    const nuevoTipo = e.target.value;
    setValue("tipoBoton", nuevoTipo);

    const cantidadBotones = getValues("cantidadBotones");
    const cards = getValues("cards") || [];

    const updatedCards = cards.map(card => {
      const newButtons = (card.buttons || []).map((btn, idx) => ({
        ...btn,
        type: nuevoTipo,
        ...(nuevoTipo !== 'URL' && { url: undefined }),
        ...(nuevoTipo !== 'PHONE_NUMBER' && { phoneNumber: undefined }),
        ...(nuevoTipo === 'URL' && { url: btn.url || '' }),
        ...(nuevoTipo === 'PHONE_NUMBER' && { phoneNumber: btn.phoneNumber || '' })
      }));
      return { ...card, buttons: newButtons };
    });
    setValue("cards", updatedCards);
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const cards = getValues("cards") || [];
    const items = Array.from(cards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setValue("cards", items);
  };

  const formatCardsForGupshup = (cards) => {
    return cards.map(card => ({
      headerType: "IMAGE",
      mediaUrl: card.fileData?.url || "",
      mediaId: card.fileData?.mediaId || null,
      body: card.messageCard || "",
      sampleText: card.messageCard || "",
      buttons: (card.buttons || []).map(button => {
        if (button.type === "URL") {
          return { type: "URL", text: button.title, url: button.url };
        } else if (button.type === "PHONE_NUMBER") {
          return { type: "PHONE_NUMBER", text: button.title, phoneNumber: button.phoneNumber };
        }
        return { type: "QUICK_REPLY", text: button.title };
      }).filter(btn => btn.text)
    }));
  };

  const onSubmit = async (formData) => {
    console.log("🚀 onSubmit ejecutado");
    console.log("formData:", formData);
    console.log("pantallasState:", pantallasState);

    if (loading) return;
    setLoading(true);

    if (pantallasState.length === 0) {
      setPantallasError(true);
      setPantallasHelperText("Debes seleccionar al menos una pantalla");
      setLoading(false);
      return;
    }

    const pantallasModificadas = JSON.stringify([...pantallasState].sort()) !==
      JSON.stringify([...pantallasIniciales].sort());

    const originalMeta = (() => {
      try {
        return JSON.parse(templateData.containerMeta || "{}");
      } catch {
        return {};
      }
    })();

    const mensajeOriginal = originalMeta.data || "";
    const cardsOriginal = originalMeta.cards || [];

    const messageChanged = formData.message !== mensajeOriginal;

    const cardsHaveChanged = () => {
      const currentCards = formatCardsForGupshup(formData.cards || []);
      const originalCards = cardsOriginal.map(card => ({
        headerType: card.headerType || "IMAGE",
        mediaUrl: card.mediaUrl || "",
        mediaId: card.mediaId || null,
        body: card.body || "",
        sampleText: card.sampleText || card.body || "",
        buttons: (card.buttons || []).map(btn => {
          if (btn.type === "URL") {
            return { type: "URL", text: btn.text, url: btn.url };
          } else if (btn.type === "PHONE_NUMBER") {
            return { type: "PHONE_NUMBER", text: btn.text, phoneNumber: btn.phone_number || btn.phoneNumber };
          }
          return { type: "QUICK_REPLY", text: btn.text };
        }).filter(b => b.text)
      }));
      return JSON.stringify(currentCards) !== JSON.stringify(originalCards);
    };

    const cardsChanged = cardsHaveChanged();

    const gupshupSinCambios = !messageChanged && !cardsChanged;
    const soloCambioPantallas = pantallasModificadas && gupshupSinCambios;

    const variables = formData.variables || {};
    const variableKeys = Object.keys(variables);
    const variableDescriptions = {};
    const variableExamples = {};

    Object.entries(variables).forEach(([key, val]) => {
      variableDescriptions[key] = val?.description || "";
      variableExamples[key] = val?.example || "";
    });

    if (soloCambioPantallas) {
      console.log("🎯 Solo se modificaron pantallas - Actualizando solo TalkMe");

      const result2 = await editTemplateToTalkMe(
        templateData.id,
        {
          templateName: templateData.elementName,
          selectedCategory: templateData.category,
          message: formData.message,
          uploadedUrl: mediaURL,
          templateType: templateData.templateType
        },
        idNombreUsuarioTalkMe,
        variableKeys,
        variableDescriptions,
        formData.cards || [],
        urlTemplatesGS,
        idBotRedes,
        [],
        pantallasState.join(','),
        mediaURL,
        true
      );

      if (result2?.status === "success") {
        Swal.fire({
          title: 'Éxito',
          text: 'Las pantallas se actualizaron correctamente.',
          icon: 'success',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#00c3ff'
        });
        navigate('/Dashboard');
      } else {
        Swal.fire({
          title: 'Error al actualizar en TalkMe',
          text: `Error: ${result2?.message || 'Ocurrió un problema, intenta nuevamente.'}`,
          icon: 'error',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#00c3ff'
        });
      }
      setLoading(false);
      return;
    }

    const formattedCards = formatCardsForGupshup(formData.cards || []);

    const templatePayload = {
      elementName: formData.templateName,
      category: formData.selectedCategory,
      languageCode: formData.languageCode,
      templateType: "CAROUSEL",
      vertical: formData.vertical,
      content: formData.message,
      carousel: JSON.stringify(formattedCards)
    };

    const result = await editTemplateCarouselGupshup(
      appId,
      authCode,
      templatePayload,
      templateData.id,
      idNombreUsuarioTalkMe,
      urlTemplatesGS
    );

    if (result?.status === "success") {
      const result2 = await editTemplateToTalkMe(
        result.template.id,
        {
          templateName: formData.templateName,
          selectedCategory: formData.selectedCategory,
          message: formData.message,
          uploadedUrl: mediaURL,
          templateType: formData.templateType
        },
        idNombreUsuarioTalkMe,
        variableKeys,
        variableDescriptions,
        formData.cards || [],
        urlTemplatesGS,
        idBotRedes,
        [],
        pantallasState.join(','),
        mediaURL
      );

      if (result2?.status === "success") {
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
          title: 'Error al actualizar en TalkMe',
          text: `Error: ${result2?.message || 'Ocurrió un problema, intenta nuevamente.'}`,
          icon: 'error',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#00c3ff'
        });
      }
    } else {
      Swal.fire({
        title: 'Error al editar plantilla carrusel',
        text: `Error: ${result?.message || 'Ocurrió un problema, intenta nuevamente.'}`,
        icon: 'warning',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#00c3ff'
      });
    }

    setLoading(false);
  };

  useClickOutside(emojiPickerRef, () => setShowEmojiPicker(false));
  useClickOutside(emojiPickerCardRef, () => setShowEmojiPickerCards(false));

  return (
    <Grid container sx={{ height: 'calc(100vh - 16px)' }}>
      {/* Formulario (70%) */}
      <Grid item xs={8} sx={{ height: '100%' }}>
        <Box sx={{ height: '100%', overflowY: 'auto', pr: 2, px: 2, py: 2 }}>
          {/* Template Name - DESHABILITADO */}
          <Box sx={{ mt: 2, p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2, }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", }, gap: 2, }}>
              <Box>
                <Typography variant="body1" color="textSecondary">
                  Nombre de la plantilla
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {watch("templateName") || "-"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body1" color="textSecondary">
                  ID
                </Typography>
                <Typography variant="body2">
                  {watch("idPlantilla") || "-"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Categoría - DESHABILITADA */}
          <Box sx={{ maxWidth: '100%', border: "1px solid #ddd", borderRadius: 2, marginTop: 2, p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControl fullWidth><FormLabel>*Categoría</FormLabel></FormControl>
              <Tooltip title="La categoría no se puede modificar después de crear la plantilla">
                <IconButton size="small"><HelpOutlineIcon fontSize="small" /></IconButton>
              </Tooltip>
            </Box>
            <Controller
              name="selectedCategory"
              control={control}
              render={({ field }) => (
                <RadioGroup value={field.value} disabled>
                  <Stack spacing={2}>
                    {CATEGORY_OPTIONS.map((category) => (
                      <Paper key={category.id} sx={{ p: 2, opacity: category.disabled ? 0.5 : 1, bgcolor: "rgba(0,0,0,0.02)" }}>
                        <FormControlLabel
                          value={category.id}
                          disabled
                          control={<Radio />}
                          label={
                            <Box sx={{ ml: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                {category.icon}
                                <Typography variant="subtitle1" component="span">{category.title}</Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">{category.description}</Typography>
                            </Box>
                          }
                          sx={{ margin: 0, width: '100%' }}
                        />
                      </Paper>
                    ))}
                  </Stack>
                </RadioGroup>
              )}
            />
          </Box>

          {/* Tipo de plantilla - CARRUSEL FIJO */}
          <Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormLabel>*Tipo de plantilla</FormLabel>
            <Controller
              name="templateType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <Select {...field} disabled>
                    <MenuItem value="CAROUSEL">CARRUSEL</MenuItem>
                  </Select>
                  <FormHelperText>Tipo de plantilla fijo: Carrusel</FormHelperText>
                </FormControl>
              )}
            />
          </Box>

          {/* Selección de pantallas TalkMe */}
          <Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormControl fullWidth error={pantallasError}>
              <FormLabel>
                Aplicar en estas pantallas
                <Typography component="span" variant="caption" sx={{ ml: 1, color: "text.secondary" }}>
                  (Este cambio solo afecta a TalkMe, no a Gupshup)
                </Typography>
              </FormLabel>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 1 }} error={pantallasError}>
              <InputLabel id="pantallas-label">Selecciona una o más opciones</InputLabel>
              <Select
                labelId="pantallas-label"
                multiple
                value={displayPantallas}
                input={<OutlinedInput label="Selecciona una o más opciones" />}
                renderValue={(selected) => selected.join(', ')}
                onChange={handlePantallasChange}
              >
                {PANTALLAS_TALKME.map((name) => (
                  <MenuItem key={name} value={name}>
                    <Checkbox checked={displayPantallas.indexOf(name) > -1} />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>
              {pantallasError && <FormHelperText error>{pantallasHelperText}</FormHelperText>}
              <FormHelperText>Selecciona las pantallas de TalkMe donde estará disponible esta plantilla</FormHelperText>
            </FormControl>
          </Box>

          {/* Idioma - DESHABILITADO */}
          <Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormLabel>*Idioma de plantilla</FormLabel>
            <Controller
              name="languageCode"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <InputLabel id="languageCode-label">Selección</InputLabel>
                  <Select {...field} labelId="languageCode-label" label="Selección" disabled>
                    {Object.entries(LANGUAGE_MAP).map(([code, name]) => (
                      <MenuItem key={code} value={code}>{name} ({code.toUpperCase()})</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>El idioma no se puede modificar después de la creación</FormHelperText>
                </FormControl>
              )}
            />
          </Box>

          {/* Etiquetas de plantilla - DESHABILITADO */}
          <Box sx={{ width: '100%', marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormLabel>*Etiquetas de plantilla</FormLabel>
            <Controller
              name="vertical"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth sx={{ mt: 1 }} disabled helperText="Las etiquetas no se pueden modificar después de la creación" />
              )}
            />
          </Box>

          {/* Body Message */}
          <Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormLabel sx={{ fontSize: "1.1rem", fontWeight: "500", color: "#333" }}>*Contenido</FormLabel>
            <Box sx={{ position: "relative" }}>
              <Controller
                name="message"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Escribe"
                    placeholder="Ingresa el contenido de tu mensaje aquí..."
                    inputRef={messageRef}
                    error={!!fieldState.error}
                    onChange={(e) => {
                      let newText = e.target.value;
                      const newEmojiCount = countEmojis(newText);

                      if (newEmojiCount > 10) {
                        Swal.fire({ title: 'Límite de emojis', text: 'Máximo 10 emojis', icon: 'warning', confirmButtonText: 'Entendido', confirmButtonColor: '#00c3ff' });
                        return;
                      }
                      if (newText.length > 550) {
                        Swal.fire({ title: 'Límite de caracteres', text: 'Máximo 550 caracteres', icon: 'warning', confirmButtonText: 'Entendido', confirmButtonColor: '#00c3ff' });
                        return;
                      }
                      if (newText.includes("{{")) newText = renumberVariables(newText);
                      field.onChange(newText);
                      setEmojiCount(newEmojiCount);

                      const currentVariables = getValues("variables") ?? {};
                      const detectedKeys = extractVariables(newText);
                      const currentKeys = Object.keys(currentVariables);
                      const toAdd = detectedKeys.filter(k => !currentKeys.includes(k));
                      const toDelete = currentKeys.filter(k => !newText.includes(k));

                      if (toAdd.length > 0 || toDelete.length > 0) {
                        const updated = { ...currentVariables };
                        toAdd.forEach(k => updated[k] = { description: "", example: "" });
                        toDelete.forEach(k => delete updated[k]);
                        setValue("variables", updated);
                      }
                    }}
                    sx={{ mb: 3, mt: 4, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                    helperText={fieldState.error?.message ?? `${field.value?.length || 0}/550 caracteres | ${emojiCount}/10 emojis`}
                    FormHelperTextProps={{ sx: { textAlign: 'right', color: (field.value?.length === 550 || emojiCount >= 10) ? 'error.main' : 'text.secondary' } }}
                  />
                )}
              />

              <Stack direction="row" spacing={1} sx={{ mb: 2, p: 1, borderRadius: 1, backgroundColor: "rgba(0,0,0,0.02)" }}>
                <Tooltip title="Agregar emojis">
                  <IconButton color="primary" onClick={() => setShowEmojiPicker(!showEmojiPicker)} sx={{ borderRadius: 1 }}>
                    <Smile size={20} />
                  </IconButton>
                </Tooltip>
              </Stack>

              {showEmojiPicker && (
                <Paper ref={emojiPickerRef} elevation={3} sx={{ position: "absolute", zIndex: 1000, mt: 1 }}>
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </Paper>
              )}

              {Object.keys(watchedVariables).length > 0 && (
                <Paper sx={{ my: 2, p: 2, borderRadius: 2, border: "1px solid #ddd" }}>
                  <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>Agrega una descripción y un ejemplo a tu variable:</Typography>
                  {Object.entries(watchedVariables).map(([variable, value]) => (
                    <Box key={variable} sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2, p: 1.5, backgroundColor: "#fff", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                      <Chip label={variable} color="primary" sx={{ fontWeight: "500" }} />
                      <Stack sx={{ flexGrow: 1, gap: 1 }}>
                        <TextField size="small" label="Descripción" placeholder="¿Para qué sirve esta variable?" value={value?.description ?? ""} onChange={(e) => handleUpdateDescriptions(variable, e.target.value)} error={!!errors.variables?.[variable]?.description} helperText={errors.variables?.[variable]?.description?.message ?? ""} />
                        <TextField size="small" label="Texto de ejemplo" value={value?.example ?? ""} onChange={(e) => handleUpdateExample(variable, e.target.value)} error={!!errors.variables?.[variable]?.example} helperText={errors.variables?.[variable]?.example?.message ?? ""} />
                      </Stack>
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
          </Box>

          {/* Carrusel */}
          <Box sx={{ width: '100%', marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormControl fullWidth>
              <FormLabel sx={{ fontSize: "1.1rem", fontWeight: "500", color: "#333", mb: 2 }}>*Carrusel</FormLabel>
              <FormLabel sx={{ mb: 2 }}>Agregue medios, botones y descripciones de tarjetas para sus tarjetas de carrusel.</FormLabel>

              <Controller
                name="carouselType"
                control={control}
                render={({ field }) => (
                  <TextField {...field} disabled select label="Tipo de carrusel" fullWidth sx={{ mb: 2 }}>
                    <MenuItem value="IMAGE">Imagen</MenuItem>
                    <MenuItem value="VIDEO">Video</MenuItem>
                  </TextField>
                )}
              />
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Controller
                name="cantidadBotones"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Cantidad de botones" fullWidth disabled onChange={handleCantidadChange}>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                  </TextField>
                )}
              />
              <Controller
                name="tipoBoton"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Tipo de botones" fullWidth disabled onChange={handleTipoBotonChange}>
                    <MenuItem value="QUICK_REPLY">Respuesta rápida</MenuItem>
                    <MenuItem value="URL">Link</MenuItem>
                    <MenuItem value="PHONE_NUMBER">Teléfono</MenuItem>
                  </TextField>
                )}
              />
            </Box>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="cards">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {watchedCards.map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps}>
                            <Accordion expanded={expanded === card.id} onChange={handleChange(card.id)} sx={{ mb: 2 }}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }, cursor: 'default' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'grab', '&:active': { cursor: 'grabbing' } }} {...provided.dragHandleProps}>
                                  <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                  <Typography>Tarjeta {index + 1}</Typography>
                                </Box>
                                {/* Botón eliminar tarjeta inhabilitado */}
                              </AccordionSummary>
                              <AccordionDetails>
                                <Box component="form" sx={{ '& .MuiTextField-root': { mb: 2, width: '100%' } }}>
                                  {/*<FileUploadCarousel
                                    disabled
                                    carouselType={getValues("carouselType")}
                                    onUploadSuccess={(uploadData) => handleFileUpload(card.id, uploadData)}
                                  />*/}


                                  <Box sx={{ position: "relative" }}>
                                    <TextField
                                      disabled
                                      fullWidth
                                      multiline
                                      rows={4}
                                      label="Escribe"
                                      placeholder="Ingresa el contenido de tu mensaje aquí..."
                                      value={card.messageCard}
                                      onChange={(e) => handleBodyMessageCardChange(card.id, e.target.value)}
                                      inputRef={(el) => (messageCardRefs.current[card.id] = el)}
                                      inputProps={{ maxLength: 160 }}
                                      helperText={`${card.messageCard?.length || 0}/160 caracteres`}
                                      sx={{ mb: 3, mt: 4 }}
                                    />

                                    <Stack direction="row" spacing={1} sx={{ mb: 2, p: 1, borderRadius: 1, backgroundColor: "rgba(0,0,0,0.02)" }}>
                                      <Tooltip title="Agregar emojis">
                                        <IconButton color="primary" onClick={() => { setCurrentEmojiCardId(card.id); setShowEmojiPickerCards(!showEmojiPickerCards); }} sx={{ borderRadius: 1 }}>
                                          <Smile size={20} />
                                        </IconButton>
                                      </Tooltip>
                                    </Stack>

                                    {showEmojiPickerCards && currentEmojiCardId === card.id && (
                                      <Paper ref={emojiPickerCardRef} elevation={3} sx={{ position: "absolute", zIndex: 1000, mt: 1 }}>
                                        <EmojiPicker onEmojiClick={(emoji) => handleEmojiClickCarousel(emoji, card.id)} />
                                      </Paper>
                                    )}

                                    {(card.variablesCard?.length > 0) && (
                                      <Paper sx={{ my: 2, p: 2, borderRadius: 2, border: "1px solid #ddd" }}>
                                        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>Agrega una descripción y un ejemplo a tu variable:</Typography>
                                        {card.variablesCard.map((variableCard, idx) => (
                                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2, p: 1.5, backgroundColor: "#fff", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                                            <Chip label={variableCard} color="primary" sx={{ fontWeight: "500" }} />
                                            <Stack sx={{ flexGrow: 1, gap: 1 }}>
                                              <TextField size="small" label="Descripción" placeholder="¿Para qué sirve esta variable?" value={card.variableDescriptions?.[variableCard] || ''} onChange={(e) => handleUpdateDescriptionsCard(card.id, variableCard, e.target.value)} />
                                              <TextField size="small" label="Texto de ejemplo" value={card.variableExamples?.[variableCard] || ''} onChange={(e) => handleUpdateExampleCard(card.id, variableCard, e.target.value)} />
                                            </Stack>
                                          </Box>
                                        ))}
                                      </Paper>
                                    )}
                                  </Box>
                                </Box>

                                <Stack spacing={2}>
                                  {(card.buttons || []).map((button, btnIndex) => (
                                    <Box key={button.id} sx={{ display: "flex", alignItems: "center", gap: 2, border: "1px solid #ccc", borderRadius: 2, p: 2, backgroundColor: "#f9f9f9" }}>
                                      <TextField disabled label="Titulo del botón" value={button.title} onChange={(e) => updateButton(card.id, button.id, "title", e.target.value)} fullWidth />
                                      <Select value={button.type} sx={{ minWidth: 150 }} disabled>
                                        <MenuItem value="QUICK_REPLY">Respuesta rápida</MenuItem>
                                        <MenuItem value="URL">URL</MenuItem>
                                        <MenuItem value="PHONE_NUMBER">Número de teléfono</MenuItem>
                                      </Select>
                                      {button.type === "URL" && <TextField label="URL" value={button.url || ''} onChange={(e) => updateButton(card.id, button.id, "url", e.target.value)} fullWidth />}
                                      {button.type === "PHONE_NUMBER" && <TextField label="Phone Number" value={button.phoneNumber || ''} onChange={(e) => updateButton(card.id, button.id, "phoneNumber", e.target.value)} fullWidth />}
                                      {button.type === "QUICK_REPLY" && <ArrowForward />}
                                      {button.type === "URL" && <Link />}
                                      {button.type === "PHONE_NUMBER" && <Phone />}
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

            {/* Se ha deshabilitado el componente añadir tarjeta */}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2, mb: 20 }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={async () => {
                try {
                  await handleSubmit(onSubmit, (validationErrors) => {
                    console.error("❌ Errores de validación:", validationErrors);
                    Swal.fire({
                      title: 'Errores de validación',
                      html: `<pre style="text-align:left;font-size:13px;max-height:300px;overflow:auto">${JSON.stringify(validationErrors, null, 2)}</pre>`,
                      icon: 'warning',
                      confirmButtonText: 'Entendido',
                      confirmButtonColor: '#00c3ff'
                    });
                  })();
                } catch (error) {
                  console.error("❌ Error:", error);
                }
              }}
              sx={{ mt: 3, mb: 3 }}
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? "Actualizando..." : "Actualizar plantilla"}
            </Button>
          </Box>
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
              <Typography
                variant="body1"
                color="text.primary"
                sx={{
                  fontFamily: "Helvetica Neue, Arial, sans-serif",
                  whiteSpace: "pre-line",
                  overflowWrap: "break-word",
                }}
              >
                {example}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ alignSelf: "flex-end" }}
              >
                {new Date().toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Typography>
            </Box>

            <Swiper
              modules={[Pagination]}
              effect={"coverflow"}
              spaceBetween={10}
              slidesPerView={2}
              centeredSlides={false}
              pagination={{ clickable: true }}
              style={{ width: "100%" }}
            >
              {watchedCards.map((card, index) => (
                <SwiperSlide key={card.id ?? index}>
                  <Card
                    sx={{
                      width: "100%",
                      height: "450px",
                      margin: "auto",
                      my: 2,
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Botón eliminar */}
                    {index !== 0 && (
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleRemoveCard(index)}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          zIndex: 2,
                          backgroundColor: "rgba(255,255,255,0.8)",
                          "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.9)",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}

                    {/* Media */}
                    <Box sx={{ height: "180px", overflow: "hidden", position: "relative" }}>
                      {card.fileData && card.fileData.url ? (  // ✅ card. en lugar de watchedCards.
                        /\.(mp4|webm|ogg)$/i.test(card.fileData.url) ? (
                          <video
                            src={card.fileData.url}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            controls={false}
                            autoPlay
                            muted
                            loop
                          />
                        ) : (
                          <CardMedia
                            component="img"
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            image={card.fileData.url}  // ✅
                            alt={card.title}           // ✅
                          />
                        )
                      ) : (
                        <Box
                          sx={{
                            height: "100%",
                            width: "100%",
                            bgcolor: "#f0f0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Sin imagen
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Descripción */}
                    <CardContent sx={{ pt: 2, pb: 1, height: "120px", overflow: "auto" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflowWrap: "break-word",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {card.messageCard || "Descripción de la tarjeta"}  {/* ✅ */}
                      </Typography>
                    </CardContent>

                    {/* Botones */}
                    <Box
                      sx={{
                        mt: "auto",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        px: 0,
                      }}
                    >
                      <Stack spacing={0} sx={{ width: "100%" }}>
                        {(card.buttons ?? []).map((button, btnIndex) => (  // ✅ card.buttons
                          <Box
                            key={button.id ?? btnIndex}
                            sx={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                              borderTop: btnIndex === 0 ? "1px solid #e0e0e0" : "none",
                              borderBottom: "1px solid #e0e0e0",
                              p: 1.5,
                              backgroundColor: "#ffffff",
                              cursor: "pointer",
                              "&:hover": { backgroundColor: "#f5f5f5" },
                              borderRadius: 0,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
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
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: "medium",
                                  color: "#075e54",
                                  fontSize: "14px",
                                  textAlign: "center",
                                }}
                              >
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