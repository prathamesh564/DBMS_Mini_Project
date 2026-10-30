import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/training', label: 'Training' },
  { href: '/applications', label: 'Applications' },
  { href: '/certifications', label: 'Certifications' },
  { href: '/employment', label: 'Employment' },
  { href: '/profile', label: 'Profile' },
];

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 h-full p-4 shadow-md">
      <div className="mb-6 text-xl font-semibold text-primary">Menu</div>
      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a className="block px-3 py-2 rounded hover:bg-primary hover:text-white">{item.label}</a>
          </Link>
        ))}
        {user?.role === 'admin' && (
          <Link href="/admin">
            <a className="block px-3 py-2 rounded hover:bg-primary hover:text-white">Admin</a>
          </Link>
        )}
      </nav>
    </aside>
  );
}
