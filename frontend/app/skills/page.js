'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function SkillsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [skills, setSkills] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ skillName: '', category: 'Technical', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (!user) return;
    fetchSkills();
  }, [user, loading]);

  const fetchSkills = async () => {
    setFetching(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const res = await api.get('/skills', { params });
      if (res.data.success) {
        setSkills(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm({ skillName: '', category: 'Technical', description: '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (skill) => {
    setEditId(skill.skill_id);
    setForm({
      skillName: skill.skill_name,
      category: skill.category || 'Technical',
      description: skill.description || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editId) {
        await api.put(`/skills/${editId}`, {
          skillName: form.skillName.trim(),
          category: form.category.trim(),
          description: form.description.trim() || undefined,
        });
      } else {
        await api.post('/skills', {
          skillName: form.skillName.trim(),
          category: form.category.trim(),
          description: form.description.trim() || undefined,
        });
      }
      setModalOpen(false);
      fetchSkills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save skill entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete skill "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/skills/${id}`);
      fetchSkills();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete skill.');
    }
  };

  if (loading || !user) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  // Categories list
  const categories = Array.from(new Set(skills.map((s) => s.category).filter(Boolean)));

  return (
    <AppShell title="Skills">
      <div className="page-header">
        <div>
          <h1 className="page-title">Skills Catalog</h1>
          <p className="page-subtitle">Standardized taxonomy of skills and competencies</p>
        </div>
        {(user.role === 'admin' || user.role === 'training_provider') && (
          <button className="btn btn-primary" onClick={openCreate}>
            + Add New Skill
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchSkills();
        }}
        className="search-bar mb-4"
        style={{ flexWrap: 'wrap' }}
      >
        <div className="search-input-wrapper" style={{ flex: '2 1 200px' }}>
          <span className="search-icon">🔍</span>
          <input
            className="form-input"
            placeholder="Search skill name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ flex: '1 1 180px' }}>
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" type="submit">Filter</button>
      </form>

      {/* Skills Table */}
      {fetching ? (
        <div className="loading-center">
          <div className="spinner spinner-lg"></div>
        </div>
      ) : skills.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚡</div>
          <div className="empty-state-title">No skills found</div>
          <p className="text-secondary">Try searching with a different term.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Skill Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Created Date</th>
                {(user.role === 'admin' || user.role === 'training_provider') && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s.skill_id}>
                  <td>#{s.skill_id}</td>
                  <td><strong>{s.skill_name}</strong></td>
                  <td><span className="badge badge-purple">{s.category}</span></td>
                  <td>
                    <span className="text-secondary text-sm">
                      {s.description || '—'}
                    </span>
                  </td>
                  <td>{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</td>
                  {(user.role === 'admin' || user.role === 'training_provider') && (
                    <td>
                      <div className="flex gap-sm">
                        {user.role === 'admin' && (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => openEdit(s)}
                          >
                            Edit
                          </button>
                        )}
                        {user.role === 'admin' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(s.skill_id, s.skill_name)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Skill Definition' : 'Add New Skill'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Saving...' : editId ? 'Update Skill' : 'Create Skill'}
            </button>
          </>
        }
      >
        {error && <div className="alert alert-error mb-3">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Skill Name *</label>
            <input
              className="form-input"
              value={form.skillName}
              onChange={(e) => setForm({ ...form, skillName: e.target.value })}
              required
              placeholder="e.g. Python Programming, Digital Marketing"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <input
              className="form-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
              placeholder="e.g. Technical, Management, Soft Skills, Design"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief summary of requirements, domain context, or learning outcomes..."
            />
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
