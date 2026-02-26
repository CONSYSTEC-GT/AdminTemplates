import Swal from 'sweetalert2';
import { showSnackbar } from '../utils/Snackbar';
import { getMediaType } from '../utils/validarUrl';

const saveTemplateParams = async (ID_PLANTILLA, variables, variableDescriptions, urlTemplatesGS) => {
  const tipoDatoId = 1;
  const url = urlTemplatesGS + 'parametros'


  try {
    const results = [];

    console.log('📊 Procesando todas las variables:', variables);

    for (let i = 0; i < variables.length; i++) {
      const variable = variables[i];
      const variableType = variableTypes[variable] || 'normal';
      const nombreVariable = variableDescriptions[variable] || variable;

      console.log(`\n🔄 Procesando variable ${i + 1}/${variables.length}: ${variable} (tipo: ${variableType})`);

      // ⬅️ Determinar el ID_PLANTILLA_TIPO_DATO según el tipo
      const ID_PLANTILLA_TIPO_DATO = variableType === 'list' ? 5 : 1;

      const data = {
        ID_PLANTILLA: ID_PLANTILLA,
        ID_PLANTILLA_TIPO_DATO: ID_PLANTILLA_TIPO_DATO, // ⬅️ AGREGAR ESTE CAMPO
        NOMBRE: nombreVariable,
        PLACEHOLDER: nombreVariable,
        ORDEN: i,
        CREADO_POR: "Sistema.TalkMe",
      };

      console.log('📤 Datos a enviar:', data);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('❌ Error en response:', errorMessage);
        throw new Error(
          `Error al guardar el parámetro ${variable}: ${errorMessage}`
        );
      }

      const result = await response.json();
      results.push(result);
    }


    showSnackbar("✅ Variables guardadas exitosamente", "success");
    return results;
  } catch (error) {
    console.error('💥 Error en saveTemplateParams:', error);
    showSnackbar("❌ Error al guardar los parámetros", "error");
    throw error;
  }
};

