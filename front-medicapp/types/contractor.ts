// types/contractor.ts

import { PersonType, DocType } from './enums';
import { User } from './user';

export interface Contractor {
  id: string;
  personType: PersonType;
  name: string;
  docNum: string;
  docType: DocType;
  phoneNumber: string | null;
  address: string | null;
  userId: string;
  companyId: string;
  user?: Partial<User>; // Usuario responsable (puede venir anidado)
}
