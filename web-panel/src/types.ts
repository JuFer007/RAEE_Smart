export interface Municipalidad {
  id: number;
  nombre: string;
  distrito: string;
  direccion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  contactoEmail?: string | null;
  activo?: boolean;
  campanasHabilitadas?: boolean;
}

export interface Punto {
  id: number;
  municipalidadId?: number;
  municipalidadNombre?: string;
  nombre: string;
  direccion: string | null;
  latitud: number;
  longitud: number;
  horarioAtencion: string | null;
  capacidadDiaria?: number | null;
}

export interface Campana {
  id: number;
  municipalidadId: number;
  municipalidadNombre: string;
  titulo: string;
  descripcion: string | null;
  lugar: string | null;
  puntoRecoleccionId: number | null;
  puntoRecoleccionNombre: string | null;
  horario: string | null;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  estado: string;
  motivoDesactivacion?: string | null;
  fechaDesactivacion?: string | null;
  desactivadaPor?: string | null;
}

export type EstadoEntrega = 'REGISTRADA' | 'EN_PROCESO' | 'CONFIRMADA' | 'RECHAZADA';

export type RolUsuario = 'CIUDADANO' | 'MUNICIPALIDAD' | 'ADMIN';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  dni: string | null;
  telefono: string | null;
  rol: RolUsuario;
  municipalidadId: number | null;
  municipalidadNombre: string | null;
  municipalidadLatitud: number | null;
  municipalidadLongitud: number | null;
}

export interface Entrega {
  id: number;
  tipoRaee: string;
  nombreCategoriaVisible: string;
  iconoCategoria: string;
  confianzaIa: number;
  clasificacionCorregida: boolean;
  estado: EstadoEntrega;
  puntoRecoleccionId: number;
  puntoRecoleccionNombre: string;
  puntoRecoleccionDireccion: string;
  certificadoCodigoQr: string | null;
  fechaRegistro: string;
  fechaConfirmacion: string | null;
  motivoRechazo: string | null;
  rechazadaPor: string | null;
  fechaRechazo: string | null;
}

export interface Certificado {
  id: number;
  entregaId: number;
  codigoHash: string;
  codigoQr: string;
  qrImagenBase64: string | null;
  tipoAparato: string;
  nombreCategoria: string;
  iconoCategoria: string | null;
  puntoEntregaNombre: string;
  fechaEmision: string;
  fechaEntrega: string;
  urlPdf: string | null;
}

export interface Tendencia {
  sube: boolean;
  texto: string;
}

export interface Resumen {
  total: number;
  certificadas: number;
  enProceso: number;
  pesoTotal: number;
  co2Evitado: number;
  pendientesRevision: number;
}

export interface TipoRaee {
  tipo: string;
  nombre: string;
  icono: string;
}

export interface EstadoClasificadorIa {
  disponible: boolean;
  categorias?: string[];
}

export interface EstadoInfo {
  label: string;
  color: string;
  bg: string;
}

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  email: string;
  dni?: string | null;
  telefono?: string | null;
  rol: RolUsuario;
  municipalidadId?: number | null;
  municipalidadNombre?: string | null;
  activo: boolean;
  ultimoAcceso?: string | null;
  fechaRegistro?: string | null;
}

export interface SatisfaccionDistribucion {
  calificacion: number;
  total: number;
}

export interface SatisfaccionReciente {
  id: number;
  calificacion: number;
  comentario?: string | null;
  fechaRegistro: string;
  fechaActualizacion?: string | null;
  ciudadanoNombre: string;
  municipalidadId: number | null;
  municipalidadNombre: string | null;
}

export interface ResumenSatisfaccion {
  total: number;
  promedio: number | null;
  distribucion: SatisfaccionDistribucion[];
  recientes: SatisfaccionReciente[];
}
