'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function InterviewsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [interviews, setInterviews] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [selectedIv, setSelectedIv] = useState(null);
  const [detailModal, setDetailModal] = useState(false);

  // Update interview modal (for employer / admin)
  const [updateModal, setUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    interviewDate: '',
    interviewMode: 'Online',
    interviewStatus: 'Scheduled',
    locationOrLink: '',
    notes: '',
    feedback: '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (!user) return;
    fetchInterviews();
  }, [user, loading]);

  const fetchInterviews = async () => {
    setFetching(true);
    try {
      const res = await api.get('/interviews/me');
      if (res.data.success) {
        setInterviews(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const openDetail = async (iv) => {
    try {
      const res = await api.get(`/interviews/${iv.interview_id}`);
      if (res.data.success) setSelectedIv(res.data.data);
      else setSelectedIv(iv);
    } catch {
      setSelectedIv(iv);
    }
    setDetailModal(true);
  };

  const openUpdate = (iv) => {
    setSelectedIv(iv);
    setUpdateForm({
      interviewDate: iv.interview_date ? new Date(iv.interview_date).toISOString().slice(0, 16) : '',
      interviewMode: iv.interview_mode || 'Online',
      interviewStatus: iv.interview_status || 'Scheduled',
      locationOrLink: iv.location_or_link || '',
      notes: iv.notes || '',
      feedback: iv.feedback || '',
    });
    setUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedIv) return;
    setUpdating(true);

    try {
      const payload = {
        interviewMode: updateForm.interviewMode,
        interviewStatus: updateForm.interviewStatus,
        locationOrLink: updateForm.locationOrLink || undefined,
        notes: updateForm.notes || undefined,
        feedback: updateForm.feedback || undefined,
      };

      if (updateForm.interviewDate) {
        payload.interviewDate = updateForm.interviewDate;
      }

      const res = await api.patch(`/interviews/${selectedIv.interview_id}`, payload);
      if (res.data.success) {
        alert('Interview updated successfully!');
        setUpdateModal(false);
        setDetailModal(false);
        fetchInterviews();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update interview.');
    } finally {
      setUpdating(false);
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
    <AppShell title="Interviews">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scheduled Interviews</h1>
          <p className="page-subtitle">Video conferences, telephone screens, and on-site assessments</p>
        </div>
      </div>

      {fetching ? (
        <div className="loading-center">
          <div className="spinner spinner-lg"></div>
        </div>
      ) : interviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗓️</div>
          <div className="empty-state-title">No interviews scheduled</div>
          <p className="text-secondary">
            {user.role === 'woman'
              ? 'When an employer shortlists your job application and schedules an interview, it will appear here.'
              : 'Schedule candidate interviews from the Jobs or Applications pages.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                {user.role === 'woman' ? <th>Company</th> : <th>Candidate</th>}
                <th>Date &amp; Time</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Location / Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((iv) => (
                <tr key={iv.interview_id}>
                  <td><strong>{iv.job_title}</strong></td>
                  {user.role === 'woman' ? (
                    <td>{iv.company_name}</td>
                  ) : (
                    <td>
                      <div><strong>{iv.candidate_name}</strong></div>
                      <div className="text-secondary text-xs">{iv.candidate_email}</div>
                    </td>
                  )}
                  <td>
                    {iv.interview_date
                      ? new Date(iv.interview_date).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </td>
                  <td><span className="badge badge-purple">{iv.interview_mode}</span></td>
                  <td><StatusBadge status={iv.interview_status} /></td>
                  <td>
                    {iv.location_or_link ? (
                      iv.location_or_link.startsWith('http') ? (
                        <a href={iv.location_or_link} target="_blank" rel="noreferrer" className="text-sm">
                          Join Meeting 🔗
                        </a>
                      ) : (
                        <span className="text-sm">{iv.location_or_link}</span>
                      )
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div className="flex gap-sm">
                      <button className="btn btn-sm btn-secondary" onClick={() => openDetail(iv)}>
                        Details
                      </button>
                      {(user.role === 'employer' || user.role === 'admin') && (
                        <button className="btn btn-sm btn-primary" onClick={() => openUpdate(iv)}>
                          Update
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Interview Details Modal */}
      <Modal
        open={detailModal}
        onClose={() => setDetailModal(false)}
        title={`Interview: ${selectedIv?.job_title}`}
        footer={
          <div className="flex gap-sm">
            {(user.role === 'employer' || user.role === 'admin') && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setDetailModal(false);
                  openUpdate(selectedIv);
                }}
              >
                Update Status / Feedback
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => setDetailModal(false)}>
              Close
            </button>
          </div>
        }
      >
        {selectedIv && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="text-secondary text-sm">Job Position</span>
                <p className="font-semibold">{selectedIv.job_title}</p>
              </div>
              <div>
                <span className="text-secondary text-sm">Scheduled Date &amp; Time</span>
                <p className="font-semibold">
                  {selectedIv.interview_date ? new Date(selectedIv.interview_date).toLocaleString() : '—'}
                </p>
              </div>
              <div>
                <span className="text-secondary text-sm">Mode</span>
                <p className="font-semibold">{selectedIv.interview_mode}</p>
              </div>
              <div>
                <span className="text-secondary text-sm">Status</span>
                <p><StatusBadge status={selectedIv.interview_status} /></p>
              </div>
            </div>

            <div className="card mb-3" style={{ background: 'var(--bg-subtle)' }}>
              <span className="text-secondary text-sm font-semibold">Meeting URL / Location</span>
              <p className="mt-1">
                {selectedIv.location_or_link ? (
                  selectedIv.location_or_link.startsWith('http') ? (
                    <a href={selectedIv.location_or_link} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">
                      🔗 Launch Video Meeting
                    </a>
                  ) : (
                    selectedIv.location_or_link
                  )
                ) : (
                  'No location specified.'
                )}
              </p>
            </div>

            {selectedIv.notes && (
              <div className="card mb-3">
                <span className="text-secondary text-sm font-semibold">Preparation Notes</span>
                <p className="text-secondary mt-1">{selectedIv.notes}</p>
              </div>
            )}

            {selectedIv.feedback && (
              <div className="card mb-3">
                <span className="text-secondary text-sm font-semibold">Interviewer Feedback</span>
                <p className="text-secondary mt-1">{selectedIv.feedback}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Update Interview Modal (employer / admin) */}
      <Modal
        open={updateModal}
        onClose={() => setUpdateModal(false)}
        title="Update Interview Status &amp; Feedback"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setUpdateModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={updating} onClick={handleUpdate}>
              {updating ? 'Saving...' : 'Save Updates'}
            </button>
          </>
        }
      >
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Interview Status *</label>
            <select
              className="form-select"
              value={updateForm.interviewStatus}
              onChange={(e) => setUpdateForm({ ...updateForm, interviewStatus: e.target.value })}
              required
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Interview Mode *</label>
              <select
                className="form-select"
                value={updateForm.interviewMode}
                onChange={(e) => setUpdateForm({ ...updateForm, interviewMode: e.target.value })}
                required
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Telephone">Telephone</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date &amp; Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={updateForm.interviewDate}
                onChange={(e) => setUpdateForm({ ...updateForm, interviewDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location or Meeting Link</label>
            <input
              className="form-input"
              value={updateForm.locationOrLink}
              onChange={(e) => setUpdateForm({ ...updateForm, locationOrLink: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Interviewer Feedback &amp; Evaluation</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={updateForm.feedback}
              onChange={(e) => setUpdateForm({ ...updateForm, feedback: e.target.value })}
              placeholder="Candidate strengths, test scores, interview impression..."
            />
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
