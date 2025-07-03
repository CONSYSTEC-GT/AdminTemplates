import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreateTemplateButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/create-template'); // Navega a la ruta /create-template
  };

  return (
    <Button type="primary" icon={<PlusOutlined />} onClick={handleClick}>
      Crear plantilla
    </Button>
  );
};

export default CreateTemplateButton;
