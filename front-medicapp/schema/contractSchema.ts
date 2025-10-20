// schema/contractSchema.ts

import { z } from 'zod';
import { ContractRole, DocumentType } from '@/types';

// Sub-esquemas para objetos anidados
const documentSchema = z.object({
  name: z.string(),
  url: z.string(),
  key: z.string(),
  documentType: z.nativeEnum(DocumentType),
});

const paymentPlanSchema = z.object({
  paymentNumber: z.number().positive('El número de pago debe ser positivo.'),
  scheduledDate: z.date({ message: 'La fecha es obligatoria.' }),
  amount: z.number().positive('El monto debe ser mayor a cero.'),
});

const assignedUserSchema = z.object({
  userId: z.string().min(1, 'Debes seleccionar un usuario.'),
  roleInContract: z.nativeEnum(ContractRole, {
    message: 'Debes seleccionar un rol para el usuario.',
  }),
});

// Esquema principal para la creación del contrato
export const contractSchema = z.object({
  // --- Información General ---
  contractNumber: z.string().min(1, 'El número de contrato es obligatorio.'),
  secopId: z.string().optional(),
  genObject: z.string().min(10, 'El objeto del contrato es demasiado corto.'),
  dateInit: z.date({ message: 'La fecha de inicio es obligatoria.' }),
  dateEnd: z.date({ message: 'La fecha de finalización es obligatoria.' }),
  totalAmount: z.number().positive('El valor total debe ser mayor a cero.'),
  contractorId: z.string().min(1, 'Debes seleccionar un contratista.'),
  orgUnitId: z.string().optional(),

  // --- Obligaciones y Asignaciones ---
  specificObjects: z.array(z.string().min(5, 'La obligación es muy corta.')).min(1, 'Debes agregar al menos una obligación específica.'),
  assignedUsers: z.array(assignedUserSchema).min(1, 'Debes asignar al menos un responsable (ej. Supervisor).'),
  
  // --- Plan de Pagos y Documentos ---
  paymentPlans: z.array(paymentPlanSchema).min(1, 'Debes generar un plan de pagos.'),
  documents: z.array(documentSchema).optional().default([]),
});

export const updateContractSchema = contractSchema.partial();

export type CreateContractPayload = z.infer<typeof contractSchema>;
export type UpdateContractPayload = z.infer<typeof updateContractSchema>;