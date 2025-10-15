
import { showSnackbar } from "../utils/Snackbar";
import { saveTemplateLog } from "./templatesGSLog";
import { guardarLogArchivos } from "./templatesGSArchivosLogs";
import Swal from 'sweetalert2';

// PLANTILLAS NORMALES
export const createTemplateGupshup = async (appId, authCode, templateData, idNombreUsuarioTalkMe, urlTemplatesGS, validateFn) => {
  if (validateFn && !validateFn()) {
    return null;
  }

  const {
    templateName,
    selectedCategory,
    languageCode,
    templateType,
    vertical,
    message,
    header,
    footer,
    mediaId,
    buttons,
    example,
    exampleHeader
  } = templateData;

  const url = `https://partner.gupshup.io/partner/app/${appId}/templates`;
  const headers = {
    Authorization: authCode,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const data = new URLSearchParams();
  data.append("elementName", templateName);
  data.append("category", selectedCategory.toUpperCase());
  data.append("languageCode", languageCode);
  data.append("templateType", templateType.toUpperCase());
  data.append("vertical", vertical);
  data.append("content", message);

  if (header) data.append("header", header);
  if (footer) data.append("footer", footer);
  if (mediaId) data.append("exampleMedia", mediaId);

  // Formatear botones según su tipo
  const formattedButtons = buttons.map((button) => {
    const buttonData = { type: button.type };
    
    // Para botones FLOW, mantener todos los campos específicos
    if (button.type === "FLOW") {
      buttonData.text = button.text;
      buttonData.flow_id = button.flow_id;
      buttonData.flow_action = button.flow_action;
      buttonData.navigate_screen = button.navigate_screen;
      if (button.icon) buttonData.icon = button.icon;
    } 
    // Para otros tipos de botones
    else {
      buttonData.text = button.title || button.text;
      if (button.type === "URL") buttonData.url = button.url;
      else if (button.type === "PHONE_NUMBER") buttonData.phone_number = button.phoneNumber;
    }
    
    return buttonData;
  });

  data.append("buttons", JSON.stringify(formattedButtons));
  data.append("example", example);
  data.append("exampleHeader", exampleHeader);
  data.append("enableSample", true);
  data.append("allowTemplateCategoryChange", false);

  // Preparar datos del request para el log
  const requestData = {
    elementName: templateName,
    category: selectedCategory.toUpperCase(),
    languageCode: languageCode,
    templateType: templateType.toUpperCase(),
    vertical: vertical,
    content: message,
    header: header || null,
    footer: footer || null,
    exampleMedia: mediaId || null,
    buttons: formattedButtons,
    example: example,
    exampleHeader: exampleHeader,
    enableSample: true,
    allowTemplateCategoryChange: false
  };

  // Crear el JSON completo del request
  const completeRequestLog = {
    metodo: "POST",
    headers: headers,
    payload: requestData,
    url: url,
    metadata: {
      procesoCompleto: true
    }
  };

  const startTime = new Date().toISOString();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: data,
    });

    const endTime = new Date().toISOString();

    if (!response.ok) {
      const errorText = await response.text();
      let errorResponse;
      try {
        errorResponse = JSON.parse(errorText);
        console.error("Error response (JSON):", errorResponse);
      } catch (e) {
        errorResponse = { message: "Error no JSON", raw: errorText };
        console.error("Error response (texto):", errorText);
      }

      // Guardar log de error
      try {
        await guardarLogArchivos({
          NOMBRE_EVENTO: "PLANTILLAS_GUPSHUP_CREACION_ERROR",
          TIPO_LOG: 2, // Error
          URL_PETICION: url,
          PETICION: completeRequestLog,
          RESPUESTA: errorResponse,
          INICIO_PETICION: startTime,
          FIN_PETICION: endTime,
          CREADO_POR: idNombreUsuarioTalkMe,
          CLAVE_REGISTRO: null
        }, urlTemplatesGS);
      } catch (logError) {
        console.error("Error al guardar log de error:", logError);
      }

      Swal.fire({
        title: 'Error',
        text: `❌ Error al crear la plantilla: ${errorResponse.message || "Solicitud inválida"}`,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00c3ff'
      });

      return { status: "error", message: errorResponse.message };
    }

    const result = await response.json();

    // Guardar log de éxito
    try {
      await guardarLogArchivos({
        NOMBRE_EVENTO: "PLANTILLAS_GUPSHUP_CREACION_EXITOSO",
        TIPO_LOG: 1, // Success
        URL_PETICION: url,
        PETICION: completeRequestLog,
        RESPUESTA: result,
        INICIO_PETICION: startTime,
        FIN_PETICION: endTime,
        CREADO_POR: idNombreUsuarioTalkMe,
        CLAVE_REGISTRO: result.template?.id || null
      }, urlTemplatesGS);
    } catch (logError) {
      console.error("Error al guardar log de éxito:", logError);
    }

    Swal.fire({
      title: '¡Éxito!',
      text: 'La plantilla fue creada correctamente.',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#00c3ff'
    });

    return {
      status: "success",
      ...result
    };
  } catch (error) {
    console.error("Error en la solicitud:", error);
    console.error("Error detallado:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    const endTime = new Date().toISOString();

    // Guardar log de error de excepción
    try {
      await guardarLogArchivos({
        NOMBRE_EVENTO: "PLANTILLAS_GUPSHUP_CREACION_EXCEPTION",
        TIPO_LOG: 3, // Exception
        URL_PETICION: url,
        PETICION: completeRequestLog,
        RESPUESTA: { 
          error: error.message,
          name: error.name,
          stack: error.stack
        },
        INICIO_PETICION: startTime,
        FIN_PETICION: endTime,
        CREADO_POR: idNombreUsuarioTalkMe,
        CLAVE_REGISTRO: null
      }, urlTemplatesGS);
    } catch (logError) {
      console.error("Error al guardar log de excepción:", logError);
    }

    Swal.fire({
      title: 'Error',
      text: '❌ Error al crear la plantilla',
      icon: 'error',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#00c3ff'
    });

    return null;
  }
};

