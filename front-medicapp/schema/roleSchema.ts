// schema/roleSchema.ts

import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string().min(1, 'El nombre del rol es obligatorio.'),
  description: z.string().optional(),
  companyId: z.string().min(1, 'La compañía es obligatoria.'),
  // CORRECCIÓN: Se elimina .optional()
  // .default([]) ya maneja el caso de que el valor sea undefined
  // y asegura que el tipo inferido sea siempre string[]
  permissionIds: z.array(z.string()).default([]),
});

export const updateRoleSchema = roleSchema.partial();

export type CreateRolePayload = z.infer<typeof roleSchema>;
export type UpdateRolePayload = z.infer<typeof updateRoleSchema>;