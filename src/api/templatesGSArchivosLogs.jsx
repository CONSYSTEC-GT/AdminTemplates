export const guardarLogArchivos = async (logArchivosData, urlTemplatesGS) => {
    // Función para registrar logs de subida de archivos
    try {
        // Validar que urlTemplatesGS esté definido
        if (!urlTemplatesGS) {
            throw new Error('urlTemplatesGS no está definido');
        }

        // Construir la URL correctamente
        const url = `${urlTemplatesGS}logs_ws/`;
        
        console.log('🔍 [guardarLogArchivos] Iniciando guardado de log:', {
            evento: logArchivosData.NOMBRE_EVENTO,
            url: url,
            urlTemplatesGS: urlTemplatesGS
        });

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

        console.log('📦 [guardarLogArchivos] Payload preparado:', {
            evento: payload.NOMBRE_EVENTO,
            url_peticion: payload.URL_PETICION,
            tiene_peticion: !!payload.PETICION,
            tiene_respuesta: !!payload.RESPUESTA,
            creado_por: payload.CREADO_POR
        });

        // Realizar la petición con fetch
        console.log('🚀 [guardarLogArchivos] Enviando petición a:', url);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('📡 [guardarLogArchivos] Respuesta recibida:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            // Si la respuesta no es exitosa, lanzar un error con el mensaje
            let errorData = null;
            try {
                errorData = await response.json();
            } catch (parseError) {
                const textError = await response.text();
                console.error('❌ [guardarLogArchivos] Error al parsear respuesta de error:', textError);
                errorData = { message: textError || `Error HTTP ${response.status}` };
            }
            
            console.error('❌ [guardarLogArchivos] Error en la respuesta:', {
                status: response.status,
                statusText: response.statusText,
                errorData: errorData
            });
            
            throw new Error(errorData?.message || `Error en la petición: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ [guardarLogArchivos] Log guardado exitosamente:', data);
        
        return data;
    } catch (error) {
        console.error('❌ [guardarLogArchivos] Error al registrar log:', {
            message: error.message,
            stack: error.stack,
            urlTemplatesGS: urlTemplatesGS,
            logArchivosData: {
                evento: logArchivosData?.NOMBRE_EVENTO,
                url_peticion: logArchivosData?.URL_PETICION
            }
        });
        // Lanzar el error para que sea manejado en el componente
        throw error;
    }
};
