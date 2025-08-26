// ...existing code...
import React, { useEffect, useState } from 'react';
import { useAppStore } from './store';
import { ShieldCheck, Car, Wrench, Coins, User, FileText, DollarSign, PlusCircle, ClipboardList, Printer, Settings as SettingsIcon } from 'lucide-react';
import TradeVsPrivateSale from './components/TradeVsPrivateSale';
import BuyerInfoStep from './steps/BuyerInfoStep';
import VehicleInfoStep from './steps/VehicleInfoStep';
import PricingStep from './steps/PricingStep';
import TradeStep from './steps/TradeStep';
import FeesStep from './steps/FeesStep';
import AddonsStep from './steps/AddonsStep';
import FinanceStep from './steps/FinanceStep';
import FormSection from './components/FormSection';

// --- Helper Functions & Initial State ---

// Helper function to format currency
const formatCurrency = (amount) => {
  const number = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(number);
};

// Helper function to round to the nearest hundredth
const roundToHundredth = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
};

// B&O Tax Rate constant
const BO_TAX_RATE = 0.00471; // 0.471%


// Helper function to get total trade devalue
function getTotalTradeDevalue(dealData, settings) {
  if (!dealData.tradeDevalueSelected || !settings || !settings.tradeDevalueItems) return 0;
  return dealData.tradeDevalueSelected.reduce((sum, idx) => sum + (settings.tradeDevalueItems[idx]?.price || 0), 0);
}

// --- Reusable Components ---


