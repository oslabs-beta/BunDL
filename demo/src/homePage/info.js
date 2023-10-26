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
          <div className='title-info'>
          <h1 className = 'title'>bunDL</h1>
          <p className = 'info'> is a lightweight tool designed to intercept GraphQL queries, providing real-time monitoring and </p>
              <button className = 'demo-button' 
                type ="button"
                onClick={handleDemoButtonClick}
                >Demo
              </button>
          </div>
          <div className = 'install-container'>
            <div className ='install'>
              <h3 id ='install'>Install bunDL v 1.0 (Client)</h3>
              <h4 id='npm-box'>npm link</h4>
              <h3 id ='install'>Install bunDL v 1.0 (Server)</h3>
              <h4 id='npm-box'>asdf</h4>
              </div>
              
  
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
          <p id = 'box-p'>INSERT BUNDL INFO HERE.</p>
          </div>

          <div id = 'box-2'>
          <h4 id = 'box-title'>FAST AF BOI</h4>
          <p  id = 'box-p'>BUNDL FASTER THAN SPEED OF LIGHT</p>
          </div>
        
          <div id = 'box-3'>
          <h4 id = 'box-title'>TEST</h4>
          <p  id = 'box-p'>INSERT BUNDL INFO HERE.</p>
          </div>
        </div>
    </div>

  )
}

export default Info;
