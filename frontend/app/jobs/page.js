'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function JobsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [fetching, setFetching] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [statusFilter, setStatusFilter] = useState('Open');

  // Job creation modal & form
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    jobTitle: '',
    jobDescription: '',
    salary: '',
    jobLocation: 'Remote',
    employmentType: 'Full-Time',
    deadline: '',
    status: 'Open',
    employerId: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Job Detail modal
  const [detailModal, setDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Apply modal
  const [applyModal, setApplyModal] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);

  // Schedule interview modal (from applicants list)
  const [interviewModal, setInterviewModal] = useState(false);
  const [interviewTargetApp, setInterviewTargetApp] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    interviewDate: '',
    interviewMode: 'Online',
    locationOrLink: '',
    notes: '',
  });
  const [scheduling, setScheduling] = useState(false);

  // Record placement modal (from applicants list)
  const [placementModal, setPlacementModal] = useState(false);
  const [placementTargetApp, setPlacementTargetApp] = useState(null);
  const [placementForm, setPlacementForm] = useState({
    joiningDate: new Date().toISOString().slice(0, 10),
    salary: '',
    employmentStatus: 'Active',
  });
  const [recordingPlacement, setRecordingPlacement] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (!user) return;
    fetchJobs();
  }, [user, loading]);

  const fetchJobs = async () => {
    setFetching(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;
      if (employmentType) params.employmentType = employmentType;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/jobs', { params });
      if (res.data.success) {
        setJobs(res.data.data.jobs || []);
        setTotalJobs(res.data.data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const openDetail = async (job) => {
    setSelectedJob(job);
    setDetailModal(true);
    setApplicants([]);

    // If employer or admin, retrieve applicant submissions
    if (user.role === 'employer' || user.role === 'admin') {
      setLoadingApplicants(true);
      try {
        const res = await api.get(`/jobs/${job.job_id}/applications`);
        if (res.data.success) {
          setApplicants(res.data.data || []);
        }
      } catch (err) {
        setApplicants([]);
      } finally {
        setLoadingApplicants(false);
      }
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        jobTitle: form.jobTitle.trim(),
        jobDescription: form.jobDescription.trim(),
        salary: form.salary ? parseFloat(form.salary) : undefined,
        jobLocation: form.jobLocation.trim() || 'Remote',
        employmentType: form.employmentType,
        deadline: form.deadline || undefined,
        status: form.status,
      };

      if (user.role === 'admin' && form.employerId) {
        payload.employerId = parseInt(form.employerId, 10);
      }

      const res = await api.post('/jobs', payload);
      if (res.data.success) {
        setModalOpen(false);
        setForm({
          jobTitle: '',
          jobDescription: '',
          salary: '',
          jobLocation: 'Remote',
          employmentType: 'Full-Time',
          deadline: '',
          status: 'Open',
          employerId: '',
        });
        fetchJobs();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to publish job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    setApplying(true);
    try {
      const res = await api.post(`/jobs/${selectedJob.job_id}/apply`, {
        coverNote: coverNote.trim() || undefined,
      });
      if (res.data.success) {
        alert('Application submitted successfully!');
        setApplyModal(false);
        setDetailModal(false);
        setCoverNote('');
        fetchJobs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  const handleUpdateAppStatus = async (applicationId, status) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      // Refresh applicants
      if (selectedJob) {
        const res = await api.get(`/jobs/${selectedJob.job_id}/applications`);
        if (res.data.success) setApplicants(res.data.data || []);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application status.');
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewTargetApp) return;
    setScheduling(true);
    try {
      await api.post(`/applications/${interviewTargetApp.application_id}/interviews`, {
        interviewDate: interviewForm.interviewDate,
        interviewMode: interviewForm.interviewMode,
        locationOrLink: interviewForm.locationOrLink || undefined,
        notes: interviewForm.notes || undefined,
      });
      alert('Interview scheduled successfully!');
      setInterviewModal(false);
      // Refresh applicants
      if (selectedJob) {
        const res = await api.get(`/jobs/${selectedJob.job_id}/applications`);
        if (res.data.success) setApplicants(res.data.data || []);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setScheduling(false);
    }
  };

  const handleRecordPlacement = async (e) => {
    e.preventDefault();
    if (!placementTargetApp) return;
    setRecordingPlacement(true);
    try {
      await api.post('/employment', {
        womanId: placementTargetApp.woman_id,
        jobId: selectedJob.job_id,
        joiningDate: placementForm.joiningDate,
        salary: parseFloat(placementForm.salary),
        employmentStatus: placementForm.employmentStatus,
      });
      alert('Placement recorded successfully!');
      setPlacementModal(false);
      // Refresh applicants
      if (selectedJob) {
        const res = await api.get(`/jobs/${selectedJob.job_id}/applications`);
        if (res.data.success) setApplicants(res.data.data || []);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record placement.');
    } finally {
      setRecordingPlacement(false);
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
    <AppShell title="Jobs">
      <div className="page-header">
        <div>
          <h1 className="page-title">Job Postings</h1>
          <p className="page-subtitle">Search, filter, and apply for employment vacancies</p>
        </div>
        {(user.role === 'employer' || user.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            + Post New Vacancy
          </button>
        )}
      </div>

      {/* Filter bar */}
      <form onSubmit={handleFilterSubmit} className="search-bar mb-4" style={{ flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: '2 1 200px' }}>
          <span className="search-icon">🔍</span>
          <input
            className="form-input"
            placeholder="Search title, description, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ flex: '1 1 140px' }}>
          <input
            className="form-input"
            placeholder="Location filter"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div style={{ flex: '1 1 140px' }}>
          <select
            className="form-select"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        <div style={{ flex: '1 1 120px' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <button className="btn btn-primary" type="submit">Filter</button>
      </form>

      {/* Jobs table list */}
      {fetching ? (
        <div className="loading-center">
          <div className="spinner spinner-lg"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💼</div>
          <div className="empty-state-title">No job postings found</div>
          <p className="text-secondary">Try adjusting filters or check back later.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Type</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.job_id}>
                  <td>
                    <strong>{job.job_title}</strong>
                  </td>
                  <td>{job.company_name}</td>
                  <td>{job.job_location || 'Remote'}</td>
                  <td>
                    <span className="badge badge-purple">{job.employment_type || 'Full-Time'}</span>
                  </td>
                  <td>{job.salary ? `$${Number(job.salary).toLocaleString()}` : 'Negotiable'}</td>
                  <td>
                    <StatusBadge status={job.status} />
                  </td>
                  <td>{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling'}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => openDetail(job)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Job Details Modal */}
      <Modal
        open={detailModal}
        onClose={() => setDetailModal(false)}
        title={selectedJob?.job_title || 'Job Information'}
        footer={
          user.role === 'woman' && selectedJob?.status === 'Open' ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                setDetailModal(false);
                setApplyModal(true);
              }}
            >
              Apply for this Job
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => setDetailModal(false)}>
              Close
            </button>
          )
        }
      >
        {selectedJob && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <span className="text-secondary text-sm">Company</span>
                <p className="font-semibold">{selectedJob.company_name}</p>
              </div>
              <div>
                <span className="text-secondary text-sm">Industry</span>
                <p className="font-semibold">{selectedJob.industry || '—'}</p>
              </div>
              <div>
                <span className="text-secondary text-sm">Location</span>
                <p className="font-semibold">{selectedJob.job_location || 'Remote'}</p>
              </div>
              <div>
                <span className="text-secondary text-sm">Employment Type</span>
                <p className="font-semibold">{selectedJob.employment_type || 'Full-Time'}</p>
              </div>
              <div>
                <span className="text-secondary text-sm">Salary</span>
                <p className="font-semibold">
                  {selectedJob.salary ? `$${Number(selectedJob.salary).toLocaleString()}` : 'Negotiable'}
                </p>
              </div>
              <div>
                <span className="text-secondary text-sm">Application Status</span>
                <p><StatusBadge status={selectedJob.status} /></p>
              </div>
            </div>

            <div className="mb-3">
              <span className="text-secondary text-sm font-semibold">Job Description</span>
              <p className="text-secondary mt-1" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {selectedJob.job_description}
              </p>
            </div>

            {/* Applicants List (Visible to Employers & Admins) */}
            {(user.role === 'employer' || user.role === 'admin') && (
              <div className="mt-4" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <h4 className="font-semibold mb-2">Applicants ({applicants.length})</h4>
                {loadingApplicants ? (
                  <div className="spinner"></div>
                ) : applicants.length === 0 ? (
                  <p className="text-secondary text-sm">No applications have been received yet.</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Email &amp; Phone</th>
                          <th>Education</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applicants.map((app) => (
                          <tr key={app.application_id}>
                            <td><strong>{app.full_name}</strong></td>
                            <td>
                              <div className="text-sm">{app.woman_email}</div>
                              <div className="text-secondary text-xs">{app.woman_phone || 'No phone'}</div>
                            </td>
                            <td>{app.education_level || '—'}</td>
                            <td><StatusBadge status={app.application_status} /></td>
                            <td>
                              <div className="flex gap-sm">
                                <select
                                  className="form-select form-select-sm"
                                  value={app.application_status}
                                  onChange={(e) => handleUpdateAppStatus(app.application_id, e.target.value)}
                                  style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
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
                                  className="btn btn-sm btn-secondary"
                                  title="Schedule Interview"
                                  onClick={() => {
                                    setInterviewTargetApp(app);
                                    setInterviewForm({
                                      interviewDate: '',
                                      interviewMode: 'Online',
                                      locationOrLink: '',
                                      notes: '',
                                    });
                                    setInterviewModal(true);
                                  }}
                                >
                                  🗓️
                                </button>

                                <button
                                  className="btn btn-sm btn-primary"
                                  title="Record Placement"
                                  onClick={() => {
                                    setPlacementTargetApp(app);
                                    setPlacementForm({
                                      joiningDate: new Date().toISOString().slice(0, 10),
                                      salary: selectedJob.salary ? String(selectedJob.salary) : '50000',
                                      employmentStatus: 'Active',
                                    });
                                    setPlacementModal(true);
                                  }}
                                >
                                  🤝
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Apply Modal */}
      <Modal
        open={applyModal}
        onClose={() => setApplyModal(false)}
        title={`Apply for ${selectedJob?.job_title}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setApplyModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={applying} onClick={submitApplication}>
              {applying ? 'Submitting...' : 'Confirm Application'}
            </button>
          </>
        }
      >
        <form onSubmit={submitApplication}>
          <p className="text-secondary mb-3">
            Your profile details and verified skills will be automatically shared with{' '}
            <strong>{selectedJob?.company_name}</strong>.
          </p>
          <div className="form-group">
            <label className="form-label">Cover Note / Why you are a great fit (optional)</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Highlight relevant certifications, skills, and background..."
            />
          </div>
        </form>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        open={interviewModal}
        onClose={() => setInterviewModal(false)}
        title={`Schedule Interview for ${interviewTargetApp?.full_name}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setInterviewModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={scheduling} onClick={handleScheduleInterview}>
              {scheduling ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </>
        }
      >
        <form onSubmit={handleScheduleInterview}>
          <div className="form-group">
            <label className="form-label">Interview Date &amp; Time *</label>
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
            <label className="form-label">Meeting Link / Room Address</label>
            <input
              className="form-input"
              value={interviewForm.locationOrLink}
              onChange={(e) => setInterviewForm({ ...interviewForm, locationOrLink: e.target.value })}
              placeholder="e.g. https://meet.google.com/abc-xyz or Conference Room 3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Instructions</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={interviewForm.notes}
              onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
              placeholder="Bring updated resume or prepare coding portfolio..."
            />
          </div>
        </form>
      </Modal>

      {/* Record Placement Modal */}
      <Modal
        open={placementModal}
        onClose={() => setPlacementModal(false)}
        title={`Record Placement for ${placementTargetApp?.full_name}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setPlacementModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={recordingPlacement} onClick={handleRecordPlacement}>
              {recordingPlacement ? 'Recording...' : 'Record Placement'}
            </button>
          </>
        }
      >
        <form onSubmit={handleRecordPlacement}>
          <div className="form-group">
            <label className="form-label">Joining Date *</label>
            <input
              type="date"
              className="form-input"
              value={placementForm.joiningDate}
              onChange={(e) => setPlacementForm({ ...placementForm, joiningDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Annual Salary ($) *</label>
            <input
              type="number"
              className="form-input"
              value={placementForm.salary}
              onChange={(e) => setPlacementForm({ ...placementForm, salary: e.target.value })}
              required
              min="0"
              step="500"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Employment Status *</label>
            <select
              className="form-select"
              value={placementForm.employmentStatus}
              onChange={(e) => setPlacementForm({ ...placementForm, employmentStatus: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Probation">Probation</option>
              <option value="Resigned">Resigned</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Post Job Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Post a New Job Opportunity"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={submitting} onClick={handleCreateJob}>
              {submitting ? 'Publishing...' : 'Publish Job'}
            </button>
          </>
        }
      >
        {formError && <div className="alert alert-error mb-3">{formError}</div>}
        <form onSubmit={handleCreateJob}>
          {user.role === 'admin' && (
            <div className="form-group">
              <label className="form-label">Employer ID (Required for admin postings) *</label>
              <input
                type="number"
                className="form-input"
                value={form.employerId}
                onChange={(e) => setForm({ ...form, employerId: e.target.value })}
                required
                placeholder="e.g. 1"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input
              className="form-input"
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              required
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Job Description *</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={form.jobDescription}
              onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
              required
              placeholder="Detail key responsibilities, qualifications, and benefits..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-input"
                value={form.jobLocation}
                onChange={(e) => setForm({ ...form, jobLocation: e.target.value })}
                placeholder="e.g. Remote, New York, NY"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Employment Type</label>
              <select
                className="form-select"
                value={form.employmentType}
                onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Annual Salary ($)</label>
              <input
                type="number"
                className="form-input"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="e.g. 75000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input
                type="date"
                className="form-input"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Open">Open</option>
              <option value="Draft">Draft</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
