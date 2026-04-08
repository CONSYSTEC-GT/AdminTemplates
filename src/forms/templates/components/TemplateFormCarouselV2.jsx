import React, { useState, useRef, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Checkbox,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { templateFormCarouselSchema } from "../schemas/templateFormCarousel.schema.ts";

import { Smile } from "react-feather";
import EmojiPicker from "emoji-picker-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForward from "@mui/icons-material/ArrowForward";
import LinkIcon from "@mui/icons-material/Link";
import PhoneIcon from "@mui/icons-material/Phone";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import FileUploadCarousel from "../../../components/form-controls/FileUploadCarouselV2.jsx";
import { createTemplateCarouselGupshup } from "../../../api/gupshupApi.jsx";
import { saveTemplateToTalkMe, validarNombrePlantillas } from "../../../api/templatesGSApi.jsx";
import { useClickOutside } from "../../../utils/emojiClick.jsx";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  {
    id: "MARKETING",
    title: "Marketing",
    description:
      "Envía ofertas promocionales, ofertas de productos y más para aumentar la conciencia y el compromiso.",
    icon: <EmailOutlinedIcon />,
  },
  {
    id: "utility",
    title: "Utilidad",
    description:
      "Envía actualizaciones de cuenta, actualizaciones de pedidos, alertas y más para compartir información importante.",
    icon: <NotificationsNoneOutlinedIcon />,
    disabled: true,
  },
  {
    id: "authentication",
    title: "Autenticación",
    description: "Envía códigos que permiten a tus clientes acceder a su cuenta.",
    icon: <VpnKeyOutlinedIcon />,
    disabled: true,
  },
];

const PANTALLAS_TALKME = ["4 - Broadcast"];

const LANGUAGE_MAP = {
  es: "Español",
  en: "Inglés",
  fr: "Francés",
};

const MAX_CARDS = 10;
const MAX_BODY_CHARS = 550;
const MAX_CARD_CHARS = 160;
const MAX_EMOJIS = 10;

// ─── Pure helpers (no state) ──────────────────────────────────────────────────

const checkTemplateName = async (urlTemplatesGS, nombre, idBotRedes) => {
  const nombreFormateado = nombre.replace(/_/g, " ");
  if (!nombreFormateado.trim() || !idBotRedes) return null;
  try {
    return await validarNombrePlantillas(urlTemplatesGS, nombreFormateado, idBotRedes);
  } catch {
    return null;
  }
};

const countEmojis = (text) => {
  const matches = text.match(/(\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*)/gu);
  return matches ? matches.length : 0;
};

const replaceVariables = (text, vars) => {
  let result = text || "";
  Object.keys(vars).forEach((variable) => {
    const clean = variable.replace(/[{}]/g, "");
    result = result.replace(new RegExp(`\\{\\{${clean}\\}\\}`, "g"), vars[variable]);
  });
  return result;
};

const renumberVariables = (text) => {
  const map = new Map();
  let counter = 1;
  return text.replace(/\{\{\d+\}\}/g, (match) => {
    if (!map.has(match)) map.set(match, `{{${counter++}}}`);
    return map.get(match);
  });
};

const extractVariables = (text) => [...new Set((text.match(/\{\{\d+\}\}/g) || []))];

const generateButtonsFromConfig = (count, tipo1, tipo2) => {
  const buttons = [];
  if (count >= 1)
    buttons.push({ id: uuidv4(), title: "Botón 1", type: tipo1, url: "", phoneNumber: "" });
  if (count >= 2)
    buttons.push({ id: uuidv4(), title: "Botón 2", type: tipo2, url: "", phoneNumber: "" });
  return buttons;
};

const createInitialCard = (cantidadBotones = 1, tipoBoton = "QUICK_REPLY", tipoBoton2 = "QUICK_REPLY") => ({
  id: uuidv4(),
  messageCard: "",
  variablesCard: {},
  fileData: null,
  buttons: generateButtonsFromConfig(cantidadBotones, tipoBoton, tipoBoton2),
  emojiCountCard: 0,
});

const formatCardsForGupshup = (cards) =>
  cards.map((card) => ({
    headerType: "IMAGE",
    mediaUrl: card.fileData?.url || "",
    mediaId: card.fileData?.mediaId || null,
    exampleMedia: null,
    body: card.messageCard || "",
    sampleText: card.messageCard || "",
    buttons: card.buttons
      .map((btn) => {
        if (btn.type === "URL")
          return { type: "URL", text: btn.title, url: btn.url, buttonValue: btn.url.split("{{")[0] || btn.url, suffix: "", example: [btn.url] };
        if (btn.type === "QUICK_REPLY") return { type: "QUICK_REPLY", text: btn.title };
        if (btn.type === "PHONE_NUMBER") return { type: "PHONE_NUMBER", text: btn.title, phoneNumber: btn.phoneNumber };
        return null;
      })
      .filter(Boolean),
  }));

// ─── Component ────────────────────────────────────────────────────────────────

