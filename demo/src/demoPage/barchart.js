import React from 'react';
import { useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import {CategoryScale, Chart, LinearScale} from 'chart.js/auto';
import './barchart.css'
// import DonutChart from './donutchart';
import 'chartjs-plugin-datalabels';
Chart.register(CategoryScale, LinearScale)


function BarChart() {
  const fetchSpeedChart = useSelector((state)=> state.counter.fetchSpeed);

    const data = {
    labels: fetchSpeedChart.map((value, index) => `Query #: ${index+1}`),

    // labels: 'query speed'
    datasets: [
      {
        label: 'Query Speeds (ms)',
        data: fetchSpeedChart,
  // data: [1,2,3,4,5,1,23,50,34,],
        backgroundColor: '#5A2A27',
        borderColor: 'black',
        color: 'black',
        border: 'none',
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,

    scales: {
      x: {
        display: false,
      ticks:{color: 'black' , beginAtZero: true},
      grid: {
        display: false, // Remove X-axis grid lines
      },
      },
      y: {
        ticks:{color: 'black' , beginAtZero: true},
        grid: {
          display: false, // Remove X-axis grid lines
        },
        },
    },
    plugins: {
        datalabels: {
        display: true, // Show data labels (numbers) on bars
        align: 'center', // Adjust alignment as needed
        color: 'black', // Set the color of data labels
        font: {
          weight: 'bold', // Adjust font weight as needed
        },
      },
    },
  };

  return (
    <>
    <div className='barchart-container'>
      {/* <div id='title-of-chart'>Query Speeds</div> */}
      <Bar
        data={data}
        options = {options}
        className = 'chart'
      />
      {/* <DonutChart /> */}
    </div>
    </>
  );
}

export default BarChart;

// HARD CODE BAR CHART
// const data = {
//   labels: ['test1', 'test2', 'test3'],
//   datasets: [
//     {
//       label: 'test',
//       data: [20, 40, 60],
//       backgroundColor: 'aqua',
//       borderColor: 'black',
//       borderWidth: 1,
//     },
//   ],
// };
// const options = {};