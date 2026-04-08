import { z } from 'zod';

export const editTemplateCatalogFormSchema = z.object({
    templateName: z.string().min(1, "El nombre de la plantilla es requerido"),
    selectedCategory: z.string().min(1, "La categoría es requerida"),
    templateType: z.string().default("CATALOG"),
    languageCode: z.string().min(1, "El idioma es requerido"),
    vertical: z.string().optional(),
    message: z.string().min(1, "El contenido es requerido").max(550, "Máximo 550 caracteres"),
    header: z.string().max(60, "Máximo 60 caracteres").optional(),
    footer: z.string().max(60, "Máximo 60 caracteres").optional(),
    mediaId: z.string().optional(),
    uploadedUrl: z.string().optional(),
    // Cambiar esta línea:
    variables: z.object({}).catchall(z.object({
        description: z.string().optional(),
        example: z.string().optional(),
    })).default({})
});

export type EditTemplateCatalogFormData = z.infer<typeof editTemplateCatalogFormSchema>;