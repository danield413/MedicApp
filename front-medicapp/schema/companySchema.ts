// schema/companySchema.ts

import { z } from 'zod';
import { CompanyType, DocumentType } from '@/types';

const attachedDocumentSchema = z.object({
  name: z.string(),
  url: z.string(),
  key: z.string(),
  documentType: z.nativeEnum(DocumentType),
});

export const companySchema = z.object({
  name: z.string().min(1, 'El nombre de la compañía es obligatorio.'),
  nit: z.string().min(1, 'El NIT es obligatorio.'),
  type: z.nativeEnum(CompanyType, {
    message: 'Debes seleccionar un tipo de empresa.',
  }),
  // Documentos adjuntos deshabilitados: no se requieren y por defecto es un arreglo vacío
  documents: z.array(attachedDocumentSchema).optional().default([]),
});

export const updateCompanySchema = companySchema.partial();
export const companySettingsSchema = z.object({
  requiresDigitalSignature: z.boolean().optional(),
  sendsEmailNotifications: z.boolean().optional(),
  maxSupervisorsPerContract: z.number().int().min(0).optional(),
  maxAuthorizersPerContract: z.number().int().min(0).optional(),
  requiredContractDocs: z.array(z.nativeEnum(DocumentType)).optional(),
});

export type UpdateCompanySettingsPayload = z.infer<typeof companySettingsSchema>;

export type CreateCompanyPayload = z.infer<typeof companySchema>;
export type UpdateCompanyPayload = z.infer<typeof updateCompanySchema>;
