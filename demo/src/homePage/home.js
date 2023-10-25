import React from 'react';
import './home.css';
import Info from './info';
import TeamInfo from './team';
import NavHome from './nav';


const Home = () => {
  return (
    <div className = 'home-page'>

      <div className = 'nav-container'>
      <NavHome />
      </div>

      <div className = 'info-container'>
      <Info />
      </div>

      <div className= 'team-container'>
      <TeamInfo />
      </div>

    </div>


  )
}

export default Home;
