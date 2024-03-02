import './App.css';
import { Route, Routes } from 'react-router-dom';
import {BrowserRouter} from 'react-router-dom';
import Login from './components/login';
import Home from './components/home';
import ProfileHome from './components/profilehome';
import Signuplanding from './components/signuplanding';
import EmployeeSignup from './components/employeesignup'
// import EditProfile from './components/editprofile';

function App() {

  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/home" element={<Home/>}/>
            <Route path="/profilehome/:email" element={<ProfileHome/>}/>
            <Route path ="/signuplanding" element = {<Signuplanding/>}/>
            <Route path ="/employeesignup" element = {<EmployeeSignup/>}/>
           

            {/* <Route path="/editprofile" element={<EditProfile/>}/> */}
        </Routes>
      </BrowserRouter>
    
  )
}

export default App;
