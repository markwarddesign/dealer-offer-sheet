import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { Plus, Minus } from 'lucide-react';

const NumberInput = ({ 
    name, 
    value, 
    onChange, 
    className, 
    placeholder, 
    disabled, 
    isCurrency = true, 
    withIncrement = false,
    step = 1,
    roundToHundredth = false
}) => {
	const [displayValue, setDisplayValue] = useState('');
    const inputRef = useRef(null);

	useEffect(() => {
		if (document.activeElement !== inputRef.current) {
            let formattedValue = value;
            if (roundToHundredth && value) {
                formattedValue = parseFloat(value).toFixed(2);
            }
			setDisplayValue(value ? (isCurrency ? formatCurrency(formattedValue, true) : formattedValue) : '');
		} else {
			setDisplayValue(value || '');
		}
	}, [value, isCurrency, name, roundToHundredth]);

	const handleFocus = () => {
		setDisplayValue(value || '');
	};

	const handleBlur = (e) => {
        let rawValue = e.target.value;
        if (roundToHundredth && rawValue) {
            const roundedValue = parseFloat(rawValue).toFixed(2);
            setDisplayValue(roundedValue);
            const newEvent = { ...e, target: { ...e.target, name, value: roundedValue } };
            onChange(newEvent);
        } else if (isCurrency) {
			setDisplayValue(value ? formatCurrency(value, true) : '');
		}
	};

	const handleChange = (e) => {
		const rawValue = e.target.value;
		const sanitizedValue = rawValue.replace(/[^0-9.]/g, '');
		setDisplayValue(sanitizedValue);

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

    const handleStep = (direction) => {
        const currentValue = parseFloat(value) || 0;
        let newValue = direction === 'up' ? currentValue + step : currentValue - step;
        
        if (roundToHundredth) {
            newValue = parseFloat(newValue.toFixed(2));
        }
        
        const newEvent = {
			target: {
                name: name,
				value: String(newValue),
			},
		};
		onChange(newEvent);
    };

	return (
		<div className="relative">
            {isCurrency && <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">$</span>}
            <input
                ref={inputRef}
                type="text"
                name={name}
                value={displayValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed ${isCurrency ? 'pl-7' : ''} ${withIncrement ? 'pr-16' : ''} ${className || ''}`}
                placeholder={placeholder}
                disabled={disabled}
            />

			{withIncrement && (
				<div className="absolute inset-y-0 right-0 pr-1 flex items-center">
					<button 
                        type="button"
                        onClick={() => handleStep('down')}
                        disabled={disabled}
                        className="no-print p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
						<Minus className="h-4 w-4" />
					</button>
					<button 
                        type="button"
                        onClick={() => handleStep('up')}
                        disabled={disabled}
                        className="no-print p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
						<Plus className="h-4 w-4" />
					</button>
				</div>
			)}
		</div>
	);
};

export default NumberInput;
