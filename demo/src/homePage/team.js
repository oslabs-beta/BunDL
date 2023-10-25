import React from 'react';
import './team.css';
import { arrTeam } from '../teaminfo'
import Linkedin from '../assets/images/icons/linkedin.svg'
import Github from '../assets/images/icons/github.svg'

const TeamInfo = () => {
  return (
      <div className="outerContainer">
          <div id ='bundl-team'>
            BundL Team
          </div>
          <div id="team">
          {arrTeam.map((member, index) => (
            <div className="teamCard" key={index}>
                <div id="circularImageContainer">
                  <img className="teamImage" src={member.src} alt={member.name} />
                </div>
                <div className="memberName">{member.name}</div>
                <div>
                  <a href={member.linkedin} target='_blank'>
                    <button>
                      <img src={Linkedin} alt="Linkedin"/>
                    </button>
                  </a>
                  <a href={member.github} target='_blank'>
                    <button>
                      <img src={Github} alt="Github"/>
                    </button>
                  </a>
                </div>              
            </div>
          ))}
          </div>       
      </div>
  )
}

export default TeamInfo;
