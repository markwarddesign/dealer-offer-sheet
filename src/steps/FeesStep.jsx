
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
      <div className="mt-4 flex flex-col gap-2">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="showLicenseFeeOnOfferSheet"
            checked={!!dealData.showLicenseFeeOnOfferSheet}
            onChange={handleChange}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="ml-2 text-sm text-gray-700">Show License Fee on Offer Sheet</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="showTaxRateOnOfferSheet"
            checked={!!dealData.showTaxRateOnOfferSheet}
            onChange={handleChange}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="ml-2 text-sm text-gray-700">Show Tax Rate on Offer Sheet</span>
        </label>
      </div>
    </FormSection>
  );
}
