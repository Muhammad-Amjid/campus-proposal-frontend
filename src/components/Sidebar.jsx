import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ links }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLinkClick = (path) => {
    navigate(path);
    setIsOpen(false); // close menu after picking a link, on mobile
  };

  return (
    <>
      {/* Hamburger button — only visible on mobile via CSS */}
      <button className="hamburger-btn" onClick={() => setIsOpen(true)}>
        ☰
      </button>

      {/* Dark overlay behind the menu when open, on mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-top">
            <h2>FYP Portal</h2>
            <button className="sidebar-close-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>
          <p>Proposal Management</p>
        </div>

        <div className="sidebar-nav">
          {links.map((link) => (
            <div
              key={link.path}
              className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => handleLinkClick(link.path)}
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
    </>
  );
}