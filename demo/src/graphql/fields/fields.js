import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addField, removeField } from '../../reducers/counterSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faAdd } from '@fortawesome/free-solid-svg-icons';

import './fields.css';

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
      iconColor: 'black',
      backgroundColor: 'white',
      color: 'black',
      value: item,
    }))
  );

  //buttonSTates = [{ icon: faAdd, backgroundColor: 'white', value: item}, { icon: faAdd, backgroundColor: 'white', value: item}]

  const handleClick = (index) => {
    const newButtonStates = [...buttonStates];
    const currentButtonState = newButtonStates[index];
    if (currentButtonState.icon === faAdd && currentButtonState.backgroundColor === 'white') {
      currentButtonState.icon = faCheckCircle;
      currentButtonState.backgroundColor = '#5A2A27';
      currentButtonState.color = 'white';
      currentButtonState.iconColor = 'white';
      dispatch(addField(currentButtonState.value));
    } else {
      currentButtonState.icon = faAdd;
      currentButtonState.backgroundColor = 'white';
      currentButtonState.color = 'black';
      dispatch(removeField(currentButtonState.value));
    }
    setButtonStates(newButtonStates);
  };

  return (
    <>
      <div className='schemaButtons'>
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
