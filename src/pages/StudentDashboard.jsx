import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import AnnouncementBanner from '../components/AnnouncementBanner';
import api from '../api/axios';
import './StudentDashboard.css';

const sidebarLinks = [
  { path: '/student-dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/repository', label: 'Repository', icon: '📁' },
  { path: '/chatbot', label: 'Assistant', icon: '🤖' },
];

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);

  const [proposals, setProposals] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    supervisor: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    fetchProposals();
    fetchSupervisors();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await api.get('/proposals/my-proposals');
      setProposals(res.data);
    } catch (error) {
      console.error('Failed to load proposals', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const res = await api.get('/auth/supervisors');
      setSupervisors(res.data);
    } catch (error) {
      console.error('Failed to load supervisors', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLastResult(null);

    if (!formData.title || !formData.description || !formData.domain || !formData.supervisor) {
      setFormError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/proposals', formData);
      setLastResult(res.data.proposal.similarityScore);
      setFormData({ title: '', description: '', domain: '', supervisor: '' });
      fetchProposals();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const total = proposals.length;
  const pending = proposals.filter((p) => p.status === 'pending').length;
  const approved = proposals.filter((p) => p.status === 'approved').length;
  const rejected = proposals.filter((p) => p.status === 'rejected').length;

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}</h1>
          <p>Roll No: {user?.rollNumber} • {user?.department} • {user?.batch}</p>
        </div>

        <AnnouncementBanner />

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-number">{total}</div>
            <div className="stat-label">Total Proposals</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">{pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-number">{approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-number">{rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>

        <div className="section-card">
          <h2>Submit New Proposal</h2>

          {formError && <div className="error-banner">{formError}</div>}

          {lastResult !== null && (
            <div className={`similarity-result ${lastResult > 50 ? 'high' : 'low'}`}>
              {lastResult > 50
                ? `⚠️ This proposal is ${lastResult}% similar to an existing one. Consider revising your topic.`
                : `✅ Proposal submitted. Similarity score: ${lastResult}% — looks sufficiently original.`}
            </div>
          )}

          <form className="proposal-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Project Title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Smart Campus Navigation System"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Abstract / Description</label>
              <textarea
                name="description"
                placeholder="Briefly describe your project idea..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Domain</label>
              <input
                type="text"
                name="domain"
                placeholder="e.g. Web Development, AI, Mobile App"
                value={formData.domain}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Choose Supervisor</label>
              <select name="supervisor" value={formData.supervisor} onChange={handleChange}>
                <option value="">-- Select a supervisor --</option>
                {supervisors.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.department ? `(${s.department})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </form>
        </div>

        <div className="section-card">
          <h2>My Proposals</h2>

          {loadingData ? (
            <p className="empty-state">Loading...</p>
          ) : proposals.length === 0 ? (
            <p className="empty-state">You haven't submitted any proposals yet.</p>
          ) : (
            proposals.map((p) => (
              <div className="proposal-item" key={p._id}>
                <div className="proposal-item-header">
                  <h3>{p.title}</h3>
                  <span className={`status-badge ${p.status}`}>{p.status}</span>
                </div>
                <p>{p.description}</p>
                <div className="proposal-meta">
                  <span>Domain: {p.domain}</span>
                  <span>Similarity: {p.similarityScore}%</span>
                  <span>Supervisor: {p.supervisor?.name || 'N/A'}</span>
                  <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                {p.supervisorFeedback && (
                  <div className="feedback-box">
                    <strong>Supervisor Feedback:</strong> {p.supervisorFeedback}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}