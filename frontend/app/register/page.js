'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState('woman');
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    educationLevel: 'Bachelor\'s Degree',
    address: '',
    providerName: '',
    companyName: '',
    industry: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const payload = {
      email: form.email.trim(),
      password: form.password,
      role,
    };

    if (role === 'woman') {
      payload.fullName = form.fullName.trim();
      payload.phone = form.phone.trim() || undefined;
      payload.educationLevel = form.educationLevel || undefined;
      payload.address = form.address.trim() || undefined;
    } else if (role === 'training_provider') {
      payload.providerName = form.providerName.trim();
      payload.phone = form.phone.trim() || undefined;
      payload.address = form.address.trim() || undefined;
    } else if (role === 'employer') {
      payload.companyName = form.companyName.trim();
      payload.industry = form.industry.trim() || 'Technology';
      payload.phone = form.phone.trim() || undefined;
      payload.address = form.address.trim() || undefined;
    }

    setSubmitting(true);
    try {
      const result = await register(payload);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 540 }}>
        <div className="auth-brand">
          <div className="auth-brand-logo">W</div>
          <h1>Create an Account</h1>
          <p>Join the Women Skill Development &amp; Employment Portal</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role selector */}
          <div className="form-group">
            <label className="form-label">I am registering as</label>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="woman">Candidate / Job Seeker (Woman)</option>
              <option value="employer">Employer / Company Representative</option>
              <option value="training_provider">Training Provider / Vocational Institute</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={set('email')}
                required
                placeholder="user@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                value={form.password}
                onChange={set('password')}
                required
                minLength={6}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                className="form-input"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                required
                placeholder="Repeat password"
              />
            </div>
          </div>

          {/* Role-specific fields */}
          {role === 'woman' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    className="form-input"
                    value={form.fullName}
                    onChange={set('fullName')}
                    required
                    placeholder="e.g. Maya Sharma"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Education Level</label>
                  <select className="form-select" value={form.educationLevel} onChange={set('educationLevel')}>
                    <option value="High School">High School</option>
                    <option value="Associate Degree">Associate Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Diploma / Vocational">Diploma / Vocational</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Residential Address / City</label>
                <input
                  className="form-input"
                  value={form.address}
                  onChange={set('address')}
                  placeholder="e.g. Bangalore, Karnataka"
                />
              </div>
            </>
          )}

          {role === 'training_provider' && (
            <>
              <div className="form-group">
                <label className="form-label">Institute / Provider Name *</label>
                <input
                  className="form-input"
                  value={form.providerName}
                  onChange={set('providerName')}
                  required
                  placeholder="e.g. Apex Tech Skills Institute"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Headquarters / Campus Address</label>
                <input
                  className="form-input"
                  value={form.address}
                  onChange={set('address')}
                  placeholder="e.g. 42 Innovation Way, Tech Park"
                />
              </div>
            </>
          )}

          {role === 'employer' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    className="form-input"
                    value={form.companyName}
                    onChange={set('companyName')}
                    required
                    placeholder="e.g. Global Tech Solutions"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <input
                    className="form-input"
                    value={form.industry}
                    onChange={set('industry')}
                    placeholder="e.g. Software, Finance, Healthcare"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Office Address</label>
                <input
                  className="form-input"
                  value={form.address}
                  onChange={set('address')}
                  placeholder="e.g. Downtown Metro Hub"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting}
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            {submitting ? (
              <>
                <span className="spinner"></span> Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already registered? <Link href="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}
