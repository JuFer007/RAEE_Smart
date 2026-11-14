const RADIO_TIERRA = 6371000;

function aNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function aRadianes(grados) {
  return (grados * Math.PI) / 180;
}

export function latitudDe(coordenada) {
  return aNumero(coordenada?.latitud ?? coordenada?.latitude);
}

export function longitudDe(coordenada) {
  return aNumero(coordenada?.longitud ?? coordenada?.longitude ?? coordenada?.lng);
}

export function tieneCoordenadas(coordenada) {
  const latitud = latitudDe(coordenada);
  const longitud = longitudDe(coordenada);
  return (
    latitud != null &&
    longitud != null &&
    latitud >= -90 &&
    latitud <= 90 &&
    longitud >= -180 &&
    longitud <= 180
  );
}

export function normalizarCoordenadas(coordenada) {
  if (!tieneCoordenadas(coordenada)) return null;
  return { ...coordenada, latitud: latitudDe(coordenada), longitud: longitudDe(coordenada) };
}

export function distanciaMeters(a, b) {
  if (!tieneCoordenadas(a) || !tieneCoordenadas(b)) return null;
  const aLat = latitudDe(a);
  const aLng = longitudDe(a);
  const bLat = latitudDe(b);
  const bLng = longitudDe(b);
  const dLat = aRadianes(bLat - aLat);
  const dLon = aRadianes(bLng - aLng);
  const lat1 = aRadianes(aLat);
  const lat2 = aRadianes(bLat);
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
  const validas = coordenadas.map(normalizarCoordenadas).filter(Boolean);
  if (!validas.length) return { proyectar: (c) => c };
  const lats = validas.map((c) => c.latitud);
  const lngs = validas.map((c) => c.longitud);
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
    proyectar: (c) => {
      const normalizada = normalizarCoordenadas(c);
      if (!normalizada) return { ...c, x: ancho / 2, y: alto / 2 };
      return {
        ...c,
        x: margen * ancho + ((normalizada.longitud - minLng) / rangoLng) * utilW,
        y: margen * alto + ((maxLat - normalizada.latitud) / rangoLat) * utilH,
      };
    },
  };
}

export function proyectar(coordenadas, ancho, alto, margen = 0.14) {
  const { proyectar: p } = crearProyeccion(coordenadas, ancho, alto, margen);
  return coordenadas.map(p);
}