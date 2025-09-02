import React from 'react';

const Toggle = ({ label, name, isChecked, onChange, disabled = false, onText, offText, className = '' }) => {
  const showCustomText = onText && offText;

  return (
    <label htmlFor={name} className={`flex items-center cursor-pointer ${className}`}>
      {label && !showCustomText && <div className="mr-3 text-gray-700 font-medium">{label}</div>}
      <div className="relative">
        <input
          id={name}
          name={name}
          type="checkbox"
          className="sr-only peer"
          checked={isChecked}
          onChange={onChange}
          disabled={disabled}
        />
        <div className={`block bg-gray-200 ${showCustomText ? 'w-16' : 'w-12'} h-8 rounded-full transition-colors duration-300 ease-in-out peer-checked:bg-green-500`}></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${
            isChecked ? (showCustomText ? 'transform translate-x-8' : 'transform translate-x-4') : ''
          }`}
        ></div>
      </div>
      {showCustomText && (
        <div className="ml-3 text-gray-700 font-medium">
          <span>{isChecked ? onText : offText}</span>
        </div>
      )}
    </label>
  );
};

export default Toggle;