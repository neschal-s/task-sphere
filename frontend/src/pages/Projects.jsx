import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

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

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Projects</h1>
          <button
            onClick={handleCreateProject}
            style={{
              background: '#27ae60',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            + New Project
          </button>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No projects yet. Create one to get started!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {projects.map(project => (
              <div
                key={project._id}
                onClick={() => handleViewProject(project._id)}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  ':hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
                }}
              >
                <h3>{project.name}</h3>
                <p style={{ color: '#666' }}>{project.description}</p>
                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#999' }}>
                  <p>Members: {project.members.length}</p>
                  <p>Creator: {project.creator?.name}</p>
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
