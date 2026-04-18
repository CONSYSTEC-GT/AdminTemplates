// routes/index.jsx (o AppRoutes.jsx)
import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import SidebarLayout from '../src/components/SidebarLayout';
import ProtectedRoute from '../src/utils/ProtectedRoute';
import LoginRequired from '../src/pages/LoginRequired';
import SessionClose from '../src/pages/SessionClose';

const TemplateList = lazy(() => import('../src/pages/TemplateList'));
const CreateTemplatePage = lazy(() => import('../src/pages/CreateTemplatePage'));
const CreateTemplateCatalog = lazy(() => import('../src/pages/CreateTemplateCatalog'));
const CreateTemplateCarousel = lazy(() => import('../src/pages/CreateTemplateCarousel'));
const CreateTemplateFlow = lazy(() => import('../src/pages/CreateTemplateFlow'));
const EditTemplatePage = lazy(() => import('../src/pages/EditTemplatePage'));
const TemplateAll = lazy(() => import('../src/pages/TemplateAll'));
const TemplateAproved = lazy(() => import('../src/pages/TemplateAproved'));
const TemplateRejected = lazy(() => import('../src/pages/TemplateRejected'));
const TemplateFailed = lazy(() => import('../src/pages/TemplateFailed'));
const TemplateSend = lazy(() => import('../src/pages/TemplateSend'));
const ModifyTemplatePage = lazy(() => import('../src/pages/ModifyTemplatePage'));
const ModifyTemplateCarouselPage = lazy(() => import('../src/pages/ModifyTemplateCarouselPage'));
const ModifyTemplateCatalogPage = lazy(() => import('../src/pages/ModifyTemplateCatalogPage'));
const ModifyTemplateFlowPage = lazy(() => import('../src/pages/ModifyTemplateFlowPage'));

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login-required" element={<LoginRequired />} />
      <Route path="/session-closed" element={<SessionClose />} />

      {/* Rutas protegidas con layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<SidebarLayout />}>
          <Route index element={<TemplateList />} />
          <Route path="/dashboard" element={<TemplateList />} />
          <Route path="/CreateTemplatePage/CreateTemplatePage" element={<CreateTemplatePage />} />
          <Route path="/CreateTemplatePage/CreateTemplateCatalog" element={<CreateTemplateCatalog />} />
          <Route path="/CreateTemplatePage/CreateTemplateCarousel" element={<CreateTemplateCarousel />} />
          <Route path="/CreateTemplatePage/CreateTemplateFlow" element={<CreateTemplateFlow />} />
          <Route path="/edit-template" element={<EditTemplatePage />} />
          <Route path="/modify-template" element={<ModifyTemplatePage />} />
          <Route path="/modify-template-carousel" element={<ModifyTemplateCarouselPage />} />
          <Route path="/modify-template-catalogo" element={<ModifyTemplateCatalogPage />} />
          <Route path="/modify-template-flow" element={<ModifyTemplateFlowPage />} />
          <Route path="/plantillas/todas" element={<TemplateAll />} />
          <Route path="/plantillas/aprobadas" element={<TemplateAproved />} />
          <Route path="/plantillas/rechazadas" element={<TemplateRejected />} />
          <Route path="/plantillas/fallidas" element={<TemplateFailed />} />
          <Route path="/plantillas/enviadas" element={<TemplateSend />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;