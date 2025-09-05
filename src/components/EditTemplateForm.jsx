import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Checkbox, Chip, Container, Divider, FormControl, FormControlLabel, FormLabel, FormHelperText, Grid, Grid2, IconButton, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, Snackbar, Stack, TextField, Tooltip, Typography, alpha } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2'

import { Smile } from "react-feather"; // Icono para emojis
import EmojiPicker from "emoji-picker-react"; // Selector de emojis

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


import FileUploadComponent from './FileUploadComponentV2';
import { saveTemplateLog } from '../api/templatesGSLog';
import { eliminarParametrosPlantilla, obtenerPantallasMedia, obtenerParametros, saveTemplateParams } from '../api/templatesGSApi';
import { useClickOutside } from '../utils/emojiClick';
import { guardarLogArchivos } from '../api/templatesGSArchivosLogs';


const EditTemplateForm = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const templateData = location.state?.template || {}; // Datos del template

  // Recupera el token del localStorage
  const token = localStorage.getItem('authToken');

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
urlTemplatesGS = 'https://dev.talkme.pro/templatesGS/api/';
apiToken = 'TFneZr222V896T9756578476n9J52mK9d95434K573jaKx29jq';
urlWsFTP = 'https://dev.talkme.pro/WsFTP/api/ftp/upload';
*/



  //CAMPOS DEL FORMULARIO PARA EL REQUEST
  const [loading, setLoading] = useState(false);
  const [idPlantilla, setIdPlantilla] = useState(";")
  const [templateName, setTemplateName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [templateType, setTemplateType] = useState("TEXT");
  const [pantallas, setPantallas] = useState([]);
  const [displayPantallas, setDisplayPantallas] = useState([]);
  const [pantallasError, setPantallasError] = useState(false);
  const [pantallasHelperText, setPantallasHelperText] = useState("");
  const [templateNameHelperText, setTemplateNameHelperText] = useState("El nombre debe hacer referencia al texto de su plantilla.");
  const [templateNameError, setTemplateNameError] = useState(false);
  const [vertical, setVertical] = useState("");
  const [message, setMessage] = useState("");
  const [header, setHeader] = useState("");
  const [footer, setFooter] = useState("");
  const [buttons, setButtons] = useState([]);
  const [example, setExample] = useState("");
  const [exampleHeader, setExampleHeader] = useState("");
  const [exampleMedia, setExampleMedia] = useState("");
  const [idTemplate, setIdTemplate] = useState("");

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
  const [variables, setVariables] = useState([]);

  // Estado para almacenar ejemplos de variables
  const [variableExamples, setVariableExamples] = useState({});
  const [variableExamplesError, setvariableExamplesError] = useState(false);
  const [variableExamplesHelperText, setvariableExamplesHelperText] = useState("");
  const [variableErrors, setVariableErrors] = useState({});
  const [descriptionErrors, setDescriptionErrors] = useState({});
  const [newDescriptionErrors, setNewDescriptionErrors] = useState({});

  //ESTE ES PARA EL EXAMPLE MEDIA
  const [mediaId, setMediaId] = useState('');

  const [uploadStatus, setUploadStatus] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const templateNameRef = useRef(null);
  const templateTypeRef = useRef(null);
  const languageCodeRef = useRef(null);
  const verticalRef = useRef(null);
  const messageRef = useRef(null);
  const exampleRef = useRef(null);
  const exampleRefs = useRef({});
  const selectedCategoryRef = useRef(null);
  const descriptionRefs = useRef({});
  const emojiPickerRef = useRef(null);

  const [emojiCount, setEmojiCount] = useState(0);

  // Estado para almacenar descripciones de variables
  const [variableDescriptions, setVariableDescriptions] = useState({});
  const [variableDescriptionsError, setvariableDescriptionsError] = useState(false);
  const [variableDescriptionsHelperText, setvariableDescriptionsHelperText] = useState("");


  // Primer useEffect para cargar datos iniciales y pantallas
  useEffect(() => {
    const loadData = async () => {
      if (templateData) {
        setTemplateName(templateData.elementName || "");
        setSelectedCategory(templateData.category || "");
        setTemplateType((templateData.templateType || ""));
        setLanguageCode(templateData.languageCode || "");
        setVertical(templateData.vertical || "");
        setIdTemplate(templateData.id);

        // Parsear containerMeta si existe
        if (templateData.containerMeta) {
          try {
            const meta = JSON.parse(templateData.containerMeta);
            setMessage(meta.data || "");
            setHeader(meta.header || "");
            setFooter(meta.footer || "");
            setExample(meta.sampleText || "");
            setMediaId(meta.sampleMedia || "");

            if (meta.buttons && Array.isArray(meta.buttons)) {
              setButtons(
                meta.buttons.map((button, index) => ({
                  id: index,
                  title: button.text || "",
                  type: button.type || "QUICK_REPLY",
                  url: button.url || "",
                  phoneNumber: button.phone_number || "",
                }))
              );
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
          setIdPlantilla(info.id_plantilla || ""); // Esto se establece aquí
        }
      } catch (error) {

      }
    };

    loadData();
  }, [templateData, urlTemplatesGS, templateData.id]);

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

    if (displayPantallas.length === 0) {

      setPantallasError(true);
      setPantallasHelperText("Debes seleccionar al menos una pantalla");
      isValid = false;
      // No hay focus directo porque es un select con múltiples opciones
    } else {

      setPantallasError(false);
      setPantallasHelperText("");
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

      const newErrors = {};
      const newDescriptionErrors = {};

      for (const variable of variables) {
        // Validar ejemplo
        if (!variableExamples[variable]?.trim()) {

          isValid = false;
          newErrors[variable] = "El campo Descripción y Ejemplo es requerido";
        } else {
          newErrors[variable] = "";
        }

        // Validar descripción
        if (!variableDescriptions[variable]?.trim()) {

          isValid = false;
          newDescriptionErrors[variable] = "El campo Descripción y Ejemplo es requerido";
        } else {
          newDescriptionErrors[variable] = "";
        }
      }

      //AQUI VALIDO SI LAS VARIABLES ESTAN DUPLICADAS
      const duplicateVariables = getDuplicateDescriptions(variableDescriptions);

      if (duplicateVariables.size > 0) {

        isValid = false;

        // Marcar todas las variables con descripciones duplicadas
        duplicateVariables.forEach(variable => {
          newDescriptionErrors[variable] = "Esta descripción ya existe en otra variable";
        });

        // Enfocar la primera variable con descripción duplicada
        const firstDuplicateVariable = Array.from(duplicateVariables)[0];
        if (descriptionRefs.current && descriptionRefs.current[firstDuplicateVariable]) {
          descriptionRefs.current[firstDuplicateVariable].focus();
        }
      } else {

        // Limpiar errores de descripción
        variables.forEach(variable => {
          newDescriptionErrors[variable] = "";
        });
      }

      // 3. Validar que todas las variables tengan descripción (opcional)
      for (const variable of variables) {
        if (!variableDescriptions[variable] || variableDescriptions[variable].trim() === "") {

          isValid = false;
          newDescriptionErrors[variable] = "La descripción es requerida";

          // Enfocar el campo de descripción vacío
          if (descriptionRefs.current && descriptionRefs.current[variable]) {
            descriptionRefs.current[variable].focus();
          }
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

  const iniciarRequest = async () => {
    if (loading) return;
    setLoading(true);

    const isValid = validateFields();
    if (!isValid) {
      Swal.fire({
        title: 'Error',
        text: 'Campos incompletos.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#00c3ff'
      });
      setLoading(false);
      return;
    }

    try {
      
      const result = await sendRequest();

      
      if (result && result.status === "success") {
        
        const templateId = result.template.id;

        
        const result2 = await sendRequest2(templateId);

        
        if (result2 && result2.status === "success") {
          Swal.fire({
            title: 'Éxito',
            text: 'La plantilla se actualizó correctamente.',
            icon: 'success',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#00c3ff'
          });

          navigate('/Dashboard');
        } else {
          console.error("El segundo request no fue exitoso.");
          Swal.fire({
            title: 'Error al actualizar',
            text: `Ocurrió un problema al actualizar la plantilla. Error: ${result2?.message || 'Ocurrió un problema al actualizar la plantilla, intenta nuevamente.'}`,
            icon: 'error',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#00c3ff'
          });
          setLoading(false);
        }
      } else {
        console.error("El primer request no fue exitoso o no tiene el formato esperado.");
        Swal.fire({
          title: 'Error en el primer request',
          text: `Ocurrió un problema al crear la plantilla. Error: ${result?.message || 'Ocurrió un problema al actualizar la plantilla, intenta nuevamente.'}`,
          icon: 'warning',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#00c3ff'
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Ocurrió un error:", error);
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


  const sendRequest = async () => {
    if (loading) return; // evita múltiples clics
    setLoading(true);

    if (!validateFields()) {
      return { status: "error", message: "Validación fallida" };
    }

    const templateId = idTemplate;
    const url = `https://partner.gupshup.io/partner/app/${appId}/templates/${templateId}`;
    const headers = {
      Authorization: authCode,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const data = new URLSearchParams();
    data.append("elementName", templateName);
    data.append("category", selectedCategory.toUpperCase());
    data.append("languageCode", languageCode);
    data.append("templateType", templateType.toUpperCase());
    data.append("vertical", vertical);
    data.append("content", message);

    if (header) data.append("header", header);
    if (footer) data.append("footer", footer);
    if (mediaId) data.append("exampleMedia", mediaId);

    // Construir el objeto buttons
    const formattedButtons = buttons.map((button) => {
      const buttonData = {
        type: button.type,
        text: button.title,
      };

      if (button.type === "URL") {
        buttonData.url = button.url;
      } else if (button.type === "PHONE_NUMBER") {
        buttonData.phone_number = button.phoneNumber;
      }

      return buttonData;
    });

    data.append("buttons", JSON.stringify(formattedButtons));
    data.append("example", example);
    data.append("exampleHeader", exampleHeader);
    data.append("enableSample", true);
    data.append("allowTemplateCategoryChange", false);

    // Preparar datos del request para el log (formato original)
    const requestData = {
      elementName: templateName,
      category: selectedCategory.toUpperCase(),
      languageCode: languageCode,
      templateType: templateType.toUpperCase(),
      vertical: vertical,
      content: message,
      header: header || null,
      footer: footer || null,
      exampleMedia: mediaId || null,
      buttons: formattedButtons,
      example: example,
      exampleHeader: exampleHeader,
      enableSample: true,
      allowTemplateCategoryChange: false
    };

    // Crear el JSON completo del request incluyendo método, headers y payload
    const completeRequestLog = {
      metodo: "PUT",
      headers: headers,
      payload: requestData,
      url: url,
      metadata: {
        templateId: templateId,
        procesoCompleto: true
      }
    };

    const startTime = new Date().toISOString();

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: headers,
        body: data,
      });

      const responseData = await response.json();
      const endTime = new Date().toISOString();

      if (!response.ok) {
        console.error("Error response:", responseData);

        // Guardar log de error
        try {
          await guardarLogArchivos({
            NOMBRE_EVENTO: "PLANTILLAS_GUPSHUP_EDICION_ERROR",
            TIPO_LOG: 2, // Error
            URL_PETICION: url,
            PETICION: completeRequestLog, // Usar el JSON completo
            RESPUESTA: responseData,
            INICIO_PETICION: startTime,
            FIN_PETICION: endTime,
            CREADO_POR: idNombreUsuarioTalkMe,
            CLAVE_REGISTRO: templateId
          }, urlTemplatesGS);
        } catch (logError) {
          console.error("Error al guardar log de error:", logError);
        }

        return { status: "error", message: responseData.message || "Solicitud inválida" };
      }

      // Guardar log de éxito
      try {
        await guardarLogArchivos({
          NOMBRE_EVENTO: "PLANTILLAS_GUPSHUP_EDICION_EXITOSO",
          TIPO_LOG: 1, // Success
          URL_PETICION: url,
          PETICION: completeRequestLog, // Usar el JSON completo
          RESPUESTA: responseData,
          INICIO_PETICION: startTime,
          FIN_PETICION: endTime,
          CREADO_POR: idNombreUsuarioTalkMe,
          CLAVE_REGISTRO: templateId
        }, urlTemplatesGS);
      } catch (logError) {
        console.error("Error al guardar log de éxito:", logError);
      }

      return {
        status: "success",
        template: {
          id: templateId
        },
        ...responseData
      };

    } catch (error) {
      console.error("Error en la solicitud:", error);
      const endTime = new Date().toISOString();

      // Guardar log de error de excepción
      try {
        await guardarLogArchivos({
          NOMBRE_EVENTO: "PLANTILLAS_GUPSHUP_EDICION_EXCEPTION",
          TIPO_LOG: 3, // Exception
          URL_PETICION: url,
          PETICION: completeRequestLog, // Usar el JSON completo
          RESPUESTA: { error: error.message },
          INICIO_PETICION: startTime,
          FIN_PETICION: endTime,
          CREADO_POR: idNombreUsuarioTalkMe,
          CLAVE_REGISTRO: templateId
        }, urlTemplatesGS);
      } catch (logError) {
        console.error("Error al guardar log de excepción:", logError);
      }

      return { status: "error", message: "Error en la solicitud" };
    } finally {
      setLoading(false);
    }
  };

  // FUNCION PARA ENVIAR EL REQUEST A TALKME
  const sendRequest2 = async (templateId) => {
    const url = `${urlTemplatesGS}plantillas/${templateId}`;
    const headers = {
      "Content-Type": "application/json",
    };

    // Convertir selectedCategory a ID_PLANTILLA_CATEGORIA
    let ID_PLANTILLA_CATEGORIA;
    if (selectedCategory === "MARKETING") {
      ID_PLANTILLA_CATEGORIA = 10;
    } else if (selectedCategory === "UTILITY") {
      ID_PLANTILLA_CATEGORIA = 13;
    } else {
      console.error("Categoría no válida:", selectedCategory);
      return null;
    }

    let TIPO_PLANTILLA;
    if (templateType === "CAROUSEL") {
      TIPO_PLANTILLA = 1;
    } else {
      TIPO_PLANTILLA = 0;
    }

    const mediaMap = {
      image: "image",
      video: "video",
      document: "document",
      carousel: "image"
    };


    const MEDIA = mediaMap[templateType] || null;


    const mensajeProcesado = reordenarVariables(message);
    const nombreProcesado = templateName.replace(/_/g, " ");

    const data = {
      ID_PLANTILLA_CATEGORIA: ID_PLANTILLA_CATEGORIA,
      ID_BOT_REDES: idBotRedes,
      NOMBRE: nombreProcesado,
      NOMBRE_PLANTILLA: templateName,
      MENSAJE: mensajeProcesado,
      TIPO_PLANTILLA: TIPO_PLANTILLA,
      MEDIA: MEDIA,
      URL: uploadedUrl,
      PANTALLAS: pantallas,
      ESTADO: 0,
      AUTORIZADO: 0,
      MODIFICADO_EL: new Date(),
      MODIFICADO_POR: idNombreUsuarioTalkMe,
    };

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response:", errorResponse);
        return { status: "error", message: errorResponse };
      }

      const result = await response.json();

      if (result && result.ID_PLANTILLA && variables && variables.length > 0) {
        
        
        // Primero eliminamos los parámetros existentes

        try {

          await eliminarParametrosPlantilla(urlTemplatesGS, result.ID_PLANTILLA);

          await new Promise(resolve => setTimeout(resolve, 100));

          await saveTemplateParams(result.ID_PLANTILLA, variables, variableDescriptions, urlTemplatesGS);

        } catch (error) {

          console.error("Error gestionando parámetros:", error);

          return { status: "error", message: "No se pudieron actualizar los parámetros de la plantilla." };

        }
      }

      return { status: "success", data: result };

    } catch (error) {
      console.error("Error en el segundo request:", error);
      return null;
    }
  };


  function reordenarVariables(message) {
    // Encontrar todas las variables en el mensaje
    const variables = message.match(/\{\{\d+\}\}/g) || [];

    // Crear un mapa para el reordenamiento: {{1}} -> {{0}}, {{2}} -> {{1}}, etc.
    const reordenamiento = {};
    variables.forEach((variable, index) => {
      const numeroOriginal = variable.match(/\d+/)[0];
      reordenamiento[variable] = `{{${index}}}`;
    });

    // Reemplazar cada variable con su nuevo número
    let nuevoMensaje = message;
    for (const [vieja, nueva] of Object.entries(reordenamiento)) {
      nuevoMensaje = nuevoMensaje.replace(new RegExp(escapeRegExp(vieja), 'g'), nueva);
    }

    return nuevoMensaje;
  }

  // Función auxiliar para escapar caracteres especiales en regex
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  //const [variables, setVariables] = useState([{ key: '{{1}}', value: '' }, { key: '{{2}}', value: '' }]);

  //MEDIA
  const handleUploadSuccess = (uploadedMediaId) => {

    setMediaId(uploadedMediaId);
    // Mostrar mensaje de éxito
    showSnackbar("✅ Archivo subido exitosamente", "success");
  };

  // PANTALLAS
  const pantallasTalkMe = [
    '0 - Notificaciones',
    '1 - Contactos',
    '2 - Recontacto',
    '3 - Historial',
    '4 - Broadcast',
    '5 - Operador/Supervisor'
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
      id: 'UTILITY',
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
    const value = event.target.value; // Extraer el valor correctamente
    setTemplateType(value);
    setHeader(""); // Resetear el header al cambiar de tipo
    setMediaType("");
    setMediaURL("");

    if (value.trim() === "") { // Usar la variable "value"
      setTemplateTypeError(true);
      setTemplateTypeHelperText("Este campo es requerido");
    } else {
      setTemplateTypeError(false);
      setTemplateTypeHelperText("");
    }
  };

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
  const [uploadedUrl, setUploadedUrl] = useState('');

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

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Por favor, selecciona un archivo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Content = event.target.result.split(',')[1]; // Obtener solo el contenido en Base64

      const payload = {
        idEmpresa: 2,
        idBot: 54,
        idBotRedes: 149,
        idUsuario: 48,
        tipoCarga: 3,
        nombreArchivo: file.name,
        contenidoArchivo: base64Content,
      };

      try {
        const response = await fetch('https://certificacion.talkme.pro/WsFTP/api/ftp/upload', {
          method: 'POST',
          headers: {
            'x-api-token': 'TFneZr222V896T9756578476n9J52mK9d95434K573jaKx29jq',
            'Origin': 'https://certificacion.talkme.pro/',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Error al subir el archivo');
        }

        const data = await response.json();
        setUploadedUrl(data.url); // Asumiendo que la API devuelve un objeto con una propiedad 'url'
        alert('Archivo subido con éxito: ' + data.url);
      } catch (error) {
        console.error('Error:', error);
        alert('Error al subir el archivo');
      }
    };

    reader.readAsDataURL(file); // Leer el archivo como Data URL (Base64)
  };

  //HEADER PLANTILLA
  const handleHeaderChange = (event) => {
    setHeader(event.target.value);
  };

  //FOOTER PLANTILLA
  const handleFooterChange = (e) => {
    if (e.target.value.length <= charLimit) {
      setFooter(e.target.value);
    }
  };

  const charLimit = 60;
  const maxButtons = 10;

  //BOTONES PLANTILLA
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

  const handleAddVariable = () => {
    const newVariable = `{{${variables.length + 1}}}`;

    // Verificar si al añadir la variable se superaría el límite de caracteres
    if (message.length + newVariable.length > 550) {
      // Puedes mostrar un mensaje de error o simplemente no hacer nada
      Swal.fire({
        title: 'Limite de caracteres',
        text: 'No se pueden agregar más variables porque excede el máximo de 550 caracteres',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#00c3ff'
      });
      return;
    }

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

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => `${prev} ${emojiObject.emoji}`);
    setShowEmojiPicker(false);
  };

  // Llamada correcta al hook (sin el tercer parámetro)
  useClickOutside(
    emojiPickerRef,
    () => setShowEmojiPicker(false)
  );

  // FUNCIONES DEL BODY

  // Función actualizada con límite de emojis
  const handleBodyMessageChange = (e) => {
    let newText = e.target.value; // ✅ Cambiar const por let
    const maxLength = 550;
    const emojiCount = countEmojis(newText);
    const maxEmojis = 10;

    // Renumerar variables solo si se detectan (ej: al pegar)
    if (newText.includes("{{")) {
      newText = renumberVariables(newText); // ✅ Ahora funciona correctamente
    }

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

    // Continuar con tu lógica existente si está dentro del límite de caracteres
    if (newText.length <= maxLength) {
      // Guardar el nuevo texto
      setMessage(newText);

      // Actualizar el contador de emojis (necesitas agregar este estado)
      setEmojiCount(emojiCount);

      // Extraer y actualizar variables automáticamente
      const detectedVariables = extractVariables(newText);
      if (
        detectedVariables.length !== variables.length ||
        !detectedVariables.every(v => variables.includes(v))
      ) {
        setVariables(detectedVariables);
      }

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

  const extractVariables = (text) => {
    const regex = /\{\{\d+\}\}/g;
    return [...new Set(text.match(regex) || [])];
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

  // Nueva función para borrar una variable específica
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

  // Nueva función para borrar todas las variables
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

  const handleUpdateExample = (variable, value) => {
    setVariableExamples(prevExamples => {
      const updatedExamples = { ...prevExamples, [variable]: value };

      return updatedExamples;
    });
  };

  const handleUpdateDescriptions = (variable, event) => {
    const newValue = event.target.value.replace(/\s+/g, '_');
    setVariableDescriptions(prevDescriptions => ({
      ...prevDescriptions,
      [variable]: newValue
    }));
  };

  const replaceVariables = (text, variables) => {
    let result = text;

    Object.keys(variables).forEach(variable => {
      // Remover las llaves de la clave para crear el regex correcto
      const cleanVariable = variable.replace(/[{}]/g, '');
      const regex = new RegExp(`\\{\\{${cleanVariable}\\}\\}`, 'g');

      result = result.replace(regex, variables[variable]);
    });

    return result;
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

  // Función para generar el ejemplo combinando el mensaje y los valores de las variables
  const generateExample = () => {
    let generatedExample = message;
    Object.keys(variableExamples).forEach(variable => {
      generatedExample = generatedExample.replace(new RegExp(variable, 'g'), variableExamples[variable]);
    });
    return generatedExample;
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

  // 1. Función para detectar duplicados
  const getDuplicateDescriptions = (descriptions) => {
    const descriptionCounts = {};
    const duplicates = new Set();

    // Contar ocurrencias de cada descripción (ignorando vacías)
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

    // Retornar variables que tienen descripciones duplicadas
    const duplicateVariables = new Set();
    duplicates.forEach(desc => {
      descriptionCounts[desc].forEach(variable => {
        duplicateVariables.add(variable);
      });
    });

    return duplicateVariables;
  };

  // 3. En tu componente, calcular duplicados
  const duplicateVariables = getDuplicateDescriptions(variableDescriptions);

  // Actualizar el campo "example" y "message" cuando cambie el mensaje o los ejemplos de las variables
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
              <MenuItem value="TEXT">TEXTO</MenuItem>
              <MenuItem value="IMAGE">IMAGEN</MenuItem>
              <MenuItem value="VIDEO">VIDEO</MenuItem>
              <MenuItem value="DOCUMENT">DOCUMENTO</MenuItem>
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

        {/* Header*/} {templateType === 'TEXT' ? (
          <Box sx={{ width: '100%', marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormControl fullWidth>
              <FormLabel>
                Encabezado
              </FormLabel>
            </FormControl>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Agregue un encabezado de página de 60 caracteres a su mensaje. Las variables no se admiten en el pie de página.
            </Typography>
            <TextField
              fullWidth
              label="Header text"
              value={header}
              onChange={handleHeaderChange}
              helperText={`${header.length} / ${charLimit} caracteres`}
              sx={{ mb: 3 }}
              error={header.length === charLimit}
            />
          </Box>
        ) : (
          <Box sx={{ width: '100%', marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormControl fullWidth>
              <FormLabel>
                Encabezado
              </FormLabel>
            </FormControl>

            {/* Componente para subir archivos versión vieja
            /*<FileUploadComponent
              templateType={templateType}
              onUploadSuccess={(mediaId, uploadedUrl) => {
                setMediaId(mediaId); // Guarda el mediaId
                setUploadedUrl(uploadedUrl); // Guarda la URL
                //setUploadStatus("¡Archivo subido exitosamente!");
              }}
              onImagePreview={(preview) => setImagePreview(preview)} // Recibe la vista previa
              onHeaderChange={(newHeader) => setHeader(newHeader)} // Nueva prop
            />*/}
            <FileUploadComponent
              templateType={templateType}
              onUploadSuccess={(uploadData) => {
                setMediaId(uploadData.mediaId);
                setUploadedUrl(uploadData.url);



              }}
              onImagePreview={(preview) => setImagePreview(preview)}
              onHeaderChange={(newHeader) => setHeader(newHeader)}
            />
          </Box>
        )}

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
              disabled
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
            disabled
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
                        onChange={(e) => handleUpdateDescriptions(variable, e)}
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

        {/* Footer */}<Box sx={{ width: '100%', marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
          <FormControl fullWidth>
            <FormLabel>
              Pie de página
            </FormLabel>
          </FormControl>
          <TextField
            fullWidth
            value={footer}
            onChange={handleFooterChange}
            helperText={`${footer.length} / ${charLimit} caracteres`}
            sx={{ mb: 3 }}
          />
          <FormHelperText>
            Agregue un encabezado de página de 60 caracteres a su mensaje. Las variables no se admiten en el encabezado.
          </FormHelperText>
        </Box>

        {/* Botones --data-urlencode 'buttons*/}<Box sx={{ width: "100%", marginTop: 2, marginBottom: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
          <FormControl fullWidth>
            <FormLabel>
              Botones
            </FormLabel>
          </FormControl>

          <FormHelperText>
            Elija los botones que se agregarán a la plantilla. Puede elegir hasta 10 botones.
          </FormHelperText>

          <Button variant="contained" onClick={addButton} disabled={buttons.length >= maxButtons} sx={{ mt: 3, mb: 3 }}>
            + Agregar botón
          </Button>

          <Stack spacing={2}>
            {buttons.map((button, index) => (
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
                  label="Button Title"
                  value={button.title}
                  onChange={(e) => updateButton(button.id, "title", e.target.value)}
                  fullWidth
                />

                {/* Selector de tipo de botón */}
                <Select
                  value={button.type}
                  onChange={(e) => updateButton(button.id, "type", e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="QUICK_REPLY">Quick Reply</MenuItem>
                  <MenuItem value="URL">URL</MenuItem>
                  <MenuItem value="PHONE_NUMBER">Phone Number</MenuItem>
                </Select>

                {/* Campo adicional según el tipo de botón */}
                {button.type === "URL" && (
                  <TextField
                    label="URL"
                    value={button.url}
                    onChange={(e) => updateButton(button.id, "url", e.target.value)}
                    fullWidth
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

          <Typography variant="body2" color={buttons.length >= maxButtons ? "error" : "text.secondary"} sx={{ mt: 2 }}>
            {buttons.length} / {maxButtons} botones agregados
          </Typography>
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
            helperText={ejemploPlantillaHelperText}
            error={ejemploPlantillaError}
            rows={4}
            label="Escribe"
            value={example}
            onChange={(e) => setExample(e.target.value)}
            inputRef={exampleRef}
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
            <Typography variant="caption" gutterBottom>
              Vista previa
            </Typography>

            {/* Vista previa de la imagen */}
            {imagePreview && (
              <Box sx={{ bgcolor: "#ffffff", p: 1, borderRadius: 2, boxShadow: 1, maxWidth: "100%" }}>
                {typeof imagePreview === "string" &&
                  (imagePreview.startsWith("data:image") ||
                    imagePreview.startsWith("http") ||
                    imagePreview.startsWith("https")) ? (

                  // Imágenes (jpg, png, gif, etc.)
                  imagePreview.match(/\.(jpeg|jpg|gif|png|webp)$/) ||
                    imagePreview.startsWith("data:image") ? (
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      style={{ width: "100%", maxHeight: "300px", borderRadius: 2, display: "block" }}
                    />
                  ) :

                    // Videos (mp4, webm, etc.)
                    imagePreview.match(/\.(mp4|webm|ogg|mov)$/) ||
                      imagePreview.includes("video") ? (
                      <video controls width="100%" style={{ maxHeight: "300px", objectFit: "contain" }}>
                        <source src={imagePreview} />
                        Tu navegador no soporta este formato de video.
                      </video>
                    ) :

                      // PDFs
                      imagePreview.match(/\.(pdf)$/) ||
                        imagePreview.includes("pdf") ? (
                        <iframe src={imagePreview} width="100%" height="300px"></iframe>
                      ) :

                        // Documentos de Office
                        imagePreview.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/) ? (
                          <iframe
                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(imagePreview)}`}
                            width="100%"
                            height="300px"
                            frameBorder="0"
                            title="Vista previa de Office"
                          />
                        ) :

                          // Si no coincide con ningún formato conocido
                          null
                ) : null}
              </Box>
            )}
            {/* Muestra el estado de la subida */}
            {uploadStatus && <p>{uploadStatus}</p>}

            {/* Mensaje de WhatsApp */}
            <Box
              sx={{
                bgcolor: "#ffffff",
                p: 1,
                borderRadius: 2,
                alignSelf: "flex",
                maxWidth: "100%",
                minHeight: "40px",
                maxHeight: "200px",
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                boxShadow: 1,
                overflowY: "auto", // Scroll vertical cuando el contenido excede la altura
                overflowX: "hidden", // Previene scroll horizontal no deseado
              }}
            >

              <Typography variant="body1" color="text.primary">
                {header}
              </Typography>


              <Typography variant="body1" color="text.primary" sx={{ fontFamily: "Helvetica Neue, Arial, sans-serif", whiteSpace: "pre-line" }}>
                {example}
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary" // Cambia a un color gris más claro
                sx={{
                  fontFamily: "Helvetica Neue, Arial, sans-serif",
                  whiteSpace: "pre-line"
                }}
              >
                {footer}
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "flex-end" }}>
                {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: true })}
              </Typography>
            </Box>

            {/* Botones */}<Stack spacing={1} sx={{ mt: 0 }}>
              {buttons.map((button) => (
                <Box
                  key={button.id}
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
      </Grid>
    </Grid>
  );
};

export default EditTemplateForm;