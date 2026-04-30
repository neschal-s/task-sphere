import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import Chat from '../components/Chat';

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
  const [showStatusRequest, setShowStatusRequest] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [requestedStatus, setRequestedStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);

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
      
      // Fetch pending requests if admin
      const isAdmin = projectRes.data.members.some(m => m.userId._id === user?.id && m.role === 'Admin');
      if (isAdmin) {
        fetchPendingRequests();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`/api/status-requests/pending/${projectId}`);
      setPendingRequests(res.data);
    } catch (err) {
      console.log('No pending requests or error fetching');
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

  const handleRequestStatusChange = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/status-requests', {
        taskId: selectedTask._id,
        projectId,
        requestedStatus,
        reason: statusReason
      });
      setShowStatusRequest(false);
      setSelectedTask(null);
      setRequestedStatus('');
      setStatusReason('');
      alert('Status change request submitted successfully!');
      fetchProjectAndTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit status request');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await axios.patch(`/api/status-requests/${requestId}/approve`, {
        approvalReason: ''
      });
      alert('Status change approved!');
      fetchPendingRequests();
      fetchProjectAndTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const reason = prompt('Enter rejection reason (optional):');
      await axios.patch(`/api/status-requests/${requestId}/reject`, {
        rejectionReason: reason || ''
      });
      alert('Status change rejected!');
      fetchPendingRequests();
      fetchProjectAndTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await axios.delete(`/api/projects/${projectId}/members/${memberId}`);
      fetchProjectAndTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove member');
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
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div>
                  <strong>{m.userId.name}</strong> <span style={{ color: '#999' }}>({m.role})</span>
                </div>
                {isAdmin && m.userId._id !== user?.id && (
                  <button
                    onClick={() => handleRemoveMember(m.userId._id)}
                    style={{
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Remove
                  </button>
                )}
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

        {/* Pending Status Requests Section (Admin Only) */}
        {isAdmin && pendingRequests.length > 0 && (
          <section style={{ marginBottom: '2rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
            <h2>Pending Status Change Requests ({pendingRequests.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingRequests.map(request => (
                <div
                  key={request._id}
                  style={{
                    padding: '1rem',
                    background: 'white',
                    border: '1px solid #ffc107',
                    borderRadius: '4px'
                  }}
                >
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>{request.requestedBy.name}</strong> requested to change
                    <strong> "{request.taskId.title}"</strong> status from
                    <strong> "{request.currentStatus}"</strong> to
                    <strong> "{request.requestedStatus}"</strong>
                  </div>
                  {request.reason && (
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                      Reason: {request.reason}
                    </div>
                  )}
                  <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.75rem' }}>
                    {new Date(request.createdAt).toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleApproveRequest(request._id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
                  borderLeft: `4px solid ${task.status === 'Done' ? '#27ae60' : task.status === 'In Progress' ? '#f39c12' : '#ccc'}`,
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{task.title}</h3>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p style={{ color: '#666', marginBottom: '0.5rem' }}>{task.description}</p>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label>Status: </label>
                    {isAdmin ? (
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                        style={{
                          padding: '0.25rem',
                          marginLeft: '0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                      >
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </select>
                    ) : (
                      <>
                        <span style={{ marginLeft: '0.5rem', fontWeight: 'bold' }}>{task.status}</span>
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowStatusRequest(true);
                          }}
                          style={{
                            marginLeft: '0.5rem',
                            padding: '0.25rem 0.5rem',
                            background: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Request Change
                        </button>
                      </>
                    )}
                  </div>
                  <p>Priority: <strong>{task.priority}</strong></p>
                  {task.dueDate && <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                  {task.assignedTo && <p>Assigned to: {task.assignedTo.name}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Status Change Request Modal */}
        {showStatusRequest && selectedTask && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h3>Request Status Change</h3>
              <form onSubmit={handleRequestStatusChange}>
                <div style={{ marginBottom: '1rem' }}>
                  <p><strong>Task:</strong> {selectedTask.title}</p>
                  <p><strong>Current Status:</strong> {selectedTask.status}</p>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label>Request New Status:</label>
                  <select
                    value={requestedStatus}
                    onChange={(e) => setRequestedStatus(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                  >
                    <option value="">Select status</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label>Reason (optional):</label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="Explain why you want to change the status..."
                    maxLength={500}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', minHeight: '80px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowStatusRequest(false);
                      setSelectedTask(null);
                      setRequestedStatus('');
                      setStatusReason('');
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#999',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Chat Section */}
        <Chat projectId={projectId} />
      </div>
    </Layout>
  );
};

export default ProjectDetail;
