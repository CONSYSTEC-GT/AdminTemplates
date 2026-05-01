import { z } from "zod";

// Esquema para las variables
const variableSchema = z.object({
    description: z.string()
        .min(1, "La descripción es requerida")
        .regex(/^[a-zA-Z0-9_]+$/, "Solo se permiten letras, números y guiones bajos")
        .transform(val => val.normalize('NFD').replace(/[\u0300-\u036f]/g, '')),
    example: z.string().min(1, "El ejemplo es requerido"),
});

// Esquema para botones normales (QUICK_REPLY, URL, PHONE_NUMBER)
const normalButtonSchema = z.discriminatedUnion("type", [
    z.object({
        id: z.any(),
        type: z.literal("QUICK_REPLY"),
        title: z.string().min(1, "El título del botón es requerido").max(25, "Máximo 25 caracteres"),
        url: z.string().optional(),
        phoneNumber: z.string().optional(),
    }),
    z.object({
        id: z.any(),
        type: z.literal("URL"),
        title: z.string().min(1, "El título del botón es requerido").max(25, "Máximo 25 caracteres"),
        url: z.string().url("URL inválida"),
        phoneNumber: z.string().optional(),
    }),
    z.object({
        id: z.any(),
        type: z.literal("PHONE_NUMBER"),
        title: z.string().min(1, "El título del botón es requerido").max(25, "Máximo 25 caracteres"),
        url: z.string().optional(),
        phoneNumber: z.string().regex(/^[0-9+\-\s()]+$/, "Número de teléfono inválido"),
    }),
]);

// Esquema para botones FLOW
const flowButtonSchema = z.object({
    id: z.any(),
    type: z.literal("FLOW"),
    title: z.string().min(1, "El título del botón es requerido").max(25, "Máximo 25 caracteres"),
    url: z.string().optional(),
    phoneNumber: z.string().optional(),
    flow_id: z.string().optional(),
    flow_action: z.string().optional(),
    navigate_screen: z.string().optional(),
});

// Esquema principal del formulario de edición
export const editTemplateFormSchema = z.object({
    // Campos que NO se pueden modificar (deshabilitados)
    templateName: z.string().min(1, "El nombre de la plantilla es requerido"),
    selectedCategory: z.string().min(1, "La categoría es requerida"),
    templateType: z.enum(["TEXT", "IMAGE", "VIDEO", "DOCUMENT"]),
    languageCode: z.string().min(1, "El idioma es requerido"),
    vertical: z.string().min(1, "Las etiquetas de plantilla son requeridas"),

    // Campos editables
    message: z.string()
        .min(1, "El contenido es requerido")
        .max(550, "Máximo 550 caracteres")
        .refine((text) => {
            const emojiRegex = /(\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*)/gu;
            const matches = text.match(emojiRegex);
            const emojiCount = matches ? matches.length : 0;
            return emojiCount <= 10;
        }, "Máximo 10 emojis")
        .refine(
            (val) => {
                const matches = val.match(/\{\{([^}]+)\}\}/g);
                if (!matches) return true;
                return matches.every((m) => /^\{\{\d+\}\}$/.test(m));
            },
            "Las variables deben ser numéricas, ej: {{1}}, {{2}}. No se permiten nombres como {{nombre_cliente}}"
        ),

    header: z.string().max(60, "Máximo 60 caracteres").optional().default(""),
    footer: z.string().max(60, "Máximo 60 caracteres").optional().default(""),
    mediaId: z.string().optional().default(""),
    uploadedUrl: z.string().optional().default(""),

    buttons: z.array(z.union([normalButtonSchema, flowButtonSchema])).max(10, "Máximo 10 botones"),

    variables: z.object({}).catchall(variableSchema).default({})
});

export type EditTemplateFormValues = z.infer<typeof editTemplateFormSchema>;