import React from 'react';

const NumberInput = ({ value, onChange, ...props }) => {
	const handleChange = (e) => {
		const { value } = e.target;
		// When the input is cleared, we'll pass null to represent no value.
		// Otherwise, convert the string value to a number.
		const numericValue = value === '' ? null : Number(value);

		// We need to create a synthetic event that mimics the original event structure,
		// but with our numeric value. This ensures the existing `handleChange`
		// functions in the forms receive the data in the expected format.
		const syntheticEvent = {
			...e,
			target: {
				...e.target,
				name: props.name,
				value: numericValue,
				type: 'number', // Keep original type for any logic that might check it
			},
		};
		onChange(syntheticEvent);
	};

	// If the value is 0, display an empty string. Also handle null/undefined.
	const displayValue = value === 0 ? '' : value ?? '';

	return <input {...props} type="number" value={displayValue} onChange={handleChange} />;
};

export default NumberInput;
