import React from 'react';
import { useAppStore } from '../store';
import { ArrowLeft, Plus, Trash2, SlidersHorizontal, Droplet, TrendingDown, ShieldCheck, RotateCcw, Settings as SettingsIcon, ArrowUp, ArrowDown } from 'lucide-react';
import NumberInput from '../components/NumberInput';
import Card from '../components/Card';
import CardHeader from '../components/CardHeader';
import InputField from '../components/InputField';
import NumberInputField from '../components/NumberInputField';

// --- Reusable UI Components ---

const FormSection = ({ title, icon, children }) => (
    <div className="space-y-8">
        <div className="flex items-center gap-4">
            {icon}
            <h2 className="text-3xl font-bold tracking-tight text-gray-800">{title}</h2>
        </div>
        <div className="space-y-8">{children}</div>
    </div>
);

const SettingsPage = ({ onBack }) => {
	const { settings, setSettings, resetSettings } = useAppStore();

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		const val = type === 'checkbox' ? checked : value;
		setSettings({
			...settings,
			[name]: val,
		});
	};

	const handleListChange = (e, listName, index, field) => {
		const newList = [...(settings[listName] || [])];
		const value = e.target.value;
		if (field) {
			newList[index] = { ...newList[index], [field]: value };
		} else {
			newList[index] = value;
		}
		setSettings({ ...settings, [listName]: newList });
	};

	const addListItem = (listName, newItem) => {
		setSettings({ ...settings, [listName]: [...(settings[listName] || []), newItem] });
	};

	const removeListItem = (listName, index) => {
		const newList = [...(settings[listName] || [])];
		newList.splice(index, 1);
		setSettings({ ...settings, [listName]: newList });
	};

	const moveListItem = (listName, index, direction) => {
		const newList = [...(settings[listName] || [])];
		const item = newList[index];
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= newList.length) return;
		newList.splice(index, 1);
		newList.splice(newIndex, 0, item);
		setSettings({ ...settings, [listName]: newList });
	};

	return (
		<div className="bg-gray-50/50 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-800 flex items-center gap-4">
                        <SettingsIcon className="h-8 w-8 text-gray-600" />
                        Application Settings
                    </h1>
                    <p className="mt-2 text-gray-500">Manage default values and application-wide settings.</p>
                </div>
				<button
					onClick={onBack}
					className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300 flex items-center gap-2"
				>
					<ArrowLeft className="h-5 w-5" />
					Back to Form
				</button>
			</div>

            <div className="space-y-8">
                {/* General Settings */}
                <Card>
                    <CardHeader title="General" icon={<SlidersHorizontal className="h-6 w-6 text-indigo-600" />} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <NumberInputField
                            label="Default ROI (%)"
                            name="roiPercentage"
                            value={settings.roiPercentage ?? 5}
                            onChange={handleChange}
                            isCurrency={false}
                        />
                        <InputField
                            label="WPFL Name"
                            name="wpflName"
                            value={settings.wpflName ?? 'Warranty Protection for Life (WPFL)'}
                            onChange={handleChange}
                        />
                    </div>
                </Card>

                {/* OCFL Settings */}
                <Card>
                    <CardHeader title="Oil Change For Life (OCFL)" icon={<Droplet className="h-6 w-6 text-indigo-600" />} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <NumberInputField
                            label="Price per Service"
                            name="ocflPrice"
                            min={0}
                            value={settings.ocflPrice ?? 45}
                            onChange={handleChange}
                        />
                        <NumberInputField
                            label="Services per Year"
                            name="ocflServicesPerYear"
                            value={settings.ocflServicesPerYear ?? 3}
                            onChange={handleChange}
                            isCurrency={false}
                        />
                    </div>
                </Card>

                {/* Trade Devalue Items */}
                <Card>
                    <CardHeader title="Trade Devalue Items" icon={<TrendingDown className="h-6 w-6 text-indigo-600" />} />
                    <div className="space-y-3">
                        {(settings.tradeDevalueItems || []).map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 border rounded-lg bg-gray-50/50">
                                <InputField
                                    value={item.label}
                                    onChange={(e) => handleListChange(e, 'tradeDevalueItems', index, 'label')}
                                    placeholder="Label"
                                />
                                <div className="w-40">
                                    <NumberInput
                                        name="price"
                                        value={item.price}
                                        onChange={(e) => handleListChange(e, 'tradeDevalueItems', index, 'price')}
                                        placeholder="Price"
                                    />
                                 </div>
                                <button onClick={() => removeListItem('tradeDevalueItems', index)} className="text-gray-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => addListItem('tradeDevalueItems', { label: '', price: 0 })}
                        className="mt-4 bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-200 transition-colors duration-300 flex items-center gap-2 text-sm"
                    >
                        <Plus className="h-5 w-5" />
                        Add Devalue Item
                    </button>
                </Card>

                {/* WPFL Options */}
                <Card>
                    <CardHeader title="Warranty Protection for Life (WPFL) Options" icon={<ShieldCheck className="h-6 w-6 text-indigo-600" />} />
                    <div className="space-y-3">
                        {(settings.wpflOptions || []).map((option, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 border rounded-lg bg-gray-50/50">
                                <InputField
                                    value={option.label}
                                    onChange={(e) => handleListChange(e, 'wpflOptions', index, 'label')}
                                    placeholder="Label"
                                />
                                <div className="w-40">
                                    <NumberInput
                                        name="price"
                                        value={option.price}
                                        onChange={(e) => handleListChange(e, 'wpflOptions', index, 'price')}
                                        placeholder="Price"
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-indigo-600">
                                    <input
                                        type="radio"
                                        name="defaultWPFL"
                                        checked={settings.defaultWPFLIndex === index}
                                        onChange={() => setSettings({ ...settings, defaultWPFLIndex: index })}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    />
                                    Default
                                </label>
                                <button onClick={() => moveListItem('wpflOptions', index, -1)} disabled={index === 0} className="p-2 text-gray-400 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed">
                                    <ArrowUp className="h-5 w-5" />
                                </button>
                                <button onClick={() => moveListItem('wpflOptions', index, 1)} disabled={index === (settings.wpflOptions || []).length - 1} className="p-2 text-gray-400 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed">
                                    <ArrowDown className="h-5 w-5" />
                                </button>
                                <button onClick={() => removeListItem('wpflOptions', index)} className="text-gray-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => addListItem('wpflOptions', { label: '', price: 0 })}
                        className="mt-4 bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-200 transition-colors duration-300 flex items-center gap-2 text-sm"
                    >
                        <Plus className="h-5 w-5" />
                        Add WPFL Option
                    </button>
                </Card>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        onClick={resetSettings}
                        className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-300 transition-colors duration-300 flex items-center gap-2"
                    >
                        <RotateCcw className="h-5 w-5" />
                        Reset to Defaults
                    </button>
                </div>
            </div>
		</div>
	);
};

export default SettingsPage;
