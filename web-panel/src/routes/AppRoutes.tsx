import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Landing from '../landing/Landing';
import Login from '../pages/Login';
import { useAuth } from '../context/AuthContext';
import PanelLayout from '../layout/PanelLayout';
import AdminLayout from '../layout/AdminLayout';
import DashboardPage from '../features/dashboard/DashboardPage';
import PuntosPage from '../features/puntos/PuntosPage';
import CampanasPage from '../features/campanas/CampanasPage';
import EntregasPage from '../features/entregas/EntregasPage';
import RecepcionPage from '../features/recepcion/RecepcionPage';
import HorariosPage from '../features/horarios/HorariosPage';
import EstadisticasPage from '../features/estadisticas/EstadisticasPage';
import ReportesPage from '../features/reportes/ReportesPage';
import SatisfaccionPage from '../features/satisfaccion/SatisfaccionPage';
import AdminResumenPage from '../features/admin/AdminResumenPage';
import MunicipalidadesPage from '../features/admin/MunicipalidadesPage';
import AdminReportesPage from '../features/admin/AdminReportesPage';
import CalidadIaPage from '../features/admin/CalidadIaPage';
import PantallaCarga from '../components/PantallaCarga';
import AccesoDenegado from '../components/AccesoDenegado';

function RequireMunicipal() {
  const { usuario, cargando } = useAuth();

  if (cargando) return <PantallaCarga />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (!usuario.municipalidadId) {
    if (usuario.rol === 'ADMIN') return <Navigate to="/panel" replace />;
    return <AccesoDenegado />;
  }

  return <Outlet />;
}

function RequireSuperAdmin() {
  const { usuario, cargando } = useAuth();

  if (cargando) return <PantallaCarga />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.municipalidadId) return <Navigate to="/panel/municipal" replace />;
  if (usuario.rol !== 'ADMIN') return <AccesoDenegado />;

  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route element={<RequireMunicipal />}>
        <Route path="/panel/municipal" element={<PanelLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="entregas" element={<EntregasPage />} />
          <Route path="recepcion" element={<RecepcionPage />} />
          <Route path="puntos" element={<PuntosPage />} />
          <Route path="horarios" element={<HorariosPage />} />
          <Route path="campanas" element={<CampanasPage />} />
          <Route path="estadisticas" element={<EstadisticasPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="satisfaccion" element={<SatisfaccionPage />} />
        </Route>
      </Route>
      <Route element={<RequireSuperAdmin />}>
        <Route path="/panel" element={<AdminLayout />}>
          <Route index element={<AdminResumenPage />} />
          <Route path="municipalidades" element={<MunicipalidadesPage />} />
          <Route path="reportes" element={<AdminReportesPage />} />
          <Route path="calidad-ia" element={<CalidadIaPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
