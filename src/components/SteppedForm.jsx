import React, { useState } from 'react';
import steps from '../formSteps.jsx';
import stepComponents from '../stepComponents';
import getTotalTradeDevalue from '../utils/getTotalTradeDevalue';
import roundToHundredth from '../utils/roundToHundredth';

export default function SteppedForm({ dealData, setDealData, onGenerateOffer, settings, setSettings }) {
  const [step, setStep] = useState(0);
  const totalSteps = steps.length;

  // Unified handleChange for all fields
  const handleChange = (e) => {
    const { name, value, type } = e.target;
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
        newData[name] = type === 'number' ? parseFloat(value) || '' : type === 'checkbox' ? value : value;
      }
      return newData;
    });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step < totalSteps - 1) setStep(step + 1);
    else onGenerateOffer();
  };
  const handleBack = (e) => {
    e.preventDefault();
    if (step > 0) setStep(step - 1);
  };

  return (
    <form className="relative max-w-2xl mx-auto" onSubmit={handleNext}>
      {/* Progress Bar */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={i} className={`flex-1 h-2 mx-1 rounded transition-all duration-500 ${i <= step ? 'bg-red-600' : 'bg-gray-200'}`}></div>
        ))}
      </div>
      {/* Step Content */}
      <div className="transition-all duration-500 ease-in-out transform" style={{ opacity: 1, translate: 'none' }}>
        {React.createElement(stepComponents[step], {
          dealData,
          setDealData,
          handleChange,
          settings,
          setSettings
        })}
      </div>
      <div className="flex justify-between pt-8">
        <button type="button" onClick={handleBack} disabled={step === 0} className={`px-6 py-3 rounded-lg font-bold shadow transition-all duration-300 ${step === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-700'}`}>Back</button>
        <button type="submit" className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-300">
          {step === steps.length - 1 ? 'Review Offer' : 'Next'}
        </button>
      </div>
    </form>
  );
}
