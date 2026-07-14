import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchFundExpenditures, deleteFundExpenditure } from '../services/api';
import type { FundExpenditureDTO } from '../types';

const FundExpenditureList: React.FC = () => {
  const [expenditures, setExpenditures] = useState<FundExpenditureDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [sortBy, setSortBy] = useState<'projectCode' | 'financialYear' | 'totalExpenditure'>('projectCode');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadExpenditures();
  }, []);

  const loadExpenditures = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFundExpenditures();
      setExpenditures(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load fund expenditures';
      setError(errorMessage);
      console.error('[FundExpenditureList] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this fund expenditure?')) {
      try {
        await deleteFundExpenditure(id);
        setExpenditures(prev => prev.filter(exp => exp._id !== id));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete fund expenditure';
        alert(errorMessage);
        console.error('[FundExpenditureList] Delete error:', err);
      }
    }
  };

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

  // Filter and sort expenditures
  const filteredAndSortedExpenditures = expenditures
    .filter(exp => {
      const matchesSearch = exp.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exp.financialYear.includes(searchTerm);
      const matchesYear = !filterYear || exp.financialYear === filterYear;
      return matchesSearch && matchesYear;
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'projectCode':
          aValue = a.projectCode;
          bValue = b.projectCode;
          break;
        case 'financialYear':
          aValue = a.financialYear;
          bValue = b.financialYear;
          break;
        case 'totalExpenditure':
          aValue = a.totalExpenditure;
          bValue = b.totalExpenditure;
          break;
        default:
          aValue = a.projectCode;
          bValue = b.projectCode;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Get unique financial years for filter
  const uniqueYears = Array.from(new Set(expenditures.map(exp => exp.financialYear))).sort();

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading fund expenditures...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error Loading Fund Expenditures</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadExpenditures}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2 className="h4 mb-0">
                <i className="bi bi-cash-stack me-2"></i>
                Fund Expenditure Management
              </h2>
              <Link to="/fund-expenditure/create" className="btn btn-light">
                <i className="bi bi-plus-circle me-2"></i>
                Add New Expenditure
              </Link>
            </div>
            <div className="card-body">
              {/* Search and Filter Controls */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <label htmlFor="searchInput" className="form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    id="searchInput"
                    placeholder="Search by project code or financial year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="yearFilter" className="form-label">Filter by Year</label>
                  <select
                    className="form-select"
                    id="yearFilter"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                  >
                    <option value="">All Years</option>
                    {uniqueYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="sortBy" className="form-label">Sort By</label>
                  <select
                    className="form-select"
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="projectCode">Project Code</option>
                    <option value="financialYear">Financial Year</option>
                    <option value="totalExpenditure">Total Amount</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label htmlFor="sortOrder" className="form-label">Order</label>
                  <select
                    className="form-select"
                    id="sortOrder"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="alert alert-info">
                    <div className="row text-center">
                      <div className="col-md-3">
                        <strong>Total Records:</strong> {filteredAndSortedExpenditures.length}
                      </div>
                      <div className="col-md-3">
                        <strong>Total Expenditure:</strong> {formatCurrency(filteredAndSortedExpenditures.reduce((sum, exp) => sum + exp.totalExpenditure, 0))}
                      </div>
                      <div className="col-md-3">
                        <strong>Average per Record:</strong> {formatCurrency(filteredAndSortedExpenditures.length > 0 ? filteredAndSortedExpenditures.reduce((sum, exp) => sum + exp.totalExpenditure, 0) / filteredAndSortedExpenditures.length : 0)}
                      </div>
                      <div className="col-md-3">
                        <strong>Years Covered:</strong> {uniqueYears.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expenditures Table */}
              {filteredAndSortedExpenditures.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="text-muted mt-3">No fund expenditures found</h5>
                  <p className="text-muted">Try adjusting your search criteria or add a new expenditure.</p>
                  <Link to="/fund-expenditure/create" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Add First Expenditure
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Project Code</th>
                        <th>Financial Year</th>
                        <th>Equipment (₹)</th>
                        <th>Salary (₹)</th>
                        <th>Contingency (₹)</th>
                        <th>Overhead (₹)</th>
                        <th>Total (₹)</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedExpenditures.map((expenditure) => (
                        <tr key={expenditure._id}>
                          <td>
                            <strong>{expenditure.projectCode}</strong>
                            {expenditure.remark && (
                              <div className="small text-muted">{expenditure.remark}</div>
                            )}
                          </td>
                          <td>
                            <span className="badge bg-info">{expenditure.financialYear}</span>
                          </td>
                          <td className="text-end">{formatCurrency(expenditure.equipmentPurchase)}</td>
                          <td className="text-end">{formatCurrency(expenditure.salary)}</td>
                          <td className="text-end">{formatCurrency(expenditure.contingency)}</td>
                          <td className="text-end">{formatCurrency(expenditure.overhead)}</td>
                          <td className="text-end">
                            <strong className="text-primary">{formatCurrency(expenditure.totalExpenditure)}</strong>
                          </td>
                          <td>{formatDate(expenditure.dateOfExpenditure)}</td>
                          <td>
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                title="View Details"
                                onClick={() => {/* TODO: Implement view details */}}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-warning"
                                title="Edit"
                                onClick={() => {/* TODO: Implement edit */}}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                title="Delete"
                                onClick={() => expenditure._id && handleDelete(expenditure._id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Back to Home Button */}
              <div className="row mt-4">
                <div className="col-12">
                  <Link to="/" className="btn btn-secondary">
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundExpenditureList;
