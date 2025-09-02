import React, { useState, useEffect } from 'react';
import { useAppStore, initialDealData } from '../store';
import FormSection from '../components/FormSection';
import NumberInput from '../components/NumberInput';
import { formatCurrency } from '../utils/formatCurrency';

// --- VIN & MPG Lookup Helpers (Consolidated) ---
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
    const [marketValueInput, setMarketValueInput] = useState(dealData.tradeMarketValue || '');
	const [payOffInput, setPayOffInput] = useState(dealData.tradePayOff || '');
	const [paymentInput, setPaymentInput] = useState(dealData.tradePayment || '');

	const tradeDevalueItems = settings?.tradeDevalueItems || [];
	const devalueCheckboxSum = dealData.tradeDevalueSelected?.reduce((sum, idx) => sum + (tradeDevalueItems?.[idx]?.price || 0), 0) || 0;
	const customDevalueSum = (dealData.tradeDevalueItems || []).reduce((acc, item) => acc + (Number(item.value) || 0), 0);
	const totalDevaluation = devalueCheckboxSum + customDevalueSum;
	const marketValue = Number(marketValueInput) || 0;
	const tradePayOff = Number(payOffInput) || 0;
	const netTradeValue = Math.max(0, marketValue - totalDevaluation);
	const netTradeEquity = netTradeValue - tradePayOff;

    useEffect(() => {
        if (dealData.isNewVehicle) {
            updateDealData({ reconditioningCost: 0 });
        } else {
            updateDealData({ reconditioningCost: initialDealData.reconditioningCost });
        }
    }, [dealData.isNewVehicle, updateDealData]);

    useEffect(() => {
		if (Number(dealData.tradeValue) !== netTradeValue && !isNaN(netTradeValue)) {
			updateDealData({ tradeValue: netTradeValue });
		}
	}, [netTradeValue, dealData.tradeValue, updateDealData]);


	// --- VIN Lookup Handlers ---
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
			setError('Could not decode VIN. Please check it and try again, or enter details manually.');
		}
		setLoading(false);
	};

	// --- Universal Field Change Handler ---
	const handleFieldChange = (e) => {
		const { name, value, type, checked } = e.target;
		const val = type === 'checkbox' ? checked : value;

        // Handle local state for controlled inputs
        if (name === 'vehicleVin') setInterestVin(val.toUpperCase());
        if (name === 'tradeVehicleVin') setTradeVin(val.toUpperCase());
        if (name === 'tradeMarketValue') setMarketValueInput(val);
		if (name === 'tradePayOff') setPayOffInput(val);
		if (name === 'tradePayment') setPaymentInput(val);


		updateDealData({ [name]: val });

		// Reset trade data if `hasTrade` is toggled off
		if (name === 'hasTrade' && !checked) {
			const tradeFieldsToReset = Object.keys(initialDealData)
				.filter((key) => key.startsWith('trade'))
				.reduce((obj, key) => ({ ...obj, [key]: initialDealData[key] }), {});
			updateDealData({ ...tradeFieldsToReset, hasTrade: false });
            setMarketValueInput('');
            setPayOffInput('');
            setPaymentInput('');
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
		<FormSection title="Vehicle & Trade Details" noGrid={true}>
			<div className="flex flex-col gap-6">
				{/* --- CARD 1: VEHICLE OF INTEREST --- */}
				<div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 flex flex-col gap-4">
					<div className="flex justify-between items-center border-b pb-3">
						<h3 className="text-xl font-semibold text-gray-800">Vehicle of Interest</h3>
						<div className="flex items-center gap-3">
							<span className="font-semibold text-gray-700">{dealData.isNewVehicle ? 'New Vehicle' : 'Used Vehicle'}</span>
							<label className="relative inline-flex items-center cursor-pointer">
								<input type="checkbox" name="isNewVehicle" checked={dealData.isNewVehicle || false} onChange={handleFieldChange} className="sr-only peer" />
								<div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
							</label>
						</div>
					</div>

					<div className="bg-gray-50 p-4 rounded-lg">
						<h4 className="text-lg font-semibold text-gray-700 mb-3">VIN Lookup</h4>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
							<div className="flex">
								<input type="text" name="vehicleVin" value={interestVin} onChange={handleFieldChange} placeholder="Enter VIN..." maxLength="17" className="block w-full rounded-l-md border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-red-500"/>
								<button type="button" onClick={() => handleVinLookup(interestVin, 'interest')} disabled={interestVinLoading || !interestVin || interestVin.length < 11} className="bg-red-600 text-white px-4 py-2 rounded-r-lg shadow hover:bg-red-700 disabled:bg-gray-400">
									{interestVinLoading ? '...' : 'Lookup'}
								</button>
							</div>
							{interestVinError && <p className="mt-2 text-sm text-red-600">{interestVinError}</p>}
						</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
							{dealData.isNewVehicle && (
								<div>
									<label className="block text-sm font-medium text-gray-700">MSRP</label>
									<NumberInput name="msrp" value={dealData.msrp} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
								</div>
							)}
							<div>
								<label className="block text-sm font-medium text-gray-700">Stock #</label>
								<input type="text" name="vehicleStock" value={dealData.vehicleStock || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Color</label>
								<input type="text" name="ifvehicleColor" value={dealData.vehicleColor || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Mileage</label>
								<NumberInput name="vehicleMileage" value={dealData.vehicleMileage} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" isCurrency={false} />
							</div>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">Year</label>
								<NumberInput name="vehicleYear" value={dealData.vehicleYear} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" isCurrency={false} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Make</label>
								<input type="text" name="vehicleMake" value={dealData.vehicleMake || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Model</label>
								<input type="text" name="vehicleModel" value={dealData.vehicleModel || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Trim</label>
								<input type="text" name="vehicleTrim" value={dealData.vehicleTrim || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">MPG</label>
								<NumberInput name="vehicleMpg" value={dealData.vehicleMpg} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" isCurrency={false} />
							</div>
						</div>
					</div>
				</div>

				{/* --- CARD 2: TRADE-IN VEHICLE --- */}
				<div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 flex flex-col gap-4">
					<div className="flex justify-between items-center border-b pb-3">
						<h3 className="text-xl font-semibold text-gray-800">Trade-In</h3>
						<div className="flex items-center gap-3">
							<span className="font-semibold text-gray-700">Has Trade-In?</span>
							<label className="relative inline-flex items-center cursor-pointer">
								<input type="checkbox" name="hasTrade" checked={dealData.hasTrade || false} onChange={handleFieldChange} className="sr-only peer" />
								<div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
							</label>
						</div>
					</div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800 text-white rounded-lg p-3 text-center shadow-lg flex flex-col justify-center">
                            <div className="text-sm font-semibold text-gray-400">ACV</div>
                            <div className="text-2xl font-bold text-green-400">{formatCurrency(netTradeValue)}</div>
                        </div>
                        <div className={`rounded-lg p-3 text-center shadow-lg flex flex-col justify-center ${netTradeEquity >= 0 ? 'bg-blue-800' : 'bg-red-800'} text-white`}>
                            <div className="text-sm font-semibold text-gray-300">Equity</div>
                            <div className="text-2xl font-bold">{formatCurrency(netTradeEquity)}</div>
                        </div>
                    </div>

					{dealData.hasTrade && (
						<div className="flex flex-col gap-4 animate-fade-in">
							<div className="bg-gray-50 p-4 rounded-lg">
								<h4 className="text-lg font-semibold text-gray-700 mb-3">Trade VIN Lookup</h4>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Trade VIN</label>
									<div className="flex">
										<input type="text" name="tradeVehicleVin" value={tradeVin} onChange={handleFieldChange} placeholder="Enter Trade VIN..." className="block w-full rounded-l-md border-gray-300 shadow-sm p-2"/>
										<button type="button" onClick={() => handleVinLookup(tradeVin, 'trade')} disabled={tradeVinLoading || !tradeVin || tradeVin.length < 11} className="bg-blue-600 text-white px-4 py-2 rounded-r-lg shadow hover:bg-blue-700 disabled:bg-gray-400">
											{tradeVinLoading ? '...' : 'Lookup'}
										</button>
									</div>
									{tradeVinError && <p className="mt-2 text-sm text-red-600">{tradeVinError}</p>}
								</div>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">Year</label>
										<NumberInput name="tradeVehicleYear" value={dealData.tradeVehicleYear} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" isCurrency={false} />
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">Make</label>
										<input type="text" name="tradeVehicleMake" value={dealData.tradeVehicleMake || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">Model</label>
										<input type="text" name="tradeVehicleModel" value={dealData.tradeVehicleModel || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">Trim</label>
										<input type="text" name="tradeVehicleTrim" value={dealData.tradeVehicleTrim || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">MPG</label>
										<NumberInput name="tradeVehicleMpg" value={dealData.tradeVehicleMpg} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" isCurrency={false} />
									</div>
								</div>
							</div>

							<div className="border-t pt-4">
								<h4 className="text-lg font-semibold text-gray-700 mb-3">Trade-In Value</h4>
								<div className="grid grid-cols-1  gap-4">
									<div className="flex flex-col gap-4">
                                       
										<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            
											<div>
												<label className="block text-sm font-medium text-gray-700">Market Value</label>
												<NumberInput name="tradeMarketValue" value={marketValueInput} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">Pay Off</label>
												<NumberInput name="tradePayOff" value={payOffInput} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">Payment</label>
												<NumberInput
													name="tradePayment"
													value={paymentInput}
													onChange={handleFieldChange}
													className="block w-full rounded-md border-gray-300 shadow-sm p-2"
												/>
											</div>
										</div>
										<div className="pb-2">
											<label className="flex items-center gap-3 text-base font-semibold cursor-pointer select-none">
												<span>Is this a Lease?</span>
												<span className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
													<input
														type="checkbox"
														name="tradeIsLease"
														checked={!!dealData.tradeIsLease}
														onChange={handleFieldChange}
														className="sr-only peer"
													/>
													<span className="block w-12 h-7 bg-gray-300 rounded-full shadow-inner peer-checked:bg-red-500 transition" />
													<span className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition peer-checked:translate-x-5 shadow" />
												</span>
											</label>
                            			</div>
									</div>
									<div className="mt-4">
										<h4 className="text-lg font-semibold text-gray-700 mb-3">Devaluation</h4>
										<div className="text-sm text-gray-600 mb-4">
											The <span className="font-bold text-gray-800">Net Trade Value</span> is calculated by subtracting the total devaluation from the Market Value.
										</div>
										{tradeDevalueItems.length > 0 && (
											<div className="mb-4">
												<h5 className="text-md font-semibold text-gray-600 mb-2">Default Items</h5>
												<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
													{tradeDevalueItems.map((item, index) => (
														<label key={index} className="flex items-center space-x-2 p-2 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer">
															<input
																type="checkbox"
																checked={(dealData.tradeDevalueSelected || []).includes(index)}
																onChange={() => handleDevalueSelection(index)}
																className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
															/>
															<span className="text-sm text-gray-800">{item.label} ({formatCurrency(item.price)})</span>
														</label>
													))}
												</div>
											</div>
										)}

										<h5 className="text-md font-semibold text-gray-600 mb-2">Custom Items</h5>
										<div className="space-y-3">
											{(dealData.tradeDevalueItems || []).map((item, index) => (
												<div key={index} className="grid grid-cols-1 sm:grid-cols-10 gap-3 items-end">
													<div className="sm:col-span-5">
														<label className="block text-sm font-medium text-gray-700">Item Name</label>
														<input
															type="text"
															name="name"
															value={item.name}
															onChange={(e) => handleDevalueItemChange(index, e)}
															className="block w-full rounded-md border-gray-300 shadow-sm p-2"
															placeholder="e.g. Scratches, Tire Wear"
														/>
													</div>
													<div className="sm:col-span-4">
														<label className="block text-sm font-medium text-gray-700">Value</label>
														<NumberInput
															name="value"
															value={item.value}
															onChange={(e) => handleDevalueItemChange(index, e)}
															className="block w-full rounded-md border-gray-300 shadow-sm p-2"
														/>
													</div>
													<div className="sm:col-span-1">
														<button
															onClick={() => handleRemoveDevalueItem(index)}
															className="w-full bg-red-500 text-white font-bold py-2 px-2 rounded-lg shadow-sm hover:bg-red-600 transition-colors text-sm"
														>
															Remove
														</button>
													</div>
												</div>
											))}
										</div>
										<button
											onClick={handleAddDevalueItem}
											className="mt-4 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
										>
											+ Add Custom Devalue Item
										</button>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</FormSection>
	);
}
