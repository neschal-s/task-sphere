import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const CreateProject = () => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      <div className="flex items-center justify-center min-h-screen -my-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Create New Project
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Start a new project and invite your team members to collaborate
            </p>
          </div>

          {/* Form Card */}
          <Card className="shadow-xl">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                <p className="text-rose-700 dark:text-rose-300 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Project Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="My Awesome Project"
                floatingLabel={false}
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Project Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe what this project is about..."
                  className="w-full px-4 py-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:border-cyan-400 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200/50 dark:focus:ring-cyan-600/30 transition-all resize-none font-medium"
                />
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>💡 Tip:</strong> After creating the project, you'll be able to add team members, create tasks, and start collaborating.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Creating project...' : 'Create Project'}
              </Button>
            </form>

            {/* Cancel Link */}
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
