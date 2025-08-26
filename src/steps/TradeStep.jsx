import React, { useState, useRef, useEffect } from 'react';

import { useAppStore } from '../store';
import { useRef as useReactRef } from 'react';

// --- Helper Functions and Components (Included for standalone functionality) ---

/**
 * A simple debounce function to delay execution of a function until after a certain time has passed
 * without it being called. This prevents the handleChange function from being called on every keystroke.
 * @param {Function} func The function to debounce.
 * @param {number} delay The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

/**
 * Placeholder for the FormSection component. In a real app, this would be in a separate file.
 * It's a simple wrapper to structure the form sections.
 * @param {{title: string, children: React.ReactNode}} props The component props.
 * @returns {JSX.Element}
 */
const FormSection = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  </div>
);


// Helper for formatting currency
const formatCurrency = (amount) => {
  const number = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(number);
};

// --- VIN and MPG lookup helpers (unchanged) ---
async function fetchVinDetails(vin) {
  if (!vin || vin.length < 11) return {};
  try {
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
    const data = await res.json();
    const results = data.Results || [];
    const year = results.find(r => r.Variable === 'Model Year')?.Value;
    const make = results.find(r => r.Variable === 'Make')?.Value;
    const model = results.find(r => r.Variable === 'Model')?.Value;
    const trim = results.find(r => r.Variable === 'Trim')?.Value || results.find(r => r.Variable === 'Series')?.Value;
    return { year, make, model, trim };
  } catch {
    return {};
  }
}

async function fetchVehicleId(year, make, model) {
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
}

async function fetchVehicleMpgById(vehicleId) {
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
}

