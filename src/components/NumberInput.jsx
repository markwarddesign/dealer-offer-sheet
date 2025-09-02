import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/formatCurrency';

const NumberInput = ({ name, value, onChange, className, placeholder, disabled, isCurrency = true }) => {
	const [displayValue, setDisplayValue] = useState('');

	useEffect(() => {
		// When the external value changes, update the display value.
		// We check if the input is focused to avoid formatting while the user is typing.
		const inputElement = document.querySelector(`input[name="${name}"]`);
		if (document.activeElement !== inputElement) {
			setDisplayValue(value ? (isCurrency ? formatCurrency(value, true) : value) : '');
		} else {
			// If focused, just show the raw value.
			setDisplayValue(value || '');
		}
	}, [value, isCurrency, name]);

	const handleFocus = () => {
		// On focus, un-format the value to its raw numeric state for editing.
		setDisplayValue(value || '');
	};

	const handleBlur = () => {
		// On blur, format the value if it's a currency field.
		if (isCurrency) {
			setDisplayValue(value ? formatCurrency(value, true) : '');
		}
	};

	const handleChange = (e) => {
		const rawValue = e.target.value;
		// Allow only numbers and a single decimal point.
		const sanitizedValue = rawValue.replace(/[^0-9.]/g, '');
		
		// Update the local display value to give instant feedback while typing.
		setDisplayValue(sanitizedValue);

		// Propagate the sanitized numeric value up to the parent component.
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
			value={displayValue}
			onChange={handleChange}
			onFocus={handleFocus}
			onBlur={handleBlur}
			className={`${className} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
			placeholder={placeholder}
			disabled={disabled}
		/>
	);
};

export default NumberInput;
