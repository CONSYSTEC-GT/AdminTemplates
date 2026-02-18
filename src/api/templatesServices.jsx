// GUPSHUP
const fetchGupshupTemplates = async (appId, authCode) => {
  try {
    const response = await fetch(`https://partner.gupshup.io/partner/app/${appId}/templates`, {
      method: 'GET',
      headers: {
        Authorization: authCode,
      },
    });
    const data = await response.json();
    if (data.status === 'success') {
      return data.templates;
    }
    return [];
  } catch (error) {
    console.error('Error fetching Gupshup templates:', error);
    return [];
  }
};

// TALKME
const fetchTalkmeTemplates = async (urlTemplatesGS) => {

 const url = urlTemplatesGS.endsWith('/') ? urlTemplatesGS + 'plantillas' : urlTemplatesGS + '/plantillas';

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching TalkMe templates:', error);
    return [];
  }
};


export const fetchMergedTemplates = async (appId, authCode, templatesGS) => {
  try {
    
    const [gupshupTemplates, talkmeTemplates] = await Promise.all([
      fetchGupshupTemplates(appId, authCode),
      fetchTalkmeTemplates(templatesGS)
    ]);

    
    const talkmeMap = new Map();
    talkmeTemplates.forEach(template => {
      talkmeMap.set(template.ID_INTERNO, template);
    });

    
    const mergedTemplates = gupshupTemplates
      .filter(gupshupTemplate => talkmeMap.has(gupshupTemplate.id))
      .map(gupshupTemplate => {
        const talkmeTemplate = talkmeMap.get(gupshupTemplate.id);
        
        return {
          
          id: gupshupTemplate.id,
          nombre: talkmeTemplate.NOMBRE_PLANTILLA || gupshupTemplate.elementName,

          gupshup: {
            id: gupshupTemplate.id,
            elementName: gupshupTemplate.elementName,
            status: gupshupTemplate.status,
            category: gupshupTemplate.category,
            containerMeta: gupshupTemplate.containerMeta,
            templateType: gupshupTemplate.templateType,
            buttonSupported: gupshupTemplate.buttonSupported, // ⭐ AGREGAR ESTA LÍNEA
            data: gupshupTemplate.data,
            languageCode: gupshupTemplate.languageCode,
            quality: gupshupTemplate.quality,
            reason: gupshupTemplate.reason,
            createdOn: gupshupTemplate.createdOn,
            modifiedOn: gupshupTemplate.modifiedOn,
            vertical: gupshupTemplate.vertical
          },
          // Datos de TalkMe
          talkme: {
            idPlantilla: talkmeTemplate.ID_PLANTILLA,
            idInterno: talkmeTemplate.ID_INTERNO,
            nombre: talkmeTemplate.NOMBRE,
            nombrePlantilla: talkmeTemplate.NOMBRE_PLANTILLA,
            mensaje: talkmeTemplate.MENSAJE,
            tipoPlantilla: talkmeTemplate.TIPO_PLANTILLA,
            media: talkmeTemplate.MEDIA,
            url: talkmeTemplate.URL || 'https://s3.amazonaws.com/com.talkme/talkme/archivos_plantillas/demos_talkme/bot_gupshup/images-23752250911211029.png',
            estado: talkmeTemplate.ESTADO,
            estadoGupshup: talkmeTemplate.ESTADO_GUPSHUP,
            autorizado: talkmeTemplate.AUTORIZADO,
            creadoEl: talkmeTemplate.CREADO_EL,
            modificadoEl: talkmeTemplate.MODIFICADO_EL
          }
        };
      })
      //.slice(0, 4);

    return mergedTemplates;
    

  } catch (error) {
    console.error('Error merging templates:', error);
    return [];
  }
};