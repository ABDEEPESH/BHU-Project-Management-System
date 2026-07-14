import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import MainNavigation from './components/MainNavigation';
import EmployeeComponent from './components/Employee';
import FundingAgencyComponent from './components/FundingAgency';
import FundReceiptList from './components/FundReceiptList';
import ProjectReceivedComponent from './components/ProjectRecievedComponent';
import ProjectSubmission from './components/ProjectSubmission';
// Import form components
import EmployeeForm from './forms/EmployeeForm';
import FundingAgencyForm from './forms/FundingAgencyForm';
import ProjectSubmissionForm from './forms/ProjectSubmissionForm';
import ProjectRecievedForm from './forms/ProjectRecievedForm';
import FundReceiptForm from './forms/FundReceiptForm';
import BankDetailsForm from './forms/BankDetailsForm';
import FundExpenditureForm from './forms/FundExpenditureForm';
import EquipmentForm from './forms/EquipmentForm';
import StaffApprovalGate from './components/StaffApprovalGate';
import FundExpenditureList from './components/FundExpenditureList';
import FundExpenditureConfirmation from './confirmation/FundExpenditureConfirmation';
import { fetchEmployees, fetchFundingAgencies, fetchProjectSubmissions, fetchProjectReceiveds, checkBackendHealth, fetchPendingRequests, decideRequest, fetchActiveSessions, fetchBankDetails, loginUser, fetchMe, sendHeartbeat } from './services/api';
import type { EmployeeDTO, FundingAgencyDTO, ProjectSubmissionDTO, ProjectReceivedDTO, BankDetailsDTO } from './types';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { SecurityProvider, ProtectedRoute } from './security/SecurityConfig';
import LoginForm from './components/LoginForm';
import './App.css';

