'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [women, setWomen] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState('stats');

  // Filters
  const [roleFilter, setRoleFilter] = useState('');

  // Role update modal
  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole] = useState('woman');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (!loading && user && user.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    if (!user) return;
    loadAdminData();
  }, [user, loading]);

  const loadAdminData = async () => {
    setFetching(true);
    try {
      const [statsRes, usersRes, womenRes] = await Promise.all([
        api.get('/admin/statistics'),
        api.get('/admin/users', { params: { role: roleFilter || undefined, limit: 100 } }),
        api.get('/women', { params: { limit: 50 } }).catch(() => ({ data: { data: { women: [] } } })),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (womenRes.data?.data?.women) setWomen(womenRes.data.data.women);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', {
        params: { role: roleFilter || undefined, limit: 100 },
      });
      if (res.data.success) setUsers(res.data.data);
    } catch { }
  };

  const handleRoleUpdate = async () => {
    if (!editUser || !newRole) return;
    setUpdating(true);
    try {
      await api.patch(`/admin/users/${editUser.user_id}/role`, { role: newRole });
      alert('User role updated successfully!');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role.');
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

  if (user.role !== 'admin') return null;

  return (
    <AppShell title="Admin Panel">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Administration</h1>
          <p className="page-subtitle">Portal metrics, user accounts, and candidate directory oversight</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${tab === 'stats' ? 'active' : ''}`}
          onClick={() => setTab('stats')}
        >
          Comprehensive Statistics
        </button>
        <button
          className={`tab ${tab === 'users' ? 'active' : ''}`}
          onClick={() => setTab('users')}
        >
          User Accounts ({users.length})
        </button>
        <button
          className={`tab ${tab === 'candidates' ? 'active' : ''}`}
          onClick={() => setTab('candidates')}
        >
          Registered Women Directory ({women.length})
        </button>
      </div>

      {fetching ? (
        <div className="loading-center">
          <div className="spinner spinner-lg"></div>
        </div>
      ) : (
        <>
          {/* Tab 1: Comprehensive Statistics (FR-09) */}
          {tab === 'stats' && stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon green">👩</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalWomen ?? 0}</div>
                  <div className="stat-label">Registered Women</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon purple">🏢</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalEmployers ?? 0}</div>
                  <div className="stat-label">Employers</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange">📚</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalTrainingPrograms ?? 0}</div>
                  <div className="stat-label">Training Programs</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon teal">🎓</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalEnrollments ?? 0}</div>
                  <div className="stat-label">Active Enrollments</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue">⚡</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalSkills ?? 0}</div>
                  <div className="stat-label">Defined Skills</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon pink">💼</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalOpenJobs ?? 0}</div>
                  <div className="stat-label">Open Job Postings</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon teal">📁</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalJobsAll ?? 0}</div>
                  <div className="stat-label">Total Jobs (All Statuses)</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange">📋</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalApplications ?? 0}</div>
                  <div className="stat-label">Job Applications</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon purple">🗓️</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalInterviews ?? 0}</div>
                  <div className="stat-label">Interviews Arranged</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">🏅</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalCertifications ?? 0}</div>
                  <div className="stat-label">Certificates Issued</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue">🤝</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalPlacements ?? 0}</div>
                  <div className="stat-label">Verified Placements</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: User Accounts */}
          {tab === 'users' && (
            <>
              <div className="flex gap-sm items-center mb-4">
                <select
                  className="form-select"
                  style={{ width: 'auto', minWidth: 200 }}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="woman">Woman / Job Seeker</option>
                  <option value="employer">Employer</option>
                  <option value="training_provider">Training Provider</option>
                  <option value="admin">System Admin</option>
                </select>
                <button className="btn btn-primary" onClick={fetchUsers}>
                  Filter
                </button>
              </div>

              {users.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <div className="empty-state-title">No user profiles found</div>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Email</th>
                        <th>System Role</th>
                        <th>Registered Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.user_id}>
                          <td>#{u.user_id}</td>
                          <td><strong>{u.email}</strong></td>
                          <td><StatusBadge status={u.role} /></td>
                          <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => {
                                setEditUser(u);
                                setNewRole(u.role);
                              }}
                            >
                              Change Role
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Tab 3: Registered Women Directory */}
          {tab === 'candidates' && (
            <div>
              {women.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">👩</div>
                  <div className="empty-state-title">No candidate records found</div>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Candidate ID</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Education</th>
                        <th>Total Skills</th>
                        <th>Certifications</th>
                      </tr>
                    </thead>
                    <tbody>
                      {women.map((w) => (
                        <tr key={w.woman_id}>
                          <td>#{w.woman_id}</td>
                          <td><strong>{w.full_name}</strong></td>
                          <td>{w.email}</td>
                          <td>{w.phone || '—'}</td>
                          <td>{w.education_level || '—'}</td>
                          <td><span className="badge badge-purple">{w.total_skills ?? 0}</span></td>
                          <td><span className="badge badge-green font-semibold">{w.total_certifications ?? 0}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Role Update Modal */}
      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title="Modify User Security Role"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditUser(null)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={updating} onClick={handleRoleUpdate}>
              {updating ? 'Saving...' : 'Confirm Role Update'}
            </button>
          </>
        }
      >
        {editUser && (
          <div>
            <p className="mb-2"><strong>User Account:</strong> {editUser.email}</p>
            <p className="mb-3">
              <strong>Current Role:</strong> <StatusBadge status={editUser.role} />
            </p>

            <div className="form-group">
              <label className="form-label">Assign New Role *</label>
              <select
                className="form-select"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="woman">Woman (Job Seeker)</option>
                <option value="employer">Employer</option>
                <option value="training_provider">Training Provider</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
