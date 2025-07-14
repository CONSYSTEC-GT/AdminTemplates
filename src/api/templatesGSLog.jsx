export const saveTemplateLog = async (logData) => {
  try {
    //const url = urlTemplatesGS + 'logs';
    //const url = 'http://localhost:3004/api/logs/'
    const { urlTemplatesGS, ...rest } = logData;

    const url = urlTemplatesGS + 'logs';
    

    const headers = {
      "Content-Type": "application/json",
    };
    
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(logData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error al guardar el log:", errorText);
      return null;
    }

    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error("Error en la solicitud de log:", error);
    return null;
  }
};