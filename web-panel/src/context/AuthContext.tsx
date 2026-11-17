import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Usuario } from '../types';
import { obtenerSesionApi, iniciarSesionApi } from '../api/auth';
import { guardarToken, obtenerToken } from '../api/client';

interface AuthContextValue {
  usuario: Usuario | null;
  autenticado: boolean;
  cargando: boolean;
  iniciarSesion: (
    email: string,
    password: string,
    recordarSesion?: boolean,
  ) => Promise<Usuario>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const CLAVE_ANTERIOR = 'raeesmart_panel_usuario';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const anterior = localStorage.getItem(CLAVE_ANTERIOR);
    if (anterior) localStorage.removeItem(CLAVE_ANTERIOR);

    let activo = true;

    async function recuperarSesion() {
      if (!obtenerToken()) {
        if (activo) setCargando(false);
        return;
      }

      try {
        const sesion = await obtenerSesionApi();
        if (activo) setUsuario(sesion);
      } catch {
        guardarToken(null);
        if (activo) setUsuario(null);
      } finally {
        if (activo) setCargando(false);
      }
    }

    void recuperarSesion();
    return () => {
      activo = false;
    };
  }, []);

  const iniciarSesion = useCallback(
    async (email: string, password: string, recordarSesion = true): Promise<Usuario> => {
      const respuesta = await iniciarSesionApi(email.trim(), password);
      guardarToken(respuesta.token, recordarSesion);
      setUsuario(respuesta.usuario);
      setCargando(false);
      return respuesta.usuario;
    },
    [],
  );

  const cerrarSesion = useCallback((): void => {
    guardarToken(null);
    localStorage.removeItem(CLAVE_ANTERIOR);
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      autenticado: Boolean(usuario),
      cargando,
      iniciarSesion,
      cerrarSesion,
    }),
    [usuario, cargando, iniciarSesion, cerrarSesion],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
