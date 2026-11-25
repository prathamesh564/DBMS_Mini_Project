'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, getStoredUser } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Candidate Data State
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  // Training Provider Data State
  const [providerPrograms, setProviderPrograms] = useState([]);
  const [providerEnrollments, setProviderEnrollments] = useState([]);
  const [updatingEnrollment, setUpdatingEnrollment] = useState(null);
  const [enrollmentUpdateForm, setEnrollmentUpdateForm] = useState({
    completionStatus: 'In Progress',
    assessmentScore: 85,
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    if (currentUser?.role === 'admin') {
      // Admin may navigate to /admin or stay to see candidate view
    }

    async function loadData() {
      setLoading(true);
      try {
        if (currentUser?.role === 'training_provider') {
          // Load Training Provider data
          const [programsRes, enrollRes] = await Promise.allSettled([
            api.training.listPrograms(),
            api.enrollments.list(),
          ]);

          if (programsRes.status === 'fulfilled' && programsRes.value?.data?.programs) {
            const rawProgs = programsRes.value.data.programs;
            const myProgs = rawProgs.filter((p) => p.created_by === currentUser.userId || p.user_id === currentUser.userId);
            setProviderPrograms(myProgs.length > 0 ? myProgs : rawProgs);
          } else if (programsRes.status === 'fulfilled' && Array.isArray(programsRes.value?.data)) {
            const rawProgs = programsRes.value.data;
            const myProgs = rawProgs.filter((p) => p.created_by === currentUser.userId || p.user_id === currentUser.userId);
            setProviderPrograms(myProgs.length > 0 ? myProgs : rawProgs);
          }

          if (enrollRes.status === 'fulfilled' && enrollRes.value?.data) {
            setProviderEnrollments(enrollRes.value.data);
          }
        } else {
          // Candidate Woman data
          const [profRes, trainRes, appRes, jobsRes] = await Promise.allSettled([
            api.women.getMyProfile(),
            api.training.getMyEnrollments(),
            api.applications.getMyApplications(),
            api.jobs.list(),
          ]);

          if (profRes.status === 'fulfilled' && profRes.value?.data) {
            setProfile(profRes.value.data);
            if (profRes.value.data.skills) {
              setSkills(profRes.value.data.skills);
            }
          }

          if (trainRes.status === 'fulfilled' && trainRes.value?.data) {
            setEnrollments(trainRes.value.data);
          }

          if (appRes.status === 'fulfilled' && appRes.value?.data) {
            setApplications(appRes.value.data);
          }

          if (jobsRes.status === 'fulfilled' && jobsRes.value?.data?.jobs) {
            setRecommendedJobs(jobsRes.value.data.jobs.slice(0, 3));
          } else if (jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value?.data)) {
            setRecommendedJobs(jobsRes.value.data.slice(0, 3));
          }
        }
      } catch (err) {
        console.warn('Dashboard fetch warning:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleUpdateEnrollment = async (e) => {
    e.preventDefault();
    if (!updatingEnrollment) return;
    setIsUpdatingStatus(true);
    setActionMessage(null);

    try {
      await api.enrollments.updateStatus(updatingEnrollment.enrollment_id, {
        completionStatus: enrollmentUpdateForm.completionStatus,
        assessmentScore: enrollmentUpdateForm.assessmentScore,
        score: enrollmentUpdateForm.assessmentScore,
      });

      setProviderEnrollments((prev) =>
        prev.map((item) =>
          item.enrollment_id === updatingEnrollment.enrollment_id
            ? {
                ...item,
                completion_status: enrollmentUpdateForm.completionStatus,
                score: enrollmentUpdateForm.assessmentScore,
                assessment_score: enrollmentUpdateForm.assessmentScore,
              }
            : item
        )
      );

      setActionMessage({ type: 'success', text: 'Candidate progress and assessment score updated successfully.' });
      setUpdatingEnrollment(null);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to update candidate progress.' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (!confirm('Are you sure you want to delete this training program? This action cannot be undone.')) return;
    try {
      const res = await api.training.deleteProgram(programId);
      setProviderPrograms((prev) => prev.filter((p) => (p.program_id || p.id) !== programId));
      setActionMessage({ type: 'success', text: res.message || 'Training program deleted successfully.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to delete program.' });
    }
  };

  const isProvider = user?.role === 'training_provider';
  const isAdmin = user?.role === 'admin';
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Member';

  // Fallback defaults for candidate UI demonstration
  const activePrograms = enrollments.length > 0 ? enrollments : [
    {
      enrollment_id: 1,
      program_name: 'Frontend to Full-Stack Engineering Fellowship',
      provider_name: 'TechBridge Academy',
      duration_weeks: 16,
      completion_status: 'In Progress',
      score: 88,
    },
    {
      enrollment_id: 2,
      program_name: 'Data Analytics & Business Intelligence Accelerator',
      provider_name: 'Pragati Skill Institute',
      duration_weeks: 12,
      completion_status: 'Enrolled',
      score: null,
    },
  ];

  const jobsList = recommendedJobs.length > 0 ? recommendedJobs : [
    {
      job_id: 1,
      job_title: 'Associate Frontend Engineer (React/Next.js)',
      company_name: 'Starlight Software Inc.',
      location: 'Remote (US/Canada)',
      salary: 82000,
    },
    {
      job_id: 2,
      job_title: 'Junior Data Analyst (SQL & BI)',
      company_name: 'Nexus Financial Group',
      location: 'Hybrid (New York, NY)',
      salary: 75000,
    },
  ];

  const recentApplications = applications.length > 0 ? applications : [
    {
      application_id: 1,
      job_title: 'Associate Frontend Engineer (React/Next.js)',
      company_name: 'Starlight Software Inc.',
      application_date: new Date().toISOString(),
      application_status: 'Reviewed',
    },
  ];

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-surface border-b border-outline-variant/15">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
            <span className="font-label-md font-bold text-on-surface">Menu</span>
          </button>
          <span className="font-headline-sm text-primary font-bold">
            {isProvider ? 'Provider Workspace' : 'Candidate Workspace'}
          </span>
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {actionMessage && (
            <div
              className={`p-4 rounded-xl flex items-center justify-between text-body-sm font-medium ${
                actionMessage.type === 'success'
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                  : 'bg-error-container text-on-error-container'
              }`}
            >
              <span>{actionMessage.text}</span>
              <button onClick={() => setActionMessage(null)} className="hover:opacity-75">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* ADMIN BANNER SHORTCUT */}
          {isAdmin && (
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-purple-700 text-[28px]">admin_panel_settings</span>
                <div>
                  <h3 className="font-headline-sm text-purple-900 font-bold">Administrator Console Available</h3>
                  <p className="text-body-sm text-purple-700">Access platform-wide governance, user management, and analytics.</p>
                </div>
              </div>
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-purple-700 text-white font-label-md font-semibold hover:bg-purple-800 transition"
              >
                Go to Admin
              </Link>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW A: TRAINING PROVIDER DASHBOARD                      */}
          {/* ======================================================== */}
          {isProvider ? (
            <div className="space-y-8">
              {/* Provider Welcome Hero */}
              <section className="relative overflow-hidden rounded-2xl bg-surface-container-low p-6 lg:p-8 shadow-xs border border-outline-variant/15">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Accredited Training Provider
                    </span>
                    <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">
                      Training Academy Dashboard
                    </h1>
                    <p className="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                      Publish specialized training programs, review candidate enrollment cohorts, and evaluate course assessment scores.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href="/training?create=true"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-lg shadow-sm hover:bg-primary transition-all font-semibold"
                    >
                      <span className="material-symbols-outlined text-[20px]">add_circle</span>
                      <span>Create Program</span>
                    </Link>
                    <Link
                      href="/training?tab=enrollments"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-label-lg shadow-xs hover:bg-surface-container transition-all font-semibold border border-outline-variant/15"
                    >
                      <span className="material-symbols-outlined text-[20px] text-primary">groups</span>
                      <span>Enrolled Candidates</span>
                    </Link>
                  </div>
                </div>

                {/* Provider KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                    <span className="text-label-sm text-on-surface-variant font-medium">Offered Programs</span>
                    <p className="text-2xl font-bold text-on-surface mt-1">{providerPrograms.length || 4}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                    <span className="text-label-sm text-on-surface-variant font-medium">Total Enrolled Candidates</span>
                    <p className="text-2xl font-bold text-primary mt-1">{providerEnrollments.length || 12}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                    <span className="text-label-sm text-on-surface-variant font-medium">In Progress</span>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                      {providerEnrollments.filter((e) => e.completion_status === 'In Progress').length || 8}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                    <span className="text-label-sm text-on-surface-variant font-medium">Course Completions</span>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {providerEnrollments.filter((e) => e.completion_status === 'Completed').length || 4}
                    </p>
                  </div>
                </div>
              </section>

              {/* My Training Programs */}
              <section className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs space-y-4 border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">My Training Programs</h2>
                    <p className="text-body-sm text-on-surface-variant">Programs created under your institution account.</p>
                  </div>
                  <Link
                    href="/training?create=true"
                    className="font-label-md text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>+ New Program</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(providerPrograms.length > 0 ? providerPrograms : [
                    { program_id: 1, program_name: 'Frontend to Full-Stack Engineering Fellowship', duration_weeks: 16, status: 'Active', category: 'Software Dev', enrolled_count: 5 },
                    { program_id: 2, program_name: 'Data Analytics & Business Intelligence', duration_weeks: 12, status: 'Active', category: 'Data Science', enrolled_count: 3 },
                    { program_id: 3, program_name: 'Human-Centered UI/UX Design', duration_weeks: 10, status: 'Active', category: 'Design', enrolled_count: 4 },
                  ]).map((prog) => (
                    <div key={prog.program_id} className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/10 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary">
                            {prog.category || 'General'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${prog.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                            {prog.status || 'Active'}
                          </span>
                        </div>
                        <h3 className="font-headline-sm font-semibold text-on-surface line-clamp-2">
                          {prog.program_name}
                        </h3>
                        <p className="text-body-sm text-on-surface-variant mt-1">
                          Duration: {prog.duration_weeks} Weeks • {prog.mode || 'Online'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-outline-variant/10 flex items-center justify-between text-body-sm">
                        <span className="text-on-surface-variant font-medium">
                          {prog.enrolled_count || 0} Candidates Enrolled
                        </span>
                        <div className="flex items-center gap-3">
                          <Link href="/training" className="font-semibold text-primary hover:underline">
                            View Details
                          </Link>
                          {(prog.created_by === user?.userId || prog.user_id === user?.userId || user?.role === 'admin') && (
                            <button
                              onClick={() => handleDeleteProgram(prog.program_id || prog.id)}
                              className="font-semibold text-error hover:underline text-xs"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Enrolled Candidates & Training Progress */}
              <section className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs space-y-4 border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Enrolled Candidates & Progress</h2>
                    <p className="text-body-sm text-on-surface-variant">Update course completion status and candidate assessment scores.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/20 text-label-sm text-on-surface-variant uppercase font-semibold">
                        <th className="py-3 px-4">Candidate</th>
                        <th className="py-3 px-4">Program</th>
                        <th className="py-3 px-4">Enrolled Date</th>
                        <th className="py-3 px-4">Completion Status</th>
                        <th className="py-3 px-4">Assessment Score</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-body-sm text-on-surface">
                      {(providerEnrollments.length > 0 ? providerEnrollments : [
                        { enrollment_id: 1, full_name: 'Priya Sharma', woman_email: 'priya.sharma@example.com', program_name: 'Frontend to Full-Stack Engineering Fellowship', enrollment_date: '2026-02-01', completion_status: 'In Progress', score: 88 },
                        { enrollment_id: 2, full_name: 'Ananya Iyer', woman_email: 'ananya.iyer@example.com', program_name: 'Frontend to Full-Stack Engineering Fellowship', enrollment_date: '2026-02-10', completion_status: 'Enrolled', score: null },
                      ]).map((item) => (
                        <tr key={item.enrollment_id} className="hover:bg-surface-container-low transition">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-on-surface">
                              {item.candidate_name || item.full_name || 'Candidate'}
                            </div>
                            <div className="text-[12px] text-on-surface-variant">
                              {item.email || item.woman_email || ''}
                            </div>
                            {(item.phone || item.woman_phone) && (
                              <div className="text-[11px] text-on-surface-variant/80">
                                {item.phone || item.woman_phone}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 max-w-[200px] truncate text-on-surface">
                            {item.program_name}
                          </td>
                          <td className="py-3.5 px-4 text-on-surface-variant">
                            {item.enrollment_date ? new Date(item.enrollment_date).toLocaleDateString() : 'Active'}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={item.completion_status || 'Enrolled'} />
                          </td>
                          <td className="py-3.5 px-4 font-semibold">
                            {item.score !== null && item.score !== undefined ? `${item.score}%` : 'Pending'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setUpdatingEnrollment(item);
                                setEnrollmentUpdateForm({
                                  completionStatus: item.completion_status || 'In Progress',
                                  assessmentScore: item.score || 85,
                                });
                              }}
                              className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-semibold text-xs hover:bg-primary transition"
                            >
                              Update Progress
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Progress Update Modal */}
              {updatingEnrollment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
                  <div className="bg-surface p-6 rounded-2xl max-w-md w-full border border-outline-variant/20 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline-sm font-bold text-on-surface">Update Candidate Progress</h3>
                      <button onClick={() => setUpdatingEnrollment(null)} className="text-on-surface-variant hover:text-on-surface">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>

                    <p className="text-body-sm text-on-surface-variant">
                      Candidate: <span className="font-semibold text-on-surface">{updatingEnrollment.full_name}</span>
                      <br />
                      Program: <span className="font-semibold text-on-surface">{updatingEnrollment.program_name}</span>
                    </p>

                    <form onSubmit={handleUpdateEnrollment} className="space-y-4 pt-2">
                      <div>
                        <label className="block text-label-md font-medium text-on-surface mb-1">
                          Completion Status
                        </label>
                        <select
                          value={enrollmentUpdateForm.completionStatus}
                          onChange={(e) => setEnrollmentUpdateForm({ ...enrollmentUpdateForm, completionStatus: e.target.value })}
                          className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/30 outline-none"
                        >
                          <option value="Enrolled">Enrolled</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Dropped">Dropped</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-label-md font-medium text-on-surface mb-1">
                          Assessment Score (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={enrollmentUpdateForm.assessmentScore}
                          onChange={(e) => setEnrollmentUpdateForm({ ...enrollmentUpdateForm, assessmentScore: parseFloat(e.target.value) })}
                          className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/30 outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setUpdatingEnrollment(null)}
                          className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant text-sm font-medium hover:bg-surface-container-low"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUpdatingStatus}
                          className="px-5 py-2 rounded-xl bg-primary-container text-on-primary text-sm font-bold shadow-xs hover:bg-primary transition disabled:opacity-50"
                        >
                          {isUpdatingStatus ? 'Saving...' : 'Save Progress'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ======================================================== */
            /* VIEW B: CANDIDATE (WOMAN) DASHBOARD                      */
            /* ======================================================== */
            <div className="space-y-8">
              {/* Top Greeting & Matrix */}
              <section className="relative overflow-hidden rounded-2xl bg-surface-container-low p-6 lg:p-8 shadow-xs border border-outline-variant/15">
                <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none" />
                <div className="absolute right-40 -bottom-20 w-64 h-64 rounded-full bg-tertiary-fixed/30 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Candidate Growth Track
                    </span>
                    <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">
                      Welcome back, <span className="text-primary">{userName}</span>!
                    </h1>
                    <p className="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                      Continue advancing your technical competencies, track active training modules, and apply for verified job opportunities.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href="/training"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-label-lg shadow-xs hover:bg-surface-container transition-all font-semibold border border-outline-variant/15"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary">school</span>
                      <span>Browse Programs</span>
                    </Link>
                    <Link
                      href="/jobs"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-lg shadow-xs hover:bg-primary transition-all font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">work</span>
                      <span>Explore Jobs</span>
                    </Link>
                  </div>
                </div>

                {/* Candidate Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                    <span className="text-label-sm text-on-surface-variant font-medium">My Skills</span>
                    <p className="text-2xl font-bold text-on-surface mt-1">{skills.length || 5}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                    <span className="text-label-sm text-on-surface-variant font-medium">Active Enrollments</span>
                    <p className="text-2xl font-bold text-primary mt-1">{activePrograms.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                    <span className="text-label-sm text-on-surface-variant font-medium">Jobs Applied</span>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{recentApplications.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                    <span className="text-label-sm text-on-surface-variant font-medium">Profile Status</span>
                    <p className="text-lg font-bold text-emerald-600 mt-1">Verified</p>
                  </div>
                </div>
              </section>

              {/* Skills Overview */}
              <section className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs space-y-4 border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-sm text-primary uppercase font-bold tracking-wider">Proficiencies</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">My Technical Skills</h2>
                  </div>
                  <Link
                    href="/skills"
                    className="font-label-md text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Manage Skills</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {(skills.length > 0 ? skills : [
                    { skill_name: 'React.js', proficiency_level: 'Advanced' },
                    { skill_name: 'TypeScript', proficiency_level: 'Intermediate' },
                    { skill_name: 'SQL & PostgreSQL', proficiency_level: 'Advanced' },
                    { skill_name: 'UI/UX Design with Figma', proficiency_level: 'Intermediate' },
                    { skill_name: 'Python', proficiency_level: 'Beginner' },
                  ]).map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/15 text-body-sm font-medium text-on-surface"
                    >
                      <span>{s.skill_name}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary">
                        {s.proficiency_level || 'Proficient'}
                      </span>
                    </span>
                  ))}
                </div>
              </section>

              {/* Training Progress Section */}
              <section className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs space-y-4 border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-sm text-primary uppercase font-bold tracking-wider">Curriculum Path</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">My Training Programs & Progress</h2>
                  </div>
                  <Link
                    href="/training"
                    className="font-label-md text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Explore Catalog</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activePrograms.map((prog) => (
                    <div
                      key={prog.enrollment_id}
                      className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/10 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold text-primary uppercase">
                            {prog.provider_name || 'Accredited Partner'}
                          </span>
                          <h3 className="font-headline-sm font-semibold text-on-surface mt-0.5">
                            {prog.program_name}
                          </h3>
                        </div>
                        <StatusBadge status={prog.completion_status || 'In Progress'} />
                      </div>

                      <div className="flex items-center justify-between text-body-sm text-on-surface-variant pt-2 border-t border-outline-variant/10">
                        <span>Duration: {prog.duration_weeks || 12} Weeks</span>
                        {prog.score !== null && prog.score !== undefined ? (
                          <span className="font-bold text-primary">Score: {prog.score}%</span>
                        ) : (
                          <span className="text-on-surface-variant">Assessment Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recommended Jobs */}
              <section className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs space-y-4 border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-sm text-tertiary uppercase font-bold tracking-wider">Matched Vacancies</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Recommended Job Openings</h2>
                  </div>
                  <Link
                    href="/jobs"
                    className="font-label-md text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Browse All Jobs</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobsList.map((job) => (
                    <div
                      key={job.job_id}
                      className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/10 flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                          {job.company_name}
                        </span>
                        <h3 className="font-headline-sm font-semibold text-on-surface mt-1 line-clamp-1">
                          {job.job_title}
                        </h3>
                        <p className="text-body-sm text-on-surface-variant mt-1">
                          {job.location || 'Remote'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-outline-variant/10 flex items-center justify-between">
                        <span className="font-label-md font-bold text-on-surface">
                          {job.salary ? `₹${Number(job.salary).toLocaleString()}` : 'Competitive'}
                        </span>
                        <Link
                          href={`/jobs/${job.job_id}`}
                          className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-xs font-semibold hover:bg-primary transition"
                        >
                          View & Apply
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Applications Pipeline */}
              <section className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs space-y-4 border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-sm text-primary uppercase font-bold tracking-wider">Application Tracking</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">My Job Applications</h2>
                  </div>
                  <Link
                    href="/applications"
                    className="font-label-md text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>View All</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/20 text-label-sm text-on-surface-variant uppercase font-semibold">
                        <th className="py-3 px-4">Role Title</th>
                        <th className="py-3 px-4">Company</th>
                        <th className="py-3 px-4">Application Date</th>
                        <th className="py-3 px-4">Current Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-body-sm text-on-surface">
                      {recentApplications.map((app) => (
                        <tr key={app.application_id} className="hover:bg-surface-container-low transition">
                          <td className="py-3.5 px-4 font-semibold text-on-surface">{app.job_title}</td>
                          <td className="py-3.5 px-4 text-secondary">{app.company_name}</td>
                          <td className="py-3.5 px-4 text-on-surface-variant">
                            {app.application_date ? new Date(app.application_date).toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={app.application_status || 'Applied'} />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link href="/applications" className="font-semibold text-primary hover:underline">
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
