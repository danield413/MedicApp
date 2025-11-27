// types/contract.ts

import { Contractor } from './contractor';
import { ContractRole } from './enums';
import { User } from './user';

export interface Document {
  id: string;
  name: string;
  url: string;
  key: string;
  documentType: string; // Deberíamos tener un enum si hay tipos fijos
  createdAt: string;
}

export interface PaymentPlan {
  id: string;
  paymentNumber: number;
  scheduledDate: string;
  amount: number;
}

export interface AssignedUser {
  id: string;
  roleInContract: ContractRole;
  user: User;
}

export interface Contract {
  id: string;
  filed: string | null;
  contractNumber: string;
  secopId: string | null;
  genObject: string;
  specificObjects: string[];
  dateInit: string;
  dateEnd: string;
  totalAmount: number;
  companyId: string;
  contractorId: string;
  createdAt: string;
  updatedAt: string;

  // Relaciones que pueden venir anidadas
  contractor?: Contractor;
  assignedUsers?: AssignedUser[];
  documents?: Document[];
  paymentPlans?: PaymentPlan[];
}
