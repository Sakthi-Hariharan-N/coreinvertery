import React, { useState } from 'react';
import { api } from './api';

export default function Auth({ onLogin }) {
  const [view, setView] = useState('login'); // login | signup | reset | reset_verify
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (view === 'login') {
        const res = await api.auth.login(email, password);
        localStorage.setItem('token', res.access_token);
        onLogin(res.access_token);
      } else if (view === 'signup') {
        await api.auth.signup(name, email, password);
        setMessage("Signup successful! Please login.");
        setView('login');
      } else if (view === 'reset') {
        const res = await api.auth.resetPasswordRequest(email);
        setMessage(res.message);
        setView('reset_verify');
      } else if (view === 'reset_verify') {
        const res = await api.auth.resetPasswordVerify(email, otp, password);
        setMessage(res.message);
        setView('login');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-form animate-fade-in">
        <h2>{view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : view === 'reset_verify' ? 'Verify OTP' : 'Reset Password'}</h2>
        
        {error && <div style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        {message && <div style={{ color: 'var(--accent)', fontSize: '0.9rem', textAlign: 'center' }}>{message}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {view === 'signup' && (
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={view === 'reset_verify'} required />
          </div>

          {view === 'reset_verify' && (
            <div className="input-group">
              <label>OTP Code</label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required />
            </div>
          )}

          {view !== 'reset' && (
            <div className="input-group">
              <label>{view === 'reset_verify' ? 'New Password' : 'Password'}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : view === 'login' ? 'Sign In' : view === 'signup' ? 'Sign Up' : view === 'reset_verify' ? 'Verify & Reset' : 'Send OTP'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
          {view !== 'login' && (
            <button className="secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => { setView('login'); setError(null); setMessage(null); }}>Back to Login</button>
          )}
          {view === 'login' && (
            <>
              <button className="secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setView('signup')}>Create Account</button>
              <button className="secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setView('reset')}>Forgot Password?</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
