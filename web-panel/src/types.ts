export interface Municipalidad {
  id: number;
  nombre: string;
  distrito: string;
}

export interface Punto {
  id: number;
  municipalidadId?: number;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  horario: string;
  capacidad?: number;
}

export interface Campana {
  id: number;
  municipalidadId: number;
  titulo: string;
  lugar: string;
  horario: string;
  activa: boolean;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  municipalidadId: number;
  municipalidadNombre: string;
  rol: string;
}

export interface Entrega {
  id: number;
  tipoRaee: string;
  nombreCategoriaVisible: string;
  iconoCategoria: string;
  confianzaIa: number;
  clasificacionCorregida: boolean;
  estado: string;
  puntoRecoleccionNombre: string;
  puntoRecoleccionDireccion: string;
  municipalidadId: number;
  certificadoCodigoQr: string | null;
  fechaRegistro: string;
  usuarioNombre: string;
  dni: string;
  pesoKg: number;
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

export interface EstadoInfo {
  label: string;
  color: string;
  bg: string;
}
