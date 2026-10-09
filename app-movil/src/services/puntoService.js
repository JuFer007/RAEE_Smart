import api from './api';
import { PUNTOS_PRUEBA, USAR_DATOS_PRUEBA } from '../utils/datosPrueba';

const MUNICIPALIDAD_POR_DEFECTO = 1;

export async function listarPuntos(municipalidadId = MUNICIPALIDAD_POR_DEFECTO) {
  if (USAR_DATOS_PRUEBA) return PUNTOS_PRUEBA;
  const { data } = await api.get(`/municipalidades/${municipalidadId}/puntos`);
  return data;
}