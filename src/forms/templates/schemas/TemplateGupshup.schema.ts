import { z } from "zod";
import {
    templateBaseSchema,
    buttonSchema,
    variablesSchema,
} from "./template.schema";

export const templateGupshupSchema = templateBaseSchema
    .extend({
        languageCode: z
            .string()
            .min(1, "Este campo es requerido"),

        vertical: z
            .string()
            .min(1, "Este campo es requerido"),

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

        mediaId:       z.string().optional().default(""),
        example:       z.string().optional().default(""),
        exampleHeader: z.string().optional().default(""),

        buttons: z
            .array(buttonSchema)
            .max(10, "Máximo 10 botones permitidos")
            .optional()
            .default([]),

        variables: variablesSchema.optional(),
    })
    .superRefine((data, ctx) => {
        if (data.templateType !== "text" && data.templateType !== "catalog") {
            if (!data.mediaId || data.mediaId.trim() === "") {
                ctx.addIssue({
                    path:    ["mediaId"],
                    code:    z.ZodIssueCode.custom,
                    message: "Debes subir un archivo para este tipo de plantilla",
                });
            }
        }
    });

export type TemplateGupshupValues = z.infer<typeof templateGupshupSchema>;