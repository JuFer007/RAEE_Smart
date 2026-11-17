import type { Usuario } from '../types';

export const CENTRO_LAMBAYEQUE: [number, number] = [-6.7714, -79.8409];

const ZOOM_PROVINCIAL = 12;
const ZOOM_DISTRITAL = 14;

export function centroMunicipalidad(usuario: Usuario | null): [number, number] {
  if (
    usuario?.municipalidadLatitud != null &&
    usuario?.municipalidadLongitud != null &&
    Number.isFinite(usuario.municipalidadLatitud) &&
    Number.isFinite(usuario.municipalidadLongitud)
  ) {
    return [usuario.municipalidadLatitud, usuario.municipalidadLongitud];
  }
  return CENTRO_LAMBAYEQUE;
}

export function zoomMunicipalidad(usuario: Usuario | null): number {
  if (!usuario?.municipalidadId) return 11;
  return usuario.municipalidadId === 1 || usuario.municipalidadId === 12
    ? ZOOM_PROVINCIAL
    : ZOOM_DISTRITAL;
}
