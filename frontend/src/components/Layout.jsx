import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Notifications from './Notifications';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50'
    }`}>
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md transition-all duration-300 ${
        isDark
          ? 'bg-slate-900/60 border-b border-slate-700/30'
          : 'bg-white/70 border-b border-blue-200/30'
      } shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <Link 
              to="/" 
              className={`flex items-center gap-3 text-2xl font-bold hover:opacity-80 transition-opacity ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <span>TaskSphere</span>
            </Link>

            {/* Desktop Menu */}
            {user && (
              <div className="hidden md:flex items-center gap-8">
                <Link
                  to="/projects"
                  className={`font-medium transition-all ${
                    isActive('/projects') || isActive('/create-project')
                      ? isDark ? 'text-blue-400' : 'text-blue-600'
                      : isDark ? 'text-slate-300 hover:text-blue-400' : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  Projects
                </Link>
                <Link
                  to="/dashboard"
                  className={`font-medium transition-all ${
                    isActive('/dashboard')
                      ? isDark ? 'text-blue-400' : 'text-blue-600'
                      : isDark ? 'text-slate-300 hover:text-blue-400' : 'text-slate-700 hover:text-blue-600'
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
                    onClick={toggleTheme}
                    className={`p-2 rounded-lg transition-all ${
                      isDark
                        ? 'bg-slate-800/50 hover:bg-slate-700/50 text-yellow-400'
                        : 'bg-blue-100/50 hover:bg-blue-200/50 text-slate-700'
                    }`}
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {isDark ? '☀️' : '🌙'}
                  </button>

                  {/* User Info */}
                  <div className={`hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg ${
                    isDark ? 'bg-slate-800/50' : 'bg-white/50'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      isDark
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                        : 'bg-gradient-to-br from-blue-400 to-blue-500'
                    }`}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className={`text-sm font-semibold hidden lg:inline ${
                      isDark ? 'text-slate-200' : 'text-slate-900'
                    }`}>
                      {user.name}
                    </span>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isDark
                        ? 'bg-rose-900/20 text-rose-300 hover:bg-rose-900/40'
                        : 'bg-rose-100/50 text-rose-600 hover:bg-rose-200/50'
                    }`}
                  >
                    Logout
                  </button>
                </>
              )}

              {/* Mobile Menu Toggle */}
              {user && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`md:hidden p-2 rounded-lg ${
                    isDark
                      ? 'hover:bg-slate-800'
                      : 'hover:bg-blue-200/50'
                  }`}
                >
                  {mobileMenuOpen ? '✕' : '☰'}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {user && mobileMenuOpen && (
            <div className={`md:hidden border-t ${isDark ? 'border-slate-700/30' : 'border-blue-200/30'} py-4 space-y-2`}>
              <Link
                to="/projects"
                className={`block px-4 py-2 rounded-lg font-medium ${
                  isActive('/projects')
                    ? isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100/50 text-blue-600'
                    : isDark ? 'text-slate-300 hover:bg-slate-800/50' : 'text-slate-700 hover:bg-white/50'
                }`}
              >
                Projects
              </Link>
              <Link
                to="/dashboard"
                className={`block px-4 py-2 rounded-lg font-medium ${
                  isActive('/dashboard')
                    ? isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100/50 text-blue-600'
                    : isDark ? 'text-slate-300 hover:bg-slate-800/50' : 'text-slate-700 hover:bg-white/50'
                }`}
              >
                Dashboard
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className={`py-8 border-t ${
        isDark
          ? 'bg-slate-900/50 border-slate-700/30'
          : 'bg-white/50 border-blue-200/30'
      } backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            © 2026 TaskSphere. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
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
