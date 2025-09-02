import React, { useEffect } from 'react';
import { useAppStore } from '../store';
import { formSteps as steps } from '../formSteps.jsx';
import stepComponents from '../stepComponents';
import { getTotalTradeDevalue } from '../utils/getTotalTradeDevalue';
import { roundToHundredth } from '../utils/roundToHundredth';
import { useParams, useNavigate } from 'react-router-dom';

export default function SteppedForm({ onGenerateOffer }) {
	const { dealData, setDealData, settings, setSettings, activeStep, onStepChange } = useAppStore();
	const totalSteps = steps.length;
	const { step } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		const stepIndex = steps.findIndex(s => s.path.endsWith(step));
		if (stepIndex !== -1 && stepIndex !== activeStep) {
			onStepChange(stepIndex);
		}
	}, [step, activeStep, onStepChange]);

	const ActiveStepComponent = stepComponents[activeStep];

	// Unified handleChange for all fields
	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setDealData(prevData => {
			let newData = { ...prevData };
			if (name === 'tradeMarketValue') {
				newData.tradeMarketValue = parseFloat(value) || 0;
				const totalDevalue = getTotalTradeDevalue(newData, settings);
				newData.tradeValue = roundToHundredth(newData.tradeMarketValue - totalDevalue);
			} else if (name === 'tradeValue') {
				newData.tradeValue = parseFloat(value) || 0;
				const totalDevalue = getTotalTradeDevalue(newData, settings);
				newData.tradeMarketValue = roundToHundredth(newData.tradeValue + totalDevalue);
			} else {
				newData[name] = type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || '' : value;
			}
			return newData;
		});
	};

	const handleNext = (e) => {
		e.preventDefault();
		if (activeStep < totalSteps - 1) {
			const nextStepPath = steps[activeStep + 1].path;
			navigate(nextStepPath);
		} else {
			onGenerateOffer();
		}
	};

	const handleBack = (e) => {
		e.preventDefault();
		if (activeStep > 0) {
			const prevStepPath = steps[activeStep - 1].path;
			navigate(prevStepPath);
		}
	};

	return (
		<form className="relative max-w-2xl mx-auto" onSubmit={handleNext}>
			{/* Progress Bar */}
			<div className="flex items-center mb-8">
				{steps.map((s, i) => (
					<div key={i} className={`flex-1 h-2 mx-1 rounded transition-all duration-500 ${i <= activeStep ? 'bg-red-600' : 'bg-gray-200'}`}></div>
				))}
			</div>
			{/* Step Content */}
			<div className="transition-all duration-500 ease-in-out transform" style={{ opacity: 1, translate: 'none' }}>
				{ActiveStepComponent && (
					<ActiveStepComponent
						dealData={dealData}
						setDealData={setDealData}
						handleChange={handleChange}
						settings={settings}
						setSettings={setSettings}
					/>
				)}
			</div>
			<div className="flex justify-between pt-8">
				<button type="button" onClick={handleBack} disabled={activeStep === 0} className={`px-6 py-3 rounded-lg font-bold shadow transition-all duration-300 ${activeStep === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-700'}`}>Back</button>
				<button type="submit" className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-300">
					{activeStep === steps.length - 1 ? 'Review Offer' : 'Next'}
				</button>
			</div>
		</form>
	);
}
