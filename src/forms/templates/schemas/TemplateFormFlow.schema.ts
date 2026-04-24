import { z } from "zod";
import { templateBaseSchema, variablesSchema } from "./Template.schema";

// 1. Definimos el botón con todos los campos que usa tu componente
export const flowButtonSchema = z.object({
    id: z.string().optional(), // Para el key de React
    type: z.literal("FLOW"),
    text: z.string().min(1, "El texto del botón es requerido"),
    flow_id: z.string().min(1, "Debes seleccionar un flow"), // El error venía de aquí
    flow_action: z.enum(["NAVIGATE", "DATA_EXCHANGE"]).default("NAVIGATE"),
    navigate_screen: z.string().optional(),
    icon: z.string().optional().default("PROMOTION"),
});

export const templateFormFlowSchema = templateBaseSchema
    .extend({
        header: z
            .string()
            .max(60, "Máximo 60 caracteres")
            .optional()
            .default(""),

        footer: z
            .string()
            .max(60, "Máximo 60 caracteres")
            .optional()
            .default(""),

        vertical: z
            .string()
            .min(1, "Este campo es requerido")
            .max(100, "Máximo 100 caracteres"),

        languageCode: z
            .string()
            .min(1, "Este campo es requerido"),

        mediaId: z
            .string()
            .optional()
            .default(""),

        // Exactamente un botón de tipo Flow
        buttons: z
            .array(flowButtonSchema)
            .length(1, "Las plantillas Flow requieren exactamente un botón"),

        variables: variablesSchema.optional().default({}),

        pantallas: z
            .array(z.string())
            .min(1, "Debes seleccionar al menos una pantalla"),

        uploadedUrl: z
            .string()
            .optional()
            .default(""),
    })
    .superRefine((data, ctx) => {
        // Validación de multimedia
        if (data.templateType !== "text" && data.templateType !== "catalog") {
            if (!data.mediaId || data.mediaId.trim() === "") {
                ctx.addIssue({
                    path: ["mediaId"],
                    code: z.ZodIssueCode.custom,
                    message: "Debes subir un archivo para este tipo de plantilla",
                });
            }
        }
    });

export type TemplateFormFlowValues = z.infer<typeof templateFormFlowSchema>;