import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './AuthPage.css';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (mode === 'register') {
        res = await authAPI.register(form);
      } else {
        res = await authAPI.login({ email: form.email, password: form.password });
      }
      const data = res.data.data;
      login(data);
      toast.success(`Welcome, ${data.name}! 🎉`);
      navigate('/game');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => navigate('/game?guest=true');

  return (
    <div className="auth-page">
      <div className="bg-grid" />

      <div className="auth-card card animate-fadeInUp">
        {/* Logo */}
        <div className="auth-logo">
          <span>⚡</span>
          <span className="auth-logo-text">TechQuiz</span>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group animate-fadeInUp">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                name="name"
                placeholder="Ada Lovelace"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="you@techfest.dev"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder={mode === 'register' ? 'Min 6 characters' : '••••••••'}
              value={form.password}
              onChange={handleChange}
              required
              minLength={mode === 'register' ? 6 : undefined}
            />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? (
              <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            ) : mode === 'login' ? '🚀 Sign In & Play' : '✨ Create Account'}
          </button>
        </form>

        <div className="divider">or</div>

        <button className="btn btn-ghost btn-full guest-btn" onClick={handleGuest}>
          👤 Continue as Guest
        </button>

        <p className="auth-note">
          Guest scores are saved but not tied to an account.
        </p>
      </div>
    </div>
  );
}
