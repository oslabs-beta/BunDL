import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addField, removeField } from '../../reducers/counterSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faAdd } from '@fortawesome/free-solid-svg-icons';

import './fields.css';
import { current } from '@reduxjs/toolkit';

function Fields() {
  const dispatch = useDispatch();
  const arr = [
    'company',
    'city',
    'state',
    'departmentName',
    'productName',
    'productDescription',
    'price',
  ];

  const [buttonStates, setButtonStates] = useState(
    arr.map((item) => ({
      icon: faAdd,
      iconColor: 'white',
      backgroundColor: 'grey',
      color: 'white',
      value: item,
      // attempt to change borderColor
      borderColor: 'grey',
    }))
  );

  //buttonSTates = [{ icon: faAdd, backgroundColor: 'white', value: item}, { icon: faAdd, backgroundColor: 'white', value: item}]

  const handleClick = (index) => {
    const newButtonStates = [...buttonStates];
    const currentButtonState = newButtonStates[index];
    if (currentButtonState.icon === faAdd && currentButtonState.backgroundColor === 'grey') {
      currentButtonState.icon = faCheckCircle;
      currentButtonState.backgroundColor = '#254250';
      currentButtonState.color = 'white';
      currentButtonState.iconColor = 'white';
      // attempt to change borderColor
      currentButtonState.borderColor = '#254250';
      dispatch(addField(currentButtonState.value));
    } else {
      currentButtonState.icon = faAdd;
      currentButtonState.backgroundColor = 'grey';
      currentButtonState.color = 'white';
      // attempt to change borderColor
      currentButtonState.borderColor = 'grey';
      dispatch(removeField(currentButtonState.value));
    }
    setButtonStates(newButtonStates);
  };

  return (
    <>
      <div className='schemaButtons'>
        <h3 id='fields-title'>Fields</h3>
        {arr.map((item, index) => {
          const buttonState = buttonStates[index];
          return (
            <button
              type='button'
              key={index}
              className='option'
              style={{
                backgroundColor: buttonState.backgroundColor,
                color: buttonState.color,
                borderColor: buttonState.borderColor, 
              }}
              onClick={() => handleClick(index)}
            >
              <FontAwesomeIcon icon={buttonState.icon} style={{ color: buttonState.iconColor }} />
              {item}
            </button>
          );
        })}
      </div>
    </>
  );
}

export default Fields;
