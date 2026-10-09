export const CREDENCIALES_PRUEBA = {
  email: 'vecino@raee.com',
  password: 'raee2026',
};

export const USUARIO_PRUEBA = {
  id: 1,
  nombre: 'Carlos Alberto Ramírez',
  email: CREDENCIALES_PRUEBA.email,
  telefono: '987654321',
  dni: '76543210',
  direccion: 'Av. Balta 1234, Chiclayo',
  distrito: 'Chiclayo',
  fechaRegistro: '2026-01-15T09:00:00',
};

export const ENTREGAS_PRUEBA = [
  {
    id: 'e1',
    usuarioId: USUARIO_PRUEBA.id,
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
    usuarioId: USUARIO_PRUEBA.id,
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
    usuarioId: USUARIO_PRUEBA.id,
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
    usuarioId: USUARIO_PRUEBA.id,
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
    usuarioId: USUARIO_PRUEBA.id,
    tipoRaee: 'IMPRESORA',
    nombreCategoriaVisible: 'Impresora multifuncional',
    fechaRegistro: '2025-11-12T17:30:00',
    estado: 'CONFIRMADA',
    certificadoCodigoQr: 'RAEE-2025-CHC-6L2H8R',
    puntoRecoleccionNombre: 'Municipalidad de Reque',
    puntoRecoleccionDireccion: 'Plaza de Armas de Reque',
  },
];

export const NOTIFICACIONES_PRUEBA = [
  {
    id: 1,
    titulo: 'Bienvenida a RAEE Smart',
    detalle: 'Hola Carlos, registra la entrega de tus aparatos, obtén tu certificado digital y cuida el planeta.',
    tipo: 'GENERAL',
    leida: false,
    fechaCreacion: '2026-09-01T09:00:00',
  },
  {
    id: 2,
    titulo: 'Entrega certificada',
    detalle: 'Tu Smartphone entregado en Monsefú ya tiene certificado. Código RAEE-2026-CHC-8F3K2P.',
    tipo: 'ENTREGA',
    leida: false,
    fechaCreacion: '2026-08-21T10:30:00',
  },
  {
    id: 3,
    titulo: 'Entrega en proceso',
    detalle: 'Tu televisor entregado en La Victoria está siendo procesado en la planta autorizada.',
    tipo: 'ENTREGA',
    leida: true,
    fechaCreacion: '2026-04-30T11:10:00',
  },
  {
    id: 4,
    titulo: 'Revisa los horarios de los puntos',
    detalle: 'Cada punto de acopio tiene su propio horario de atención. Consérvalo en Horarios y campañas.',
    tipo: 'HORARIO',
    leida: false,
    fechaCreacion: '2026-09-05T08:00:00',
  },
];

export function avisosNuevosPrueba() {
  return NOTIFICACIONES_PRUEBA.filter((aviso) => !aviso.leida).length;
}
