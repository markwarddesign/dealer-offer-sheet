import React, { useState } from 'react';
import { ShieldCheck, Car, Wrench, Coins, User, FileText, DollarSign, PlusCircle, ClipboardList, Printer } from 'lucide-react';

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

// Initial state for the form data reflecting the new items
const initialDealData = {
  // Buyer Info
  buyerFirstName: 'John',
  buyerLastName: 'Appleseed',
  buyerPhone: '555-123-4567',
  buyerEmail: 'john.appleseed@email.com',
  // Vehicle Info
  vehicleYear: 2024,
  vehicleMake: 'Chevrolet',
  vehicleModel: 'Silverado 1500',
  vehicleVin: 'VIN123456789XYZ',
  vehicleStock: 'C12345',
  vehicleColor: 'Summit White',
  vehicleMileage: 12,
  // Dealership Costs
  marketValue: 45788.00,
  acquisitionCost: 38244,
  reconditioningCost: 2650,
  advertisingCost: 675,
  flooringCost: 382.63,
  // Flexible inputs
  sellingPrice: 43477, // Can be 0 to trigger auto-calc
  roiPercentage: 5, // Used if sellingPrice is 0
  // Customer-facing numbers
  rebates: 0,
  tradeValue: 12000,
  tradePayoff: 6250,
  // Fees
  docFee: 200,
  titleFee: 0,
  tireFee: 0,
  licenseEstimate: 675,
  otherFee: 0,
  // Add-ons
  protectionPackage: 0,
  gapInsurance: 0,
  serviceContract: 0,
  brakePlus: 499,
  safeGuard: 249,
  // Tax
  taxRate: 9.8,
  // MPG
  vehicleMpg: 0,
  tradeVehicleYear: null,
  tradeVehicleMake: '',
  tradeVehicleModel: '',
  tradeVehicleVin: '',
  tradeVehicleMpg: 0,
  // Lease field for trade-in vehicle
  tradeIsLease: false,
  // Trade-in current monthly payment
  tradeCurrentMonthlyPayment: '',
  // Add new field to track if vehicle is new
  isNewVehicle: false,
  // --- New fields for finance options ---
  downPayment: 0,
  financeTerm: 72, // Default to 72 months
};

// --- VIN decode helper ---
const fetchVinDetails = async (vin) => {
  if (!vin || vin.length < 5) return {};
  try {
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
    const data = await res.json();
    const results = data.Results || [];
    const year = results.find(r => r.Variable === 'Model Year')?.Value;
    const make = results.find(r => r.Variable === 'Make')?.Value;
    const model = results.find(r => r.Variable === 'Model')?.Value;
    const vehicleId = results.find(r => r.Variable === 'Vehicle ID')?.Value;
    return { year, make, model, vehicleId };
  } catch {
    return {};
  }
};

// --- FuelEconomy.gov MPG fetch helper ---
const fetchVehicleMpgById = async (vehicleId) => {
  if (!vehicleId) return null;
  try {
    const res = await fetch(`https://www.fueleconomy.gov/ws/rest/vehicle/${vehicleId}`);
    const xml = await res.text();
    const doc = new window.DOMParser().parseFromString(xml, 'text/xml');
    const mpgNode = doc.querySelector('comb08');
    return mpgNode ? Number(mpgNode.textContent) : null;
  } catch {
    return null;
  }
};

// --- FuelEconomy.gov My MPG summary fetch helper ---
const fetchVehicleId = async (year, make, model) => {
  if (!year || !make || !model) return null;
  try {
    const searchUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
    const res = await fetch(searchUrl);
    const xml = await res.text();
    const doc = new window.DOMParser().parseFromString(xml, 'text/xml');
    const option = doc.querySelector('menuItem > value');
    return option ? option.textContent : null;
  } catch {
    return null;
  }
};

