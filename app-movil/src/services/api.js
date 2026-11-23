import axios from 'axios';
import { API_BASE_URL } from '../theme';
import { limpiarSesion, obtenerToken } from './sesionStorage';

export const MENSAJES_ERROR_POR_DEFECTO = {
  SIN_CONEXION: 'No hay conexión a internet. Verifica tu red e inténtalo de nuevo.',
  TIMEOUT: 'La solicitud está tardando mucho. Revisa tu conexión e inténtalo de nuevo.',
  SERVIDOR: 'Hubo un error en el servidor. Inténtalo nuevamente en unos segundos.',
  NO_AUTORIZADO: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  PROHIBIDO: 'No tienes permisos para realizar esta acción.',
  PROHIBIDO_SIN_DETALLE:
    'No pudimos conectar con el servidor desde esta red. Revisa la URL de la API y el CORS del backend.',
  NO_ENCONTRADO: 'No se encontró el recurso solicitado.',
  GENERICO: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
};

let manejadorSesionExpirada = null;

export function configurarManejadorSesionExpirada(manejador) {
  manejadorSesionExpirada = manejador;
  return () => {
    if (manejadorSesionExpirada === manejador) {
      manejadorSesionExpirada = null;
    }
  };
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await obtenerToken();
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
      case 401: {
        const url = String(originalRequest.url || '');
        if (url.includes('/auth/login')) {
          error.normalizado =
            error.response?.data?.mensaje ||
            error.response?.data?.message ||
            'Correo o contraseña incorrectos';
          break;
        }
        if (url.startsWith('/auth/recuperar-password') || url.startsWith('/auth/reenviar-codigo')
          || url.startsWith('/auth/verificar-codigo') || url.startsWith('/auth/restablecer-password')) {
          error.normalizado = 'No pudimos procesar tu solicitud. Inténtalo nuevamente.';
          break;
        }

        error.normalizado = MENSAJES_ERROR_POR_DEFECTO.NO_AUTORIZADO;
        if (String(originalRequest.url || '').startsWith('/municipalidades/')) break;
        try {
          await limpiarSesion();
        } catch {}
        manejadorSesionExpirada?.();
        break;
      }
      case 403:
        error.normalizado =
          error.response?.data?.mensaje ||
          error.response?.data?.message ||
          MENSAJES_ERROR_POR_DEFECTO.PROHIBIDO_SIN_DETALLE;
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
