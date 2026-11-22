import type {
  Campana,
  Certificado,
  Entrega,
  EstadoClasificadorIa,
  Municipalidad,
  Punto,
  ResumenSatisfaccion,
  RolUsuario,
  UsuarioAdmin,
} from '../types';
import { peticion } from './client';

export interface PuntoPayload {
  municipalidadId: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  horarioAtencion: string;
  capacidadDiaria: number | null;
}

export interface MunicipalidadPayload {
  nombre: string;
  distrito: string;
  direccion: string;
  latitud: number;
  longitud: number;
  contactoEmail: string;
  activo: boolean;
  campanasHabilitadas: boolean;
}

export interface CampanaPayload {
  municipalidadId: number;
  titulo: string;
  descripcion: string;
  lugar: string;
  puntoRecoleccionId: number;
  horario: string;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  motivoDesactivacion?: string;
}

export interface FiltrosUsuarios {
  municipalidadId?: number | null;
  rol?: RolUsuario;
  activo?: boolean;
  q?: string;
}

export interface UsuarioPayload {
  nombre: string;
  email: string;
  dni?: string | null;
  telefono?: string | null;
  rol: RolUsuario;
  municipalidadId?: number | null;
  activo?: boolean;
}

export interface CrearUsuarioPayload extends UsuarioPayload {
  password: string;
}

function construirQuery(parametros: Record<string, string | number | boolean | null | undefined>): string {
  const consulta = new URLSearchParams();
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor === undefined || valor === null || valor === '') return;
    consulta.set(clave, String(valor));
  });
  const texto = consulta.toString();
  return texto ? `?${texto}` : '';
}

export function listarMunicipalidades(): Promise<Municipalidad[]> {
  return peticion<Municipalidad[]>('/admin/municipalidades');
}

export function crearMunicipalidad(payload: MunicipalidadPayload): Promise<Municipalidad> {
  return peticion<Municipalidad>('/admin/municipalidades', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function actualizarMunicipalidad(
  id: number,
  payload: MunicipalidadPayload,
): Promise<Municipalidad> {
  return peticion<Municipalidad>(`/admin/municipalidades/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function cambiarEstadoMunicipalidad(
  id: number,
  activo: boolean,
): Promise<Municipalidad> {
  return peticion<Municipalidad>(`/admin/municipalidades/${id}/activo?valor=${activo}`, {
    method: 'PUT',
  });
}

export function listarPuntos(): Promise<Punto[]> {
  return peticion<Punto[]>('/admin/puntos');
}

export function crearPunto(payload: PuntoPayload): Promise<Punto> {
  return peticion<Punto>('/admin/puntos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function actualizarPunto(id: number, payload: PuntoPayload): Promise<Punto> {
  return peticion<Punto>(`/admin/puntos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function eliminarPunto(id: number): Promise<void> {
  return peticion<void>(`/admin/puntos/${id}`, { method: 'DELETE' });
}

export function listarCampanas(): Promise<Campana[]> {
  return peticion<Campana[]>('/admin/campanas');
}

export function crearCampana(payload: CampanaPayload): Promise<Campana> {
  return peticion<Campana>('/admin/campanas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function actualizarCampana(id: number, payload: CampanaPayload): Promise<Campana> {
  return peticion<Campana>(`/admin/campanas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function cambiarEstadoCampana(
  id: number,
  activa: boolean,
  motivo?: string,
): Promise<Campana> {
  return peticion<Campana>(`/admin/campanas/${id}/activa?valor=${activa}`, {
    method: 'PUT',
    ...(motivo ? { body: JSON.stringify({ motivoDesactivacion: motivo }) } : {}),
  });
}

export function eliminarCampana(id: number): Promise<void> {
  return peticion<void>(`/admin/campanas/${id}`, { method: 'DELETE' });
}

export function listarEntregas(municipalidadId: number): Promise<Entrega[]> {
  return peticion<Entrega[]>(`/reportes/municipalidad/${municipalidadId}`);
}

export function confirmarEntrega(id: number): Promise<Entrega> {
  return peticion<Entrega>(`/entregas/${id}/confirmar`, { method: 'PUT' });
}

export function rechazarEntrega(id: number, motivo: string): Promise<Entrega> {
  return peticion<Entrega>(`/entregas/${id}/rechazar`, {
    method: 'PUT',
    body: JSON.stringify({ motivo }),
  });
}

export function obtenerCertificado(entregaId: number): Promise<Certificado> {
  return peticion<Certificado>(`/certificados/entrega/${entregaId}`);
}

export function verificarCertificado(codigoHash: string): Promise<Certificado> {
  return peticion<Certificado>(`/certificados/verificar/${encodeURIComponent(codigoHash)}`);
}

export function obtenerEstadoClasificador(): Promise<EstadoClasificadorIa> {
  return peticion<EstadoClasificadorIa>('/clasificaciones/estado');
}

export function listarUsuarios(filtros: FiltrosUsuarios = {}): Promise<UsuarioAdmin[]> {
  const query = construirQuery({
    municipalidadId: filtros.municipalidadId,
    rol: filtros.rol,
    activo: filtros.activo,
    q: filtros.q?.trim(),
  });
  return peticion<UsuarioAdmin[]>(`/admin/usuarios${query}`);
}

export function crearUsuario(payload: CrearUsuarioPayload): Promise<UsuarioAdmin> {
  return peticion<UsuarioAdmin>('/admin/usuarios', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function actualizarUsuario(
  id: number,
  payload: UsuarioPayload,
): Promise<UsuarioAdmin> {
  return peticion<UsuarioAdmin>(`/admin/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function cambiarEstadoUsuario(id: number, valor: boolean): Promise<UsuarioAdmin> {
  return peticion<UsuarioAdmin>(`/admin/usuarios/${id}/estado${construirQuery({ valor })}`, {
    method: 'PUT',
  });
}

export function cambiarPasswordUsuario(id: number, passwordNueva: string): Promise<void> {
  return peticion<void>(`/admin/usuarios/${id}/password`, {
    method: 'PUT',
    body: JSON.stringify({ passwordNueva }),
  });
}

export function obtenerSatisfaccion(
  municipalidadId?: number | null,
): Promise<ResumenSatisfaccion> {
  const query = construirQuery({ municipalidadId });
  return peticion<ResumenSatisfaccion>(`/admin/satisfaccion${query}`);
}
