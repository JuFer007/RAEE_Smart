import type { Campana, Certificado, Entrega, Municipalidad, Punto } from '../types';
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

export function cambiarEstadoCampana(id: number, activa: boolean): Promise<Campana> {
  return peticion<Campana>(`/admin/campanas/${id}/activa?valor=${activa}`, {
    method: 'PUT',
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

export function rechazarEntrega(id: number): Promise<Entrega> {
  return peticion<Entrega>(`/entregas/${id}/rechazar`, { method: 'PUT' });
}

export function obtenerCertificado(entregaId: number): Promise<Certificado> {
  return peticion<Certificado>(`/certificados/entrega/${entregaId}`);
}
