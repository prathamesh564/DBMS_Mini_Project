export default function StatusBadge({ status }) {
  if (!status) return <span className="badge badge-gray">—</span>;
  
  const s = String(status).toLowerCase();
  
  let color = 'badge-gray';
  if (['active', 'open', 'completed', 'accepted', 'expert'].includes(s)) {
    color = 'badge-green';
  } else if (['interviewing', 'shortlisted', 'in progress', 'advanced', 'probation'].includes(s)) {
    color = 'badge-blue';
  } else if (['applied', 'scheduled', 'upcoming', 'intermediate'].includes(s)) {
    color = 'badge-yellow';
  } else if (['reviewed', 'beginner', 'contract'].includes(s)) {
    color = 'badge-purple';
  } else if (['rejected', 'cancelled', 'dropped', 'terminated', 'closed'].includes(s)) {
    color = 'badge-red';
  }

  return <span className={`badge ${color}`}>{status}</span>;
}