const TemplateFormCarousel = () => {
  // Decode JWT
  const token = sessionStorage.getItem("authToken");
  let appId, authCode, idNombreUsuarioTalkMe, idBotRedes, urlTemplatesGS;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      appId = decoded.app_id;
      authCode = decoded.auth_code;
      idNombreUsuarioTalkMe = decoded.nombre_usuario;
      idBotRedes = decoded.id_bot_redes;
      urlTemplatesGS = decoded.urlTemplatesGS;
    } catch (e) {
      console.error("Error decodificando el token:", e);
    }
  }

  // ── Form setup ──────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(templateFormCarouselSchema),
    defaultValues: {
      templateName: "",
      selectedCategory: "",
      templateType: "CAROUSEL",
      languageCode: "es",
      vertical: "",
      message: "",
      variables: {},
      pantallas: [],
      carouselType: "IMAGE",
      cantidadBotones: "1",
      tipoBoton: "QUICK_REPLY",
      tipoBoton2: "QUICK_REPLY",
      cards: [createInitialCard()],
    },
  });

  const {
    fields: cardFields,
    append: appendCard,
    remove: removeCard,
    move: moveCard,
  } = useFieldArray({ control, name: "cards" });

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [displayPantallas, setDisplayPantallas] = useState([]);
  const [emojiCount, setEmojiCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [openEmojiCardId, setOpenEmojiCardId] = useState(null); // card fieldId or null
  const [example, setExample] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [urlErrors, setUrlErrors] = useState({}); // { [buttonId]: string }

  // ── Refs ────────────────────────────────────────────────────────────────────
  const messageRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiCardPickerRef = useRef(null);
  const debounceTimeout = useRef(null);
  const messageCardRefs = useRef({});

  // ── Watched values ──────────────────────────────────────────────────────────
  const watchedMessage = watch("message");
  const watchedVariables = watch("variables") ?? {};
  const watchedCards = watch("cards") ?? [];
  const watchedCantidadBotones = watch("cantidadBotones");
  const watchedTipoBoton = watch("tipoBoton");
  const watchedTipoBoton2 = watch("tipoBoton2");

  // ── Effects ─────────────────────────────────────────────────────────────────

  // Regenerate body example on message / variables change
  useEffect(() => {
    const examplesMap = Object.fromEntries(
      Object.entries(watchedVariables).map(([k, v]) => [k, v.example ?? ""])
    );
    setExample(replaceVariables(watchedMessage, examplesMap));
  }, [watchedMessage, watchedVariables]);

  // Debounce template-name duplicate check
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    const currentName = watch("templateName");
    if (!currentName?.trim()) return;
    debounceTimeout.current = setTimeout(async () => {
      const existe = await checkTemplateName(urlTemplatesGS, currentName, idBotRedes);
      if (existe === true)
        setError("templateName", { message: "Ya existe una plantilla con este nombre" });
      else if (existe === false) clearErrors("templateName");
      else setError("templateName", { message: "Error al validar el nombre. Intenta nuevamente." });
    }, 800);
    return () => clearTimeout(debounceTimeout.current);
  }, [watch("templateName"), idBotRedes]);

  // Sync button config → all cards when global config changes
  useEffect(() => {
    const count = parseInt(watchedCantidadBotones, 10);
    watchedCards.forEach((_, idx) => {
      setValue(
        `cards.${idx}.buttons`,
        generateButtonsFromConfig(count, watchedTipoBoton, watchedTipoBoton2)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCantidadBotones, watchedTipoBoton, watchedTipoBoton2]);

  // Close emoji pickers on outside click
  useClickOutside(emojiPickerRef, () => setShowEmojiPicker(false));
  useClickOutside(emojiCardPickerRef, () => setOpenEmojiCardId(null));

  // ── Reset ───────────────────────────────────────────────────────────────────
  const resetForm = () => {
    reset();
    setDisplayPantallas([]);
    setEmojiCount(0);
    setExample("");
    setOpenEmojiCardId(null);
    setUrlErrors({});
  };

  // ── Body-message variable helpers ────────────────────────────────────────────

  const handleAddVariable = () => {
    const currentVars = watch("variables") ?? {};
    const nextIndex = Object.keys(currentVars).length + 1;
    const newVariable = `{{${nextIndex}}}`;
    const currentMessage = watch("message");

    if (currentMessage.length + newVariable.length > MAX_BODY_CHARS) {
      Swal.fire({
        title: "Límite de caracteres",
        text: "No se pueden agregar más variables porque excede el máximo de 550 caracteres",
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#00c3ff",
      });
      return;
    }

    const cursor = messageRef.current?.selectionStart ?? currentMessage.length;
    const newMessage = `${currentMessage.substring(0, cursor)}${newVariable}${currentMessage.substring(cursor)}`;
    setValue("message", newMessage);
    setValue("variables", { ...currentVars, [newVariable]: { description: "", example: "" } });

    setTimeout(() => {
      if (messageRef.current) {
        messageRef.current.focus();
        messageRef.current.setSelectionRange(cursor + newVariable.length, cursor + newVariable.length);
      }
    }, 0);
  };

  const deleteVariable = (variableToDelete) => {
    const currentVars = watch("variables") ?? {};
    const currentMessage = watch("message");
    const remaining = Object.entries(currentVars).filter(([k]) => k !== variableToDelete);
    const newVars = {};
    const mapping = {};
    remaining.forEach(([oldKey, val], index) => {
      const newKey = `{{${index + 1}}}`;
      newVars[newKey] = val;
      mapping[oldKey] = newKey;
    });
    let newMessage = currentMessage.replace(variableToDelete, "");
    Object.entries(mapping).forEach(([old, newV]) => {
      newMessage = newMessage.replaceAll(old, newV);
    });
    setValue("message", newMessage);
    setValue("variables", newVars);
    messageRef.current?.focus();
  };

  const deleteAllVariables = () => {
    const currentMessage = watch("message");
    const currentVars = Object.keys(watch("variables") ?? {});
    let newMessage = currentMessage;
    currentVars.forEach((v) => { newMessage = newMessage.replaceAll(v, ""); });
    setValue("message", newMessage);
    setValue("variables", {});
    messageRef.current?.focus();
  };

  const handleUpdateDescription = (variable, event) => {
    const newValue = event.target.value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/gi, "n")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");
    const currentVars = watch("variables") ?? {};
    setValue(
      "variables",
      { ...currentVars, [variable]: { ...currentVars[variable], description: newValue } },
      { shouldValidate: true }
    );
  };

  const handleUpdateExample = (variable, value) => {
    const currentVars = watch("variables") ?? {};
    setValue(
      "variables",
      { ...currentVars, [variable]: { ...currentVars[variable], example: value } },
      { shouldValidate: true }
    );
  };

  // ── Body emoji ───────────────────────────────────────────────────────────────

  const handleEmojiClick = (emojiObject) => {
    const currentMessage = watch("message");
    const cursor = messageRef.current?.selectionStart ?? currentMessage.length;
    const newText = currentMessage.slice(0, cursor) + emojiObject.emoji + currentMessage.slice(cursor);
    const newEmojiCount = countEmojis(newText);

    if (newEmojiCount > MAX_EMOJIS) {
      Swal.fire({ title: "Límite de emojis", text: "Máximo 10 emojis", icon: "warning", confirmButtonText: "Entendido", confirmButtonColor: "#00c3ff" });
      setShowEmojiPicker(false);
      return;
    }
    if (newText.length > MAX_BODY_CHARS) {
      Swal.fire({ title: "Límite de caracteres", text: "Máximo 550 caracteres", icon: "warning", confirmButtonText: "Entendido", confirmButtonColor: "#00c3ff" });
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

  // ── Card management ──────────────────────────────────────────────────────────

  const addCard = () => {
    if (cardFields.length >= MAX_CARDS) {
      Swal.fire({ title: "Límite de tarjetas", text: `Máximo ${MAX_CARDS} tarjetas`, icon: "warning", confirmButtonText: "Entendido", confirmButtonColor: "#00c3ff" });
      return;
    }
    const count = parseInt(watchedCantidadBotones, 10);
    appendCard(createInitialCard(count, watchedTipoBoton, watchedTipoBoton2));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    moveCard(result.source.index, result.destination.index);
  };

  // ── Card message / variable helpers ──────────────────────────────────────────

  const handleBodyMessageCardChange = (cardIndex, newText) => {
    const newEmojiCount = countEmojis(newText);
    if (newEmojiCount > MAX_EMOJIS) {
      Swal.fire({ title: "Límite de emojis", text: "Máximo 10 emojis", icon: "warning", confirmButtonText: "Entendido", confirmButtonColor: "#00c3ff" });
      return;
    }
    if (newText.length > MAX_CARD_CHARS) {
      Swal.fire({ title: "Límite de caracteres", text: "Máximo 160 caracteres", icon: "warning", confirmButtonText: "Entendido", confirmButtonColor: "#00c3ff" });
      return;
    }

    const card = watch(`cards.${cardIndex}`);
    const currentVars = card.variablesCard || {};
    const detectedKeys = extractVariables(newText);
    const currentKeys = Object.keys(currentVars);
    const toAdd = detectedKeys.filter((k) => !currentKeys.includes(k));
    const toDelete = currentKeys.filter((k) => !newText.includes(k));

    if (toAdd.length > 0 || toDelete.length > 0) {
      const updated = { ...currentVars };
      toAdd.forEach((k) => { updated[k] = { description: "", example: "" }; });
      toDelete.forEach((k) => { delete updated[k]; });
      setValue(`cards.${cardIndex}.variablesCard`, updated);
    }

    setValue(`cards.${cardIndex}.messageCard`, newText);
    setValue(`cards.${cardIndex}.emojiCountCard`, newEmojiCount);
  };

  const handleEmojiClickCard = (emojiObject, cardIndex, cardFieldId) => {
    const card = watch(`cards.${cardIndex}`);
    const input = messageCardRefs.current[cardFieldId];
    const cursor = input?.selectionStart ?? (card.messageCard?.length ?? 0);
    const newText =
      (card.messageCard || "").slice(0, cursor) +
      emojiObject.emoji +
      (card.messageCard || "").slice(cursor);
    const newEmojiCount = countEmojis(newText);

    if (newEmojiCount > MAX_EMOJIS) {
      Swal.fire({ title: "Límite de emojis", text: "Máximo 10 emojis", icon: "warning", confirmButtonText: "Entendido", confirmButtonColor: "#00c3ff" });
      setOpenEmojiCardId(null);
      return;
    }

    setValue(`cards.${cardIndex}.messageCard`, newText);
    setValue(`cards.${cardIndex}.emojiCountCard`, newEmojiCount);
    setOpenEmojiCardId(null);
    setTimeout(() => {
      if (input) {
        input.focus();
        input.setSelectionRange(cursor + emojiObject.emoji.length, cursor + emojiObject.emoji.length);
      }
    }, 100);
  };

  const deleteVariableCard = (cardIndex, variableToDelete) => {
    const card = watch(`cards.${cardIndex}`);
    const currentVars = card.variablesCard || {};
    const remaining = Object.entries(currentVars).filter(([k]) => k !== variableToDelete);
    const newVars = {};
    const mapping = {};
    remaining.forEach(([oldKey, val], index) => {
      const newKey = `{{${index + 1}}}`;
      newVars[newKey] = val;
      mapping[oldKey] = newKey;
    });
    let newMessage = (card.messageCard || "").replace(variableToDelete, "");
    Object.entries(mapping).forEach(([old, newV]) => { newMessage = newMessage.replaceAll(old, newV); });
    setValue(`cards.${cardIndex}.messageCard`, newMessage);
    setValue(`cards.${cardIndex}.variablesCard`, newVars);
  };

  const deleteAllVariablesCard = (cardIndex) => {
    const card = watch(`cards.${cardIndex}`);
    let newMessage = card.messageCard || "";
    Object.keys(card.variablesCard || {}).forEach((v) => { newMessage = newMessage.replaceAll(v, ""); });
    setValue(`cards.${cardIndex}.messageCard`, newMessage);
    setValue(`cards.${cardIndex}.variablesCard`, {});
  };

  const handleUpdateDescriptionCard = (cardIndex, variable, event) => {
    const newValue = event.target.value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/gi, "n")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");
    const card = watch(`cards.${cardIndex}`);
    const currentVars = card.variablesCard || {};
    setValue(`cards.${cardIndex}.variablesCard`, {
      ...currentVars,
      [variable]: { ...currentVars[variable], description: newValue },
    }, { shouldValidate: true });
  };

  const handleUpdateExampleCard = (cardIndex, variable, value) => {
    const card = watch(`cards.${cardIndex}`);
    const currentVars = card.variablesCard || {};
    setValue(`cards.${cardIndex}.variablesCard`, {
      ...currentVars,
      [variable]: { ...currentVars[variable], example: value },
    }, { shouldValidate: true });
  };

  // ── Button management per card ────────────────────────────────────────────────

  const updateCardButton = (cardIndex, buttonId, key, value) => {
    const card = watch(`cards.${cardIndex}`);
    setValue(
      `cards.${cardIndex}.buttons`,
      card.buttons.map((btn) => (btn.id === buttonId ? { ...btn, [key]: value } : btn))
    );
    if (key === "url") {
      if (!value.trim()) {
        setUrlErrors((prev) => { const n = { ...prev }; delete n[buttonId]; return n; });
      } else if (value.length > 5) {
        const isValid = /^(ftp|http|https):\/\/[^ "]+$/.test(value);
        setUrlErrors((prev) => ({
          ...prev,
          [buttonId]: isValid ? undefined : "URL no válida. Debe comenzar con http://, https:// o ftp://",
        }));
      }
    }
  };

  // ── File upload per card ──────────────────────────────────────────────────────

  const handleFileUpload = (cardIndex, uploadData) => {
    if (uploadData) {
      setValue(`cards.${cardIndex}.fileData`, {
        url: uploadData.url,
        mediaId: uploadData.mediaId || null,
      });
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const iniciarRequest = handleSubmit(
    async (formData) => {
      if (loading) return;

      // Extra validation: cards must have media
      const cardsValid = formData.cards.every((card) => card.fileData?.url && card.messageCard?.trim());
      if (!cardsValid) {
        Swal.fire({
          title: "Advertencia",
          text: "La información de las tarjetas no está completa",
          footer: "Las tarjetas deben incluir imagen o video y contenido",
          icon: "warning",
          confirmButtonText: "Cerrar",
          confirmButtonColor: "#00c3ff",
        });
        return;
      }

      // Final name duplicate check before submit
      const existe = await checkTemplateName(urlTemplatesGS, formData.templateName, idBotRedes);
      if (existe === true) {
        setError("templateName", { message: "Ya existe una plantilla con este nombre" });
        Swal.fire({ title: "Error", text: "Ya existe una plantilla con este nombre.", icon: "error", confirmButtonText: "Cerrar", confirmButtonColor: "#00c3ff" });
        return;
      }

      setLoading(true);
      try {
        const formattedCards = formatCardsForGupshup(formData.cards);

        const result = await createTemplateCarouselGupshup(
          appId,
          authCode,
          {
            templateName: formData.templateName,
            selectedCategory: formData.selectedCategory,
            languageCode: formData.languageCode,
            templateType: formData.templateType,
            vertical: formData.vertical,
            message: formData.message,
            header: "",
            footer: "",
            mediaId: "",
            buttons: [],
            example,
            carousel: JSON.stringify(formattedCards),
          },
          idNombreUsuarioTalkMe,
          urlTemplatesGS
        );

        if (result?.status === "success" && result?.template?.id) {
          const templateId = result.template.id;

          await saveTemplateToTalkMe(
            templateId,
            {
              templateName: formData.templateName,
              templateType: formData.templateType,
              pantallas: formData.pantallas,
              selectedCategory: formData.selectedCategory,
              message: formData.message,
              uploadedUrl: "",
            },
            idNombreUsuarioTalkMe || "Sistema.TalkMe",
            Object.keys(formData.variables || {}),
            Object.fromEntries(
              Object.entries(formData.variables || {}).map(([k, v]) => [k, v.description])
            ),
            formData.cards,
            idBotRedes,
            urlTemplatesGS
          );

          resetForm();
          Swal.fire({ title: "¡Éxito!", text: "La plantilla fue creada correctamente.", icon: "success", confirmButtonText: "Aceptar", confirmButtonColor: "#00c3ff" });
        } else {
          Swal.fire({ title: "Error", text: result?.message || "La plantilla no pudo ser creada.", icon: "error", confirmButtonText: "Cerrar", confirmButtonColor: "#00c3ff" });
        }
      } catch (error) {
        console.error("Error al crear plantilla:", error);
        Swal.fire({ title: "Error", text: "Ocurrió un error inesperado.", icon: "error", confirmButtonText: "Cerrar", confirmButtonColor: "#00c3ff" });
      } finally {
        setLoading(false);
      }
    },
    (validationErrors) => {
      const labelMap = {
        templateName: "Nombre de la plantilla",
        selectedCategory: "Categoría",
        languageCode: "Idioma",
        vertical: "Etiquetas de plantilla",
        message: "Contenido",
        pantallas: "Pantallas",
        cards: "Tarjetas del carrusel",
      };
      const campos = Object.keys(validationErrors).map((k) => labelMap[k] || k);
      Swal.fire({
        title: "⚠️ Campos incompletos",
        html: `<div style="text-align:left;"><p style="margin-bottom:10px;">Por favor completa los siguientes campos:</p><ul style="margin:0;padding-left:20px;">${campos.map((c) => `<li style="margin:5px 0;">${c}</li>`).join("")}</ul></div>`,
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#00c3ff",
      });
    }
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Grid container sx={{ height: "calc(100vh - 16px)" }}>

      {/* ═══════════════════════ FORMULARIO (70%) ═══════════════════════ */}
      <Grid item xs={8} sx={{ height: "100%" }}>
        <Box sx={{ height: "100%", overflowY: "auto", px: 2, py: 2 }}>

          {/* Nombre de la plantilla */}
          <Box sx={{ width: "100%", mt: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormControl fullWidth>
              <FormLabel>*Nombre de la plantilla</FormLabel>
              <Controller
                name="templateName"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    onChange={(e) => {
                      const transformed = e.target.value
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/ñ/gi, "n")
                        .toLowerCase()
                        .replace(/\s+/g, "_")
                        .replace(/[^a-z0-9_]/g, "");
                      field.onChange(transformed);
                    }}
                    fullWidth
                    error={!!fieldState.error}
                    helperText={
                      fieldState.error?.message ??
                      "El nombre debe hacer referencia al contenido. Sin mayúsculas ni espacios."
                    }
                  />
                )}
              />
            </FormControl>
          </Box>

          {/* Categoría */}
          <Box sx={{ border: "1px solid #ddd", borderRadius: 2, mt: 2, p: 3 }}>
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
              <FormLabel>*Categoría</FormLabel>
              <Tooltip title="Tu plantilla debe pertenecer a una de estas categorías">
                <IconButton size="small"><HelpOutlineIcon fontSize="small" /></IconButton>
              </Tooltip>
            </Box>
            <Controller
              name="selectedCategory"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <RadioGroup
                    value={field.value}
                    onChange={(e) => { field.onChange(e.target.value); field.onBlur(); }}
                  >
                    <Stack spacing={2}>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <Paper
                          key={cat.id}
                          sx={{
                            p: 2,
                            cursor: cat.disabled ? "default" : "pointer",
                            opacity: cat.disabled ? 0.5 : 1,
                            border: fieldState.error && !field.value ? "1px solid red" : "none",
                            "&:hover": { bgcolor: cat.disabled ? "transparent" : (t) => alpha(t.palette.primary.main, 0.04) },
                          }}
                        >
                          <FormControlLabel
                            value={cat.id}
                            disabled={cat.disabled}
                            control={<Radio />}
                            label={
                              <Box sx={{ ml: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                  {cat.icon}
                                  <Typography variant="subtitle1" component="span">{cat.title}</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">{cat.description}</Typography>
                              </Box>
                            }
                            sx={{ margin: 0, width: "100%" }}
                          />
                        </Paper>
                      ))}
                    </Stack>
                  </RadioGroup>
                  {fieldState.error && <FormHelperText error>{fieldState.error.message}</FormHelperText>}
                </>
              )}
            />
          </Box>

          {/* Tipo de plantilla */}
          <Box sx={{ width: "100%", mt: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormLabel>*Tipo de plantilla</FormLabel>
            <Controller
              name="templateType"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error} sx={{ mt: 1 }}>
                  <Select {...field} disabled>
                    <MenuItem value="CAROUSEL">CARRUSEL</MenuItem>
                  </Select>
                  <FormHelperText>
                    {fieldState.error?.message ?? "Tipo de plantilla fijo para carruseles"}
                  </FormHelperText>
                </FormControl>
              )}
            />
          </Box>

          {/* Pantallas */}
          <Box sx={{ width: "100%", mt: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormLabel>Aplicar en estas pantallas</FormLabel>
            <Controller
              name="pantallas"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth sx={{ mt: 1 }} error={!!fieldState.error}>
                  <InputLabel id="pantallas-label">Selecciona una o más opciones</InputLabel>
                  <Select
                    labelId="pantallas-label"
                    multiple
                    value={displayPantallas}
                    input={<OutlinedInput label="Selecciona una o más opciones" />}
                    renderValue={(selected) => selected.join(", ")}
                    onChange={(event) => {
                      const value = event.target.value;
                      const selectedOptions = typeof value === "string" ? value.split(",") : value;
                      setDisplayPantallas(selectedOptions);
                      field.onChange(selectedOptions.map((o) => o.split(" - ")[0].trim()));
                    }}
                    onBlur={field.onBlur}
                  >
                    {PANTALLAS_TALKME.map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox checked={displayPantallas.indexOf(name) > -1} />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{fieldState.error?.message ?? ""}</FormHelperText>
                </FormControl>
              )}
            />
          </Box>

          {/* Idioma */}
          <Box sx={{ width: "100%", mt: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormLabel>*Idioma de plantilla</FormLabel>
            <Controller
              name="languageCode"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error} sx={{ mt: 1 }}>
                  <InputLabel id="lang-label">Selección</InputLabel>
                  <Select {...field} labelId="lang-label" label="Selección">
                    {Object.entries(LANGUAGE_MAP).map(([code, name]) => (
                      <MenuItem key={code} value={code}>
                        {name} ({code.toUpperCase()})
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {fieldState.error?.message ?? "Escoge el idioma de la plantilla"}
                  </FormHelperText>
                </FormControl>
              )}
            />
          </Box>

          {/* Etiquetas */}
          <Box sx={{ width: "100%", mt: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormLabel>*Etiquetas de plantilla</FormLabel>
            <Controller
              name="vertical"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  sx={{ mt: 1 }}
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ??
                    "Defina para qué caso de uso, por ejemplo: carrusel de productos, etc."
                  }
                />
              )}
            />
          </Box>

          {/* Contenido (body message) */}
          <Box sx={{ width: "100%", mt: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormLabel sx={{ fontSize: "1.1rem", fontWeight: "500", color: "#333" }}>
              *Contenido
            </FormLabel>
            <Box sx={{ position: "relative" }}>
              <Controller
                name="message"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={7}
                    label="Escribe"
                    placeholder="Ingresa el contenido de tu mensaje aquí..."
                    inputRef={messageRef}
                    error={!!fieldState.error}
                    onChange={(e) => {
                      let newText = e.target.value;
                      const newEmojiCount = countEmojis(newText);
                      if (newEmojiCount > MAX_EMOJIS) {
                        Swal.fire({ title: "Límite de emojis", text: "Máximo 10 emojis", icon: "warning", confirmButtonText: "Entendido", confirmButtonColor: "#00c3ff" });
                        return;
                      }
                      if (newText.length > MAX_BODY_CHARS) {
                        Swal.fire({ title: "Límite de caracteres", text: "Máximo 550 caracteres", icon: "warning", confirmButtonText: "Entendido", confirmButtonColor: "#00c3ff" });
                        return;
                      }
                      if (newText.includes("{{")) newText = renumberVariables(newText);
                      field.onChange(newText);
                      setEmojiCount(newEmojiCount);

                      // Sync variables from typed text
                      const currentVars = watch("variables") ?? {};
                      const detectedKeys = extractVariables(newText);
                      const currentKeys = Object.keys(currentVars);
                      const toAdd = detectedKeys.filter((k) => !currentKeys.includes(k));
                      const toDelete = currentKeys.filter((k) => !newText.includes(k));
                      if (toAdd.length > 0 || toDelete.length > 0) {
                        const updated = { ...currentVars };
                        toAdd.forEach((k) => { updated[k] = { description: "", example: "" }; });
                        toDelete.forEach((k) => { delete updated[k]; });
                        setValue("variables", updated);
                      }
                    }}
                    sx={{ mb: 3, mt: 4, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                    helperText={
                      fieldState.error?.message ??
                      `${field.value.length}/550 caracteres | ${emojiCount}/10 emojis`
                    }
                    FormHelperTextProps={{
                      sx: {
                        textAlign: "right",
                        color: field.value.length === MAX_BODY_CHARS || emojiCount >= MAX_EMOJIS ? "error.main" : "text.secondary",
                      },
                    }}
                  />
                )}
              />

              {/* Toolbar */}
              <Stack direction="row" spacing={1} sx={{ mb: 2, p: 1, borderRadius: 1, backgroundColor: "rgba(0,0,0,0.02)" }}>
                <Tooltip title="Agregar emojis">
                  <IconButton color="primary" onClick={() => setShowEmojiPicker(!showEmojiPicker)} sx={{ borderRadius: 1 }}>
                    <Smile size={20} />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem />
                <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleAddVariable} sx={{ borderRadius: 1 }}>
                  Agregar Variable
                </Button>
                {Object.keys(watchedVariables).length > 0 && (
                  <Button color="error" variant="outlined" size="small" startIcon={<ClearIcon />} onClick={deleteAllVariables} sx={{ ml: "auto", borderRadius: 1 }}>
                    Borrar todas
                  </Button>
                )}
              </Stack>

              {showEmojiPicker && (
                <Paper ref={emojiPickerRef} elevation={3} sx={{ position: "absolute", zIndex: 1000, mt: 1 }}>
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </Paper>
              )}

              {/* Variables */}
              {Object.keys(watchedVariables).length > 0 && (
                <Paper sx={{ my: 2, p: 2, borderRadius: 2, border: "1px solid #ddd" }}>
                  <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                    Agrega una descripción y un ejemplo a tu variable:
                  </Typography>
                  {Object.entries(watchedVariables).map(([variable], idx) => (
                    <Box key={idx} sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2, p: 1.5, bgcolor: "#fff", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                      <Chip
                        label={variable}
                        color="primary"
                        sx={{ fontWeight: "500" }}
                        deleteIcon={<Tooltip title="Borrar variable"><DeleteIcon /></Tooltip>}
                        onDelete={() => deleteVariable(variable)}
                      />
                      <Stack sx={{ flexGrow: 1, gap: 1 }}>
                        <TextField
                          size="small"
                          label="Descripción"
                          placeholder="¿Para qué sirve esta variable?"
                          value={watch("variables")?.[variable]?.description ?? ""}
                          onChange={(e) => handleUpdateDescription(variable, e)}
                          error={!!errors.variables?.[variable]?.description}
                          helperText={errors.variables?.[variable]?.description?.message ?? ""}
                          sx={{ flexGrow: 1 }}
                        />
                        <TextField
                          size="small"
                          label="Texto de ejemplo"
                          value={watch("variables")?.[variable]?.example ?? ""}
                          onChange={(e) => handleUpdateExample(variable, e.target.value)}
                          error={!!errors.variables?.[variable]?.example}
                          helperText={errors.variables?.[variable]?.example?.message ?? ""}
                          sx={{ flexGrow: 1 }}
                        />
                      </Stack>
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
          </Box>

          {/* ─── CARRUSEL ─────────────────────────────────────────────────── */}
          <Box sx={{ width: "100%", mt: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormLabel sx={{ fontSize: "1.1rem", fontWeight: "500", color: "#333", display: "block", mb: 1 }}>
              *Carrusel
            </FormLabel>
            <FormLabel sx={{ display: "block", mb: 2 }}>
              Agregue medios, botones y descripciones de tarjetas para sus tarjetas de carrusel.
            </FormLabel>

            {/* Global config */}
            <Controller
              name="carouselType"
              control={control}
              render={({ field }) => (
                <TextField select label="Tipo de carrusel" fullWidth sx={{ mb: 2 }} {...field}>
                  <MenuItem value="IMAGE">Imagen</MenuItem>
                  <MenuItem value="VIDEO">Video</MenuItem>
                </TextField>
              )}
            />

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Controller
                name="cantidadBotones"
                control={control}
                render={({ field }) => (
                  <TextField select label="Cantidad de botones" fullWidth {...field}>
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                  </TextField>
                )}
              />
              <Controller
                name="tipoBoton"
                control={control}
                render={({ field }) => (
                  <TextField select label="Tipo de botón 1" fullWidth {...field}>
                    <MenuItem value="QUICK_REPLY">Respuesta rápida</MenuItem>
                    <MenuItem value="URL">Link</MenuItem>
                    <MenuItem value="PHONE_NUMBER">Teléfono</MenuItem>
                  </TextField>
                )}
              />
              {watchedCantidadBotones === "2" && (
                <Controller
                  name="tipoBoton2"
                  control={control}
                  render={({ field }) => (
                    <TextField select label="Tipo de botón 2" fullWidth {...field}>
                      <MenuItem value="QUICK_REPLY">Respuesta rápida</MenuItem>
                      <MenuItem value="URL">Link</MenuItem>
                      <MenuItem value="PHONE_NUMBER">Teléfono</MenuItem>
                    </TextField>
                  )}
                />
              )}
            </Box>

            {/* Drag-and-drop card list */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="cards">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {cardFields.map((cardField, cardIndex) => {
                      const card = watchedCards[cardIndex] ?? {};
                      const cardVariables = card.variablesCard ?? {};
                      const cardErrors = errors.cards?.[cardIndex];

                      return (
                        <Draggable key={cardField.id} draggableId={cardField.id} index={cardIndex}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps}>
                              <Accordion
                                expanded={expanded === cardField.id}
                                onChange={(_, isExpanded) =>
                                  setExpanded(isExpanded ? cardField.id : false)
                                }
                                sx={{ mb: 2, border: cardErrors ? "1px solid #d32f2f" : "none" }}
                              >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                  <Box
                                    sx={{ display: "flex", alignItems: "center", width: "100%", cursor: "grab", "&:active": { cursor: "grabbing" } }}
                                    {...provided.dragHandleProps}
                                  >
                                    <DragIndicatorIcon sx={{ mr: 1, color: "text.secondary" }} />
                                    <Typography>Tarjeta {cardIndex + 1}</Typography>
                                    {cardErrors && (
                                      <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                                        — campos incompletos
                                      </Typography>
                                    )}
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => { e.stopPropagation(); removeCard(cardIndex); }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </AccordionSummary>

                                <AccordionDetails>
                                  {/* File upload */}
                                  <FileUploadCarousel
                                    carouselType={watch("carouselType")}
                                    onUploadSuccess={(uploadData) => handleFileUpload(cardIndex, uploadData)}
                                  />
                                  {cardErrors?.fileData && (
                                    <FormHelperText error sx={{ mt: 0.5 }}>
                                      {cardErrors.fileData.message ?? "Debes subir una imagen o video"}
                                    </FormHelperText>
                                  )}

                                  {/* Card message */}
                                  <Box sx={{ position: "relative", mt: 2 }}>
                                    <TextField
                                      fullWidth
                                      multiline
                                      rows={4}
                                      label="Escribe el mensaje de la tarjeta"
                                      placeholder="Ingresa el contenido aquí..."
                                      value={card.messageCard || ""}
                                      onChange={(e) => handleBodyMessageCardChange(cardIndex, e.target.value)}
                                      inputRef={(el) => (messageCardRefs.current[cardField.id] = el)}
                                      error={!!cardErrors?.messageCard}
                                      helperText={
                                        cardErrors?.messageCard?.message ??
                                        `${(card.messageCard || "").length}/160 caracteres | ${card.emojiCountCard || 0}/10 emojis`
                                      }
                                      FormHelperTextProps={{ sx: { textAlign: "right" } }}
                                      sx={{ mt: 2, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                                    />

                                    {/* Card toolbar */}
                                    <Stack direction="row" spacing={1} sx={{ mb: 2, p: 1, borderRadius: 1, backgroundColor: "rgba(0,0,0,0.02)" }}>
                                      <Tooltip title="Agregar emojis">
                                        <IconButton
                                          color="primary"
                                          onClick={() =>
                                            setOpenEmojiCardId(
                                              openEmojiCardId === cardField.id ? null : cardField.id
                                            )
                                          }
                                          sx={{ borderRadius: 1 }}
                                        >
                                          <Smile size={20} />
                                        </IconButton>
                                      </Tooltip>
                                      {Object.keys(cardVariables).length > 0 && (
                                        <Button
                                          color="error"
                                          variant="outlined"
                                          size="small"
                                          startIcon={<ClearIcon />}
                                          onClick={() => deleteAllVariablesCard(cardIndex)}
                                          sx={{ ml: "auto", borderRadius: 1 }}
                                        >
                                          Borrar todas
                                        </Button>
                                      )}
                                    </Stack>

                                    {openEmojiCardId === cardField.id && (
                                      <Paper ref={emojiCardPickerRef} elevation={3} sx={{ position: "absolute", zIndex: 1000 }}>
                                        <EmojiPicker
                                          onEmojiClick={(emoji) =>
                                            handleEmojiClickCard(emoji, cardIndex, cardField.id)
                                          }
                                        />
                                      </Paper>
                                    )}

                                    {/* Card variables */}
                                    {Object.keys(cardVariables).length > 0 && (
                                      <Paper sx={{ my: 2, p: 2, borderRadius: 2, border: "1px solid #ddd" }}>
                                        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                                          Agrega una descripción y un ejemplo a tu variable:
                                        </Typography>
                                        {Object.entries(cardVariables).map(([variable], varIdx) => (
                                          <Box
                                            key={varIdx}
                                            sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2, p: 1.5, bgcolor: "#fff", borderRadius: 1, border: "1px solid #e0e0e0" }}
                                          >
                                            <Chip
                                              label={variable}
                                              color="primary"
                                              sx={{ fontWeight: "500" }}
                                              deleteIcon={<Tooltip title="Borrar variable"><DeleteIcon /></Tooltip>}
                                              onDelete={() => deleteVariableCard(cardIndex, variable)}
                                            />
                                            <Stack sx={{ flexGrow: 1, gap: 1 }}>
                                              <TextField
                                                size="small"
                                                label="Descripción"
                                                placeholder="¿Para qué sirve esta variable?"
                                                value={cardVariables[variable]?.description ?? ""}
                                                onChange={(e) =>
                                                  handleUpdateDescriptionCard(cardIndex, variable, e)
                                                }
                                                error={!!cardErrors?.variablesCard?.[variable]?.description}
                                                helperText={
                                                  cardErrors?.variablesCard?.[variable]?.description?.message ?? ""
                                                }
                                                sx={{ flexGrow: 1 }}
                                              />
                                              <TextField
                                                size="small"
                                                label="Texto de ejemplo"
                                                value={cardVariables[variable]?.example ?? ""}
                                                onChange={(e) =>
                                                  handleUpdateExampleCard(cardIndex, variable, e.target.value)
                                                }
                                                error={!!cardErrors?.variablesCard?.[variable]?.example}
                                                helperText={
                                                  cardErrors?.variablesCard?.[variable]?.example?.message ?? ""
                                                }
                                                sx={{ flexGrow: 1 }}
                                              />
                                            </Stack>
                                          </Box>
                                        ))}
                                      </Paper>
                                    )}
                                  </Box>

                                  {/* Card buttons */}
                                  <Stack spacing={2} sx={{ mt: 2 }}>
                                    {(card.buttons ?? []).map((button, btnIdx) => (
                                      <Box
                                        key={button.id}
                                        sx={{ display: "flex", alignItems: "flex-start", gap: 2, border: "1px solid #ccc", borderRadius: 2, p: 2, bgcolor: "#f9f9f9" }}
                                      >
                                        <TextField
                                          label="Título del botón"
                                          value={button.title || ""}
                                          onChange={(e) =>
                                            updateCardButton(cardIndex, button.id, "title", e.target.value)
                                          }
                                          fullWidth
                                          inputProps={{ maxLength: 25 }}
                                          error={!!cardErrors?.buttons?.[btnIdx]?.title}
                                          helperText={
                                            cardErrors?.buttons?.[btnIdx]?.title?.message ??
                                            `${(button.title || "").length}/25 caracteres`
                                          }
                                        />
                                        <Select
                                          value={button.type || "QUICK_REPLY"}
                                          disabled
                                          sx={{ minWidth: 150 }}
                                        >
                                          <MenuItem value="QUICK_REPLY">Respuesta rápida</MenuItem>
                                          <MenuItem value="URL">URL</MenuItem>
                                          <MenuItem value="PHONE_NUMBER">Número de teléfono</MenuItem>
                                        </Select>
                                        {button.type === "URL" && (
                                          <TextField
                                            label="URL"
                                            value={button.url || ""}
                                            onChange={(e) =>
                                              updateCardButton(cardIndex, button.id, "url", e.target.value)
                                            }
                                            fullWidth
                                            error={!!urlErrors[button.id]}
                                            helperText={urlErrors[button.id] ?? ""}
                                          />
                                        )}
                                        {button.type === "PHONE_NUMBER" && (
                                          <TextField
                                            label="Número de teléfono"
                                            value={button.phoneNumber || ""}
                                            onChange={(e) =>
                                              updateCardButton(cardIndex, button.id, "phoneNumber", e.target.value)
                                            }
                                            fullWidth
                                            error={!!cardErrors?.buttons?.[btnIdx]?.phoneNumber}
                                            helperText={cardErrors?.buttons?.[btnIdx]?.phoneNumber?.message ?? ""}
                                          />
                                        )}
                                        <Box sx={{ display: "flex", alignItems: "center", pt: 1 }}>
                                          {button.type === "QUICK_REPLY" && <ArrowForward color="action" />}
                                          {button.type === "URL" && <LinkIcon color="action" />}
                                          {button.type === "PHONE_NUMBER" && <PhoneIcon color="action" />}
                                        </Box>
                                      </Box>
                                    ))}
                                  </Stack>
                                </AccordionDetails>
                              </Accordion>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addCard}
                disabled={cardFields.length >= MAX_CARDS}
              >
                Añadir tarjeta
              </Button>
              <Typography variant="body2" color={cardFields.length >= MAX_CARDS ? "error" : "text.secondary"}>
                {cardFields.length} / {MAX_CARDS} tarjetas
              </Typography>
            </Box>

            {/* Root-level cards error (e.g. "min 1 tarjeta") */}
            {errors.cards && !Array.isArray(errors.cards) && (
              <FormHelperText error sx={{ mt: 1 }}>
                {errors.cards.message}
              </FormHelperText>
            )}
          </Box>

          {/* Submit */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2, mb: 10 }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={iniciarRequest}
              sx={{ mt: 3, mb: 3 }}
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? "Enviando..." : "Enviar solicitud"}
            </Button>
          </Box>
        </Box>
      </Grid>

      {/* ═══════════════════════ PREVIEW (30%) ═══════════════════════════ */}
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
                <SwiperSlide key={cardFields[index]?.id ?? index}>
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

export default TemplateFormCarousel;