import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setQueryType, addQueryID, removeQueryID, addQueryType, removeQueryType } from '../../reducers/counterSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faAdd } from '@fortawesome/free-solid-svg-icons';
import './queryType.css';

function QueryTypes() {
  const dispatch = useDispatch();
  const arr = [
    'query',
    'query:id',
    'mutation: add',
    'mutation: update',
  ];

  const [activeButtonIndex, setActiveButtonIndex] = useState(-1); // Initialize to -1 for no active button

  const handleClick = (index) => {
    dispatch(removeQueryID());
    dispatch(removeQueryType());

    if (activeButtonIndex === index) {
      // If the same button is clicked again, deactivate it
      setActiveButtonIndex(-1);
    } else {
      // Activate the clicked button
      setActiveButtonIndex(index);
      const currentButtonState = arr[index];

      if (currentButtonState.includes('mutation')) {
        dispatch(addQueryType('mutation'));
      } else if (currentButtonState.includes('query') && currentButtonState.includes('id')) {
        dispatch(addQueryType('query'));
        dispatch(addQueryID('id'));
      } else {
        dispatch(addQueryID('no id'));
        dispatch(addQueryType('query'));
      }
    }
  };

  return (
    <>
      <div className="schemaButtons">
        {arr.map((item, index) => {
          const isActive = index === activeButtonIndex;
          const buttonStyle = {
            backgroundColor: isActive ? '#5A2A27' : '#202127',
            color: isActive ? 'white' : 'white',
            borderColor: 'white',
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
              onClick={() => handleClick(index)}
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
    </>
  );
}

export default QueryTypes;
