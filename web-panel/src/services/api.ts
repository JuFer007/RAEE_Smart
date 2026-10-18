export const API_BASE_URL = 'http://localhost:8080/api';

export function obtenerToken(): string | null {
  return localStorage.getItem('raeesmart_panel_token');
}

export function guardarToken(token: string | null): void {
  if (token) localStorage.setItem('raeesmart_panel_token', token);
  else localStorage.removeItem('raeesmart_panel_token');
}

export async function peticion<T = unknown>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = obtenerToken();
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((opciones.headers as Record<string, string> | undefined) || {}),
    },
  });
  if (!respuesta.ok) {
    const texto = await respuesta.text().catch(() => '');
    throw new Error(texto || `Error ${respuesta.status}`);
  }
  if (respuesta.status === 204) return null as T;
  return (await respuesta.json()) as T;
}

export default { API_BASE_URL, obtenerToken, guardarToken, peticion };
