import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USAR_DATOS_PRUEBA } from '../utils/datosPrueba';
import { CREDENCIALES_PRUEBA, USUARIO_PRUEBA } from '../utils/usuarioPrueba';

export async function guardarSesion(usuario, token = 'token-prueba') {
  await AsyncStorage.setItem('@raeesmart_token', token);
  await AsyncStorage.setItem('@raeesmart_usuario', JSON.stringify(usuario));
}

export async function login(email, password) {
  if (USAR_DATOS_PRUEBA) {
    const correo = String(email || '').trim().toLowerCase();
    if (correo !== CREDENCIALES_PRUEBA.email || password !== CREDENCIALES_PRUEBA.password) {
      const error = new Error('Correo o contraseña incorrectos');
      error.normalizado = 'Correo o contraseña incorrectos';
      throw error;
    }
    await guardarSesion(USUARIO_PRUEBA);
    return { token: 'token-prueba', usuario: USUARIO_PRUEBA };
  }

  const { data } = await api.post('/auth/login', { email, password });
  await AsyncStorage.setItem('@raeesmart_token', data.token);
  await AsyncStorage.setItem('@raeesmart_usuario', JSON.stringify(data.usuario));
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
    await AsyncStorage.setItem('@raeesmart_token', data.token);
    await AsyncStorage.setItem('@raeesmart_usuario', JSON.stringify(data.usuario));
  }
  return data;
}

export async function logout() {
  await AsyncStorage.multiRemove(['@raeesmart_token', '@raeesmart_usuario']);
}

export async function obtenerUsuarioGuardado() {
  const raw = await AsyncStorage.getItem('@raeesmart_usuario');
  return raw ? JSON.parse(raw) : null;
}
