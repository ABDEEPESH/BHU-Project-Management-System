import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createEmployee } from '../services/api';
import type { EmployeeDTO } from '../types';

interface EmployeeFormProps {
  onEmployeeCreated?: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onEmployeeCreated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EmployeeDTO>({
    _id: '',
    idNo: '',
    name: '',
    designation: '',
    department: '',
    doB: '',
    doJ: '',
    doR: '',
    faculty: '',
    passportNo: '',
    mobile: '',
    email: '',
    // projectIds: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeDTO, string>> & { general?: string }>({});
  const [loading, setLoading] = useState<boolean>(false);

  const validateField = (name: keyof EmployeeDTO, value: string | string[] | undefined): string | null => {
    if (name === 'idNo') {
      if (!value) return 'Employee ID is required.';
      if (typeof value === 'string' && value.length > 50) return 'Employee ID must be at most 50 characters.';
      return null;
    }
    if (name === 'email' && value && typeof value === 'string') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) return 'Please enter a valid email address (e.g., user@domain.com).';
      if (value.length > 255) return 'Email address is too long (max 255 characters).';
    }
    if (name === 'mobile' && value && typeof value === 'string') {
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(value)) return 'Mobile number must be exactly 10 digits with no other characters.';
    }
    if (['name', 'designation', 'department', 'doB', 'doJ', 'doR', 'faculty'].includes(name)) {
      if (!value) return `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
      if (typeof value === 'string' && value.length > 100) {
        return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at most 100 characters.`;
      }
    }
    if (name === 'passportNo' && value && typeof value === 'string' && value.length > 50) {
      return 'Passport number must be at most 50 characters.';
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const error = validateField(name as keyof EmployeeDTO, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields before submission
    const newErrors: Partial<Record<keyof EmployeeDTO, string>> & { general?: string } = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key as keyof EmployeeDTO, formData[key as keyof EmployeeDTO]);
      if (error) {
        newErrors[key as keyof EmployeeDTO] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting:', formData);
      await createEmployee(formData);
      if (onEmployeeCreated) onEmployeeCreated();
      alert('Employee created successfully!');
      navigate('/employee');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create employee';
      if (errorMessage.includes(': ')) {
        const fieldErrors = errorMessage.split(', ').reduce((acc, err) => {
          const [field, message] = err.split(': ');
          return { ...acc, [field]: message };
        }, {} as Partial<Record<keyof EmployeeDTO, string>>);
        setErrors({ ...fieldErrors, general: 'Please correct the errors below.' });
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
            <div className="card-header bg-gradient text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <div className="d-flex align-items-center">
                <i className="bi bi-person-plus-fill fs-3 me-3"></i>
                <div>
                  <h2 className="card-title h4 mb-1">Create New Employee</h2>
                  <p className="mb-0 opacity-75">Add a new employee to the system</p>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              {errors.general && (
                <div className="alert alert-danger d-flex align-items-center mb-4">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {errors.general}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                {/* Personal Information Section */}
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">
                      <i className="bi bi-person-badge me-2 text-primary"></i>
                      Personal Information
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="idNo" className="form-label fw-bold">
                          <i className="bi bi-hash me-2"></i>
                          Employee ID <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.idNo ? 'is-invalid' : ''}`}
                          id="idNo"
                          name="idNo"
                          value={formData.idNo}
                          onChange={handleChange}
                          placeholder="e.g., EMP001"
                          required
                        />
                        {errors.idNo && <div className="invalid-feedback">{errors.idNo}</div>}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="name" className="form-label fw-bold">
                          <i className="bi bi-person me-2"></i>
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g., Dr. John Smith"
                          required
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Professional Information Section */}
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">
                      <i className="bi bi-briefcase me-2 text-success"></i>
                      Professional Information
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="designation" className="form-label fw-bold">
                          <i className="bi bi-award me-2"></i>
                          Designation <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.designation ? 'is-invalid' : ''}`}
                          id="designation"
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          placeholder="e.g., Professor, Assistant Professor"
                          required
                        />
                        {errors.designation && <div className="invalid-feedback">{errors.designation}</div>}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="department" className="form-label fw-bold">
                          <i className="bi bi-building me-2"></i>
                          Department <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          placeholder="e.g., Computer Science"
                          required
                        />
                        {errors.department && <div className="invalid-feedback">{errors.department}</div>}
                      </div>
                      <div className="col-12 mb-3">
                        <label htmlFor="faculty" className="form-label fw-bold">
                          <i className="bi bi-mortarboard me-2"></i>
                          Faculty <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.faculty ? 'is-invalid' : ''}`}
                          id="faculty"
                          name="faculty"
                          value={formData.faculty}
                          onChange={handleChange}
                          placeholder="e.g., Faculty of Science"
                          required
                        />
                        {errors.faculty && <div className="invalid-feedback">{errors.faculty}</div>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="doB" className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className={`form-control ${errors.doB ? 'is-invalid' : ''}`}
                    id="doB"
                    name="doB"
                    value={formData.doB}
                    onChange={handleChange}
                    required
                  />
                  {errors.doB && <div className="invalid-feedback">{errors.doB}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="doJ" className="form-label">Date of Joining</label>
                  <input
                    type="date"
                    className={`form-control ${errors.doJ ? 'is-invalid' : ''}`}
                    id="doJ"
                    name="doJ"
                    value={formData.doJ}
                    onChange={handleChange}
                    required
                  />
                  {errors.doJ && <div className="invalid-feedback">{errors.doJ}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="doR" className="form-label">Date of Retirement</label>
                  <input
                    type="date"
                    className={`form-control ${errors.doR ? 'is-invalid' : ''}`}
                    id="doR"
                    name="doR"
                    value={formData.doR}
                    onChange={handleChange}
                    required
                  />
                  {errors.doR && <div className="invalid-feedback">{errors.doR}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="passportNo" className="form-label">Passport Number</label>
                  <input
                    type="text"
                    className={`form-control ${errors.passportNo ? 'is-invalid' : ''}`}
                    id="passportNo"
                    name="passportNo"
                    value={formData.passportNo}
                    onChange={handleChange}
                  />
                  {errors.passportNo && <div className="invalid-feedback">{errors.passportNo}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="mobile" className="form-label">Mobile</label>
                  <input
                    type="text"
                    className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                  {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                {/* Important Dates Section */}
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">
                      <i className="bi bi-calendar-event me-2 text-info"></i>
                      Important Dates
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label htmlFor="doB" className="form-label fw-bold">
                          <i className="bi bi-cake me-2"></i>
                          Date of Birth <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className={`form-control ${errors.doB ? 'is-invalid' : ''}`}
                          id="doB"
                          name="doB"
                          value={formData.doB}
                          onChange={handleChange}
                          required
                        />
                        {errors.doB && <div className="invalid-feedback">{errors.doB}</div>}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="doJ" className="form-label fw-bold">
                          <i className="bi bi-calendar-plus me-2"></i>
                          Date of Joining <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className={`form-control ${errors.doJ ? 'is-invalid' : ''}`}
                          id="doJ"
                          name="doJ"
                          value={formData.doJ}
                          onChange={handleChange}
                          required
                        />
                        {errors.doJ && <div className="invalid-feedback">{errors.doJ}</div>}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="doR" className="form-label fw-bold">
                          <i className="bi bi-calendar-x me-2"></i>
                          Date of Retirement <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className={`form-control ${errors.doR ? 'is-invalid' : ''}`}
                          id="doR"
                          name="doR"
                          value={formData.doR}
                          onChange={handleChange}
                          required
                        />
                        {errors.doR && <div className="invalid-feedback">{errors.doR}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact & Additional Information Section */}
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">
                      <i className="bi bi-telephone me-2 text-warning"></i>
                      Contact & Additional Information
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="mobile" className="form-label fw-bold">
                          <i className="bi bi-phone me-2"></i>
                          Mobile Number
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
                          id="mobile"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          placeholder="e.g., 9876543210"
                        />
                        {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
                        <div className="form-text">
                          <i className="bi bi-info-circle me-1"></i>
                          Enter 10-digit mobile number without country code
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label fw-bold">
                          <i className="bi bi-envelope me-2"></i>
                          Email Address
                        </label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="e.g., john.smith@bhu.ac.in"
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                      <div className="col-12 mb-3">
                        <label htmlFor="passportNo" className="form-label fw-bold">
                          <i className="bi bi-passport me-2"></i>
                          Passport Number
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.passportNo ? 'is-invalid' : ''}`}
                          id="passportNo"
                          name="passportNo"
                          value={formData.passportNo}
                          onChange={handleChange}
                          placeholder="e.g., A1234567"
                        />
                        {errors.passportNo && <div className="invalid-feedback">{errors.passportNo}</div>}
                        <div className="form-text">
                          <i className="bi bi-info-circle me-1"></i>
                          Optional field for international travel documentation
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="d-flex justify-content-end gap-2">
                  <Link to="/" className="btn btn-outline-secondary">
                    <i className="bi bi-house me-2"></i>
                    Back to Home
                  </Link>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Create Employee
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

export default EmployeeForm;