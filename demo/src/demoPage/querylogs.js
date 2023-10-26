import React from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';
import './querylogs.css';
import { clearLog } from '../reducers/counterSlice';

function QueryLogs() {
  const dispatch = useDispatch();
  const logs = useSelector((state) => state.counter.logs);
  const fetchSpeed = useSelector((state) => state.counter.fetchSpeed);
  const cache = useSelector((state) => state.counter.cache);
  const queryID = useSelector((state) => state.counter.queryID)
  const queryType = useSelector((state) => state.counter.queryType)
  // console.log('fetchquerylog', fetchSpeed);

  const handleClick = (e) => {
    e.preventDefault();

    fetch('/api/clearCache')
      .then(() => dispatch(clearLog()))
      .catch((err) => console.log(err));
  };

  return (
    <div className='table-container'>
      <div className='table-titles'>
        <div id='query-log-title'
          style={{
            fontWeight: 'bold',
            fontSize: '25px',
          }}
        >
          Query Logs
        </div>
        <button type='button' className='cachebutton' onClick={(e) => handleClick(e)}>
          Clear Cache
        </button>
      </div>
      <div className='table'>
        <table>
          <thead>
            <tr>
              <th>Log</th>
              <th id='fields'>Fields</th>
              <th>Speed</th>
              <th>Hit/Miss</th>
              <th id='server-client'>Client/Server</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <div className='entry'>
                    {item.map((el, i) => (
                      <span key={i}>{el}|</span>
                    ))}
                  </div>
                </td>

                {queryType[index] === 'query' && (
                  <>                  {fetchSpeed[index] && <td>{`${fetchSpeed[index]} ms`}</td>}
                  {cache[index] && <td>{cache[index]}</td>}
                  {queryID[index] && <td>{queryID[index]}</td>}
                  </>
                )}
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QueryLogs;
