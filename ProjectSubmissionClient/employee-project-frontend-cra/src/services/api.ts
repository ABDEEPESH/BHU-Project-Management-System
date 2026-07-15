import axios from 'axios';
import type { EmployeeDTO, ProjectResponseDTO, FundingAgencyDTO, ProjectSubmissionDTO, ProjectReceivedDTO, FundReceiptDTO, BankDetailsDTO, PFMSDetailsDTO, FundExpenditureDTO, EquipmentDTO } from '../types';

function isAxiosError(error: any): error is { response?: { status: number; statusText: string; data?: any }; config?: any; message?: string } {
  return error && typeof error === 'object' && 'response' in error;
}

const api = axios.create({
  baseURL: '/api', // Use CRA dev proxy to avoid CORS during development
  withCredentials: false,
});

// Interceptor to attach auth token and keep logs silent by default
api.interceptors.request.use(
  (config) => {
    const token = (typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null) 
      || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If there is no response, it's typically CORS preflight failed, network down, or backend not reachable
    if (!error.response) {
      return Promise.reject(new Error('Backend server is not responding'));
    }

    const status = error.response?.status;
    if (status === 401) {
      try { localStorage.removeItem('authToken'); localStorage.removeItem('userRole'); localStorage.removeItem('sessionId'); } catch {}
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const requestFormApproval = async (form: string): Promise<void> => {
  await api.post(`/approvals/forms/request`, undefined, { params: { form } });
};

export const getFormApprovalStatus = async (form: string): Promise<{ approved: boolean; rejected: boolean }> => {
  const res = await api.get(`/approvals/forms/status`, { params: { form } });
  const approved = Boolean((res.data as any)?.approved);
  const rejected = Boolean((res.data as any)?.rejected);
  return { approved, rejected };
};

// Admin approval queue APIs
export type PendingApprovalItem = {
  id: string;
  operationType: string;
  requestData: string;
  approvalCount: number;
  approvedBy: string[];
  createdAt: string;
};

export const fetchPendingRequests = async (): Promise<PendingApprovalItem[]> => {
  const res = await api.get<PendingApprovalItem[]>(`/approvals/forms/pending`);
  const data = Array.isArray(res.data) ? res.data : [];
  // normalize approvedBy to string[] if needed
  return data.map((it: any) => ({
    id: String(it?.id ?? ''),
    operationType: String(it?.operationType ?? ''),
    requestData: String(it?.requestData ?? ''),
    approvalCount: Number(it?.approvalCount ?? 0),
    approvedBy: Array.isArray(it?.approvedBy) ? it.approvedBy.map((x: any) => String(x)) : [],
    createdAt: String(it?.createdAt ?? ''),
  }));
};

export const decideRequest = async (id: string, approve: boolean): Promise<void> => {
  await api.post(`/approvals/forms/decide`, undefined, { params: { id, approve } });
};

export const fetchMe = async (): Promise<{ username: string; roles: string[] }> => {
  const res = await api.get<{ username: string; roles: string[] }>("/auth/me");
  const data = res.data as any;
  const roles: string[] = Array.isArray(data?.roles)
    ? data.roles
    : typeof data?.roles === 'string'
      ? String(data.roles).split(/[ ,]/).map((r) => r.trim()).filter(Boolean)
      : [];
  return { username: String(data?.username || ''), roles };
};

export const loginUser = async (username: string, password: string): Promise<string> => {
  try {
    const res = await api.post<{ token: string }>('/auth/login', { username, password });
    const token = res.data?.token;
    if (!token) {
      throw new Error('Missing token in response');
    }
    return token;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Login failed: ${error.response?.status} ${error.response?.statusText}`
      : 'Login failed';
    throw new Error(errorMessage);
  }
};

// Health check endpoint (silent and boolean-returning)
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get<{ status: string; message: string }>('/health');
    return !!response.data;
  } catch (_) {
    return false;
  }
};

// Project Submissions
export const fetchProjectSubmissions = async (): Promise<{ submissions: ProjectSubmissionDTO[]; message?: string }> => {
  try {
    const response = await api.get<ProjectSubmissionDTO[]>('/project-submission/all');
    const raw = response.data as any;
    const arr = Array.isArray(raw) ? raw : [];
    const normalized: ProjectSubmissionDTO[] = arr.map((s: any) => ({
      _id: s._id,
      idNo: s.idNo || s.Employee_ID || s.employeeId || s.employee_ID || '',
      timestamp: s.timestamp,
      principalInvestigatorName: s.principalInvestigatorName || s.Name_Of_Principal_Investigator || s.piName || '',
      designation: s.designation || '',
      department: s.department || '',
      faculty: s.faculty || '',
      projectName: s.projectName || s.Title_of_the_Project || s.title || '',
      projectCode: s.projectCode || s.Project_Code || s['Project codes'] || s.projectNumber || undefined,
      fundingAgencyId: s.fundingAgencyId || s.Funding_Agency_Id || '',
      durationOfProject: s.durationOfProject || s.Duration_Of_Project || '',
      typeOfProject: s.typeOfProject || s.Type_Of_Project || '',
      totalProjectCost: Number(s.totalProjectCost ?? s.Total_Project_Cost ?? 0) || 0,
      recurring: Number(s.recurring ?? s.Recurring ?? 0) || 0,
      nonRecurring: Number(s.nonRecurring ?? s.Non_Recurring ?? 0) || 0,
      overhead: Number(s.overhead ?? s.Overhead ?? 0) || 0,
      dateOfSubmission: s.dateOfSubmission || s.Date_Of_Submission || '',
      remark: s.remark || s.Remarks || undefined,
      hasCoPi: s.hasCoPi,
      coPiType: s.coPiType,
      coPiIdNo: s.coPiIdNo,
      coPiName: s.coPiName,
      coPiDesignation: s.coPiDesignation,
      coPiDepartment: s.coPiDepartment,
      coPiFaculty: s.coPiFaculty,
      coPiCity: s.coPiCity,
      coPiState: s.coPiState,
      coPiCountry: s.coPiCountry,
    }));
    console.log('[fetchProjectSubmissions] Normalized submissions:', { total: arr.length, normalized: normalized.length });
    return { submissions: normalized, message: undefined };
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.error || error.response?.data?.message || `Failed to fetch project submissions: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch project submissions';
    console.error('[fetchProjectSubmissions Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const fetchProjectSubmissionByProjectName = async (projectName: string): Promise<ProjectSubmissionDTO[]> => {
  try {
    const response = await api.get<ProjectSubmissionDTO[]>(`/project-submission/project/${encodeURIComponent(projectName)}`);
    const data = response.data;
    const validSubmissions = Array.isArray(data)
      ? data.filter((submission: any) => {
          return (
            typeof submission.totalProjectCost === 'number' &&
            typeof submission.recurring === 'number' &&
            typeof submission.nonRecurring === 'number' &&
            typeof submission.overhead === 'number'
          );
        })
      : [];
    console.log('[fetchProjectSubmissionByProjectName] Filtered submissions:', { total: (data as any)?.length || 0, valid: validSubmissions.length });
    return validSubmissions;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Failed to fetch project submission: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch project submission';
    console.error('[fetchProjectSubmissionByProjectName Error]', { projectName, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const createProjectSubmission = async (submissionData: ProjectSubmissionDTO): Promise<ProjectSubmissionDTO> => {
  try {
    const response = await api.post<ProjectSubmissionDTO>('/project-submission/create', submissionData);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error) && error.response
      ? error.response.data?.error || error.response.data || `Failed to create project submission: ${error.response.status} ${error.response.statusText}`
      : 'Failed to create project submission';
    console.error('[createProjectSubmission Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

// Employees
export const fetchEmployees = async (): Promise<EmployeeDTO[]> => {
  try {
    const response = await api.get<any[]>('/employee');
    const raw = Array.isArray(response.data) ? response.data : [];
    const normalized: EmployeeDTO[] = raw.map((e: any) => ({
      _id: e._id || e.id || '',
      idNo: e.idNo || e['ID No'] || e.ID_No || e.Employee_ID || '',
      name: e.name || e.Name || '',
      designation: e.designation || e.Designation || '',
      department: e.department || e.Department || '',
      faculty: e.faculty || e.Faculty || '',
      doB: (e.doB || e.DoB) ? new Date(e.doB || e.DoB).toISOString() : undefined,
      doJ: (e.doJ || e.DoJ) ? new Date(e.doJ || e.DoJ).toISOString() : undefined,
      doR: (e.doR || e.DoR) ? new Date(e.doR || e.DoR).toISOString() : undefined,
      passportNo: e.passportNo || e.Passport_No || undefined,
      mobile: typeof e.Mobile === 'object' && e.Mobile !== null ? String((e.Mobile as any)[''] ?? '') : (e.mobile || e.Mobile || undefined),
      email: e.email || e.Email || undefined,
      gender: e.gender || e.Gender || undefined,
    }));
    return normalized;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Failed to fetch employees: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch employees';
    console.error('[fetchEmployees Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const fetchEmployeeById = async (id: string): Promise<EmployeeDTO> => {
  try {
    const response = await api.get<any>(`/employee/eid/${encodeURIComponent(id)}`);
    const e = response.data || {};
    const normalized: EmployeeDTO = {
      _id: e._id || e.id || '',
      idNo: e.idNo || e['ID No'] || e.ID_No || e.Employee_ID || id,
      name: e.name || e.Name || '',
      designation: e.designation || e.Designation || '',
      department: e.department || e.Department || '',
      faculty: e.faculty || e.Faculty || '',
      doB: (e.doB || e.DoB) ? new Date(e.doB || e.DoB).toISOString() : undefined,
      doJ: (e.doJ || e.DoJ) ? new Date(e.doJ || e.DoJ).toISOString() : undefined,
      doR: (e.doR || e.DoR) ? new Date(e.doR || e.DoR).toISOString() : undefined,
      passportNo: e.passportNo || e.Passport_No || undefined,
      mobile: typeof e.Mobile === 'object' && e.Mobile !== null ? String((e.Mobile as any)[''] ?? '') : (e.mobile || e.Mobile || undefined),
      email: e.email || e.Email || undefined,
      gender: e.gender || e.Gender || undefined,
    };
    return normalized;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data || `Failed to fetch employee: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch employee';
    console.error('[fetchEmployeeById Error]', { id, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const createEmployee = async (employeeData: EmployeeDTO): Promise<EmployeeDTO> => {
  try {
    const response = await api.post<EmployeeDTO>('/employee/create', employeeData);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error) && error.response
      ? error.response.data || `Failed to create employee: ${error.response.status} ${error.response.statusText}`
      : 'Failed to create employee';
    console.error('[createEmployee Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

// Projects
export const fetchProjects = async (): Promise<ProjectResponseDTO[]> => {
  try {
    const response = await api.get<ProjectResponseDTO[]>('/project');
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Failed to fetch projects: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch projects';
    console.error('[fetchProjects Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const fetchProjectByProjectCode = async (projectCode: string): Promise<ProjectResponseDTO> => {
  try {
    const response = await api.get<ProjectResponseDTO>(`/project/code/${encodeURIComponent(projectCode)}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Failed to fetch project: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch project';
    console.error('[fetchProjectByProjectCode Error]', { projectCode, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const fetchProjectByProjectName = async (projectName: string): Promise<ProjectResponseDTO> => {
  try {
    const response = await api.get<ProjectResponseDTO>(`/project/name/${encodeURIComponent(projectName)}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Failed to fetch project: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch project';
    console.error('[fetchProjectByProjectName Error]', { projectName, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const createProject = async (projectData: ProjectResponseDTO): Promise<ProjectResponseDTO> => {
  try {
    const response = await api.post<ProjectResponseDTO>('/project/create', projectData);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error) && error.response
      ? error.response.data || `Failed to create project: ${error.response.status} ${error.response.statusText}`
      : 'Failed to create project';
    console.error('[createProject Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

// Funding Agencies
export const fetchFundingAgencies = async (): Promise<FundingAgencyDTO[]> => {
  try {
    const response = await api.get<FundingAgencyDTO[]>('/funding-agencies');
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Failed to fetch funding agencies: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch funding agencies';
    console.error('[fetchFundingAgencies Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const fetchFundingAgencyByFundingAgencyId = async (fundingAgencyId: string): Promise<FundingAgencyDTO> => {
  try {
    const response = await api.get<FundingAgencyDTO>(`/funding-agencies/faId/${encodeURIComponent(fundingAgencyId)}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Failed to fetch funding agency: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch funding agency';
    console.error('[fetchFundingAgencyByFundingAgencyId Error]', { fundingAgencyId, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const fetchFundingAgencyByFundingAgencyName = async (name: string): Promise<FundingAgencyDTO> => {
  try {
    const response = await api.get<FundingAgencyDTO>(`/funding-agencies/faName/${encodeURIComponent(name)}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Failed to fetch funding agency: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch funding agency';
    console.error('[fetchFundingAgencyByFundingAgencyName Error]', { name, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const createFundingAgency = async (fundingAgencyData: FundingAgencyDTO): Promise<FundingAgencyDTO> => {
  try {
    const response = await api.post<FundingAgencyDTO>('/funding-agencies/create', fundingAgencyData);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error) && error.response
      ? error.response.data || `Failed to create funding agency: ${error.response.status} ${error.response.statusText}`
      : 'Failed to create funding agency';
    console.error('[createFundingAgency Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

// Project Received
export const fetchProjectReceiveds = async (): Promise<{ projects: ProjectReceivedDTO[]; message?: string }> => {
  try {
    const response = await api.get<any>('/project-received');
    const data = response.data as any;
    const normalizeOne = (p: any) => ({
      _id: p._id,
      idNo: p.idNo || p.Employee_ID || p.employeeId || p.employee_ID || '',
      principalInvestigatorName: p.principalInvestigatorName || p.Name_Of_Principal_Investigator || p.piName || '',
      designation: p.designation || '',
      department: p.department || '',
      faculty: p.faculty || '',
      projectName: p.projectName || p.Title_of_the_Project || p.title || '',
      projectCode: p.projectCode || p.Project_Code || p['Project codes'] || p.projectNumber || undefined,
      fundingAgencyId: p.fundingAgencyId || p.Funding_Agency_Id || '',
      durationOfProject: p.durationOfProject || p.Duration_Of_Project || '',
      typeOfProject: p.typeOfProject || p.Type_Of_Project || '',
      totalProjectCost: Number(p.totalProjectCost ?? p.Total_Project_Cost ?? 0) || 0,
      recurring: Number(p.recurring ?? p.Recurring ?? 0) || 0,
      nonRecurring: Number(p.nonRecurring ?? p.Non_Recurring ?? 0) || 0,
      overhead: Number(p.overhead ?? p.Overhead ?? 0) || 0,
      dateOfReceipt: p.dateOfReceipt || p.Date_Of_Receipt || p.dateOfSubmission || '',
      financialYear: p.financialYear || p.Financial_Year || '',
      timestamp: p.timestamp,
      remark: p.remark || p.Remarks || '',
    });

    if (Array.isArray(data)) {
      const normalized = data.map(normalizeOne);
      console.log('[fetchProjectReceiveds] Normalized (array) projects:', { total: data.length });
      return { projects: normalized, message: undefined };
    }

    const list = Array.isArray((data as any).projects) ? (data as any).projects : [];
    const normalizedList = list.map(normalizeOne);
    return { projects: normalizedList, message: (data as any).message || undefined };
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.error || error.response?.data?.message || `Failed to fetch project received: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch project received';
    console.error('[fetchProjectReceiveds Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const createProjectReceived = async (data: ProjectReceivedDTO): Promise<ProjectReceivedDTO> => {
  try {
    const response = await api.post<ProjectReceivedDTO>('/project-received/create', data);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error) && error.response
      ? error.response.data || `Failed to create project received: ${error.response.status} ${error.response.statusText}`
      : 'Failed to create project received';
    console.error('[createProjectReceived Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const fetchProjectReceivedByIdNo = async (idNo: string): Promise<ProjectReceivedDTO[]> => {
  try {
    const response = await api.get<ProjectReceivedDTO[]>(`/project-received/eid/${encodeURIComponent(idNo)}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.error || error.response?.data?.message || `Failed to fetch project received by idNo: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch project received by idNo';
    console.error('[fetchProjectReceivedByIdNo Error]', { idNo, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

// Define the expected response type for fetchProjectReceiveds
type ProjectReceivedResponse = { projects: ProjectReceivedDTO[]; message?: string } | ProjectReceivedDTO[];

// Fund Receipt API calls
export const fetchFundReceipts = async (): Promise<FundReceiptDTO[]> => {
  try {
    const response = await api.get<FundReceiptDTO[]>('/fund-receipt/all');
    const data = response.data;
    const validReceipts = Array.isArray(data)
      ? data.filter((receipt: any) => {
          return (
            typeof receipt.totalAmount === 'number' &&
            typeof receipt.recurringAmount === 'number' &&
            typeof receipt.nonRecurringAmount === 'number' &&
            typeof receipt.overheadAmount === 'number'
          );
        })
      : [];
    console.log('[fetchFundReceipts] Filtered receipts:', { total: data.length, valid: validReceipts.length });
    return validReceipts;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.error || error.response?.data?.message || `Failed to fetch fund receipts: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch fund receipts';
    console.error('[fetchFundReceipts Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const createFundReceipt = async (fundReceipt: FundReceiptDTO): Promise<FundReceiptDTO> => {
  try {
    const response = await api.post<FundReceiptDTO>('/fund-receipt/create', fundReceipt);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error) && error.response
      ? error.response.data?.error || error.response.data || `Failed to create fund receipt: ${error.response.status} ${error.response.statusText}`
      : 'Failed to create fund receipt';
    console.error('[createFundReceipt Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const getFundReceiptById = async (id: string): Promise<FundReceiptDTO> => {
  try {
    const response = await api.get<FundReceiptDTO>(`/fund-receipt/${encodeURIComponent(id)}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.error || error.response?.data?.message || `Failed to fetch fund receipt: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch fund receipt';
    console.error('[getFundReceiptById Error]', { id, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const getFundReceiptByReceiptNumber = async (receiptNumber: string): Promise<FundReceiptDTO> => {
  try {
    const response = await api.get<FundReceiptDTO>(`/fund-receipt/receipt-number/${encodeURIComponent(receiptNumber)}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.error || error.response?.data?.message || `Failed to fetch fund receipt: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch fund receipt';
    console.error('[getFundReceiptByReceiptNumber Error]', { receiptNumber, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const updateFundReceipt = async (id: string, fundReceipt: FundReceiptDTO): Promise<FundReceiptDTO> => {
  try {
    const response = await api.put<FundReceiptDTO>(`/fund-receipt/${encodeURIComponent(id)}`, fundReceipt);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error) && error.response
      ? error.response.data?.error || error.response.data || `Failed to update fund receipt: ${error.response.status} ${error.response.statusText}`
      : 'Failed to update fund receipt';
    console.error('[updateFundReceipt Error]', { id, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const deleteFundReceipt = async (receiptNumber: string): Promise<void> => {
  try {
    await api.delete(`/fund-receipt/receipt-number/${encodeURIComponent(receiptNumber)}`);
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error) && error.response
      ? error.response.data?.error || error.response.data || `Failed to delete fund receipt: ${error.response.status} ${error.response.statusText}`
      : 'Failed to delete fund receipt';
    console.error('[deleteFundReceipt Error]', { receiptNumber, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

// Fetch projects by employee ID for FundReceiptForm
export const fetchProjectsByEmployeeId = async (idNo: string): Promise<ProjectResponseDTO[]> => {
  try {
    const response = await api.get<ProjectResponseDTO[]>(`/project/employee/${encodeURIComponent(idNo)}`);
    const validProjects = response.data.filter((project: any) => {
      return (
        typeof project.totalProjectCost === 'number' &&
        typeof project.recurring === 'number' &&
        typeof project.nonRecurring === 'number' &&
        typeof project.overhead === 'number'
      );
    });
    console.log('[fetchProjectsByEmployeeId] Filtered projects:', { total: response.data.length, valid: validProjects.length });
    return validProjects;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.error || error.response?.data?.message || `Failed to fetch projects for employee: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch projects for employee';
    console.error('[fetchProjectsByEmployeeId Error]', { idNo, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

// Bank Details API calls
export const fetchBankDetails = async (): Promise<BankDetailsDTO[]> => {
  try {
    const response = await api.get<any>('/bank-details');
    // Support wrapper shapes: { banks: [...] } | { items: [...] } | direct array
    let raw: any[] = [];
    if (Array.isArray(response.data)) {
      raw = response.data;
    } else if (Array.isArray(response.data?.banks)) {
      raw = response.data.banks;
    } else if (Array.isArray(response.data?.items)) {
      raw = response.data.items;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      raw = response.data.data;
    }

    const normalized: BankDetailsDTO[] = raw.map((rec: any) => {
      const b = deepRecord(rec);
      // Robust reads for top-level fields
      let bankName = readAny(b, ['Bank Name', 'bankName']);
      let accountName = readAny(b, ['Account Name', 'accountName']);
      if (bankName == null) bankName = readByIncludes(b, ['bank name', 'bank']);
      if (accountName == null) accountName = readByIncludes(b, ['account name', 'acc name', 'account title']);
      // Account No is an object with empty key per schema; also allow common alternates
      let accObj = readAny(b, ['Account No', 'accountNo', 'Account_Number', 'accountNumber']);
      if (accObj == null) accObj = readByIncludes(b, ['account no', 'acc no', 'account number']);
      let accountNumber = extractAccountNumber(accObj);
      let ifsc = readAny(b, ['IFSC Code', 'IFSC', 'ifscCode']);
      if (ifsc == null) ifsc = readByIncludes(b, ['ifsc']);
      let branch = readAny(b, ['Branch Name', 'Branch', 'branchName']);
      if (branch == null) branch = readByIncludes(b, ['branch']);
      let acctType = readAny(b, ['Account Type', 'accountType']);
      if (acctType == null) acctType = readByIncludes(b, ['account type']);

      // Last-resort heuristics if still missing
      if (!bankName || !accountName || !accountNumber) {
        const guess = heuristicExtractBank(b);
        bankName = bankName || guess.bankName;
        accountName = accountName || guess.accountName;
        accountNumber = accountNumber || guess.accountNumber;
      }

      const isActive = typeof (rec?.isActive ?? b?.isActive) === 'boolean' ? (rec?.isActive ?? b?.isActive) : true;

      return {
        _id: rec?._id || b?._id || rec?.id || b?.id || undefined,
        bankName: (bankName ?? '') as string,
        accountName: (accountName ?? '') as string,
        accountNumber: (accountNumber ?? '') as string,
        ifscCode: (ifsc ?? '') as string,
        branchName: (branch ?? '') as string,
        accountType: (acctType ?? '') as string,
        isActive,
      } as BankDetailsDTO;
    });
    return normalized;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Failed to fetch bank details: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch bank details';
    console.error('[fetchBankDetails Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const createBankDetails = async (bankData: BankDetailsDTO): Promise<BankDetailsDTO> => {
  try {
    const response = await api.post<BankDetailsDTO>('/bank-details/create', bankData);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error) && error.response
      ? error.response.data || `Failed to create bank details: ${error.response.status} ${error.response.statusText}`
      : 'Failed to create bank details';
    console.error('[createBankDetails Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

// PFMS Details API calls
export const fetchPFMSDetails = async (): Promise<PFMSDetailsDTO[]> => {
  try {
    const response = await api.get<any>('/pfms-details');
    // Support wrapper shapes: direct array, { items: [...] }, { data: [...] }, { pfms: [...] }
    let raw: any[] = [];
    if (Array.isArray(response.data)) raw = response.data;
    else if (Array.isArray(response.data?.items)) raw = response.data.items;
    else if (Array.isArray(response.data?.data)) raw = response.data.data;
    else if (Array.isArray(response.data?.pfms)) raw = response.data.pfms;

    const get = (o: any, keys: string[]) => {
      if (!o || typeof o !== 'object') return undefined;
      // exact match
      for (const k of keys) if (Object.prototype.hasOwnProperty.call(o, k)) return o[k];
      // relaxed spaced/case-insensitive match
      const norm = (s: string) => s.replace(/\s|_/g, '').toLowerCase();
      const oks = Object.keys(o);
      for (const k of keys) {
        const t = norm(k);
        const m = oks.find((kk) => norm(kk) === t);
        if (m) return o[m];
      }
      return undefined;
    };

    const normalized: PFMSDetailsDTO[] = raw.map((p: any) => {
      const scheme = get(p, ['PFMS Name and Number', 'pfmsScheme', 'PFMS_Name_and_Number']);
      return {
        _id: p?._id || p?.id || undefined,
        pfmsScheme: scheme || '',
        schemeCode: p?.schemeCode || '',
        description: p?.description || '',
        isActive: typeof p?.isActive === 'boolean' ? p.isActive : true,
      } as PFMSDetailsDTO;
    });
    return normalized;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Failed to fetch PFMS details: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch PFMS details';
    console.error('[fetchPFMSDetails Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const createPFMSDetails = async (pfmsData: PFMSDetailsDTO): Promise<PFMSDetailsDTO> => {
  try {
    const response = await api.post<PFMSDetailsDTO>('/pfms-details/create', pfmsData);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error) && error.response
      ? error.response.data || `Failed to create PFMS details: ${error.response.status} ${error.response.statusText}`
      : 'Failed to create PFMS details';
    console.error('[createPFMSDetails Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

// Fund Expenditure API calls
export const fetchFundExpenditures = async (): Promise<FundExpenditureDTO[]> => {
  try {
    const response = await api.get<FundExpenditureDTO[]>('/fund-expenditure/all');
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Failed to fetch fund expenditures: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch fund expenditures';
    console.error('[fetchFundExpenditures Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const createFundExpenditure = async (fundExpenditure: FundExpenditureDTO): Promise<FundExpenditureDTO> => {
  try {
    const response = await api.post<FundExpenditureDTO>('/fund-expenditure/create', fundExpenditure);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error) && error.response
      ? error.response.data?.error || error.response.data || `Failed to create fund expenditure: ${error.response.status} ${error.response.statusText}`
      : 'Failed to create fund expenditure';
    console.error('[createFundExpenditure Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const getFundExpenditureById = async (id: string): Promise<FundExpenditureDTO> => {
  try {
    const response = await api.get<FundExpenditureDTO>(`/fund-expenditure/${encodeURIComponent(id)}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.error || error.response?.data?.message || `Failed to fetch fund expenditure: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch fund expenditure';
    console.error('[getFundExpenditureById Error]', { id, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const getFundExpendituresByProjectCode = async (projectCode: string): Promise<FundExpenditureDTO[]> => {
  try {
    const response = await api.get<FundExpenditureDTO[]>(`/fund-expenditure/project/${encodeURIComponent(projectCode)}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.error || error.response?.data?.message || `Failed to fetch fund expenditures: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch fund expenditures';
    console.error('[getFundExpendituresByProjectCode Error]', { projectCode, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const getFundExpendituresByFinancialYear = async (financialYear: string): Promise<FundExpenditureDTO[]> => {
  try {
    const response = await api.get<FundExpenditureDTO[]>(`/fund-expenditure/financial-year/${encodeURIComponent(financialYear)}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.error || error.response?.data?.message || `Failed to fetch fund expenditures: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch fund expenditures';
    console.error('[getFundExpendituresByFinancialYear Error]', { financialYear, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const getFundExpendituresByProjectCodeAndFinancialYear = async (projectCode: string, financialYear: string): Promise<FundExpenditureDTO[]> => {
  try {
    const response = await api.get<FundExpenditureDTO[]>(`/fund-expenditure/project/${encodeURIComponent(projectCode)}/financial-year/${encodeURIComponent(financialYear)}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.error || error.response?.data?.message || `Failed to fetch fund expenditures: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch fund expenditures';
    console.error('[getFundExpendituresByProjectCodeAndFinancialYear Error]', { projectCode, financialYear, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const updateFundExpenditure = async (id: string, fundExpenditure: FundExpenditureDTO): Promise<FundExpenditureDTO> => {
  try {
    const response = await api.put<FundExpenditureDTO>(`/fund-expenditure/${encodeURIComponent(id)}`, fundExpenditure);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error) && error.response
      ? error.response.data?.error || error.response.data || `Failed to update fund expenditure: ${error.response.status} ${error.response.statusText}`
      : 'Failed to update fund expenditure';
    console.error('[updateFundExpenditure Error]', { id, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const deleteFundExpenditure = async (id: string): Promise<void> => {
  try {
    await api.delete(`/fund-expenditure/${encodeURIComponent(id)}`);
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error) && error.response
      ? error.response.data?.error || error.response.data || `Failed to delete fund expenditure: ${error.response.status} ${error.response.statusText}`
      : 'Failed to delete fund expenditure';
    console.error('[deleteFundExpenditure Error]', { id, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const checkFundExpenditureExists = async (projectCode: string, financialYear: string): Promise<boolean> => {
  try {
    const response = await api.get<boolean>(`/fund-expenditure/exists/project/${encodeURIComponent(projectCode)}/financial-year/${encodeURIComponent(financialYear)}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.error || error.response?.data?.message || `Failed to check fund expenditure existence: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to check fund expenditure existence';
    console.error('[checkFundExpenditureExists Error]', { projectCode, financialYear, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

// Equipment API calls
export const fetchEquipment = async (): Promise<EquipmentDTO[]> => {
  try {
    const response = await api.get<{ equipment: EquipmentDTO[]; count: number }>('/equipment');
    return response.data.equipment;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.error || error.response?.data?.message || `Failed to fetch equipment: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch equipment';
    console.error('[fetchEquipment Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const createEquipment = async (equipment: EquipmentDTO): Promise<EquipmentDTO> => {
  try {
    const response = await api.post<EquipmentDTO>('/equipment/create', equipment);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error) && error.response
      ? error.response.data?.error || error.response.data || `Failed to create equipment: ${error.response.status} ${error.response.statusText}`
      : 'Failed to create equipment';
    console.error('[createEquipment Error]', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const getEquipmentByVoucherNumber = async (voucherNumber: string): Promise<EquipmentDTO> => {
  try {
    const response = await api.get<EquipmentDTO>(`/equipment/voucher/${encodeURIComponent(voucherNumber)}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.error || error.response?.data?.message || `Failed to fetch equipment: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch equipment';
    console.error('[getEquipmentByVoucherNumber Error]', { voucherNumber, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

export const getEquipmentByProjectNumber = async (projectNumber: string): Promise<EquipmentDTO[]> => {
  try {
    const response = await api.get<{ equipment: EquipmentDTO[]; count: number }>(`/equipment/project/${encodeURIComponent(projectNumber)}`);
    return response.data.equipment;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.error || error.response?.data?.message || `Failed to fetch equipment for project: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch equipment for project';
    console.error('[getEquipmentByProjectNumber Error]', { projectNumber, error, message: errorMessage });
    throw new Error(errorMessage);
  }
};

// Admin Monitoring & Approval APIs
export const sendHeartbeat = async (payload: { role: 'admin' | 'user' | 'viewer'; eid?: string | null; username?: string | null }): Promise<void> => {
  try {
    await api.post('/monitor/heartbeat', payload);
  } catch (_) {
    // Silent fail – monitoring should not break UX
  }
};

export interface PermissionRequestDTO {
  _id?: string;
  requesterRole: 'user' | 'admin';
  requesterId?: string; // EID for user, username for admin
  target: string; // e.g., route or entity
  action: 'create' | 'update' | 'delete';
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export const createPermissionRequest = async (req: PermissionRequestDTO): Promise<PermissionRequestDTO> => {
  try {
    const res = await api.post<PermissionRequestDTO>('/approvals/requests', req);
    return res.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Failed to create pending requests: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to create pending requests';
    throw new Error(errorMessage);
  }
};

export const fetchPendingRequestsLegacy = async (): Promise<PermissionRequestDTO[]> => {
  try {
    const res = await api.get<PermissionRequestDTO[]>('/approvals/requests?status=pending');
    return res.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Failed to fetch pending requests: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch pending requests';
    throw new Error(errorMessage);
  }
};

export const decideRequestLegacy = async (id: string, approved: boolean): Promise<PermissionRequestDTO> => {
  try {
    const res = await api.post<PermissionRequestDTO>(`/approvals/requests/${encodeURIComponent(id)}/decision`, { approved });
    return res.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Failed to decide request: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to decide request';
    throw new Error(errorMessage);
  }
};

export interface ActiveSessionDTO {
  id: string;
  role: 'admin' | 'user' | 'viewer';
  eid?: string;
  username?: string;
  startedAt: string;
  lastSeenAt: string;
  durationMs?: number;
}

export const fetchActiveSessions = async (): Promise<ActiveSessionDTO[]> => {
  try {
    const res = await api.get<ActiveSessionDTO[]>('/monitor/sessions');
    return res.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.response?.data || `Failed to fetch active sessions: ${error.response?.status} ${error.response?.statusText}`
      : 'Failed to fetch active sessions';
    throw new Error(errorMessage);
  }
};

// Helper to robustly read properties from objects that may have spaced/cased keys
function readAny(obj: any, aliases: string[]): any {
  if (!obj || typeof obj !== 'object') return undefined;
  // Exact hits first
  for (const a of aliases) {
    if (Object.prototype.hasOwnProperty.call(obj, a)) return obj[a];
  }
  // Relaxed lookup: trim spaces, underscores, and compare lowercase
  const norm = (s: string) => s.replace(/\s|_/g, '').toLowerCase();
  const keys = Object.keys(obj);
  for (const a of aliases) {
    const target = norm(a);
    const k = keys.find((k) => norm(k) === target);
    if (k) return (obj as any)[k];
  }
  return undefined;
}

// Fallback: find value by scanning keys that include a pattern (case-insensitive)
function readByIncludes(obj: any, patterns: string[]): any {
  if (!obj || typeof obj !== 'object') return undefined;
  const keys = Object.keys(obj);
  const lower = (s: string) => s.toLowerCase();
  for (const pat of patterns) {
    const p = lower(pat);
    const k = keys.find((k) => lower(k).includes(p));
    if (k) return (obj as any)[k];
  }
  return undefined;
}

function extractAccountNumber(accObj: any): string | undefined {
  if (accObj == null) return undefined;
  if (typeof accObj === 'object') {
    // Known variants
    const direct = readAny(accObj, ['', 'value', 'number', 'no']);
    if (direct !== undefined && direct !== null) return String(direct);
    // Fallback: pick first numeric-like value
    for (const v of Object.values(accObj)) {
      if (v != null && (typeof v === 'number' || /^\d+$/.test(String(v)))) return String(v);
    }
    return undefined;
  }
  return String(accObj);
}

// As a last resort, scan any string fields to guess values
function heuristicExtractBank(b: any): { bankName?: string; accountName?: string; accountNumber?: string } {
  const out: { bankName?: string; accountName?: string; accountNumber?: string } = {};
  try {
    const entries = Object.entries(b || {});
    // Account number: any numeric-like long string (>= 6 digits)
    for (const [, v] of entries) {
      const s = String(v ?? '');
      if (/^\d{6,}$/.test(s)) { out.accountNumber = s; break; }
    }
    // Account/Bank names: any strings containing those words
    for (const [, v] of entries) {
      const s = String(v ?? '');
      const low = s.toLowerCase();
      if (!out.bankName && low.includes('bank')) out.bankName = s;
      if (!out.accountName && (low.includes('account') || low.includes('a/c'))) out.accountName = s;
      if (out.bankName && out.accountName) break;
    }
  } catch {}
  return out;
}

// If the record itself is a wrapper, try to locate the nested object that contains bank/account fields
function deepRecord(b: any): any {
  if (!b || typeof b !== 'object') return b;
  const hasFields = (o: any) => !!(readAny(o, ['Bank Name']) || readAny(o, ['Account Name']) || readAny(o, ['Account No']));
  if (hasFields(b)) return b;
  for (const v of Object.values(b)) {
    if (v && typeof v === 'object' && hasFields(v)) return v;
  }
  return b;
}