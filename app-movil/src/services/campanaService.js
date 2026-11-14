import api from './api';
import { USAR_DATOS_PRUEBA } from '../utils/datosPrueba';
import { CAMPANAS } from '../utils/contenido';
import { MUNICIPALIDAD_POR_DEFECTO } from './puntoService';

export async function listarCampanas(municipalidadId = MUNICIPALIDAD_POR_DEFECTO) {
  if (USAR_DATOS_PRUEBA) {
    return CAMPANAS.filter(
      (campana) => String(campana.municipalidadId) === String(municipalidadId),
    );
  }
  const { data } = await api.get(`/municipalidades/${municipalidadId}/campanas`);
  return data;
}
