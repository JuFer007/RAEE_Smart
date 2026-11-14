import api from './api';
import { USAR_DATOS_PRUEBA } from '../utils/datosPrueba';
import { NOTIFICACIONES_PRUEBA } from '../utils/usuarioPrueba';

const PREFERENCIAS_POR_DEFECTO = {
  push: true,
  campanas: true,
  entregas: true,
  recordatorios: false,
};

let avisosPrueba = NOTIFICACIONES_PRUEBA.map((aviso) => ({ ...aviso }));
let preferenciasPrueba = { ...PREFERENCIAS_POR_DEFECTO };

export async function listarNotificaciones() {
  if (USAR_DATOS_PRUEBA) return avisosPrueba.map((aviso) => ({ ...aviso }));
  const { data } = await api.get('/notificaciones/me');
  return data;
}

export async function contarNoLeidas() {
  if (USAR_DATOS_PRUEBA) {
    return avisosPrueba.filter((aviso) => !aviso.leida).length;
  }
  const { data } = await api.get('/notificaciones/no-leidas');
  return data?.noLeidas ?? 0;
}

export async function marcarLeida(id) {
  if (USAR_DATOS_PRUEBA) {
    avisosPrueba = avisosPrueba.map((aviso) =>
      String(aviso.id) === String(id) ? { ...aviso, leida: true } : aviso,
    );
    return;
  }
  await api.patch(`/notificaciones/${id}/leer`);
}

export async function marcarTodasLeidas() {
  if (USAR_DATOS_PRUEBA) {
    avisosPrueba = avisosPrueba.map((aviso) => ({ ...aviso, leida: true }));
    return;
  }
  await api.patch('/notificaciones/leer-todas');
}

export async function obtenerPreferencias() {
  if (USAR_DATOS_PRUEBA) return { ...preferenciasPrueba };
  const { data } = await api.get('/usuarios/me/preferencias-notificaciones');
  return data;
}

export async function actualizarPreferencias(preferencias) {
  if (USAR_DATOS_PRUEBA) {
    preferenciasPrueba = { ...preferenciasPrueba, ...preferencias };
    return { ...preferenciasPrueba };
  }
  const { data } = await api.put('/usuarios/me/preferencias-notificaciones', preferencias);
  return data;
}
