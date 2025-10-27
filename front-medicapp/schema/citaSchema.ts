import { z } from 'zod';

// Basado en el schema de Cita del backend
export const citaSchema = z.object({
  especialidad: z.string().min(3, 'La especialidad es muy corta'),
  // Usamos coerce para convertir el input datetime-local a Date
  fechaHora: z.coerce.date({
    required_error: 'La fecha y hora son obligatorias',
    invalid_type_error: 'Formato de fecha y hora inválido',
  })
  .min(new Date(), { message: "La fecha no puede ser en el pasado" }), // Validación extra
  lugar: z.string().min(5, 'El lugar es muy corto'),
  nombreDoctor: z.string().optional(),
  observaciones: z.string().max(300, 'Observaciones demasiado largas').optional(),
  // El 'estado' se asigna por defecto en el backend ('pendiente')
});

export type CitaPayload = z.infer<typeof citaSchema>;