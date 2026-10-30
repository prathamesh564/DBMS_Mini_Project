'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function TrainingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [programs, setPrograms] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [providerEnrollments, setProviderEnrollments] = useState([]);
  const [fetching, setFetching] = useState(true);

  // Tabs: programs list, enrollments
  const [tab, setTab] = useState('programs');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Create Program Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    programName: '',
    category: 'Information Technology',
    durationWeeks: 8,
    courseFee: 0,
    mode: 'Online',
    status: 'Active',
    description: '',
  });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  // Program Detail Modal
  const [detailModal, setDetailModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Enrollment Status Update Modal (for provider / admin)
  const [updateEnrollModal, setUpdateEnrollModal] = useState(false);
  const [targetEnrollment, setTargetEnrollment] = useState(null);
  const [enrollForm, setEnrollForm] = useState({
    completionStatus: 'In Progress',
    score: '',
    completionDate: '',
  });
  const [updatingEnroll, setUpdatingEnroll] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (!user) return;
    loadAllData();
  }, [user, loading]);

  const loadAllData = async () => {
    setFetching(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const pRes = await api.get('/training/programs', { params });
      if (pRes.data.success) {
        setPrograms(pRes.data.data.programs || []);
      }

      if (user.role === 'woman') {
        const eRes = await api.get('/training/enrollments/me');
        if (eRes.data.success) {
          setMyEnrollments(eRes.data.data || []);
        }
      }

      if (user.role === 'training_provider' || user.role === 'admin') {
        const provEnrRes = await api.get('/enrollments');
        if (provEnrRes.data.success) {
          setProviderEnrollments(provEnrRes.data.data || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleEnroll = async (programId) => {
    try {
      const res = await api.post(`/training/programs/${programId}/enroll`);
      if (res.data.success) {
        alert('Enrolled successfully in the training program!');
        setDetailModal(false);
        loadAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed.');
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);

    try {
      const res = await api.post('/training/programs', {
        programName: createForm.programName.trim(),
        category: createForm.category.trim() || undefined,
        durationWeeks: parseInt(createForm.durationWeeks, 10),
        courseFee: parseFloat(createForm.courseFee) || 0,
        mode: createForm.mode,
        status: createForm.status,
        description: createForm.description.trim() || undefined,
      });

      if (res.data.success) {
        setCreateOpen(false);
        setCreateForm({
          programName: '',
          category: 'Information Technology',
          durationWeeks: 8,
          courseFee: 0,
          mode: 'Online',
          status: 'Active',
          description: '',
        });
        loadAllData();
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create training program.');
    } finally {
      setCreating(false);
    }
  };

  const openProgramDetail = async (p) => {
    try {
      const res = await api.get(`/training/programs/${p.program_id}`);
      if (res.data.success) setSelectedProgram(res.data.data);
      else setSelectedProgram(p);
    } catch {
      setSelectedProgram(p);
    }
    setDetailModal(true);
  };

  const openUpdateEnrollment = (enr) => {
    setTargetEnrollment(enr);
    setEnrollForm({
      completionStatus: enr.completion_status || 'In Progress',
      score: enr.score !== null && enr.score !== undefined ? String(enr.score) : '',
      completionDate: enr.completion_date ? enr.completion_date.slice(0, 10) : '',
    });
    setUpdateEnrollModal(true);
  };

  const handleUpdateEnrollment = async (e) => {
    e.preventDefault();
    if (!targetEnrollment) return;
    setUpdatingEnroll(true);
    try {
      await api.patch(`/enrollments/${targetEnrollment.enrollment_id}`, {
        completionStatus: enrollForm.completionStatus,
        score: enrollForm.score ? parseFloat(enrollForm.score) : null,
        completionDate: enrollForm.completionDate || undefined,
      });
      alert('Enrollment progress updated successfully!');
      setUpdateEnrollModal(false);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update enrollment progress.');
    } finally {
      setUpdatingEnroll(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  const enrolledProgramIds = new Set(myEnrollments.map((e) => e.program_id));

  return (
    <AppShell title="Training">
      <div className="page-header">
        <div>
          <h1 className="page-title">Training Programs</h1>
          <p className="page-subtitle">Accredited skill acquisition, bootcamps, and vocational courses</p>
        </div>
        {(user.role === 'training_provider' || user.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            + Create New Program
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${tab === 'programs' ? 'active' : ''}`}
          onClick={() => setTab('programs')}
        >
          All Programs ({programs.length})
        </button>

        {user.role === 'woman' && (
          <button
            className={`tab ${tab === 'my_enrollments' ? 'active' : ''}`}
            onClick={() => setTab('my_enrollments')}
          >
            My Enrollments ({myEnrollments.length})
          </button>
        )}

        {(user.role === 'training_provider' || user.role === 'admin') && (
          <button
            className={`tab ${tab === 'provider_enrollments' ? 'active' : ''}`}
            onClick={() => setTab('provider_enrollments')}
          >
            Student Enrollments ({providerEnrollments.length})
          </button>
        )}
      </div>

      {/* Tab: All Programs */}
      {tab === 'programs' && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadAllData();
            }}
            className="search-bar mb-4"
            style={{ flexWrap: 'wrap' }}
          >
            <div className="search-input-wrapper" style={{ flex: '2 1 200px' }}>
              <span className="search-icon">🔍</span>
              <input
                className="form-input"
                placeholder="Search programs or provider..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" type="submit">Filter</button>
          </form>

          {fetching ? (
            <div className="loading-center">
              <div className="spinner spinner-lg"></div>
            </div>
          ) : programs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <div className="empty-state-title">No training programs found</div>
              <p className="text-secondary">Try searching for other topics or categories.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Program Name</th>
                    <th>Provider</th>
                    <th>Category</th>
                    <th>Duration</th>
                    <th>Fee</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p) => {
                    const isEnrolled = enrolledProgramIds.has(p.program_id);
                    return (
                      <tr key={p.program_id}>
                        <td><strong>{p.program_name}</strong></td>
                        <td>{p.provider_name}</td>
                        <td><span className="badge badge-purple">{p.category}</span></td>
                        <td>{p.duration_weeks} weeks</td>
                        <td>{Number(p.course_fee) === 0 ? 'Free' : `$${Number(p.course_fee).toLocaleString()}`}</td>
                        <td><span className="badge badge-blue">{p.mode}</span></td>
                        <td><StatusBadge status={p.status} /></td>
                        <td>
                          <div className="flex gap-sm">
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => openProgramDetail(p)}
                            >
                              Details
                            </button>
                            {user.role === 'woman' && !isEnrolled && (p.status === 'Active' || p.status === 'Upcoming') && (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleEnroll(p.program_id)}
                              >
                                Enroll
                              </button>
                            )}
                            {user.role === 'woman' && isEnrolled && (
                              <span className="badge badge-green">Enrolled</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Tab: My Enrollments (Woman) */}
      {tab === 'my_enrollments' && user.role === 'woman' && (
        <div>
          {myEnrollments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎓</div>
              <div className="empty-state-title">No enrollments recorded</div>
              <p className="text-secondary">Enroll in an active program to begin learning.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Program Name</th>
                    <th>Provider</th>
                    <th>Enrolled Date</th>
                    <th>Status</th>
                    <th>Grade / Score</th>
                    <th>Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {myEnrollments.map((enr) => (
                    <tr key={enr.enrollment_id}>
                      <td><strong>{enr.program_name}</strong></td>
                      <td>{enr.provider_name}</td>
                      <td>{enr.enrollment_date ? new Date(enr.enrollment_date).toLocaleDateString() : '—'}</td>
                      <td><StatusBadge status={enr.completion_status} /></td>
                      <td>{enr.score !== null && enr.score !== undefined ? `${enr.score}%` : 'Pending'}</td>
                      <td>
                        {enr.certificate_number ? (
                          <span className="badge badge-green font-semibold">
                            🏅 {enr.certificate_number}
                          </span>
                        ) : (
                          <span className="text-secondary text-xs">Available upon completion</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Provider / Admin Student Enrollments */}
      {tab === 'provider_enrollments' && (user.role === 'training_provider' || user.role === 'admin') && (
        <div>
          {providerEnrollments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">No student enrollments</div>
              <p className="text-secondary">Candidates enrolled in your curricula will appear here.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Contact</th>
                    <th>Program</th>
                    <th>Enrollment Date</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {providerEnrollments.map((enr) => (
                    <tr key={enr.enrollment_id}>
                      <td><strong>{enr.full_name}</strong></td>
                      <td>
                        <div className="text-sm">{enr.woman_email}</div>
                        <div className="text-secondary text-xs">{enr.woman_phone || '—'}</div>
                      </td>
                      <td>{enr.program_name}</td>
                      <td>{enr.enrollment_date ? new Date(enr.enrollment_date).toLocaleDateString() : '—'}</td>
                      <td><StatusBadge status={enr.completion_status} /></td>
                      <td>{enr.score !== null && enr.score !== undefined ? `${enr.score}%` : '—'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => openUpdateEnrollment(enr)}
                        >
                          Update Progress
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Program Details Modal */}
      <Modal
        open={detailModal}
        onClose={() => setDetailModal(false)}
        title={selectedProgram?.program_name || 'Program Overview'}
        footer={
          user.role === 'woman' &&
          !enrolledProgramIds.has(selectedProgram?.program_id) &&
          (selectedProgram?.status === 'Active' || selectedProgram?.status === 'Upcoming') ? (
            <button
              className="btn btn-primary"
              onClick={() => handleEnroll(selectedProgram.program_id)}
            >
              Enroll in this Course
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => setDetailModal(false)}>
              Close
            </button>
          )
        }
      >
        {selectedProgram && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <span className="text-secondary text-sm">Provider</span>
                <p className="font-semibold">{selectedProgram.provider_name}</p>
              </div>
              <div>
                <span className="text-secondary text-sm">Category</span>
                <p className="font-semibold">{selectedProgram.category}</p>
              </div>
              <div>
                <span className="text-secondary text-sm">Duration</span>
                <p className="font-semibold">{selectedProgram.duration_weeks} Weeks</p>
              </div>
              <div>
                <span className="text-secondary text-sm">Mode</span>
                <p className="font-semibold">{selectedProgram.mode}</p>
              </div>
              <div>
                <span className="text-secondary text-sm">Course Fee</span>
                <p className="font-semibold">
                  {Number(selectedProgram.course_fee) === 0 ? 'Free' : `$${Number(selectedProgram.course_fee).toLocaleString()}`}
                </p>
              </div>
              <div>
                <span className="text-secondary text-sm">Program Status</span>
                <p><StatusBadge status={selectedProgram.status} /></p>
              </div>
            </div>

            <div className="mb-3">
              <span className="text-secondary text-sm font-semibold">Program Syllabus &amp; Description</span>
              <p className="text-secondary mt-1" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {selectedProgram.description || 'No detailed syllabus uploaded.'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Enrollment Progress Modal */}
      <Modal
        open={updateEnrollModal}
        onClose={() => setUpdateEnrollModal(false)}
        title={`Update Enrollment: ${targetEnrollment?.full_name}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setUpdateEnrollModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={updatingEnroll} onClick={handleUpdateEnrollment}>
              {updatingEnroll ? 'Saving...' : 'Save Progress'}
            </button>
          </>
        }
      >
        <form onSubmit={handleUpdateEnrollment}>
          <div className="form-group">
            <label className="form-label">Program</label>
            <input className="form-input" disabled value={targetEnrollment?.program_name || ''} />
          </div>

          <div className="form-group">
            <label className="form-label">Completion Status *</label>
            <select
              className="form-select"
              value={enrollForm.completionStatus}
              onChange={(e) => setEnrollForm({ ...enrollForm, completionStatus: e.target.value })}
            >
              <option value="Enrolled">Enrolled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Dropped">Dropped</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Score / Exam Grade (0 - 100%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              className="form-input"
              value={enrollForm.score}
              onChange={(e) => setEnrollForm({ ...enrollForm, score: e.target.value })}
              placeholder="e.g. 92.5"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Completion Date (optional)</label>
            <input
              type="date"
              className="form-input"
              value={enrollForm.completionDate}
              onChange={(e) => setEnrollForm({ ...enrollForm, completionDate: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Create Program Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Training Program"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={creating} onClick={handleCreateProgram}>
              {creating ? 'Creating...' : 'Create Program'}
            </button>
          </>
        }
      >
        {createError && <div className="alert alert-error mb-3">{createError}</div>}
        <form onSubmit={handleCreateProgram}>
          <div className="form-group">
            <label className="form-label">Program Name *</label>
            <input
              className="form-input"
              value={createForm.programName}
              onChange={(e) => setCreateForm({ ...createForm, programName: e.target.value })}
              required
              placeholder="e.g. Full-Stack Web Development Bootcamp"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                className="form-input"
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                placeholder="e.g. IT, Healthcare, Business"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (Weeks) *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={createForm.durationWeeks}
                onChange={(e) => setCreateForm({ ...createForm, durationWeeks: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Course Fee ($)</label>
              <input
                type="number"
                min="0"
                step="10"
                className="form-input"
                value={createForm.courseFee}
                onChange={(e) => setCreateForm({ ...createForm, courseFee: e.target.value })}
                placeholder="0 for Free"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Delivery Mode</label>
              <select
                className="form-select"
                value={createForm.mode}
                onChange={(e) => setCreateForm({ ...createForm, mode: e.target.value })}
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Initial Status</label>
            <select
              className="form-select"
              value={createForm.status}
              onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Syllabus &amp; Curriculum Overview</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Describe curriculum modules, hands-on projects, prerequisites..."
            />
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
