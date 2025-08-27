import React, { useState } from 'react';
import steps from '../formSteps.jsx';
import stepComponents from '../stepComponents';
import getTotalTradeDevalue from '../utils/getTotalTradeDevalue';
import roundToHundredth from '../utils/roundToHundredth';

export default function TabbedForm({ dealData, setDealData, onGenerateOffer, settings, setSettings }) {
  const [tab, setTab] = useState(0);
  const [hovered, setHovered] = useState(null);
  const totalTabs = steps.length;
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
    <form className="relative max-w-4xl mx-auto bg-white rounded-xl shadow-md p-0 flex flex-col min-h-[600px]">
      {/* Mobile: icon-only sidebar */}
      <div className="flex md:hidden flex-col w-16 border-r bg-gray-50 rounded-l-xl py-4 pr-0 absolute h-full left-0 top-0 z-0 items-center">
        {steps.map((s, i) => (
          <button
            key={s.title}
            type="button"
            className={`flex flex-col items-center justify-center w-12 h-12 my-2 rounded-lg transition-colors duration-200 group ${i === tab ? 'bg-red-600 text-white shadow' : 'bg-gray-100 text-white hover:bg-red-600'}`}
            onClick={() => setTab(i)}
            title={s.title}
            style={{ position: 'relative' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="text-2xl flex items-center justify-center m-0 p-0">
              {React.cloneElement(s.icon, {
                className: 'w-7 h-7',
                style: { margin: 0, padding: 0 },
                stroke: i === tab || hovered === i ? 'white' : '#dc2626',
              })}
            </span>
          </button>
        ))}
      </div>
      {/* Desktop: icon + title sidebar */}
      <div className="hidden md:flex w-56 border-r bg-gray-50 rounded-l-xl flex-col py-8 pr-0 absolute h-full left-0 top-0 z-0">
        {steps.map((s, i) => (
          <button
            key={s.title}
            type="button"
            className={`text-left px-6 py-3 font-semibold border-l-4 transition-colors duration-200 mb-1 ${i === tab ? 'border-red-600 bg-white text-red-600 shadow' : 'border-transparent text-gray-600 hover:text-red-600 hover:bg-gray-100'}`}
            onClick={() => setTab(i)}
          >
            <span className="flex items-center gap-2">{s.icon}{s.title}</span>
          </button>
        ))}
      </div>
      {/* Form Content */}
  <div className="flex-1 p-4 md:p-10 md:ml-56 ml-16">
        {React.createElement(stepComponents[tab], {
          dealData,
          setDealData,
          handleChange,
          settings,
          setSettings
        })}
        <div className="flex justify-between pt-8">
          <button type="button" onClick={() => setTab(Math.max(0, tab - 1))} disabled={tab === 0} className={`px-6 py-3 rounded-lg font-bold shadow transition-all duration-300 ${tab === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-700'}`}>Back</button>
          <button type="button" onClick={() => tab === totalTabs - 1 ? onGenerateOffer() : setTab(tab + 1)} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-300">
            {tab === totalTabs - 1 ? 'Review Offer' : 'Next'}
          </button>
        </div>
      </div>
    </form>
  );
}
