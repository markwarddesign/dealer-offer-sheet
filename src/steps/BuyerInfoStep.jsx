
import React from 'react';
import { useAppStore } from '../store';
import { User } from 'lucide-react';

// --- Reusable UI Components ---

const FormSection = ({ title, icon, children }) => (
    <div className="space-y-8">
        <div className="flex items-center gap-4">
            {icon}
            <h2 className="text-3xl font-bold tracking-tight text-gray-800">{title}</h2>
        </div>
        {children}
    </div>
);

const Card = ({ children, className = '' }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ title, icon, children }) => (
    <div className="flex flex-wrap justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        {children && <div className="flex items-center gap-4">{children}</div>}
    </div>
);

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <input 
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 bg-gray-50"
            {...props} 
        />
    </div>
);


// --- Main Component ---

export default function BuyerInfoStep() {
  const { dealData, updateDealData } = useAppStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateDealData({ [name]: value });
  };

  return (
    <div className="bg-gray-50/50 p-4 sm:p-6 lg:p-8 font-sans">
        <FormSection title="Buyer Information" icon={<User className="h-8 w-8 text-gray-500" />}>
            <Card>
                <CardHeader title="Buyer Details" icon={<User className="h-6 w-6 text-indigo-600" />} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <InputField 
                        label="First Name" 
                        type="text" 
                        name="buyerFirstName" 
                        value={dealData.buyerFirstName || ''} 
                        onChange={handleChange} 
                        placeholder="e.g. John"
                    />
                    <InputField 
                        label="Last Name" 
                        type="text" 
                        name="buyerLastName" 
                        value={dealData.buyerLastName || ''} 
                        onChange={handleChange} 
                        placeholder="e.g. Appleseed"
                    />
                    <InputField 
                        label="Phone Number" 
                        type="tel" 
                        name="buyerPhone" 
                        value={dealData.buyerPhone || ''} 
                        onChange={handleChange} 
                        placeholder="e.g. (555) 123-4567"
                    />
                    <InputField 
                        label="Email Address" 
                        type="email" 
                        name="buyerEmail" 
                        value={dealData.buyerEmail || ''} 
                        onChange={handleChange} 
                        placeholder="e.g. john.appleseed@email.com"
                    />
                </div>
            </Card>
        </FormSection>
    </div>
  );
}
