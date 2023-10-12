import React from 'react';
import { useSelector } from 'react-redux';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// :root {
//   --reddish-brown: #5A2A27;
//   --dark-tan: #B5A886;
// --light-tan: #FAF2DB;
// }


ChartJS.register(ArcElement, Tooltip, Legend);

function DonutChart() {
  const cache = useSelector((state) => state.counter.cache);
  console.log('cache:', cache);
  // .length represents the number of hit or miss
  const cacheHit = cache.filter((el) => el === 'hit').length;
  const cacheMissed = cache.filter((el) => el === 'miss').length;
  const data = {
    labels: ['Cache Hit', 'Cache Missed'],
    datasets: [
      {
        label: ['#Hit', '#Missed'],
        // would need to get data dynamically for cached hits and missed
        data: [cacheHit, cacheMissed],
        backgroundColor: [
          // 'rgba(54, 162, 235, 0.2)',
          // 'rgba(255, 99, 132, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          // 'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          // 'rgba(54, 162, 235, 1)',
          // 'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(75, 192, 192, 1)',
          // 'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  return (
    <>
      <div
        className="donut-container"
        style={{ responsive: true, height: '400px', maintainAspectRatio: true }}
      >
        {/* <h1 id='donut'>Cache Hit vs Missed</h1> */}
        <Doughnut data={data} />
      </div>
    </>
  );
}

export default DonutChart;

// fetch request to database for cache hit and misses
