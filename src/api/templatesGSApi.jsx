import Swal from 'sweetalert2';
import { showSnackbar } from '../utils/Snackbar';
import { getMediaType } from '../utils/validarUrl';

const saveTemplateParams = async (ID_PLANTILLA, variables, variableDescriptions, urlTemplatesGS) => {
  const tipoDatoId = 1;
  const url = urlTemplatesGS + 'parametros'
  

  try {
    const results = [];
    for (let i = 0; i < variables.length; i++) {
      const variableData = {
        ID_PLANTILLA: ID_PLANTILLA,
        ID_PLANTILLA_TIPO_DATO: tipoDatoId,
        NOMBRE: variableDescriptions[variables[i]] || '',
        PLACEHOLDER: variableDescriptions[variables[i]] || '',
        ORDEN: i,
        CREADO_POR: "Sistema.TalkMe",
      };


      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variableData),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error al guardar la variable ${variables[i]}: ${errorMessage}`);
      }

      const result = await response.json();
      results.push(result);
    }

    
    showSnackbar("✅ Variables guardadas exitosamente", "success");
    return results;
  } catch (error) {
    console.error('Error:', error);
    showSnackbar("❌ Error al guardar las variables", "error");
    throw error;
  }
};

const deleteTemplateParams = async (ID_PLANTILLA, urlTemplatesGS) => {
  const url = `${urlTemplatesGS}parametros/plantilla/${ID_PLANTILLA}`;
  try {
    const response = await fetch(
      url,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Error al eliminar parámetros: ${errorMessage}`);
    }

    const result = await response.json();
    
    showSnackbar("🗑️ Parámetros eliminados correctamente", "success");
    return result;
  } catch (error) {
    console.error("Error eliminando parámetros:", error);
    showSnackbar("❌ Error al eliminar parámetros", "error");
    throw error;
  }
};

const saveCardsTemplate = async ({ ID_PLANTILLA, cards = [] }, idNombreUsuarioTalkMe, urlTemplatesGS) => {
  
  const url = urlTemplatesGS + 'tarjetas/';
  console.log ("URL EN SAVE CARDS", url);
  const headers = {
    "Content-Type": "application/json",
  };

  for (const card of cards) {
    // Adaptamos la estructura a lo que espera el API
    const mediaUrl = card?.fileData?.url || null;
    const body = card.messageCard;
    const buttons = card.buttons || [];


    if (!mediaUrl && !body) {
      console.warn("Tarjeta ignorada: no tiene contenido (mediaUrl o body)");
      continue;
    }

    const data = {
      ID_PLANTILLA_WHATSAPP_TARJETA: null,
      ID_PLANTILLA: ID_PLANTILLA,
      ID_MEDIA: null,
      DESCRIPCION: body,
      LINK: mediaUrl || null,
      BOTON_0_TEXTO: buttons[0]?.title || '',
      BOTON_0_COMANDO: buttons[0]?.title || '',
      BOTON_1_TEXTO: buttons[1]?.title || '',
      BOTON_1_COMANDO: buttons[1]?.title || '',
      CREADO_POR: idNombreUsuarioTalkMe,
    };

    

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error al guardar tarjeta:", errorResponse);
        showSnackbar(`❌ Error guardando tarjeta: ${errorResponse.message || "Solicitud inválida"}`, "error");
        continue;
      }

      const result = await response.json();
      
      showSnackbar("✅ Tarjeta guardada correctamente", "success");
    } catch (error) {
      console.error("Error en la petición de tarjeta:", error);
      showSnackbar("❌ Error en la petición de tarjeta", "error");
    }
  }
};

