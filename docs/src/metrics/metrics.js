// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import './metrics.css';

// function fetchcache() {
//   return fetch('/api/cache', {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   })
//     .then((res) => res.json())
//     .then((res) => {
//       console.log('resultsssssss', res);
//       return res;
//     })
//     .catch((err) => console.log(err));
// }

// function Metrics() {
//   const requests = useSelector((state) => state.counter.requests);
//   const [metrics, setMetrics] = useState([]);

//   useEffect(() => {
//     fetchcache().then((res) => setMetrics(res));
//     console.log('fetch useEffect');
//   }, []);

//   useEffect(() => {
//     fetchcache().then((res) => setMetrics(res));
//     console.log('fetch useEffect');
//   }, [requests]);

//   return (
//     <>

//       <div className="metricsContainer">
//         <div className="metrics">
//           {metrics.length > 0 && (
//             <div className="box-container">
//               <div className="box">
//                 <div className="value">{metrics[0].requests}</div>
//                 <div className="label">total requests</div>
//               </div>
//               <div className="box">
//                 <div className="value">{Math.floor(metrics[0].cacheHit/metrics[0].requests*100)}</div>
//                 <div className="label">cache hit rate</div>
//               </div>
//               <div className="box">
//                 <div className="value">{Math.floor(metrics[0].cacheMiss/metrics[0].requests*100)}</div>
//                 <div className="label">cache miss rate</div>
//               </div>
//               <div className="box">
//                 <div className="value">{Math.floor(metrics[0].memory/1000)}</div>
//                 <div className="label">memory storage</div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// export default Metrics;
