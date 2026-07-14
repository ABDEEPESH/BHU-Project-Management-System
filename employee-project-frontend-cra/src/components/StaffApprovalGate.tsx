import React from 'react';
import { requestFormApproval, getFormApprovalStatus } from '../services/api';
import { useSecurity } from '../security/SecurityConfig';

interface Props {
  formKey: 'EMPLOYEE' | 'PROJECT' | 'PROJECT_SUBMISSION' | 'PROJECT_RECEIVED' | 'EQUIPMENT' | 'FUND_RECEIPT' | 'FUND_EXPENDITURE' | 'FUNDING_AGENCY';
  children: React.ReactNode;
}

const StaffApprovalGate: React.FC<Props> = ({ formKey, children }) => {
  const { userRole } = useSecurity();
  const [approved, setApproved] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [requesting, setRequesting] = React.useState<boolean>(false);
  const [rejected, setRejected] = React.useState<boolean>(false);
  const [showApprovedToast, setShowApprovedToast] = React.useState<boolean>(false);
  const prevApprovedRef = React.useRef<boolean>(false);

  const poll = React.useCallback(async () => {
    try {
      const { approved, rejected } = await getFormApprovalStatus(formKey);
      setApproved(approved);
      setRejected(rejected);
      setLoading(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to check approval status');
      setLoading(false);
    }
  }, [formKey]);

  React.useEffect(() => {
    if (userRole !== 'staff') {
      setApproved(true);
      setLoading(false);
      return;
    }

    let stop = false;
    let es: EventSource | null = null as any;

    const startSSE = () => {
      try {
        const token = (typeof window !== 'undefined')
          ? (sessionStorage.getItem('authToken') || localStorage.getItem('authToken'))
          : null;

        // Prefer polyfill that supports headers if present
        const anyWin = window as any;
        if (anyWin && anyWin.EventSourcePolyfill && token) {
          es = new anyWin.EventSourcePolyfill(`/api/approvals/forms/stream?form=${encodeURIComponent(formKey)}`, {
            headers: { Authorization: `Bearer ${token}` },
            heartbeatTimeout: 60000,
            withCredentials: false,
          });
        } else {
          // Fallback to native EventSource with token in URL (backend accepts only on this endpoint)
          const url = `/api/approvals/forms/stream?form=${encodeURIComponent(formKey)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
          es = new EventSource(url);
        }

        if (!es) return false;

        es.addEventListener('approved', () => {
          setApproved(true);
          setRejected(false);
          setLoading(false);
        });
        es.addEventListener('rejected', () => {
          setRejected(true);
          setApproved(false);
          setLoading(false);
        });
        es.addEventListener('timeout', () => {
          // Will fallback to polling
          try { es && es.close(); } catch {}
          es = null;
        });
        es.addEventListener('ping', () => {
          // keep-alive
        });
        es.onerror = () => {
          // Fallback to polling if SSE errors
          try { es && es.close(); } catch {}
          es = null;
        };
        return true;
      } catch {
        return false;
      }
    };

    const started = startSSE();

    // Start polling in parallel as a safety net; it will stop once approved
    const tick = async () => {
      await poll();
      if (!stop && !approved && !rejected) setTimeout(tick, 3000);
    };
    tick();

    return () => {
      stop = true;
      try { es && es.close(); } catch {}
    };
  }, [userRole, poll, formKey, approved]);

  // Detect transition to approved to show a small toast
  React.useEffect(() => {
    if (userRole === 'staff' && approved && !prevApprovedRef.current) {
      setShowApprovedToast(true);
      const t = setTimeout(() => setShowApprovedToast(false), 3000);
      return () => clearTimeout(t);
    }
    prevApprovedRef.current = approved;
  }, [approved, userRole]);

  const ApprovedToast = (
    showApprovedToast && (
      <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1080, minWidth: 260 }}>
        <div className="alert alert-success shadow-sm py-2 px-3 mb-0">
          <i className="bi bi-check-circle me-2"></i>
          Approval granted. You can now use this form.
        </div>
      </div>
    )
  );

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  if (approved) return <>{children}{ApprovedToast}</>;

  return (
    <div className="container mt-5">
      {rejected && (
        <div className="alert alert-danger" role="alert">
          Admin rejected your access request for this form. You may contact admin or try again later.
        </div>
      )}
      <div className="card shadow-sm">
        <div className="card-header bg-danger text-white">
          <h4 className="mb-0">Admin approval required</h4>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <p className="mb-3">You are signed in as Staff. This form requires a one-time admin approval.</p>
          <button
            className="btn btn-primary"
            disabled={requesting}
            onClick={async () => {
              try {
                setRequesting(true);
                setError(null);
                await requestFormApproval(formKey);
              } catch (e: any) {
                setError(e?.message || 'Failed to request approval');
              } finally {
                setRequesting(false);
              }
            }}
          >
            {requesting ? 'Requesting...' : 'Request Approval'}
          </button>
          <div className="text-muted small mt-2">This page refreshes your status every 3 seconds automatically.</div>
        </div>
      </div>
      {ApprovedToast}
    </div>
  );
};

export default StaffApprovalGate;