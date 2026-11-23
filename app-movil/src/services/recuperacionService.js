import api from './api';
import { USAR_DATOS_PRUEBA } from '../utils/datosPrueba';

const CODIGO_DEMO = '123456';
const MENSAJE_GENERICO = 'Si la cuenta existe, te enviamos un código de 6 dígitos.';

function crearError(mensaje) {
  const error = new Error(mensaje);
  error.normalizado = mensaje;
  return error;
}

export async function solicitarCodigo(email) {
  if (USAR_DATOS_PRUEBA) {
    return { mensaje: MENSAJE_GENERICO };
  }
  const { data } = await api.post('/auth/recuperar-password', { email });
  return data;
}

export async function reenviarCodigo(email) {
  if (USAR_DATOS_PRUEBA) {
    return { mensaje: 'Te enviamos un nuevo código.' };
  }
  const { data } = await api.post('/auth/reenviar-codigo', { email });
  return data;
}

export async function verificarCodigo(email, codigo) {
  if (USAR_DATOS_PRUEBA) {
    if (codigo !== CODIGO_DEMO) {
      throw crearError('Código inválido o expirado.');
    }
    return { ok: true };
  }
  const { data } = await api.post('/auth/verificar-codigo', { email, codigo });
  return data;
}

export async function restablecerPassword(email, codigo, passwordNueva) {
  if (USAR_DATOS_PRUEBA) {
    if (codigo !== CODIGO_DEMO) {
      throw crearError('Código inválido o expirado.');
    }
    return { ok: true };
  }
  const { data } = await api.post('/auth/restablecer-password', { email, codigo, passwordNueva });
  return data;
}
