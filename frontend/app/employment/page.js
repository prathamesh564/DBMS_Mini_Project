'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function EmploymentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [records, setRecords] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailModal, setDetailModal] = useState(false);

  // Record Placement Modal (for employer / admin)
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    womanId: '',
    jobId: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    salary: '',
    employmentStatus: 'Active',
  });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  // Update Status Modal
  const [updateStatusModal, setUpdateStatusModal] = useState(false);
  const [statusVal, setStatusVal] = useState('Active');
  const [salaryVal, setSalaryVal] = useState('');
  const [updating, setUpdating] = useState(false);

  // Lists for dropdown selection
  const [womenList, setWomenList] = useState([]);
  const [jobsList, setJobsList] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (!user) return;
    loadEmploymentRecords();
  }, [user, loading]);

  const loadEmploymentRecords = async () => {
    setFetching(true);
    try {
      if (user.role === 'woman') {
        const res = await api.get('/employment/me');
        if (res.data.success) {
          setRecords(res.data.data || []);
        }
      } else {
        // If employer or admin, populate available candidates & jobs for placement
        const [wRes, jRes] = await Promise.all([
          api.get('/women', { params: { limit: 100 } }).catch(() => ({ data: { data: { women: [] } } })),
          api.get('/jobs', { params: { limit: 100, status: 'all' } }).catch(() => ({ data: { data: { jobs: [] } } })),
        ]);

        if (wRes.data?.data?.women) setWomenList(wRes.data.data.women);
        if (jRes.data?.data?.jobs) setJobsList(jRes.data.data.jobs);

        // Fetch woman employment records or direct records
        const allPlacements = [];
        for (const w of (wRes.data?.data?.women || []).slice(0, 10)) {
          try {
            // Retrieve via candidate profile if applicable
            const wp = await api.get(`/women/${w.woman_id}`);
            // Check records
          } catch {}
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const openDetail = async (rec) => {
    try {
      const res = await api.get(`/employment/${rec.employment_id}`);
      if (res.data.success) {
        setSelectedRecord(res.data.data);
      } else {
        setSelectedRecord(rec);
      }
    } catch {
      setSelectedRecord(rec);
    }
    setDetailModal(true);
  };

  const openUpdateStatus = (rec) => {
    setSelectedRecord(rec);
    setStatusVal(rec.employment_status || 'Active');
    setSalaryVal(rec.salary !== null && rec.salary !== undefined ? String(rec.salary) : '');
    setUpdateStatusModal(true);
  };

  const handleCreatePlacement = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);

    try {
      const res = await api.post('/employment', {
        womanId: parseInt(createForm.womanId, 10),
        jobId: parseInt(createForm.jobId, 10),
        joiningDate: createForm.joiningDate,
        salary: parseFloat(createForm.salary),
        employmentStatus: createForm.employmentStatus,
      });

      if (res.data.success) {
        alert('Placement verified and recorded successfully!');
        setCreateOpen(false);
        setCreateForm({
          womanId: '',
          jobId: '',
          joiningDate: new Date().toISOString().slice(0, 10),
          salary: '',
          employmentStatus: 'Active',
        });
        loadEmploymentRecords();
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to record placement.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setUpdating(true);

    try {
      const payload = {
        employmentStatus: statusVal,
      };
      if (salaryVal) {
        payload.salary = parseFloat(salaryVal);
      }

      const res = await api.patch(`/employment/${selectedRecord.employment_id}`, payload);
      if (res.data.success) {
        alert('Employment status updated successfully!');
        setUpdateStatusModal(false);
        setDetailModal(false);
        loadEmploymentRecords();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update employment status.');
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
    <AppShell title="Employment Records">
      <div className="page-header">
        <div>
          <h1 className="page-title">Verified Employment Placements</h1>
          <p className="page-subtitle">Track job contracts, joining dates, salaries, and employment history</p>
        </div>
        {(user.role === 'employer' || user.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            + Record Verified Placement
          </button>
        )}
      </div>

      {fetching ? (
        <div className="loading-center">
          <div className="spinner spinner-lg"></div>
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏢</div>
          <div className="empty-state-title">No employment records found</div>
          <p className="text-secondary">
            {user.role === 'woman'
              ? 'Once you accept a job offer and complete the interview stage, your verified placement record will appear here.'
              : 'Record a candidate placement to register hiring outcomes and career progression.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Joining Date</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.employment_id}>
                  <td><strong>{r.job_title}</strong></td>
                  <td>{r.company_name}</td>
                  <td>{r.joining_date ? new Date(r.joining_date).toLocaleDateString() : '—'}</td>
                  <td>{r.salary ? `$${Number(r.salary).toLocaleString()}` : '—'}</td>
                  <td><StatusBadge status={r.employment_status} /></td>
                  <td>
                    <div className="flex gap-sm">
                      <button className="btn btn-sm btn-secondary" onClick={() => openDetail(r)}>
                        Details
                      </button>
                      {(user.role === 'employer' || user.role === 'admin') && (
                        <button className="btn btn-sm btn-primary" onClick={() => openUpdateStatus(r)}>
                          Update Status
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

      {/* Employment Record Details Modal */}
      <Modal
        open={detailModal}
        onClose={() => setDetailModal(false)}
        title="Placement Record Details"
        footer={
          <div className="flex gap-sm">
            {(user.role === 'employer' || user.role === 'admin') && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setDetailModal(false);
                  openUpdateStatus(selectedRecord);
                }}
              >
                Change Status
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => setDetailModal(false)}>
              Close
            </button>
          </div>
        }
      >
        {selectedRecord && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="text-secondary text-sm">Designation / Job Title</span>
                <p className="font-semibold">{selectedRecord.job_title}</p>
              </div>
              <div>
                <span className="text-secondary text-sm">Hiring Company</span>
                <p className="font-semibold">{selectedRecord.company_name}</p>
              </div>
              <div>
                <span className="text-secondary text-sm">Joining Date</span>
                <p className="font-semibold">
                  {selectedRecord.joining_date ? new Date(selectedRecord.joining_date).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <span className="text-secondary text-sm">Annual Compensation</span>
                <p className="font-semibold text-primary">
                  {selectedRecord.salary ? `$${Number(selectedRecord.salary).toLocaleString()}` : '—'}
                </p>
              </div>
              <div>
                <span className="text-secondary text-sm">Employment Status</span>
                <p><StatusBadge status={selectedRecord.employment_status} /></p>
              </div>
              <div>
                <span className="text-secondary text-sm">Work Location</span>
                <p className="font-semibold">{selectedRecord.job_location || 'Remote'}</p>
              </div>
            </div>

            {selectedRecord.full_name && (
              <div className="card" style={{ background: 'var(--bg-subtle)' }}>
                <h4 className="font-semibold mb-2">Employee Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                  <div>
                    <span className="text-secondary text-sm">Candidate Name</span>
                    <p className="font-semibold">{selectedRecord.full_name}</p>
                  </div>
                  <div>
                    <span className="text-secondary text-sm">Candidate Email</span>
                    <p className="font-semibold">{selectedRecord.woman_email}</p>
                  </div>
                  <div>
                    <span className="text-secondary text-sm">Contact Phone</span>
                    <p className="font-semibold">{selectedRecord.woman_phone || '—'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Record Placement Modal (for employer / admin) */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Record Verified Placement"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={creating} onClick={handleCreatePlacement}>
              {creating ? 'Recording...' : 'Record Placement'}
            </button>
          </>
        }
      >
        {createError && <div className="alert alert-error mb-3">{createError}</div>}
        <form onSubmit={handleCreatePlacement}>
          <div className="form-group">
            <label className="form-label">Placed Candidate *</label>
            {womenList.length > 0 ? (
              <select
                className="form-select"
                value={createForm.womanId}
                onChange={(e) => setCreateForm({ ...createForm, womanId: e.target.value })}
                required
              >
                <option value="">Select Candidate...</option>
                {womenList.map((w) => (
                  <option key={w.woman_id} value={w.woman_id}>
                    {w.full_name} ({w.email})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                className="form-input"
                placeholder="Candidate ID (e.g. 1)"
                value={createForm.womanId}
                onChange={(e) => setCreateForm({ ...createForm, womanId: e.target.value })}
                required
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Job Posting *</label>
            {jobsList.length > 0 ? (
              <select
                className="form-select"
                value={createForm.jobId}
                onChange={(e) => setCreateForm({ ...createForm, jobId: e.target.value })}
                required
              >
                <option value="">Select Job Opening...</option>
                {jobsList.map((j) => (
                  <option key={j.job_id} value={j.job_id}>
                    {j.job_title} ({j.company_name})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                className="form-input"
                placeholder="Job ID (e.g. 1)"
                value={createForm.jobId}
                onChange={(e) => setCreateForm({ ...createForm, jobId: e.target.value })}
                required
              />
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Joining Date *</label>
              <input
                type="date"
                className="form-input"
                value={createForm.joiningDate}
                onChange={(e) => setCreateForm({ ...createForm, joiningDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Annual Salary ($) *</label>
              <input
                type="number"
                min="0"
                step="500"
                className="form-input"
                value={createForm.salary}
                onChange={(e) => setCreateForm({ ...createForm, salary: e.target.value })}
                required
                placeholder="e.g. 60000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Employment Status *</label>
            <select
              className="form-select"
              value={createForm.employmentStatus}
              onChange={(e) => setCreateForm({ ...createForm, employmentStatus: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Probation">Probation</option>
              <option value="Resigned">Resigned</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Update Employment Status Modal */}
      <Modal
        open={updateStatusModal}
        onClose={() => setUpdateStatusModal(false)}
        title="Update Employment Record"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setUpdateStatusModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={updating} onClick={handleUpdateStatus}>
              {updating ? 'Saving...' : 'Update Record'}
            </button>
          </>
        }
      >
        <form onSubmit={handleUpdateStatus}>
          <div className="form-group">
            <label className="form-label">Status *</label>
            <select
              className="form-select"
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value)}
              required
            >
              <option value="Active">Active</option>
              <option value="Probation">Probation</option>
              <option value="Resigned">Resigned</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Updated Salary ($)</label>
            <input
              type="number"
              min="0"
              step="500"
              className="form-input"
              value={salaryVal}
              onChange={(e) => setSalaryVal(e.target.value)}
              placeholder="e.g. 65000"
            />
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
