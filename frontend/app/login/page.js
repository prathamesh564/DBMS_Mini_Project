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
    // If user is already authenticated, allow them to view or redirect
    const user = getStoredUser();
    if (user && searchParams.get('redirect') !== 'false') {
      // already logged in, redirect to dashboard
      // router.push('/dashboard');
    }

    if (searchParams.get('tab') === 'signup') {
      setActiveTab('signup');
    }
  }, [searchParams]);

  // Demo Credentials Auto-Fill
  const loadDemoCredentials = (role) => {
    setActiveTab('signin');
    setErrorMsg(null);
    setSuccessMsg(null);

    const demoProfiles = {
      candidate: { email: 'priya.sharma@empowerher.org', pass: 'Candidate#2025' },
      trainer: { email: 'lead.faculty@skill.in', pass: 'FacultyMaster#99' },
      employer: { email: 'recruiter@techforce.co', pass: 'HireTalent#321' },
      admin: { email: 'superadmin@empowerher.gov.org', pass: 'RootAdminSecure#404' },
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

      setSuccessMsg('Authentication successful! Directing to workspace...');
      window.dispatchEvent(new Event('empowerher_auth_changed'));

      setTimeout(() => {
        const user = res.data?.user;
        if (user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }, 700);
    } catch (err) {
      console.error('Login error:', err);
      // If demo credentials or backend connection fails, provide clear feedback
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
      setErrorMsg('Please agree to the Candidate Code of Conduct & terms.');
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

      if (selectedRole === 'employer') {
        payload.companyName = fullName.trim() || 'New Employer Partner';
      } else if (selectedRole === 'training_provider') {
        payload.providerName = fullName.trim() || 'New Training Academy';
      }

      const res = await api.auth.register(payload);

      setSuccessMsg('Registration successful! Directing to your workspace...');
      window.dispatchEvent(new Event('empowerher_auth_changed'));

      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
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
        
        {/* LEFT COLUMN: Brand Showcase & Testimonial Stream (Stitch Design 4) */}
        <div className="lg:col-span-5 relative flex flex-col justify-between p-8 lg:p-12 bg-gradient-to-br from-primary via-primary-container to-[#3a0d9e] text-on-primary overflow-hidden min-h-[500px] lg:min-h-[720px]">
          {/* Subtle Decorative Atmospheric Glows */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary-fixed opacity-20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -right-20 w-96 h-96 rounded-full bg-tertiary-fixed opacity-25 blur-3xl pointer-events-none" />

          {/* Top Branding & Mission Pill */}
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
                    Vocational & Career Hub
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-on-primary font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-tertiary-fixed mr-2 animate-pulse" />
                Govt. & Tech Partnered
              </span>
            </div>

            <div className="pt-6 space-y-3">
              <h1 className="font-headline-lg text-headline-lg font-bold leading-tight tracking-tight text-on-primary">
                Dignity, Upward Mobility & Technical Mastery.
              </h1>
              <p className="font-body-md text-body-md text-primary-fixed-dim leading-relaxed">
                Connecting ambitious women to certified skill academies, vetted industry mentorship, and equal-opportunity employment pipelines.
              </p>
            </div>
          </div>

          {/* Center Testimonial Card */}
          <div className="relative z-10 my-8">
            <div className="p-6 rounded-xl bg-surface-container-lowest/10 backdrop-blur-md shadow-md text-on-primary space-y-4 border border-white/10">
              <div className="flex items-center space-x-1 text-tertiary-fixed">
                <span className="material-symbols-outlined text-label-md">star</span>
                <span className="material-symbols-outlined text-label-md">star</span>
                <span className="material-symbols-outlined text-label-md">star</span>
                <span className="material-symbols-outlined text-label-md">star</span>
                <span className="material-symbols-outlined text-label-md">star</span>
                <span className="ml-2 font-label-sm text-label-sm text-primary-fixed font-semibold">
                  100% Placement Verified
                </span>
              </div>
              <p className="font-body-md text-body-md italic text-on-primary leading-normal">
                “From rural data entry to junior full-stack developer in 6 months through the EmpowerHer cloud track. The stipend support kept my family secure while I upskilled.”
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-11 h-11 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center text-sm shadow-sm ring-2 ring-primary-fixed-dim/40">
                  PS
                </div>
                <div>
                  <p className="font-label-lg text-label-lg font-semibold text-on-primary">Priya Sharma</p>
                  <p className="font-label-sm text-label-sm text-primary-fixed-dim">Associate Cloud Engineer • FinTech Labs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Metrics & Privacy Pledge */}
          <div className="relative z-10 pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-surface-container-lowest/10 backdrop-blur-sm">
                <p className="font-metric-number text-metric-number font-bold text-tertiary-fixed leading-none">42K+</p>
                <p className="font-label-sm text-label-sm text-primary-fixed-dim mt-1">Graduates</p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-lowest/10 backdrop-blur-sm">
                <p className="font-metric-number text-metric-number font-bold text-tertiary-fixed leading-none">380+</p>
                <p className="font-label-sm text-label-sm text-primary-fixed-dim mt-1">Hiring Hubs</p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-lowest/10 backdrop-blur-sm">
                <p className="font-metric-number text-metric-number font-bold text-tertiary-fixed leading-none">94%</p>
                <p className="font-label-sm text-label-sm text-primary-fixed-dim mt-1">Retention</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-primary-fixed-dim text-body-sm font-body-sm pt-2">
              <span className="material-symbols-outlined text-headline-sm text-tertiary-fixed shrink-0">
                verified_user
              </span>
              <span>
                <strong>Safety & Privacy Pledge:</strong> End-to-end encrypted identity safeguards and verified safe-workplace partners.
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Tabbed Authentication Canvas (Stitch Design 4) */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-surface-container-lowest">
          <div>
            {/* Header & Tab Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 gap-4 border-b border-outline-variant/15">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Portal Access</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                  {activeTab === 'signin' ? 'Welcome back' : 'Begin Your Trajectory'}
                </h2>
                <p className="font-body-sm text-body-sm text-secondary">
                  {activeTab === 'signin'
                    ? 'Authenticate with your credentials to access your personalized workspace.'
                    : 'Join 42,000+ certified women learners, hiring partners, and academy instructors.'}
                </p>
              </div>

              {/* Tab Selector Segment */}
              <div className="inline-flex p-1 rounded-xl bg-surface-container-low self-start sm:self-center shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMsg(null);
                  }}
                  className={`px-5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all duration-200 ${
                    activeTab === 'signin'
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMsg(null);
                  }}
                  className={`px-5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all duration-200 ${
                    activeTab === 'signup'
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Error & Success Alerts */}
            {errorMsg && (
              <div className="mt-4 p-4 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mt-4 p-4 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed text-body-sm flex items-center gap-2 font-semibold">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN VIEW */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4 pt-6">
                <div>
                  <label className="block font-label-md text-label-md font-medium text-on-surface mb-1.5" htmlFor="signin-email">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-secondary text-[20px] pointer-events-none">
                      mail
                    </span>
                    <input
                      id="signin-email"
                      type="email"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="priya.sharma@example.org"
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-label-md text-label-md font-medium text-on-surface" htmlFor="signin-password">
                      Password
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Password reset link dispatched via registered email.');
                      }}
                      className="font-label-sm text-label-sm text-primary hover:text-primary-container font-semibold transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-secondary text-[20px] pointer-events-none">
                      lock
                    </span>
                    <input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-11 pr-11 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-secondary hover:text-on-surface focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary accent-primary cursor-pointer" />
                    <span className="font-body-sm text-body-sm text-secondary">Keep me signed in for 30 days</span>
                  </label>
                  <span className="font-label-sm text-label-sm text-tertiary flex items-center font-medium">
                    <span className="material-symbols-outlined text-body-sm mr-1">encrypted</span> SSL Encrypted
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 mt-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Portal</span>
                      <span className="material-symbols-outlined text-headline-sm">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: CREATE ACCOUNT VIEW */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4 pt-6">
                {/* Segmented Role Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-label-md text-label-md font-semibold text-on-surface">
                      Select User Account Type
                    </label>
                    <span className="font-label-sm text-label-sm text-secondary">Role-based schema permissions</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { role: 'woman', title: 'Candidate', sub: 'Learner / Seeker', icon: 'person_search' },
                      { role: 'training_provider', title: 'Trainer', sub: 'Vocational Center', icon: 'school' },
                      { role: 'employer', title: 'Employer', sub: 'Hiring Partner', icon: 'domain' },
                      { role: 'admin', title: 'Admin', sub: 'Govt / Overseer', icon: 'admin_panel_settings' },
                    ].map((item) => (
                      <label
                        key={item.role}
                        className={`relative flex flex-col items-center text-center p-3 rounded-xl cursor-pointer transition border ${
                          selectedRole === item.role
                            ? 'bg-primary-fixed border-primary text-primary font-semibold shadow-sm'
                            : 'bg-surface-container-low border-transparent hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <input
                          type="radio"
                          name="portal_role"
                          value={item.role}
                          checked={selectedRole === item.role}
                          onChange={() => setSelectedRole(item.role)}
                          className="sr-only"
                        />
                        <span className="material-symbols-outlined text-headline-sm mb-1">{item.icon}</span>
                        <span className="font-label-sm text-label-sm">{item.title}</span>
                        <span className="text-[10px] text-secondary">{item.sub}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Form Row: Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-label-md text-label-md font-medium text-on-surface mb-1" htmlFor="reg-fullname">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-[20px] pointer-events-none">
                        badge
                      </span>
                      <input
                        id="reg-fullname"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ananya Sen"
                        className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md font-medium text-on-surface mb-1" htmlFor="reg-phone">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-[20px] pointer-events-none">
                        call
                      </span>
                      <input
                        id="reg-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block font-label-md text-label-md font-medium text-on-surface mb-1" htmlFor="reg-email">
                    Official Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-[20px] pointer-events-none">
                      mail
                    </span>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="ananya.sen@career.org"
                      className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none"
                    />
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-label-md text-label-md font-medium text-on-surface mb-1" htmlFor="reg-pass">
                      Create Password
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-[20px] pointer-events-none">
                        lock
                      </span>
                      <input
                        id="reg-pass"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="Min. 6 chars"
                        className="w-full h-10 pl-10 pr-10 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-secondary hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md font-medium text-on-surface mb-1" htmlFor="reg-pass-confirm">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-[20px] pointer-events-none">
                        lock_reset
                      </span>
                      <input
                        id="reg-pass-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full h-10 pl-10 pr-10 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2.5 text-secondary hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showConfirmPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms and Safety Code */}
                <div className="flex items-start space-x-2.5 pt-1">
                  <input
                    id="agree-terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="w-4 h-4 mt-0.5 rounded text-primary accent-primary cursor-pointer"
                  />
                  <label htmlFor="agree-terms" className="font-body-sm text-body-sm text-secondary cursor-pointer leading-tight">
                    I agree to the <span className="text-primary underline">Candidate Code of Conduct</span>, affirmative privacy provisions, and authorized training verification.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 mt-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Registered Account</span>
                      <span className="material-symbols-outlined text-headline-sm">how_to_reg</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* BOTTOM SECTION: Academic / DBMS Evaluator Quick Switcher (Stitch Design 4) */}
          <div className="mt-8 pt-4 rounded-xl bg-surface-container-low p-4 shadow-xs border border-outline-variant/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">database</span>
                <span className="font-label-sm text-[11px] uppercase font-bold text-on-surface tracking-wider">
                  Evaluation Quick-Login (DBMS Roles)
                </span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-label-sm bg-primary-fixed text-primary font-semibold">
                One-Click Fill
              </span>
            </div>
            <p className="font-body-sm text-xs text-secondary mb-3">
              Simulate role-based security access profiles without retyping sample test fixtures.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => loadDemoCredentials('candidate')}
                className="p-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-left transition shadow-xs border border-outline-variant/15"
              >
                <div className="flex items-center space-x-1.5 text-primary">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  <span className="font-label-sm text-xs font-bold">Candidate</span>
                </div>
                <p className="font-body-sm text-[11px] text-secondary truncate mt-0.5">priya.sharma@</p>
              </button>

              <button
                type="button"
                onClick={() => loadDemoCredentials('trainer')}
                className="p-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-left transition shadow-xs border border-outline-variant/15"
              >
                <div className="flex items-center space-x-1.5 text-primary">
                  <span className="material-symbols-outlined text-[16px]">school</span>
                  <span className="font-label-sm text-xs font-bold">Trainer</span>
                </div>
                <p className="font-body-sm text-[11px] text-secondary truncate mt-0.5">lead.faculty@</p>
              </button>

              <button
                type="button"
                onClick={() => loadDemoCredentials('employer')}
                className="p-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-left transition shadow-xs border border-outline-variant/15"
              >
                <div className="flex items-center space-x-1.5 text-primary">
                  <span className="material-symbols-outlined text-[16px]">business_center</span>
                  <span className="font-label-sm text-xs font-bold">Employer</span>
                </div>
                <p className="font-body-sm text-[11px] text-secondary truncate mt-0.5">recruiter@</p>
              </button>

              <button
                type="button"
                onClick={() => loadDemoCredentials('admin')}
                className="p-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-left transition shadow-xs border border-outline-variant/15"
              >
                <div className="flex items-center space-x-1.5 text-primary">
                  <span className="material-symbols-outlined text-[16px]">shield_person</span>
                  <span className="font-label-sm text-xs font-bold">Admin</span>
                </div>
                <p className="font-body-sm text-[11px] text-secondary truncate mt-0.5">superadmin@</p>
              </button>
            </div>
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
