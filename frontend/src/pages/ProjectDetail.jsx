import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Layout from '../components/Layout';
import Chat from '../components/Chat';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const TaskCard = ({ task, isAdmin, onStatusChange, onApproveReject, onDelete, isDark }) => {
  const statusColors = {
    'Done': isDark ? 'from-emerald-500/10 to-cyan-500/10 border-emerald-500/30' : 'from-emerald-100/50 to-cyan-100/50 border-emerald-200/50',
    'In Progress': isDark ? 'from-orange-500/10 to-amber-500/10 border-orange-500/30' : 'from-orange-100/50 to-amber-100/50 border-orange-200/50',
    'To Do': isDark ? 'from-blue-500/10 to-cyan-500/10 border-blue-500/30' : 'from-blue-100/50 to-cyan-100/50 border-blue-200/50'
  };

  const priorityColors = {
    'High': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
    'Medium': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    'Low': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
  };

  return (
    <Card
      className={`${task.pendingStatusChange ? 'ring-2 ring-amber-400/50 bg-linear-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {task.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {task.description}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => onDelete(task._id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              isDark
                ? 'bg-rose-900/30 text-rose-300 hover:bg-rose-900/50'
                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
            }`}
          >
            Delete
          </button>
        )}
      </div>

      {/* Status & Priority */}
      <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColors[task.status]} ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {task.status}
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}>
          {task.priority} Priority
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4 text-sm">
        {task.dueDate && (
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        )}
        {task.assignedTo && (
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Assigned to: <strong>{task.assignedTo.name}</strong>
          </p>
        )}
      </div>

      {/* Status Control */}
      <div className="mb-4">
        <label className={`text-xs font-semibold block mb-2 ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          {isAdmin ? 'Update Status' : 'Request Status Change'}
        </label>
        {isAdmin ? (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-medium focus:outline-none transition-colors ${
              isDark
                ? 'bg-slate-700/50 border-slate-600/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50'
                : 'bg-slate-50/50 border-slate-200/50 text-slate-900 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50'
            }`}
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
        ) : (
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onStatusChange(task._id, e.target.value);
                e.target.value = '';
              }
            }}
            className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-medium focus:outline-none transition-colors ${
              isDark
                ? 'bg-slate-700/50 border-slate-600/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50'
                : 'bg-slate-50/50 border-slate-200/50 text-slate-900 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50'
            }`}
          >
            <option value="">Request Status Change</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        )}
      </div>

      {/* Pending Status Change */}
      {isAdmin && task.pendingStatusChange && task.pendingStatusChange.requestedBy && (
        <div className={`p-4 rounded-lg border-2 mt-4 ${
          isDark
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-amber-50/50 border-amber-200/50'
        }`}>
          <p className={`text-sm font-semibold mb-2 ${
            isDark ? 'text-amber-300' : 'text-amber-700'
          }`}>
            Pending Approval
          </p>
          <p className={`text-sm mb-3 ${
            isDark ? 'text-amber-200' : 'text-amber-800'
          }`}>
            <strong>{task.pendingStatusChange.requestedBy.name}</strong> requested to change status to <strong>{task.pendingStatusChange.requestedStatus}</strong>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onApproveReject(task._id, true)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                isDark
                  ? 'bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              Approve
            </button>
            <button
              onClick={() => onApproveReject(task._id, false)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                isDark
                  ? 'bg-rose-900/30 text-rose-300 hover:bg-rose-900/50'
                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              }`}
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium'
  });
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    fetchProjectAndTasks();
  }, [projectId]);

  const fetchProjectAndTasks = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        axios.get(`/api/projects/${projectId}`),
        axios.get(`/api/tasks/project?projectId=${projectId}`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/projects/${projectId}/members`, {
        email: memberEmail,
        role: 'Member'
      });
      setMemberEmail('');
      setShowAddMember(false);
      fetchProjectAndTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', {
        ...taskForm,
        projectId
      });
      setTaskForm({ title: '', description: '', dueDate: '', priority: 'Medium' });
      setShowCreateTask(false);
      fetchProjectAndTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    }
  };

  const isAdmin = project?.members.some(m => m.userId._id === user?.id && m.role === 'Admin');

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      if (isAdmin) {
        await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      } else {
        await axios.post(`/api/tasks/${taskId}/request-status-change`, { newStatus });
      }
      fetchProjectAndTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task status');
    }
  };

  const handleApproveStatusChange = async (taskId, approve) => {
    try {
      await axios.patch(`/api/tasks/${taskId}/approve-status-change`, { approve });
      fetchProjectAndTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process status change');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      fetchProjectAndTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete task');
    }
  };

  if (loading) return <Layout><Skeleton count={3} height="h-40" className="mb-4" /></Layout>;
  if (!project) return <Layout><EmptyState title="Project not found" description="The project you're looking for doesn't exist." /></Layout>;

  const pendingTasks = tasks.filter(t => t.pendingStatusChange && t.pendingStatusChange.requestedBy);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Project Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {project.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {project.description}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
            <p className="text-rose-700 dark:text-rose-300 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className={`flex gap-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          {['tasks', 'members', 'chat'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === tab
                  ? isDark ? 'border-cyan-500 text-cyan-400' : 'border-blue-500 text-blue-600'
                  : isDark ? 'border-transparent text-slate-400 hover:text-slate-300' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'tasks' && 'Tasks'}
              {tab === 'members' && `Members (${project.members.length})`}
              {tab === 'chat' && 'Chat'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              {/* Create Task */}
              {!showCreateTask && (
                <button
                  onClick={() => setShowCreateTask(true)}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all active:scale-95 ${
                    isDark
                      ? 'bg-linear-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50'
                      : 'bg-linear-to-r from-blue-400 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-400/50'
                  }`}
                >
                  Create New Task
                </button>
              )}

              {showCreateTask && (
                <div className={`rounded-2xl p-6 border transition-all ${
                  isDark
                    ? 'bg-slate-800/50 border-slate-700/30'
                    : 'bg-white/50 border-blue-200/30'
                } backdrop-blur-sm`}>
                  <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Create New Task
                  </h3>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <Input
                      label="Task Title"
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      required
                      placeholder="Enter task title"
                      floatingLabel={false}
                    />
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        placeholder="Describe the task..."
                        rows="3"
                        className="w-full px-4 py-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200/50 dark:focus:ring-cyan-600/30 transition-all resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Due Date"
                        type="date"
                        value={taskForm.dueDate}
                        onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                        floatingLabel={false}
                      />
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Priority
                        </label>
                        <select
                          value={taskForm.priority}
                          onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-600 focus:border-cyan-400 focus:outline-none"
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" className="flex-1">Create Task</Button>
                      <Button variant="ghost" onClick={() => setShowCreateTask(false)} className="flex-1">Cancel</Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Pending Approvals */}
              {isAdmin && pendingTasks.length > 0 && (
                <div className={`rounded-2xl p-6 border-2 transition-all ${
                  isDark
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-amber-50/50 border-amber-200/50'
                }`}>
                  <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                    {pendingTasks.length} Pending Approval{pendingTasks.length > 1 ? 's' : ''}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                    Review and approve status change requests from your team members.
                  </p>
                </div>
              )}

              {/* Tasks Grid */}
              {tasks.length === 0 ? (
                <EmptyState
                  title="No tasks yet"
                  description="Create your first task to get started"
                  action={() => setShowCreateTask(true)}
                  actionLabel="Create First Task"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      isAdmin={isAdmin}
                      onStatusChange={handleUpdateTaskStatus}
                      onApproveReject={handleApproveStatusChange}
                      onDelete={handleDeleteTask}
                      isDark={isDark}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              {!showAddMember && isAdmin && (
                <Button onClick={() => setShowAddMember(true)} size="lg">
                  Add Member
                </Button>
              )}

              {showAddMember && (
                <Card className={`bg-linear-to-br ${isDark ? 'from-cyan-900/20 to-blue-900/20 border-slate-700/30' : 'from-cyan-50/70 to-blue-50/70 border-slate-200/70'}`}>
                  <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Add Team Member</h3>
                  <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
                    <Input
                      label="Email Address"
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      required
                      placeholder="member@company.com"
                      floatingLabel={false}
                      className="flex-1"
                    />
                    <div className="flex gap-2">
                      <Button type="submit">Add</Button>
                      <Button variant="ghost" onClick={() => setShowAddMember(false)}>Cancel</Button>
                    </div>
                  </form>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.members.map(m => (
                  <Card key={m.userId._id} className={`${isDark ? 'bg-slate-800/50 border-slate-700/30 hover:shadow-lg' : 'bg-white/70 border-slate-200/70 hover:shadow-lg'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {m.userId.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.userId.name}</h4>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{m.userId.email}</p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        m.role === 'Admin'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      }`}>
                        {m.role}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <Chat projectId={projectId} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