export const editTemplateGupshup = async (appId, authCode, templateData, idTemplate, validateFn) => {
  // Validar campos antes de enviar la solicitud
  if (validateFn && !validateFn()) {
    return null; // Detener la ejecución si hay errores
  }

  const {
    templateName,
    selectedCategory,
    languageCode,
    templateType,
    vertical,
    message,
    example
  } = templateData;


  const url = `https://partner.gupshup.io/partner/app/${appId}/templates/${idTemplate}`;
  const headers = {
    Authorization: authCode,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const data = new URLSearchParams();
  data.append("elementName", templateName);
  data.append("category", selectedCategory.toUpperCase());
  data.append("languageCode", languageCode);
  data.append("templateType", templateType.toUpperCase());
  data.append("vertical", vertical);
  data.append("content", message);
  data.append("example", example);
  data.append("enableSample", "true");
  data.append("allowTemplateCategoryChange", "false");


  


  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: headers,
      body: data,
    });

    
    

    if (!response.ok) {
      const errorText = await response.text();
      let errorResponse;
      try {
        errorResponse = JSON.parse(errorText);
        console.error("Error response (JSON):", errorResponse);
      } catch (e) {
        errorResponse = { message: "Error no JSON", raw: errorText };
        console.error("Error response (texto):", errorText);
      }
      showSnackbar(`❌ Error al crear la plantilla: ${errorResponse.message || "Solicitud inválida"}`, "error");
      throw new Error(errorResponse.message || "Error al editar la plantilla");
    }

    const result = await response.json();
    showSnackbar("✅ Plantilla editada exitosamente", "success");
    
    return result; // Retornar el resultado
  } catch (error) {
    console.error("Error en la solicitud:", error);
    console.error("Error detallado:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    showSnackbar("❌ Error al crear la plantilla", "error");
    return null; // Retornar null en caso de error
  }
};

