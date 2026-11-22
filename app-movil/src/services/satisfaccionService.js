import api from './api';
import { USAR_DATOS_PRUEBA } from '../utils/datosPrueba';

let registroSimulado = null;

function errorSimulado(status, mensaje) {
  const error = new Error(mensaje);
  error.response = { status, data: { mensaje } };
  error.normalizado = mensaje;
  return error;
}

function cuerpoValoracion({ calificacion, comentario }) {
  return {
    calificacion: Number(calificacion),
    comentario: typeof comentario === 'string' ? comentario.trim() : '',
  };
}

function crearRegistroSimulado(cuerpo) {
  const ahora = new Date().toISOString();
  return {
    id: 1,
    calificacion: cuerpo.calificacion,
    ...(cuerpo.comentario ? { comentario: cuerpo.comentario } : {}),
    fechaRegistro: ahora,
    fechaActualizacion: ahora,
    ciudadanoNombre: 'Ciudadano de prueba',
    municipalidadId: 1,
    municipalidadNombre: 'Municipalidad de Chiclayo',
  };
}

export function esNoEncontrado(error) {
  return error?.response?.status === 404;
}

export function esConflicto(error) {
  return error?.response?.status === 409 || /ya\s+(registrad|calificad)/i.test(error?.normalizado || '');
}

export async function obtenerMia() {
  if (USAR_DATOS_PRUEBA) {
    if (!registroSimulado) throw errorSimulado(404, 'Todavía no registraste tu valoración.');
    return registroSimulado;
  }

  const { data } = await api.get('/satisfaccion/mia');
  return data;
}

export async function registrar({ calificacion, comentario }) {
  const cuerpo = cuerpoValoracion({ calificacion, comentario });

  if (USAR_DATOS_PRUEBA) {
    if (registroSimulado) throw errorSimulado(409, 'Ya registraste tu valoración.');
    registroSimulado = crearRegistroSimulado(cuerpo);
    return registroSimulado;
  }

  const { data } = await api.post('/satisfaccion', cuerpo);
  return data;
}

export async function actualizar({ calificacion, comentario }) {
  const cuerpo = cuerpoValoracion({ calificacion, comentario });

  if (USAR_DATOS_PRUEBA) {
    if (!registroSimulado) throw errorSimulado(404, 'Todavía no registraste tu valoración.');
    const actualizado = {
      ...registroSimulado,
      calificacion: cuerpo.calificacion,
      fechaActualizacion: new Date().toISOString(),
    };
    if (cuerpo.comentario) {
      actualizado.comentario = cuerpo.comentario;
    } else {
      delete actualizado.comentario;
    }
    registroSimulado = actualizado;
    return registroSimulado;
  }

  const { data } = await api.put('/satisfaccion/mia', cuerpo);
  return data;
}
