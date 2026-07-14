import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, fetchEmployeeById, sendHeartbeat, createPermissionRequest, fetchMe } from '../services/api';
import type { EmployeeDTO } from '../types';
import { Link } from 'react-router-dom';

// Security Types
interface SecurityContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  validateInput: (input: string, type: 'email' | 'phone' | 'text' | 'number') => boolean;
  sanitizeInput: (input: string) => string;
  hasPermission: (permission: string) => boolean;
  getSecurityHeaders: () => Record<string, string>;
  continueAsGuest: () => void;
  loginAsEID: (eid: string) => Promise<boolean>;
  employeeInfo: EmployeeDTO | null;
}

// Security Context
const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

// Security Provider Component
interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeDTO | null>(null);

  // Initialize auth state from sessionStorage on mount
  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem('authToken');
      const storedRole = sessionStorage.getItem('userRole');
      const storedEmp = sessionStorage.getItem('employeeInfo');
      if (storedToken && storedRole) {
        setIsAuthenticated(true);
        setUserRole(storedRole);
        setEmployeeInfo(null);
      } else if (storedRole === 'user' && storedEmp) {
        setIsAuthenticated(true);
        setUserRole('user');
        setEmployeeInfo(JSON.parse(storedEmp));
      } else if (storedRole === 'viewer') {
        setIsAuthenticated(true);
        setUserRole('viewer');
        setEmployeeInfo(null);
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setEmployeeInfo(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUserRole(null);
      setEmployeeInfo(null);
    }
  }, []);

  // Heartbeat for monitoring (every 60s)
  useEffect(() => {
    let interval: number | undefined;
    const ping = async () => {
      try {
        await sendHeartbeat({ role: (userRole as any) || 'viewer', eid: employeeInfo?.idNo || null });
      } catch {}
    };
    if (isAuthenticated) {
      ping();
      interval = window.setInterval(ping, 60000);
    }
    return () => { if (interval) window.clearInterval(interval); };
  }, [isAuthenticated, userRole, employeeInfo]);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const token = await loginUser(username, password);
      const payload = parseJwt(token);
      if (!payload) return false;

      const role = deriveRoleFromPayload(payload);
      if (!role) return false;

      // Store only in sessionStorage so it won't auto-login next entry
      try {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('userRole', role);
      } catch {}
      setIsAuthenticated(true);
      setUserRole(role);
      setEmployeeInfo(null);
      // Heartbeat immediately
      try { await sendHeartbeat({ role: (role as any) || 'viewer', eid: null }); } catch {}
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    clearAuth();
    setIsAuthenticated(false);
    setUserRole(null);
    setEmployeeInfo(null);
  };

  // Guest mode (viewer): no token, limited permissions, no API calls
  const continueAsGuest = () => {
    try { sessionStorage.removeItem('authToken'); } catch {}
    sessionStorage.setItem('userRole', 'viewer');
    setUserRole('viewer');
    setIsAuthenticated(true);
    setEmployeeInfo(null);
  };

  // EID-based lightweight user login (no token)
  const loginAsEID = async (eid: string): Promise<boolean> => {
    try {
      const clean = sanitizeInput(String(eid || '').trim());
      if (!clean) return false;
      const emp = await fetchEmployeeById(clean);
      // Only session state + sessionStorage; no persistent auto-restore
      try {
        sessionStorage.removeItem('authToken');
        sessionStorage.setItem('userRole', 'user');
        sessionStorage.setItem('employeeInfo', JSON.stringify(emp));
      } catch {}
      setEmployeeInfo(emp);
      setUserRole('user');
      setIsAuthenticated(true);
      try { await sendHeartbeat({ role: 'user', eid: emp.idNo }); } catch {}
      return true;
    } catch (e) {
      console.error('[loginAsEID] Failed', e);
      return false;
    }
  };

  // Input validation
  const validateInput = (input: string, type: 'email' | 'phone' | 'text' | 'number'): boolean => {
    if (!input || typeof input !== 'string') return false;

    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input);
      
      case 'phone':
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(input);
      
      case 'number':
        return !isNaN(Number(input)) && Number(input) >= 0;
      
      case 'text':
        return input.length > 0 && input.length <= 1000;
      
      default:
        return false;
    }
  };

  // Input sanitization
  const sanitizeInput = (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  };

  // Permission checking
  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !userRole) return false;
    
    // Define role-based permissions
    const permissions: Record<string, string[]> = {
      'admin': ['read', 'write', 'delete', 'admin'],
      'staff': ['read', 'write', 'delete', 'admin'],
      'user': ['read'],
      'viewer': ['read']
    };
    
    return permissions[userRole]?.includes(permission) || false;
  };

  // Security headers
  const getSecurityHeaders = (): Record<string, string> => {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    };
  };

  const value: SecurityContextType = {
    isAuthenticated,
    userRole,
    login,
    logout,
    validateInput,
    sanitizeInput,
    hasPermission,
    getSecurityHeaders,
    continueAsGuest,
    loginAsEID,
    employeeInfo
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

// Security Hook
export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

// Security Decorator for Routes
export const ProtectedRoute: React.FC<{ children: ReactNode; requiredPermission?: string }> = ({ 
  children, 
  requiredPermission 
}) => {
  const { isAuthenticated, hasPermission, userRole, employeeInfo } = useSecurity();
  const [eid, setEid] = React.useState('');
  const [eidError, setEidError] = React.useState<string | null>(null);
  const [eidLoading, setEidLoading] = React.useState(false);
  const [reqLoading, setReqLoading] = React.useState(false);
  const [reqError, setReqError] = React.useState<string | null>(null);
  const [reqSuccess, setReqSuccess] = React.useState<string | null>(null);

  // Start polling /auth/me when user lacks required permission; stop once approved
  const [polling, setPolling] = React.useState(false);
  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (!requiredPermission) return;
    if (hasPermission(requiredPermission)) return;
    if (polling) return;
    setPolling(true);
    let stopped = false;
    const tick = async () => {
      try {
        const me = await fetchMe();
        if (Array.isArray(me.roles) && me.roles.includes('ROLE_FORM')) {
          try { sessionStorage.setItem('userRole', 'staff'); } catch {}
          window.location.reload();
          return;
        }
      } catch {}
      if (!stopped) setTimeout(tick, 3000);
    };
    tick();
    return () => { stopped = true; };
  }, [isAuthenticated, requiredPermission, hasPermission, polling]);

  // No auto-guest. Users must explicitly authenticate as Admin or via EID.

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="card shadow-sm">
          <div className="card-header bg-warning-subtle">
            <h4 className="mb-0">Authentication Required</h4>
          </div>
          <div className="card-body">
            <p className="mb-3">Please sign in as Admin or Staff.</p>
            <div className="d-flex flex-wrap gap-2 align-items-center mb-1">
              <Link to="/login" className="btn btn-primary">
                <i className="bi bi-person-lock me-2"></i>
                I am Admin (Login)
              </Link>
              <Link to="/login" className="btn btn-success">
                <i className="bi bi-person-badge me-2"></i>
                I am Staff (Login)
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    const action = requiredPermission === 'write' ? 'create' : requiredPermission === 'delete' ? 'delete' : requiredPermission;

    {/* Status will auto-refresh every 3s via top-level poll; once approved, page reloads to allow access */}

    return (
      <div className="container mt-5">
        <div className="card shadow-sm">
          <div className="card-header bg-danger text-white">
            <h4 className="mb-0">Access requires admin approval</h4>
          </div>
          <div className="card-body">
            <p className="mb-3">You currently have view-only access. Request approval, then this page will auto-enable once approved.</p>
            {reqError && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>{reqError}
              </div>
            )}
            {reqSuccess && (
              <div className="alert alert-success">
                <i className="bi bi-check-circle me-2"></i>{reqSuccess}
              </div>
            )}
            <button
              className="btn btn-primary"
              disabled={reqLoading}
              onClick={async () => {
                try {
                  setReqLoading(true);
                  setReqError(null);
                  setReqSuccess(null);
                  const target = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
                  await createPermissionRequest({
                    requesterRole: (userRole as any) || 'user',
                    requesterId: employeeInfo?.idNo || undefined,
                    target,
                    action: action as any,
                  });
                  setReqSuccess('Request submitted. Waiting for admin approval...');
                } catch (e: any) {
                  setReqError(e?.message || 'Failed to submit request');
                } finally {
                  setReqLoading(false);
                }
              }}
            >
              {reqLoading ? 'Submitting...' : 'Request Permission'}
            </button>
            <div className="mt-3 text-muted small">This page checks your status every 3s. Once approved, it will reload and allow access.</div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Security Utilities
