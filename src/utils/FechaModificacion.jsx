import React from 'react';
import Typography from '@mui/material/Typography';

function FechaModificacion({ timestamp }) {
    const fecha = new Date(timestamp);

    const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
    const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);

    return (
        <Typography
            variant="caption"
            sx={{
                //color: '#FFFFFF',        // Letras blancas
                fontWeight: 500,
                //backgroundColor: '#726e6a',  // Fondo color #726e6a
                textAlign: 'right',          // Texto alineado a la derecha
                p: 1,                       // Opcional: algo de padding para que se vea mejor el fondo
                width:"100%"
            }}>
            Última modificación: {fechaFormateada}
        </Typography>
    );
}

export default FechaModificacion;
