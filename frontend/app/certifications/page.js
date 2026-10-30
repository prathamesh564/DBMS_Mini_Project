'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import Modal from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function CertificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [certs, setCerts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [detailModal, setDetailModal] = useState(false);

  // Issue cert form (training_provider, admin)
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    womanId: '',
    programId: '',
    certificateName: '',
    certificateNumber: '',
    issueDate: new Date().toISOString().slice(0, 10),
  });
  const [issueError, setIssueError] = useState('');
  const [issuing, setIssuing] = useState(false);

  // Lists for dropdown selection when issuing
  const [womenList, setWomenList] = useState([]);
  const [programsList, setProgramsList] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (!user) return;
    loadCertifications();
  }, [user, loading]);

  const loadCertifications = async () => {
    setFetching(true);
    try {
      if (user.role === 'woman') {
        const res = await api.get('/certifications/me');
        if (res.data.success) {
          setCerts(res.data.data || []);
        }
      } else {
        // If provider or admin, retrieve eligible data for issuing
        const [wRes, pRes] = await Promise.all([
          api.get('/women', { params: { limit: 100 } }).catch(() => ({ data: { data: { women: [] } } })),
          api.get('/training/programs', { params: { limit: 100 } }).catch(() => ({ data: { data: { programs: [] } } })),
        ]);

        if (wRes.data?.data?.women) setWomenList(wRes.data.data.women);
        if (pRes.data?.data?.programs) setProgramsList(pRes.data.data.programs);

        // Fetch woman profile certifications or enrollments
        if (user.role === 'admin') {
          // List certifications via enrollments or individual women
          const allC = [];
          for (const w of (wRes.data?.data?.women || []).slice(0, 10)) {
            try {
              const wpRes = await api.get(`/women/${w.woman_id}`);
              if (wpRes.data?.data?.certifications) {
                allC.push(...wpRes.data.data.certifications.map(c => ({
                  ...c,
                  full_name: w.full_name,
                  woman_email: w.email,
                })));
              }
            } catch {}
          }
          setCerts(allC);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const openDetail = async (cert) => {
    try {
      const res = await api.get(`/certifications/${cert.certification_id}`);
      if (res.data.success) setSelectedCert(res.data.data);
      else setSelectedCert(cert);
    } catch {
      setSelectedCert(cert);
    }
    setDetailModal(true);
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setIssueError('');
    setIssuing(true);

    try {
      const payload = {
        womanId: parseInt(issueForm.womanId, 10),
        programId: parseInt(issueForm.programId, 10),
        certificateName: issueForm.certificateName.trim(),
        issueDate: issueForm.issueDate || undefined,
      };

      if (issueForm.certificateNumber.trim()) {
        payload.certificateNumber = issueForm.certificateNumber.trim();
      }

      const res = await api.post('/certifications', payload);
      if (res.data.success) {
        alert('Certificate issued successfully!');
        setIssueOpen(false);
        setIssueForm({
          womanId: '',
          programId: '',
          certificateName: '',
          certificateNumber: '',
          issueDate: new Date().toISOString().slice(0, 10),
        });
        loadCertifications();
      }
    } catch (err) {
      setIssueError(err.response?.data?.message || 'Failed to issue certificate.');
    } finally {
      setIssuing(false);
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
    <AppShell title="Certifications">
      <div className="page-header">
        <div>
          <h1 className="page-title">Verified Certifications</h1>
          <p className="page-subtitle">Accredited vocational credentials and program completion diplomas</p>
        </div>
        {(user.role === 'training_provider' || user.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => setIssueOpen(true)}>
            + Issue Certificate
          </button>
        )}
      </div>

      {fetching ? (
        <div className="loading-center">
          <div className="spinner spinner-lg"></div>
        </div>
      ) : certs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏅</div>
          <div className="empty-state-title">No certifications found</div>
          <p className="text-secondary">
            {user.role === 'woman'
              ? 'Complete your enrolled training programs to be awarded verified course certificates.'
              : 'Issue certificates to students who have completed course requirements.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Certificate Number</th>
                <th>Credential Name</th>
                <th>Program</th>
                {user.role !== 'woman' && <th>Recipient</th>}
                <th>Issue Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c.certification_id}>
                  <td>
                    <span className="badge badge-purple font-semibold">
                      {c.certificate_number}
                    </span>
                  </td>
                  <td><strong>{c.certificate_name}</strong></td>
                  <td>{c.program_name}</td>
                  {user.role !== 'woman' && (
                    <td>
                      <div><strong>{c.full_name}</strong></div>
                      <div className="text-secondary text-xs">{c.woman_email}</div>
                    </td>
                  )}
                  <td>{c.issue_date ? new Date(c.issue_date).toLocaleDateString() : '—'}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => openDetail(c)}>
                      View Certificate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Certificate Details Modal */}
      <Modal
        open={detailModal}
        onClose={() => setDetailModal(false)}
        title="Verified Credential Document"
        footer={
          <button className="btn btn-secondary" onClick={() => setDetailModal(false)}>
            Close
          </button>
        }
      >
        {selectedCert && (
          <div
            style={{
              border: '2px dashed var(--primary-500)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              background: 'var(--primary-50)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏅</div>
            <h2 style={{ color: 'var(--primary-700)', marginBottom: '0.25rem' }}>
              Certificate of Achievement
            </h2>
            <p className="text-secondary text-sm mb-3">
              Official verification code: <strong>{selectedCert.certificate_number}</strong>
            </p>

            <p className="text-secondary text-sm">This is to certify that</p>
            <h3 style={{ fontSize: '1.4rem', margin: '0.4rem 0' }}>
              {selectedCert.full_name || user.profile?.full_name || 'Recipient'}
            </h3>
            <p className="text-secondary text-sm">has successfully mastered the coursework for</p>
            <h4 style={{ color: 'var(--primary-600)', margin: '0.4rem 0', fontSize: '1.15rem' }}>
              {selectedCert.certificate_name}
            </h4>
            <p className="text-secondary text-xs mt-2">
              Program: <strong>{selectedCert.program_name}</strong> &bull; Provider: {selectedCert.provider_name || 'Accredited Institute'}
            </p>
            <p className="text-secondary text-xs mt-1">
              Issued on: {selectedCert.issue_date ? new Date(selectedCert.issue_date).toLocaleDateString() : '—'}
            </p>
          </div>
        )}
      </Modal>

      {/* Issue Certificate Modal (training_provider, admin) */}
      <Modal
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        title="Issue Verified Certificate"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIssueOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={issuing} onClick={handleIssue}>
              {issuing ? 'Issuing...' : 'Award Certificate'}
            </button>
          </>
        }
      >
        {issueError && <div className="alert alert-error mb-3">{issueError}</div>}
        <form onSubmit={handleIssue}>
          <div className="form-group">
            <label className="form-label">Recipient (Candidate) *</label>
            {womenList.length > 0 ? (
              <select
                className="form-select"
                value={issueForm.womanId}
                onChange={(e) => setIssueForm({ ...issueForm, womanId: e.target.value })}
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
                value={issueForm.womanId}
                onChange={(e) => setIssueForm({ ...issueForm, womanId: e.target.value })}
                required
              />
            )}
            <span className="form-hint">Candidate must have an enrollment with status &apos;Completed&apos;.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Training Program *</label>
            {programsList.length > 0 ? (
              <select
                className="form-select"
                value={issueForm.programId}
                onChange={(e) => setIssueForm({ ...issueForm, programId: e.target.value })}
                required
              >
                <option value="">Select Training Program...</option>
                {programsList.map((p) => (
                  <option key={p.program_id} value={p.program_id}>
                    {p.program_name} ({p.provider_name})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                className="form-input"
                placeholder="Program ID (e.g. 1)"
                value={issueForm.programId}
                onChange={(e) => setIssueForm({ ...issueForm, programId: e.target.value })}
                required
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Certificate Title / Credential Name *</label>
            <input
              className="form-input"
              value={issueForm.certificateName}
              onChange={(e) => setIssueForm({ ...issueForm, certificateName: e.target.value })}
              required
              placeholder="e.g. Certified Data Analyst Specialist"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Certificate Number (optional)</label>
              <input
                className="form-input"
                value={issueForm.certificateNumber}
                onChange={(e) => setIssueForm({ ...issueForm, certificateNumber: e.target.value })}
                placeholder="Auto-generated if left blank"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Issue Date</label>
              <input
                type="date"
                className="form-input"
                value={issueForm.issueDate}
                onChange={(e) => setIssueForm({ ...issueForm, issueDate: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
