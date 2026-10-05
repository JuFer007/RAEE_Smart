import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

const USUARIO_PRUEBA = {
  id: 1,
  nombre: 'Vecino de Prueba',
  email: 'prueba@raee.com',
};

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

  function entrarEnModoPrueba() {
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
