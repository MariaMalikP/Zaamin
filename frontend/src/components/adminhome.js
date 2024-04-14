import React, { useEffect, useState } from 'react';
import Header from './header';
import '../styles/home.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactWeather, { useVisualCrossing } from 'react-open-weather';
// import successSound from '../path/to/success-sound.mp3';


const AdminHome = () => {
    const history = useNavigate();
    const { email, hashp } = useParams();
    const [role, setRole] = useState("admin");
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

    useEffect(() => {
        getFullName(email);
        getBirthdays();
        fetchTodoList(email);
        navigator.geolocation.getCurrentPosition((position) => {
            setLat(position.coords.latitude)
            setLon(position.coords.longitude)
        })
    }, []);

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

    const fetchTodoList = async () => {
        try {
            const response = await axios.post('http://localhost:3000/gettodo', {email});
            setTodoList(response.data);
        } catch (error) {
            console.error('Error fetching to-do list:', error);
        }
    };

    const addTodo = async () => {
        try {
            const response = await axios.post('http://localhost:3000/addtodo', { email, task: newTodo });
            fetchTodoList(email); 
            setNewTodo(''); // Clear input field
        } catch (error) {
            console.error('Error adding to-do:', error);
        }
    };

    const removeTodo = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/removetodo/${id}`);
            fetchTodoList(email); 
        } catch (error) {
            console.error('Error removing to-do:', error);
        }
    };
    const addannouncement = async () => {
        try {
            const response = await axios.post('http://localhost:3000/addannouncement', { eventTitle, eventDescription, eventDate, eventTime });
            alert("done");
            // const audio = new Audio(successSound);
            // audio.play();
        } catch (error) {
            console.error('Error adding announcement:', error);
        }
    };


    const profilecheck = async () => {
        try {
            history(`/admprofilehome/${email}/${role}/${hashp}`);
        } catch (error) {
            alert('Error during login, try again', error);
        }
    };

    const auditnav = async () => {
        try {
            history(`/auditlogs/${email}/${role}/${hashp}`);
        } catch (error) {
            alert('Error during login, try again', error);
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
            <div><Header /></div>
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
            <button className="button-style home_button3" type="button" onClick={profilecheck}>Manage Compliance</button>
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
                                <ul className = "todo-list" key={index}>
                                    <li>
                                        {index + 1}. {todo.task}   
                                        <button onClick={() => removeTodo(todo._id)}>✔️</button>
                                    </li>
                                </ul>
                            ))}
                        </ol>
                        </div>
                    </li>
                </ul>
            </div>
            <div className="footer"></div>
        </div>
    );
}

export default AdminHome;


