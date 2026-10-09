import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import { USUARIO_PRUEBA } from '../utils/usuarioPrueba';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    (async () => {
      const guardado = await authService.obtenerUsuarioGuardado();
      setUsuario(guardado);
      setCargandoSesion(false);
    })();
  }, []);

  async function iniciarSesion(email, password) {
    const data = await authService.login(email, password);
    setUsuario(data.usuario);
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
    <AuthContext.Provider value={{ usuario, cargandoSesion, iniciarSesion, cerrarSesion, entrarEnModoPrueba }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
