import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import TemplateList from './pages/TemplateList';
import CreateTemplatePage from './pages/CreateTemplatePage';
import CreateTemplateCatalog from './pages/CreateTemplateCatalog';
import CreateTemplateCarousel from './pages/CreateTemplateCarousel';
import CreateTemplateFlow from './pages/CreateTemplateFlow';
import EditTemplatePage from './pages/EditTemplatePage';
import TemplateAll from './pages/TemplateAll';
import TemplateAproved from './pages/TemplateAproved';
import TemplateRejected from './pages/TemplateRejected';
import TemplateFailed from './pages/TemplateFailed';
import TemplateSend from './pages/TemplateSend';
import ModifyTemplatePage from './pages/ModifyTemplatePage';
import ModifyTemplateCarouselPage from './pages/ModifyTemplateCarouselPage';
import ModifyTemplateCatalogPage from './pages/ModifyTemplateCatalogPage';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './utils/ProtectedRoute';
import LoginRequired from './pages/LoginRequired';
import SessionClose from './pages/SessionClose';
import LoadingSpinner from './utils/LoadingSpinner';

const AppRoutes = () => {
  return (
    <>
      
      <Suspense fallback={<LoadingSpinner />}>

      <Routes>
        {/* Ruta pública para la página de error */}
        <Route path="/login-required" element={<LoginRequired />} />
        <Route path="/session-closed" element={<SessionClose />} />

        {/* Rutas protegidas */}
        <Route element={<Sidebar />}>
          <Route
            index
            element={
              <ProtectedRoute>
                <TemplateList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TemplateList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/CreateTemplatePage/CreateTemplatePage"
            element={
              <ProtectedRoute>
                <CreateTemplatePage />
              </ProtectedRoute>
            }
          />
            <Route
              path="/CreateTemplatePage/CreateTemplateCatalog"
              element={
                <ProtectedRoute>
                  <CreateTemplateCatalog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/CreateTemplatePage/CreateTemplateCarousel"
              element={
                <ProtectedRoute>
                  <CreateTemplateCarousel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/CreateTemplatePage/CreateTemplateFlow"
              element={
                <ProtectedRoute>
                  <CreateTemplateFlow />
                </ProtectedRoute>
              }
            />
          <Route
            path="/edit-template"
            element={
              <ProtectedRoute>
                <EditTemplatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/modify-template"
            element={
              <ProtectedRoute>
                <ModifyTemplatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/modify-template-carousel"
            element={
              <ProtectedRoute>
                <ModifyTemplateCarouselPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/modify-template-catalogo"
            element={
              <ProtectedRoute>
                <ModifyTemplateCatalogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plantillas/todas"
            element={
              <ProtectedRoute>
                <TemplateAll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plantillas/aprovadas"
            element={
              <ProtectedRoute>
                <TemplateAproved />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plantillas/rechazadas"
            element={
              <ProtectedRoute>
                <TemplateRejected />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plantillas/fallidas"
            element={
              <ProtectedRoute>
                <TemplateFailed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plantillas/enviadas"
            element={
              <ProtectedRoute>
                <TemplateSend />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
      </Suspense>
    </>
  );
};

export default AppRoutes;