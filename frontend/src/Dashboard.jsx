import React, { useState, useEffect } from 'react';
import { api } from './api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      const res = await api.dashboard.getKPIs();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (!data) return <div>Failed to load data</div>;

  const { kpis, recentActivity } = data;

  const filteredActivity = filterType === 'All' 
    ? recentActivity 
    : recentActivity.filter(a => a.operation.toLowerCase() === filterType.toLowerCase());

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Operations Overview</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{color: 'var(--text-muted)', display: 'flex', alignItems: 'center'}}>Filter: </span>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: '150px' }}>
            <option value="All">All Types</option>
            <option value="receipt">Receipts</option>
            <option value="delivery">Deliveries</option>
            <option value="transfer">Transfers</option>
            <option value="adjustment">Adjustments</option>
            </select>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="glass-card kpi-card">
          <span className="label">Total Products</span>
          <span className="value">{kpis.totalProducts}</span>
        </div>
        <div className="glass-card kpi-card" style={{ borderColor: kpis.lowStock > 0 ? 'rgba(239, 68, 68, 0.4)' : ''}}>
          <span className="label">Low Stock Items</span>
          <span className="value" style={{ color: kpis.lowStock > 0 ? 'var(--danger)' : '' }}>{kpis.lowStock}</span>
        </div>
        <div className="glass-card kpi-card">
          <span className="label">Pending Receipts</span>
          <span className="value">{kpis.pendingReceipts}</span>
        </div>
        <div className="glass-card kpi-card">
          <span className="label">Pending Deliveries</span>
          <span className="value">{kpis.pendingDeliveries}</span>
        </div>
      </div>

      <h3>Recent Activity</h3>
      <div className="glass-card" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Operation</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Location Flow</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivity.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign: 'center', color: 'var(--text-muted)'}}>No recent activity found.</td></tr>
            ) : filteredActivity.map((activity) => (
              <tr key={activity.id}>
                <td>{new Date(activity.date).toLocaleString()}</td>
                <td><span className={`status-badge status-${activity.operation === 'receipt' ? 'done' : activity.operation === 'delivery' ? 'canceled' : 'waiting'}`} style={{textTransform:'capitalize'}}>{activity.operation}</span></td>
                <td style={{fontWeight: 500}}>{activity.product}</td>
                <td style={{ color: activity.quantity > 0 ? 'var(--accent)' : activity.quantity < 0 ? 'var(--danger)' : 'var(--text-main)', fontWeight: 'bold' }}>
                  {activity.quantity > 0 ? '+' : ''}{activity.quantity}
                </td>
                <td style={{color: 'var(--text-muted)'}}>{activity.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
