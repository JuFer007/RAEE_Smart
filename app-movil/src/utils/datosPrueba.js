/**
 * DATOS DE PRUEBA — solo para revisar la interfaz mientras el backend no está listo.
 *
 * Pon USAR_DATOS_PRUEBA en false (o bórralo) para trabajar con los datos reales
 * de la API. No se envían en ningún momento: solo reemplazan la respuesta local.
 */
import { TIPOS_RAEE } from '../theme';

export const USAR_DATOS_PRUEBA = true;

/** Direcciones ilustrativas, no son puntos oficiales de la Municipalidad. */
export const PUNTOS_PRUEBA = [
  {
    id: 'p1',
    nombre: 'Centro de Acopio · Monsefú',
    direccion: 'Av. Perú 1245, Monsefú',
    latitud: -6.7739,
    longitud: -79.8082,
    horarioAtencion: 'Lunes a sábado · 9:00 a 17:00',
  },
  {
    id: 'p2',
    nombre: 'Centro de Acopio · Ciudad de Dios',
    direccion: 'Av. Los Pinos 320, Ciudad de Dios',
    latitud: -6.7901,
    longitud: -79.7854,
    horarioAtencion: 'Lunes a viernes · 8:30 a 16:30',
  },
  {
    id: 'p3',
    nombre: 'Centro de Acopio · Pueblo Libre',
    direccion: 'Ca. Los Álamos 118, Pueblo Libre',
    latitud: -6.7564,
    longitud: -79.7915,
    horarioAtencion: 'Martes, jueves y sábado · 9:00 a 13:00',
  },
  {
    id: 'p4',
    nombre: 'Centro de Acopio · Santa Rosa',
    direccion: 'Av. Bolognesi 890, Santa Rosa',
    latitud: -6.7798,
    longitud: -79.7418,
    horarioAtencion: 'Lunes a sábado · 10:00 a 18:00',
  },
  {
    id: 'p5',
    nombre: 'Centro de Acopio · La Victoria',
    direccion: 'Av. Balta 455, La Victoria',
    latitud: -6.7661,
    longitud: -79.7834,
    horarioAtencion: 'Lunes a viernes · 8:00 a 15:00',
  },
];

export const ENTREGAS_PRUEBA = [
  {
    id: 'e1',
    tipoRaee: 'CELULAR',
    nombreCategoriaVisible: 'Smartphone',
    fechaRegistro: '2026-08-21T10:24:00',
    estado: 'CONFIRMADA',
    certificadoCodigoQr: 'RAEE-2026-CHC-8F3K2P',
    puntoRecoleccionNombre: 'Centro de Acopio · Monsefú',
    puntoRecoleccionDireccion: 'Av. Perú 1245, Monsefú',
  },
  {
    id: 'e2',
    tipoRaee: 'LAPTOP',
    nombreCategoriaVisible: 'Laptop',
    fechaRegistro: '2026-06-14T16:40:00',
    estado: 'CONFIRMADA',
    certificadoCodigoQr: 'RAEE-2026-CHC-4M9T7B',
    puntoRecoleccionNombre: 'Centro de Acopio · Santa Rosa',
    puntoRecoleccionDireccion: 'Av. Bolognesi 890, Santa Rosa',
  },
  {
    id: 'e3',
    tipoRaee: 'TELEVISOR',
    nombreCategoriaVisible: 'Televisor de 43 pulgadas',
    fechaRegistro: '2026-04-30T11:05:00',
    estado: 'EN_PROCESO',
    certificadoCodigoQr: null,
    puntoRecoleccionNombre: 'Centro de Acopio · La Victoria',
    puntoRecoleccionDireccion: 'Av. Balta 455, La Victoria',
  },
  {
    id: 'e4',
    tipoRaee: 'REFRIGERADORA',
    nombreCategoriaVisible: 'Refrigeradora',
    fechaRegistro: '2026-02-08T09:15:00',
    estado: 'CONFIRMADA',
    certificadoCodigoQr: 'RAEE-2026-CHC-1Q7W5N',
    puntoRecoleccionNombre: 'Centro de Acopio · Ciudad de Dios',
    puntoRecoleccionDireccion: 'Av. Los Pinos 320, Ciudad de Dios',
  },
  {
    id: 'e5',
    tipoRaee: 'IMPRESORA',
    nombreCategoriaVisible: 'Impresora multifuncional',
    fechaRegistro: '2025-11-12T17:30:00',
    estado: 'CONFIRMADA',
    certificadoCodigoQr: 'RAEE-2025-CHC-6L2H8R',
    puntoRecoleccionNombre: 'Centro de Acopio · Pueblo Libre',
    puntoRecoleccionDireccion: 'Ca. Los Álamos 118, Pueblo Libre',
  },
];

/* ------------------------------------------------------------------ *
 * Flujo simulado: permite recorrer Captura → Resultado → Entrega →
 * Confirmación → Certificado sin cámara real ni backend.
 * ------------------------------------------------------------------ */

const entregasCreadas = [];
let entregaActual = null;
let turno = 0;

export function simularEntrega() {
  const tipo = TIPOS_RAEE[turno % TIPOS_RAEE.length];
  turno += 1;

  entregaActual = {
    id: `sim-${Date.now()}`,
    tipoRaee: tipo.tipo,
    nombreCategoriaVisible: null,
    confianzaIa: Number((0.74 + Math.random() * 0.23).toFixed(2)),
    fechaRegistro: new Date().toISOString(),
    estado: 'REGISTRADA',
    certificadoCodigoQr: null,
    clasificacionCorregida: false,
    puntoRecoleccionId: null,
    puntoRecoleccionNombre: null,
    puntoRecoleccionDireccion: null,
  };

  return entregaActual;
}

export function corregirSimulacion(tipoCorregido) {
  if (!entregaActual) return simularEntrega();

  entregaActual = {
    ...entregaActual,
    tipoRaee: tipoCorregido,
    nombreCategoriaVisible: null,
    clasificacionCorregida: true,
  };

  return entregaActual;
}

export function completarSimulacion(entrega) {
  const codigo = `RAEE-${new Date().getFullYear()}-CHC-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

  entregaActual = {
    ...entrega,
    estado: 'CONFIRMADA',
    certificadoCodigoQr: codigo,
    fechaConfirmacion: new Date().toISOString(),
  };

  entregasCreadas.unshift(entregaActual);
  return entregaActual;
}

export function historialSimulado() {
  return [...entregasCreadas, ...ENTREGAS_PRUEBA];
}