const fetchMyMpgSummary = async (vehicleId) => {
  if (!vehicleId) return null;
  try {
    const res = await fetch(`https://www.fueleconomy.gov/ws/rest/ympg/vehicle/${vehicleId}`);
    const xml = await res.text();
    const doc = new window.DOMParser().parseFromString(xml, 'text/xml');
    const avgMpg = doc.querySelector('avgMpg')?.textContent;
    const numUsers = doc.querySelector('numUsers')?.textContent;
    return avgMpg && numUsers ? { avgMpg: Number(avgMpg), numUsers: Number(numUsers) } : null;
  } catch {
    return null;
  }
};

// --- FuelEconomy.gov Emissions fetch helper ---
const fetchVehicleEmissionsById = async (vehicleId) => {
  if (!vehicleId) return null;
  try {
    const res = await fetch(`https://www.fueleconomy.gov/ws/rest/vehicle/emissions/${vehicleId}`);
    const xml = await res.text();
    const doc = new window.DOMParser().parseFromString(xml, 'text/xml');
    const co2 = doc.querySelector('co2TailpipeGpm')?.textContent;
    const smog = doc.querySelector('smogRating')?.textContent;
    // Add more fields as needed from the emissions endpoint
    return {
      co2: co2 ? Number(co2) : null,
      smog: smog ? Number(smog) : null
    };
  } catch {
    return null;
  }
};

// --- NHTSA fallback MPG fetch helper ---
const fetchNhtsaMpgFallback = async (year, make, model) => {
  if (!year || !make || !model) return null;
  try {
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
    console.debug('[nhtsa] Fetching:', url);
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[nhtsa] Bad response:', res.status, res.statusText);
      return null;
    }
    const data = await res.json();
    // NHTSA does not provide MPG, but we can at least confirm the model exists
    if (data.Results && data.Results.length > 0) {
      const found = data.Results.find(r => r.Model_Name.toLowerCase() === String(model).trim().toLowerCase());
      if (found) {
        // No MPG, but we can return a flag that the model exists
        return { mpg: null, co2: null, smog: null, found: true };
      }
    }
    return null;
  } catch (err) {
    console.error('[nhtsa] Fetch error:', err);
    return null;
  }
};

// --- ropengov mpg API fallback helper ---
const fetchRopengovMpgAndEmissions = async (year, make, model) => {
  if (!year || !make || !model) {
    console.debug('[ropengov] Missing year/make/model:', { year, make, model });
    return null;
  }
  // Normalize make/model (trim, toLowerCase, remove extra spaces)
  const normMake = String(make).trim().toLowerCase();
  const normModel = String(model).trim().toLowerCase();
  const url = `https://mpg.ropengov.org/api/vehicles?year=${year}&make=${encodeURIComponent(normMake)}&model=${encodeURIComponent(normModel)}`;
  console.debug('[ropengov] Fetching:', url);
  try {
    const res = await fetch(url);
    console.debug('[ropengov] Response status:', res.status);
    if (!res.ok) {
      if (res.type === 'opaque') {
        // Likely a CORS/network error
        throw new Error('Network or CORS error');
      }
      console.error('[ropengov] Bad response:', res.status, res.statusText);
      return null;
    }
    const data = await res.json();
    console.debug('[ropengov] Raw data:', data);
    if (!data || !data.vehicles || !data.vehicles.length) {
      console.warn('[ropengov] No vehicles found for:', { year, normMake, normModel });
      return null;
    }
    // Use the first matching vehicle
    const v = data.vehicles[0];
    console.debug('[ropengov] Using vehicle:', v);
    return {
      mpg: v.comb08 || null,
      co2: v.co2TailpipeGpm || null,
      smog: v.smogRating || null
    };
  } catch (err) {
    console.error('[ropengov] Fetch error:', err);
    return { error: err.message || 'Failed to fetch MPG from ropengov' };
  }
};

// --- Reusable Components ---

