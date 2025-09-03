import React from 'react';
import { useAppStore } from '../store';
import NumberInput from '../components/NumberInput';
import { Receipt, Eye } from 'lucide-react';

// --- Reusable UI Components ---

const FormSection = ({ title, icon, children }) => (
    <div className="space-y-8">
        <div className="flex items-center gap-4">
            {icon}
            <h2 className="text-3xl font-bold tracking-tight text-gray-800">{title}</h2>
        </div>
        <div className="space-y-8">{children}</div>
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

const NumberInputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <NumberInput 
            {...props}
            className="bg-gray-50"
        />
    </div>
);

const ToggleSwitch = ({ label, name, checked, onChange }) => (
    <div className="flex items-center justify-between py-3">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                name={name} 
                checked={checked} 
                onChange={onChange} 
                className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-200 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
    </div>
);


// --- Main Component ---

const FeesStep = () => {
	const { dealData, updateDealData } = useAppStore();

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		const val = type === 'checkbox' ? checked : value;
		updateDealData({ [name]: val });
	};

	return (
        <div className="bg-gray-50/50 p-4 sm:p-6 lg:p-8 font-sans">
            <FormSection title="Fees & Taxes" icon={<Receipt className="h-8 w-8 text-gray-500" />}>
                
                {/* --- FEES & TAXES CARD --- */}
                <Card>
                    <CardHeader title="Standard Fees & Tax Rates" icon={<Receipt className="h-6 w-6 text-indigo-600" />} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                        <NumberInputField
                            label="Doc Fee"
                            name="docFee"
                            value={dealData.docFee}
                            onChange={handleChange}
                        />
                        <NumberInputField
                            label="License Estimate"
                            name="licenseEstimate"
                            value={dealData.licenseEstimate}
                            onChange={handleChange}
                        />
                        <NumberInputField
                            label="Title Fee"
                            name="titleFee"
                            value={dealData.titleFee}
                            onChange={handleChange}
                        />
                        <NumberInputField
                            label="Other Fees"
                            name="otherFee"
                            value={dealData.otherFee}
                            onChange={handleChange}
                        />
                        <NumberInputField
                            label="Tax Rate (%)"
                            name="taxRate"
                            value={dealData.taxRate}
                            onChange={handleChange}
                            isCurrency={false}
                        />
                        <NumberInputField
                            label="Interest Rate (%)"
                            name="interestRate"
                            value={dealData.interestRate}
                            onChange={handleChange}
                            isCurrency={false}
                        />
                    </div>
                </Card>

                {/* --- VISIBILITY CARD --- */}
                <Card>
                    <CardHeader title="Visibility Options" icon={<Eye className="h-6 w-6 text-indigo-600" />} />
                    <div className="divide-y divide-gray-200">
                        <ToggleSwitch
                            label="Show License Fee"
                            name="showLicenseFeeOnOfferSheet"
                            checked={dealData.showLicenseFeeOnOfferSheet}
                            onChange={handleChange}
                        />
                        <ToggleSwitch
                            label="Show Tax Rate"
                            name="showTaxRateOnOfferSheet"
                            checked={dealData.showTaxRateOnOfferSheet}
                            onChange={handleChange}
                        />
                        <ToggleSwitch
                            label="Show Interest Rate"
                            name="showInterestRateOnOfferSheet"
                            checked={dealData.showInterestRateOnOfferSheet}
                            onChange={handleChange}
                        />
                    </div>
                </Card>

            </FormSection>
        </div>
    );
};

export default FeesStep;
