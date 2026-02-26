import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { showSuccess } from '../utils/notify';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password, role);
            showSuccess('Account created successfully!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.username?.[0] || 'Registration failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', animation: 'fadeIn 0.5s ease-out' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary)', fontSize: '2rem' }}>Create Account</h2>
                {error && <div style={{ background: 'var(--error)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Username</label>
                        <input className="input" type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Choose a username" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                        <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
                        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Create a password" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>I am a...</label>
                        <select className="input" value={role} onChange={e => setRole(e.target.value)} style={{ cursor: 'pointer' }}>
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '1.1rem' }}>Sign Up</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
