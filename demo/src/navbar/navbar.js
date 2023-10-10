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
            width='200px'
            height='50px'
          ></img>
        </div>
        <div className="navBarLinks">
          <button type ="button" onClick={"location.href=https://github.com/oslabs-beta/BunDL"}>GitHub</button>
          <button type="button">Team</button>
          <button type = "button">Blog</button>
        </div>
      </div>
    </>
  );
}

export default NavBar;
