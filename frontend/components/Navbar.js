import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="flex items-center justify-between px-4 py-2 bg-white shadow-sm dark:bg-gray-800">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <a className="text-xl font-bold text-primary">WomenSkillPortal</a>
        </Link>
        <Link href="/dashboard"><a className="text-sm">Dashboard</a></Link>
        <Link href="/jobs"><a className="text-sm">Jobs</a></Link>
        <Link href="/training"><a className="text-sm">Training</a></Link>
        <Link href="/applications"><a className="text-sm">Applications</a></Link>
        <Link href="/profile"><a className="text-sm">Profile</a></Link>
        {user?.role === 'admin' && (
          <Link href="/admin"><a className="text-sm">Admin</a></Link>
        )}
      </div>
      <div className="flex items-center space-x-3">
        {user ? (
          <button onClick={handleLogout} className="text-sm">Logout</button>
        ) : (
          <Link href="/login"><a className="text-sm">Login</a></Link>
        )}
      </div>
    </nav>
  );
}
