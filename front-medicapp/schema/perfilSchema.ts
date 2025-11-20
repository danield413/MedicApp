// front-medicapp/schema/perfilSchema.ts
import { z } from 'zod';

// Basado en la imagen y el schema de usuario
export const InfoBasicaSchema = z.object({
  nombre: z.string().min(2, 'El nombre es muy corto'),
  apellidos: z.string().min(2, 'El apellido es muy corto'),
  celular: z.string()
    .regex(/^[0-9]+$/, 'Solo números permitidos'),
  fechaNacimiento: z.string().optional(), // El input type="date" devuelve string
  ciudadNacimiento: z.string().optional(),
  ciudadResidencia: z.string().optional(),
  direccion: z.string().optional(),
  tipoSangre: z.string().optional(), // Podría ser un enum
});

export const ResumenMedicoSchema = z.object({
  descripcion: z.string().max(5000, 'Resumen muy largo').optional(), // Permitir vacío
});

export type InfoBasica = z.infer<typeof InfoBasicaSchema>;
export type ResumenMedico = z.infer<typeof ResumenMedicoSchema>;