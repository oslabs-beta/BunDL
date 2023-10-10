import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addField, removeField } from '../../reducers/counterSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faAdd } from '@fortawesome/free-solid-svg-icons';

import './fields.css';

function Fields() {
  const dispatch = useDispatch();
  const arr = [
    'firstName',
    'lastName',
    'email',
    'street',
    'city',
    'state',
    'zip',
    'country',
  ];
  const [buttonStates, setButtonStates] = useState(
    arr.map((item) => ({ icon: faAdd, backgroundColor: 'white', value: item }))
  );

  //buttonSTates = [{ icon: faAdd, backgroundColor: 'white', value: item}, { icon: faAdd, backgroundColor: 'white', value: item}]

  const handleClick = (index) => {
    const newButtonStates = [...buttonStates];
    const currentButtonState = newButtonStates[index];
    if (
      currentButtonState.icon === faAdd &&
      currentButtonState.backgroundColor === 'white'
    ) {
      currentButtonState.icon = faCheckCircle;
      currentButtonState.backgroundColor = '#ffebcd';
      dispatch(addField(currentButtonState.value));
    } else {
      currentButtonState.icon = faAdd;
      currentButtonState.backgroundColor = 'white';
      dispatch(removeField(currentButtonState.value));
    }
    setButtonStates(newButtonStates);
  };

  return (
    <>
      <div className="schemaButtons">
        <div> FIELDS </div>
        {arr.map((item, index) => {
          const buttonState = buttonStates[index];
          return (
            <button
              type="button"
              key={index}
              className="option"
              style={{ backgroundColor: buttonState.backgroundColor }}
              onClick={() => handleClick(index)}
            >
              <FontAwesomeIcon
                icon={buttonState.icon}
                style={{ color: 'black' }}
              />
              {item}
            </button>
          );
        })}
      </div>
    </>
  );
}

export default Fields;