export const saveTemplateToTalkMe = async (templateId, templateData, idNombreUsuarioTalkMe, variables = [], variableDescriptions = {}, cards = [], idBotRedes, urlTemplatesGS) => {
  const { templateName, selectedCategory, message, uploadedUrl, templateType, pantallas } = templateData;

  //const url = 'https://certificacion.talkme.pro/templatesGS/api/plantillas/';
  const url = urlTemplatesGS + 'plantillas';
  const headers = {
    "Content-Type": "application/json",
  };

  //13 y 14 son en certi igual que 149 en bot redes y en dev son 17 y 
  //10 Y 13 SON EN S1 AL S4
  let ID_PLANTILLA_CATEGORIA;
  if (selectedCategory === "MARKETING") {
    ID_PLANTILLA_CATEGORIA = 10;
  } else if (selectedCategory === "UTILITY") {
    ID_PLANTILLA_CATEGORIA = 13;
  } else {
    console.error("Categoría no válida:", selectedCategory);
    Swal.fire({
      title: '❌ Error',
      text: 'Categoría no válida.',
      icon: 'error',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#00c3ff'
    });
    return null; // Retornar null si la categoría no es válida
  }

  let TIPO_PLANTILLA;
  if (templateType === "CAROUSEL") {
    TIPO_PLANTILLA = 1;
  } else {
    TIPO_PLANTILLA = 0;
  }

  

  const mediaMap = {
    image: "image",
    video: "video",
    document: "document",
    CAROUSEL: "image"
  };

  const MEDIA = mediaMap[templateType] || null;

  const mensajeProcesado = reordenarVariables(message);

  const nombreProcesado = templateName.replace(/_/g, " ");

  const data = {
    ID_PLANTILLA: null,
    ID_PLANTILLA_CATEGORIA: ID_PLANTILLA_CATEGORIA,
    ID_BOT_REDES: idBotRedes,
    ID_INTERNO: templateId,
    NOMBRE: nombreProcesado,
    NOMBRE_PLANTILLA: templateName,
    MENSAJE: mensajeProcesado,
    TIPO_PLANTILLA: TIPO_PLANTILLA,
    MEDIA: MEDIA,
    URL: uploadedUrl,
    PANTALLAS: pantallas,
    ESTADO: 0,
    AUTORIZADO: 0,
    ELIMINADO: 0,
    ESTADO_GUPSHUP: 2,
    SEGUIMIENTO_EDC: 0,
    CREADO_POR: idNombreUsuarioTalkMe,
  };

  // Imprimir el segundo request
  console.log("Segundo request enviado:", {
    url: url,
    headers: headers,
    body: data,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Error response:", errorResponse);
      Swal.fire({
        title: '❌ Error',
        text: errorResponse.message || 'Solicitud inválida.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00c3ff'
      });
      return null; // Retornar null en caso de error
    }

    const result = await response.json();
    Swal.fire({
      title: '¡Éxito!',
      text: 'La plantilla fue creada correctamente.',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#00c3ff'
    });
    

    // Si tenemos variables, hacer el tercer request
    if (result && result.ID_PLANTILLA && variables && variables.length > 0) {
      await saveTemplateParams(result.ID_PLANTILLA, variables, variableDescriptions, urlTemplatesGS);
    }

    if (result && result.ID_PLANTILLA && cards && cards.length > 0) {
      await saveCardsTemplate(
        {
          ID_PLANTILLA: result.ID_PLANTILLA,
          cards: cards
        },
        idNombreUsuarioTalkMe,
        urlTemplatesGS
      );
    }

    return result; // Retornar el resultado en caso de éxito
  } catch (error) {
    console.error("Error en el segundo request:", error);
    Swal.fire({
      title: '❌ Error',
      text: 'Ocurrió un error en el segundo request.',
      icon: 'error',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#00c3ff'
    });
    return null; // Retornar null en caso de error
  }
};

