// Sidebar.js
import React from 'react';
import { Link } from "react-router-dom";
import '../styles/sidebar.css';


const Sidebar = ({ isOpen }) => {
    return (
        <div className={isOpen ? 'sidebar open' : 'sidebar'}>
            <ul>
                <li><Link to="/home">Home</Link></li>
                <li>Menu Item 2</li>
                <li>Menu Item 3</li>
                <li>Menu Item 4</li>
            </ul>
        </div>
    );
};

export default Sidebar;