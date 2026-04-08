import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Checkbox, Chip, Divider, FormControl, FormControlLabel, FormLabel, FormHelperText, Grid, IconButton, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, Snackbar, Stack, TextField, Tooltip, Typography, alpha } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editTemplateCatalogFormSchema } from "../schemas/EditTemplateCatalogFormSchema.ts";

import { Smile } from "react-feather";
import EmojiPicker from "emoji-picker-react";

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
import AccountTreeIcon from '@mui/icons-material/AccountTree';

import { editTemplateCatalogGupshup } from '../../../api/gupshupApi.jsx';
import { editTemplateToTalkMe, obtenerPantallasMedia, obtenerParametros } from '../../../api/templatesGSApi.jsx';
import { useClickOutside } from '../../../utils/emojiClick.jsx';

const SAMPLE_MEDIA_REGEX = /^\d+::[A-Za-z0-9+/._=-]+(?::[A-Za-z0-9+/._=-]+)+$/;

const isValidSampleMedia = (value) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const lines = trimmed.split('\n').map(l => l.trim()).filter(l => l);
  return lines.length > 0 && lines.every(line => SAMPLE_MEDIA_REGEX.test(line));
};

const CATEGORY_OPTIONS = [
  {
    id: 'MARKETING',
    title: 'Marketing',
    description: 'Envía ofertas promocionales, ofertas de productos y más para aumentar la conciencia y el compromiso.',
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

const PANTALLAS_TALKME = [
  '0 - Notificaciones',
  '1 - Contactos',
  '2 - Recontacto',
  '3 - Historial',
  '4 - Broadcast',
  '5 - Operador/Supervisor',
];

const LANGUAGE_MAP = {
  es: "Español",
  en: "Inglés",
  fr: "Francés",
};

const CHAR_LIMIT = 60;

const EditTemplateCatalogForm = () => {
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
  const [emojiCount, setEmojiCount] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [mediaURL, setMediaURL] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [displayPantallas, setDisplayPantallas] = useState([]);
  const [pantallasIniciales, setPantallasIniciales] = useState([]);

  // Estado separado para pantallas (solo se guarda en TalkMe)
  const [pantallasState, setPantallasState] = useState([]);
  const [pantallasError, setPantallasError] = useState(false);
  const [pantallasHelperText, setPantallasHelperText] = useState("");

  const messageRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(editTemplateCatalogFormSchema),
    defaultValues: {
      templateName: "",
      selectedCategory: "",
      templateType: "CATALOG",
      languageCode: "es",
      vertical: "",
      message: "",
      header: "",
      footer: "",
      mediaId: "",
      buttons: [],
      variables: {},
      uploadedUrl: "",
    },
  });

  const watchedTemplateType = watch("templateType");
  const watchedMessage = watch("message");
  const watchedHeader = watch("header");
  const watchedFooter = watch("footer");
  const watchedVariables = watch("variables") ?? {};

  // Cargar datos iniciales desde templateData
  useEffect(() => {
    const loadData = async () => {
      if (templateData) {
        console.log("templateData: ", templateData);

        // Campos deshabilitados - no se pueden cambiar
        setValue("templateName", templateData.elementName || "", { shouldValidate: false });
        setValue("selectedCategory", templateData.category || "", { shouldValidate: false });
        setValue("templateType", "CATALOG", { shouldValidate: false });
        setValue("languageCode", templateData.languageCode || "es", { shouldValidate: false });
        setValue("vertical", templateData.vertical || "", { shouldValidate: false });

        if (templateData.containerMeta) {
          try {
            const meta = JSON.parse(templateData.containerMeta);
            setValue("message", meta.data || "", { shouldValidate: false });
            setValue("header", meta.header || "", { shouldValidate: false });
            setValue("footer", meta.footer || "", { shouldValidate: false });

            if (meta.sampleMedia && isValidSampleMedia(meta.sampleMedia)) {
              setValue("mediaId", meta.sampleMedia, { shouldValidate: false });
            } else {
              setValue("mediaId", "", { shouldValidate: false });
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

            // Guardar pantallas en estado separado (solo para TalkMe)
            setPantallasState(pantallasArray);
            setPantallasIniciales(pantallasArray);

            const displayValues = procesarPantallasAPI(pantallasFromAPI);
            setDisplayPantallas(displayValues);

            setMediaURL(info.url || "");
            setImagePreview(info.url || "");
            setIdPlantilla(info.id_plantilla || "");
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

  // Actualizar ejemplo preview cuando cambian variables o mensaje
  useEffect(() => {
    const updateExample = () => {
      const message = getValues("message") || "";
      const variables = getValues("variables") || {};
      const examplesMap = Object.fromEntries(
        Object.entries(variables).map(([key, val]) => [key, val?.example ?? ""])
      );
      const newExample = replaceVariables(message, examplesMap);
    };
    updateExample();
  }, [watchedMessage, watchedVariables, getValues]);

  const procesarPantallasAPI = (pantallasString) => {
    if (!pantallasString) return [];

    const pantallasArray = pantallasString.split(',');
    const displayValues = pantallasArray.map(pantallaNum => {
      const pantallaOption = PANTALLAS_TALKME.find(option =>
        option.startsWith(pantallaNum.trim() + ' -')
      );
      return pantallaOption || pantallaNum;
    });

    return displayValues;
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
    const inputValue = value;
    const newValue = inputValue
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

  // Manejador para cambiar las pantallas (solo se guarda en TalkMe)
  const handlePantallasChange = (event) => {
    const { target: { value } } = event;
    const selectedOptions = typeof value === 'string' ? value.split(',') : value;

    const numericValues = selectedOptions.map(option => {
      return option.split(' - ')[0].trim();
    });

    // Actualizar el estado local de pantallas
    setPantallasState(numericValues);
    setDisplayPantallas(selectedOptions);

    // Limpiar error si se seleccionó al menos una pantalla
    if (numericValues.length > 0) {
      setPantallasError(false);
      setPantallasHelperText("");
    }
  };

  const onSubmit = async (formData) => {
    console.log("🚀🚀🚀 FUNCIÓN onSubmit EJECUTADA 🚀🚀🚀");
    console.log("formData recibido:", formData);
    console.log("pantallasState:", pantallasState);
    console.log("pantallasIniciales:", pantallasIniciales);

    if (loading) return;
    setLoading(true);

    // === VALIDACIÓN COMÚN: Pantallas ===
    if (pantallasState.length === 0) {
      console.log("❌ Validación fallida: No hay pantallas seleccionadas");
      setPantallasError(true);
      setPantallasHelperText("Debes seleccionar al menos una pantalla");
      setLoading(false);
      return;
    }
    console.log("✅ Pantallas seleccionadas:", pantallasState);

    // === DETECCIÓN TEMPRANA: ¿Solo cambiaron las pantallas? ===
    const pantallasModificadas =
      JSON.stringify([...pantallasState].sort()) !==
      JSON.stringify([...pantallasIniciales].sort());

    const originalMeta = (() => {
      try {
        return JSON.parse(templateData.containerMeta || "{}");
      } catch {
        return {};
      }
    })();

    const mensajeOriginal = originalMeta.data || "";
    const headerOriginal = originalMeta.header || "";
    const footerOriginal = originalMeta.footer || "";
    const mediaIdOriginal = originalMeta.sampleMedia || "";

    const messageChanged = formData.message !== mensajeOriginal;
    const headerChanged = formData.header !== headerOriginal;
    const footerChanged = formData.footer !== footerOriginal;
    const mediaIdChanged = formData.mediaId !== mediaIdOriginal;

    const gupshupSinCambios =
      !messageChanged &&
      !headerChanged &&
      !footerChanged &&
      !mediaIdChanged;

    const soloCambioPantallas = pantallasModificadas && gupshupSinCambios;

    console.log("=== DEBUG COMPARACIONES ===");
    console.log("formData.mediaId:", JSON.stringify(formData.mediaId));
    console.log("mediaIdOriginal:", JSON.stringify(mediaIdOriginal));
    console.log("messageChanged:", messageChanged);
    console.log("headerChanged:", headerChanged);
    console.log("footerChanged:", footerChanged);
    console.log("mediaIdChanged:", mediaIdChanged);
    console.log("=== DECISIÓN ===");
    console.log("pantallasModificadas:", pantallasModificadas);
    console.log("gupshupSinCambios:", gupshupSinCambios);
    console.log("soloCambioPantallas:", soloCambioPantallas);

    // === VARIABLES (necesarias para ambos casos) ===
    const variables = formData.variables || {};
    const variableKeys = Object.keys(variables);
    const variableDescriptions = {};
    const variableExamples = {};

    Object.entries(variables).forEach(([key, val]) => {
      variableDescriptions[key] = val?.description || "";
      variableExamples[key] = val?.example || "";
    });

    // === CASO 1: Solo se modificaron pantallas → Actualizar solo TalkMe ===
    if (soloCambioPantallas) {
      console.log("🎯 CASO 1: Solo se modificaron pantallas - Actualizando solo TalkMe");

      // Usar la URL original de la imagen (mediaURL del estado, que viene de la API)
      const urlImagen = mediaURL || uploadedUrl;

      // Construir payload con valores originales, SOLO actualizar pantallas
      const talkMePayload = {
        templateName: templateData.elementName,
        selectedCategory: templateData.category,
        message: formData.message,
        uploadedUrl: urlImagen,
        templateType: templateData.templateType
      };

      const result2 = await editTemplateToTalkMe(
        templateData.id,
        talkMePayload,
        idNombreUsuarioTalkMe,
        variableKeys,
        variableDescriptions,
        [],
        urlTemplatesGS,
        idBotRedes,
        [], // buttons (vacío para catálogo)
        pantallasState.join(','),
        urlImagen,
        true  // ← skipParamsAndButtons: solo actualizar pantallas
      );

      console.log("Resultado de editTemplateToTalkMe:", result2);

      if (result2?.status === "success") {
        console.log("✅ Actualización de pantallas exitosa");
        Swal.fire({
          title: 'Éxito',
          text: 'Las pantallas se actualizaron correctamente.',
          icon: 'success',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#00c3ff'
        });
        navigate('/Dashboard');
      } else {
        console.log("❌ Error en actualización de pantallas:", result2);
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

    // === CASO 2: Hay cambios en Gupshup → Validaciones adicionales ===
    console.log("🎯 CASO 2: Hay cambios en Gupshup - Validando y actualizando");

    const descriptions = Object.values(variables).map(v => v?.description).filter(Boolean);
    const uniqueDescriptions = new Set(descriptions);
    if (descriptions.length !== uniqueDescriptions.size) {
      console.log("❌ Validación fallida: Descripciones duplicadas");
      Swal.fire({
        title: 'Error',
        text: 'Las descripciones de las variables no pueden duplicarse.',
        icon: 'warning',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#00c3ff'
      });
      setLoading(false);
      return;
    }

    // Preparar payload para Gupshup (plantilla catálogo)
    const templatePayload = {
      elementName: formData.templateName,
      category: formData.selectedCategory,
      languageCode: formData.languageCode,
      templateType: "CATALOG",
      vertical: formData.vertical,
      content: formData.message,
      header: formData.header,
      footer: formData.footer,
      sample: formData.message,
      mediaId: formData.mediaId,
    };

    const result = await editTemplateCatalogGupshup(
      appId,
      authCode,
      templatePayload,
      templateData.id,
      idNombreUsuarioTalkMe,
      urlTemplatesGS
    );

    console.log("Resultado de actualización Gupshup:", result);

    if (result?.status === "success") {
      console.log("✅ Actualización Gupshup exitosa");

      const result2 = await editTemplateToTalkMe(
        result.template.id,
        {
          templateName: formData.templateName,
          selectedCategory: formData.selectedCategory,
          message: formData.message,
          uploadedUrl: uploadedUrl || formData.uploadedUrl,
          templateType: formData.templateType
        },
        idNombreUsuarioTalkMe,
        variableKeys,
        variableDescriptions,
        [],
        urlTemplatesGS,
        idBotRedes,
        [], // buttons (vacío para catálogo)
        pantallasState.join(','),
        mediaURL
      );

      console.log("Resultado de actualización TalkMe:", result2);

      if (result2?.status === "success") {
        console.log("✅ Actualización completa exitosa");
        Swal.fire({
          title: 'Éxito',
          text: 'La plantilla se actualizó correctamente.',
          icon: 'success',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#00c3ff'
        });
        navigate('/Dashboard');
      } else {
        console.log("❌ Error en actualización TalkMe:", result2);
        Swal.fire({
          title: 'Error al actualizar en TalkMe',
          text: `Error: ${result2?.message || 'Ocurrió un problema, intenta nuevamente.'}`,
          icon: 'error',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#00c3ff'
        });
      }
    } else {
      console.log("❌ Error en actualización Gupshup:", result);
      Swal.fire({
        title: 'Error al editar plantilla catálogo',
        text: `Error: ${result?.message || 'Ocurrió un problema, intenta nuevamente.'}`,
        icon: 'warning',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#00c3ff'
      });
    }

    setLoading(false);
    console.log("=== FIN onSubmit ===");
  };

  useClickOutside(emojiPickerRef, () => setShowEmojiPicker(false));

  return (
    <Grid container spacing={2} sx={{ height: '100vh' }}>
      {/* Formulario (70%) */}
      <Grid item xs={8}>
        <Box sx={{ height: '100%', overflowY: 'auto', pr: 2 }}>

          {/* Template Name - DESHABILITADO */}
          <Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="template-name-input">
                *Nombre de la plantilla
              </FormLabel>
              <Controller
                name="templateName"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    id="template-name-input"
                    {...field}
                    fullWidth
                    disabled
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? "El nombre no se puede modificar"}
                  />
                )}
              />
            </FormControl>
          </Box>

          {/* Categoría - DESHABILITADA */}
          <Box sx={{ maxWidth: '100%', border: "1px solid #ddd", borderRadius: 2, marginTop: 2, p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControl fullWidth>
                <FormLabel>*Categoría</FormLabel>
              </FormControl>
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
                      <Paper
                        key={category.id}
                        sx={{
                          p: 2,
                          opacity: category.disabled ? 0.5 : 1,
                          bgcolor: "rgba(0,0,0,0.02)"
                        }}
                      >
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

          {/* Tipo de plantilla - CATÁLOGO FIJO */}
          <Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormLabel>*Tipo de plantilla</FormLabel>
            <Controller
              name="templateType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <Select {...field} disabled>
                    <MenuItem value="CATALOG">CATÁLOGO</MenuItem>
                  </Select>
                  <FormHelperText>
                    Tipo de plantilla fijo: Catálogo
                  </FormHelperText>
                </FormControl>
              )}
            />
          </Box>

          {/* Selección de pantallas TalkMe - EDITABLE (solo se guarda en TalkMe) */}
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
              {pantallasError && (
                <FormHelperText error>{pantallasHelperText}</FormHelperText>
              )}
              <FormHelperText>
                Selecciona las pantallas de TalkMe donde estará disponible esta plantilla
              </FormHelperText>
            </FormControl>
          </Box>

          {/* Header - opcional */}
          <Box sx={{ width: '100%', marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2, display: 'none' }}>
            <FormLabel>Encabezado</FormLabel>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
              Agregue un encabezado de 60 caracteres. Las variables no se admiten en el encabezado.
            </Typography>
            <Controller
              name="header"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Escribe el encabezado"
                  onChange={(e) => {
                    if (e.target.value.length <= CHAR_LIMIT) {
                      field.onChange(e.target.value);
                    }
                  }}
                  helperText={`${field.value?.length || 0} / ${CHAR_LIMIT} caracteres`}
                  error={field.value?.length === CHAR_LIMIT}
                  sx={{ mb: 3 }}
                />
              )}
            />
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
                      <MenuItem key={code} value={code}>
                        {name} ({code.toUpperCase()})
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    El idioma no se puede modificar después de la creación
                  </FormHelperText>
                </FormControl>
              )}
            />
          </Box>

          {/* Etiquetas de plantilla (vertical) - DESHABILITADO */}
          <Box sx={{ width: '100%', marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormLabel>*Etiquetas de plantilla</FormLabel>
            <Controller
              name="vertical"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  sx={{ mt: 1 }}
                  disabled
                  helperText="Las etiquetas no se pueden modificar después de la creación"
                />
              )}
            />
          </Box>

          {/* Body Message */}
          <Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
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

                      if (newEmojiCount > 10) {
                        Swal.fire({
                          title: 'Límite de emojis',
                          text: 'Máximo 10 emojis',
                          icon: 'warning',
                          confirmButtonText: 'Entendido',
                          confirmButtonColor: '#00c3ff'
                        });
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
                        return;
                      }

                      if (newText.includes("{{")) {
                        newText = renumberVariables(newText);
                      }

                      field.onChange(newText);
                      setEmojiCount(newEmojiCount);

                      const currentVariables = getValues("variables") ?? {};
                      const detectedKeys = extractVariables(newText);
                      const currentKeys = Object.keys(currentVariables);

                      const toAdd = detectedKeys.filter(k => !currentKeys.includes(k));
                      const toDelete = currentKeys.filter(k => !newText.includes(k));

                      if (toAdd.length > 0 || toDelete.length > 0) {
                        const updated = { ...currentVariables };

                        toAdd.forEach(k => {
                          updated[k] = { description: "", example: "" };
                        });

                        toDelete.forEach(k => {
                          delete updated[k];
                        });

                        setValue("variables", updated);
                      }
                    }}
                    sx={{ mb: 3, mt: 4, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                    helperText={
                      fieldState.error?.message
                      ?? `${field.value?.length || 0}/550 caracteres | ${emojiCount}/10 emojis`
                    }
                    FormHelperTextProps={{
                      sx: {
                        textAlign: 'right',
                        color: (field.value?.length === 550 || emojiCount >= 10) ? 'error.main' : 'text.secondary',
                      },
                    }}
                  />
                )}
              />

              {/* Toolbar de emojis y variables */}
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
                  <Button color="error" variant="contained" size="small" startIcon={<ClearIcon />} onClick={deleteAllVariables} sx={{ ml: "auto", borderRadius: 1 }}>
                    BORRAR TODAS
                  </Button>
                )}
              </Stack>

              {/* Emoji Picker */}
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
                  {Object.entries(watchedVariables).map(([variable, value]) => (
                    <Box key={variable} sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2, p: 1.5, backgroundColor: "#fff", borderRadius: 1, border: "1px solid #e0e0e0" }}>
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
                          value={value?.description ?? ""}
                          onChange={(e) => handleUpdateDescriptions(variable, e.target.value)}
                          error={!!errors.variables?.[variable]?.description}
                          helperText={errors.variables?.[variable]?.description?.message ?? ""}
                          sx={{ flexGrow: 1 }}
                        />
                        <TextField
                          size="small"
                          label="Texto de ejemplo"
                          value={value?.example ?? ""}
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

          {/* Footer */}
          <Box sx={{ width: '100%', marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2, display: 'none' }}>
            <FormLabel>Pie de página</FormLabel>
            <Controller
              name="footer"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  sx={{ mt: 1, mb: 3 }}
                  onChange={(e) => {
                    if (e.target.value.length <= CHAR_LIMIT) {
                      field.onChange(e.target.value);
                    }
                  }}
                  helperText={`${field.value?.length || 0} / ${CHAR_LIMIT} caracteres`}
                />
              )}
            />
            <FormHelperText>
              Las variables no se admiten en el pie de página.
            </FormHelperText>
          </Box>

          {/* Botón Enviar */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={async () => {
                console.log("🖱️ Botón clickeado");
                console.log("loading:", loading);
                console.log("isSubmitting:", isSubmitting);

                try {
                  console.log("📞 Llamando a handleSubmit...");
                  await handleSubmit(
                    async (data) => {
                      console.log("✅ handleSubmit ejecutó el callback con data:", data);
                      await onSubmit(data);
                    },
                    (validationErrors) => {
                      console.error("❌ Errores de validación del formulario:", validationErrors);
                      const errorMessages = Object.entries(validationErrors)
                        .map(([field, error]) => {
                          if (error?.message) return `${field}: ${error.message}`;
                          if (typeof error === 'object') {
                            return Object.entries(error)
                              .map(([subKey, subError]) => {
                                if (subError?.message) return `${field}.${subKey}: ${subError.message}`;
                                if (typeof subError === 'object') {
                                  return Object.entries(subError)
                                    .filter(([, v]) => v?.message)
                                    .map(([k, v]) => `${field}.${subKey}.${k}: ${v.message}`)
                                    .join('\n');
                                }
                                return '';
                              })
                              .filter(Boolean)
                              .join('\n');
                          }
                          return '';
                        })
                        .filter(Boolean)
                        .join('\n');

                      Swal.fire({
                        title: 'Errores de validación',
                        html: `<pre style="text-align:left;font-size:13px;max-height:300px;overflow:auto">${errorMessages}</pre>`,
                        icon: 'warning',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#00c3ff'
                      });
                    }
                  )();
                } catch (error) {
                  console.error("❌ Error en handleSubmit:", error);
                  console.error("Error details:", error.message);
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
          <Box sx={{ p: 3, bgcolor: "#fef9f3", height: "100%", borderRadius: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6" gutterBottom>Vista previa</Typography>

            {imagePreview && (
              <Box sx={{ bgcolor: "#ffffff", p: 1, borderRadius: 2, boxShadow: 1, maxWidth: "100%" }}>
                {typeof imagePreview === "string" && imagePreview.startsWith("data:image") ? (
                  <img src={imagePreview} alt="Vista previa" style={{ width: "100%", maxHeight: "300px", borderRadius: 2, display: "block" }} />
                ) : imagePreview.includes("video") ? (
                  <video controls width="100%" style={{ maxHeight: "300px", objectFit: "contain" }}>
                    <source src={imagePreview} />
                  </video>
                ) : imagePreview.includes("pdf") ? (
                  <iframe src={imagePreview} width="100%" height="300px" title="preview pdf" />
                ) : (imagePreview.includes(".doc") || imagePreview.includes(".xls") || imagePreview.includes(".ppt")) ? (
                  <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(imagePreview)}`} width="100%" height="300px" frameBorder="0" title="preview office" />
                ) : <img src={imagePreview} alt="Vista previa" style={{ width: "100%", maxHeight: "300px", borderRadius: 2, display: "block", objectFit: "contain" }} />}
              </Box>
            )}
            {uploadStatus && <p>{uploadStatus}</p>}

            {/* Burbuja de WhatsApp */}
            <Box sx={{ bgcolor: "#ffffff", p: 1, borderRadius: 2, maxWidth: "100%", minHeight: "40px", display: "flex", flexDirection: "column", gap: 0.5, boxShadow: 1, overflowY: "auto", overflowX: "hidden" }}>
              <Typography variant="body1" color="text.primary">{watchedHeader}</Typography>
              <Typography variant="body1" color="text.primary" sx={{ fontFamily: "Helvetica Neue, Arial, sans-serif", whiteSpace: "pre-line", overflowWrap: "break-word" }}>
                {(() => {
                  const message = getValues("message") || "";
                  const variables = getValues("variables") || {};
                  const examplesMap = Object.fromEntries(
                    Object.entries(variables).map(([key, val]) => [key, val?.example ?? ""])
                  );
                  return replaceVariables(message, examplesMap);
                })()}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontFamily: "Helvetica Neue, Arial, sans-serif", whiteSpace: "pre-line" }}>
                {watchedFooter}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "flex-end" }}>
                {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: true })}
              </Typography>
            </Box>

            {/* Botón de CATÁLOGO (siempre presente) */}
            <Stack spacing={1} sx={{ mt: 0 }}>
              <Box
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
                <ArrowForward sx={{ fontSize: "16px", color: "#075e54" }} />
                <Typography variant="body1" sx={{ fontWeight: "medium", color: "#075e54", fontSize: "14px" }}>
                  CATÁLOGO
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default EditTemplateCatalogForm;