const InputField = ({ label, name, value, onChange, placeholder, type = 'text', helpText, options }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1">
            {type === 'checkbox' ? (
                <input
                    type="checkbox"
                    name={name}
                    id={name}
                    className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    checked={!!value}
                    onChange={e => onChange({ target: { name, value: e.target.checked, type } })}
                />
            ) : type === 'select' ? (
                <select
                    name={name}
                    id={name}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2"
                    value={value}
                    onChange={onChange}
                >
                  {options && options.map(opt => (
                    <option key={opt} value={opt}>{opt} months</option>
                  ))}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    id={name}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            )}
        </div>
        {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
);

// --- Page 1: Data Entry Form (Stepped) ---

const steps = [
  {
    title: "Buyer Information",
    icon: <User className="h-6 w-6 mr-3 text-red-600" />,
    fields: [
      { label: "First Name", name: "buyerFirstName", type: "text" },
      { label: "Last Name", name: "buyerLastName", type: "text" },
      { label: "Phone", name: "buyerPhone", type: "tel" },
      { label: "Email", name: "buyerEmail", type: "email" },
    ],
  },
  {
    title: "Vehicle of Interest",
    icon: <Car className="h-6 w-6 mr-3 text-red-600" />,
    fields: [
      { label: "Year", name: "vehicleYear", type: "number" },
      { label: "Make", name: "vehicleMake", type: "text" },
      { label: "Model", name: "vehicleModel", type: "text" },
      { label: "VIN", name: "vehicleVin", type: "text" },
      { label: "Stock #", name: "vehicleStock", type: "text" },
      { label: "Color", name: "vehicleColor", type: "text" },
      { label: "Mileage", name: "vehicleMileage", type: "number" },
      { label: "Fuel Economy (MPG)", name: "vehicleMpg", type: "number", helpText: "Auto-filled from VIN or enter manually." },
    ],
  },
  {
    title: "Pricing & Profitability",
    icon: <ClipboardList className="h-6 w-6 mr-3 text-red-600" />,
    fields: [
      { label: "Selling Price", name: "sellingPrice", type: "number", helpText: "Optional. Leave at 0 to calculate from ROI %." },
      { label: "ROI Percentage (%)", name: "roiPercentage", type: "number", helpText: "Used if Selling Price is 0." },
      { label: "Market Value", name: "marketValue", type: "number" },
      { label: "Acquisition Cost", name: "acquisitionCost", type: "number" },
      { label: "Reconditioning Cost", name: "reconditioningCost", type: "number" },
      { label: "Advertising Cost", name: "advertisingCost", type: "number" },
      { label: "Flooring Cost", name: "flooringCost", type: "number" },
      { label: "Interest Rate (%)", name: "interestRate", type: "number", helpText: "Used for finance calculations." },
      // New Vehicle checkbox
      { label: "Is this a new vehicle?", name: "isNewVehicle", type: "checkbox", helpText: "Check if the vehicle being purchased is new." },
      // Rebates, only show if new vehicle
      { label: "Rebates", name: "rebates", type: "number", showIf: (dealData) => !!dealData.isNewVehicle },
    ],
  },
  {
    title: "Customer Allowances & Trade",
    icon: <DollarSign className="h-6 w-6 mr-3 text-red-600" />,
    fields: [
      { label: "Market Value / Auction Value", name: "tradeMarketValue", type: "number", helpText: "The raw value before trade devalue deductions." },
      { label: "Trade Value", name: "tradeValue", type: "number", helpText: "This is Market Value minus trade devalue items. Editing this will update Market Value." },
      { label: "Trade Payoff", name: "tradePayoff", type: "number" },
      { label: "Year", name: "tradeVehicleYear", type: "number" },
      { label: "Make", name: "tradeVehicleMake", type: "text" },
      { label: "Model", name: "tradeVehicleModel", type: "text" },
      { label: "VIN", name: "tradeVehicleVin", type: "text" },
      { label: "Fuel Economy (MPG)", name: "tradeVehicleMpg", type: "number", helpText: "Auto-filled from VIN or enter manually." },
      { label: "Lease (Check if trade-in is a lease)", name: "tradeIsLease", type: "checkbox", helpText: "Tax credit only applies if trade-in is not a lease." },
      { label: "Current Monthly Payment", name: "tradeCurrentMonthlyPayment", type: "number", helpText: "Enter the current monthly payment for the trade-in vehicle." },
    ],
  },
  {
    title: "Fees & Taxes",
    icon: <FileText className="h-6 w-6 mr-3 text-red-600" />,
    fields: [
      { label: "Doc Fee", name: "docFee", type: "number" },
      { label: "License Estimate", name: "licenseEstimate", type: "number" },
      { label: "Title Fee", name: "titleFee", type: "number" },
      { label: "Other Fees", name: "otherFee", type: "number" },
      { label: "Tax Rate (%)", name: "taxRate", type: "number" },
    ],
  },
  {
    title: "Value Add-ons",
    icon: <PlusCircle className="h-6 w-6 mr-3 text-red-600" />,
    fields: [
      { label: "Brake Plus", name: "brakePlus", type: "number" },
      { label: "Safe Guard", name: "safeGuard", type: "number" },
      { label: "Protection Package", name: "protectionPackage", type: "number" },
      { label: "GAP Insurance", name: "gapInsurance", type: "number" },
      { label: "Extended Service Contract", name: "serviceContract", type: "number" },
    ],
  },
  // --- New Finance Options Section ---
  {
    title: "Finance Options",
    icon: <DollarSign className="h-6 w-6 mr-3 text-red-600" />,
    fields: [
      { label: "Down Payment", name: "downPayment", type: "number", helpText: "Enter the amount to be paid upfront." },
      { label: "Finance Term (months)", name: "financeTerm", type: "select", options: [24, 30, 36, 42, 48, 60, 66, 72, 84], helpText: "Select the loan term in months." },
    ],
  },
];

// --- Spinner for loading state ---
const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-gray-500 inline-block align-middle mr-1" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

// --- Trade Devalue Items UI Helper ---
function TradeDevalueItemsSection({ items, selected, onChange }) {
  if (!items || !items.length) return null;
  return (
    <div className="col-span-2 mb-2">
      <label className="block text-sm font-semibold text-gray-700 mb-1">Trade Devalue Items</label>
      <div className="flex flex-wrap gap-4">
        {items.map((item, idx) => (
          <label key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded shadow-sm">
            <input
              type="checkbox"
              checked={selected.includes(idx)}
              onChange={e => {
                if (e.target.checked) onChange([...selected, idx]);
                else onChange(selected.filter(i => i !== idx));
              }}
            />
            <span>{item.label} <span className="text-gray-500">({formatCurrency(item.price)})</span></span>
          </label>
        ))}
      </div>
    </div>
  );
}

// --- SteppedForm (no chained selects, only text fields + VIN lookup) ---
const stepComponents = [
  BuyerInfoStep,
  VehicleInfoStep,
  PricingStep,
  TradeStep,
  FeesStep,
  AddonsStep,
  FinanceStep
];
const SteppedForm = ({ dealData, setDealData, onGenerateOffer, settings, setSettings }) => {
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
      {/* Navigation Buttons */}
      <div className="flex justify-between pt-8">
        <button type="button" onClick={handleBack} disabled={step === 0} className={`px-6 py-3 rounded-lg font-bold shadow transition-all duration-300 ${step === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-700'}`}>Back</button>
        <button type="submit" className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-300">
          {step === steps.length - 1 ? 'Review Offer' : 'Next'}
        </button>
      </div>
    </form>
  );
};


// --- Page 2: Offer Sheet ---

