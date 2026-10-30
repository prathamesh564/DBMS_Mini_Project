'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';

export default function ProfilePage() {
  const { user, loading, fetchMe } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Woman profile form fields
  const [womanForm, setWomanForm] = useState({
    fullName: '',
    phone: '',
    educationLevel: '',
    address: '',
    bio: '',
  });

  // Employer profile form fields
  const [employerForm, setEmployerForm] = useState({
    companyName: '',
    industry: '',
    phone: '',
    address: '',
    website: '',
  });

  // Add skill state (for woman)
  const [skillToAdd, setSkillToAdd] = useState({
    skillId: '',
    proficiencyLevel: 'Intermediate',
    yearsExperience: 1,
  });
  const [addingSkill, setAddingSkill] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (!user) return;
    loadProfileData();
  }, [user, loading]);

  const loadProfileData = async () => {
    setFetching(true);
    setError('');
    try {
      if (user.role === 'woman') {
        const [profRes, allSkillsRes] = await Promise.all([
          api.get('/women/me'),
          api.get('/skills'),
        ]);

        if (profRes.data.success) {
          const w = profRes.data.data;
          setProfile(w);
          setWomanForm({
            fullName: w.full_name || '',
            phone: w.phone || '',
            educationLevel: w.education_level || "Bachelor's Degree",
            address: w.address || '',
            bio: w.bio || '',
          });
        }
        if (allSkillsRes.data.success) {
          setAllSkills(allSkillsRes.data.data || []);
        }
      } else if (user.role === 'employer') {
        const res = await api.get('/employers/me');
        if (res.data.success) {
          const e = res.data.data;
          setProfile(e);
          setEmployerForm({
            companyName: e.company_name || '',
            industry: e.industry || '',
            phone: e.phone || '',
            address: e.address || '',
            website: e.website || '',
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile details.');
    } finally {
      setFetching(false);
    }
  };

  const handleSaveWoman = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSaving(true);
    try {
      const res = await api.put('/women/me', womanForm);
      if (res.data.success) {
        setSuccessMsg('Profile updated successfully.');
        setEditing(false);
        loadProfileData();
        fetchMe();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmployer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSaving(true);
    try {
      const res = await api.put('/employers/me', employerForm);
      if (res.data.success) {
        setSuccessMsg('Employer profile updated successfully.');
        setEditing(false);
        loadProfileData();
        fetchMe();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employer profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillToAdd.skillId) return;
    setAddingSkill(true);
    try {
      await api.post('/women/me/skills', {
        skillId: parseInt(skillToAdd.skillId, 10),
        proficiencyLevel: skillToAdd.proficiencyLevel,
        yearsExperience: parseInt(skillToAdd.yearsExperience, 10) || 0,
      });
      setSkillToAdd({ skillId: '', proficiencyLevel: 'Intermediate', yearsExperience: 1 });
      loadProfileData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add skill.');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    if (!confirm('Remove this skill from your profile?')) return;
    try {
      await api.delete(`/women/me/skills/${skillId}`);
      loadProfileData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove skill.');
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
    <AppShell title="Profile">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage personal information and credentials</p>
        </div>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {error && <div className="alert alert-error mb-3">{error}</div>}
      {successMsg && <div className="alert alert-success mb-3">{successMsg}</div>}

      {fetching ? (
        <div className="loading-center">
          <div className="spinner spinner-lg"></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: 900 }}>
          {/* User Account Basics Card */}
          <div className="card">
            <h3 className="card-title mb-3">Account Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <span className="text-secondary text-sm">Email Address</span>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div>
                <span className="text-secondary text-sm">System Role</span>
                <p>
                  <StatusBadge status={user.role} />
                </p>
              </div>
              <div>
                <span className="text-secondary text-sm">Account ID</span>
                <p className="font-semibold">#{user.userId}</p>
              </div>
            </div>
          </div>

          {/* Woman Profile View & Edit */}
          {user.role === 'woman' && (
            <>
              <div className="card">
                <div className="card-header flex justify-between items-center">
                  <h3 className="card-title">Personal Details</h3>
                  {editing && (
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleSaveWoman}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                          className="form-input"
                          value={womanForm.fullName}
                          onChange={(e) => setWomanForm({ ...womanForm, fullName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                          className="form-input"
                          value={womanForm.phone}
                          onChange={(e) => setWomanForm({ ...womanForm, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Education Level</label>
                        <select
                          className="form-select"
                          value={womanForm.educationLevel}
                          onChange={(e) => setWomanForm({ ...womanForm, educationLevel: e.target.value })}
                        >
                          <option value="High School">High School</option>
                          <option value="Associate Degree">Associate Degree</option>
                          <option value="Bachelor's Degree">Bachelor's Degree</option>
                          <option value="Master's Degree">Master's Degree</option>
                          <option value="Doctorate">Doctorate</option>
                          <option value="Diploma / Vocational">Diploma / Vocational</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Address</label>
                        <input
                          className="form-input"
                          value={womanForm.address}
                          onChange={(e) => setWomanForm({ ...womanForm, address: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Professional Summary / Bio</label>
                      <textarea
                        className="form-textarea"
                        rows={3}
                        value={womanForm.bio}
                        onChange={(e) => setWomanForm({ ...womanForm, bio: e.target.value })}
                        placeholder="Tell recruiters about your background, career aspirations, and expertise..."
                      />
                    </div>

                    <div className="flex gap-sm">
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    <div>
                      <span className="text-secondary text-sm">Full Name</span>
                      <p className="font-semibold">{profile?.full_name || '—'}</p>
                    </div>
                    <div>
                      <span className="text-secondary text-sm">Phone</span>
                      <p className="font-semibold">{profile?.phone || '—'}</p>
                    </div>
                    <div>
                      <span className="text-secondary text-sm">Education Level</span>
                      <p className="font-semibold">{profile?.education_level || '—'}</p>
                    </div>
                    <div>
                      <span className="text-secondary text-sm">Address</span>
                      <p className="font-semibold">{profile?.address || '—'}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span className="text-secondary text-sm">Bio</span>
                      <p className="text-secondary" style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                        {profile?.bio || 'No bio provided yet. Click Edit Profile to add one.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills section */}
              <div className="card">
                <h3 className="card-title mb-3">Skills &amp; Competencies</h3>

                <form onSubmit={handleAddSkill} className="flex gap-sm items-center flex-wrap mb-4">
                  <div style={{ flex: '2 1 200px' }}>
                    <select
                      className="form-select"
                      value={skillToAdd.skillId}
                      onChange={(e) => setSkillToAdd({ ...skillToAdd, skillId: e.target.value })}
                      required
                    >
                      <option value="">Select a skill to add...</option>
                      {allSkills.map((s) => (
                        <option key={s.skill_id} value={s.skill_id}>
                          {s.skill_name} ({s.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: '1 1 140px' }}>
                    <select
                      className="form-select"
                      value={skillToAdd.proficiencyLevel}
                      onChange={(e) => setSkillToAdd({ ...skillToAdd, proficiencyLevel: e.target.value })}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>

                  <div style={{ flex: '1 1 120px' }}>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      className="form-input"
                      placeholder="Years exp"
                      value={skillToAdd.yearsExperience}
                      onChange={(e) => setSkillToAdd({ ...skillToAdd, yearsExperience: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={addingSkill || !skillToAdd.skillId}>
                    {addingSkill ? 'Adding...' : '+ Add Skill'}
                  </button>
                </form>

                {(!profile?.skills || profile.skills.length === 0) ? (
                  <p className="text-secondary text-sm">No skills added to your profile yet.</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Skill Name</th>
                          <th>Category</th>
                          <th>Proficiency</th>
                          <th>Experience</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.skills.map((s) => (
                          <tr key={s.skill_id}>
                            <td><strong>{s.skill_name}</strong></td>
                            <td>{s.category}</td>
                            <td><StatusBadge status={s.proficiency_level} /></td>
                            <td>{s.years_experience} {s.years_experience === 1 ? 'year' : 'years'}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRemoveSkill(s.skill_id)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Employer Profile View & Edit */}
          {user.role === 'employer' && (
            <div className="card">
              <div className="card-header flex justify-between items-center">
                <h3 className="card-title">Company Profile</h3>
                {editing && (
                  <button className="btn btn-sm btn-secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSaveEmployer}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Company Name *</label>
                      <input
                        className="form-input"
                        value={employerForm.companyName}
                        onChange={(e) => setEmployerForm({ ...employerForm, companyName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Industry</label>
                      <input
                        className="form-input"
                        value={employerForm.industry}
                        onChange={(e) => setEmployerForm({ ...employerForm, industry: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        className="form-input"
                        value={employerForm.phone}
                        onChange={(e) => setEmployerForm({ ...employerForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Website</label>
                      <input
                        className="form-input"
                        value={employerForm.website}
                        onChange={(e) => setEmployerForm({ ...employerForm, website: e.target.value })}
                        placeholder="https://company.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      className="form-input"
                      value={employerForm.address}
                      onChange={(e) => setEmployerForm({ ...employerForm, address: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-sm">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <span className="text-secondary text-sm">Company Name</span>
                    <p className="font-semibold">{profile?.company_name || '—'}</p>
                  </div>
                  <div>
                    <span className="text-secondary text-sm">Industry</span>
                    <p className="font-semibold">{profile?.industry || '—'}</p>
                  </div>
                  <div>
                    <span className="text-secondary text-sm">Phone</span>
                    <p className="font-semibold">{profile?.phone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-secondary text-sm">Website</span>
                    <p className="font-semibold">
                      {profile?.website ? (
                        <a href={profile.website} target="_blank" rel="noreferrer">
                          {profile.website}
                        </a>
                      ) : (
                        '—'
                      )}
                    </p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span className="text-secondary text-sm">Office Address</span>
                    <p className="font-semibold">{profile?.address || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admin or Training Provider info */}
          {user.role === 'admin' && (
            <div className="card">
              <h3 className="card-title mb-2">Administrator Role</h3>
              <p className="text-secondary">
                You possess full administrative authorization over user accounts, platform statistics, training programs, and job placements.
              </p>
            </div>
          )}

          {user.role === 'training_provider' && (
            <div className="card">
              <h3 className="card-title mb-2">Training Provider Profile</h3>
              <p className="text-secondary">
                Connected email: <strong className="text-primary">{user.email}</strong>. Use the Training page to create and curate training curricula, review course enrollments, and certify graduates.
              </p>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
