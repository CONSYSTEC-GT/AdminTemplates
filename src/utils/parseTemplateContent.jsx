// utils/templateParser.js

export const parseTemplateContent = (data) => {
    const result = {
      text: '',
      buttons: []
    };
    
    // Define regex to match button patterns [type,value] or [value]
    const buttonRegex = /\[(.*?)\]/g;
    
    // Replace all button patterns and collect them
    let lastIndex = 0;
    let match;
    let processedText = '';
    
    while ((match = buttonRegex.exec(data)) !== null) {
      // Add text before this match
      processedText += data.substring(lastIndex, match.index);
      lastIndex = match.index + match[0].length;
      
      // Process button content
      const buttonContent = match[1];
      const parts = buttonContent.split(',');
      
      if (parts.length === 2) {
        // Format: [type,value]
        let type = "QUICK_REPLY";
        if (parts[0].toLowerCase() === "tel" || parts[0].toLowerCase() === "phone") {
          type = "PHONE_NUMBER";
        } else if (parts[0].toLowerCase() === "url" || parts[0].toLowerCase() === "link") {
          type = "URL";
        }
        
        result.buttons.push({
          type: type,
          title: parts[0],
          value: parts[1].trim()
        });
      } else {
        // Format: [button text]
        result.buttons.push({
          type: "QUICK_REPLY",
          title: buttonContent.trim(),
          value: buttonContent.trim()
        });
      }
    }
    
    // Add remaining text
    processedText += data.substring(lastIndex);
    
    // Process the text to handle variables {{n}}
    result.text = processedText.replace(/\{\{(\d+)\}\}/g, (match, number) => {
      return `{{${number}}}`;
    });
    
    return result;
  };
  