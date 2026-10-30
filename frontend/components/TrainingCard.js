'use client';

import StatusBadge from './StatusBadge';

export default function TrainingCard({
  program,
  onSelect,
  isEnrolled = false,
  progress = 0,
}) {
  if (!program) return null;

  const title = program.program_name || program.programName || 'Training Program';
  const provider = program.provider_name || program.providerName || 'Certified Education Partner';
  const duration = program.duration_weeks || program.durationWeeks || 8;
  const fee = program.course_fee !== undefined ? (Number(program.course_fee) === 0 ? '$0 Tuition' : `₹${program.course_fee}`) : '$0 Tuition (Grant)';
  const description = program.description || 'Comprehensive industry curriculum designed with top employer engineering teams.';
  const category = program.category || 'Technology';
  const skills = program.skills || ['Web Dev', 'Full Stack', 'Cloud'];

  // Icons based on category or default
  let iconName = 'school';
  if (category.toLowerCase().includes('data')) iconName = 'analytics';
  else if (category.toLowerCase().includes('design') || category.toLowerCase().includes('ui')) iconName = 'draw';
  else if (category.toLowerCase().includes('cloud')) iconName = 'cloud';
  else if (category.toLowerCase().includes('dev') || category.toLowerCase().includes('software')) iconName = 'code_blocks';

  return (
    <div className="rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group border border-outline-variant/15">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-label-sm font-semibold">
            Scholarship Sponsored
          </span>
          <span className="text-label-md font-label-md text-on-surface-variant flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            {duration} Weeks
          </span>
        </div>

        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-2xl">{iconName}</span>
        </div>

        <h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors font-semibold line-clamp-2">
          {title}
        </h3>

        <p className="text-body-sm font-body-sm text-on-surface-variant mt-2 line-clamp-2">
          {description}
        </p>

        <div className="mt-5 pt-3 flex flex-wrap gap-1.5 text-label-sm font-label-sm">
          {skills.slice(0, 3).map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-md bg-surface-container text-on-surface-variant"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="p-6 pt-0">
        <div className="flex items-center justify-between py-3 mb-2 border-t border-outline-variant/10">
          <div className="text-label-sm font-label-sm text-on-surface-variant">
            Provider: <span className="font-semibold text-on-surface">{provider}</span>
          </div>
          <span className="text-label-lg font-label-lg font-bold text-tertiary">{fee}</span>
        </div>

        {isEnrolled ? (
          <div className="space-y-2">
            <div className="flex justify-between text-label-sm font-label-sm">
              <span className="text-on-surface-variant">Training Progress</span>
              <span className="font-semibold text-primary">{progress || 35}%</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${progress || 35}%` }}
              />
            </div>
            <button
              onClick={() => onSelect && onSelect(program)}
              className="w-full mt-2 py-2.5 rounded-xl bg-surface-container text-primary font-label-lg text-label-lg hover:bg-surface-container-high transition-colors font-semibold flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              <span>Resume Program</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onSelect && onSelect(program)}
            className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all font-semibold shadow-xs flex items-center justify-center gap-2"
          >
            <span>View Details & Enroll</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
}