// PLANTILLAS CATALOGO
export const createTemplateCatalogGupshup = async (appId, authCode, templateData, idNombreUsuarioTalkMe, urlTemplatesGS, validateFn) => {
  if (validateFn && !validateFn()) {
    return null;
  }

  const {
    templateName,
    selectedCategory,
    languageCode,
    templateType,
    vertical,
    message,
    example
  } = templateData;

  const url = `https://partner.gupshup.io/partner/app/${appId}/templates`;
  const headers = {
    Authorization: authCode,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const data = new URLSearchParams();
  data.append("elementName", templateName);
  data.append("category", selectedCategory.toUpperCase());
  data.append("languageCode", languageCode);
  data.append("templateType", templateType.toUpperCase());
  data.append("vertical", vertical);
  data.append("content", message);
  data.append("example", example);
  data.append("enableSample", true);
  data.append("allowTemplateCategoryChange", false);

  // Preparar datos del request para el log
  const requestData = {
    elementName: templateName,
    category: selectedCategory.toUpperCase(),
    languageCode: languageCode,
    templateType: templateType.toUpperCase(),
    vertical: vertical,
    content: message,
    example: example,
    enableSample: true,
    allowTemplateCategoryChange: false
  };

  // Crear el JSON completo del request
  const completeRequestLog = {
    metodo: "POST",
    headers: headers,
    payload: requestData,
    url: url,
    metadata: {
      procesoCompleto: true
    }
  };

  const startTime = new Date().toISOString();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: data,
    });

    const endTime = new Date().toISOString();

    if (!response.ok) {
      const errorText = await response.text();
      let errorResponse;
      try {
        errorResponse = JSON.parse(errorText);
        console.error("Error response (JSON):", errorResponse);
      } catch (e) {
        errorResponse = { message: "Error no JSON", raw: errorText };
        console.error("Error response (texto):", errorText);
      }

      // Guardar log de error
      try {
        await guardarLogArchivos({
          NOMBRE_EVENTO: "PLANTILLAS_CATALOGO_GUPSHUP_CREACION_ERROR",
          TIPO_LOG: 2, // Error
          URL_PETICION: url,
          PETICION: completeRequestLog,
          RESPUESTA: errorResponse,
          INICIO_PETICION: startTime,
          FIN_PETICION: endTime,
          CREADO_POR: idNombreUsuarioTalkMe,
          CLAVE_REGISTRO: null
        }, urlTemplatesGS);
      } catch (logError) {
        console.error("Error al guardar log de error:", logError);
      }

      showSnackbar(`❌ Error al crear la plantilla: ${errorResponse.message || "Solicitud inválida"}`, "error");
      throw new Error(errorResponse.message || "Error al crear la plantilla");
    }

    const result = await response.json();

    // Guardar log exitoso
    try {
      await guardarLogArchivos({
        NOMBRE_EVENTO: "PLANTILLAS_CATALOGO_GUPSHUP_CREACION_EXITOSO",
        TIPO_LOG: 1, // Success
        URL_PETICION: url,
        PETICION: completeRequestLog,
        RESPUESTA: result,
        INICIO_PETICION: startTime,
        FIN_PETICION: endTime,
        CREADO_POR: idNombreUsuarioTalkMe,
        CLAVE_REGISTRO: result.template?.id || null
      }, urlTemplatesGS);
    } catch (logError) {
      console.error("Error al guardar log de éxito:", logError);
    }

    showSnackbar("✅ Plantilla creada exitosamente", "success");
    
    return {
      status: "success",
      ...result
    };
  } catch (error) {
    console.error("Error en la solicitud:", error);
    console.error("Error detallado:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    const endTime = new Date().toISOString();

    // Guardar log de error de excepción
    try {
      await guardarLogArchivos({
        NOMBRE_EVENTO: "PLANTILLAS_CATALOGO_GUPSHUP_CREACION_EXCEPTION",
        TIPO_LOG: 3, // Exception
        URL_PETICION: url,
        PETICION: completeRequestLog,
        RESPUESTA: { 
          error: error.message,
          name: error.name,
          stack: error.stack
        },
        INICIO_PETICION: startTime,
        FIN_PETICION: endTime,
        CREADO_POR: idNombreUsuarioTalkMe,
        CLAVE_REGISTRO: null
      }, urlTemplatesGS);
    } catch (logError) {
      console.error("Error al guardar log de excepción:", logError);
    }

    showSnackbar("❌ Error al crear la plantilla", "error");
    return null;
  }
};

