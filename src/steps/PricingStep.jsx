import React from 'react';
import { useAppStore } from '../store';
import NumberInput from '../components/NumberInput';
import { Calculator, Briefcase, Gift } from 'lucide-react';

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

const NumberInputField = ({ label, helpText, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <NumberInput 
            {...props}
            className="bg-gray-50"
        />
        {helpText && <p className="mt-1.5 text-xs text-gray-500">{helpText}</p>}
    </div>
);


// --- Main Component ---

const PricingStep = () => {
	const { dealData, updateDealData, settings, updateRoi } = useAppStore();

	const handleChange = (e) => {
		const { name, value } = e.target;
		if (name === 'roiPercentage') {
			updateRoi(Number(value));
		} else {
			updateDealData({ [name]: value });
		}
	};

	return (
        <div className="bg-gray-50/50 p-4 sm:p-6 lg:p-8 font-sans">
            <FormSection title="Pricing & Profitability" icon={<Calculator className="h-8 w-8 text-gray-500" />}>
                
                {/* --- PRICING CARD --- */}
                <Card>
                    <CardHeader title="Vehicle Pricing" icon={<Calculator className="h-6 w-6 text-indigo-600" />} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                        <NumberInputField
                            label="Market Value"
                            name="marketValue"
                            value={dealData.marketValue}
                            onChange={handleChange}
                        />
                        <NumberInputField
                            label="Selling Price"
                            name="sellingPrice"
                            value={dealData.sellingPrice}
                            onChange={handleChange}
                            placeholder="0"
                            helpText="Optional. Leave at 0 to calculate from ROI %."
                        />
                        <NumberInputField
                            label="ROI Percentage (%)"
                            name="roiPercentage"
                            value={dealData.roiPercentage ?? settings.roiPercentage}
                            onChange={handleChange}
                            placeholder="e.g., 15"
                            isCurrency={false}
                            helpText="Used if Selling Price is 0."
                        />
                    </div>
                </Card>

                {/* --- INVESTMENT CARD --- */}
                <Card>
                    <CardHeader title="Investment Costs" icon={<Briefcase className="h-6 w-6 text-indigo-600" />} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <NumberInputField
                            label={`Acquisition Cost ${dealData.isNewVehicle ? '/ Invoice' : ''}`}
                            name="acquisitionCost"
                            value={dealData.acquisitionCost}
                            onChange={handleChange}
                        />
                        {!dealData.isNewVehicle && (
                            <NumberInputField
                                label="Reconditioning Cost"
                                name="reconditioningCost"
                                value={dealData.reconditioningCost}
                                onChange={handleChange}
                            />
                        )}
                        <NumberInputField
                            label="Advertising Cost"
                            name="advertisingCost"
                            value={dealData.advertisingCost}
                            onChange={handleChange}
                        />
                        <NumberInputField
                            label="Flooring Cost"
                            name="flooringCost"
                            value={dealData.flooringCost}
                            onChange={handleChange}
                        />
                    </div>
                </Card>

                {/* --- REBATES CARD --- */}
                <Card>
                    <CardHeader title="Rebates & Incentives" icon={<Gift className="h-6 w-6 text-indigo-600" />} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <NumberInputField
                            label="Rebates"
                            name="rebates"
                            value={dealData.rebates}
                            onChange={handleChange}
                        />
                    </div>
                </Card>

            </FormSection>
        </div>
    );
};

export default PricingStep;
