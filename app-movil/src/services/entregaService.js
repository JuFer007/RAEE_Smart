import api from './api';
import {
  USAR_DATOS_PRUEBA,
  completarSimulacion,
  corregirSimulacion,
  historialSimulado,
  simularEntrega,
} from '../utils/datosPrueba';

export async function registrarEntrega({ usuarioId, fotoUri, latitud, longitud }) {
  if (USAR_DATOS_PRUEBA) return simularEntrega();

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
  if (USAR_DATOS_PRUEBA) return corregirSimulacion(tipoCorregido);
  const { data } = await api.put(`/entregas/${entregaId}/corregir`, { tipoCorregido });
  return data;
}

export async function obtenerEntrega(entregaId) {
  if (USAR_DATOS_PRUEBA) {
    const found = historialSimulado().find((e) => String(e.id) === String(entregaId));
    return found || simularEntrega();
  }
  const { data } = await api.get(`/entregas/${entregaId}`);
  return data;
}

export async function listarHistorial(usuarioId) {
  if (USAR_DATOS_PRUEBA) return historialSimulado();
  const { data } = await api.get(`/usuarios/${usuarioId}/entregas`);
  return data;
}