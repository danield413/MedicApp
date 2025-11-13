// front-medicapp/schema/pedidoSchema.ts
import { z } from 'zod';

// Schema para un item de medicamento dentro del pedido
const MedicamentoItemSchema = z.object({
  medicamento: z.string().min(1, 'Debe seleccionar un medicamento'), // ID del medicamento
  cantidad: z.number().min(1, 'La cantidad debe ser al menos 1'),
});

// Schema principal del pedido (para creación/edición)
export const PedidoSchema = z.object({
  medicamentos: z.array(MedicamentoItemSchema).min(1, 'Debe añadir al menos un medicamento'),
  direccionEntrega: z.string().min(5, 'La dirección de entrega es requerida'),
  observaciones: z.string().optional(),
  total: z.number().optional(), // El total podría calcularse en el front o back
});

// Tipo inferido
export type Pedido = z.infer<typeof PedidoSchema>;