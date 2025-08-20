
import React from 'react';
import FormSection from '../components/FormSection';
import { useAppStore } from '../store';

export default function AddonsStep() {
  const { dealData, updateDealData } = useAppStore();
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateDealData({ [name]: value });
  };
  return (
    <FormSection title="Value Add-ons" icon={null}>
      <div>
        <label className="block text-sm font-medium text-gray-700">Brake Plus</label>
        <input type="number" name="brakePlus" value={dealData.brakePlus || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Safe Guard</label>
        <input type="number" name="safeGuard" value={dealData.safeGuard || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Protection Package</label>
        <input type="number" name="protectionPackage" value={dealData.protectionPackage || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">GAP Insurance</label>
        <input type="number" name="gapInsurance" value={dealData.gapInsurance || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Extended Service Contract</label>
        <input type="number" name="serviceContract" value={dealData.serviceContract || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
    </FormSection>
  );
}
