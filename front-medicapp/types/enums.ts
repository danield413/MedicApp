// types/enums.ts

/**
 * Centraliza todos los enums definidos en el schema.prisma del backend
 * para ser reutilizados en todo el frontend.
 */

export enum DocType {
  CC = 'CC',
  CE = 'CE',
  NIT = 'NIT',
  PPT = 'PPT',
  PASSPORT = 'PASSPORT',
}

export enum PersonType {
  NATURAL = 'NATURAL',
  JURIDICO = 'JURIDICO',
}

export enum CompanyType {
  PUBLICA = 'PUBLICA',
  PRIVADA = 'PRIVADA',
}

export enum UserType {
  FUNCIONARIO = 'FUNCIONARIO',
  CONTRATISTA = 'CONTRATISTA',
}

export enum ContractRole {
  SUPERVISOR = 'SUPERVISOR',
  EXPENDITURE_AUTHORIZER = 'EXPENDITURE_AUTHORIZER',
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
}

export enum DocumentType {
  RUT = 'RUT',
  CAMARA_COMERCIO = 'CAMARA_COMERCIO',
  CEDULA_REPRESENTANTE = 'CEDULA_REPRESENTANTE',
  CDP = 'CDP',
  RPC = 'RPC',
  PAGO_SEGURIDAD_SOCIAL = 'PAGO_SEGURIDAD_SOCIAL',
  OTRO = 'OTRO',
}
