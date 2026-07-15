import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFundReceipt, fetchEmployeeById, fetchProjectSubmissions, fetchProjectReceiveds, fetchBankDetails, fetchPFMSDetails } from '../services/api';
import type { EmployeeDTO, ProjectResponseDTO, ProjectSubmissionDTO, ProjectReceivedDTO, FundReceiptDTO, BankDetailsDTO, PFMSDetailsDTO } from '../types';

interface FundReceiptFormProps {
  onFundReceiptCreated?: () => void;
}

interface FormErrors {
  idNoInput?: string | null;
  receiptNumber?: string | null;
  idNo?: string | null;
  projectNumber?: string | null;
  projectName?: string | null;
  financialYear?: string | null;
  sanctionOrderNumber?: string | null;
  sanctionDate?: string | null;
  totalAmount?: string | null;
  nonRecurringAmount?: string | null;
  recurringAmount?: string | null;
  overheadAmount?: string | null;
  challanNumber?: string | null;
  challanDate?: string | null;
  pfmsScheme?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  general?: string | null;
  amountBreakdown?: string | null;
}

const FundReceiptForm: React.FC<FundReceiptFormProps> = ({ onFundReceiptCreated }) => {
  const navigate = useNavigate();
  const [idNoInput, setIdNoInput] = useState<string>('');
  const [idNoValidated, setIdNoValidated] = useState<boolean>(false);
  const [idNoValidationError, setIdNoValidationError] = useState<string>('');
  const [validatingIdNo, setValidatingIdNo] = useState<boolean>(false);
  const [projectSubmissions, setProjectSubmissions] = useState<ProjectSubmissionDTO[]>([]);
  const [projectsReceived, setProjectsReceived] = useState<ProjectReceivedDTO[]>([]);
  const [employeeProjects, setEmployeeProjects] = useState<ProjectReceivedDTO[]>([]);
  const [employeeData, setEmployeeData] = useState<EmployeeDTO | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetailsDTO[]>([]);
  const [pfmsDetails, setPfmsDetails] = useState<PFMSDetailsDTO[]>([]);
  const [usePFMS, setUsePFMS] = useState<boolean>(false);
  const [projectEntryMode, setProjectEntryMode] = useState<'select' | 'manual'>('select');
  const [formData, setFormData] = useState<FundReceiptDTO>({
    receiptNumber: '',
    idNo: '',
    projectNumber: '',
    projectName: '',
    financialYear: '',
    sanctionOrderNumber: '',
    sanctionDate: '',
    totalAmount: 0,
    nonRecurringAmount: 0,
    recurringAmount: 0,
    overheadAmount: 0,
    challanNumber: '',
    challanDate: '',
    usePFMS: false,
    pfmsScheme: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (idNoValidated && projectsReceived.length > 0) {
      const loadEmployeeProjects = () => {
        try {
          console.log('[FundReceiptForm] Filtering received projects for employee', { idNo: idNoInput });
          // Filter project received by employee ID
          const employeeReceivedProjects = projectsReceived.filter(
            received => received.idNo === idNoInput
          );
          console.log('[FundReceiptForm] Employee received projects found', { count: employeeReceivedProjects.length });
          setEmployeeProjects(employeeReceivedProjects);
        } catch (error) {
          console.error('[FundReceiptForm] Error filtering employee received projects', { error });
          setErrors((prev) => ({ ...prev, general: 'Failed to load employee received projects.' }));
        }
      };
      loadEmployeeProjects();
    }
  }, [idNoValidated, idNoInput, projectsReceived]);

  // Load Bank Details, PFMS Details and Project Submissions on component mount
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [bankData, pfmsData, projectSubmissionsData, projectReceivedData] = await Promise.all([
          fetchBankDetails(),
          fetchPFMSDetails(),
          fetchProjectSubmissions(),
          fetchProjectReceiveds()
        ]);
        setBankDetails(bankData);
        setPfmsDetails(pfmsData);
        setProjectSubmissions(projectSubmissionsData.submissions);
        setProjectsReceived(projectReceivedData.projects || []);
      } catch (error) {
        console.error('Error loading static data:', error);
      }
    };
    
    loadStaticData();
  }, []);

  // Build dropdown options from backend data
  const unique = (arr: (string | undefined)[]) => Array.from(new Set(arr.filter((x): x is string => !!x)));
  const bankNames = unique(bankDetails.map(b => b.bankName));
  const accountNumbers = unique(bankDetails.map(b => b.accountNumber));
  const accountNames = unique(bankDetails.map(b => b.accountName));
  const pfmsSchemes = unique(pfmsDetails.map(p => p.pfmsScheme));

  // Debug visibility to verify options are loaded
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[FundReceiptForm] PFMS schemes loaded:', pfmsSchemes.length, pfmsSchemes);
  }

  // Auto-fill helpers when a linked value is selected
  const autoFillByBankName = (name: string) => {
    const match = bankDetails.find(b => b.bankName === name);
    if (match) {
      setFormData(prev => ({
        ...prev,
        bankName: match.bankName || name,
        accountNumber: prev.accountNumber || match.accountNumber || '',
        accountName: prev.accountName || match.accountName || '',
      }));
    } else {
      setFormData(prev => ({ ...prev, bankName: name }));
    }
  };

  const autoFillByAccountNumber = (accNo: string) => {
    const match = bankDetails.find(b => b.accountNumber === accNo);
    if (match) {
      setFormData(prev => ({
        ...prev,
        accountNumber: match.accountNumber || accNo,
        bankName: prev.bankName || match.bankName || '',
        accountName: prev.accountName || match.accountName || '',
      }));
    } else {
      setFormData(prev => ({ ...prev, accountNumber: accNo }));
    }
  };

  const autoFillByAccountName = (accName: string) => {
    const match = bankDetails.find(b => b.accountName === accName);
    if (match) {
      setFormData(prev => ({
        ...prev,
        accountName: match.accountName || accName,
        bankName: prev.bankName || match.bankName || '',
        accountNumber: prev.accountNumber || match.accountNumber || '',
      }));
    } else {
      setFormData(prev => ({ ...prev, accountName: accName }));
    }
  };

  const validateField = (
    name: keyof FundReceiptDTO | 'idNoInput',
    value: string | number | boolean | undefined
  ): string | null => {
    if (name === 'idNoInput') {
      if (!value) return 'Employee ID is required to validate.';
      if (typeof value === 'string' && value.length > 50) return 'Employee ID must be at most 50 characters.';
      return null;
    }

    if (value === '' || value === undefined || value === null) {
      switch (name) {
        case 'receiptNumber':
          return 'Receipt Number is required.';
        case 'projectNumber':
          return 'Project Number is required.';
        case 'projectName':
          return 'Project Name is required.';
        case 'financialYear':
          return 'Financial Year is required.';
        case 'sanctionOrderNumber':
          return 'Sanction Order Number is required.';
        case 'sanctionDate':
          return 'Sanction Date is required.';
        case 'totalAmount':
          return 'Total Amount is required.';
        case 'nonRecurringAmount':
          return 'Non-Recurring Amount is required.';
        case 'recurringAmount':
          return 'Recurring Amount is required.';
        case 'overheadAmount':
          return 'Overhead Amount is required.';
        case 'challanNumber':
          return 'Challan Number is required.';
        case 'challanDate':
          return 'Challan Date is required.';
        case 'pfmsScheme':
          if (formData.usePFMS) return 'PFMS Scheme is required when PFMS is selected.';
          return null;
        case 'bankName':
          if (!formData.usePFMS) return 'Bank Name is required when PFMS is not used.';
          return null;
        case 'accountNumber':
          if (!formData.usePFMS) return 'Account Number is required when PFMS is not used.';
          return null;
        case 'accountName':
          if (!formData.usePFMS) return 'Account Name is required when PFMS is not used.';
          return null;
        default:
          return null;
      }
    }

    switch (name) {
      case 'receiptNumber':
        if (typeof value === 'string' && value.length > 50) return 'Receipt Number must be at most 50 characters.';
        return null;
      case 'projectNumber':
        if (typeof value === 'string' && value.length > 50) return 'Project Number must be at most 50 characters.';
        return null;
      case 'projectName':
        if (typeof value === 'string' && value.length > 100) return 'Project Name must be at most 100 characters.';
        return null;
      case 'financialYear':
        if (typeof value === 'string' && !/^\d{4}-\d{4}$/.test(value)) return 'Financial Year must be in YYYY-YYYY format.';
        return null;
      case 'sanctionOrderNumber':
        if (typeof value === 'string' && value.length > 50) return 'Sanction Order Number must be at most 50 characters.';
        return null;
      case 'sanctionDate':
      case 'challanDate':
        if (typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Invalid date format (YYYY-MM-DD).';
        return null;
      case 'totalAmount':
      case 'nonRecurringAmount':
      case 'recurringAmount':
      case 'overheadAmount':
        if (typeof value === 'number') {
          if (isNaN(value) || !isFinite(value)) return `${name} must be a valid number.`;
          if (value < 0) return `${name} cannot be negative.`;
        }
        return null;
      case 'challanNumber':
        if (typeof value === 'string' && value.length > 50) return 'Challan Number must be at most 50 characters.';
        return null;
      case 'pfmsScheme':
        if (typeof value === 'string' && value.length > 100) return 'PFMS Scheme must be at most 100 characters.';
        return null;
      case 'bankName':
        if (typeof value === 'string' && value.length > 100) return 'Bank Name must be at most 100 characters.';
        return null;
      case 'accountNumber':
        if (typeof value === 'string' && value.length > 50) return 'Account Number must be at most 50 characters.';
        return null;
      case 'accountName':
        if (typeof value === 'string' && value.length > 100) return 'Account Name must be at most 100 characters.';
        return null;
      default:
        return null;
    }
  };

  const validateAmountBreakdown = () => {
    const { totalAmount, recurringAmount, nonRecurringAmount, overheadAmount } = formData;
    if (isNaN(totalAmount) || !isFinite(totalAmount)) {
      return 'Total Amount must be a valid number.';
    }
    if (isNaN(recurringAmount) || !isFinite(recurringAmount)) {
      return 'Recurring Amount must be a valid number.';
    }
    if (isNaN(nonRecurringAmount) || !isFinite(nonRecurringAmount)) {
      return 'Non-Recurring Amount must be a valid number.';
    }
    if (isNaN(overheadAmount) || !isFinite(overheadAmount)) {
      return 'Overhead Amount must be a valid number.';
    }
    const sum = recurringAmount + nonRecurringAmount + overheadAmount;
    if (Math.abs(sum - totalAmount) > 0.01) {
      return 'Recurring + Non-Recurring + Overhead must equal Total Amount.';
    }
    return null;
  };

  const handleIdNoValidation = async () => {
    const error = validateField('idNoInput', idNoInput);
    if (error) {
      setErrors((prev) => ({ ...prev, idNoInput: error }));
      return;
    }

    setValidatingIdNo(true);
    setIdNoValidationError('');

    try {
      console.log('[FundReceiptForm] Validating Employee ID', { idNoInput });
      const employee: EmployeeDTO = await fetchEmployeeById(idNoInput);
      console.log('[FundReceiptForm] Employee found', { employee });

      // Store employee data
      setEmployeeData(employee);

      // Update form data with employee ID
      setFormData({
        ...formData,
        idNo: idNoInput,
      });
      
      setIdNoValidated(true);
      setErrors({});

      // Filter and set employee's received projects
      const employeeReceivedProjects = projectsReceived.filter(
        received => received.idNo === idNoInput
      );
      console.log('[FundReceiptForm] Employee received projects found', { 
        count: employeeReceivedProjects.length,
        projects: employeeReceivedProjects 
      });
      setEmployeeProjects(employeeReceivedProjects);

    } catch (error) {
      console.error('[FundReceiptForm] Employee ID validation error', { error });
      setIdNoValidationError('Employee not found.');
      setEmployeeData(null);
      setEmployeeProjects([]);
    } finally {
      setValidatingIdNo(false);
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectName = e.target.value;
    const selectedProject = employeeProjects.find((p) => p.projectName === projectName);
    
    // Auto-fill project details from the selected project submission
    setFormData({
      ...formData,
      projectNumber: selectedProject?._id || '', // Using submission ID as project number
      projectName: projectName,
    });
    setErrors({
      ...errors,
      projectNumber: validateField('projectNumber', selectedProject?._id || ''),
      projectName: validateField('projectName', projectName),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue =
      name === 'totalAmount' || name === 'nonRecurringAmount' || name === 'recurringAmount' || name === 'overheadAmount'
        ? parseFloat(value) || 0
        : value;

    console.log('[handleChange]', { name, value, parsedValue });
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name as keyof FundReceiptDTO, parsedValue),
      amountBreakdown: null,
    }));
  };

  const handlePFMSChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const usePFMSValue = e.target.value === 'yes';
    setUsePFMS(usePFMSValue);
    setFormData((prev) => ({
      ...prev,
      usePFMS: usePFMSValue,
      pfmsScheme: usePFMSValue ? prev.pfmsScheme : '',
      bankName: usePFMSValue ? prev.bankName : '',
      accountNumber: usePFMSValue ? prev.accountNumber : '',
      accountName: usePFMSValue ? prev.accountName : '',
    }));
    if (!usePFMSValue) {
      setErrors((prev) => ({
        ...prev,
        pfmsScheme: null,
        bankName: null,
        accountNumber: null,
        accountName: null,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: FormErrors = {};
    const fields: (keyof FundReceiptDTO)[] = [
      'receiptNumber',
      'projectNumber',
      'projectName',
      'financialYear',
      'sanctionOrderNumber',
      'sanctionDate',
      'totalAmount',
      'nonRecurringAmount',
      'recurringAmount',
      'overheadAmount',
      'challanNumber',
      'challanDate',
    ];

    if (formData.usePFMS) {
      fields.push('pfmsScheme', 'bankName', 'accountNumber', 'accountName');
    }

    fields.forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        (newErrors as Record<string, string | null>)[key] = error;
      }
    });

    if (!idNoValidated) newErrors.idNoInput = 'Please validate the Employee ID first.';

    const amountError = validateAmountBreakdown();
    if (amountError) newErrors.amountBreakdown = amountError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log('[handleSubmit] Validation errors:', newErrors);
      return;
    }

    setLoading(true);
    try {
      console.log('[FundReceiptForm] Submitting fund receipt', { formData });
      await createFundReceipt(formData);
      console.log('[FundReceiptForm] Fund receipt created successfully');
      onFundReceiptCreated?.();
      navigate('/fund-receipt/confirm', { state: { formData } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create fund receipt.';
      console.error('[FundReceiptForm] Error creating fund receipt', { error, message: errorMessage });
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4" style={{ color: '#343a40' }}>
        Add Fund Receipt
      </h2>
      <div className="card shadow-sm">
        <div className="card-body">
          {!idNoValidated ? (
            <div className="mb-3">
              <label htmlFor="idNoInput" className="form-label">
                Employee ID (EID) <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control ${errors.idNoInput || idNoValidationError ? 'is-invalid' : ''}`}
                  id="idNoInput"
                  name="idNoInput"
                  value={idNoInput}
                  onChange={(e) => {
                    setIdNoInput(e.target.value);
                    setErrors((prev) => ({ ...prev, idNoInput: validateField('idNoInput', e.target.value) }));
                    setIdNoValidationError('');
                  }}
                  placeholder="Enter Employee ID to validate"
                  disabled={loading || validatingIdNo}
                  aria-describedby="idNoInputFeedback"
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleIdNoValidation}
                  disabled={loading || validatingIdNo || !idNoInput || !!errors.idNoInput}
                  aria-label="Validate Employee ID"
                >
                  {validatingIdNo ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Validating...
                    </>
                  ) : (
                    'Validate'
                  )}
                </button>
                {(errors.idNoInput || idNoValidationError) && (
                  <div id="idNoInputFeedback" className="invalid-feedback d-block">
                    {errors.idNoInput || idNoValidationError}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate aria-label="Add Fund Receipt Form">
              {/* Employee Information Display */}
              {employeeData && (
                <div className="alert alert-info mb-4">
                  <h6 className="alert-heading">
                    <i className="bi bi-person-check me-2"></i>
                    Employee Information (EID: {idNoInput})
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Name:</strong> {employeeData.name}
                    </div>
                    <div className="col-md-6">
                      <strong>Designation:</strong> {employeeData.designation}
                    </div>
                    <div className="col-md-6">
                      <strong>Department:</strong> {employeeData.department}
                    </div>
                    <div className="col-md-6">
                      <strong>Faculty:</strong> {employeeData.faculty}
                    </div>
                  </div>
                  {employeeProjects.length > 0 && (
                    <div className="mt-3">
                      <strong>Received Projects ({employeeProjects.length}):</strong>
                      <ul className="list-unstyled mt-2">
                        {employeeProjects.map((project, index) => (
                          <li key={project._id || index} className="mb-1">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            {project.projectName} - ₹{project.totalProjectCost.toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {errors.general && (
                <div className="alert alert-danger" role="alert" aria-live="assertive">
                  {errors.general}
                </div>
              )}
              {errors.amountBreakdown && (
                <div className="alert alert-danger" role="alert" aria-live="assertive">
                  {errors.amountBreakdown}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="receiptNumber" className="form-label">
                  Receipt Number <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.receiptNumber ? 'is-invalid' : ''}`}
                  id="receiptNumber"
                  name="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={handleChange}
                  placeholder="e.g., REC12345"
                  required
                  aria-describedby="receiptNumberFeedback"
                  disabled={loading}
                />
                {errors.receiptNumber && (
                  <div id="receiptNumberFeedback" className="invalid-feedback">
                    {errors.receiptNumber}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Project Information <span className="text-danger">*</span>
                </label>
                
                {/* Project Entry Mode Toggle */}
                <div className="btn-group w-100 mb-3" role="group" aria-label="Project entry mode">
                  <input
                    type="radio"
                    className="btn-check"
                    name="projectEntryMode"
                    id="selectMode"
                    checked={projectEntryMode === 'select'}
                    onChange={() => setProjectEntryMode('select')}
                  />
                  <label className="btn btn-outline-primary" htmlFor="selectMode">
                    <i className="bi bi-list-ul me-1"></i>
                    Select from Received Projects
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="projectEntryMode"
                    id="manualMode"
                    checked={projectEntryMode === 'manual'}
                    onChange={() => setProjectEntryMode('manual')}
                  />
                  <label className="btn btn-outline-primary" htmlFor="manualMode">
                    <i className="bi bi-pencil me-1"></i>
                    Enter New Project
                  </label>
                </div>

                {/* Select from Existing Projects */}
                {projectEntryMode === 'select' && (
                  <>
                    <select
                      className={`form-select ${errors.projectName ? 'is-invalid' : ''}`}
                      id="projectName"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleProjectChange}
                      aria-describedby="projectNameFeedback"
                      disabled={loading || employeeProjects.length === 0}
                    >
                      <option value="">Select Project from Received Projects</option>
                      {employeeProjects.map((project) => (
                        <option key={project._id} value={project.projectName}>
                          {project.projectName} 
                          <small> (₹{project.totalProjectCost.toLocaleString()})</small>
                        </option>
                      ))}
                    </select>
                    {errors.projectName && (
                      <div id="projectNameFeedback" className="invalid-feedback">
                        {errors.projectName}
                      </div>
                    )}
                    {employeeProjects.length === 0 && idNoValidated && (
                      <div className="text-muted mt-2">
                        <i className="bi bi-info-circle me-1"></i>
                        No received projects found for this employee. Use "Enter New Project" to add project details manually.
                      </div>
                    )}
                  </>
                )}

                {/* Manual Project Entry */}
                {projectEntryMode === 'manual' && (
                  <div className="card border-primary">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0">
                        <i className="bi bi-plus-circle me-2"></i>
                        Select Project from All Available Projects
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="manualProjectName" className="form-label">
                            Project Name <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-select ${errors.projectName ? 'is-invalid' : ''}`}
                            id="manualProjectName"
                            name="projectName"
                            value={formData.projectName}
                            onChange={(e) => {
                              handleChange(e);
                              // Auto-fill project number when project name is selected
                              const selectedProject = [...projectSubmissions, ...projectsReceived].find(
                                p => p.projectName === e.target.value
                              );
                              if (selectedProject) {
                                setFormData(prev => ({
                                  ...prev,
                                  projectNumber: selectedProject.projectCode || selectedProject._id || ''
                                }));
                              }
                            }}
                            required
                          >
                            <option value="">Select Project Name</option>
                            {/* Project Submissions */}
                            <optgroup label="Project Submissions">
                              {projectSubmissions
                                .filter(project => project.projectName) // Filter out empty names
                                .map((project) => (
                                  <option key={`sub-${project._id}`} value={project.projectName}>
                                    {project.projectName} (Submitted - ₹{project.totalProjectCost.toLocaleString()})
                                  </option>
                                ))}
                            </optgroup>
                            {/* Project Received */}
                            <optgroup label="Project Received">
                              {projectsReceived
                                .filter(project => project.projectName) // Filter out empty names
                                .map((project) => (
                                  <option key={`rec-${project._id}`} value={project.projectName}>
                                    {project.projectName} (Received - ₹{project.totalProjectCost.toLocaleString()})
                                  </option>
                                ))}
                            </optgroup>
                          </select>
                          {errors.projectName && (
                            <div className="invalid-feedback">
                              {errors.projectName}
                            </div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="manualProjectNumber" className="form-label">
                            Project Number <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-select ${errors.projectNumber ? 'is-invalid' : ''}`}
                            id="manualProjectNumber"
                            name="projectNumber"
                            value={formData.projectNumber}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select Project Code</option>
                            {/* Project Submissions */}
                            <optgroup label="Project Submissions">
                              {projectSubmissions
                                .filter(project => project.projectCode || project._id) // Filter out empty codes/IDs
                                .sort((a, b) => {
                                  const codeA = a.projectCode || a._id || '';
                                  const codeB = b.projectCode || b._id || '';
                                  return codeA.localeCompare(codeB);
                                })
                                .map((project) => (
                                  <option key={`sub-num-${project._id}`} value={project.projectCode || project._id}>
                                    {project.projectCode || project._id} - {project.projectName}
                                  </option>
                                ))}
                            </optgroup>
                            {/* Project Received */}
                            <optgroup label="Project Received">
                              {projectsReceived
                                .filter(project => project.projectCode || project._id) // Filter out empty codes/IDs
                                .sort((a, b) => {
                                  const codeA = a.projectCode || a._id || '';
                                  const codeB = b.projectCode || b._id || '';
                                  return codeA.localeCompare(codeB);
                                })
                                .map((project) => (
                                  <option key={`rec-num-${project._id}`} value={project.projectCode || project._id}>
                                    {project.projectCode || project._id} - {project.projectName}
                                  </option>
                                ))}
                            </optgroup>
                          </select>
                          {errors.projectNumber && (
                            <div className="invalid-feedback">
                              {errors.projectNumber}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        <small>
                          Select from all available projects in the system. Projects are grouped by Submissions and Received status.
                          Selecting a project name will auto-fill the project number.
                        </small>
                      </div>
                      
                      {/* Display selected project details */}
                      {formData.projectName && (
                        <div className="mt-3">
                          <div className="card bg-light">
                            <div className="card-body">
                              <h6 className="card-title">Selected Project Details</h6>
                              {(() => {
                                const selectedProject = [...projectSubmissions, ...projectsReceived].find(
                                  p => p.projectName === formData.projectName
                                );
                                return selectedProject ? (
                                  <div className="row">
                                    <div className="col-md-6">
                                      <small className="text-muted">Project Name:</small>
                                      <div className="fw-bold">{selectedProject.projectName}</div>
                                    </div>
                                    <div className="col-md-6">
                                      <small className="text-muted">Total Cost:</small>
                                      <div className="fw-bold">₹{selectedProject.totalProjectCost.toLocaleString()}</div>
                                    </div>
                                    <div className="col-md-6">
                                      <small className="text-muted">Principal Investigator:</small>
                                      <div className="fw-bold">{selectedProject.principalInvestigatorName}</div>
                                    </div>
                                    <div className="col-md-6">
                                      <small className="text-muted">Department:</small>
                                      <div className="fw-bold">{selectedProject.department}</div>
                                    </div>
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Selected Project Details */}
              {formData.projectName && (
                <div className="mb-4">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="card-title text-primary">
                        <i className="bi bi-info-circle me-2"></i>
                        Selected Project Details
                      </h6>
                      {(() => {
                        const selectedProject = employeeProjects.find(p => p.projectName === formData.projectName);
                        return selectedProject ? (
                          <div className="row">
                            <div className="col-md-6">
                              <small className="text-muted">Project Name:</small>
                              <div className="fw-bold">{selectedProject.projectName}</div>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted">Total Project Cost:</small>
                              <div className="fw-bold">₹{selectedProject.totalProjectCost.toLocaleString()}</div>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted">Principal Investigator:</small>
                              <div className="fw-bold">{selectedProject.principalInvestigatorName}</div>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted">Department:</small>
                              <div className="fw-bold">{selectedProject.department}</div>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted">Funding Agency:</small>
                              <div className="fw-bold">{selectedProject.fundingAgencyId}</div>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted">Date of Receipt:</small>
                              <div className="fw-bold">{new Date(selectedProject.dateOfReceipt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="financialYear" className="form-label">
                  Financial Year <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.financialYear ? 'is-invalid' : ''}`}
                  id="financialYear"
                  name="financialYear"
                  value={formData.financialYear}
                  onChange={handleChange}
                  placeholder="e.g., 2024-2025"
                  required
                  aria-describedby="financialYearFeedback"
                  disabled={loading}
                />
                {errors.financialYear && (
                  <div id="financialYearFeedback" className="invalid-feedback">
                    {errors.financialYear}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="sanctionOrderNumber" className="form-label">
                  Sanction Order Number <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.sanctionOrderNumber ? 'is-invalid' : ''}`}
                  id="sanctionOrderNumber"
                  name="sanctionOrderNumber"
                  value={formData.sanctionOrderNumber}
                  onChange={handleChange}
                  placeholder="e.g., SO12345"
                  required
                  aria-describedby="sanctionOrderNumberFeedback"
                  disabled={loading}
                />
                {errors.sanctionOrderNumber && (
                  <div id="sanctionOrderNumberFeedback" className="invalid-feedback">
                    {errors.sanctionOrderNumber}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="sanctionDate" className="form-label">
                  Sanction Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${errors.sanctionDate ? 'is-invalid' : ''}`}
                  id="sanctionDate"
                  name="sanctionDate"
                  value={formData.sanctionDate}
                  onChange={handleChange}
                  required
                  aria-describedby="sanctionDateFeedback"
                  disabled={loading}
                />
                {errors.sanctionDate && (
                  <div id="sanctionDateFeedback" className="invalid-feedback">
                    {errors.sanctionDate}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="totalAmount" className="form-label">
                  Total Amount (₹) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.totalAmount ? 'is-invalid' : ''}`}
                  id="totalAmount"
                  name="totalAmount"
                  value={formData.totalAmount || ''}
                  onChange={handleChange}
                  placeholder="e.g., 1000000"
                  step="0.01"
                  min="0"
                  required
                  aria-describedby="totalAmountFeedback"
                  disabled={loading}
                />
                {errors.totalAmount && (
                  <div id="totalAmountFeedback" className="invalid-feedback">
                    {errors.totalAmount}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="recurringAmount" className="form-label">
                  Recurring Amount (₹) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.recurringAmount ? 'is-invalid' : ''}`}
                  id="recurringAmount"
                  name="recurringAmount"
                  value={formData.recurringAmount || ''}
                  onChange={handleChange}
                  placeholder="e.g., 500000"
                  step="0.01"
                  min="0"
                  required
                  aria-describedby="recurringAmountFeedback"
                  disabled={loading}
                />
                {errors.recurringAmount && (
                  <div id="recurringAmountFeedback" className="invalid-feedback">
                    {errors.recurringAmount}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="nonRecurringAmount" className="form-label">
                  Non-Recurring Amount (₹) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.nonRecurringAmount ? 'is-invalid' : ''}`}
                  id="nonRecurringAmount"
                  name="nonRecurringAmount"
                  value={formData.nonRecurringAmount || ''}
                  onChange={handleChange}
                  placeholder="e.g., 400000"
                  step="0.01"
                  min="0"
                  required
                  aria-describedby="nonRecurringAmountFeedback"
                  disabled={loading}
                />
                {errors.nonRecurringAmount && (
                  <div id="nonRecurringAmountFeedback" className="invalid-feedback">
                    {errors.nonRecurringAmount}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="overheadAmount" className="form-label">
                  Overhead Amount (₹) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.overheadAmount ? 'is-invalid' : ''}`}
                  id="overheadAmount"
                  name="overheadAmount"
                  value={formData.overheadAmount || ''}
                  onChange={handleChange}
                  placeholder="e.g., 100000"
                  step="0.01"
                  min="0"
                  required
                  aria-describedby="overheadAmountFeedback"
                  disabled={loading}
                />
                {errors.overheadAmount && (
                  <div id="overheadAmountFeedback" className="invalid-feedback">
                    {errors.overheadAmount}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="challanNumber" className="form-label">
                  Challan Number <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.challanNumber ? 'is-invalid' : ''}`}
                  id="challanNumber"
                  name="challanNumber"
                  value={formData.challanNumber}
                  onChange={handleChange}
                  placeholder="e.g., CH12345"
                  required
                  aria-describedby="challanNumberFeedback"
                  disabled={loading}
                />
                {errors.challanNumber && (
                  <div id="challanNumberFeedback" className="invalid-feedback">
                    {errors.challanNumber}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="challanDate" className="form-label">
                  Challan Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${errors.challanDate ? 'is-invalid' : ''}`}
                  id="challanDate"
                  name="challanDate"
                  value={formData.challanDate}
                  onChange={handleChange}
                  required
                  aria-describedby="challanDateFeedback"
                  disabled={loading}
                />
                {errors.challanDate && (
                  <div id="challanDateFeedback" className="invalid-feedback">
                    {errors.challanDate}
                  </div>
                )}
              </div>
              {/* PFMS Section - Beautified */}
              <div className="mb-4">
                <div className="card border-primary">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-bank me-2"></i>
                      Payment Method Selection
                    </h5>
                    <small>Choose your preferred payment processing method</small>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="bi bi-question-circle me-2"></i>
                        Use PFMS (Public Financial Management System)?
                      </label>
                      <div className="row mt-3">
                        <div className="col-md-6">
                          <div className="form-check form-check-card">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="usePFMS"
                              id="usePFMSYes"
                              value="yes"
                              checked={usePFMS}
                              onChange={handlePFMSChange}
                              disabled={loading}
                            />
                            <label className="form-check-label w-100" htmlFor="usePFMSYes">
                              <div className={`card h-100 ${usePFMS ? 'border-success bg-success bg-opacity-10' : 'border-light'}`}>
                                <div className="card-body text-center">
                                  <i className={`bi bi-check-circle-fill fs-1 ${usePFMS ? 'text-success' : 'text-muted'}`}></i>
                                  <h6 className="card-title mt-2">Yes, Use PFMS</h6>
                                  <p className="card-text small text-muted">
                                    Use Public Financial Management System for secure government transactions
                                  </p>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-check form-check-card">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="usePFMS"
                              id="usePFMSNo"
                              value="no"
                              checked={!usePFMS}
                              onChange={handlePFMSChange}
                              disabled={loading}
                            />
                            <label className="form-check-label w-100" htmlFor="usePFMSNo">
                              <div className={`card h-100 ${!usePFMS ? 'border-warning bg-warning bg-opacity-10' : 'border-light'}`}>
                                <div className="card-body text-center">
                                  <i className={`bi bi-bank fs-1 ${!usePFMS ? 'text-warning' : 'text-muted'}`}></i>
                                  <h6 className="card-title mt-2">No, Use Bank Details</h6>
                                  <p className="card-text small text-muted">
                                    Provide manual bank account details for fund transfer
                                  </p>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PFMS Details Section */}
              {usePFMS && (
                <div className="mb-4">
                  <div className="card border-success">
                    <div className="card-header bg-success text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-shield-check me-2"></i>
                        PFMS Details
                      </h5>
                      <small>Public Financial Management System Information</small>
                    </div>
                    <div className="card-body bg-success bg-opacity-5">
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>PFMS Selected:</strong> Transactions will be processed through the secure government PFMS portal.
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="pfmsScheme" className="form-label">
                          <i className="bi bi-diagram-3 me-2"></i>
                          PFMS Scheme <span className="text-danger">*</span>
                        </label>
                        {pfmsSchemes.length > 0 ? (
                          <select
                            className={`form-select ${errors.pfmsScheme ? 'is-invalid' : ''}`}
                            id="pfmsScheme"
                            name="pfmsScheme"
                            value={formData.pfmsScheme}
                            onChange={handleChange}
                            required
                            aria-describedby="pfmsSchemeFeedback"
                            disabled={loading}
                          >
                            <option value="">Select PFMS Scheme</option>
                            {pfmsSchemes.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className={`form-control ${errors.pfmsScheme ? 'is-invalid' : ''}`}
                            id="pfmsScheme"
                            name="pfmsScheme"
                            value={formData.pfmsScheme}
                            onChange={handleChange}
                            placeholder="Type PFMS scheme (no schemes found)"
                            required
                            aria-describedby="pfmsSchemeFeedback"
                            disabled={loading}
                          />
                        )}
                        {errors.pfmsScheme && (
                          <div id="pfmsSchemeFeedback" className="invalid-feedback">
                            {errors.pfmsScheme}
                          </div>
                        )}
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="bankNamePFMS" className="form-label">
                            <i className="bi bi-building me-2"></i>
                            Bank Name <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-select ${errors.bankName ? 'is-invalid' : ''}`}
                            id="bankNamePFMS"
                            name="bankName"
                            value={formData.bankName}
                            onChange={(e) => { handleChange(e); autoFillByBankName(e.target.value); }}
                            required
                            aria-describedby="bankNamePFMSFeedback"
                            disabled={loading}
                          >
                            <option value="">Select Bank Name</option>
                            {bankNames.map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                          {errors.bankName && (
                            <div id="bankNamePFMSFeedback" className="invalid-feedback">
                              {errors.bankName}
                            </div>
                          )}
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="accountNumberPFMS" className="form-label">
                            <i className="bi bi-credit-card me-2"></i>
                            Account Number <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-select ${errors.accountNumber ? 'is-invalid' : ''}`}
                            id="accountNumberPFMS"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={(e) => { handleChange(e); autoFillByAccountNumber(e.target.value); }}
                            required
                            aria-describedby="accountNumberPFMSFeedback"
                            disabled={loading}
                          >
                            <option value="">Select Account Number</option>
                            {accountNumbers.map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                          {errors.accountNumber && (
                            <div id="accountNumberPFMSFeedback" className="invalid-feedback">
                              {errors.accountNumber}
                            </div>
                          )}
                        </div>
                        
                        <div className="col-12 mb-3">
                          <label htmlFor="accountNamePFMS" className="form-label">
                            <i className="bi bi-person-badge me-2"></i>
                            Account Name <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-select ${errors.accountName ? 'is-invalid' : ''}`}
                            id="accountNamePFMS"
                            name="accountName"
                            value={formData.accountName}
                            onChange={(e) => { handleChange(e); autoFillByAccountName(e.target.value); }}
                            required
                            aria-describedby="accountNamePFMSFeedback"
                            disabled={loading}
                          >
                            <option value="">Select Account Name</option>
                            {accountNames.map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                          {errors.accountName && (
                            <div id="accountNamePFMSFeedback" className="invalid-feedback">
                              {errors.accountName}
                            </div>
                          )}
                          <div className="form-text">
                            <i className="bi bi-shield-check me-1"></i>
                            Ensure the account name matches official bank records for PFMS processing
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Bank Details Section */}
              {!usePFMS && (
                <div className="mb-4">
                  <div className="card border-warning">
                    <div className="card-header bg-warning text-dark">
                      <h5 className="mb-0">
                        <i className="bi bi-bank2 me-2"></i>
                        Bank Account Details
                      </h5>
                      <small>Required when PFMS is not used</small>
                    </div>
                    <div className="card-body bg-warning bg-opacity-5">
                      <div className="alert alert-warning">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        <strong>Manual Bank Transfer:</strong> Please provide accurate bank details for fund transfer.
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="bankName" className="form-label">
                            <i className="bi bi-building me-2"></i>
                            Bank Name <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-select ${errors.bankName ? 'is-invalid' : ''}`}
                            id="bankName"
                            name="bankName"
                            value={formData.bankName}
                            onChange={(e) => { handleChange(e); autoFillByBankName(e.target.value); }}
                            required
                            aria-describedby="bankNameFeedback"
                            disabled={loading}
                          >
                            <option value="">Select Bank Name</option>
                            {bankNames.map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                          {errors.bankName && (
                            <div id="bankNameFeedback" className="invalid-feedback">
                              {errors.bankName}
                            </div>
                          )}
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="accountNumber" className="form-label">
                            <i className="bi bi-credit-card me-2"></i>
                            Account Number <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-select ${errors.accountNumber ? 'is-invalid' : ''}`}
                            id="accountNumber"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={(e) => { handleChange(e); autoFillByAccountNumber(e.target.value); }}
                            required
                            aria-describedby="accountNumberFeedback"
                            disabled={loading}
                          >
                            <option value="">Select Account Number</option>
                            {accountNumbers.map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                          {errors.accountNumber && (
                            <div id="accountNumberFeedback" className="invalid-feedback">
                              {errors.accountNumber}
                            </div>
                          )}
                        </div>
                        
                        <div className="col-12 mb-3">
                          <label htmlFor="accountName" className="form-label">
                            <i className="bi bi-person-badge me-2"></i>
                            Account Name <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-select ${errors.accountName ? 'is-invalid' : ''}`}
                            id="accountName"
                            name="accountName"
                            value={formData.accountName}
                            onChange={(e) => { handleChange(e); autoFillByAccountName(e.target.value); }}
                            required
                            aria-describedby="accountNameFeedback"
                            disabled={loading}
                          >
                            <option value="">Select Account Name</option>
                            {accountNames.map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                          {errors.accountName && (
                            <div id="accountNameFeedback" className="invalid-feedback">
                              {errors.accountName}
                            </div>
                          )}
                          <div className="form-text">
                            <i className="bi bi-shield-check me-1"></i>
                            Ensure the account name matches official bank records
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => navigate('/fund-receipt')}
                  disabled={loading}
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  aria-label={loading ? 'Submitting...' : 'Proceed to Confirmation'}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Submitting...
                    </>
                  ) : (
                    'Proceed to Confirmation'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FundReceiptForm;