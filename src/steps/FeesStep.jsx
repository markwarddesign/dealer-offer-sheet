
import React from 'react';
import FormSection from '../components/FormSection';
import { useAppStore } from '../store';

export default function FeesStep() {
  const { dealData, updateDealData } = useAppStore();
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateDealData({ [name]: value });
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
        <label className="block text-sm font-medium text-gray-700">Tire Fee</label>
        <input type="number" name="tireFee" value={dealData.tireFee || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Other Fees</label>
        <input type="number" name="otherFee" value={dealData.otherFee || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
        <input type="number" name="taxRate" value={dealData.taxRate || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
    </FormSection>
  );
}
