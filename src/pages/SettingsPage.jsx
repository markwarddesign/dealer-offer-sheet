import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatCurrency } from '../utils/formatCurrency';
import { ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  const { settings, setSettings, setPage } = useAppStore();
  // Local state mirrors SettingsModal logic
  const [tradeDevalueItems, setTradeDevalueItems] = useState(settings.tradeDevalueItems || []);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [wpflName, setWpflName] = useState(settings.wpflName || 'Warranty Protection for Life (WPFL)');
  const [wpflOptions, setWpflOptions] = useState(settings.wpflOptions || []);
  const [defaultWPFLIndex, setDefaultWPFLIndex] = useState(settings.defaultWPFLIndex ?? 0);
  const [oilChangeCost, setOilChangeCost] = useState(settings.oilChangeCost ?? 150);
  const [ocflYears, setOcflYears] = useState(settings.ocflYears ?? 5);
  const [showProtectionPackage, setShowProtectionPackage] = useState(settings.showProtectionPackage ?? true);
  const [showGapInsurance, setShowGapInsurance] = useState(settings.showGapInsurance ?? true);
  const [showServiceContract, setShowServiceContract] = useState(settings.showServiceContract ?? true);

  const handleAddItem = () => {
    if (!newItemLabel.trim() || isNaN(Number(newItemPrice))) return;
    setTradeDevalueItems([...tradeDevalueItems, { label: newItemLabel.trim(), price: Number(newItemPrice) }]);
    setNewItemLabel('');
    setNewItemPrice('');
  };
  const handleRemoveItem = idx => {
    setTradeDevalueItems(tradeDevalueItems.filter((_, i) => i !== idx));
  };
  const handleSave = () => {
    setSettings({
      ...settings,
      tradeDevalueItems,
      wpflName,
      wpflOptions,
      defaultWPFLIndex,
      oilChangeCost: Number(oilChangeCost) || 0,
      ocflYears: Number(ocflYears) || 1,
      showProtectionPackage,
      showGapInsurance,
      showServiceContract,
    });
    localStorage.setItem('offerSheetSettings', JSON.stringify({
      ...settings,
      tradeDevalueItems,
      wpflName,
      wpflOptions,
      defaultWPFLIndex,
      oilChangeCost: Number(oilChangeCost) || 0,
      ocflYears: Number(ocflYears) || 1,
      showProtectionPackage,
      showGapInsurance,
      showServiceContract,
    }));
    alert('Settings saved!');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <button
          onClick={() => setPage('form')}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300 flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Form
        </button>
      </div>
      <div>
        <label className="block font-semibold mb-2">Trade Devalue Items</label>
        <ul className="mb-2">
          {tradeDevalueItems.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 mb-1">
              <span className="flex-1">{item.label} <span className="text-gray-500">({formatCurrency(item.price)})</span></span>
              <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:underline text-xs">Remove</button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mb-2">
          <input type="text" placeholder="Item label" className="border rounded p-2 flex-1" value={newItemLabel} onChange={e => setNewItemLabel(e.target.value)} />
          <input type="number" placeholder="Price" className="border rounded p-2 w-24" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
          <button type="button" className="bg-red-600 text-white px-3 py-2 rounded" onClick={handleAddItem}>Add</button>
        </div>
      </div>
      <div className="mt-8 border-t pt-6">
        <label className="block font-semibold mb-2">WPFL & OCFL Settings</label>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <input type="text" className="border rounded p-2 flex-1 mb-2" value={wpflName} onChange={e => setWpflName(e.target.value)} placeholder="WPFL Name" />
            {wpflOptions.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-1">
                <input
                  type="text"
                  className="border rounded p-2 flex-1"
                  value={opt.label}
                  onChange={e => {
                    const newOpts = [...wpflOptions];
                    newOpts[idx].label = e.target.value;
                    setWpflOptions(newOpts);
                  }}
                  placeholder="Option Name"
                />
                <input
                  type="number"
                  className="border rounded p-2 w-24"
                  value={opt.price}
                  onChange={e => {
                    const newOpts = [...wpflOptions];
                    newOpts[idx].price = Number(e.target.value) || 0;
                    setWpflOptions(newOpts);
                  }}
                  placeholder="Price"
                />
                <input
                  type="radio"
                  name="defaultWPFL"
                  checked={defaultWPFLIndex === idx}
                  onChange={() => setDefaultWPFLIndex(idx)}
                  className="ml-2"
                  title="Set as default"
                />
                <span className="text-xs text-gray-500">Default</span>
                <button type="button" className="text-gray-500 hover:text-gray-900" onClick={() => {
                  if (idx > 0) {
                    const newOpts = [...wpflOptions];
                    [newOpts[idx-1], newOpts[idx]] = [newOpts[idx], newOpts[idx-1]];
                    setWpflOptions(newOpts);
                  }
                }}>↑</button>
                <button type="button" className="text-gray-500 hover:text-gray-900" onClick={() => {
                  if (idx < wpflOptions.length - 1) {
                    const newOpts = [...wpflOptions];
                    [newOpts[idx+1], newOpts[idx]] = [newOpts[idx], newOpts[idx+1]];
                    setWpflOptions(newOpts);
                  }
                }}>↓</button>
                <button type="button" className="text-red-500 hover:text-red-700" onClick={() => {
                  setWpflOptions(wpflOptions.filter((_, i) => i !== idx));
                  if (defaultWPFLIndex === idx) setDefaultWPFLIndex(0);
                }}>✕</button>
              </div>
            ))}
            <button type="button" className="bg-blue-600 text-white px-2 py-1 rounded text-xs mt-1 w-fit" onClick={() => setWpflOptions([...wpflOptions, { label: '', price: 0 }])}>Add Option</button>
          </div>
          <div className="flex gap-2 items-center">
            <input type="number" className="border rounded p-2 w-32" value={oilChangeCost} onChange={e => setOilChangeCost(e.target.value)} placeholder="Oil Change Cost" />
            <input type="number" className="border rounded p-2 w-32" value={ocflYears} onChange={e => setOcflYears(e.target.value)} placeholder="Years" min={1} />
            <span className="text-xs text-gray-500">Oil Change for Life (OCFL)</span>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t pt-6">
        <label className="block font-semibold mb-2">Show/Hide Value Add-ons</label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showProtectionPackage} onChange={e => setShowProtectionPackage(e.target.checked)} />
            Protection Package
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showGapInsurance} onChange={e => setShowGapInsurance(e.target.checked)} />
            GAP Insurance
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showServiceContract} onChange={e => setShowServiceContract(e.target.checked)} />
            Extended Service Contract
          </label>
        </div>
      </div>
      <div className="flex justify-end mt-8 gap-2">
        <button onClick={handleSave} className="px-4 py-2 rounded bg-red-600 text-white font-semibold">Save Settings</button>
      </div>
    </div>
  );
}
