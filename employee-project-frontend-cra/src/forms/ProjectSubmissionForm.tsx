import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProjectSubmission, fetchEmployeeById, fetchFundingAgencies } from '../services/api';
import type { EmployeeDTO, FundingAgencyDTO, ProjectSubmissionDTO } from '../types';

interface ProjectSubmissionFormProps {
  onProjectSubmissionCreated?: () => void;
}

interface FormErrors {
  idNoInput?: string | null;
  _id?: string | null;
  idNo?: string | null;
  timestamp?: string | null;
  principalInvestigatorName?: string | null;
  designation?: string | null;
  department?: string | null;
  faculty?: string | null;
  projectName?: string | null;
  projectCode?: string | null;
  fundingAgencyId?: string | null;
  durationOfProject?: string | null;
  typeOfProject?: string | null;
  totalProjectCost?: string | null;
  recurring?: string | null;
  recurringPercentage?: string | null;
  nonRecurring?: string | null;
  nonRecurringPercentage?: string | null;
  overhead?: string | null;
  overheadPercentage?: string | null;
  dateOfSubmission?: string | null;
  remark?: string | null;
  general?: string | null;
  costBreakdown?: string | null;
  coPiIdNo?: string | null;
  coPiName?: string | null;
  coPiDesignation?: string | null;
  coPiCity?: string | null;
  coPiState?: string | null;
  coPiCountry?: string | null;
}

const typeOfProjectOptions = ['Major', 'Minor'];
const percentageOptions = Array.from({ length: 11 }, (_, i) => i * 5); // 0%, 5%, ..., 50%

