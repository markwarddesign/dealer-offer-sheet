import React from 'react';
import { useAppStore } from '../store';
import NumberInput from '../components/NumberInput';
import { PlusCircle, Settings2 } from 'lucide-react';

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
        <NumberInput {...props} />
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

export default function AddonsStep() {
    const { dealData, updateDealData, settings } = useAppStore();
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        updateDealData({ [name]: newValue });
    };

    return (
        <div className="bg-gray-50/50 p-4 sm:p-6 lg:p-8 font-sans">
            <FormSection title="Value Add-ons & Options" icon={<PlusCircle className="h-8 w-8 text-gray-500" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* --- ADD-ONS CARD --- */}
                    <Card>
                        <CardHeader title="Add-ons" icon={<PlusCircle className="h-6 w-6 text-indigo-600" />} />
                        <div className="space-y-4">
                            <NumberInputField label="Brake Plus" name="brakePlus" value={dealData.brakePlus} onChange={handleChange} />
                            <NumberInputField label="Safe Guard" name="safeGuard" value={dealData.safeGuard} onChange={handleChange} />
                            {settings?.showProtectionPackage && (
                                <NumberInputField label="Protection Package" name="protectionPackage" value={dealData.protectionPackage} onChange={handleChange} />
                            )}
                            {settings?.showGapInsurance && (
                                <NumberInputField label="GAP Insurance" name="gapInsurance" value={dealData.gapInsurance} onChange={handleChange} />
                            )}
                            {settings?.showServiceContract && (
                                <NumberInputField label="Extended Service Contract" name="serviceContract" value={dealData.serviceContract} onChange={handleChange} />
                            )}
                        </div>
                    </Card>

                    {/* --- OPTIONS CARD --- */}
                    <Card>
                        <CardHeader title="Options" icon={<Settings2 className="h-6 w-6 text-indigo-600" />} />
                        <div className="divide-y divide-gray-200">
                            <ToggleSwitch 
                                label="WPFL" 
                                name="wpfl" 
                                checked={dealData.wpfl ?? true} 
                                onChange={handleChange} 
                            />
                            <ToggleSwitch 
                                label="OCFL" 
                                name="ocfl" 
                                checked={dealData.ocfl ?? true} 
                                onChange={handleChange} 
                            />
                        </div>
                    </Card>

                </div>
            </FormSection>
        </div>
    );
}
