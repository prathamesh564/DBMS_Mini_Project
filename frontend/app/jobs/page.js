'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, getStoredUser } from '../../services/api';
import JobCard from '../../components/JobCard';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Employer Create Job Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    jobTitle: '',
    jobDescription: '',
    location: 'Remote',
    jobType: 'Full-time',
    salaryRange: '$75,000 - $90,000 / yr',
    skillsRequired: 'React, TypeScript, Tailwind',
  });

  useEffect(() => {
    setUser(getStoredUser());

    async function loadJobsAndApplications() {
      setLoading(true);
      try {
        const [jobsRes, appsRes] = await Promise.allSettled([
          api.jobs.list(),
          api.applications.getMyApplications(),
        ]);

        if (appsRes.status === 'fulfilled' && appsRes.value?.data) {
          const applied = new Set(appsRes.value.data.map((a) => a.job_id || a.jobId));
          setAppliedJobIds(applied);
        }

        if (jobsRes.status === 'fulfilled' && jobsRes.value?.data?.length > 0) {
          setJobs(jobsRes.value.data);
          setFilteredJobs(jobsRes.value.data);
        } else {
          // Curated default opportunities
          const defaultJobs = [
            {
              job_id: '1',
              job_title: 'Associate Frontend Engineer',
              company_name: 'Starlight Software Inc.',
              location: 'Remote • US/Canada',
              job_type: 'Full-time',
              salary_range: '$78,000 - $88,000 / yr',
              job_description: 'Building accessible, high-performance web components using modern React, TypeScript, and Tailwind CSS.',
              skills_required: ['React', 'TypeScript', 'Tailwind'],
              is_remote: true,
              created_at: new Date().toISOString(),
            },
            {
              job_id: '2',
              job_title: 'Junior Data Analyst',
              company_name: 'Nexus Financial Group',
              location: 'Hybrid • New York, NY',
              job_type: 'Full-time',
              salary_range: '$70,000 - $82,000 / yr',
              job_description: 'Formulate predictive BI models and SQL data pipelines for retail financial services.',
              skills_required: ['SQL', 'Python', 'PowerBI'],
              is_remote: false,
              created_at: new Date().toISOString(),
            },
            {
              job_id: '3',
              job_title: 'Associate Product Designer (UI/UX)',
              company_name: 'Vanguard Health Tech',
              location: 'Remote • Global',
              job_type: 'Full-time',
              salary_range: '$85,000 - $95,000 / yr',
              job_description: 'Advancing digital healthcare product ergonomics, patient portals, and comprehensive design tokens.',
              skills_required: ['Figma', 'WCAG', 'Design Systems'],
              is_remote: true,
              created_at: new Date().toISOString(),
            },
            {
              job_id: '4',
              job_title: 'Junior Growth Specialist',
              company_name: 'OmniRetail E-Commerce',
              location: 'Hybrid • Austin, TX',
              job_type: 'Full-time',
              salary_range: '$65,000 - $75,000 / yr',
              job_description: 'Coordinating user engagement funnels, content attribution, and multivariable conversion tracking.',
              skills_required: ['Analytics', 'Growth', 'Automation'],
              is_remote: false,
              created_at: new Date().toISOString(),
            },
            {
              job_id: '5',
              job_title: 'Cloud DevOps Associate',
              company_name: 'CloudBridge Labs',
              location: 'Remote • San Francisco, CA',
              job_type: 'Full-time',
              salary_range: '$90,000 - $105,000 / yr',
              job_description: 'Assist in maintaining containerized Kubernetes clusters, CI/CD automated deployments, and AWS cloud security.',
              skills_required: ['AWS', 'Docker', 'Kubernetes', 'Linux'],
              is_remote: true,
              created_at: new Date().toISOString(),
            },
          ];
          setJobs(defaultJobs);
          setFilteredJobs(defaultJobs);
        }
      } catch (err) {
        console.error('Error loading jobs:', err);
      } finally {
        setLoading(false);
      }
    }

    loadJobsAndApplications();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...jobs];
    const q = searchQuery.toLowerCase().trim();

    if (q) {
      result = result.filter(
        (j) =>
          (j.job_title && j.job_title.toLowerCase().includes(q)) ||
          (j.company_name && j.company_name.toLowerCase().includes(q)) ||
          (j.skills_required && Array.isArray(j.skills_required) && j.skills_required.some((s) => s.toLowerCase().includes(q)))
      );
    }

    if (jobTypeFilter !== 'all') {
      result = result.filter((j) => (j.job_type || '').toLowerCase() === jobTypeFilter.toLowerCase());
    }

    if (locationFilter !== 'all') {
      if (locationFilter === 'remote') {
        result = result.filter((j) => j.is_remote || (j.location && j.location.toLowerCase().includes('remote')));
      } else if (locationFilter === 'hybrid') {
        result = result.filter((j) => j.location && j.location.toLowerCase().includes('hybrid'));
      }
    }

    setFilteredJobs(result);
  }, [searchQuery, jobTypeFilter, locationFilter, jobs]);

  const handleApply = async (jobId) => {
    setApplyingJobId(jobId);
    setFeedback(null);

    try {
      await api.jobs.apply(jobId);
      setAppliedJobIds((prev) => new Set([...prev, jobId]));
      setFeedback({
        type: 'success',
        text: 'Application submitted successfully! Track progress in your Applications page.',
      });
    } catch (err) {
      if (err.message && (err.message.includes('already applied') || err.message.includes('duplicate'))) {
        setAppliedJobIds((prev) => new Set([...prev, jobId]));
        setFeedback({
          type: 'info',
          text: 'You have already applied for this opening.',
        });
      } else {
        setFeedback({
          type: 'error',
          text: err.message || 'Unable to submit application. Please ensure you are logged in as a Candidate.',
        });
      }
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const skillsArray = createForm.skillsRequired
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.jobs.create({
        jobTitle: createForm.jobTitle,
        jobDescription: createForm.jobDescription,
        location: createForm.location,
        jobType: createForm.jobType,
        salaryRange: createForm.salaryRange,
        skillsRequired: skillsArray,
      });

      setShowCreateModal(false);
      setFeedback({ type: 'success', text: 'New job opportunity published successfully!' });

      // Refresh list
      const res = await api.jobs.list();
      if (res?.data) {
        setJobs(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to publish job.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full bg-surface min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-8">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-container to-[#3a0d9e] p-8 lg:p-12 text-on-primary shadow-xl border border-white/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-primary-fixed backdrop-blur-md text-label-md font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Equal Opportunity & Fair Wage Directory
              </span>
              <h1 className="font-headline-lg text-headline-lg lg:text-display-lg text-white font-bold tracking-tight">
                Verified Career Opportunities
              </h1>
              <p className="font-body-md text-body-md text-primary-fixed-dim leading-relaxed">
                Connect directly with inclusive hiring partners. Skip automated resume filters through verified technical credentials and partner fast-tracks.
              </p>
            </div>

            {(user?.role === 'employer' || user?.role === 'admin') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-xl bg-surface-container-lowest text-primary font-label-lg font-bold shadow-md hover:bg-surface-container transition-all flex items-center gap-2 self-start md:self-auto"
              >
                <span className="material-symbols-outlined text-[20px]">add_business</span>
                <span>Post New Job Vacancy</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 shadow-xs ${
              feedback.type === 'success'
                ? 'bg-tertiary-fixed text-on-tertiary-fixed font-semibold'
                : feedback.type === 'info'
                ? 'bg-primary-fixed text-primary font-semibold'
                : 'bg-error-container text-on-error-container'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">
                {feedback.type === 'success' ? 'check_circle' : feedback.type === 'info' ? 'info' : 'error'}
              </span>
              <span className="text-body-md font-body-md">{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-70">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-4 border border-outline-variant/15">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by job title, company name, or tech skill..."
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="h-11 px-4 rounded-xl bg-surface-container-low text-on-surface font-label-lg text-label-lg focus:outline-none border border-outline-variant/30 cursor-pointer"
              >
                <option value="all">All Employment Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="h-11 px-4 rounded-xl bg-surface-container-low text-on-surface font-label-lg text-label-lg focus:outline-none border border-outline-variant/30 cursor-pointer"
              >
                <option value="all">All Work Modes</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
              </select>

              {(searchQuery || jobTypeFilter !== 'all' || locationFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setJobTypeFilter('all');
                    setLocationFilter('all');
                  }}
                  className="h-11 px-4 rounded-xl bg-surface-container text-on-surface-variant font-label-lg font-medium hover:text-on-surface transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10 text-label-md text-on-surface-variant">
            <span>Showing {filteredJobs.length} opportunities</span>
            <span className="text-tertiary font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Equal Pay Guarantee
            </span>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const jId = job.job_id || job.id;
              const hasApplied = appliedJobIds.has(jId);

              return (
                <JobCard
                  key={jId}
                  job={job}
                  onApply={handleApply}
                  isApplying={applyingJobId === jId}
                  hasApplied={hasApplied}
                />
              );
            })
          ) : (
            <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/15 space-y-3">
              <span className="material-symbols-outlined text-[40px] text-on-surface-variant">work_off</span>
              <h3 className="font-headline-sm font-semibold text-on-surface">No matching jobs found</h3>
              <p className="text-body-md text-on-surface-variant">
                Try clearing your search query or adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE JOB MODAL (Employer & Admin) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-outline-variant/20 z-10">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
              <h3 className="font-headline-sm font-bold text-on-surface">Publish New Job Listing</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={createForm.jobTitle}
                  onChange={(e) => setCreateForm({ ...createForm, jobTitle: e.target.value })}
                  placeholder="e.g. Associate Cloud Engineer"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1">Location / Mode</label>
                  <input
                    type="text"
                    required
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    placeholder="e.g. Remote • US/Canada"
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none"
                  />
                </div>
                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1">Job Type</label>
                  <select
                    value={createForm.jobType}
                    onChange={(e) => setCreateForm({ ...createForm, jobType: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1">Salary Range</label>
                <input
                  type="text"
                  value={createForm.salaryRange}
                  onChange={(e) => setCreateForm({ ...createForm, salaryRange: e.target.value })}
                  placeholder="e.g. $75,000 - $90,000 / yr"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none"
                />
              </div>

              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={createForm.skillsRequired}
                  onChange={(e) => setCreateForm({ ...createForm, skillsRequired: e.target.value })}
                  placeholder="React, TypeScript, Next.js, PostgreSQL"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none"
                />
              </div>

              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1">Job Description</label>
                <textarea
                  rows={3}
                  required
                  value={createForm.jobDescription}
                  onChange={(e) => setCreateForm({ ...createForm, jobDescription: e.target.value })}
                  placeholder="Describe key responsibilities and team benefits..."
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
                  {isCreating ? 'Publishing...' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
