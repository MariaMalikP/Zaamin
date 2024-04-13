 /* eslint-disable */
 
import { useEffect, useState } from 'react';
import Header from './header';
import '../styles/home.css'; 
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactWeather, { useWeatherBit, useVisualCrossing } from 'react-open-weather';

const AdminHome = (prop) => {
    const history = useNavigate();
    const { email } = useParams();
    const [role, setRole] = useState("admin");
    const [returnStatus, setReturnStatus] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [lat, setLat] = useState(31.5204);
    const [lon, setLon] = useState(74.3587);
    const [bds, setBds] = useState();

    const getFullName = async () => {
        try {
            const response = await axios.post('http://localhost:3000/getname', { email, role });
            if (response.data.status === "profile exists") {
                setReturnStatus(response.data.status);
                setFirstName(response.data.firstname);
                setLastName(response.data.lastname);
            } 
            else if (response.data.status === "profile not found") {
                history('/errorpage');
            }
        } catch (error) {
            console.log('Error retrieving full name', error);
        }
    };

    const getBirthdays = async () => {
        try {
            const aa = await axios.get('http://localhost:3000/birthdays-today')
            setBds(aa.data)
            console.log(bds)
        } catch (error) {
            console.log('Error retrieving birthdays')
        }
    };

    useEffect(() => {
        getFullName(email);
        getBirthdays();
        navigator.geolocation.getCurrentPosition((position) => {
            setLat(position.coords.latitude)
            setLon(position.coords.longitude)
        })
    }, []);

    const profilecheck = async () => {    
        try {
            history(`/profilehome/${email}/${role}`);
        } catch (error) {
            alert('Error during login, try again', error);
        }
    };

    const auditnav = async () => {    
        try {
            history(`/auditlogs/${email}/${role}`);
        } catch (error) {
            alert('Error during login, try again', error);
        }
    };

    /*  const { data, isLoading, errorMessage } = useWeatherBit({
        key: 'b9d6f59127894c568942d5e67a05c31b',
        lat: lat,
        lon: lon,
        lang: 'en',
        unit: 'M',
    }); */

    const { data, isLoading, errorMessage } = useVisualCrossing({
        key: '52TE6L9BQWJVJPWWEM6F77WVL',
        lat: lat,
        lon: lon,
        lang: 'en',
        unit: 'metric',
    });
    
    const customStyles = {
        fontFamily:  'Inter, sans-serif',
        gradientStart:  '#e98b5c',
        gradientMid:  '#e98b5c',
        gradientEnd:  '#e98b5c',
        locationFontColor:  '#FFF',
        todayTempFontColor:  '#FFF',
        todayDateFontColor:  '#FFF',
        todayRangeFontColor:  '#FFF',
        todayDescFontColor:  '#FFF',
        todayInfoFontColor:  '#FFF',
        todayIconColor:  '#FFF',
    };

    return (    
        <div className='home'>
            <div><Header /></div>
            <div className='mainheading'>My Dashboard</div>
            <div className='subheading'>Welcome back {firstName} {lastName}</div>
            <div className='subheading3'>What would you like to do?</div>
            <ul className="button-list">
                <li><button className="button-style" type="button" onClick={profilecheck}>1. Manage Profile</button></li>
                <li><button className="button-style" type="button" onClick={auditnav}>2. View Audit Logs</button></li>
                <li><button className="button-style" type="button" onClick={profilecheck}>3. View Compliance Dashboard</button></li>
            </ul>
            <div className='extensions'>
                <ul>
                    <li>
                        <div className='poll-container'>
                            <h2 className = "emp-h2">Today's Birthdays 🎂</h2>
                            <ol className='bdays'>
                                {bds && bds.length > 0 ? (
                                bds.map((user) => (
                                    <li key = {user._id}>
                                    {user.First_Name + " " + user.Last_Name + " : " + user.Email}
                                    </li>
                                ))
                                ) : (
                                <li className="bdays">No birthdays today</li>
                                )}
                            </ol>
                            <div>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className='weather-container'>
                            <ReactWeather
                            errorMessage={errorMessage}
                            isLoading={isLoading}
                            data={data}
                            lang="en"
                            locationLabel="Current Weather"
                            unitsLabels={{ temperature: '°C', windSpeed: 'Km/h' }}
                            showForecast = {false}
                            theme = {customStyles}
                            />
                        </div>
                    </li>
                </ul>
            </div>
            <div class="footer"></div>
        </div>
    );
}

export default AdminHome;