export const editTemplateCatalogGupshup = async (appId, authCode, templateData, idTemplate, idNombreUsuarioTalkMe, urlTemplatesGS, validateFn) => {
  // Validar campos antes de enviar la solicitud
  if (validateFn && !validateFn()) {
    return null; // Detener la ejecución si hay errores
  }

  const {
    templateName,
    selectedCategory,
    languageCode,
    templateType,
    vertical,
    message,
    example
  } = templateData;

  const url = `https://partner.gupshup.io/partner/app/${appId}/templates/${idTemplate}`;
  const headers = {
    Authorization: authCode,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const data = new URLSearchParams();
  data.append("elementName", templateName);
  data.append("category", selectedCategory.toUpperCase());
  data.append("languageCode", languageCode);
  data.append("templateType", templateType.toUpperCase());
  data.append("vertical", vertical);
  data.append("content", message);
  data.append("example", example);
  data.append("enableSample", "true");
  data.append("allowTemplateCategoryChange", "false");

  // Preparar datos del request para el log (formato original)
  const requestData = {
    elementName: templateName,
    category: selectedCategory.toUpperCase(),
    languageCode: languageCode,
    templateType: templateType.toUpperCase(),
    vertical: vertical,
    content: message,
    example: example,
    enableSample: true,
    allowTemplateCategoryChange: false
  };

  // Crear el JSON completo del request incluyendo método, headers y payload
  const completeRequestLog = {
    metodo: "PUT",
    headers: headers,
    payload: requestData,
    url: url,
    metadata: {
      templateId: idTemplate,
      procesoCompleto: true
    }
  };

  const startTime = new Date().toISOString();

  try {

    const response = await fetch(url, {
      method: "PUT",
      headers: headers,
      body: data,
    });

    const endTime = new Date().toISOString();

    if (!response.ok) {
      const errorText = await response.text();
      let errorResponse;
      try {
        errorResponse = JSON.parse(errorText);
        console.error("Error response (JSON):", errorResponse);
      } catch (e) {
        errorResponse = { message: "Error no JSON", raw: errorText };
        console.error("Error response (texto):", errorText);
      }

      // Guardar log de error
      try {
        await guardarLogArchivos({
          NOMBRE_EVENTO: "PLANTILLAS_CATALOGO_GUPSHUP_EDICION_ERROR",
          TIPO_LOG: 2, // Error
          URL_PETICION: url,
          PETICION: completeRequestLog, // Usar el JSON completo
          RESPUESTA: errorResponse,
          INICIO_PETICION: startTime,
          FIN_PETICION: endTime,
          CREADO_POR: idNombreUsuarioTalkMe,
          CLAVE_REGISTRO: idTemplate
        }, urlTemplatesGS);
      } catch (logError) {
        console.error("Error al guardar log de error:", logError);
      }

      
      throw new Error(errorResponse.message || "Error al editar la plantilla");
    }

    const result = await response.json();
    

    // Guardar log de éxito
    try {
      await guardarLogArchivos({
        NOMBRE_EVENTO: "PLANTILLAS_CATALOGO_GUPSHUP_EDICION_EXITOSO",
        TIPO_LOG: 1, // Success
        URL_PETICION: url,
        PETICION: completeRequestLog, // Usar el JSON completo
        RESPUESTA: result,
        INICIO_PETICION: startTime,
        FIN_PETICION: endTime,
        CREADO_POR: idNombreUsuarioTalkMe,
        CLAVE_REGISTRO: idTemplate
      }, urlTemplatesGS);
    } catch (logError) {
      console.error("Error al guardar log de éxito:", logError);
    }

    
    return {
      status: "success",
      template: {
        id: idTemplate
      },
      ...result
    };

  } catch (error) {
    console.error("❌ Error general en editTemplateCatalogGupshup:", error);
    const endTime = new Date().toISOString();
    
    // Guardar log de error de excepción
    try {
      await guardarLogArchivos({
        NOMBRE_EVENTO: "PLANTILLAS_CATALOGO_GUPSHUP_EDICION_EXCEPTION",
        TIPO_LOG: 3, // Exception
        URL_PETICION: url,
        PETICION: completeRequestLog, // Usar el JSON completo
        RESPUESTA: { error: error.message },
        INICIO_PETICION: startTime,
        FIN_PETICION: endTime,
        CREADO_POR: idNombreUsuarioTalkMe,
        CLAVE_REGISTRO: idTemplate
      }, urlTemplatesGS);
    } catch (logError) {
      console.error("Error al guardar log de excepción:", logError);
    }

    throw error; // Re-lanzar el error original
  }
};

// PLANTILLAS CARRUSEL
export const createTemplateCarouselGupshup = async (appId, authCode, templateData, idNombreUsuarioTalkMe, urlTemplatesGS, validateFn) => {
  if (validateFn && !validateFn()) {
    return null;
  }

  const {
    templateName,
    selectedCategory,
    languageCode,
    templateType,
    vertical,
    message,
    example,
    carousel
  } = templateData;

  const url = `https://partner.gupshup.io/partner/app/${appId}/templates`;
  const headers = {
    Authorization: authCode,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const data = new URLSearchParams();
  data.append("elementName", templateName);
  data.append("category", selectedCategory.toUpperCase());
  data.append("languageCode", languageCode);
  data.append("templateType", templateType.toUpperCase());
  data.append("vertical", vertical);
  data.append("content", message);
  data.append("example", example);
  data.append("enableSample", true);
  data.append("allowTemplateCategoryChange", false);
  data.append("cards", carousel);

  // Preparar datos del request para el log
  const requestData = {
    elementName: templateName,
    category: selectedCategory.toUpperCase(),
    languageCode: languageCode,
    templateType: templateType.toUpperCase(),
    vertical: vertical,
    content: message,
    example: example,
    enableSample: true,
    allowTemplateCategoryChange: false,
    cards: carousel
  };

  // Crear el JSON completo del request
  const completeRequestLog = {
    metodo: "POST",
    headers: headers,
    payload: requestData,
    url: url,
    metadata: {
      procesoCompleto: true
    }
  };

  const startTime = new Date().toISOString();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: data,
    });

    const endTime = new Date().toISOString();

    if (!response.ok) {
      const errorText = await response.text();
      let errorResponse;
      try {
        errorResponse = JSON.parse(errorText);
        console.error("Error response (JSON):", errorResponse);
      } catch (e) {
        errorResponse = { message: "Error no JSON", raw: errorText };
        console.error("Error response (texto):", errorText);
      }

      // Guardar log de error
      try {
        await guardarLogArchivos({
          NOMBRE_EVENTO: "PLANTILLAS_CAROUSEL_GUPSHUP_CREACION_ERROR",
          TIPO_LOG: 2, // Error
          URL_PETICION: url,
          PETICION: completeRequestLog,
          RESPUESTA: errorResponse,
          INICIO_PETICION: startTime,
          FIN_PETICION: endTime,
          CREADO_POR: idNombreUsuarioTalkMe,
          CLAVE_REGISTRO: null
        }, urlTemplatesGS);
      } catch (logError) {
        console.error("Error al guardar log de error:", logError);
      }

      showSnackbar(`❌ Error al crear la plantilla: ${errorResponse.message || "Solicitud inválida"}`, "error");
      throw new Error(errorResponse.message || "Error al crear la plantilla");
    }

    const result = await response.json();

    // Guardar log exitoso
    try {
      await guardarLogArchivos({
        NOMBRE_EVENTO: "PLANTILLAS_CAROUSEL_GUPSHUP_CREACION_EXITOSO",
        TIPO_LOG: 1, // Success
        URL_PETICION: url,
        PETICION: completeRequestLog,
        RESPUESTA: result,
        INICIO_PETICION: startTime,
        FIN_PETICION: endTime,
        CREADO_POR: idNombreUsuarioTalkMe,
        CLAVE_REGISTRO: result.template?.id || null
      }, urlTemplatesGS);
    } catch (logError) {
      console.error("Error al guardar log de éxito:", logError);
    }

    showSnackbar("✅ Plantilla creada exitosamente", "success");
    
    return {
      status: "success",
      ...result
    };
  } catch (error) {
    console.error("Error en la solicitud:", error);
    console.error("Error detallado:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    const endTime = new Date().toISOString();

    // Guardar log de error de excepción
    try {
      await guardarLogArchivos({
        NOMBRE_EVENTO: "PLANTILLAS_CAROUSEL_GUPSHUP_CREACION_EXCEPTION",
        TIPO_LOG: 3, // Exception
        URL_PETICION: url,
        PETICION: completeRequestLog,
        RESPUESTA: { 
          error: error.message,
          name: error.name,
          stack: error.stack
        },
        INICIO_PETICION: startTime,
        FIN_PETICION: endTime,
        CREADO_POR: idNombreUsuarioTalkMe,
        CLAVE_REGISTRO: null
      }, urlTemplatesGS);
    } catch (logError) {
      console.error("Error al guardar log de excepción:", logError);
    }

    showSnackbar("❌ Error al crear la plantilla", "error");
    return null;
  }
};

