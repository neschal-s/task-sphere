import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Signup from './pages/Signup';
import Login from './pages/Login';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes will be added here in Phase 7+ */}
          <Route path="/" element={<Navigate to="/projects" replace />} />
          
          {/* Placeholder for future protected routes */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Layout>
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <h1>🚧 Projects Page - Coming Soon</h1>
                    <p>This page will display your projects.</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <h1>🚧 Dashboard - Coming Soon</h1>
                    <p>This page will display your task statistics.</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
