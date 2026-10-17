import React, { createContext, useContext, useMemo, useState } from 'react';
import { USUARIO_PANEL } from '../data/mockData';

const AuthContext = createContext(null);
const CLAVE = 'raeesmart_panel_usuario';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE);
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

  const iniciarSesion = ({ email }) => {
    const datos = { ...USUARIO_PANEL, email: email || USUARIO_PANEL.email };
    localStorage.setItem(CLAVE, JSON.stringify(datos));
    setUsuario(datos);
    return datos;
  };

  const cerrarSesion = () => {
    localStorage.removeItem(CLAVE);
    setUsuario(null);
  };

  const valor = useMemo(
    () => ({ usuario, autenticado: Boolean(usuario), iniciarSesion, cerrarSesion }),
    [usuario],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
