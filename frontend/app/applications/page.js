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

  // Interview Scheduling Modal State (for Employer & Admin)
  const [selectedAppForInterview, setSelectedAppForInterview] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    interviewDate: '',
    interviewTime: '11:00 AM',
    interviewMode: 'Online',
  });
  const [isScheduling, setIsScheduling] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    async function loadApplications() {
      setLoading(true);
      try {
        const res = await api.applications.getMyApplications();
        if (res?.data && res.data.length > 0) {
          setApplications(res.data);
        } else {
          // Fallback realistic applications matching PRD
          setApplications([
            {
              application_id: 1,
              job_id: 1,
              job_title: 'Associate Frontend Engineer',
              company_name: 'Starlight Software Inc.',
              location: 'Remote • US/Canada',
              salary_range: '$78,000 - $88,000 / yr',
              applied_at: new Date(Date.now() - 2 * 86400000).toISOString(),
              status: 'Interviewing',
              candidate_name: 'Priya Sharma',
            },
            {
              application_id: 2,
              job_id: 2,
              job_title: 'Junior Data Analyst',
              company_name: 'Nexus Financial Group',
              location: 'Hybrid • New York, NY',
              salary_range: '$70,000 - $82,000 / yr',
              applied_at: new Date(Date.now() - 5 * 86400000).toISOString(),
              status: 'Shortlisted',
              candidate_name: 'Priya Sharma',
            },
            {
              application_id: 3,
              job_id: 3,
              job_title: 'Associate Product Designer (UI/UX)',
              company_name: 'Vanguard Health Tech',
              location: 'Remote • Global',
              salary_range: '$85,000 - $95,000 / yr',
              applied_at: new Date(Date.now() - 9 * 86400000).toISOString(),
              status: 'Reviewed',
              candidate_name: 'Priya Sharma',
            },
            {
              application_id: 4,
              job_id: 4,
              job_title: 'Junior Growth Specialist',
              company_name: 'OmniRetail E-Commerce',
              location: 'Hybrid • Austin, TX',
              salary_range: '$65,000 - $75,000 / yr',
              applied_at: new Date(Date.now() - 14 * 86400000).toISOString(),
              status: 'Applied',
              candidate_name: 'Priya Sharma',
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
    try {
      await api.applications.updateStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a.application_id === appId ? { ...a, status: newStatus } : a))
      );
      setFeedback({ type: 'success', text: `Application status updated to ${newStatus}.` });
    } catch (err) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedAppForInterview) return;
    setIsScheduling(true);

    try {
      await api.applications.scheduleInterview(selectedAppForInterview.application_id, {
        interviewDate: `${interviewForm.interviewDate} ${interviewForm.interviewTime}`,
        interviewMode: interviewForm.interviewMode,
      });

      // Update app status locally to Interviewing
      setApplications((prev) =>
        prev.map((a) =>
          a.application_id === selectedAppForInterview.application_id
            ? { ...a, status: 'Interviewing' }
            : a
        )
      );

      setSelectedAppForInterview(null);
      setFeedback({ type: 'success', text: 'Interview scheduled successfully and notified to candidate!' });
    } catch (err) {
      alert(err.message || 'Failed to schedule interview.');
    } finally {
      setIsScheduling(false);
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
              Application Activity & Interview Tracker
            </h1>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Track hiring progress, scheduled technical screening rounds, and official placement offers.
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
              {['all', 'Applied', 'Reviewed', 'Shortlisted', 'Interviewing', 'Offered'].map((stage) => (
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

          {/* Applications Table / Cards */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/15 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-label-sm text-on-surface-variant uppercase font-semibold border-b border-outline-variant/20">
                    <th className="py-3.5 px-6">Position & Company</th>
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">Applied On</th>
                    <th className="py-3.5 px-6">Current Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-body-md text-on-surface">
                  {filtered.length > 0 ? (
                    filtered.map((app) => (
                      <tr key={app.application_id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-on-surface">{app.job_title}</div>
                          <div className="text-body-sm text-secondary font-medium">{app.company_name}</div>
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant text-body-sm">
                          {app.location || 'Remote'}
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant text-body-sm">
                          {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={app.status || 'Applied'} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(user?.role === 'employer' || user?.role === 'admin') && (
                              <>
                                <select
                                  value={app.status}
                                  onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                                  className="text-label-sm px-2 py-1 rounded bg-surface-container border border-outline-variant/30 text-on-surface outline-none"
                                >
                                  <option value="Applied">Applied</option>
                                  <option value="Reviewed">Reviewed</option>
                                  <option value="Shortlisted">Shortlisted</option>
                                  <option value="Interviewing">Interviewing</option>
                                  <option value="Offered">Offered</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                                <button
                                  onClick={() => setSelectedAppForInterview(app)}
                                  className="px-2.5 py-1 rounded-lg bg-primary text-on-primary text-label-sm font-semibold hover:bg-primary-container transition-colors"
                                >
                                  Schedule
                                </button>
                              </>
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
                      <td colSpan={5} className="py-12 text-center text-on-surface-variant">
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

      {/* SCHEDULE INTERVIEW MODAL */}
      {selectedAppForInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedAppForInterview(null)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-5 border border-outline-variant/20 z-10">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
              <h3 className="font-headline-sm font-bold text-on-surface">Schedule Candidate Interview</h3>
              <button onClick={() => setSelectedAppForInterview(null)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div>
                <span className="block text-[11px] font-semibold text-secondary uppercase">Candidate Application</span>
                <p className="font-bold text-on-surface">{selectedAppForInterview.job_title}</p>
                <p className="text-body-sm text-on-surface-variant">{selectedAppForInterview.company_name}</p>
              </div>

              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={interviewForm.interviewDate}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewDate: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none"
                />
              </div>

              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1">Time</label>
                <input
                  type="text"
                  required
                  value={interviewForm.interviewTime}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewTime: e.target.value })}
                  placeholder="e.g. 11:30 AM IST"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none"
                />
              </div>

              <div>
                <label className="block text-label-md font-semibold text-on-surface mb-1">Interview Mode</label>
                <select
                  value={interviewForm.interviewMode}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewMode: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md outline-none"
                >
                  <option value="Online">Online (Google Meet / Zoom)</option>
                  <option value="Telephone">Telephone</option>
                  <option value="Offline">Offline / On-site</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAppForInterview(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-xs hover:bg-primary-container transition-colors disabled:opacity-60"
                >
                  {isScheduling ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
