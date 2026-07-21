import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ links }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>FYP Portal</h2>
        <p>Proposal Management</p>
      </div>

      <div className="sidebar-nav">
        {links.map((link) => (
          <div
            key={link.path}
            className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
            onClick={() => navigate(link.path)}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <p>{user?.name}</p>
          <p>{user?.role}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}