export class SecurityUtils {
  // Rate limiting
  private static requestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  
  static checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.requestCounts.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }

  // CSRF Protection
  static generateCSRFToken(): string {
    return 'csrf-' + Math.random().toString(36).substr(2, 9);
  }

  static validateCSRFToken(token: string): boolean {
    return Boolean(token && token.startsWith('csrf-') && token.length === 13);
  }

  // Password strength validation
  static validatePasswordStrength(password: string): { isValid: boolean; score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include at least one lowercase letter');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include at least one uppercase letter');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Include at least one number');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Include at least one special character');

    return {
      isValid: score >= 4,
      score,
      feedback
    };
  }

  // Session management
  static startSession(userId: string): string {
    const sessionId = 'session-' + Math.random().toString(36).substr(2, 9);
    const sessionData = {
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    
    sessionStorage.setItem(sessionId, JSON.stringify(sessionData));
    return sessionId;
  }

  static validateSession(sessionId: string): boolean {
    const sessionData = sessionStorage.getItem(sessionId);
    if (!sessionData) return false;

    try {
      const session = JSON.parse(sessionData);
      const now = Date.now();
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes

      if (now - session.lastActivity > sessionTimeout) {
        sessionStorage.removeItem(sessionId);
        return false;
      }

      // Update last activity
      session.lastActivity = now;
      sessionStorage.setItem(sessionId, JSON.stringify(session));
      return true;
    } catch {
      return false;
    }
  }

  // Data encryption (basic implementation)
  static encryptData(data: string): string {
    // In a real application, use proper encryption libraries
    return btoa(encodeURIComponent(data));
  }

  static decryptData(encryptedData: string): string {
    try {
      return decodeURIComponent(atob(encryptedData));
    } catch {
      return '';
    }
  }

  // Security headers
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    };
  }
}

