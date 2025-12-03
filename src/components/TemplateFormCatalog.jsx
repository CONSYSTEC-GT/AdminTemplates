import React, { useState, useRef, useEffect } from 'react';
import { Alert, Box, Button, Checkbox, Chip, Container, Divider, FormControl, FormControlLabel, FormLabel, FormHelperText, Grid, Grid2, IconButton, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, Snackbar, Stack, TextField, Tooltip, Typography, alpha } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

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


import FileUploadComponent from './FileUploadComponent';
import { isValidURL, updateButtonWithValidation } from '../utils/validarUrl';
import { createTemplateCatalogGupshup } from '../api/gupshupApi';
import { saveTemplateToTalkMe, validarNombrePlantillas } from '../api/templatesGSApi';
import { useClickOutside } from '../utils/emojiClick';

import { CustomDialog } from '../utils/CustomDialog';

const TemplateForm = () => {

  const [loading, setLoading] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [templateType, setTemplateType] = useState("CATALOG");
  const [templateNameHelperText, setTemplateNameHelperText] = useState("El nombre debe hacer referencia al contenido de la plantilla. No se permite el uso de letras mayúsculas ni espacios en blanco.");
  const [templateNameError, setTemplateNameError] = useState(false);
  const [pantallas, setPantallas] = useState([]);
  const [displayPantallas, setDisplayPantallas] = useState([]);
  const [pantallasError, setPantallasError] = useState(false);
  const [pantallasHelperText, setPantallasHelperText] = useState("");
  const [vertical, setVertical] = useState("");
  const [message, setMessage] = useState("");
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

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [variables, setVariables] = useState([]);
  const [emojiCount, setEmojiCount] = useState(0);

  const [variableExamples, setVariableExamples] = useState({});
  const [variableExamplesError, setvariableExamplesError] = useState(false);
  const [variableExamplesHelperText, setvariableExamplesHelperText] = useState("");
  const [variableErrors, setVariableErrors] = useState({});

  const [variableDescriptions, setVariableDescriptions] = useState({});
  const [variableDescriptionsError, setvariableDescriptionsError] = useState(false);
  const [variableDescriptionsHelperText, setvariableDescriptionsHelperText] = useState("");
  const [descriptionErrors, setDescriptionErrors] = useState({});
  const [newDescriptionErrors, setNewDescriptionErrors] = useState({});

  const [mediaId, setMediaId] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const [isValidating, setIsValidating] = useState(false);

  const templateNameRef = useRef(null);
  const templateTypeRef = useRef(null);
  const languageCodeRef = useRef(null);
  const verticalRef = useRef(null);
  const messageRef = useRef(null);
  const exampleRef = useRef(null);
  const selectedCategoryRef = useRef(null);
  const exampleRefs = useRef({});
  const descriptionRefs = useRef({});
  const emojiPickerRef = useRef(null);
  const debounceTimeout = useRef(null);

  const [variableTypes, setVariableTypes] = useState({});
  const [variableLists, setVariableLists] = useState({});
  const [editingOption, setEditingOption] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const listInputRefs = useRef({});

  const resetForm = () => {
    setTemplateName("");
    setSelectedCategory("");
    setLanguageCode("");
    setVertical("");
    setMessage("");
    setMediaId("");
    setButtons([]);
    setExample("");
    setUploadedUrl("");
    setVariables([]);
    setVariableDescriptions([]);
    setDisplayPantallas([]);
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessageGupshup, setErrorMessageGupshup] = useState("La plantilla no pudo ser creada.");

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const validateFields = async () => {
    let isValid = true;
    let firstErrorFieldRef = null;

    if (!templateName || templateName.trim() === "") {
      setTemplateNameError(true);
      setTemplateNameHelperText("Este campo es requerido");
      if (templateNameRef.current) templateNameRef.current.focus();
      isValid = false;

    } else {

      await validateTemplateName(templateName);

      if (templateNameHelperText === "Ya existe una plantilla con este nombre" ||
        templateNameHelperText === "Error al validar el nombre. Intenta nuevamente.") {
        setTemplateNameError(true);
        if (templateNameRef.current) templateNameRef.current.focus();
        isValid = false;

      } else {
      }
    }

    if (!templateType || templateType.trim() === "") {

      setTemplateTypeError(true);
      setTemplateTypeHelperText("Este campo es requerido");
      isValid = false;
      if (templateTypeRef.current && !firstErrorFieldRef) {
        firstErrorFieldRef = templateTypeRef;
      }
    }

    if (displayPantallas.length === 0) {

      setPantallasError(true);
      setPantallasHelperText("Debes seleccionar al menos una pantalla");
      isValid = false;
    } else {

      setPantallasError(false);
      setPantallasHelperText("");
    }

    if (!languageCode || languageCode.trim() === "") {

      setLanguageTypeError(true);
      setLanguageTypeHelperText("Este campo es requerido");
      isValid = false;
      if (languageCodeRef.current && !firstErrorFieldRef) {
        firstErrorFieldRef = languageCodeRef;
      }
    }

    if (!vertical || vertical.trim() === "") {

      setetiquetaPlantillaError(true);
      isValid = false;
      if (verticalRef.current && !firstErrorFieldRef) {
        firstErrorFieldRef = verticalRef;
      }
    }

    if (!message || message.trim() === "") {

      setcontenidoPlantillaTypeError(true);
      setcontenidoPlantillaTypeHelperText("Este campo es requerido");
      isValid = false;
      if (messageRef.current && !firstErrorFieldRef) {
        firstErrorFieldRef = messageRef;
      }
    }

    if (!example || example.trim() === "") {

      setejemploPlantillaError(true);
      setejemploPlantillaHelperText("Este campo es requerido");
      isValid = false;
      if (exampleRef.current && !firstErrorFieldRef) {
        firstErrorFieldRef = exampleRef;
      }
    }

    if (!selectedCategory || selectedCategory.trim() === "") {

      setcategoriaPlantillaError(true);
      setcategoriaPlantillaHelperText("Este campo es requerido");
      isValid = false;
      if (selectedCategoryRef.current && !firstErrorFieldRef) {
        firstErrorFieldRef = selectedCategoryRef;
      }
    } else {

    }

    if (variables.length > 0) {
      const newErrors = {};
      const newDescriptionErrors = {};

      for (const variable of variables) {
        const variableType = variableTypes[variable] || 'normal';

        if (!variableDescriptions[variable]?.trim()) {
          isValid = false;
          newDescriptionErrors[variable] = "El campo Descripción es requerido";
        } else {
          newDescriptionErrors[variable] = "";
        }

        if (variableType === 'normal') {
          if (!variableExamples[variable]?.trim()) {
            isValid = false;
            newErrors[variable] = "El campo Texto de ejemplo es requerido";
          } else {
            newErrors[variable] = "";
          }
        } else if (variableType === 'list') {
          if (!variableLists[variable] || variableLists[variable].length === 0) {
            isValid = false;
            newErrors[variable] = "Debe agregar al menos una opción a la lista";
          } else {
            newErrors[variable] = "";
          }
        }
      }

      const duplicateVariables = getDuplicateDescriptions(variableDescriptions);
      if (duplicateVariables.size > 0) {
        isValid = false;

        duplicateVariables.forEach(variable => {
          newDescriptionErrors[variable] = "Esta descripción ya existe en otra variable";
        });

        const firstDuplicateVariable = Array.from(duplicateVariables)[0];
        if (descriptionRefs.current && descriptionRefs.current[firstDuplicateVariable]) {
          descriptionRefs.current[firstDuplicateVariable].focus();
        }
      } else {
        variables.forEach(variable => {
          if (!newDescriptionErrors[variable]) {
            newDescriptionErrors[variable] = "";
          }
        });
      }

      setVariableErrors(newErrors);

    } else {
    }
    return isValid; // Retornar el valor final de isValid
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

  const token = sessionStorage.getItem('authToken');

  let appId, authCode, idUsuarioTalkMe, idNombreUsuarioTalkMe, empresaTalkMe, idBotRedes, idBot, urlTemplatesGS;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      appId = decoded.app_id;
      authCode = decoded.auth_code;
      idUsuarioTalkMe = decoded.id_usuario;
      idNombreUsuarioTalkMe = decoded.nombre_usuario;
      empresaTalkMe = decoded.empresa;
      idBotRedes = decoded.id_bot_redes;
      idBot = decoded.id_bot;
      urlTemplatesGS = decoded.urlTemplatesGS;

    } catch (error) {
      console.error('Error decodificando el token:', error);
    }
  }


  const iniciarRequest = async () => {
    if (loading) return;
    setLoading(true);

    const isValid = await validateFields();
    if (!isValid) {
      Swal.fire({
        title: 'Error',
        text: 'Campo incompletos.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#00c3ff'
      });
      setLoading(false);
      return;
    }

    try {
      //
      const result = await createTemplateCatalogGupshup(
        appId,
        authCode,
        {
          templateName,
          selectedCategory,
          languageCode,
          templateType,
          vertical,
          message,
          example
        },
        idNombreUsuarioTalkMe,
        urlTemplatesGS,
        validateFields
      );

      if (result && result.status === "success") {
        const templateId = result.template.id;

        /*

      const mockResult = {
        status: "success",
        template: {
          id: "test_catalogo_lista4" // Usa un ID de prueba aquí
        }
      };


      if (mockResult && mockResult.status === "success") {
      
        const templateId = mockResult.template.id;
        */

        console.log({
          templateId,
          templateName,
          templateType,
          pantallas,
          selectedCategory,
          message,
          uploadedUrl,
          idNombreUsuarioTalkMe: idNombreUsuarioTalkMe || "Sistema.TalkMe",
          variableTypes,
          variables,
          variableDescriptions,
          variableExamples,
          variableLists,
          idBotRedes,
          urlTemplatesGS
        });

        const result2 = await saveTemplateToTalkMe(
          templateId,
          {
            templateName,
            templateType,
            pantallas,
            selectedCategory,
            message,
            uploadedUrl
          },
          idNombreUsuarioTalkMe || "Sistema.TalkMe",
          variableTypes,
          variables,
          variableDescriptions,
          variableExamples,
          variableLists,
          [],
          idBotRedes,
          urlTemplatesGS
        );

        resetForm();
        Swal.fire({
          title: '¡Éxito!',
          text: 'La plantilla fue creada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00c3ff'
        });
        setLoading(false);

      } else {
        setErrorMessageGupshup(result?.message || "La plantilla no pudo ser creada.");
        Swal.fire({
          title: 'Error',
          text: result?.message || 'La plantilla no pudo ser creada.',
          icon: 'error',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#00c3ff'
        });
        setLoading(false);
        console.error("El primer request no fue exitoso o no tiene el formato esperado.");
        console.error("Resultado del primer request:", result);
      }
    } catch (error) {
      console.error("Ocurrió un error:", error);
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error inesperado.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#00c3ff'
      });
      setLoading(false);
    }
  };

  const pantallasTalkMe = [
    '0 - Notificaciones',
    '1 - Contactos',
    '2 - Recontacto',
    '3 - Historial',
    '4 - Broadcast',
    '5 - Operador/Supervisor'
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
      disabled: true
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
    const inputValue = event.target.value;
    const hasUpperCase = /[A-Z]/.test(inputValue);

    const newValue = inputValue.toLowerCase().replace(/\s+/g, '_');
    setTemplateName(newValue);

    if (hasUpperCase) {
      setTemplateNameHelperText("Las mayúsculas fueron convertidas a minúsculas");
    } else if (newValue.trim() === "") {
      setTemplateNameError(true);
      setTemplateNameHelperText("Este campo es requerido");
    } else {
      setTemplateNameError(false);
      setTemplateNameHelperText("");
    }
  };

  const validateTemplateName = async (nombre) => {
    const nombreFormateado = nombre.replace(/_/g, ' ');

    if (!nombreFormateado.trim() || !idBotRedes) return;

    setIsValidating(true);


    try {
      const existe = await validarNombrePlantillas(urlTemplatesGS, nombreFormateado, idBotRedes);

      if (existe === true) {
        setTemplateNameError(true);
        setTemplateNameHelperText("Ya existe una plantilla con este nombre");
      } else if (existe === false) {
        // Solo limpiar el error si no hay otros errores
        if (!templateNameError || templateNameHelperText === "Ya existe una plantilla con este nombre") {
          setTemplateNameError(false);
          setTemplateNameHelperText("Nombre disponible");
        }
      } else {
        // Error en la validación (existe === null)
        setTemplateNameError(true);
        setTemplateNameHelperText("Error al validar el nombre. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error en validación:", error);
      setTemplateNameError(true);
      setTemplateNameHelperText("Error al validar el nombre. Intenta nuevamente.");
    } finally {
      setIsValidating(false);
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
  const maxButtons = 10;

  const addButton = () => {
    if (buttons.length < maxButtons) {
      setButtons([
        ...buttons,
        { id: Date.now(), type: "QUICK_REPLY", title: "", url: "", phoneNumber: "" }
      ]);
    }
  };

  const updateButton = (id, key, value) => {
    setButtons((prevButtons) =>
      prevButtons.map((button) =>
        button.id === id ? { ...button, [key]: value } : button
      )
    );
  };

  const removeButton = (id) => {
    setButtons(buttons.filter((button) => button.id !== id));
  };

  const handleEmojiClick = (emojiObject) => {
    const cursor = messageRef.current.selectionStart;
    const newText = message.slice(0, cursor) + emojiObject.emoji + message.slice(cursor);

    const newEmojiCount = countEmojis(newText);

    if (newEmojiCount > 10) {
      Swal.fire({
        title: 'Límite de emojis',
        text: 'Solo puedes incluir un máximo de 10 emojis',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#00c3ff'
      });
      setShowEmojiPicker(false);

      setTimeout(() => {
        if (messageRef.current) {
          messageRef.current.focus();
          messageRef.current.setSelectionRange(cursor, cursor);
        }
      }, 100);

      return;
    }

    setMessage(newText);
    setEmojiCount(newEmojiCount);
    setShowEmojiPicker(false);

    setTimeout(() => {
      if (messageRef.current) {
        messageRef.current.focus();
        messageRef.current.setSelectionRange(cursor + emojiObject.emoji.length, cursor + emojiObject.emoji.length);
      }
    }, 100);
  };

  useClickOutside(
    emojiPickerRef,
    () => setShowEmojiPicker(false)
  );

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
      const cleanVariable = variable.replace(/[{}]/g, '');
      const regex = new RegExp(`\\{\\{${cleanVariable}\\}\\}`, 'g');

      result = result.replace(regex, variables[variable]);
    });

    return result;
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

  const countEmojis = (text) => {
    const emojiRegex = /(\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*)/gu;
    const matches = text.match(emojiRegex);
    return matches ? matches.length : 0;
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

  useEffect(() => {
    const newExample = replaceVariables(message, variableExamples);
    setExample(newExample);
  }, [message, variableExamples]);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (templateName.trim()) {
      debounceTimeout.current = setTimeout(() => {
        validateTemplateName(templateName);
      }, 800);
    } else {
      if (templateNameHelperText === "Ya existe una plantilla con este nombre" ||
        templateNameHelperText === "Nombre disponible" ||
        templateNameHelperText === "Error al validar el nombre. Intenta nuevamente.") {
        setTemplateNameHelperText("");
      }
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [templateName, idBotRedes]);

  const handleBodyMessageChange = (e) => {
    const newText = e.target.value;
    const maxLength = 550;
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
        setShowEmojiPicker(false);
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
    <Grid container spacing={2} sx={{ height: '100vh' }}>
      {/* Formulario (70%) */}<Grid item xs={8}><Box sx={{ height: '100%', overflowY: 'auto', pr: 2 }}>

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
              <MenuItem value="CATALOG">CATALOGO</MenuItem>
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
          <FormControl fullWidth sx={{ m: 1 }} error={pantallasError}>
            <InputLabel id="demo-multiple-checkbox-label">
              Selecciona una o más opciones
            </InputLabel>
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
            <FormHelperText>{pantallasHelperText}</FormHelperText>
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

        {/* BodyMessage --data-urlencode content */}
        <Box
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
              rows={7}
              label="Escribe"
              placeholder="Ingresa el contenido de tu mensaje aquí..."
              value={message}
              onChange={handleBodyMessageChange}
              //onChange={(e) => setMessage(e.target.value)}
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
              helperText={`${message.length}/550 caracteres | ${emojiCount}/10 emojis`}
              FormHelperTextProps={{
                sx: {
                  textAlign: 'right',
                  color: message.length === 550 || emojiCount >= 10 ? 'error.main' : 'text.secondary'
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

        {/* Ejemplo --data-urlencode example */}<Box sx={{ width: '100%', marginTop: 2, marginBottom: 2, p: 4, border: "1px solid #ddd", borderRadius: 2, display: 'none' }}>
          <FormControl fullWidth>
            <FormLabel>
              *Ejemplo
            </FormLabel>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Escribe"
            value={example}
            onChange={(e) => setExample(e.target.value)}
            sx={{ mb: 3 }}
          />
        </Box>

        {/*Boton Guardar Plantilla*/}<Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={iniciarRequest}
            disabled={loading}
            sx={{ mt: 3, mb: 3 }}
          >
            {loading ? "Enviando..." : "Enviar solicitud"}
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
                minHeight: "40px",
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                boxShadow: 1,
              }}
            >
              <Typography variant="body1" color="text.primary" sx={{ fontFamily: "Helvetica Neue, Arial, sans-serif", whiteSpace: "pre-line" }}>
                {example}
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "flex-end" }}>
                {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: true })}
              </Typography>
            </Box>

            {/* Botones */}{/* Botón de Quick Reply "CATÁLOGO" */}
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

export default TemplateForm;