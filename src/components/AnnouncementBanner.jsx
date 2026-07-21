import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './AnnouncementBanner.css';

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);

  useEffect(() => {
    fetchPinned();
  }, []);

  const fetchPinned = async () => {
    try {
      const res = await api.get('/announcements/pinned');
      setAnnouncements(res.data);
    } catch (error) {
      console.error('Failed to load announcements', error);
    }
  };

  const dismiss = (id) => {
    // Only hides it for this browser session — doesn't unpin it for everyone,
    // that's an admin-only action from the Admin Dashboard
    setDismissedIds([...dismissedIds, id]);
  };

  const visibleAnnouncements = announcements.filter((a) => !dismissedIds.includes(a._id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="announcement-banner-wrap">
      {visibleAnnouncements.map((a) => (
        <div className="announcement-banner" key={a._id}>
          <div className="announcement-banner-content">
            <span className="announcement-banner-icon">📢</span>
            <div className="announcement-banner-text">
              <h4>{a.title}</h4>
              <p>{a.message}</p>
              <div className="announcement-banner-meta">
                Posted by {a.postedBy?.name} • {new Date(a.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <button className="announcement-banner-dismiss" onClick={() => dismiss(a._id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}