const ProjectSubmissionForm: React.FC<ProjectSubmissionFormProps> = ({ onProjectSubmissionCreated }) => {
  const navigate = useNavigate();
  const [idNoInput, setIdNoInput] = useState<string>('');
  const [idNoValidated, setIdNoValidated] = useState<boolean>(false);
  const [idNoValidationError, setIdNoValidationError] = useState<string>('');
  const [validatingIdNo, setValidatingIdNo] = useState<boolean>(false);
  const [fundingAgencies, setFundingAgencies] = useState<FundingAgencyDTO[]>([]);
  const [coPiIdNoInput, setCoPiIdNoInput] = useState<string>('');
  const [coPiIdNoValidated, setCoPiIdNoValidated] = useState<boolean>(false);
  const [coPiIdNoValidationError, setCoPiIdNoValidationError] = useState<string>('');
  const [validatingCoPiIdNo, setValidatingCoPiIdNo] = useState<boolean>(false);
  
  // Multiple Co-PI state
  const [internalCoPis, setInternalCoPis] = useState<Array<{idNo: string, name: string, designation: string, department: string, faculty: string}>>([]);
  const [externalCoPis, setExternalCoPis] = useState<Array<{idNo: string, name: string, designation: string, city: string, state: string, country: string}>>([]);
  const [currentInternalCoPi, setCurrentInternalCoPi] = useState<string>('');
  const [currentExternalCoPi, setCurrentExternalCoPi] = useState<{idNo: string, name: string, designation: string, city: string, state: string, country: string}>({
    idNo: '', name: '', designation: '', city: '', state: '', country: ''
  });
  
  const [formData, setFormData] = useState<ProjectSubmissionDTO>({
    idNo: '',
    // timestamp: '',
    principalInvestigatorName: '',
    designation: '',
    department: '',
    faculty: '',
    projectName: '',
    projectCode: '',
    fundingAgencyId: '',
    durationOfProject: '',
    typeOfProject: '',
    totalProjectCost: 0,
    recurring: 0,
    nonRecurring: 0,
    overhead: 0,
    dateOfSubmission: '',
    remark: '',
    hasCoPi: false,
    coPiType: undefined,
    coPiIdNo: '',
    coPiName: '',
    coPiDesignation: '',
    coPiDepartment: '',
    coPiFaculty: '',
    coPiCity: '',
    coPiState: '',
    coPiCountry: '',
  });
  const [recurringPercentage, setRecurringPercentage] = useState<string>('');
  const [nonRecurringPercentage, setNonRecurringPercentage] = useState<string>('');
  const [overheadPercentage, setOverheadPercentage] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFundingAgencies = async () => {
      try {
        console.log('[ProjectSubmissionForm] Fetching funding agencies');
        const agencies = await fetchFundingAgencies();
        console.log('[ProjectSubmissionForm] Funding agencies fetched', { count: agencies.length });
        setFundingAgencies(agencies);
      } catch (error) {
        console.error('[ProjectSubmissionForm] Error loading funding agencies', { error });
        setErrors((prev) => ({ ...prev, general: 'Failed to load funding agencies.' }));
      }
    };
    loadFundingAgencies();
  }, []);

  const validateField = (
    name: keyof ProjectSubmissionDTO | 'idNoInput' | 'recurringPercentage' | 'nonRecurringPercentage' | 'overheadPercentage',
    value: string | number | undefined
  ): string | null => {
    // if (name === 'timestamp') return null; // timestamp is set by backend

    if (name === 'idNoInput') {
      if (!value) return 'Employee ID is required to validate.';
      if (typeof value === 'string' && value.length > 50) return 'Employee ID must be at most 50 characters.';
      return null;
    }

    if (value === '' || value === undefined || value === null) {
      switch (name) {
        case 'principalInvestigatorName':
          return 'Principal Investigator Name is required.';
        case 'projectName':
          return 'Project Name is required.';
        case 'fundingAgencyId':
          return 'Funding Agency is required.';
        case 'dateOfSubmission':
          return 'Submission Date is required.';
        case 'totalProjectCost':
          return 'Total Project Cost is required.';
        case 'recurring':
          return 'Recurring cost is required.';
        case 'nonRecurring':
          return 'Non-Recurring cost is required.';
        case 'overhead':
          return 'Overhead is required.';
        default:
          return null;
      }
    }

    switch (name) {
      case 'principalInvestigatorName':
        if (typeof value === 'string' && value.length > 100) return 'Principal Investigator Name must be at most 100 characters.';
        return null;
      case 'designation':
        if (typeof value === 'string' && value.length > 50) return 'Designation must be at most 50 characters.';
        return null;
      case 'department':
        if (typeof value === 'string' && value.length > 50) return 'Department must be at most 50 characters.';
        return null;
      case 'faculty':
        if (typeof value === 'string' && value.length > 50) return 'Faculty must be at most 50 characters.';
        return null;
      case 'projectName':
        if (typeof value === 'string' && value.length > 100) return 'Project Name must be at most 100 characters.';
        return null;
      case 'projectCode':
        if (typeof value === 'string' && value.length > 50) return 'Project Code must be at most 50 characters.';
        return null;
      case 'fundingAgencyId':
        if (typeof value === 'string' && value.length > 50) return 'Funding Agency ID must be at most 50 characters.';
        return null;
      case 'durationOfProject':
        if (typeof value === 'string' && (!/^\d+$/.test(value) || parseInt(value) <= 0)) return 'Duration of Project must be a positive integer.';
        return null;
      case 'typeOfProject':
        if (typeof value === 'string' && !typeOfProjectOptions.includes(value)) return 'Invalid Type of Project.';
        return null;
      case 'totalProjectCost':
        if (typeof value === 'number') {
          if (isNaN(value) || !isFinite(value)) return 'Total Project Cost must be a valid number.';
          if (value < 0) return 'Total Project Cost cannot be negative.';
        } else if (typeof value === 'string' && value.includes('%')) {
          return 'Total Project Cost must not include percentage signs.';
        }
        return null;
      case 'recurring':
        if (typeof value === 'number') {
          if (isNaN(value) || !isFinite(value)) return 'Recurring cost must be a valid number.';
          if (value < 0) return 'Recurring cost cannot be negative.';
        } else if (typeof value === 'string' && value.includes('%')) {
          return 'Recurring cost must not include percentage signs.';
        }
        return null;
      case 'nonRecurring':
        if (typeof value === 'number') {
          if (isNaN(value) || !isFinite(value)) return 'Non-Recurring cost must be a valid number.';
          if (value < 0) return 'Non-Recurring cost cannot be negative.';
        } else if (typeof value === 'string' && value.includes('%')) {
          return 'Non-Recurring cost must not include percentage signs.';
        }
        return null;
      case 'overhead':
        if (typeof value === 'number') {
          if (isNaN(value) || !isFinite(value)) return 'Overhead must be a valid number.';
          if (value < 0) return 'Overhead cannot be negative.';
        } else if (typeof value === 'string' && value.includes('%')) {
          return 'Overhead must not include percentage signs.';
        }
        return null;
      case 'recurringPercentage':
      case 'nonRecurringPercentage':
      case 'overheadPercentage':
        if (typeof value === 'string' && value && !percentageOptions.includes(parseInt(value))) return 'Invalid percentage selected.';
        return null;
      case 'dateOfSubmission':
        if (typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Invalid date format (YYYY-MM-DD).';
        return null;
      case 'remark':
        if (typeof value === 'string' && value.length > 200) return 'Remark must be at most 200 characters.';
        return null;
      case 'coPiIdNo':
        if (typeof value === 'string' && value && value.length > 50) return 'Co-PI Employee ID must be at most 50 characters.';
        return null;
      case 'coPiName':
        if (typeof value === 'string' && value && value.length > 100) return 'Co-PI Name must be at most 100 characters.';
        return null;
      case 'coPiDesignation':
        if (typeof value === 'string' && value && value.length > 50) return 'Co-PI Designation must be at most 50 characters.';
        return null;
      case 'coPiCity':
        if (typeof value === 'string' && value && value.length > 50) return 'Co-PI City must be at most 50 characters.';
        return null;
      case 'coPiState':
        if (typeof value === 'string' && value && value.length > 50) return 'Co-PI State must be at most 50 characters.';
        return null;
      case 'coPiCountry':
        if (typeof value === 'string' && value && value.length > 50) return 'Co-PI Country must be at most 50 characters.';
        return null;
      default:
        return null;
    }
  };

  const validateCostBreakdown = () => {
    const { totalProjectCost, recurring, nonRecurring, overhead } = formData;
    if (isNaN(totalProjectCost) || !isFinite(totalProjectCost)) {
      return 'Total Project Cost must be a valid number.';
    }
    if (isNaN(recurring) || !isFinite(recurring)) {
      return 'Recurring cost must be a valid number.';
    }
    if (isNaN(nonRecurring) || !isFinite(nonRecurring)) {
      return 'Non-Recurring cost must be a valid number.';
    }
    if (isNaN(overhead) || !isFinite(overhead)) {
      return 'Overhead must be a valid number.';
    }
    const sum = recurring + nonRecurring + overhead;
    if (Math.abs(sum - totalProjectCost) > 0.01) {
      return 'Recurring + Non-Recurring + Overhead must equal Total Project Cost.';
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
      console.log('[ProjectSubmissionForm] Validating Employee ID', { idNoInput });
      const employeeData: EmployeeDTO = await fetchEmployeeById(idNoInput);
      console.log('[ProjectSubmissionForm] Employee found', { employeeData });

      setFormData({
        ...formData,
        idNo: idNoInput,
        // timestamp: '', // Included for frontend state, not sent to backend
        principalInvestigatorName: employeeData.name || '',
        designation: employeeData.designation || '',
        department: employeeData.department || '',
        faculty: employeeData.faculty || '',
      });
      setIdNoValidated(true);
      setErrors({});
    } catch (error) {
      console.error('[ProjectSubmissionForm] Employee ID validation error', { error });
      setIdNoValidationError('Employee not found.');
    } finally {
      setValidatingIdNo(false);
    }
  };

  const addInternalCoPi = async () => {
    if (internalCoPis.length >= 10) {
      setErrors((prev) => ({ ...prev, general: 'Maximum 10 Internal Co-PIs allowed.' }));
      return;
    }

    if (!currentInternalCoPi) {
      setErrors((prev) => ({ ...prev, general: 'Please enter Employee ID for Internal Co-PI.' }));
      return;
    }

    try {
      const employeeData: EmployeeDTO = await fetchEmployeeById(currentInternalCoPi);
      const newCoPi = {
        idNo: currentInternalCoPi,
        name: employeeData.name || '',
        designation: employeeData.designation || '',
        department: employeeData.department || '',
        faculty: employeeData.faculty || ''
      };
      
      setInternalCoPis(prev => [...prev, newCoPi]);
      setCurrentInternalCoPi('');
      setErrors((prev) => ({ ...prev, general: null }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, general: 'Internal Co-PI Employee not found.' }));
    }
  };

  const removeInternalCoPi = (index: number) => {
    setInternalCoPis(prev => prev.filter((_, i) => i !== index));
  };

  const addExternalCoPi = () => {
    if (externalCoPis.length >= 10) {
      setErrors((prev) => ({ ...prev, general: 'Maximum 10 External Co-PIs allowed.' }));
      return;
    }

    if (!currentExternalCoPi.idNo || !currentExternalCoPi.name) {
      setErrors((prev) => ({ ...prev, general: 'Please fill required fields for External Co-PI.' }));
      return;
    }

    setExternalCoPis(prev => [...prev, currentExternalCoPi]);
    setCurrentExternalCoPi({
      idNo: '', name: '', designation: '', city: '', state: '', country: ''
    });
    setErrors((prev) => ({ ...prev, general: null }));
  };

  const removeExternalCoPi = (index: number) => {
    setExternalCoPis(prev => prev.filter((_, i) => i !== index));
  };

  const handleCoPiIdNoValidation = async () => {
    const error = validateField('coPiIdNo', coPiIdNoInput);
    if (error) {
      setErrors((prev) => ({ ...prev, coPiIdNo: error }));
      return;
    }

    setValidatingCoPiIdNo(true);
    setCoPiIdNoValidationError('');

    try {
      console.log('[ProjectSubmissionForm] Validating Co-PI Employee ID', { coPiIdNoInput });
      const employeeData: EmployeeDTO = await fetchEmployeeById(coPiIdNoInput);
      console.log('[ProjectSubmissionForm] Co-PI Employee found', { employeeData });

      setFormData(prev => ({
        ...prev,
        coPiIdNo: coPiIdNoInput,
        coPiName: employeeData.name || '',
        coPiDesignation: employeeData.designation || '',
        coPiDepartment: employeeData.department || '',
        coPiFaculty: employeeData.faculty || '',
      }));
      setCoPiIdNoValidated(true);
      setErrors(prev => ({ ...prev, coPiIdNo: null }));
    } catch (error) {
      console.error('[ProjectSubmissionForm] Co-PI Employee ID validation error', { error });
      setCoPiIdNoValidationError('Co-PI Employee not found.');
    } finally {
      setValidatingCoPiIdNo(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue =
      name === 'totalProjectCost' || name === 'recurring' || name === 'nonRecurring' || name === 'overhead'
        ? parseFloat(value) || 0
        : value;

    console.log('[handleChange]', { name, value, parsedValue });
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name as keyof ProjectSubmissionDTO, parsedValue),
      costBreakdown: null,
    }));

    if (name === 'recurring') setRecurringPercentage('');
    if (name === 'nonRecurring') setNonRecurringPercentage('');
    if (name === 'overhead') setOverheadPercentage('');
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: 'recurring' | 'nonRecurring' | 'overhead') => {
    const percentage = e.target.value;
    const setPercentage = field === 'recurring' ? setRecurringPercentage : field === 'nonRecurring' ? setNonRecurringPercentage : setOverheadPercentage;

    setPercentage(percentage);
    setErrors((prev) => ({
      ...prev,
      [`${field}Percentage`]: validateField(`${field}Percentage`, percentage),
      costBreakdown: null,
    }));

    if (percentage && !isNaN(formData.totalProjectCost) && isFinite(formData.totalProjectCost) && formData.totalProjectCost > 0) {
      const calculatedValue = (parseFloat(percentage) / 100) * formData.totalProjectCost;
      console.log('[handlePercentageChange]', { field, percentage, totalProjectCost: formData.totalProjectCost, calculatedValue });
      setFormData((prev) => ({ ...prev, [field]: calculatedValue }));
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, calculatedValue),
        costBreakdown: null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: 0 }));
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, 0),
        costBreakdown: null,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
  
    const newErrors: FormErrors = {};
    const fields: (keyof Omit<ProjectSubmissionDTO, 'timestamp' | 'idNo'>)[] = [
      'principalInvestigatorName',
      'designation',
      'department',
      'faculty',
      'projectName',
      'projectCode',
      'fundingAgencyId',
      'durationOfProject',
      'typeOfProject',
      'totalProjectCost',
      'recurring',
      'nonRecurring',
      'overhead',
      'dateOfSubmission',
      'remark',
    ];
  
    fields.forEach((key) => {
      const error = validateField(key, formData[key] as string | number | undefined);
      if (error) {
        // Map the field to the corresponding error property
        switch (key) {
          case 'principalInvestigatorName':
            newErrors.principalInvestigatorName = error;
            break;
          case 'designation':
            newErrors.designation = error;
            break;
          case 'department':
            newErrors.department = error;
            break;
          case 'faculty':
            newErrors.faculty = error;
            break;
          case 'projectName':
            newErrors.projectName = error;
            break;
          case 'projectCode':
            newErrors.projectCode = error;
            break;
          case 'fundingAgencyId':
            newErrors.fundingAgencyId = error;
            break;
          case 'durationOfProject':
            newErrors.durationOfProject = error;
            break;
          case 'typeOfProject':
            newErrors.typeOfProject = error;
            break;
          case 'totalProjectCost':
            newErrors.totalProjectCost = error;
            break;
          case 'recurring':
            newErrors.recurring = error;
            break;
          case 'nonRecurring':
            newErrors.nonRecurring = error;
            break;
          case 'overhead':
            newErrors.overhead = error;
            break;
          case 'dateOfSubmission':
            newErrors.dateOfSubmission = error;
            break;
          case 'remark':
            newErrors.remark = error;
            break;
        }
      }
    });
  
    if (!idNoValidated) newErrors.idNoInput = 'Please validate the Employee ID first.';
  
    const costError = validateCostBreakdown();
    if (costError) newErrors.costBreakdown = costError;
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log('[handleSubmit] Validation errors:', newErrors);
      return;
    }
  
    setLoading(true);
    try {
      console.log('[ProjectSubmissionForm] Submitting project submission', { formData });
      // const { timestamp, ...submitData } = formData;
      await createProjectSubmission(formData);
      console.log('[ProjectSubmissionForm] Project submission created successfully');
      onProjectSubmissionCreated?.();
      navigate('/project-submission/confirm', { state: { formData: { ...formData, timestamp: new Date().toISOString() } } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project submission.';
      console.error('[ProjectSubmissionForm] Error creating project submission', { error, message: errorMessage });
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white" style={{ background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)' }}>
              <div className="d-flex align-items-center">
                <i className="bi bi-send-fill fs-3 me-3"></i>
                <div>
                  <h2 className="card-title h4 mb-1">Add Project Submission</h2>
                  <p className="mb-0 opacity-75">Submit a new project proposal</p>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              {!idNoValidated ? (
                <div className="card border-info">
                  <div className="card-header bg-info text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-person-check me-2"></i>
                      Employee Validation Required
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Please validate the Employee ID before proceeding with project details.
                    </div>
                    <div className="mb-3">
                      <label htmlFor="idNoInput" className="form-label fw-bold">
                        <i className="bi bi-hash me-2"></i>
                        Employee ID (ID No) <span className="text-danger">*</span>
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
                          className="btn btn-info"
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
                            <>
                              <i className="bi bi-check-circle me-2"></i>
                              Validate
                            </>
                          )}
                        </button>
                      </div>
                      {(errors.idNoInput || idNoValidationError) && (
                        <div id="idNoInputFeedback" className="invalid-feedback d-block">
                          {errors.idNoInput || idNoValidationError}
                        </div>
                      )}
                      <div className="form-text">
                        <i className="bi bi-lightbulb me-1"></i>
                        Enter a valid Employee ID to auto-populate investigator details
                      </div>
                    </div>
                  </div>
                </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate aria-label="Add Project Submission Form">
              {errors.general && (
                <div className="alert alert-danger" role="alert" aria-live="assertive">
                  {errors.general}
                </div>
              )}
              {errors.costBreakdown && (
                <div className="alert alert-danger" role="alert" aria-live="assertive">
                  {errors.costBreakdown}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="principalInvestigatorName" className="form-label">
                  Principal Investigator Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.principalInvestigatorName ? 'is-invalid' : ''}`}
                  id="principalInvestigatorName"
                  name="principalInvestigatorName"
                  value={formData.principalInvestigatorName}
                  onChange={handleChange}
                  placeholder="e.g., Dr. John Doe"
                  required
                  aria-describedby="principalInvestigatorNameFeedback"
                  disabled={loading}
                />
                {errors.principalInvestigatorName && (
                  <div id="principalInvestigatorNameFeedback" className="invalid-feedback">
                    {errors.principalInvestigatorName}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="designation" className="form-label">
                  Designation
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.designation ? 'is-invalid' : ''}`}
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g., Professor"
                  aria-describedby="designationFeedback"
                  disabled={loading}
                />
                {errors.designation && (
                  <div id="designationFeedback" className="invalid-feedback">
                    {errors.designation}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="department" className="form-label">
                  Department
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science"
                  aria-describedby="departmentFeedback"
                  disabled={loading}
                />
                {errors.department && (
                  <div id="departmentFeedback" className="invalid-feedback">
                    {errors.department}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="faculty" className="form-label">
                  Faculty
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.faculty ? 'is-invalid' : ''}`}
                  id="faculty"
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  placeholder="e.g., Engineering"
                  aria-describedby="facultyFeedback"
                  disabled={loading}
                />
                {errors.faculty && (
                  <div id="facultyFeedback" className="invalid-feedback">
                    {errors.faculty}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="projectName" className="form-label">
                  Project Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.projectName ? 'is-invalid' : ''}`}
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="e.g., AI Research Project"
                  required
                  aria-describedby="projectNameFeedback"
                  disabled={loading}
                />
                {errors.projectName && (
                  <div id="projectNameFeedback" className="invalid-feedback">
                    {errors.projectName}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="projectCode" className="form-label">
                  Project Code
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="projectCode"
                  name="projectCode"
                  value={formData.projectCode || ''}
                  onChange={handleChange}
                  placeholder="e.g., P-07/0234"
                  disabled={loading}
                />
                <div className="form-text">Optional. Used to link with received projects and equipment.</div>
              </div>
              <div className="mb-3">
                <label htmlFor="fundingAgencyId" className="form-label">
                  Funding Agency <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${errors.fundingAgencyId ? 'is-invalid' : ''}`}
                  id="fundingAgencyId"
                  name="fundingAgencyId"
                  value={formData.fundingAgencyId}
                  onChange={handleChange}
                  aria-describedby="fundingAgencyIdFeedback"
                  disabled={loading}
                >
                  <option value="">Select Funding Agency</option>
                  {fundingAgencies.map((agency) => (
                    <option key={agency.fundingAgencyId} value={agency.fundingAgencyId}>
                      {agency.name}
                    </option>
                  ))}
                </select>
                {errors.fundingAgencyId && (
                  <div id="fundingAgencyIdFeedback" className="invalid-feedback">
                    {errors.fundingAgencyId}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="durationOfProject" className="form-label">
                  Duration of Project (months)
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.durationOfProject ? 'is-invalid' : ''}`}
                  id="durationOfProject"
                  name="durationOfProject"
                  value={formData.durationOfProject}
                  onChange={handleChange}
                  placeholder="e.g., 12"
                  aria-describedby="durationOfProjectFeedback"
                  disabled={loading}
                />
                {errors.durationOfProject && (
                  <div id="durationOfProjectFeedback" className="invalid-feedback">
                    {errors.durationOfProject}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="typeOfProject" className="form-label">
                  Type of Project
                </label>
                <select
                  className={`form-select ${errors.typeOfProject ? 'is-invalid' : ''}`}
                  id="typeOfProject"
                  name="typeOfProject"
                  value={formData.typeOfProject}
                  onChange={handleChange}
                  aria-describedby="typeOfProjectFeedback"
                  disabled={loading}
                >
                  <option value="">Select Type of Project</option>
                  {typeOfProjectOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.typeOfProject && (
                  <div id="typeOfProjectFeedback" className="invalid-feedback">
                    {errors.typeOfProject}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="totalProjectCost" className="form-label">
                  Total Project Cost (₹) <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input
                    type="number"
                    className={`form-control ${errors.totalProjectCost ? 'is-invalid' : ''}`}
                    id="totalProjectCost"
                    name="totalProjectCost"
                    value={formData.totalProjectCost || ''}
                    onChange={handleChange}
                    placeholder="e.g., 100000"
                    step="0.01"
                    min="0"
                    required
                    aria-describedby="totalProjectCostFeedback"
                    disabled={loading}
                  />
                </div>
                {errors.totalProjectCost && (
                  <div id="totalProjectCostFeedback" className="invalid-feedback">
                    {errors.totalProjectCost}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Recurring Cost (₹) <span className="text-danger">*</span></label>
                <div className="row">
                  <div className="col">
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="number"
                        className={`form-control ${errors.recurring ? 'is-invalid' : ''}`}
                        id="recurring"
                        name="recurring"
                        value={recurringPercentage ? '' : formData.recurring || ''}
                        onChange={handleChange}
                        placeholder="Enter amount or select percentage"
                        step="0.01"
                        min="0"
                        required
                        aria-describedby="recurringFeedback"
                        disabled={loading || !!recurringPercentage}
                      />
                    </div>
                    {errors.recurring && (
                      <div id="recurringFeedback" className="invalid-feedback">
                        {errors.recurring}
                      </div>
                    )}
                  </div>
                  <div className="col">
                    <input
                      type="number"
                      className={`form-control ${errors.recurringPercentage ? 'is-invalid' : ''}`}
                      id="recurringPercentage"
                      value={recurringPercentage}
                      onChange={(e) => handlePercentageChange(e, 'recurring')}
                      placeholder="Enter percentage (0-100)"
                      min="0"
                      max="100"
                      step="0.01"
                      aria-describedby="recurringPercentageFeedback"
                      disabled={loading || formData.totalProjectCost <= 0}
                    />
                    {errors.recurringPercentage && (
                      <div id="recurringPercentageFeedback" className="invalid-feedback">
                        {errors.recurringPercentage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Non-Recurring Cost (₹) <span className="text-danger">*</span></label>
                <div className="row">
                  <div className="col">
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="number"
                        className={`form-control ${errors.nonRecurring ? 'is-invalid' : ''}`}
                        id="nonRecurring"
                        name="nonRecurring"
                        value={nonRecurringPercentage ? '' : formData.nonRecurring || ''}
                        onChange={handleChange}
                        placeholder="Enter amount or select percentage"
                        step="0.01"
                        min="0"
                        required
                        aria-describedby="nonRecurringFeedback"
                        disabled={loading || !!nonRecurringPercentage}
                      />
                    </div>
                    {errors.nonRecurring && (
                      <div id="nonRecurringFeedback" className="invalid-feedback">
                        {errors.nonRecurring}
                      </div>
                    )}
                  </div>
                  <div className="col">
                    <input
                      type="number"
                      className={`form-control ${errors.nonRecurringPercentage ? 'is-invalid' : ''}`}
                      id="nonRecurringPercentage"
                      value={nonRecurringPercentage}
                      onChange={(e) => handlePercentageChange(e, 'nonRecurring')}
                      placeholder="Enter percentage (0-100)"
                      min="0"
                      max="100"
                      step="0.01"
                      aria-describedby="nonRecurringPercentageFeedback"
                      disabled={loading || formData.totalProjectCost <= 0}
                    />
                    {errors.nonRecurringPercentage && (
                      <div id="nonRecurringPercentageFeedback" className="invalid-feedback">
                        {errors.nonRecurringPercentage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Overhead (₹) <span className="text-danger">*</span></label>
                <div className="row">
                  <div className="col">
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="number"
                        className={`form-control ${errors.overhead ? 'is-invalid' : ''}`}
                        id="overhead"
                        name="overhead"
                        value={overheadPercentage ? '' : formData.overhead || ''}
                        onChange={handleChange}
                        placeholder="Enter amount or select percentage"
                        step="0.01"
                        min="0"
                        required
                        aria-describedby="overheadFeedback"
                        disabled={loading || !!overheadPercentage}
                      />
                    </div>
                    {errors.overhead && (
                      <div id="overheadFeedback" className="invalid-feedback">
                        {errors.overhead}
                      </div>
                    )}
                  </div>
                  <div className="col">
                    <input
                      type="number"
                      className={`form-control ${errors.overheadPercentage ? 'is-invalid' : ''}`}
                      id="overheadPercentage"
                      value={overheadPercentage}
                      onChange={(e) => handlePercentageChange(e, 'overhead')}
                      placeholder="Enter percentage (0-100)"
                      min="0"
                      max="100"
                      step="0.01"
                      aria-describedby="overheadPercentageFeedback"
                      disabled={loading || formData.totalProjectCost <= 0}
                    />
                    {errors.overheadPercentage && (
                      <div id="overheadPercentageFeedback" className="invalid-feedback">
                        {errors.overheadPercentage}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Co-PI Section */}
              <div className="mb-4">
                <h5 className="mb-3" style={{ color: '#495057' }}>Co-Principal Investigator (Co-PI)</h5>
                <div className="mb-3">
                  <label className="form-label">Do you have a Co-PI for this project?</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="hasCoPi"
                      id="hasCoPiYes"
                      value="true"
                      checked={formData.hasCoPi === true}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          hasCoPi: true,
                          coPiType: undefined,
                          coPiIdNo: '',
                          coPiName: '',
                          coPiDesignation: '',
                          coPiDepartment: '',
                          coPiFaculty: '',
                          coPiCity: '',
                          coPiState: '',
                          coPiCountry: ''
                        }));
                        setCoPiIdNoValidated(false);
                        setCoPiIdNoInput('');
                      }}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="hasCoPiYes">
                      Yes
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="hasCoPi"
                      id="hasCoPiNo"
                      value="false"
                      checked={formData.hasCoPi === false}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          hasCoPi: false,
                          coPiType: undefined,
                          coPiIdNo: '',
                          coPiName: '',
                          coPiDesignation: '',
                          coPiDepartment: '',
                          coPiFaculty: '',
                          coPiCity: '',
                          coPiState: '',
                          coPiCountry: ''
                        }));
                        setCoPiIdNoValidated(false);
                        setCoPiIdNoInput('');
                      }}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="hasCoPiNo">
                      No
                    </label>
                  </div>
                </div>

                {formData.hasCoPi && (
                  <div className="border rounded p-3 bg-light">
                    <div className="row">
                      {/* Internal Co-PIs Section */}
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-header bg-primary text-white">
                            <h6 className="mb-0">
                              <i className="bi bi-people me-2"></i>
                              Internal Co-PIs (Employee ID based)
                            </h6>
                            <small>Maximum 10 Internal Co-PIs allowed</small>
                          </div>
                          <div className="card-body">
                            {/* Add Internal Co-PI Form */}
                            <div className="mb-3">
                              <label htmlFor="currentInternalCoPi" className="form-label">
                                Employee ID <span className="text-danger">*</span>
                              </label>
                              <div className="input-group">
                                <input
                                  type="text"
                                  className="form-control"
                                  id="currentInternalCoPi"
                                  value={currentInternalCoPi}
                                  onChange={(e) => setCurrentInternalCoPi(e.target.value)}
                                  placeholder="Enter Employee ID"
                                  disabled={loading || internalCoPis.length >= 10}
                                />
                                <button
                                  type="button"
                                  className="btn btn-success"
                                  onClick={addInternalCoPi}
                                  disabled={loading || !currentInternalCoPi || internalCoPis.length >= 10}
                                >
                                  <i className="bi bi-plus-circle me-1"></i>
                                  Add
                                </button>
                              </div>
                              {internalCoPis.length >= 10 && (
                                <div className="text-warning mt-1">
                                  <small>Maximum limit of 10 Internal Co-PIs reached.</small>
                                </div>
                              )}
                            </div>

                            {/* Internal Co-PIs List */}
                            {internalCoPis.length > 0 && (
                              <div>
                                <h6>Added Internal Co-PIs ({internalCoPis.length}/10):</h6>
                                <div className="list-group">
                                  {internalCoPis.map((coPi, index) => (
                                    <div key={index} className="list-group-item">
                                      <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                          <h6 className="mb-1">{coPi.name}</h6>
                                          <p className="mb-1">
                                            <strong>ID:</strong> {coPi.idNo} | 
                                            <strong> Designation:</strong> {coPi.designation}
                                          </p>
                                          <small className="text-muted">
                                            {coPi.department}, {coPi.faculty}
                                          </small>
                                        </div>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => removeInternalCoPi(index)}
                                          disabled={loading}
                                        >
                                          <i className="bi bi-trash"></i>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* External Co-PIs Section */}
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-header bg-success text-white">
                            <h6 className="mb-0">
                              <i className="bi bi-globe me-2"></i>
                              External Co-PIs (Manual entry)
                            </h6>
                            <small>Maximum 10 External Co-PIs allowed</small>
                          </div>
                          <div className="card-body">
                            {/* Add External Co-PI Form */}
                            <div className="row">
                              <div className="col-12 mb-2">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Employee ID *"
                                  value={currentExternalCoPi.idNo}
                                  onChange={(e) => setCurrentExternalCoPi(prev => ({...prev, idNo: e.target.value}))}
                                  disabled={loading || externalCoPis.length >= 10}
                                />
                              </div>
                              <div className="col-12 mb-2">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Name *"
                                  value={currentExternalCoPi.name}
                                  onChange={(e) => setCurrentExternalCoPi(prev => ({...prev, name: e.target.value}))}
                                  disabled={loading || externalCoPis.length >= 10}
                                />
                              </div>
                              <div className="col-12 mb-2">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Designation"
                                  value={currentExternalCoPi.designation}
                                  onChange={(e) => setCurrentExternalCoPi(prev => ({...prev, designation: e.target.value}))}
                                  disabled={loading || externalCoPis.length >= 10}
                                />
                              </div>
                              <div className="col-6 mb-2">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="City"
                                  value={currentExternalCoPi.city}
                                  onChange={(e) => setCurrentExternalCoPi(prev => ({...prev, city: e.target.value}))}
                                  disabled={loading || externalCoPis.length >= 10}
                                />
                              </div>
                              <div className="col-6 mb-2">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="State"
                                  value={currentExternalCoPi.state}
                                  onChange={(e) => setCurrentExternalCoPi(prev => ({...prev, state: e.target.value}))}
                                  disabled={loading || externalCoPis.length >= 10}
                                />
                              </div>
                              <div className="col-12 mb-3">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Country"
                                  value={currentExternalCoPi.country}
                                  onChange={(e) => setCurrentExternalCoPi(prev => ({...prev, country: e.target.value}))}
                                  disabled={loading || externalCoPis.length >= 10}
                                />
                              </div>
                              <div className="col-12">
                                <button
                                  type="button"
                                  className="btn btn-success btn-sm w-100"
                                  onClick={addExternalCoPi}
                                  disabled={loading || !currentExternalCoPi.idNo || !currentExternalCoPi.name || externalCoPis.length >= 10}
                                >
                                  <i className="bi bi-plus-circle me-1"></i>
                                  Add External Co-PI
                                </button>
                              </div>
                            </div>
                            {externalCoPis.length >= 10 && (
                              <div className="text-warning mt-2">
                                <small>Maximum limit of 10 External Co-PIs reached.</small>
                              </div>
                            )}

                            {/* External Co-PIs List */}
                            {externalCoPis.length > 0 && (
                              <div className="mt-3">
                                <h6>Added External Co-PIs ({externalCoPis.length}/10):</h6>
                                <div className="list-group">
                                  {externalCoPis.map((coPi, index) => (
                                    <div key={index} className="list-group-item">
                                      <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                          <h6 className="mb-1">{coPi.name}</h6>
                                          <p className="mb-1">
                                            <strong>ID:</strong> {coPi.idNo} | 
                                            <strong> Designation:</strong> {coPi.designation}
                                          </p>
                                          <small className="text-muted">
                                            {coPi.city}, {coPi.state}, {coPi.country}
                                          </small>
                                        </div>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => removeExternalCoPi(index)}
                                          disabled={loading}
                                        >
                                          <i className="bi bi-trash"></i>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.coPiType === 'internal' && (
                      <div>
                        {!coPiIdNoValidated ? (
                          <div className="mb-3">
                            <label htmlFor="coPiIdNoInput" className="form-label">
                              Co-PI Employee ID <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <input
                                type="text"
                                className={`form-control ${errors.coPiIdNo || coPiIdNoValidationError ? 'is-invalid' : ''}`}
                                id="coPiIdNoInput"
                                value={coPiIdNoInput}
                                onChange={(e) => {
                                  setCoPiIdNoInput(e.target.value);
                                  setErrors((prev) => ({ ...prev, coPiIdNo: validateField('coPiIdNo', e.target.value) }));
                                  setCoPiIdNoValidationError('');
                                }}
                                placeholder="Enter Co-PI Employee ID"
                                disabled={loading || validatingCoPiIdNo}
                              />
                              <button
                                className="btn btn-primary"
                                type="button"
                                onClick={handleCoPiIdNoValidation}
                                disabled={loading || validatingCoPiIdNo || !coPiIdNoInput || !!errors.coPiIdNo}
                              >
                                {validatingCoPiIdNo ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Validating...
                                  </>
                                ) : (
                                  'Validate'
                                )}
                              </button>
                              {(errors.coPiIdNo || coPiIdNoValidationError) && (
                                <div className="invalid-feedback d-block">
                                  {errors.coPiIdNo || coPiIdNoValidationError}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="alert alert-success">
                            <strong>Co-PI Details (Auto-populated from Employee ID):</strong>
                            <br />
                            <strong>Name:</strong> {formData.coPiName}
                            <br />
                            <strong>Designation:</strong> {formData.coPiDesignation}
                            <br />
                            <strong>Department:</strong> {formData.coPiDepartment}
                            <br />
                            <strong>Faculty:</strong> {formData.coPiFaculty}
                            <br />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary mt-2"
                              onClick={() => {
                                setCoPiIdNoValidated(false);
                                setCoPiIdNoInput('');
                                setFormData(prev => ({
                                  ...prev,
                                  coPiIdNo: '',
                                  coPiName: '',
                                  coPiDesignation: '',
                                  coPiDepartment: '',
                                  coPiFaculty: ''
                                }));
                              }}
                            >
                              Change Co-PI
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {formData.coPiType === 'external' && (
                      <div>
                        <div className="mb-3">
                          <label htmlFor="coPiName" className="form-label">
                            Co-PI Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors.coPiName ? 'is-invalid' : ''}`}
                            id="coPiName"
                            name="coPiName"
                            value={formData.coPiName || ''}
                            onChange={handleChange}
                            placeholder="Enter Co-PI Name"
                            disabled={loading}
                          />
                          {errors.coPiName && (
                            <div className="invalid-feedback">
                              {errors.coPiName}
                            </div>
                          )}
                        </div>
                        <div className="mb-3">
                          <label htmlFor="coPiDesignation" className="form-label">
                            Co-PI Designation <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors.coPiDesignation ? 'is-invalid' : ''}`}
                            id="coPiDesignation"
                            name="coPiDesignation"
                            value={formData.coPiDesignation || ''}
                            onChange={handleChange}
                            placeholder="Enter Co-PI Designation"
                            disabled={loading}
                          />
                          {errors.coPiDesignation && (
                            <div className="invalid-feedback">
                              {errors.coPiDesignation}
                            </div>
                          )}
                        </div>
                        <div className="mb-3">
                          <h6>Institution Address</h6>
                          <div className="row">
                            <div className="col-md-4">
                              <label htmlFor="coPiCity" className="form-label">
                                City <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className={`form-control ${errors.coPiCity ? 'is-invalid' : ''}`}
                                id="coPiCity"
                                name="coPiCity"
                                value={formData.coPiCity || ''}
                                onChange={handleChange}
                                placeholder="Enter City"
                                disabled={loading}
                              />
                              {errors.coPiCity && (
                                <div className="invalid-feedback">
                                  {errors.coPiCity}
                                </div>
                              )}
                            </div>
                            <div className="col-md-4">
                              <label htmlFor="coPiState" className="form-label">
                                State <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className={`form-control ${errors.coPiState ? 'is-invalid' : ''}`}
                                id="coPiState"
                                name="coPiState"
                                value={formData.coPiState || ''}
                                onChange={handleChange}
                                placeholder="Enter State"
                                disabled={loading}
                              />
                              {errors.coPiState && (
                                <div className="invalid-feedback">
                                  {errors.coPiState}
                                </div>
                              )}
                            </div>
                            <div className="col-md-4">
                              <label htmlFor="coPiCountry" className="form-label">
                                Country <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className={`form-control ${errors.coPiCountry ? 'is-invalid' : ''}`}
                                id="coPiCountry"
                                name="coPiCountry"
                                value={formData.coPiCountry || ''}
                                onChange={handleChange}
                                placeholder="Enter Country"
                                disabled={loading}
                              />
                              {errors.coPiCountry && (
                                <div className="invalid-feedback">
                                  {errors.coPiCountry}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="dateOfSubmission" className="form-label">
                  Submission Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${errors.dateOfSubmission ? 'is-invalid' : ''}`}
                  id="dateOfSubmission"
                  name="dateOfSubmission"
                  value={formData.dateOfSubmission}
                  onChange={handleChange}
                  required
                  aria-describedby="dateOfSubmissionFeedback"
                  disabled={loading}
                />
                {errors.dateOfSubmission && (
                  <div id="dateOfSubmissionFeedback" className="invalid-feedback">
                    {errors.dateOfSubmission}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="remark" className="form-label">
                  Remark
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.remark ? 'is-invalid' : ''}`}
                  id="remark"
                  name="remark"
                  value={formData.remark || ''}
                  onChange={handleChange}
                  placeholder="e.g., Additional notes"
                  aria-describedby="remarkFeedback"
                  disabled={loading}
                />
                {errors.remark && (
                  <div id="remarkFeedback" className="invalid-feedback">
                    {errors.remark}
                  </div>
                )}
              </div>
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => navigate('/')}
                  disabled={loading}
                  aria-label="Cancel"
                >
                  <i className="bi bi-house me-2"></i>
                  Back to Home
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
      </div>
    </div>
  );
};

export default ProjectSubmissionForm; 