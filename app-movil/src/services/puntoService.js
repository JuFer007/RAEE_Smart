import api from './api';
import { esDemo } from '../utils/demo';
import { PUNTOS_DEMO } from '../utils/mockData';

const MUNICIPALIDAD_POR_DEFECTO = 1;
const DEMORA_DEMO = 600;

function esperarDemo() {
  return new Promise((resolve) => setTimeout(resolve, DEMORA_DEMO));
}

export async function listarPuntos(municipalidadId = MUNICIPALIDAD_POR_DEFECTO) {
  if (esDemo()) {
    await esperarDemo();
    return PUNTOS_DEMO;
  }

  const { data } = await api.get(`/municipalidades/${municipalidadId}/puntos`);
  return data.map((p) => ({ ...p, direccion: p.direccion || p.horarioAtencion }));
}