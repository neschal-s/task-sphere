import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Skeleton, { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  const handleViewProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  if (loading) return <Layout><SkeletonCard count={3} /></Layout>;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Projects
            </h1>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Manage your projects and collaborate with your team
            </p>
          </div>
          <button
            onClick={handleCreateProject}
            className={`px-6 py-3 rounded-lg font-semibold transition-all active:scale-95 ${
              isDark
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50'
                : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-400/50'
            }`}
          >
            New Project
          </button>
        </div>

        {error && (
          <div className={`p-4 rounded-lg border ${
            isDark
              ? 'bg-rose-500/10 border-rose-500/30'
              : 'bg-rose-50/50 border-rose-200/50'
          }`}>
            <p className={`text-sm font-medium ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>
              {error}
            </p>
          </div>
        )}

        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Create your first project to start collaborating with your team"
            action={handleCreateProject}
            actionLabel="Create Your First Project"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div
                key={project._id}
                onClick={() => handleViewProject(project._id)}
                className={`rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 border ${
                  isDark
                    ? 'bg-slate-800/50 border-slate-700/30 hover:border-cyan-500/50'
                    : 'bg-white/50 border-blue-200/30 hover:border-blue-400/50'
                } backdrop-blur-sm`}
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {project.name}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {project.description || 'No description provided'}
                </p>

                {/* Stats */}
                <div className={`grid grid-cols-2 gap-3 mb-4 pt-4 border-t ${
                  isDark ? 'border-slate-700/30' : 'border-blue-200/30'
                }`}>
                  <div>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Members
                    </p>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {project.members.length}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Creator
                    </p>
                    <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {project.creator?.name}
                    </p>
                  </div>
                </div>

                {/* Members Preview */}
                {project.members.length > 0 && (
                  <div className="flex items-center gap-1 mb-4">
                    {project.members.slice(0, 3).map((member, idx) => {
                      const memberName = member.userId?.name || member.name || 'U';
                      return (
                        <div
                          key={member._id || idx}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            isDark
                              ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                              : 'bg-gradient-to-br from-blue-400 to-blue-500'
                          }`}
                          title={memberName}
                        >
                          {memberName.charAt(0).toUpperCase()}
                        </div>
                      );
                    })}
                    {project.members.length > 3 && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDark
                          ? 'bg-slate-600 text-slate-200'
                          : 'bg-slate-300 text-slate-700'
                      }`}>
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Action */}
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700/30' : 'border-blue-200/30'}`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProject(project._id);
                    }}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                      isDark
                        ? 'text-blue-400 hover:bg-slate-700/50'
                        : 'text-blue-600 hover:bg-blue-50/50'
                    }`}
                  >
                    View Project →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
