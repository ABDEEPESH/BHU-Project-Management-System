import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchProjectSubmissions, fetchFundingAgencyByFundingAgencyId } from '../services/api';
import type { ProjectSubmissionDTO, FundingAgencyDTO } from '../types';

const ProjectSubmission: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [submissions, setSubmissions] = useState<ProjectSubmissionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchedSubs, setFetchedSubs] = useState<ProjectSubmissionDTO[] | null>(null);
  const [detailFetchTried, setDetailFetchTried] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { submissions: fetchedSubmissions } = await fetchProjectSubmissions();
        setSubmissions(fetchedSubmissions);
        
        console.log('[ProjectSubmission] Submissions fetched successfully', { count: fetchedSubmissions.length });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project submissions';
        setError(errorMessage);
        console.error('[ProjectSubmission] Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const loadIfNeeded = async () => {
      if (!id || detailFetchTried) return;
      const inProps = submissions.find(s => String(s._id) === String(id));
      if (inProps) return;
      try {
        setLoading(true);
        const res = await fetchProjectSubmissions();
        setFetchedSubs(res.submissions || []);
      } catch (e) {
        // ignore
      } finally {
        setDetailFetchTried(true);
        setLoading(false);
      }
    };
    loadIfNeeded();
  }, [id, submissions, detailFetchTried]);

  const filteredSubmissions = submissions.filter(
    (submission) =>
      submission.principalInvestigatorName?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      submission.projectName?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      submission.projectCode?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      submission.idNo?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      submission.designation?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      submission.department?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      submission.faculty?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      submission.typeOfProject?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      submission.durationOfProject?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      submission.fundingAgencyId?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      submission.totalProjectCost?.toString()?.includes(searchQuery) ||
      submission.overhead?.toString()?.includes(searchQuery) ||
      submission.dateOfSubmission?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      submission.remark?.toLowerCase()?.includes(searchQuery.toLowerCase())
  );

  const handleCreateClick = () => {
    navigate('/project-submission/create');
  };

  const formatNumber = (amount?: number) => {
    if (typeof amount !== 'number' || !isFinite(amount)) return '0';
    return amount.toLocaleString('en-US');
  };

  if (id) {
    const source = submissions && submissions.length > 0 ? submissions : (fetchedSubs || []);
    const sub = source.find(s => String(s._id) === String(id));
    if (!sub) {
      return (
        <div className="container py-5 text-center">
          {loading ? (
            <>
              <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
              <p className="mt-3 text-muted">Loading project submission details...</p>
            </>
          ) : (
            <>
              <div className="alert alert-warning" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Project Submission not found
              </div>
              <Link to="/project-submission" className="btn btn-secondary mt-3">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Project Submission List
              </Link>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-primary mb-0"><i className="bi bi-send-plus me-2"></i>Project Submission Details</h2>
          <Link to="/project-submission" className="btn btn-outline-secondary"><i className="bi bi-arrow-left me-2"></i>Back to List</Link>
        </div>
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p><strong>Employee ID:</strong> <span className="badge bg-secondary">{sub.idNo}</span></p>
                <p><strong>Principal Investigator:</strong> {sub.principalInvestigatorName}</p>
                <p><strong>Designation:</strong> {sub.designation || 'N/A'}</p>
                <p><strong>Department:</strong> {sub.department || 'N/A'}</p>
                <p><strong>Faculty:</strong> {sub.faculty || 'N/A'}</p>
                <p><strong>Project Title:</strong> {sub.projectName}</p>
                <p><strong>Project Code:</strong> {sub.projectCode || '—'}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Funding Agency ID:</strong> <span className="badge bg-info">{sub.fundingAgencyId}</span></p>
                <p><strong>Duration:</strong> {sub.durationOfProject || 'N/A'}</p>
                <p><strong>Type:</strong> {sub.typeOfProject || 'N/A'}</p>
                <p><strong>Total Cost:</strong> {formatNumber(sub.totalProjectCost)}</p>
                <p><strong>Recurring:</strong> {formatNumber(sub.recurring)}</p>
                <p><strong>Non-Recurring:</strong> {formatNumber(sub.nonRecurring)}</p>
                <p><strong>Overhead:</strong> {formatNumber(sub.overhead)}</p>
                <p><strong>Submission Date:</strong> {sub.dateOfSubmission ? new Date(sub.dateOfSubmission).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            {sub.remark && (
              <div className="mt-3"><strong>Remarks:</strong> {sub.remark}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = (submission: ProjectSubmissionDTO) => {
    console.log('[ProjectSubmission] Editing submission:', submission);
    // TODO: Implement edit functionality
    alert('Edit functionality will be implemented here');
  };

  const handleDelete = (submission: ProjectSubmissionDTO) => {
    console.log('[ProjectSubmission] Deleting submission:', submission);
    if (window.confirm(`Are you sure you want to delete the project submission "${submission.projectName}"?`)) {
      // TODO: Implement delete functionality
      alert('Delete functionality will be implemented here');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="text-center mb-4" style={{ color: '#343a40' }}>
            <i className="bi bi-send-plus text-primary me-2"></i>
            Project Submissions
          </h2>
        </div>
      </div>

      {/* Search and Create Section */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by any field (Employee ID, PI Name, Project Title, Department, etc.)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search project submissions"
            />
          </div>
        </div>
        <div className="col-md-4 text-end">
          <button 
            className="btn btn-primary" 
            onClick={handleCreateClick} 
            disabled={loading}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Create Project Submission
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading project submissions...</p>
        </div>
      )}

      {/* Results Summary */}
      {!loading && !error && (
        <div className="row mb-3">
          <div className="col-12">
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Showing {filteredSubmissions.length} of {submissions.length} project submissions
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          </div>
        </div>
      )}

      {/* Submissions Table */}
      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Timestamp</th>
                <th>Employee ID</th>
                <th>Principal Investigator</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Faculty</th>
                <th>Project Title</th>
                <th>Project Code</th>
                <th>Funding Agency</th>
                <th>Duration</th>
                <th>Type</th>
                <th>Total Cost</th>
                <th>Overhead</th>
                <th>Submission Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr key="no-submissions">
                  <td colSpan={14} className="text-center text-muted py-4">
                    <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                    {searchQuery ? 'No submissions found matching your search.' : 'No project submissions available.'}
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission, index) => (
                  <tr key={submission._id || `submission-${index}`}>
                    <td>
                      {submission.timestamp ? new Date(submission.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td>
                      <span className="badge bg-secondary">{submission.idNo}</span>
                    </td>
                    <td>{submission.principalInvestigatorName}</td>
                    <td>{submission.designation || 'N/A'}</td>
                    <td>{submission.department || 'N/A'}</td>
                    <td>{submission.faculty || 'N/A'}</td>
                    <td>
                      <strong>{submission.projectName}</strong>
                    </td>
                    <td>
                      <code>{submission.projectCode}</code>
                    </td>
                    <td>
                      <span className="badge bg-info">{submission.fundingAgencyId}</span>
                    </td>
                    <td>{submission.durationOfProject || 'N/A'}</td>
                    <td>
                      <span className="badge bg-warning text-dark">{submission.typeOfProject || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="text-success fw-bold">
                        {formatNumber(submission.totalProjectCost)}
                      </span>
                    </td>
                    <td>
                      <span className="text-info">
                        {formatNumber(submission.overhead)}
                      </span>
                    </td>
                    <td>
                      {submission.dateOfSubmission ? new Date(submission.dateOfSubmission).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <Link
                          className="btn btn-sm btn-outline-primary"
                          to={`/project-submission/${submission._id}`}
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handleEdit(submission)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(submission)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectSubmission;