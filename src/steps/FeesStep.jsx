import React from 'react';
import FormSection from '../components/FormSection';
import { useAppStore } from '../store';

export default function FeesStep() {
  const { dealData, updateDealData } = useAppStore();
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    updateDealData({ [name]: type === 'checkbox' ? checked : value });
  };
  return (
    <FormSection title="Fees & Taxes" icon={null}>
      <div>
        <label className="block text-sm font-medium text-gray-700">Doc Fee</label>
        <input type="number" name="docFee" value={dealData.docFee || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">License Estimate</label>
        <input type="number" name="licenseEstimate" value={dealData.licenseEstimate || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Title Fee</label>
        <input type="number" name="titleFee" value={dealData.titleFee || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Other Fees</label>
        <input type="number" name="otherFee" value={dealData.otherFee || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
        <input type="number" name="taxRate" value={dealData.taxRate || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div className="mt-6 col-span-2 w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Visibility Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200">
            <span className="text-sm font-medium text-gray-700">Show License Fee on Offer Sheet</span>
            <label htmlFor="showLicenseFeeToggle" className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="showLicenseFeeToggle"
                name="showLicenseFeeOnOfferSheet"
                className="sr-only peer"
                checked={!!dealData.showLicenseFeeOnOfferSheet}
                onChange={handleChange}
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-blue-500 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200">
            <span className="text-sm font-medium text-gray-700">Show Tax Rate on Offer Sheet</span>
            <label htmlFor="showTaxRateToggle" className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="showTaxRateToggle"
                name="showTaxRateOnOfferSheet"
                className="sr-only peer"
                checked={!!dealData.showTaxRateOnOfferSheet}
                onChange={handleChange}
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-blue-500 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
