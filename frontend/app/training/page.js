'use client';

import { useState, useEffect } from 'react';
import { api, getStoredUser } from '../../services/api';
import TrainingCard from '../../components/TrainingCard';
import StatusBadge from '../../components/StatusBadge';
import Sidebar from '../../components/Sidebar';

export default function TrainingPage() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog');

  // Candidate enrollments state
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  // Provider / Admin enrollments monitor state
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [loadingAllEnrollments, setLoadingAllEnrollments] = useState(false);
  const [updatingEnrollmentId, setUpdatingEnrollmentId] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [feeFilter, setFeeFilter] = useState('all');

  // Drawer State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [enrollError, setEnrollError] = useState(null);

  // Program Creation Modal State (for Training Provider & Admin)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    programName: '',
    durationWeeks: 12,
    courseFee: 0,
    category: 'Software Dev',
    description: '',
    providerName: '',
    mode: 'Cohort Live',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    if (currentUser?.email) {
      setCreateForm((prev) => ({
        ...prev,
        providerName: currentUser.name || currentUser.email.split('@')[0],
      }));
    }

    loadPrograms();
  }, []);

  async function loadPrograms() {
    setLoading(true);
    try {
      const res = await api.training.listPrograms();
      const rawList = Array.isArray(res?.data) ? res.data : (res?.data?.programs || []);

      if (rawList.length > 0) {
        const enriched = rawList.map((p, idx) => ({
          ...p,
          id: p.program_id || p.id || `cs-${idx + 1}`,
          program_id: p.program_id || p.id,
          name: p.program_name || p.programName,
          provider: p.provider_name || p.providerName || 'Certified Partner',
          category: p.category || (idx % 2 === 0 ? 'Software Dev' : 'Data Science'),
          durationWeeks: p.duration_weeks || p.durationWeeks || 12,
          durationTier: (p.duration_weeks || 12) <= 8 ? '4-8' : '8-16',
          feeTier: Number(p.course_fee) === 0 ? 'scholarship' : 'paid',
          feeText: Number(p.course_fee) === 0 ? '100% Scholarship Covered' : `₹${p.course_fee}`,
          mode: p.mode || 'Cohort Live',
          schedule: p.schedule || 'Tue/Thu 6:00 PM EST + Sat Lab',
          description: p.description || 'Master modern technical skills with hands-on labs and mentor support.',
          skills: p.skills || ['Core Engineering', 'Problem Solving', 'PostgreSQL', 'Cloud'],
          prereqs: [
            { label: 'Basic logic and problem solving fundamentals', met: true },
            { label: 'Commitment of 10-15 hours/week for coursework', met: true },
          ],
          modules: [
            { title: 'Module 1: Foundations & Architecture', weeks: 'Weeks 1-3', topics: 'Syntax, structural modeling, workflows' },
            { title: 'Module 2: Advanced Implementations', weeks: 'Weeks 4-6', topics: 'Production architecture and test pipelines' },
            { title: 'Module 3: Capstone & Portfolio', weeks: 'Weeks 7+', topics: 'Industry showcase project and technical review' },
          ],
        }));
        setCourses(enriched);
        setFilteredCourses(enriched);
      } else {
        // High fidelity curated programs
        const defaultCourses = [
          {
            id: 'cs-101',
            program_id: 1,
            name: 'Full-Stack JavaScript & PostgreSQL Development',
            provider: 'TechForAll Academy',
            category: 'Software Dev',
            durationWeeks: 12,
            durationTier: '8-16',
            schedule: 'Tue/Thu 6:00 PM EST + Sat Lab',
            mode: 'Cohort Live',
            feeTier: 'scholarship',
            feeText: '100% Scholarship Covered',
            status: 'ready',
            skills: ['React', 'Node.js', 'PostgreSQL', 'REST APIs', 'Tailwind CSS'],
            description: 'An intensive flagship engineering program teaching modern web application lifecycle from database modeling to cloud containerization.',
            prereqs: [
              { label: 'Basic HTML & CSS knowledge', met: true },
              { label: 'Logic fundamentals / Javascript basics', met: true },
              { label: 'Weekly 15-hour time commitment', met: true },
            ],
            modules: [
              { title: 'Module 1: Modern JS & Systems', weeks: 'Weeks 1-3', topics: 'ES6+, Async paradigms, TypeScript fundamentals' },
              { title: 'Module 2: Client Architecture', weeks: 'Weeks 4-6', topics: 'Component trees, hooks, State Management' },
              { title: 'Module 3: Relational DB & APIs', weeks: 'Weeks 7-9', topics: 'PostgreSQL schema optimization, Express.js, Auth' },
              { title: 'Module 4: Capstone & Deployment', weeks: 'Weeks 10-12', topics: 'CI/CD, Docker containers, portfolio demo day' },
            ],
          },
          {
            id: 'cs-102',
            program_id: 2,
            name: 'Applied Data Analysis with Python & SQL',
            provider: 'HerFuture Academy',
            category: 'Data Science',
            durationWeeks: 8,
            durationTier: '4-8',
            schedule: 'Mon/Wed 7:00 PM EST',
            mode: 'Cohort Live',
            feeTier: 'scholarship',
            feeText: '100% Scholarship Covered',
            status: 'ready',
            skills: ['Python', 'Pandas', 'PowerBI', 'SQL', 'Data Wrangling'],
            description: 'Harness data pipelines, predictive statistics, and narrative executive dashboards using enterprise-standard data science toolchains.',
            prereqs: [
              { label: 'Statistical logic fundamentals', met: true },
              { label: 'Basic spreadsheet literacy (Excel/Sheets)', met: true },
            ],
            modules: [
              { title: 'Module 1: Python for Data Extraction', weeks: 'Weeks 1-2', topics: 'Data structures, Pandas, NumPy, Jupyter' },
              { title: 'Module 2: Relational Queries & SQL', weeks: 'Weeks 3-4', topics: 'Complex joins, window functions, analytics' },
              { title: 'Module 3: Visual Dashboards & BI', weeks: 'Weeks 5-6', topics: 'PowerBI, Tableau, visual KPI storytelling' },
              { title: 'Module 4: Machine Learning Core', weeks: 'Weeks 7-8', topics: 'Regression, classification, executive summary' },
            ],
          },
          {
            id: 'cs-103',
            program_id: 3,
            name: 'Cloud Architecture & DevOps Automation',
            provider: 'CloudBridge Labs',
            category: 'Cloud',
            durationWeeks: 10,
            durationTier: '8-16',
            schedule: 'Sat/Sun 10:00 AM EST',
            mode: 'Cohort Live',
            feeTier: 'scholarship',
            feeText: '100% Scholarship Covered',
            status: 'ready',
            skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
            description: 'Prepare directly for AWS Solutions Architect Associate accreditation while architecting fault-tolerant distributed infrastructure.',
            prereqs: [
              { label: 'Foundational Linux or networking concepts', met: true },
              { label: 'Cloud computing curiosity', met: true },
            ],
            modules: [
              { title: 'Module 1: Compute & Virtual Networks', weeks: 'Weeks 1-3', topics: 'VPC design, subnets, EC2, IAM policies' },
              { title: 'Module 2: Containers & Orchestration', weeks: 'Weeks 4-6', topics: 'Docker builds, Kubernetes pods, ingress' },
              { title: 'Module 3: CI/CD Pipelines & Monitor', weeks: 'Weeks 7-10', topics: 'GitHub Actions, automated testing, Prometheus' },
            ],
          },
        ];
        setCourses(defaultCourses);
        setFilteredCourses(defaultCourses);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  }

  // Load candidate's own enrollments
  async function loadMyEnrollments() {
    setLoadingEnrollments(true);
    try {
      const res = await api.training.getMyEnrollments();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.enrollments || []);
      setMyEnrollments(list);
    } catch (err) {
      console.error('Failed to load my enrollments:', err);
    } finally {
      setLoadingEnrollments(false);
    }
  }

  // Load provider or admin candidate enrollments monitor
  async function loadAllEnrollments() {
    setLoadingAllEnrollments(true);
    try {
      const res = await api.enrollments.list();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.enrollments || []);
      setAllEnrollments(list);
    } catch (err) {
      console.error('Failed to load all enrollments:', err);
    } finally {
      setLoadingAllEnrollments(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'my-enrollments' && myEnrollments.length === 0) {
      loadMyEnrollments();
    } else if ((activeTab === 'enrollment-monitor' || activeTab === 'enrolled-students') && allEnrollments.length === 0) {
      loadAllEnrollments();
    }
  }, [activeTab]);

  // Filter effect for catalog
  useEffect(() => {
    let result = [...courses];
    const q = searchQuery.toLowerCase().trim();

    if (q) {
      result = result.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.provider && c.provider.toLowerCase().includes(q)) ||
          (c.skills && c.skills.some((s) => s.toLowerCase().includes(q)))
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((c) => c.category === categoryFilter);
    }

    if (durationFilter !== 'all') {
      result = result.filter((c) => c.durationTier === durationFilter);
    }

    if (feeFilter !== 'all') {
      result = result.filter((c) => c.feeTier === feeFilter);
    }

    setFilteredCourses(result);
  }, [searchQuery, categoryFilter, durationFilter, feeFilter, courses]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDurationFilter('all');
    setFeeFilter('all');
  };

  const handleOpenDrawer = (course) => {
    setSelectedCourse(course);
    setEnrollSuccess(false);
    setEnrollError(null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleConfirmEnrollment = async () => {
    if (!selectedCourse) return;
    setIsEnrolling(true);
    setEnrollError(null);

    try {
      if (selectedCourse.program_id) {
        await api.training.enroll(selectedCourse.program_id);
      }
      setEnrollSuccess(true);
      setFeedback({ type: 'success', text: `Successfully enrolled in ${selectedCourse.name}!` });
    } catch (err) {
      if (err.message && err.message.includes('already enrolled')) {
        setEnrollSuccess(true);
      } else {
        setEnrollError(err.message || 'Enrollment could not be completed. Please ensure you are logged in as a Candidate.');
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.training.createProgram({
        programName: createForm.programName,
        durationWeeks: parseInt(createForm.durationWeeks, 10),
        courseFee: parseFloat(createForm.courseFee),
        description: createForm.description,
        category: createForm.category,
        providerName: createForm.providerName || user?.email?.split('@')[0] || 'Training Provider',
        mode: createForm.mode,
      });

      setShowCreateModal(false);
      setFeedback({ type: 'success', text: 'Training program published successfully!' });
      await loadPrograms();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to create program.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (!confirm('Are you sure you want to remove this training program? This action cannot be undone.')) return;
    try {
      const res = await api.training.deleteProgram(programId);
      setCourses((prev) => prev.filter((p) => (p.program_id || p.id) !== programId));
      setFilteredCourses((prev) => prev.filter((p) => (p.program_id || p.id) !== programId));
      setFeedback({ type: 'success', text: res?.message || 'Program removed successfully.' });
      await loadPrograms();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete program.' });
    }
  };

  const handleUpdateEnrollment = async (enrollmentId, completionStatus, assessmentScore) => {
    setUpdatingEnrollmentId(enrollmentId);
    try {
      const parsedScore =
        assessmentScore !== '' && assessmentScore !== null && assessmentScore !== undefined && !isNaN(Number(assessmentScore))
          ? Math.min(100, Math.max(0, parseInt(String(assessmentScore), 10)))
          : null;

      await api.enrollments.updateStatus(enrollmentId, {
        completionStatus,
        assessmentScore: parsedScore,
        score: parsedScore,
      });

      setAllEnrollments((prev) =>
        prev.map((item) =>
          item.enrollment_id === enrollmentId
            ? {
                ...item,
                completion_status: completionStatus,
                assessment_score: parsedScore !== null ? parsedScore : item.assessment_score,
                score: parsedScore !== null ? parsedScore : item.score,
              }
            : item
        )
      );
      setFeedback({ type: 'success', text: 'Candidate progress and assessment score saved!' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update candidate progress.' });
    } finally {
      setUpdatingEnrollmentId(null);
    }
  };

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
          <span className="font-headline-sm text-primary font-bold">Training Programs</span>
        </div>

        <div className="w-full bg-surface min-h-screen">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-8">
        
        {/* HERO BANNER */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-container to-[#3a0d9e] p-8 lg:p-12 text-on-primary shadow-xl border border-white/10">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-primary-fixed backdrop-blur-md text-label-md font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Vetted Vocational Accelerators • 2025 Cohorts Open</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg lg:text-display-lg text-white tracking-tight font-bold">
                Vocational Training Catalog & Skill Pathways
              </h1>
              <p className="font-body-md text-body-md text-primary-fixed-dim leading-relaxed">
                Discover fully funded industry bootcamps, structured credentials, and cohort-based technical training curated specifically for female professionals.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 self-start md:self-auto min-w-[240px] border border-white/15">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[26px]">school</span>
              </div>
              <div>
                <div className="font-metric-number text-metric-number leading-none text-white font-bold">100%</div>
                <div className="font-label-sm text-label-sm text-primary-fixed mt-1">Tuition Grants & Scholarships</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-2 shadow-xs ${
              feedback.type === 'success'
                ? 'bg-tertiary-fixed text-on-tertiary-fixed font-semibold'
                : 'bg-error-container text-on-error-container'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">
                {feedback.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* ROLE-AWARE NAVIGATION TABS */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-lg font-semibold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              <span>Browse Catalog</span>
            </button>

            {user?.role === 'woman' && (
              <button
                onClick={() => setActiveTab('my-enrollments')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-lg font-semibold transition-all ${
                  activeTab === 'my-enrollments'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">school</span>
                <span>My Enrollments & Progress</span>
              </button>
            )}

            {user?.role === 'training_provider' && (
              <>
                <button
                  onClick={() => setActiveTab('my-programs')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-lg font-semibold transition-all ${
                    activeTab === 'my-programs'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  <span>Manage My Programs</span>
                </button>

                <button
                  onClick={() => setActiveTab('enrolled-students')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-lg font-semibold transition-all ${
                    activeTab === 'enrolled-students'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">groups</span>
                  <span>Candidate Progress & Scores</span>
                </button>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('manage-programs')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-lg font-semibold transition-all ${
                    activeTab === 'manage-programs'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  <span>Manage All Programs</span>
                </button>

                <button
                  onClick={() => setActiveTab('enrollment-monitor')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-lg font-semibold transition-all ${
                    activeTab === 'enrollment-monitor'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">analytics</span>
                  <span>Enrollment Telemetry</span>
                </button>
              </>
            )}
          </div>

          {(user?.role === 'training_provider' || user?.role === 'admin') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Create Program</span>
            </button>
          )}
        </div>

        {/* VIEW 1: CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-8">
            {/* Search & Filter Bar */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-5 border border-outline-variant/15">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses, disciplines, or skills..."
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-body-md border border-outline-variant/30 focus:bg-surface-container-lowest focus:border-primary outline-none transition shadow-inner"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-11 px-4 rounded-xl bg-surface-container-low text-on-surface font-label-lg text-label-lg border border-outline-variant/30 cursor-pointer outline-none"
                  >
                    <option value="all">All Disciplines</option>
                    <option value="Software Dev">Software Dev</option>
                    <option value="Cloud">Cloud & DevOps</option>
                    <option value="UI/UX">UI/UX & Product Design</option>
                    <option value="Data Science">Data Science & BI</option>
                  </select>

                  <select
                    value={durationFilter}
                    onChange={(e) => setDurationFilter(e.target.value)}
                    className="h-11 px-4 rounded-xl bg-surface-container-low text-on-surface font-label-lg text-label-lg border border-outline-variant/30 cursor-pointer outline-none"
                  >
                    <option value="all">Any Duration</option>
                    <option value="4-8">4-8 Weeks (Accelerated)</option>
                    <option value="8-16">8-16 Weeks (Comprehensive)</option>
                  </select>

                  <select
                    value={feeFilter}
                    onChange={(e) => setFeeFilter(e.target.value)}
                    className="h-11 px-4 rounded-xl bg-surface-container-low text-on-surface font-label-lg text-label-lg border border-outline-variant/30 cursor-pointer outline-none"
                  >
                    <option value="all">All Funding Tiers</option>
                    <option value="scholarship">100% Scholarship Covered</option>
                    <option value="paid">Self-Paced / Standard</option>
                  </select>

                  {(searchQuery || categoryFilter !== 'all' || durationFilter !== 'all' || feeFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="h-11 px-4 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg transition-colors flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10 text-label-md text-on-surface-variant font-medium">
                <span>Showing {filteredCourses.length} vocational accelerator{filteredCourses.length === 1 ? '' : 's'}</span>
                <span className="text-tertiary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Accredited by EmpowerHer Quality Commission
                </span>
              </div>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <TrainingCard
                    key={course.id}
                    program={course}
                    onSelect={() => handleOpenDrawer(course)}
                    isEnrolled={course.status === 'in-progress'}
                    progress={course.progress || 0}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-2xl text-center space-y-4 border border-outline-variant/15">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant">menu_book</span>
                <h3 className="font-headline-sm text-on-surface font-semibold">No matching programs found</h3>
                <p className="font-body-md text-on-surface-variant">Try adjusting your filters or search keywords.</p>
                <button onClick={resetAllFilters} className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-lg font-semibold">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: CANDIDATE MY ENROLLMENTS & PROGRESS */}
        {activeTab === 'my-enrollments' && (
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/15 p-6">
              <h2 className="text-headline-sm font-bold text-on-surface">My Active Course Enrollments</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Monitor your modular learning progress, completion status, and evaluation assessment scores.
              </p>
            </div>

            {loadingEnrollments ? (
              <div className="p-12 text-center text-primary flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin">refresh</span>
                <span>Loading your enrollments...</span>
              </div>
            ) : myEnrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myEnrollments.map((enr) => (
                  <div
                    key={enr.enrollment_id}
                    className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                          {enr.category || 'Vocational Track'}
                        </span>
                        <h3 className="text-headline-sm font-bold text-on-surface mt-1">{enr.program_name}</h3>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">{enr.provider_name || 'Accredited Partner'}</p>
                      </div>
                      <StatusBadge status={enr.completion_status || 'in-progress'} />
                    </div>

                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-[10px] text-on-surface-variant uppercase font-semibold">Enrolled On</div>
                        <div className="text-xs font-bold text-on-surface mt-1">
                          {enr.enrollment_date ? new Date(enr.enrollment_date).toLocaleDateString() : 'Active'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-on-surface-variant uppercase font-semibold">Assessment Score</div>
                        <div className="text-xs font-bold text-tertiary mt-1">
                          {enr.assessment_score != null ? `${enr.assessment_score} / 100` : enr.score != null ? `${enr.score} / 100` : 'In Progress'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-on-surface-variant uppercase font-semibold">Completion Date</div>
                        <div className="text-xs font-bold text-on-surface mt-1">
                          {enr.completion_date ? new Date(enr.completion_date).toLocaleDateString() : 'Ongoing'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1 font-semibold">
                        <span>Course Completion</span>
                        <span>{enr.completion_status === 'completed' ? '100%' : '65%'}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            enr.completion_status === 'completed' ? 'bg-tertiary w-full' : 'bg-primary w-[65%]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/15 space-y-4">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant">school</span>
                <h3 className="text-headline-sm font-semibold text-on-surface">No Enrollments Yet</h3>
                <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
                  You have not enrolled in any training programs yet. Explore our funded catalog to accelerate your career!
                </p>
                <button onClick={() => setActiveTab('catalog')} className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold shadow-xs">
                  Browse Catalog
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: MANAGE PROGRAMS (Training Provider & Admin) */}
        {(activeTab === 'my-programs' || activeTab === 'manage-programs') && (
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/15 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-headline-sm font-bold text-on-surface">
                  {activeTab === 'my-programs' ? 'My Curriculum Offerings' : 'All Platform Training Programs'}
                </h2>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  Create, configure, and manage technical courses offered across the portal.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Publish New Program</span>
              </button>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/15 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/20">
                    <tr>
                      <th className="py-3 px-6">Program Name & Category</th>
                      <th className="py-3 px-6">Provider</th>
                      <th className="py-3 px-6">Duration</th>
                      <th className="py-3 px-6">Course Fee</th>
                      <th className="py-3 px-6">Mode</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                    {(activeTab === 'my-programs' && user?.role === 'training_provider'
                      ? courses.filter((c) => c.created_by === user?.userId || c.user_id === user?.userId || (!c.created_by && c.provider === (user?.name || user?.email?.split('@')[0])))
                      : courses
                    ).map((c) => (
                      <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-6">
                          <p className="font-bold text-on-surface text-sm">{c.name}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-semibold">
                            {c.category}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-on-surface-variant font-medium">{c.provider}</td>
                        <td className="py-3 px-6 font-semibold">{c.durationWeeks} Weeks</td>
                        <td className="py-3 px-6 font-bold text-tertiary">
                          {Number(c.course_fee) === 0 ? 'Scholarship (Free)' : `₹${c.course_fee}`}
                        </td>
                        <td className="py-3 px-6">{c.mode}</td>
                        <td className="py-3 px-6 text-right">
                          {(c.created_by === user?.userId || c.user_id === user?.userId || user?.role === 'admin' || (!c.created_by && c.provider === (user?.name || user?.email?.split('@')[0]))) && (
                            <button
                              onClick={() => handleDeleteProgram(c.program_id || c.id)}
                              className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-semibold transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: ENROLLMENT MONITOR & SCORE UPDATES (Provider & Admin) */}
        {(activeTab === 'enrolled-students' || activeTab === 'enrollment-monitor') && (
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/15 p-6">
              <h2 className="text-headline-sm font-bold text-on-surface">Candidate Training Progress & Assessment Scores</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Evaluate student cohort progress, mark completed milestones, and input certified assessment scores.
              </p>
            </div>

            {loadingAllEnrollments ? (
              <div className="p-12 text-center text-primary flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin">refresh</span>
                <span>Loading cohort candidate telemetry...</span>
              </div>
            ) : allEnrollments.length > 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/15 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/20">
                      <tr>
                        <th className="py-3 px-6">Candidate</th>
                        <th className="py-3 px-6">Program</th>
                        <th className="py-3 px-6">Enrollment Date</th>
                        <th className="py-3 px-6">Completion Status</th>
                        <th className="py-3 px-6">Assessment Score (0-100)</th>
                        <th className="py-3 px-6 text-right">Update</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                      {allEnrollments.map((enr) => (
                        <EnrollmentRow
                          key={enr.enrollment_id}
                          enrollment={enr}
                          onSave={handleUpdateEnrollment}
                          isSaving={updatingEnrollmentId === enr.enrollment_id}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/15 space-y-3">
                <span className="material-symbols-outlined text-[40px] text-on-surface-variant">groups</span>
                <h3 className="text-headline-sm font-semibold text-on-surface">No Candidate Enrollments Recorded</h3>
                <p className="text-body-md text-on-surface-variant">
                  Enrolled candidate records will appear here as students join vocational programs.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DRAWER: PROGRAM CURRICULUM OVERVIEW */}
      {isDrawerOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs transition-opacity" onClick={handleCloseDrawer} />

          <div className="relative w-full max-w-2xl h-full bg-surface-container-lowest shadow-2xl overflow-y-auto flex flex-col z-10 animate-slideInRight border-l border-outline-variant/20">
            <div className="sticky top-0 bg-surface-container-lowest/95 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-outline-variant/15 z-20">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm uppercase font-bold">
                  Curriculum Overview
                </span>
                <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  {selectedCourse.mode || 'Cohort Live'}
                </span>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 lg:p-8 space-y-6 flex-1">
              {enrollSuccess && (
                <div className="p-4 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-start gap-3 shadow-md animate-fadeIn">
                  <span className="material-symbols-outlined text-[24px]">task_alt</span>
                  <div className="space-y-1">
                    <h4 className="font-headline-sm font-bold">Scholarship Enrollment Confirmed!</h4>
                    <p className="font-body-sm opacity-90">
                      Welcome orientation credentials and course materials have been assigned to your profile.
                    </p>
                  </div>
                </div>
              )}

              {enrollError && (
                <div className="p-4 rounded-xl bg-error-container text-on-error-container flex items-center gap-2 text-body-sm">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  <span>{enrollError}</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-label-lg font-bold">
                  <span>{selectedCourse.provider}</span>
                  <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold leading-tight">
                  {selectedCourse.name}
                </h2>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  {selectedCourse.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 text-center sm:text-left">
                <div>
                  <div className="font-label-sm text-on-surface-variant">Commitment</div>
                  <div className="font-headline-sm font-bold text-on-surface mt-0.5">
                    {selectedCourse.durationWeeks} Weeks
                  </div>
                </div>
                <div>
                  <div className="font-label-sm text-on-surface-variant">Mode</div>
                  <div className="font-headline-sm font-bold text-on-surface mt-0.5">
                    {selectedCourse.mode || 'Cohort Live'}
                  </div>
                </div>
                <div>
                  <div className="font-label-sm text-on-surface-variant">Tuition</div>
                  <div className="font-headline-sm font-bold text-tertiary mt-0.5">
                    {selectedCourse.feeTier === 'scholarship' ? '100% Grant' : 'Funded'}
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              <div className="space-y-3">
                <h3 className="font-headline-sm text-on-surface font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                  <span>Prerequisite Skills Check</span>
                </h3>
                <div className="space-y-2">
                  {(selectedCourse.prereqs || []).map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/10"
                    >
                      <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
                      <span className="font-body-sm">{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modules */}
              <div className="space-y-3">
                <h3 className="font-headline-sm text-on-surface font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">view_timeline</span>
                  <span>Curriculum Breakdown</span>
                </h3>
                <div className="space-y-3">
                  {(selectedCourse.modules || []).map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-surface-container-low space-y-1 border border-outline-variant/10"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-label-lg font-bold text-on-surface">{m.title}</span>
                        <span className="font-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                          {m.weeks}
                        </span>
                      </div>
                      <p className="font-body-sm text-on-surface-variant">{m.topics}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-surface-container-lowest/95 backdrop-blur-md p-6 flex items-center justify-between gap-4 border-t border-outline-variant/15 z-20">
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="px-5 h-11 rounded-xl bg-surface-container text-on-surface-variant font-label-lg transition-colors font-medium"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isEnrolling || enrollSuccess}
                onClick={handleConfirmEnrollment}
                className="px-6 h-11 rounded-xl bg-primary text-on-primary font-label-lg shadow-md hover:bg-primary-container transition-all flex items-center gap-2 font-bold disabled:opacity-60"
              >
                {isEnrolling ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    <span>Securing Grant Spot...</span>
                  </>
                ) : enrollSuccess ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    <span>Enrolled</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                    <span>Confirm Grant Enrollment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PROGRAM */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-outline-variant/20 z-10">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
              <h3 className="font-headline-sm font-bold text-on-surface">Publish Vocational Program</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateProgram} className="space-y-4">
              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={createForm.programName}
                  onChange={(e) => setCreateForm({ ...createForm, programName: e.target.value })}
                  placeholder="e.g. Next.js & Cloud Database Engineering"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1">Provider Name</label>
                  <input
                    type="text"
                    required
                    value={createForm.providerName}
                    onChange={(e) => setCreateForm({ ...createForm, providerName: e.target.value })}
                    placeholder="e.g. TechForAll Academy"
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none"
                  />
                </div>
                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={createForm.durationWeeks}
                    onChange={(e) => setCreateForm({ ...createForm, durationWeeks: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1">Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none"
                  >
                    <option value="Software Dev">Software Dev</option>
                    <option value="Cloud">Cloud & DevOps</option>
                    <option value="UI/UX">UI/UX & Product Design</option>
                    <option value="Data Science">Data Science & BI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1">Course Fee (0 = Free Grant)</label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.courseFee}
                    onChange={(e) => setCreateForm({ ...createForm, courseFee: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1">Description</label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Describe program curriculum, tools, and outcomes..."
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-xs hover:bg-primary-container transition-colors disabled:opacity-60"
                >
                  {isCreating ? 'Publishing...' : 'Publish Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for interactive enrollment score & status row
function EnrollmentRow({ enrollment, onSave, isSaving }) {
  const [status, setStatus] = useState(enrollment.completion_status || 'In Progress');
  const [score, setScore] = useState(
    enrollment.assessment_score != null ? enrollment.assessment_score : enrollment.score != null ? enrollment.score : ''
  );

  return (
    <tr className="hover:bg-surface-container-low/50 transition-colors">
      <td className="py-3 px-6">
        <p className="font-bold text-on-surface text-sm">
          {enrollment.candidate_name || enrollment.full_name || enrollment.woman_name || 'Candidate'}
        </p>
        <p className="text-[11px] text-on-surface-variant">
          {enrollment.email || enrollment.woman_email || ''}
        </p>
        {(enrollment.phone || enrollment.woman_phone) && (
          <p className="text-[11px] text-on-surface-variant/80">
            {enrollment.phone || enrollment.woman_phone}
          </p>
        )}
      </td>
      <td className="py-3 px-6 font-semibold text-primary">{enrollment.program_name}</td>
      <td className="py-3 px-6 text-on-surface-variant">
        {enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString() : 'Active'}
      </td>
      <td className="py-3 px-6">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-xs px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface outline-none"
        >
          <option value="Enrolled">Enrolled</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Dropped">Dropped</option>
        </select>
      </td>
      <td className="py-3 px-6">
        <input
          type="number"
          min="0"
          max="100"
          placeholder="Score"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="w-20 px-2.5 py-1 text-xs rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface outline-none text-center"
        />
      </td>
      <td className="py-3 px-6 text-right">
        <button
          onClick={() => onSave(enrollment.enrollment_id, status, score)}
          disabled={isSaving}
          className="px-3 py-1 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </td>
    </tr>
   );
}