export const saveTemplateParamsOptions = async (
  ID_PLANTILLA,
  idNombreUsuarioTalkMe,
  variables,
  variableDescriptions,
  variableTypes,
  variableLists,
  urlTemplatesGS
) => {
  console.log('🟢 === INICIO saveTemplateParamsOptions ===');
  console.log('📥 Parámetros recibidos:', {
    ID_PLANTILLA,
    idNombreUsuarioTalkMe,
    variables,
    variableDescriptions,
    variableTypes,
    variableLists,
    urlTemplatesGS
  });

  const url = urlTemplatesGS + 'parametros_opciones';

  try {
    const results = [];

    // Filtrar solo las variables de tipo lista
    const listVariables = variables.filter(variable => variableTypes[variable] === 'list');
    console.log('📊 Variables de tipo lista encontradas:', listVariables);

    if (listVariables.length === 0) {
      console.log('⚠️ No hay variables de tipo lista para procesar');
      return results;
    }

    // Obtener los parámetros creados
    console.log('🔍 Obteniendo IDs de parámetros de la BD...');
    const parametrosResponse = await fetch(`${urlTemplatesGS}parametros?ID_PLANTILLA=${ID_PLANTILLA}`);

    if (!parametrosResponse.ok) {
      throw new Error('Error al obtener los parámetros existentes');
    }

    const parametrosExistentes = await parametrosResponse.json();
    console.log('📋 Parámetros existentes en BD:', parametrosExistentes);

    // SOLUCIÓN: Crear un mapa por ORDEN para hacer el match correcto
    // Ya que el ORDEN se guarda como i en saveTemplateParams
    const parametrosPorOrden = {};
    parametrosExistentes.forEach(p => {
      parametrosPorOrden[p.ORDEN] = p;
    });
    console.log('🗺️ Mapa de parámetros por ORDEN:', parametrosPorOrden);

    for (let i = 0; i < listVariables.length; i++) {
      const variable = listVariables[i];
      console.log(`\n🔄 Procesando variable lista: ${variable}`);

      const options = variableLists[variable] || [];
      console.log(`📝 Opciones para ${variable}:`, options);

      if (options.length === 0) {
        console.log(`⚠️ No hay opciones para la variable ${variable}`);
        continue;
      }

      // Encontrar el índice original de esta variable en el array completo
      const indexInOriginalArray = variables.indexOf(variable);
      const orden = indexInOriginalArray; // El ORDEN que se guardó en saveTemplateParams

      console.log(`🔍 Buscando parámetro con ORDEN: ${orden}`);

      // Buscar el parámetro por ORDEN
      const parametro = parametrosPorOrden[orden];

      if (!parametro) {
        console.error(`❌ No se encontró el parámetro con ORDEN ${orden} para la variable ${variable}`);
        console.error(`Variables disponibles:`, Object.keys(parametrosPorOrden));
        continue;
      }

      // Validar que sea una variable de tipo lista
      if (parametro.ID_PLANTILLA_TIPO_DATO !== 5) {
        console.error(`❌ El parámetro encontrado no es de tipo lista (ID_PLANTILLA_TIPO_DATO: ${parametro.ID_PLANTILLA_TIPO_DATO})`);
        continue;
      }

      const ID_PLANTILLA_PARAMETRO = parametro.ID_PLANTILLA_PARAMETRO;
      console.log(`✅ ID_PLANTILLA_PARAMETRO encontrado: ${ID_PLANTILLA_PARAMETRO}`);
      console.log(`   Detalles del parámetro:`, {
        ID: parametro.ID_PLANTILLA_PARAMETRO,
        NOMBRE: parametro.NOMBRE,
        ORDEN: parametro.ORDEN,
        TIPO: parametro.ID_PLANTILLA_TIPO_DATO
      });

      // Guardar cada opción de la lista
      for (let j = 0; j < options.length; j++) {
        console.log(`  📌 Guardando opción ${j + 1}/${options.length}: ${options[j]}`);

        const optionData = {
          ID_PLANTILLA_PARAMETRO: ID_PLANTILLA_PARAMETRO,
          NOMBRE: options[j],
          PLACEHOLDER: options[j],
          ORDEN: j + 1,
          CREADO_POR: idNombreUsuarioTalkMe || "Sistema.TalkMe",
        };

        console.log('  📤 Datos a enviar:', optionData);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(optionData),
        });

        console.log('  📡 Response status:', response.status);

        if (!response.ok) {
          const errorMessage = await response.text();
          console.error('  ❌ Error en response:', errorMessage);
          throw new Error(
            `Error al guardar la opción ${options[j]} de la variable ${variable}: ${errorMessage}`
          );
        }

        const result = await response.json();
        console.log('  ✅ Opción guardada exitosamente:', result);
        results.push(result);
      }
    }

    console.log('🎉 Total de opciones guardadas:', results.length);
    if (results.length > 0) {
      showSnackbar("✅ Opciones de listas guardadas exitosamente", "success");
    }

    console.log('🟢 === FIN saveTemplateParamsOptions ===\n');
    return results;
  } catch (error) {
    console.error('💥 Error en saveTemplateParamsOptions:', error);
    showSnackbar("❌ Error al guardar las opciones de listas", "error");
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

const deleteTemplateButtons = async (ID_PLANTILLA, urlTemplatesGS) => {
  const url = `${urlTemplatesGS}botones/plantilla/${ID_PLANTILLA}`;
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

    if (!response.ok && response.status !== 404) {
      const errorMessage = await response.text();
      throw new Error(`Error al eliminar botones: ${errorMessage}`);
    }

    const result = await response.json();

    showSnackbar("🗑️ Botones eliminados correctamente", "success");
    return result;
  } catch (error) {
    console.error("Error eliminando botones:", error);
    showSnackbar("❌ Error al eliminar botones", "error");
    throw error;
  }
};

