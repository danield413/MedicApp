// types/company.ts

import { CompanyType, DocumentType } from './enums';
import { Document } from './contract';

export interface CompanySettings {
  id: string;
  companyId: string;
  requiresDigitalSignature: boolean;
  sendsEmailNotifications: boolean;
  maxSupervisorsPerContract: number;
  maxAuthorizersPerContract: number;
  requiredContractDocs: DocumentType[];
}

export interface Company {
  id: string;
  name: string;
  nit: string;
  type: CompanyType;
  createdAt: string; // Las fechas se reciben como strings ISO
  updatedAt: string;
  settings?: CompanySettings;
  documents?: Document[];
}

export interface OrgUnit {
  id: string;
  name: string;
  companyId: string;
  parentId: string | null;
}
