import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFundReceipts } from '../services/api';
import type { FundReceiptDTO } from '../types';

const FundReceiptList: React.FC = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<FundReceiptDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedReceipts = await fetchFundReceipts();
        setReceipts(fetchedReceipts);
        console.log('[FundReceipt] Receipts fetched successfully', { count: fetchedReceipts.length });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch fund receipts';
        setError(errorMessage);
        console.error('[FundReceipt] Error fetching receipts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredReceipts = receipts.filter(
    (receipt) =>
      receipt.idNo?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      receipt.projectNumber?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      receipt.projectName?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      receipt.financialYear?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      receipt.sanctionOrderNumber?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      receipt.challanNumber?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      receipt.pfmsScheme?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      receipt.bankName?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      receipt.accountName?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      receipt.accountNumber?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      receipt.totalAmount?.toString()?.includes(searchQuery)
  );

  const handleCreateClick = () => {
    navigate('/fund-receipt/create');
  };

  const handleViewDetails = (receipt: FundReceiptDTO) => {
    alert(`Fund Receipt Details:\n\n` +
          `Employee ID: ${receipt.idNo}\n` +
          `Project Number: ${receipt.projectNumber}\n` +
          `Project Name: ${receipt.projectName}\n` +
          `Financial Year: ${receipt.financialYear}\n` +
          `Sanction Order Number: ${receipt.sanctionOrderNumber}\n` +
          `Sanction Date: ${receipt.sanctionDate ? new Date(receipt.sanctionDate).toLocaleDateString() : 'N/A'}\n` +
          `Total Amount: ₹${receipt.totalAmount?.toLocaleString() || '0'}\n` +
          `Recurring Amount: ₹${receipt.recurringAmount?.toLocaleString() || '0'}\n` +
          `Non-Recurring Amount: ₹${receipt.nonRecurringAmount?.toLocaleString() || '0'}\n` +
          `Overhead Amount: ₹${receipt.overheadAmount?.toLocaleString() || '0'}\n` +
          `Challan Number: ${receipt.challanNumber}\n` +
          `Challan Date: ${receipt.challanDate ? new Date(receipt.challanDate).toLocaleDateString() : 'N/A'}\n` +
          `PFMS Used: ${receipt.usePFMS ? 'Yes' : 'No'}\n` +
          `PFMS Scheme: ${receipt.pfmsScheme || 'N/A'}\n` +
          `Bank Name: ${receipt.bankName || 'N/A'}\n` +
          `Account Number: ${receipt.accountNumber || 'N/A'}\n` +
          `Account Name: ${receipt.accountName || 'N/A'}`);
  };

  const handleEdit = (receipt: FundReceiptDTO) => {
    alert('Edit functionality will be implemented here');
  };

  const handleDelete = (receipt: FundReceiptDTO) => {
    if (window.confirm(`Are you sure you want to delete the fund receipt for project "${receipt.projectName}"?`)) {
      alert('Delete functionality will be implemented here');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
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
            <i className="bi bi-wallet2 text-primary me-2"></i>
            Fund Receipts
          </h2>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by any field (EID, Project Number, Project Name, Financial Year, etc.)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search fund receipts"
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
            Create Fund Receipt
          </button>
        </div>
      </div>

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

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading fund receipts...</p>
        </div>
      )}

      {!loading && !error && (
        <div className="row mb-3">
          <div className="col-12">
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Showing {filteredReceipts.length} of {receipts.length} fund receipts
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Employee ID</th>
                <th>Project Number</th>
                <th>Project Name</th>
                <th>Financial Year</th>
                <th>Sanction Order</th>
                <th>Sanction Date</th>
                <th>Total Amount</th>
                <th>Challan Number</th>
                <th>PFMS</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.length === 0 ? (
                <tr key="no-receipts">
                  <td colSpan={10} className="text-center text-muted py-4">
                    <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                    {searchQuery ? 'No receipts found matching your search.' : 'No fund receipts available.'}
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt, index) => (
                  <tr key={receipt._id || `receipt-${index}`}>
                    <td>
                      <span className="badge bg-secondary">{receipt.idNo}</span>
                    </td>
                    <td>{receipt.projectNumber}</td>
                    <td>
                      <strong>{receipt.projectName}</strong>
                    </td>
                    <td>{receipt.financialYear}</td>
                    <td>{receipt.sanctionOrderNumber}</td>
                    <td>{formatDate(receipt.sanctionDate)}</td>
                    <td>
                      <span className="text-success fw-bold">
                        {formatCurrency(receipt.totalAmount)}
                      </span>
                    </td>
                    <td>{receipt.challanNumber}</td>
                    <td>
                      <span className={`badge bg-${receipt.usePFMS ? 'success' : 'secondary'}`}>
                        {receipt.usePFMS ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewDetails(receipt)}
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handleEdit(receipt)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(receipt)}
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

export default FundReceiptList;