import React from 'react';

const Toggle = ({ label, name, checked, onChange, helpText }) => {
  return (
    <div className="flex items-center justify-between py-2 gap-2">
      <div>
        <label htmlFor={name} className="font-medium text-gray-700">
          {label}
        </label>
        {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
      </div>
      <label htmlFor={name} className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-miles-light dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-miles-dark"></div>
      </label>
    </div>
  );
};

export default Toggle;
