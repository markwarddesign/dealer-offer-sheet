import React from 'react';
import FormSection from '../components/FormSection';
import { useAppStore } from '../store';
import NumberInput from '../components/NumberInput';

const FeesStep = () => {
	const { dealData, updateDealData } = useAppStore();

	const handleChange = (e) => {
		const { name, value, type } = e.target;
		// The custom toggle passes the value directly, not as `checked`
		const val = type === 'checkbox' ? value : value;
		updateDealData({ [name]: val });
	};

	const handleNumericChange = (e) => {
		const { name, value } = e.target;
		updateDealData({ [name]: value });
	};

	const renderToggle = (label, name, checked) => (
		<div className="flex items-center justify-between py-2">
			<span className="text-sm font-medium text-gray-900">{label}</span>
			<button
				type="button"
				onClick={() => handleChange({ target: { name, value: !checked, type: 'checkbox' } })}
				className={`${
					checked ? 'bg-indigo-600' : 'bg-gray-200'
				} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
			>
				<span
					className={`${
						checked ? 'translate-x-6' : 'translate-x-1'
					} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
				/>
			</button>
		</div>
	);

	return (
		<FormSection title="Fees & Taxes" noGrid={true}>
			<div className="flex flex-col gap-6">
				<div className="bg-gray-50 p-4 rounded-lg">
					<h4 className="text-lg font-semibold text-gray-700 mb-3">Fees</h4>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">Doc Fee</label>
							<NumberInput
								name="docFee"
								value={dealData.docFee}
								onChange={handleNumericChange}
								className="block w-full rounded-md border-gray-300 shadow-sm p-2"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">License Estimate</label>
							<NumberInput
								name="licenseEstimate"
								value={dealData.licenseEstimate}
								onChange={handleNumericChange}
								className="block w-full rounded-md border-gray-300 shadow-sm p-2"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Title Fee</label>
							<NumberInput
								name="titleFee"
								value={dealData.titleFee}
								onChange={handleNumericChange}
								className="block w-full rounded-md border-gray-300 shadow-sm p-2"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Other Fees</label>
							<NumberInput
								name="otherFee"
								value={dealData.otherFee}
								onChange={handleNumericChange}
								className="block w-full rounded-md border-gray-300 shadow-sm p-2"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
							<NumberInput
								name="taxRate"
								value={dealData.taxRate}
								onChange={handleNumericChange}
								className="block w-full rounded-md border-gray-300 shadow-sm p-2"
							/>
						</div>
					</div>
				</div>

				<div className="bg-gray-50 p-4 rounded-lg">
					<h4 className="text-lg font-semibold text-gray-700 mb-3">Offer Sheet Visibility</h4>
					<div className="divide-y divide-gray-200">
						{renderToggle('Show License Fee', 'showLicenseFeeOnOfferSheet', dealData.showLicenseFeeOnOfferSheet)}
						{renderToggle('Show Tax Rate', 'showTaxRateOnOfferSheet', dealData.showTaxRateOnOfferSheet)}
						{renderToggle('Show Interest Rate', 'showInterestRateOnOfferSheet', dealData.showInterestRateOnOfferSheet)}
					</div>
				</div>
			</div>
		</FormSection>
	);
};

export default FeesStep;
