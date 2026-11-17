import { ApiError } from '../api/client';

export function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) return 'Sin fecha';
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  if (!anio || !mes || !dia) return fecha;
  return new Date(Number(anio), Number(mes) - 1, Number(dia)).toLocaleDateString(
    'es-PE',
    { day: '2-digit', month: 'short', year: 'numeric' },
  );
}

export function formatearRango(inicio: string, fin: string): string {
  return `${formatearFecha(inicio)} - ${formatearFecha(fin)}`;
}

export function formatearFechaHora(fecha: string | null | undefined): string {
  if (!fecha) return 'Sin fecha';
  const [dia, hora] = fecha.split('T');
  const horaCorta = hora?.slice(0, 5);
  return `${formatearFecha(dia)}${horaCorta ? ` · ${horaCorta}` : ''}`;
}

export function formatearConfianza(confianza: number | null | undefined): string {
  if (confianza === null || confianza === undefined) return 'Sin dato';
  const valor = confianza <= 1 ? confianza * 100 : confianza;
  return `${Math.round(valor)}%`;
}

const ICONOS_RAEE: Record<string, string> = {
  TELEVISOR: 'tv',
  LAPTOP: 'laptop',
  CELULAR: 'phone',
  REFRIGERADORA: 'snow',
  IMPRESORA: 'print',
  TABLET: 'tablet',
  EQUIPO_DE_SONIDO: 'music',
  PEQUENO_ELECTRODOMESTICO: 'bolt',
};

export function iconoRaee(tipo: string | null | undefined): string {
  return tipo ? ICONOS_RAEE[tipo] ?? 'leaf' : 'leaf';
}

export function obtenerMensajeError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.detalles.length
      ? `${error.message}. ${error.detalles.join(' ')}`
      : error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado. Intenta nuevamente.';
}

export function fechaHoyISO(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

export function sumarDias(fechaISO: string, dias: number): string {
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  fecha.setDate(fecha.getDate() + dias);
  const mesFinal = String(fecha.getMonth() + 1).padStart(2, '0');
  const diaFinal = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mesFinal}-${diaFinal}`;
}

export function pluralizar(cantidad: number, singular: string, plural: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}
