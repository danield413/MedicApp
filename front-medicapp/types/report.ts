// types/report.ts

import { ReportStatus, DocumentType } from './enums';
import { Document } from './contract';

export interface ActivityLogEvidence extends Document {}

export interface ActivityLog {
  id: string;
  obligation: string;
  activity: string;
  evidences: ActivityLogEvidence[];
}

export interface ReportApproval {
  id: string;
  userId: string;
  status: ReportStatus;
  comment: string | null;
  createdAt: string;
}

export interface Report {
  id: string;
  paymentPlanId: string;
  status: ReportStatus;
  submittedAt: string | null;
  ibc: number;
  healthPayment: number;
  pensionPayment: number;
  arlPayment: number;
  arlRiskLevel: number;
  ccfPayment: number;
  createdAt: string;
  updatedAt: string;
  activities: ActivityLog[];
  documents: Document[];
  approvals: ReportApproval[];
}
