export { templateBaseSchema, buttonSchema, variablesSchema } from "./Template.schema.js";
export { templateGupshupSchema }                             from "./TemplateGupshup.schema.js";
export { templateFormSchema }                                from "./TemplateForm.schema.js";

export const buildVariablesObject = (
    variables:            string[],
    variableDescriptions: Record<string, string>,
    variableExamples:     Record<string, string>,
): Record<string, { description: string; example: string }> => {
    return variables.reduce<Record<string, { description: string; example: string }>>(
        (acc, varName) => {
            acc[varName] = {
                description: variableDescriptions[varName] ?? "",
                example:     variableExamples[varName]     ?? "",
            };
            return acc;
        },
        {}
    );
};