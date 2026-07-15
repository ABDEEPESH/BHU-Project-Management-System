import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '../security/SecurityConfig';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, validateInput } = useSecurity();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    general?: string;
  }>({});
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific errors
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const success = await login(formData.username, formData.password);
      
      if (success) {
        // Force full reload so App's initial data fetch runs with the JWT
        window.location.href = '/';
      } else {
        setErrors({ general: 'Invalid username or password' });
      }
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center">
              <h3 className="mb-0">
                <i className="bi bi-shield-lock me-2"></i>
                Login
              </h3>
            </div>
            <div className="card-body p-4">
              {errors.general && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label fw-bold">
                    <i className="bi bi-person me-2"></i>
                    Username
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    required
                    disabled={loading}
                  />
                  {errors.username && (
                    <div className="invalid-feedback">
                      {errors.username}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label fw-bold">
                    <i className="bi bi-key me-2"></i>
                    Password
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password}
                    </div>
                  )}
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Login
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-4">
                <div className="text-center mb-3">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Quick Login Options:
                  </small>
                </div>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setFormData({ username: 'admin1', password: 'Admin1@123' })}
                    disabled={loading}
                  >
                    Admin1
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setFormData({ username: 'admin2', password: 'Admin2@123' })}
                    disabled={loading}
                  >
                    Admin2
                  </button>
                  <div className="dropdown">
                    <button
                      className="btn btn-outline-success btn-sm dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      disabled={loading}
                    >
                      Staff
                    </button>
                    <ul className="dropdown-menu" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {Array.from({ length: 100 }, (_, i) => i + 1).map(num => {
                        const staffNum = String(num).padStart(3, '0');
                        return (
                          <li key={num}>
                            <button
                              className="dropdown-item"
                              type="button"
                              onClick={() => setFormData({ 
                                username: `staff${staffNum}`, 
                                password: `Staff${staffNum}@123` 
                              })}
                              disabled={loading}
                            >
                              staff{staffNum}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <small className="text-muted">
                    Or enter your credentials manually above.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
