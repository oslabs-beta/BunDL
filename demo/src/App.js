import React from 'react';
import './App.css';
import QueryLogs from './querylogs/querylogs';
import NavBar from './navbar/navbar';
import Fields from './graphql/fields/fields';
import Query from './graphql/query/query';
// import Metrics from './metrics/metrics'
import BarChart from './querylogs/barchart';
import DonutChart from './querylogs/donutchart';
function App() {
  return (
    <>
      <NavBar />
      <div className="container">
        <div className="FieldsContainer">
          <div className='QueryConstructor'>
             <Fields />
             <Query />
          </div>
          <div className="queryBarContainers">
             <QueryLogs />
           </div>
        </div>
        <div className="ChartContainers">
            <DonutChart />
            <BarChart />
        </div>


      </div>
    </>
  );
}

export default App;
