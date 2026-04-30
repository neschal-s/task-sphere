import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

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
      <div>
        <h1>📊 Dashboard</h1>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        {/* Project Selector */}
        <div style={{ marginBottom: '2rem' }}>
          <label>Select Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{
              padding: '0.75rem',
              marginLeft: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="">-- Choose a project --</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div>Loading stats...</div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                padding: '1.5rem',
                background: '#3498db',
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Total Tasks</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalTasks}</div>
              </div>

              <div style={{
                padding: '1.5rem',
                background: '#27ae60',
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Done</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.tasksByStatus.Done}</div>
              </div>

              <div style={{
                padding: '1.5rem',
                background: '#f39c12',
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>In Progress</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.tasksByStatus['In Progress']}</div>
              </div>

              <div style={{
                padding: '1.5rem',
                background: '#e74c3c',
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>To Do</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.tasksByStatus['To Do']}</div>
              </div>
            </div>

            {/* Task Breakdown by Status */}
            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
              <h2>Task Breakdown by Status</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {Object.entries(stats.tasksByStatus).map(([status, count]) => (
                  <div key={status} style={{ padding: '1rem', background: 'white', borderRadius: '4px', textAlign: 'center' }}>
                    <strong>{status}</strong>
                    <div style={{ fontSize: '1.5rem', color: '#3498db', marginTop: '0.5rem' }}>{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks per User */}
            {Object.keys(stats.tasksPerUser).length > 0 && (
              <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                <h2>Tasks per User</h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '1rem'
                }}>
                  {Object.entries(stats.tasksPerUser).map(([userName, count]) => (
                    <div key={userName} style={{
                      padding: '1rem',
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}>
                      <strong>{userName}</strong>
                      <div style={{ fontSize: '1.5rem', color: '#3498db', marginTop: '0.5rem' }}>{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overdue Tasks */}
            {stats.overdueTasksCount > 0 && (
              <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
                <h2 style={{ color: '#856404' }}>⚠️ Overdue Tasks ({stats.overdueTasksCount})</h2>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {stats.overdueTasks.map(task => (
                    <div key={task._id} style={{
                      padding: '0.75rem',
                      background: 'white',
                      borderRadius: '4px',
                      borderLeft: '3px solid #ffc107'
                    }}>
                      <strong>{task.title}</strong>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                        {task.assignedTo && ` • Assigned to: ${task.assignedTo.name}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div>Select a project to view stats</div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
