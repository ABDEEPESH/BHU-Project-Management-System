import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { FundingAgencyDTO } from '../types';

interface FundingAgencyProps {
  fundingAgencies: FundingAgencyDTO[];
}

const FundingAgencyComponent: React.FC<FundingAgencyProps> = ({ fundingAgencies }) => {
  const { fundingAgencyId } = useParams<{ fundingAgencyId?: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter funding agencies based on search query
  const filteredAgencies = fundingAgencies.filter((agency) =>
    agency.fundingAgencyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agency.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agency.typeOfAgency.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agency.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Create Funding Agency button click
  const handleCreateFundingAgency = () => {
    navigate('/funding-agencies/create');
  };

  if (fundingAgencyId) {
    const agency = fundingAgencies.find(a => a.fundingAgencyId === fundingAgencyId);
    if (!agency) {
      return (
        <div className="container py-5">
          <div className="text-center">
            <div className="alert alert-warning" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Funding agency not found
            </div>
            <Link to="/funding-agencies" className="btn btn-secondary mt-3">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Funding Agencies List
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
                <i className="bi bi-building me-2"></i>
                Funding Agency Details
              </h2>
              <Link to="/funding-agencies" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i>
                Back to List
              </Link>
            </div>
            
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Funding Agency ID</label>
                      <p className="form-control-plaintext">
                        <span className="badge bg-secondary">{agency.fundingAgencyId}</span>
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Full Name</label>
                      <p className="form-control-plaintext fs-5 fw-medium">{agency.name}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Short Name</label>
                      <p className="form-control-plaintext">{agency.shortName}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Type of Agency</label>
                      <p className="form-control-plaintext">
                        <span className="badge bg-info">{agency.typeOfAgency}</span>
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Category</label>
                      <p className="form-control-plaintext">
                        <span className="badge bg-success">{agency.category}</span>
                      </p>
                    </div>
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
            <i className="bi bi-building text-success me-2"></i>
            Funding Agencies
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
              placeholder="Search by ID, Name, Short Name, Type, or Category..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search funding agencies"
            />
          </div>
        </div>
        <div className="col-md-4 text-end">
          <button 
            className="btn btn-success" 
            onClick={handleCreateFundingAgency}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Create Funding Agency
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            Showing {filteredAgencies.length} of {fundingAgencies.length} funding agencies
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>
      </div>

      {/* Funding Agencies Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Funding Agency ID</th>
              <th>Name</th>
              <th>Short Name</th>
              <th>Type</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgencies.length === 0 ? (
              <tr key="no-agencies">
                <td colSpan={6} className="text-center text-muted py-4">
                  <i className="bi bi-building fs-1 d-block mb-2"></i>
                  {searchQuery ? 'No funding agencies found matching your search.' : 'No funding agencies available.'}
                </td>
              </tr>
            ) : (
              filteredAgencies.map((agency) => (
                <tr key={agency.fundingAgencyId}>
                  <td>
                    <span className="badge bg-secondary">{agency.fundingAgencyId}</span>
                  </td>
                  <td>
                    <strong>{agency.name}</strong>
                  </td>
                  <td>{agency.shortName}</td>
                  <td>
                    <span className="badge bg-info">{agency.typeOfAgency}</span>
                  </td>
                  <td>
                    <span className="badge bg-success">{agency.category}</span>
                  </td>
                  <td>
                    <Link 
                      to={`/funding-agencies/faid/${agency.fundingAgencyId}`} 
                      className="btn btn-sm btn-outline-success"
                      title="View funding agency details"
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

export default FundingAgencyComponent;