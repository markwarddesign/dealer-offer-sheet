import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { formatCurrency } from '../utils/formatCurrency';
import NumberInput from '../components/NumberInput';
import { Landmark, SlidersHorizontal, BarChart, Eye } from 'lucide-react';

// --- Helper Functions ---

function calculateMonthlyPayment(amount, rate, termMonths) {
    if (!amount || !rate || !termMonths || amount <= 0 || rate <= 0 || termMonths <= 0) return 0;
    const monthlyRate = rate / 12 / 100;
    if (monthlyRate === 0) return amount / termMonths; // Simple division if rate is 0
    return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
}

// --- Constants ---

const downPaymentOptions = [0, 1000, 2500, 5000, 7500, 10000];
const financeTerms = [24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84];

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

const Card = ({ children, className = '' }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ title, icon }) => (
    <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-6">
        {icon}
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    </div>
);

const ToggleSwitch = ({ label, name, checked, onChange }) => (
    <div className="flex items-center justify-between py-3">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-200 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
    </div>
);

const OptionButton = ({ label, isSelected, onClick, disabled }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`px-3 py-1.5 rounded-lg font-semibold border text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 ${
            isSelected 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-white text-gray-800 border-gray-300 hover:bg-indigo-50 hover:border-indigo-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {label}
    </button>
);


// --- Main Component ---

const FinanceStep = () => {
    const { dealData, updateDealData } = useAppStore();
    
    const [customDown, setCustomDown] = useState('');

    const rate = dealData.interestRate !== undefined && dealData.interestRate !== '' ? Number(dealData.interestRate) : 6.99;
    const selectedTerms = dealData.financeTerm || [];
    const selectedDowns = dealData.downPayment || [];

    const sellingPrice = Number(dealData.sellingPrice) || 0;
    const docFee = Number(dealData.docFee) || 0;
    const otherFee = Number(dealData.otherFee) || 0;
    const rebates = Number(dealData.rebates) || 0;

    const handleToggle = (e) => {
        const { name, checked } = e.target;
        updateDealData({ [name]: checked });
    };

    const handleTermsChange = (term) => {
        let newTerms;
        if (selectedTerms.includes(term)) {
            newTerms = selectedTerms.filter(t => t !== term);
        } else {
            if (selectedTerms.length >= 5) return; // Limit to 5 selections
            newTerms = [...selectedTerms, term];
        }
        updateDealData({ financeTerm: newTerms.sort((a, b) => a - b) });
    };

    const handleDownsChange = (down) => {
        let newDowns;
        if (selectedDowns.includes(down)) {
            newDowns = selectedDowns.filter(d => d !== down);
        } else {
            if (selectedDowns.length >= 4) return; // Limit to 4 selections
            newDowns = [...selectedDowns, down];
        }
        updateDealData({ downPayment: newDowns.sort((a, b) => a - b) });
    };

    const handleCustomDownChange = (e) => {
        const value = e.target.value;
        setCustomDown(value);

        // Remove old custom value
        const nonCustomDowns = selectedDowns.filter(d => !downPaymentOptions.includes(d) && d !== parseFloat(customDown));
        
        let newDowns = [...nonCustomDowns, ...selectedDowns.filter(d => downPaymentOptions.includes(d))];

        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue > 0) {
            if (newDowns.length < 4) {
                newDowns.push(numericValue);
            }
        }
        updateDealData({ downPayment: newDowns.sort((a, b) => a - b) });
    };
    
    useEffect(() => {
        // Find if there's a custom down payment in the store and set it to the input
        const customValue = selectedDowns.find(d => !downPaymentOptions.includes(d));
        setCustomDown(customValue ? String(customValue) : '');
    }, [selectedDowns]);


    const renderPaymentTable = () => {
        const terms = selectedTerms.length ? selectedTerms : [72];
        const downs = selectedDowns.length ? selectedDowns : [0];

        return (
            <table className="w-full text-sm text-center rounded-lg border-collapse">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 font-semibold text-gray-700 rounded-tl-lg">Down Payment</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Term</th>
                        {dealData.showAmountFinancedOnOfferSheet && <th className="px-4 py-3 font-semibold text-gray-700">Amount Financed</th>}
                        <th className="px-4 py-3 font-semibold text-gray-700 rounded-tr-lg">Monthly Payment</th>
                    </tr>
                </thead>
                <tbody>
                    {downs.map((down, dIdx) => {
                        const amountToFinance = sellingPrice - down + docFee + otherFee - rebates;
                        return terms.map((term, tIdx) => {
                            const payment = calculateMonthlyPayment(amountToFinance, rate, term);
                            const isFirstRowForDown = tIdx === 0;
                            const isLastRowForDown = tIdx === terms.length - 1;

                            return (
                                <tr key={`${down}-${term}`} className="bg-white hover:bg-gray-50/50">
                                    {isFirstRowForDown && (
                                        <td rowSpan={terms.length} className={`px-4 py-3 font-bold text-gray-800 align-middle border-b ${isLastRowForDown ? '' : 'border-gray-200'}`}>
                                            {formatCurrency(down)}
                                        </td>
                                    )}
                                    <td className={`px-4 py-3 text-gray-600 align-middle border-b ${isLastRowForDown && dIdx === downs.length - 1 ? 'border-transparent' : 'border-gray-200'}`}>{term} mo</td>
                                    {dealData.showAmountFinancedOnOfferSheet && <td className={`px-4 py-3 text-gray-600 align-middle border-b ${isLastRowForDown && dIdx === downs.length - 1 ? 'border-transparent' : 'border-gray-200'}`}>{formatCurrency(amountToFinance)}</td>}
                                    <td className={`px-4 py-3 font-bold text-lg text-gray-900 align-middle border-b ${isLastRowForDown && dIdx === downs.length - 1 ? 'border-transparent' : 'border-gray-200'}`}>{formatCurrency(payment)}</td>
                                </tr>
                            );
                        });
                    })}
                </tbody>
            </table>
        );
    };

    return (
        <div className="bg-gray-50/50 p-4 sm:p-6 lg:p-8 font-sans">
            <FormSection title="Finance Options" icon={<Landmark className="h-8 w-8 text-gray-600" />}>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- CONTROLS COLUMN --- */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                            <CardHeader title="Finance Terms" icon={<SlidersHorizontal className="h-6 w-6 text-indigo-600" />} />
                            <div className="flex flex-wrap gap-2">
                                {financeTerms.map(term => (
                                    <OptionButton
                                        key={term}
                                        label={`${term} mo`}
                                        isSelected={selectedTerms.includes(term)}
                                        onClick={() => handleTermsChange(term)}
                                        disabled={!selectedTerms.includes(term) && selectedTerms.length >= 5}
                                    />
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <CardHeader title="Down Payments" icon={<SlidersHorizontal className="h-6 w-6 text-indigo-600" />} />
                            <div className="flex flex-wrap gap-2 mb-4">
                                {downPaymentOptions.map(down => (
                                    <OptionButton
                                        key={down}
                                        label={formatCurrency(down)}
                                        isSelected={selectedDowns.includes(down)}
                                        onClick={() => handleDownsChange(down)}
                                        disabled={!selectedDowns.includes(down) && selectedDowns.length >= 4}
                                    />
                                ))}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Custom Down</label>
                                <NumberInput
                                    value={customDown}
                                    onChange={handleCustomDownChange}
                                    placeholder="e.g. 1500"
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader title="Display Options" icon={<Eye className="h-6 w-6 text-indigo-600" />} />
                            <div className="divide-y divide-gray-200">
                                <ToggleSwitch label="Show Interest Rate" name="showInterestRateOnOfferSheet" checked={dealData.showInterestRateOnOfferSheet} onChange={handleToggle} />
                                <ToggleSwitch label="Show Amount Financed" name="showAmountFinancedOnOfferSheet" checked={dealData.showAmountFinancedOnOfferSheet ?? true} onChange={handleToggle} />
                            </div>
                        </Card>
                    </div>

                    {/* --- PAYMENT TABLE COLUMN --- */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader title="Payment Matrix" icon={<BarChart className="h-6 w-6 text-indigo-600" />} />
                            <div className="flex justify-between items-center text-sm mb-4 px-1">
                                <span className="font-semibold text-gray-700">
                                    Interest Rate: <span className="text-indigo-600 font-bold">{rate.toFixed(2)}%</span>
                                </span>
                                {rebates > 0 && (
                                    <span className="font-semibold text-gray-700">
                                        Rebates Applied: <span className="text-green-600 font-bold">{formatCurrency(rebates)}</span>
                                    </span>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                {renderPaymentTable()}
                            </div>
                        </Card>
                    </div>
                </div>

            </FormSection>
        </div>
    );
};

export default FinanceStep;
