export const guardarLogArchivos = async (logArchivosData, urlTemplatesGS) => {

    const url = urlTemplatesGS + 'logs_ws'
    
    // Función para registrar logs de subida de archivos
    try {
        // Usar los datos proporcionados en logArchivosData o valores por defecto
        const payload = {
            ID_LOG_WS: logArchivosData.ID_LOG_WS || null,
            ID_CATEGORIA: logArchivosData.ID_CATEGORIA || null,
            ID_CONVERSACION: logArchivosData.ID_CONVERSACION || null,
            CLAVE_REGISTRO: logArchivosData.CLAVE_REGISTRO || null,
            IP: logArchivosData.IP || "127.0.0.1",
            NOMBRE_EVENTO: logArchivosData.NOMBRE_EVENTO || "EVENTO_SIN_NOMBRE",
            TIPO_LOG: logArchivosData.TIPO_LOG !== undefined ? logArchivosData.TIPO_LOG : 0,
            URL_PETICION: logArchivosData.URL_PETICION || "",
            PETICION: typeof logArchivosData.PETICION === 'object'
                ? JSON.stringify(logArchivosData.PETICION)
                : logArchivosData.PETICION || "",
            RESPUESTA: typeof logArchivosData.RESPUESTA === 'object'
                ? JSON.stringify(logArchivosData.RESPUESTA)
                : logArchivosData.RESPUESTA || "",
            INICIO_PETICION: logArchivosData.INICIO_PETICION || new Date().toISOString(),
            FIN_PETICION: logArchivosData.FIN_PETICION || new Date().toISOString(),
            LOCAL_PAYMENT_HASH: logArchivosData.LOCAL_PAYMENT_HASH || null,
            NOTIFICACION_PAYMENT_HASH: logArchivosData.NOTIFICACION_PAYMENT_HASH || null,
            CREADO_POR: logArchivosData.CREADO_POR || "USUARIO_DESCONOCIDO"
        };

        
        

        // Realizar la petición con fetch
        const response = await fetch(`${urlTemplatesGS}logs_ws/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // Si la respuesta no es exitosa, lanzar un error con el mensaje
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Error en la petición: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        
        return data;
    } catch (error) {
        console.error('❌ Error al registrar log:', error.message);
        // No queremos que el logging cause problemas en el flujo principal
        throw error; // Opcional: depende de si quieres manejar el error fuera
    }
};
