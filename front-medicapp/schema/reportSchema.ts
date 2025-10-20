// schema/reportSchema.ts

import { z } from 'zod';
import { DocumentType } from '@/types';

const reportEvidenceSchema = z.object({
  name: z.string(),
  url: z.string(),
  key: z.string(),
  documentType: z.nativeEnum(DocumentType),
});

const activityLogSchema = z.object({
  obligation: z.string().min(1, 'La obligación es requerida.'),
  activity: z.string().min(1, 'La descripción de la actividad es requerida.'),
  evidences: z.array(reportEvidenceSchema),
});

export const createReportSchema = z.object({
  paymentPlanId: z.string().min(1, 'Debes seleccionar un plan de pago.'),
  ibc: z.number().positive('El IBC debe ser un valor positivo.'),
  healthPayment: z.number().positive('El pago de salud debe ser un valor positivo.'),
  pensionPayment: z.number().positive('El pago de pensión debe ser un valor positivo.'),
  arlPayment: z.number().positive('El pago de ARL debe ser un valor positivo.'),
  arlRiskLevel: z.number().int().min(1).max(5, 'El nivel de riesgo ARL debe estar entre 1 y 5.'),
  ccfPayment: z.number().positive('El pago a caja de compensación es requerido.'),
  activities: z.array(activityLogSchema).min(1, 'Debes reportar al menos una actividad.'),
  documents: z.array(reportEvidenceSchema),
});

export const approvalSchema = z.object({
  comment: z.string().optional(),
});

export type CreateReportPayload = z.infer<typeof createReportSchema>;
export type ApprovalPayload = z.infer<typeof approvalSchema>;
