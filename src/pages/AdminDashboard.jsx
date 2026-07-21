import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './AdminDashboard.css';

const sidebarLinks = [
  { path: '/admin-dashboard', label: 'Dashboard', icon: '📊' },
];

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [proposalFilter, setProposalFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchProposals();
    fetchAnnouncements();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      const res = await api.get('/proposals');
      setProposals(res.data);
    } catch (error) {
      console.error('Failed to load proposals', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (error) {
      console.error('Failed to load announcements', error);
    }
  };

  const openModal = () => {
    setPostResult('');
    setAnnTitle('');
    setAnnMessage('');
    setSendEmail(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setPostResult('');

    if (!annTitle.trim() || !annMessage.trim()) {
      setPostResult('Please fill in both title and message');
      return;
    }

    setPosting(true);
    try {
      const res = await api.post('/announcements', {
        title: annTitle,
        message: annMessage,
        sendEmailToStudents: sendEmail,
      });
      setPostResult(res.data.message);
      fetchAnnouncements();
      setTimeout(() => {
        setShowModal(false);
      }, 1200);
    } catch (error) {
      setPostResult(error.response?.data?.message || 'Failed to post announcement');
    } finally {
      setPosting(false);
    }
  };

  const handleUnpin = async (id) => {
    try {
      await api.put(`/announcements/${id}/unpin`);
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to unpin', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement permanently?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalSupervisors = users.filter((u) => u.role === 'supervisor').length;
  const totalProposals = proposals.length;
  const pendingProposals = proposals.filter((p) => p.status === 'pending').length;
  const approvedProposals = proposals.filter((p) => p.status === 'approved').length;
  const rejectedProposals = proposals.filter((p) => p.status === 'rejected').length;

  const filteredUsers =
    roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter);

  const filteredProposals =
    proposalFilter === 'all' ? proposals : proposals.filter((p) => p.status === proposalFilter);

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />

      <div className="dashboard-content">
        <div className="dashboard-header-row">
          <div className="dashboard-header">
            <h1>Welcome, {user?.name}</h1>
            <p>System overview and user management</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-open-modal" onClick={() => setShowAnalytics(!showAnalytics)}>
              {showAnalytics ? '📋 View Data' : '📈 Analytics'}
            </button>
            <button className="btn-open-modal" onClick={openModal}>
              📢 Post Announcement
            </button>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card students">
            <div className="stat-number">{totalStudents}</div>
            <div className="stat-label">Students</div>
          </div>
          <div className="stat-card supervisors">
            <div className="stat-number">{totalSupervisors}</div>
            <div className="stat-label">Supervisors</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalProposals}</div>
            <div className="stat-label">Total Proposals</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">{pendingProposals}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-number">{approvedProposals}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>

        {showAnalytics && (
          <div className="section-card">
            <h2>Proposal Analytics</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '14px', color: '#4a5568', marginBottom: '12px' }}>Proposals by Status</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Pending', value: pendingProposals },
                        { name: 'Approved', value: approvedProposals },
                        { name: 'Rejected', value: rejectedProposals },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      <Cell fill="#d69e2e" />
                      <Cell fill="#38a169" />
                      <Cell fill="#e53e3e" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', color: '#4a5568', marginBottom: '12px' }}>Proposals by Domain</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getDomainCounts(proposals)}>
                    <XAxis dataKey="domain" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1a2332" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div className="section-card">
          <h2>Announcement History</h2>
          {announcements.length === 0 ? (
            <p className="empty-state">No announcements yet. Click "Post Announcement" above to send your first one.</p>
          ) : (
            announcements.map((a) => (
              <div className="announcement-item" key={a._id}>
                <div className="announcement-header">
                  <h3>{a.title}</h3>
                  <div>
                    {a.emailSent && <span className="tag-emailed">📧 Emailed</span>}
                    {a.isPinned ? (
                      <span className="tag-pinned">📌 Pinned</span>
                    ) : (
                      <span className="tag-unpinned">Unpinned</span>
                    )}
                  </div>
                </div>
                <p>{a.message}</p>
                <div className="announcement-meta">
                  <span>By {a.postedBy?.name} • {new Date(a.createdAt).toLocaleDateString()}</span>
                  <div className="announcement-actions">
                    {a.isPinned && (
                      <button className="btn-unpin" onClick={() => handleUnpin(a._id)}>
                        Unpin
                      </button>
                    )}
                    <button className="btn-delete" onClick={() => handleDelete(a._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="section-card">
          <h2>All Proposals — Supervisor Decisions</h2>

          <div className="filter-tabs">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <div
                key={f}
                className={`filter-tab ${proposalFilter === f ? 'active' : ''}`}
                onClick={() => setProposalFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </div>
            ))}
          </div>

          {filteredProposals.length === 0 ? (
            <p className="empty-state">No proposals found.</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Student</th>
                  <th>Supervisor</th>
                  <th>Status</th>
                  <th>Similarity</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map((p) => (
                  <tr key={p._id}>
                    <td>{p.title}</td>
                    <td>{p.submittedBy?.name || 'N/A'}</td>
                    <td>{p.supervisor?.name || 'Not assigned'}</td>
                    <td>
                      <span className={`role-tag ${p.status === 'approved' ? 'student' : p.status === 'rejected' ? 'admin' : 'supervisor'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{p.similarityScore}%</td>
                    <td>{p.supervisorFeedback || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="section-card">
          <h2>All Users</h2>

          <div className="filter-tabs">
            {['all', 'student', 'supervisor', 'admin'].map((f) => (
              <div
                key={f}
                className={`filter-tab ${roleFilter === f ? 'active' : ''}`}
                onClick={() => setRoleFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </div>
            ))}
          </div>

          {loading ? (
            <p className="empty-state">Loading...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="empty-state">No users found.</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Roll No</th>
                  <th>Department</th>
                  <th>Batch</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-tag ${u.role}`}>{u.role}</span>
                    </td>
                    <td>{u.rollNumber || '-'}</td>
                    <td>{u.department || '-'}</td>
                    <td>{u.batch || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Post Announcement</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {postResult && <div className="post-result">{postResult}</div>}

            <form className="announcement-form" onSubmit={handlePostAnnouncement}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="e.g. Proposal Deadline Extended"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  placeholder="Write your announcement..."
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                />
              </div>
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                />
                <label htmlFor="sendEmail">Also send this as an email to all students</label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-post" disabled={posting}>
                  {posting ? 'Posting...' : 'Post Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Groups proposals by domain and counts them, for the bar chart
function getDomainCounts(proposals) {
  const counts = {};
  proposals.forEach((p) => {
    if (!p.domain) return;
    counts[p.domain] = (counts[p.domain] || 0) + 1;
  });
  return Object.entries(counts).map(([domain, count]) => ({ domain, count }));
}