import React, { useState } from 'react';
import { useAppStore } from '../store';
import FormSection from '../components/FormSection';

export default function VehicleInfoStep() {
  const { dealData, updateDealData } = useAppStore();
  const [vinInput, setVinInput] = useState(dealData.vehicleVin || '');
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState("");

  // Helper functions for VIN/MPG lookup
  async function fetchVinDetails(vin) {
    if (!vin || vin.length < 5) return {};
    try {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
      const data = await res.json();
      const results = data.Results || [];
      const year = results.find(r => r.Variable === 'Model Year')?.Value;
      const make = results.find(r => r.Variable === 'Make')?.Value;
      const model = results.find(r => r.Variable === 'Model')?.Value;
      const trim = results.find(r => r.Variable === 'Trim')?.Value || results.find(r => r.Variable === 'Series')?.Value;
      const vehicleId = results.find(r => r.Variable === 'Vehicle ID')?.Value;
      return { year, make, model, trim, vehicleId };
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

  // VIN lookup handler
  const handleVinLookup = async () => {
    setVinLoading(true);
    setVinError("");
    try {
      const details = await fetchVinDetails(vinInput);
      if (details && (details.year || details.make || details.model)) {
        let year = (details.year || dealData.vehicleYear || '').toString().trim();
        let make = (details.make || dealData.vehicleMake || '').toString().trim();
        let model = (details.model || dealData.vehicleModel || '').toString().trim();
        let trim = (details.trim || dealData.vehicleTrim || '').toString().trim();
        updateDealData({
          vehicleVin: vinInput,
          vehicleYear: year,
          vehicleMake: make,
          vehicleModel: model,
          vehicleTrim: trim,
        });
        // Try to fetch MPG
        if (year && make && model) {
          const fegVehicleId = await fetchVehicleId(year, make, model);
          let mpg = null;
          if (fegVehicleId) {
            mpg = await fetchVehicleMpgById(fegVehicleId);
          }
          if (mpg !== null && mpg !== undefined) {
            updateDealData({ vehicleMpg: mpg });
          } else {
            updateDealData({ vehicleMpg: 0 });
            alert('Could not find MPG for this VIN. Please enter it manually.');
          }
        }
      } else {
        setVinError("Could not decode VIN. Please check and try again.");
      }
    } finally {
      setVinLoading(false);
    }
  };

  // Field change handler
  const handleFieldChange = (e) => {
    if (e.target.name === 'vehicleVin') {
      setVinInput(e.target.value);
    } else {
      const { name, value, type, checked } = e.target;
      updateDealData({ [name]: type === 'checkbox' ? checked : value });
    }
  };
// (Removed duplicate and legacy setDealData code. All logic now uses updateDealData and Zustand.)

  return (
    <FormSection title="Vehicle of Interest" icon={null}>
      <div className="col-span-2 flex flex-col gap-2 mb-2">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 mb-1"
            onClick={handleVinLookup}
            disabled={vinLoading || !vinInput || vinInput.length < 5}
          >
            {vinLoading ? 'Looking up...' : 'Lookup VIN'}
          </button>
          <label className="flex items-center gap-2 text-sm font-medium select-none cursor-pointer">
            <span className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
              <input
                type="checkbox"
                name="wpfl"
                checked={dealData.wpfl ?? true}
                onChange={handleFieldChange}
                className="sr-only peer"
              />
              <span className="block w-10 h-6 bg-gray-300 rounded-full shadow-inner peer-checked:bg-blue-600 transition" />
              <span className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-4 shadow" />
            </span>
            WPFL
          </label>
          <label className="flex items-center gap-2 text-sm font-medium select-none cursor-pointer">
            <span className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
              <input
                type="checkbox"
                name="ocfl"
                checked={dealData.ocfl ?? true}
                onChange={handleFieldChange}
                className="sr-only peer"
              />
              <span className="block w-10 h-6 bg-gray-300 rounded-full shadow-inner peer-checked:bg-blue-600 transition" />
              <span className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-4 shadow" />
            </span>
            OCFL
          </label>
        </div>
        <div className="flex-1">
          <label htmlFor="vehicleVin" className="block text-sm font-medium text-gray-700">VIN</label>
          <input
            type="text"
            id="vehicleVin"
            name="vehicleVin"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2"
            value={vinInput}
            onChange={handleFieldChange}
            placeholder="Enter VIN..."
          />
        </div>
      </div>
      {vinError && <div className="col-span-2 text-red-600 text-sm mt-2">{vinError}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700">Year</label>
        <input type="number" name="vehicleYear" value={dealData.vehicleYear || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Make</label>
        <input type="text" name="vehicleMake" value={dealData.vehicleMake || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Model</label>
        <input type="text" name="vehicleModel" value={dealData.vehicleModel || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Trim / Series</label>
        <input type="text" name="vehicleTrim" value={dealData.vehicleTrim || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="e.g. LT, XLT, Laramie, etc." />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Stock #</label>
        <input type="text" name="vehicleStock" value={dealData.vehicleStock || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Color</label>
        <input type="text" name="vehicleColor" value={dealData.vehicleColor || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Mileage</label>
        <input type="number" name="vehicleMileage" value={dealData.vehicleMileage || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Fuel Economy (MPG)</label>
        <input type="number" name="vehicleMpg" value={dealData.vehicleMpg || ''} onChange={handleFieldChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
        <span className="text-xs text-gray-500">Auto-filled from VIN or enter manually.</span>
      </div>
    </FormSection>
  );
}
