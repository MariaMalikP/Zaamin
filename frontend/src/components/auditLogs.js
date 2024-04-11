/* eslint-disable */

import { useEffect, useState } from 'react';
import Header from './header';
import '../styles/logs.css';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { jsonToCSV } from 'react-papaparse';

const AuditLogs = (prop) => {
  const history = useNavigate();
  const [logs, setLogs] = useState([]);
  const [firstFifteen, setFirstFifteen] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const { email , role} = useParams();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://localhost:3000/logs', {params: {email: email}});
        console.log(response.data)
        setLogs(response.data);
        setFirstFifteen(response.data.slice().reverse().slice(0,15))
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };
    fetchLogs();
    }, [refresh]);

    const handleRefreshClick = () => {
        setRefresh(prevRefresh => !prevRefresh);
    };

    const handleExportLogs = () => {
      const filterLogs = logs.map(entry => ({
        id: entry._id,
        timestamp: entry.timestamp,
        level: entry.level,
        message: entry.message
      }));
    
        const csv = jsonToCSV(filterLogs);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'audit_logs.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

  return (
    <div class = "overall">
        <Header />
        <div class="audit-logs-container">
            <h2 class="audit-logs-title">Audit Logs</h2>
            <h3 class="audit-logs-subtitle">First 15 displayed, Export for full logs</h3>
            <button class="refresh-button" onClick={handleRefreshClick}>Refresh Logs</button>
            <button class="export-button" onClick={handleExportLogs}>Export Full Log</button>
            <table class="audit-log-table">
                <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Threat Level</th>
                    <th>Message</th>
                </tr>
                </thead>
                <tbody>
                {firstFifteen.map((log) => (
                <tr key={log._id} className={(log.level === 'warn' || log.level === 'error') ? 'warn-level-row' : 'normal-level-row'}>
                    <td>{log.timestamp}</td>
                    <td>{log.level}</td>
                    <td>{log.message}</td>
                </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default AuditLogs;