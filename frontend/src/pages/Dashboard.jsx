import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats } from '../services/api';
import Spinner from '../components/Spinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats({ totalVenues: 0, totalEvents: 0, totalRegistrations: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading dashboard..." />;

  const statCards = [
    {
      icon: '🏛️',
      label: 'Total Venues',
      value: stats.totalVenues,
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      icon: '📅',
      label: 'Total Events',
      value: stats.totalEvents,
      color: '#7c3aed',
      bg: '#ede9fe',
    },
    {
      icon: '📝',
      label: 'Total Registrations',
      value: stats.totalRegistrations,
      color: '#16a34a',
      bg: '#dcfce7',
    },
  ];

  const actions = [
    {
      icon: '🏛️',
      title: 'Venue Management',
      desc: 'Add, update, and manage campus venues with capacity and location details.',
      color: '#eff6ff',
      viewPath: '/venues',
    },
    {
      icon: '📅',
      title: 'Event Management',
      desc: 'Create and manage campus events, assign venues, and set schedules.',
      color: '#ede9fe',
      viewPath: '/events',
    },
    {
      icon: '📝',
      title: 'Registration Management',
      desc: 'Track student registrations, filter by event, and manage records.',
      color: '#dcfce7',
      viewPath: '/registrations',
    },
  ];

  return (
    <div className="page-container">
      {/* Hero Banner */}
      <div className="hero-banner" style={{ marginBottom: '2rem' }}>
        <div className="hero-text">
          <h2>Welcome back, Admin 👋</h2>
          <p>
            Here's what's happening across your campus events today. Manage venues,
            events, and registrations all from one place.
          </p>
        </div>
        <div className="hero-illustration">🎓</div>
      </div>

      {/* Stat Cards */}
      <div className="section-title">Overview</div>
      <div className="stat-grid">
        {statCards.map((s, i) => (
          <div
            key={i}
            className="stat-card fade-in-up"
            style={{ '--stat-color': s.color, '--stat-bg': s.bg }}
          >
            <div className="stat-card-icon" style={{ fontSize: '1.5rem' }}>{s.icon}</div>
            <div>
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="section-title">Quick Actions</div>
      <div className="action-grid">
        {actions.map((a, i) => (
          <div
            key={i}
            className="action-card fade-in-up"
            style={{ '--ac-color': a.color }}
          >
            <div className="action-card-icon">{a.icon}</div>
            <h3>{a.title}</h3>
            <p>{a.desc}</p>
            <div className="action-card-buttons">
              <button className="btn btn-primary btn-sm" onClick={() => navigate(a.viewPath)}>
                📋 View & Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
