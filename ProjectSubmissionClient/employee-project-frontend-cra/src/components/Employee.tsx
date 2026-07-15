import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchEmployeeById } from '../services/api';
import type { EmployeeDTO } from '../types';

interface EmployeeProps {
  employees: EmployeeDTO[];
}

const EmployeeComponent: React.FC<EmployeeProps> = ({ employees }) => {
  const { employeeId } = useParams<{ employeeId?: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [employee, setEmployee] = useState<EmployeeDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Log when component mounts
  useEffect(() => {
    console.log('[EmployeeComponent] Mounted', { employeeId, employeesCount: employees.length });
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    console.log('[EmployeeComponent] Search query updated', { searchQuery: e.target.value });
  };

  // Filter employees based on search query
  const filteredEmployees = employees.filter((employee) =>
    (employee.idNo ? employee.idNo.toString().includes(searchQuery) : false) ||
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.faculty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Create Employee button click
  const handleCreateEmployee = () => {
    console.log('[EmployeeComponent] Navigating to create employee');
    navigate('/employee/create');
  };

  // Fetch employee details when employeeId is present
  useEffect(() => {
    if (employeeId) {
      console.log('[EmployeeComponent] useEffect triggered for employeeId', { employeeId });
      const fetchEmployee = async () => {
        setLoading(true);
        setError(null);
        try {
          console.log(`[EmployeeComponent] Fetching employee with idNo: ${employeeId}`);
          const employeeData = await fetchEmployeeById(employeeId);
          console.log('[EmployeeComponent] Employee fetched successfully', { employeeData });
          setEmployee(employeeData);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employee details';
          console.error('[EmployeeComponent] Error fetching employee', {
            employeeId,
            error: err,
            message: errorMessage,
          });
          setError(errorMessage);
          setEmployee(null);
        } finally {
          setLoading(false);
          console.log('[EmployeeComponent] Fetch complete', { loading: false });
        }
      };
      fetchEmployee();
    } else {
      console.log('[EmployeeComponent] No employeeId provided, skipping fetch');
    }
  }, [employeeId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
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

  if (employeeId) {
    if (loading) {
      return (
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading employee details...</p>
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="container py-5">
          <div className="text-center">
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
            <Link to="/employee" className="btn btn-secondary mt-3">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Employee List
            </Link>
          </div>
        </div>
      );
    }
    if (!employee) {
      return (
        <div className="container py-5">
          <div className="text-center">
            <div className="alert alert-warning" role="alert">
              <i className="bi bi-question-circle me-2"></i>
              Employee not found
            </div>
            <Link to="/employee" className="btn btn-secondary mt-3">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Employee List
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
                <i className="bi bi-person-circle me-2"></i>
                Employee Details
              </h2>
              <Link to="/employee" className="btn btn-outline-secondary">
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
                      <p className="form-control-plaintext">{employee.idNo}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Full Name</label>
                      <p className="form-control-plaintext fs-5 fw-medium">{employee.name}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Designation</label>
                      <p className="form-control-plaintext">{employee.designation}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Department</label>
                      <p className="form-control-plaintext">{employee.department}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Faculty</label>
                      <p className="form-control-plaintext">{employee.faculty}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Date of Birth</label>
                      <p className="form-control-plaintext">{formatDate(employee.doB)}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Date of Joining</label>
                      <p className="form-control-plaintext">{formatDate(employee.doJ)}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Date of Retirement</label>
                      <p className="form-control-plaintext">{formatDate(employee.doR)}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Passport Number</label>
                      <p className="form-control-plaintext">{employee.passportNo || 'N/A'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Mobile</label>
                      <p className="form-control-plaintext">{employee.mobile || 'N/A'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted">Email</label>
                      <p className="form-control-plaintext">{employee.email || 'N/A'}</p>
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
            <i className="bi bi-people-fill text-primary me-2"></i>
            Employee Management
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
              placeholder="Search by ID, Name, Department, or Faculty..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search employees"
            />
          </div>
        </div>
        <div className="col-md-4 text-end">
          <button 
            className="btn btn-primary" 
            onClick={handleCreateEmployee}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Create Employee
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            Showing {filteredEmployees.length} of {employees.length} employees
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Faculty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr key="no-employees">
                <td colSpan={6} className="text-center text-muted py-4">
                  <i className="bi bi-people fs-1 d-block mb-2"></i>
                  {searchQuery ? 'No employees found matching your search.' : 'No employees available.'}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee, index) => (
                <tr key={(employee as any)._id || `${employee.idNo}-${index}`}>
                  <td>
                    <span className="badge bg-secondary">{employee.idNo}</span>
                  </td>
                  <td>
                    <strong>{employee.name}</strong>
                  </td>
                  <td>{employee.designation}</td>
                  <td>{employee.department}</td>
                  <td>{employee.faculty}</td>
                  <td>
                    <Link 
                      to={`/employee/eid/${employee.idNo}`} 
                      className="btn btn-sm btn-outline-primary"
                      title="View employee details"
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

export default EmployeeComponent;