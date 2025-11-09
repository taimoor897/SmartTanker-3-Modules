import React, { useEffect, useState } from 'react';
import TankLevelCard from './TankLevelCard';
import { useNavigate } from 'react-router-dom';

import './Dashboard.css';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mocked UI states (no backend change)
  const [connected, setConnected] = useState(true);
  const [usageData, setUsageData] = useState([]);
  const [notifications, setNotifications] = useState([]);



  const navigate = useNavigate();

  const handleLogout = () => {
    // Optional: clear local storage or session
    localStorage.removeItem('token');
    sessionStorage.clear();

    // Redirect to login page
    navigate('/login');
  };








  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/iot/get-level');
        if (!res.ok) throw new Error('Failed to fetch dashboard data');

        const data = await res.json();
        // ✅ Keep your original logic untouched
        setDashboard(
          data.data.length > 0 ? data.data[data.data.length - 1] : null
        );

        // UI-only logic (mock data for visuals)
        const latest = data.data[data.data.length - 1];
        setUsageData(prev =>
          [...prev.slice(-9), { time: new Date().toLocaleTimeString(), level: latest?.level || 0 }]
        );

        // Randomly simulate connection (for visuals only)
        setConnected(Math.random() > 0.1);

        // Generate mock notifications (for visuals only)
        if (latest?.level < 20) {
          setNotifications(prev => [
            { id: Date.now(), msg: '⚠️ Low Water Level Detected!' },
            ...prev.slice(0, 4),
          ]);
        }
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

  // Mock chart data (visual only)
  const chartData = {
    labels: usageData.map(u => u.time),
    datasets: [
      {
        label: 'Water Level (%)',
        data: usageData.map(u => u.level),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
  <div className="header-left">
    <h1>
      SmartTanker&nbsp;<i className="fa-solid fa-truck moving-icon"></i>
    </h1>
  </div>

  <div className="header-right">
  <button className="logout-btn" onClick={handleLogout}>
  <i className="fa-solid fa-right-from-bracket"></i> Logout
</button>

  </div>
</header>


      <div className="dashboard-container">
        <h1 className="dashboard-title">Customer Dashboard</h1>

        {dashboard && (
          <>
            {/* === Cards Row === */}
            <div className="dashboard-cards">
              <TankLevelCard level={dashboard.level} />

              {/* IoT Connection Status */}
              <div className="dashboard-card">
                <h3>Sensor Status</h3>
                <p className={connected ? 'status-online' : 'status-offline'}>
                  {connected ? 'Connected ✅' : 'Disconnected ❌'}
                </p>
              </div>

              {/* Active Orders */}
              <div className="dashboard-card">
                <h3>Active Orders</h3>
                <p>0</p>
              </div>
            </div>

            {/* === Water Level Trend Chart === */}
            <div className="dashboard-card chart-card">
              <h3>Water Usage Trend</h3>
              <Line data={chartData} height={90} />
            </div>

            {/* === Notifications Section === */}
            <div className="dashboard-card notifications-card">
              <h3>Recent Notifications</h3>
              {notifications.length === 0 ? (
                <p>No alerts</p>
              ) : (
                <ul>
                  {notifications.map(n => (
                    <li key={n.id}>{n.msg}</li>
                  ))}
                </ul>
              )}
            </div>

           {/* === Booking History === */}
<div className="dashboard-history">
  <h2>Booking History</h2>
  <ul className="booking-list">
    {/* Placeholder (You can later map actual bookings here) */}
    <li className="booking-item">
      <div className="booking-info">
        <i className="fa-solid fa-calendar-day booking-icon"></i>
        <div>
          <p className="order-date">Oct 30, 2025 — 3:42 PM</p>
          <p className="order-id">Order #TKR-1024</p>
        </div>
      </div>
      <span className="order-status completed">Completed</span>
    </li>

    <li className="booking-item">
      <div className="booking-info">
        <i className="fa-solid fa-calendar-day booking-icon"></i>
        <div>
          <p className="order-date">Oct 25, 2025 — 11:20 AM</p>
          <p className="order-id">Order #TKR-1019</p>
        </div>
      </div>
      <span className="order-status pending">Pending</span>
    </li>

    <li className="booking-item">
      <div className="booking-info">
        <i className="fa-solid fa-calendar-day booking-icon"></i>
        <div>
          <p className="order-date">Oct 15, 2025 — 2:18 PM</p>
          <p className="order-id">Order #TKR-1005</p>
        </div>
      </div>
      <span className="order-status canceled">Canceled</span>
    </li>
  </ul>
</div>


            {/* === Quick Action === */}
            <div className="dashboard-card quick-action">
              <button
                className="book-btn"
                onClick={() => alert('🚚 Tanker booked successfully!')}
              >
                Request Tanker
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
