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

export function crearProyeccion(coordenadas, ancho, alto, margen = 0.14) {
  if (!coordenadas.length) return { proyectar: (c) => c };
  const lats = coordenadas.map((c) => c.latitud);
  const lngs = coordenadas.map((c) => c.longitud);
  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);
  let minLng = Math.min(...lngs);
  let maxLng = Math.max(...lngs);

  if (minLat === maxLat) {
    minLat -= 0.005;
    maxLat += 0.005;
  }
  if (minLng === maxLng) {
    minLng -= 0.005;
    maxLng += 0.005;
  }

  const rangoLat = maxLat - minLat;
  const rangoLng = maxLng - minLng;
  const utilW = ancho * (1 - margen * 2);
  const utilH = alto * (1 - margen * 2);

  return {
    proyectar: (c) => ({
      ...c,
      x: margen * ancho + ((c.longitud - minLng) / rangoLng) * utilW,
      y: margen * alto + ((maxLat - c.latitud) / rangoLat) * utilH,
    }),
  };
}

export function proyectar(coordenadas, ancho, alto, margen = 0.14) {
  const { proyectar: p } = crearProyeccion(coordenadas, ancho, alto, margen);
  return coordenadas.map(p);
}