import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/signup', formData);
      const { user, token } = response.data;
      login(user, token);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '400px', margin: '0 auto', marginTop: '2rem' }}>
        <h2>Sign Up</h2>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </Layout>
  );
};

export default Signup;
