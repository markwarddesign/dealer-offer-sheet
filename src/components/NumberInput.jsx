import React from 'react';
import { formatCurrency } from '../utils/formatCurrency';

const NumberInput = ({ name, value, onChange, className, placeholder, disabled }) => {
  const handleChange = (e) => {
    const rawValue = e.target.value;
    // Allow only numbers and a single decimal point
    const sanitizedValue = rawValue.replace(/[^0-9.]/g, '');
    // Create a new event object with the sanitized value
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        name,
        value: sanitizedValue,
      },
    };
    onChange(newEvent);
  };

  return (
    <input
      type="text"
      name={name}
      value={value ? formatCurrency(value, true) : ''}
      onChange={handleChange}
      className={`${className} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

export default NumberInput;
