import { z } from "zod";

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const variableEntrySchema = z.object({
    description: z
        .string()
        .min(1, "La descripción de la variable es requerida")
        .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guión bajo"),
    example: z
        .string()
        .min(1, "El texto de ejemplo es requerido"),
});

const buttonSchema = z
    .object({
        id: z.string(),
        type: z.enum(["QUICK_REPLY", "URL", "PHONE_NUMBER"]),
        title: z
            .string()
            .min(1, "El título del botón es requerido")
            .max(25, "Máximo 25 caracteres"),
        url: z.string().optional(),
        phoneNumber: z.string().optional(),
    })
    .superRefine((btn, ctx) => {
        if (btn.type === "URL") {
            if (!btn.url || btn.url.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "La URL es requerida",
                    path: ["url"],
                });
            } else if (!/^(ftp|http|https):\/\/[^ "]+$/.test(btn.url)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "URL no válida. Debe comenzar con http://, https:// o ftp://",
                    path: ["url"],
                });
            }
        }
        if (btn.type === "PHONE_NUMBER") {
            if (!btn.phoneNumber || btn.phoneNumber.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "El número de teléfono es requerido",
                    path: ["phoneNumber"],
                });
            }
        }
    });

const fileDataSchema = z.object({
    url: z.string().min(1, "La URL del archivo es requerida"),
    mediaId: z.string().nullable(),
});

const carouselCardSchema = z.object({
    id: z.string(),
    messageCard: z
        .string()
        .min(1, "El contenido de la tarjeta es requerido")
        .max(160, "Máximo 160 caracteres"),
    variablesCard: z.record(variableEntrySchema).optional().default({}),
    fileData: fileDataSchema.nullable().refine((v) => v !== null, {
        message: "Debes subir una imagen o video para esta tarjeta",
    }),
    buttons: z
        .array(buttonSchema)
        .min(1, "Cada tarjeta debe tener al menos un botón"),
    emojiCountCard: z.number().optional().default(0),
});

// ─── Main schema ──────────────────────────────────────────────────────────────

export const templateFormCarouselSchema = z.object({
    templateName: z
        .string()
        .min(1, "El nombre de la plantilla es requerido")
        .regex(
            /^[a-z0-9_]+$/,
            "Solo minúsculas, números y guión bajo. Sin espacios ni acentos."
        ),

    selectedCategory: z
        .string()
        .min(1, "Debes seleccionar una categoría"),

    templateType: z.literal("CAROUSEL"),

    languageCode: z
        .string()
        .min(1, "Debes seleccionar un idioma"),

    vertical: z
        .string()
        .min(1, "Las etiquetas de la plantilla son requeridas"),

    message: z
        .string()
        .min(1, "El contenido del mensaje es requerido")
        .max(550, "Máximo 550 caracteres")
        .refine(
            (val) => {
                const matches = val.match(/\{\{([^}]+)\}\}/g);
                if (!matches) return true;
                return matches.every((m) => /^\{\{\d+\}\}$/.test(m));
            },
            "Las variables deben ser numéricas, ej: {{1}}, {{2}}. No se permiten nombres como {{nombre_cliente}}"
        ),

    variables: z
        .record(variableEntrySchema)
        .optional()
        .default({}),

    pantallas: z
        .array(z.string())
        .min(1, "Debes seleccionar al menos una pantalla"),

    carouselType: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),

    cantidadBotones: z.enum(["1", "2"]).default("1"),

    tipoBoton: z
        .enum(["QUICK_REPLY", "URL", "PHONE_NUMBER"])
        .default("QUICK_REPLY"),

    tipoBoton2: z
        .enum(["QUICK_REPLY", "URL", "PHONE_NUMBER"])
        .optional()
        .default("QUICK_REPLY"),

    cards: z
        .array(carouselCardSchema)
        .min(1, "El carrusel debe tener al menos una tarjeta")
        .max(10, "El carrusel permite un máximo de 10 tarjetas"),
});

export type TemplateFormCarouselValues = z.infer<typeof templateFormCarouselSchema>;