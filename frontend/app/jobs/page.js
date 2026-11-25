'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, getStoredUser } from '../../services/api';
import JobCard from '../../components/JobCard';
import Sidebar from '../../components/Sidebar';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Admin Create Job Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    location: 'Remote',
    employmentType: 'Full-time',
    salary: '₹8,00,000 - ₹12,00,000 / yr',
    deadline: '',
    status: 'Open',
  });

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    async function loadJobsAndApplications() {
      setLoading(true);
      try {
        const promises = [api.jobs.list()];
        if (currentUser) {
          promises.push(api.applications.getMyApplications());
        }
        const results = await Promise.allSettled(promises);
        const jobsRes = results[0];
        const appsRes = results[1];

        if (appsRes && appsRes.status === 'fulfilled' && appsRes.value?.data) {
          const rawApps = Array.isArray(appsRes.value.data) ? appsRes.value.data : (appsRes.value.data.applications || []);
          const applied = new Set(rawApps.map((a) => a.job_id || a.jobId));
          setAppliedJobIds(applied);
        }

        const rawJobs = jobsRes.status === 'fulfilled'
          ? (Array.isArray(jobsRes.value?.data) ? jobsRes.value.data : (jobsRes.value?.data?.jobs || []))
          : [];

        if (rawJobs.length > 0) {
          setJobs(rawJobs);
          setFilteredJobs(rawJobs);
        } else {
          // Curated default opportunities
          const defaultJobs = [
            {
              job_id: 1,
              job_title: 'Associate Frontend Engineer',
              company_name: 'Starlight Software Inc.',
              location: 'Remote • India/Global',
              job_type: 'Full-time',
              salary: '₹8,50,000 - ₹11,00,000 / yr',
              job_description: 'Building accessible, high-performance web components using modern React, TypeScript, and Tailwind CSS.',
              skills_required: ['React', 'TypeScript', 'Tailwind', 'PostgreSQL'],
              is_remote: true,
              created_at: new Date().toISOString(),
            },
            {
              job_id: 2,
              job_title: 'Junior Data Analyst',
              company_name: 'Nexus Financial Group',
              location: 'Hybrid • Bengaluru, India',
              job_type: 'Full-time',
              salary: '₹7,50,000 - ₹9,50,000 / yr',
              job_description: 'Formulate predictive BI models and SQL data pipelines for retail financial services.',
              skills_required: ['SQL', 'Python', 'PowerBI'],
              is_remote: false,
              created_at: new Date().toISOString(),
            },
            {
              job_id: 3,
              job_title: 'Cloud DevOps Associate',
              company_name: 'CloudBridge Labs',
              location: 'Remote • Global',
              job_type: 'Full-time',
              salary: '₹9,50,000 - ₹13,00,000 / yr',
              job_description: 'Assist in maintaining containerized Kubernetes clusters, CI/CD automated deployments, and AWS cloud security.',
              skills_required: ['AWS', 'Docker', 'Kubernetes', 'Linux'],
              is_remote: true,
              created_at: new Date().toISOString(),
            },
            {
              job_id: 4,
              job_title: 'Associate Product Designer (UI/UX)',
              company_name: 'Vanguard Health Tech',
              location: 'Remote • Global',
              job_type: 'Full-time',
              salary: '₹8,00,000 - ₹10,50,000 / yr',
              job_description: 'Advancing digital healthcare product ergonomics, patient portals, and comprehensive design tokens.',
              skills_required: ['Figma', 'WCAG', 'Design Systems'],
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
          (j.location && j.location.toLowerCase().includes(q)) ||
          (j.skills_required && Array.isArray(j.skills_required) && j.skills_required.some((s) => s.toLowerCase().includes(q)))
      );
    }

    if (jobTypeFilter !== 'all') {
      result = result.filter((j) => (j.job_type || j.employment_type || '').toLowerCase() === jobTypeFilter.toLowerCase());
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

  const handleOpenApplyModal = (job) => {
    setSelectedJobForApply(job);
    setCoverNote('I am excited to submit my candidacy for this position through the EmpowerHer skill portal. My verified skills and project achievements make me a strong candidate for this role.');
  };

  const handleConfirmApply = async () => {
    if (!selectedJobForApply) return;
    const jId = selectedJobForApply.job_id || selectedJobForApply.id;
    setApplyingJobId(jId);
    setFeedback(null);

    try {
      await api.jobs.apply(jId, coverNote);
      setAppliedJobIds((prev) => new Set([...prev, jId]));
      setSelectedJobForApply(null);
      setFeedback({
        type: 'success',
        text: `Application submitted successfully for ${selectedJobForApply.job_title}! Track your progress in Applications.`,
      });
    } catch (err) {
      if (err.message && (err.message.includes('already applied') || err.message.includes('duplicate'))) {
        setAppliedJobIds((prev) => new Set([...prev, jId]));
        setSelectedJobForApply(null);
        setFeedback({
          type: 'info',
          text: 'You have already submitted an application for this vacancy.',
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
      const res = await api.jobs.create({
        companyName: createForm.companyName,
        jobTitle: createForm.jobTitle,
        jobDescription: createForm.jobDescription,
        location: createForm.location,
        salary: createForm.salary,
        employmentType: createForm.employmentType,
        deadline: createForm.deadline || null,
        status: 'Open',
      });

      setShowCreateModal(false);
      setFeedback({ type: 'success', text: 'New job vacancy published successfully!' });

      // Reset form
      setCreateForm({
        companyName: '',
        jobTitle: '',
        jobDescription: '',
        location: 'Remote',
        employmentType: 'Full-time',
        salary: '₹8,00,000 - ₹12,00,000 / yr',
        deadline: '',
        status: 'Open',
      });

      // Immediately prepend newly created job to state so it appears without delay
      if (res?.data) {
        setJobs((prev) => [res.data, ...prev.filter((j) => (j.job_id || j.id) !== (res.data.job_id || res.data.id))]);
      }

      // Re-fetch jobs from backend to ensure persistent database synchronization
      const listRes = await api.jobs.list();
      const rawJobs = Array.isArray(listRes?.data) ? listRes.data : (listRes?.data?.jobs || []);
      if (rawJobs.length > 0) {
        setJobs(rawJobs);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to publish job.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to remove this job posting?')) return;
    try {
      const res = await api.jobs.delete(jobId);
      if (res?.action === 'closed') {
        setJobs((prev) =>
          prev.map((j) => ((j.job_id || j.id) === jobId ? { ...j, status: 'Closed' } : j))
        );
        setFeedback({
          type: 'info',
          text: res.message || 'Job has active applicant records; its status was updated to Closed.',
        });
      } else {
        setJobs((prev) => prev.filter((j) => (j.job_id || j.id) !== jobId));
        setFeedback({ type: 'success', text: res?.message || 'Job posting deleted.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete job.' });
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
          <span className="font-headline-sm text-primary font-bold">Career Opportunities</span>
        </div>

        <div className="w-full bg-surface min-h-screen">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-8">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-container to-[#3a0d9e] p-8 lg:p-12 text-on-primary shadow-xl border border-white/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-primary-fixed backdrop-blur-md text-label-md font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Equal Opportunity & Verified Fair Wage Directory
              </span>
              <h1 className="font-headline-lg text-headline-lg lg:text-display-lg text-white font-bold tracking-tight">
                Verified Career Opportunities
              </h1>
              <p className="font-body-md text-body-md text-primary-fixed-dim leading-relaxed">
                Connect directly with inclusive hiring partners. Skip automated resume filters through verified technical credentials and fast-track interviews.
              </p>
            </div>

            {user?.role === 'admin' && (
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

        {/* Feedback Alert */}
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
              Equal Pay Benchmark Guarantee
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
                <div key={jId} className="relative">
                  <JobCard
                    job={job}
                    onApply={() => handleOpenApplyModal(job)}
                    isApplying={applyingJobId === jId}
                    hasApplied={hasApplied}
                  />

                  {user?.role === 'admin' && (
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={() => handleDeleteJob(jId)}
                        title="Delete Job Posting"
                        className="p-1.5 rounded-lg bg-surface-container text-rose-600 hover:bg-rose-50 border border-outline-variant/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
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

      {/* CANDIDATE APPLY MODAL WITH COVER NOTE */}
      {selectedJobForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedJobForApply(null)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-outline-variant/20 z-10">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
              <div>
                <span className="text-[11px] font-bold text-primary uppercase">Direct Job Application</span>
                <h3 className="font-headline-sm font-bold text-on-surface">{selectedJobForApply.job_title}</h3>
                <p className="text-body-sm text-on-surface-variant">{selectedJobForApply.company_name}</p>
              </div>
              <button onClick={() => setSelectedJobForApply(null)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1">
                  Candidate Cover Note
                </label>
                <textarea
                  rows={4}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Introduce yourself, highlight relevant training programs, and share why you are interested in this position..."
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface-variant space-y-1 border border-outline-variant/10">
                <p className="font-semibold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
                  Verified Candidate Profile Attachment
                </p>
                <p>
                  Your verified education, active skill badges, and contact email will be securely forwarded directly to the hiring coordinator.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedJobForApply(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-label-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={applyingJobId != null}
                  onClick={handleConfirmApply}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-xs hover:bg-primary-container transition-colors disabled:opacity-60 flex items-center gap-1.5"
                >
                  {applyingJobId != null ? 'Submitting...' : 'Confirm Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE JOB MODAL (Admin Only) */}
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
                <label className="block text-label-md font-semibold text-on-surface mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={createForm.companyName}
                  onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
                  placeholder="e.g. Google India / Starlight Software"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none"
                />
              </div>

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
                    placeholder="e.g. Remote • India"
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none"
                  />
                </div>
                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1">Employment Type</label>
                  <select
                    value={createForm.employmentType}
                    onChange={(e) => setCreateForm({ ...createForm, employmentType: e.target.value })}
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
                  value={createForm.salary}
                  onChange={(e) => setCreateForm({ ...createForm, salary: e.target.value })}
                  placeholder="e.g. ₹8,00,000 - ₹12,00,000 / yr"
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
                  placeholder="Describe key responsibilities, required qualifications, and company culture..."
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
      </div>
    </div>
  );
}
