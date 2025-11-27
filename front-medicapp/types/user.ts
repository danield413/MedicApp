// types/user.ts

import { DocType, UserType } from './enums';
import { Role } from './role';

export interface User {
  id: string;
  docType: DocType;
  docNum: string;
  name: string;
  email: string;
  isActive: boolean;
  userType: UserType;
  companyId: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  role?: Role; // Relación opcional que puede venir anidada
}
