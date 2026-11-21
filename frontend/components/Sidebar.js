'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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

  // Role-specific navigation items (Exactly 3 Roles: Woman Candidate, Training Provider, Admin)
  let workspaceTitle = 'Candidate Workspace';
  let navItems = [];

  if (role === 'training_provider') {
    workspaceTitle = 'Training Provider Workspace';
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'space_dashboard' },
      { name: 'My Programs', href: '/training?tab=my_programs', icon: 'school' },
      { name: 'Create Program', href: '/training?create=true', icon: 'add_circle' },
      { name: 'Enrolled Candidates', href: '/training?tab=enrollments', icon: 'groups' },
      { name: 'Training Progress', href: '/training?tab=progress', icon: 'trending_up' },
    ];
  } else if (role === 'admin') {
    workspaceTitle = 'Admin Console';
    navItems = [
      { name: 'Dashboard', href: '/admin', icon: 'admin_panel_settings' },
      { name: 'Users', href: '/admin?tab=users', icon: 'manage_accounts' },
      { name: 'Candidates', href: '/admin?tab=candidates', icon: 'groups' },
      { name: 'Skills', href: '/skills', icon: 'psychology' },
      { name: 'Training Programs', href: '/training', icon: 'school' },
      { name: 'Job Management', href: '/jobs', icon: 'work' },
      { name: 'Applications', href: '/applications', icon: 'description' },
      { name: 'Analytics', href: '/admin?tab=analytics', icon: 'analytics' },
    ];
  } else {
    // Default Candidate: Woman
    workspaceTitle = 'Candidate Workspace';
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'space_dashboard' },
      { name: 'My Profile', href: '/profile', icon: 'person' },
      { name: 'My Skills', href: '/skills', icon: 'psychology' },
      { name: 'Training Programs', href: '/training', icon: 'school' },
      { name: 'My Enrollments', href: '/training?tab=enrollments', icon: 'assignment_turned_in' },
      { name: 'Jobs', href: '/jobs', icon: 'work' },
      { name: 'My Applications', href: '/applications', icon: 'description' },
    ];
  }

  const isActive = (href) => {
    const baseHref = href.split('?')[0];
    if (baseHref === '/dashboard' || baseHref === '/admin') {
      return pathname === baseHref;
    }
    return pathname.startsWith(baseHref);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between gap-2 border-b border-outline-variant/10">
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
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Section Label */}
        <div className="px-6 pt-5 pb-2">
          <span className="font-label-sm text-[11px] uppercase tracking-wider font-bold text-on-surface-variant">
            {workspaceTitle}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-label-md text-label-md transition-all ${
                  active
                    ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Sign Out */}
      <div className="p-4 border-t border-outline-variant/10 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center text-label-md uppercase shadow-xs">
            {user?.email ? user.email.charAt(0) : 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
              {user?.email || 'Guest User'}
            </span>
            <span className="text-[11px] text-primary capitalize font-medium">
              {role === 'training_provider' ? 'Training Provider' : role}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-outline-variant/20 text-on-surface-variant hover:text-error hover:bg-error-container/10 transition-colors text-label-md font-medium"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Static Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-container-lowest border-r border-outline-variant/15 fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-surface-container-lowest border-r border-outline-variant/15 h-full z-10 shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
