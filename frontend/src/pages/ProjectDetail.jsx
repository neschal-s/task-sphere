import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
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
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      fetchProjectAndTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task status');
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

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (!project) return <Layout><div>Project not found</div></Layout>;

  return (
    <Layout>
      <div>
        <h1>{project.name}</h1>
        <p>{project.description}</p>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        {/* Members Section */}
        <section style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h2>Members ({project.members.length})</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {project.members.map(m => (
              <div key={m.userId._id} style={{
                padding: '0.75rem 1rem',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                <strong>{m.userId.name}</strong> <span style={{ color: '#999' }}>({m.role})</span>
              </div>
            ))}
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showAddMember ? 'Cancel' : '+ Add Member'}
            </button>
          )}

          {showAddMember && (
            <form onSubmit={handleAddMember} style={{ marginTop: '1rem' }}>
              <input
                type="email"
                placeholder="Member email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                required
                style={{ padding: '0.5rem', marginRight: '0.5rem' }}
              />
              <button type="submit" style={{
                padding: '0.5rem 1rem',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Add
              </button>
            </form>
          )}
        </section>

        {/* Tasks Section */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Tasks ({tasks.length})</h2>
            <button
              onClick={() => setShowCreateTask(!showCreateTask)}
              style={{
                padding: '0.5rem 1rem',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showCreateTask ? 'Cancel' : '+ Create Task'}
            </button>
          </div>

          {showCreateTask && (
            <form onSubmit={handleCreateTask} style={{
              padding: '1rem',
              background: '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Task title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                />
                <textarea
                  placeholder="Description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                />
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                />
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <button type="submit" style={{
                padding: '0.5rem 1rem',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Create Task
              </button>
            </form>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            {tasks.map(task => (
              <div
                key={task._id}
                style={{
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${task.status === 'Done' ? '#27ae60' : task.status === 'In Progress' ? '#f39c12' : '#ccc'}`
                }}
              >
                <h3>{task.title}</h3>
                <p style={{ color: '#666' }}>{task.description}</p>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  <p>Status: <strong>{task.status}</strong></p>
                  <p>Priority: <strong>{task.priority}</strong></p>
                  {task.dueDate && <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                  {task.assignedTo && <p>Assigned to: {task.assignedTo.name}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
