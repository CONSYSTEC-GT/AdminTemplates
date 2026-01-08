import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Checkbox, Chip, Container, Divider, FormControl, FormControlLabel, FormLabel, FormHelperText, Grid, Grid2, IconButton, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, Snackbar, Stack, TextField, Tooltip, Typography, alpha } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2'

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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PreviewIcon from '@mui/icons-material/Preview';
import RefreshIcon from '@mui/icons-material/Refresh';

import FileUploadComponent from './FileUploadComponentV2';
import { saveTemplateLog } from '../api/templatesGSLog';
import { eliminarParametrosPlantilla, obtenerPantallasMedia, obtenerParametros, obtenerOpcionesParametro, eliminarOpcionesParametro, saveTemplateParams, saveTemplateParamsOptions, obtenerParametrosPorPlantilla, eliminarParametrosYOpciones } from '../api/templatesGSApi';
import { useClickOutside } from '../utils/emojiClick';
import { guardarLogArchivos } from '../api/templatesGSArchivosLogs';
import { editTemplateFlowGupshup } from '../api/gupshupApi';
import { previewFlow } from '../api/gupshupApi';
import FlowSelector from './FlowSelector';

const SAMPLE_MEDIA_REGEX = /^\d+::[A-Za-z0-9+/._=-]+(?::[A-Za-z0-9+/._=-]+)+$/;

const isValidSampleMedia = (value) => {
  if (typeof value !== "string") return false;
  return SAMPLE_MEDIA_REGEX.test(value.trim());
};


