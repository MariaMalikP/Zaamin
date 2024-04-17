import { useEffect, useState } from 'react';
import Header from './header';
import '../styles/logs.css';
import { useNavigate, Link, useParams, useLocation} from 'react-router-dom';
import axios from 'axios';
import Loader from './loader';
import { jsonToCSV } from 'react-papaparse';


const AuditLogs = (prop) => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [firstFifteen, setFirstFifteen] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const { email , role, hashp} = useParams();
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [returnStatus, setReturnStatus] = useState('');
  const location = useLocation();
  const passedThat = location.state;
  const [isLoading, setIsLoading] = useState(true); // State to track loading status

  useEffect(() => {
    const fetchProfilePic = async () => {
        try {
            const response = await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/viewprofile', { email, role });
            if (response.data.status === "profile exists") {
                setReturnStatus(response.data.status);
                setUserProfilePic(response.data.profile_deets);
            }
        } catch (error) {
            alert('Error fetching Profile Information', error);
        }
    }
    fetchProfilePic();
}, [email]);


  useEffect(() => {
    authcheck();
    const fetchLogs = async () => {
      try {
        const response = await axios.get('https://urchin-app-5oxzs.ondigitalocean.app/logs', {params: {email: email}});
        console.log(response.data)
        setLogs(response.data);
        setFirstFifteen(response.data.slice().reverse().slice(0,15))
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setIsLoading(false); // Set loading status to false when data is fetched
      }
    };
    fetchLogs();
    }, [refresh]);

    const requiredRole="admin"
    const authcheck =  async () =>{
      
      const validcheck = await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/validcheck', { email, hashp, role,requiredRole });
      if(validcheck.data.message!= 'success')
      {
        // alert(validcheck.data)
        navigate("/errorpage")
      }
    }

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

    const handleGoBack = () => {
      if(passedThat === null || passedThat === undefined || passedThat.imfrom === null || passedThat.imfrom === undefined)
      {
        navigate(`/adminhome/${email}/${hashp}`);
      }
      else if(passedThat.imfrom === "adminhome")
      {
        navigate(`/adminhome/${email}/${hashp}`);
      }
      else
      {
        navigate(`/admprofilehome/${email}/${role}/${hashp}`);
      }
    }

  return (
    <div class = "overall">
      <Header email={email} userProfile={userProfilePic} hashp={hashp}/>
      <img src="/images/backarrow.png" className="profileback-arrow" alt="Back" onClick={handleGoBack}/>
      <div class="audit-logs-container">
      {isLoading ? (
      <Loader /> // Display loader while data is being fetched
    ) : (
      <>
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
            </>
          )}
        </div>
    </div>
                
  );
};

export default AuditLogs;

