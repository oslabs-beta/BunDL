
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addField, removeField } from '../../reducers/counterSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faAdd } from '@fortawesome/free-solid-svg-icons';
import './fields.css';

function Fields() {
  const dispatch = useDispatch();
  const fields = useSelector((state) => state.counter.fields);

  const arr = [
    'company',
    'city',
    'state',
    'departmentName',
  ];

  const [buttonStates, setButtonStates] = useState(
    arr.map((item) => ({
      icon: faAdd,
      iconColor: 'white',
      backgroundColor: 'grey',
      color: 'white',
      value: item,
      borderColor: 'grey'
    }))
  );

  // Update buttonStates based on the fields from the store
  useEffect(() => {
    const newButtonStates = buttonStates.map((buttonState) => {
      if (fields.includes(buttonState.value)) {
        return {
          ...buttonState,
          icon: faCheckCircle,
          backgroundColor: '#254250',
          color: 'white',
          iconColor: 'white',
         
        };
      }
      return buttonState;
    });
    setButtonStates(newButtonStates);
  }, [fields]);

  const handleClick = (index) => {
    const newButtonStates = [...buttonStates];
    const currentButtonState = newButtonStates[index];
    if (currentButtonState.icon === faAdd && currentButtonState.backgroundColor === 'grey') {
      currentButtonState.icon = faCheckCircle;
      currentButtonState.backgroundColor = '#254250';
      currentButtonState.color = 'white';
      currentButtonState.iconColor = 'white';
      currentButtonState.borderColor = '#254250'
      dispatch(addField(currentButtonState.value));
    } else {
      currentButtonState.icon = faAdd;
      currentButtonState.backgroundColor = 'grey';
      currentButtonState.color = 'white';
      currentButtonState.borderColor = 'grey'
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
