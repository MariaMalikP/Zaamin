import './App.css';
import { Route, Routes } from 'react-router-dom';
import {BrowserRouter} from 'react-router-dom';
import Login from './components/login';
import AdminHome from './components/adminhome';
import ManagerHome from './components/managerhome';
import ErrorPage from './components/errorpage';
import Home from './components/home';
import ProfileHome from './components/profilehome';
import EditProfile from './components/editprofile';
import SearchRes from './components/searchres'; 
import ViewProfile from './components/viewprofile';
import EmployeeHome from './components/employeehome';
import Signuplanding from './components/signuplanding';
import EmployeeSignup from './components/employeesignup';
import MedicalCheck from './components/medicalcheck';
import FinanceCheck from './components/financialcheck';


function App() {

  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/home" element={<Home/>}/>
            <Route path="/employeehome/:email" element={<EmployeeHome/>}/>
            <Route path="/profilehome/:email/:role" element={<ProfileHome/>}/>
            <Route path="/medicalcheck/:email/:role" element={<MedicalCheck/>}/>
            <Route path="/financialcheck/:email/:role" element={<FinanceCheck/>}/>
            <Route path="/editprofile/:email/:role" element={<EditProfile/>}/>
            <Route path="/adminhome/:email" element={<AdminHome/>}/>
            <Route path="/managerhome/:email" element={<ManagerHome/>}/>
            <Route path="/errorpage" element={<ErrorPage/>}/> 
            <Route path="/searchres/:email/:searchTerm" element={<SearchRes/>} />
            <Route path="/viewprofile/:email/:visitingEmail" element={<ViewProfile />} />
            <Route path ="/signuplanding" element = {<Signuplanding/>}/>
            <Route path ="/employeesignup" element = {<EmployeeSignup/>}/>
        </Routes>
      </BrowserRouter>
    
  )
}

export default App;