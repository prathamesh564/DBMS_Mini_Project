'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getStoredUser, clearAuth } from '../services/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());

    // Listen for storage changes across tabs or custom login events
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('empowerher_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('empowerher_auth_changed', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    window.dispatchEvent(new Event('empowerher_auth_changed'));
    router.push('/login');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Training Programs', href: '/training' },
    { name: 'Find Jobs', href: '/jobs' },
    { name: 'Applications', href: '/applications' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Admin', href: '/admin' });
  }

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/20 transition-all">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">spa</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">EmpowerHer</span>
            <span className="text-[10px] text-on-surface-variant font-medium -mt-1 hidden sm:block tracking-wider uppercase">Skills & Career Portal</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-xl text-label-lg font-label-lg transition-all ${
                  active
                    ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-surface-container-low transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center text-label-md uppercase shadow-xs">
                  {user.email ? user.email.charAt(0) : 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-label-md font-label-md font-semibold text-on-surface leading-tight truncate max-w-[120px]">
                    {user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-primary capitalize font-medium">{user.role || 'Member'}</span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-label-lg font-label-lg text-primary hover:bg-surface-container-low transition-colors font-semibold"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-container transition-all font-semibold"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-4 space-y-2 shadow-lg animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-label-lg font-label-lg ${
                isActive(link.href)
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {!user && (
            <div className="pt-3 border-t border-outline-variant/20 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-primary font-label-lg font-semibold bg-surface-container-low"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-primary text-on-primary font-label-lg font-semibold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
