import React from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import { useSecurity } from '../security/SecurityConfig';

const Navigation: React.FC = () => {
  const { userRole, employeeInfo, logout } = useSecurity();

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-light shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img 
              src="/bhu-favicon-32x32.svg" 
              alt="BHU Logo" 
              width="40" 
              height="40" 
              className="me-2"
            />
            <span className="fw-bold text-primary">BHU Project Management</span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              {/* Navigation menu items removed as requested */}
            </ul>
            <div className="navbar-nav ms-auto align-items-center">
              <DarkModeToggle />
              {/* Admin/Staff role display */}
              {(userRole === 'admin' || userRole === 'staff') && (
                <div className="nav-item ms-3">
                  <span className={`badge ${userRole === 'admin' ? 'bg-primary' : 'bg-success'} fs-6`}>
                    <i className={`bi ${userRole === 'admin' ? 'bi-shield-lock' : 'bi-person-badge'} me-1`}></i>
                    {userRole === 'admin' ? 'Admin' : 'Staff'}
                  </span>
                  <button className="btn btn-sm btn-outline-danger ms-2" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                  </button>
                </div>
              )}
              {/* EID user profile moved into navbar as a compact dropdown */}
              {userRole === 'user' && employeeInfo && (
                <div className="nav-item dropdown ms-3">
                  <button
                    className="btn btn-success dropdown-toggle d-flex align-items-center"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-badge me-2"></i>
                    EID
                  </button>
                  <div className="dropdown-menu dropdown-menu-end p-3" style={{ minWidth: '280px' }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-semibold"><i className="bi bi-person-badge me-2"></i>User Profile</span>
                      <span className="badge bg-success-subtle text-success border border-success">EID</span>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted d-block">Name</small>
                      <div className="fw-semibold">{employeeInfo.name || '-'}</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted d-block">Department</small>
                      <div className="fw-semibold">{employeeInfo.department || '-'}</div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <small className="text-muted">EID: {employeeInfo.idNo}</small>
                      <button className="btn btn-sm btn-outline-danger" onClick={logout}>
                        <i className="bi bi-box-arrow-right me-1"></i>Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Removed floating fixed card; profile now lives in the navbar dropdown */}
    </>
  );
};

export default Navigation;