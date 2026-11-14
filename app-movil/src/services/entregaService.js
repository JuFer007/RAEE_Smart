import { Platform } from 'react-native';
import api from './api';
import {
  USAR_DATOS_PRUEBA,
  corregirSimulacion,
  historialSimulado,
  simularEntrega,
} from '../utils/datosPrueba';

async function agregarFoto(formData, fotoUri) {
  if (Platform.OS === 'web') {
    const respuesta = await fetch(fotoUri);
    const blob = await respuesta.blob();
    formData.append('foto', blob, 'raee.jpg');
    return;
  }
  formData.append('foto', {
    uri: fotoUri,
    name: 'raee.jpg',
    type: 'image/jpeg',
  });
}

function configMultipart() {
  return Platform.OS === 'web'
    ? {}
    : { headers: { 'Content-Type': 'multipart/form-data' } };
}

function normalizarClasificacion(data) {
  return {
    id: null,
    tipoRaee: data?.tipoDetectado ?? data?.tipoRaee ?? null,
    nombreCategoriaVisible: data?.nombreCategoriaVisible ?? null,
    confianzaIa: data?.confianza ?? data?.confianzaIa ?? 0,
    clasificacionCorregida: false,
    alternativas: data?.alternativas ?? data?.top3 ?? [],
    tiempoInferenciaMs: data?.tiempoInferenciaMs ?? null,
  };
}

export async function identificarAparato({ fotoUri }) {
  if (USAR_DATOS_PRUEBA) return simularEntrega();

  const formData = new FormData();
  await agregarFoto(formData, fotoUri);

  const { data } = await api.post('/clasificaciones', formData, configMultipart());
  return normalizarClasificacion(data);
}

export async function registrarEntrega({ puntoRecoleccionId, fotoUri, latitud, longitud }) {
  if (USAR_DATOS_PRUEBA) return simularEntrega();

  const formData = new FormData();
  if (puntoRecoleccionId != null) {
    formData.append('puntoRecoleccionId', String(puntoRecoleccionId));
  }
  formData.append('latitud', String(latitud));
  formData.append('longitud', String(longitud));
  await agregarFoto(formData, fotoUri);

  const { data } = await api.post('/entregas', formData, configMultipart());
  return data;
}

export async function confirmarEntrega(entregaId) {
  if (USAR_DATOS_PRUEBA) return obtenerEntrega(entregaId);
  const { data } = await api.put(`/entregas/${entregaId}/confirmar`);
  return data;
}

export async function rechazarEntrega(entregaId) {
  if (USAR_DATOS_PRUEBA) return obtenerEntrega(entregaId);
  const { data } = await api.put(`/entregas/${entregaId}/rechazar`);
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
  if (USAR_DATOS_PRUEBA) return historialSimulado(usuarioId);
  const { data } = await api.get(`/usuarios/${usuarioId}/entregas`);
  return data;
}