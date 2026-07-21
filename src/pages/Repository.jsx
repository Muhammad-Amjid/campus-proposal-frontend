import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import './Repository.css';

export default function Repository() {
  const { user } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');

  // Sidebar links change based on the logged-in user's role
  const sidebarLinks = getSidebarLinks(user?.role);

  useEffect(() => {
    fetchRepository();
  }, []);

  const fetchRepository = async () => {
    try {
      const res = await api.get('/proposals/repository');
      setProjects(res.data);
    } catch (error) {
      console.error('Failed to load repository', error);
    } finally {
      setLoading(false);
    }
  };

  // Unique domains for the filter dropdown, derived from actual data
  const domains = ['all', ...new Set(projects.map((p) => p.domain).filter(Boolean))];

  // Apply search (title/description) + domain filter together
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = domainFilter === 'all' || p.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Project Repository</h1>
          <p>Browse approved final year projects</p>
        </div>

        <div className="search-bar-row">
          <input
            type="text"
            className="search-input"
            placeholder="Search by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
          >
            {domains.map((d) => (
              <option key={d} value={d}>
                {d === 'all' ? 'All Domains' : d}
              </option>
            ))}
          </select>
        </div>

        <div className="repo-grid">
          {loading ? (
            <p className="empty-state">Loading...</p>
          ) : filteredProjects.length === 0 ? (
            <p className="empty-state">No approved projects match your search.</p>
          ) : (
            filteredProjects.map((p) => (
              <div className="repo-card" key={p._id}>
                <span className="repo-card-domain">{p.domain}</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <div className="repo-card-footer">
                  <div>👤 {p.submittedBy?.name} ({p.submittedBy?.rollNumber})</div>
                  <div>🎓 {p.submittedBy?.department} • {p.submittedBy?.batch}</div>
                  <div>👨‍🏫 Supervised by {p.supervisor?.name}</div>
                  <div>📅 {new Date(p.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Returns different sidebar links depending on the user's role,
// since Repository is shared but each role has a different dashboard "home"
function getSidebarLinks(role) {
  const dashboardPath =
    role === 'student'
      ? '/student-dashboard'
      : role === 'supervisor'
      ? '/supervisor-dashboard'
      : '/admin-dashboard';

  return [
    { path: dashboardPath, label: 'Dashboard', icon: '📊' },
    { path: '/repository', label: 'Repository', icon: '📁' },
  ];
}