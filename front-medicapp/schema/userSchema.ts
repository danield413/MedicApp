// schema/userSchema.ts

import { z } from 'zod';
import { DocType, UserType } from '@/types';

// Esquema para la creación de un usuario.
export const userSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  email: z.string().email('Por favor, ingresa un correo electrónico válido.'),
  docType: z.nativeEnum(DocType, {
    message: 'Debes seleccionar un tipo de documento.',
  }),
  docNum: z.string().min(5, 'El número de documento parece demasiado corto.'),
  userType: z.nativeEnum(UserType, {
    message: 'Debes seleccionar un tipo de usuario.',
  }),
  roleId: z.string().min(1, 'Debes seleccionar un rol.'),
  companyId: z.string().min(1, 'Debes seleccionar una compañía.'),
});

// Esquema para la actualización (hace todos los campos opcionales).
export const updateUserSchema = userSchema.partial().extend({
  password: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.').optional(),
});

export type CreateUserPayload = z.infer<typeof userSchema>;
export type UpdateUserPayload = z.infer<typeof updateUserSchema>;
