import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Layout from '../components/Layout';
import Skeleton, { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const StatCard = ({ label, value, color = 'cyan', isDark }) => {
  const colorVariants = {
    cyan: isDark 
      ? 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30' 
      : 'from-cyan-100/50 to-blue-100/50 border-cyan-200/50',
    emerald: isDark
      ? 'from-emerald-500/10 to-cyan-500/10 border-emerald-500/30'
      : 'from-emerald-100/50 to-cyan-100/50 border-emerald-200/50',
    orange: isDark
      ? 'from-orange-500/10 to-red-500/10 border-orange-500/30'
      : 'from-orange-100/50 to-red-100/50 border-orange-200/50',
    rose: isDark
      ? 'from-rose-500/10 to-pink-500/10 border-rose-500/30'
      : 'from-rose-100/50 to-pink-100/50 border-rose-200/50'
  };

  return (
    <div className={`rounded-2xl p-6 border transition-all ${colorVariants[color]} ${isDark ? 'bg-slate-800/30' : 'bg-white/30'} backdrop-blur-sm`}>
      <div>
        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</p>
        <p className={`text-4xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchStats();
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
      if (response.data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(response.data[0]._id);
      }
    } catch (err) {
      setError('Failed to load projects');
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/dashboard/stats?projectId=${selectedProjectId}`);
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Dashboard
            </h1>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Track your project progress and team performance
            </p>
          </div>
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

        {/* Project Selector */}
        {projects.length > 0 && (
          <div className={`rounded-2xl p-6 border transition-all ${
            isDark
              ? 'bg-slate-800/50 border-slate-700/30'
              : 'bg-white/50 border-blue-200/30'
          } backdrop-blur-sm`}>
            <label className={`block text-sm font-semibold mb-3 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Select Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg transition-all focus:outline-none ${
                isDark
                  ? 'bg-slate-700/50 border border-slate-600/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50'
                  : 'bg-blue-50/50 border border-blue-200/50 text-slate-900 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50'
              }`}
            >
              <option value="">-- Choose a project --</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <SkeletonCard count={4} />
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Tasks" value={stats.totalTasks} color="cyan" isDark={isDark} />
              <StatCard label="Completed" value={stats.tasksByStatus.Done} color="emerald" isDark={isDark} />
              <StatCard label="In Progress" value={stats.tasksByStatus['In Progress']} color="orange" isDark={isDark} />
              <StatCard label="To Do" value={stats.tasksByStatus['To Do']} color="rose" isDark={isDark} />
            </div>

            {/* Task Breakdown */}
            <div className={`rounded-2xl p-6 border transition-all ${
              isDark
                ? 'bg-slate-800/50 border-slate-700/30'
                : 'bg-white/50 border-blue-200/30'
            } backdrop-blur-sm`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Task Breakdown by Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(stats.tasksByStatus).map(([status, count]) => {
                  const colorMap = {
                    'Done': isDark ? 'from-emerald-500/10 to-cyan-500/10 border-emerald-500/30' : 'from-emerald-100/50 to-cyan-100/50 border-emerald-200/50',
                    'In Progress': isDark ? 'from-orange-500/10 to-amber-500/10 border-orange-500/30' : 'from-orange-100/50 to-amber-100/50 border-orange-200/50',
                    'To Do': isDark ? 'from-rose-500/10 to-pink-500/10 border-rose-500/30' : 'from-rose-100/50 to-pink-100/50 border-rose-200/50'
                  };
                  return (
                    <div key={status} className={`p-4 rounded-lg border transition-all ${colorMap[status]} ${isDark ? 'bg-slate-800/30' : 'bg-white/30'} backdrop-blur-sm text-center hover:shadow-md`}>
                      <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {status}
                      </p>
                      <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {count}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tasks per User */}
            {Object.keys(stats.tasksPerUser).length > 0 && (
              <div className={`rounded-2xl p-6 border transition-all ${
                isDark
                  ? 'bg-slate-800/50 border-slate-700/30'
                  : 'bg-white/50 border-blue-200/30'
              } backdrop-blur-sm`}>
                <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Tasks per Team Member
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.tasksPerUser).map(([userName, count]) => (
                    <div key={userName} className={`p-4 rounded-lg border transition-all ${
                      isDark
                        ? 'bg-cyan-500/10 border-cyan-500/30'
                        : 'bg-cyan-100/50 border-cyan-200/50'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3 ${
                        isDark
                          ? 'bg-gradient-to-br from-cyan-400 to-blue-600'
                          : 'bg-gradient-to-br from-cyan-400 to-blue-500'
                      }`}>
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {userName}
                      </p>
                      <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                        {count}
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {count === 1 ? 'task' : 'tasks'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overdue Tasks */}
            {stats.overdueTasksCount > 0 && (
              <div className={`rounded-2xl p-6 border transition-all ${
                isDark
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-amber-100/50 border-amber-200/50'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`text-3xl font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>!</div>
                  <div>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-amber-100' : 'text-amber-900'}`}>
                      Overdue Tasks ({stats.overdueTasksCount})
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-amber-200/70' : 'text-amber-700'}`}>
                      Tasks that need immediate attention
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {stats.overdueTasks.map(task => (
                    <div
                      key={task._id}
                      className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                        isDark
                          ? 'bg-slate-800/50 border-l-amber-400 border-amber-400/20'
                          : 'bg-white/50 border-l-amber-400 border-amber-200/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {task.title}
                          </h3>
                          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                            {task.assignedTo && ` • Assigned to: ${task.assignedTo.name}`}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.priority === 'High' 
                            ? isDark ? 'bg-rose-900/30 text-rose-300' : 'bg-rose-100 text-rose-700'
                            : task.priority === 'Medium'
                            ? isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'
                            : isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {task.priority}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Create your first project to start tracking tasks"
          />
        ) : (
          <EmptyState
            title="Select a project"
            description="Choose a project from the dropdown above to view stats"
          />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
