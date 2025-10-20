import { z } from 'zod';

// Definimos el nuevo esquema con 'cedula'
export const loginSchema = z.object({
  cedula: z.string()
    .min(1, 'La cédula es obligatoria')
    .regex(/^[0-9]+$/, 'La cédula solo debe contener números'),
  
  contrasena: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// El tipo se actualiza automáticamente
export type LoginPayload = z.infer<typeof loginSchema>;