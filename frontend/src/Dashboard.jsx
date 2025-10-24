import React, { useEffect, useState } from 'react';
import TankLevelCard from './TankLevelCard';
import './Dashboard.css';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/iot/get-level');
        if (!res.ok) throw new Error('Failed to fetch dashboard data');

        const data = await res.json();
        // ✅ Extract latest level from data.data array
        setDashboard(
          data.data.length > 0 ? data.data[data.data.length - 1] : null
        );
      } catch (err) {
        console.error('❌ Dashboard fetch error:', err);
        setError('Failed to load dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="dashboard-message">Loading dashboard...</p>;
  if (error) return <p className="dashboard-message error">{error}</p>;

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <h1>SmartTanker&nbsp;<i className="fa-solid fa-truck moving-icon"></i></h1>
      </header>

      {/* Content container */}
      <div className="dashboard-container">
        <h1 className="dashboard-title">Customer Dashboard</h1>

        {dashboard && (
          <>
            {/* Card layout */}
            <div className="dashboard-cards">
              <TankLevelCard level={dashboard.level} />

              <div className="dashboard-card">
                <h3>Active Orders</h3>
                <p>0</p>
              </div>
            </div>

            {/* Booking history placeholder */}
            <div className="dashboard-history">
              <h2>Booking History</h2>
              <ul>
                <li>No booking history found</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
