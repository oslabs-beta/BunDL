import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setQueryType, addQueryID, removeQueryID, addQueryType, removeQueryType, setEnviornment } from '../../reducers/counterSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faAdd } from '@fortawesome/free-solid-svg-icons';
import './queryType.css';

function QueryTypes() {
  const dispatch = useDispatch();
  const environmentOptions = ['client', 'server'];
  const operationOptions = ['query', 'query:id', 'mutation: add'];

  const [activeEnvironmentIndex, setActiveEnvironmentIndex] = useState(-1);
  const [activeOperationIndex, setActiveOperationIndex] = useState(-1);

  const handleClickEnvironment = (index) => {
    setActiveEnvironmentIndex(index);

    // Dispatch appropriate action based on environment
    const currentEnvironment = environmentOptions[index];
    dispatch(setEnviornment(currentEnvironment));
  };

  const handleClickOperation = (index) => {
    setActiveOperationIndex(index);

    // Dispatch appropriate action based on operation
    const currentOperation = operationOptions[index];

    dispatch(addQueryType(currentOperation));

    if (currentOperation.includes('mutation')) {
      dispatch(addQueryType('mutation'));
    } else if (currentOperation.includes('query') && currentOperation.includes('id')) {
      dispatch(addQueryType('query'));
      dispatch(addQueryID('id'));
    } else {
      dispatch(addQueryID('no id'));
      dispatch(addQueryType('query'));
    }
  };

  return (
    <div className='op-type-container'> 
      <div className="op-type-buttons">
        <h3 id='operation-title'>Environment</h3>
        {environmentOptions.map((item, index) => {
          const isActive = index === activeEnvironmentIndex;
          const buttonStyle = {
            backgroundColor: isActive ? '#254250' : 'grey',
            color: isActive ? 'white' : 'white',
            borderColor: isActive ? '#254250' : 'grey',
          };
          
          const iconStyle = {
            color: isActive ? 'white' : 'white',
          };

          return (
            <button
              type="button"
              key={index}
              className="option"
              style={buttonStyle}
              onClick={() => handleClickEnvironment(index)}
            >
              <FontAwesomeIcon
                icon={isActive ? faCheckCircle : faAdd}
                style={iconStyle}
              />
              {item}
            </button>
          );
        })}
        <div>

        </div>
        <h3 id='operation-title'>Operation Types</h3>
        {operationOptions.map((item, index) => {
          const isActive = index === activeOperationIndex;
          const buttonStyle = {
            backgroundColor: isActive ? '#254250' : 'grey',
            color: isActive ? 'white' : 'white',
            borderColor: isActive ? '#254250' : 'grey',
          };
          
          const iconStyle = {
            color: isActive ? 'white' : 'white',
          };

          return (
            <button
              type="button"
              key={index}
              className="option"
              style={buttonStyle}
              onClick={() => handleClickOperation(index)}
            >
              <FontAwesomeIcon
                icon={isActive ? faCheckCircle : faAdd}
                style={iconStyle}
              />
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QueryTypes;
