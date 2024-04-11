/* eslint-disable */

import { useEffect, useState } from 'react';
import Header from './header';
import '../styles/home.css';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { jsonToCSV } from 'react-papaparse';

const AuditLogs = (prop) => {
  const history = useNavigate();
  const [logs, setLogs] = useState([]);
  const [firstFifteen, setFirstFifteen] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://localhost:3000/logs');
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
        const csv = jsonToCSV(logs);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'audit_logs.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

  return (
    <div>
      <Header />
      <h2>Audit Logs</h2>
      <h3>First 15 displayed, Export for full logs</h3>
      <button onClick={handleRefreshClick}>Refresh Logs</button>
      <button onClick={handleExportLogs}>Export Full Log</button>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Threat Level</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {firstFifteen.map((log) => (
            <tr key={log._id}>
              <td>{log.timestamp}</td>
              <td>{log.level}</td>
              <td>{log.message}</td>
            </tr>
          ))}
        </tbody>
      </table>      
    </div>
  );
};

export default AuditLogs;