import React, { useState, useEffect } from 'react';
import { useAppStore, initialDealData } from '../store';
import { Car, Trash2, Handshake } from 'lucide-react';
import NumberInput from '../components/NumberInput';
import { formatCurrency } from '../utils/formatCurrency';
import { getTotalTradeDevalue } from '../utils/getTotalTradeDevalue';


// --- Helper Functions (VIN & MPG Lookup) ---

const fetchVinDetails = async (vin) => {
    if (!vin || vin.length < 11) return null;
    try {
        const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
        if (!response.ok) throw new Error('VIN decoding failed');
        const data = await response.json();
        const results = data.Results || [];
        const getValue = (variable) => results.find((r) => r.Variable === variable)?.Value || null;
        return {
            year: getValue('Model Year'),
            make: getValue('Make'),
            model: getValue('Model'),
            trim: getValue('Trim') || getValue('Series'),
        };
    } catch (error) {
        console.error('Error fetching VIN details:', error);
        return null;
    }
};

const fetchVehicleId = async (year, make, model) => {
    if (!year || !make || !model) return null;
    try {
        const response = await fetch(`https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
        if (!response.ok) throw new Error('Fuel economy vehicle ID lookup failed');
        const xmlText = await response.text();
        const doc = new window.DOMParser().parseFromString(xmlText, 'text/xml');
        const vehicleIdNode = doc.querySelector('menuItem > value');
        return vehicleIdNode ? vehicleIdNode.textContent : null;
    } catch (error) {
        console.error('Error fetching vehicle ID for MPG:', error);
        return null;
    }
};

const fetchVehicleMpg = async (vehicleId) => {
    if (!vehicleId) return null;
    try {
        const response = await fetch(`https://www.fueleconomy.gov/ws/rest/vehicle/${vehicleId}`);
        if (!response.ok) throw new Error('Fuel economy data fetch failed');
        const xmlText = await response.text();
        const doc = new window.DOMParser().parseFromString(xmlText, 'text/xml');
        const mpgNode = doc.querySelector('comb08'); // Combined MPG
        return mpgNode ? Number(mpgNode.textContent) : null;
    } catch (error) {
        console.error('Error fetching MPG data:', error);
        return null;
    }
};

// --- Reusable UI Components ---

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

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

const CardHeader = ({ title, children, icon }) => (
    <div className="flex flex-wrap justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center gap-4">
            {children}
        </div>
    </div>
);

const Toggle = ({ label, name, checked, onChange, primaryColor = 'indigo' }) => (
    <div className="flex items-center gap-3">
        <span className={`font-semibold text-gray-700 text-sm`}>{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
            <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-${primaryColor}-200 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-${primaryColor}-600`}></div>
        </label>
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

export default function VehicleDealStep() {

    const { dealData, updateDealData, settings } = useAppStore();

    // --- State for Vehicle of Interest ---
    const [interestVin, setInterestVin] = useState(dealData.vehicleVin || '');
    const [interestVinLoading, setInterestVinLoading] = useState(false);
    const [interestVinError, setInterestVinError] = useState('');

    // --- State for Trade-In ---
    const [tradeVin, setTradeVin] = useState(dealData.tradeVehicleVin || '');
    const [tradeVinLoading, setTradeVinLoading] = useState(false);
    const [tradeVinError, setTradeVinError] = useState('');
    
    const totalDevaluation = getTotalTradeDevalue(dealData, settings.tradeDevalueItems);
    const marketValue = Number(dealData.tradeMarketValue) || 0;
    const tradePayOff = Number(dealData.tradePayOff) || 0;
    const netTradeValue = Math.max(0, marketValue - totalDevaluation);
    const netTradeEquity = netTradeValue - tradePayOff;
    
    useEffect(() => {
        updateDealData({ tradeValue: netTradeValue, totalTradeDevalue: totalDevaluation });
    }, [netTradeValue, totalDevaluation, updateDealData]);
    

    // --- VIN Lookup Handler ---
    const handleVinLookup = async (vin, type) => {
        const setLoading = type === 'interest' ? setInterestVinLoading : setTradeVinLoading;
        const setError = type === 'interest' ? setInterestVinError : setTradeVinError;
        const vinKey = type === 'interest' ? 'vehicleVin' : 'tradeVehicleVin';

        setLoading(true);
        setError('');
        updateDealData({ [vinKey]: vin });

        const details = await fetchVinDetails(vin);

        if (details) {
            const prefix = type === 'interest' ? 'vehicle' : 'tradeVehicle';
            updateDealData({
                [`${prefix}Year`]: details.year || '',
                [`${prefix}Make`]: details.make || '',
                [`${prefix}Model`]: details.model || '',
                [`${prefix}Trim`]: details.trim || '',
            });

            if (details.year && details.make && details.model) {
                const vehicleId = await fetchVehicleId(details.year, details.make, details.model);
                if (vehicleId) {
                    const mpg = await fetchVehicleMpg(vehicleId);
                    updateDealData({ [`${prefix}Mpg`]: mpg ?? '' });
                }
            }
        } else {
            setError('Could not decode VIN. Please check and try again, or enter details manually.');
        }
        setLoading(false);
    };

    // --- Universal Field Change Handler ---
    const handleFieldChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        if (name === 'vehicleVin') setInterestVin(val.toUpperCase());
        else if (name === 'tradeVehicleVin') setTradeVin(val.toUpperCase());
        else updateDealData({ [name]: val });

        if (name === 'hasTrade' && !checked) {
            const tradeFieldsToReset = Object.keys(initialDealData)
                .filter(key => key.startsWith('trade'))
                .reduce((obj, key) => ({ ...obj, [key]: initialDealData[key] }), {});
            updateDealData({ ...tradeFieldsToReset, hasTrade: false });
            setTradeVin('');
        }
    };

    const handleDevalueSelection = (index) => {
        const currentSelected = dealData.tradeDevalueSelected || [];
        const newSelected = currentSelected.includes(index)
            ? currentSelected.filter((i) => i !== index)
            : [...currentSelected, index];
        updateDealData({ tradeDevalueSelected: newSelected });
    };

    const handleAddDevalueItem = () => {
        const items = dealData.tradeDevalueItems || [];
        updateDealData({ tradeDevalueItems: [...items, { name: '', value: '' }] });
    };

    const handleDevalueItemChange = (index, e) => {
        const { name, value } = e.target;
        const items = [...(dealData.tradeDevalueItems || [])];
        items[index] = { ...items[index], [name]: value };
        updateDealData({ tradeDevalueItems: items });
    };

    const handleRemoveDevalueItem = (index) => {
        const items = (dealData.tradeDevalueItems || []).filter((_, i) => i !== index);
        updateDealData({ tradeDevalueItems: items });
    };


    return (
        <div className="bg-gray-50/50 p-4 sm:p-6 lg:p-8 font-sans">
        <FormSection title="Vehicle & Trade Details" icon={<Handshake className="h-8 w-8 text-gray-600" />}>
            <div className="space-y-8">

                {/* --- CARD 1: VEHICLE OF INTEREST --- */}
                <Card>
                    <CardHeader title="Vehicle of Interest" icon={<Handshake className="h-6 w-6 text-indigo-600" />}>
                        <Toggle 
                            label={dealData.isNewVehicle ? 'New Vehicle' : 'Used Vehicle'}
                            name="isNewVehicle"
                            checked={dealData.isNewVehicle || false}
                            onChange={handleFieldChange}
                        />
                    </CardHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">VIN</label>
                            <div className="flex group">
                                <div className="relative flex-grow">
                                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Car className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors"/>
                                    </div>
                                    <input type="text" name="vehicleVin" value={interestVin} onChange={handleFieldChange} placeholder="Enter Vehicle Identification Number" maxLength="17" 
                                        className="w-full rounded-l-lg border-gray-300 pl-10 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition"
                                    />
                                </div>
                                <button type="button" onClick={() => handleVinLookup(interestVin, 'interest')} disabled={interestVinLoading || !interestVin || interestVin.length < 11} 
                                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-r-lg shadow-sm hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center w-28 transition-colors">
                                    {interestVinLoading ? <SpinnerIcon /> : 'Lookup'}
                                </button>
                            </div>
                            {interestVinError && <p className="mt-2 text-sm text-red-600">{interestVinError}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4 pt-6 mt-6 border-t border-gray-200">
                        {dealData.isNewVehicle && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">MSRP</label>
                                <NumberInput name="msrp" value={dealData.msrp} onChange={handleFieldChange} />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
                            <NumberInput name="vehicleYear" value={dealData.vehicleYear} onChange={handleFieldChange} isCurrency={false} placeholder="e.g. 2024" />
                        </div>
                        <InputField label="Make" name="vehicleMake" value={dealData.vehicleMake || ''} onChange={handleFieldChange} placeholder="e.g. Toyota" />
                        <InputField label="Model" name="vehicleModel" value={dealData.vehicleModel || ''} onChange={handleFieldChange} placeholder="e.g. Camry" />
                        <InputField label="Trim" name="vehicleTrim" value={dealData.vehicleTrim || ''} onChange={handleFieldChange} placeholder="e.g. XSE" />
                        <InputField label="Stock #" name="vehicleStock" value={dealData.vehicleStock || ''} onChange={handleFieldChange} placeholder="e.g. 12345A" />
                        <InputField label="Color" name="vehicleColor" value={dealData.vehicleColor || ''} onChange={handleFieldChange} placeholder="e.g. Supersonic Red" />
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1.5">Mileage</label>
                            <NumberInput name="vehicleMileage" value={dealData.vehicleMileage} onChange={handleFieldChange} isCurrency={false} placeholder="e.g. 15000" />
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1.5">MPG (Combined)</label>
                             <NumberInput name="vehicleMpg" value={dealData.vehicleMpg} onChange={handleFieldChange} isCurrency={false} placeholder="e.g. 28" withIncrement step />
                        </div>
                        
                    </div>
                </Card>

                {/* --- CARD 2: TRADE-IN VEHICLE --- */}
                <Card>
                     <CardHeader title="Trade-In" icon={<Handshake className="h-6 w-6 text-sky-600" />}>
                        {dealData.hasTrade && (
                        <Toggle 
                            label="Is this a lease?"
                            name="isLease"
                            checked={dealData.isLease || false}
                            onChange={handleFieldChange}
                        />
                        )}
                        <Toggle 
                            label="Has Trade-In?"
                            name="hasTrade"
                            checked={dealData.hasTrade || false}
                            onChange={handleFieldChange}
                        />
                    </CardHeader>

                    {dealData.hasTrade && (
                        <div className="animate-fade-in space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                {/* Left Column: Details & Value */}
                                <div className="lg:col-span-3 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Trade VIN</label>
                                        <div className="flex group">
                                             <div className="relative flex-grow">
                                                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <Car className="h-5 w-5 text-gray-400 group-focus-within:text-sky-600 transition-colors"/>
                                                </div>
                                                <input type="text" name="tradeVehicleVin" value={tradeVin} onChange={handleFieldChange} placeholder="Enter Trade-In VIN" className="w-full rounded-l-lg border-gray-300 pl-10 p-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-gray-50 focus:bg-white transition" />
                                            </div>
                                            <button type="button" onClick={() => handleVinLookup(tradeVin, 'trade')} disabled={tradeVinLoading || !tradeVin || tradeVin.length < 11} className="bg-sky-600 text-white px-4 py-2.5 rounded-r-lg shadow-sm hover:bg-sky-700 disabled:bg-gray-400 flex items-center justify-center w-28 transition-colors">
                                                {tradeVinLoading ? <SpinnerIcon /> : 'Lookup'}
                                            </button>
                                        </div>
                                        {tradeVinError && <p className="mt-2 text-sm text-red-600">{tradeVinError}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
                                            <NumberInput name="tradeVehicleYear" value={dealData.tradeVehicleYear} onChange={handleFieldChange} isCurrency={false} />
                                        </div>
                                        <InputField label="Make" name="tradeVehicleMake" value={dealData.tradeVehicleMake || ''} onChange={handleFieldChange} />
                                        <InputField label="Model" name="tradeVehicleModel" value={dealData.tradeVehicleModel || ''} onChange={handleFieldChange} />
                                        <InputField label="Trim" name="tradeVehicleTrim" value={dealData.tradeVehicleTrim || ''} onChange={handleFieldChange} />
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mileage</label>
                                            <NumberInput name="tradeVehicleMileage" value={dealData.tradeVehicleMileage} onChange={handleFieldChange} isCurrency={false} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">MPG</label>
                                            <NumberInput name="tradeVehicleMpg" value={dealData.tradeVehicleMpg} onChange={handleFieldChange} isCurrency={false} withIncrement step />
                                        </div>
                                    </div>
                                     <div className="border-t border-gray-200 pt-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Market Value</label>
                                                <NumberInput name="tradeMarketValue" value={dealData.tradeMarketValue} onChange={handleFieldChange} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pay Off</label>
                                                <NumberInput name="tradePayOff" value={dealData.tradePayOff} onChange={handleFieldChange} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5"># in Market</label>
                                                <NumberInput name="vehiclesInMarket" value={dealData.vehiclesInMarket} onChange={handleFieldChange} isCurrency={false} withIncrement step />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Avg Days to Sell</label>
                                                <NumberInput name="avgDaysToSell" value={dealData.avgDaysToSell} onChange={handleFieldChange} isCurrency={false} withIncrement step />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Devaluation & Summary */}
                                <div className="lg:col-span-2 space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                                    <h4 className="text-lg font-semibold text-gray-800">Devaluation</h4>
                                    {settings.tradeDevalueItems.length > 0 && (
                                        <div className="space-y-3">
                                            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Common Items</h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {settings.tradeDevalueItems.map((item, index) => (
                                                    <label key={index} className="flex items-center space-x-3 p-2.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 has-[:checked]:bg-sky-50 has-[:checked]:border-sky-300 cursor-pointer transition-colors">
                                                        <input type="checkbox" checked={(dealData.tradeDevalueSelected || []).includes(index)} onChange={() => handleDevalueSelection(index)} className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"/>
                                                        <span className="text-sm text-gray-800">{item.label} ({formatCurrency(item.price)})</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2 pt-2">
                                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Custom Items</h5>
                                        {(dealData.tradeDevalueItems || []).map((item, index) => (
                                            <div key={index} className="flex gap-2 items-end">
                                                <div className="flex-grow">
                                                     <label className="block text-xs font-medium text-gray-600 mb-1">Item</label>
                                                    <input type="text" name="name" value={item.name} onChange={(e) => handleDevalueItemChange(index, e)} className="block w-full rounded-md border-gray-300 p-2 text-sm bg-white focus:ring-1 focus:ring-sky-500" placeholder="e.g. Scratches"/>
                                                </div>
                                                <div className="w-32">
                                                     <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
                                                    <NumberInput name="value" value={item.value} onChange={(e) => handleDevalueItemChange(index, e)} className="p-2 text-sm"/>
                                                </div>
                                                <button onClick={() => handleRemoveDevalueItem(index)} className="bg-white text-gray-500 p-2 rounded-md shadow-sm hover:bg-red-50 hover:text-red-600 border border-gray-300 transition-colors">
                                                    <Trash2 className="h-5 w-5"/>
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={handleAddDevalueItem} className="mt-2 bg-gray-200 text-gray-700 font-semibold py-1.5 px-3 rounded-lg hover:bg-gray-300 transition-colors text-xs shadow-sm">
                                            + Add Item
                                        </button>
                                    </div>
                                    
                                    <div className="border-t-2 border-dashed border-gray-300 pt-4 space-y-2.5">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Market Value:</span>
                                            <span className="font-medium text-gray-800">{formatCurrency(marketValue)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Total Devaluation:</span>
                                            <span className="font-medium text-red-600">({formatCurrency(totalDevaluation)})</span>
                                        </div>
                                        <div className="flex justify-between items-center text-md font-bold pt-2">
                                            <span className="text-gray-800">Net Trade Value (ACV):</span>
                                            <span className="text-green-600">{formatCurrency(netTradeValue)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-lg font-bold">
                                            <span className="text-gray-800">Net Equity:</span>
                                            <span className={netTradeEquity >= 0 ? 'text-sky-600' : 'text-red-600'}>{formatCurrency(netTradeEquity)}</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                </Card>
                
            </div>
        </FormSection>
        </div>
    );
}

