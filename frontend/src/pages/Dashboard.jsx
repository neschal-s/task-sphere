import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Skeleton, { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const StatCard = ({ icon, label, value, color = 'cyan' }) => {
  const colorVariants = {
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-200/50',
    emerald: 'from-emerald-500/20 to-cyan-500/20 border-emerald-200/50',
    orange: 'from-orange-500/20 to-red-500/20 border-orange-200/50',
    rose: 'from-rose-500/20 to-pink-500/20 border-rose-200/50'
  };

  return (
    <Card className={`bg-gradient-to-br ${colorVariants[color]} backdrop-blur-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-4xl font-bold mt-2 text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </Card>
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
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              📊 Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Track your project progress and team performance
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
            <p className="text-rose-700 dark:text-rose-300 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Project Selector */}
        {projects.length > 0 && (
          <Card className="bg-white/60 dark:bg-slate-800/60">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Select Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-50/50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 focus:border-cyan-400 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200/50 dark:focus:ring-cyan-600/30 transition-all"
            >
              <option value="">-- Choose a project --</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </Card>
        )}

        {loading ? (
          <SkeletonCard count={4} />
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon="📋" label="Total Tasks" value={stats.totalTasks} color="cyan" />
              <StatCard icon="✅" label="Completed" value={stats.tasksByStatus.Done} color="emerald" />
              <StatCard icon="⏳" label="In Progress" value={stats.tasksByStatus['In Progress']} color="orange" />
              <StatCard icon="📝" label="To Do" value={stats.tasksByStatus['To Do']} color="rose" />
            </div>

            {/* Task Breakdown */}
            <Card className="bg-white/60 dark:bg-slate-800/60">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Task Breakdown by Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(stats.tasksByStatus).map(([status, count]) => {
                  const iconMap = { 'Done': '✅', 'In Progress': '⏳', 'To Do': '📝' };
                  return (
                    <div key={status} className="p-4 rounded-lg bg-gradient-to-br from-slate-100/50 to-slate-50/50 dark:from-slate-700/50 dark:to-slate-800/50 text-center hover:shadow-md transition-shadow">
                      <div className="text-2xl mb-2">{iconMap[status]}</div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{status}</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{count}</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Tasks per User */}
            {Object.keys(stats.tasksPerUser).length > 0 && (
              <Card className="bg-white/60 dark:bg-slate-800/60">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Tasks per Team Member</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.tasksPerUser).map(([userName, count]) => (
                    <div key={userName} className="p-4 rounded-lg bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-100/50 dark:border-cyan-800/30">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm mb-3">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">{userName}</p>
                      <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-2">{count}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {count === 1 ? 'task' : 'tasks'}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Overdue Tasks */}
            {stats.overdueTasksCount > 0 && (
              <Card className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-3xl">⚠️</div>
                  <div>
                    <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                      Overdue Tasks ({stats.overdueTasksCount})
                    </h2>
                    <p className="text-sm text-amber-700 dark:text-amber-200">
                      Tasks that need immediate attention
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {stats.overdueTasks.map(task => (
                    <div
                      key={task._id}
                      className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 border-l-4 border-amber-400 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
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
                          task.priority === 'High' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' :
                          task.priority === 'Medium' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}>
                          {task.priority}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        ) : projects.length === 0 ? (
          <EmptyState
            icon="📁"
            title="No projects yet"
            description="Create your first project to start tracking tasks"
          />
        ) : (
          <EmptyState
            icon="📊"
            title="Select a project"
            description="Choose a project from the dropdown above to view stats"
          />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
