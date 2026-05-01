import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);

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
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900' 
        : 'bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100'
    } flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Animated background elements */}
      {isDark ? (
        <>
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
        </>
      ) : (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>
        </>
      )}

      {/* Header */}
      <div className={`absolute top-8 left-8 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        <span className="font-light text-3xl">TaskSphere</span>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`absolute top-8 right-8 p-2 rounded-lg transition-all ${
          isDark
            ? 'bg-slate-800/50 hover:bg-slate-700/50 text-yellow-400'
            : 'bg-white/50 hover:bg-white/70 text-slate-700'
        }`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className={`rounded-2xl transition-all duration-300 ${
          isDark
            ? 'border border-cyan-500/30 bg-slate-900/50'
            : 'border border-blue-200/50 bg-white/80'
        } backdrop-blur-xl p-8 shadow-2xl`}>
          {/* Top accent */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`w-12 h-12 rounded-full border ${
              isDark
                ? 'bg-cyan-500/20 border-cyan-500/50'
                : 'bg-blue-400/30 border-blue-400/60'
            }`}></div>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className={`text-3xl font-light mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Get started
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Create your TaskSphere account today
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg backdrop-blur-sm border ${
              isDark
                ? 'bg-rose-500/10 border-rose-500/30'
                : 'bg-rose-50/50 border-rose-200/50'
            }`}>
              <p className={`text-sm font-medium ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className={`w-full px-4 py-3 rounded-lg transition-all focus:outline-none ${
                  isDark
                    ? 'bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50'
                    : 'bg-blue-50/50 border border-blue-200/50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50'
                }`}
              />
            </div>

            {/* Email Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-lg transition-all focus:outline-none ${
                  isDark
                    ? 'bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50'
                    : 'bg-blue-50/50 border border-blue-200/50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50'
                }`}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-lg transition-all focus:outline-none ${
                  isDark
                    ? 'bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50'
                    : 'bg-blue-50/50 border border-blue-200/50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50'
                }`}
              />
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-6 px-4 py-3 rounded-lg text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${
                isDark
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/50'
                  : 'bg-gradient-to-r from-blue-400 to-blue-500 hover:shadow-lg hover:shadow-blue-400/50'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? 'border-slate-700/50' : 'border-blue-200/50'}`}></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className={`px-2 ${isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-white/80 text-slate-500'}`}>
                or
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Already have an account?{' '}
            <Link to="/login" className={`font-semibold transition-colors ${
              isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-500 hover:text-blue-600'
            }`}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className={`mt-6 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          By signing up, you agree to our<br />
          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Terms of Service and Privacy Policy</span>
        </p>

        {/* Bottom accent line */}
        <div className={`mt-8 h-1 rounded-full blur-sm ${
          isDark
            ? 'bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-blue-500/0'
            : 'bg-gradient-to-r from-blue-400/0 via-blue-400/50 to-blue-500/0'
        }`}></div>
      </div>
    </div>
  );
};

export default Signup;
