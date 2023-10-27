import React from 'react';
import { useSelector } from 'react-redux';
import './queryResults.css';

function QueryResults() {
  const results = useSelector((state) => state.counter.results);
  const formattedResults = results ? JSON.stringify(results, null, 2) : '';

  return (
    <div id='query-text'>
      <pre>{formattedResults}</pre>
    </div>
  );
}

export default QueryResults;