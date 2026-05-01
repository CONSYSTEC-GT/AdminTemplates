import { z } from 'zod';

const buttonSchema = z.object({
    id: z.string(),
    title: z.string().max(25, "Máximo 25 caracteres"),
    type: z.enum(["QUICK_REPLY", "URL", "PHONE_NUMBER"]),
    url: z.string().url("URL inválida").optional(),
    phoneNumber: z.string().optional(),
});

const cardSchema = z.object({
    id: z.string(),
    messageCard: z.string().max(160, "Máximo 160 caracteres").optional(),
    variablesCard: z.array(z.string()).optional(),
    variableDescriptions: z.record(z.string()).optional(),
    variableExamples: z.record(z.string()).optional(),
    fileData: z.object({
        url: z.string(),
        mediaId: z.string().nullable(),
    }).nullable(),
    buttons: z.array(buttonSchema).optional(),
    emojiCountCard: z.number().optional(),
});

export const editTemplateCarouselFormSchema = z.object({
    templateName: z.string().min(1, "El nombre de la plantilla es requerido"),
    selectedCategory: z.string().min(1, "La categoría es requerida"),
    templateType: z.string().default("CAROUSEL"),
    languageCode: z.string().min(1, "El idioma es requerido"),
    vertical: z.string().optional(),
    message: z.string().min(1, "El contenido es requerido").max(550, "Máximo 550 caracteres").refine(
        (val) => {
            const matches = val.match(/\{\{([^}]+)\}\}/g);
            if (!matches) return true;
            return matches.every((m) => /^\{\{\d+\}\}$/.test(m));
        },
        "Las variables deben ser numéricas, ej: {{1}}, {{2}}. No se permiten nombres como {{nombre_cliente}}"
    )
        .refine(
            (val) => {
                const matches = val.match(/\{\{([^}]+)\}\}/g);
                if (!matches) return true;
                return matches.every((m) => /^\{\{\d+\}\}$/.test(m));
            },
            "Las variables deben ser numéricas, ej: {{1}}, {{2}}. No se permiten nombres como {{nombre_cliente}}"
        ),
    carouselType: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
    cantidadBotones: z.number().min(1).max(2).default(1),
    tipoBoton: z.enum(["QUICK_REPLY", "URL", "PHONE_NUMBER"]).default("QUICK_REPLY"),
    cards: z.array(cardSchema).default([]),
    variables: z.record(z.object({
        description: z.string().optional(),
        example: z.string().optional(),
    })).optional(),
});

export type EditTemplateCarouselFormData = z.infer<typeof editTemplateCarouselFormSchema>;