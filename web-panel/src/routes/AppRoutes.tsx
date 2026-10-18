import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Landing from '../landing/Landing';
import Login from '../pages/Login';
import { useAuth } from '../context/AuthContext';

function PanelGuard() {
  const { autenticado } = useAuth();
  if (!autenticado) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PanelFrame({ src, titulo }: { src: string; titulo: string }) {
  return (
    <iframe
      title={titulo}
      src={src}
      style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route element={<PanelGuard />}>
        <Route
          path="/panel"
          element={<PanelFrame titulo="Panel superadministrador" src="/panel-superadministrador.html" />}
        />
        <Route
          path="/panel/municipal"
          element={<PanelFrame titulo="Panel municipal" src="/panel-municipal.html" />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
