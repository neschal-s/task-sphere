import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Skeleton, { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

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
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              📁 Projects
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your projects and collaborate with your team
            </p>
          </div>
          <Button size="lg" onClick={handleCreateProject}>
            ✨ New Project
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
            <p className="text-rose-700 dark:text-rose-300 text-sm font-medium">{error}</p>
          </div>
        )}

        {projects.length === 0 ? (
          <EmptyState
            icon="📁"
            title="No projects yet"
            description="Create your first project to start collaborating with your team"
            action={handleCreateProject}
            actionLabel="Create Your First Project"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <Card
                key={project._id}
                hover={true}
                gradient={true}
                className="cursor-pointer group transition-all duration-300 hover:-translate-y-2"
                onClick={() => handleViewProject(project._id)}
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {project.name}
                    </h3>
                  </div>
                  <div className="text-2xl">📋</div>
                </div>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                  {project.description || 'No description provided'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👥</span>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Members</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {project.members.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👤</span>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Creator</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {project.creator?.name}
                      </p>
                    </div>
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
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold"
                          title={memberName}
                        >
                          {memberName.charAt(0).toUpperCase()}
                        </div>
                      );
                    })}
                    {project.members.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Action */}
                <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProject(project._id);
                    }}
                  >
                    View Project →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
