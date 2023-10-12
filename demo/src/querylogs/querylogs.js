import React from 'react-redux';
import { useSelector } from 'react-redux';
import './querylogs.css';
import BarChart from './barchart';
// import DonutChart from './donutchart';
// import {useState, useEffect} from 'react';

function QueryLogs() {
  const logs = useSelector((state) => state.counter.logs);
  const fetchSpeed = useSelector((state) => state.counter.fetchSpeed);
  const cache = useSelector((state) => state.counter.cache);
  console.log('fetchquerylog', fetchSpeed);

  return (
    <div className="table-container">
      <div className="table-titles">
        <div
          style={{
            fontWeight: 'bold',
            fontSize: '25px',
          }}
        >
          Query Logs
     </div>
        <button type="button" className = 'cachebutton'>Clear Cache</button>
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th>Log</th>
              <th id="fields">Fields</th>
              <th>Speed</th>
              <th>Hit/Miss</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <div className="entry">
                    {item.map((el, i) => (
                      <span key={i}>{el}|</span>
                    ))}
                  </div>
                </td>
                {fetchSpeed[index] && <td>{`${fetchSpeed[index]} ms`}</td>}
                {/* <td> <DonutChart/> </td> */}
                {cache[index] && <td>{cache[index]}</td>}
              </tr>
            ))}
          </tbody>
          {/* <td> <BarChart/> </td> */}
        </table>
      </div>
    </div>
  );
}

export default QueryLogs;
