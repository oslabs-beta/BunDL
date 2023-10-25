import React from 'react';
import './team.css';
import { arrTeam } from '../teaminfo'
import Linkedin from '../assets/images/icons/linkedin.svg'
import Github from '../assets/images/icons/github.svg'

const TeamInfo = () => {
  return (
      <div className="outerContainer">
          <div>
            BundL Team
          </div>
          <div id="team">
          {arrTeam.map((member, index) => (
            <div key={index}>
              <div id="teamDetails">
                <img className="teamImage" src={member.src} alt={member.name} />
                <div className="memberName">{member.name}</div>
              </div>
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
