import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFundExpenditure, fetchProjectByProjectCode, checkFundExpenditureExists, fetchProjects, fetchProjectSubmissions, fetchProjectReceiveds, fetchFundingAgencyByFundingAgencyId } from '../services/api';
import type { ProjectSubmissionDTO, ProjectReceivedDTO } from '../types';
import type { FundExpenditureDTO, ProjectResponseDTO } from '../types';

const FundExpenditureForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FundExpenditureDTO>({
    projectCode: '',
    projectTitle: '',
    fundingAgency: '',
    financialYear: '',
    equipmentPurchase: 0,
    salary: 0,
    contingency: 0,
    overhead: 0,
    totalExpenditure: 0,
    dateOfExpenditure: new Date().toISOString().split('T')[0],
    remark: ''
  });

  const [project, setProject] = useState<ProjectResponseDTO | null>(null);
  const [projectCodes, setProjectCodes] = useState<string[]>([]);
  const [submissionsByCode, setSubmissionsByCode] = useState<Record<string, ProjectSubmissionDTO>>({});
  const [receivedByCode, setReceivedByCode] = useState<Record<string, ProjectReceivedDTO>>({});
  const [projectsByCode, setProjectsByCode] = useState<Record<string, ProjectResponseDTO>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [projectCodeError, setProjectCodeError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<FundExpenditureDTO[]>([]);
  const [fundingAgencyName, setFundingAgencyName] = useState<string>('');

  // Normalize a project code for matching: remove all non-alphanumerics and uppercase
  const norm = (s?: string) => (s || '').replace(/[^0-9a-z]/gi, '').toUpperCase();

  // Calculate total expenditure whenever amounts change
  useEffect(() => {
    const total = formData.equipmentPurchase + formData.salary + formData.contingency + formData.overhead;
    setFormData(prev => ({ ...prev, totalExpenditure: total }));
  }, [formData.equipmentPurchase, formData.salary, formData.contingency, formData.overhead]);

  // Load project codes from Projects, Submissions, and Received for suggestions and fallback
  useEffect(() => {
    const loadCodes = async () => {
      try {
        const projects = await fetchProjects();
        const codesFromProjects = Array.isArray(projects)
          ? projects.flatMap(p => [p.projectCode, (p as any).projectNumber].filter(Boolean) as string[])
          : [];
        const subsResp = await fetchProjectSubmissions();
        const codesFromSubs = Array.isArray(subsResp?.submissions) ? subsResp.submissions.map(s => s.projectCode).filter((c): c is string => Boolean(c)) : [];
        const recResp = await fetchProjectReceiveds();
        const codesFromRec = Array.isArray(recResp?.projects) ? recResp.projects.map(r => r.projectCode).filter((c): c is string => Boolean(c)) : [];

        // Build lookups for fallbacks
        if (Array.isArray(subsResp?.submissions)) {
          const map: Record<string, ProjectSubmissionDTO> = {};
          subsResp.submissions.forEach(s => {
            if (s.projectCode) map[norm(s.projectCode)] = s;
          });
          setSubmissionsByCode(map);
        }
        if (Array.isArray(recResp?.projects)) {
          const map: Record<string, ProjectReceivedDTO> = {};
          recResp.projects.forEach(r => {
            if (r.projectCode) map[norm(r.projectCode)] = r;
          });
          setReceivedByCode(map);
        }
        if (Array.isArray(projects)) {
          const pmap: Record<string, ProjectResponseDTO> = {};
          projects.forEach(p => {
            const pc = (p as any).projectCode as string | undefined;
            const pn = (p as any).projectNumber as string | undefined;
            if (pc) pmap[norm(pc)] = p;
            if (pn) pmap[norm(pn)] = p;
          });
          setProjectsByCode(pmap);
        }

        setProjectCodes(Array.from(new Set([...codesFromProjects, ...codesFromSubs, ...codesFromRec])));
      } catch (e) {
        // Non-fatal
        console.warn('[FundExpenditureForm] Failed to load project codes', e);
      }
    };
    loadCodes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Purchase') || name.includes('salary') || name.includes('contingency') || name.includes('overhead') 
        ? parseFloat(value) || 0 
        : value
    }));
    if (name === 'projectCode') {
      // Clear any previous error as user types
      if (projectCodeError) setProjectCodeError(null);
    }
  };

  const validateProjectCode = async (projectCode: string) => {
    if (!projectCode.trim()) {
      setProjectCodeError('Project code is required');
      setProject(null);
      setFundingAgencyName('');
      return false;
    }

    try {
      // Try local lookups first (fast path): Submissions -> Received -> Projects map
      const codeKey = norm(projectCode);
      const sub = submissionsByCode[codeKey];
      if (sub) {
        setProject(null);
        setProjectCodeError(null);
        setFormData(prev => ({ ...prev, projectTitle: sub.projectName || '' }));
        try {
          if (sub.fundingAgencyId) {
            const fa = await fetchFundingAgencyByFundingAgencyId(sub.fundingAgencyId);
            setFundingAgencyName(fa?.name || sub.fundingAgencyId);
            setFormData(prev => ({ ...prev, fundingAgency: fa?.name || sub.fundingAgencyId }));
          } else {
            setFundingAgencyName('');
          }
        } catch {
          setFundingAgencyName(sub.fundingAgencyId || '');
          setFormData(prev => ({ ...prev, fundingAgency: sub.fundingAgencyId || '' }));
        }
        return true;
      }
      const rec = receivedByCode[codeKey];
      if (rec) {
        setProject(null);
        setProjectCodeError(null);
        setFormData(prev => ({ ...prev, projectTitle: rec.projectName || '' }));
        try {
          if (rec.fundingAgencyId) {
            const fa = await fetchFundingAgencyByFundingAgencyId(rec.fundingAgencyId);
            setFundingAgencyName(fa?.name || rec.fundingAgencyId);
            setFormData(prev => ({ ...prev, fundingAgency: fa?.name || rec.fundingAgencyId }));
          } else {
            setFundingAgencyName('');
          }
        } catch {
          setFundingAgencyName(rec.fundingAgencyId || '');
          setFormData(prev => ({ ...prev, fundingAgency: rec.fundingAgencyId || '' }));
        }
        return true;
      }
      const pre = projectsByCode[codeKey];
      if (pre) {
        setProject(pre);
        setProjectCodeError(null);
        setFormData(prev => ({ ...prev, projectTitle: pre.title, fundingAgency: pre.fundingAgencyId }));
        try {
          if (pre.fundingAgencyId) {
            const fa = await fetchFundingAgencyByFundingAgencyId(pre.fundingAgencyId);
            setFundingAgencyName(fa?.name || pre.fundingAgencyId);
            setFormData(prev => ({ ...prev, fundingAgency: fa?.name || pre.fundingAgencyId }));
          } else {
            setFundingAgencyName('');
          }
        } catch {
          setFundingAgencyName(pre.fundingAgencyId || '');
        }
        return true;
      }

      // If not in preloaded map, try API endpoint
      const projectData = await fetchProjectByProjectCode(projectCode);
      setProject(projectData);
      setProjectCodeError(null);
      
      // Auto-populate project title and funding agency
      setFormData(prev => ({
        ...prev,
        projectTitle: projectData.title,
        fundingAgency: projectData.fundingAgencyId
      }));
      try {
        if (projectData.fundingAgencyId) {
          const fa = await fetchFundingAgencyByFundingAgencyId(projectData.fundingAgencyId);
          setFundingAgencyName(fa?.name || projectData.fundingAgencyId);
          setFormData(prev => ({ ...prev, fundingAgency: fa?.name || projectData.fundingAgencyId }));
        } else {
          setFundingAgencyName('');
        }
      } catch {
        setFundingAgencyName(projectData.fundingAgencyId || '');
      }
      
      return true;
    } catch (error) {
      setProjectCodeError('Project code not found. Please enter a valid project code.');
      setProject(null);
      setFundingAgencyName('');
      return false;
    }
  };

  // Debounced validation as user types
  useEffect(() => {
    const code = formData.projectCode?.trim();
    if (!code) {
      setProject(null);
      setFundingAgencyName('');
      setProjectCodeError(null);
      return;
    }
    const h = setTimeout(() => { void validateProjectCode(code); }, 400);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.projectCode]);

  // If user typed a code before lookups loaded, revalidate once lookups are ready
  useEffect(() => {
    if (formData.projectCode && !project && !projectCodeError && (Object.keys(submissionsByCode).length || Object.keys(receivedByCode).length || Object.keys(projectsByCode).length)) {
      void validateProjectCode(formData.projectCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionsByCode, receivedByCode, projectsByCode]);

  const validateFinancialYear = (financialYear: string): boolean => {
    const yearPattern = /^\d{4}-\d{2}$/;
    if (!yearPattern.test(financialYear)) {
      return false;
    }
    const [startYear, endYear] = financialYear.split('-');
    const start = parseInt(startYear);
    const end = parseInt(endYear);
    return end === start + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate project code
      const isProjectValid = await validateProjectCode(formData.projectCode);
      if (!isProjectValid) {
        setError('Please enter a valid project code');
        setLoading(false);
        return;
      }

      // Validate financial year
      if (!validateFinancialYear(formData.financialYear)) {
        setError('Please enter a valid financial year in format YYYY-YY (e.g., 2026-27)');
        setLoading(false);
        return;
      }

      // Check if expenditure already exists for this project and financial year
      const exists = await checkFundExpenditureExists(formData.projectCode, formData.financialYear);
      if (exists) {
        setError('Fund expenditure already exists for this project code and financial year');
        setLoading(false);
        return;
      }

      // Validate amounts
      if (formData.equipmentPurchase < 0 || formData.salary < 0 || formData.contingency < 0 || formData.overhead < 0) {
        setError('All amounts must be zero or positive');
        setLoading(false);
        return;
      }

      if (formData.totalExpenditure === 0) {
        setError('At least one expenditure amount must be greater than zero');
        setLoading(false);
        return;
      }

      const createdExpenditure = await createFundExpenditure(formData);
      console.log('Fund expenditure created:', createdExpenditure);
      setSuccess(true);
      
      // Redirect to confirmation page after a short delay
      setTimeout(() => {
        navigate('/fund-expenditure-confirmation', { 
          state: { expenditure: createdExpenditure } 
        });
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create fund expenditure';
      setError(errorMessage);
      console.error('[FundExpenditureForm] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const addToCart = () => {
    if (!formData.projectCode || !formData.financialYear) {
      setError('Please fill in all required fields before adding to cart');
      return;
    }

    const cartItem: FundExpenditureDTO = {
      ...formData,
      _id: `cart-${Date.now()}` // Temporary ID for cart items
    };

    setCartItems(prev => [...prev, cartItem]);
    setShowCart(true);
    
    // Reset form for next item
    setFormData(prev => ({
      ...prev,
      financialYear: '',
      equipmentPurchase: 0,
      salary: 0,
      contingency: 0,
      overhead: 0,
      totalExpenditure: 0,
      remark: ''
    }));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  };

  const submitCart = async () => {
    if (cartItems.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Submit all cart items
      const promises = cartItems.map(item => createFundExpenditure(item));
      const results = await Promise.all(promises);
      
      console.log('All fund expenditures created:', results);
      setSuccess(true);
      
      // Redirect to confirmation page after a short delay
      setTimeout(() => {
        navigate('/fund-expenditure-confirmation', { 
          state: { expenditures: results } 
        });
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create fund expenditures';
      setError(errorMessage);
      console.error('[FundExpenditureForm] Error:', err);
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
                <i className="bi bi-cash-stack me-2"></i>
                Fund Expenditure Form
              </h2>
            </div>
            <div className="card-body">
              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  Fund expenditure created successfully! Redirecting to confirmation page...
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
                {/* Project Code Section */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="projectCode" className="form-label fw-bold">
                      Project Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${projectCodeError ? 'is-invalid' : ''}`}
                      id="projectCode"
                      name="projectCode"
                      value={formData.projectCode}
                      onChange={handleInputChange}
                      list="project-codes"
                      placeholder="e.g., P-07/0234"
                      required
                    />
                    {projectCodeError && (
                      <div className="invalid-feedback">{projectCodeError}</div>
                    )}
                    {(project || formData.projectTitle) && (
                      <div className="form-text text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Project found: {formData.projectTitle || project?.title}
                      </div>
                    )}
                    <div className="form-text">Format: P-07/0234 (Project Code)</div>
                    <datalist id="project-codes">
                      {projectCodes.map(code => (
                        <option key={code} value={code} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Auto-populated Project Details */}
                {(project || formData.projectTitle || fundingAgencyName) && (
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Project Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.projectTitle || ''}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Funding Agency</label>
                      <input
                        type="text"
                        className="form-control"
                        value={fundingAgencyName || formData.fundingAgency || ''}
                        readOnly
                      />
                    </div>
                  </div>
                )}

                {/* Financial Year Section */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="financialYear" className="form-label fw-bold">
                      Financial Year <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="financialYear"
                      name="financialYear"
                      value={formData.financialYear}
                      onChange={handleInputChange}
                      placeholder="e.g., 2026-27"
                      pattern="\d{4}-\d{2}"
                      required
                    />
                    <div className="form-text">Format: YYYY-YY (e.g., 2026-27)</div>
                  </div>
                </div>

                {/* Expenditure Amounts Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-currency-rupee me-2"></i>
                      Expenditure Details
                    </h5>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="equipmentPurchase" className="form-label fw-bold">
                      Equipment Purchase (₹) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="equipmentPurchase"
                      name="equipmentPurchase"
                      value={formData.equipmentPurchase}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="salary" className="form-label fw-bold">
                      Salary (₹) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="salary"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="contingency" className="form-label fw-bold">
                      Contingency (₹) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="contingency"
                      name="contingency"
                      value={formData.contingency}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="overhead" className="form-label fw-bold">
                      Overhead (₹) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="overhead"
                      name="overhead"
                      value={formData.overhead}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Total Expenditure Display */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="alert alert-info">
                      <div className="row align-items-center">
                        <div className="col-md-6">
                          <strong>Total Expenditure:</strong>
                        </div>
                        <div className="col-md-6 text-end">
                          <span className="h5 text-primary mb-0">
                            {formatCurrency(formData.totalExpenditure)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label htmlFor="dateOfExpenditure" className="form-label fw-bold">
                      Date of Expenditure
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="dateOfExpenditure"
                      name="dateOfExpenditure"
                      value={formData.dateOfExpenditure}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="remark" className="form-label fw-bold">
                      Remarks
                    </label>
                    <textarea
                      className="form-control"
                      id="remark"
                      name="remark"
                      value={formData.remark}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Additional notes or remarks..."
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
                        onClick={() => navigate('/')}
                      >
                        <i className="bi bi-house me-2"></i>
                        Back to Home
                      </button>
                      <div>
                        <button
                          type="button"
                          className="btn btn-success me-2"
                          onClick={addToCart}
                        >
                          <i className="bi bi-cart-plus me-2"></i>
                          Add to Cart
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Creating...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-2"></i>
                              Create Single Expenditure
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>

              {/* Cart Section */}
              {showCart && (
                <div className="mt-4">
                  <div className="card">
                    <div className="card-header bg-success text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-cart me-2"></i>
                        Cart Items ({cartItems.length})
                      </h5>
                    </div>
                    <div className="card-body">
                      {cartItems.map((item, index) => (
                        <div key={item._id} className="border-bottom pb-3 mb-3">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <h6 className="mb-1">
                                {item.projectCode}
                              </h6>
                              <p className="mb-1 text-muted">
                                Financial Year: {item.financialYear} | 
                                Total: {formatCurrency(item.totalExpenditure)}
                              </p>
                              {item.remark && (
                                <small className="text-muted">Remark: {item.remark}</small>
                              )}
                            </div>
                            <div className="col-md-4 text-end">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeFromCart(item._id!)}
                              >
                                <i className="bi bi-trash"></i> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {cartItems.length > 0 && (
                        <div className="text-center">
                          <button
                            type="button"
                            className="btn btn-success btn-lg"
                            onClick={submitCart}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Submitting All Items...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i>
                                Submit All Items ({cartItems.length})
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundExpenditureForm;