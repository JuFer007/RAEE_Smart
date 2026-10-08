/**
 * DATOS DE PRUEBA — solo para revisar la interfaz mientras el backend no está listo.
 *
 * Pon USAR_DATOS_PRUEBA en false (o bórralo) para trabajar con los datos reales
 * de la API. No se envían en ningún momento: solo reemplazan la respuesta local.
 */
import { TIPOS_RAEE } from '../theme';

export const USAR_DATOS_PRUEBA = true;

/**
 * Un punto de acopio por municipalidad distrital de la provincia de Chiclayo.
 * Coordenadas aproximadas (plaza principal de cada distrito) y horarios ilustrativos:
 * no son puntos oficiales. Ajusta latitud/longitud con las reales cuando las tengas.
 */
export const PUNTOS_PRUEBA = [
  {
    id: 'p1',
    nombre: 'Municipalidad de Chiclayo',
    direccion: 'Plaza de Armas de Chiclayo, Chiclayo',
    latitud: -6.7714,
    longitud: -79.8409,
    horarioAtencion: 'Lunes a viernes · 8:00 a 16:30',
  },
  {
    id: 'p2',
    nombre: 'Municipalidad de José Leonardo Ortiz',
    direccion: 'Plaza de Armas de José Leonardo Ortiz',
    latitud: -6.76,
    longitud: -79.837,
    horarioAtencion: 'Lunes a viernes · 8:00 a 16:30',
  },
  {
    id: 'p3',
    nombre: 'Municipalidad de La Victoria',
    direccion: 'Plaza de Armas de La Victoria',
    latitud: -6.781,
    longitud: -79.832,
    horarioAtencion: 'Lunes a viernes · 8:00 a 15:00',
  },
  {
    id: 'p4',
    nombre: 'Municipalidad de Pimentel',
    direccion: 'Plaza de Armas de Pimentel',
    latitud: -6.8369,
    longitud: -79.934,
    horarioAtencion: 'Lunes a sábado · 9:00 a 17:00',
  },
  {
    id: 'p5',
    nombre: 'Municipalidad de Santa Rosa',
    direccion: 'Plaza de Armas de Santa Rosa',
    latitud: -6.8667,
    longitud: -79.95,
    horarioAtencion: 'Lunes a sábado · 10:00 a 18:00',
  },
  {
    id: 'p6',
    nombre: 'Municipalidad de Monsefú',
    direccion: 'Plaza de Armas de Monsefú',
    latitud: -6.8767,
    longitud: -79.8692,
    horarioAtencion: 'Lunes a sábado · 9:00 a 17:00',
  },
  {
    id: 'p7',
    nombre: 'Municipalidad de Reque',
    direccion: 'Plaza de Armas de Reque',
    latitud: -6.8631,
    longitud: -79.8211,
    horarioAtencion: 'Martes, jueves y sábado · 9:00 a 13:00',
  },
  {
    id: 'p8',
    nombre: 'Municipalidad de Eten',
    direccion: 'Plaza de Armas de Eten',
    latitud: -6.9072,
    longitud: -79.8644,
    horarioAtencion: 'Lunes a viernes · 8:30 a 16:30',
  },
  {
    id: 'p9',
    nombre: 'Municipalidad de Puerto Eten',
    direccion: 'Plaza de Armas de Puerto Eten',
    latitud: -6.9417,
    longitud: -79.8647,
    horarioAtencion: 'Lunes a viernes · 8:30 a 16:30',
  },
  {
    id: 'p10',
    nombre: 'Municipalidad de Pomalca',
    direccion: 'Plaza de Armas de Pomalca',
    latitud: -6.7667,
    longitud: -79.7833,
    horarioAtencion: 'Lunes a viernes · 8:00 a 15:00',
  },
  {
    id: 'p11',
    nombre: 'Municipalidad de Tumán',
    direccion: 'Plaza de Armas de Tumán',
    latitud: -6.75,
    longitud: -79.7167,
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
    puntoRecoleccionNombre: 'Municipalidad de Monsefú',
    puntoRecoleccionDireccion: 'Plaza de Armas de Monsefú',
  },
  {
    id: 'e2',
    tipoRaee: 'LAPTOP',
    nombreCategoriaVisible: 'Laptop',
    fechaRegistro: '2026-06-14T16:40:00',
    estado: 'CONFIRMADA',
    certificadoCodigoQr: 'RAEE-2026-CHC-4M9T7B',
    puntoRecoleccionNombre: 'Municipalidad de Santa Rosa',
    puntoRecoleccionDireccion: 'Plaza de Armas de Santa Rosa',
  },
  {
    id: 'e3',
    tipoRaee: 'TELEVISOR',
    nombreCategoriaVisible: 'Televisor de 43 pulgadas',
    fechaRegistro: '2026-04-30T11:05:00',
    estado: 'EN_PROCESO',
    certificadoCodigoQr: null,
    puntoRecoleccionNombre: 'Municipalidad de La Victoria',
    puntoRecoleccionDireccion: 'Plaza de Armas de La Victoria',
  },
  {
    id: 'e4',
    tipoRaee: 'REFRIGERADORA',
    nombreCategoriaVisible: 'Refrigeradora',
    fechaRegistro: '2026-02-08T09:15:00',
    estado: 'CONFIRMADA',
    certificadoCodigoQr: 'RAEE-2026-CHC-1Q7W5N',
    puntoRecoleccionNombre: 'Municipalidad de Pimentel',
    puntoRecoleccionDireccion: 'Plaza de Armas de Pimentel',
  },
  {
    id: 'e5',
    tipoRaee: 'IMPRESORA',
    nombreCategoriaVisible: 'Impresora multifuncional',
    fechaRegistro: '2025-11-12T17:30:00',
    estado: 'CONFIRMADA',
    certificadoCodigoQr: 'RAEE-2025-CHC-6L2H8R',
    puntoRecoleccionNombre: 'Municipalidad de Reque',
    puntoRecoleccionDireccion: 'Plaza de Armas de Reque',
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
