import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ProjectReceivedDTO } from '../types';

const ProjectReceivedConfirm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state?.formData as ProjectReceivedDTO | undefined;

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString; // Fallback to raw string if parsing fails
    }
  };

  // Format number as currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (!formData) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          No project data found.
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/project-received')}
          aria-label="Back to Project Received List"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4" style={{ color: '#343a40' }}>
        Confirm Project Received
      </h2>
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="card-title h5 text-primary mb-3">Project Details</h3>
          <p><strong>Employee ID:</strong> {formData.idNo}</p>
          <p><strong>Principal Investigator:</strong> {formData.principalInvestigatorName}</p>
          <p><strong>Designation:</strong> {formData.designation || 'N/A'}</p>
          <p><strong>Department:</strong> {formData.department || 'N/A'}</p>
          <p><strong>Faculty:</strong> {formData.faculty || 'N/A'}</p>
          <p><strong>Project Name:</strong> {formData.projectName}</p>
          <p><strong>Funding Agency ID:</strong> {formData.fundingAgencyId}</p>
          <p><strong>Duration (months):</strong> {formData.durationOfProject}</p>
          <p><strong>Type of Project:</strong> {formData.typeOfProject || 'N/A'}</p>
          <p><strong>Total Project Cost:</strong> {formatCurrency(formData.totalProjectCost)}</p>
          <p><strong>Recurring Cost:</strong> {formatCurrency(formData.recurring)}</p>
          <p><strong>Non-Recurring Cost:</strong> {formatCurrency(formData.nonRecurring)}</p>
          <p><strong>Overhead:</strong> {formatCurrency(formData.overhead)}</p>
          <p><strong>Receipt Date:</strong> {formatDate(formData.dateOfReceipt)}</p>
          <p><strong>Financial Year:</strong> {formData.financialYear}</p>
          <p><strong>Remark:</strong> {formData.remark || 'N/A'}</p>
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-secondary me-2"
              onClick={() => navigate('/project-received/create', { state: { formData } })}
              aria-label="Edit Project Details"
            >
              Edit
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/project-received')}
              aria-label="Confirm Project Submission"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectReceivedConfirm;