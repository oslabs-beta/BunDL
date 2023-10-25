import React from 'react';
import './info.css';
import { useNavigate } from 'react-router';

const Info = () => {
  const navigate = useNavigate();
  const handleDemoButtonClick = () => {
    navigate('/demo')
  }

  return (
    

    
    <div className = 'info-container'>

      <div className = 'main-and-img-info'>
        <div className = 'main'>
          <h1 className = 'title'>BunDL</h1>
          <p className = 'info'> is a lightweight tool designed to intercept GraphQL queries, providing real-time monitoring and </p>
          <div className = 'buttons'>
            <div>
              <h3 id ='install'>Install BunDL v 1.0</h3>
              <h4 id='npm-box'>npm link</h4>
              <button className = 'demo-button' 
                type ="button"
                onClick={handleDemoButtonClick}
                >Demo
              </button>
            </div>
            {/* <div>
            <button className = 'github-button' 
              type ="button"
              // onClick={handleDemoButtonClick}
              >GitHub
            </button>
            </div> */}
          </div>
        </div>

        <div className = 'bt-main-gif'></div>
          <div className ='gif-box'>
            {/* <h1>gif here</h1> */}
          </div>
        </div>

        {/* <div className = 'npm-box'>
          <h3>NPM LINK</h3>
        </div> */}

        <div className = 'sub-info'>
          <div id = 'box-1'>
          <h4 id = 'box-title'>Real-Time Data</h4>
          <p id = 'box-p'>Allows you to view logs of other Docker containers in real-time. As new log entries are generated, they are streamed to the web interface without needing to refresh the page.</p>
          </div>

          <div id = 'box-2'>
          <h4 id = 'box-title'>test</h4>
          <p  id = 'box-p'>An application written in Go consuming very little memory and CPU. It can be run alongside other containers without causing performance issues.</p>
          </div>
        
          <div id = 'box-3'>
          <h4 id = 'box-title'>test</h4>
          <p  id = 'box-p'>Dozzle UI support connecting to multiple remote hosts with a simple drop down to choose between different hosts.</p>
          </div>
        </div>
    </div>

  )
}

export default Info;