export default function TradeStep() {

  const { dealData, updateDealData, setDealData } = useAppStore();

  // Get the default trade state from the store's initialDealData
  // We use a ref to avoid re-importing the whole store (circular dep)
  const defaultDealDataRef = useReactRef();
  if (!defaultDealDataRef.current) {
    // This is a hacky way to get the default from the store file without import loops
    defaultDealDataRef.current = {
      hasTrade: false,
      tradeVehicleVin: '',
      tradeMarketValue: '',
      tradePayOff: '',
      tradeValue: '',
      tradeDevalueSelected: [],
      tradeVehicleYear: '',
      tradeVehicleMake: '',
      tradeVehicleModel: '',
      tradeVehicleTrim: '',
      tradePayment: '',
      tradeVehicleMpg: '',
      tradeIsLease: false,
      tradeMPG: '',
      tradeMarketValueInput: '',
    };
  }
  const defaultTradeFields = defaultDealDataRef.current;

  // Always initialize hasTrade from dealData.hasTrade (store default)
  const [hasTrade, setHasTrade] = useState(typeof dealData.hasTrade === 'boolean' ? dealData.hasTrade : defaultTradeFields.hasTrade);

  // Sync hasTrade to store

  // Sync hasTrade to store and reset trade fields if toggled off
  useEffect(() => {
    if (dealData.hasTrade !== hasTrade) {
      if (!hasTrade) {
        // Reset all trade fields to default values from store
        updateDealData({ ...defaultTradeFields, hasTrade: false });
      } else {
        updateDealData({ hasTrade: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTrade]);
  // --- Component State ---
  const [vinInput, setVinInput] = useState(dealData.tradeVehicleVin || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [marketValueInput, setMarketValueInput] = useState(dealData.tradeMarketValue || '');
  const [customDevalueLabel, setCustomDevalueLabel] = useState('');
  const [customDevaluePrice, setCustomDevaluePrice] = useState('');
  const [payOffInput, setPayOffInput] = useState(dealData.tradePayOff || '');
  // Local state for devalue items to ensure UI updates immediately
  // Provide sensible defaults if nothing in localStorage
  const defaultDevalueItems = [
    { label: 'Excess Wear', price: 500 },
    { label: 'Tires', price: 600 },
    { label: 'Windshield', price: 400 },
    { label: 'Brakes', price: 350 },
    { label: 'Detail/Reconditioning', price: 250 },
  ];
  const [localDevalueItems, setLocalDevalueItems] = useState(() => {
    // Try to load from localStorage, else use defaults
    try {
      const settings = JSON.parse(localStorage.getItem('offerSheetSettings') || '{}');
      if (Array.isArray(settings.tradeDevalueItems) && settings.tradeDevalueItems.length > 0) {
        return settings.tradeDevalueItems;
      }
    } catch {
      // Ignore JSON parse errors and use default devalue items
    }
    return defaultDevalueItems;
  });

  // Sync localDevalueItems with settings/tradeDevalueItems if they change externally
  // If you want to sync with global settings, you can add logic here
  // For now, keep localDevalueItems independent

  // --- Debounced Handlers ---
  const debouncedMarketValue = useRef(debounce((value) => updateDealData({ tradeMarketValue: value }), 500)).current;
  // debouncedManualDevalue removed (unused)
  const debouncedPayOff = useRef(debounce((value) => updateDealData({ tradePayOff: value }), 500)).current;

  // --- Core Calculations ---
  // 1. Calculate sum of selected devalue items
  const devalueCheckboxSum = dealData.tradeDevalueSelected?.reduce((sum, idx) => sum + (localDevalueItems?.[idx]?.price || 0), 0) || 0;

  // 2. Get numeric values from LOCAL STATE for immediate feedback, defaulting to 0
  const marketValue = Number(marketValueInput) || 0;
  // manualDevalue removed (unused)
  const tradePayOff = Number(payOffInput) || 0;

  // 3. Calculate the Actual Cash Value (ACV) of the trade
  const netTradeValue = Math.max(0, marketValue - devalueCheckboxSum);
  
  // 4. Calculate the final Net Trade Equity
  const netTradeEquity = netTradeValue - tradePayOff;

  // --- Effect to sync calculated ACV back to parent state ---
  useEffect(() => {
    // This effect ensures the final calculated value is sent to the parent.
    // It only triggers when the calculated netTradeValue changes.
    if (Number(dealData.tradeValue) !== netTradeValue && !isNaN(netTradeValue)) {
      updateDealData({ tradeValue: netTradeValue });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [netTradeValue]);

  // Handler for devalue item selection
  const handleDevalueItemsChange = (arr) => {
    updateDealData({ tradeDevalueSelected: arr });
  };

  // VIN lookup logic
  const handleVinLookup = async () => {
    setLoading(true);
    setError('');
    const details = await fetchVinDetails(vinInput);
    if (details && (details.year || details.make || details.model)) {
      if (details.year) updateDealData({ tradeVehicleYear: details.year });
      if (details.make) updateDealData({ tradeVehicleMake: details.make });
      if (details.model) updateDealData({ tradeVehicleModel: details.model });
      if (details.trim) updateDealData({ tradeVehicleTrim: details.trim });
      updateDealData({ tradeVehicleVin: vinInput });
      let { year, make, model } = details;
      if (year && make && model) {
        const fegVehicleId = await fetchVehicleId(year, make, model);
        const mpg = fegVehicleId ? await fetchVehicleMpgById(fegVehicleId) : null;
        updateDealData({ tradeMPG: mpg ?? 0 });
        if (mpg === null) {
          setError('Could not find MPG for this VIN. Please enter it manually.');
        }
      }
    } else {
      setError('VIN not found or incomplete.');
    }
    setLoading(false);
  };

  // Master handler for most field changes
  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    switch (name) {
      case 'tradeVehicleVin':
        setVinInput(val);
        break;
      case 'tradeMarketValue':
        setMarketValueInput(val);
        debouncedMarketValue(val);
        break;
      case 'tradePayOff':
        setPayOffInput(val);
        debouncedPayOff(val);
        break;
      default:
        updateDealData({ [name]: val });
    }
  };

  return (
    <FormSection title="Customer Allowances & Trade">
      <div className="col-span-full mb-4">
        <label className="flex items-center gap-3 text-base font-semibold cursor-pointer select-none">
          <span>Is there a trade?</span>
          <span className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              checked={hasTrade}
              onChange={e => {
                setHasTrade(e.target.checked);
                if (!e.target.checked) {
                  // Reset all local trade-related state to defaults
                  setVinInput('');
                  setMarketValueInput('');
                  setPayOffInput('');
                  setCustomDevalueLabel('');
                  setCustomDevaluePrice('');
                  setError('');
                }
              }}
              className="sr-only peer"
            />
            <span className="block w-12 h-7 bg-gray-300 rounded-full shadow-inner peer-checked:bg-red-500 transition" />
            <span className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition peer-checked:translate-x-5 shadow" />
          </span>
        </label>
      </div>
      {hasTrade && (
        <>
          {/* Improved summary section */}
          <div className="col-span-full mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 text-white rounded-lg p-4 text-center shadow-lg">
              <div className="text-sm font-semibold text-gray-400">Total Trade Value (ACV)</div>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(netTradeValue)}</div>
            </div>
            <div className={`rounded-lg p-4 text-center shadow-lg ${netTradeEquity >= 0 ? 'bg-blue-800' : 'bg-red-800'} text-white`}>
              <div className="text-sm font-semibold text-gray-300">Net Trade Equity</div>
              <div className="text-2xl font-bold">{formatCurrency(netTradeEquity)}</div>
            </div>
          </div>

          {/* Trade Devalue Items Section with Add Custom */}
          <div className="col-span-full mb-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Trade Devalue Items</label>
            <div className="flex flex-wrap gap-4 mb-2">
              {localDevalueItems && localDevalueItems.map((item, idx) => (
                <label key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded shadow-sm">
                  <input
                    type="checkbox"
                    checked={dealData.tradeDevalueSelected?.includes(idx)}
                    onChange={e => {
                      const currentSelected = dealData.tradeDevalueSelected || [];
                      const newSelected = e.target.checked ? [...currentSelected, idx] : currentSelected.filter(i => i !== idx);
                      handleDevalueItemsChange(newSelected);
                    }}
                  />
                  <span>{item.label} <span className="text-gray-500">({formatCurrency(item.price)})</span></span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <input
                type="text"
                className="border rounded p-2 flex-1"
                placeholder="Custom devalue label"
                value={customDevalueLabel}
                onChange={e => setCustomDevalueLabel(e.target.value)}
              />
              <input
                type="number"
                className="border rounded p-2 w-24"
                placeholder="Price"
                value={customDevaluePrice}
                onChange={e => setCustomDevaluePrice(e.target.value)}
              />
              <button
                type="button"
                className="bg-red-600 text-white px-3 py-2 rounded"
                onClick={() => {
                  if (!customDevalueLabel.trim() || isNaN(Number(customDevaluePrice))) return;
                  const newItem = { label: customDevalueLabel.trim(), price: Number(customDevaluePrice) };
                  const newIdx = localDevalueItems.length;
                  // Always update localStorage
                  let offerSheetSettings = {};
                  try {
                    offerSheetSettings = JSON.parse(localStorage.getItem('offerSheetSettings') || '{}');
                  } catch { /* ignore */ }
                  const updatedItems = [...localDevalueItems, newItem];
                  offerSheetSettings.tradeDevalueItems = updatedItems;
                  localStorage.setItem('offerSheetSettings', JSON.stringify(offerSheetSettings));
                  setLocalDevalueItems(updatedItems); // Always update local state for immediate UI
                  handleDevalueItemsChange([...(dealData.tradeDevalueSelected || []), newIdx]);
                  setCustomDevalueLabel('');
                  setCustomDevaluePrice('');
                }}
              >Add</button>
            </div>
          </div>

          {/* VIN Section */}
          <div className="col-span-full flex flex-col gap-2 mb-2">
             <div className="flex-1">
              <label htmlFor="tradeVehicleVin" className="block text-sm font-medium text-gray-700">Trade VIN</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="tradeVehicleVin"
                  name="tradeVehicleVin"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2"
                  value={vinInput}
                  onChange={handleFieldChange}
                  placeholder="Enter Trade VIN..."
                />
                <button
                  type="button"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400"
                  onClick={handleVinLookup}
                  disabled={loading || vinInput.length < 11}
                >
                  {loading ? '...' : 'Lookup'}
                </button>
              </div>
            </div>
          </div>
          {error && <div className="col-span-full text-red-600 text-sm -mt-2 mb-2">{error}</div>}

          {/* Vehicle Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input type="number" name="tradeVehicleYear" value={dealData.tradeVehicleYear || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Make</label>
            <input type="text" name="tradeVehicleMake" value={dealData.tradeVehicleMake || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input type="text" name="tradeVehicleModel" value={dealData.tradeVehicleModel || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trim / Series</label>
            <input type="text" name="tradeVehicleTrim" value={dealData.tradeVehicleTrim || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="e.g. LT, XLT, etc." />
          </div>
          {/* Financial Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Market Value</label>
            <input type="number" name="tradeMarketValue" value={marketValueInput} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trade Pay Off</label>
            <input type="number" name="tradePayOff" value={payOffInput} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="Amount owed on trade" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Devalue Total</label>
            <input type="number" value={devalueCheckboxSum} readOnly className="block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-100 font-bold" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trade Value (ACV)</label>
            <input type="number" name="tradeValue" value={netTradeValue} readOnly className="block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-100 font-bold" />
          </div>
          {/* Other Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment</label>
            <input type="number" name="tradePayment" value={dealData.tradePayment || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">MPG</label>
            <input type="number" name="tradeVehicleMpg" value={dealData.tradeVehicleMpg || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mt-2">
              <input type="checkbox" name="tradeLease" checked={!!dealData.tradeLease} onChange={handleFieldChange} className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 mr-2" />
              Is this a Lease?
            </label>
          </div>
        </>
      )}
    </FormSection>
  );
}
