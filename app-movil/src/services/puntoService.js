import api from './api';
import { PUNTOS_PRUEBA, USAR_DATOS_PRUEBA } from '../utils/datosPrueba';

export const MUNICIPALIDAD_POR_DEFECTO = 1;

export async function listarPuntos(municipalidadId) {
  if (USAR_DATOS_PRUEBA) return PUNTOS_PRUEBA;
  const ruta =
    municipalidadId == null
      ? '/municipalidades/puntos'
      : `/municipalidades/${municipalidadId}/puntos`;
  const { data } = await api.get(ruta);
  return data;
}
