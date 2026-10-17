import { TIPOS_RAEE } from '../theme';

export const MUNICIPALIDADES = [
  { id: 1, nombre: 'Municipalidad Provincial de Chiclayo', distrito: 'Chiclayo' },
  { id: 2, nombre: 'Municipalidad Distrital de José Leonardo Ortiz', distrito: 'José Leonardo Ortiz' },
  { id: 3, nombre: 'Municipalidad Distrital de La Victoria', distrito: 'La Victoria' },
  { id: 4, nombre: 'Municipalidad Distrital de Pimentel', distrito: 'Pimentel' },
  { id: 5, nombre: 'Municipalidad Distrital de Santa Rosa', distrito: 'Santa Rosa' },
  { id: 12, nombre: 'Municipalidad Provincial de Lambayeque', distrito: 'Lambayeque' },
];

export const PUNTOS = [
  { id: 1, municipalidadId: 1, nombre: 'Municipalidad de Chiclayo', direccion: 'Plaza de Armas de Chiclayo', lat: -6.7714, lng: -79.8409, horario: 'Lun a Vie · 8:00 a 16:30', capacidad: 80 },
  { id: 2, municipalidadId: 2, nombre: 'Municipalidad de José Leonardo Ortiz', direccion: 'Plaza de Armas de JLO', lat: -6.76, lng: -79.837, horario: 'Lun a Vie · 8:00 a 16:30', capacidad: 60 },
  { id: 3, municipalidadId: 3, nombre: 'Municipalidad de La Victoria', direccion: 'Plaza de Armas de La Victoria', lat: -6.781, lng: -79.832, horario: 'Lun a Vie · 8:00 a 15:00', capacidad: 50 },
  { id: 4, municipalidadId: 4, nombre: 'Municipalidad de Pimentel', direccion: 'Plaza de Armas de Pimentel', lat: -6.8369, lng: -79.934, horario: 'Lun a Sáb · 9:00 a 17:00', capacidad: 55 },
  { id: 5, municipalidadId: 5, nombre: 'Municipalidad de Santa Rosa', direccion: 'Plaza de Armas de Santa Rosa', lat: -6.8667, lng: -79.95, horario: 'Lun a Sáb · 10:00 a 18:00', capacidad: 45 },
  { id: 23, municipalidadId: 12, nombre: 'Universidad Nacional Pedro Ruiz Gallo', direccion: 'Av. Juan XXIII 391, Lambayeque', lat: -6.7046, lng: -79.9065, horario: 'Lun a Vie · por confirmar', capacidad: 50 },
  { id: 24, municipalidadId: 12, nombre: 'Museo Tumbas Reales de Sipán', direccion: 'Av. Juan Pablo Vizcardo y Guzmán 895', lat: -6.7017, lng: -79.9069, horario: 'Por confirmar', capacidad: 50 },
];

export const CAMPANAS = [
  { id: 1, municipalidadId: 1, titulo: 'Campaña de Reciclaje Electrónico Chiclayo', lugar: 'Plaza de Armas de Chiclayo', horario: 'Sáb y Dom 09:00 - 17:00', activa: true },
  { id: 2, municipalidadId: 1, titulo: 'Eco-Mercado: RAEE en el Mercado Modelo', lugar: 'Zona Mercado Modelo, Chiclayo', horario: 'Lun a Sáb 08:00 - 14:00', activa: true },
  { id: 3, municipalidadId: 2, titulo: 'JLO Recicla Tecnología', lugar: 'Plaza de Armas de José Leonardo Ortiz', horario: 'Lun a Vie 09:00 - 15:00', activa: true },
  { id: 4, municipalidadId: 12, titulo: 'Lambayeque Recicla en la UNPRG', lugar: 'Universidad Nacional Pedro Ruiz Gallo', horario: 'Lun a Vie 09:00 - 15:00', activa: true },
];

const NOMBRES = [
  'Carlos Alberto Ramírez',
  'María Fernanda Quispe',
  'Luis Enrique Sánchez',
  'Ana Lucía Torres',
  'Jorge Luis Chávez',
  'Rosa Elena Vílchez',
  'Pedro Pablo Mendoza',
  'Carmen Rosa Delgado',
  'Miguel Ángel Ríos',
  'Sofía Alejandra Núñez',
];

