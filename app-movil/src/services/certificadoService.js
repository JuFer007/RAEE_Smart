import api from './api';
import { USAR_DATOS_PRUEBA } from '../utils/datosPrueba';

export async function obtenerPorEntrega(entregaId) {
  if (USAR_DATOS_PRUEBA) return null;
  const { data } = await api.get(`/certificados/entrega/${entregaId}`);
  return data;
}

export function esNoEncontrado(error) {
  return error?.response?.status === 404;
}
