'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../services/api';
import TrainingCard from '../components/TrainingCard';
import JobCard from '../components/JobCard';

export default function HomePage() {
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remoteFilter, setRemoteFilter] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch real data from backend APIs
        const [programsRes, jobsRes] = await Promise.allSettled([
          api.training.listPrograms(),
          api.jobs.list(),
        ]);

        if (programsRes.status === 'fulfilled' && programsRes.value?.data?.length > 0) {
          setTrainingPrograms(programsRes.value.data.slice(0, 4));
        } else {
          // Fallback to high-fidelity Stitch Design 1 curated tracks
          setTrainingPrograms([
            {
              id: 'cs-1',
              program_name: 'Full Stack Web Dev',
              provider_name: 'TechEquity Labs',
              duration_weeks: 16,
              category: 'Software Dev',
              course_fee: 0,
              description: 'Master modern React, Node.js, Next.js, and cloud database architecture with live code reviews.',
              skills: ['React', 'TypeScript', 'PostgreSQL'],
            },
            {
              id: 'cs-2',
              program_name: 'Data Analytics & SQL',
              provider_name: 'DataFuture Alliance',
              duration_weeks: 12,
              category: 'Data Science',
              course_fee: 0,
              description: 'Extract insights using SQL, Python (Pandas), and Tableau to solve real corporate business problems.',
              skills: ['SQL', 'Python', 'Tableau'],
            },
            {
              id: 'cs-3',
              program_name: 'Digital Marketing & Growth',
              provider_name: 'GrowthBridge',
              duration_weeks: 8,
              category: 'Marketing',
              course_fee: 0,
              description: 'Performance marketing, analytics tracking, SEO, lifecycle automation, and customer acquisition.',
              skills: ['SEO', 'Google Ads', 'Growth'],
            },
            {
              id: 'cs-4',
              program_name: 'UI/UX Product Design',
              provider_name: 'DesignLead Academy',
              duration_weeks: 14,
              category: 'Design',
              course_fee: 0,
              description: 'Design systems, user research, wireframing, interactive prototyping in Figma, and dev handoff.',
              skills: ['Figma', 'User Research', 'Prototypes'],
            },
          ]);
        }

        if (jobsRes.status === 'fulfilled' && jobsRes.value?.data?.length > 0) {
          setJobs(jobsRes.value.data.slice(0, 4));
        } else {
          // Fallback to high-fidelity Stitch Design 1 curated jobs
          setJobs([
            {
              job_id: 'j-1',
              job_title: 'Associate Frontend Engineer',
              company_name: 'Starlight Software Inc.',
              location: 'Remote • US/Canada',
              job_type: 'Full-time',
              salary_range: '$78,000 - $88,000 / yr',
              job_description: 'Building accessible, high-performance web components using modern React, TypeScript, and Tailwind CSS.',
              skills_required: ['React', 'TypeScript', 'Tailwind'],
              is_remote: true,
            },
            {
              job_id: 'j-2',
              job_title: 'Junior Data Analyst',
              company_name: 'Nexus Financial Group',
              location: 'Hybrid • New York, NY',
              job_type: 'Full-time',
              salary_range: '$70,000 - $82,000 / yr',
              job_description: 'Formulate predictive BI models and SQL data pipelines for retail financial services.',
              skills_required: ['SQL', 'Python', 'PowerBI'],
              is_remote: false,
            },
            {
              job_id: 'j-3',
              job_title: 'Associate Product Designer (UI/UX)',
              company_name: 'Vanguard Health Tech',
              location: 'Remote • Global',
              job_type: 'Full-time',
              salary_range: '$85,000 - $95,000 / yr',
              job_description: 'Advancing digital healthcare product ergonomics, patient portals, and comprehensive design tokens.',
              skills_required: ['Figma', 'WCAG', 'Design Systems'],
              is_remote: true,
            },
            {
              job_id: 'j-4',
              job_title: 'Junior Growth Specialist',
              company_name: 'OmniRetail E-Commerce',
              location: 'Hybrid • Austin, TX',
              job_type: 'Full-time',
              salary_range: '$65,000 - $75,000 / yr',
              job_description: 'Coordinating user engagement funnels, content attribution, and multivariable conversion tracking.',
              skills_required: ['Analytics', 'Growth', 'Automation'],
              is_remote: false,
            },
          ]);
        }
      } catch (err) {
        console.error('Error fetching homepage initial data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const displayedJobs = remoteFilter ? jobs.filter((j) => j.is_remote || (j.location && j.location.toLowerCase().includes('remote'))) : jobs;

  return (
    <div className="flex flex-col w-full bg-surface">
      {/* 1. HERO SECTION (Stitch Design 1) */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-surface-container-high/40 via-surface to-surface pb-20 pt-10 px-6 lg:px-12">
        {/* Ambient Gradient Blobs */}
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-0 w-[500px] h-[500px] rounded-full bg-tertiary-fixed/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-label-md font-label-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>National Women in Workforce Initiative • 2025 Cohorts Open</span>
              </div>

              <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight max-w-2xl">
                Empower Your Skills. <br className="hidden sm:inline" />
                <span className="text-primary">Build Your Future.</span>
              </h1>

              <p className="text-body-lg font-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                Gain in-demand tech and professional vocational skills, earn verified industry certifications, and secure vetted career opportunities with inclusive, top-tier enterprise employers across North America.
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/training"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container hover:shadow-lg transition-all font-semibold"
                >
                  <span>Explore Training Programs</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
                <Link
                  href="/jobs"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container text-primary font-label-lg text-label-lg hover:bg-primary-fixed transition-all font-semibold"
                >
                  <span className="material-symbols-outlined text-lg">work_outline</span>
                  <span>Find Jobs</span>
                </Link>
              </div>

              {/* Metrics Trust Badge */}
              <div className="pt-6 flex items-center gap-4">
                <div className="flex -space-x-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs shadow-sm ring-2 ring-surface">
                    PS
                  </div>
                  <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed font-bold text-xs shadow-sm ring-2 ring-surface">
                    AK
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold text-xs shadow-sm ring-2 ring-surface">
                    LM
                  </div>
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary-container text-on-primary text-label-md font-label-md shadow-sm ring-2 ring-surface font-bold">
                    +14k
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-tertiary">
                    <span className="material-symbols-outlined text-sm font-fill">star</span>
                    <span className="material-symbols-outlined text-sm font-fill">star</span>
                    <span className="material-symbols-outlined text-sm font-fill">star</span>
                    <span className="material-symbols-outlined text-sm font-fill">star</span>
                    <span className="material-symbols-outlined text-sm font-fill">star</span>
                    <span className="text-label-md font-label-md font-semibold text-on-surface ml-1">4.9/5</span>
                  </div>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">Over 14,000 career switchers empowered to date</p>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Composite Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-surface-container-lowest border border-outline-variant/20">
                <div className="w-full h-[400px] bg-gradient-to-tr from-primary via-[#6c3ce9] to-[#82f7d8] flex items-center justify-center p-8 text-on-primary relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/15" />
                  <div className="relative z-10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-[36px]">workspace_premium</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md font-bold text-white leading-tight">
                      Empowering Inclusive Futures
                    </h3>
                    <p className="text-body-md text-white/90 max-w-xs mx-auto">
                      Co-designed with Fortune 500 partners to bridge the gender gap in technical leadership.
                    </p>
                  </div>
                </div>

                {/* Glassmorphic floating highlight card */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-surface-container-lowest/95 backdrop-blur-md shadow-lg flex items-center justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-xl">verified</span>
                    </div>
                    <div>
                      <h4 className="text-label-lg font-label-lg text-on-surface font-semibold">Verified Career Track</h4>
                      <p className="text-body-sm font-body-sm text-on-surface-variant">Full-Stack Dev cohort placed in 90 days</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-sm font-label-sm font-bold">
                    100% Free
                  </span>
                </div>
              </div>

              {/* Decorative subtle badge */}
              <div className="absolute -top-4 -right-4 bg-surface-container-lowest p-3 rounded-2xl shadow-xl hidden sm:flex items-center gap-3 border border-outline-variant/20">
                <div className="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-xl">trending_up</span>
                </div>
                <div>
                  <p className="text-[10px] font-label-sm text-on-surface-variant uppercase font-bold tracking-wider">Avg. Salary Uplift</p>
                  <p className="text-label-lg font-label-lg font-bold text-tertiary">+64% Year 1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS RIBBON (Stitch Design 1) */}
      <section className="w-full bg-surface-container-low py-12 px-6 lg:px-12 border-y border-outline-variant/15">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Learners</span>
                <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">groups</span>
                </div>
              </div>
              <p className="text-metric-number font-metric-number text-primary">14,250+</p>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1 font-medium">Women Registered</p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Curriculum</span>
                <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">school</span>
                </div>
              </div>
              <p className="text-metric-number font-metric-number text-on-surface">120+</p>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1 font-medium">Certified Training Programs</p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Ecosystem</span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">apartment</span>
                </div>
              </div>
              <p className="text-metric-number font-metric-number text-on-surface">850+</p>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1 font-medium">Hiring Partner Companies</p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Success</span>
                <div className="w-8 h-8 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">task_alt</span>
                </div>
              </div>
              <p className="text-metric-number font-metric-number text-tertiary">88%</p>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1 font-medium">Placement Rate in 6 Months</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THREE-STEP GUIDED JOURNEY (Stitch Design 1) */}
      <section className="w-full py-20 px-6 lg:px-12 bg-surface">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center max-w-2xl mb-16">
            <span className="px-3.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-sm font-label-sm uppercase tracking-wider font-bold">
              Clear Roadmap
            </span>
            <h2 className="text-headline-lg font-headline-lg text-on-surface mt-3 font-bold">
              From Zero to Hired in Three Guided Steps
            </h2>
            <p className="text-body-md font-body-md text-on-surface-variant mt-2 leading-relaxed">
              Designed specifically for career changers, mothers returning to the workforce, and women seeking upward socio-economic mobility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {/* Step 1 */}
            <div className="relative p-8 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all border border-outline-variant/15">
              <div className="absolute -top-4 left-8 px-3 py-1 rounded-full bg-primary text-on-primary text-label-md font-label-md font-bold shadow-sm">
                01
              </div>
              <div className="mt-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl">terminal</span>
                </div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2 font-semibold">
                  Learn In-Demand Skills
                </h3>
                <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
                  Join rigorous, industry-vetted bootcamps and vocational modules. Flexible weekend or evening pacing with dedicated female engineering mentors.
                </p>
              </div>
              <div className="pt-6 mt-6 flex items-center text-primary text-label-lg font-label-lg font-semibold">
                <span>Project-based curriculum</span>
                <span className="material-symbols-outlined text-base ml-1">chevron_right</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all border border-outline-variant/15">
              <div className="absolute -top-4 left-8 px-3 py-1 rounded-full bg-primary text-on-primary text-label-md font-label-md font-bold shadow-sm">
                02
              </div>
              <div className="mt-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                </div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2 font-semibold">
                  Get Verified Credentials
                </h3>
                <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
                  Earn tamper-proof, Supabase-backed skill badges and verified certificates that corporate hiring managers instantly validate and trust.
                </p>
              </div>
              <div className="pt-6 mt-6 flex items-center text-secondary text-label-lg font-label-lg font-semibold">
                <span>Tamper-proof verifiable IDs</span>
                <span className="material-symbols-outlined text-base ml-1">chevron_right</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all border border-outline-variant/15">
              <div className="absolute -top-4 left-8 px-3 py-1 rounded-full bg-primary text-on-primary text-label-md font-label-md font-bold shadow-sm">
                03
              </div>
              <div className="mt-4">
                <div className="w-14 h-14 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl">handshake</span>
                </div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2 font-semibold">
                  Direct Placement & Hire
                </h3>
                <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
                  Skip traditional algorithmic resume black holes. Access direct interview pipelines with 850+ inclusive tech companies and diversity initiatives.
                </p>
              </div>
              <div className="pt-6 mt-6 flex items-center text-tertiary text-label-lg font-label-lg font-semibold">
                <span>Direct interview bypass</span>
                <span className="material-symbols-outlined text-base ml-1">chevron_right</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED TRAINING PROGRAMS (Stitch Design 1) */}
      <section className="w-full py-20 px-6 lg:px-12 bg-surface-container-low" id="training-programs">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-label-sm font-semibold">
                Curated Curriculum
              </span>
              <h2 className="text-headline-lg font-headline-lg text-on-surface mt-2 font-bold">
                Featured Training Programs
              </h2>
              <p className="text-body-md font-body-md text-on-surface-variant mt-1">
                Accelerated learning pathways co-designed with Fortune 500 engineering teams.
              </p>
            </div>
            <Link
              href="/training"
              className="px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-xs hover:bg-surface-container transition-all font-semibold inline-flex items-center gap-1.5 self-start md:self-auto"
            >
              <span>View All 120+ Tracks</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainingPrograms.map((program) => (
              <TrainingCard
                key={program.id || program.program_id}
                program={program}
                onSelect={() => {
                  window.location.href = `/training`;
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. LATEST JOB OPENINGS (Stitch Design 1) */}
      <section className="w-full py-20 px-6 lg:px-12 bg-surface" id="jobs-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-label-sm font-semibold">
                Inclusive Workplaces
              </span>
              <h2 className="text-headline-lg font-headline-lg text-on-surface mt-2 font-bold">
                Latest Verified Job Openings
              </h2>
              <p className="text-body-md font-body-md text-on-surface-variant mt-1">
                Direct interview fast-tracks with partners committed to pay equity and career progression.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-label-md font-label-md text-on-surface-variant">Filter:</span>
              <button
                onClick={() => setRemoteFilter(false)}
                className={`px-3 py-1.5 rounded-lg text-label-sm font-label-sm font-semibold transition-colors ${
                  !remoteFilter ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                All Roles
              </button>
              <button
                onClick={() => setRemoteFilter(true)}
                className={`px-3 py-1.5 rounded-lg text-label-sm font-label-sm font-semibold transition-colors ${
                  remoteFilter ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Remote Only
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {displayedJobs.map((job) => (
              <JobCard
                key={job.job_id || job.id}
                job={job}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container text-primary font-label-lg font-semibold hover:bg-surface-container-high transition-colors"
            >
              <span>Explore All Verified Vacancies</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. PLATFORM CTA BANNER */}
      <section className="w-full py-16 px-6 lg:px-12 bg-gradient-to-r from-primary via-primary-container to-[#3a0d9e] text-on-primary">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-primary-fixed font-label-sm font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse" />
            Applications Open for 2025 Scholarships
          </span>
          <h2 className="text-headline-lg md:text-display-lg font-bold text-white tracking-tight">
            Ready to Take the Next Step in Your Professional Career?
          </h2>
          <p className="text-body-lg text-primary-fixed-dim max-w-2xl mx-auto leading-relaxed">
            Create your account today to access 100% scholarship-covered training programs, skill verification certificates, and direct interview pipelines.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-surface-container-lowest text-primary font-label-lg font-bold shadow-lg hover:bg-surface-container-low transition-all"
            >
              Join EmpowerHer Now
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-white/15 text-on-primary font-label-lg font-semibold hover:bg-white/25 transition-all backdrop-blur-sm"
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/20 py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">spa</span>
              </div>
              <span className="font-headline-sm font-bold text-primary">EmpowerHer</span>
            </div>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              National Women Skill Development & Employment Initiative. Advancing equal opportunity through verified vocational training.
            </p>
          </div>

          <div>
            <h4 className="font-label-lg font-bold text-on-surface mb-3">Skill Programs</h4>
            <ul className="space-y-2 text-body-sm text-on-surface-variant">
              <li><Link href="/training" className="hover:text-primary transition-colors">Full-Stack Development</Link></li>
              <li><Link href="/training" className="hover:text-primary transition-colors">Data Science & SQL</Link></li>
              <li><Link href="/training" className="hover:text-primary transition-colors">Cloud & DevOps</Link></li>
              <li><Link href="/training" className="hover:text-primary transition-colors">UI/UX Product Design</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-lg font-bold text-on-surface mb-3">Employment</h4>
            <ul className="space-y-2 text-body-sm text-on-surface-variant">
              <li><Link href="/jobs" className="hover:text-primary transition-colors">Browse Job Openings</Link></li>
              <li><Link href="/applications" className="hover:text-primary transition-colors">Application Tracking</Link></li>
              <li><Link href="/interviews" className="hover:text-primary transition-colors">Interview Schedules</Link></li>
              <li><Link href="/certifications" className="hover:text-primary transition-colors">Verified Credentials</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-lg font-bold text-on-surface mb-3">Security & Compliance</h4>
            <ul className="space-y-2 text-body-sm text-on-surface-variant">
              <li className="flex items-center gap-1.5 text-tertiary font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>PostgreSQL RLS Protected</span>
              </li>
              <li className="text-on-surface-variant">Role-Based Access Control</li>
              <li className="text-on-surface-variant">Supabase Auth Verified</li>
              <li className="text-on-surface-variant">Equal Opportunity Certified</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-outline-variant/15 flex flex-col sm:flex-row items-center justify-between text-body-sm text-on-surface-variant gap-4">
          <p>© 2025 EmpowerHer Portal. Built for DBMS Mini Project demonstration.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/" className="hover:text-primary">Terms of Service</Link>
            <Link href="/admin" className="hover:text-primary">Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