// Security Middleware for API calls
export const withSecurity = (apiCall: Function) => {
  return async (...args: any[]) => {
    // Check rate limiting
    const clientId = 'api-client'; // In real app, get from user session
    if (!SecurityUtils.checkRateLimit(clientId)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Add security headers
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...SecurityUtils.getSecurityHeaders()
    };

    // Validate session if needed
    const sessionId = sessionStorage.getItem('sessionId');
    if (sessionId && !SecurityUtils.validateSession(sessionId)) {
      throw new Error('Session expired. Please login again.');
    }

    try {
      return await apiCall(...args);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };
};

// Security Decorator for Components
export const withAuthentication = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const { isAuthenticated } = useSecurity();
    
    if (!isAuthenticated) {
      return (
        <div className="container mt-5">
          <div className="alert alert-warning">
            <h4>Authentication Required</h4>
            <p>Please login to access this page.</p>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};

// Helpers
function parseJwt(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch {
    return null;
  }
}

function deriveRoleFromPayload(payload: any): string | null {
  const raw: unknown = payload?.roles ?? payload?.authorities ?? payload?.scope ?? payload?.role ?? null;
  let arr: string[] = [];
  if (Array.isArray(raw)) {
    arr = (raw as any[]).map((r: any) => {
      if (typeof r === 'string') return r;
      if (r && typeof r === 'object' && 'authority' in r) return String((r as any).authority);
      return String(r);
    });
  } else if (typeof raw === 'string') {
    arr = raw.split(/[ ,]/).map((r) => r.trim()).filter(Boolean);
  } else if (raw && typeof raw === 'object') {
    // some JWTs encode as map-like objects
    try {
      const values = Object.values(raw as Record<string, unknown>);
      arr = values.map((v: any) => (typeof v === 'string' ? v : (v && v.authority ? String(v.authority) : String(v))));
    } catch {
      arr = [];
    }
  }

  try { console.debug('[JWT roles parsed]', { raw, arr }); } catch {}

  if (arr.includes('ROLE_ADMIN')) return 'admin';
  if (arr.includes('ROLE_STAFF')) return 'staff';
  if (arr.includes('ROLE_FORM')) return 'staff';
  if (arr.includes('ROLE_USER')) return 'user';
  return null;
}

function clearAuth() {
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('employeeInfo');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('sessionId');
    sessionStorage.removeItem('employeeInfo');
  } catch {}
}
