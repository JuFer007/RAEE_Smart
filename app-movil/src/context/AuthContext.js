import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import { configurarManejadorSesionExpirada } from '../services/api';
import { USUARIO_PRUEBA } from '../utils/usuarioPrueba';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    let activo = true;
    const desuscribir = configurarManejadorSesionExpirada(() => {
      if (activo) setUsuario(null);
    });

    (async () => {
      let sesion = null;
      try {
        sesion = await authService.obtenerSesionGuardada();
        if (sesion?.usuario?.rol && sesion.usuario.rol !== 'CIUDADANO') {
          await authService.logout();
          sesion = null;
        }
        if (sesion?.token) {
          try {
            const actual = await authService.obtenerSesionActual();
            if (actual?.rol && actual.rol !== 'CIUDADANO') {
              await authService.logout();
              sesion = null;
            } else if (actual) {
              sesion = { ...sesion, usuario: actual };
            }
          } catch {}
        }
      } catch {}
      if (!activo) return;
      setUsuario(sesion?.usuario ?? null);
      setCargandoSesion(false);
    })();

    return () => {
      activo = false;
      desuscribir();
    };
  }, []);

  async function iniciarSesion(email, password, recordar = true) {
    const data = await authService.login(email, password, recordar);
    if (data?.usuario?.rol && data.usuario.rol !== 'CIUDADANO') {
      await authService.logout();
      const error = new Error('La app móvil es solo para ciudadanos');
      error.normalizado = error.message;
      throw error;
    }
    setUsuario(data.usuario);
    return data;
  }

  async function registrar(datos) {
    const data = await authService.registrar(
      datos.nombre,
      datos.email,
      datos.password,
      datos.telefono,
      datos.dni
    );
    setUsuario(data.usuario);
    return data;
  }

  async function cerrarSesion() {
    await authService.logout();
    setUsuario(null);
  }

  async function entrarEnModoPrueba() {
    await authService.guardarSesion(USUARIO_PRUEBA);
    setUsuario(USUARIO_PRUEBA);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargandoSesion, iniciarSesion, registrar, cerrarSesion, entrarEnModoPrueba }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
