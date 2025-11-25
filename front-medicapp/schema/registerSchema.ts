import { z } from 'zod';

export const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre es demasiado corto'),
  apellidos: z.string().min(2, 'El apellido es demasiado corto'),
  cedula: z.string()
    .min(1, 'La cédula es obligatoria')
    .regex(/^[0-9]+$/, 'La cédula solo debe contener números'),
  celular: z.string()
    .min(1, 'El celular es obligatorio')
    .regex(/^[0-9]+$/, 'El celular solo debe contener números'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmarContrasena: z.string().min(6, 'Debes confirmar la contraseña'),
})
.refine((data) => data.contrasena === data.confirmarContrasena, {
  message: "Las contraseñas no coinciden",
  path: ["confirmarContrasena"], 
});

export type RegisterPayload = z.infer<typeof registerSchema>;