import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { nombreCanal } from '../api/templatesGSApi';

const useNombreCanal = () => {
    const [canal, setCanal] = useState(null);

    useEffect(() => {
        const fetchNombre = async () => {
            try {
                const token = sessionStorage.getItem('authToken');
                if (!token) return;

                const decoded = jwtDecode(token);
                const { id_bot_redes, empresa, urlTemplatesGS } = decoded;

                if (!id_bot_redes || !empresa || !urlTemplatesGS) return;

                const nombre = await nombreCanal(id_bot_redes, empresa, urlTemplatesGS);
                setCanal(nombre);
            } catch {
                // silencioso: el sidebar sigue funcionando sin el nombre
            }
        };

        fetchNombre();
    }, []);

    return canal;
};

export default useNombreCanal;
