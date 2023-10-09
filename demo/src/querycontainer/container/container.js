import React from 'react-redux';
import Fields from '../fields/fields';
import Query from '../query/query';
import QueryLogs from '../querylogs/querylogs'
import './container.css'

function QueryContainer() {
  return (
    <div>
      <div className="OverallQueryContainer">
        <div className="QueryContainerBox">

            <Fields/>
            <Query/>
            <QueryLogs/>

        </div>
      </div>
    </div>
  );
}

export default QueryContainer;