export const editTemplateCarouselGupshup = async (appId, authCode, templateData, idTemplate, idNombreUsuarioTalkMe, urlTemplatesGS, validateFn) => {
  // Validar campos antes de enviar la solicitud
  if (validateFn && !validateFn()) {
    return null; // Detener la ejecución si hay errores
  }

  const {
    templateName,
    selectedCategory,
    languageCode,
    templateType,
    vertical,
    message,
    example,
    carousel
  } = templateData;

  const url = `https://partner.gupshup.io/partner/app/${appId}/templates/${idTemplate}`;
  const headers = {
    Authorization: authCode,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const data = new URLSearchParams();
  data.append("elementName", templateName);
  data.append("category", selectedCategory.toUpperCase());
  data.append("languageCode", languageCode);
  data.append("templateType", templateType.toUpperCase());
  data.append("vertical", vertical);
  data.append("content", message);
  data.append("example", example);
  data.append("enableSample", "true");
  data.append("allowTemplateCategoryChange", "false");
  data.append("cards", carousel);

  // Preparar datos del request para el log (formato original)
  const requestData = {
    elementName: templateName,
    category: selectedCategory.toUpperCase(),
    languageCode: languageCode,
    templateType: templateType.toUpperCase(),
    vertical: vertical,
    content: message,
    example: example,
    enableSample: true,
    allowTemplateCategoryChange: false,
    cards: carousel
  };

  // Crear el JSON completo del request incluyendo método, headers y payload
  const completeRequestLog = {
    metodo: "PUT",
    headers: headers,
    payload: requestData,
    url: url,
    metadata: {
      templateId: idTemplate,
      procesoCompleto: true
    }
  };

  const startTime = new Date().toISOString();

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: headers,
      body: data,
    });

    const endTime = new Date().toISOString();

    if (!response.ok) {
      const errorText = await response.text();
      let errorResponse;
      try {
        errorResponse = JSON.parse(errorText);
        console.error("Error response (JSON):", errorResponse);
      } catch (e) {
        errorResponse = { message: "Error no JSON", raw: errorText };
        console.error("Error response (texto):", errorText);
      }

      // Guardar log de error
      try {
        await guardarLogArchivos({
          NOMBRE_EVENTO: "PLANTILLAS_CAROUSEL_GUPSHUP_EDICION_ERROR",
          TIPO_LOG: 2, // Error
          URL_PETICION: url,
          PETICION: completeRequestLog, // Usar el JSON completo
          RESPUESTA: errorResponse,
          INICIO_PETICION: startTime,
          FIN_PETICION: endTime,
          CREADO_POR: idNombreUsuarioTalkMe,
          CLAVE_REGISTRO: idTemplate
        }, urlTemplatesGS);
      } catch (logError) {
        console.error("Error al guardar log de error:", logError);
      }

      
      throw new Error(errorResponse.message || "Error al editar la plantilla");
    }

    const result = await response.json();
    

    // Guardar log de éxito
    try {
      await guardarLogArchivos({
        NOMBRE_EVENTO: "PLANTILLAS_CAROUSEL_GUPSHUP_EDICION_EXITOSO",
        TIPO_LOG: 1, // Success
        URL_PETICION: url,
        PETICION: completeRequestLog, // Usar el JSON completo
        RESPUESTA: result,
        INICIO_PETICION: startTime,
        FIN_PETICION: endTime,
        CREADO_POR: idNombreUsuarioTalkMe,
        CLAVE_REGISTRO: idTemplate
      }, urlTemplatesGS);
    } catch (logError) {
      console.error("Error al guardar log de éxito:", logError);
    }

    
    return {
      status: "success",
      template: {
        id: idTemplate
      },
      ...result
    };

  } catch (error) {
    console.error("❌ Error general en editTemplateCarouselGupshup:", error);
    console.error("Error detallado:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    const endTime = new Date().toISOString();
    
    // Guardar log de error de excepción
    try {
      await guardarLogArchivos({
        NOMBRE_EVENTO: "PLANTILLAS_CAROUSEL_GUPSHUP_EDICION_EXCEPTION",
        TIPO_LOG: 3, // Exception
        URL_PETICION: url,
        PETICION: completeRequestLog, // Usar el JSON completo
        RESPUESTA: { 
          error: error.message,
          name: error.name,
          stack: error.stack
        },
        INICIO_PETICION: startTime,
        FIN_PETICION: endTime,
        CREADO_POR: idNombreUsuarioTalkMe,
        CLAVE_REGISTRO: idTemplate
      }, urlTemplatesGS);
    } catch (logError) {
      console.error("Error al guardar log de excepción:", logError);
    }

    return null; // Retornar null en caso de error (manteniendo comportamiento original)
  }
};

