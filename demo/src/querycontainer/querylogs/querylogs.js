import React from 'react-redux';
import { useSelector } from 'react-redux';
import './querylogs.css';
import '../query/query.css';

function QueryLogs() {
  const logs = useSelector((state) => state.counter.logs);
  //logs = [['astname, city, country'],['astname, city, country'],['astname, city, country']]
  //const speed = useselector(state=> state.counter.speed)

  return (
    <div class="table-container">
      <div
        style={{
          marginBottom: '15px',
          marginTop: '15px',
          fontWeight: 'bold',
          fontSize: '25px',
        }}
      >
        Query Logs
      </div>

      <table>
        <thead>
          <tr>
            <th>Log</th>
            <th>Fields</th>
            <th>Speed</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                {/* fetch data here for the perfroamcne speeds */}
                <div class="entry">
                  {item.map((el, i) => (
                    <span key={i}>{el}|</span>
                  ))}
                </div>
              </td>
              <td>8ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default QueryLogs;

//   <div className="queryLogs">
//     <div
//       style={{
//         fontSize: '25px',
//         fontWeight: 'bold',
//         marginLeft: '20px',
//         marginTop: '20px',
//       }}
//     >
//       Query Logs
//     </div>
//     <div className="columnNames">
//       <div>Log</div>
//       <div>Fields</div>
//       <div>Speed</div>
//     </div>
//     {logs.map((item, index) => {
//       return (
//         <div className="dataColumnNames">
//           <div key = {index}> {index} </div>
//           <div>
//           {item.map((el)=> {
//             return(<>{el}|</>)
//           })}
//           </div>

//           <div>2ms</div>
//         </div>
//       );
//     })}
//   </div>

//)
