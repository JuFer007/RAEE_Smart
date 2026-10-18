import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Usuario } from '../types';

const USUARIO_PANEL: Usuario = {
  id: 1,
  nombre: 'Admin Municipalidad de Chiclayo',
  email: 'admin.chiclayo@raee.com',
  municipalidadId: 1,
  municipalidadNombre: 'Municipalidad Provincial de Chiclayo',
  rol: 'ADMIN',
};

interface AuthContextValue {
  usuario: Usuario | null;
  autenticado: boolean;
  iniciarSesion: (datos: { email?: string }) => Usuario;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const CLAVE = 'raeesmart_panel_usuario';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    try {
      const guardado = localStorage.getItem(CLAVE);
      return guardado ? (JSON.parse(guardado) as Usuario) : null;
    } catch {
      return null;
    }
  });

  const iniciarSesion = ({ email }: { email?: string }): Usuario => {
    const datos: Usuario = { ...USUARIO_PANEL, email: email || USUARIO_PANEL.email };
    localStorage.setItem(CLAVE, JSON.stringify(datos));
    setUsuario(datos);
    return datos;
  };

  const cerrarSesion = (): void => {
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
