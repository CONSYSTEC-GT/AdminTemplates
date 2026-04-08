import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Divider,
    FormControl,
    FormControlLabel,
    FormLabel,
    FormHelperText,
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
    Alert,
    Dialog,
    DialogTitle,
    DialogContent
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { Smile } from "react-feather";
import EmojiPicker from "emoji-picker-react";
import Swal from 'sweetalert2';
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { templateFormFlowSchema } from "../schemas/TemplateFormFlow.schema.ts";
import { CATEGORIES } from "../schemas/Template.schema.ts";

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Delete from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PreviewIcon from '@mui/icons-material/Preview';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';

import FileUploadComponent from '../../../components/form-controls/FileUploadComponentV2.jsx';
import { createTemplateFlowGupshup } from '../../../api/gupshupApi.jsx';
import { saveTemplateFlowToTalkMe, validarNombrePlantillas } from '../../../api/templatesGSApi.jsx';
import { previewFlow } from '../../../api/gupshupApi.jsx';
import { useClickOutside } from '../../../utils/emojiClick.jsx';
import FlowSelector from '../../../components/form-controls/FlowSelector.jsx';

const PANTALLAS_TALKME = [
    '0 - Notificaciones',
    '1 - Contactos',
    '2 - Recontacto',
    '3 - Historial',
    '4 - Broadcast',
    '5 - Operador/Supervisor',
];

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

const LANGUAGE_MAP = {
    es: "Español",
    en: "Inglés",
    fr: "Francés",
};

const CHAR_LIMIT = 60;
const MAX_BUTTONS = 10;

// Esquema extendido para botones tipo FLOW
const flowButtonSchema = {
    type: "FLOW",
    text: "",
    flow_id: "",
    flow_action: "NAVIGATE",
    navigate_screen: "",
    icon: "PROMOTION"
};

const checkTemplateName = async (urlTemplatesGS, nombre, idBotRedes) => {
    const nombreFormateado = nombre.replace(/_/g, ' ');
    if (!nombreFormateado.trim() || !idBotRedes) return null;
    try {
        const existe = await validarNombrePlantillas(urlTemplatesGS, nombreFormateado, idBotRedes);
        return existe;
    } catch {
        return null;
    }
};

const TemplateFormFlow = () => {
    const token = sessionStorage.getItem('authToken');
    let appId, authCode, idNombreUsuarioTalkMe, idBotRedes, urlTemplatesGS, idBot;
    if (token) {
        try {
            const decoded = jwtDecode(token);
            appId = decoded.app_id;
            authCode = decoded.auth_code;
            idNombreUsuarioTalkMe = decoded.nombre_usuario;
            idBotRedes = decoded.id_bot_redes;
            idBot = decoded.id_bot;
            urlTemplatesGS = decoded.urlTemplatesGS;
        } catch (error) {
            console.error('Error decodificando el token:', error);
        }
    }

    const {
        control,
        handleSubmit,
        setError,
        clearErrors,
        setValue,
        watch,
        reset,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(templateFormFlowSchema),
        defaultValues: {
            templateName: "",
            templateType: "text",
            selectedCategory: "",
            languageCode: "es",
            vertical: "",
            message: "",
            header: "",
            footer: "",
            mediaId: "",
            buttons: [
                {
                    id: Date.now().toString(),
                    type: "FLOW",
                    text: "",
                    flow_id: "",
                    flow_action: "NAVIGATE",
                    navigate_screen: "",
                    icon: "PROMOTION"
                }
            ],
            variables: {},
            pantallas: [],
            uploadedUrl: "",
        },
    });

    const [loading, setLoading] = useState(false);
    const [displayPantallas, setDisplayPantallas] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [emojiCount, setEmojiCount] = useState(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [example, setExample] = useState("");
    const [exampleHeader, setExampleHeader] = useState("");

    // Estados específicos para Flow
    const [selectedFlow, setSelectedFlow] = useState(null);
    const [isFlowSelectorVisible, setIsFlowSelectorVisible] = useState(false);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const messageRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const debounceTimeout = useRef(null);
    const exampleRefs = useRef({});
    const descriptionRefs = useRef({});

    const watchedTemplateType = watch("templateType");
    const watchedMessage = watch("message");
    const watchedHeader = watch("header");
    const watchedFooter = watch("footer");
    const pantallas = watch("pantallas");
    const uploadedUrl = watch("uploadedUrl");
    const buttons = watch("buttons");
    const variables = watch("variables");
    const watchedVariables = watch("variables") ?? {};

    // Validación de nombre de plantilla con debounce
    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        const currentName = watch("templateName");
        if (!currentName?.trim()) return;

        debounceTimeout.current = setTimeout(async () => {
            const existe = await checkTemplateName(urlTemplatesGS, currentName, idBotRedes);
            if (existe === true) {
                setError("templateName", { message: "Ya existe una plantilla con este nombre" });
            } else if (existe === false) {
                clearErrors("templateName");
            } else {
                setError("templateName", { message: "Error al validar el nombre. Intenta nuevamente." });
            }
        }, 800);

        return () => clearTimeout(debounceTimeout.current);
    }, [watch("templateName"), idBotRedes]);

    // Actualizar ejemplo del mensaje con variables
    useEffect(() => {
        const examplesMap = Object.fromEntries(
            Object.entries(watchedVariables).map(([key, val]) => [key, val.example ?? ""])
        );
        const newExample = replaceVariables(watchedMessage, examplesMap);
        setExample(newExample);
    }, [watchedMessage, watchedVariables]);

    // Sincronizar selectedFlow con el botón
    useEffect(() => {
        if (buttons[0]?.flow_id && !selectedFlow) {
            // Si hay flow_id en el botón pero no hay selectedFlow, necesitaríamos cargar los datos del flow
            // Esto podría requerir una llamada API para obtener la información completa del flow
        }
    }, [buttons, selectedFlow]);

    const resetForm = () => {
        reset();
        setDisplayPantallas([]);
        setImagePreview(null);
        setUploadStatus('');
        setEmojiCount(0);
        setExample('');
        setExampleHeader('');
        setSelectedFlow(null);
        setPreviewUrl(null);
        setPreviewData(null);
    };

    const validateBeforeSubmit = async (formData) => {
        // Validar que haya un flow seleccionado
        if (!formData.buttons[0]?.flow_id) {
            await Swal.fire({
                title: '⚠️ Flow requerido',
                html: 'Debes seleccionar un flow para este tipo de plantilla.',
                icon: 'warning',
                confirmButtonText: 'Seleccionar flow',
                confirmButtonColor: '#00c3ff',
            });
            return false;
        }

        // Validar texto del botón
        if (!formData.buttons[0]?.text?.trim()) {
            await Swal.fire({
                title: '⚠️ Texto del botón requerido',
                html: 'Debes ingresar un texto para el botón del flow.',
                icon: 'warning',
                confirmButtonText: 'Completar',
                confirmButtonColor: '#00c3ff',
            });
            return false;
        }

        if (formData.templateType !== "text") {
            if (!formData.mediaId || !formData.uploadedUrl) {
                const tipoMediaMap = {
                    image: "imagen",
                    video: "video",
                    document: "documento",
                };
                const tipoMedia = tipoMediaMap[formData.templateType] || "archivo";

                await Swal.fire({
                    title: '📎 Archivo requerido',
                    html: `Debes subir un archivo de tipo <strong>${tipoMedia}</strong> para este tipo de plantilla.`,
                    icon: 'warning',
                    confirmButtonText: 'Subir archivo',
                    confirmButtonColor: '#00c3ff',
                });
                return false;
            }
        }

        return true;
    };

    // Función para cargar el preview del flow
    const loadPreview = async () => {
        if (!selectedFlow?.id) return;

        setIsLoadingPreview(true);
        try {
            const previewData = await previewFlow(appId, authCode, selectedFlow.id);
            if (previewData.preview?.preview_url) {
                setSelectedFlow(prev => ({
                    ...prev,
                    previewUrl: previewData.preview.preview_url,
                    previewExpires: new Date(previewData.preview.expires_at).toLocaleString(),
                    previewId: previewData.id,
                    previewStatus: previewData.status
                }));
                setPreviewUrl(previewData.preview.preview_url);
            } else {
                console.warn("Estructura de preview inesperada:", previewData);
            }
        } catch (error) {
            console.error("Error al cargar preview:", error);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const iniciarRequest = handleSubmit(
        async (formData) => {
            if (loading) return;

            const isValid = await validateBeforeSubmit(formData);
            if (!isValid) return;

            const existe = await checkTemplateName(urlTemplatesGS, formData.templateName, idBotRedes);
            if (existe === true) {
                setError("templateName", { message: "Ya existe una plantilla con este nombre" });
                Swal.fire({
                    title: 'Error',
                    text: 'Ya existe una plantilla con este nombre.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar',
                    confirmButtonColor: '#00c3ff',
                });
                return;
            }

            setLoading(true);

            try {
                // Preparar los botones para el request
                const buttonsToSend = formData.buttons.map(btn => ({
                    type: "FLOW",
                    text: btn.text,
                    flow_id: btn.flow_id,
                    flow_action: btn.flow_action,
                    navigate_screen: btn.navigate_screen,
                    icon: btn.icon
                }));

                const result = await createTemplateFlowGupshup(
                    appId,
                    authCode,
                    {
                        templateName: formData.templateName,
                        selectedCategory: formData.selectedCategory,
                        languageCode: formData.languageCode,
                        templateType: formData.templateType,
                        vertical: formData.vertical,
                        message: formData.message,
                        header: formData.header,
                        footer: formData.footer,
                        mediaId: formData.mediaId,
                        buttons: buttonsToSend,
                        example, // Asegúrate que 'example' esté definido en tu scope superior
                        exampleHeader, // Asegúrate que 'exampleHeader' esté definido
                    },
                    idNombreUsuarioTalkMe,
                    urlTemplatesGS,
                );

                if (result?.status === "success" && result?.template?.id) {
                    const templateId = result.template.id;

                    // Extraer variables y sus descripciones
                    const variableKeys = Object.keys(formData.variables || {});
                    const variableDescriptions = Object.fromEntries(
                        Object.entries(formData.variables || {}).map(([k, v]) => [k, v.description])
                    );

                    // Nota: variableExamples se crea pero no se usa en saveTemplateToTalkMe según tu snippet original
                    // const variableExamples = Object.fromEntries(
                    //     Object.entries(formData.variables || {}).map(([k, v]) => [k, v.example])
                    // );

                    await saveTemplateFlowToTalkMe(
                        templateId,
                        {
                            templateName: formData.templateName,
                            templateType: formData.templateType,
                            pantallas: formData.pantallas,
                            selectedCategory: formData.selectedCategory,
                            message: formData.message,
                            uploadedUrl: formData.uploadedUrl,
                        },
                        idNombreUsuarioTalkMe || "Sistema.TalkMe",
                        variableKeys,
                        variableDescriptions,
                        [],
                        idBotRedes,
                        urlTemplatesGS,
                        buttonsToSend
                    );

                    resetForm();
                    Swal.fire({
                        title: '¡Éxito!',
                        text: 'La plantilla Flow fue creada correctamente.',
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#00c3ff',
                    });

                } else {
                    // Este else ahora pertenece correctamente al chequeo del status de result
                    Swal.fire({
                        title: 'Error',
                        text: result?.message || 'La plantilla no pudo ser creada.',
                        icon: 'error',
                        confirmButtonText: 'Cerrar',
                        confirmButtonColor: '#00c3ff',
                    });
                    console.error("Request Gupshup fallido:", result);
                }

            } catch (error) {
                console.error("Error detallado:", error);
                Swal.fire({
                    title: 'Error',
                    text: 'Ocurrió un error inesperado.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar',
                    confirmButtonColor: '#00c3ff',
                });
            } finally {
                setLoading(false);
            }
        },
        (errors) => {
            const labelMap = {
                templateName: "Nombre de la plantilla",
                selectedCategory: "Categoría",
                templateType: "Tipo de plantilla",
                languageCode: "Idioma",
                vertical: "Etiquetas de plantilla",
                message: "Contenido",
                pantallas: "Pantallas",
                buttons: "Botón",
            };

            const camposIncompletos = Object.keys(errors).map(key => labelMap[key] || key);

            Swal.fire({
                title: '⚠️ Campos incompletos',
                html: `
                <div style="text-align: left;">
                    <p style="margin-bottom: 10px;">Por favor completa los siguientes campos:</p>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${camposIncompletos.map(c => `<li style="margin: 5px 0;">${c}</li>`).join('')}
                    </ul>
                </div>
            `,
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#00c3ff',
            });
        }
    );

    const handleEmojiClick = (emojiObject) => {
        const currentMessage = watch("message");
        const cursor = messageRef.current.selectionStart;
        const newText = currentMessage.slice(0, cursor) + emojiObject.emoji + currentMessage.slice(cursor);
        const newEmojiCount = countEmojis(newText);

        if (newEmojiCount > 10) {
            Swal.fire({ title: 'Límite de emojis', text: 'Máximo 10 emojis', icon: 'warning', confirmButtonText: 'Entendido', confirmButtonColor: '#00c3ff' });
            setShowEmojiPicker(false);
            setTimeout(() => { if (messageRef.current) { messageRef.current.focus(); messageRef.current.setSelectionRange(cursor, cursor); } }, 100);
            return;
        }

        if (newText.length > 550) {
            Swal.fire({ title: 'Límite de caracteres', text: 'Máximo 550 caracteres', icon: 'warning', confirmButtonText: 'Entendido', confirmButtonColor: '#00c3ff' });
            setShowEmojiPicker(false);
            setTimeout(() => { if (messageRef.current) { messageRef.current.focus(); messageRef.current.setSelectionRange(cursor, cursor); } }, 100);
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

    const countEmojis = (text) => {
        const emojiRegex = /(\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*)/gu;
        const matches = text.match(emojiRegex);
        return matches ? matches.length : 0;
    };

    useClickOutside(emojiPickerRef, () => setShowEmojiPicker(false));

    const handleAddVariable = () => {
        const currentVariables = watch("variables") ?? {};
        const nextIndex = Object.keys(currentVariables).length + 1;
        const newVariable = `{{${nextIndex}}}`;
        const currentMessage = watch("message");

        if (currentMessage.length + newVariable.length > 550) {
            Swal.fire({ title: 'Límite de caracteres', text: 'No se pueden agregar más variables', icon: 'warning', confirmButtonText: 'Entendido', confirmButtonColor: '#00c3ff' });
            return;
        }

        const cursorPosition = messageRef.current.selectionStart;
        const newMessage = `${currentMessage.substring(0, cursorPosition)}${newVariable}${currentMessage.substring(cursorPosition)}`;

        setValue("message", newMessage);
        setValue("variables", {
            ...currentVariables,
            [newVariable]: { description: "", example: "" },
        });

        setTimeout(() => {
            messageRef.current.focus();
            messageRef.current.setSelectionRange(cursorPosition + newVariable.length, cursorPosition + newVariable.length);
        }, 0);
    };

    const deleteVariable = (variableToDelete) => {
        const currentVariables = watch("variables") ?? {};
        const currentMessage = watch("message");

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
        const currentMessage = watch("message");
        const currentVars = Object.keys(watch("variables") ?? {});
        let newMessage = currentMessage;

        currentVars.forEach(v => { newMessage = newMessage.replaceAll(v, ""); });

        setValue("message", newMessage);
        setValue("variables", {});
        messageRef.current?.focus();
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

    const handleUpdateDescriptions = (variable, event) => {
        const inputValue = event.target.value;
        const newValue = inputValue
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ñ/gi, "n")
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_]/g, "");

        const currentVariables = watch("variables") ?? {};
        setValue("variables", {
            ...currentVariables,
            [variable]: { ...currentVariables[variable], description: newValue },
        }, { shouldValidate: true });
    };

    const handleUpdateExample = (variable, value) => {
        const currentVariables = watch("variables") ?? {};
        setValue("variables", {
            ...currentVariables,
            [variable]: { ...currentVariables[variable], example: value },
        }, { shouldValidate: true });
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

    // Manejo de botones específico para Flow (solo un botón)
    const updateFlowButton = (updates) => {
        const currentButtons = watch("buttons") ?? [];
        if (currentButtons.length > 0) {
            setValue("buttons", [{ ...currentButtons[0], ...updates }], { shouldValidate: true });
        }
    };

    const handleFlowSelect = (flow) => {
        setSelectedFlow(flow);
        updateFlowButton({
            flow_id: flow.id,
            navigate_screen: flow.screenName,
        });
        setIsSelectorOpen(false);
    };

    const handleFlowClose = () => {
        setIsSelectorOpen(false);
    };

    return (
        <Grid container spacing={2} sx={{ height: '100vh' }}>

            {/* Formulario (70%) */}
            <Grid item xs={8}>
                <Box sx={{ height: '100%', overflowY: 'auto', pr: 2 }}>

                    {/* Template Name */}
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
                                        onChange={(e) => {
                                            const input = e.target.value;
                                            const transformed = input
                                                .normalize('NFD')
                                                .replace(/[\u0300-\u036f]/g, '')
                                                .replace(/ñ/gi, 'n')
                                                .toLowerCase()
                                                .replace(/\s+/g, '_')
                                                .replace(/[^a-z0-9_]/g, '');
                                            field.onChange(transformed);
                                        }}
                                        fullWidth
                                        error={!!fieldState.error}
                                        helperText={
                                            fieldState.error?.message
                                            ?? "El nombre debe hacer referencia al contenido. Sin mayúsculas ni espacios."
                                        }
                                    />
                                )}
                            />
                        </FormControl>
                    </Box>

                    {/* Categoría */}
                    <Box sx={{ maxWidth: '100%', border: "1px solid #ddd", borderRadius: 2, marginTop: 2, p: 3 }}>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FormControl fullWidth>
                                <FormLabel>*Categoría</FormLabel>
                            </FormControl>
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
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                            field.onBlur();
                                        }}
                                    >
                                        <Stack spacing={2}>
                                            {CATEGORY_OPTIONS.map((category) => (
                                                <Paper
                                                    key={category.id}
                                                    sx={{
                                                        p: 2,
                                                        cursor: category.disabled ? "default" : "pointer",
                                                        opacity: category.disabled ? 0.5 : 1,
                                                        border: fieldState.error && !field.value ? "1px solid red" : "none",
                                                        "&:hover": {
                                                            bgcolor: category.disabled
                                                                ? "transparent"
                                                                : (theme) => alpha(theme.palette.primary.main, 0.04),
                                                        },
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        value={category.id}
                                                        disabled={category.disabled}
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
                                    {fieldState.error && (
                                        <FormHelperText error>{fieldState.error.message}</FormHelperText>
                                    )}
                                </>
                            )}
                        />
                    </Box>

                    {/* Tipo de plantilla */}
                    <Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
                        <FormLabel>*Tipo de plantilla</FormLabel>
                        <Controller
                            name="templateType"
                            control={control}
                            render={({ field, fieldState }) => (
                                <FormControl fullWidth error={!!fieldState.error} sx={{ mt: 1 }}>
                                    <Select
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                            if (e.target.value !== "text") {
                                                setValue("header", "");
                                                setValue("mediaId", "");
                                            }
                                        }}
                                    >
                                        <MenuItem value="text">TEXTO</MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        {fieldState.error?.message ?? "Escoge el tipo de plantilla que se va a crear"}
                                    </FormHelperText>
                                </FormControl>
                            )}
                        />
                    </Box>

                    {/* Selección de pantallas TalkMe */}
                    <Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
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
                                        renderValue={(selected) => selected.join(', ')}
                                        onChange={(event) => {
                                            const { value } = event.target;
                                            const selectedOptions = typeof value === 'string' ? value.split(',') : value;
                                            setDisplayPantallas(selectedOptions);
                                            const numericValues = selectedOptions
                                                .map(option => option.split(' - ')[0].trim());
                                            field.onChange(numericValues);
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

                    {/* Header */}
                    {watchedTemplateType === 'text' ? (
                        <Box sx={{ width: '100%', marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
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
                                                setExampleHeader(e.target.value);
                                            }
                                        }}
                                        helperText={`${field.value.length} / ${CHAR_LIMIT} caracteres`}
                                        error={field.value.length === CHAR_LIMIT}
                                        sx={{ mb: 3 }}
                                    />
                                )}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ width: '100%', marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
                            <FormLabel>Encabezado</FormLabel>
                            <FileUploadComponent
                                templateType={watchedTemplateType}
                                onUploadSuccess={(uploadData) => {
                                    setValue("mediaId", uploadData.mediaId);
                                    setValue("uploadedUrl", uploadData.url);
                                }}
                                onImagePreview={(preview) => setImagePreview(preview)}
                                onHeaderChange={(newHeader) => setValue("header", newHeader)}
                            />
                        </Box>
                    )}

                    {/* Idioma */}
                    <Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
                        <FormLabel>*Idioma de plantilla</FormLabel>
                        <Controller
                            name="languageCode"
                            control={control}
                            render={({ field, fieldState }) => (
                                <FormControl fullWidth error={!!fieldState.error} sx={{ mt: 1 }}>
                                    <InputLabel id="languageCode-label">Selección</InputLabel>
                                    <Select {...field} labelId="languageCode-label" label="Selección">
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

                    {/* Etiquetas de plantilla (vertical) */}
                    <Box sx={{ width: '100%', marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
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
                                        fieldState.error?.message
                                        ?? "Defina para qué caso de uso, por ejemplo: actualización de cuenta, OTP, etc."
                                    }
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

                                            if (newEmojiCount > 10) { return; }
                                            if (newText.length > 550) { return; }

                                            if (newText.includes("{{")) {
                                                newText = renumberVariables(newText);
                                            }

                                            field.onChange(newText);
                                            setEmojiCount(newEmojiCount);

                                            const currentVariables = watch("variables") ?? {};
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

                                                setValue("variables", updated, { shouldValidate: false });
                                            }
                                        }}
                                        sx={{ mb: 3, mt: 4, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                                        helperText={
                                            fieldState.error?.message
                                            ?? `${field.value.length}/550 caracteres | ${emojiCount}/10 emojis`
                                        }
                                        FormHelperTextProps={{
                                            sx: {
                                                textAlign: 'right',
                                                color: field.value.length === 550 || emojiCount >= 10 ? 'error.main' : 'text.secondary',
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
                                {Object.keys(variables).length > 0 && (
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
                            {Object.keys(watch("variables") ?? {}).length > 0 && (
                                <Paper sx={{ my: 2, p: 2, borderRadius: 2, border: "1px solid #ddd" }}>
                                    <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                                        Agrega una descripción y un ejemplo a tu variable:
                                    </Typography>
                                    {Object.entries(watch("variables") ?? {}).map(([variable], index) => (
                                        <Box key={index} sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2, p: 1.5, backgroundColor: "#fff", borderRadius: 1, border: "1px solid #e0e0e0" }}>
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
                                                    onChange={(e) => handleUpdateDescriptions(variable, e)}
                                                    error={!!errors.variables?.[variable]?.description}
                                                    helperText={errors.variables?.[variable]?.description?.message ?? ""}
                                                    inputRef={(el) => (descriptionRefs.current[variable] = el)}
                                                    sx={{ flexGrow: 1 }}
                                                />
                                                <TextField
                                                    size="small"
                                                    label="Texto de ejemplo"
                                                    value={watch("variables")?.[variable]?.example ?? ""}
                                                    onChange={(e) => handleUpdateExample(variable, e.target.value)}
                                                    inputRef={(el) => (exampleRefs.current[variable] = el)}
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
                    <Box sx={{ width: '100%', marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
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
                                    helperText={`${field.value.length} / ${CHAR_LIMIT} caracteres`}
                                />
                            )}
                        />
                        <FormHelperText>
                            Las variables no se admiten en el pie de página.
                        </FormHelperText>
                    </Box>

                    {/* Botón FLOW - versión simplificada para Flow */}
                    <Box sx={{ width: "100%", marginTop: 2, marginBottom: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
                        <FormControl fullWidth>
                            <FormLabel>Botón Flow</FormLabel>
                        </FormControl>
                        <FormHelperText>Selecciona el flow que se ejecutará al presionar el botón.</FormHelperText>

                        <Stack spacing={2}>
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, border: "1px solid #ccc", borderRadius: 2, p: 2, backgroundColor: "#f9f9f9", mt: 3, mb: 3 }}>
                                <Controller
                                    name="buttons.0.text"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="Texto del botón"
                                            fullWidth
                                            inputProps={{ maxLength: 25 }}
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message ?? `${field.value?.length || 0}/25 caracteres`}
                                        />
                                    )}
                                />
                            </Box>

                            <Box>
                                <Button
                                    variant="contained"
                                    component="span"
                                    startIcon={<AccountTreeIcon />}
                                    size="large"
                                    onClick={() => setIsSelectorOpen(true)}
                                    sx={{ minHeight: 56, borderRadius: 2, textTransform: 'none', fontSize: '1rem' }}
                                >
                                    Seleccionar Flow
                                </Button>

                                {isSelectorOpen && (
                                    <FlowSelector
                                        onClose={handleFlowClose}
                                        urlTemplatesGS={urlTemplatesGS}
                                        appId={appId}
                                        authCode={authCode}
                                        onFlowSelect={handleFlowSelect}
                                    />
                                )}

                                {/* MOSTRAR SOLO SI HAY UN FLOW SELECCIONADO */}
                                {selectedFlow && (
                                    <Box sx={{ mt: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 2, backgroundColor: "#fafafa" }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Flow seleccionado:
                                        </Typography>

                                        <Grid container spacing={2}>
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
                                            </Grid>

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
                                            </Grid>

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

                                            {/* Vista previa del Flow */}
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

                                                    <Box sx={{ height: 500, border: "1px solid #e0e0e0", borderRadius: 2, overflow: "hidden", backgroundColor: "white", position: "relative" }}>
                                                        {selectedFlow.previewUrl ? (
                                                            <>
                                                                <iframe
                                                                    src={selectedFlow.previewUrl}
                                                                    title="Flow Preview"
                                                                    style={{ width: "100%", height: "100%", border: "none" }}
                                                                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                                                                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                                                                />
                                                                <Box sx={{ position: "absolute", top: 28, right: 188, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 1, p: 1, boxShadow: 1 }}>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Expira: {selectedFlow.previewExpires}
                                                                    </Typography>
                                                                </Box>
                                                            </>
                                                        ) : (
                                                            <Box sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "text.secondary", p: 1 }}>
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
                                                                    {isLoadingPreview ? "Cargando..." : "Cargar Vista Previa"}
                                                                </Button>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                )}
                            </Box>
                        </Stack>
                    </Box>

                    {/* Botón Enviar */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
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
                                ) : null}
                            </Box>
                        )}
                        {uploadStatus && <p>{uploadStatus}</p>}

                        {/* Burbuja de WhatsApp */}
                        <Box sx={{ bgcolor: "#ffffff", p: 1, borderRadius: 2, maxWidth: "100%", minHeight: "40px", display: "flex", flexDirection: "column", gap: 0.5, boxShadow: 1, overflowY: "auto", overflowX: "hidden" }}>
                            <Typography variant="body1" color="text.primary">{watchedHeader}</Typography>
                            <Typography variant="body1" color="text.primary" sx={{ fontFamily: "Helvetica Neue, Arial, sans-serif", whiteSpace: "pre-line", overflowWrap: "break-word" }}>
                                {example}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ fontFamily: "Helvetica Neue, Arial, sans-serif", whiteSpace: "pre-line" }}>
                                {watchedFooter}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "flex-end" }}>
                                {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: true })}
                            </Typography>
                        </Box>

                        {/* Preview botón FLOW */}
                        <Stack spacing={1}>
                            {buttons.map((button, index) => (
                                <Box
                                    key={button.id || index}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        border: "1px solid #ccc",
                                        borderRadius: "20px",
                                        p: 1,
                                        backgroundColor: "#ffffff",
                                        boxShadow: 1,
                                        cursor: "pointer",
                                        "&:hover": { backgroundColor: "#f5f5f5" },
                                    }}
                                >
                                    <PlayArrowIcon sx={{ fontSize: "16px", color: "#075e54" }} />
                                    <Typography variant="body1" sx={{ fontWeight: "medium", color: "#075e54", fontSize: "14px" }}>
                                        {button.text}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Box>
            </Grid>

            {/* Dialog de preview (si se necesita) */}
            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Vista previa del Flow
                    <IconButton onClick={() => setPreviewOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {previewData ? (
                        <Box component="pre" sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, overflow: 'auto', maxHeight: 400 }}>
                            {JSON.stringify(previewData, null, 2)}
                        </Box>
                    ) : (
                        <Typography>No hay datos de preview disponibles</Typography>
                    )}
                </DialogContent>
            </Dialog>
        </Grid>
    );
};

export default TemplateFormFlow;