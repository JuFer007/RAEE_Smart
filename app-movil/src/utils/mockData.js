const CHICLAYO = { latitud: -6.7755, longitud: -79.8345 };

export const UBICACION_DEMO = CHICLAYO;

export const PUNTOS_DEMO = [
  {
    id: 1,
    nombre: 'Municipalidad Provincial de Chiclayo',
    direccion: 'Av. Balta 123, Chiclayo',
    latitud: -6.7714,
    longitud: -79.8409,
    horarioAtencion: 'Lun a Vie · 08:00 - 17:00',
  },
  {
    id: 2,
    nombre: 'Centro de acopio Real Plaza',
    direccion: 'Av. Sáenz Peña 1200',
    latitud: -6.7894,
    longitud: -79.8236,
    horarioAtencion: 'Sáb · 09:00 - 13:00',
  },
  {
    id: 3,
    nombre: 'Punto Verde Mercado Modelo',
    direccion: 'Calle Ruiz 456',
    latitud: -6.7813,
    longitud: -79.8025,
    horarioAtencion: 'Mar y Jue · 08:30 - 12:30',
  },
  {
    id: 4,
    nombre: 'Punto Verde Tosillo',
    direccion: 'Jr. Los Pinos 245',
    latitud: -6.7786,
    longitud: -79.8558,
    horarioAtencion: 'Mié · 15:00 - 18:00',
  },
];

export const USUARIO_DEMO = {
  id: 1,
  nombre: 'Juan Pérez',
  email: 'juan@gmail.com',
  telefono: '999888777',
  rol: 'CIUDADANO',
};

export const PROGRESO_DEMO = { entregados: 2, meta: 5 };

export const ENTREGA_DEMO = {
  id: 101,
  tipoRaee: 'CELULAR',
  nombreCategoriaVisible: 'Smartphone',
  confianzaIa: 0.92,
  clasificacionCorregida: false,
  estado: 'CONFIRMADA',
  puntoRecoleccionId: 1,
  puntoRecoleccionNombre: 'Municipalidad Provincial de Chiclayo',
  puntoRecoleccionDireccion: 'Av. Balta 123, Chiclayo',
  certificadoCodigoQr: '8F3A-207E-9C4B',
  fechaRegistro: '2026-09-25T10:24:00',
};

export const ENTREGAS_DEMO = [
  ENTREGA_DEMO,
  {
    id: 102,
    tipoRaee: 'LAPTOP',
    nombreCategoriaVisible: 'Laptop',
    confianzaIa: 0.88,
    clasificacionCorregida: true,
    estado: 'CONFIRMADA',
    puntoRecoleccionId: 2,
    puntoRecoleccionNombre: 'Centro de acopio Real Plaza',
    puntoRecoleccionDireccion: 'Av. Sáenz Peña 1200',
    certificadoCodigoQr: '8F3A-207E-9C4B',
    fechaRegistro: '2026-08-18T09:12:00',
  },
  {
    id: 103,
    tipoRaee: 'IMPRESORA',
    nombreCategoriaVisible: 'Impresora',
    confianzaIa: 0.71,
    clasificacionCorregida: false,
    estado: 'EN_PROCESO',
    puntoRecoleccionId: 3,
    puntoRecoleccionNombre: 'Punto Verde Mercado Modelo',
    puntoRecoleccionDireccion: 'Calle Ruiz 456',
    certificadoCodigoQr: null,
    fechaRegistro: '2026-07-10T11:33:00',
  },
  {
    id: 104,
    tipoRaee: 'REFRIGERADORA',
    nombreCategoriaVisible: 'Refrigeradora',
    confianzaIa: 0.97,
    clasificacionCorregida: false,
    estado: 'CONFIRMADA',
    puntoRecoleccionId: 4,
    puntoRecoleccionNombre: 'Punto Verde Tosillo',
    puntoRecoleccionDireccion: 'Jr. Los Pinos 245',
    certificadoCodigoQr: '8F3A-207E-9C4B',
    fechaRegistro: '2026-05-22T16:05:00',
  },
  {
    id: 105,
    tipoRaee: 'TELEVISOR',
    nombreCategoriaVisible: 'Televisor',
    confianzaIa: 0.83,
    clasificacionCorregida: false,
    estado: 'EN_PROCESO',
    puntoRecoleccionId: 1,
    puntoRecoleccionNombre: 'Municipalidad Provincial de Chiclayo',
    puntoRecoleccionDireccion: 'Av. Balta 123, Chiclayo',
    certificadoCodigoQr: null,
    fechaRegistro: '2026-10-02T09:40:00',
  },
];