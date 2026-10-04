import api from './api';
import { esDemo } from '../utils/demo';
import { obtenerInfoTipo } from '../theme';
import { ENTREGAS_DEMO, ENTREGA_DEMO } from '../utils/mockData';

const DEMORA_DEMO = 600;

function esperarDemo() {
  return new Promise((resolve) => setTimeout(resolve, DEMORA_DEMO));
}

export async function registrarEntrega({ usuarioId, fotoUri, latitud, longitud }) {
  if (esDemo()) {
    await esperarDemo();
    return { ...ENTREGA_DEMO };
  }

  const formData = new FormData();
  formData.append('usuarioId', String(usuarioId));
  formData.append('latitud', String(latitud));
  formData.append('longitud', String(longitud));
  formData.append('foto', {
    uri: fotoUri,
    name: 'raee.jpg',
    type: 'image/jpeg',
  });

  const { data } = await api.post('/entregas', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function corregirClasificacion(entregaId, tipoCorregido) {
  if (esDemo()) {
    await esperarDemo();
    const base = ENTREGAS_DEMO.find((e) => String(e.id) === String(entregaId)) || ENTREGA_DEMO;
    return {
      ...base,
      tipoRaee: tipoCorregido,
      nombreCategoriaVisible: obtenerInfoTipo(tipoCorregido).nombre,
      clasificacionCorregida: true,
    };
  }

  const { data } = await api.put(`/entregas/${entregaId}/corregir`, { tipoCorregido });
  return data;
}

export async function obtenerEntrega(entregaId) {
  const { data } = await api.get(`/entregas/${entregaId}`);
  return data;
}

export async function listarHistorial(usuarioId) {
  if (esDemo()) {
    await esperarDemo();
    return ENTREGAS_DEMO;
  }

  const { data } = await api.get(`/usuarios/${usuarioId}/entregas`);
  return data;
}