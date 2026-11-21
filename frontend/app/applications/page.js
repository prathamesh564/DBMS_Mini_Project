'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, getStoredUser } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';

export default function ApplicationsPage() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState(null);
  const [updatingAppId, setUpdatingAppId] = useState(null);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    async function loadApplications() {
      setLoading(true);
      try {
        let res;
        if (currentUser?.role === 'admin') {
          res = await api.applications.listAll();
        } else {
          res = await api.applications.getMyApplications();
        }

        const rawList = Array.isArray(res?.data) ? res.data : (res?.data?.applications || []);

        if (rawList.length > 0) {
          setApplications(rawList);
        } else {
          // Default sample applications
          setApplications([
            {
              application_id: 1,
              job_id: 1,
              job_title: 'Associate Frontend Engineer',
              company_name: 'Starlight Software Inc.',
              location: 'Remote • India/Global',
              applied_at: new Date(Date.now() - 2 * 86400000).toISOString(),
              status: 'Interviewing',
              candidate_name: 'Priya Sharma',
              email: 'priya.sharma@example.com',
              cover_note: 'Completed 12-week Full-Stack PostgreSQL cohort with high honors. Eager to contribute to web engineering.',
            },
            {
              application_id: 2,
              job_id: 2,
              job_title: 'Junior Data Analyst',
              company_name: 'Nexus Financial Group',
              location: 'Hybrid • Bengaluru',
              applied_at: new Date(Date.now() - 5 * 86400000).toISOString(),
              status: 'Shortlisted',
              candidate_name: 'Priya Sharma',
              email: 'priya.sharma@example.com',
              cover_note: 'Strong proficiency in SQL queries, Python data analysis, and PowerBI visualization dashboards.',
            },
            {
              application_id: 3,
              job_id: 4,
              job_title: 'Associate Product Designer (UI/UX)',
              company_name: 'Vanguard Health Tech',
              location: 'Remote • Global',
              applied_at: new Date(Date.now() - 9 * 86400000).toISOString(),
              status: 'Reviewed',
              candidate_name: 'Priya Sharma',
              email: 'priya.sharma@example.com',
              cover_note: 'Figma and WCAG 2.2 accessibility certification recipient. Excited to build inclusive health interfaces.',
            },
            {
              application_id: 4,
              job_id: 3,
              job_title: 'Cloud DevOps Associate',
              company_name: 'CloudBridge Labs',
              location: 'Remote • Global',
              applied_at: new Date(Date.now() - 14 * 86400000).toISOString(),
              status: 'Applied',
              candidate_name: 'Priya Sharma',
              email: 'priya.sharma@example.com',
              cover_note: 'Hands-on practice containerizing applications with Docker and building CI/CD deployment pipelines.',
            },
          ]);
        }
      } catch (err) {
        console.warn('Applications fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingAppId(appId);
    try {
      await api.applications.updateStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a.application_id === appId ? { ...a, status: newStatus } : a))
      );
      setFeedback({ type: 'success', text: `Application #${appId} status updated to "${newStatus}".` });
    } catch (err) {
      alert(err.message || 'Status update failed.');
    } finally {
      setUpdatingAppId(null);
    }
  };

  const filtered = statusFilter === 'all'
    ? applications
    : applications.filter((a) => a.status?.toLowerCase() === statusFilter.toLowerCase());

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center justify-between p-4 bg-surface border-b border-outline-variant/15">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
            <span className="font-label-md font-bold text-on-surface">Menu</span>
          </button>
          <span className="font-headline-sm text-primary font-bold">Applications</span>
        </div>

        <main className="p-6 lg:p-10 space-y-8 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="space-y-2">
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
              Employment Pipeline
            </span>
            <h1 className="font-headline-lg font-bold text-on-surface tracking-tight">
              {user?.role === 'admin' ? 'Platform Job Applications Management' : 'My Job Applications & Status Tracker'}
            </h1>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              {user?.role === 'admin'
                ? 'Review submitted candidate applications, evaluate candidate cover notes, and manage hiring stages.'
                : 'Track the status of your applications submitted across partner employers.'}
            </p>
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-xl flex items-center justify-between gap-2 shadow-xs ${
                feedback.type === 'success'
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed font-semibold'
                  : 'bg-error-container text-on-error-container'
              }`}
            >
              <span>{feedback.text}</span>
              <button onClick={() => setFeedback(null)}>
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-label-md text-label-md text-on-surface-variant font-semibold">Stage Filter:</span>
              {['all', 'Applied', 'Reviewed', 'Shortlisted', 'Interviewing', 'Offered', 'Accepted', 'Rejected'].map((stage) => (
                <button
                  key={stage}
                  onClick={() => setStatusFilter(stage)}
                  className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-colors ${
                    statusFilter === stage
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {stage === 'all' ? 'All Applications' : stage}
                </button>
              ))}
            </div>
            <span className="font-label-md text-on-surface-variant">
              Showing {filtered.length} application{filtered.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Applications Table */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/15 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-label-sm text-on-surface-variant uppercase font-semibold border-b border-outline-variant/20">
                    <th className="py-3.5 px-6">Position & Company</th>
                    {user?.role === 'admin' && <th className="py-3.5 px-6">Candidate</th>}
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">Applied On</th>
                    <th className="py-3.5 px-6">Current Status</th>
                    <th className="py-3.5 px-6">Cover Note</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-body-md text-on-surface">
                  {loading ? (
                    <tr>
                      <td colSpan={user?.role === 'admin' ? 7 : 6} className="py-12 text-center text-primary">
                        <div className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined animate-spin">refresh</span>
                          <span>Loading applications...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length > 0 ? (
                    filtered.map((app) => (
                      <tr key={app.application_id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-on-surface">{app.job_title}</div>
                          <div className="text-body-sm text-primary font-medium">{app.company_name}</div>
                        </td>
                        {user?.role === 'admin' && (
                          <td className="py-4 px-6">
                            <div className="font-semibold text-on-surface">{app.candidate_name || 'Candidate'}</div>
                            <div className="text-[11px] text-on-surface-variant">{app.email}</div>
                          </td>
                        )}
                        <td className="py-4 px-6 text-on-surface-variant text-body-sm">
                          {app.location || 'Remote'}
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant text-body-sm">
                          {app.applied_at || app.application_date
                            ? new Date(app.applied_at || app.application_date).toLocaleDateString()
                            : 'Recent'}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={app.status || 'Applied'} />
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <p className="text-body-sm text-on-surface-variant truncate" title={app.cover_note}>
                            {app.cover_note || '—'}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {user?.role === 'admin' && (
                              <select
                                value={app.status}
                                disabled={updatingAppId === app.application_id}
                                onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                                className="text-xs px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface outline-none cursor-pointer font-semibold"
                              >
                                <option value="Applied">Applied</option>
                                <option value="Reviewed">Reviewed</option>
                                <option value="Shortlisted">Shortlisted</option>
                                <option value="Interviewing">Interviewing</option>
                                <option value="Offered">Offered</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            )}
                            <Link
                              href={`/jobs/${app.job_id || ''}`}
                              className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm font-semibold hover:bg-surface-container-high transition-colors"
                            >
                              View Job
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={user?.role === 'admin' ? 7 : 6} className="py-12 text-center text-on-surface-variant">
                        No applications found in this stage.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