export const viewFlows = async (appId, authCode) => {
  try {
    const response = await fetch(`https://partner.gupshup.io/partner/app/${appId}/flows`, {
      method: 'GET',
      headers: {
        Authorization: authCode,
      },
    });
    const data = await response.json();
    
    if (Array.isArray(data)) {
      const filtered = data.filter(flow => flow.status === "PUBLISHED");
      return filtered;
    }
    
    if (data.status === 'success' && data.templates) {
      const filtered = data.templates.filter(flow => flow.status === "PUBLISHED");
      return filtered;
    }
    return [];
  } catch (error) {
    console.error('Error fetching Gupshup templates:', error);
    return [];
  }
};

export const getFlowScreenName = async (appId, authCode, flowId) => {
  try {
    const assetsResponse = await fetch(
      `https://partner.gupshup.io/partner/app/${appId}/flows/${flowId}/assets`,
      {
        headers: {
          'Authorization': authCode
        }
      }
    );

    if (!assetsResponse.ok) {
      throw new Error('Error al obtener los assets del flow');
    }

    const assets = await assetsResponse.json();
    
    const flowJsonAsset = assets.find(asset => asset.asset_type === 'FLOW_JSON');
    
    if (!flowJsonAsset) {
      throw new Error('No se encontró el flow.json');
    }

    const flowJsonResponse = await fetch(flowJsonAsset.download_url);
    
    if (!flowJsonResponse.ok) {
      throw new Error('Error al descargar el flow.json');
    }

    const flowJson = await flowJsonResponse.json();
    
    if (flowJson.screens && flowJson.screens.length > 0) {
      return flowJson.screens[0].id;
      console.log("flowjson screen:", flowJson);
    }

    throw new Error('No se encontraron pantallas en el flow');
    
  } catch (error) {
    console.error('Error al obtener el nombre de la pantalla:', error);
    throw error;
  }
};