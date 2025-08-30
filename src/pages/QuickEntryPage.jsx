import React from 'react';
import { useAppStore } from '../store';
import NumberInput from '../components/NumberInput';
import Toggle from '../components/Toggle';
import { formatCurrency } from '../utils/formatCurrency';

const QuickEntryPage = () => {
	const { dealData, updateDealData } = useAppStore();

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		let val = type === 'checkbox' ? checked : value;

		if (name === 'downPayment' || name === 'financeTerm') {
			val = value.split(',').map(s => s.trim()).map(Number).filter(n => !isNaN(n));
		}

		updateDealData({ [name]: val });
	};

	const arrayToString = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');

	const inputClass = "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm";
	const labelClass = "block text-sm font-medium text-gray-700";
	const sectionClass = "p-4 border rounded-lg";
	const gridClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3";

	const adjustedPrice = (dealData.sellingPrice || 0) - (dealData.rebates || 0);

	return (
		<div className="p-4 bg-gray-50 min-h-screen">
			<div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-4">
				<div className="flex justify-between items-center mb-4">
					<h1 className="text-xl font-bold text-gray-800">Quick Entry</h1>
					<button
						onClick={() => updateDealData({ page: 'offer' })}
						className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm"
					>
						Generate Offer
					</button>
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
							<label className={labelClass}>Year <NumberInput name="vehicleYear" value={dealData.vehicleYear} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Make <input type="text" name="vehicleMake" value={dealData.vehicleMake} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Model <input type="text" name="vehicleModel" value={dealData.vehicleModel} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>VIN <input type="text" name="vehicleVin" value={dealData.vehicleVin} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Stock # <input type="text" name="vehicleStock" value={dealData.vehicleStock} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Mileage <NumberInput name="vehicleMileage" value={dealData.vehicleMileage} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Color <input type="text" name="vehicleColor" value={dealData.vehicleColor} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>MPG <NumberInput name="vehicleMpg" value={dealData.vehicleMpg} onChange={handleChange} className={inputClass} /></label>
							<Toggle label="New Vehicle?" name="isNewVehicle" isChecked={dealData.isNewVehicle} onChange={handleChange} />
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
							<label className={labelClass}>ROI % <NumberInput name="roiPercentage" value={dealData.roiPercentage} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Acquisition Cost <NumberInput name="acquisitionCost" value={dealData.acquisitionCost} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Reconditioning <NumberInput name="reconditioningCost" value={dealData.reconditioningCost} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Advertising <NumberInput name="advertisingCost" value={dealData.advertisingCost} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Flooring <NumberInput name="flooringCost" value={dealData.flooringCost} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Rebates <NumberInput name="rebates" value={dealData.rebates} onChange={handleChange} className={inputClass} /></label>
						</div>
					</div>

					{/* Trade-In */}
					<div className={sectionClass}>
						<h2 className="text-lg font-semibold mb-3 flex items-center"><Toggle label="Has Trade-In?" name="hasTrade" isChecked={dealData.hasTrade} onChange={handleChange} /></h2>
						{dealData.hasTrade && (
							<div className={`${gridClass} mt-3`}>
								<label className={labelClass}>Trade Value <NumberInput name="tradeValue" value={dealData.tradeValue} onChange={handleChange} className={inputClass} /></label>
								<label className={labelClass}>Trade Payoff <NumberInput name="tradePayOff" value={dealData.tradePayOff} onChange={handleChange} className={inputClass} /></label>
								<label className={labelClass}>Market Value <NumberInput name="tradeMarketValue" value={dealData.tradeMarketValue} onChange={handleChange} className={inputClass} /></label>
								<label className={labelClass}>VIN <input type="text" name="tradeVehicleVin" value={dealData.tradeVehicleVin} onChange={handleChange} className={inputClass} /></label>
								<label className={labelClass}>Year <NumberInput name="tradeVehicleYear" value={dealData.tradeVehicleYear} onChange={handleChange} className={inputClass} /></label>
								<label className={labelClass}>Make <input type="text" name="tradeVehicleMake" value={dealData.tradeVehicleMake} onChange={handleChange} className={inputClass} /></label>
								<label className={labelClass}>Model <input type="text" name="tradeVehicleModel" value={dealData.tradeVehicleModel} onChange={handleChange} className={inputClass} /></label>
								<label className={labelClass}>Mileage <NumberInput name="tradeVehicleMileage" value={dealData.tradeVehicleMileage} onChange={handleChange} className={inputClass} /></label>
								<Toggle label="Is Trade a Lease?" name="tradeIsLease" isChecked={dealData.tradeIsLease} onChange={handleChange} />
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
							<label className={labelClass}>Tax Rate % <NumberInput name="taxRate" value={dealData.taxRate} onChange={handleChange} className={inputClass} /></label>
							<label className={labelClass}>Interest Rate % <NumberInput name="interestRate" value={dealData.interestRate} onChange={handleChange} className={inputClass} /></label>
							<label className={`${labelClass} sm:col-span-2`}>Down Payments (,) <input type="text" name="downPayment" value={arrayToString(dealData.downPayment)} onChange={handleChange} className={inputClass} /></label>
							<label className={`${labelClass} sm:col-span-2`}>Finance Terms (,) <input type="text" name="financeTerm" value={arrayToString(dealData.financeTerm)} onChange={handleChange} className={inputClass} /></label>
						</div>
					</div>

					{/* Offer Sheet Options */}
					<div className={sectionClass}>
						<h2 className="text-lg font-semibold mb-3">Offer Sheet Options</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Toggle label="Show Interest Rate" name="showInterestRateOnOfferSheet" isChecked={dealData.showInterestRateOnOfferSheet} onChange={handleChange} />
							<Toggle label="Show License Fee" name="showLicenseFeeOnOfferSheet" isChecked={dealData.showLicenseFeeOnOfferSheet} onChange={handleChange} />
							<Toggle label="Show Tax Rate" name="showTaxRateOnOfferSheet" isChecked={dealData.showTaxRateOnOfferSheet} onChange={handleChange} />
							<Toggle label="Show Amount Financed" name="showAmountFinancedOnOfferSheet" isChecked={dealData.showAmountFinancedOnOfferSheet} onChange={handleChange} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default QuickEntryPage;
