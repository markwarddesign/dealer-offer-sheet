import React from 'react';
import steps from '../formSteps.jsx';
import stepComponents from '../stepComponents';
import getTotalTradeDevalue from '../utils/getTotalTradeDevalue';
import roundToHundredth from '../utils/roundToHundredth';

export default function SinglePageForm({ dealData, setDealData, onGenerateOffer, settings, setSettings }) {
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
        newData[name] = type === 'number' ? parseFloat(value) || 0 : type === 'checkbox' ? value : value;
      }
      return newData;
    });
  };
  return (
    <form className="relative max-w-2xl mx-auto" onSubmit={e => { e.preventDefault(); onGenerateOffer(); }}>
      {stepComponents.map((StepComponent, idx) => (
        <div key={steps[idx].title} className="mb-8">
          {React.createElement(StepComponent, {
            dealData,
            setDealData,
            handleChange,
            settings,
            setSettings
          })}
        </div>
      ))}
      <div className="flex justify-end pt-4">
        <button type="submit" className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-300">Review Offer</button>
      </div>
    </form>
  );
}
