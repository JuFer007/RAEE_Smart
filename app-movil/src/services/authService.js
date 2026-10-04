import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  await AsyncStorage.setItem('@raeesmart_token', data.token);
  await AsyncStorage.setItem('@raeesmart_usuario', JSON.stringify(data.usuario));
  return data;
}

export async function registrar(nombre, email, password, telefono) {
  const { data } = await api.post('/auth/registro', { nombre, email, password, telefono });
  return data;
}

export async function logout() {
  await AsyncStorage.multiRemove(['@raeesmart_token', '@raeesmart_usuario']);
}

export async function obtenerUsuarioGuardado() {
  const raw = await AsyncStorage.getItem('@raeesmart_usuario');
  return raw ? JSON.parse(raw) : null;
}