const saveCardsTemplate = async ({ ID_PLANTILLA, cards = [] }, idNombreUsuarioTalkMe, urlTemplatesGS) => {

  const url = urlTemplatesGS + 'tarjetas/';

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
      BOTON_0_TEXTO: (buttons[0]?.title || '').trim(),
      BOTON_0_COMANDO: (buttons[0]?.title || '').trim(),
      BOTON_1_TEXTO: (buttons[1]?.title || '').trim(),
      BOTON_1_COMANDO: (buttons[1]?.title || '').trim(),
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

const saveTemplateButtons = async (ID_PLANTILLA, buttons = [], idNombreUsuarioTalkMe, urlTemplatesGS) => {
  const url = urlTemplatesGS + 'botones';
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const results = [];
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];

      const data = {
        ID_PLANTILLA: ID_PLANTILLA,
        TIPO: button.type || 'QUICK_REPLY',
        TITULO: button.title || '',
        URL: button.url || null,
        TELEFONO: button.phoneNumber || null,
        ORDEN: i,
        CREADO_POR: idNombreUsuarioTalkMe,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error(`Error al guardar botón ${i}:`, errorResponse);
        showSnackbar(`❌ Error guardando botón: ${errorResponse.message || 'Solicitud inválida'}`, 'error');
        continue;
      }

      const result = await response.json();
      results.push(result);
    }

    showSnackbar('✅ Botones guardados exitosamente', 'success');
    return results;
  } catch (error) {
    console.error('Error guardando botones:', error);
    showSnackbar('❌ Error al guardar los botones', 'error');
    throw error;
  }
};

