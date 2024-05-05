import React, { useEffect, useState } from 'react';
import Header from './header';
import '../styles/home.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactWeather, { useVisualCrossing } from 'react-open-weather';
// import successSound from '../path/to/success-sound.mp3';
import {AlertTitle, Alert} from '@mui/material';


const AdminHome = () => {
    const history = useNavigate();
    const { email, hashp } = useParams();
    const [role, setRole] = useState("admin");
    const [userProfilePic, setUserProfilePic] = useState(null);
    const [returnStatus, setReturnStatus] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [lat, setLat] = useState(31.5204);
    const [lon, setLon] = useState(74.3587);
    const [bds, setBds] = useState([]);
    const [todoList, setTodoList] = useState([]); 
    const [newTodo, setNewTodo] = useState('');
    const [eventTitle, setEventTitle] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        getFullName(email);
        getBirthdays();
        fetchTodoList(email);
        navigator.geolocation.getCurrentPosition((position) => {
            setLat(position.coords.latitude)
            setLon(position.coords.longitude)
        })
        const fetchProfilePic = async () => {
        try {
            const response = await axios.post('https://zaaminbackend.vercel.app/viewprofile', { email, role });
            if (response.data.status === "profile exists") {
                setReturnStatus(response.data.status);
                setUserProfilePic(response.data.profile_deets);
            }
        } catch (error) {
            // alert('Error fetching Profile Information', error);
            setAlertOpen(true);
            setAlertSeverity('error');
            setAlertMessage('Error fetching Profile Picture');
        }
    }
    fetchProfilePic();
    authcheck();
    }, []);

    const requiredRole="admin"
    const authcheck =  async () =>{
      
      const validcheck = await axios.post('https://zaaminbackend.vercel.app/validcheck', { email, hashp, role,requiredRole });
      if(validcheck.data.message!== 'success')
      {
        // alert(validcheck.data)
        history("/errorpage")
      }
    }

    const getFullName = async () => {
        try {
            const response = await axios.post('https://zaaminbackend.vercel.app/getname', { email, role });
            if (response.data.status === "profile exists") {
                setReturnStatus(response.data.status);
                setFirstName(response.data.firstname);
                setLastName(response.data.lastname);
            }
            else if (response.data.status === "profile not found") {
                history(`/errorpage`);
            }
        } catch (error) {
            console.log('Error retrieving full name', error);
        }
    };

    const getBirthdays = async () => {
        try {
            const aa = await axios.get('https://zaaminbackend.vercel.app/birthdays-today')
            setBds(aa.data)
            console.log(bds)
        } catch (error) {
            console.log('Error retrieving birthdays')
        }
    };

    const fetchTodoList = async () => {
        try {
            const response = await axios.post('https://zaaminbackend.vercel.app/gettodo', {email});
            setTodoList(response.data);
        } catch (error) {
            console.error('Error fetching to-do list:', error);
        }
    };

    const addTodo = async () => {
        try {
            const response = await axios.post('https://zaaminbackend.vercel.app/addtodo', { email, task: newTodo });
            fetchTodoList(email); 
            setNewTodo(''); 
        } catch (error) {
            console.error('Error adding to-do:', error);
        }
    };

    const removeTodo = async (id) => {
        try {
            await axios.delete(`https://zaaminbackend.vercel.app/removetodo/${id}`);
            fetchTodoList(email); 
        } catch (error) {
            console.error('Error removing to-do:', error);
        }
    };
    
    const addannouncement = async () => {
        try {
            const response = await axios.post('https://zaaminbackend.vercel.app/addannouncement', { eventTitle, eventDescription, eventDate, eventTime });
            setAlertOpen(true);
            setAlertSeverity('success');
            setAlertMessage('Announcement added successfully');
            // const audio = new Audio(successSound);
            // audio.play();
        } catch (error) {
            console.error('Error adding announcement:', error);
            setAlertOpen(true);
            setAlertSeverity('error');
            setAlertMessage('Error adding announcement');
        }
    };


    const profilecheck = async () => {
        try {
            history(`/admprofilehome/${email}/${role}/${hashp}`);
        } catch (error) {
            // alert('Error during login, try again', error);
            setAlertOpen(true);
            setAlertSeverity('error');
            setAlertMessage('Error navigating to profile page');
        }
    };

    const auditnav = async () => {
        try {
            history(`/auditlogs/${email}/${role}/${hashp}`, {state:{imfrom: "adminhome"}});
        } catch (error) {
            // alert('Error during login, try again', error);
            setAlertOpen(true);
            setAlertSeverity('error');
            setAlertMessage('Error navigating to audit logs page');
        }
    };
    const compliancemgmt = async () => {
        try {
            history(`/compliancerules/${email}/${role}/${hashp}`, {state:{imfrom: "adminhome"}});
        } catch (error) {
            // alert('Error during login, try again', error);
            setAlertOpen(true);
            setAlertSeverity('error');
            setAlertMessage('Error navigating to complaince management page');
        }
    };

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
            <div className="home_box1">
                <img src='https://i.pinimg.com/originals/c0/c2/16/c0c216b3743c6cb9fd67ab7df6b2c330.jpg' alt='Profile' className='home_icons1' />
            </div>
            <button className="button-style home_button1" type="button" onClick={profilecheck}>Manage Profile</button>
            <div className="home_box2">
                <img src='/audit.png' alt='Audit' className='home_icons2' />
            </div>
            <button className="button-style home_button2" type="button" onClick={auditnav}>View Audit Logs</button>
            <div className="home_box3">
                <img src='/comply.png' alt='Compliance' className='home_icons3' />
            </div>
            <button className="button-style home_button3" type="button" onClick={compliancemgmt}>Manage Compliance</button>
            <div className='announcement-box'> 
            <div className='announcement-heading'> Make announcement</div>
            <input 
                className='announcement-input' 
                type="text" 
                placeholder="Event Title" 
                value={eventTitle} 
                onChange={(e) => setEventTitle(e.target.value)} 
            />
            <input 
                className='announcement-input' 
                type="text" 
                placeholder="Event Description" 
                value={eventDescription} 
                onChange={(e) => setEventDescription(e.target.value)} 
            />
            <input 
                className='announcement-input' 
                type="date" 
                placeholder="Event Date" 
                value={eventDate} 
                onChange={(e) => setEventDate(e.target.value)} 
                min={new Date().toISOString().split('T')[0]} // Set min attribute to today's date
            />
            <input 
                className='announcement-input' 
                type="time" 
                placeholder="Event Time" 
                value={eventTime} 
                onChange={(e) => setEventTime(e.target.value)} 
            />
            <button className='announcement-button' onClick={addannouncement}>Post</button>
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
                        showForecast = {false}
                        theme = {customStyles}
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

export default AdminHome;