export const editTemplateToTalkMe = async (idTemplate, templateData, idNombreUsuarioTalkMe, variables = [], variableDescriptions = {}, cards = [], urlTemplatesGS) => {
  const { templateName, selectedCategory, message, uploadedUrl, templateType } = templateData;

  // URL para actualizar plantilla por ID_INTERNO
  //const url = `https://certificacion.talkme.pro/templatesGS/api/plantillas/${idTemplate}`;
  const url = `${urlTemplatesGS}plantillas/${idTemplate}`;
  const headers = {
    "Content-Type": "application/json",
  };

  // Mapeo de categorías
  let ID_PLANTILLA_CATEGORIA;
  if (selectedCategory === "MARKETING") {
    ID_PLANTILLA_CATEGORIA = 13;
  } else if (selectedCategory === "UTILITY") {
    ID_PLANTILLA_CATEGORIA = 14;
  } else {
    console.error("Categoría no válida:", selectedCategory);
    showSnackbar("❌ Categoría no válida", "error");
    return null;
  }

  // Configuración de tipo de plantilla
  let TIPO_PLANTILLA;
  let PANTALLAS;
  if (templateType === "CAROUSEL") {
    TIPO_PLANTILLA = 1;
    PANTALLAS = 4;
  } else {
    TIPO_PLANTILLA = 0;
    PANTALLAS = 0;
  }

  // Mapeo de tipos de media
  const mediaMap = {
    IMAGE: "image",
    VIDEO: "video",
    DOCUMENT: "document",
    CAROUSEL: "image",
    CATALOG: "image"
  };

  const MEDIA = mediaMap[templateType] || null;

  // Crear un objeto con los datos actualizados
  const data = {
    ID_INTERNO: idTemplate, // ID de la plantilla de GupShup
    ID_PLANTILLA_CATEGORIA: ID_PLANTILLA_CATEGORIA,
    ID_BOT_REDES: 149,
    NOMBRE: templateName,
    MENSAJE: message,
    TIPO_PLANTILLA: TIPO_PLANTILLA,
    MEDIA: MEDIA,
    URL: uploadedUrl,
    PANTALLAS: PANTALLAS,
    ESTADO: 1,
    AUTORIZADO: 1,
    ELIMINADO: 0,
    SEGUIMIENTO_EDC: 0,
    MODIFICADO_POR: idNombreUsuarioTalkMe,
    FECHA_MODIFICACION: new Date().toISOString()
  };

  // Log para seguimiento
  console.log("Request de edición enviado:", {
    url: url,
    headers: headers,
    body: data,
  });

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Error response:", errorResponse);
      showSnackbar(`❌ Error al editar la plantilla: ${errorResponse.message || "Solicitud inválida"}`, "error");
      return null;
    }

    const result = await response.json();
    showSnackbar("✅ Plantilla actualizada exitosamente", "success");
    

    // Para actualizar los parámetros y tarjetas, necesitamos el ID_PLANTILLA
    // que viene en la respuesta del servidor
    const talkmeId = result.ID_PLANTILLA;

    // Actualizar variables si existen
    if (talkmeId) {
      try {

        // Obtener y limpiar parámetros existentes
        const parametros = await obtenerParametros(urlTemplatesGS, talkmeId);
        
        if (parametros && parametros.length > 0) {
          const parametrosIds = parametros.map(param => param.ID_PLANTILLA_PARAMETRO);
          await eliminarBroadcastParametros(urlTemplatesGS, parametrosIds);
        }

        await deleteTemplateParams(talkmeId, urlTemplatesGS);

        // Insertar nuevos parámetros solo si existen
        if (variables && variables.length > 0) {
          await saveTemplateParams(talkmeId, variables, variableDescriptions, urlTemplatesGS);
        }

      } catch (error) {
      }
    }
    
    if (talkmeId) {
      try {
        // 1. Eliminar todas las tarjetas existentes de una sola vez
        const deleteResponse = await fetch(`${urlTemplatesGS}tarjetas/plantilla/${talkmeId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          }
        });
        
        // Solo lanzamos error si la respuesta no es exitosa Y no es un 404 (no encontrado)
        if (!deleteResponse.ok && deleteResponse.status !== 404) {
          throw new Error("No se pudieron eliminar las tarjetas existentes");
        }

        // 2. Agregar las nuevas tarjetas
        for (const card of cards) {
          
          await saveCardsTemplate({
            ID_PLANTILLA: talkmeId,
            cards: [card]
          }, idNombreUsuarioTalkMe, urlTemplatesGS); // <-- Añade la URL aquí
        }

      } catch (error) {
      }
    }

    return result;
  } catch (error) {
    return null;
  }
};

export const obtenerApiToken = async (urlTemplatesGS, idEmpresa) => {
  const url = `${urlTemplatesGS}empresas/${idEmpresa}/token`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener token: ${response.status}`);
    }

    const data = await response.json();

    // Solo retornar API_TOKEN
    return data.API_TOKEN;

  } catch (error) {
    console.error("Error obteniendo el API Token:", error);
    return null;
  }
};

