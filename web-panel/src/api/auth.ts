import type { Usuario } from '../types';
import { peticion } from './client';

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export function iniciarSesionApi(email: string, password: string): Promise<LoginResponse> {
  return peticion<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function obtenerSesionApi(): Promise<Usuario> {
  return peticion<Usuario>('/auth/me');
}
