import React, { useState, useEffect } from 'react';
import { fetchProjectSubmissions, fetchProjectReceiveds, fetchFundingAgencies, fetchEmployees } from '../services/api';
import type { ProjectSubmissionDTO, ProjectReceivedDTO, FundingAgencyDTO, EmployeeDTO } from '../types';

interface SearchResult {
  type: 'submission' | 'received';
  id: string;
  projectName: string;
  employeeId: string;
  employeeName: string;
  fundingAgency: string;
  status: string;
  totalCost: number;
  dateSubmitted?: string;
  dateReceived?: string;
}

const QuickSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'eid' | 'funding' | 'project'>('all');
  
  // Data states
  const [projectSubmissions, setProjectSubmissions] = useState<ProjectSubmissionDTO[]>([]);
  const [projectsReceived, setProjectsReceived] = useState<ProjectReceivedDTO[]>([]);
  const [fundingAgencies, setFundingAgencies] = useState<FundingAgencyDTO[]>([]);
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [submissionsData, receivedData, agenciesData, employeesData] = await Promise.all([
          fetchProjectSubmissions(),
          fetchProjectReceiveds(),
          fetchFundingAgencies(),
          fetchEmployees()
        ]);
        
        setProjectSubmissions(submissionsData.submissions || []);
        setProjectsReceived(receivedData.projects || []);
        setFundingAgencies(agenciesData || []);
        setEmployees(employeesData || []);
      } catch (error) {
        console.error('Error loading search data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const performSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];
    const query = searchQuery.toLowerCase();

    // Helper function to get employee name by ID
    const getEmployeeName = (idNo: string) => {
      const employee = employees.find(emp => emp.idNo === idNo);
      return employee?.name || 'Unknown';
    };

    // Helper function to get funding agency name by ID
    const getFundingAgencyName = (agencyId: string) => {
      const agency = fundingAgencies.find(ag => ag.fundingAgencyId === agencyId);
      return agency?.name || 'Unknown';
    };

    // Search in Project Submissions
    projectSubmissions.forEach(submission => {
      const employeeName = getEmployeeName(submission.idNo);
      const fundingAgencyName = getFundingAgencyName(submission.fundingAgencyId);
      
      let matches = false;
      
      if (searchType === 'all' || searchType === 'eid') {
        matches = matches || submission.idNo.toLowerCase().includes(query);
      }
      if (searchType === 'all' || searchType === 'funding') {
        matches = matches || fundingAgencyName.toLowerCase().includes(query);
      }
      if (searchType === 'all' || searchType === 'project') {
        matches = matches || submission.projectName.toLowerCase().includes(query);
      }

      if (matches) {
        results.push({
          type: 'submission',
          id: submission._id || '',
          projectName: submission.projectName,
          employeeId: submission.idNo,
          employeeName: employeeName,
          fundingAgency: fundingAgencyName,
          status: 'Submitted',
          totalCost: submission.totalProjectCost,
          dateSubmitted: submission.dateOfSubmission
        });
      }
    });

    // Search in Projects Received
    projectsReceived.forEach(received => {
      const employeeName = getEmployeeName(received.idNo);
      const fundingAgencyName = getFundingAgencyName(received.fundingAgencyId);
      
      let matches = false;
      
      if (searchType === 'all' || searchType === 'eid') {
        matches = matches || received.idNo.toLowerCase().includes(query);
      }
      if (searchType === 'all' || searchType === 'funding') {
        matches = matches || fundingAgencyName.toLowerCase().includes(query);
      }
      if (searchType === 'all' || searchType === 'project') {
        matches = matches || received.projectName.toLowerCase().includes(query);
      }

      if (matches) {
        results.push({
          type: 'received',
          id: received._id || '',
          projectName: received.projectName,
          employeeId: received.idNo,
          employeeName: employeeName,
          fundingAgency: fundingAgencyName,
          status: 'Received/Approved',
          totalCost: received.totalProjectCost,
          dateReceived: received.dateOfReceipt
        });
      }
    });

    setSearchResults(results);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-search me-2"></i>
                Quick Search
              </h4>
              <small>Search by Employee ID, Funding Agency, or Project Name</small>
            </div>
            <div className="card-body">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label htmlFor="searchType" className="form-label">Search Type</label>
                    <select
                      id="searchType"
                      className="form-select"
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value as any)}
                    >
                      <option value="all">All Fields</option>
                      <option value="eid">Employee ID</option>
                      <option value="funding">Funding Agency</option>
                      <option value="project">Project Name</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="searchQuery" className="form-label">Search Query</label>
                    <input
                      type="text"
                      id="searchQuery"
                      className="form-control"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter search term..."
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">&nbsp;</label>
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading || !searchQuery.trim()}
                    >
                      <i className="bi bi-search me-1"></i>
                      Search
                    </button>
                  </div>
                </div>
              </form>

              {loading && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading data...</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mt-4">
                  <h5>Search Results ({searchResults.length} found)</h5>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>Project Name</th>
                          <th>Employee ID</th>
                          <th>Employee Name</th>
                          <th>Funding Agency</th>
                          <th>Status</th>
                          <th>Total Cost</th>
                          <th>Date</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((result, index) => (
                          <tr key={`${result.type}-${result.id}-${index}`}>
                            <td>
                              <strong>{result.projectName}</strong>
                            </td>
                            <td>
                              <span className="badge bg-secondary">{result.employeeId}</span>
                            </td>
                            <td>{result.employeeName}</td>
                            <td>{result.fundingAgency}</td>
                            <td>
                              <span className={`badge ${result.status === 'Received/Approved' ? 'bg-success' : 'bg-warning'}`}>
                                {result.status}
                              </span>
                            </td>
                            <td>{formatCurrency(result.totalCost)}</td>
                            <td>{formatDate(result.dateSubmitted || result.dateReceived)}</td>
                            <td>
                              <span className={`badge ${result.type === 'received' ? 'bg-info' : 'bg-primary'}`}>
                                {result.type === 'received' ? 'Received' : 'Submission'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !loading && (
                <div className="alert alert-info mt-4">
                  <i className="bi bi-info-circle me-2"></i>
                  No results found for "{searchQuery}". Try a different search term or search type.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSearch;
