import { useState, useRef, useEffect } from 'react';
import { Alert, Box, Button, Checkbox, Chip, Dialog, DialogTitle, DialogContent, Divider, FormControl, FormControlLabel, FormLabel, FormHelperText, Grid, IconButton, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, Stack, TextField, Tooltip, Typography, alpha } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { Smile } from "react-feather";
import EmojiPicker from "emoji-picker-react";
import Swal from 'sweetalert2'

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PreviewIcon from '@mui/icons-material/Preview';
import RefreshIcon from '@mui/icons-material/Refresh';

import FileUploadComponent from './FileUploadComponentV2';
import { createTemplateFlowGupshup } from '../api/gupshupApi';
import { saveTemplateToTalkMe, validarNombrePlantillas } from '../api/templatesGSApi';
import { previewFlow } from '../api/gupshupApi';
import { CustomDialog } from '../utils/CustomDialog';
import { useClickOutside } from '../utils/emojiClick';
import FlowSelector from './FlowSelector';

const TemplateForm = () => {

    const [loading, setLoading] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("MARKETING");
    const [templateType, setTemplateType] = useState("text");
    const [templateTypeError, setTemplateTypeError] = useState(false);
    const [templateTypeHelperText, setTemplateTypeHelperText] = useState(false);
    const [pantallas, setPantallas] = useState([]);
    const [displayPantallas, setDisplayPantallas] = useState([]);
    const [pantallasError, setPantallasError] = useState(false);
    const [pantallasHelperText, setPantallasHelperText] = useState("");
    const [templateNameHelperText, setTemplateNameHelperText] = useState("El nombre debe hacer referencia al contenido de la plantilla. No se permite el uso de letras mayúsculas ni espacios en blanco.");
    const [templateNameError, setTemplateNameError] = useState(false);
    const [vertical, setVertical] = useState("");
    const [message, setMessage] = useState("");
    const [header, setHeader] = useState("");
    const [footer, setFooter] = useState("");
    const [buttons, setButtons] = useState([
        {
            type: "FLOW",
            text: "",
            flow_id: "",
            flow_action: "NAVIGATE",
            navigate_screen: "",
            icon: "PROMOTION"
        }
    ]);
    const [validationErrors, setValidationErrors] = useState({});
    const [example, setExample] = useState("");
    const [exampleMedia, setExampleMedia] = useState("");
    const [exampleHeader, setExampleHeader] = useState("");

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

    const [selectedFlow, setSelectedFlow] = useState(null);
    const [isFlowSelectorVisible, setIsFlowSelectorVisible] = useState(false);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    const [buttonTextError, setButtonTextError] = useState(false);
    const [buttonTextHelperText, setButtonTextHelperText] = useState("");
    const [flowError, setFlowError] = useState(false);
    const [flowHelperText, setFlowHelperText] = useState("");

    const templateNameRef = useRef(null);
    const templateTypeRef = useRef(null);
    const languageCodeRef = useRef(null);
    const verticalRef = useRef(null);
    const messageRef = useRef(null);
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

    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const resetForm = () => {
        setTemplateName("");
        setSelectedCategory("");
        setLanguageCode("");
        setVertical("");
        setHeader("");
        setMessage("");
        setMediaId("");
        setButtons([]);
        setFooter("");
        setExample("");
        setUploadedUrl("");
        setVariables([]);
        setVariableDescriptions([]);
        setDisplayPantallas([]);
        setImagePreview("");
    };

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessageGupshup, setErrorMessageGupshup] = useState("La plantilla no pudo ser creada.");

    const validateFields = async () => {
        let isValid = true;

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
            }
        }

        if (!templateType || templateType.trim() === "") {
            setTemplateTypeError(true);
            setTemplateTypeHelperText("Este campo es requerido");
            isValid = false;
            if (templateTypeRef.current) templateTypeRef.current.focus();
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
        }

        if (!vertical || vertical.trim() === "") {
            setetiquetaPlantillaError(true);
            isValid = false;
            if (verticalRef.current) verticalRef.current.focus();
        }

        if (!message || message.trim() === "") {
            setcontenidoPlantillaTypeError(true);
            setcontenidoPlantillaTypeHelperText("Este campo es requerido");
            isValid = false;
            if (messageRef.current) messageRef.current.focus();
        }

        if (!selectedCategory || selectedCategory.trim() === "") {
            setcategoriaPlantillaError(true);
            setcategoriaPlantillaHelperText("Este campo es requerido");
            isValid = false;
            if (selectedCategoryRef.current) selectedCategoryRef.current.focus();
        }

        // ========================================
        // VALIDACIÓN DE FLOW Y TEXTO DEL BOTÓN
        // ========================================

        // Validar que el texto del botón no esté vacío
        if (!buttons[0]?.text || buttons[0].text.trim() === "") {
            setButtonTextError(true);
            setButtonTextHelperText("El texto del botón es requerido");
            isValid = false;
        } else {
            setButtonTextError(false);
            setButtonTextHelperText("");
        }

        // Validar que haya un flow seleccionado
        if (!selectedFlow || !buttons[0]?.flow_id) {
            setFlowError(true);
            setFlowHelperText("Debes seleccionar un flow");
            isValid = false;
        } else {
            setFlowError(false);
            setFlowHelperText("");
        }

        // ========================================
        // FIN VALIDACIÓN DE FLOW Y BOTÓN
        // ========================================

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
        }

        return isValid;
    };

    const token = sessionStorage.getItem('authToken');

    let appId, appName, authCode, idUsuarioTalkMe, idNombreUsuarioTalkMe, empresaTalkMe, idBotRedes, idBot, urlTemplatesGS, apiToken, urlWsFTP;
    if (token) {
        try {
            const decoded = jwtDecode(token);
            appId = decoded.app_id;
            appName = decoded.app_name;
            authCode = decoded.auth_code;
            idUsuarioTalkMe = decoded.id_usuario;
            idNombreUsuarioTalkMe = decoded.nombre_usuario;
            empresaTalkMe = decoded.empresa;
            idBotRedes = decoded.id_bot_redes;
            idBot = decoded.id_bot;
            urlTemplatesGS = decoded.urlTemplatesGS;
            apiToken = decoded.apiToken;
            urlWsFTP = decoded.urlWsFTP;

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
            const result = await createTemplateFlowGupshup(
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
                    //uploadedUrl,
                    buttons,
                    example,
                    exampleHeader
                },
                idNombreUsuarioTalkMe,
                urlTemplatesGS,
                validateFields
            );

            if (result && result.status === "success" && result.template && result.template.id) {
                const templateId = result.template.id;
                /*
               // Simulamos un resultado exitoso con un templateId hardcodeado para pruebas
              const mockResult = {
                status: "success",
                template: {
                  id: "68e0d037-b742-489e-92b1-3426d5aab4bf" // Usa un ID de prueba aquí
                }
              };
        
              // Verificar si el primer request fue exitoso (ahora usando el mock)
              if (mockResult && mockResult.status === "success") {
                // Extraer el valor de `id` del objeto `template`
                const templateId = mockResult.template.id;
        
                */
                // Hacer el segundo request a TalkMe API
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
            console.error("Error detallado:", error);
            console.error("Stack trace:", error.stack);
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
            id: 'UTILITY',
            title: 'Utilidad',
            description: 'Envía actualizaciones de cuenta, actualizaciones de pedidos, alertas y más para compartir información importante.',
            icon: <NotificationsNoneOutlinedIcon />,
            disabled: true
        },
        {
            id: 'AUTHENTICATION',
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
                if (!templateNameError || templateNameHelperText === "Ya existe una plantilla con este nombre") {
                    setTemplateNameError(false);
                    setTemplateNameHelperText("Nombre disponible");
                }
            } else {
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
    const [file, setFile] = useState(null);

    const handleHeaderChange = (e) => {
        if (e.target.value.length <= charLimit) {
            setHeader(e.target.value)
            setExampleHeader(e.target.value);
        }
    };

    const handleFooterChange = (e) => {
        if (e.target.value.length <= charLimit) {
            setFooter(e.target.value);
        }
    };

    const charLimit = 60;

    const updateButton = (index, updates) => {
        setButtons(prevButtons => {
            const newButtons = [...prevButtons];
            newButtons[index] = {
                ...newButtons[index],
                ...updates
            };
            return newButtons;
        });
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

        if (newText.length > 550) {
            Swal.fire({
                title: 'Límite de caracteres',
                text: 'Solo puedes incluir un máximo de 550 caracteres',
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

    const deleteVariable = (variableToDelete) => {
        const newMessage = message.replace(variableToDelete, '');
        setMessage(newMessage);

        const updatedVariables = variables.filter(v => v !== variableToDelete);
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

        const newVariableDescriptions = {};
        const newVariableExamples = {};
        const newVariableErrors = { ...variableErrors };
        delete newVariableErrors[variableToDelete];

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

        setMessage(updatedMessage);
        setVariables(renumberedVariables);
        setVariableDescriptions(newVariableDescriptions);
        setVariableExamples(newVariableExamples);
        setVariableErrors(newVariableErrors);

        const newExampleRefs = {};
        renumberedVariables.forEach(v => {
            newExampleRefs[v] = exampleRefs.current[variableMapping[v]] || null;
        });
        exampleRefs.current = newExampleRefs;

        messageRef.current?.focus();
    };

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

    const handleFlowClose = () => {
        setIsSelectorOpen(false);
    };

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

    useEffect(() => {
        if (selectedFlow) {
            console.log("✅ selectedFlow actualizado:", selectedFlow);
            console.log("✅ Buttons después de selección:", buttons);
        }
    }, [selectedFlow, buttons]);

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
                            <MenuItem value="text">TEXTO</MenuItem>
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

                {/* Header*/} {templateType === 'text' ? (
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
                            label="Escribe el encabezado"
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
                        <FormLabel>Botones</FormLabel>
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
                            {/* Campo de texto para el texto del botón */}
                            <TextField
                                label="Texto del botón"
                                value={buttons[0]?.text || ""}
                                onChange={(e) => updateButton(0, { text: e.target.value })}
                                fullWidth
                                inputProps={{ maxLength: 25 }}
                                helperText={buttonTextError ? buttonTextHelperText : `${buttons[0]?.text?.length || 0}/25 caracteres`}
                                error={buttonTextError}
                            />

                            {/* Selector de tipo de botón */}
                            <Select
                                value={buttons[0]?.type || "FLOW"}
                                sx={{ minWidth: 150 }}
                                onChange={(e) => updateButton(0, "type", e.target.value)}
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
                                Seleccionar Flow
                            </Button>

                            {isSelectorOpen && (
                                <FlowSelector
                                    onClose={handleFlowClose}
                                    urlTemplatesGS={urlTemplatesGS}
                                    appId={appId}
                                    authCode={authCode}
                                    onFlowSelect={(flow) => {
                                        console.log("✅ Flow recibido con screenName:", flow);
                                        setSelectedFlow(flow);

                                        // Actualizar todos los campos en una sola llamada
                                        const updates = {
                                            flow_id: flow.id,
                                            navigate_screen: flow.screenName,
                                        };

                                        /* Solo actualizar el texto si está vacío
                                        if (!buttons[0]?.text || buttons[0].text === "") {
                                          updates.text = flow.name || "Iniciar Flow";
                                        }*/

                                        updateButton(0, updates);
                                        handleFlowClose();
                                    }}
                                />
                            )}

                            {/* MOSTRAR SOLO SI HAY UN FLOW SELECCIONADO */}
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
                        sx={{ mt: 3, mb: 3 }}
                        disabled={loading}
                    >
                        {loading ? "Enviando..." : "Enviar solicitud"}
                    </Button>
                </Box>

                {/* Diálogo de éxito */}
                <CustomDialog
                    open={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    title="¡Éxito!"
                    message="La plantilla fue creada correctamente."
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

            <Dialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Vista previa del Flow
                    <IconButton
                        onClick={() => setPreviewOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {previewData ? (
                        <Box component="pre" sx={{
                            p: 2,
                            bgcolor: '#f5f5f5',
                            borderRadius: 1,
                            overflow: 'auto',
                            maxHeight: 400
                        }}>
                            {JSON.stringify(previewData, null, 2)}
                        </Box>
                    ) : (
                        <Typography>No hay datos de preview disponibles</Typography>
                    )}
                </DialogContent>
            </Dialog>

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
                                overflowY: "auto",
                                overflowX: "hidden"
                            }}
                        >

                            <Typography variant="body1" color="text.primary">
                                {header}
                            </Typography>

                            <Typography variant="body1" color="text.primary" sx={{ fontFamily: "Helvetica Neue, Arial, sans-serif", whiteSpace: "pre-line", overflowWrap: "break-word" }}>
                                {example}
                            </Typography>

                            <Typography
                                variant="body1"
                                color="text.secondary"
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
                                    {button.type === "FLOW" && (
                                        <PlayArrowIcon sx={{ fontSize: "16px", color: "#075e54" }} />
                                    )}

                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: "medium",
                                            color: "#075e54",
                                            fontSize: "14px"
                                        }}
                                    >
                                        {/* Mostrar button.text para FLOW, button.title para otros */}
                                        {button.type === "FLOW" ? button.text : button.title}
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

export default TemplateForm;