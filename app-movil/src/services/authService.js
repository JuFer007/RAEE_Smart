import api from './api';
import {
  guardarSesion as guardarSesionAlmacenada,
  limpiarSesion,
  obtenerSesionGuardada as obtenerSesionPersistida,
} from './sesionStorage';
import { USAR_DATOS_PRUEBA } from '../utils/datosPrueba';
import { CREDENCIALES_PRUEBA, USUARIO_PRUEBA } from '../utils/usuarioPrueba';

export async function guardarSesion(usuario, token = 'token-prueba', recordar = true) {
  await guardarSesionAlmacenada(usuario, token, recordar);
}

export async function login(email, password, recordar = true) {
  if (USAR_DATOS_PRUEBA) {
    const correo = String(email || '').trim().toLowerCase();
    if (correo !== CREDENCIALES_PRUEBA.email || password !== CREDENCIALES_PRUEBA.password) {
      const error = new Error('Correo o contraseña incorrectos');
      error.normalizado = 'Correo o contraseña incorrectos';
      throw error;
    }
    await guardarSesion(USUARIO_PRUEBA, 'token-prueba', recordar);
    return { token: 'token-prueba', usuario: USUARIO_PRUEBA };
  }

  const { data } = await api.post('/auth/login/movil', { email, password });
  if (data?.usuario?.rol && data.usuario.rol !== 'CIUDADANO') {
    await limpiarSesion();
    const error = new Error('La app móvil es solo para ciudadanos');
    error.normalizado = error.message;
    throw error;
  }
  await guardarSesion(data.usuario, data.token, recordar);
  return data;
}

export async function registrar(nombre, email, password, telefono, dni) {
  if (USAR_DATOS_PRUEBA) {
    const existente = String(email || '').trim().toLowerCase();
    if (existente === CREDENCIALES_PRUEBA.email) {
      const error = new Error('Ya existe una cuenta con este correo');
      error.normalizado = 'Ya existe una cuenta con este correo';
      throw error;
    }

    const usuario = {
      ...USUARIO_PRUEBA,
      nombre: String(nombre || '').trim() || USUARIO_PRUEBA.nombre,
      email: existente,
      telefono: String(telefono || '').trim() || USUARIO_PRUEBA.telefono,
      dni: String(dni || '').trim() || USUARIO_PRUEBA.dni,
      fechaRegistro: new Date().toISOString(),
    };
    await guardarSesion(usuario);
    return { token: 'token-prueba', usuario };
  }

  const { data } = await api.post('/auth/registro', { nombre, email, password, telefono, dni });
  if (data?.token) {
    await guardarSesion(data.usuario, data.token);
  }
  return data;
}

export async function cambiarPassword(passwordActual, passwordNueva) {
  if (USAR_DATOS_PRUEBA) {
    if (passwordActual !== CREDENCIALES_PRUEBA.password) {
      const error = new Error('La contraseña actual no es correcta');
      error.normalizado = 'La contraseña actual no es correcta';
      throw error;
    }
    return { ok: true };
  }

  const { data } = await api.put('/usuarios/me/password', { passwordActual, passwordNueva });
  return data;
}

export async function logout() {
  await limpiarSesion();
}

export async function obtenerSesionGuardada() {
  return obtenerSesionPersistida();
}

export async function obtenerSesionActual() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function obtenerUsuarioGuardado() {
  const sesion = await obtenerSesionPersistida();
  return sesion?.usuario ?? null;
}
