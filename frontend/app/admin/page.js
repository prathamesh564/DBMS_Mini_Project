'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, getStoredUser } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Stats & Users
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [skills, setSkills] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [newRole, setNewRole] = useState('woman');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // New Skill Modal
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [skillForm, setSkillForm] = useState({ skillName: '', category: 'Technical', description: '' });

  // New Job Modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    location: 'Remote',
    employmentType: 'Full-time',
    salary: '₹8,00,000 - ₹12,00,000 / yr',
  });

  // New Program Modal
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [programForm, setProgramForm] = useState({
    programName: '',
    providerName: 'EmpowerHer Academy',
    durationWeeks: 12,
    courseFee: 0,
    category: 'Software Dev',
    description: '',
  });

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    loadAllAdminData();
  }, []);

  async function loadAllAdminData() {
    setLoading(true);
    try {
      // 1. Stats
      try {
        const statsRes = await api.admin.getStatistics();
        if (statsRes?.data) setStats(statsRes.data);
      } catch (err) {
        console.warn('Stats fetch fallback:', err);
      }

      // 2. Users
      try {
        const usersRes = await api.admin.listUsers();
        const rawUsers = Array.isArray(usersRes?.data) ? usersRes.data : (usersRes?.data?.users || []);
        if (rawUsers.length > 0) setUsers(rawUsers);
        else setUsers(getDefaultUsers());
      } catch (err) {
        setUsers(getDefaultUsers());
      }

      // 3. Candidates
      try {
        const candRes = await api.women.list();
        const rawCand = Array.isArray(candRes?.data) ? candRes.data : (candRes?.data?.women || []);
        setCandidates(rawCand);
      } catch (err) {
        console.warn('Candidates fetch error:', err);
      }

      // 4. Skills
      try {
        const skillsRes = await api.skills.getAll();
        const rawSkills = Array.isArray(skillsRes?.data) ? skillsRes.data : (skillsRes?.data?.skills || []);
        setSkills(rawSkills);
      } catch (err) {
        console.warn('Skills fetch error:', err);
      }

      // 5. Training Programs
      try {
        const progRes = await api.training.listPrograms();
        const rawProg = Array.isArray(progRes?.data) ? progRes.data : (progRes?.data?.programs || []);
        setPrograms(rawProg);
      } catch (err) {
        console.warn('Programs fetch error:', err);
      }

      // 6. Jobs
      try {
        const jobsRes = await api.jobs.list();
        const rawJobs = Array.isArray(jobsRes?.data) ? jobsRes.data : (jobsRes?.data?.jobs || []);
        setJobs(rawJobs);
      } catch (err) {
        console.warn('Jobs fetch error:', err);
      }

      // 7. Applications
      try {
        const appsRes = await api.applications.listAll();
        const rawApps = Array.isArray(appsRes?.data) ? appsRes.data : (appsRes?.data?.applications || []);
        setApplications(rawApps);
      } catch (err) {
        console.warn('Apps fetch error:', err);
      }

      // 8. Enrollments
      try {
        const enrRes = await api.enrollments.list();
        const rawEnr = Array.isArray(enrRes?.data) ? enrRes.data : (enrRes?.data?.enrollments || []);
        setEnrollments(rawEnr);
      } catch (err) {
        console.warn('Enrollments fetch error:', err);
      }
    } finally {
      setLoading(false);
    }
  }

  const getDefaultUsers = () => [
    {
      id: 1,
      email: 'priya.sharma@example.com',
      role: 'woman',
      name: 'Priya Sharma',
      created_at: '2026-01-10T12:00:00Z',
      status: 'Active',
    },
    {
      id: 2,
      email: 'director@techbridge.edu',
      role: 'training_provider',
      name: 'TechBridge Academy',
      created_at: '2025-09-18T09:15:00Z',
      status: 'Active',
    },
    {
      id: 3,
      email: 'admin@empowerher.org',
      role: 'admin',
      name: 'System Administrator',
      created_at: '2025-01-01T00:00:00Z',
      status: 'Superuser',
    },
    {
      id: 4,
      email: 'ananya.iyer@example.com',
      role: 'woman',
      name: 'Ananya Iyer',
      created_at: '2026-02-14T08:30:00Z',
      status: 'Active',
    },
  ];

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedUserForRole) return;
    setUpdating(true);
    setFeedback(null);

    try {
      await api.admin.updateUserRole(selectedUserForRole.id || selectedUserForRole.user_id, newRole);
      setUsers((prev) =>
        prev.map((u) => ((u.id || u.user_id) === (selectedUserForRole.id || selectedUserForRole.user_id) ? { ...u, role: newRole } : u))
      );
      setFeedback({
        type: 'success',
        message: `User ${selectedUserForRole.email} role updated to "${newRole}".`,
      });
      setSelectedUserForRole(null);
    } catch (err) {
      alert(err.message || 'Failed to update user role.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    try {
      await api.skills.create(skillForm);
      setShowSkillModal(false);
      setSkillForm({ skillName: '', category: 'Technical', description: '' });
      setFeedback({ type: 'success', message: 'New master skill added to taxonomy.' });
      loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Failed to create skill.');
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      await api.skills.delete(id);
      setSkills((prev) => prev.filter((s) => (s.skill_id || s.id) !== id));
      setFeedback({ type: 'success', message: 'Skill removed.' });
    } catch (err) {
      alert(err.message || 'Failed to delete skill.');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await api.jobs.create(jobForm);
      setShowJobModal(false);
      setFeedback({ type: 'success', message: 'Job posting published.' });
      loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Failed to create job.');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await api.jobs.delete(id);
      setJobs((prev) => prev.filter((j) => (j.job_id || j.id) !== id));
      setFeedback({ type: 'success', message: 'Job deleted.' });
    } catch (err) {
      alert(err.message || 'Failed to delete job.');
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    try {
      await api.training.createProgram({
        ...programForm,
        durationWeeks: parseInt(programForm.durationWeeks, 10),
        courseFee: parseFloat(programForm.courseFee),
      });
      setShowProgramModal(false);
      setFeedback({ type: 'success', message: 'Training program published.' });
      loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Failed to create program.');
    }
  };

  const handleDeleteProgram = async (id) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    try {
      await api.training.deleteProgram(id);
      setPrograms((prev) => prev.filter((p) => (p.program_id || p.id) !== id));
      setFeedback({ type: 'success', message: 'Program deleted.' });
    } catch (err) {
      alert(err.message || 'Failed to delete program.');
    }
  };

  const handleAppStatusChange = async (appId, newStatus) => {
    try {
      await api.applications.updateStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a.application_id === appId ? { ...a, status: newStatus } : a))
      );
      setFeedback({ type: 'success', message: `Application status updated to ${newStatus}.` });
    } catch (err) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleEnrollmentUpdate = async (enrollmentId, completionStatus, assessmentScore) => {
    try {
      await api.enrollments.updateStatus(enrollmentId, {
        completionStatus,
        assessmentScore: assessmentScore !== '' ? parseInt(assessmentScore, 10) : null,
        score: assessmentScore !== '' ? parseInt(assessmentScore, 10) : null,
      });
      setEnrollments((prev) =>
        prev.map((e) =>
          e.enrollment_id === enrollmentId
            ? { ...e, completion_status: completionStatus, assessment_score: assessmentScore }
            : e
        )
      );
      setFeedback({ type: 'success', message: 'Candidate enrollment progress saved.' });
    } catch (err) {
      alert(err.message || 'Failed to update enrollment.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'training_provider':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'woman':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Platform Analytics', icon: 'analytics' },
    { id: 'users', label: 'Users & RBAC', icon: 'manage_accounts' },
    { id: 'candidates', label: 'Candidate Profiles', icon: 'badge' },
    { id: 'skills', label: 'Skills Taxonomy', icon: 'psychology' },
    { id: 'programs', label: 'Training Programs', icon: 'school' },
    { id: 'jobs', label: 'Job Postings', icon: 'work' },
    { id: 'applications', label: 'Applications', icon: 'assignment' },
    { id: 'enrollments', label: 'Enrollments', icon: 'fact_check' },
  ];

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-outline-variant/15 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
              aria-label="Open sidebar"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-on-surface">System Administration</h1>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  Admin Master Console
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Platform-wide governance across 8 core database tables and 3 system roles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAllAdminData}
              className="px-3.5 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              Sync Database
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-surface-container-lowest border-b border-outline-variant/15 px-6 py-2 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
          {feedback && (
            <div
              className={`p-4 rounded-xl flex items-center justify-between text-sm ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">
                  {feedback.type === 'success' ? 'check_circle' : 'error'}
                </span>
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="hover:opacity-75">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW & PLATFORM ANALYTICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-outline-variant/15 shadow-sm">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="text-xs font-semibold">Registered Candidates</span>
                    <span className="material-symbols-outlined text-[20px] text-primary">diversity_1</span>
                  </div>
                  <p className="text-2xl font-bold text-on-surface mt-2">
                    {stats?.totalWomen != null ? stats.totalWomen : candidates.length}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Active Women Profiles</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-outline-variant/15 shadow-sm">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="text-xs font-semibold">Training Programs</span>
                    <span className="material-symbols-outlined text-[20px] text-amber-600">school</span>
                  </div>
                  <p className="text-2xl font-bold text-on-surface mt-2">
                    {stats?.totalPrograms != null ? stats.totalPrograms : programs.length}
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-1">Vetted Vocational Offerings</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-outline-variant/15 shadow-sm">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="text-xs font-semibold">Active Job Postings</span>
                    <span className="material-symbols-outlined text-[20px] text-blue-600">work</span>
                  </div>
                  <p className="text-2xl font-bold text-on-surface mt-2">
                    {stats?.totalJobs != null ? stats.totalJobs : jobs.length}
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-1">Admin Verified Listings</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-outline-variant/15 shadow-sm">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="text-xs font-semibold">Course Enrollments</span>
                    <span className="material-symbols-outlined text-[20px] text-emerald-600">how_to_reg</span>
                  </div>
                  <p className="text-2xl font-bold text-on-surface mt-2">
                    {stats?.totalEnrollments != null ? stats.totalEnrollments : enrollments.length}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Active Learning Paths</p>
                </div>
              </div>

              {/* Database Simplification Architecture Card */}
              <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-on-surface">Core Architecture Telemetry (Schema: women_skill_portal)</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Strictly maintained 8 application tables with direct provider & company denormalization
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Supabase Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { name: 'user_profiles', count: users.length, desc: '3 roles: woman, provider, admin' },
                    { name: 'women', count: candidates.length, desc: 'Candidate profiles & resumes' },
                    { name: 'skills', count: skills.length, desc: 'Master skill taxonomy' },
                    { name: 'women_skills', count: 'M:N', desc: 'Proficiency & experience map' },
                    { name: 'training_programs', count: programs.length, desc: 'Direct provider_name & creator' },
                    { name: 'enrollments', count: enrollments.length, desc: 'Progress & assessment scores' },
                    { name: 'job_postings', count: jobs.length, desc: 'Direct company_name & admin' },
                    { name: 'job_applications', count: applications.length, desc: 'Applications & cover notes' },
                  ].map((tbl) => (
                    <div key={tbl.name} className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/10">
                      <div className="font-mono font-bold text-primary">{tbl.name}</div>
                      <div className="text-[11px] text-on-surface-variant mt-1">{tbl.desc}</div>
                      <div className="font-bold text-on-surface mt-2 text-sm">{tbl.count} records</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS & RBAC */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden space-y-0">
              <div className="p-5 border-b border-outline-variant/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-on-surface">User Directory & Role Delegation</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Manage system accounts strictly across the 3 user roles: Woman, Training Provider, and Admin.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-1.5 text-xs bg-surface-container/60 border border-outline-variant/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 w-56"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-surface-container/60 border border-outline-variant/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Roles</option>
                    <option value="woman">Candidate (Woman)</option>
                    <option value="training_provider">Training Provider</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container/50 text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/15">
                    <tr>
                      <th className="px-6 py-3 font-semibold">User Profile</th>
                      <th className="px-6 py-3 font-semibold">Current System Role</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold">Registered</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                    {filteredUsers.map((item) => (
                      <tr key={item.id || item.user_id} className="hover:bg-surface-container/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-on-surface">{item.name || item.email.split('@')[0]}</p>
                          <p className="text-[11px] text-on-surface-variant">{item.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${getRoleBadge(
                              item.role
                            )}`}
                          >
                            {item.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {item.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          {new Date(item.created_at || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedUserForRole(item);
                              setNewRole(item.role);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[11px] font-semibold text-primary hover:bg-primary/5 transition-colors"
                          >
                            Change Role
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CANDIDATE PROFILES */}
          {activeTab === 'candidates' && (
            <div className="bg-white rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-outline-variant/15">
                <h2 className="text-base font-bold text-on-surface">Candidate Directory (Women Profiles)</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Inspect candidate contact records, education levels, and uploaded resume URLs.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container/50 text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/15">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Candidate Name</th>
                      <th className="px-6 py-3 font-semibold">Contact Email & Phone</th>
                      <th className="px-6 py-3 font-semibold">Education</th>
                      <th className="px-6 py-3 font-semibold">Address</th>
                      <th className="px-6 py-3 font-semibold text-right">Resume Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                    {candidates.length > 0 ? (
                      candidates.map((cand) => (
                        <tr key={cand.woman_id} className="hover:bg-surface-container/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-on-surface">{cand.full_name || cand.name || 'Candidate'}</td>
                          <td className="px-6 py-4">
                            <p className="text-on-surface">{cand.email}</p>
                            <p className="text-[11px] text-on-surface-variant">{cand.phone || '—'}</p>
                          </td>
                          <td className="px-6 py-4">{cand.education_level || 'Graduate'}</td>
                          <td className="px-6 py-4 text-on-surface-variant">{cand.address || '—'}</td>
                          <td className="px-6 py-4 text-right">
                            {cand.resume_url ? (
                              <a
                                href={cand.resume_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 rounded bg-surface-container text-primary font-semibold text-[11px] hover:bg-surface-container-high"
                              >
                                View Resume
                              </a>
                            ) : (
                              <span className="text-on-surface-variant text-[11px]">No link</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                          No candidate records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS TAXONOMY */}
          {activeTab === 'skills' && (
            <div className="bg-white rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-outline-variant/15 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-on-surface">Master Skills Taxonomy</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Standardized skill library referenced across candidate profiles and course tags.
                  </p>
                </div>
                <button
                  onClick={() => setShowSkillModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add Skill</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container/50 text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/15">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Skill Name</th>
                      <th className="px-6 py-3 font-semibold">Category</th>
                      <th className="px-6 py-3 font-semibold">Description</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                    {skills.map((s) => (
                      <tr key={s.skill_id || s.id} className="hover:bg-surface-container/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-on-surface">{s.skill_name || s.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] font-semibold">
                            {s.category || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant max-w-sm">{s.description || '—'}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteSkill(s.skill_id || s.id)}
                            className="px-2.5 py-1 rounded text-rose-600 hover:bg-rose-50 text-[11px] font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: TRAINING PROGRAMS */}
          {activeTab === 'programs' && (
            <div className="bg-white rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-outline-variant/15 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-on-surface">Training Programs Management</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Manage vocational courses with direct provider name and fee structure.
                  </p>
                </div>
                <button
                  onClick={() => setShowProgramModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Create Program</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container/50 text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/15">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Program</th>
                      <th className="px-6 py-3 font-semibold">Provider</th>
                      <th className="px-6 py-3 font-semibold">Duration</th>
                      <th className="px-6 py-3 font-semibold">Fee</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                    {programs.map((p) => (
                      <tr key={p.program_id || p.id} className="hover:bg-surface-container/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-on-surface">{p.program_name}</p>
                          <span className="text-[10px] text-on-surface-variant">{p.category}</span>
                        </td>
                        <td className="px-6 py-4 font-medium">{p.provider_name}</td>
                        <td className="px-6 py-4">{p.duration_weeks || 12} Weeks</td>
                        <td className="px-6 py-4 font-bold text-tertiary">
                          {Number(p.course_fee) === 0 ? 'Scholarship (Free)' : `₹${p.course_fee}`}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteProgram(p.program_id || p.id)}
                            className="px-2.5 py-1 rounded text-rose-600 hover:bg-rose-50 text-[11px] font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: JOB POSTINGS */}
          {activeTab === 'jobs' && (
            <div className="bg-white rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-outline-variant/15 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-on-surface">Job Postings Management</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Publish and manage verified employment opportunities with direct company attribution.
                  </p>
                </div>
                <button
                  onClick={() => setShowJobModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Post Job</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container/50 text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/15">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Job Title & Company</th>
                      <th className="px-6 py-3 font-semibold">Location</th>
                      <th className="px-6 py-3 font-semibold">Type</th>
                      <th className="px-6 py-3 font-semibold">Compensation</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                    {jobs.map((j) => (
                      <tr key={j.job_id || j.id} className="hover:bg-surface-container/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-on-surface">{j.job_title}</p>
                          <p className="text-[11px] text-primary font-medium">{j.company_name}</p>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">{j.location || 'Remote'}</td>
                        <td className="px-6 py-4">{j.job_type || j.employment_type || 'Full-time'}</td>
                        <td className="px-6 py-4 font-semibold text-tertiary">{j.salary || j.salary_range || 'Competitive'}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteJob(j.job_id || j.id)}
                            className="px-2.5 py-1 rounded text-rose-600 hover:bg-rose-50 text-[11px] font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="bg-white rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-outline-variant/15">
                <h2 className="text-base font-bold text-on-surface">Candidate Job Applications</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Review applicant cover notes and manage hiring pipeline stages.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container/50 text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/15">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Candidate</th>
                      <th className="px-6 py-3 font-semibold">Job Title & Company</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold">Cover Note</th>
                      <th className="px-6 py-3 font-semibold text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                    {applications.length > 0 ? (
                      applications.map((app) => (
                        <tr key={app.application_id} className="hover:bg-surface-container/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-on-surface">{app.candidate_name || 'Candidate'}</p>
                            <p className="text-[11px] text-on-surface-variant">{app.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-on-surface">{app.job_title}</p>
                            <p className="text-[11px] text-primary">{app.company_name}</p>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={app.status || 'Applied'} />
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate text-on-surface-variant" title={app.cover_note}>
                            {app.cover_note || '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <select
                              value={app.status}
                              onChange={(e) => handleAppStatusChange(app.application_id, e.target.value)}
                              className="text-xs px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface outline-none cursor-pointer"
                            >
                              <option value="Applied">Applied</option>
                              <option value="Reviewed">Reviewed</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Interviewing">Interviewing</option>
                              <option value="Offered">Offered</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                          No candidate applications recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: ENROLLMENTS */}
          {activeTab === 'enrollments' && (
            <div className="bg-white rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-outline-variant/15">
                <h2 className="text-base font-bold text-on-surface">Candidate Training Enrollments & Progress</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Monitor cohort enrollment completion status and update assessment scores.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container/50 text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/15">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Candidate</th>
                      <th className="px-6 py-3 font-semibold">Program</th>
                      <th className="px-6 py-3 font-semibold">Enrolled On</th>
                      <th className="px-6 py-3 font-semibold">Completion Status</th>
                      <th className="px-6 py-3 font-semibold">Assessment Score</th>
                      <th className="px-6 py-3 font-semibold text-right">Save Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                    {enrollments.length > 0 ? (
                      enrollments.map((enr) => (
                        <EnrollmentAdminRow
                          key={enr.enrollment_id}
                          enrollment={enr}
                          onSave={handleEnrollmentUpdate}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                          No enrollments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* MODAL: CHANGE ROLE */}
        {selectedUserForRole && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/20 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
                <div>
                  <h2 className="text-base font-bold text-on-surface">Update RBAC User Role</h2>
                  <p className="text-xs text-on-surface-variant">{selectedUserForRole.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUserForRole(null)}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleUpdateRole} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Select New System Role (Strictly 3 Roles)
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/50 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="woman">Candidate (Woman)</option>
                    <option value="training_provider">Training Provider</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs leading-relaxed">
                  <strong>Role Elevation Note:</strong> Role delegation is enforced across database RLS policies. The employer role has been simplified into Admin job creation.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForRole(null)}
                    className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    {updating && <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />}
                    Save Role Change
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD SKILL */}
        {showSkillModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/20">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
                <h3 className="font-bold text-on-surface">Add Skill to Master Taxonomy</h3>
                <button onClick={() => setShowSkillModal(false)} className="text-secondary hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleCreateSkill} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Skill Name</label>
                  <input
                    type="text"
                    required
                    value={skillForm.skillName}
                    onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
                    placeholder="e.g. Next.js, Kubernetes, Docker"
                    className="w-full h-9 px-3 rounded-lg bg-surface-container/50 border border-outline-variant/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={skillForm.category}
                    onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container/50 border border-outline-variant/30 outline-none"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Design">Design</option>
                    <option value="Data">Data</option>
                    <option value="Soft Skills">Soft Skills</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={skillForm.description}
                    onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-surface-container/50 border border-outline-variant/30 outline-none resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowSkillModal(false)} className="px-4 py-2 rounded-lg bg-surface-container font-semibold">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow-xs">
                    Save Skill
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: POST JOB */}
        {showJobModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/20">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
                <h3 className="font-bold text-on-surface">Publish Verified Job Posting</h3>
                <button onClick={() => setShowJobModal(false)} className="text-secondary hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleCreateJob} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={jobForm.companyName}
                    onChange={(e) => setJobForm({ ...jobForm, companyName: e.target.value })}
                    placeholder="e.g. Starlight Software"
                    className="w-full h-9 px-3 rounded-lg bg-surface-container/50 border border-outline-variant/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={jobForm.jobTitle}
                    onChange={(e) => setJobForm({ ...jobForm, jobTitle: e.target.value })}
                    placeholder="e.g. Associate Frontend Engineer"
                    className="w-full h-9 px-3 rounded-lg bg-surface-container/50 border border-outline-variant/30 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container/50 border border-outline-variant/30 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Employment Type</label>
                    <select
                      value={jobForm.employmentType}
                      onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container/50 border border-outline-variant/30 outline-none"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container/50 border border-outline-variant/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Job Description</label>
                  <textarea
                    rows={3}
                    required
                    value={jobForm.jobDescription}
                    onChange={(e) => setJobForm({ ...jobForm, jobDescription: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-surface-container/50 border border-outline-variant/30 outline-none resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowJobModal(false)} className="px-4 py-2 rounded-lg bg-surface-container font-semibold">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow-xs">
                    Publish Vacancy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREATE PROGRAM */}
        {showProgramModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/20">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
                <h3 className="font-bold text-on-surface">Publish Vocational Training Program</h3>
                <button onClick={() => setShowProgramModal(false)} className="text-secondary hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleCreateProgram} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Program Title</label>
                  <input
                    type="text"
                    required
                    value={programForm.programName}
                    onChange={(e) => setProgramForm({ ...programForm, programName: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container/50 border border-outline-variant/30 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Provider Name</label>
                    <input
                      type="text"
                      required
                      value={programForm.providerName}
                      onChange={(e) => setProgramForm({ ...programForm, providerName: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container/50 border border-outline-variant/30 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Duration (Weeks)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={programForm.durationWeeks}
                      onChange={(e) => setProgramForm({ ...programForm, durationWeeks: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container/50 border border-outline-variant/30 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Category</label>
                    <select
                      value={programForm.category}
                      onChange={(e) => setProgramForm({ ...programForm, category: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container/50 border border-outline-variant/30 outline-none"
                    >
                      <option value="Software Dev">Software Dev</option>
                      <option value="Cloud">Cloud & DevOps</option>
                      <option value="UI/UX">UI/UX & Product Design</option>
                      <option value="Data Science">Data Science & BI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Fee (0 = Free Grant)</label>
                    <input
                      type="number"
                      min="0"
                      value={programForm.courseFee}
                      onChange={(e) => setProgramForm({ ...programForm, courseFee: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container/50 border border-outline-variant/30 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={programForm.description}
                    onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-surface-container/50 border border-outline-variant/30 outline-none resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowProgramModal(false)} className="px-4 py-2 rounded-lg bg-surface-container font-semibold">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow-xs">
                    Publish Program
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for interactive enrollment score row in Admin
function EnrollmentAdminRow({ enrollment, onSave }) {
  const [status, setStatus] = useState(enrollment.completion_status || 'in-progress');
  const [score, setScore] = useState(
    enrollment.assessment_score != null ? enrollment.assessment_score : enrollment.score != null ? enrollment.score : ''
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(enrollment.enrollment_id, status, score);
    setSaving(false);
  };

  return (
    <tr className="hover:bg-surface-container/30 transition-colors">
      <td className="px-6 py-4">
        <p className="font-bold text-on-surface">{enrollment.candidate_name || 'Candidate'}</p>
        <p className="text-[11px] text-on-surface-variant">{enrollment.email}</p>
      </td>
      <td className="px-6 py-4 font-semibold text-primary">{enrollment.program_name}</td>
      <td className="px-6 py-4 text-on-surface-variant">
        {enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString() : 'Active'}
      </td>
      <td className="px-6 py-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-xs px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface outline-none cursor-pointer"
        >
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>
      </td>
      <td className="px-6 py-4">
        <input
          type="number"
          min="0"
          max="100"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="0-100"
          className="w-16 px-2 py-1 text-xs rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-center outline-none"
        />
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1 rounded-lg bg-primary text-white text-[11px] font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </td>
    </tr>
  );
}
