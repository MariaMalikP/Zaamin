import './App.css';
import { Route, Routes } from 'react-router-dom';
import {BrowserRouter} from 'react-router-dom';
import Login from './components/login';
import EmployeeHome from './components/employeehome';
import AdminHome from './components/adminhome';
import ManagerHome from './components/managerhome';
import ProfileHome from './components/profilehome';
import EditProfile from './components/editprofile';
import ErrorPage from './components/errorpage';

function App() {

  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/employeehome/:email" element={<EmployeeHome/>}/>
            <Route path="/profilehome/:email/:role" element={<ProfileHome/>}/>
            <Route path="/editprofile/:email/:role" element={<EditProfile/>}/>
            <Route path="/adminhome/:email" element={<AdminHome/>}/>
            <Route path="/managerhome/:email" element={<ManagerHome/>}/>
            <Route path="/errorpage" element={<ErrorPage/>}/> 
        </Routes>
      </BrowserRouter>
    
  )
}

export default App;
