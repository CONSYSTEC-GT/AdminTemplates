import { z } from "zod";
import { templateGupshupSchema } from "./TemplateGupshup.schema.js";

// Schema unificado: Gupshup + campos exclusivos de TalkMe
export const templateFormSchema = templateGupshupSchema.extend({
    pantallas: z
        .array(z.string())
        .min(1, "Debes seleccionar al menos una pantalla"),

    uploadedUrl: z
        .string()
        .optional()
        .default(""),
});

export type TemplateFormValues = z.infer<typeof templateFormSchema>;