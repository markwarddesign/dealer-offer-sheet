import React from 'react';
import { useAppStore } from '../store';
import NumberInput from '../components/NumberInput';
import Toggle from '../components/Toggle';
import { formatCurrency } from '../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';

const QuickEntryPage = () => {
	const { dealData, updateDealData, updateRoi, settings } = useAppStore();
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		let val = type === 'checkbox' ? checked : value;

		if (name === 'roiPercentage') {
			updateRoi(Number(val));
			return;
		}

		if (name === 'downPayment' || name === 'financeTerm') {
			val = value.split(',').map(s => s.trim()).map(Number).filter(n => !isNaN(n));
		}

		updateDealData({ [name]: val });
	};

	const inputClass = "mt-1 block w-full border-0 border-b-2 border-gray-200 bg-transparent py-2 px-1 text-sm focus:outline-none focus:ring-0 focus:border-indigo-500";
	const labelClass = "block text-sm font-medium text-gray-700";
	const sectionClass = "p-4 border border-gray-200 rounded-lg";
	const gridClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3";

	const adjustedPrice = (dealData.sellingPrice || 0) - (dealData.rebates || 0);

	const defaultDevalueItems = settings?.tradeDevalueItems || [];
	const selectedDefaultDevalueSum = (dealData.tradeDevalueSelected || []).reduce((acc, index) => {
		const item = defaultDevalueItems[index];
		return acc + (item ? Number(item.price) || 0 : 0);
	}, 0);
	const customDevalueSum = (dealData.tradeDevalueItems || []).reduce((acc, item) => acc + (Number(item.value) || 0), 0);
	const totalDevaluation = selectedDefaultDevalueSum + customDevalueSum;
	const calculatedTradeValue = (dealData.marketValue || 0) - totalDevaluation;

	const downPaymentOptions = [0, 1000, 2500, 5000, 7500, 10000];
	const financeTermOptions = [24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84];

	React.useEffect(() => {
		if (dealData.isNewVehicle) {
			updateDealData({ reconditioningCost: 0 });
		}
	}, [dealData.isNewVehicle, updateDealData]);

	React.useEffect(() => {
		if (!dealData.isNewVehicle) {
			updateDealData({ rebates: 0 });
		}
	}, [dealData.isNewVehicle, updateDealData]);

	React.useEffect(() => {
		if (dealData.hasTrade) {
			updateDealData({ tradeValue: calculatedTradeValue });
		} else {
			updateDealData({ tradeValue: 0 });
		}
	}, [calculatedTradeValue, dealData.hasTrade, updateDealData]);

	const handleAddDevalueItem = () => {
		const items = dealData.tradeDevalueItems || [];
		updateDealData({ tradeDevalueItems: [...items, { name: '', value: '' }] });
	};

	const handleDevalueItemChange = (index, e) => {
		const { name, value } = e.target;
		const items = [...dealData.tradeDevalueItems];
		items[index] = { ...items[index], [name]: value };
		updateDealData({ tradeDevalueItems: items });
	};

	const handleRemoveDevalueItem = (index) => {
		const items = dealData.tradeDevalueItems.filter((_, i) => i !== index);
		updateDealData({ tradeDevalueItems: items });
	};

	const handleDevalueSelection = (index) => {
		const currentSelected = dealData.tradeDevalueSelected || [];
		const newSelected = currentSelected.includes(index)
			? currentSelected.filter((i) => i !== index)
			: [...currentSelected, index];
		updateDealData({ tradeDevalueSelected: newSelected });
	};

	const handleDownPaymentChange = (value) => {
		const currentDownPayments = dealData.downPayment || [];
		const newDownPayments = currentDownPayments.includes(value)
			? currentDownPayments.filter(d => d !== value)
			: [...currentDownPayments, value];
		updateDealData({ downPayment: newDownPayments });
	};

	const handleFinanceTermChange = (value) => {
		const currentFinanceTerms = dealData.financeTerm || [];
		const newFinanceTerms = currentFinanceTerms.includes(value)
			? currentFinanceTerms.filter(t => t !== value)
			: [...currentFinanceTerms, value];
		updateDealData({ financeTerm: newFinanceTerms });
	};

	return (
		<div className="min-h-screen">
			<div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-4">
				<div className="flex justify-between items-center mb-4">
					<h1 className="text-xl font-bold text-gray-800">Quick Entry</h1>
				</div>

				<div className="space-y-6">
					{/* Buyer & Vehicle */}
					<div className={sectionClass}>
						<h2 className="text-lg font-semibold mb-3">Buyer & Vehicle</h2>
						<div className={gridClass}>
							<label className={labelClass}>First Name <input type="text" name="buyerFirstName" value={dealData.buyerFirstName} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Last Name <input type="text" name="buyerLastName" value={dealData.buyerLastName} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Phone <input type="text" name="buyerPhone" value={dealData.buyerPhone} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Email <input type="email" name="buyerEmail" value={dealData.buyerEmail} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Year <NumberInput name="vehicleYear" value={dealData.vehicleYear} onChange={handleChange} className={inputClass} isCurrency={false} /></label>
							<label className={labelClass}>Make <input type="text" name="vehicleMake" value={dealData.vehicleMake} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Model <input type="text" name="vehicleModel" value={dealData.vehicleModel} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>VIN <input type="text" name="vehicleVin" value={dealData.vehicleVin} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Stock # <input type="text" name="vehicleStock" value={dealData.vehicleStock} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Mileage <NumberInput name="vehicleMileage" value={dealData.vehicleMileage} onChange={handleChange} className={inputClass} isCurrency={false} /></label>
							<label className={labelClass}>Color <input type="text" name="vehicleColor" value={dealData.vehicleColor} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>MPG <NumberInput name="vehicleMpg" value={dealData.vehicleMpg} onChange={handleChange} className={inputClass} isCurrency={false} /></label>
							<label className={labelClass}>Is new vehicle?
								<div className='py-2'><Toggle name="isNewVehicle" isChecked={dealData.isNewVehicle} onChange={handleChange} onText="New" offText="Used" /></div>
                            </label>
                            {dealData.isNewVehicle && <label className={labelClass}>MSRP <NumberInput name="msrp" value={dealData.msrp} onChange={handleChange} className={inputClass} /></label>}
                        </div>
                    </div>

                    {/* Pricing & Deal */}
                    <div className={sectionClass}>
						<div className="flex justify-between items-center mb-3">
							<h2 className="text-lg font-semibold">Pricing & Deal</h2>
							<div className="text-right">
								<span className="text-sm font-medium text-gray-500">Adjusted Price</span>
								<p className="text-lg font-bold text-green-600">{formatCurrency(adjustedPrice)}</p>
							</div>
						</div>
						<div className={gridClass}>
							<label className={labelClass}>Market Value <NumberInput name="marketValue" value={dealData.marketValue} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Selling Price <NumberInput name="sellingPrice" value={dealData.sellingPrice} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>ROI (%) <NumberInput name="roiPercentage" value={dealData.roiPercentage} onChange={handleChange} className={inputClass} isCurrency={false} /></label>
							<label className={labelClass}>Acquisition Cost {dealData.isNewVehicle ? '/ Invoice' : ' '} <NumberInput name="acquisitionCost" value={dealData.acquisitionCost} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Reconditioning <NumberInput name="reconditioningCost" value={dealData.reconditioningCost} onChange={handleChange} className={inputClass} disabled={dealData.isNewVehicle} /></label>
							<label className={labelClass}>Advertising <NumberInput name="advertisingCost" value={dealData.advertisingCost} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Flooring <NumberInput name="flooringCost" value={dealData.flooringCost} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Rebates <NumberInput name="rebates" value={dealData.rebates} onChange={handleChange} className={inputClass} disabled={!dealData.isNewVehicle} /></label>
						</div>
					</div>

					{/* Trade-In */}
					<div className={sectionClass}>
						<h2 className="text-lg font-semibold mb-3 flex items-center"><Toggle label="Has Trade-In?" name="hasTrade" isChecked={dealData.hasTrade} onChange={handleChange} /></h2>
						{dealData.hasTrade && (
							<div className={`${gridClass} mt-3`}>
								<label className={labelClass}>Market Value <NumberInput name="tradeMarketValue" value={dealData.tradeMarketValue} onChange={handleChange} className={inputClass} /></label>
								<label className={labelClass}>Trade Value <NumberInput name="tradeValue" value={dealData.tradeValue} onChange={handleChange} className={inputClass} readOnly /></label>
								<label className={labelClass}>Trade Payoff <NumberInput name="tradePayOff" value={dealData.tradePayOff} onChange={handleChange} className={inputClass} /></label>
								<label className={labelClass}>VIN <input type="text" name="tradeVehicleVin" value={dealData.tradeVehicleVin} onChange={handleChange} className={inputClass} /></label>
								<label className={labelClass}>Year <NumberInput name="tradeVehicleYear" value={dealData.tradeVehicleYear} onChange={handleChange} className={inputClass} isCurrency={false} /></label>
								<label className={labelClass}>Make <input type="text" name="tradeVehicleMake" value={dealData.tradeVehicleMake} onChange={handleChange} className={inputClass} /></label>
								<label className={labelClass}>Model <input type="text" name="tradeVehicleModel" value={dealData.tradeVehicleModel} onChange={handleChange} className={inputClass} /></label>
								<label className={labelClass}>Mileage <NumberInput name="tradeVehicleMileage" value={dealData.tradeVehicleMileage} onChange={handleChange} className={inputClass} isCurrency={false} /></label>
								<label className={labelClass}>MPG <NumberInput name="tradeVehicleMpg" value={dealData.tradeVehicleMpg} onChange={handleChange} className={inputClass} isCurrency={false} /></label>
								<Toggle label="Is Trade a Lease?" name="tradeIsLease" isChecked={dealData.tradeIsLease} onChange={handleChange} />
							</div>
						)}
						{dealData.hasTrade && (
							<div className="mt-6">
								<h3 className="text-md font-semibold mb-3">Devaluation</h3>
								{defaultDevalueItems.length > 0 && (
									<div className="mb-4">
										<h4 className="text-sm font-medium text-gray-600 mb-2">Default Items</h4>
										<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
											{defaultDevalueItems.map((item, index) => (
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

								<h4 className="text-sm font-medium text-gray-600 mb-2">Custom Items</h4>
								<div className="space-y-3">
									{(dealData.tradeDevalueItems || []).map((item, index) => (
										<div key={index} className="grid grid-cols-1 sm:grid-cols-10 gap-3 items-end">
											<div className="sm:col-span-5">
												<label className={labelClass}>Item Name</label>
												<input
													type="text"
													name="name"
													value={item.name}
													onChange={(e) => handleDevalueItemChange(index, e)}
													className={inputClass}
													placeholder="e.g. Scratches, Tire Wear"
												/>
											</div>
											<div className="sm:col-span-4">
												<label className={labelClass}>Value</label>
												<NumberInput
													name="value"
													value={item.value}
													onChange={(e) => handleDevalueItemChange(index, e)}
													className={inputClass}
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
						)}
					</div>

					{/* Fees & Financing */}
					<div className={sectionClass}>
						<h2 className="text-lg font-semibold mb-3">Fees & Financing</h2>
						<div className={gridClass}>
							<label className={labelClass}>Doc Fee <NumberInput name="docFee" value={dealData.docFee} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Title Fee <NumberInput name="titleFee" value={dealData.titleFee} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Tire Fee <NumberInput name="tireFee" value={dealData.tireFee} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>License Est. <NumberInput name="licenseEstimate" value={dealData.licenseEstimate} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Tax Rate (%) <NumberInput name="taxRate" value={dealData.taxRate} onChange={handleChange} className={inputClass} isCurrency={false}  /></label>
							<label className={labelClass}>Interest Rate (%) <NumberInput name="interestRate" value={dealData.interestRate} onChange={handleChange} className={inputClass} isCurrency={false}  /></label>
						</div>
						<div className="mt-4">
							<label className="block text-sm font-medium text-gray-700 mb-2">Down Payment Options</label>
							<div className="flex flex-wrap gap-2">
								{downPaymentOptions.map(option => (
									<button
										key={option}
										type="button"
										onClick={() => handleDownPaymentChange(option)}
										className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
											(dealData.downPayment || []).includes(option)
												? 'bg-blue-600 text-white border-blue-600'
												: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
										}`}
									>
										{formatCurrency(option)}
									</button>
								))}
							</div>
						</div>
						<div className="mt-4">
							<label className="block text-sm font-medium text-gray-700 mb-2">Finance Term Options (Months)</label>
							<div className="flex flex-wrap gap-2">
								{financeTermOptions.map(option => (
									<button
										key={option}
										type="button"
										onClick={() => handleFinanceTermChange(option)}
										className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
											(dealData.financeTerm || []).includes(option)
												? 'bg-blue-600 text-white border-blue-600'
												: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
										}`}
									>
										{option}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Offer Sheet Options */}
					<div className={sectionClass}>
                        <h2 className="text-lg font-semibold mb-3">Offer Sheet Options</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            <Toggle label="Show Interest Rate" name="showInterestRateOnOfferSheet" isChecked={dealData.showInterestRateOnOfferSheet} onChange={handleChange} className="justify-between w-full" />
                            <Toggle label="Show License Fee" name="showLicenseFeeOnOfferSheet" isChecked={dealData.showLicenseFeeOnOfferSheet} onChange={handleChange} className="justify-between w-full" />
                            <Toggle label="Show Tax Rate" name="showTaxRateOnOfferSheet" isChecked={dealData.showTaxRateOnOfferSheet} onChange={handleChange} className="justify-between w-full" />
                            <Toggle label="Show Amount Financed" name="showAmountFinancedOnOfferSheet" isChecked={dealData.showAmountFinancedOnOfferSheet} onChange={handleChange} className="justify-between w-full" />
                        </div>
                    </div>
				</div>

				<div className="mt-8 pt-6 border-t border-gray-200">
					<div className="flex justify-center">
						<button
							onClick={() => navigate('/offer')}
							className="w-full max-w-md bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out text-lg transform hover:scale-105"
						>
							Generate Offer Sheet
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default QuickEntryPage;