export const obtenerPantallasMedia = async (urlTemplatesGS, id_interno) => {
  const url = `${urlTemplatesGS}plantillas/${id_interno}/pantallas-media`;
  

  try{
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok){
      throw new Error(`Error al obtener la información de la plantilla: ${response.status}`);
    }

    const data = await response.json();

    return data
  } catch (error){
    console.error("Error obteniendo info de la plantilla:", error);
    return null;
  }

}

export const obtenerParametros = async (urlTemplatesGS, id_plantilla) => {
  const url = `${urlTemplatesGS}parametros/plantilla/${id_plantilla}`;
  console.log(url);
  

  try{
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(response);

    if (!response.ok){
      throw new Error(`Error al obtener la información de la plantilla: ${response.status}`);
    }

    const data = await response.json();

    return data
  } catch (error){
    console.error("Error obteniendo parametros de la plantilla", error);
    return null;
  }
}

export const eliminarParametrosPlantilla = async (urlTemplatesGS, id_plantilla) => {
  const url = `${urlTemplatesGS}parametros/plantilla/${id_plantilla}`;
  

  try {
    const response = await fetch(url, {
      method: 'DELETE', // Cambiado a DELETE ya que es un endpoint DELETE
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar los parámetros de la plantilla: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error eliminando parámetros de la plantilla", error);
    return null;
  }
}

export const eliminarBroadcastParametros = async (urlTemplatesGS, parametrosIds) => {
  try {
    const resultados = [];
    
    // Iterar sobre cada ID de parámetro
    for (const idParametro of parametrosIds) {
      const url = `${urlTemplatesGS}broadcast_plantilla_valores/ID_PLANTILLA_PARAMETRO/${idParametro}`;
      
      try {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          resultados.push({ id: idParametro, eliminado: true });
        } else if (response.status === 404) {
          // El parámetro no existe en broadcast, no es un error
          resultados.push({ id: idParametro, eliminado: false, motivo: 'no_existe' });
        } else {
          throw new Error(`Error ${response.status}`);
        }
      } catch (error) {
        console.error(`Error al eliminar parámetro ${idParametro}:`, error);
        resultados.push({ id: idParametro, eliminado: false, motivo: 'error', error: error.message });
      }
    }

    return resultados;
  } catch (error) {
    console.error("Error general al eliminar parámetros de broadcast:", error);
    return null;
  }
};



//utils

function reordenarVariables(message) {
  // Encontrar todas las variables en el mensaje
  const variables = message.match(/\{\{\d+\}\}/g) || [];
  
  // Crear un mapa para el reordenamiento: {{1}} -> {{0}}, {{2}} -> {{1}}, etc.
  const reordenamiento = {};
  variables.forEach((variable, index) => {
    const numeroOriginal = variable.match(/\d+/)[0];
    reordenamiento[variable] = `{{${index}}}`;
  });
  
  // Reemplazar cada variable con su nuevo número
  let nuevoMensaje = message;
  for (const [vieja, nueva] of Object.entries(reordenamiento)) {
    nuevoMensaje = nuevoMensaje.replace(new RegExp(escapeRegExp(vieja), 'g'), nueva);
  }
  
  return nuevoMensaje;
}

// Función auxiliar para escapar caracteres especiales en regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export { saveTemplateParams };