const ESTADOS = ['CONFIRMADA', 'CONFIRMADA', 'CONFIRMADA', 'EN_PROCESO', 'REGISTRADA', 'RECHAZADA'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function generarEntregas() {
  const total = 64;
  const entregas = [];
  for (let i = 0; i < total; i += 1) {
    const categoria = TIPOS_RAEE[i % TIPOS_RAEE.length];
    const punto = PUNTOS[i % PUNTOS.length];
    const estado = ESTADOS[i % ESTADOS.length];
    const mes = (i % 9) + 1;
    const dia = (i * 3) % 27 + 1;
    const hora = 8 + (i % 9);
    const minuto = (i * 7) % 60;
    const fechaRegistro = `2026-${pad(mes)}-${pad(dia)}T${pad(hora)}:${pad(minuto)}:00`;
    const certificada = estado === 'CONFIRMADA';
    entregas.push({
      id: i + 1,
      tipoRaee: categoria.tipo,
      nombreCategoriaVisible: categoria.nombre,
      iconoCategoria: categoria.icono,
      confianzaIa: Number((0.72 + ((i * 13) % 27) / 100).toFixed(2)),
      clasificacionCorregida: i % 7 === 0,
      estado,
      puntoRecoleccionNombre: punto.nombre,
      puntoRecoleccionDireccion: punto.direccion,
      municipalidadId: punto.municipalidadId,
      certificadoCodigoQr: certificada
        ? `RAEE-2026-CHC-${(1000 + i * 37).toString(36).toUpperCase()}`
        : null,
      fechaRegistro,
      usuarioNombre: NOMBRES[i % NOMBRES.length],
      dni: `76${pad((i * 3) % 100)}${pad((i * 11) % 100)}`,
      pesoKg: Number((3 + ((i * 17) % 40) * 0.6).toFixed(1)),
    });
  }
  return entregas;
}

export const ENTREGAS = generarEntregas();

export const USUARIO_PANEL = {
  id: 1,
  nombre: 'Admin Municipalidad de Chiclayo',
  email: 'admin.chiclayo@raee.com',
  municipalidadId: 1,
  municipalidadNombre: 'Municipalidad Provincial de Chiclayo',
  rol: 'ADMIN',
};

export function formatearFechaHora(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${pad(d.getDate())} ${meses[d.getMonth()]} ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function calcularResumen(entregas) {
  const total = entregas.length;
  const certificadas = entregas.filter((e) => e.estado === 'CONFIRMADA').length;
  const enProceso = entregas.filter((e) => e.estado === 'EN_PROCESO' || e.estado === 'REGISTRADA').length;
  const pesoTotal = entregas.reduce((acc, e) => acc + (e.pesoKg || 0), 0);
  const co2Evitado = pesoTotal * 1.44;
  const pendientesRevision = entregas.filter((e) => e.clasificacionCorregida).length;
  return { total, certificadas, enProceso, pesoTotal, co2Evitado, pendientesRevision };
}

export function contarPorTipo(entregas) {
  return TIPOS_RAEE.map((t) => ({
    tipo: t.tipo,
    nombre: t.nombre,
    icono: t.icono,
    total: entregas.filter((e) => e.tipoRaee === t.tipo).length,
  })).sort((a, b) => b.total - a.total);
}

export function contarPorEstado(entregas) {
  const estados = [
    { estado: 'CONFIRMADA', label: 'Certificadas' },
    { estado: 'EN_PROCESO', label: 'En proceso' },
    { estado: 'REGISTRADA', label: 'Registradas' },
    { estado: 'RECHAZADA', label: 'Rechazadas' },
  ];
  return estados.map((e) => ({
    ...e,
    total: entregas.filter((x) => x.estado === e.estado).length,
  }));
}

export function contarPorMes(entregas) {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return meses.map((label, idx) => ({
    label,
    total: entregas.filter((e) => new Date(e.fechaRegistro).getMonth() === idx).length,
  }));
}

export function contarPorMunicipalidad(entregas) {
  return MUNICIPALIDADES.map((m) => ({
    ...m,
    total: entregas.filter((e) => e.municipalidadId === m.id).length,
  })).sort((a, b) => b.total - a.total);
}

export function convertirACSV(entregas) {
  const cabeceras = [
    'ID',
    'Fecha',
    'Ciudadano',
    'DNI',
    'Categoria',
    'Tipo',
    'Estado',
    'Punto',
    'PesoKg',
    'CodigoCertificado',
  ];
  const filas = entregas.map((e) =>
    [
      e.id,
      e.fechaRegistro,
      e.usuarioNombre,
      e.dni,
      e.nombreCategoriaVisible,
      e.tipoRaee,
      e.estado,
      e.puntoRecoleccionNombre,
      e.pesoKg,
      e.certificadoCodigoQr || '',
    ]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(','),
  );
  return [cabeceras.join(','), ...filas].join('\n');
}
