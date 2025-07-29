'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-semibold text-indigo-600">
          HabitTracker
        </Link>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-2xl z-50"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="hover:text-indigo-600">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:text-indigo-600">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-56 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="flex flex-col items-start p-6 space-y-4 mt-12">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-base hover:text-indigo-600">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-base hover:text-indigo-600">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-base hover:text-indigo-600">
              Login
            </Link>
          )}
        </nav>
      </aside>
    </nav>
  );
}
