export default function StatusBadge({ status, type = 'general', className = '' }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase();

  // Color mapping based on Stitch tokens
  let styleClasses = 'bg-surface-container text-on-surface-variant';

  if (['completed', 'accepted', 'active', 'verified', 'offered'].includes(normalized)) {
    styleClasses = 'bg-tertiary-fixed text-on-tertiary-fixed font-semibold';
  } else if (['in progress', 'interviewing', 'scheduled'].includes(normalized)) {
    styleClasses = 'bg-primary-fixed text-primary font-semibold';
  } else if (['shortlisted', 'reviewed'].includes(normalized)) {
    styleClasses = 'bg-secondary-fixed text-on-secondary-fixed font-semibold';
  } else if (['applied', 'enrolled'].includes(normalized)) {
    styleClasses = 'bg-surface-container text-primary font-medium';
  } else if (['rejected', 'cancelled', 'dropped', 'terminated'].includes(normalized)) {
    styleClasses = 'bg-error-container text-on-error-container font-semibold';
  } else if (normalized.includes('scholarship') || normalized.includes('free') || normalized.includes('grant')) {
    styleClasses = 'bg-tertiary-fixed text-on-tertiary-fixed font-bold';
  } else if (normalized.includes('fast-track') || normalized.includes('exclusive')) {
    styleClasses = 'bg-primary-fixed text-primary font-bold';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm tracking-wide ${styleClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
