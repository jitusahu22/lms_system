import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { showSuccess } from '../utils/notify';
import { Lock, User, Mail, GraduationCap, ArrowRight, BookOpen } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(username, email, password, role);
            showSuccess('Account created successfully!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.username?.[0] || err.response?.data?.email?.[0] || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-form-wrapper">
                <div className="auth-form-header">
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Join thousands of learners and educators today</p>
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
                                placeholder="Choose a username"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                className="form-input"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
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
                                placeholder="Create a strong password"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">I am a...</label>
                        <div className="role-selector">
                            {[
                                { value: 'student', label: 'Student', icon: GraduationCap },
                                { value: 'instructor', label: 'Instructor', icon: BookOpen }
                            ].map(opt => {
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setRole(opt.value)}
                                        className={`role-option ${role === opt.value ? 'active' : ''}`}
                                    >
                                        <Icon size={18} className="role-icon" />
                                        <span>{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="btn-loading">Creating account...</span>
                        ) : (
                            <>
                                Sign Up
                                <ArrowRight size={18} className="btn-icon" />
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign in here</Link>
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

                .role-selector {
                    display: flex;
                    gap: 0.75rem;
                }

                .role-option {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    border: 1px solid #d1d5db;
                    background: #ffffff;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #374151;
                }

                .role-option:hover {
                    border-color: #9ca3af;
                }

                .role-option.active {
                    border-color: #6366f1;
                    background: rgba(99, 102, 241, 0.05);
                    color: #6366f1;
                }

                .role-icon {
                    color: currentColor;
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

                @media (max-width: 480px) {
                    .role-selector {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
};

export default Register;
