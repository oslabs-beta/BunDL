import React from 'react';
import './Demo.css';
import QueryLogs from './querylogs';
import NavBar from '../navbar/navbar';
// import Fields from './graphql/fields/fields';
import Query from '../graphql/query/query';
// import Metrics from './metrics/metrics'
import BarChart from './barchart';
import DonutChart from './donutchart';

function Demo() {
  return (

    <div className = 'demo-page'> 

      <div className='nav-bar'>
        <NavBar />
      </div>
      
      <div className="body-container">
        <div className="top-container">
          <Query />
        </div>

        <div className="bottom-container">
          <QueryLogs />
          <BarChart />
          <DonutChart />
        </div>   
      </div>

      {/* <div className="ChartContainers"></div> */}
    </div>
  );
}

export default Demo;
