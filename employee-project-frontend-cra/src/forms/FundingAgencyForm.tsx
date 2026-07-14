import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFundingAgency, fetchFundingAgencyByFundingAgencyId } from '../services/api';
import type { FundingAgencyDTO } from '../types';

interface FundingAgencyFormProps {
  onFundingAgencyCreated?: () => void;
}

interface FormErrors {
  fundingAgencyId?: string;
  name?: string;
  shortName?: string;
  typeOfAgency?: string;
  category?: string;
  general?: string; // For non-field-specific errors (e.g., server errors)
}

const typeOfAgencyOptions = ['Government', 'Private', 'Non-Profit', 'International'];
const categoryOptions = ['Research', 'Education', 'Healthcare', 'Technology'];

const FundingAgencyForm: React.FC<FundingAgencyFormProps> = ({ onFundingAgencyCreated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FundingAgencyDTO>({
    _id: '', // Required by FundingAgencyDTO, sent as empty string
    fundingAgencyId: '',
    name: '',
    shortName: '',
    typeOfAgency: '',
    category: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [asyncValidation, setAsyncValidation] = useState({ checking: false, error: '' });

  const validateField = (name: keyof FundingAgencyDTO, value: string): string | null => {
    if (name === '_id') return null; // Skip validation for _id
    if (!value) {
      switch (name) {
        case 'fundingAgencyId':
          return 'Funding Agency ID is required.';
        case 'name':
          return 'Name is required.';
        case 'typeOfAgency':
          return 'Type of Agency is required.';
        case 'category':
          return 'Category is required.';
        default:
          return null;
      }
    }
    switch (name) {
      case 'fundingAgencyId':
        if (!/^[a-zA-Z0-9-_]{1,50}$/.test(value)) {
          return 'Funding Agency ID must be 1-50 alphanumeric characters, hyphens, or underscores.';
        }
        return null;
      case 'name':
        if (value.length > 100) return 'Name must be at most 100 characters.';
        return null;
      case 'shortName':
        if (value.length > 50) return 'Short Name must be at most 50 characters.';
        return null;
      case 'typeOfAgency':
        if (!typeOfAgencyOptions.includes(value)) return 'Invalid Type of Agency.';
        return null;
      case 'category':
        if (!categoryOptions.includes(value)) return 'Invalid Category.';
        return null;
      default:
        return null;
    }
  };

  const checkFundingAgencyIdUniqueness = async (fundingAgencyId: string) => {
    if (!fundingAgencyId || validateField('fundingAgencyId', fundingAgencyId)) return;
    setAsyncValidation({ checking: true, error: '' });
    try {
      await fetchFundingAgencyByFundingAgencyId(fundingAgencyId);
      setAsyncValidation({ checking: false, error: 'Funding Agency ID already exists.' });
    } catch (error) {
      setAsyncValidation({ checking: false, error: '' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name as keyof FundingAgencyDTO, value) }));
    if (name === 'fundingAgencyId') {
      checkFundingAgencyIdUniqueness(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const newErrors: FormErrors = {};
    const fields: (keyof Omit<FundingAgencyDTO, '_id'>)[] = [
      'fundingAgencyId',
      'name',
      'shortName',
      'typeOfAgency',
      'category',
    ];
    fields.forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (asyncValidation.error) {
      newErrors.fundingAgencyId = asyncValidation.error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await createFundingAgency(formData); // Send formData directly
      if (onFundingAgencyCreated) onFundingAgencyCreated();
      alert('Funding Agency created successfully!');
      navigate('/funding-agencies');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create funding agency';
      if (errorMessage.includes(': ')) {
        const fieldErrors = errorMessage
          .split(', ')
          .reduce((acc, err) => {
            const [field, message] = err.split(': ');
            return { ...acc, [field]: message };
          }, {} as Partial<Record<keyof FundingAgencyDTO, string>>);
        setErrors({ ...fieldErrors, general: 'Please correct the errors above.' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-gradient text-white" style={{background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'}}>
              <div className="d-flex align-items-center">
                <i className="bi bi-bank2 fs-3 me-3"></i>
                <div>
                  <h2 className="card-title h4 mb-1">Add Funding Agency</h2>
                  <p className="mb-0 opacity-75">Register a new funding organization</p>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              {errors.general && (
                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert" aria-live="assertive">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {errors.general}
                </div>
              )}
              <form onSubmit={handleSubmit} noValidate aria-label="Add Funding Agency Form">
                {/* Agency Identification Section */}
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">
                      <i className="bi bi-card-text me-2 text-primary"></i>
                      Agency Identification
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="fundingAgencyId" className="form-label fw-bold">
                          <i className="bi bi-hash me-2"></i>
                          Funding Agency ID <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.fundingAgencyId || asyncValidation.error ? 'is-invalid' : ''}`}
                          id="fundingAgencyId"
                          name="fundingAgencyId"
                          value={formData.fundingAgencyId}
                          onChange={handleChange}
                          placeholder="e.g., FA-123"
                          required
                          aria-describedby="fundingAgencyIdFeedback"
                          disabled={loading}
                        />
                        {(errors.fundingAgencyId || asyncValidation.error) && (
                          <div id="fundingAgencyIdFeedback" className="invalid-feedback">
                            {errors.fundingAgencyId || asyncValidation.error}
                          </div>
                        )}
                        {asyncValidation.checking && (
                          <div className="text-muted mt-1" aria-live="polite">
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Checking ID availability...
                          </div>
                        )}
                        <div className="form-text">
                          <i className="bi bi-info-circle me-1"></i>
                          Unique identifier for the funding agency
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="shortName" className="form-label fw-bold">
                          <i className="bi bi-bookmark me-2"></i>
                          Short Name
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.shortName ? 'is-invalid' : ''}`}
                          id="shortName"
                          name="shortName"
                          value={formData.shortName}
                          onChange={handleChange}
                          placeholder="e.g., NSF"
                          aria-describedby="shortNameFeedback"
                          disabled={loading}
                        />
                        {errors.shortName && (
                          <div id="shortNameFeedback" className="invalid-feedback">
                            {errors.shortName}
                          </div>
                        )}
                        <div className="form-text">
                          <i className="bi bi-lightbulb me-1"></i>
                          Abbreviated name for easy reference
                        </div>
                      </div>
                      <div className="col-12 mb-3">
                        <label htmlFor="name" className="form-label fw-bold">
                          <i className="bi bi-building me-2"></i>
                          Full Agency Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g., National Science Foundation"
                          required
                          aria-describedby="nameFeedback"
                          disabled={loading}
                        />
                        {errors.name && (
                          <div id="nameFeedback" className="invalid-feedback">
                            {errors.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agency Classification Section */}
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">
                      <i className="bi bi-tags me-2 text-success"></i>
                      Agency Classification
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="typeOfAgency" className="form-label fw-bold">
                          <i className="bi bi-diagram-3 me-2"></i>
                          Type of Agency <span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-select ${errors.typeOfAgency ? 'is-invalid' : ''}`}
                          id="typeOfAgency"
                          name="typeOfAgency"
                          value={formData.typeOfAgency}
                          onChange={handleChange}
                          required
                          aria-describedby="typeOfAgencyFeedback"
                          disabled={loading}
                        >
                          <option value="">Select agency type...</option>
                          {typeOfAgencyOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {errors.typeOfAgency && (
                          <div id="typeOfAgencyFeedback" className="invalid-feedback">
                            {errors.typeOfAgency}
                          </div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="category" className="form-label fw-bold">
                          <i className="bi bi-collection me-2"></i>
                          Category <span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                          aria-describedby="categoryFeedback"
                          disabled={loading}
                        >
                          <option value="">Select category...</option>
                          {categoryOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <div id="categoryFeedback" className="invalid-feedback">
                            {errors.category}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/')}
                    disabled={loading}
                  >
                    <i className="bi bi-house me-2"></i>
                    Back to Home
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading || asyncValidation.checking || !!asyncValidation.error}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Create Funding Agency
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundingAgencyForm;