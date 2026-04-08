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
    alpha
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { Smile } from "react-feather";
import EmojiPicker from "emoji-picker-react";
import Swal from 'sweetalert2';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { templateFormSchema } from "../schemas/templateForm.schema.ts";
import { buildVariablesObject } from "../schemas/index.js";

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';

import { createTemplateGupshup } from '../../../api/gupshupApi.jsx';
import { saveTemplateToTalkMe, validarNombrePlantillas } from '../../../api/templatesGSApi.jsx';
import { useClickOutside } from '../../../utils/emojiClick.jsx';

const checkTemplateName = async (urlTemplatesGS, nombre, idBotRedes) => {
    const nombreFormateado = nombre.replace(/_/g, ' ');
    if (!nombreFormateado.trim() || !idBotRedes) return null;
    try {
        const existe = await validarNombrePlantillas(urlTemplatesGS, nombreFormateado, idBotRedes);
        return existe; // true | false | null
    } catch {
        return null;
    }
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
const MAX_BUTTONS = 1; // Catálogo solo permite 1 botón

const TemplateFormCatalog = () => {

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
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(templateFormSchema),
        defaultValues: {
            templateName: "",
            templateType: "catalog",
            selectedCategory: "",
            languageCode: "es",
            vertical: "",
            message: "",
            header: "",
            footer: "",
            mediaId: "",
            buttons: [],
            variables: {},
            pantallas: [],
            uploadedUrl: "",
        },
    });

    const [loading, setLoading] = useState(false);
    const [displayPantallas, setDisplayPantallas] = useState([]);
    const [emojiCount, setEmojiCount] = useState(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [example, setExample] = useState("");
    const [exampleHeader, setExampleHeader] = useState("");

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

    useEffect(() => {
        const examplesMap = Object.fromEntries(
            Object.entries(watchedVariables).map(([key, val]) => [key, val.example ?? ""])
        );
        const newExample = replaceVariables(watchedMessage, examplesMap);
        setExample(newExample);
    }, [watchedMessage, watchedVariables]);

    const resetForm = () => {
        reset();
        setDisplayPantallas([]);
        setEmojiCount(0);
        setExample('');
        setExampleHeader('');
    };

    const iniciarRequest = handleSubmit(
        async (formData) => {
            if (loading) return;

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
                const result = await createTemplateGupshup(
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
                        buttons: formData.buttons,
                        example,
                        exampleHeader,
                    },
                    idNombreUsuarioTalkMe,
                    urlTemplatesGS,
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
                            uploadedUrl: formData.uploadedUrl,
                        },
                        idNombreUsuarioTalkMe || "Sistema.TalkMe",
                        Object.keys(formData.variables),
                        Object.fromEntries(
                            Object.entries(formData.variables).map(([k, v]) => [k, v.description])
                        ),
                        [],
                        idBotRedes,
                        urlTemplatesGS,
                        formData.buttons,
                    );

                    resetForm();
                    Swal.fire({
                        title: '¡Éxito!',
                        text: 'La plantilla de catálogo fue creada correctamente.',
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#00c3ff',
                    });

                } else {
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
            Swal.fire({
                title: 'Límite de caracteres',
                text: 'No se pueden agregar más variables porque excede el máximo de 550 caracteres',
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#00c3ff',
            });
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

    const addButton = () => {
        const current = watch("buttons") ?? [];
        if (current.length >= MAX_BUTTONS) return;
        setValue("buttons", [
            ...current,
            { id: String(Date.now()), type: "QUICK_REPLY", title: "CATÁLOGO", url: "", phoneNumber: "" },
        ], { shouldValidate: false });
    };

    const updateButton = (id, key, value) => {
        const current = watch("buttons") ?? [];
        setValue("buttons",
            current.map(btn => btn.id === id ? { ...btn, [key]: value } : btn),
            { shouldValidate: true }
        );
    };

    const removeButton = (id) => {
        const current = watch("buttons") ?? [];
        setValue("buttons", current.filter(btn => btn.id !== id), { shouldValidate: true });
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

                    {/* Tipo de plantilla - Catalog */}
                    <Box sx={{ width: "100%", marginTop: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
                        <FormLabel>*Tipo de plantilla</FormLabel>
                        <Controller
                            name="templateType"
                            control={control}
                            render={({ field, fieldState }) => (
                                <FormControl fullWidth error={!!fieldState.error} sx={{ mt: 1 }}>
                                    <Select
                                        {...field}
                                        disabled
                                    >
                                        <MenuItem value="catalog">CATÁLOGO</MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        {fieldState.error?.message ?? "Tipo de plantilla fijo para catálogos"}
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
                                        ?? "Defina para qué caso de uso, por ejemplo: catálogo de productos, etc."
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

                                            if (newEmojiCount > 10) {
                                                Swal.fire({ title: 'Límite de emojis', text: 'Máximo 10 emojis', icon: 'warning', confirmButtonText: 'Entendido', confirmButtonColor: '#00c3ff' });
                                                return;
                                            }
                                            if (newText.length > 550) {
                                                Swal.fire({ title: 'Límite de caracteres', text: 'Máximo 550 caracteres', icon: 'warning', confirmButtonText: 'Entendido', confirmButtonColor: '#00c3ff' });
                                                return;
                                            }

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
                                    <Button color="error" variant="contained" size="small" startIcon={<ClearIcon />} onClick={deleteAllVariables} sx={{ ml: "auto", borderRadius: 1, textTransform: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", transition: "all 0.2s ease","&:hover": {boxShadow: "0 4px 12px rgba(0,0,0,0.25)",transform: "translateY(-1px)",},}}>
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

                    {/* Botones - Solo un botón de catálogo */}
                    <Box sx={{ width: "100%", marginTop: 2, marginBottom: 2, p: 4, border: "1px solid #ddd", borderRadius: 2 }}>
                        <FormControl fullWidth>
                            <FormLabel>Botón de catálogo</FormLabel>
                        </FormControl>
                        <FormHelperText>La plantilla de catálogo incluye un botón predefinido "CATÁLOGO".</FormHelperText>

                        {buttons.length === 0 && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={addButton}
                                sx={{ mt: 3, mb: 3 }}
                            >
                                Agregar botón de catálogo
                            </Button>
                        )}

                        <Stack spacing={2}>
                            {buttons.map((button, index) => (
                                <Box key={button.id} sx={{ display: "flex", alignItems: "flex-start", gap: 2, border: "1px solid #ccc", borderRadius: 2, p: 2, backgroundColor: "#f9f9f9" }}>
                                    <TextField
                                        label="Título del botón"
                                        value={button.title}
                                        onChange={(e) => updateButton(button.id, "title", e.target.value)}
                                        fullWidth
                                        inputProps={{ maxLength: 25 }}
                                        error={!!errors.buttons?.[index]?.title}
                                        helperText={errors.buttons?.[index]?.title?.message ?? `${button.title.length}/25 caracteres`}
                                    />
                                    <Select
                                        value={button.type}
                                        onChange={(e) => updateButton(button.id, "type", e.target.value)}
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
                                            onChange={(e) => updateButton(button.id, "url", e.target.value)}
                                            fullWidth
                                            error={!!errors.buttons?.[index]?.url}
                                            helperText={errors.buttons?.[index]?.url?.message ?? ""}
                                        />
                                    )}
                                    {button.type === "PHONE_NUMBER" && (
                                        <TextField
                                            label="Número de teléfono"
                                            value={button.phoneNumber}
                                            onChange={(e) => updateButton(button.id, "phoneNumber", e.target.value)}
                                            fullWidth
                                            error={!!errors.buttons?.[index]?.phoneNumber}
                                            helperText={errors.buttons?.[index]?.phoneNumber?.message ?? ""}
                                        />
                                    )}
                                    <IconButton color="error" onClick={() => removeButton(button.id)} sx={{ alignSelf: "center", pb: 4 }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Stack>
                        <Typography variant="body2" color={buttons.length >= MAX_BUTTONS ? "error" : "text.secondary"} sx={{ mt: 2 }}>
                            {buttons.length} / {MAX_BUTTONS} botón(es) agregado(s)
                        </Typography>
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

                        {/* Preview botones - Muestra el botón de catálogo */}
                        <Stack spacing={1}>
                            {buttons.map((button) => (
                                <Box
                                    key={button.id}
                                    sx={{ display: "flex", alignItems: "center", gap: 1, border: "1px solid #ccc", borderRadius: "20px", p: 1, backgroundColor: "#ffffff", boxShadow: 1, cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
                                >
                                    <ProductionQuantityLimitsIcon sx={{ fontSize: "16px", color: "#075e54" }} />
                                    <Typography variant="body1" sx={{ fontWeight: "medium", color: "#075e54", fontSize: "14px" }}>
                                        {button.title || "CATÁLOGO"}
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

export default TemplateFormCatalog;