import React from 'react';

const Toggle = ({ label, name, checked, onChange, primaryColor = 'indigo', className = '', withWrapper = false }) => {
    const wrapperClasses = withWrapper
        ? 'p-2 rounded-lg border border-gray-200 hover:bg-gray-100/50'
        : '';

    return (
        <div className={`flex items-center gap-4 justify-between ${wrapperClasses} ${className}`}>
            {label && <span className="font-semibold text-gray-700 text-sm">{label}</span>}
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    name={name} 
                    checked={checked} 
                    onChange={onChange} 
                    className="sr-only peer" 
                />
                <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-${primaryColor}-200 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-${primaryColor}-600`}></div>
            </label>
        </div>
    );
};

export default Toggle;