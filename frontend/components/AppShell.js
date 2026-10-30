'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const navSections = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    ],
  },
  {
    label: 'Career',
    items: [
      { href: '/jobs', label: 'Jobs', icon: '💼' },
      { href: '/applications', label: 'Applications', icon: '📋' },
      { href: '/interviews', label: 'Interviews', icon: '🗓️' },
      { href: '/employment', label: 'Employment', icon: '🏢' },
    ],
  },
  {
    label: 'Development',
    items: [
      { href: '/training', label: 'Training', icon: '📚' },
      { href: '/skills', label: 'Skills', icon: '⚡' },
      { href: '/certifications', label: 'Certifications', icon: '🏅' },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/profile', label: 'Profile', icon: '👤' },
    ],
  },
];

export default function AppShell({ children, title }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">W</div>
          <span>SkillPortal</span>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}

          {user?.role === 'admin' && (
            <div>
              <div className="sidebar-section-label">Admin</div>
              <Link
                href="/admin"
                className={`sidebar-link ${pathname === '/admin' ? 'active' : ''}`}
              >
                <span className="nav-icon">⚙️</span>
                Admin Panel
              </Link>
            </div>
          )}
        </nav>

        {user && (
          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="sidebar-avatar">
                {(user.email || '?')[0].toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.email}</div>
                <div className="sidebar-user-role">{user.role?.replace('_', ' ')}</div>
              </div>
            </div>
            <button className="sidebar-link" onClick={logout} style={{ marginTop: '0.5rem' }}>
              <span className="nav-icon">🚪</span>
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="main-area">
        <header className="navbar">
          <h2 className="navbar-title">{title || ''}</h2>
          <div className="navbar-actions">
            {user && (
              <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>
                {user.role?.replace('_', ' ')}
              </span>
            )}
          </div>
        </header>
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}
