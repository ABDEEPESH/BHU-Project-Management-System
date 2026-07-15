import React, { useState } from 'react';
import { createBankDetails } from '../services/api';
import type { BankDetailsDTO } from '../types';

const BankDetailsForm: React.FC = () => {
  const [formData, setFormData] = useState<BankDetailsDTO>({
    bankName: '',
    accountNumber: '',
    accountName: '',
    ifscCode: '',
    branchName: '',
    accountType: '',
    isActive: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
    if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
    if (!formData.accountName.trim()) newErrors.accountName = 'Account name is required';
    if (!formData.ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';
    if (!formData.branchName.trim()) newErrors.branchName = 'Branch name is required';
    if (!formData.accountType) newErrors.accountType = 'Account type is required';

    // IFSC code format validation
    const ifscRegex = /^[A-Z]{4}[0][A-Z0-9]{6}$/;
    if (formData.ifscCode && !ifscRegex.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC code format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await createBankDetails(formData);
      setMessage({ type: 'success', text: 'Bank details created successfully!' });
      
      // Reset form
      setFormData({
        bankName: '',
        accountNumber: '',
        accountName: '',
        ifscCode: '',
        branchName: '',
        accountType: '',
        isActive: true
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating bank details:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to create bank details' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h2 className="h4 mb-0">
                <i className="bi bi-bank me-2"></i>
                Add Bank Details
              </h2>
            </div>
            <div className="card-body">
              {message && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                  <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                  {message.text}
                  <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="bankName" className="form-label">
                      Bank Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.bankName ? 'is-invalid' : ''}`}
                      id="bankName"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      placeholder="Enter bank name"
                    />
                    {errors.bankName && <div className="invalid-feedback">{errors.bankName}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="accountNumber" className="form-label">
                      Account Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.accountNumber ? 'is-invalid' : ''}`}
                      id="accountNumber"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      placeholder="Enter account number"
                    />
                    {errors.accountNumber && <div className="invalid-feedback">{errors.accountNumber}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="accountName" className="form-label">
                      Account Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.accountName ? 'is-invalid' : ''}`}
                      id="accountName"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleChange}
                      placeholder="Enter account holder name"
                    />
                    {errors.accountName && <div className="invalid-feedback">{errors.accountName}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="ifscCode" className="form-label">
                      IFSC Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.ifscCode ? 'is-invalid' : ''}`}
                      id="ifscCode"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleChange}
                      placeholder="e.g., SBIN0001234"
                      style={{ textTransform: 'uppercase' }}
                    />
                    {errors.ifscCode && <div className="invalid-feedback">{errors.ifscCode}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="branchName" className="form-label">
                      Branch Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.branchName ? 'is-invalid' : ''}`}
                      id="branchName"
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleChange}
                      placeholder="Enter branch name"
                    />
                    {errors.branchName && <div className="invalid-feedback">{errors.branchName}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="accountType" className="form-label">
                      Account Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.accountType ? 'is-invalid' : ''}`}
                      id="accountType"
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleChange}
                    >
                      <option value="">Select account type</option>
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                      <option value="Fixed Deposit">Fixed Deposit</option>
                      <option value="Recurring Deposit">Recurring Deposit</option>
                    </select>
                    {errors.accountType && <div className="invalid-feedback">{errors.accountType}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active Account
                      </label>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Bank Details
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => window.history.back()}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back
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

export default BankDetailsForm;
