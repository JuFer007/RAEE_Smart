// Datos de prueba con la misma forma que devuelve el backend Spring (USE_MOCK=true)
const TIPOS = {
  TELEVISOR: 'Televisor', TABLET: 'Tablet', CELULAR: 'Celular', EQUIPO_DE_SONIDO: 'Equipo de sonido',
  LAPTOP: 'Laptop', REFRIGERADORA: 'Refrigeradora', IMPRESORA: 'Impresora',
  PEQUENO_ELECTRODOMESTICO: 'Pequeño electrodoméstico',
};
const MUNIS = [
  { id: 1, nombre: 'Municipalidad de Chiclayo', distrito: 'Chiclayo', direccion: 'Plaza de Armas de Chiclayo', contactoEmail: 'raee@municichiclayo.gob.pe', activo: true,
    puntos: [{ id: 11, nombre: 'Plaza de Armas', direccion: 'Plaza de Armas de Chiclayo', horarioAtencion: 'Lunes a viernes · 8:00 a 16:30', capacidadDiaria: 40 },
             { id: 12, nombre: 'Mercado Moshoqueque', direccion: 'Av. Chiclayo 1200', horarioAtencion: 'Lunes a sábado · 9:00 a 17:00', capacidadDiaria: 25 }] },
  { id: 2, nombre: 'Municipalidad de José Leonardo Ortiz', distrito: 'José Leonardo Ortiz', direccion: 'Plaza de Armas de José Leonardo Ortiz', contactoEmail: 'raee@mdjlo.gob.pe', activo: true,
    puntos: [{ id: 21, nombre: 'Parque Principal', direccion: 'Plaza de Armas de José Leonardo Ortiz', horarioAtencion: 'Lunes a viernes · 8:00 a 16:30', capacidadDiaria: 30 }] },
  { id: 3, nombre: 'Municipalidad de Pimentel', distrito: 'Pimentel', direccion: 'Plaza de Armas de Pimentel', contactoEmail: null, activo: false,
    puntos: [{ id: 31, nombre: 'Malecón de Pimentel', direccion: 'Plaza de Armas de Pimentel', horarioAtencion: 'Lunes a sábado · 9:00 a 17:00', capacidadDiaria: 20 }] },
];
const ESTADOS = ['CONFIRMADA', 'CONFIRMADA', 'CONFIRMADA', 'EN_PROCESO', 'RECHAZADA', 'REGISTRADA'];
const claves = Object.keys(TIPOS);

const buscar = (id) => {
  const m = MUNIS.find((x) => x.id === Number(id));
  if (!m) { const e = new Error('Municipalidad no encontrada'); e.status = 404; throw e; }
  return m;
};

exports.municipalidades = async () => MUNIS.map(({ puntos, ...m }) => m);

exports.puntos = async (id) =>
  buscar(id).puntos.map((p) => ({ ...p, municipalidadId: Number(id), municipalidadNombre: buscar(id).nombre }));

exports.entregas = async (id) => {
  const m = buscar(id);
  return Array.from({ length: 20 + m.id * 9 }, (_, i) => {
    const estado = ESTADOS[(i * 7 + m.id) % ESTADOS.length];
    const tipo = claves[(i * 3 + m.id) % claves.length];
    const punto = m.puntos[i % m.puntos.length];
    const reg = new Date(Date.UTC(2026, 6 + (i % 4), 1 + ((i * 5) % 27), 15));
    return {
      id: m.id * 1000 + i + 1,
      tipoRaee: tipo,
      nombreCategoriaVisible: TIPOS[tipo],
      confianzaIa: 0.62 + ((i * 13) % 37) / 100,
      clasificacionCorregida: i % 9 === 0,
      estado,
      puntoRecoleccionId: punto.id,
      puntoRecoleccionNombre: punto.nombre,
      puntoRecoleccionDireccion: punto.direccion,
      certificadoCodigoQr: estado === 'CONFIRMADA'
        ? `http://localhost:8080/api/certificados/verificar/${(m.id * 7919 + i * 104729).toString(16).padStart(8, '0')}-4c1e-9b7a-0f3d2a6e8c11` : null,
      fechaRegistro: reg.toISOString(),
      fechaConfirmacion: estado === 'CONFIRMADA' ? new Date(reg.getTime() + 2 * 86400000).toISOString() : null,
    };
  });
};
