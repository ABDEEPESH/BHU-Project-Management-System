import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import type { FundExpenditureDTO } from '../types';

const FundExpenditureConfirmation: React.FC = () => {
  const location = useLocation();
  const expenditure = location.state?.expenditure as FundExpenditureDTO;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (!expenditure) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">No Expenditure Data Found</h4>
              <p>No fund expenditure data was found. Please go back and create a new expenditure.</p>
              <Link to="/fund-expenditure/create" className="btn btn-primary">
                Create New Expenditure
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white text-center">
              <h2 className="h4 mb-0">
                <i className="bi bi-check-circle me-2"></i>
                Fund Expenditure Created Successfully!
              </h2>
            </div>
            <div className="card-body">
              {/* Success Message */}
              <div className="alert alert-success text-center mb-4">
                <i className="bi bi-check-circle-fill fs-1 text-success"></i>
                <h4 className="mt-2">Expenditure Record Created</h4>
                <p className="mb-0">Your fund expenditure has been successfully recorded in the system.</p>
              </div>

              {/* Expenditure Details */}
              <div className="row mb-4">
                <div className="col-12">
                  <h5 className="text-primary mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Expenditure Details
                  </h5>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Project Code:</strong>
                </div>
                <div className="col-md-6">
                  <span className="badge bg-primary fs-6">{expenditure.projectCode}</span>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Financial Year:</strong>
                </div>
                <div className="col-md-6">
                  <span className="badge bg-info fs-6">{expenditure.financialYear}</span>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Date of Expenditure:</strong>
                </div>
                <div className="col-md-6">
                  {formatDate(expenditure.dateOfExpenditure)}
                </div>
              </div>

              {/* Expenditure Breakdown */}
              <div className="row mb-4">
                <div className="col-12">
                  <h6 className="text-secondary mb-3">Expenditure Breakdown</h6>
                </div>
                <div className="col-md-6">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Equipment Purchase:</span>
                    <span className="fw-bold">{formatCurrency(expenditure.equipmentPurchase)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Salary:</span>
                    <span className="fw-bold">{formatCurrency(expenditure.salary)}</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Contingency:</span>
                    <span className="fw-bold">{formatCurrency(expenditure.contingency)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Overhead:</span>
                    <span className="fw-bold">{formatCurrency(expenditure.overhead)}</span>
                  </div>
                </div>
              </div>

              {/* Total Expenditure */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="alert alert-primary">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <strong className="fs-5">Total Expenditure:</strong>
                      </div>
                      <div className="col-md-6 text-end">
                        <span className="h4 text-primary mb-0">
                          {formatCurrency(expenditure.totalExpenditure)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {expenditure.remark && (
                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="text-secondary mb-2">Remarks:</h6>
                    <div className="alert alert-light">
                      {expenditure.remark}
                    </div>
                  </div>
                </div>
              )}

              {/* System Information */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="alert alert-light">
                    <div className="row text-center">
                      <div className="col-md-6">
                        <small className="text-muted">
                          <strong>Created:</strong> {formatDate(expenditure.timestamp)}
                        </small>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">
                          <strong>Record ID:</strong> {expenditure._id}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="row">
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <Link to="/fund-expenditure" className="btn btn-outline-primary">
                      <i className="bi bi-list me-2"></i>
                      View All Expenditures
                    </Link>
                    <Link to="/fund-expenditure/create" className="btn btn-primary">
                      <i className="bi bi-plus-circle me-2"></i>
                      Create Another
                    </Link>
                    <Link to="/" className="btn btn-secondary">
                      <i className="bi bi-house me-2"></i>
                      Back to Home
                    </Link>
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

export default FundExpenditureConfirmation;
