import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import AnnouncementBanner from '../components/AnnouncementBanner';
import api from '../api/axios';
import './SupervisorDashboard.css';

const sidebarLinks = [
  { path: '/supervisor-dashboard', label: 'Dashboard', icon: '📊' },
];

export default function SupervisorDashboard() {
  const { user } = useContext(AuthContext);

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showStudents, setShowStudents] = useState(false);

  const [feedbackText, setFeedbackText] = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await api.get('/proposals');
      setProposals(res.data);
    } catch (error) {
      console.error('Failed to load proposals', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackChange = (id, value) => {
    setFeedbackText({ ...feedbackText, [id]: value });
  };

  const handleReview = async (id, status) => {
    setActionLoading(id);
    try {
      await api.put(`/proposals/${id}`, {
        status,
        supervisorFeedback: feedbackText[id] || '',
      });
      fetchProposals();
    } catch (error) {
      console.error('Failed to update proposal', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProposals =
    filter === 'all' ? proposals : proposals.filter((p) => p.status === filter);

  const total = proposals.length;
  const pending = proposals.filter((p) => p.status === 'pending').length;
  const approved = proposals.filter((p) => p.status === 'approved').length;
  const rejected = proposals.filter((p) => p.status === 'rejected').length;

  // Build a unique list of students from all proposals, with their proposal count
  const studentsMap = {};
  proposals.forEach((p) => {
    if (!p.submittedBy) return;
    const id = p.submittedBy._id;
    if (!studentsMap[id]) {
      studentsMap[id] = {
        ...p.submittedBy,
        proposalCount: 0,
        approvedCount: 0,
      };
    }
    studentsMap[id].proposalCount += 1;
    if (p.status === 'approved') studentsMap[id].approvedCount += 1;
  });
  const uniqueStudents = Object.values(studentsMap);

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />

      <div className="dashboard-content">
        <div className="dashboard-header-row">
          <div className="dashboard-header">
            <h1>Welcome, {user?.name}</h1>
            <p>Review and manage student project proposals</p>
          </div>
          <button className="btn-open-modal" onClick={() => setShowStudents(!showStudents)}>
            {showStudents ? '📋 View Proposals' : '👥 My Students'}
          </button>
        </div>

        <AnnouncementBanner />

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-number">{total}</div>
            <div className="stat-label">Total Proposals</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">{pending}</div>
            <div className="stat-label">Pending Review</div>
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

        {showStudents ? (
          <div className="section-card">
            <h2>My Students ({uniqueStudents.length})</h2>
            {uniqueStudents.length === 0 ? (
              <p className="empty-state">No students have submitted proposals to you yet.</p>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roll No</th>
                    <th>Department</th>
                    <th>Batch</th>
                    <th>Proposals</th>
                    <th>Approved</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueStudents.map((s) => (
                    <tr key={s._id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.rollNumber || '-'}</td>
                      <td>{s.department || '-'}</td>
                      <td>{s.batch || '-'}</td>
                      <td>{s.proposalCount}</td>
                      <td>{s.approvedCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="section-card">
            <h2>All Proposals</h2>

            <div className="filter-tabs">
              {['all', 'pending', 'approved', 'rejected'].map((f) => (
                <div
                  key={f}
                  className={`filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </div>
              ))}
            </div>

            {loading ? (
              <p className="empty-state">Loading...</p>
            ) : filteredProposals.length === 0 ? (
              <p className="empty-state">No proposals found.</p>
            ) : (
              filteredProposals.map((p) => (
                <div className="proposal-item" key={p._id}>
                  <div className="proposal-item-header">
                    <h3>{p.title}</h3>
                    <span className={`status-badge ${p.status}`}>{p.status}</span>
                  </div>

                  <p>{p.description}</p>

                  <div className="student-info">
                    <span><strong>Student:</strong> {p.submittedBy?.name}</span>
                    <span><strong>Roll No:</strong> {p.submittedBy?.rollNumber}</span>
                    <span><strong>Dept:</strong> {p.submittedBy?.department}</span>
                    <span><strong>Batch:</strong> {p.submittedBy?.batch}</span>
                  </div>

                  <div className="proposal-meta">
                    <span>Domain: {p.domain}</span>
                    <span className={`similarity-tag ${p.similarityScore > 50 ? 'high' : 'low'}`}>
                      Similarity: {p.similarityScore}%
                    </span>
                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>

                  {p.status === 'pending' ? (
                    <div className="review-box">
                      <textarea
                        placeholder="Add feedback for the student..."
                        value={feedbackText[p._id] || ''}
                        onChange={(e) => handleFeedbackChange(p._id, e.target.value)}
                      />
                      <div className="review-actions">
                        <button
                          className="btn-approve"
                          disabled={actionLoading === p._id}
                          onClick={() => handleReview(p._id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          disabled={actionLoading === p._id}
                          onClick={() => handleReview(p._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    p.supervisorFeedback && (
                      <div className="feedback-box">
                        <strong>Your Feedback:</strong> {p.supervisorFeedback}
                      </div>
                    )
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}