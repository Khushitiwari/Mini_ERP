import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import { useERP } from '../context/ERPContext';
import * as auditLogApi from '../api/auditLogApi';
import { mapAuditLogFromApi } from '../api/mappers';
import { formatDate, showError } from '../utils/helpers';

export default function AuditLogs() {
  const { updateData } = useERP();
  const [searchParams] = useSearchParams();
  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = { limit: 100 };
    if (entityType) params.entityType = entityType;
    if (entityId) params.entityId = entityId;

    setLoading(true);
    auditLogApi
      .getAuditLogs(params)
      .then((result) => {
        const items = result.items ?? result;
        const mapped = items.map(mapAuditLogFromApi);
        setLogs(mapped);
        updateData('auditLogs', mapped);
      })
      .catch((err) => showError(err, 'Failed to load audit logs'))
      .finally(() => setLoading(false));
  }, [entityType, entityId, updateData]);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Audit Logs</h2>
        <p className="page-subtitle">System activity trail (Admin only)</p>
      </div>

      {(entityType || entityId) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Filtered by{' '}
          {entityType && <Chip label={`Entity: ${entityType}`} size="small" sx={{ mr: 1 }} />}
          {entityId && <Chip label={`ID: ${entityId}`} size="small" />}
        </Alert>
      )}

      <div className="card">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : (
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
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDate(log.timestamp)}</td>
                  <td>{log.userName}</td>
                  <td>{log.action}</td>
                  <td>{log.entityType}</td>
                  <td>{log.entityId}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No audit logs
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
