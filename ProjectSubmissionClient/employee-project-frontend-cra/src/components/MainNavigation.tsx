import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSecurity } from '../security/SecurityConfig';

interface MainNavigationProps {
  employees?: any[];
  fundingAgencies?: any[];
  projectSubmissions?: any[];
  projectReceiveds?: any[];
}

const MainNavigation: React.FC<MainNavigationProps> = ({ 
  employees = [], 
  fundingAgencies = [], 
  projectSubmissions = [], 
  projectReceiveds = [] 
}) => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { userRole } = useSecurity();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const raw = searchInput?.trim();
    if (!raw) {
      setSearchError('Please enter a search term');
      return;
    }

    try {
      const term = raw.toLowerCase();
      console.log('[MainNavigation] Global search:', { term });

      // 1) Employees: match by idNo, name, department, faculty, designation, email, mobile
      const employeeMatch = employees.find((emp: any) => (
        (emp?.idNo && String(emp.idNo).toLowerCase().includes(term)) ||
        (emp?.name && emp.name.toLowerCase().includes(term)) ||
        (emp?.department && emp.department.toLowerCase().includes(term)) ||
        (emp?.faculty && emp.faculty.toLowerCase().includes(term)) ||
        (emp?.designation && emp.designation.toLowerCase().includes(term)) ||
        (emp?.email && String(emp.email).toLowerCase().includes(term)) ||
        (emp?.mobile && String(emp.mobile).toLowerCase().includes(term))
      ));

      // 2) Funding Agencies: match by name, shortName, id
      const agencyMatch = fundingAgencies.find((fa: any) => (
        (fa?.name && fa.name.toLowerCase().includes(term)) ||
        (fa?.shortName && fa.shortName.toLowerCase().includes(term)) ||
        (fa?.fundingAgencyId && String(fa.fundingAgencyId).toLowerCase().includes(term))
      ));

      // 3) Project Submissions: match by projectCode, projectName, PI, FA, dept, faculty, type
      const submissionMatch = projectSubmissions.find((s: any) => (
        (s?.projectCode && s.projectCode.toLowerCase().includes(term)) ||
        (s?.projectName && s.projectName.toLowerCase().includes(term)) ||
        (s?.principalInvestigatorName && s.principalInvestigatorName.toLowerCase().includes(term)) ||
        (s?.fundingAgencyId && String(s.fundingAgencyId).toLowerCase().includes(term)) ||
        (s?.department && s.department.toLowerCase().includes(term)) ||
        (s?.faculty && s.faculty.toLowerCase().includes(term)) ||
        (s?.typeOfProject && s.typeOfProject.toLowerCase().includes(term))
      ));

      // 4) Project Received: match by projectCode, projectName, PI, FA, dept, faculty, type, financialYear
      const receivedMatch = projectReceiveds.find((p: any) => (
        (p?.projectCode && p.projectCode.toLowerCase().includes(term)) ||
        (p?.projectName && p.projectName.toLowerCase().includes(term)) ||
        (p?.principalInvestigatorName && p.principalInvestigatorName.toLowerCase().includes(term)) ||
        (p?.fundingAgencyId && String(p.fundingAgencyId).toLowerCase().includes(term)) ||
        (p?.department && p.department.toLowerCase().includes(term)) ||
        (p?.faculty && p.faculty.toLowerCase().includes(term)) ||
        (p?.typeOfProject && p.typeOfProject.toLowerCase().includes(term)) ||
        (p?.financialYear && String(p.financialYear).toLowerCase().includes(term))
      ));

      // Prefer exact/strong matches for direct nav to details; otherwise go to list pages
      if (employeeMatch) {
        return navigate(`/employee/eid/${employeeMatch.idNo}`);
      }
      if (submissionMatch) {
        const id = submissionMatch?._id || submissionMatch?.id;
        if (id) return navigate(`/project-submission/${encodeURIComponent(id)}`);
        return navigate('/project-submission');
      }
      if (receivedMatch) {
        const id = receivedMatch?._id || receivedMatch?.id;
        if (id) return navigate(`/project-received/${encodeURIComponent(id)}`);
        return navigate('/project-received');
      }
      if (agencyMatch) {
        const faid = agencyMatch?.fundingAgencyId || agencyMatch?._id || agencyMatch?.id;
        if (faid) return navigate(`/funding-agencies/faid/${encodeURIComponent(faid)}`);
        return navigate('/funding-agencies');
      }

      // If nothing matched
      setSearchError('No matches found. Try Employee ID/Name, Agency Name/Code, Project Name/Code.');
    } catch (err) {
      console.error('[MainNavigation] Search error:', err);
      setSearchError('An error occurred during search');
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        {/* BHU Header Logo */}
        <div className="mb-4">
          <img 
            src="/bhu-logo-header.png" 
            alt="Banaras Hindu University" 
            className="img-fluid mx-auto d-block bhu-header-logo" 
            style={{ maxHeight: '200px', width: 'auto' }} 
          />
        </div>
        
        {/* SRIC Header */}
        <div className="mb-4">
          <img 
            src="/sric-header.svg" 
            alt="Sponsored Research and Industrial Consultancy Cell - Project Management System" 
            className="img-fluid mx-auto d-block sric-header" 
            style={{ maxHeight: '200px', width: 'auto' }} 
          />
        </div>
        
        <p className="lead text-muted">Welcome to the comprehensive project management platform</p>
      </div>

      {/* Search Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h3 className="card-title h5 text-primary mb-3">Quick Search</h3>
              <form onSubmit={handleSearch} aria-label="Search form">
                <div className="input-group mb-3 justify-content-center">
                  <input
                    type="text"
                    className={`form-control ${searchError ? 'is-invalid' : ''}`}
                    style={{ maxWidth: '500px' }}
                    id="searchInput"
                    placeholder="Search Employee, Funding Agency, Project Submission/Received (ID, Name, Department, Project Code, etc.)"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    aria-label="Global quick search"
                    aria-describedby="searchFeedback"
                  />
                  <button className="btn btn-primary" type="submit" aria-label="Search">
                    <i className="bi bi-search"></i> Search
                  </button>
                </div>
                {searchError && (
                  <div id="searchFeedback" className="invalid-feedback d-block">
                    {searchError}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Employee Management Section */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <div className="bg-primary bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-people-fill fs-4"></i>
              </div>
              <h3 className="card-title h5">Employee Management</h3>
              <p className="card-text text-muted">Manage employee information and details</p>
              <div className="d-grid gap-2">
                <Link to="/employee" className="btn btn-outline-primary">View Employees</Link>
                {userRole === 'admin' && (
                  <Link to="/employee/create" className="btn btn-primary">Add Employee</Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Funding Agency Section */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <div className="bg-success bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-building fs-4"></i>
              </div>
              <h3 className="card-title h5">Funding Agencies</h3>
              <p className="card-text text-muted">Manage funding agency information</p>
              <div className="d-grid gap-2">
                <Link to="/funding-agencies" className="btn btn-outline-success">View Agencies</Link>
                {userRole === 'admin' && (
                  <Link to="/funding-agencies/create" className="btn btn-success">Add Agency</Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Project Submission Section */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <div className="bg-info bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-send-plus fs-4"></i>
              </div>
              <h3 className="card-title h5">Project Submissions</h3>
              <p className="card-text text-muted">Submit and manage project proposals</p>
              <div className="d-grid gap-2">
                <Link to="/project-submission" className="btn btn-outline-info">View Submissions</Link>
                {userRole === 'admin' && (
                  <Link to="/project-submission/create" className="btn btn-info">Submit Project</Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Project Received Section */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <div className="bg-warning bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-inbox-fill fs-4"></i>
              </div>
              <h3 className="card-title h5">Project Received</h3>
              <p className="card-text text-muted">Track received project information</p>
              <div className="d-grid gap-2">
                <Link to="/project-received" className="btn btn-outline-warning">View Received</Link>
                {userRole === 'admin' && (
                  <Link to="/project-received/create" className="btn btn-warning">Add Received</Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fund Receipt Section */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <div className="bg-danger bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-receipt fs-4"></i>
              </div>
              <h3 className="card-title h5">Fund Receipt</h3>
              <p className="card-text text-muted">Manage fund receipts and transactions</p>
              <div className="d-grid gap-2">
                <Link to="/fund-receipt" className="btn btn-outline-danger">View Receipts</Link>
                {userRole === 'admin' && (
                  <Link to="/fund-receipt/create" className="btn btn-danger">Add Receipt</Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <div className="bg-dark bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-bank fs-4"></i>
              </div>
              <h3 className="card-title h5">Bank Details</h3>
              <p className="card-text text-muted">Manage bank account information</p>
              <div className="d-grid gap-2">
                <Link to="/bank-details" className="btn btn-outline-dark">View Banks</Link>
                {userRole === 'admin' && (
                  <Link to="/bank-details/create" className="btn btn-dark">Add Bank</Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fund Expenditure Section */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 fund-exp-card">
            <div className="card-body text-center">
              <div className="bg-purple bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-cash-stack fs-4"></i>
              </div>
              <h3 className="card-title h5">Fund Expenditure</h3>
              <p className="card-text text-muted">Track and manage project expenditures</p>
              <div className="d-grid gap-2">
                <Link to="/fund-expenditure" className="btn btn-outline-purple">View Expenditures</Link>
                {userRole === 'admin' && (
                  <Link to="/fund-expenditure/create" className="btn btn-purple">Add Expenditure</Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Section */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <div className="bg-secondary bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-tools fs-4"></i>
              </div>
              <h3 className="card-title h5">Equipment</h3>
              <p className="card-text text-muted">Manage project equipment inventory</p>
              <div className="d-grid gap-2">
                <Link to="/equipment" className="btn btn-outline-secondary">View Equipment</Link>
                {userRole === 'admin' && (
                  <Link to="/equipment/create" className="btn btn-secondary">Add Equipment</Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Tools (visible only for admins) */}
        {userRole === 'admin' && (
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body text-center">
                <div className="bg-primary bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-shield-check fs-4"></i>
                </div>
                <h3 className="card-title h5">Admin Tools</h3>
                <p className="card-text text-muted">Approve user requests and monitor sessions</p>
                <div className="d-grid gap-2">
                  <Link to="/admin/approvals" className="btn btn-outline-primary">Approval Queue</Link>
                  <Link to="/admin/monitor" className="btn btn-primary">Session Monitor</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Information Section */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h3 className="card-title h4 text-primary mb-3">About SRIC - BHU</h3>
              <p className="card-text">
                The Sponsored Research and Industrial Consultancy Cell (SRIC) at Banaras Hindu University (BHU) 
                is dedicated to fostering research excellence and innovation. Our project management 
                system provides comprehensive tools for managing research projects, employee information, 
                funding agency relationships, and industrial consultancy activities.
              </p>
              <div className="row mt-4">
                <div className="col-md-4">
                  <div className="text-center">
                    <i className="bi bi-award text-primary fs-1"></i>
                    <h5 className="mt-2">Research Excellence</h5>
                    <p className="text-muted">Supporting cutting-edge research initiatives</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <i className="bi bi-people text-success fs-1"></i>
                    <h5 className="mt-2">Team Collaboration</h5>
                    <p className="text-muted">Fostering interdisciplinary collaboration</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <i className="bi bi-lightbulb text-warning fs-1"></i>
                    <h5 className="mt-2">Innovation</h5>
                    <p className="text-muted">Driving innovation and discovery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNavigation;