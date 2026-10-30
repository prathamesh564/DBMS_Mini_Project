'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Link from 'next/link';

export default function ApplicationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [apps, setApps] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailModal, setDetailModal] = useState(false);

  // Status update (for employer / admin)
  const [statusVal, setStatusVal] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Schedule Interview modal
  const [interviewModal, setInterviewModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    interviewDate: '',
    interviewMode: 'Online',
    locationOrLink: '',
    notes: '',
  });
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (!user) return;
    fetchApplications();
  }, [user, loading]);

  const fetchApplications = async () => {
    setFetching(true);
    try {
      if (user.role === 'woman') {
        const res = await api.get('/applications/me');
        if (res.data.success) {
          setApps(res.data.data || []);
        }
      } else {
        // If employer or admin, we can fetch all jobs first, then gather their applications
        const jobsRes = await api.get('/jobs', { params: { limit: 50, status: 'all' } });
        if (jobsRes.data.success && jobsRes.data.data?.jobs) {
          const allJobApps = [];
          for (const job of jobsRes.data.data.jobs) {
            try {
              const aRes = await api.get(`/jobs/${job.job_id}/applications`);
              if (aRes.data.success && aRes.data.data) {
                allJobApps.push(...aRes.data.data.map(app => ({
                  ...app,
                  job_title: job.job_title,
                  company_name: job.company_name,
                  employment_type: job.employment_type,
                  job_location: job.job_location,
                })));
              }
            } catch {}
          }
          setApps(allJobApps);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const openDetail = async (app) => {
    try {
      const res = await api.get(`/applications/${app.application_id}`);
      if (res.data.success) {
        setSelectedApp(res.data.data);
        setStatusVal(res.data.data.application_status);
      } else {
        setSelectedApp(app);
        setStatusVal(app.application_status);
      }
    } catch {
      setSelectedApp(app);
      setStatusVal(app.application_status);
    }
    setDetailModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedApp) return;
    setUpdatingStatus(true);
    try {
      await api.patch(`/applications/${selectedApp.application_id}/status`, {
        status: statusVal,
      });
      alert('Application status updated!');
      setDetailModal(false);
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setScheduling(true);
    try {
      await api.post(`/applications/${selectedApp.application_id}/interviews`, {
        interviewDate: interviewForm.interviewDate,
        interviewMode: interviewForm.interviewMode,
        locationOrLink: interviewForm.locationOrLink || undefined,
        notes: interviewForm.notes || undefined,
      });
      alert('Interview scheduled successfully!');
      setInterviewModal(false);
      setDetailModal(false);
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setScheduling(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <AppShell title="Applications">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {user.role === 'woman' ? 'My Job Applications' : 'Candidate Job Applications'}
          </h1>
          <p className="page-subtitle">
            {user.role === 'woman'
              ? 'Track review stages, interview schedules, and employer updates'
              : 'Review submitted applications, update hiring stages, and schedule interviews'}
          </p>
        </div>
        {user.role === 'woman' && (
          <Link href="/jobs" className="btn btn-primary">
            + Explore Jobs
          </Link>
        )}
      </div>

      {fetching ? (
        <div className="loading-center">
          <div className="spinner spinner-lg"></div>
        </div>
      ) : apps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No applications found</div>
          <p className="text-secondary">
            {user.role === 'woman'
              ? 'Explore open positions on the Jobs page to submit your first application.'
              : 'No candidates have submitted applications yet.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                {user.role !== 'woman' && <th>Candidate</th>}
                <th>Applied Date</th>
                <th>Application Status</th>
                <th>Interview Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.application_id}>
                  <td><strong>{a.job_title}</strong></td>
                  <td>{a.company_name}</td>
                  {user.role !== 'woman' && (
                    <td>
                      <div><strong>{a.full_name}</strong></div>
                      <div className="text-secondary text-xs">{a.woman_email}</div>
                    </td>
                  )}
                  <td>{a.application_date ? new Date(a.application_date).toLocaleDateString() : '—'}</td>
                  <td><StatusBadge status={a.application_status} /></td>
                  <td>
                    {a.interview_status ? (
                      <span className="badge badge-purple">{a.interview_status} ({a.interview_mode})</span>
                    ) : (
                      <span className="text-secondary text-xs">Not Scheduled</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => openDetail(a)}>
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Application Detail Modal */}
      <Modal
        open={detailModal}
        onClose={() => setDetailModal(false)}
        title={`Application #${selectedApp?.application_id} Details`}
        footer={
          <div className="flex gap-sm">
            {(user.role === 'employer' || user.role === 'admin') && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setInterviewForm({
                    interviewDate: '',
                    interviewMode: 'Online',
                    locationOrLink: '',
                    notes: '',
                  });
                  setInterviewModal(true);
                }}
              >
                🗓️ Schedule Interview
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => setDetailModal(false)}>
              Close
            </button>
          </div>
        }
      >
        {selectedApp && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="text-secondary text-sm">Job Title</span>
                <p className="font-semibold">{selectedApp.job_title}</p>
              </div>
              <div>
                <span className="text-secondary text-sm">Company</span>
                <p className="font-semibold">{selectedApp.company_name}</p>
              </div>
              <div>
                <span className="text-secondary text-sm">Location / Type</span>
                <p className="font-semibold">{selectedApp.job_location || 'Remote'} ({selectedApp.employment_type || 'Full-Time'})</p>
              </div>
              <div>
                <span className="text-secondary text-sm">Current Status</span>
                <p><StatusBadge status={selectedApp.application_status} /></p>
              </div>
            </div>

            {selectedApp.cover_note && (
              <div className="card mb-3" style={{ background: 'var(--bg-subtle)' }}>
                <span className="text-secondary text-sm font-semibold">Cover Note</span>
                <p className="text-secondary mt-1" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedApp.cover_note}
                </p>
              </div>
            )}

            {/* Candidate Details (for employer / admin) */}
            {user.role !== 'woman' && (
              <div className="card mb-3">
                <h4 className="font-semibold mb-2">Candidate Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <span className="text-secondary text-sm">Name</span>
                    <p className="font-semibold">{selectedApp.full_name}</p>
                  </div>
                  <div>
                    <span className="text-secondary text-sm">Email</span>
                    <p className="font-semibold">{selectedApp.woman_email}</p>
                  </div>
                  <div>
                    <span className="text-secondary text-sm">Phone</span>
                    <p className="font-semibold">{selectedApp.woman_phone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-secondary text-sm">Education</span>
                    <p className="font-semibold">{selectedApp.education_level || '—'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status changer for employer / admin */}
            {(user.role === 'employer' || user.role === 'admin') && (
              <div className="card mt-2">
                <label className="form-label">Update Application Workflow Status</label>
                <div className="flex gap-sm">
                  <select
                    className="form-select"
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <button
                    className="btn btn-primary"
                    disabled={updatingStatus}
                    onClick={handleStatusUpdate}
                  >
                    {updatingStatus ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        open={interviewModal}
        onClose={() => setInterviewModal(false)}
        title="Schedule Interview"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setInterviewModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={scheduling} onClick={handleScheduleInterview}>
              {scheduling ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </>
        }
      >
        <form onSubmit={handleScheduleInterview}>
          <div className="form-group">
            <label className="form-label">Date &amp; Time *</label>
            <input
              type="datetime-local"
              className="form-input"
              value={interviewForm.interviewDate}
              onChange={(e) => setInterviewForm({ ...interviewForm, interviewDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Interview Mode *</label>
            <select
              className="form-select"
              value={interviewForm.interviewMode}
              onChange={(e) => setInterviewForm({ ...interviewForm, interviewMode: e.target.value })}
              required
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Telephone">Telephone</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Meeting URL or Physical Location</label>
            <input
              className="form-input"
              value={interviewForm.locationOrLink}
              onChange={(e) => setInterviewForm({ ...interviewForm, locationOrLink: e.target.value })}
              placeholder="e.g. https://meet.google.com/xyz or Room 401"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes for Candidate</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={interviewForm.notes}
              onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
              placeholder="e.g. Please be prepared to discuss technical architecture..."
            />
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
