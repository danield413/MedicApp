import { z } from 'zod';

export const orgUnitSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  companyId: z.string().optional(), // Se añade en el hook antes de enviar
  parentId: z
    .string()
    .optional()
    .nullable()
    .transform(val => (val === '' ? null : val)), // Transforma un string vacío a null
});

export type CreateOrgUnitPayload = z.infer<typeof orgUnitSchema>;
