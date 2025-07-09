import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Checkbox, Container, FormControl, FormControlLabel, FormLabel, FormHelperText, Grid, Grid2, IconButton, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, Snackbar, Stack, TextField, Tooltip, Typography, alpha } from '@mui/material';
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


import FileUploadComponent from './FileUploadComponentV2';
import { saveTemplateLog } from '../api/templatesGSLog';
import { obtenerPantallasMedia } from '../api/templatesGSApi';


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
      console.log('urlWsFTP', urlWsFTP);
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

  // Cargar los datos en el formulario al montar el componente
  useEffect(() => {
    // Función asíncrona interna
    const loadData = async () => {
      if (templateData) {
        setTemplateName(templateData.elementName || "");
        setSelectedCategory(templateData.category || "");
        setTemplateType((templateData.templateType || "").toLowerCase());
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
            console.log("media Id en loadData: ", mediaId);

            // Cargar botones si existen en containerMeta
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
          console.log("info es null", info);
        } else {
          const pantallasFromAPI = info.pantallas || "";
          setPantallas(pantallasFromAPI);

          // Procesar para el display
          const displayValues = procesarPantallasAPI(pantallasFromAPI);
          setDisplayPantallas(displayValues);
          console.log("pantallas: ", displayPantallas);

          setMediaURL(info.url || "");
          setImagePreview(info.url || "");

          console.log("media url: ", mediaURL);
        }
      } catch (error) {
        console.log("Error: ", error);
      }
    };

    // Llamar a la función asíncrona
    loadData();
  }, [templateData, urlTemplatesGS, templateData.id]);

  //CAMPOS DEL FORMULARIO PARA EL REQUEST
  const [templateName, setTemplateName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [templateType, setTemplateType] = useState("text");
  const [pantallas, setPantallas] = useState([]);
  const [displayPantallas, setDisplayPantallas] = useState([]);
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
  const selectedCategoryRef = useRef(null);

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

    if (templateName.trim() === "") {
      setTemplateNameError(true);
      setTemplateNameHelperText("Este campo es requerido");
      isValid = false;
      templateNameRef.current.focus();
      return isValid; // Salir de la función después del primer error
    }

    if (templateType.trim() === "") {
      setTemplateTypeError(true);
      setTemplateTypeHelperText("Este campo es requerido");
      isValid = false;
      templateTypeRef.current.focus();
      return isValid;
    }

    if (languageCode.trim() === "") {
      setLanguageTypeError(true);
      setLanguageTypeHelperText("Este campo es requerido");
      isValid = false;
      languageCodeRef.current.focus();
      return isValid;
    }

    if (vertical.trim() === "") {
      setetiquetaPlantillaError(true);
      isValid = false;
      verticalRef.current.focus();
      return isValid;
    }

    if (message.trim() === "") {
      setcontenidoPlantillaTypeError(true)
      setcontenidoPlantillaTypeHelperText("Este campo es requerido");
      isValid = false;
      messageRef.current.focus();
      return isValid;
    }

    if (example.trim() === "") {
      setejemploPlantillaError(true)
      setejemploPlantillaHelperText("Este campo es requerido");
      isValid = false;
      exampleRef.current.focus();
      return isValid;
    }

    if (selectedCategory.trim() === "") {
      setcategoriaPlantillaError(true);
      setcategoriaPlantillaHelperText("Este campo es requerido");
      isValid = false;
      selectedCategoryRef.current.focus();
      return isValid;
    }

    return isValid;
  };

  const iniciarRequest = async () => {
    try {
      // Hacer el primer request
      const result = await sendRequest();

      // Verificar si el primer request fue exitoso
      if (result && result.status === "success") {
        // Extraer el valor de `id` del objeto `template`
        const templateId = result.template.id;

        // Hacer el segundo request, pasando el `id` como parámetro
        await sendRequest2(templateId);
      } else {
        console.error("El primer request no fue exitoso o no tiene el formato esperado.");
      }
    } catch (error) {
      console.error("Ocurrió un error:", error);
    }
  };

  const sendRequest = async () => {
    // Validar campos antes de enviar la solicitud
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

    console.log("Request enviado:", JSON.stringify(Object.fromEntries(data.entries()), null, 2));

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: headers,
        body: data,
      });

      const responseData = await response.json(); // Mover esta línea aquí para usarla en ambos casos

      if (!response.ok) {
        console.error("Error response:", responseData);

        // Guardar log de error
        await saveTemplateLog({
          TEMPLATE_NAME: templateName,
          APP_ID: appId,
          CATEGORY: selectedCategory,
          LANGUAGE_CODE: languageCode,
          TEMPLATE_TYPE: templateType,
          VERTICAL: vertical,
          CONTENT: message,
          HEADER: header || null,
          FOOTER: footer || null,
          MEDIA_ID: mediaId || null,
          BUTTONS: JSON.stringify(buttons),
          EXAMPLE: example,
          EXAMPLE_HEADER: exampleHeader,
          ENABLE_SAMPLE: true,
          ALLOW_TEMPLATE_CATEGORY_CHANGE: false,
          urlTemplatesGS,
          CREADO_POR: idNombreUsuarioTalkMe,
          STATUS: "ERROR",
          REJECTION_REASON: responseData.message || "Solicitud inválida"
        });

        Swal.fire({
          title: 'Error',
          text: `❌ Error al actualizar la plantilla: ${responseData.message || "Solicitud inválida"}`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00c3ff'
        });
        return { status: "error", message: responseData.message || "Solicitud inválida" };
      }

      // Guardar log de éxito
      await saveTemplateLog({
        TEMPLATE_NAME: templateName,
        APP_ID: appId,
        CATEGORY: selectedCategory,
        LANGUAGE_CODE: languageCode,
        TEMPLATE_TYPE: templateType,
        VERTICAL: vertical,
        CONTENT: message,
        HEADER: header || null,
        FOOTER: footer || null,
        MEDIA_ID: mediaId || null,
        BUTTONS: JSON.stringify(buttons),
        EXAMPLE: example,
        EXAMPLE_HEADER: exampleHeader,
        ENABLE_SAMPLE: true,
        ALLOW_TEMPLATE_CATEGORY_CHANGE: false,
        urlTemplatesGS,
        CREADO_POR: idNombreUsuarioTalkMe,
        STATUS: "SUCCESS",
        REJECTION_REASON: null
      });

      Swal.fire({
        title: '¡Éxito!',
        text: 'La plantilla fue editada correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00c3ff'
      });

      console.log("Response: ", responseData);
      console.log("Plantilla:", templateId);
      console.log("URL:", url);

      return {
        status: "success",
        template: {
          id: templateId
        },
        ...responseData
      };

    } catch (error) {
      console.error("Error en la solicitud:", error);

      // Guardar log de error de excepción
      await saveTemplateLog({
        TEMPLATE_NAME: templateName,
        APP_ID: appId,
        CATEGORY: selectedCategory,
        LANGUAGE_CODE: languageCode,
        TEMPLATE_TYPE: templateType,
        VERTICAL: vertical,
        CONTENT: message,
        HEADER: header || null,
        FOOTER: footer || null,
        MEDIA_ID: mediaId || null,
        BUTTONS: JSON.stringify(buttons),
        EXAMPLE: example,
        EXAMPLE_HEADER: exampleHeader,
        ENABLE_SAMPLE: true,
        ALLOW_TEMPLATE_CATEGORY_CHANGE: false,
        urlTemplatesGS,
        CREADO_POR: idNombreUsuarioTalkMe,
        STATUS: "ERROR",
        REJECTION_REASON: error.message || "Error en la solicitud"
      });

      Swal.fire({
        title: 'Error',
        text: `❌ Error al actualizar la plantilla: ${error.message || "Error en la solicitud"}`,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00c3ff'
      });
      return { status: "error", message: "Error en la solicitud" };
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

  console.log("templateType: ", templateType);
  const MEDIA = mediaMap[templateType] || null
  console.log("MEDIA: ",MEDIA);

  const mensajeProcesado = reordenarVariables(message);

  const nombreProcesado = templateName.replace(/_/g, " ");

  // Crear un objeto con los datos completos
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
    MODIFICADO_EL: new Date(),
    MODIFICADO_POR: idNombreUsuarioTalkMe,
  };

  console.log("Segundo request enviado:", {
    url: url,
    headers: headers,
    body: data,
  });

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Error response:", errorResponse);
      return null;
    }

    const result = await response.json();
    console.log("Response del segundo request: ", result);
    return result;
  } catch (error) {
    console.error("Error en el segundo request:", error);
    showSnackbar("❌ Error en el segundo request", "error");
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
  //const [variables, setVariables] = useState([{ key: '{{1}}', value: '' }, { key: '{{2}}', value: '' }]);

  //MEDIA
  const handleUploadSuccess = (uploadedMediaId) => {
    console.log('Media subida exitosamente, ID:', uploadedMediaId);
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
      console.log('Archivo seleccionado:', selectedFile);
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
    setMessage((prev) => `${prev} ${newVariable}`);
    setVariables([...variables, newVariable]);
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => `${prev} ${emojiObject.emoji}`);
    setShowEmojiPicker(false);
  };

  // Función para reemplazar las variables en el mensaje con sus ejemplos
  const replaceVariables = (text, variables) => {
    let result = text;


    Object.keys(variables).forEach(variable => {
      const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g'); // 🔥 Búsqueda exacta de {{variable}}
      console.log(`Reemplazando: {{${variable}}} por ${variables[variable]}`);
      result = result.replace(regex, variables[variable]);
    });


    return result;
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
              <MenuItem value="text">TEXTO</MenuItem>
              <MenuItem value="image">IMAGEN</MenuItem>
              <MenuItem value="video">VIDEO</MenuItem>
              <MenuItem value="document">DOCUMENTO</MenuItem>
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
                console.log("UploadData: ", uploadData)
                console.log('Datos recibidos del componente hijo mediaId: ', uploadData.mediaId);
                console.log('Datos recibidos del componente hijo uploadedUrl: ', uploadData.url);
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

        {/* BodyMessage --data-urlencode content */}<Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
          <FormControl fullWidth>
            <FormLabel>*Contenido</FormLabel>
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ mb: 3, mt: 4 }}
              inputRef={messageRef}
            />

            {/* Botón para agregar emojis */}
            <Button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}

            >
              <Smile size={20} />
            </Button>

            {/* Selector de emojis */}
            {showEmojiPicker && (
              <Box>
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </Box>
            )}

            {/* Botón para agregar variables */}
            <Button
              variant="contained"
              onClick={handleAddVariable}

            >
              + Agregar variable
            </Button>
          </Box>

          {/* Lista de variables y valores de muestra */}
          <Stack spacing={2} sx={{ mt: 2 }}>
            {variables.map((variable, index) => (
              <Box key={index} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Typography variant="body1">{variable}</Typography>
                <TextField
                  label="Sample Value"
                  size="small"
                  sx={{ width: "150px" }}
                />
              </Box>
            ))}
          </Stack>



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
            sx={{ mt: 3, mb: 3 }}
          >
            Enviar solicitud
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
                {message}
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