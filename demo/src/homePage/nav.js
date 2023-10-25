import React from 'react';
import bundlLogo from '../assets/bundl-logo.png'
import './nav.css'

function NavHome() {
  return (
    <>
      <div className="nav-home">
        <div className="navBarLogo">
          <img
            src={bundlLogo}
            alt="displaying logo..."
            width='180px'
            height='40px'
          ></img>
        </div>
        <div className="navBarLinks">
          <button className = 'versionButton' type ="button">v 1.0</button>
          <button className = 'githubButton' type ="button">GitHub</button>
          <button className = 'teamButton'type="button">Team</button>
          <button className = 'blogButton'type = "button">Blog</button>
        </div>
      </div>
    </>
  );
}

export default NavHome;
