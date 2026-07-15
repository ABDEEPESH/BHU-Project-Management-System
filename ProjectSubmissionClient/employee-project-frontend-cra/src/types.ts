// src/types.ts
export interface ProjectDTO {
  projectNumber: string;
  projectName: string;
}

// Extended ProjectDTO to map from ProjectResponseDTO
export interface ProjectMapping {
  projectResponseToDTO: (response: ProjectResponseDTO) => ProjectDTO;
}

export interface EmployeeDTO {
  _id: string;
  idNo: string; // String, matching Employee model
  name: string;
  designation: string;
  department: string;
  faculty: string;
  doB?: string;
  doJ?: string;
  doR?: string;
  passportNo?: string;
  mobile?: string;
  email?: string;
  gender?: string; // Optional gender for UI display
  // projectIds?: string[];
}

export interface ProjectResponseDTO {
  projectNumber: string;
  projectName: string;
  overhead: any;
  nonRecurring: any;
  recurring: any;
  totalProjectCost: any;
  _id: string;
  projectCode: string;
  title: string;
  fundingAgencyId: string;
  amount?: number;
  dateOfSubmission: string;
  isCoPi: boolean;
  coPiEid: number | null;
  piEid: number;
  projectType: string;
  durationMonths: number;
  employees: { idNo: number }[];
}

export interface FundingAgencyDTO {
  _id: string;
  fundingAgencyId: string;
  name: string;
  shortName: string;
  typeOfAgency: string;
  category: string;
}

export interface ProjectSubmissionDTO {
  _id?: string; // MongoDB ObjectId, optional for creation
  idNo: string;
  timestamp?: string; // ISO 8601 string, set by backend
  principalInvestigatorName: string;
  designation: string;
  department: string;
  faculty: string;
  projectName: string;
  projectCode?: string; // Project code from backend
  fundingAgencyId: string;
  durationOfProject: string;
  typeOfProject: string;
  totalProjectCost: number;
  recurring: number;
  nonRecurring: number;
  overhead: number;
  dateOfSubmission: string;
  remark?: string;
  hasCoPi?: boolean;
  coPiType?: 'internal' | 'external';
  coPiIdNo?: string;
  coPiName?: string;
  coPiDesignation?: string;
  coPiDepartment?: string;
  coPiFaculty?: string;
  coPiCity?: string;
  coPiState?: string;
  coPiCountry?: string;
}

export interface ProjectReceivedDTO {
  _id: string;
  idNo: string; // String, matching ProjectReceived model
  principalInvestigatorName: string;
  designation: string;
  department: string;
  faculty: string;
  projectName: string;
  projectCode?: string; // Project code from backend
  fundingAgencyId: string;
  durationOfProject: string;
  typeOfProject: string;
  totalProjectCost: number;
  recurring: number;
  nonRecurring: number;
  overhead: number;
  dateOfReceipt: string;
  financialYear: string;
  timestamp: string;
  remark: string;
}

export interface FundReceiptDTO {
  _id?: string;
  receiptNumber: string;
  idNo: string;
  projectNumber: string;
  projectName: string;
  financialYear: string;
  sanctionOrderNumber: string;
  sanctionDate: string;
  totalAmount: number;
  recurringAmount: number;
  nonRecurringAmount: number;
  overheadAmount: number;
  challanNumber: string;
  challanDate: string;
  usePFMS: boolean;
  pfmsScheme?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface BankDetailsDTO {
  _id?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  ifscCode: string;
  branchName: string;
  accountType: string;
  isActive: boolean;
}

export interface PFMSDetailsDTO {
  _id?: string;
  pfmsScheme: string;
  schemeCode: string;
  description: string;
  isActive: boolean;
}

export interface FundExpenditureDTO {
  _id?: string;
  projectCode: string;
  projectTitle?: string; // Auto-populated from project
  fundingAgency?: string; // Auto-populated from project
  projectNumber?: string; // Optional; same as project code in new flow
  financialYear: string; // Format: 2026-27
  equipmentName?: string; // Optional; removed from form
  equipmentPurchase: number; // In ₹
  salary: number; // In ₹
  contingency: number; // In ₹
  overhead: number; // In ₹
  totalExpenditure: number; // Calculated field
  dateOfExpenditure?: string;
  timestamp?: string;
  remark?: string;
}

export interface EquipmentDTO {
  _id?: string;
  voucherNumber: string;
  manufactureName: string;
  equipmentName: string;
  caste: string;
  date: string;
  projectNumber: string;
  projectTitle?: string; // Auto-populated from project
  employeeId?: string;
  employeeName?: string;
}