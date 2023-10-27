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
          <a href = 'https://github.com/oslabs-beta/BunDL'>
          <button className = 'navBarButtons' type ="button">GitHub</button>
          </a>
          <button className = 'navBarButtons'type="button" onClick={handleHomeClick}>Home</button>
          <a href = 'https://medium.com/@apwicker/bun-appetit-feasting-on-fast-with-bundl-c634a8a36823'>
          <button className = 'navBarButtons'type = "button">Blog</button>
          </a>
        </div>
      </div>
    </>
  );
}

export default NavBar;
