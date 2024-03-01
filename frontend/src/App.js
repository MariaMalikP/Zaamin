import './App.css';
import { Route, Routes } from 'react-router-dom';
import {BrowserRouter} from 'react-router-dom';
import Login from './components/login';
import Home from './components/home';
import ProfileHome from './components/profilehome';

function App() {

  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/home" element={<Home/>}/>
            <Route path="profilehome" element={<ProfileHome/>}/>
        </Routes>
      </BrowserRouter>
    
  )
}

export default App;