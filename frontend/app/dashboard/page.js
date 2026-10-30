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
  const [interviews, setInterviews] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    skillsCount: 12,
    coursesCount: 3,
    certsCount: 2,
    appsCount: 8,
    interviewsCount: 2,
  });

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    async function loadDashboardData() {
      setLoading(true);
      try {
        if (currentUser?.role === 'admin') {
          // Admin can redirect to /admin or view overview
        }

        // Fetch candidate data from real backend endpoints
        const [profRes, trainRes, appRes, intRes, certRes, jobsRes] = await Promise.allSettled([
          api.women.getMyProfile(),
          api.training.getMyEnrollments(),
          api.applications.getMyApplications(),
          api.interviews.getMyInterviews(),
          api.certifications.getMyCertificates(),
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

        if (intRes.status === 'fulfilled' && intRes.value?.data) {
          setInterviews(intRes.value.data);
        }

        if (certRes.status === 'fulfilled' && certRes.value?.data) {
          setCertifications(certRes.value.data);
        }

        if (jobsRes.status === 'fulfilled' && jobsRes.value?.data) {
          setRecommendedJobs(jobsRes.value.data.slice(0, 3));
        }
      } catch (err) {
        console.warn('Dashboard API fetch completed with fallback states:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Priya Sharma';

  // Apply fallback items if backend tables are fresh/empty
  const activePrograms = enrollments.length > 0 ? enrollments : [
    {
      enrollment_id: 1,
      program_name: 'Fullstack React & Next.js Architecture',
      mentor: 'Dr. Elena Vance',
      module_text: 'Module 4 of 6',
      progress: 75,
      next_live: 'Tomorrow, 6:00 PM IST',
      current_topic: 'Micro-frontend Modular Routing',
    },
    {
      enrollment_id: 2,
      program_name: 'Cloud Databases & API Design for Scalability',
      mentor: 'Sunita Rao',
      module_text: 'Module 2 of 5',
      progress: 40,
      next_live: 'Friday, 4:30 PM IST',
      current_topic: 'GraphQL Query Optimization',
    },
  ];

  const upcomingInterviews = interviews.length > 0 ? interviews : [
    {
      interview_id: 1,
      company_name: 'TechVanguard Systems',
      round: 'Technical Round 2 (System Design)',
      date: 'Tomorrow, October 24, 2025',
      time: '11:30 AM - 12:30 PM IST (Google Meet)',
      link: 'https://meet.google.com',
    },
    {
      interview_id: 2,
      company_name: 'Hyperion Digital',
      round: 'Hiring Manager & Culture Fit',
      date: 'Friday, October 26, 2025',
      time: '3:00 PM - 3:45 PM IST (Zoom Meeting)',
      link: 'https://zoom.us',
    },
  ];

  const jobsList = recommendedJobs.length > 0 ? recommendedJobs : [
    {
      job_id: 'rj-1',
      job_title: 'Frontend Engineer',
      company_name: 'Aura Labs',
      location: 'Bengaluru (Hybrid)',
      match_pct: '96%',
      compensation: '₹14 - 18 LPA',
      skills: ['React 18', 'TypeScript', 'Tailwind'],
    },
    {
      job_id: 'rj-2',
      job_title: 'React Developer',
      company_name: 'Zenith Cloud',
      location: 'Remote',
      match_pct: '92%',
      compensation: '₹12 - 16 LPA',
      skills: ['Next.js', 'REST APIs', 'Jest'],
    },
    {
      job_id: 'rj-3',
      job_title: 'Data Associate',
      company_name: 'Nova Financial',
      location: 'Pune (On-site)',
      match_pct: '88%',
      compensation: '₹10 - 13 LPA',
      skills: ['SQL', 'Python', 'ETL Tools'],
    },
  ];

  const recentApplications = applications.length > 0 ? applications : [
    {
      application_id: 'app-1',
      job_title: 'Associate Frontend Engineer',
      company_name: 'Starlight Software Inc.',
      date: 'Oct 20, 2025',
      status: 'Interviewing',
    },
    {
      application_id: 'app-2',
      job_title: 'Junior Data Analyst',
      company_name: 'Nexus Financial Group',
      date: 'Oct 18, 2025',
      status: 'Shortlisted',
    },
    {
      application_id: 'app-3',
      job_title: 'Associate Product Designer',
      company_name: 'Vanguard Health Tech',
      date: 'Oct 15, 2025',
      status: 'Reviewed',
    },
    {
      application_id: 'app-4',
      job_title: 'Junior Growth Specialist',
      company_name: 'OmniRetail E-Commerce',
      date: 'Oct 10, 2025',
      status: 'Applied',
    },
  ];

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar Navigation (Stitch Design 2) */}
      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area (Offset by sidebar on desktop) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Top Control Bar for Mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-surface border-b border-outline-variant/15">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
            <span className="font-label-md font-bold text-on-surface">Menu</span>
          </button>
          <span className="font-headline-sm text-primary font-bold">Candidate Workspace</span>
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* 1. TOP GREETING & ACTION MATRIX (Stitch Design 2) */}
          <section className="relative overflow-hidden rounded-2xl bg-surface-container-low p-6 lg:p-8 shadow-xs border border-outline-variant/15">
            <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none" />
            <div className="absolute right-40 -bottom-20 w-64 h-64 rounded-full bg-tertiary-fixed/30 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/10 text-primary font-label-sm text-label-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    EmpowerHer Fellowship Track
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant hidden sm:inline">
                    Last active: Today, 09:42 AM
                  </span>
                </div>
                <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">
                  Welcome back, <span className="text-primary">{userName}</span>!
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                  Continue building your skills and exploring new career opportunities. You are on track for mid-level technical placements this quarter.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/training"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-xs hover:bg-surface-container hover:shadow transition-all font-semibold border border-outline-variant/15"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">school</span>
                  <span>Browse Courses</span>
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-xs hover:bg-surface-container hover:shadow transition-all font-semibold border border-outline-variant/15"
                >
                  <span className="material-symbols-outlined text-[18px] text-tertiary">edit_document</span>
                  <span>Update Profile</span>
                </Link>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary transition-all font-semibold"
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  <span>Find Jobs</span>
                </Link>
              </div>
            </div>
          </section>

          {/* 2. METRIC RIBBON (4-column row, Stitch Design 2) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* Metric 1: Skills */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between border border-outline-variant/15">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Skills Added</span>
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">psychology</span>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-metric-number text-metric-number text-on-surface font-bold">
                    {skills.length || stats.skillsCount}
                  </span>
                  <span className="font-label-md text-label-md text-tertiary font-semibold flex items-center">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span> +3 verified
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  <span className="font-semibold text-on-surface">4 Advanced</span> • 5 Intermediate
                </p>
              </div>
            </div>

            {/* Metric 2: Courses Enrolled */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between border border-outline-variant/15">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Courses Enrolled</span>
                <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">auto_stories</span>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-metric-number text-metric-number text-on-surface font-bold">
                    {enrollments.length || stats.coursesCount}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant font-medium">Active Programs</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  <span className="font-semibold text-tertiary">1 Completed</span> • 78% avg progress
                </p>
              </div>
            </div>

            {/* Metric 3: Certifications */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between border border-outline-variant/15">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Certifications</span>
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-metric-number text-metric-number text-on-surface font-bold">
                    {certifications.length || stats.certsCount}
                  </span>
                  <span className="font-label-md text-label-md text-tertiary font-semibold flex items-center">
                    Blockchain verified
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Credential IDs ready for recruiters
                </p>
              </div>
            </div>

            {/* Metric 4: Applications */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between border border-outline-variant/15">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Job Applications</span>
                <div className="w-10 h-10 rounded-xl bg-primary-fixed-dim/40 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-metric-number text-metric-number text-on-surface font-bold">
                    {applications.length || stats.appsCount}
                  </span>
                  <span className="font-label-md text-label-md text-primary font-semibold">Submitted</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  <span className="font-semibold text-primary">2 Interviews</span> Scheduled this week
                </p>
              </div>
            </div>
          </section>

          {/* 3. MAIN BENTO GRID (8 cols Left, 4 cols Right, Stitch Design 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Profile Completion Circular Widget */}
              <section className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 border border-outline-variant/15">
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-surface-container"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      />
                      <path
                        className="text-primary-container"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="85, 100"
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="font-headline-sm text-headline-sm font-bold text-on-surface">85%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Profile Strength: High</h2>
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                        Almost Complete
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                      Candidates who add verified skills and completed education details receive <strong className="text-on-surface">3.8x more interview calls</strong>.
                    </p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-xs hover:bg-primary transition-all font-semibold"
                >
                  <span className="material-symbols-outlined text-[18px]">add_link</span>
                  <span>Enhance Profile</span>
                </Link>
              </section>

              {/* Active Training Programs Section */}
              <section className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs space-y-6 border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">Curriculum Path</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">My Active Training Programs</h2>
                  </div>
                  <Link
                    href="/training"
                    className="font-label-md text-label-md text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>View All Programs</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>

                <div className="space-y-4">
                  {activePrograms.map((prog) => (
                    <div
                      key={prog.enrollment_id || prog.id}
                      className="p-5 rounded-xl bg-surface-container-low space-y-4 hover:shadow-xs transition-all border border-outline-variant/10"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs">
                            <span className="material-symbols-outlined text-[24px]">code</span>
                          </div>
                          <div>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                              {prog.program_name || 'Program Title'}
                            </h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Mentor: {prog.mentor || 'Faculty Lead'} • {prog.module_text || 'Module In Progress'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary font-label-sm text-label-sm font-medium">
                          <span className="material-symbols-outlined text-[16px] animate-pulse">videocam</span>
                          <span>{prog.next_live || 'Upcoming Lecture'}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-label-sm text-label-sm">
                          <span className="text-on-surface-variant font-medium">
                            Progress: {prog.progress || 50}% Completed
                          </span>
                          <span className="text-primary font-bold">{prog.progress || 50}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-surface-container-highest overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary-container transition-all duration-500"
                            style={{ width: `${prog.progress || 50}%` }}
                          />
                        </div>
                      </div>

                      {/* Topic Pill */}
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-[14px]">pending</span>
                          Current: {prog.current_topic || 'System Architecture & Implementation'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recommended Jobs Matrix */}
              <section className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs space-y-6 border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-sm text-label-sm text-tertiary uppercase font-bold tracking-wider">Curated Matches</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Recommended Job Opportunities</h2>
                  </div>
                  <Link
                    href="/jobs"
                    className="font-label-md text-label-md text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Browse All Openings</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {jobsList.map((job) => (
                    <div
                      key={job.job_id || job.id}
                      className="p-5 rounded-xl bg-surface-container-low flex flex-col justify-between hover:shadow-md transition-all border border-outline-variant/10"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center font-bold text-primary shadow-xs">
                            {job.company_name ? job.company_name.charAt(0) : 'J'}
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                            {job.match_pct || '90% Match'}
                          </span>
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold leading-snug line-clamp-1">
                          {job.job_title}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
                          {job.company_name} • {job.location || 'Remote'}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {(job.skills || ['React', 'TypeScript']).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-3 flex items-center justify-between border-t border-outline-variant/10">
                        <div>
                          <span className="block text-[10px] font-label-sm text-on-surface-variant uppercase font-semibold">Compensation</span>
                          <span className="font-label-lg text-label-lg font-bold text-on-surface">
                            {job.compensation || '₹12 - 16 LPA'}
                          </span>
                        </div>
                        <Link
                          href={`/jobs/${job.job_id || job.id || ''}`}
                          className="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-xs hover:bg-primary transition-colors"
                        >
                          Apply
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              
              {/* Upcoming Interviews Card */}
              <section className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs space-y-5 border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping" />
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Upcoming Interviews</h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-semibold">
                    {upcomingInterviews.length} Scheduled
                  </span>
                </div>

                <div className="space-y-3.5">
                  {upcomingInterviews.map((interview) => (
                    <div
                      key={interview.interview_id || interview.id}
                      className="p-4 rounded-xl bg-surface-container-low space-y-3 border border-outline-variant/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-primary font-bold flex items-center justify-center shadow-xs">
                          {interview.company_name ? interview.company_name.charAt(0) : 'I'}
                        </div>
                        <div>
                          <h3 className="font-label-lg text-label-lg text-on-surface font-bold">
                            {interview.company_name || 'Hiring Partner'}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm">
                            {interview.round || interview.interview_mode || 'Technical Interview'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
                          <span className="material-symbols-outlined text-[18px] text-tertiary">calendar_today</span>
                          <span>{interview.date || interview.interview_date || 'Date Scheduled'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
                          <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                          <span>{interview.time || '11:00 AM IST (Online)'}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <a
                          href={interview.link || 'https://meet.google.com'}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">video_call</span>
                          <span>Join Meeting</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Mentorship & Upskilling CTA Banner */}
              <section className="p-6 rounded-2xl bg-gradient-to-br from-primary via-[#6c3ce9] to-primary-container text-on-primary shadow-md relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-white font-label-sm text-label-sm font-semibold backdrop-blur-md">
                    1-on-1 Mentorship
                  </span>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-white leading-tight">
                    Mock Interview with Senior Staff Engineer
                  </h3>
                  <p className="font-body-sm text-body-sm text-primary-fixed-dim">
                    Refine your React architecture pitch and data structure algorithms. Book your complimentary 30-min prep session.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/interviews"
                      className="w-full py-2.5 px-4 rounded-xl bg-surface-container-lowest text-primary font-label-lg text-label-lg font-bold shadow-xs hover:bg-surface-container-low transition-colors block text-center"
                    >
                      Schedule Practice Session
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* 4. RECENT APPLICATION ACTIVITY TABLE (Stitch Design 2) */}
          <section className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs space-y-4 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">Tracking Pipeline</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Recent Application Activity</h2>
              </div>
              <Link
                href="/applications"
                className="font-label-md text-label-md text-primary font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>View All Applications</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-label-sm text-on-surface-variant uppercase font-semibold">
                    <th className="py-3 px-4">Role Title</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Submission Date</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-body-sm text-on-surface">
                  {recentApplications.map((app) => (
                    <tr key={app.application_id || app.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-on-surface">
                        {app.job_title || 'Position Applied'}
                      </td>
                      <td className="py-3.5 px-4 text-secondary">
                        {app.company_name || 'Hiring Partner'}
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant">
                        {app.date || (app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent')}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status || 'Applied'} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href="/applications"
                          className="font-label-md text-label-md text-primary font-semibold hover:underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