const OfferSheet = ({ dealData, onGoBack, settings, onShowTradeVsPrivate }) => {
    // --- DYNAMIC CALCULATIONS ---
    let sellingPrice, roiPercentage, profit;
    const baseInvestment = roundToHundredth(dealData.acquisitionCost + dealData.reconditioningCost + dealData.advertisingCost + dealData.flooringCost);

    if (dealData.sellingPrice > 0) {
        // Scenario 1: Selling Price was entered manually. Calculate ROI from it.
        sellingPrice = roundToHundredth(dealData.sellingPrice);
        const boTax = roundToHundredth(sellingPrice * BO_TAX_RATE);
        const dealershipInvestment = roundToHundredth(baseInvestment + boTax);
        profit = roundToHundredth(sellingPrice - dealershipInvestment);
        roiPercentage = baseInvestment > 0 ? roundToHundredth((profit / baseInvestment) * 100) : 0;
    } else {
        // Scenario 2: Selling Price is 0, so calculate it from the ROI percentage.
        roiPercentage = dealData.roiPercentage;
        sellingPrice = roundToHundredth((baseInvestment * (1 + roiPercentage / 100)) / (1 - BO_TAX_RATE));
        const boTax = roundToHundredth(sellingPrice * BO_TAX_RATE);
        const dealershipInvestment = roundToHundredth(baseInvestment + boTax);
        profit = roundToHundredth(sellingPrice - dealershipInvestment);
    }

    // --- Trade Devalue Calculation ---
    let totalTradeDevalue = 0;
    if (dealData.tradeDevalueSelected && settings && settings.tradeDevalueItems) {
      totalTradeDevalue = dealData.tradeDevalueSelected.reduce((sum, idx) => sum + (settings.tradeDevalueItems[idx]?.price || 0), 0);
    }
  // Net Trade should match TradeStep Net Trade Equity: tradeValue - tradePayoff
  const netTrade = roundToHundredth(dealData.tradeValue - dealData.tradePayoff);
    // Use dealData value if set, else fallback to store default
    const getAddon = (key, fallback = 0) => {
      const val = dealData[key];
      return val !== undefined && val !== '' ? Number(val) : fallback;
    };
    const totalAddons = roundToHundredth(
      getAddon('protectionPackage', 0) +
      getAddon('gapInsurance', 0) +
      getAddon('serviceContract', 0) +
      getAddon('brakePlus', 0) +
      getAddon('safeGuard', 0)
    );
    
    // If trade-in is a lease, tax is on full selling price + add-ons (no trade deduction)
    let taxableAmount;
    if (dealData.tradeIsLease) {
        taxableAmount = sellingPrice + totalAddons;
    } else {
        taxableAmount = sellingPrice + totalAddons - dealData.tradeValue;
    }
    const difference = roundToHundredth(taxableAmount);
    
    const salesTax = difference > 0 ? roundToHundredth(difference * (dealData.taxRate / 100)) : 0;

    const totalFees = roundToHundredth(dealData.docFee + dealData.titleFee + dealData.otherFee);
    
  // Remove tax credit from calculations
  const licenseEstimate = Number(dealData.licenseEstimate) || 0;

  const totalAmountFinanced = roundToHundredth(sellingPrice +  netTrade + salesTax + licenseEstimate + totalFees );

    // Restore sunsetExclusives
    const sunsetExclusives = [
        { icon: <ShieldCheck className="h-8 w-8 text-red-600" />, title: 'Warranty Protection for Life', description: 'A lifetime limited powertrain warranty honored at any ASE certified facility in the US and Canada.' },
        { icon: <Wrench className="h-8 w-8 text-red-600" />, title: 'Oil Changes for Life', description: 'Save thousands over the lifetime of your vehicle with complimentary oil changes.' }
    ];

    // --- Finance Options Section ---
    // Support both array and single value for financeTerm and downPayment
    const selectedTerms = Array.isArray(dealData.financeTerm)
      ? dealData.financeTerm.filter(t => !isNaN(Number(t))).map(Number)
      : [Number(dealData.financeTerm)].filter(t => !isNaN(t));
    const selectedDowns = Array.isArray(dealData.downPayment)
      ? dealData.downPayment.filter(d => !isNaN(Number(d))).map(Number)
      : [Number(dealData.downPayment)].filter(d => !isNaN(d));
    const financeRate = 6.99;
    const financeTableRows = [];
    const docFee = dealData.docFee || 0;
    const otherFee = dealData.otherFee || 0;
    const sellingPriceForFinance = dealData.sellingPrice || 0;
    const calculateMonthlyPayment = (amount, rate, termMonths) => {
      if (!amount || !rate || !termMonths) return 0;
      const monthlyRate = rate / 12 / 100;
      return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
    };
    // Grouped by down payment
    const sortedTerms = [...selectedTerms].sort((a, b) => a - b);
    const sortedDowns = [...selectedDowns].sort((a, b) => a - b);
    sortedDowns.forEach((down) => {
      sortedTerms.forEach((term) => {
        const amountFinanced = sellingPriceForFinance - down + docFee + otherFee;
        const payment = calculateMonthlyPayment(amountFinanced, financeRate, term);
        financeTableRows.push({
          down,
          term,
          amountFinanced,
          payment
        });
      });
    });


    return (
      <div className="space-y-8">
        {/* Price display in top right */}
        {/* <div className="flex justify-end mb-2">
          <div className="bg-white rounded-lg shadow px-6 py-3 text-right border border-gray-200">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Final Price</div>
            <div className="text-2xl font-extrabold text-red-600">{formatCurrency(sellingPrice)}</div>
          </div>
        </div> */}
        <div className="bg-white rounded-xl shadow-lg p-8 printable-section">
          <div className="flex flex-row flex-wrap justify-between items-start mb-8 gap-6 mx-4">
            <div>
              <div className="uppercase tracking-wide text-sm text-red-600 font-semibold">{dealData.vehicleYear} {dealData.vehicleMake}</div>
              <h2 className="block mt-1 text-3xl leading-tight font-extrabold text-black">{dealData.vehicleModel}</h2>
              <div className="mt-2 text-gray-700 text-sm grid grid-cols-2 gap-x-8 gap-y-1">
                <span className="font-semibold">VIN:</span> <span>{dealData.vehicleVin}</span>
                <span className="font-semibold">Stock #:</span> <span>{dealData.vehicleStock}</span>
                <span className="font-semibold">Color:</span> <span>{dealData.vehicleColor}</span>
                <span className="font-semibold">Mileage:</span> <span>{dealData.vehicleMileage?.toLocaleString()} mi</span>
              </div>
            </div>
            <div className="text-right mt-6 md:mt-0">
              <p className="text-lg text-gray-700">Prepared for:</p>
              <p className="text-xl font-bold">{dealData.buyerFirstName} {dealData.buyerLastName}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6">
            {/* Pricing Transparency */}
            <div className="bg-gray-50 border-2 border-gray-200 p-6 rounded-xl shadow-sm flex flex-col md:col-span-1 w-full md:w-auto print:col-span-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Pricing Transparency</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between text-base"><p>Market Value</p><p className="font-semibold">{formatCurrency(dealData.marketValue)}</p></div>
                <div className="flex justify-between text-sm"><p>Acquisition Cost</p><p>{formatCurrency(dealData.acquisitionCost)}</p></div>
                <div className="flex justify-between text-sm items-start">
                  <div>
                    <p>Reconditioning Cost</p>
                   
                  </div>
                  <p className="text-right">{formatCurrency(dealData.reconditioningCost)}</p>
                </div>
                <div className="flex justify-between text-sm items-end">
                  <div>
                    <p>Advertising</p>
                    <span className="block text-[10px] text-gray-500">Avg: $600–$900 per vehicle</span>
                  </div>
                  <p>{formatCurrency(dealData.advertisingCost)}</p>
                </div>
                <div className="flex justify-between text-sm items-end">
                  <div>
                    <p>Flooring</p>
                    <span className="block text-[10px] text-gray-500">Avg: $300–$500 per vehicle</span>
                  </div>
                  <p>{formatCurrency(dealData.flooringCost)}</p>
                </div>
                <div className="flex justify-between text-sm"><p>B&O Tax (Calculated)</p><p>{formatCurrency(roundToHundredth(sellingPrice * BO_TAX_RATE))}</p></div>
                <div className="flex justify-between border-t border-gray-300 pt-2 mt-2"><p className="font-semibold">Total Investment</p><p className="font-bold">{formatCurrency(roundToHundredth(baseInvestment + (sellingPrice * BO_TAX_RATE)))}</p></div>
                <div className="flex justify-between"><p>ROI ({roiPercentage}%)</p><p className="font-medium">{formatCurrency(profit)}</p></div>
                <div className="flex justify-between items-center bg-white p-2 rounded-lg shadow-inner mt-2">
                  <p className="text-base font-bold text-gray-900">Adjusted Price</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(sellingPrice)}</p>
                </div>
                {/* Value Add-ons itemized */}
                <div className="flex justify-between text-sm py-1 border-b border-gray-100 font-semibold text-gray-700"><p>Value Add-ons</p><p></p></div>
                <div className="pl-4">
                  <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>Brake Plus</span><span>{formatCurrency(getAddon('brakePlus', 499))}</span></div>
                  <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>Safe Guard</span><span>{formatCurrency(getAddon('safeGuard', 249))}</span></div>
                  <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>Protection Package</span><span>{formatCurrency(getAddon('protectionPackage', 0))}</span></div>
                  <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>GAP Insurance</span><span>{formatCurrency(getAddon('gapInsurance', 0))}</span></div>
                  <div className="flex justify-between text-sm py-1 border-b border-gray-100"><span>Extended Service Contract</span><span>{formatCurrency(getAddon('serviceContract', 0))}</span></div>
                  <div className="flex justify-between text-sm py-1 border-b border-gray-100 font-bold"><span>Total Add-ons</span><span>{formatCurrency(totalAddons)}</span></div>
                </div>

                <div className="flex justify-between items-center bg-white p-2 rounded-lg shadow-inner mt-2">
                  <p className="text-base font-bold text-gray-900">Subtotal</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(sellingPrice + totalAddons)}</p>
                </div>

                {dealData.hasTrade && (
                  <>
                    <div className="flex justify-between text-sm py-1 border-b border-gray-100"><p>Trade Value</p><p>{formatCurrency(dealData.tradeValue)}</p></div>
                  </>
                )}
                <div className="flex justify-between text-sm py-1 border-b border-gray-100"><p>Doc Fee</p><p>{formatCurrency(dealData.docFee)}</p></div>
                <div className="flex justify-between text-sm py-1 border-b border-gray-100"><p>License Estimate</p><p>{formatCurrency(dealData.licenseEstimate)}</p></div>
                <div className="flex justify-between text-sm py-1 border-b border-gray-100"><p>Other Fees</p><p>{formatCurrency(dealData.titleFee + dealData.tireFee + dealData.otherFee)}</p></div>
                <div className="flex justify-between text-sm py-1 border-b border-gray-100"><p>Sales Tax ({dealData.taxRate}%)</p><p>{formatCurrency(salesTax)}</p></div>
                {dealData.isNewVehicle && <div className="flex justify-between text-sm text-red-600"><p>Rebates</p><p>({formatCurrency(dealData.rebates)})</p></div>}
              </div>
            </div>
            {/* Finance Table + Trade Breakdown stacked */}
            <div className="flex flex-col gap-6 w-full md:w-auto print:col-span-1">
              {dealData.hasTrade && (
                <div className="bg-green-50 border border-green-200 p-6 rounded-xl shadow-sm flex flex-col">
                  <h3 className="text-xl font-bold text-green-900 mb-4 text-center">Trade Breakdown</h3>
                  {/* Prominent Trade Vehicle Card */}
                  <div className="mb-4 p-4 rounded-lg bg-white border border-green-300 shadow flex flex-col gap-1">
                    <div className="text-lg font-bold text-green-900 flex flex-wrap items-center gap-2">
                      {dealData.tradeVehicleYear} {dealData.tradeVehicleMake} {dealData.tradeVehicleModel}
                      {dealData.tradeVehicleTrim && <span className="ml-1 text-base font-semibold text-green-700">{dealData.tradeVehicleTrim}</span>}
                    </div>
                    <div className="text-sm text-gray-700 flex flex-wrap gap-x-6 gap-y-1 mt-1">
                      <span><span className="font-semibold">VIN:</span> {dealData.tradeVehicleVin || '-'}</span>
                      <span><span className="font-semibold">MPG:</span> {dealData.tradeVehicleMpg ? dealData.tradeVehicleMpg : '-'}{dealData.tradeVehicleMpg ? ' mpg' : ''}</span>
                      <span><span className="font-semibold">Lease:</span> {dealData.tradeIsLease ? 'Yes' : 'No'}</span>
                      <span><span className="font-semibold">Current Payment:</span> {dealData.tradePayment ? formatCurrency(dealData.tradePayment) : '-'}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-gray-800">
                    <div className="flex justify-between text-sm"><span>Market Value</span><span>{formatCurrency(dealData.tradeMarketValue)}</span></div>
                    <div className="flex justify-between text-sm"><div><span>Reconditioning</span><br />
                    
                       {/* Sub-items for checked Trade Devalue Items */}
                    {dealData.tradeDevalueSelected && settings && settings.tradeDevalueItems && dealData.tradeDevalueSelected.length > 0 && (
                      <ul className="ml-4 mt-1 text-xs text-gray-600 list-disc">
                        {dealData.tradeDevalueSelected.map(idx => {
                          const item = settings.tradeDevalueItems[idx];
                          if (!item) return null;
                          return (
                            <li key={idx} className="flex justify-between">
                              <span>{item.label}</span>
                              <span className="ml-2">{formatCurrency(item.price)}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}</div>
                    <span>({formatCurrency(totalTradeDevalue)})</span>
                    </div>
                    <div className="flex justify-between text-sm"><span>Trade Value</span><span>{formatCurrency(dealData.tradeValue)}</span></div>
                    <div className="flex justify-between text-sm"><span>Payoff</span><span>({formatCurrency(dealData.tradePayoff)})</span></div>
                    <div className="flex justify-between text-sm font-bold border-t border-gray-300 pt-2 mt-2"><span>Net Trade</span><span>{formatCurrency(netTrade)}</span></div>
                  </div>
                </div>
              )}

              {/* ADD Amount Financed in it's own box */}
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl shadow-sm flex flex-col">
                <h3 className="text-xl font-bold text-yellow-900 mb-4">Amount Financed</h3>
                <div className="text-2xl font-semibold text-yellow-900">{formatCurrency(totalAmountFinanced)}</div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm flex flex-col mb-0">
                <h3 className="text-xl font-bold text-blue-900 mb-4 text-center">Financing Options</h3>
                {dealData.showInterestRateOnOfferSheet && (
                  <div className="mb-2 text-right text-sm text-gray-700 font-semibold">
                    Interest Rate: <span className="text-red-700">{(dealData.interestRate ?? 6.99).toFixed(2)}%</span>
                  </div>
                )}
               
                <div className="w-full">
                  <table className="w-full text-xs text-center rounded-xl shadow border border-gray-200 bg-white overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-2 border-b border-gray-200 font-semibold text-gray-700 rounded-tl-xl">Down</th>
                        <th className="px-2 py-2 border-b border-gray-200 font-semibold text-gray-700">Term</th>
                        <th className="px-2 py-2 border-b border-gray-200 font-semibold text-gray-700">Financed</th>
                        <th className="px-2 py-2 border-b border-gray-200 font-semibold text-gray-700 rounded-tr-xl">Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const grouped = {};
                        financeTableRows.forEach(row => {
                          if (!grouped[row.down]) grouped[row.down] = [];
                          grouped[row.down].push(row);
                        });
                        const downs = Object.keys(grouped).map(Number).sort((a, b) => a - b);
                        let rowIdx = 0;
                        return downs.flatMap(down => {
                          const rows = grouped[down];
                          return rows.map((row, tIdx) => {
                            const isGroupFirst = tIdx === 0;
                            const isGroupLast = tIdx === rows.length - 1;
                            const groupBg = rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                            const tr = (
                              <tr
                                key={row.down + '-' + row.term}
                                className={groupBg + ' transition hover:bg-blue-50'}
                              >
                                {isGroupFirst ? (
                                  <td
                                    rowSpan={rows.length}
                                    className={'px-2 py-2 font-semibold text-gray-700 align-middle whitespace-nowrap border-r border-gray-100 bg-gray-50 rounded-l-xl ' + (rows.length > 1 ? 'border-t-2 border-b-2 border-gray-200' : '')}
                                  >
                                    {row.down === 0 ? 'Financed' : `$${row.down.toLocaleString()}`}
                                  </td>
                                ) : null}
                                <td className={'px-2 py-2 text-gray-600 border-r border-gray-100' + (isGroupFirst ? ' border-t-2 border-gray-200' : '') + (isGroupLast ? ' border-b-2 border-gray-200' : '')}>{row.term}</td>
                                <td className={'px-2 py-2 text-gray-600 border-r border-gray-100' + (isGroupFirst ? ' border-t-2 border-gray-200' : '') + (isGroupLast ? ' border-b-2 border-gray-200' : '')}>${row.amountFinanced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className={'px-2 py-2 font-bold text-blue-900 bg-blue-50 rounded-r-xl' + (isGroupFirst ? ' border-t-2 border-gray-200' : '') + (isGroupLast ? ' border-b-2 border-gray-200' : '')}>${row.payment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              </tr>
                            );
                            return tr;
                          });
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

            <div className="bg-red-50 p-8 rounded-xl border border-red-200 printable-section sunset-exclusives-section">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">The Sunset Exclusives</h3>
                <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                    Buying at Sunset Chevrolet gets you more. A lot more.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sunsetExclusives.map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-4">
                            <div className="flex-shrink-0 bg-white p-3 rounded-full shadow-md">
                                {benefit.icon}
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">{benefit.title}</h4>
                                <p className="text-gray-600 mt-1">{benefit.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-center pt-4 space-y-2 no-print mb-9">
                <div className="flex space-x-4">
                  <button onClick={onGoBack} className="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300">
                      Go Back & Edit
                  </button>
                  {/* <button onClick={() => window.print()} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-300 flex items-center">
                      <Printer className="h-5 w-5 mr-2" />
                      Print Offer
                  </button> */}
                  {dealData.hasTrade && (
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 font-semibold"
                      onClick={onShowTradeVsPrivate}
                    >
                      Show Trade vs Private Sale
                    </button>
                  )}
                </div>
            </div>
        </div>
    );
};

// --- Settings Modal Component ---
function SettingsModal({ open, onClose, settings, setSettings }) {
  const [layout, setLayout] = useState(settings.layout || 'steps');
  const [tradeDevalueItems, setTradeDevalueItems] = useState(settings.tradeDevalueItems || []);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  // WPFL/OCFL settings
  const [wpflName, setWpflName] = useState(settings.wpflName || 'Warranty Protection for Life (WPFL)');
  const [wpflOptions, setWpflOptions] = useState(settings.wpflOptions || [
    { label: 'Sunset Chevrolet', price: 0 },
    { label: 'CarShield', price: 149 },
    { label: 'Endurance', price: 125 },
    { label: 'Optional Plan', price: 100 },
  ]);
  const [defaultWPFLIndex, setDefaultWPFLIndex] = useState(settings.defaultWPFLIndex ?? 0);
  const [oilChangeCost, setOilChangeCost] = useState(settings.oilChangeCost ?? 150);
  const [ocflYears, setOcflYears] = useState(settings.ocflYears ?? 5);

  useEffect(() => {
    if (open) {
      setLayout(settings.layout || 'steps');
      setTradeDevalueItems(settings.tradeDevalueItems || []);
      setWpflName(settings.wpflName || 'Warranty Protection for Life (WPFL)');
      setWpflOptions(settings.wpflOptions || [
        { label: 'Sunset Chevrolet', price: 0 },
        { label: 'CarShield', price: 149 },
        { label: 'Endurance', price: 125 },
        { label: 'Optional Plan', price: 100 },
      ]);
      setDefaultWPFLIndex(settings.defaultWPFLIndex ?? 0);
      setOilChangeCost(settings.oilChangeCost ?? 150);
      setOcflYears(settings.ocflYears ?? 5);
    }
  }, [open, settings]);

  const handleAddItem = () => {
    if (!newItemLabel.trim() || isNaN(Number(newItemPrice))) return;
    setTradeDevalueItems([...tradeDevalueItems, { label: newItemLabel.trim(), price: Number(newItemPrice) }]);
    setNewItemLabel('');
    setNewItemPrice('');
  };
  const handleRemoveItem = idx => {
    setTradeDevalueItems(tradeDevalueItems.filter((_, i) => i !== idx));
  };
  const handleSave = () => {
    setSettings({
      ...settings,
      layout,
      tradeDevalueItems,
      wpflName,
      wpflOptions,
      defaultWPFLIndex,
      oilChangeCost: Number(oilChangeCost) || 0,
      ocflYears: Number(ocflYears) || 1,
    });
    localStorage.setItem('offerSheetSettings', JSON.stringify({
      ...settings,
      layout,
      tradeDevalueItems,
      wpflName,
      wpflOptions,
      defaultWPFLIndex,
      oilChangeCost: Number(oilChangeCost) || 0,
      ocflYears: Number(ocflYears) || 1,
    }));
    onClose();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl">×</button>
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <div className="mb-6">
          <label className="block font-semibold mb-2">Form Layout</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="layout" value="steps" checked={layout === 'steps'} onChange={() => setLayout('steps')} /> Steps
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="layout" value="tabs" checked={layout === 'tabs'} onChange={() => setLayout('tabs')} /> Tabs
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="layout" value="single" checked={layout === 'single'} onChange={() => setLayout('single')} /> Single Page
            </label>
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-2">Trade Devalue Items</label>
          <ul className="mb-2">
            {tradeDevalueItems.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 mb-1">
                <span className="flex-1">{item.label} <span className="text-gray-500">({formatCurrency(item.price)})</span></span>
                <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:underline text-xs">Remove</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mb-2">
            <input type="text" placeholder="Item label" className="border rounded p-2 flex-1" value={newItemLabel} onChange={e => setNewItemLabel(e.target.value)} />
            <input type="number" placeholder="Price" className="border rounded p-2 w-24" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
            <button type="button" className="bg-red-600 text-white px-3 py-2 rounded" onClick={handleAddItem}>Add</button>
          </div>
        </div>
        <div className="mt-8 border-t pt-6">
          <label className="block font-semibold mb-2">WPFL & OCFL Settings</label>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <input type="text" className="border rounded p-2 flex-1 mb-2" value={wpflName} onChange={e => setWpflName(e.target.value)} placeholder="WPFL Name" />
              {wpflOptions.map((opt, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-1">
                  <input
                    type="text"
                    className="border rounded p-2 flex-1"
                    value={opt.label}
                    onChange={e => {
                      const newOpts = [...wpflOptions];
                      newOpts[idx].label = e.target.value;
                      setWpflOptions(newOpts);
                    }}
                    placeholder="Option Name"
                  />
                  <input
                    type="number"
                    className="border rounded p-2 w-24"
                    value={opt.price}
                    onChange={e => {
                      const newOpts = [...wpflOptions];
                      newOpts[idx].price = Number(e.target.value) || 0;
                      setWpflOptions(newOpts);
                    }}
                    placeholder="Price"
                  />
                  <input
                    type="radio"
                    name="defaultWPFL"
                    checked={defaultWPFLIndex === idx}
                    onChange={() => setDefaultWPFLIndex(idx)}
                    className="ml-2"
                    title="Set as default"
                  />
                  <span className="text-xs text-gray-500">Default</span>
                  <button type="button" className="text-gray-500 hover:text-gray-900" onClick={() => {
                    if (idx > 0) {
                      const newOpts = [...wpflOptions];
                      [newOpts[idx-1], newOpts[idx]] = [newOpts[idx], newOpts[idx-1]];
                      setWpflOptions(newOpts);
                    }
                  }}>↑</button>
                  <button type="button" className="text-gray-500 hover:text-gray-900" onClick={() => {
                    if (idx < wpflOptions.length - 1) {
                      const newOpts = [...wpflOptions];
                      [newOpts[idx+1], newOpts[idx]] = [newOpts[idx], newOpts[idx+1]];
                      setWpflOptions(newOpts);
                    }
                  }}>↓</button>
                  <button type="button" className="text-red-500 hover:text-red-700" onClick={() => {
                    setWpflOptions(wpflOptions.filter((_, i) => i !== idx));
                    if (defaultWPFLIndex === idx) setDefaultWPFLIndex(0);
                  }}>✕</button>
                </div>
              ))}
              <button type="button" className="bg-blue-600 text-white px-2 py-1 rounded text-xs mt-1 w-fit" onClick={() => setWpflOptions([...wpflOptions, { label: '', price: 0 }])}>Add Option</button>
            </div>
            <div className="flex gap-2 items-center">
              <input type="number" className="border rounded p-2 w-32" value={oilChangeCost} onChange={e => setOilChangeCost(e.target.value)} placeholder="Oil Change Cost" />
              <input type="number" className="border rounded p-2 w-32" value={ocflYears} onChange={e => setOcflYears(e.target.value)} placeholder="Years" min={1} />
              <span className="text-xs text-gray-500">Oil Change for Life (OCFL)</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6 gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-red-600 text-white font-semibold">Save</button>
        </div>
      </div>
    </div>
  );
}

// --- TabbedForm Component ---
function TabbedForm({ dealData, setDealData, onGenerateOffer, settings, setSettings }) {
  const [tab, setTab] = useState(0);
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
      {/* Responsive Tabs: horizontal scroll on mobile, sidebar on desktop */}
      <div className="block md:hidden sticky top-[64px] z-10 bg-white border-b no-scrollbar">
        <div className="flex flex-row gap-1 px-2 py-2">
          {steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              className={`flex-1 min-w-[120px] whitespace-nowrap px-3 py-2 text-xs font-semibold rounded transition-colors duration-200 ${i === tab ? 'bg-red-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-red-100'}`}
              onClick={() => setTab(i)}
              style={{ flex: '0 0 auto' }}
            >
              <span className="flex items-center gap-1 justify-center">{s.icon}{s.title}</span>
            </button>
          ))}
        </div>
      </div>
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
      <div className="flex-1 p-4 md:p-10 md:ml-56">
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
// --- SinglePageForm Component ---
function SinglePageForm({ dealData, setDealData, onGenerateOffer, settings, setSettings }) {
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

// --- Shared VIN lookup logic for all forms ---

// --- Main App Component ---

export default function App() {
  const {
    page,
    setPage,
    dealData,
    setDealData,
    settingsOpen,
    setSettingsOpen,
    settings,
    setSettings,
  } = useAppStore();

  // Ensure tradePayoff and tradePayment are initialized from store defaults if not already set
  useEffect(() => {
    let needsUpdate = false;
    const updated = { ...dealData };
    if (dealData.tradePayOff !== undefined && (dealData.tradePayoff === undefined || dealData.tradePayoff === '')) {
      updated.tradePayoff = dealData.tradePayOff;
      needsUpdate = true;
    }
    if (dealData.tradePayment !== undefined && (dealData.tradePayment === undefined || dealData.tradePayment === '')) {
      updated.tradePayment = 620; // match store.js default
      needsUpdate = true;
    }
    if (needsUpdate) setDealData(updated);
  }, [dealData, setDealData]);

  useEffect(() => {
    localStorage.setItem('offerSheetSettings', JSON.stringify(settings));
  }, [settings]);

  const logoUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe20azLghiq6B4uoUgyV5A_j5zjglEyeNF9g&s";

  const handleGenerateOffer = () => {
    setPage('offer');
    window.scrollTo(0, 0);
  };

  const handleGoBack = () => {
    setPage('form');
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="bg-black text-white p-4 shadow-lg sticky top-0 z-10 no-print">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src={logoUrl} alt="Sunset Chevrolet Logo" className="h-12" />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-300">{page === 'form' ? 'Deal Configuration' : 'Customer Offer Sheet'}</p>
            <button
              onClick={() => setSettingsOpen(true)}
              className="ml-4 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center"
              aria-label="Settings"
            >
              <SettingsIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} setSettings={setSettings} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
  {/* Show Trade vs Private Sale button moved to OfferSheet */}
        {page === 'form' ? (
          settings.layout === 'tabs' ? (
            <TabbedForm dealData={dealData} setDealData={setDealData} onGenerateOffer={handleGenerateOffer} settings={settings} setSettings={setSettings} />
          ) : settings.layout === 'single' ? (
            <SinglePageForm dealData={dealData} setDealData={setDealData} onGenerateOffer={handleGenerateOffer} settings={settings} setSettings={setSettings} />
          ) : (
            <SteppedForm dealData={dealData} setDealData={setDealData} onGenerateOffer={handleGenerateOffer} settings={settings} setSettings={setSettings} />
          )
        ) : page === 'offer' ? (
          <>
            {/* Price display in top right for offer page is handled in OfferSheet */}
            <OfferSheet dealData={dealData} onGoBack={handleGoBack} settings={settings} onShowTradeVsPrivate={() => setPage('trade-vs-private')} />
          </>
        ) : (
          <>
            {/* Print both OfferSheet and TradeVsPrivateSale on trade-vs-private page */}
            <div className="print-offer-trade-wrapper">
              <OfferSheet
                dealData={dealData}
                onGoBack={() => setPage('offer')}
                settings={settings}
                onShowTradeVsPrivate={() => {}}
              />
              <div className="print:break-before-page">
                <TradeVsPrivateSale dealData={dealData} onBack={() => setPage('offer')} />
              </div>
            </div>
          </>
        )}
      </main>
      <footer className="bg-black text-white mt-12 py-8 no-print">
        <div className="container mx-auto text-center">
          <p className="font-semibold">Sunset Chevrolet</p>
          <p className="text-sm text-gray-400 mt-1">910 Traffic Ave, Sumner, WA 98390 | Sales: (253) 299-2561</p>
        </div>
      </footer>
    </div>
  );
}
