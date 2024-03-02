import './App.css';
import { Route, Routes } from 'react-router-dom';
import {BrowserRouter} from 'react-router-dom';
import Login from './components/login';
import Home from './components/home';
import ProfileHome from './components/profilehome';
// import EditProfile from './components/editprofile';

function App() {

  return (
    <BrowserRouter>
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/home" element={<Home/>}/>
            <Route path="/profilehome/:email" element={<ProfileHome/>}/>
            {/* <Route path="/editprofile" element={<EditProfile/>}/> */}
        </Routes>
      </BrowserRouter>
    
  )
}

export default App;