export const saveTemplateToTalkMe = async (templateId, templateData, idNombreUsuarioTalkMe, variables = [], variableDescriptions = {}, cards = [], idBotRedes, urlTemplatesGS, buttons) => {
  const { templateName, selectedCategory, message, uploadedUrl, templateType, pantallas } = templateData;

  const url = urlTemplatesGS + 'plantillas';
  const headers = {
    "Content-Type": "application/json",
  };

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
    return null;
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
    TIPO_PLANTILLA: 2,
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
      try {
        await saveCardsTemplate(
          {
            ID_PLANTILLA: result.ID_PLANTILLA,
            cards: cards
          },
          idNombreUsuarioTalkMe,
          urlTemplatesGS
        );
      } catch (error) {
        console.error("Error guardando tarjetas:", error);
        showSnackbar("❌ Error al guardar las tarjetas", "error");
      }
    }

    if (result && result.ID_PLANTILLA && buttons && buttons.length > 0) {
      await saveTemplateButtons(
        result.ID_PLANTILLA,
        buttons,
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

export const saveTemplateFlowToTalkMe = async (templateId, templateData, idNombreUsuarioTalkMe, variableTypes = [], variables = [], variableDescriptions = {}, variableExamples = {}, variableLists = {}, cards = [], idBotRedes, urlTemplatesGS) => {
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
    TIPO_PLANTILLA: 2,
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
      // Guardar variables normales
      await saveTemplateParams(
        result.ID_PLANTILLA,
        idNombreUsuarioTalkMe,
        variables,
        variableDescriptions,
        variableTypes,
        variableExamples,
        urlTemplatesGS
      );

      // Guardar listas de opciones
      await saveTemplateParamsOptions(
        result.ID_PLANTILLA,
        idNombreUsuarioTalkMe,
        variables,
        variableDescriptions,
        variableTypes,
        variableLists,
        urlTemplatesGS
      );
    }

    if (result && result.ID_PLANTILLA && cards && cards.length > 0) {
      try {
        await saveCardsTemplate(
          {
            ID_PLANTILLA: result.ID_PLANTILLA,
            cards: cards
          },
          idNombreUsuarioTalkMe,
          urlTemplatesGS
        );
      } catch (error) {
        console.error("Error guardando tarjetas:", error);
        showSnackbar("❌ Error al guardar las tarjetas", "error");
      }
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

export const editTemplateToTalkMe = async (idTemplate, templateData, idNombreUsuarioTalkMe, variables = [], variableDescriptions = {}, cards = [], urlTemplatesGS, idBotRedes) => {
  const { templateName, selectedCategory, message, uploadedUrl, templateType } = templateData;

  const url = `${urlTemplatesGS}plantillas/${idTemplate}`;
  const headers = {
    "Content-Type": "application/json",
  };

  let ID_PLANTILLA_CATEGORIA;
  if (selectedCategory === "MARKETING") {
    ID_PLANTILLA_CATEGORIA = 10;
  } else if (selectedCategory === "UTILITY") {
    ID_PLANTILLA_CATEGORIA = 13;
  } else {
    console.error("Categoría no válida:", selectedCategory);
    return null;
  }

  let TIPO_PLANTILLA;
  let PANTALLAS;
  if (templateType === "CAROUSEL") {
    TIPO_PLANTILLA = 1;
    PANTALLAS = 4;
  } else {
    TIPO_PLANTILLA = 0;
    PANTALLAS = 0;
  }

  const mediaMap = {
    IMAGE: "image",
    VIDEO: "video",
    DOCUMENT: "document",
    CAROUSEL: "image",
    CATALOG: "image"
  };

  const MEDIA = mediaMap[templateType] || null;

  const data = {
    ID_INTERNO: idTemplate,
    ID_PLANTILLA_CATEGORIA: ID_PLANTILLA_CATEGORIA,
    ID_BOT_REDES: idBotRedes,
    NOMBRE: templateName,
    MENSAJE: message,
    TIPO_PLANTILLA: TIPO_PLANTILLA,
    MEDIA: MEDIA,
    URL: uploadedUrl,
    PANTALLAS: PANTALLAS,
    ESTADO: 0,
    AUTORIZADO: 0,
    ELIMINADO: 0,
    SEGUIMIENTO_EDC: 0,
    MODIFICADO_POR: idNombreUsuarioTalkMe,
    FECHA_MODIFICACION: new Date().toISOString()
  };

  try {
    console.log('🔵 === INICIO: editTemplateToTalkMe ===');
    console.log('📍 URL:', url);
    console.log('📍 Data a enviar:', JSON.stringify(data, null, 2));

    const response = await fetch(url, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(data),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.log('⚠️ Response no OK - Intentando leer error...');

      // Obtener el texto primero para ver qué devuelve
      const errorText = await response.text();
      console.log('📄 Error text raw:', errorText);

      try {
        const errorResponse = JSON.parse(errorText);
        console.error("❌ Error response JSON:", errorResponse);
      } catch (parseError) {
        console.error("❌ Error parseando respuesta de error:", parseError);
        console.error("❌ Texto recibido:", errorText);
      }
      return null;
    }

    const result = await response.json();
    showSnackbar("✅ Plantilla actualizada exitosamente", "success");

    const talkmeId = result.ID_PLANTILLA;

    if (talkmeId) {
      try {

        const parametros = await obtenerParametros(urlTemplatesGS, talkmeId);

        if (parametros && parametros.length > 0 && TIPO_PLANTILLA === 1) {
          const parametrosIds = parametros.map(param => param.ID_PLANTILLA_PARAMETRO);
          console.log('📥 IDs a eliminar:', parametrosIds);
          await eliminarBroadcastParametros(urlTemplatesGS, parametrosIds);
        }

        await deleteTemplateParams(talkmeId, urlTemplatesGS);

        if (variables && variables.length > 0) {
          await saveTemplateParams(talkmeId, variables, variableDescriptions, urlTemplatesGS);

        }

      } catch (error) {
        console.error("❌ Error gestionando parámetros:", error);
        console.error("❌ Stack trace:", error.stack);
        throw error;
      }
    } else {
      console.log('⏭️ No hay parámetros que actualizar');
      console.log('   - talkmeId:', talkmeId);
      console.log('   - variables:', variables);
      console.log('   - variables.length:', variables?.length);
    }

    if (talkmeId && TIPO_PLANTILLA === 1) {
      try {
        console.log('🟣 === INICIO: Actualizar tarjetas de la plantilla');
        console.log('🎴 Cards recibidas:', cards);

        const deleteResponse = await fetch(`${urlTemplatesGS}tarjetas/plantilla/${talkmeId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          }
        });

        if (!deleteResponse.ok && deleteResponse.status !== 404) {
          throw new Error("No se pudieron eliminar las tarjetas existentes");
        }

        for (const card of cards) {

          await saveCardsTemplate({
            ID_PLANTILLA: talkmeId,
            cards: [card]
          }, idNombreUsuarioTalkMe, urlTemplatesGS);
        }

        console.log('✅ Tarjetas actualizadas correctamente');

      } catch (error) {
        console.error("❌ Error gestionando tarjetas:", error);
        console.error("❌ Stack trace:", error.stack);
        throw error;
      }
    } else {
      console.log('⏭️ No hay tarjetas que actualizar');
      console.log('   - talkmeId:', talkmeId);
      console.log('   - TIPO_PLANTILLA:', TIPO_PLANTILLA);
    }

    console.log('🔵 === FIN: editTemplateToTalkMe - SUCCESS ===');
    return result;

  } catch (error) {
    console.error("❌ Error en editTemplateToTalkMe:", error);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Stack trace:", error.stack);
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


  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener la información de la plantilla: ${response.status}`);
    }

    const data = await response.json();

    return data
  } catch (error) {
    console.error("Error obteniendo info de la plantilla:", error);
    return null;
  }

}

export const obtenerParametros = async (urlTemplatesGS, id_plantilla) => {
  const url = `${urlTemplatesGS}parametros/plantilla/${id_plantilla}`;



  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
    });



    if (!response.ok) {
      throw new Error(`Error al obtener la información de la plantilla: ${response.status}`);
    }

    const data = await response.json();

    return data
  } catch (error) {
    console.error("Error obteniendo parametros de la plantilla", error);
    return null;
  }
}

export const obtenerOpcionesParametro = async (urlTemplatesGS, idParametro) => {
  const url = `${urlTemplatesGS}parametros_opciones/parametro/${idParametro}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener opciones del parámetro: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error obteniendo opciones del parámetro", error);
    return [];
  }
};

export const eliminarParametrosYOpciones = async (urlTemplatesGS, idPlantilla) => {
  const url = `${urlTemplatesGS}parametros/plantilla/${idPlantilla}`;

  try {
    console.log(`🗑️ Eliminando parámetros y opciones de la plantilla ${idPlantilla}...`);
    console.log(`🔗 URL completa: ${url}`);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`📡 Response status: ${response.status}`);
    console.log(`📡 Response ok: ${response.ok}`);
    console.log(`📡 Response statusText: ${response.statusText}`);

    // Leer la respuesta como texto primero para debuggear
    const responseText = await response.text();
    console.log(`📄 Response raw text:`, responseText);
    console.log(`📄 Response length: ${responseText.length}`);

    if (!response.ok) {
      console.error(`❌ Error del servidor al eliminar`);
      console.error(`❌ Status: ${response.status}`);
      console.error(`❌ StatusText: ${response.statusText}`);
      console.error(`❌ Response body:`, responseText);

      // Intentar parsear el error si es JSON
      let errorDetails = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = errorJson;
        console.error(`❌ Error JSON parseado:`, errorJson);
      } catch (e) {
        console.error(`❌ La respuesta de error no es JSON válido`);
      }

      throw new Error(`Error al eliminar: ${response.status} - ${JSON.stringify(errorDetails)}`);
    }

    // Parsear la respuesta exitosa
    let data = null;
    if (responseText && responseText.trim() !== '') {
      try {
        data = JSON.parse(responseText);
        console.log(`✅ Parámetros y opciones eliminados:`, data);
      } catch (parseError) {
        console.log(`⚠️ Respuesta exitosa pero no es JSON:`, responseText);
      }
    } else {
      console.log(`✅ Eliminación exitosa (respuesta vacía)`);
    }

    return data;

  } catch (error) {
    console.error("❌ Error eliminando parámetros y opciones:", error);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Stack trace:", error.stack);
    throw error;
  }
};

export const eliminarOpcionesParametro = async (urlTemplatesGS, idPlantillaParametro) => {
  const url = `${urlTemplatesGS}parametro/${idPlantillaParametro}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar opciones: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error eliminando opciones del parámetro ${idPlantillaParametro}:`, error);
    throw error;
  }
};

export const obtenerParametrosPorPlantilla = async (urlTemplatesGS, idPlantilla) => {
  const url = `${urlTemplatesGS}parametros?ID_PLANTILLA=${idPlantilla}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener parámetros: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error obteniendo parámetros de la plantilla:", error);
    throw error;
  }
};

