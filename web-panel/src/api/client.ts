const hostActual =
  typeof window !== 'undefined' ? window.location.hostname : 'localhost';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `http://${hostActual}:8080/api`;

const TOKEN_KEY = 'raeesmart_panel_token';

type MotivoSesion = 'expirada' | 'denegada';
type ManejadorSesion = (motivo: MotivoSesion) => void;

let manejadorSesion: ManejadorSesion | null = null;

export function registrarManejadorSesion(manejador: ManejadorSesion | null): () => void {
  manejadorSesion = manejador;
  return () => {
    if (manejadorSesion === manejador) manejadorSesion = null;
  };
}

export class ApiError extends Error {
  status: number;
  detalles: string[];

  constructor(mensaje: string, status: number, detalles: string[] = []) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.detalles = detalles;
  }
}

export function obtenerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function guardarToken(token: string | null, recordarSesion = true): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  if (!token) return;
  const almacenamiento = recordarSesion ? localStorage : sessionStorage;
  almacenamiento.setItem(TOKEN_KEY, token);
}

type ErrorBody = {
  mensaje?: string;
  message?: string;
  error?: string;
  detalles?: string[];
};

export async function peticion<T = unknown>(
  ruta: string,
  opciones: RequestInit = {},
): Promise<T> {
  const token = obtenerToken();
  const cabeceras = new Headers(opciones.headers);

  if (!(opciones.body instanceof FormData) && !cabeceras.has('Content-Type')) {
    cabeceras.set('Content-Type', 'application/json');
  }
  if (token) cabeceras.set('Authorization', `Bearer ${token}`);

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_BASE_URL}${ruta}`, { ...opciones, headers: cabeceras });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Intenta nuevamente.', 0);
  }

  if (!respuesta.ok) {
    const texto = await respuesta.text().catch(() => '');
    let cuerpo: ErrorBody | null = null;
    if (texto) {
      try {
        cuerpo = JSON.parse(texto) as ErrorBody;
      } catch {
        cuerpo = null;
      }
    }

    const esLogin = ruta.startsWith('/auth/login');

    if (respuesta.status === 401 && !esLogin) {
      guardarToken(null);
      manejadorSesion?.('expirada');
    }
    if (respuesta.status === 403) {
      manejadorSesion?.('denegada');
    }

    const mensaje =
      cuerpo?.mensaje ||
      cuerpo?.message ||
      cuerpo?.error ||
      `Error ${respuesta.status}`;

    throw new ApiError(mensaje, respuesta.status, cuerpo?.detalles ?? []);
  }

  if (respuesta.status === 204) return null as T;

  const texto = await respuesta.text();
  return (texto ? JSON.parse(texto) : null) as T;
}

export default {
  API_BASE_URL,
  obtenerToken,
  guardarToken,
  registrarManejadorSesion,
  peticion,
  ApiError,
};
