import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

function getBasename() {
  if (window.__BASENAME__) return window.__BASENAME__;
  const base = import.meta.env.BASE_URL;
  if (!base || base === './') return '/';
  return base.startsWith('/') ? base : `/${base}`;
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={getBasename()}>
    <App />
  </BrowserRouter>
);