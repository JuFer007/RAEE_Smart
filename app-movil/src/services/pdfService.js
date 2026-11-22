import { File, Paths } from 'expo-file-system';
import { PDF_BASE_URL } from '../theme';
import { obtenerToken } from './sesionStorage';

function nombreArchivo(codigoHash, entregaId) {
  const base = String(codigoHash || entregaId || 'certificado').replace(/[^A-Za-z0-9_-]/g, '_');
  return `certificado_${base}.pdf`;
}

function urlCertificado(entregaId) {
  return `${PDF_BASE_URL}/certificado/entrega/${entregaId}/pdf`;
}

async function cabeceras() {
  const token = await obtenerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function descargarCertificado(entregaId, codigoHash) {
  if (!entregaId) throw new Error('No hay una entrega asociada al certificado');
  const archivo = new File(Paths.cache, nombreArchivo(codigoHash, entregaId));
  const descargado = await File.downloadFileAsync(urlCertificado(entregaId), archivo, {
    headers: await cabeceras(),
    idempotent: true,
  });
  return descargado.uri;
}

export async function descargarCertificadoWeb(entregaId, codigoHash) {
  if (!entregaId) throw new Error('No hay una entrega asociada al certificado');
  const respuesta = await fetch(urlCertificado(entregaId), { headers: await cabeceras() });
  if (!respuesta.ok) {
    let mensaje = `Error ${respuesta.status}`;
    try {
      const cuerpo = await respuesta.json();
      mensaje = cuerpo.error || cuerpo.mensaje || mensaje;
    } catch {}
    throw new Error(mensaje);
  }
  const blob = await respuesta.blob();
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo(codigoHash, entregaId);
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
