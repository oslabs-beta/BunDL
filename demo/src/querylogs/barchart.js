import React from 'react-redux';
import { useSelector } from 'react-redux';
import { Bar } from "react-chartjs-2";

import './barchart.css'

function BarChart({fetchSpeed}) {
  const logs = useSelector((state) => state.counter.logs);
  const fetchSpeed = useSelector((state)=> state.counter.fetchSpeed);

  const data = {
    labels: fetchSpeed.map((speed, index) => `${index + 1}`),
    datasets: [
      {
        label: 'Fetch Speed (ms)',
        data: fetchSpeed,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} />;


};


export default BarChart;

{/* <Bar data={} options={}/> */}