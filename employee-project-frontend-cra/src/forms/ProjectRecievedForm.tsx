import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProjectReceived, fetchEmployeeById, fetchFundingAgencies } from '../services/api';
import type { EmployeeDTO, FundingAgencyDTO, ProjectReceivedDTO } from '../types';

interface ProjectReceivedFormProps {
  onProjectReceivedCreated?: () => void;
}

interface FormErrors {
  idNoInput?: string | null;
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
  dateOfReceipt?: string | null;
  financialYear?: string | null;
  remark?: string | null;
  general?: string | null;
  costBreakdown?: string | null;
}

const typeOfProjectOptions = ['Research', 'Development', 'Consultancy', 'Training'];
const percentageOptions = Array.from({ length: 11 }, (_, i) => i * 5); // 0%, 5%, ..., 50%

const ProjectReceivedForm: React.FC<ProjectReceivedFormProps> = ({ onProjectReceivedCreated }) => {
  const navigate = useNavigate();
  const [idNoInput, setIdNoInput] = useState<string>('');
  const [idNoValidated, setIdNoValidated] = useState<boolean>(false);
  const [idNoValidationError, setIdNoValidationError] = useState<string>('');
  const [validatingIdNo, setValidatingIdNo] = useState<boolean>(false);
  const [fundingAgencies, setFundingAgencies] = useState<FundingAgencyDTO[]>([]);
  const [formData, setFormData] = useState<ProjectReceivedDTO>({
    _id: '',
    idNo: '',
    principalInvestigatorName: '',
    designation: '',
    department: '',
    faculty: '',
    projectName: '',
    fundingAgencyId: '',
    durationOfProject: '',
    typeOfProject: '',
    totalProjectCost: 0,
    recurring: 0,
    nonRecurring: 0,
    overhead: 0,
    dateOfReceipt: '',
    financialYear: '',
    timestamp: '',
    remark: '',
  });
  const [recurringPercentage, setRecurringPercentage] = useState<string>('');
  const [nonRecurringPercentage, setNonRecurringPercentage] = useState<string>('');
  const [overheadPercentage, setOverheadPercentage] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFundingAgencies = async () => {
      try {
        const agencies = await fetchFundingAgencies();
        setFundingAgencies(agencies);
      } catch (error) {
        setErrors((prev) => ({ ...prev, general: 'Failed to load funding agencies.' }));
      }
    };
    loadFundingAgencies();
  }, []);

  const validateField = (
    name: keyof ProjectReceivedDTO | 'idNoInput' | 'recurringPercentage' | 'nonRecurringPercentage' | 'overheadPercentage',
    value: string | number | undefined
  ): string | null => {
    if (name === '_id' || name === 'timestamp') return null;

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
        case 'dateOfReceipt':
          return 'Receipt Date is required.';
        case 'financialYear':
          return 'Financial Year is required.';
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
        if (typeof value === 'number' && value < 0) return 'Total Project Cost cannot be negative.';
        return null;
      case 'recurring':
        if (typeof value === 'number' && value < 0) return 'Recurring cost cannot be negative.';
        return null;
      case 'nonRecurring':
        if (typeof value === 'number' && value < 0) return 'Non-Recurring cost cannot be negative.';
        return null;
      case 'overhead':
        if (typeof value === 'number' && value < 0) return 'Overhead cannot be negative.';
        return null;
      case 'recurringPercentage':
      case 'nonRecurringPercentage':
      case 'overheadPercentage':
        if (typeof value === 'string' && value && !percentageOptions.includes(parseInt(value))) return 'Invalid percentage selected.';
        return null;
      case 'dateOfReceipt':
        if (typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Invalid date format (YYYY-MM-DD).';
        return null;
      case 'financialYear':
        if (typeof value === 'string' && !/^\d{4}-\d{2}$/.test(value)) return 'Invalid financial year format (YYYY-YY).';
        return null;
      case 'remark':
        if (typeof value === 'string' && value.length > 200) return 'Remark must be at most 200 characters.';
        return null;
      default:
        return null;
    }
  };

  const validateCostBreakdown = () => {
    const { totalProjectCost, recurring, nonRecurring, overhead } = formData;
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
      const employeeData: EmployeeDTO = await fetchEmployeeById(idNoInput);
      setFormData({
        ...formData,
        idNo: idNoInput,
        principalInvestigatorName: employeeData.name || '',
        designation: employeeData.designation || '',
        department: employeeData.department || '',
        faculty: employeeData.faculty || '',
      });
      setIdNoValidated(true);
      setErrors({});
    } catch (error) {
      setIdNoValidationError('Employee not found.');
    } finally {
      setValidatingIdNo(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue =
      name === 'totalProjectCost' || name === 'recurring' || name === 'nonRecurring' || name === 'overhead'
        ? parseFloat(value) || 0
        : value;

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name as keyof ProjectReceivedDTO, parsedValue),
      costBreakdown: null,
    }));

    if (name === 'recurring') setRecurringPercentage('');
    if (name === 'nonRecurring') setNonRecurringPercentage('');
    if (name === 'overhead') setOverheadPercentage('');
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLSelectElement>, field: 'recurring' | 'nonRecurring' | 'overhead') => {
    const percentage = e.target.value;
    const setPercentage = field === 'recurring' ? setRecurringPercentage : field === 'nonRecurring' ? setNonRecurringPercentage : setOverheadPercentage;

    setPercentage(percentage);
    setErrors((prev) => ({
      ...prev,
      [`${field}Percentage`]: validateField(`${field}Percentage`, percentage),
      costBreakdown: null,
    }));

    if (percentage) {
      const calculatedValue = (parseFloat(percentage) / 100) * formData.totalProjectCost;
      setFormData((prev) => ({ ...prev, [field]: calculatedValue }));
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, calculatedValue),
        costBreakdown: null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: 0 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: FormErrors = {};
    const fields: (keyof Omit<ProjectReceivedDTO, '_id' | 'timestamp' | 'idNo'>)[] = [
      'principalInvestigatorName',
      'designation',
      'department',
      'faculty',
      'projectName',
      'fundingAgencyId',
      'durationOfProject',
      'typeOfProject',
      'totalProjectCost',
      'recurring',
      'nonRecurring',
      'overhead',
      'dateOfReceipt',
      'financialYear',
      'remark',
    ];

    fields.forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (!idNoValidated) newErrors.idNoInput = 'Please validate the Employee ID first.';

    const costError = validateCostBreakdown();
    if (costError) newErrors.costBreakdown = costError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await createProjectReceived(formData);
      onProjectReceivedCreated?.();
      navigate('/project-received/confirm', { state: { formData: { ...formData, timestamp: new Date().toISOString() } } });
    } catch (error) {
      setErrors((prev) => ({ ...prev, general: 'Failed to create project received.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white" style={{ background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)' }}>
              <div className="d-flex align-items-center">
                <i className="bi bi-inbox-fill fs-3 me-3"></i>
                <div>
                  <h2 className="card-title h4 mb-1">Add Project Received</h2>
                  <p className="mb-0 opacity-75">Register a received project in the system</p>
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
                <form onSubmit={handleSubmit} noValidate aria-label="Add Project Received Form">
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
                    <label htmlFor="designation" className="form-label">Designation</label>
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
                    <label htmlFor="department" className="form-label">Department</label>
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
                    <label htmlFor="faculty" className="form-label">Faculty</label>
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
                    <label htmlFor="durationOfProject" className="form-label">Duration of Project (months)</label>
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
                    <label htmlFor="typeOfProject" className="form-label">Type of Project</label>
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
                    <label htmlFor="totalProjectCost" className="form-label">Total Project Cost</label>
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
                      aria-describedby="totalProjectCostFeedback"
                      disabled={loading}
                    />
                    {errors.totalProjectCost && (
                      <div id="totalProjectCostFeedback" className="invalid-feedback">
                        {errors.totalProjectCost}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Recurring Cost</label>
                    <div className="row">
                      <div className="col">
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
                          aria-describedby="recurringFeedback"
                          disabled={loading || !!recurringPercentage}
                        />
                        {errors.recurring && (
                          <div id="recurringFeedback" className="invalid-feedback">
                            {errors.recurring}
                          </div>
                        )}
                      </div>
                      <div className="col">
                        <select
                          className={`form-select ${errors.recurringPercentage ? 'is-invalid' : ''}`}
                          id="recurringPercentage"
                          value={recurringPercentage}
                          onChange={(e) => handlePercentageChange(e, 'recurring')}
                          aria-describedby="recurringPercentageFeedback"
                          disabled={loading}
                        >
                          <option value="">Select Percentage</option>
                          {percentageOptions.map((percent) => (
                            <option key={percent} value={percent}>
                              {percent}%
                            </option>
                          ))}
                        </select>
                        {errors.recurringPercentage && (
                          <div id="recurringPercentageFeedback" className="invalid-feedback">
                            {errors.recurringPercentage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Non-Recurring Cost</label>
                    <div className="row">
                      <div className="col">
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
                          aria-describedby="nonRecurringFeedback"
                          disabled={loading || !!nonRecurringPercentage}
                        />
                        {errors.nonRecurring && (
                          <div id="nonRecurringFeedback" className="invalid-feedback">
                            {errors.nonRecurring}
                          </div>
                        )}
                      </div>
                      <div className="col">
                        <select
                          className={`form-select ${errors.nonRecurringPercentage ? 'is-invalid' : ''}`}
                          id="nonRecurringPercentage"
                          value={nonRecurringPercentage}
                          onChange={(e) => handlePercentageChange(e, 'nonRecurring')}
                          aria-describedby="nonRecurringPercentageFeedback"
                          disabled={loading}
                        >
                          <option value="">Select Percentage</option>
                          {percentageOptions.map((percent) => (
                            <option key={percent} value={percent}>
                              {percent}%
                            </option>
                          ))}
                        </select>
                        {errors.nonRecurringPercentage && (
                          <div id="nonRecurringPercentageFeedback" className="invalid-feedback">
                            {errors.nonRecurringPercentage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Overhead</label>
                    <div className="row">
                      <div className="col">
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
                          aria-describedby="overheadFeedback"
                          disabled={loading || !!overheadPercentage}
                        />
                        {errors.overhead && (
                          <div id="overheadFeedback" className="invalid-feedback">
                            {errors.overhead}
                          </div>
                        )}
                      </div>
                      <div className="col">
                        <select
                          className={`form-select ${errors.overheadPercentage ? 'is-invalid' : ''}`}
                          id="overheadPercentage"
                          value={overheadPercentage}
                          onChange={(e) => handlePercentageChange(e, 'overhead')}
                          aria-describedby="overheadPercentageFeedback"
                          disabled={loading}
                        >
                          <option value="">Select Percentage</option>
                          {percentageOptions.map((percent) => (
                            <option key={percent} value={percent}>
                              {percent}%
                            </option>
                          ))}
                        </select>
                        {errors.overheadPercentage && (
                          <div id="overheadPercentageFeedback" className="invalid-feedback">
                            {errors.overheadPercentage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="dateOfReceipt" className="form-label">
                      Receipt Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-control ${errors.dateOfReceipt ? 'is-invalid' : ''}`}
                      id="dateOfReceipt"
                      name="dateOfReceipt"
                      value={formData.dateOfReceipt}
                      onChange={handleChange}
                      required
                      aria-describedby="dateOfReceiptFeedback"
                      disabled={loading}
                    />
                    {errors.dateOfReceipt && (
                      <div id="dateOfReceiptFeedback" className="invalid-feedback">
                        {errors.dateOfReceipt}
                      </div>
                    )}
                  </div>

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
                      placeholder="e.g., 2025-26"
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
                    <label htmlFor="remark" className="form-label">Remark</label>
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

export default ProjectReceivedForm;