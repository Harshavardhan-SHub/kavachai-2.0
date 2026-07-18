import React, { useState } from 'react';
import { Shield, AlertOctagon, Heart, Server, Trash2, ShieldAlert, BarChart3, Filter } from 'lucide-react';

export default function AnalyticsDashboard({ incidentLogs, clearIncidentLogs }) {
  const [filterLevel, setFilterLevel] = useState('ALL');

  // Compute Metrics
  const totalScans = incidentLogs.length;
  const highThreatCount = incidentLogs.filter(log => log.risk_level === 'HIGH').length;
  const suspiciousCount = incidentLogs.filter(log => log.risk_level === 'SUSPICIOUS').length;
  const safeCount = incidentLogs.filter(log => log.risk_level === 'SAFE').length;
  const guardianAlertsCount = incidentLogs.filter(log => log.risk_level === 'HIGH').length; // sent on high threat

  const averageScore = totalScans > 0 
    ? Math.round(incidentLogs.reduce((acc, log) => acc + log.threat_score, 0) / totalScans)
    : 0;

  // Filter logs
  const filteredLogs = incidentLogs.filter(log => {
    if (filterLevel === 'ALL') return true;
    return log.risk_level === filterLevel;
  });

  // Category counts
  const categoryCounts = incidentLogs.reduce((acc, log) => {
    acc[log.threat_type] = (acc[log.threat_type] || 0) + 1;
    return acc;
  }, {});

  const categories = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    count: categoryCounts[cat],
    percent: totalScans > 0 ? Math.round((categoryCounts[cat] / totalScans) * 100) : 0
  })).sort((a,b) => b.count - a.count);

  // Needle angle for Dial Gauge (from -90 to +90 degrees)
  const dialRotation = ((averageScore / 100) * 180) - 90;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'slideUp 0.4s ease' }}>
      {/* Metrics Row */}
      <div className="grid-3">
        {/* Metric 1 */}
        <div className="glass-card metric-card">
          <div className="metric-info">
            <h3>Total Safety Scans</h3>
            <div className="metric-value">{totalScans}</div>
          </div>
          <div className="metric-icon-wrap" style={{ color: 'var(--accent-wa)' }}>
            <Shield size={24} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card metric-card">
          <div className="metric-info">
            <h3>High Risk Threats</h3>
            <div className="metric-value" style={{ color: 'var(--color-threat)' }}>{highThreatCount}</div>
          </div>
          <div className="metric-icon-wrap" style={{ color: 'var(--color-threat)', background: 'rgba(239, 68, 68, 0.05)' }}>
            <ShieldAlert size={24} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card metric-card">
          <div className="metric-info">
            <h3>Guardian Alerts Dispatched</h3>
            <div className="metric-value" style={{ color: '#06b6d4' }}>{guardianAlertsCount}</div>
          </div>
          <div className="metric-icon-wrap" style={{ color: '#06b6d4', background: 'rgba(6, 182, 212, 0.05)' }}>
            <Server size={24} />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2">
        {/* Chart A: Avg Threat Score Conic Gauge */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Average Cognitive Threat Index
          </h3>
          
          <div className="threat-dial-wrap">
            <div className="threat-dial-gauge"></div>
            <div className="threat-dial-needle" style={{ transform: `rotate(${dialRotation}deg)` }}></div>
            <div className="threat-dial-text">{averageScore}%</div>
          </div>
          
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '20px', textAlign: 'center', maxWidth: '300px' }}>
            {averageScore >= 70 ? 'Warning: Core index indicates critical active threat levels on protected endpoints.' : averageScore >= 40 ? 'Caution: Incidents average in suspicious zones.' : 'Status: Secured. Normal system index.'}
          </p>
        </div>

        {/* Chart B: Category list */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Scam Taxonomy Distribution
          </h3>
          
          {categories.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No threat data recorded yet. Send messages in the WhatsApp Simulator.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
              {categories.map((cat, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '500' }}>{cat.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{cat.count} ({cat.percent}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${cat.percent}%`,
                      background: cat.name.includes('Legitimate') ? 'var(--color-safe)' : cat.name.includes('Impersonation') || cat.name.includes('Scam') ? 'var(--color-threat)' : 'var(--color-suspicious)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Incident logs table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Safety Incident Log Registry</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Timeline ledger of cognitive threat assessments across endpoints</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Filter buttons */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2px' }}>
              {['ALL', 'HIGH', 'SUSPICIOUS', 'SAFE'].map(lvl => (
                <button
                  key={lvl}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: filterLevel === lvl ? 'rgba(255,255,255,0.08)' : 'none',
                    color: filterLevel === lvl ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setFilterLevel(lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Clear logs */}
            {incidentLogs.length > 0 && (
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '8px 12px', display: 'flex', gap: '6px', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-threat)' }} onClick={clearIncidentLogs}>
                <Trash2 size={14} /> Clear Logs
              </button>
            )}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <AlertOctagon size={32} style={{ marginBottom: '12px', color: 'var(--text-muted)' }} />
            <p>No logged safety incident logs matching query.</p>
          </div>
        ) : (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Source message</th>
                  <th>Type</th>
                  <th>Scam category</th>
                  <th>Threat Score</th>
                  <th>Guardian Alert</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className="history-tr">
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }} title={log.original_text}>
                      {log.original_text}
                    </td>
                    <td style={{ fontSize: '0.75rem' }}><span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}>{log.input_type}</span></td>
                    <td style={{ fontWeight: '500', fontSize: '0.8rem' }}>{log.threat_type}</td>
                    <td>
                      <span className={`wa-threat-badge ${log.risk_level === 'HIGH' ? 'badge-high' : log.risk_level === 'SUSPICIOUS' ? 'badge-suspicious' : 'badge-safe'}`}>
                        {log.threat_score}%
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem' }}>
                      {log.risk_level === 'HIGH' ? (
                        <span style={{ color: 'var(--accent-wa)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Shield size={12} /> SMS Dispatched
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Not Sent</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
