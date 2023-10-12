import React from 'react-redux';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  submitQuery,
  fetchSpeed,
  formatQuery,
} from '../../reducers/counterSlice';
import './query.css';

function Query() {
  const dispatch = useDispatch();
  const fields = useSelector((state) => state.counter.fields);
  const formattedQuery = useSelector((state) => state.counter.formattedQuery);
  const [click, setClick] = useState(true);
  const fieldnames = ['lastName', 'firstName', 'email'];
  const addressnames = ['street', 'city', 'state', 'zip', 'country'];

  // renders with dependencies - formattedQuery initial empty string
  useEffect(() => {
    dispatch(fetchSpeed(formattedQuery));
    console.log('formatted query', formattedQuery);
  }, [click, dispatch, formattedQuery]);

  // once clicked dispatch submitQuery (puts fields arrays into log array) and formatQuery (runs and re renders useeffect with new state)
  const handleBoxClick = (e) => {
    e.preventDefault();
    console.log('handleboxclick');
    if (fields[0]) {
    dispatch(submitQuery());
    dispatch(formatQuery());
    click === true ? setClick(false) : setClick(true);
    }
  };

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
                if (fieldnames.includes(item)) {
                  return (
                    <div
                      key={index}
                      className="field"
                    >
                      {item}
                    </div>
                  );
                } else return null;
              })}
              <div>
                address {'{'}
                {fields.map((item, index) => {
                  if (addressnames.includes(item)) {
                    return (
                      <div
                        key={index}
                        className="field"
                      >
                        {item}
                      </div>
                    );
                  } else return null;
                })}
              </div>
              {'}'}
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
            onClick={(e)=>handleBoxClick(e)}
          >
            Submit Query
          </button>
        </div>
      </div>
    </div>
  );
}

export default Query;
