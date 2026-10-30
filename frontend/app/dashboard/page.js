'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [myApps, setMyApps] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [myInterviews, setMyInterviews] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (!user) return;

    const promises = [];

    // Admin dashboard statistics
    if (user.role === 'admin') {
      promises.push(
        api.get('/admin/statistics').then((r) => {
          if (r.data.success) setStats(r.data.data);
        }).catch(() => {})
      );
    }

    // Candidate (woman) activity overview
    if (user.role === 'woman') {
      promises.push(
        api.get('/applications/me').then((r) => {
          if (r.data.success) setMyApps(r.data.data || []);
        }).catch(() => {}),
        api.get('/training/enrollments/me').then((r) => {
          if (r.data.success) setMyEnrollments(r.data.data || []);
        }).catch(() => {}),
        api.get('/interviews/me').then((r) => {
          if (r.data.success) setMyInterviews(r.data.data || []);
        }).catch(() => {})
      );
    }

    // Employer or general recent jobs
    promises.push(
      api.get('/jobs', { params: { limit: 5 } }).then((r) => {
        if (r.data.success && r.data.data?.jobs) {
          setRecentJobs(r.data.data.jobs);
        }
      }).catch(() => {})
    );

    Promise.all(promises).finally(() => setFetching(false));
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <AppShell title="Dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome back, {user.profile?.full_name || user.profile?.company_name || user.profile?.provider_name || user.email.split('@')[0]}
          </h1>
          <p className="page-subtitle">
            Role: <span className="font-semibold" style={{ textTransform: 'capitalize' }}>{user.role.replace('_', ' ')}</span> &bull; Women Skill Development &amp; Employment Portal
          </p>
        </div>
      </div>

      {/* Admin stats */}
      {user.role === 'admin' && stats && (
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
            <div className="stat-icon teal">💼</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalOpenJobs ?? 0}</div>
              <div className="stat-label">Active Open Jobs</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pink">📋</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalApplications ?? 0}</div>
              <div className="stat-label">Total Applications</div>
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

      {/* Woman overview */}
      {user.role === 'woman' && !fetching && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">📋</div>
              <div className="stat-info">
                <div className="stat-value">{myApps.length}</div>
                <div className="stat-label">Applications Submitted</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">📚</div>
              <div className="stat-info">
                <div className="stat-value">{myEnrollments.length}</div>
                <div className="stat-label">Program Enrollments</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">🗓️</div>
              <div className="stat-info">
                <div className="stat-value">{myInterviews.length}</div>
                <div className="stat-label">Interviews Scheduled</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            {/* Recent applications */}
            <div className="card">
              <div className="card-header flex justify-between items-center">
                <h3 className="card-title">My Recent Applications</h3>
                <Link href="/applications" className="btn btn-sm btn-secondary">View All</Link>
              </div>
              {myApps.length === 0 ? (
                <p className="text-secondary text-sm">You haven&apos;t applied for any jobs yet.</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myApps.slice(0, 4).map((app) => (
                        <tr key={app.application_id}>
                          <td><strong>{app.job_title}</strong></td>
                          <td>{app.company_name}</td>
                          <td><StatusBadge status={app.application_status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent enrollments */}
            <div className="card">
              <div className="card-header flex justify-between items-center">
                <h3 className="card-title">My Training Programs</h3>
                <Link href="/training" className="btn btn-sm btn-secondary">View All</Link>
              </div>
              {myEnrollments.length === 0 ? (
                <p className="text-secondary text-sm">You are not enrolled in any training programs yet.</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Program</th>
                        <th>Provider</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myEnrollments.slice(0, 4).map((enr) => (
                        <tr key={enr.enrollment_id}>
                          <td><strong>{enr.program_name}</strong></td>
                          <td>{enr.provider_name}</td>
                          <td><StatusBadge status={enr.completion_status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Quick shortcuts for Employer / Training Provider */}
      {(user.role === 'employer' || user.role === 'training_provider') && (
        <div className="card mt-4">
          <h3 className="card-title mb-2">Portal Actions</h3>
          <p className="text-secondary mb-4">
            Manage your listings, candidate reviews, and workflows through the navigation sidebar:
          </p>
          <div className="flex gap-sm flex-wrap">
            {user.role === 'employer' && (
              <>
                <Link href="/jobs" className="btn btn-primary">+ Post New Job</Link>
                <Link href="/interviews" className="btn btn-secondary">View Interviews</Link>
                <Link href="/employment" className="btn btn-secondary">Record Placements</Link>
              </>
            )}
            {user.role === 'training_provider' && (
              <>
                <Link href="/training" className="btn btn-primary">+ Create Training Program</Link>
                <Link href="/certifications" className="btn btn-secondary">Issue Certifications</Link>
                <Link href="/skills" className="btn btn-secondary">Manage Skills</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Latest Open Jobs across portal */}
      <div className="card mt-4">
        <div className="card-header flex justify-between items-center">
          <h3 className="card-title">Explore Active Job Openings</h3>
          <Link href="/jobs" className="btn btn-sm btn-secondary">Explore All Jobs</Link>
        </div>
        {recentJobs.length === 0 ? (
          <p className="text-secondary text-sm">No job postings currently available.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((j) => (
                  <tr key={j.job_id}>
                    <td><strong>{j.job_title}</strong></td>
                    <td>{j.company_name}</td>
                    <td>{j.job_location || 'Remote'}</td>
                    <td><span className="badge badge-blue">{j.employment_type || 'Full-Time'}</span></td>
                    <td><StatusBadge status={j.status} /></td>
                    <td>
                      <Link href={`/jobs`} className="btn btn-sm btn-secondary">Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
