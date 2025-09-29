import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Checkbox, Chip, Container, Divider, FormControl, FormControlLabel, FormLabel, FormHelperText, Grid, Grid2, IconButton, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, Snackbar, Stack, TextField, Tooltip, Typography, alpha } from '@mui/material';
import Swal from 'sweetalert2'
import { jwtDecode } from 'jwt-decode';

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
import { saveTemplateToTalkMe } from '../api/templatesGSApi';
import { editTemplateCatalogGupshup } from '../api/gupshupApi';
import { editTemplateToTalkMe } from '../api/templatesGSApi';

import { CustomDialog } from '../utils/CustomDialog';
import { useClickOutside } from '../utils/emojiClick';
import { eliminarParametrosPlantilla, obtenerPantallasMedia, obtenerParametros, saveTemplateParams } from '../api/templatesGSApi';


const TemplateForm = () => {

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
  const templateData = location.state?.template || {};


  const [loading, setLoading] = useState(false);
  const [idPlantilla, setIdPlantilla] = useState(";")
  const [templateName, setTemplateName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [templateType, setTemplateType] = useState("CATALOG");
  const [pantallas, setPantallas] = useState([]);
  const [displayPantallas, setDisplayPantallas] = useState([]);
  const [templateNameHelperText, setTemplateNameHelperText] = useState("El nombre debe hacer referencia al texto de su plantilla.");
  const [templateNameError, setTemplateNameError] = useState(false);
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
  const [variables, setVariables] = useState([]);


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

  const [emojiCount, setEmojiCount] = useState(0);

  const [idTemplate, setIdTemplate] = useState("");


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
            const messageText = meta.data || "";

            setMessage(messageText);
            setExample(meta.sampleText || "");


            const extractedVariables = extractVariables(messageText);
            setVariables(extractedVariables);
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
  }, [idPlantilla, urlTemplatesGS]);

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
      const newDescriptionErrors = {};

      for (const variable of variables) {

        if (!variableExamples[variable]?.trim()) {

          isValid = false;
          newErrors[variable] = "El campo Descripción y Ejemplo es requerido";
        } else {
          newErrors[variable] = "";
        }


        if (!variableDescriptions[variable]?.trim()) {

          isValid = false;
          newDescriptionErrors[variable] = "El campo Descripción y Ejemplo es requerido";
        } else {
          newDescriptionErrors[variable] = "";
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
          newDescriptionErrors[variable] = "";
        });
      }


      for (const variable of variables) {
        if (!variableDescriptions[variable] || variableDescriptions[variable].trim() === "") {

          isValid = false;
          newDescriptionErrors[variable] = "La descripción es requerida";


          if (descriptionRefs.current && descriptionRefs.current[variable]) {
            descriptionRefs.current[variable].focus();
          }
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
    if (loading) return;
    setLoading(true);

    const isValid = validateFields();
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

      const result = await editTemplateCatalogGupshup(
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
        idTemplate,
        idNombreUsuarioTalkMe,
        urlTemplatesGS,
        validateFields
      );
      /*
      const result = {
        status: "success",
        template: {
          id: "84a9f2cc-fc56-45ec-a43b-e77e456487e6"
        }
      };*/


      if (result && result.status === "success") {

        const templateId = result.template.id;



        const result2 = await editTemplateToTalkMe(
          templateId,
          {
            templateName,
            selectedCategory,
            message,
            uploadedUrl
          },
          idNombreUsuarioTalkMe || "Sistema.TalkMe",
          variables,
          variableDescriptions,
          [],
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
          setLoading(false);

          navigate('/Dashboard');
        }
      } else {
        Swal.fire({
          title: 'Error',
          text: `Ocurrió un problema al actualizar la plantilla. Error: ${error.message || 'Ocurrió un problema al actualizar la plantilla, intenta nuevamente.'}`,
          icon: 'error',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#00c3ff'
        });
        setLoading(false);
      }
    } catch (error) {

      Swal.fire({
        title: 'Error',
        text: `Ocurrió un problema al actualizar la plantilla. Error: ${error.message || 'Ocurrió un problema al actualizar la plantilla, intenta nuevamente.'}`,
        icon: 'error',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#00c3ff'
      });
      setLoading(false);
    }
  };


  const handleUploadSuccess = (uploadedMediaId) => {

    setMediaId(uploadedMediaId);

    showSnackbar("✅ Archivo subido exitosamente", "success");
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
      setSelectedFile(null);//Limpiar el archivo seleccionado
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




  const handleBodyMessageChange = (e) => {
    let newText = e.target.value;
    const maxLength = 550;
    const emojiCount = countEmojis(newText);
    const maxEmojis = 10;


    if (newText.includes("{{")) {
      newText = renumberVariables(newText);
    }


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


      const detectedVariables = extractVariables(newText);
      if (
        detectedVariables.length !== variables.length ||
        !detectedVariables.every(v => variables.includes(v))
      ) {
        setVariables(detectedVariables);
      }


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

  const handleAddVariable = () => {
    const newVariable = `{{${variables.length + 1}}}`;
    setMessage((prev) => `${prev} ${newVariable}`);
    setVariables([...variables, newVariable]);
  };


  const extractVariables = (text) => {
    const regex = /\{\{\d+\}\}/g;
    return text.match(regex) || [];
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => `${prev} ${emojiObject.emoji}`);
    setShowEmojiPicker(false);
  };


  useClickOutside(
    emojiPickerRef,
    () => setShowEmojiPicker(false)
  );


  const deleteVariable = (variableToDelete) => {

    const newMessage = message.replace(variableToDelete, '');
    setMessage(newMessage);


    const updatedVariables = variables.filter(v => v !== variableToDelete);
    setVariables(updatedVariables);

    messageRef.current?.focus();
  };


  const deleteAllVariables = () => {
    let newMessage = message;
    variables.forEach(variable => {
      newMessage = newMessage.replaceAll(variable, '');
    });
    setMessage(newMessage);
    setVariables([]);
    messageRef.current?.focus();
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






  useEffect(() => {



    const newExample = replaceVariables(message, variableExamples);



    setExample(newExample);
  }, [message, variableExamples]);


  return (
    <Grid container spacing={2} sx={{ height: '100vh' }}>

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
                        error={duplicateVariables.has(variable)}
                        helperText={
                          duplicateVariables.has(variable)
                            ? "Esta descripción ya existe en otra variable"
                            : ""
                        }
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