const EditTemplateForm = () => {

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
  const [descriptionErrors, setDescriptionErrors] = useState({});
  const [newDescriptionErrors, setNewDescriptionErrors] = useState({});

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

  const [variableDescriptions, setVariableDescriptions] = useState({});
  const [variableDescriptionsError, setvariableDescriptionsError] = useState(false);
  const [variableDescriptionsHelperText, setvariableDescriptionsHelperText] = useState("");

  const [selectedFlow, setSelectedFlow] = useState(null);
  const [isFlowSelectorVisible, setIsFlowSelectorVisible] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const [buttonTextError, setButtonTextError] = useState(false);
  const [buttonTextHelperText, setButtonTextHelperText] = useState("");
  const [flowError, setFlowError] = useState(false);
  const [flowHelperText, setFlowHelperText] = useState("");

  const [isFlowTemplate, setIsFlowTemplate] = useState(false);


  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (templateData) {
        setTemplateName(templateData.elementName || "");
        setSelectedCategory(templateData.category || "");
        setTemplateType(templateData.templateType || "");
        setLanguageCode(templateData.languageCode || "");
        setVertical(templateData.vertical || "");
        setIdTemplate(templateData.id);

        // ✅ DETECTAR SI ES PLANTILLA FLOW
        // Primero intentar con buttonSupported, si no existe, revisar los botones
        let isFlow = templateData.buttonSupported === "FLOW";

        // Si buttonSupported no está definido, verificar en containerMeta
        if (!isFlow && templateData.containerMeta) {
          try {
            const metaPreview = JSON.parse(templateData.containerMeta);
            if (metaPreview.buttons && Array.isArray(metaPreview.buttons) && metaPreview.buttons.length > 0) {
              // Si el primer botón es de tipo FLOW, es una plantilla Flow
              isFlow = metaPreview.buttons[0].type === "FLOW";
            }
          } catch (e) {
            console.error("Error al pre-verificar tipo:", e);
          }
        }

        setIsFlowTemplate(isFlow);

        console.log("🔍 Tipo de plantilla detectado:", {
          buttonSupported: templateData.buttonSupported,
          detectedFromButtons: isFlow,
          isFlowTemplate: isFlow
        });

        if (templateData.containerMeta) {
          try {
            const meta = JSON.parse(templateData.containerMeta);
            setMessage(meta.data || "");
            setHeader(meta.header || "");
            setFooter(meta.footer || "");
            setExample(meta.sampleText || "");

            if (meta.sampleMedia) {
              if (isValidSampleMedia(meta.sampleMedia)) {
                setMediaId(meta.sampleMedia);
              } else {
                setMediaId("");
              }
            } else {
              setMediaId("");
            }

            // ✅ CARGAR BOTONES SEGÚN EL TIPO
            if (meta.buttons && Array.isArray(meta.buttons)) {
              if (isFlow) {
                // Cargar botón FLOW
                const flowButton = meta.buttons[0];

                console.log("✅ Cargando botón FLOW:", flowButton);

                setButtons([
                  {
                    id: 0,
                    text: flowButton.text || "",
                    type: "FLOW",
                    flow_id: flowButton.flow_id || "",
                    flow_action: flowButton.flow_action || "NAVIGATE",
                    navigate_screen: flowButton.navigate_screen || "",
                  }
                ]);

                // Establecer el flow seleccionado
                if (flowButton.flow_id) {
                  setSelectedFlow({
                    id: flowButton.flow_id,
                    screenName: flowButton.navigate_screen,
                    name: flowButton.text || "Flow sin nombre"
                  });
                }
              } else {
                // Cargar botones normales
                console.log("✅ Cargando botones normales:", meta.buttons);

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
            } else {
              // No hay botones, inicializar según el tipo
              if (isFlow) {
                setButtons([
                  {
                    id: 0,
                    text: "",
                    type: "FLOW",
                    flow_id: "",
                    flow_action: "NAVIGATE",
                    navigate_screen: "",
                  }
                ]);
              } else {
                setButtons([]);
              }
            }
          } catch (error) {
            console.error("❌ Error al parsear containerMeta:", error);
          }
        }

        // Cargar pantallas y media
        try {
          const info = await obtenerPantallasMedia(urlTemplatesGS, templateData.id);
          if (info !== null) {
            const pantallasFromAPI = info.pantallas || "";
            setPantallas(pantallasFromAPI);

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

    if (templateType === "IMAGE") {
      if (!mediaId) {
        Swal.fire({
          title: 'Imagen requerida',
          text: 'Debes cargar una imagen para este tipo de plantilla.',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00c3ff'
        });
        return false;
      }

      if (!isValidSampleMedia(mediaId)) {
        Swal.fire({
          title: 'Imagen inválida',
          text: 'El identificador del sampleMedia no es válido. Vuelve a cargar la imagen.',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#00c3ff'
        });
        return false;
      }
    }


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
        if (variableTypes[variable] !== 'list' && !variableExamples[variable]?.trim()) {
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

    if (!isValid) {
      Swal.fire({
        title: 'Error',
        text: 'Campos incompletos.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#00c3ff'
      });
    }


    return isValid; // Retornar el valor final de isValid
  };

  const iniciarRequest = async () => {
    if (loading) return;
    setLoading(true);

    const isValid = validateFields();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      let result;

      // Validar si es una plantilla de tipo FLOW
      if (isFlowTemplate) {
        // Usar la función específica para plantillas FLOW
        result = await editTemplateFlowGupshup(
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
            exampleHeader
          },
          templateId, // Asegúrate de tener el ID de la plantilla para editar
          idNombreUsuarioTalkMe,
          urlTemplatesGS,
          validateFields
        );
      } else {
        // Usar la función original para otras plantillas
        result = await sendRequest();
      }

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
          title: isFlowTemplate ? 'Error al editar plantilla FLOW' : 'Error en el primer request',
          text: `Ocurrió un problema al ${isFlowTemplate ? 'editar' : 'crear'} la plantilla. Error: ${result?.message || 'Ocurrió un problema al actualizar la plantilla, intenta nuevamente.'}`,
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
        text: `Ocurrió un problema al ${isFlowTemplate ? 'editar' : 'actualizar'} la plantilla. Error: ${error.message || 'Ocurrió un problema al actualizar la plantilla, intenta nuevamente.'}`,
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


  const sendRequest2 = async (templateId) => {
    const url = `${urlTemplatesGS}plantillas/${templateId}`;
    const headers = {
      "Content-Type": "application/json",
    };


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
      IMAGE: "image",
      VIDEO: "video",
      DOCUMENT: "document",
      CAROUSEL: "image"
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
      URL: uploadedUrl || mediaURL,
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




        try {
          console.log('🟣 === INICIO: Actualizar parámetros de la plantilla', result.ID_PLANTILLA);

          // PASO 1: Eliminar TODOS los parámetros y opciones en UNA sola llamada
          console.log('📥 PASO 1: Eliminando parámetros y opciones existentes...');
          await eliminarParametrosYOpciones(urlTemplatesGS, result.ID_PLANTILLA);
          console.log('✅ PASO 1 completado');

          // PASO 2: Guardar nuevos parámetros
          console.log('📥 PASO 2: Guardando nuevos parámetros...');
          await saveTemplateParams(
            result.ID_PLANTILLA,
            idNombreUsuarioTalkMe,
            variables,
            variableDescriptions,
            variableTypes,
            variableExamples,
            urlTemplatesGS
          );
          console.log('✅ PASO 2 completado');

          // PASO 3: Guardar opciones de los nuevos parámetros
          console.log('📥 PASO 3: Guardando opciones de los nuevos parámetros...');
          await saveTemplateParamsOptions(
            result.ID_PLANTILLA,
            idNombreUsuarioTalkMe,
            variables,
            variableDescriptions,
            variableTypes,
            variableLists,
            urlTemplatesGS
          );
          console.log('✅ PASO 3 completado');

          console.log('🟣 === FIN: Parámetros actualizados correctamente');
          showSnackbar("✅ Plantilla actualizada correctamente", "success");

        } catch (error) {
          console.error("❌ Error gestionando parámetros:", error);
          showSnackbar("❌ Error al actualizar los parámetros de la plantilla", "error");
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

    const variables = message.match(/\{\{\d+\}\}/g) || [];


    const reordenamiento = {};
    variables.forEach((variable, index) => {
      const numeroOriginal = variable.match(/\d+/)[0];
      reordenamiento[variable] = `{{${index}}}`;
    });


    let nuevoMensaje = message;
    for (const [vieja, nueva] of Object.entries(reordenamiento)) {
      nuevoMensaje = nuevoMensaje.replace(new RegExp(escapeRegExp(vieja), 'g'), nueva);
    }

    return nuevoMensaje;
  }


  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }



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


  const handleHeaderChange = (event) => {
    setHeader(event.target.value);
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

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => `${prev} ${emojiObject.emoji}`);
    setShowEmojiPicker(false);
  };


  useClickOutside(
    emojiPickerRef,
    () => setShowEmojiPicker(false)
  );




  const handleBodyMessageChange = (e) => {
    let newText = e.target.value; // ✅ Cambiar const por let
    const maxLength = 550;
    const emojiCount = countEmojis(newText);
    const maxEmojis = 10;


    if (newText.includes("{{")) {
      newText = renumberVariables(newText); // ✅ Ahora funciona correctamente
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

  const replaceVariables = (text, variables) => {
    let result = text;

    Object.keys(variables).forEach(variable => {

      const cleanVariable = variable.replace(/[{}]/g, '');
      const regex = new RegExp(`\\{\\{${cleanVariable}\\}\\}`, 'g');

      result = result.replace(regex, variables[variable]);
    });

    return result;
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


  const generateExample = () => {
    let generatedExample = message;
    Object.keys(variableExamples).forEach(variable => {
      generatedExample = generatedExample.replace(new RegExp(variable, 'g'), variableExamples[variable]);
    });
    return generatedExample;
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


  useEffect(() => {
    const newExample = replaceVariables(message, variableExamples);
    setExample(newExample);
  }, [message, variableExamples]);


  const handleFlowClose = () => {
    setIsSelectorOpen(false);
  };

  // Función para cargar el preview
  const loadPreview = async () => {
    if (!selectedFlow?.id) return;

    setIsLoadingPreview(true);
    try {
      const previewData = await previewFlow(appId, authCode, selectedFlow.id);

      // Verifica si la respuesta tiene la estructura esperada
      if (previewData.preview?.preview_url) {
        // Actualiza el selectedFlow con la información del preview
        setSelectedFlow(prev => ({
          ...prev,
          previewUrl: previewData.preview.preview_url,
          previewExpires: new Date(previewData.preview.expires_at).toLocaleString(),
          previewId: previewData.id,
          previewStatus: previewData.status
        }));

        console.log("Preview cargado:", previewData);
      } else {
        console.warn("Estructura de preview inesperada:", previewData);
        // Muestra un error o maneja la respuesta diferente
      }
    } catch (error) {
      console.error("Error al cargar preview:", error);
      // Puedes mostrar un snackbar o alerta de error
    } finally {
      setIsLoadingPreview(false);
    }
  };


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

        {/* Botones --data-urlencode 'buttons*/}

        {isFlowTemplate ? (
          // 🎯 INTERFAZ PARA PLANTILLAS FLOW
          <Box sx={{ width: "100%", marginTop: 2, marginBottom: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormControl fullWidth>
              <FormLabel>Botones (Flow)</FormLabel>
              <FormHelperText>Esta plantilla utiliza un botón de tipo Flow</FormHelperText>
            </FormControl>

            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: "#f9f9f9",
                  mt: 3,
                  mb: 3,
                }}
              >
                <TextField
                  label="Texto del botón"
                  value={buttons[0]?.text || ""}
                  onChange={(e) => updateButton(0, { text: e.target.value })}
                  fullWidth
                  inputProps={{ maxLength: 25 }}
                  helperText={`${buttons[0]?.text?.length || 0}/25 caracteres`}
                />

                <Select
                  value="FLOW"
                  sx={{ minWidth: 150 }}
                  disabled
                >
                  <MenuItem value="FLOW">Flow</MenuItem>
                </Select>
              </Box>

              <Box>
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<AccountTreeIcon />}
                  size="large"
                  onClick={() => setIsSelectorOpen(true)}
                  sx={{
                    minHeight: 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem'
                  }}
                >
                  {selectedFlow ? 'Cambiar Flow' : 'Seleccionar Flow'}
                </Button>

                {isSelectorOpen && (
                  <FlowSelector
                    onClose={handleFlowClose}
                    urlTemplatesGS={urlTemplatesGS}
                    appId={appId}
                    authCode={authCode}
                    onFlowSelect={(flow) => {
                      console.log("✅ Flow seleccionado:", flow);
                      setSelectedFlow(flow);

                      const updates = {
                        flow_id: flow.id,
                        navigate_screen: flow.screenName,
                        flow_action: "NAVIGATE"
                      };

                      updateButton(0, updates);
                      handleFlowClose();
                    }}
                  />
                )}

                {selectedFlow && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Flow seleccionado:
                    </Typography>

                    <Grid container spacing={2}>
                      {/* COLUMNA 1: Flow */}
                      <Grid item xs={12} md={4}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AccountTreeIcon color="primary" />
                          <Box>
                            <Typography variant="body1">
                              <strong>{selectedFlow.name || "— sin nombre —"}</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {selectedFlow.id ?? "—"}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Log del flow */}
                        {selectedFlow.log && (
                          <Box
                            component="pre"
                            sx={{
                              mt: 1,
                              p: 1,
                              bgcolor: "background.paper",
                              borderRadius: 1,
                              border: "1px solid rgba(0,0,0,0.06)",
                              fontFamily: "monospace",
                              fontSize: "0.8rem",
                              maxHeight: 120,
                              overflow: "auto",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {selectedFlow.log}
                          </Box>
                        )}
                      </Grid>

                      {/* COLUMNA 2: Pantalla inicial */}
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Pantalla inicial:
                        </Typography>
                        {selectedFlow.screenName ? (
                          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
                            <Chip label={selectedFlow.screenName} size="small" />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No se encontró nombre de pantalla.
                          </Typography>
                        )}

                        {selectedFlow.screenError && (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            {selectedFlow.screenError}
                          </Alert>
                        )}
                      </Grid>

                      {/* COLUMNA 3: Categorías */}
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Categoría:
                        </Typography>
                        {selectedFlow.categories && selectedFlow.categories.length > 0 ? (
                          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
                            {selectedFlow.categories.map((c, i) => (
                              <Chip key={i} label={c} size="small" />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Sin categorías.
                          </Typography>
                        )}
                      </Grid>

                      {/* FILA COMPLETA: Vista previa embebida */}
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" color="text.primary">
                              Vista previa del Flow
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {selectedFlow.previewUrl && (
                                <>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<OpenInNewIcon />}
                                    onClick={() => window.open(selectedFlow.previewUrl, '_blank')}
                                  >
                                    Abrir en nueva pestaña
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<RefreshIcon />}
                                    onClick={loadPreview}
                                    disabled={isLoadingPreview}
                                  >
                                    Actualizar
                                  </Button>
                                </>
                              )}
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              height: 900,
                              border: "1px solid #e0e0e0",
                              borderRadius: 2,
                              overflow: "hidden",
                              backgroundColor: "white",
                              position: "relative",

                            }}
                          >
                            {selectedFlow.previewUrl ? (
                              <>
                                <iframe
                                  src={selectedFlow.previewUrl}
                                  title="Flow Preview"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                  }}
                                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                                />
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: 28,
                                    right: 188,
                                    backgroundColor: "rgba(255,255,255,0.9)",
                                    borderRadius: 1,
                                    p: 1,
                                    boxShadow: 1,
                                  }}
                                >
                                  <Typography variant="caption" color="text.secondary">
                                    Expira: {selectedFlow.previewExpires}
                                  </Typography>
                                </Box>
                              </>
                            ) : (
                              <Box
                                sx={{
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "text.secondary",
                                  p: 1,
                                }}
                              >
                                <PreviewIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                                <Typography variant="h6" gutterBottom align="center">
                                  Vista previa no cargada
                                </Typography>
                                <Typography variant="body2" align="center" sx={{ mb: 3, maxWidth: 400 }}>
                                  {isLoadingPreview
                                    ? "Cargando vista previa del flow..."
                                    : "Carga la vista previa para interactuar con el flow directamente desde aquí"}
                                </Typography>
                                <Button
                                  variant="contained"
                                  size="medium"
                                  startIcon={<PreviewIcon />}
                                  onClick={loadPreview}
                                  disabled={isLoadingPreview || !selectedFlow.id}
                                  sx={{ py: 1, px: 3 }}
                                >
                                  {isLoadingPreview ? (
                                    <>
                                      <RefreshIcon size={20} sx={{ mr: 1 }} />
                                      Cargando...
                                    </>
                                  ) : (
                                    "Cargar Vista Previa"
                                  )}
                                </Button>

                                {selectedFlow.id && (
                                  <Typography variant="caption" sx={{ mt: 2, textAlign: 'center' }}>
                                    Flow ID: {selectedFlow.id}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>

                          {/* Información adicional del preview */}
                          {selectedFlow.previewUrl && (
                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">
                                URL: {selectedFlow.previewUrl.substring(0, 80)}...
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Estado: {selectedFlow.previewStatus || 'Desconocido'}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            </Stack>
          </Box>
        ) : (
          // 🔵 INTERFAZ PARA BOTONES NORMALES
          <Box sx={{ width: "100%", marginTop: 2, marginBottom: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
            <FormControl fullWidth>
              <FormLabel>Botones</FormLabel>
            </FormControl>

            <FormHelperText>
              Elija los botones que se agregarán a la plantilla. Puede elegir hasta 10 botones.
            </FormHelperText>

            <Button
              variant="contained"
              onClick={addButton}
              disabled={buttons.length >= maxButtons}
              sx={{ mt: 3, mb: 3 }}
            >
              + Agregar botón
            </Button>

            <Stack spacing={2}>
              {buttons.map((button) => (
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
                  <TextField
                    label="Button Title"
                    value={button.title}
                    onChange={(e) => updateButton(button.id, "title", e.target.value)}
                    fullWidth
                  />

                  <Select
                    value={button.type}
                    onChange={(e) => updateButton(button.id, "type", e.target.value)}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="QUICK_REPLY">Quick Reply</MenuItem>
                    <MenuItem value="URL">URL</MenuItem>
                    <MenuItem value="PHONE_NUMBER">Phone Number</MenuItem>
                  </Select>

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

                  {button.type === "QUICK_REPLY" && <ArrowForward />}
                  {button.type === "URL" && <Link />}
                  {button.type === "PHONE_NUMBER" && <Phone />}

                  <IconButton color="error" onClick={() => removeButton(button.id)}>
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </Stack>

            <Typography
              variant="body2"
              color={buttons.length >= maxButtons ? "error" : "text.secondary"}
              sx={{ mt: 2 }}
            >
              {buttons.length} / {maxButtons} botones agregados
            </Typography>
          </Box>
        )}

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


                  imagePreview.match(/\.(jpeg|jpg|gif|png|webp)$/) ||
                    imagePreview.startsWith("data:image") ? (
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      style={{ width: "100%", maxHeight: "300px", borderRadius: 2, display: "block" }}
                    />
                  ) :


                    imagePreview.match(/\.(mp4|webm|ogg|mov)$/) ||
                      imagePreview.includes("video") ? (
                      <video controls width="100%" style={{ maxHeight: "300px", objectFit: "contain" }}>
                        <source src={imagePreview} />
                        Tu navegador no soporta este formato de video.
                      </video>
                    ) :


                      imagePreview.match(/\.(pdf)$/) ||
                        imagePreview.includes("pdf") ? (
                        <iframe src={imagePreview} width="100%" height="300px"></iframe>
                      ) :


                        imagePreview.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/) ? (
                          <iframe
                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(imagePreview)}`}
                            width="100%"
                            height="300px"
                            frameBorder="0"
                            title="Vista previa de Office"
                          />
                        ) :


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