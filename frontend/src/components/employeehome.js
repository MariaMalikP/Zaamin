import React, { useEffect, useState } from 'react';
import Header from './header';
import '../styles/home.css';
import '../styles/emhome.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactWeather, { useVisualCrossing } from 'react-open-weather';
import {AlertTitle, Alert} from '@mui/material';

const EmployeeHome = (prop) => {
    const history = useNavigate();
    const { email, hashp } = useParams();
    const [role, setRole] = useState("employee");
    const [returnStatus, setReturnStatus] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userProfilePic, setUserProfilePic] = useState(null);
    const [lat, setLat] = useState(31.5204);
    const [lon, setLon] = useState(74.3587);
    const [bds, setBds] = useState([]);
    const [todoList, setTodoList] = useState([]); 
    const [newTodo, setNewTodo] = useState('');
    const [announcements, setAnnouncements] = useState([]);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        getFullName(email);
        getBirthdays();
        fetchTodoList(email);
        fetchAnnouncements();
        navigator.geolocation.getCurrentPosition((position) => {
            setLat(position.coords.latitude)
            setLon(position.coords.longitude)
        })
        const fetchProfilePic = async () => {
        try {
            const response = await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/viewprofile', { email, role });
            if (response.data.status === "profile exists") {
                setReturnStatus(response.data.status);
                setUserProfilePic(response.data.profile_deets);
            }
        } catch (error) {
            setAlertOpen(true);
            setAlertSeverity('error');
            setAlertMessage('Error fetching Profile Information');
        }
    }
    fetchProfilePic();
    }, []);

    const getFullName = async () => {
        try {
            const response = await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/getname', { email, role });
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
            const aa = await axios.get('https://urchin-app-5oxzs.ondigitalocean.app/birthdays-today')
            setBds(aa.data)
            console.log(bds)
        } catch (error) {
            console.log('Error retrieving birthdays')
        }
    };

    const fetchTodoList = async () => {
        try {
            const response = await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/gettodo', {email});
            setTodoList(response.data);
        } catch (error) {
            console.error('Error fetching to-do list:', error);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const response = await axios.get('https://urchin-app-5oxzs.ondigitalocean.app/getannouncements');
            setAnnouncements(response.data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const addTodo = async () => {
        try {
            const response = await axios.post('https://urchin-app-5oxzs.ondigitalocean.app/addtodo', { email, task: newTodo });
            fetchTodoList(email); 
            setNewTodo(''); // Clear input field
        } catch (error) {
            console.error('Error adding to-do:', error);
        }
    };

    const removeTodo = async (id) => {
        try {
            await axios.delete(`https://urchin-app-5oxzs.ondigitalocean.app/removetodo/${id}`);
            fetchTodoList(email); 
        } catch (error) {
            console.error('Error removing to-do:', error);
        }
    };

    const profilecheck = async () => {
        try {
            history(`/profilehome/${email}/${role}/${hashp}`);
        } catch (error) {
            setAlertOpen(true);
            setAlertSeverity('error');
            setAlertMessage('Error navigating to profile page');
        }
    };

    const medicalnav = async () => {
        try {
            history(`/medicalcheck/${email}/${role}/${hashp}`);
        } catch (error) {
            setAlertOpen(true);
            setAlertSeverity('error');
            setAlertMessage('Error navigating to medical information page');
        }
    };

    const financenav = async () => {
        try {
            history(`/financialcheck/${email}/${role}/${hashp}`);
        } catch (error) {
            setAlertOpen(true);
            setAlertSeverity('error');
            setAlertMessage('Error navigating to financial information page');
        }
    };

    function formatTime(time) {
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
        return `${formattedHours}:${formattedMinutes} ${period}`;
    }
    function formatDate(dateString) {
        // Create a Date object from the input date string
        const date = new Date(dateString);
    
        // Extract the day, month, and year
        const day = date.getDate();
        const month = date.getMonth() + 1; // Month is zero-based, so we add 1
        const year = date.getFullYear();
    
        // Format the date in dd/mm/yyyy format
        return `${day}/${month}/${year}`;
    }

    const { data, isLoading, errorMessage } = useVisualCrossing({
        key: '52TE6L9BQWJVJPWWEM6F77WVL',
        lat: lat,
        lon: lon,
        lang: 'en',
        unit: 'metric',
    });
    
    const customStyles = {
        fontFamily:  'Inter, sans-serif',
        gradientStart:  '#a78fbf',
        gradientMid:  '#a78fbf',
        gradientEnd:  '#a78fbf',
        locationFontColor:  '#FFF',
        todayTempFontColor:  '#FFF',
        todayDateFontColor:  '#FFF',
        todayRangeFontColor:  '#FFF',
        todayDescFontColor:  '#FFF',
        todayInfoFontColor:  '#FFF',
        todayIconColor:  '#FFF',
    };

    const updateNewTodo = (e) => {
        setNewTodo(e.target.value);
    };

    return (
        <div className='home'>
            <Header email={email} userProfile={userProfilePic} hashp={hashp}/>
            <div className='welcomemessage'>Welcome back, {firstName} {lastName}!</div>
            <div className="ehome_box1">
                <img src='https://i.pinimg.com/originals/c0/c2/16/c0c216b3743c6cb9fd67ab7df6b2c330.jpg' alt='Profile' className='ehome_icons1' />
            </div>
            <button className="button-style ehome_button1" type="button" onClick={profilecheck}>Manage Profile</button>
            <div className="ehome_box2">
                <img src='/medicine.png' alt='Audit' className='ehome_icons2' />
            </div>
            <button className="button-style ehome_button2" type="button" onClick={medicalnav}>Medical Centre</button>
            <div className="ehome_box3">
                <img src='/finance.png' alt='Compliance' className='ehome_icons3' />
            </div>
            <button className="button-style ehome_button3" type="button" onClick={financenav}>Finance Centre</button>
            <div className="announcement-container">
                <h2>Announcements</h2>
                {announcements.filter(announcement => {
                const announcementDateTime = new Date(announcement.date);
                const [hours, minutes] = announcement.time.split(':').map(Number);
                announcementDateTime.setHours(hours);
                announcementDateTime.setMinutes(minutes);
                return announcementDateTime >= new Date();
            }).length > 0 ? (
                <table className="announcement-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Date</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {announcements
                            .filter(announcement => {
                                const announcementDateTime = new Date(announcement.date);
                                const [hours, minutes] = announcement.time.split(':').map(Number);
                                announcementDateTime.setHours(hours);
                                announcementDateTime.setMinutes(minutes);
                                return announcementDateTime >= new Date();
                            })
                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                            .map((announcement, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{announcement.title}</td>
                                    <td>{announcement.description}</td>
                                    <td>{formatDate(announcement.date)}</td>
                                    <td>{formatTime(announcement.time)}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                            ) : (
                                <p className="bdays">No upcoming events!</p>
                            )}
            </div>
            <div className='extensions'>
                <ul>
                    <li>
                        <div className='poll-container'>
                            <h2 className="emp-h2">Today's Birthdays 🎂</h2>
                            <ol className='bdays'>
                                {bds && bds.length > 0 ? (
                                    bds.map((user) => (
                                        <li key={user._id}>
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
                                showForecast={false}
                                theme={customStyles}
                            />
                        </div>
                    </li>
                    <li>
                        <div className="todo-container">
                            <h2>To-Do List</h2>
                            <input className='todo-input'
                                type="text"
                                placeholder="Enter task"
                                value={newTodo}
                                onChange={updateNewTodo}
                            />
                            <button className="todo-text" onClick={addTodo}> Add </button>
                            <ol>
                                {todoList.map((todo, index) => (
                                    <ul className="todo-list" key={index}>
                                        <li>
                                            {index + 1}. {todo.task}   
                                            <button className="todoremove-button" onClick={() => removeTodo(todo._id)}>✖️</button>
                                        </li>
                                    </ul>
                                ))}
                            </ol>
                        </div>
                    </li>
                </ul>
            </div>
            <div className="footer"></div>
            {/* Alert component */}
            {alertOpen &&
                    <Alert className="alert-container-signup"severity={alertSeverity} onClose={() => setAlertOpen(false)} open={alertOpen} sx= {{padding: '20px', fontSize: '20px',opacity:'1',borderRadius: '10px'}}>
                    <AlertTitle>{alertSeverity === 'success' ? 'Success' : 'Error'}</AlertTitle>
                    {alertMessage}
                </Alert>
            }
        </div>
    );
}

export default EmployeeHome;