export const saveTemplateLog = async (logData) => {
  try {
    // Extraer urlTemplatesGS y crear un objeto sin ese campo para enviar al backend
    const { urlTemplatesGS, ...dataToSend } = logData;

    const url = urlTemplatesGS + 'logs';
    
    
    

    const headers = {
      "Content-Type": "application/json",
    };
    
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(dataToSend), // ✅ Ahora envía solo los datos válidos
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error al guardar el log - Status:", response.status);
      console.error("❌ Error al guardar el log - Response:", errorText);
      return { success: false, error: errorText, status: response.status };
    }

    const result = await response.json();
    
    
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error en la solicitud de log:", error);
    return { success: false, error: error.message };
  }
};