// Inline Login page with role choices
const LoginRole: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffUser, setStaffUser] = useState('');
  const [staffPass, setStaffPass] = useState('');

  const doLogin = async (username: string, password: string) => {
    try {
      setError(null);
      setLoading(username);
      const token = await loginUser(username, password);
      try { localStorage.setItem('authToken', token); } catch {}
      // Optionally fetch /auth/me to get role and store it
      navigate('/');
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Login failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="page-hero gradient-soft">
      <div className="panel-glass p-4 p-md-5" style={{ maxWidth: 560, width: '100%' }}>
        <div className="text-center mb-4">
          <h2 className="mb-1">Welcome</h2>
          <div className="text-muted">Choose how you want to sign in</div>
        </div>
        {error && <div className="alert alert-danger mb-3">{error}</div>}
        <div className="d-grid gap-3">
          <button className="btn btn-primary py-2" onClick={() => doLogin('admin1', 'Admin1@123')} disabled={!!loading}>
            {loading === 'admin1' ? 'Signing in…' : 'Sign in as Admin 1'}
          </button>
          <button className="btn btn-primary py-2" onClick={() => doLogin('admin2', 'Admin2@123')} disabled={!!loading}>
            {loading === 'admin2' ? 'Signing in…' : 'Sign in as Admin 2'}
          </button>
          <button className="btn btn-primary py-2" onClick={() => setShowStaffModal(true)} disabled={!!loading}>
            Sign in as Staff
          </button>
          <div className="text-center text-muted small">Need classic login? <a href="#" onClick={(e) => { e.preventDefault(); setShowStaffModal(true); }}>Open staff login</a></div>
        </div>
      </div>

      {showStaffModal && (
        <div className="modal d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
              <div className="modal-header" style={{ borderBottomColor: 'var(--border)' }}>
                <h5 className="modal-title">Staff Login</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowStaffModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input className="form-control" value={staffUser} onChange={(e) => setStaffUser(e.target.value)} placeholder="staff1" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" value={staffPass} onChange={(e) => setStaffPass(e.target.value)} placeholder="••••••" />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
              </div>
              <div className="modal-footer" style={{ borderTopColor: 'var(--border)' }}>
                <button className="btn btn-secondary" onClick={() => setShowStaffModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => doLogin(staffUser, staffPass)} disabled={!staffUser || !staffPass || !!loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline Admin components
const ApprovalQueue: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);


  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); setError(null);
        const reqs = await fetchPendingRequests();
        setItems(reqs);
      } catch (e: any) {
        setError(e?.message || 'Failed to load approval requests');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onDecision = async (id: string, approved: boolean) => {
    try {
      await decideRequest(id, approved);
      setItems(prev => prev.filter(p => (p.id ?? p._id) !== id));
    } catch (e: any) {
      setError(e?.message || 'Failed to submit decision');
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xxl-9 col-lg-10">
          <div className="card shadow-sm">
            <div className="card-header text-white gradient-brand d-flex align-items-center justify-content-between">
              <h2 className="h4 mb-0"><i className="bi bi-inbox me-2"></i>Approval Queue</h2>
              <span className="badge bg-light text-dark">{items.length} pending</span>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>}
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border" role="status"/><div className="text-muted mt-2">Loading requests…</div></div>
              ) : items.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-check2-circle display-6 d-block mb-2"></i>
                  No pending requests.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>Requester</th>
                        <th>Role</th>
                        <th>Target</th>
                        <th>Action</th>
                        <th>Requested At</th>
                        <th>Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it: any) => (
                        <tr key={it.id}>
                          <td>
                            <span className="fw-semibold">{it.requestData || it.requesterId || '-'}</span>
                          </td>
                          <td>
                            <span className="badge bg-secondary text-uppercase">{(it.requesterRole || 'staff')}</span>
                          </td>
                          <td>
                            <span className="badge" style={{ backgroundColor: 'var(--accent2)' }}>{(it.operationType || it.target || '-')}</span>
                          </td>
                          <td className="text-uppercase"><span className="badge" style={{ backgroundColor: 'var(--accent1)' }}>{it.action || 'REQUEST'}</span></td>
                          <td className="text-nowrap">{it.createdAt ? new Date(it.createdAt).toLocaleString() : '-'}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-success" title="Approve" onClick={() => onDecision(it.id, true)}><i className="bi bi-check2"></i></button>
                              <button className="btn btn-danger" title="Reject" onClick={() => onDecision(it.id, false)}><i className="bi bi-x"></i></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SessionMonitor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const ONLINE_WINDOW_MS = 2 * 60 * 1000; // 2 minutes tolerance

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetchActiveSessions();
        // Deduplicate by username (keep latest lastSeenAt)
        const byUser = new Map<string, any>();
        for (const s of Array.isArray(res) ? res : []) {
          const key = s.username || s.eid || s.id;
          const prev = byUser.get(key);
          if (!prev || new Date(s.lastSeenAt).getTime() > new Date(prev.lastSeenAt).getTime()) {
            byUser.set(key, s);
          }
        }
        setSessions(Array.from(byUser.values()));
      } catch (e: any) {
        setError(e?.message || 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Derive computed fields
  const now = Date.now();
  const rows = sessions.map((s) => {
    const started = s.startedAt ? new Date(s.startedAt).getTime() : undefined;
    const last = s.lastSeenAt ? new Date(s.lastSeenAt).getTime() : undefined;
    const online = typeof last === 'number' ? (now - last) <= ONLINE_WINDOW_MS : false;
    const role = s.role === 'user' ? 'staff' : s.role;
    const displayName = (s.username || s.eid || '').toString().trim();
    const durationMs = online
      ? (typeof started === 'number' ? (now - started) : s.durationMs)
      : (typeof started === 'number' && typeof last === 'number' ? (last - started) : s.durationMs);
    return { ...s, role, displayName, online, durationMs, logoutAt: online ? undefined : (s.lastSeenAt || undefined) };
  });
  const visibleRows = rows.filter(r => !!r.displayName);
  const onlineCount = visibleRows.filter(r => r.online).length;

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xxl-9 col-lg-10">
          <div className="card shadow-sm">
            <div className="card-header text-white gradient-brand d-flex align-items-center justify-content-between">
              <h2 className="h4 mb-0"><i className="bi bi-activity me-2"></i>Active Sessions</h2>
              <span className="badge bg-light text-dark">{onlineCount} online</span>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>}
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border" role="status"/><div className="text-muted mt-2">Loading sessions…</div></div>
              ) : visibleRows.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-emoji-smile display-6 d-block mb-2"></i>
                  No active sessions.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Logged In</th>
                        <th>Last Seen</th>
                        <th>Logged Out</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRows.map((s) => (                        <tr key={s.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-secondary text-uppercase">{s.role}</span>
                              {s.displayName ? (
                                <span className="badge bg-info text-dark">{s.displayName}</span>
                              ) : null}
                            </div>
                          </td>
                          <td>
                            {s.online ? (
                              <span className="badge bg-success">online</span>
                            ) : (
                              <span className="badge bg-dark">offline</span>
                            )}
                          </td>
                          <td>{s.startedAt ? new Date(s.startedAt).toLocaleString() : '-'}</td>
                          <td>{s.lastSeenAt ? new Date(s.lastSeenAt).toLocaleString() : '-'}</td>
                          <td>{s.logoutAt ? new Date(s.logoutAt).toLocaleString() : '-'}</td>
                          <td>{typeof s.durationMs === 'number' ? `${Math.max(1, Math.round(s.durationMs / 60000))} min` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inline component: Bank Details List
const BankDetailsListInline: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banks, setBanks] = useState<BankDetailsDTO[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetchBankDetails();
        setBanks(res);
        // Debug: see exactly what we got
        // Remove after verifying values appear
        console.log('[BankDetailsListInline] fetched', res);
      } catch (e: any) {
        setError(e?.message || 'Failed to load bank details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = banks.filter(b => {
    const s = q.toLowerCase();
    return (
      (b.accountName || '').toLowerCase().includes(s) ||
      (b.bankName || '').toLowerCase().includes(s) ||
      (b.accountNumber || '').toLowerCase().includes(s)
    );
  });

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white d-flex align-items-center justify-content-between">
              <h2 className="h4 mb-0">
                <i className="bi bi-bank me-2"></i>
                Bank Details Management
              </h2>
              <div className="input-group" style={{ maxWidth: 360 }}>
                <span className="input-group-text"><i className="bi bi-search"/></span>
                <input className="form-control" placeholder="Search by account/bank/name..." value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>{error}
                </div>
              )}
              {loading ? (
                <div className="text-center py-5"><div className="spinner-border" role="status"/></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Account Name</th>
                        <th>Bank Name</th>
                        <th>Account Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={3} className="text-center text-muted py-4">No bank details found.</td></tr>
                      ) : filtered.map((b, i) => (
                        <tr key={b._id || `${b.accountNumber}-${i}`}>
                          <td>{b.accountName}</td>
                          <td>{b.bankName}</td>
                          <td><code>{b.accountNumber}</code></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [fundingAgencies, setFundingAgencies] = useState<FundingAgencyDTO[]>([]);
  const [projectSubmissions, setProjectSubmissions] = useState<ProjectSubmissionDTO[]>([]);
  const [projectReceiveds, setProjectReceiveds] = useState<ProjectReceivedDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determine auth/guest mode (align with SecurityProvider -> sessionStorage)
        const token = typeof window !== 'undefined'
          ? (sessionStorage.getItem('authToken') || localStorage.getItem('authToken'))
          : null;
        const role = typeof window !== 'undefined'
          ? (sessionStorage.getItem('userRole') || localStorage.getItem('userRole'))
          : null;

        // If neither logged in nor guest, do nothing (ProtectedRoute will prompt)
        if (!token && role !== 'viewer') {
          setLoading(false);
          return;
        }

        // Silent backend health probe. If down, do nothing (no logs, no alerts).
        const healthy = await checkBackendHealth();
        if (!healthy) {
          setLoading(false);
          return;
        }

        // Fetch data in parallel; ignore individual failures
        const results = await Promise.allSettled([
          fetchEmployees(),
          fetchFundingAgencies(),
          fetchProjectSubmissions(),
          fetchProjectReceiveds(),
        ]);

        const [employeesResult, fundingAgenciesResult, submissionsResult, receivedResult] = results;

        if (employeesResult.status === 'fulfilled') {
          setEmployees(employeesResult.value);
        }
        if (fundingAgenciesResult.status === 'fulfilled') {
          setFundingAgencies(fundingAgenciesResult.value);
        }
        if (submissionsResult.status === 'fulfilled') {
          setProjectSubmissions(submissionsResult.value.submissions);
        }
        if (receivedResult.status === 'fulfilled') {
          setProjectReceiveds(receivedResult.value.projects);
        }
      } catch (_) {
        // Intentionally swallow to keep startup silent
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Periodic heartbeat with identity so Session Monitor can show who is online (top-level)
  useEffect(() => {
    let timer: any;
    let cancelled = false;
    const boot = async () => {
      try {
        const me = await fetchMe();
        if (cancelled) return;
        const isAdmin = Array.isArray(me.roles) && me.roles.some(r => String(r).toLowerCase().includes('admin'));
        const role: 'admin' | 'user' | 'viewer' = isAdmin ? 'admin' : 'user';
        const identity = me.username || '';
        const eid = !isAdmin ? identity : null;
        const username = identity; // send for both roles so admin can see staff identities too
        await sendHeartbeat({ role, eid, username });
        timer = setInterval(() => {
          sendHeartbeat({ role, eid, username }).catch(() => {});
        }, 20000);
      } catch (_) {
        // ignore if unauthenticated
      }
    };
    boot();
    return () => { cancelled = true; if (timer) clearInterval(timer); };
  }, []);

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted h5">Loading application...</p>
          </div>
        </div>
      </div>
    );
  }

  // Do not render a scary error screen on startup; let routes handle auth/backends calmly.

  return (
    <SecurityProvider>
      <DarkModeProvider>
        <Router>
          <div className="app min-vh-100">
            <Navigation />
            <main className="main-content">
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <MainNavigation 
                        employees={employees}
                        fundingAgencies={fundingAgencies}
                        projectSubmissions={projectSubmissions}
                        projectReceiveds={projectReceiveds}
                      />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/employee" 
                  element={
                    <ProtectedRoute>
                      <EmployeeComponent employees={employees} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/employee/eid/:employeeId" 
                  element={
                    <ProtectedRoute>
                      <EmployeeComponent employees={employees} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/employee/create" 
                  element={
                    <ProtectedRoute requiredPermission="write">
                      <StaffApprovalGate formKey="EMPLOYEE">
                        <EmployeeForm />
                      </StaffApprovalGate>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/funding-agencies" 
                  element={
                    <ProtectedRoute>
                      <FundingAgencyComponent fundingAgencies={fundingAgencies} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/funding-agencies/faid/:fundingAgencyId" 
                  element={
                    <ProtectedRoute>
                      <FundingAgencyComponent fundingAgencies={fundingAgencies} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/funding-agencies/create" 
                  element={
                    <ProtectedRoute requiredPermission="write">
                      <StaffApprovalGate formKey="FUNDING_AGENCY">
                        <FundingAgencyForm />
                      </StaffApprovalGate>
                    </ProtectedRoute>
                  } 
                />

                {/* New role-based login page */}
                <Route path="/login" element={<LoginRole />} />
                <Route 
                  path="/fund-receipt" 
                  element={
                    <ProtectedRoute>
                      <FundReceiptList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/fund-receipt/create" 
                  element={
                    <ProtectedRoute requiredPermission="write">
                      <StaffApprovalGate formKey="FUND_RECEIPT">
                        <FundReceiptForm />
                      </StaffApprovalGate>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/project-submission" 
                  element={
                    <ProtectedRoute>
                      <ProjectSubmission />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/project-submission/:id" 
                  element={
                    <ProtectedRoute>
                      <ProjectSubmission />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/project-submission/create" 
                  element={
                    <ProtectedRoute requiredPermission="write">
                      <StaffApprovalGate formKey="PROJECT_SUBMISSION">
                        <ProjectSubmissionForm />
                      </StaffApprovalGate>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/project-received" 
                  element={
                    <ProtectedRoute>
                      <ProjectReceivedComponent projectReceiveds={projectReceiveds} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/project-received/:id" 
                  element={
                    <ProtectedRoute>
                      <ProjectReceivedComponent projectReceiveds={projectReceiveds} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/project-received/create" 
                  element={
                    <ProtectedRoute requiredPermission="write">
                      <StaffApprovalGate formKey="PROJECT_RECEIVED">
                        <ProjectRecievedForm />
                      </StaffApprovalGate>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/bank-details" 
                  element={
                    <ProtectedRoute>
                      <BankDetailsListInline />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/bank-details/create" 
                  element={
                    <ProtectedRoute requiredPermission="write">
                      <BankDetailsForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/fund-expenditure" 
                  element={
                    <ProtectedRoute>
                      <FundExpenditureList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/fund-expenditure/create" 
                  element={
                    <ProtectedRoute requiredPermission="write">
                      <StaffApprovalGate formKey="FUND_EXPENDITURE">
                        <FundExpenditureForm />
                      </StaffApprovalGate>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/fund-expenditure-confirmation" 
                  element={
                    <ProtectedRoute>
                      <FundExpenditureConfirmation />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/equipment" 
                  element={
                    <ProtectedRoute>
                      <div className="container-fluid py-4">
                        <div className="row justify-content-center">
                          <div className="col-12 col-lg-10">
                            <div className="card shadow-sm">
                              <div className="card-header bg-dark text-white">
                                <h2 className="h4 mb-0">
                                  <i className="bi bi-tools me-2"></i>
                                  Equipment Management
                                </h2>
                              </div>
                              <div className="card-body">
                                <div className="alert alert-info">
                                  <i className="bi bi-info-circle me-2"></i>
                                  Equipment listing component will be implemented here.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/equipment/create" 
                  element={
                    <ProtectedRoute requiredPermission="write">
                      <StaffApprovalGate formKey="EQUIPMENT">
                        <EquipmentForm />
                      </StaffApprovalGate>
                    </ProtectedRoute>
                  } 
                />
                {/* Admin routes */}
                <Route 
                  path="/admin/approvals" 
                  element={
                    <ProtectedRoute requiredPermission="admin">
                      <ApprovalQueue />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/monitor" 
                  element={
                    <ProtectedRoute requiredPermission="admin">
                      <SessionMonitor />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="*" 
                  element={
                    <div className="container-fluid py-5 text-center">
                      <div className="row justify-content-center">
                        <div className="col-12 col-md-6">
                          <div className="card shadow-sm">
                            <div className="card-body">
                              <h2 className="h3 text-danger">404 - Page Not Found</h2>
                              <p className="text-muted mb-4">The page you're looking for doesn't exist.</p>
                              <a href="/" className="btn btn-primary">
                                <i className="bi bi-house me-2"></i>
                                Back to Home
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  } 
                />
              </Routes>
            </main>
          </div>
        </Router>
      </DarkModeProvider>
    </SecurityProvider>
  );
};

export default App;