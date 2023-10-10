import React from 'react-redux';
import Fields from '../fields/fields';
import Query from '../query/query';
import './container.css'

function QueryContainer() {
  return (
    <div>
      <div className="OverallQueryContainer">
        <div className="QueryContainerBox">

            <Fields/>
            <Query/>


        </div>
      </div>
    </div>
  );
}

export default QueryContainer;
