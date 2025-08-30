
import React from 'react';
import FormSection from '../components/FormSection';
import { useAppStore } from '../store';
import NumberInput from '../components/NumberInput';

export default function AddonsStep() {
  const { dealData, updateDealData, settings } = useAppStore();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    updateDealData({ [name]: newValue });
  };
  return (
    <FormSection title="Value Add-ons & Options" noGrid={true}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Addons */}
        <div className="flex flex-col gap-4 bg-white p-5 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-3">Add-ons</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Brake Plus</label>
            <NumberInput name="brakePlus" value={dealData.brakePlus} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Safe Guard</label>
            <NumberInput name="safeGuard" value={dealData.safeGuard} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>
          {settings?.showProtectionPackage && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Protection Package</label>
              <NumberInput name="protectionPackage" value={dealData.protectionPackage} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
            </div>
          )}
          {settings?.showGapInsurance && (
            <div>
              <label className="block text-sm font-medium text-gray-700">GAP Insurance</label>
              <NumberInput name="gapInsurance" value={dealData.gapInsurance} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
            </div>
          )}
          {settings?.showServiceContract && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Extended Service Contract</label>
              <NumberInput name="serviceContract" value={dealData.serviceContract} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
            </div>
          )}
        </div>

        {/* Column 2: Options */}
        <div className="flex flex-col gap-4">
            <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 flex flex-col gap-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-3">Options</h3>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">WPFL</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="wpfl" checked={dealData.wpfl ?? true} onChange={handleChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">OCFL</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="ocfl" checked={dealData.ocfl ?? true} onChange={handleChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                </div>
            </div>
        </div>
      </div>
    </FormSection>
  );
}
