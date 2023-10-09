import React from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';
import { add, remove, query } from '../reducers/counterSlice';
import './query.css';

function Query() {
  const dispatch = useDispatch();
  const fields = useSelector((state) => state.counter.fields);

  //onclick

  //dispatch(query)
  //dispatch(fetching data)

  return (
    <div className="queryBox">
      <div className="graphql-query">
        <div
          style={{
            fontSize: '25px',
            fontWeight: 'bold',
            marginLeft: '20px',
            marginTop: '20px',
          }}
        >
          Query
        </div>

        <div className="query">
          query {'{'}
          <div className="indent">
            user {'{'}
            <div className="indent">
              {fields.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="field"
                  >
                    {item}
                  </div>
                );
              })}
            </div>
            {'}'}
          </div>
          {'}'}
        </div>
        <div className="buttonContainer">
          {/* create onClick function to dispatch query / fetch functions - to obtain performance speeds depending on fields */}
          <button
            type="button"
            className="queryButton"
            onClick={() => {
              dispatch(query());
            }}
          >
            Submit Query
          </button>
        </div>
      </div>
    </div>
  );
}

export default Query;
