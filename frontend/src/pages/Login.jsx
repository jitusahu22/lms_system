import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { showSuccess } from '../utils/notify';
import { Lock, User, ArrowRight } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(username, password);
            showSuccess('Logged in successfully!');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Invalid username or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-form-wrapper">
                <div className="auth-form-header">
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to continue your learning journey</p>
                </div>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input
                                className="form-input"
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                placeholder="Enter your username"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                className="form-input"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="btn-loading">Signing in...</span>
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={18} className="btn-icon" />
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-link">Create one here</Link>
                </p>
            </div>

            <style>{`
                .auth-page {
                    width: 100%;
                    height: calc(100vh - 64px);
                    overflow: hidden;
                    background: #f8fafc;
                    padding: 2rem;
                }

                .auth-form-wrapper {
                    width: 100%;
                    max-width: 420px;
                    margin: 0 auto;
                    padding: 2.5rem;
                    background: #ffffff;
                    border-radius: 1rem;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
                }

                .auth-form-header {
                    text-align: center;
                    margin-bottom: 1.5rem;
                }

                .auth-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 0.25rem 0;
                }

                .auth-subtitle {
                    color: #64748b;
                    font-size: 0.9rem;
                    margin: 0;
                }

                .auth-error {
                    background: #fef2f2;
                    color: #dc2626;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    margin-bottom: 1rem;
                    text-align: center;
                    border: 1px solid #fecaca;
                    font-size: 0.875rem;
                }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-label {
                    display: block;
                    margin-bottom: 0.375rem;
                    font-weight: 500;
                    color: #374151;
                    font-size: 0.875rem;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 0.875rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                    pointer-events: none;
                }

                .form-input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 2.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.5rem;
                    font-family: inherit;
                    font-size: 0.9rem;
                    background: #ffffff;
                    outline: none;
                }

                .form-input:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .auth-submit-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    background: #6366f1;
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 0.5rem;
                }

                .auth-submit-btn:hover:not(:disabled) {
                    background: #4f46e5;
                }

                .auth-submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .btn-loading::after {
                    content: '';
                    display: inline-block;
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    margin-left: 0.5rem;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .auth-footer {
                    text-align: center;
                    margin-top: 1.25rem;
                    color: #6b7280;
                    font-size: 0.875rem;
                }

                .auth-link {
                    color: #6366f1;
                    font-weight: 600;
                    text-decoration: none;
                }

                .auth-link:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
};

export default Login;
