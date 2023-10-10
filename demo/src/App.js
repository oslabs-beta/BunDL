import React from 'react';
import './App.css';
import QueryContainer from './query/container/container';
import QueryLogs from './querylogs/querylogs'
import NavBar from './navbar/navbar'
import BarChart from './querylogs/barchart'

function App() {
  return (
    <>
    <NavBar/>
    <div className="App">
      <QueryContainer />
      <QueryLogs/>
      <BarChart/>
      </div>
    </>
  );
}

export default App;
