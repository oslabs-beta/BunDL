import React from 'react';
import bundlLogo from '../assets/bundl-logo.png'
import './navbar.css'
import { useNavigate } from 'react-router';

function NavBar() {
  const navigate = useNavigate();
  const handleHomeClick = () => {
    navigate('/')
  }

  return (
    <>
      <div className="navBar">
        <div className="navBarLogo">
          <img
            src={bundlLogo}
            alt="displaying logo..."
            width='180px'
            height='40px'
          ></img>
        </div>
        <div className="navBarLinks">
          <button className = 'navBarButtons' type ="button">v 1.0</button>
          <button className = 'navBarButtons' type ="button">GitHub</button>
          <button className = 'navBarButtons'type="button" onClick={handleHomeClick}>Home</button>
          <button className = 'navBarButtons'type = "button">Blog</button>
        </div>
      </div>
    </>
  );
}

export default NavBar;
