import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchFundingAgencyByFundingAgencyId } from '../services/api';
import type { ProjectSubmissionDTO, FundingAgencyDTO } from '../types';

const ProjectSubmissionConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as ProjectSubmissionDTO | undefined;
  const [fundingAgencyName, setFundingAgencyName] = useState<string>('N/A');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (formData?.fundingAgencyId) {
      const loadFundingAgency = async () => {
        setLoading(true);
        try {
          const agency = await fetchFundingAgencyByFundingAgencyId(formData.fundingAgencyId);
          setFundingAgencyName(agency.name);
        } catch (err) {
          console.error('[ProjectSubmissionConfirmation] Error fetching funding agency', { err });
          setError('Failed to load funding agency name.');
        } finally {
          setLoading(false);
        }
      };
      loadFundingAgency();
    }
  }, [formData?.fundingAgencyId]);

  if (!formData) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          No submission data available.
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/project-submission')}>
          Back to Project Submissions
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4" style={{ color: '#343a40' }}>
        Project Submission Confirmation
      </h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="card shadow-sm">
        <div className="card-body">
          <dl className="row">
            <dt className="col-sm-3">Employee ID</dt>
            <dd className="col-sm-9">{formData.idNo}</dd>
            <dt className="col-sm-3">Principal Investigator</dt>
            <dd className="col-sm-9">{formData.principalInvestigatorName || 'N/A'}</dd>
            <dt className="col-sm-3">Designation</dt>
            <dd className="col-sm-9">{formData.designation || 'N/A'}</dd>
            <dt className="col-sm-3">Department</dt>
            <dd className="col-sm-9">{formData.department || 'N/A'}</dd>
            <dt className="col-sm-3">Faculty</dt>
            <dd className="col-sm-9">{formData.faculty || 'N/A'}</dd>
            <dt className="col-sm-3">Funding Agency</dt>
            <dd className="col-sm-9">{loading ? 'Loading...' : fundingAgencyName}</dd>
            <dt className="col-sm-3">Duration (months)</dt>
            <dd className="col-sm-9">{formData.durationOfProject || 'N/A'}</dd>
            <dt className="col-sm-3">Type of Project</dt>
            <dd className="col-sm-9">{formData.typeOfProject || 'N/A'}</dd>
            <dt className="col-sm-3">Project Name</dt>
            <dd className="col-sm-9">{formData.projectName || 'N/A'}</dd>
            <dt className="col-sm-3">Total Project Cost</dt>
            <dd className="col-sm-9">${formData.totalProjectCost.toLocaleString()}</dd>
            <dt className="col-sm-3">Recurring Cost</dt>
            <dd className="col-sm-9">${formData.recurring.toLocaleString()}</dd>
            <dt className="col-sm-3">Non-Recurring Cost</dt>
            <dd className="col-sm-9">${formData.nonRecurring.toLocaleString()}</dd>
            <dt className="col-sm-3">Overhead</dt>
            <dd className="col-sm-9">${formData.overhead.toLocaleString()}</dd>
            <dt className="col-sm-3">Submission Date</dt>
            <dd className="col-sm-9">{new Date(formData.dateOfSubmission).toLocaleDateString()}</dd>
            {/* <dt className="col-sm-3">Timestamp</dt>
            <dd className="col-sm-9">{new Date(formData.timestamp).toLocaleString()}</dd> */}
            <dt className="col-sm-3">Remark</dt>
            <dd className="col-sm-9">{formData.remark || 'N/A'}</dd>
          </dl>
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/project-submission')}
              disabled={loading}
            >
              Back to Project Submissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSubmissionConfirmation;