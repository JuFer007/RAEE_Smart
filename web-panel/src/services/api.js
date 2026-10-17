export const API_BASE_URL = 'http://localhost:8080/api';

export function obtenerToken() {
  return localStorage.getItem('raeesmart_panel_token');
}

export function guardarToken(token) {
  if (token) localStorage.setItem('raeesmart_panel_token', token);
  else localStorage.removeItem('raeesmart_panel_token');
}

export async function peticion(ruta, opciones = {}) {
  const token = obtenerToken();
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opciones.headers || {}),
    },
  });
  if (!respuesta.ok) {
    const texto = await respuesta.text().catch(() => '');
    throw new Error(texto || `Error ${respuesta.status}`);
  }
  if (respuesta.status === 204) return null;
  return respuesta.json();
}

export default { API_BASE_URL, obtenerToken, guardarToken, peticion };
