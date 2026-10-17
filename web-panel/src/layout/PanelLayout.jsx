import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function PanelLayout() {
  const { autenticado } = useAuth();

  if (!autenticado) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="panel-main">
        <Outlet />
      </main>
    </div>
  );
}
