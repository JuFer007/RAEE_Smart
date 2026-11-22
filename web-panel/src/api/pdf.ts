import { guardarToken, obtenerToken } from './client';

const hostActual = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

export const PDF_BASE_URL =
  import.meta.env.VITE_PDF_BASE_URL || `http://${hostActual}:3007`;

function nombreDesdeRespuesta(respuesta: Response, respaldo: string): string {
  const disposicion = respuesta.headers.get('Content-Disposition') || '';
  const coincidencia = disposicion.match(/filename="?([^";]+)"?/i);
  return coincidencia?.[1] || `${respaldo}.pdf`;
}

export async function descargarPdf(
  ruta: string,
  body: Record<string, unknown>,
  respaldo: string,
): Promise<void> {
  const token = obtenerToken();
  const cabeceras = new Headers({ 'Content-Type': 'application/json' });
  if (token) cabeceras.set('Authorization', `Bearer ${token}`);

  let respuesta: Response;
  try {
    respuesta = await fetch(`${PDF_BASE_URL}${ruta}`, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('No se pudo conectar con el servicio de PDF. Intenta nuevamente.');
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401) guardarToken(null);
    const texto = await respuesta.text().catch(() => '');
    let mensaje = `Error ${respuesta.status}`;
    if (texto) {
      try {
        const cuerpo = JSON.parse(texto) as { error?: string; mensaje?: string; message?: string };
        mensaje = cuerpo.error || cuerpo.mensaje || cuerpo.message || mensaje;
      } catch {
        mensaje = texto;
      }
    }
    throw new Error(mensaje);
  }

  const blob = await respuesta.blob();
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreDesdeRespuesta(respuesta, respaldo);
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
