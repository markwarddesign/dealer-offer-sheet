import React from 'react';
import NumberInput from './NumberInput';

const NumberInputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <NumberInput {...props} />
    </div>
);

export default NumberInputField;
