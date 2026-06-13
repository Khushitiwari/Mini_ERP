import { useEffect } from 'react';
import { useERP } from '../context/ERPContext';
import { formatDate, showError } from '../utils/helpers';

export default function AuditLogs() {
  const { data, refreshAuditLogs } = useERP();

  useEffect(() => {
    refreshAuditLogs().catch((err) => showError(err, 'Failed to load audit logs'));
  }, [refreshAuditLogs]);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Audit Logs</h2>
        <p className="page-subtitle">System activity trail (Admin only)</p>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Entity ID</th>
            </tr>
          </thead>
          <tbody>
            {data.auditLogs.map((log) => (
              <tr key={log.id}>
                <td>{formatDate(log.timestamp)}</td>
                <td>{log.userName}</td>
                <td>{log.action}</td>
                <td>{log.entityType}</td>
                <td>{log.entityId}</td>
              </tr>
            ))}
            {data.auditLogs.length === 0 && (
              <tr><td colSpan="5" className="empty-row">No audit logs</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
