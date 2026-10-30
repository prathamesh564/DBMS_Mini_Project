'use client';

import Link from 'next/link';
import StatusBadge from './StatusBadge';

export default function JobCard({
  job,
  onApply,
  isApplying = false,
  hasApplied = false,
  applicationStatus = null,
}) {
  if (!job) return null;

  const title = job.job_title || job.jobTitle || 'Job Opportunity';
  const company = job.company_name || job.companyName || job.employer_name || 'Partner Company';
  const location = job.location || (job.is_remote ? 'Remote' : 'Hybrid');
  const jobType = job.job_type || job.jobType || 'Full-time';
  const salary = job.salary_range || job.salaryRange || (job.salary ? `₹${Number(job.salary).toLocaleString()} / yr` : 'Competitive');
  const description = job.job_description || job.jobDescription || '';
  const jobId = job.job_id || job.id;

  // Company avatar initial
  const initial = company ? company.charAt(0).toUpperCase() : 'J';

  return (
    <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 border border-outline-variant/15 group">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center font-bold text-headline-sm shrink-0 shadow-xs">
          {initial}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href={`/jobs/${jobId}`}
              className="text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors font-semibold"
            >
              {title}
            </Link>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-label-sm font-label-sm font-medium">
              {location} • {jobType}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-label-sm font-semibold">
              Verified Hiring Partner
            </span>
            {hasApplied && (
              <StatusBadge status={applicationStatus || 'Applied'} />
            )}
          </div>

          <div className="flex items-center gap-3 text-body-sm font-body-sm text-on-surface-variant flex-wrap pt-0.5">
            <span className="font-semibold text-on-surface">{company}</span>
            <span>•</span>
            <span className="text-on-surface font-semibold text-tertiary">{salary}</span>
            {job.created_at && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">schedule</span>
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
              </>
            )}
          </div>

          {description && (
            <p className="text-body-sm font-body-sm text-on-surface-variant line-clamp-2 pt-1 max-w-2xl">
              {description}
            </p>
          )}

          {job.skills_required && Array.isArray(job.skills_required) && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {job.skills_required.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-label-sm font-label-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
        <Link
          href={`/jobs/${jobId}`}
          className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high transition-colors font-medium"
        >
          Details
        </Link>
        {hasApplied ? (
          <button
            disabled
            className="px-5 py-2.5 rounded-xl bg-surface-container text-secondary font-label-lg text-label-lg cursor-not-allowed opacity-80"
          >
            Applied
          </button>
        ) : onApply ? (
          <button
            onClick={() => onApply(jobId)}
            disabled={isApplying}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container shadow-sm hover:shadow transition-all font-semibold flex items-center gap-1.5 disabled:opacity-60"
          >
            {isApplying ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                Applying...
              </>
            ) : (
              <>
                <span>Apply Now</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        ) : (
          <Link
            href={`/jobs/${jobId}`}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container shadow-sm hover:shadow transition-all font-semibold flex items-center gap-1.5"
          >
            <span>Apply Now</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        )}
      </div>
    </div>
  );
}