export const eliminarTodasOpciones = async (urlTemplatesGS, idPlantilla) => {
  try {
    console.log('🟡 === Eliminando opciones de la plantilla', idPlantilla);

    // 1. Obtener todos los parámetros de la plantilla
    const parametros = await obtenerParametrosPorPlantilla(urlTemplatesGS, idPlantilla);
    console.log('📋 Parámetros encontrados:', parametros);

    if (!parametros || parametros.length === 0) {
      console.log('⚠️ No hay parámetros para eliminar opciones');
      return [];
    }

    // 2. Eliminar opciones de CADA parámetro
    const resultados = [];
    for (const parametro of parametros) {
      try {
        console.log(`🗑️ Eliminando opciones del parámetro ${parametro.ID_PLANTILLA_PARAMETRO}`);
        const resultado = await eliminarOpcionesParametro(
          urlTemplatesGS,
          parametro.ID_PLANTILLA_PARAMETRO  // ✅ AQUÍ VA EL ID DEL PARÁMETRO, NO DE LA PLANTILLA
        );
        resultados.push(resultado);
        console.log(`✅ Opciones eliminadas del parámetro ${parametro.ID_PLANTILLA_PARAMETRO}`);
      } catch (error) {
        console.warn(`⚠️ Error eliminando opciones del parámetro ${parametro.ID_PLANTILLA_PARAMETRO}:`, error);
        // No detener el flujo si falla uno
      }
    }

    console.log('🟢 === Opciones eliminadas correctamente');
    return resultados;
  } catch (error) {
    console.error('❌ Error en eliminarTodasOpciones:', error);
    throw error;
  }
};



