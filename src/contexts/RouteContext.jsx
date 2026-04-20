// contexts/RouteContext.jsx
import React, { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';

const RouteContext = createContext();

export const RouteProvider = ({ children }) => {
    const location = useLocation();
    return (
        <RouteContext.Provider value={location.pathname}>
            {children}
        </RouteContext.Provider>
    );
};

export const useCurrentRoute = () => useContext(RouteContext);