const FormSection = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
            {icon}
            {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {children}
        </div>
    </div>
);

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
      // Only show Rebates if new vehicle (mileage <= 500)
      { label: "Trade Value", name: "tradeValue", type: "number" },
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
      { label: "Tire Fee", name: "tireFee", type: "number" },
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

// --- SteppedForm (no chained selects, only text fields + VIN lookup) ---
const SteppedForm = ({ dealData, setDealData, onGenerateOffer }) => {
  const [step, setStep] = useState(0);
  const totalSteps = steps.length;
  const [loadingMpg, setLoadingMpg] = useState(false);
  const [mpgError, setMpgError] = useState("");
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState("");
  const [userMpgSummary, setUserMpgSummary] = useState(null);
  const [vehicleId, setVehicleId] = useState(null);
  const [emissions, setEmissions] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setDealData(prevData => ({
      ...prevData,
      [name]: type === 'number' ? parseFloat(value) || 0 : type === 'checkbox' ? value : value
    }));
  };

  // VIN lookup for main vehicle
  const handleVinLookup = async () => {
    setVinLoading(true);
    setVinError("");
    const details = await fetchVinDetails(dealData.vehicleVin);
    if (details && (details.year || details.make || details.model)) {
      setDealData(prev => ({
        ...prev,
        vehicleYear: details.year || prev.vehicleYear,
        vehicleMake: details.make || prev.vehicleMake,
        vehicleModel: details.model || prev.vehicleModel,
      }));
      setLoadingMpg(true);
      setMpgError("");
      const fegVehicleId = await fetchVehicleId(
        details.year || dealData.vehicleYear,
        details.make || dealData.vehicleMake,
        details.model || dealData.vehicleModel
      );
      setVehicleId(fegVehicleId);
      let mpg = null;
      let summary = null;
      let emissionsData = null;
      if (fegVehicleId) {
        mpg = await fetchVehicleMpgById(fegVehicleId);
        summary = await fetchMyMpgSummary(fegVehicleId);
        emissionsData = await fetchVehicleEmissionsById(fegVehicleId);
      }
      // If FuelEconomy.gov fails, try ropengov
      if (!mpg || !emissionsData) {
        const ropengov = await fetchRopengovMpgAndEmissions(
          details.year || dealData.vehicleYear,
          details.make || dealData.vehicleMake,
          details.model || dealData.vehicleModel
        );
        if (ropengov && !ropengov.error) {
          if (!mpg && ropengov.mpg) mpg = ropengov.mpg;
          if (!emissionsData) emissionsData = { co2: ropengov.co2, smog: ropengov.smog };
        } else if (ropengov && ropengov.error) {
          // Try NHTSA fallback if ropengov failed due to network/CORS
          const nhtsa = await fetchNhtsaMpgFallback(
            details.year || dealData.vehicleYear,
            details.make || dealData.vehicleMake,
            details.model || dealData.vehicleModel
          );
          if (nhtsa && nhtsa.found) {
            setMpgError('Could not fetch MPG (all services failed), but vehicle/model was found in NHTSA. Please enter MPG manually.');
          } else {
            setMpgError('Could not fetch MPG (all services failed, possibly due to network or CORS error). Please enter MPG manually.');
          }
        }
      }
      if (mpg) setDealData(prev => ({ ...prev, vehicleMpg: mpg }));
      setUserMpgSummary(summary);
      setEmissions(emissionsData);
      setLoadingMpg(false);
    } else {
      setVinError("Could not decode VIN. Please check and try again.");
    }
    setVinLoading(false);
  };
  // VIN lookup for trade vehicle
  const handleTradeVinLookup = async () => {
    setVinLoading(true);
    setVinError("");
    const details = await fetchVinDetails(dealData.tradeVehicleVin);
    if (details && (details.year || details.make || details.model)) {
      setDealData(prev => ({
        ...prev,
        tradeVehicleYear: details.year || prev.tradeVehicleYear,
        tradeVehicleMake: details.make || prev.tradeVehicleMake,
        tradeVehicleModel: details.model || prev.tradeVehicleModel,
      }));
      // Fetch MPG using VehicleId if available
      setLoadingMpg(true);
      setMpgError("");
      let mpg = null;
      if (details.vehicleId) {
        mpg = await fetchVehicleMpgById(details.vehicleId);
      } else {
        const fallbackId = await fetchVehicleId(details.year || dealData.tradeVehicleYear, details.make || dealData.tradeVehicleMake, details.model || dealData.tradeVehicleModel);
        if (fallbackId) {
          mpg = await fetchVehicleMpgById(fallbackId);
        }
      }
      setLoadingMpg(false);
      if (mpg) setDealData(prev => ({ ...prev, tradeVehicleMpg: mpg }));
    } else {
      setVinError("Could not decode VIN. Please check and try again.");
    }
    setVinLoading(false);
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setMpgError("");
    setVinError("");
    if (step < totalSteps - 1) setStep(step + 1);
    else onGenerateOffer();
  };

  const handleBack = (e) => {
    e.preventDefault();
    if (step > 0) setStep(step - 1);
  };

  // For main vehicle MPG fetch (manual button)
  const handleFetchMainMpg = async () => {
    setLoadingMpg(true);
    setMpgError("");
    let mpg = null;
    let summary = null;
    let emissionsData = null;
    let fegVehicleId = vehicleId;
    if (!fegVehicleId) {
      fegVehicleId = await fetchVehicleId(dealData.vehicleYear, dealData.vehicleMake, dealData.vehicleModel);
      setVehicleId(fegVehicleId);
    }
    if (fegVehicleId) {
      mpg = await fetchVehicleMpgById(fegVehicleId);
      summary = await fetchMyMpgSummary(fegVehicleId);
      emissionsData = await fetchVehicleEmissionsById(fegVehicleId);
    }
    // If FuelEconomy.gov fails, try ropengov
    if (!mpg || !emissionsData) {
      const ropengov = await fetchRopengovMpgAndEmissions(
        dealData.vehicleYear,
        dealData.vehicleMake,
        dealData.vehicleModel
      );
      if (ropengov) {
        if (!mpg && ropengov.mpg) mpg = ropengov.mpg;
        if (!emissionsData) emissionsData = { co2: ropengov.co2, smog: ropengov.smog };
      }
    }
    if (mpg) setDealData(prev => ({ ...prev, vehicleMpg: mpg }));
    setUserMpgSummary(summary);
    setEmissions(emissionsData);
    setLoadingMpg(false);
    if (!mpg) setMpgError("Could not fetch MPG. Please enter manually.");
  };

  // Move finance table helpers/vars above return so they're always in scope
  const defaultDownPayments = [10000, 5000, 2500];
  const financeTerms = [24, 30, 36, 42, 48, 60, 66, 72, 84];
  const annualRate = 0.0599;
  const monthlyRate = annualRate / 12;
  // Use same calculation as OfferSheet
  const baseInvestment = roundToHundredth(dealData.acquisitionCost + dealData.reconditioningCost + dealData.advertisingCost + dealData.flooringCost);
  let sellingPrice;
  if (dealData.sellingPrice > 0) {
    sellingPrice = roundToHundredth(dealData.sellingPrice);
  } else {
    const roiPercentage = dealData.roiPercentage;
    sellingPrice = roundToHundredth((baseInvestment * (1 + roiPercentage / 100)) / (1 - BO_TAX_RATE));
  }
  const netTrade = roundToHundredth(dealData.tradeValue - dealData.tradePayoff);
  const totalAddons = roundToHundredth(dealData.protectionPackage + dealData.gapInsurance + dealData.serviceContract + dealData.brakePlus + dealData.safeGuard);
  let taxableAmount;
  if (dealData.tradeIsLease) {
    taxableAmount = sellingPrice + totalAddons;
  } else {
    taxableAmount = sellingPrice + totalAddons - netTrade;
  }
  const difference = roundToHundredth(taxableAmount);
  const salesTax = difference > 0 ? roundToHundredth(difference * (dealData.taxRate / 100)) : 0;
  const totalFees = roundToHundredth(dealData.docFee + dealData.titleFee + dealData.tireFee + dealData.otherFee);
  const amountFinanced = roundToHundredth(difference + salesTax + dealData.licenseEstimate + totalFees - dealData.rebates);
  function calcMonthlyPayment(principal, n) {
    if (principal <= 0 || n <= 0) return 0;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
  }

  return (
    <form className="relative max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={i} className={`flex-1 h-2 mx-1 rounded transition-all duration-500 ${i <= step ? 'bg-red-600' : 'bg-gray-200'}`}></div>
        ))}
      </div>
      {/* Step Content */}
      <div className="transition-all duration-500 ease-in-out transform" style={{ opacity: 1, translate: 'none' }}>
        {/* Show Down Payment Options Table and Finance Options fields together on last step */}
        {step === steps.length - 1 && (
          <div className="col-span-2 mb-8">
            <h4 className="font-semibold mb-4 text-lg text-gray-900 flex items-center"><Coins className="h-5 w-5 mr-2 text-red-600" />Down Payment Options & Monthly Payments</h4>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="px-4 py-3 border-b text-center font-semibold">Down Payment</th>
                    <th className="px-4 py-3 border-b text-center font-semibold">Term</th>
                    <th className="px-4 py-3 border-b text-right font-semibold">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {defaultDownPayments.map(dp => financeTerms.map((term, idx) => {
                    const principal = amountFinanced - dp;
                    return (
                      <tr key={dp + '-' + term} className={idx === 0 ? 'border-t' : ''}>
                        {idx === 0 && (
                          <td rowSpan={financeTerms.length} className="font-bold align-middle text-center bg-gray-50 border-r border-gray-200 text-gray-900">{formatCurrency(dp)}</td>
                        )}
                        <td className="text-center text-gray-700">{term}</td>
                        <td className="text-right font-mono text-gray-800">{formatCurrency(calcMonthlyPayment(principal, term))}</td>
                      </tr>
                    );
                  }))}
                  {/* Custom down payment if not in default list and > 0 */}
                  {!defaultDownPayments.includes(Number(dealData.downPayment)) && Number(dealData.downPayment) > 0 && financeTerms.map((term, idx) => {
                    const principal = amountFinanced - Number(dealData.downPayment);
                    return (
                      <tr key={'custom-' + term} className={idx === 0 ? 'border-t' : ''}>
                        {idx === 0 && (
                          <td rowSpan={financeTerms.length} className="font-bold align-middle text-center bg-yellow-100 border-r border-yellow-300 text-yellow-900">{formatCurrency(Number(dealData.downPayment))} <span className="text-xs font-normal">(Custom)</span></td>
                        )}
                        <td className="text-center text-gray-700">{term}</td>
                        <td className="text-right font-mono text-gray-800">{formatCurrency(calcMonthlyPayment(principal, term))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-gray-500 mt-2">Payments based on {formatCurrency(amountFinanced)} financed, 5.99% APR. Actual rates may vary.</div>
          </div>
        )}
        {/* Finance Options fields on last step */}
        <FormSection title={steps[step].title} icon={steps[step].icon}>
          {steps[step].fields.filter(field => !field.showIf || field.showIf(dealData)).map(field => (
            <div key={field.name} className="relative">
              <InputField
                label={field.label}
                name={field.name}
                value={dealData[field.name] || ''}
                onChange={handleChange}
                type={field.type}
                helpText={field.helpText}
                options={field.options}
              />
            </div>
          ))}
        </FormSection>
        {/* Show My MPG summary for main vehicle */}
        {step === 1 && userMpgSummary && (
          <div className="col-span-2 mt-2 text-sm text-gray-700 bg-gray-50 rounded p-3 border border-gray-200">
            <strong>User Reported MPG:</strong> {userMpgSummary.avgMpg} MPG (from {userMpgSummary.numUsers} drivers)
          </div>
        )}
        {/* Show Emissions for main vehicle */}
        {step === 1 && emissions && (
          <div className="col-span-2 mt-2 text-sm text-gray-700 bg-gray-50 rounded p-3 border border-gray-200">
            <strong>Emissions:</strong> {emissions.co2 ? `${emissions.co2} g CO₂/mile` : 'N/A'}{emissions.smog ? `, Smog Rating: ${emissions.smog}/10` : ''}
          </div>
        )}
        {(mpgError || vinError) && <p className="text-xs text-red-600 mt-2">{mpgError || vinError}</p>}
      </div>
      {/* Navigation Buttons */}
      <div className="flex justify-between pt-8">
        <button type="button" onClick={handleBack} disabled={step === 0} className={`px-6 py-3 rounded-lg font-bold shadow transition-all duration-300 ${step === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-700'}`}>Back</button>
        <button type="submit" onClick={handleNext} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-300">
          {step === totalSteps - 1 ? 'Review Offer' : 'Next'}
        </button>
      </div>
    </form>
  );
};


// --- Page 2: Offer Sheet ---

const OfferSheet = ({ dealData, onGoBack }) => {

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

    const netTrade = roundToHundredth(dealData.tradeValue - dealData.tradePayoff);
    const totalAddons = roundToHundredth(dealData.protectionPackage + dealData.gapInsurance + dealData.serviceContract + dealData.brakePlus + dealData.safeGuard);
    
    // If trade-in is a lease, tax is on full selling price + add-ons (no trade deduction)
    let taxableAmount;
    if (dealData.tradeIsLease) {
        taxableAmount = sellingPrice + totalAddons;
    } else {
        taxableAmount = sellingPrice + totalAddons - netTrade;
    }
    const difference = roundToHundredth(taxableAmount);
    
    const salesTax = difference > 0 ? roundToHundredth(difference * (dealData.taxRate / 100)) : 0;

    const totalFees = roundToHundredth(dealData.docFee + dealData.titleFee + dealData.tireFee + dealData.otherFee);
    
    // Remove tax credit from calculations
    const amountFinanced = roundToHundredth(difference + salesTax + dealData.licenseEstimate + totalFees - dealData.rebates);

    // Finance options
    const defaultDownPayments = [10000, 5000, 2500];
    const financeTerms = [24, 30, 36, 42, 48, 60, 66, 72, 84];
    const annualRate = 0.0599; // 5.99% APR
    const monthlyRate = annualRate / 12;
    // Helper to calc monthly payment
    function calcMonthlyPayment(principal, n) {
      if (principal <= 0 || n <= 0) return 0;
      return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
    }
    // Helper to format row
    function renderFinanceRows(downPayment) {
      const principal = amountFinanced - downPayment;
      return financeTerms.map((term, idx) => (
        <tr key={term} className={idx === 0 ? 'border-t' : ''}>
          {idx === 0 && (
            <td rowSpan={financeTerms.length} className="font-bold align-middle text-center bg-gray-50">{formatCurrency(downPayment)}</td>
          )}
          <td className="text-center">{term}</td>
          <td className="text-right font-mono">{formatCurrency(calcMonthlyPayment(principal, term))}</td>
        </tr>
      ));
    }
    // Custom down payment
    const customDown = dealData.downPayment;
    const showCustom = !defaultDownPayments.includes(Number(customDown)) && Number(customDown) > 0;

    const sunsetExclusives = [
        { icon: <ShieldCheck className="h-8 w-8 text-red-600" />, title: 'Warranty Protection for Life', description: 'A lifetime limited powertrain warranty honored at any ASE certified facility in the US and Canada.' },
        { icon: <Wrench className="h-8 w-8 text-red-600" />, title: 'Oil Changes for Life', description: 'Save thousands over the lifetime of your vehicle with complimentary oil changes.' }
    ];

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8 printable-section">
                 <div className="flex justify-between items-start">
                    <div>
                        <div className="uppercase tracking-wide text-sm text-red-600 font-semibold">{dealData.vehicleYear} {dealData.vehicleMake}</div>
                        <h2 className="block mt-1 text-3xl leading-tight font-extrabold text-black">{dealData.vehicleModel}</h2>
                        <p className="mt-2 text-gray-500">VIN: {dealData.vehicleVin} | Stock: {dealData.vehicleStock}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg text-gray-700">Prepared for:</p>
                       <p className="text-xl font-bold">{dealData.buyerFirstName} {dealData.buyerLastName}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 p-8 rounded-xl shadow-lg printable-section">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Pricing Transparency</h3>
                <div className="space-y-3 text-gray-700 max-w-2xl mx-auto">
                    <div className="flex justify-between text-lg"><p>Market Value</p><p className="font-semibold">{formatCurrency(dealData.marketValue)}</p></div>
                    <hr className="my-2 border-gray-200"/>
                    <div className="flex justify-between text-sm"><p>Acquisition & Reconditioning</p><p>{formatCurrency(dealData.acquisitionCost + dealData.reconditioningCost)}</p></div>
                    <div className="flex justify-between text-sm"><p>Advertising & Flooring</p><p>{formatCurrency(dealData.advertisingCost + dealData.flooringCost)}</p></div>
                    <div className="flex justify-between text-sm"><p>B&O Tax (Calculated)</p><p>{formatCurrency(roundToHundredth(sellingPrice * BO_TAX_RATE))}</p></div>
                    <div className="flex justify-between border-t border-gray-300 pt-3 mt-3"><p className="font-semibold">Total Dealership Investment</p><p className="font-bold">{formatCurrency(roundToHundredth(baseInvestment + (sellingPrice * BO_TAX_RATE)))}</p></div>
                    <div className="flex justify-between"><p>Dealership ROI ({roiPercentage}%)</p><p className="font-medium">{formatCurrency(profit)}</p></div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-inner mt-3">
                        <p className="text-lg font-bold text-gray-900">Final Selling Price</p>
                        <p className="text-xl font-bold text-red-600">{formatCurrency(sellingPrice)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl shadow-lg printable-section">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center"><Coins className="h-6 w-6 mr-3 text-red-600" />Final Offer Calculation</h3>
                <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between"><p>Final Selling Price</p><p className="font-medium">{formatCurrency(sellingPrice)}</p></div>
                    <div className="flex justify-between text-sm"><p>Brake Plus</p><p>{formatCurrency(dealData.brakePlus)}</p></div>
                    <div className="flex justify-between text-sm"><p>Safe Guard</p><p>{formatCurrency(dealData.safeGuard)}</p></div>
                    <div className="flex justify-between text-sm"><p>Other Add-ons</p><p>{formatCurrency(dealData.protectionPackage + dealData.gapInsurance + dealData.serviceContract)}</p></div>
                    <hr className="my-2"/>
                    <div className="flex justify-between"><p>Trade Value</p><p>{formatCurrency(dealData.tradeValue)}</p></div>
                    <div className="flex justify-between text-sm"><p>Trade Payoff</p><p>({formatCurrency(dealData.tradePayoff)})</p></div>
                    <div className="flex justify-between text-sm font-semibold"><p>Net Trade</p><p>{formatCurrency(netTrade)}</p></div>
                    <div className="flex justify-between items-center border-t-2 border-gray-300 pt-4 mt-4">
                        <p className="text-lg font-bold text-gray-900">Difference</p>
                        <p className="text-xl font-bold text-gray-800">{formatCurrency(difference)}</p>
                    </div>
                    <hr className="my-2"/>
                    <div className="flex justify-between text-sm text-red-600">
                      {dealData.isNewVehicle && <><p>Rebates</p><p>({formatCurrency(dealData.rebates)})</p></>}
                    </div>
                    <div className="flex justify-between"><p>Sales Tax ({dealData.taxRate}%)</p><p className="font-medium">{formatCurrency(salesTax)}</p></div>
                    <div className="flex justify-between"><p>License Estimate</p><p className="font-medium">{formatCurrency(dealData.licenseEstimate)}</p></div>
                    <div className="flex justify-between"><p>Doc Fee</p><p className="font-medium">{formatCurrency(dealData.docFee)}</p></div>
                    <div className="flex justify-between"><p>Other Fees (Title, Tire, etc.)</p><p className="font-medium">{formatCurrency(dealData.titleFee + dealData.tireFee + dealData.otherFee)}</p></div>
                    <div className="flex justify-between items-center border-t-2 border-red-500 pt-4 mt-4">
                        <p className="text-xl font-bold text-gray-900">Amount Financed</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(amountFinanced)}</p>
                    </div>
                    <hr className="my-4" />
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-inner mt-3">
                        <p className="text-lg font-bold text-gray-900">Finance Options</p>
                        <p className="text-sm text-gray-700">{dealData.financeTerm} months @ 5.99% APR</p>
                    </div>
                    <div className="flex justify-between"><p>Down Payment</p><p>{formatCurrency(dealData.downPayment)}</p></div>
                    {/* Remove old single finance summary (principal/monthlyPayment) since table is now shown above */}
                    {/* <div className="flex justify-between"><p>Amount Financed</p><p>{formatCurrency(principal)}</p></div> */}
                    {/* <div className="flex justify-between"><p>Estimated Monthly Payment</p><p className="font-bold text-red-600">{formatCurrency(monthlyPayment)}</p></div> */}
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

            <div className="flex justify-center pt-4 space-x-4 no-print">
                <button onClick={onGoBack} className="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300">
                    Go Back & Edit
                </button>
                <button onClick={() => window.print()} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-300 flex items-center">
                    <Printer className="h-5 w-5 mr-2" />
                    Print Offer
                </button>
            </div>
        </div>
    );
};

// --- Main App Component ---

export default function App() {
    const [page, setPage] = useState('form'); // 'form' or 'offer'
    const [dealData, setDealData] = useState(initialDealData);

    const logoUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe20azLghiq6B4uoUgyV5A_j5zjglEyeNF9g&s";

    const printStyles = `
        @media print {
          body {
            background-color: #fff !important;
          }
          .no-print {
            display: none !important;
          }
          main.container {
            padding: 0 !important;
            margin: 0.5in !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .printable-section {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
            background-color: #fff !important;
            page-break-inside: avoid;
          }
          .bg-red-50, .bg-gray-50 {
             background-color: #fff !important;
             -webkit-print-color-adjust: exact;
             color-adjust: exact;
          }
          .text-red-600 {
              color: #dc2626 !important;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
          }
        }
    `;

    const handleGenerateOffer = () => {
        setPage('offer');
        window.scrollTo(0, 0); // Scroll to top when page changes
    };

    const handleGoBack = () => {
        setPage('form');
        window.scrollTo(0, 0);
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <style>{printStyles}</style>
            <header className="bg-black text-white p-4 shadow-lg sticky top-0 z-10 no-print">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <img src={logoUrl} alt="Sunset Chevrolet Logo" className="h-12" />
                    </div>
                    <p className="text-sm text-gray-300">{page === 'form' ? 'Deal Configuration' : 'Customer Offer Sheet'}</p>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {page === 'form' ? (
                    <SteppedForm dealData={dealData} setDealData={setDealData} onGenerateOffer={handleGenerateOffer} />
                ) : (
                    <OfferSheet dealData={dealData} onGoBack={handleGoBack} />
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
