'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, getStoredUser } from '../../services/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState('signin');
  const [selectedRole, setSelectedRole] = useState('woman');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('priya.sharma@empowerher.org');
  const [signInPassword, setSignInPassword] = useState('SecurePass@2025');

  // Sign Up Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Submission State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (searchParams.get('tab') === 'signup') {
      setActiveTab('signup');
    }
  }, [searchParams]);

  // Demo Credentials Auto-Fill (Strictly 3 roles)
  const loadDemoCredentials = (role) => {
    setActiveTab('signin');
    setErrorMsg(null);
    setSuccessMsg(null);

    const demoProfiles = {
      candidate: { email: 'priya.sharma@empowerher.org', pass: 'SecurePass@2025' },
      provider: { email: 'director@techbridge.edu', pass: 'SecurePass@2025' },
      admin: { email: 'admin@empowerher.org', pass: 'SecurePass@2025' },
    };

    if (demoProfiles[role]) {
      setSignInEmail(demoProfiles[role].email);
      setSignInPassword(demoProfiles[role].pass);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.auth.login({
        email: signInEmail.trim(),
        password: signInPassword,
      });

      setSuccessMsg('Authentication successful! Redirecting to workspace...');
      window.dispatchEvent(new Event('empowerher_auth_changed'));

      setTimeout(() => {
        const user = res.data?.user;
        if (user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (signUpPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Please agree to the Code of Conduct & terms of service.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: signUpEmail.trim(),
        password: signUpPassword,
        role: selectedRole,
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
      };

      if (selectedRole === 'training_provider') {
        payload.providerName = fullName.trim() || 'New Training Academy';
      }

      const res = await api.auth.register(payload);

      setSuccessMsg('Registration successful! Redirecting to your workspace...');
      window.dispatchEvent(new Event('empowerher_auth_changed'));

      setTimeout(() => {
        router.push('/dashboard');
      }, 600);
    } catch (err) {
      console.error('Register error:', err);
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-surface">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden shadow-2xl bg-surface-container-lowest border border-outline-variant/20">
        
        {/* LEFT COLUMN: Brand Showcase & Highlights */}
        <div className="lg:col-span-5 relative flex flex-col justify-between p-8 lg:p-12 bg-gradient-to-br from-primary via-primary-container to-[#3a0d9e] text-on-primary overflow-hidden min-h-[460px] lg:min-h-[700px]">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary-fixed opacity-20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -right-20 w-96 h-96 rounded-full bg-tertiary-fixed opacity-25 blur-3xl pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm font-bold">
                  <span className="material-symbols-outlined text-headline-sm">spa</span>
                </div>
                <div>
                  <span className="font-headline-sm text-headline-sm tracking-tight text-on-primary font-bold block">
                    EmpowerHer
                  </span>
                  <span className="font-label-sm text-[11px] tracking-widest uppercase text-primary-fixed-dim">
                    Women Skill & Employment
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-on-primary font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-tertiary-fixed mr-2 animate-pulse" />
                Verified Portal
              </span>
            </div>

            <div className="pt-6 space-y-3">
              <h1 className="font-headline-lg text-headline-lg font-bold leading-tight tracking-tight text-on-primary">
                Skill Development, Upward Mobility & Employment.
              </h1>
              <p className="font-body-md text-body-md text-primary-fixed-dim leading-relaxed">
                Empowering women through certified vocational training, direct course enrollments, and verified job openings.
              </p>
            </div>
          </div>

          {/* Highlights Card */}
          <div className="relative z-10 my-8">
            <div className="p-6 rounded-xl bg-surface-container-lowest/10 backdrop-blur-md shadow-md text-on-primary space-y-3 border border-white/10">
              <div className="flex items-center gap-2 text-tertiary-fixed font-bold text-sm">
                <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                <span>Simplified 3-Role Architecture</span>
              </div>
              <ul className="text-body-sm text-primary-fixed-dim space-y-2">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">check_circle</span>
                  <span>Candidate: Skill profiles, training enrollments, job applications</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">check_circle</span>
                  <span>Training Provider: Program authoring & candidate progress</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">check_circle</span>
                  <span>Admin: Governance, skills taxonomy, job postings & analytics</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Trust Metrics */}
          <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-on-primary">
            <div>
              <span className="text-headline-sm font-bold block">100%</span>
              <span className="text-label-sm text-primary-fixed-dim">Scholarship Options</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <span className="text-headline-sm font-bold block">8 Core</span>
              <span className="text-label-sm text-primary-fixed-dim">Relational Tables</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <span className="text-headline-sm font-bold block">3 Roles</span>
              <span className="text-label-sm text-primary-fixed-dim">RBAC Protected</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Auth Tabs */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-center bg-surface">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Tab Switcher */}
            <div className="flex p-1 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-label-lg font-label-lg font-semibold transition-all ${
                  activeTab === 'signin'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-label-lg font-label-lg font-semibold transition-all ${
                  activeTab === 'signup'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Notifications */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2 border border-error/20">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed text-body-sm flex items-center gap-2 border border-tertiary/20 font-semibold">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN */}
            {activeTab === 'signin' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-headline-md font-bold text-on-surface">Welcome Back</h2>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    Sign in to your candidate, provider, or administrator account.
                  </p>
                </div>

                {/* Quick Auto-Fill Demo Badges (3 Roles) */}
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/15 space-y-2">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Quick Demo Credentials:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => loadDemoCredentials('candidate')}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-[12px] font-semibold text-primary hover:bg-primary-container hover:text-on-primary transition border border-outline-variant/20"
                    >
                      Woman Candidate
                    </button>
                    <button
                      type="button"
                      onClick={() => loadDemoCredentials('provider')}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-[12px] font-semibold text-amber-700 hover:bg-amber-100 transition border border-outline-variant/20"
                    >
                      Training Provider
                    </button>
                    <button
                      type="button"
                      onClick={() => loadDemoCredentials('admin')}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-[12px] font-semibold text-purple-700 hover:bg-purple-100 transition border border-outline-variant/20"
                    >
                      Admin
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-label-md font-medium text-on-surface mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-3 text-secondary text-[20px] pointer-events-none">
                        mail
                      </span>
                      <input
                        type="email"
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="you@empowerher.org"
                        className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-label-md font-medium text-on-surface">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-3 text-secondary text-[20px] pointer-events-none">
                        lock
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 pl-11 pr-11 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-on-surface-variant hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-lg font-bold shadow-md hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: CREATE ACCOUNT (Strictly Woman or Training Provider) */}
            {activeTab === 'signup' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-headline-md font-bold text-on-surface">Create an Account</h2>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    Register as a candidate woman or accredited training provider.
                  </p>
                </div>

                {/* Role Selector (Strictly 2 Public Roles) */}
                <div>
                  <label className="block text-label-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                    Select Your Role:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('woman')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition ${
                        selectedRole === 'woman'
                          ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                          : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">person</span>
                      <span className="text-xs font-semibold">Candidate (Woman)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('training_provider')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition ${
                        selectedRole === 'training_provider'
                          ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                          : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
 
 
 >
                      <span className="material-symbols-outlined text-[24px]">school</span>
                      <span className="text-xs font-semibold">Training Provider</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-label-md font-medium text-on-surface mb-1">
                      {selectedRole === 'training_provider' ? 'Academy / Institution Name' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={selectedRole === 'training_provider' ? 'e.g. Apex Skill Academy' : 'e.g. Priya Sharma'}
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-label-md font-medium text-on-surface mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-label-md font-medium text-on-surface mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-label-md font-medium text-on-surface mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full h-11 pl-4 pr-10 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-on-surface-variant hover:text-on-surface"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-label-md font-medium text-on-surface mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full h-11 pl-4 pr-10 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-on-surface-variant hover:text-on-surface"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <label htmlFor="terms" className="text-body-sm text-on-surface-variant">
                      I agree to the EmpowerHer Terms of Service and Code of Conduct.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-lg font-bold shadow-md hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Account</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

