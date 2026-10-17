import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PanelLayout from '../layout/PanelLayout';
import Landing from '../landing/Landing';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Entregas from '../pages/Entregas';
import Estadisticas from '../pages/Estadisticas';
import Puntos from '../pages/Puntos';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/panel" element={<PanelLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="entregas" element={<Entregas />} />
        <Route path="estadisticas" element={<Estadisticas />} />
        <Route path="puntos" element={<Puntos />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
