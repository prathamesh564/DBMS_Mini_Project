'use client';

import { useState, useEffect } from 'react';
import { api, getStoredUser } from '../../services/api';
import TrainingCard from '../../components/TrainingCard';

export default function TrainingPage() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [feeFilter, setFeeFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');

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
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());

    async function loadPrograms() {
      setLoading(true);
      try {
        const res = await api.training.listPrograms();
        if (res?.data && res.data.length > 0) {
          // Merge API programs with enriched display fields
          const enriched = res.data.map((p, idx) => ({
            ...p,
            id: p.program_id || p.id || `cs-${idx + 1}`,
            name: p.program_name || p.programName,
            provider: p.provider_name || p.providerName || 'Certified Partner',
            category: p.category || (idx % 2 === 0 ? 'Software Dev' : 'Data Science'),
            durationWeeks: p.duration_weeks || p.durationWeeks || 12,
            durationTier: (p.duration_weeks || 12) <= 8 ? '4-8' : '8-16',
            feeTier: Number(p.course_fee) === 0 ? 'scholarship' : 'paid',
            feeText: Number(p.course_fee) === 0 ? '100% Scholarship Covered' : `₹${p.course_fee}`,
            mode: 'Cohort Live',
            schedule: 'Tue/Thu 6:00 PM EST + Sat Lab',
            description: p.description || 'Master modern full-stack web and cloud architectures with live mentoring.',
            skills: p.skills || ['React', 'Node.js', 'PostgreSQL', 'Cloud'],
            prereqs: [
              { label: 'Basic HTML & CSS knowledge', met: true },
              { label: 'Logic fundamentals / Programming basics', met: true },
              { label: 'Weekly 15-hour time commitment', met: true },
            ],
            modules: [
              { title: 'Module 1: Foundations & Architecture', weeks: 'Weeks 1-3', topics: 'Syntax, data structures, design principles' },
              { title: 'Module 2: Core Engineering & Frameworks', weeks: 'Weeks 4-6', topics: 'Components, state pipelines, relational queries' },
              { title: 'Module 3: Database & Cloud Services', weeks: 'Weeks 7-9', topics: 'PostgreSQL schema optimization, REST APIs, Auth' },
              { title: 'Module 4: Capstone Project & Placement', weeks: 'Weeks 10-12', topics: 'Production deployment, interview preparation' },
            ],
          }));
          setCourses(enriched);
          setFilteredCourses(enriched);
        } else {
          // Fallback to the 6 comprehensive courses defined in Stitch Design 3
          const defaultCourses = [
            {
              id: 'cs-101',
              name: 'Full-Stack JavaScript & PostgreSQL Development',
              provider: 'TechForAll',
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
                { title: 'Module 1: Modern JS & TypeScript Systems', weeks: 'Weeks 1-3', topics: 'ES6+, Async paradigms, TypeScript fundamentals, build pipelines' },
                { title: 'Module 2: Client Architecture with React', weeks: 'Weeks 4-6', topics: 'Component trees, hooks, State Management, Responsive UI patterns' },
                { title: 'Module 3: PostgreSQL & API Services', weeks: 'Weeks 7-9', topics: 'Relational modeling, Prisma ORM, Express.js, JWT Authentication' },
                { title: 'Module 4: Capstone Project & Cloud Deployment', weeks: 'Weeks 10-12', topics: 'CI/CD setups, Docker containers, peer demo day & portfolio review' },
              ],
            },
            {
              id: 'cs-102',
              name: 'Applied Data Analysis with Python & BI',
              provider: 'HerFuture Academy',
              category: 'Data Science',
              durationWeeks: 8,
              durationTier: '4-8',
              schedule: 'Mon/Wed 7:00 PM EST',
              mode: 'Cohort Live',
              feeTier: 'scholarship',
              feeText: '100% Scholarship Covered',
              status: 'in-progress',
              progress: 64,
              skills: ['Python', 'Pandas', 'PowerBI', 'SQL', 'Data Wrangling'],
              description: 'Harness data pipelines, predictive statistics, and narrative executive dashboards using enterprise-standard data science toolchains.',
              prereqs: [
                { label: 'High school algebra / statistical logic', met: true },
                { label: 'Basic spreadsheet literacy (Excel/Sheets)', met: true },
                { label: 'Curiosity for analytical problem-solving', met: true },
              ],
              modules: [
                { title: 'Module 1: Python for Data Extraction', weeks: 'Weeks 1-2', topics: 'Data structures, Pandas, NumPy, Jupyter Notebook workstreams' },
                { title: 'Module 2: Advanced Relational Analytics', weeks: 'Weeks 3-4', topics: 'Complex SQL joins, aggregation, window functions, DB design' },
                { title: 'Module 3: Visual Analytics & Storytelling', weeks: 'Weeks 5-6', topics: 'PowerBI, Tableau integrations, visual KPI dashboards' },
                { title: 'Module 4: Applied Machine Learning Basics', weeks: 'Weeks 7-8', topics: 'Regression models, decision trees, executive presentation deck' },
              ],
            },
            {
              id: 'cs-103',
              name: 'Product Design & Accessibility Leadership',
              provider: 'HerFuture Academy',
              category: 'UI/UX',
              durationWeeks: 6,
              durationTier: '4-8',
              schedule: 'Flexible Cohort Hours',
              mode: 'Online Self-Paced',
              feeTier: 'free',
              feeText: 'Free for Eligible Candidates',
              status: 'ready',
              skills: ['Figma', 'WCAG 2.2', 'Design Systems', 'Prototyping', 'User Research'],
              description: 'Design inclusive, high-converting digital products conforming to international accessibility standards and scalable design tokens.',
              prereqs: [
                { label: 'Familiarity with digital software interfaces', met: true },
                { label: 'No prior code knowledge required', met: true },
                { label: 'Visual composition and empathetic thinking', met: true },
              ],
              modules: [
                { title: 'Module 1: Human-Centered UX Foundations', weeks: 'Weeks 1-2', topics: 'User interviews, persona synthesis, qualitative mapping' },
                { title: 'Module 2: Component Architecture & Figma', weeks: 'Weeks 3-4', topics: 'Auto layout, variants, token architecture, design system curation' },
                { title: 'Module 3: Digital Accessibility (A11y)', weeks: 'Weeks 5-6', topics: 'Screen reader auditing, color contrast validation, inclusive heuristics' },
              ],
            },
            {
              id: 'cs-104',
              name: 'Cloud Architecture & AWS Solutions Architect',
              provider: 'CloudSkills Lab',
              category: 'Cloud',
              durationWeeks: 10,
              durationTier: '8-16',
              schedule: 'Sat/Sun 10:00 AM EST',
              mode: 'Cohort Live',
              feeTier: 'scholarship',
              feeText: '100% Scholarship Covered',
              status: 'ready',
              skills: ['AWS', 'Terraform', 'Serverless', 'Security', 'Networking'],
              description: 'Prepare directly for AWS Solutions Architect Associate accreditation while architecting fault-tolerant distributed infrastructure.',
              prereqs: [
                { label: 'Foundational networking or Linux concepts', met: true },
                { label: 'Cloud computing curiosity', met: true },
              ],
              modules: [
                { title: 'Module 1: AWS Global Network & Compute', weeks: 'Weeks 1-3', topics: 'VPC design, subnets, EC2 auto-scaling, IAM role boundaries' },
                { title: 'Module 2: Storage, Database & Cache Tiers', weeks: 'Weeks 4-6', topics: 'S3, DynamoDB, RDS multi-AZ failovers, ElastiCache' },
                { title: 'Module 3: Serverless & Infrastructure as Code', weeks: 'Weeks 7-8', topics: 'AWS Lambda, API Gateway, Terraform IaC blueprints' },
                { title: 'Module 4: Exam Readiness & Well-Architected Review', weeks: 'Weeks 9-10', topics: 'Cost optimization, disaster recovery drills, practice simulation' },
              ],
            },
            {
              id: 'cs-105',
              name: 'Mobile App Development with Flutter & Dart',
              provider: 'TechForAll',
              category: 'Software Dev',
              durationWeeks: 8,
              durationTier: '4-8',
              schedule: 'Wed/Fri 6:30 PM EST',
              mode: 'Cohort Live',
              feeTier: 'free',
              feeText: 'Free for Eligible Candidates',
              status: 'ready',
              skills: ['Flutter', 'Dart', 'Firebase', 'State Management', 'Mobile UX'],
              description: 'Build native Android and iOS mobile applications from a single codebase with cloud databases and responsive user flows.',
              prereqs: [
                { label: 'Basic Object-Oriented Programming (OOP)', met: true },
                { label: 'Computer capable of running mobile simulators', met: true },
              ],
              modules: [
                { title: 'Module 1: Dart Programming Core', weeks: 'Weeks 1-2', topics: 'OOP syntax, null safety, asynchronous programming streams' },
                { title: 'Module 2: Flutter Widget Ecosystem', weeks: 'Weeks 3-4', topics: 'Stateful/Stateless components, responsive layout trees, navigation' },
                { title: 'Module 3: Cloud Integration & Firebase', weeks: 'Weeks 5-6', topics: 'Cloud Firestore, user auth, push notifications, offline syncing' },
                { title: 'Module 4: App Store & Play Store Publishing', weeks: 'Weeks 7-8', topics: 'Build signing, store review compliance, release pipelines' },
              ],
            },
            {
              id: 'cs-106',
              name: 'Site Reliability & DevOps Automation',
              provider: 'CloudSkills Lab',
              category: 'Cloud',
              durationWeeks: 12,
              durationTier: '8-16',
              schedule: 'Self-Paced with Weekly Mentor Clinic',
              mode: 'Online Self-Paced',
              feeTier: 'scholarship',
              feeText: '100% Scholarship Covered',
              status: 'ready',
              skills: ['Docker', 'Kubernetes', 'CI/CD', 'Prometheus', 'Bash'],
              description: 'Empowering operational resiliency through containerization, continuous integration workflows, and observable monitoring pipelines.',
              prereqs: [
                { label: 'Linux command line proficiency', met: true },
                { label: 'Basic understanding of container concepts', met: true },
              ],
              modules: [
                { title: 'Module 1: Container Orchestration with Docker', weeks: 'Weeks 1-3', topics: 'Multi-stage builds, networking, image optimization, security scan' },
                { title: 'Module 2: Kubernetes in Production', weeks: 'Weeks 4-6', topics: 'Pods, Deployments, StatefulSets, Ingress controllers, Helm charts' },
                { title: 'Module 3: Automated CI/CD Workflows', weeks: 'Weeks 7-9', topics: 'GitHub Actions, automated testing, canary deployments' },
                { title: 'Module 4: Observability & Incident Response', weeks: 'Weeks 10-12', topics: 'Prometheus metrics, Grafana dashboards, SLI/SLO frameworks' },
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

    loadPrograms();
  }, []);

  // Filter effect
  useEffect(() => {
    let result = [...courses];
    const q = searchQuery.toLowerCase().trim();

    if (q) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.provider.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q))
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

    if (providerFilter !== 'all') {
      result = result.filter((c) => c.provider === providerFilter);
    }

    setFilteredCourses(result);
  }, [searchQuery, categoryFilter, durationFilter, feeFilter, providerFilter, courses]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDurationFilter('all');
    setFeeFilter('all');
    setProviderFilter('all');
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
        // Real API call
        await api.training.enroll(selectedCourse.program_id);
      }
      setEnrollSuccess(true);
    } catch (err) {
      // If candidate already enrolled or error occurs:
      if (err.message && err.message.includes('already enrolled')) {
        setEnrollSuccess(true);
      } else {
        setEnrollError(err.message || 'Enrollment could not be processed. Please sign in as a Candidate.');
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
      });

      setShowCreateModal(false);
      // Reload programs
      const res = await api.training.listPrograms();
      if (res?.data) {
        setCourses(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to create program.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full bg-surface min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-8">
        
        {/* 1. HERO BANNER (Stitch Design 3) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-container to-surface-container-high p-8 lg:p-12 text-on-primary shadow-xl border border-white/10">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-primary-fixed backdrop-blur-md text-label-md font-label-md font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Vetted Career Accelerators • Spring 2025 Cohorts Open</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg lg:text-display-lg text-white tracking-tight font-bold">
                Vocational Training Catalog & Skill Pathways
              </h1>
              <p className="font-body-md text-body-md text-primary-fixed-dim leading-relaxed">
                Discover fully funded industry bootcamps, recognized credentials, and cohort-based technical training curated specifically for female professionals and career pivots.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 self-start md:self-auto min-w-[240px] border border-white/15">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[26px]">school</span>
              </div>
              <div>
                <div className="font-metric-number text-metric-number leading-none text-white font-bold">100%</div>
                <div className="font-label-sm text-label-sm text-primary-fixed mt-1">Tuition Grants & Stipends Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Training Provider / Admin Action Bar */}
        {(user?.role === 'training_provider' || user?.role === 'admin') && (
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-primary/20 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <span className="material-symbols-outlined">add_circle</span>
              <span>Manage Institution Curriculum Offerings</span>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container shadow-xs transition-colors"
            >
              + Create New Program
            </button>
          </div>
        )}

        {/* 2. SEARCH & FILTER CARD (Stitch Design 3) */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-5 border border-outline-variant/15">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills, courses, or providers..."
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-body-md border border-outline-variant/30 focus:bg-surface-container-lowest focus:border-primary outline-none transition shadow-inner"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-11 pl-3.5 pr-9 rounded-xl bg-surface-container-low text-on-surface font-label-lg text-label-lg focus:outline-none appearance-none cursor-pointer border border-outline-variant/30"
                >
                  <option value="all">All Disciplines</option>
                  <option value="Software Dev">Software Dev</option>
                  <option value="Cloud">Cloud & DevOps</option>
                  <option value="UI/UX">UI/UX & Product Design</option>
                  <option value="Data Science">Data Science & BI</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                  expand_more
                </span>
              </div>

              {/* Duration */}
              <div className="relative">
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="h-11 pl-3.5 pr-9 rounded-xl bg-surface-container-low text-on-surface font-label-lg text-label-lg focus:outline-none appearance-none cursor-pointer border border-outline-variant/30"
                >
                  <option value="all">Any Duration</option>
                  <option value="4-8">4-8 Weeks (Accelerated)</option>
                  <option value="8-16">8-16 Weeks (Comprehensive)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                  expand_more
                </span>
              </div>

              {/* Funding Tier */}
              <div className="relative">
                <select
                  value={feeFilter}
                  onChange={(e) => setFeeFilter(e.target.value)}
                  className="h-11 pl-3.5 pr-9 rounded-xl bg-surface-container-low text-on-surface font-label-lg text-label-lg focus:outline-none appearance-none cursor-pointer border border-outline-variant/30"
                >
                  <option value="all">All Funding Tiers</option>
                  <option value="scholarship">100% Scholarship Covered</option>
                  <option value="free">Free for Eligible Candidates</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                  expand_more
                </span>
              </div>

              {/* Reset */}
              <button
                type="button"
                onClick={resetAllFilters}
                className="h-11 px-4 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Tag Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-outline-variant/10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                Quick Filters:
              </span>
              {['React', 'Python', 'AWS', 'Figma', 'SQL', 'PostgreSQL'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchQuery(tag)}
                  className={`px-3 py-1 rounded-full text-label-md font-label-md transition-colors ${
                    searchQuery === tag
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-primary-container hover:text-on-primary'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="font-label-md text-label-md text-on-surface-variant font-medium">
              Showing {filteredCourses.length} program{filteredCourses.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        {/* 3. COURSES GRID (Stitch Design 3) */}
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
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px]">menu_book</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">No matching programs found</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Try adjusting your filters, category parameters, or search terms.
              </p>
            </div>
            <button
              onClick={resetAllFilters}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-lg font-semibold shadow-xs"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. INTERACTIVE SIDE DRAWER (Stitch Design 3) */}
      {isDrawerOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs transition-opacity"
            onClick={handleCloseDrawer}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-2xl h-full bg-surface-container-lowest shadow-2xl overflow-y-auto flex flex-col z-10 animate-slideInRight border-l border-outline-variant/20">
            {/* Header */}
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

            {/* Content Body */}
            <div className="p-6 lg:p-8 space-y-6 flex-1">
              {enrollSuccess && (
                <div className="p-4 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-start gap-3 shadow-md animate-fadeIn">
                  <span className="material-symbols-outlined text-[24px]">task_alt</span>
                  <div className="space-y-1">
                    <h4 className="font-headline-sm text-headline-sm font-bold">
                      Scholarship Enrollment Confirmed!
                    </h4>
                    <p className="font-body-sm text-body-sm opacity-90">
                      A welcome orientation packet and student access portal credentials have been registered to your profile.
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
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {selectedCourse.description}
                </p>
              </div>

              {/* Specs Box */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 text-center sm:text-left">
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">Commitment</div>
                  <div className="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">
                    {selectedCourse.durationWeeks} Weeks
                  </div>
                </div>
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">Schedule</div>
                  <div className="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">
                    {selectedCourse.schedule ? selectedCourse.schedule.split('+')[0] : 'Tue & Thu 6PM'}
                  </div>
                </div>
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">Tuition</div>
                  <div className="font-headline-sm text-headline-sm font-bold text-tertiary mt-0.5">
                    {selectedCourse.feeTier === 'scholarship' ? '100% Grant' : 'Free'}
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              <div className="space-y-3">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
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
                      <span className="font-body-sm text-body-sm">{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modules Breakdown */}
              <div className="space-y-3">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
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
                        <span className="font-label-lg text-label-lg font-bold text-on-surface">{m.title}</span>
                        <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                          {m.weeks}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{m.topics}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accreditation Badge */}
              <div className="p-4 rounded-xl bg-surface-container space-y-2 border border-outline-variant/20">
                <div className="flex items-center gap-2 font-label-lg text-label-lg text-on-surface font-bold">
                  <span className="material-symbols-outlined text-primary text-[20px]">award_star</span>
                  <span>Accredited Certification & Job Placement</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Graduates receive verified credentials linked directly to the EmpowerHer Employer Hiring Partner network with guaranteed technical screening interviews.
                </p>
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="sticky bottom-0 bg-surface-container-lowest/95 backdrop-blur-md p-6 flex items-center justify-between gap-4 border-t border-outline-variant/15 z-20">
              <div className="min-w-0">
                <div className="font-label-sm text-label-sm text-on-surface-variant">Cohort Application Status</div>
                <div className="font-label-lg text-label-lg text-tertiary flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                  <span>14 seats remaining</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="px-5 h-11 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isEnrolling || enrollSuccess}
                  onClick={handleConfirmEnrollment}
                  className="px-6 h-11 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary transition-all flex items-center gap-2 font-bold disabled:opacity-60"
                >
                  {isEnrolling ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                      <span>Securing Spot...</span>
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
        </div>
      )}

      {/* 5. CREATE PROGRAM MODAL (Training Provider & Admin) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-outline-variant/20 z-10">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
              <h3 className="font-headline-sm font-bold text-on-surface">Publish Training Program</h3>
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
                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1">Course Fee (₹ / $)</label>
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
                <label className="block text-label-md font-semibold text-on-surface mb-1">Description</label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Describe program outcomes, tools, and prerequisites..."
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
  );
}
