import { z } from "zod";

export const TEMPLATE_TYPES = ["text", "image", "video", "document", "catalog"] as const;
export const BUTTON_TYPES   = ["QUICK_REPLY", "URL", "PHONE_NUMBER"]             as const;
export const CATEGORIES     = ["MARKETING", "UTILITY", "AUTHENTICATION"]         as const;

// ── Tipos inferidos ──────────────────────────────────────────────────────────
export type TemplateType = typeof TEMPLATE_TYPES[number];
export type ButtonType   = typeof BUTTON_TYPES[number];
export type Category     = typeof CATEGORIES[number];

// ── Schemas ──────────────────────────────────────────────────────────────────
export const buttonSchema = z
    .object({
        id:          z.string(),
        title:       z.string()
            .min(1,  "El título del botón es requerido")
            .max(25, "Máximo 25 caracteres"),
        type:        z.enum(BUTTON_TYPES, {
            errorMap: (_issue, _ctx) => ({ message: "Tipo de botón inválido" }),
        }),
        url:         z.string().optional(),
        phoneNumber: z.string().optional(),
    })
    .superRefine((btn, ctx) => {
        if (btn.type === "URL") {
            if (!btn.url || btn.url.trim() === "") {
                ctx.addIssue({
                    path:    ["url"],
                    code:    z.ZodIssueCode.custom,
                    message: "La URL es requerida para este tipo de botón",
                });
            } else {
                const urlResult = z.string().url("La URL no es válida").safeParse(btn.url);
                if (!urlResult.success) {
                    ctx.addIssue({
                        path:    ["url"],
                        code:    z.ZodIssueCode.custom,
                        message: urlResult.error.errors[0].message,
                    });
                }
            }
        }

        if (btn.type === "PHONE_NUMBER") {
            if (!btn.phoneNumber || btn.phoneNumber.trim() === "") {
                ctx.addIssue({
                    path:    ["phoneNumber"],
                    code:    z.ZodIssueCode.custom,
                    message: "El número de teléfono es requerido",
                });
            }
        }
    });

export const variablesSchema = z
    .record(
        z.string(),
        z.object({
            example:     z.string().min(1, "El texto de ejemplo es requerido"),
            description: z.string().min(1, "La descripción es requerida"),
        })
    )
    .superRefine((vars, ctx) => {
        const descriptions = Object.entries(vars).map(([varName, val]) => ({
            varName,
            description: val.description?.trim() ?? "",
        }));

        const seen  = new Map<string, string>();
        const dupes = new Set<string>();

        for (const { varName, description } of descriptions) {
            if (!description) continue;
            if (seen.has(description)) {
                dupes.add(varName);
                dupes.add(seen.get(description)!);
            } else {
                seen.set(description, varName);
            }
        }

        dupes.forEach((varName) => {
            ctx.addIssue({
                path:    [varName, "description"],
                code:    z.ZodIssueCode.custom,
                message: "Esta descripción ya existe en otra variable",
            });
        });
    });

export const templateBaseSchema = z.object({
    templateName: z
        .string()
        .min(1, "Este campo es requerido")
        .regex(
            /^[a-z0-9_]+$/,
            "Solo letras minúsculas, números y guion bajo (_)"
        ),

    templateType: z.enum(TEMPLATE_TYPES, {
        errorMap: (_issue, _ctx) => ({ message: "Selecciona un tipo de plantilla" }),
    }),

    selectedCategory: z
        .string()
        .min(1, "Este campo es requerido") // Primero valida que no esté vacío
        .refine(
            (val) => CATEGORIES.includes(val as Category),
            "Selecciona una categoría válida"
        ),


    message: z
        .string()
        .min(1,   "Este campo es requerido")
        .max(550, "Máximo 550 caracteres")
        .refine(
            (val) => {
                const matches = val.match(/\{\{([^}]+)\}\}/g);
                if (!matches) return true;
                return matches.every((m) => /^\{\{\d+\}\}$/.test(m));
            },
            "Las variables deben ser numéricas, ej: {{1}}, {{2}}. No se permiten nombres como {{nombre_cliente}}"
        ),
});

// ── Tipos inferidos del schema ────────────────────────────────────────────────
export type ButtonFormValues   = z.infer<typeof buttonSchema>;
export type TemplateBaseValues = z.infer<typeof templateBaseSchema>;