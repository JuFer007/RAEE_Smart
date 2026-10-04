const FECHA_CORTA = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const FECHA_HORA = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatearFecha(iso) {
  if (!iso) return '—';
  return FECHA_CORTA.format(new Date(iso));
}

export function formatearFechaHora(iso) {
  if (!iso) return '—';
  return FECHA_HORA.format(new Date(iso)).replace(',', '');
}

export function distanciaKm(metros) {
  if (metros == null) return null;
  const km = metros / 1000;
  return km < 1 ? `${Math.round(metros)} m` : `${km.toFixed(1)} km`;
}