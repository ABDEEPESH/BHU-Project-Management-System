import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjectByProjectCode, fetchEmployees, fetchProjects, fetchProjectSubmissions, fetchFundingAgencyByFundingAgencyId, fetchProjectReceiveds } from '../services/api';
import type { EquipmentDTO, ProjectResponseDTO, EmployeeDTO, ProjectSubmissionDTO, ProjectReceivedDTO } from '../types';

const EquipmentForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EquipmentDTO>({
    voucherNumber: '',
    manufactureName: '',
    equipmentName: '',
    caste: '',
    date: new Date().toISOString().split('T')[0],
    projectNumber: '',
    projectTitle: '',
    employeeId: '',
    employeeName: ''
  });

  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [project, setProject] = useState<ProjectResponseDTO | null>(null);
  const [projectCodes, setProjectCodes] = useState<string[]>([]);
  const [submissionsByCode, setSubmissionsByCode] = useState<Record<string, ProjectSubmissionDTO>>({});
  const [receivedByCode, setReceivedByCode] = useState<Record<string, ProjectReceivedDTO>>({});
  const [fundingAgencyName, setFundingAgencyName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [projectCodeError, setProjectCodeError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employeeData = await fetchEmployees();
        setEmployees(employeeData);
      } catch (err) {
        console.error('Failed to load employees:', err);
      }
    };
    const loadProjectCodes = async () => {
      try {
        const all = await fetchProjects();
        const codesFromProjects = Array.isArray(all) ? all.map(p => p.projectCode).filter(Boolean) : [];
        const subs = await fetchProjectSubmissions();
        const codesFromSubs = Array.isArray(subs?.submissions)
          ? subs.submissions.map(s => s.projectCode).filter((c): c is string => Boolean(c))
          : [];
        const receivedResp = await fetchProjectReceiveds();
        const receivedList = Array.isArray(receivedResp?.projects) ? receivedResp.projects : [];
        const codesFromReceived = receivedList.map(r => r.projectCode).filter((c): c is string => Boolean(c));
        if (Array.isArray(subs?.submissions)) {
          const map: Record<string, ProjectSubmissionDTO> = {};
          subs.submissions.forEach(s => { if (s.projectCode) { map[s.projectCode] = s; } });
          setSubmissionsByCode(map);
        }
        const recMap: Record<string, ProjectReceivedDTO> = {};
        receivedList.forEach(r => { if (r.projectCode) { recMap[r.projectCode] = r; } });
        setReceivedByCode(recMap);
        const merged = Array.from(new Set([...codesFromProjects, ...codesFromSubs, ...codesFromReceived]));
        setProjectCodes(merged);
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    loadEmployees();
    loadProjectCodes();
  }, []);

  useEffect(() => {
    const code = formData.projectNumber?.trim();
    if (!code) {
      setProject(null);
      setFundingAgencyName('');
      setProjectCodeError(null);
      return;
    }
    const handle = setTimeout(() => {
      // Trigger validation/autofill once the user pauses typing
      validateProjectNumber(code);
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.projectNumber]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-populate employee name when employee ID is selected
    if (name === 'employeeId') {
      const selectedEmployee = employees.find(emp => emp._id === value);
      setFormData(prev => ({
        ...prev,
        employeeName: selectedEmployee ? selectedEmployee.name : ''
      }));
    }
  };

  const validateProjectNumber = async (projectNumber: string) => {
    if (!projectNumber.trim()) {
      setProjectCodeError('Project code is required');
      setProject(null);
      setFundingAgencyName('');
      return false;
    }

    try {
      const projectData = await fetchProjectByProjectCode(projectNumber);
      setProject(projectData);
      setProjectCodeError(null);
      // Auto-populate project title
      setFormData(prev => ({
        ...prev,
        projectTitle: projectData.title
      }));
      // Resolve funding agency name
      try {
        if (projectData.fundingAgencyId) {
          const fa = await fetchFundingAgencyByFundingAgencyId(projectData.fundingAgencyId);
          setFundingAgencyName(fa?.name || projectData.fundingAgencyId);
        } else {
          setFundingAgencyName('');
        }
      } catch {
        setFundingAgencyName(projectData.fundingAgencyId || '');
      }
      return true;
    } catch (error) {
      // Fallback to Project Submissions map
      const sub = submissionsByCode[projectNumber];
      if (sub) {
        setProject(null);
        setProjectCodeError(null);
        setFormData(prev => ({
          ...prev,
          projectTitle: sub.projectName || ''
        }));
        try {
          if (sub.fundingAgencyId) {
            const fa = await fetchFundingAgencyByFundingAgencyId(sub.fundingAgencyId);
            setFundingAgencyName(fa?.name || sub.fundingAgencyId);
          } else {
            setFundingAgencyName('');
          }
        } catch {
          setFundingAgencyName(sub.fundingAgencyId || '');
        }
        return true;
      }
      // Fallback to Project Receiveds map
      const rec = receivedByCode[projectNumber];
      if (rec) {
        setProject(null);
        setProjectCodeError(null);
        setFormData(prev => ({
          ...prev,
          projectTitle: rec.projectName || ''
        }));
        try {
          if (rec.fundingAgencyId) {
            const fa = await fetchFundingAgencyByFundingAgencyId(rec.fundingAgencyId);
            setFundingAgencyName(fa?.name || rec.fundingAgencyId);
          } else {
            setFundingAgencyName('');
          }
        } catch {
          setFundingAgencyName(rec.fundingAgencyId || '');
        }
        return true;
      }
      setProjectCodeError('Project code not found. Please enter a valid code (e.g., P-07/0234).');
      setProject(null);
      setFundingAgencyName('');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate project number
      const isProjectValid = await validateProjectNumber(formData.projectNumber);
      if (!isProjectValid) {
        setError('Please enter a valid project code');
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.voucherNumber.trim()) {
        setError('Voucher number is required');
        setLoading(false);
        return;
      }

      if (!formData.manufactureName.trim()) {
        setError('Manufacture name is required');
        setLoading(false);
        return;
      }

      if (!formData.equipmentName.trim()) {
        setError('Equipment name is required');
        setLoading(false);
        return;
      }

      if (!formData.caste.trim()) {
        setError('Category/Type is required');
        setLoading(false);
        return;
      }

      // Here you would typically call an API to create the equipment
      // const createdEquipment = await createEquipment(formData);
      console.log('Equipment data to be created:', formData);
      
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/equipment');
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create equipment entry';
      setError(errorMessage);
      console.error('[EquipmentForm] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h2 className="h4 mb-0">
                <i className="bi bi-tools me-2"></i>
                Equipment Registration Form
              </h2>
            </div>
            <div className="card-body">
              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  Equipment registered successfully! Redirecting to equipment list...
                  <button type="button" className="btn-close" onClick={() => setSuccess(false)}></button>
                </div>
              )}

              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Voucher and Manufacture Details */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="voucherNumber" className="form-label fw-bold">
                      Voucher Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="voucherNumber"
                      name="voucherNumber"
                      value={formData.voucherNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., VCH-001"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="manufactureName" className="form-label fw-bold">
                      Manufacture Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="manufactureName"
                      name="manufactureName"
                      value={formData.manufactureName}
                      onChange={handleInputChange}
                      placeholder="e.g., Dell, HP, Zeiss"
                      required
                    />
                  </div>
                </div>

                {/* Equipment Details */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="equipmentName" className="form-label fw-bold">
                      Equipment Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="equipmentName"
                      name="equipmentName"
                      value={formData.equipmentName}
                      onChange={handleInputChange}
                      placeholder="e.g., Laptop, Microscope, Centrifuge"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="caste" className="form-label fw-bold">
                      Category/Type <span className="text-danger">*</span>
                    </label>
                    <select
  className="form-select"
  id="caste"
  name="caste"
  value={formData.caste}
  onChange={handleInputChange}
  required
>
  <option value="">Select Category</option>
  <option value="SC/ST">SC/ST</option>
  <option value="PwD">PwD</option>
  <option value="OBC">OBC</option>
  <option value="General">General</option>
</select>
                  </div>
                </div>

                {/* Date and Project Details */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="date" className="form-label fw-bold">
                      Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="projectNumber" className="form-label fw-bold">
                      Project Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${projectCodeError ? 'is-invalid' : ''}`}
                      id="projectNumber"
                      name="projectNumber"
                      value={formData.projectNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., P-07/0234"
                      list="project-codes"
                      required
                    />
                    {projectCodeError && (
                      <div className="invalid-feedback">{projectCodeError}</div>
                    )}
                    {project && (
                      <div className="form-text text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Project found: {project.title}
                      </div>
                    )}
                    <div className="form-text">Format: P-07/0234 (Project Code)</div>
                    <datalist id="project-codes">
                      {projectCodes.map((code) => (
                        <option key={code} value={code} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Auto-populated Project Title & Funding Agency */}
                {(project || formData.projectTitle || fundingAgencyName) && (
                  <div className="row mb-4">
                    <div className="col-md-8">
                      <label className="form-label fw-bold">Project Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.projectTitle || ''}
                        readOnly
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Funding Agency</label>
                      <input
                        type="text"
                        className="form-control"
                        value={fundingAgencyName || ''}
                        readOnly
                      />
                    </div>
                  </div>
                )}

                {/* Employee Details */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="employeeId" className="form-label fw-bold">
                      Assigned Employee
                    </label>
                    <select
                      className="form-select"
                      id="employeeId"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Employee (Optional)</option>
                      {employees.map(employee => (
                        <option key={employee._id} value={employee._id}>
                          {employee.name} - {employee.designation}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="employeeName" className="form-label fw-bold">
                      Employee Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="employeeName"
                      name="employeeName"
                      value={formData.employeeName}
                      readOnly
                      placeholder="Auto-populated when employee is selected"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="row">
                  <div className="col-12">
                    <div className="d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/equipment')}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Equipment List
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Registering...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Register Equipment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentForm;