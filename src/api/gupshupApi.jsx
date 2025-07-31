
import { showSnackbar } from "../utils/Snackbar";
import { saveTemplateLog } from "./templatesGSLog";
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

  const formattedButtons = buttons.map((button) => {
    const buttonData = { type: button.type, text: button.title };
    if (button.type === "URL") buttonData.url = button.url;
    else if (button.type === "PHONE_NUMBER") buttonData.phone_number = button.phoneNumber;
    return buttonData;
  });

  data.append("buttons", JSON.stringify(formattedButtons));
  data.append("example", example);
  data.append("exampleHeader", exampleHeader);
  data.append("enableSample", true);
  data.append("allowTemplateCategoryChange", false);

  

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
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

      console.log("Datos que se enviarán:", {
        ...templateData,
        CREADO_POR: idNombreUsuarioTalkMe,
        STATUS: "ERROR",
        REJECTION_REASON: errorResponse.message || "Solicitud inválida"
      });

      await saveTemplateLog({
        TEMPLATE_NAME: templateName,
        APP_ID: appId,
        CATEGORY: selectedCategory,
        LANGUAGE_CODE: languageCode,
        TEMPLATE_TYPE: templateType,
        VERTICAL: vertical,
        CONTENT: message,
        HEADER: header,
        FOOTER: footer,
        MEDIA_ID: mediaId,
        BUTTONS: JSON.stringify(buttons),
        EXAMPLE: example,
        EXAMPLE_HEADER: exampleHeader,
        ENABLE_SAMPLE: true,
        ALLOW_TEMPLATE_CATEGORY_CHANGE: false,
        urlTemplatesGS,
        CREADO_POR: idNombreUsuarioTalkMe,
        STATUS: "ERROR",
        REJECTION_REASON: errorResponse.message || "Solicitud inválida"
      });

      Swal.fire({
        title: 'Error',
        text: `❌ Error al crear la plantilla: ${errorResponse.message || "Solicitud inválida"}`,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00c3ff'
      });

      return { status: "error", message: errorResponse.message };
      //throw new Error(errorResponse.message || "Error al crear la plantilla");
    }

    const result = await response.json();

    await saveTemplateLog({
      TEMPLATE_NAME: templateName,
      APP_ID: appId,
      CATEGORY: selectedCategory,
      LANGUAGE_CODE: languageCode,
      TEMPLATE_TYPE: templateType,
      VERTICAL: vertical,
      CONTENT: message,
      HEADER: header,
      FOOTER: footer,
      MEDIA_ID: mediaId,
      BUTTONS: JSON.stringify(buttons),
      EXAMPLE: example,
      EXAMPLE_HEADER: exampleHeader,
      ENABLE_SAMPLE: true,
      ALLOW_TEMPLATE_CATEGORY_CHANGE: false,
      GUPSHUP_TEMPLATE_ID: result.template.id,
      urlTemplatesGS,
      STATUS: "CREATED",
      REJECTION_REASON: null,
      CREADO_POR: idNombreUsuarioTalkMe,
    });

    Swal.fire({
      title: '¡Éxito!',
      text: 'La plantilla fue creada correctamente.',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#00c3ff'
    });

    
    return result;
  } catch (error) {
    console.error("Error en la solicitud:", error);
    console.error("Error detallado:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    await saveTemplateLog({
      TEMPLATE_NAME: templateName,
      APP_ID: appId,
      CATEGORY: selectedCategory,
      LANGUAGE_CODE: languageCode,
      TEMPLATE_TYPE: templateType,
      VERTICAL: vertical,
      CONTENT: message,
      HEADER: header,
      FOOTER: footer,
      MEDIA_ID: mediaId,
      BUTTONS: JSON.stringify(buttons),
      EXAMPLE: example,
      EXAMPLE_HEADER: exampleHeader,
      ENABLE_SAMPLE: true,
      ALLOW_TEMPLATE_CATEGORY_CHANGE: false,
      urlTemplatesGS,
      CREADO_POR: idNombreUsuarioTalkMe,
      STATUS: "ERROR",
      REJECTION_REASON: error.message || "Error inesperado"
    });

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

  

  try {
    const response = await fetch(url, {
      method: "POST",
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

      // Agregar log antes de enviar para verificar los datos
      console.log("Datos que se enviarán:", {
        ...templateData,
        CREADO_POR: idNombreUsuarioTalkMe,
        STATUS: "ERROR",
        REJECTION_REASON: errorResponse.message || "Solicitud inválida"
      });
      // Guardar log de error
      await saveTemplateLog({
        TEMPLATE_NAME: templateData.templateName,
        APP_ID: appId,
        CATEGORY: templateData.selectedCategory,
        LANGUAGE_CODE: templateData.languageCode,
        TEMPLATE_TYPE: templateData.templateType,
        VERTICAL: templateData.vertical,
        CONTENT: templateData.message,
        HEADER: templateData.header,
        FOOTER: templateData.footer,
        MEDIA_ID: templateData.mediaId,
        BUTTONS: JSON.stringify(templateData.buttons), // Probablemente necesita ser string
        EXAMPLE: templateData.example,
        EXAMPLE_HEADER: templateData.exampleHeader,
        ENABLE_SAMPLE: true,
        ALLOW_TEMPLATE_CATEGORY_CHANGE: false,
        urlTemplatesGS,
        CREADO_POR: idNombreUsuarioTalkMe,
        STATUS: "ERROR",
        REJECTION_REASON: errorResponse.message || "Solicitud inválida"
      });

      showSnackbar(`❌ Error al crear la plantilla: ${errorResponse.message || "Solicitud inválida"}`, "error");
      throw new Error(errorResponse.message || "Error al crear la plantilla");
    }

    const result = await response.json();

    // Guardar log exitoso
    await saveTemplateLog({
        TEMPLATE_NAME: templateData.templateName,
        APP_ID: appId,
        CATEGORY: templateData.selectedCategory,
        LANGUAGE_CODE: templateData.languageCode,
        TEMPLATE_TYPE: templateData.templateType,
        VERTICAL: templateData.vertical,
        CONTENT: templateData.message,
        HEADER: templateData.header,
        FOOTER: templateData.footer,
        MEDIA_ID: templateData.mediaId,
        BUTTONS: JSON.stringify(templateData.buttons), // Probablemente necesita ser string
        EXAMPLE: templateData.example,
        EXAMPLE_HEADER: templateData.exampleHeader,
        ENABLE_SAMPLE: true,
        ALLOW_TEMPLATE_CATEGORY_CHANGE: false,
        GUPSHUP_TEMPLATE_ID: result.template.id,
        urlTemplatesGS,
        STATUS: "CREATED",
        REJECTION_REASON: null,
        CREADO_POR: idNombreUsuarioTalkMe,
      });

    showSnackbar("✅ Plantilla creada exitosamente", "success");
    
    return result; // Retornar el resultado
  } catch (error) {
    console.error("Error en la solicitud:", error);
    console.error("Error detallado:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Guardar log de error
    await saveTemplateLog({
        TEMPLATE_NAME: templateData.templateName,
        APP_ID: appId,
        CATEGORY: templateData.selectedCategory,
        LANGUAGE_CODE: templateData.languageCode,
        TEMPLATE_TYPE: templateData.templateType,
        VERTICAL: templateData.vertical,
        CONTENT: templateData.message,
        HEADER: templateData.header,
        FOOTER: templateData.footer,
        MEDIA_ID: templateData.mediaId,
        BUTTONS: JSON.stringify(templateData.buttons), // Probablemente necesita ser string
        EXAMPLE: templateData.example,
        EXAMPLE_HEADER: templateData.exampleHeader,
        ENABLE_SAMPLE: true,
        ALLOW_TEMPLATE_CATEGORY_CHANGE: false,
        urlTemplatesGS,
        CREADO_POR: idNombreUsuarioTalkMe,
        STATUS: "ERROR",
        REJECTION_REASON: errorResponse.message || "Solicitud inválida"
      });


    showSnackbar("❌ Error al crear la plantilla", "error");
    return null; // Retornar null en caso de error
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

  try {
    // Console.log del request
    console.log('Request AL EDITAR CATALOGO: ', {
      url: url,
      method: 'PUT',
      headers: headers,
      body: data.toString()
    });

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

      // Agregar log antes de enviar para verificar los datos
      console.log("Datos que se enviarán para log de error:", {
        ...templateData,
        CREADO_POR: idNombreUsuarioTalkMe,
        STATUS: "ERROR",
        REJECTION_REASON: errorResponse.message || "Solicitud inválida"
      });

      try {
        // Guardar log de error y capturar la respuesta
        console.log("🔄 Iniciando guardado de log de error...");
        const logResultError = await saveTemplateLog({
          TEMPLATE_NAME: templateData.templateName,
          APP_ID: appId,
          CATEGORY: templateData.selectedCategory,
          LANGUAGE_CODE: templateData.languageCode,
          TEMPLATE_TYPE: templateData.templateType,
          VERTICAL: templateData.vertical,
          CONTENT: templateData.message,
          HEADER: templateData.header,
          FOOTER: templateData.footer,
          MEDIA_ID: templateData.mediaId,
          BUTTONS: JSON.stringify(templateData.buttons || []),
          EXAMPLE: templateData.example,
          EXAMPLE_HEADER: templateData.exampleHeader,
          ENABLE_SAMPLE: true,
          ALLOW_TEMPLATE_CATEGORY_CHANGE: false,
          GUPSHUP_TEMPLATE_ID: idTemplate,
          urlTemplatesGS,
          CREADO_POR: idNombreUsuarioTalkMe,
          STATUS: "ERROR",
          REJECTION_REASON: errorResponse.message || "Solicitud inválida"
        });

        // Verificación de que el log se guardó correctamente
        console.log("Resultado del guardado del log de error:", logResultError);
        if (logResultError && logResultError.success) {
          console.log("✅ Log de error guardado correctamente");
        } else {
          console.error("❌ Error al guardar el log de error:", logResultError);
        }

      } catch (logError) {
        console.error("❌ Error al intentar guardar el log de error:", logError);
      }

      console.log("❌ Plantilla no se pudo editar en Gupshup");
      throw new Error(errorResponse.message || "Error al editar la plantilla");
    }

    const result = await response.json();
    console.log('Respuesta completa:', result);

    // Guardar log exitoso
    try {
      console.log("🔄 Iniciando guardado de log exitoso...");
      console.log("Datos que se enviarán para log exitoso:", {
        ...templateData,
        CREADO_POR: idNombreUsuarioTalkMe,
        STATUS: "CREATED"
      });

      const logResult = await saveTemplateLog({
        TEMPLATE_NAME: templateData.templateName,
        APP_ID: appId,
        CATEGORY: templateData.selectedCategory,
        LANGUAGE_CODE: templateData.languageCode,
        TEMPLATE_TYPE: templateData.templateType,
        VERTICAL: templateData.vertical,
        CONTENT: templateData.message,
        HEADER: templateData.header,
        FOOTER: templateData.footer,
        MEDIA_ID: templateData.mediaId,
        BUTTONS: JSON.stringify(templateData.buttons),
        EXAMPLE: templateData.example,
        EXAMPLE_HEADER: templateData.exampleHeader,
        ENABLE_SAMPLE: true,
        ALLOW_TEMPLATE_CATEGORY_CHANGE: false,
        GUPSHUP_TEMPLATE_ID: idTemplate,
        urlTemplatesGS,
        STATUS: "CREATED",
        REJECTION_REASON: null,
        CREADO_POR: idNombreUsuarioTalkMe,
      });

      // Verificación de que el log se guardó correctamente
      console.log("Resultado del guardado del log exitoso:", logResult);
      if (logResult && logResult.success) {
        console.log("✅ Log exitoso guardado correctamente");
      } else {
        console.error("❌ Error al guardar el log exitoso:", logResult);
      }

    } catch (logError) {
      console.error("❌ Error al intentar guardar el log exitoso:", logError);
    }

    console.log("✅ Plantilla editada exitosamente en Gupshup");
    return {
      status: "success",
      template: {
        id: idTemplate
      }
    };

  } catch (error) {
    console.error("❌ Error general en editTemplateCatalogGupshup:", error);
    
    // Guardar log de error general
    try {
      console.log("🔄 Iniciando guardado de log de error general...");
      const logResultError = await saveTemplateLog({
        TEMPLATE_NAME: templateData.templateName,
        APP_ID: appId,
        CATEGORY: templateData.selectedCategory,
        LANGUAGE_CODE: templateData.languageCode,
        TEMPLATE_TYPE: templateData.templateType,
        VERTICAL: templateData.vertical,
        CONTENT: templateData.message,
        HEADER: templateData.header,
        FOOTER: templateData.footer,
        MEDIA_ID: templateData.mediaId,
        BUTTONS: JSON.stringify(templateData.buttons),
        EXAMPLE: templateData.example,
        EXAMPLE_HEADER: templateData.exampleHeader,
        ENABLE_SAMPLE: true,
        ALLOW_TEMPLATE_CATEGORY_CHANGE: false,
        GUPSHUP_TEMPLATE_ID: idTemplate,
        urlTemplatesGS,
        STATUS: "ERROR",
        REJECTION_REASON: error.message || "Error general en la función",
        CREADO_POR: idNombreUsuarioTalkMe,
      });

      // Verificación de que el log se guardó correctamente
      console.log("Resultado del guardado del log de error general:", logResultError);
      if (logResultError && logResultError.success) {
        console.log("✅ Log de error general guardado correctamente");
      } else {
        console.error("❌ Error al guardar el log de error general:", logResultError);
      }

    } catch (logError) {
      console.error("❌ Error al intentar guardar el log de error general:", logError);
    }

    throw error; // Re-lanzar el error original
  }
};

// PLANTILLAS CARRUSEL
export const createTemplateCarouselGupshup = async (appId, authCode, templateData, idNombreUsuarioTalkMe, urlTemplatesGS, validateFn) => {
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
  data.append("cards", carousel)

  

  try {
    const response = await fetch(url, {
      method: "POST",
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

      // Agregar log antes de enviar para verificar los datos
      console.log("Datos que se enviarán:", {
        ...templateData,
        CREADO_POR: idNombreUsuarioTalkMe,
        STATUS: "ERROR",
        REJECTION_REASON: errorResponse.message || "Solicitud inválida"
      });
      // Guardar log de error
      await saveTemplateLog({
        TEMPLATE_NAME: templateData.templateName,
        APP_ID: appId,
        CATEGORY: templateData.selectedCategory,
        LANGUAGE_CODE: templateData.languageCode,
        TEMPLATE_TYPE: templateData.templateType,
        VERTICAL: templateData.vertical,
        CONTENT: templateData.message,
        CARDS: templateData.carousel,
        HEADER: templateData.header,
        FOOTER: templateData.footer,
        MEDIA_ID: templateData.mediaId,
        BUTTONS: JSON.stringify(templateData.buttons), // Probablemente necesita ser string
        EXAMPLE: templateData.example,
        EXAMPLE_HEADER: templateData.exampleHeader,
        ENABLE_SAMPLE: true,
        ALLOW_TEMPLATE_CATEGORY_CHANGE: false,
        urlTemplatesGS,
        CREADO_POR: idNombreUsuarioTalkMe,
        STATUS: "ERROR",
        REJECTION_REASON: errorResponse.message || "Solicitud inválida"
      });


      showSnackbar(`❌ Error al crear la plantilla: ${errorResponse.message || "Solicitud inválida"}`, "error");
      throw new Error(errorResponse.message || "Error al crear la plantilla");
    }

    const result = await response.json();

    // Guardar log exitoso
    await saveTemplateLog({
        TEMPLATE_NAME: templateData.templateName,
        APP_ID: appId,
        CATEGORY: templateData.selectedCategory,
        LANGUAGE_CODE: templateData.languageCode,
        TEMPLATE_TYPE: templateData.templateType,
        VERTICAL: templateData.vertical,
        CONTENT: templateData.message,
        CARDS: templateData.carousel,
        HEADER: templateData.header,
        FOOTER: templateData.footer,
        MEDIA_ID: templateData.mediaId,
        BUTTONS: JSON.stringify(templateData.buttons), // Probablemente necesita ser string
        EXAMPLE: templateData.example,
        EXAMPLE_HEADER: templateData.exampleHeader,
        ENABLE_SAMPLE: true,
        ALLOW_TEMPLATE_CATEGORY_CHANGE: false,
        GUPSHUP_TEMPLATE_ID: result.template.id,
        urlTemplatesGS,
        STATUS: "CREATED",
        REJECTION_REASON: null,
        CREADO_POR: idNombreUsuarioTalkMe,
      });


    showSnackbar("✅ Plantilla creada exitosamente", "success");
    
    return result; // Retornar el resultado
  } catch (error) {
    console.error("Error en la solicitud:", error);
    console.error("Error detallado:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Guardar log de error
    await saveTemplateLog({
        TEMPLATE_NAME: templateData.templateName,
        APP_ID: appId,
        CATEGORY: templateData.selectedCategory,
        LANGUAGE_CODE: templateData.languageCode,
        TEMPLATE_TYPE: templateData.templateType,
        VERTICAL: templateData.vertical,
        CONTENT: templateData.message,
        CARDS: templateData.carousel,
        HEADER: templateData.header,
        FOOTER: templateData.footer,
        MEDIA_ID: templateData.mediaId,
        BUTTONS: JSON.stringify(templateData.buttons), // Probablemente necesita ser string
        EXAMPLE: templateData.example,
        EXAMPLE_HEADER: templateData.exampleHeader,
        ENABLE_SAMPLE: true,
        ALLOW_TEMPLATE_CATEGORY_CHANGE: false,
        urlTemplatesGS,
        CREADO_POR: idNombreUsuarioTalkMe,
        STATUS: "ERROR",
        REJECTION_REASON: errorResponse.message || "Solicitud inválida"
      });

      
    showSnackbar("❌ Error al crear la plantilla", "error");
    return null; // Retornar null en caso de error
  }
};

export const editTemplateCarouselGupshup = async (appId, authCode, templateData, idTemplate, validateFn) => {
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
      //showSnackbar(`❌ Error al crear la plantilla: ${errorResponse.message || "Solicitud inválida"}`, "error");
      throw new Error(errorResponse.message || "Error al editar la plantilla");
    }

    const result = await response.json();
    //showSnackbar("✅ Plantilla editada exitosamente", "success");
    
    return result; // Retornar el resultado
  } catch (error) {
    console.error("Error en la solicitud:", error);
    console.error("Error detallado:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    //showSnackbar("❌ Error al crear la plantilla", "error");
    return null; // Retornar null en caso de error
  }
};

