// schema/contractorSchema.ts

import { z } from 'zod';
import { DocType, PersonType } from '@/types';

export const contractorSchema = z.object({
  personType: z.nativeEnum(PersonType, {
    message: 'Debes seleccionar un tipo de persona.',
  }),
  name: z.string().min(1, 'El nombre o razón social es obligatorio.'),
  docNum: z.string().min(1, 'El documento o NIT es obligatorio.'),
  docType: z.nativeEnum(DocType, {
    message: 'Debes seleccionar un tipo de documento.',
  }),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  userId: z.string().min(1, 'Debes vincular un usuario.'),
  companyId: z.string().min(1, 'La compañía es obligatoria.'),
});

export const updateContractorSchema = contractorSchema.partial();

export type CreateContractorPayload = z.infer<typeof contractorSchema>;
export type UpdateContractorPayload = z.infer<typeof updateContractorSchema>;
