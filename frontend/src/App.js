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
import EmployeeSignup from './components/employeesignup'
import OTPPage from './components/OTPPage'
import { AuthProvider } from './components/AuthProvider';
import AuditLogs from './components/auditLogs';
import ForgotPassword from './components/forgotpassword';
import SendingOTP from './components/otppageforget';
import ChangePass from './components/changepass';

function App() {

  return (
    <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/home" element={<Home/>}/>
            <Route path="/employeehome/:email" element={<EmployeeHome/>}/>
            <Route path="/profilehome/:email/:role" element={<ProfileHome/>}/>
            <Route path="/editprofile/:email/:role" element={<EditProfile/>}/>
            <Route path="/adminhome/:email" element={<AdminHome/>}/>
            <Route path="/managerhome/:email" element={<ManagerHome/>}/>
            <Route path="/errorpage" element={<ErrorPage/>}/> 
            <Route path="/searchres/:email/:searchTerm" element={<SearchRes/>} />
            <Route path="/viewprofile/:email/:visitingEmail" element={<ViewProfile />} />
            <Route path ="/signuplanding" element = {<Signuplanding/>}/>
            <Route path ="/employeesignup" element = {<EmployeeSignup/>}/>
            <Route path ="/otp" element = {<OTPPage/>}/>
            <Route path="/auditlogs/:email/:role" element={<AuditLogs/>}/>
            <Route path="/forgotpassword" element={<ForgotPassword/>}/>
            <Route path="/otppageforget" element={<SendingOTP/>}/>
            <Route path="/changepass/:email" element={<ChangePass />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    
  )
}

export default App;