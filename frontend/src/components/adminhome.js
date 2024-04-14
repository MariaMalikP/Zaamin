// import { useEffect, useState } from 'react';
// import Header from './header';
// import '../styles/home.css'; 
// import { useNavigate, Link, useParams } from 'react-router-dom';
// import axios from 'axios';

// const AdminHome = (prop) => {
//     const history = useNavigate();
//     const { email } = useParams();
//     const [role, setRole] = useState("admin");
//     const [returnStatus, setReturnStatus] = useState('');
//     const [firstName, setFirstName] = useState('');
//     const [lastName, setLastName] = useState('');

//     const getFullName = async () => {
//         try {
//             const response = await axios.post('http://localhost:3000/getname', { email, role });
//             if (response.data.status === "profile exists") {
//                 setReturnStatus(response.data.status);
//                 setFirstName(response.data.firstname);
//                 setLastName(response.data.lastname);
//             } 
//             else if (response.data.status === "profile not found") {
//                 history('/errorpage');
//             }
//         } catch (error) {
//             alert('Error retrieving full name', error);
//         }
//     };

//     useEffect(() => {
//         getFullName(email);
//     }, []);

//     const profilecheck = async () => {    
//         try {
//             history(`/profilehome/${email}/${role}`);
//         } catch (error) {
//             alert('Error during login, try again', error);
//         }
//     };
//     const medicalcheck = async () => {    
//         try {
//             history(`/medicalcheck/${email}/${role}`);
//         } catch (error) {
//             alert('Error during login, try again', error);
//         }
//     };
//     const financecheck = async () => {    
//         try {
//             history(`/financecheck/${email}/${role}`);
//         } catch (error) {
//             alert('Error during login, try again', error);
//         }
//     };

//     return (    
//         <div className='home'>
//             <div><Header /></div>
//             <div className='mainheading'>Home</div>
//             <div className='subheading'>Welcome back {firstName} {lastName}</div>
//             <div className='subheading3'>What would you like to do?</div>
//             <ul className="button-list">
//                 <li><button className="button-style" type="button" onClick={profilecheck}>1. Manage Profile</button></li>
//                 <li><button className="button-style" type="button" onClick={profilecheck}>2. View Audit Logs</button></li>
//                 <li><button className="button-style" type="button" onClick={financecheck}>3. View Compliance Dashboard</button></li>
//             </ul>
//         </div>
//     );
// }

// export default AdminHome;


import React, { useEffect, useState } from 'react';
import Header from './header';
import '../styles/home.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactWeather, { useVisualCrossing } from 'react-open-weather';

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
                                placeholder="Add a new task"
                                value={newTodo}
                                onChange={updateNewTodo}
                            />
                            <button className="todo-text" onClick={addTodo}>Add Task</button>
                            <ol>
                            {todoList.map((todo, index) => (
                                <ul key={index}>
                                    <li>
                                        {index + 1}. {todo.task}   <tab></tab> <tab></tab>
                                        <button onClick={() => removeTodo(todo._id)}>❌</button>
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