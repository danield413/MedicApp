import { z } from 'zod';

// Basado en el schema de Dosis del backend
export const dosisSchema = z.object({
  medicamento: z.string().min(1, 'Debes seleccionar un medicamento'),
  cantidadDiaria: z.coerce.number() // coerce convierte el string del input a número
    .min(1, 'La cantidad debe ser al menos 1'),
  descripcion: z.string().min(5, 'La descripción es muy corta (ej. "1 tableta cada 8 horas")'),
  unidadMedida: z.string().optional(),
  frecuencia: z.string().optional(),
});

export type DosisPayload = z.infer<typeof dosisSchema>;