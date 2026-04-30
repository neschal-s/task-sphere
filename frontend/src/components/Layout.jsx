import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Notifications from './Notifications';
import Button from './Button';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-900/80 dark:to-slate-800/80 border-b border-white/20 dark:border-slate-700/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <Link 
              to="/" 
              className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              <div className="text-3xl">📋</div>
              <span className="hidden sm:inline">TaskSphere</span>
            </Link>

            {/* Desktop Menu */}
            {user && (
              <div className="hidden md:flex items-center gap-8">
                <Link
                  to="/projects"
                  className={`font-medium transition-all ${
                    isActive('/projects')
                      ? 'text-cyan-600 border-b-2 border-cyan-600'
                      : 'text-slate-700 dark:text-slate-300 hover:text-cyan-600'
                  }`}
                >
                  Projects
                </Link>
                <Link
                  to="/dashboard"
                  className={`font-medium transition-all ${
                    isActive('/dashboard')
                      ? 'text-cyan-600 border-b-2 border-cyan-600'
                      : 'text-slate-700 dark:text-slate-300 hover:text-cyan-600'
                  }`}
                >
                  Dashboard
                </Link>
              </div>
            )}

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {user && (
                <>
                  {/* Notifications */}
                  <Notifications />

                  {/* Dark Mode Toggle */}
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title={darkMode ? 'Light mode' : 'Dark mode'}
                  >
                    {darkMode ? '☀️' : '🌙'}
                  </button>

                  {/* User Info */}
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white hidden lg:inline">
                      {user.name}
                    </span>
                  </div>

                  {/* Logout */}
                  <Button variant="danger" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              )}

              {/* Mobile Menu Toggle */}
              {user && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {mobileMenuOpen ? '✕' : '☰'}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {user && mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 border-t border-slate-200 dark:border-slate-700">
              <Link
                to="/projects"
                className="block px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Projects
              </Link>
              <Link
                to="/dashboard"
                className="block px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © 2026 TaskSphere. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
