import React from 'react';
import { useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import {CategoryScale, Chart, LinearScale} from 'chart.js/auto';
import './barchart.css'
import 'chartjs-plugin-datalabels';
Chart.register(CategoryScale, LinearScale)


function BarChart() {
  const fetchSpeedChart = useSelector((state)=> state.counter.fetchSpeed);

    const data = {
    labels: fetchSpeedChart.map((value, index) => `Query ${index+1}`),


    datasets: [
      {
        label: 'Query Speeds (ms)',
        data: fetchSpeedChart,
        // color of graph
        backgroundColor: '#9499ff',
        borderColor: '#9499ff;',
        color: 'white',
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
        display: true,
      ticks:{color: 'white' , beginAtZero: true},
      grid: {
        display: false, 
      },
      },
      y: {
        ticks:{color: 'white', 
        beginAtZero: true,
        // callback: function (value) {
        //   return value + ' ms'
        // },
      },
        grid: {
          display: true, 
        },
        },
    },
    plugins: {
        datalabels: {
        display: true, 
        align: 'center', 
        color: 'white', 
        font: {
          weight: 'bold', 
        },
      },
    },
  };

  return (
    <>
    <div className='barchart-container'>
      <Bar
        data={data}
        options = {options}
        className = 'chart'
      />
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