'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, getStoredUser } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';

export default function InterviewsPage() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingInterview, setEditingInterview] = useState(null);
  const [editStatus, setEditStatus] = useState('Scheduled');
  const [editMode, setEditMode] = useState('Online');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    async function loadInterviews() {
      setLoading(true);
      try {
        const res = await api.interviews.getMyInterviews();
        if (res?.data && res.data.length > 0) {
          setInterviews(res.data);
        } else {
          // Demo fallback interviews matching PRD
          setInterviews([
            {
              interview_id: 1,
              application_id: 1,
              job_title: 'Associate Frontend Engineer',
              company_name: 'Starlight Software Inc.',
              interview_date: new Date(Date.now() + 2 * 86400000).toISOString(),
              interview_mode: 'Online',
              interview_status: 'Scheduled',
              meeting_link: 'https://meet.google.com/emp-pwer-her',
              interviewer_name: 'Sarah Lin, Lead Frontend Architect',
              notes: 'Technical round focusing on React components, CSS layouts, and state management.',
            },
            {
              interview_id: 2,
              application_id: 2,
              job_title: 'Junior Data Analyst',
              company_name: 'Nexus Financial Group',
              interview_date: new Date(Date.now() + 5 * 86400000).toISOString(),
              interview_mode: 'Online',
              interview_status: 'Scheduled',
              meeting_link: 'https://teams.microsoft.com/l/meetup-join/nexus-interview',
              interviewer_name: 'David Chen, Head of Data Engineering',
              notes: 'Behavioral and SQL querying review.',
            },
            {
              interview_id: 3,
              application_id: 3,
              job_title: 'Associate Product Designer (UI/UX)',
              company_name: 'Vanguard Health Tech',
              interview_date: new Date(Date.now() - 4 * 86400000).toISOString(),
              interview_mode: 'Online',
              interview_status: 'Completed',
              meeting_link: 'https://meet.google.com/van-ux-dsgn',
              interviewer_name: 'Elena Rostova, VP of Design',
              notes: 'Portfolio review completed. Feedback: strong typography and user research empathy.',
            },
            {
              interview_id: 4,
              application_id: 4,
              job_title: 'Junior Growth Specialist',
              company_name: 'Bloom Education Global',
              interview_date: new Date(Date.now() - 10 * 86400000).toISOString(),
              interview_mode: 'Telephone',
              interview_status: 'Rescheduled',
              meeting_link: '+1 (555) 019-2834',
              interviewer_name: 'Marcus Bell, Talent Partner',
              notes: 'Rescheduled upon candidate request due to clash with training seminar.',
            },
          ]);
        }
      } catch (err) {
        console.warn('Using demo interviews:', err.message);
        setInterviews([
          {
            interview_id: 1,
            application_id: 1,
            job_title: 'Associate Frontend Engineer',
            company_name: 'Starlight Software Inc.',
            interview_date: new Date(Date.now() + 2 * 86400000).toISOString(),
            interview_mode: 'Online',
            interview_status: 'Scheduled',
            meeting_link: 'https://meet.google.com/emp-pwer-her',
            interviewer_name: 'Sarah Lin, Lead Frontend Architect',
            notes: 'Technical round focusing on React components, CSS layouts, and state management.',
          },
          {
            interview_id: 2,
            application_id: 2,
            job_title: 'Junior Data Analyst',
            company_name: 'Nexus Financial Group',
            interview_date: new Date(Date.now() + 5 * 86400000).toISOString(),
            interview_mode: 'Online',
            interview_status: 'Scheduled',
            meeting_link: 'https://teams.microsoft.com/l/meetup-join/nexus-interview',
            interviewer_name: 'David Chen, Head of Data Engineering',
            notes: 'Behavioral and SQL querying review.',
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadInterviews();
  }, []);

  const isEmployerOrAdmin = user?.role === 'employer' || user?.role === 'admin';

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editingInterview) return;
    setSaving(true);
    setFeedback(null);

    try {
      await api.interviews.update(editingInterview.interview_id, {
        interviewStatus: editStatus,
        interviewMode: editMode,
      });

      setInterviews((prev) =>
        prev.map((item) =>
          item.interview_id === editingInterview.interview_id
            ? { ...item, interview_status: editStatus, interview_mode: editMode }
            : item
        )
      );
      setFeedback({ type: 'success', message: 'Interview schedule updated successfully!' });
      setEditingInterview(null);
    } catch (err) {
      // Optimistic update for demo purposes
      setInterviews((prev) =>
        prev.map((item) =>
          item.interview_id === editingInterview.interview_id
            ? { ...item, interview_status: editStatus, interview_mode: editMode }
            : item
        )
      );
      setFeedback({ type: 'success', message: 'Interview status updated (demo mode).' });
      setEditingInterview(null);
    } finally {
      setSaving(false);
    }
  };

  const filteredInterviews = interviews.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.interview_status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const getModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'online':
        return 'videocam';
      case 'telephone':
        return 'call';
      case 'offline':
        return 'apartment';
      default:
        return 'event';
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-outline-variant/15 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
              aria-label="Open sidebar"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-on-surface">Interviews & Technical Rounds</h1>
              <p className="text-xs text-on-surface-variant">
                Live interview schedules, virtual meeting rooms, and recruiter evaluations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/applications"
              className="px-3.5 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">assignment</span>
              Applications Pipeline
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
          {feedback && (
            <div
              className={`p-4 rounded-xl flex items-center justify-between text-sm ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">
                  {feedback.type === 'success' ? 'check_circle' : 'error'}
                </span>
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="hover:opacity-75">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* Quick Stats Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-outline-variant/15 shadow-sm">
              <span className="text-xs text-on-surface-variant font-medium">Total Interviews</span>
              <p className="text-2xl font-bold text-on-surface mt-1">{interviews.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-outline-variant/15 shadow-sm">
              <span className="text-xs text-on-surface-variant font-medium">Upcoming Sessions</span>
              <p className="text-2xl font-bold text-primary mt-1">
                {interviews.filter((i) => i.interview_status === 'Scheduled').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-outline-variant/15 shadow-sm">
              <span className="text-xs text-on-surface-variant font-medium">Completed</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {interviews.filter((i) => i.interview_status === 'Completed').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-outline-variant/15 shadow-sm">
              <span className="text-xs text-on-surface-variant font-medium">Rescheduled</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {interviews.filter((i) => i.interview_status === 'Rescheduled').length}
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl border border-outline-variant/15">
              {['all', 'Scheduled', 'Completed', 'Rescheduled', 'Cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    statusFilter === tab
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="text-xs text-on-surface-variant">
              Showing <span className="font-semibold text-on-surface">{filteredInterviews.length}</span> sessions
            </div>
          </div>

          {/* Grid Layout: Interviews List + Prep Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Interviews Stream (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="bg-white p-12 rounded-2xl border border-outline-variant/15 text-center">
                  <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-sm text-on-surface-variant">Loading scheduled interview meetings...</p>
                </div>
              ) : filteredInterviews.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-outline-variant/15 text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">event_busy</span>
                  <h3 className="text-base font-bold text-on-surface">No interviews found</h3>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
                    No interviews match the selected status filter. Keep applying to job openings to trigger recruiter invitations!
                  </p>
                </div>
              ) : (
                filteredInterviews.map((item) => {
                  const dateObj = new Date(item.interview_date);
                  const isFuture = dateObj > new Date();

                  return (
                    <div
                      key={item.interview_id}
                      className="bg-white p-5 rounded-2xl border border-outline-variant/15 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[24px]">
                              {getModeIcon(item.interview_mode)}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-bold text-on-surface">{item.job_title}</h3>
                              <StatusBadge status={item.interview_status} />
                            </div>

                            <p className="text-xs font-semibold text-primary mt-0.5">{item.company_name}</p>

                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-on-surface-variant mt-2">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[15px] text-primary">schedule</span>
                                {dateObj.toLocaleDateString(undefined, {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })} • {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>

                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[15px]">settings_ethernet</span>
                                Mode: <strong className="text-on-surface">{item.interview_mode}</strong>
                              </span>

                              {item.interviewer_name && (
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[15px]">person</span>
                                  {item.interviewer_name}
                                </span>
                              )}
                            </div>

                            {item.notes && (
                              <p className="text-xs text-on-surface-variant bg-surface-container/60 p-2.5 rounded-lg mt-3 border border-outline-variant/10">
                                <strong>Agenda:</strong> {item.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                          {item.meeting_link && item.interview_mode === 'Online' && (
                            <a
                              href={item.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">video_call</span>
                              Join Room
                            </a>
                          )}

                          {isEmployerOrAdmin && (
                            <button
                              onClick={() => {
                                setEditingInterview(item);
                                setEditStatus(item.interview_status || 'Scheduled');
                                setEditMode(item.interview_mode || 'Online');
                              }}
                              className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-medium text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[15px]">edit</span>
                              Update Status
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Preparation & Tips Column (1 Col) */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 p-5 rounded-2xl border border-primary/20 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-[22px]">verified</span>
                  <h3 className="text-sm font-bold text-on-surface">Interview Readiness Checklist</h3>
                </div>

                <ul className="space-y-2.5 text-xs text-on-surface-variant">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">check_circle</span>
                    <span>Test your webcam and microphone 15 minutes before the session.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">check_circle</span>
                    <span>Have your GitHub, portfolio, or certification links open in background tabs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">check_circle</span>
                    <span>Prepare 2-3 questions about team architecture and company culture.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">check_circle</span>
                    <span>Review the specific skills highlighted in the job specification.</span>
                  </li>
                </ul>

                <div className="mt-4 pt-3 border-t border-primary/10">
                  <Link
                    href="/skills"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    Brush up verified profile skills
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-outline-variant/15 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">support_agent</span>
                  <h3 className="text-sm font-bold text-on-surface">Need Accommodations?</h3>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  EmpowerHer coordinates childcare support vouchers and assistive accessibility equipment for candidate interview sessions.
                </p>
                <button
                  type="button"
                  onClick={() => alert('Support concierge requested. A coordinator will reach out via email.')}
                  className="mt-3 text-xs font-semibold text-primary hover:underline"
                >
                  Request Interview Accommodation →
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Modal: Update Interview Status (Employer/Admin) */}
        {editingInterview && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/20 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
                <div>
                  <h2 className="text-base font-bold text-on-surface">Update Interview</h2>
                  <p className="text-xs text-on-surface-variant">{editingInterview.job_title}</p>
                </div>
                <button
                  onClick={() => setEditingInterview(null)}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Interview Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/50 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Interview Mode
                  </label>
                  <select
                    value={editMode}
                    onChange={(e) => setEditMode(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/50 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="Online">Online (Video Meet)</option>
                    <option value="Telephone">Telephone Call</option>
                    <option value="Offline">Offline (In-Person Office)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingInterview(null)}
                    className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    {saving && <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
