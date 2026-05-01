import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { ThemeContext } from '../context/ThemeContext';
import Layout from '../components/Layout';

const CreateProject = () => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/projects', formData);
      navigate(`/project/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Create New Project
          </h1>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Start a new project and invite your team members to collaborate
          </p>
        </div>

        {/* Form Card */}
        <div className={`rounded-2xl border transition-all p-8 ${
          isDark
            ? 'bg-slate-800/50 border-slate-700/30'
            : 'bg-white/50 border-blue-200/30'
        } backdrop-blur-sm shadow-lg`}>
          {error && (
            <div className={`mb-6 p-4 rounded-lg border ${
              isDark
                ? 'bg-rose-500/10 border-rose-500/30'
                : 'bg-rose-50/50 border-rose-200/50'
            }`}>
              <p className={`text-sm font-medium ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Project Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="My Awesome Project"
                className={`w-full px-4 py-3 rounded-lg transition-all focus:outline-none ${
                  isDark
                    ? 'bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50'
                    : 'bg-blue-50/50 border border-blue-200/50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50'
                }`}
              />
            </div>

            {/* Project Description */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Project Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Describe what this project is about..."
                className={`w-full px-4 py-3 rounded-lg transition-all focus:outline-none resize-none ${
                  isDark
                    ? 'bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50'
                    : 'bg-blue-50/50 border border-blue-200/50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50'
                }`}
              />
            </div>

            {/* Info Box */}
            <div className={`p-4 rounded-lg border ${
              isDark
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-blue-50/50 border-blue-200/50'
            }`}>
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                <strong>Tip:</strong> After creating the project, you'll be able to add team members, create tasks, and start collaborating.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50'
                  : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-400/50'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating project...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </form>

          {/* Cancel Link */}
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className={`w-full mt-4 px-4 py-2 rounded-lg font-medium transition-all ${
              isDark
                ? 'text-slate-300 hover:bg-slate-700/50'
                : 'text-slate-700 hover:bg-blue-50/50'
            }`}
          >
            Back to Projects
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProject;
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
              <button
                onClick={() => navigate('/projects')}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
              >
                ← Back to Projects
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProject;
