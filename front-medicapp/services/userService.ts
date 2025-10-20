// services/userService.ts

import { api } from '@/lib';
import { CreateUserPayload, UpdateUserPayload } from '@/schema';
import { User, SuccessResponse } from '@/types';

/**
 * Obtiene todos los usuarios de la compañía del usuario actual.
 */
export const getAllUsers = async (): Promise<User[]> => {
  return api.get<SuccessResponse<User[]>>('/users') as any;
};

/**
 * Obtiene un usuario específico por su ID.
 * @param id - El ID del usuario.
 */
export const getUserById = async (id: string): Promise<SuccessResponse<User>> => {
  return api.get<SuccessResponse<User>>(`/users/${id}`);
};

/**
 * Crea un nuevo usuario.
 * @param data - Los datos del usuario a crear.
 */
export const createUser = async (data: CreateUserPayload): Promise<SuccessResponse<User>> => {
  console.log('Creating user with data (service):', data);
  return api.post<SuccessResponse<User>>('/users', data);
};

/**
 * Actualiza un usuario existente.
 * @param id - El ID del usuario a actualizar.
 * @param data - Los datos a modificar.
 */
export const updateUser = async (
  id: string,
  data: UpdateUserPayload
): Promise<SuccessResponse<User>> => {
  return api.put<SuccessResponse<User>>(`/users/${id}`, data);
};

/**
 * Desactiva (borrado lógico) un usuario por su ID.
 * @param id - El ID del usuario a desactivar.
 */
export const deleteUser = async (id: string): Promise<SuccessResponse<User>> => {
  return api.del<SuccessResponse<User>>(`/users/${id}`);
};
