
import React from 'react';
import FormSection from '../components/FormSection';
import { useAppStore } from '../store';

export default function BuyerInfoStep() {
  const { dealData, updateDealData } = useAppStore();
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateDealData({ [name]: value });
  };
  return (
    <FormSection title="Buyer Information" icon={null}>
      <div>
        <label className="block text-sm font-medium text-gray-700">First Name</label>
        <input type="text" name="buyerFirstName" value={dealData.buyerFirstName || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Last Name</label>
        <input type="text" name="buyerLastName" value={dealData.buyerLastName || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input type="tel" name="buyerPhone" value={dealData.buyerPhone || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" name="buyerEmail" value={dealData.buyerEmail || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
      </div>
    </FormSection>
  );
}
