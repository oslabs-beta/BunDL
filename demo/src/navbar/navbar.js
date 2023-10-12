import React from 'react';
import bundlLogo from '../assets/bundl-logo.png'
import './navbar.css'

function NavBar() {
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
          <button className = 'navBarButtons' type ="button">GitHub</button>
          <button className = 'navBarButtons'type="button">Team</button>
          <button className = 'navBarButtons'type = "button">Blog</button>
        </div>
      </div>
    </>
  );
}

export default NavBar;
