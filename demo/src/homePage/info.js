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
            <button className = 'demo-button' 
              type ="button"
              onClick={handleDemoButtonClick}
              >DEMO
            </button>
            </div>
            <div>
            <button className = 'github-button' 
              type ="button"
              // onClick={handleDemoButtonClick}
              >GitHub
            </button>
            </div>
          </div>
        </div>

        <div className = 'bt-main-gif'></div>

        <div className ='gif-box'>
          <h1>gif here</h1>
        </div>

      </div>

      <div className = 'sub-info'>

        <div id = 'box-1'>
        <h1>test</h1>
        </div>

        <div id = 'box-2'>
        <h1>test</h1>
        </div>
        
        <div id = 'box-3'>
        <h1>test</h1>
        </div>

      </div>

    </div>

  )
}

export default Info;
