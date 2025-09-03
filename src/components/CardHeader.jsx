import React from 'react';

const CardHeader = ({ title, icon, children }) => (
    <div className="flex flex-wrap justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        {children && <div className="flex items-center gap-4">{children}</div>}
    </div>
);

export default CardHeader;
