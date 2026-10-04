const RADIO_TIERRA = 6371000;

function aRadianes(grados) {
  return (grados * Math.PI) / 180;
}

export function distanciaMeters(a, b) {
  if (!a?.latitud || !b?.latitud) return null;
  const dLat = aRadianes(b.latitud - a.latitud);
  const dLon = aRadianes(b.longitud - a.longitud);
  const lat1 = aRadianes(a.latitud);
  const lat2 = aRadianes(b.latitud);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * RADIO_TIERRA * Math.asin(Math.sqrt(h));
}

export function ordenarPorDistancia(puntos, ubicacion) {
  if (!ubicacion) return puntos;
  return [...puntos]
    .map((p) => ({ ...p, distanciaM: distanciaMeters(ubicacion, p) }))
    .sort((a, b) => (a.distanciaM ?? Infinity) - (b.distanciaM ?? Infinity));
}

export function proyectar(coordenadas, ancho, alto, margen = 0.14) {
  if (!coordenadas.length) return [];
  const lats = coordenadas.map((c) => c.latitud);
  const lngs = coordenadas.map((c) => c.longitud);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const rangoLat = maxLat - minLat || 0.01;
  const rangoLng = maxLng - minLng || 0.01;
  const utilW = ancho * (1 - margen * 2);
  const utilH = alto * (1 - margen * 2);

  return coordenadas.map((c) => ({
    ...c,
    x: margen * ancho + ((c.longitud - minLng) / rangoLng) * utilW,
    y: margen * alto + ((maxLat - c.latitud) / rangoLat) * utilH,
  }));
}