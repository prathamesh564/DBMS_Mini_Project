'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuth } from '../services/api';

export default function Sidebar({ user, isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    window.dispatchEvent(new Event('empowerher_auth_changed'));
    router.push('/login');
  };

  const role = user?.role || 'woman';

  // Role-specific navigation items
  let workspaceTitle = 'Candidate Workspace';
  let navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'space_dashboard' },
    { name: 'My Profile', href: '/profile', icon: 'person' },
    { name: 'My Skills', href: '/skills', icon: 'psychology' },
    { name: 'Training Programs', href: '/training', icon: 'school' },
    { name: 'My Certifications', href: '/certifications', icon: 'verified' },
    { name: 'Find Jobs', href: '/jobs', icon: 'work' },
    { name: 'My Applications', href: '/applications', icon: 'description' },
    { name: 'Interviews', href: '/interviews', icon: 'event_available' },
    { name: 'Employment Records', href: '/employment', icon: 'history_edu' },
  ];

  if (role === 'training_provider') {
    workspaceTitle = 'Provider Workspace';
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'space_dashboard' },
      { name: 'Provider Profile', href: '/profile', icon: 'apartment' },
      { name: 'Manage Programs', href: '/training', icon: 'school' },
      { name: 'Issue Certifications', href: '/certifications', icon: 'verified' },
      { name: 'All Candidates', href: '/skills', icon: 'groups' },
    ];
  } else if (role === 'employer') {
    workspaceTitle = 'Employer Workspace';
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'space_dashboard' },
      { name: 'Company Profile', href: '/profile', icon: 'domain' },
      { name: 'Job Postings', href: '/jobs', icon: 'work' },
      { name: 'Applications Received', href: '/applications', icon: 'description' },
      { name: 'Interview Schedules', href: '/interviews', icon: 'event_available' },
      { name: 'Confirmed Placements', href: '/employment', icon: 'history_edu' },
    ];
  } else if (role === 'admin') {
    workspaceTitle = 'Admin Console';
    navItems = [
      { name: 'Portal Overview', href: '/admin', icon: 'admin_panel_settings' },
      { name: 'Personal Dashboard', href: '/dashboard', icon: 'space_dashboard' },
      { name: 'Candidate Profiles', href: '/profile', icon: 'groups' },
      { name: 'Skill Taxonomy', href: '/skills', icon: 'psychology' },
      { name: 'Training Catalog', href: '/training', icon: 'school' },
      { name: 'Job Opportunities', href: '/jobs', icon: 'work' },
      { name: 'Applications', href: '/applications', icon: 'description' },
      { name: 'Interviews', href: '/interviews', icon: 'event_available' },
      { name: 'Certifications', href: '/certifications', icon: 'verified' },
      { name: 'Employment Records', href: '/employment', icon: 'history_edu' },
    ];
  }

  const isActive = (href) => {
    if (href === '/dashboard' || href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="h-14 px-6 flex items-center justify-between gap-2 border-b border-outline-variant/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">spa</span>
            </div>
            <span className="font-headline-sm text-headline-sm text-primary font-bold">EmpowerHer</span>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Section Label */}
        <div className="px-6 pt-4 pb-2">
          <span className="font-label-sm text-[11px] uppercase tracking-wider font-bold text-on-surface-variant">
            {workspaceTitle}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name + item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-lg text-label-lg transition-all ${
                  active
                    ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${active ? 'text-on-primary' : 'text-primary'}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Details */}
      <div className="px-4 py-3 border-t border-outline-variant/20 flex items-center justify-between bg-surface-container-low/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center text-label-md shrink-0 uppercase">
            {user?.email ? user.email.charAt(0) : 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-on-surface leading-tight font-semibold truncate">
              {user?.email ? user.email.split('@')[0] : 'Guest User'}
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant capitalize truncate">
              {user?.role || 'Candidate'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container/30 hover:text-error transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-surface-container-low z-40 flex-col shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-outline-variant/20">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-surface-container-low shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