export const eliminarParametrosPlantilla = async (urlTemplatesGS, id_plantilla) => {
  const url = `${urlTemplatesGS}parametros/plantilla/${id_plantilla}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
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
    throw error; // Lanzar el error en lugar de retornar null
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

export const validarNombrePlantillas = async (urlTemplatesGS, nombre, idBotRedes) => {
  const url = `${urlTemplatesGS}plantillas/validar?nombre=${encodeURIComponent(nombre)}&id_bot_redes=${encodeURIComponent(idBotRedes)}`;


  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al validar la plantilla: ${response.status}`);
    }

    const data = await response.json();
    return data.existe; // Retorna true si existe, false si no

  } catch (error) {
    console.error("Error validando la plantilla:", error);
    return null;
  }
};

export const getFlowScreenName = async (urlTemplatesGS, appId, authCode, flowId) => {
  const url = `${urlTemplatesGS}flow-webhook/${appId}/flows/${flowId}/pantallas`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authCode
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener las pantallas del flow: ${response.status}`);
    }

    const data = await response.json();

    // Verifica que la respuesta sea exitosa y contenga screens
    if (data.success && data.data?.screens && data.data.screens.length > 0) {
      return data.data.screens[0].id;
    }

    throw new Error('No se encontraron pantallas en el flow');

  } catch (error) {
    console.error('Error al obtener el nombre de la pantalla:', error);
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

export { saveTemplateParams, saveTemplateButtons, deleteTemplateButtons };