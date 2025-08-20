import React, { useEffect } from 'react';
import FormSection from '../components/FormSection';
import { useAppStore } from '../store';

export default function PricingStep() {
  const { dealData, updateDealData, settings, updateSettings } = useAppStore();

  useEffect(() => {
    if (settings.roiPercentage === undefined || settings.roiPercentage === null || settings.roiPercentage === '') {
      updateSettings({ roiPercentage: 5 });
    }
    // eslint-disable-next-line
  }, []);

  const handleRoiChange = (e) => {
    const raw = e.target.value;
    const value = raw === '' ? '' : parseFloat(raw);
    updateSettings({ roiPercentage: value });

    // Calculate selling price from ROI and update dealData
    const BO_TAX_RATE = 0.00471;
    const roundToHundredth = (num) => Math.round((num + Number.EPSILON) * 100) / 100;
    const baseInvestment = roundToHundredth(
      Number(dealData.acquisitionCost || 0) +
      Number(dealData.reconditioningCost || 0) +
      Number(dealData.advertisingCost || 0) +
      Number(dealData.flooringCost || 0)
    );
    const roi = (typeof value === 'number' && !isNaN(value)) ? value : 5;
    let sellingPrice = (baseInvestment * (1 + roi / 100)) / (1 - BO_TAX_RATE);
    sellingPrice = Math.ceil(sellingPrice);
    updateDealData({ sellingPrice });
  };

  useEffect(() => {
    const roiIsNumber = typeof settings.roiPercentage === 'number' && !isNaN(settings.roiPercentage);
    if ((!dealData.sellingPrice || dealData.sellingPrice === 0) && roiIsNumber) {
      handleRoiChange({ target: { value: settings.roiPercentage } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.roiPercentage, dealData.sellingPrice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateDealData({ [name]: value });
  };

  return (
    <FormSection title="Pricing & Profitability" icon={null}>
      <div>
        <label className="block text-sm font-medium text-gray-700">Selling Price</label>
        <input type="number" name="sellingPrice" value={dealData.sellingPrice || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">ROI Percentage (%)</label>
        <input 
          type="number" 
          name="roiPercentage" 
          // 👇 4. FIX: Use `?? ''` to correctly handle the number 0.
          // This displays an empty string only if the value is null/undefined, allowing 0 to be shown.
          value={settings.roiPercentage ?? ''} 
          onChange={handleRoiChange} 
          step="any" 
          className="block w-full rounded-md border-gray-300 shadow-sm p-2" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Market Value</label>
        <input type="number" name="marketValue" value={dealData.marketValue || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Acquisition Cost</label>
        <input type="number" name="acquisitionCost" value={dealData.acquisitionCost || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Reconditioning Cost</label>
        <input type="number" name="reconditioningCost" value={dealData.reconditioningCost || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Advertising Cost</label>
        <input type="number" name="advertisingCost" value={675} readOnly className="block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-100 font-bold" />
        <div className="text-xs text-gray-600 mt-1">This is a national average advertising cost.</div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Flooring Cost</label>
        <input
          type="number"
          name="flooringCost"
          value={dealData.acquisitionCost ? (Number(dealData.acquisitionCost) * 0.00667 * 1.5).toFixed(2) : ''}
          readOnly
          className="block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-100 font-bold"
        />
        <div className="text-xs text-gray-600 mt-1">6.67% × 1.5 of Adjusted Acquisition Cost</div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Is this a new vehicle?</label>
        <input type="checkbox" name="isNewVehicle" checked={!!dealData.isNewVehicle} onChange={handleChange} className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
      </div>
      {dealData.isNewVehicle && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Rebates</label>
          <input type="number" name="rebates" value={dealData.rebates || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
        </div>
      )}
    </FormSection>
  );
}