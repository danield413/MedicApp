import { z } from 'zod';

// Schema actualizado para coincidir con RegistroConsumo del backend
export const registroConsumoSchema = z.object({
  medicamento: z.string().min(1, 'Debes seleccionar un medicamento'),
  
  // Renombrado a fechaHoraToma y sigue siendo requerido
  fechaHoraToma: z.coerce.date({
    required_error: 'La fecha y hora de toma son obligatorias',
    invalid_type_error: 'Formato de fecha y hora inválido',
  }),
  
  // Descripción ahora es opcional y no tiene validación de longitud mínima
  descripcion: z.string().max(200, 'Descripción demasiado larga').optional(), 
  
  // --- CAMPOS ELIMINADOS ---
  // frecuencia: z.string().optional(), // Ya no es necesario
  // duracion: z.string().optional(),   // Ya no es necesario
  // recordatorio: z.boolean().default(true), // Ya no es necesario
});

// Actualizamos el tipo exportado
export type RegistroConsumoPayload = z.infer<typeof registroConsumoSchema>;

// Puedes mantener el tipo anterior si lo usas en otro lugar, o eliminarlo
// export type HistorialConsumoPayload = z.infer<typeof historialConsumoSchema>; // Nombre antiguo