import React from 'react';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 ${className}`}>
        {children}
    </div>
);

export default Card;
