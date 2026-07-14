import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import type { ProjectReceivedDTO } from '../types';
import { fetchProjectReceiveds } from '../services/api';

interface ProjectReceivedProps {
  projectReceiveds: ProjectReceivedDTO[];
}

const ProjectReceivedComponent: React.FC<ProjectReceivedProps> = ({ projectReceiveds }) => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [fetchedReceiveds, setFetchedReceiveds] = useState<ProjectReceivedDTO[] | null>(null);
  const [fetchTried, setFetchTried] = useState<boolean>(false);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter projects based on search query
  const filteredProjects = projectReceiveds.filter((project) =>
    project.idNo.toString().includes(searchQuery) ||
    project.principalInvestigatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.projectCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.fundingAgencyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Create Project Received button click
  const handleCreateProjectReceived = () => {
    navigate('/project-received/create');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
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

  // Format number for display
  const formatNumber = (amount?: number) => {
    if (typeof amount !== 'number' || !isFinite(amount)) return '0';
    return amount.toLocaleString('en-US');
  };

  // If viewing detail, and the item is not in props yet (e.g., direct navigation/refresh), fetch it
  useEffect(() => {
    const loadIfNeeded = async () => {
      if (!id) return;
      const inProps = projectReceiveds.find(pr => String(pr._id) === String(id));
      if (inProps || fetchTried) return;
      try {
        setLoadingDetail(true);
        const res = await fetchProjectReceiveds();
        setFetchedReceiveds(res.projects || []);
      } catch (_) {
        // ignore; handled by not-found UI below
      } finally {
        setFetchTried(true);
        setLoadingDetail(false);
      }
    };
    loadIfNeeded();
  }, [id, projectReceiveds, fetchTried]);

  if (id) {
    const source = projectReceiveds && projectReceiveds.length > 0 ? projectReceiveds : (fetchedReceiveds || []);
    const project = source.find((pr) => String(pr._id) === String(id));
    if (!project) {
      if (loadingDetail) {
        return (
          <div className="container py-5 text-center">
            <div className="spinner-border text-success" role="status"><span className="visually-hidden">Loading...</span></div>
            <p className="mt-3 text-muted">Loading project received details...</p>
          </div>
        );
      }
      return (
        <div className="container py-5">
          <div className="text-center">
            <div className="alert alert-warning" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Project Received not found
            </div>
            <Link to="/project-received" className="btn btn-secondary mt-3">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Project Received List
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="text-primary mb-0">
                <i className="bi bi-inbox me-2"></i>
                Project Received Details
              </h2>
              <Link to="/project-received" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i>
                Back to List
              </Link>
            </div>
            
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Employee ID</label>
                      <p className="form-control-plaintext">
                        <span className="badge bg-secondary">{project.idNo}</span>
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Principal Investigator</label>
                      <p className="form-control-plaintext fs-5 fw-medium">{project.principalInvestigatorName}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Designation</label>
                      <p className="form-control-plaintext">{project.designation}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Department</label>
                      <p className="form-control-plaintext">{project.department}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Faculty</label>
                      <p className="form-control-plaintext">{project.faculty}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Project Name</label>
                      <p className="form-control-plaintext fs-5 fw-medium">{project.projectName}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Project Code</label>
                      <p className="form-control-plaintext">{project.projectCode || '—'}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Funding Agency ID</label>
                      <p className="form-control-plaintext">
                        <span className="badge bg-info">{project.fundingAgencyId}</span>
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Duration (months)</label>
                      <p className="form-control-plaintext">{project.durationOfProject}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Type of Project</label>
                      <p className="form-control-plaintext">
                        <span className="badge bg-primary">{project.typeOfProject}</span>
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Total Project Cost</label>
                      <p className="form-control-plaintext fs-5 fw-medium text-success">
                        {formatNumber(project.totalProjectCost)}
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Receipt Date</label>
                      <p className="form-control-plaintext">{formatDate(project.dateOfReceipt)}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Financial Year</label>
                      <p className="form-control-plaintext">
                        <span className="badge bg-warning text-dark">{project.financialYear}</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Additional Details Row */}
                <div className="row mt-3">
                  <div className="col-12">
                    <hr />
                    <div className="row">
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-bold text-muted">Recurring Cost</label>
                          <p className="form-control-plaintext">{formatNumber(project.recurring)}</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-bold text-muted">Non-Recurring Cost</label>
                          <p className="form-control-plaintext">{formatNumber(project.nonRecurring)}</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-bold text-muted">Overhead</label>
                          <p className="form-control-plaintext">{formatNumber(project.overhead)}</p>
                        </div>
                      </div>
                    </div>
                    {project.remark && (
                      <div className="mb-3">
                        <label className="form-label fw-bold text-muted">Remark</label>
                        <p className="form-control-plaintext">{project.remark}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="text-center mb-4" style={{ color: '#343a40' }}>
            <i className="bi bi-inbox text-success me-2"></i>
            Projects Received
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
              placeholder="Search by Employee ID, PI Name, Project Name, Funding Agency, or Department..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search projects received"
            />
          </div>
        </div>
        <div className="col-md-4 text-end">
          <button 
            className="btn btn-success" 
            onClick={handleCreateProjectReceived}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Create Project Received
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            Showing {filteredProjects.length} of {projectReceiveds.length} projects received
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Employee ID</th>
              <th>Principal Investigator</th>
              <th>Project Name</th>
              <th>Project Code</th>
              <th>Funding Agency</th>
              <th>Department</th>
              <th>Total Cost</th>
              <th>Receipt Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr key="no-projects">
                <td colSpan={9} className="text-center text-muted py-4">
                  <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                  {searchQuery ? 'No projects found matching your search.' : 'No projects received available.'}
                </td>
              </tr>
            ) : (
              filteredProjects.map((project, index) => (
                <tr key={project._id || `project-${index}`}>
                  <td>
                    <span className="badge bg-secondary">{project.idNo}</span>
                  </td>
                  <td>
                    <strong>{project.principalInvestigatorName}</strong>
                    <br />
                    <small className="text-muted">{project.designation || 'N/A'}</small>
                  </td>
                  <td>
                    <span className="fw-medium">{project.projectName}</span>
                    <br />
                    <small className="text-muted">{project.typeOfProject || 'N/A'}</small>
                  </td>
                  <td>
                    {project.projectCode}
                  </td>
                  <td>
                    <span className="badge bg-info">{project.fundingAgencyId}</span>
                  </td>
                  <td>
                    {project.department || 'N/A'}
                    <br />
                    <small className="text-muted">{project.faculty || 'N/A'}</small>
                  </td>
                  <td>
                    <strong className="text-success">{formatNumber(project.totalProjectCost)}</strong>
                    <br />
                    <small className="text-muted">
                      R: {formatNumber(project.recurring)} | 
                      NR: {formatNumber(project.nonRecurring)}
                    </small>
                  </td>
                  <td>
                    {formatDate(project.dateOfReceipt)}
                    <br />
                    <small className="text-muted">{project.financialYear}</small>
                  </td>
                  <td>
                    <Link 
                      to={`/project-received/${project._id}`} 
                      className="btn btn-sm btn-outline-success"
                      title="View project details"
                    >
                      <i className="bi bi-eye me-1"></i>
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectReceivedComponent;