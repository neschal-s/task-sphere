import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Notifications from './Notifications';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* Navigation */}
      <nav style={{
        background: '#333',
        color: 'white',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', marginRight: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
            📋 TaskSphere
          </Link>
          {user && (
            <>
              <Link to="/projects" style={{ color: 'white', textDecoration: 'none', marginRight: '1rem' }}>Projects</Link>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', marginRight: '1rem' }}>Dashboard</Link>
            </>
          )}
        </div>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Notifications />
            <span>{user.name}</span>
            <button onClick={handleLogout} style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        background: '#f5f5f5',
        padding: '1rem',
        textAlign: 'center',
        borderTop: '1px solid #ddd'
      }}>
        <p>&copy; 2026 TaskSphere. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
