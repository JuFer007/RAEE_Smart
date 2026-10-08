import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../theme';

export const MENSAJES_ERROR_POR_DEFECTO = {
  SIN_CONEXION: 'No hay conexión a internet. Verifica tu red e inténtalo de nuevo.',
  TIMEOUT: 'La solicitud está tardando mucho. Revisa tu conexión e inténtalo de nuevo.',
  SERVIDOR: 'Hubo un error en el servidor. Inténtalo nuevamente en unos segundos.',
  NO_AUTORIZADO: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  PROHIBIDO: 'No tienes permisos para realizar esta acción.',
  NO_ENCONTRADO: 'No se encontró el recurso solicitado.',
  GENERICO: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@raeesmart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
      error.normalizado = MENSAJES_ERROR_POR_DEFECTO.TIMEOUT;
      return Promise.reject(error);
    }

    if (error.code === 'ERR_NETWORK') {
      error.normalizado = MENSAJES_ERROR_POR_DEFECTO.SIN_CONEXION;
      return Promise.reject(error);
    }

    const status = error.response?.status;

    switch (status) {
      case 401:
        error.normalizado = MENSAJES_ERROR_POR_DEFECTO.NO_AUTORIZADO;
        try {
          await AsyncStorage.removeItem('@raeesmart_token');
          await AsyncStorage.removeItem('@raeesmart_usuario');
        } catch {}
        break;
      case 403:
        error.normalizado = MENSAJES_ERROR_POR_DEFECTO.PROHIBIDO;
        break;
      case 404:
        error.normalizado = MENSAJES_ERROR_POR_DEFECTO.NO_ENCONTRADO;
        break;
      case 408:
        error.normalizado = MENSAJES_ERROR_POR_DEFECTO.TIMEOUT;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        error.normalizado = MENSAJES_ERROR_POR_DEFECTO.SERVIDOR;
        break;
      default:
        error.normalizado =
          error.response?.data?.mensaje ||
          error.response?.data?.message ||
          error.mensaje ||
          MENSAJES_ERROR_POR_DEFECTO.GENERICO;
        break;
    }

    return Promise.reject(error);
  },
);

export default api;
