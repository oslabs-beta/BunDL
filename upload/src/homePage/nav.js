import React from 'react';
import bundlLogo from '../assets/bundl-logo.png'
import './nav.css'
import { Link } from 'react-scroll';

function NavHome() {
  return (
    <>
      <div className="nav-home">
        <div className="navBarLogo">
          <img id="navLogo"
            src={bundlLogo}
            alt="displaying logo..."
            // width='180px'
            // height='40px'
          ></img>
        </div>
        <div className="navBarLinks">
          <button className='versionButton' type="button">v 1.0</button>
          <a href = 'https://github.com/oslabs-beta/BunDL'>
          <button className='githubButton' type="button">GitHub</button>
          </a>

          <Link to='team' smooth={true} duration={500}>
            <button className='teamButton' type="button">Team</button>
          </Link>

          <a href = 'https://medium.com/@apwicker/bun-appetit-feasting-on-fast-with-bundl-c634a8a36823'> 
          <button className='blogButton' type="button">Blog</button>
          </a>
        </div>
      </div>
    </>
  );
}

export default NavHome;
