import React from 'react';
import FormSection from '../components/FormSection';
import { useAppStore } from '../store';
import NumberInput from '../components/NumberInput';

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
		<FormSection title="Pricing & Profitability">
			{/* Pricing Section */}
			<div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<div>
					<label htmlFor="marketValue" className="block text-sm font-medium text-gray-700 mb-1">
						Market Value
					</label>
					<NumberInput
						name="marketValue"
						id="marketValue"
						value={dealData.marketValue}
						onChange={handleChange}
						className="block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-red-500"
					/>
				</div>
				<div>
					<label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">
						Selling Price
					</label>
					<NumberInput
						name="sellingPrice"
						id="sellingPrice"
						value={dealData.sellingPrice}
						onChange={handleChange}
						className="block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-red-500"
						placeholder="0"
					/>
					<p className="mt-1 text-xs text-gray-500">Optional. Leave at 0 to calculate from ROI %.</p>
				</div>
				<div>
					<label htmlFor="roiPercentage" className="block text-sm font-medium text-gray-700 mb-1">
						ROI Percentage (%)
					</label>
					<NumberInput
						name="roiPercentage"
						id="roiPercentage"
						value={dealData.roiPercentage ?? settings.roiPercentage}
						onChange={handleChange}
						className="block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-red-500"
						placeholder="e.g., 15"
					/>
					<p className="mt-1 text-xs text-gray-500">Used if Selling Price is 0.</p>
				</div>
			</div>

			{/* Investment Section */}
			<div className="col-span-full">
				<h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Investment Costs</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label htmlFor="acquisitionCost" className="block text-sm font-medium text-gray-700 mb-1">
							Acquisition Cost {dealData.isNewVehicle ? '/ Invoice' : ''}
						</label>
						<NumberInput
							name="acquisitionCost"
							id="acquisitionCost"
							value={dealData.acquisitionCost}
							onChange={handleChange}
							className="block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-red-500"
						/>
					</div>
					{!dealData.isNewVehicle && (
						<div>
							<label htmlFor="reconditioningCost" className="block text-sm font-medium text-gray-700 mb-1">
								Reconditioning Cost
							</label>
							<NumberInput
								name="reconditioningCost"
								id="reconditioningCost"
								value={dealData.reconditioningCost}
								onChange={handleChange}
								className="block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-red-500"
							/>
						</div>
					)}
					<div>
						<label htmlFor="advertisingCost" className="block text-sm font-medium text-gray-700 mb-1">
							Advertising Cost
						</label>
						<NumberInput
							name="advertisingCost"
							id="advertisingCost"
							value={dealData.advertisingCost}
							onChange={handleChange}
							className="block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-red-500"
						/>
					</div>
					<div>
						<label htmlFor="flooringCost" className="block text-sm font-medium text-gray-700 mb-1">
							Flooring Cost
						</label>
						<NumberInput
							name="flooringCost"
							id="flooringCost"
							value={dealData.flooringCost}
							onChange={handleChange}
							className="block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-red-500"
						/>
					</div>
				</div>
			</div>

			{/* Rebates Section */}
			{dealData.isNewVehicle && (
				<div className="col-span-full mt-6">
					<h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Rebates & Incentives</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div>
							<label htmlFor="rebates" className="block text-sm font-medium text-gray-700 mb-1">
								Rebates
							</label>
							<NumberInput
								name="rebates"
								id="rebates"
								value={dealData.rebates}
								onChange={handleChange}
								className="block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-2 focus:ring-red-500"
							/>
						</div>
					</div>
				</div>
			)}
		</FormSection>
	);
};

export default PricingStep;
