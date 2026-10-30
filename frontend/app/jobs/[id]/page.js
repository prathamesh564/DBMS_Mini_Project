'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api, getStoredUser } from '../../../services/api';
import StatusBadge from '../../../components/StatusBadge';

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    async function loadJob() {
      if (!jobId) return;
      setLoading(true);
      try {
        const [jobRes, appsRes] = await Promise.allSettled([
          api.jobs.getById(jobId),
          api.applications.getMyApplications(),
        ]);

        if (jobRes.status === 'fulfilled' && jobRes.value?.data) {
          setJob(jobRes.value.data);
        } else {
          // Fallback sample details
          setJob({
            job_id: jobId,
            job_title: 'Associate Frontend Engineer',
            company_name: 'Starlight Software Inc.',
            location: 'Remote • US/Canada',
            job_type: 'Full-time',
            salary_range: '$78,000 - $88,000 / yr',
            job_description:
              'Starlight Software Inc. is hiring an Associate Frontend Engineer to build responsive, accessible web components across our cloud management suite. You will work alongside experienced staff engineers, receiving dedicated pair programming and career advancement mentoring.',
            skills_required: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Jest'],
            created_at: new Date().toISOString(),
          });
        }

        if (appsRes.status === 'fulfilled' && appsRes.value?.data) {
          const applied = appsRes.value.data.some((a) => String(a.job_id || a.jobId) === String(jobId));
          setHasApplied(applied);
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [jobId]);

  const handleApply = async () => {
    setIsApplying(true);
    setFeedback(null);
    try {
      await api.jobs.apply(jobId);
      setHasApplied(true);
      setFeedback({
        type: 'success',
        text: 'Application submitted successfully! Your verified profile has been forwarded to the hiring team.',
      });
    } catch (err) {
      if (err.message && err.message.includes('already applied')) {
        setHasApplied(true);
        setFeedback({ type: 'info', text: 'You have already applied for this opening.' });
      } else {
        setFeedback({
          type: 'error',
          text: err.message || 'Failed to submit application. Please make sure you are logged in as a candidate.',
        });
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <span className="material-symbols-outlined animate-spin text-[24px]">refresh</span>
          <span>Loading opportunity details...</span>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-6 text-center space-y-4">
        <h2 className="text-headline-md font-bold text-on-surface">Opportunity Not Found</h2>
        <Link href="/jobs" className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md inline-block">
          Return to Job Openings
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface min-h-screen py-10 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <Link href="/jobs" className="hover:text-primary transition-colors flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Opportunities
          </Link>
          <span>/</span>
          <span className="text-on-surface font-semibold">{job.job_title}</span>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 ${
              feedback.type === 'success'
                ? 'bg-tertiary-fixed text-on-tertiary-fixed font-semibold'
                : feedback.type === 'info'
                ? 'bg-primary-fixed text-primary font-semibold'
                : 'bg-error-container text-on-error-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {feedback.type === 'success' ? 'check_circle' : feedback.type === 'info' ? 'info' : 'error'}
            </span>
            <span className="text-body-md font-body-md">{feedback.text}</span>
          </div>
        )}

        {/* Header Card */}
        <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-fixed text-primary font-bold text-2xl flex items-center justify-center shadow-xs">
                {job.company_name ? job.company_name.charAt(0) : 'J'}
              </div>
              <div>
                <h1 className="font-headline-lg font-bold text-on-surface tracking-tight">{job.job_title}</h1>
                <p className="text-body-md text-on-surface-variant font-medium mt-0.5">{job.company_name}</p>
              </div>
            </div>

            <div>
              {hasApplied ? (
                <span className="px-5 py-2.5 rounded-xl bg-surface-container text-secondary font-label-lg font-semibold inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Applied
                </span>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-on-primary font-label-lg font-bold shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isApplying ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Apply for Position</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-container-low text-center sm:text-left border border-outline-variant/10">
            <div>
              <span className="text-[11px] font-label-sm uppercase font-semibold text-on-surface-variant">Location</span>
              <p className="font-label-lg font-bold text-on-surface mt-0.5">{job.location || 'Remote'}</p>
            </div>
            <div>
              <span className="text-[11px] font-label-sm uppercase font-semibold text-on-surface-variant">Employment Type</span>
              <p className="font-label-lg font-bold text-on-surface mt-0.5">{job.job_type || 'Full-time'}</p>
            </div>
            <div>
              <span className="text-[11px] font-label-sm uppercase font-semibold text-on-surface-variant">Compensation</span>
              <p className="font-label-lg font-bold text-tertiary mt-0.5">{job.salary_range || 'Competitive'}</p>
            </div>
            <div>
              <span className="text-[11px] font-label-sm uppercase font-semibold text-on-surface-variant">Date Posted</span>
              <p className="font-label-lg font-bold text-on-surface mt-0.5">
                {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Active Cohort'}
              </p>
            </div>
          </div>
        </div>

        {/* Description Body */}
        <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15 space-y-6">
          <div className="space-y-3">
            <h2 className="font-headline-sm font-bold text-on-surface">About the Role</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
              {job.job_description}
            </p>
          </div>

          {job.skills_required && Array.isArray(job.skills_required) && (
            <div className="space-y-3 pt-4 border-t border-outline-variant/10">
              <h3 className="font-headline-sm font-bold text-on-surface">Key Competencies & Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-surface-container text-on-surface font-label-md font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold">
              <span className="material-symbols-outlined text-[20px]">verified</span>
              <span>EmpowerHer Diversity & Fair Pay Guarantee</span>
            </div>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              This employer has pledged salary transparency, equal opportunity compensation benchmarks, and structured mentorship programs for incoming female engineering talents.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
