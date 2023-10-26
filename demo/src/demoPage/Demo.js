import React from 'react';
import './Demo.css';
import QueryLogs from './querylogs';
import NavBar from '../navbar/navbar';
import Query from '../graphql/query/query';
import QueryTypes from '../graphql/queryTypes/queryType';
import BarChart from './barchart';
import QueryResults from './queryResults';

function Demo() {
  return (

    <div className = 'demo-page'> 

      <div className='nav-bar'>
        <NavBar />
      </div>
      
      <div className="body-container">

        <div className="top-container">
          <div>
          <QueryTypes />
          </div>
          <div>
          <Query />
          </div>
          <div id='query-results'>
          < QueryResults />
          </div>
        </div>

        <div className="bottom-container">
          <div className='query-logs'>
          <QueryLogs />
          </div>
          <div className = 'charts'>
          <BarChart />
          {/* <DonutChart /> */}
          </div>
        </div>   

      </div>

      
    </div>
  );
}

export default Demo;
