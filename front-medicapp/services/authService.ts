// services/authService.ts

import { api } from '@/lib';
import { LoginPayload } from '@/schema';
import { LoginResponse, SuccessResponse } from '@/types';

/**
 * Realiza la petición de login al backend.
 * @param credentials - Email y contraseña del usuario.
 * @returns Los datos del usuario autenticado y sus permisos.
 */
export const login = async (credentials: LoginPayload): Promise<SuccessResponse<LoginResponse>> => {
  return api.post<SuccessResponse<LoginResponse>>('/auth/login', credentials);
};

/**
 * Realiza la petición para cerrar la sesión del usuario en el backend.
 */
export const logout = async (): Promise<void> => {
  return api.post<void>('/auth/logout');
};
