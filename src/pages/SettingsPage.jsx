import React from 'react';
import { useAppStore } from '../store';
import { ArrowLeft, PlusCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export default function SettingsPage({ onBack }) {
  const { settings, setSettings } = useAppStore();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleListChange = (e, listName, index, field) => {
    const newList = [...(settings[listName] || [])];
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    if (field) {
      newList[index] = { ...newList[index], [field]: value };
    } else {
      newList[index] = value;
    }
    setSettings({ [listName]: newList });
  };

  const addListItem = (listName, newItem) => {
    setSettings({ [listName]: [...(settings[listName] || []), newItem] });
  };

  const removeListItem = (listName, index) => {
    const newList = [...(settings[listName] || [])];
    newList.splice(index, 1);
    setSettings({ [listName]: newList });
  };

  const moveListItem = (listName, index, direction) => {
    const newList = [...(settings[listName] || [])];
    const item = newList[index];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newList.length) return;
    newList.splice(index, 1);
    newList.splice(newIndex, 0, item);
    setSettings({ [listName]: newList });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <button
          onClick={onBack}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300 flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Form
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="roiPercentage" className="block text-sm font-medium text-gray-700">Default ROI (%)</label>
            <input
              type="number"
              id="roiPercentage"
              name="roiPercentage"
              value={settings.roiPercentage ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="wpflName" className="block text-sm font-medium text-gray-700">WPFL Name</label>
            <input
              type="text"
              id="wpflName"
              name="wpflName"
              value={settings.wpflName ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>
        </div>
      </div>

      {/* OCFL Settings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Oil Change For Life (OCFL)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="ocflPrice" className="block text-sm font-medium text-gray-700">Price per Service</label>
            <input
              type="number"
              id="ocflPrice"
              name="ocflPrice"
              value={settings.ocflPrice ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="ocflServicesPerYear" className="block text-sm font-medium text-gray-700">Services per Year</label>
            <input
              type="number"
              id="ocflServicesPerYear"
              name="ocflServicesPerYear"
              value={settings.ocflServicesPerYear ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>
        </div>
      </div>

      {/* Trade Devalue Items */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Trade Devalue Items</h2>
        <div className="space-y-2">
          {(settings.tradeDevalueItems || []).map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
              <input
                type="text"
                value={item.label}
                onChange={(e) => handleListChange(e, 'tradeDevalueItems', index, 'label')}
                className="flex-grow rounded-md border-gray-300 shadow-sm p-2"
                placeholder="Label"
              />
              <input
                type="number"
                value={item.price}
                onChange={(e) => handleListChange(e, 'tradeDevalueItems', index, 'price')}
                className="w-24 rounded-md border-gray-300 shadow-sm p-2"
                placeholder="Price"
              />
              <button onClick={() => removeListItem('tradeDevalueItems', index)} className="text-red-500 hover:text-red-700 p-2">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => addListItem('tradeDevalueItems', { label: '', price: 0 })}
          className="mt-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition-colors duration-300 flex items-center"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add Devalue Item
        </button>
      </div>

      {/* WPFL Options */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Warranty Protection for Life (WPFL) Options</h2>
        <div className="space-y-2">
          {(settings.wpflOptions || []).map((option, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
              <input
                type="text"
                value={option.label}
                onChange={(e) => handleListChange(e, 'wpflOptions', index, 'label')}
                className="flex-grow rounded-md border-gray-300 shadow-sm p-2"
                placeholder="Label"
              />
              <input
                type="number"
                value={option.price}
                onChange={(e) => handleListChange(e, 'wpflOptions', index, 'price')}
                className="w-24 rounded-md border-gray-300 shadow-sm p-2"
                placeholder="Price"
              />
              <input
                type="radio"
                name="defaultWPFL"
                checked={settings.defaultWPFLIndex === index}
                onChange={() => setSettings({ ...settings, defaultWPFLIndex: index })}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Default</span>
              <button onClick={() => moveListItem('wpflOptions', index, -1)} disabled={index === 0} className="p-2 text-gray-500 hover:text-gray-800 disabled:opacity-50">
                <ArrowUp className="h-5 w-5" />
              </button>
              <button onClick={() => moveListItem('wpflOptions', index, 1)} disabled={index === (settings.wpflOptions || []).length - 1} className="p-2 text-gray-500 hover:text-gray-800 disabled:opacity-50">
                <ArrowDown className="h-5 w-5" />
              </button>
              <button onClick={() => removeListItem('wpflOptions', index)} className="text-red-500 hover:text-red-700 p-2">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => addListItem('wpflOptions', { label: '', price: 0 })}
          className="mt-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition-colors duration-300 flex items-center"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add WPFL Option
        </button>
      </div>

      {/* Add-on Visibility */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Add-on Visibility</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center justify-between bg-gray-50 p-3 rounded-md border">
            <span className="text-sm font-medium text-gray-700">Protection Package</span>
            <input type="checkbox" name="showProtectionPackage" checked={!!settings.showProtectionPackage} onChange={handleChange} className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
          </label>
          <label className="flex items-center justify-between bg-gray-50 p-3 rounded-md border">
            <span className="text-sm font-medium text-gray-700">GAP Insurance</span>
            <input type="checkbox" name="showGapInsurance" checked={!!settings.showGapInsurance} onChange={handleChange} className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
          </label>
          <label className="flex items-center justify-between bg-gray-50 p-3 rounded-md border">
            <span className="text-sm font-medium text-gray-700">Service Contract</span>
            <input type="checkbox" name="showServiceContract" checked={!!settings.showServiceContract} onChange={handleChange} className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
          </label>
        </div>
      </div>
    </div>
  );
}
