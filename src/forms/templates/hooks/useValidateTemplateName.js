const checkTemplateName = async (urlTemplatesGS, nombre, idBotRedes) => {
    const nombreFormateado = nombre.replace(/_/g, ' ');
    if (!nombreFormateado.trim() || !idBotRedes) return null;

    try {
        const existe = await validarNombrePlantillas(urlTemplatesGS, nombreFormateado, idBotRedes);
        return existe;
    } catch {
        return null;
    }
};