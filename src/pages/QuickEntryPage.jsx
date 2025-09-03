import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatCurrency } from '../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';
import { User, Car, Tag, Banknote, Trash2, ArrowRight, ChevronDown, Search } from 'lucide-react';
import { lookupVin } from '../utils/vinLookup';

import Card from '../components/Card';
import CardHeader from '../components/CardHeader';
import InputField from '../components/InputField';
import NumberInputField from '../components/NumberInputField';
import Toggle from '../components/Toggle';

function calculateMonthlyPayment(amount, rate, termMonths) {
    if (!amount || !rate || !termMonths || amount <= 0 || rate <= 0 || termMonths <= 0) return 0;
    const monthlyRate = rate / 12 / 100;
    if (monthlyRate === 0) return amount / termMonths; // Simple division if rate is 0
    return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
}

const QuickEntryPage = () => {
	const { dealData, updateDealData, updateRoi, settings } = useAppStore();
	const navigate = useNavigate();
	const [vinLoading, setVinLoading] = useState({ vehicle: false, trade: false });
	const [vinFieldErrors, setVinFieldErrors] = useState({});

	const handleVinLookup = async (vin, type) => {
		if (!vin) return;
		setVinLoading(prev => ({ ...prev, [type]: true }));
		setVinFieldErrors({});

		try {
			const vehicleData = await lookupVin(vin);
			const updates = {};
			const fieldErrors = {};
			
			const fieldMapping = {
				Year: 'year',
				Make: 'make',
				Model: 'model',
				Mpg: 'mpg'
			};

			Object.keys(fieldMapping).forEach(field => {
				const stateKey = `${type}Vehicle${field}`;
				const dataKey = fieldMapping[field];
				if (vehicleData[dataKey]) {
					updates[stateKey] = vehicleData[dataKey];
				} else {
					updates[stateKey] = '';
					fieldErrors[stateKey] = true;
				}
			});

			if (type === 'vehicle') {
				updates.vehicleVin = vin;
			} else {
				updates.tradeVehicleVin = vin;
			}

			updateDealData(updates);
			setVinFieldErrors(fieldErrors);

		} catch (error) {
			console.error(`VIN lookup failed for ${type}:`, error);
			// If the whole lookup fails, mark all fields as errored
			const errors = {
				[`${type}VehicleYear`]: true,
				[`${type}VehicleMake`]: true,
				[`${type}VehicleModel`]: true,
				[`${type}VehicleMpg`]: true,
			};
			setVinFieldErrors(errors);
		} finally {
			setVinLoading(prev => ({ ...prev, [type]: false }));
		}
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		let val = type === 'checkbox' ? checked : value;

		if (name === 'roiPercentage') {
			updateRoi(Number(val));
			return;
		}

		if (name === 'downPayment' || name === 'financeTerm') {
			val = value.split(',').map(s => s.trim()).map(Number).filter(n => !isNaN(n));
		}

		updateDealData({ [name]: val });
	};

	const adjustedPrice = (dealData.sellingPrice || 0) - (dealData.rebates || 0);

	const defaultDevalueItems = settings?.tradeDevalueItems || [];
	const selectedDefaultDevalueSum = (dealData.tradeDevalueSelected || []).reduce((acc, index) => {
		const item = defaultDevalueItems[index];
		return acc + (item ? Number(item.price) || 0 : 0);
	}, 0);
	const customDevalueSum = (dealData.tradeDevalueItems || []).reduce((acc, item) => acc + (Number(item.value) || 0), 0);
	const totalDevaluation = selectedDefaultDevalueSum + customDevalueSum;
	const tradeMarketValue = dealData.tradeMarketValue || 0;
	const calculatedTradeValue = tradeMarketValue - totalDevaluation;
	const tradePayOff = dealData.tradePayOff || 0;
	const netTradeEquity = calculatedTradeValue - tradePayOff;

	const downPaymentOptions = [0, 1000, 2500, 5000, 7500, 10000];
	const financeTermOptions = [24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84];

	React.useEffect(() => {
		if (dealData.isNewVehicle) {
			updateDealData({ reconditioningCost: 0 });
		}
	}, [dealData.isNewVehicle, updateDealData]);

	React.useEffect(() => {
		if (!dealData.isNewVehicle) {
			updateDealData({ rebates: 0 });
		}
	}, [dealData.isNewVehicle, updateDealData]);

	React.useEffect(() => {
		if (dealData.hasTrade) {
			updateDealData({ tradeValue: calculatedTradeValue });
		} else {
			updateDealData({ tradeValue: 0 });
		}
	}, [calculatedTradeValue, dealData.hasTrade, updateDealData]);

	const handleAddDevalueItem = () => {
		const items = dealData.tradeDevalueItems || [];
		updateDealData({ tradeDevalueItems: [...items, { name: '', value: '' }] });
	};

	const handleDevalueItemChange = (index, e) => {
		const { name, value } = e.target;
		const items = [...dealData.tradeDevalueItems];
		items[index] = { ...items[index], [name]: value };
		updateDealData({ tradeDevalueItems: items });
	};

	const handleRemoveDevalueItem = (index) => {
		const items = dealData.tradeDevalueItems.filter((_, i) => i !== index);
		updateDealData({ tradeDevalueItems: items });
	};

	const handleDevalueSelection = (index) => {
		const currentSelected = dealData.tradeDevalueSelected || [];
		const newSelected = currentSelected.includes(index)
			? currentSelected.filter((i) => i !== index)
			: [...currentSelected, index];
		updateDealData({ tradeDevalueSelected: newSelected });
	};

	const handleDownPaymentChange = (value) => {
		const currentDownPayments = dealData.downPayment || [];
		const newDownPayments = currentDownPayments.includes(value)
			? currentDownPayments.filter(d => d !== value)
			: [...currentDownPayments, value];
		updateDealData({ downPayment: newDownPayments });
	};

	const handleFinanceTermChange = (value) => {
		const currentFinanceTerms = dealData.financeTerm || [];
		const newFinanceTerms = currentFinanceTerms.includes(value)
			? currentFinanceTerms.filter(t => t !== value)
			: [...currentFinanceTerms, value];
		updateDealData({ financeTerm: newFinanceTerms });
	};

	const renderPaymentTable = () => {
        const rate = dealData.interestRate !== undefined && dealData.interestRate !== '' ? Number(dealData.interestRate) : 0;
        
        const selectedDowns = [...(dealData.downPayment || [])];
        const customDown = parseFloat(dealData.customDownPayment);
        if (!isNaN(customDown) && customDown > 0 && !selectedDowns.includes(customDown)) {
            selectedDowns.push(customDown);
        }
        selectedDowns.sort((a, b) => a - b);

        const terms = (dealData.financeTerm || []).length ? dealData.financeTerm : [dealData.defaultTerm || 72];
        const downs = selectedDowns.length ? selectedDowns : [0];

        const sellingPrice = Number(dealData.sellingPrice) || 0;
        const docFee = Number(dealData.docFee) || 0;
        const otherFee = Number(dealData.otherFee) || 0;
        const rebates = Number(dealData.rebates) || 0;

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
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-800 flex items-center gap-4">
                        Quick Entry
                    </h1>
                    <p className="mt-2 text-gray-500">A streamlined view for rapid deal configuration.</p>
                </div>
				<button
					onClick={() => navigate('/offer')}
					className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300 flex items-center gap-2"
				>
					View Offer Sheet
                    <ArrowRight className="h-5 w-5" />
				</button>
			</div>

			<div className="space-y-8">
				{/* Buyer & Vehicle */}
				<Card>
                    <CardHeader title="Buyer & Vehicle" icon={<User className="h-6 w-6 text-indigo-600" />} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <InputField label="First Name" name="buyerFirstName" value={dealData.buyerFirstName} onChange={handleChange} />
                        <InputField label="Last Name" name="buyerLastName" value={dealData.buyerLastName} onChange={handleChange} />
                        <InputField label="Phone" name="buyerPhone" value={dealData.buyerPhone} onChange={handleChange} />
                        <InputField label="Email" name="buyerEmail" value={dealData.buyerEmail} onChange={handleChange} />
                        <NumberInputField label="Year" name="vehicleYear" value={dealData.vehicleYear} onChange={handleChange} isCurrency={false} className={vinFieldErrors.vehicleYear ? 'border-red-500' : ''} />
                        <InputField label="Make" name="vehicleMake" value={dealData.vehicleMake} onChange={handleChange} className={vinFieldErrors.vehicleMake ? 'border-red-500' : ''} />
                        <InputField label="Model" name="vehicleModel" value={dealData.vehicleModel} onChange={handleChange} className={vinFieldErrors.vehicleModel ? 'border-red-500' : ''} />
                        <div className="relative">
							<InputField label="VIN" name="vehicleVin" value={dealData.vehicleVin} onChange={handleChange} />
							<button
								onClick={() => handleVinLookup(dealData.vehicleVin, 'vehicle')}
								disabled={vinLoading.vehicle}
								className="absolute right-1 bottom-1 bg-indigo-500 text-white p-1.5 rounded-md hover:bg-indigo-600 disabled:bg-gray-400"
								aria-label="Look up VIN"
							>
								{vinLoading.vehicle ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="h-4 w-4" />}
							</button>
						</div>
                        <InputField label="Stock #" name="vehicleStock" value={dealData.vehicleStock} onChange={handleChange} />
                        <NumberInputField label="Mileage" name="vehicleMileage" value={dealData.vehicleMileage} onChange={handleChange} isCurrency={false} />
                        <InputField label="Color" name="vehicleColor" value={dealData.vehicleColor} onChange={handleChange} />
                        <NumberInputField label="MPG" name="vehicleMpg" value={dealData.vehicleMpg} onChange={handleChange} isCurrency={false} className={vinFieldErrors.vehicleMpg ? 'border-red-500' : ''} />
                        <div className="flex items-end pb-2">
                            <Toggle label="New Vehicle" name="isNewVehicle" checked={dealData.isNewVehicle} onChange={handleChange} />
                        </div>
                        {dealData.isNewVehicle && <NumberInputField label="MSRP" name="msrp" value={dealData.msrp} onChange={handleChange} />}
                        
                    </div>
                </Card>

                {/* Pricing & Deal */}
                <Card>
                    <CardHeader title="Pricing & Deal" icon={<Tag className="h-6 w-6 text-indigo-600" />}>
                        <div className="text-right">
                            <span className="text-sm font-medium text-gray-500">Adjusted Price</span>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(adjustedPrice)}</p>
                        </div>
                    </CardHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <NumberInputField label="Market Value" name="marketValue" value={dealData.marketValue} onChange={handleChange} />
                        <NumberInputField label="Selling Price" name="sellingPrice" value={dealData.sellingPrice} onChange={handleChange} />
                        <NumberInputField label="ROI (%)" name="roiPercentage" value={dealData.roiPercentage} onChange={handleChange} isCurrency={false} withIncrement step={1} />
                        <NumberInputField label={`Acquisition Cost ${dealData.isNewVehicle ? '/ Invoice' : ''}`} name="acquisitionCost" value={dealData.acquisitionCost} onChange={handleChange} />
                        <NumberInputField label="Reconditioning" name="reconditioningCost" value={dealData.reconditioningCost} onChange={handleChange} disabled={dealData.isNewVehicle} />
                        <NumberInputField label="Advertising" name="advertisingCost" value={dealData.advertisingCost} onChange={handleChange} />
                        <NumberInputField label="Flooring" name="flooringCost" value={dealData.flooringCost} onChange={handleChange} />
                        <NumberInputField label="Rebates" name="rebates" value={dealData.rebates} onChange={handleChange} disabled={!dealData.isNewVehicle} />
                    </div>
                </Card>

                {/* Trade-In */}
                <Card>
                    <CardHeader title="Trade-In" icon={<Car className="h-6 w-6 text-indigo-600" />}>
                        <Toggle label="Has Trade-In?" name="hasTrade" checked={dealData.hasTrade} onChange={handleChange} />
                    </CardHeader>
                    {dealData.hasTrade && (
                        <div className="pt-4 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                                <NumberInputField label="Market Value" name="tradeMarketValue" value={dealData.tradeMarketValue} onChange={handleChange} />
                                <NumberInputField label="Trade Value" name="tradeValue" value={dealData.tradeValue} onChange={handleChange} readOnly />
                                <NumberInputField label="Trade Payoff" name="tradePayOff" value={dealData.tradePayOff} onChange={handleChange} />
                                <div className="relative">
							<InputField label="VIN" name="tradeVehicleVin" value={dealData.tradeVehicleVin} onChange={handleChange} />
							<button
								onClick={() => handleVinLookup(dealData.tradeVehicleVin, 'trade')}
								disabled={vinLoading.trade}
								className="absolute right-1 bottom-1 bg-indigo-500 text-white p-1.5 rounded-md hover:bg-indigo-600 disabled:bg-gray-400"
								aria-label="Look up trade-in VIN"
							>
								{vinLoading.trade ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="h-4 w-4" />}
							</button>
						</div>
                        <NumberInputField label="Year" name="tradeVehicleYear" value={dealData.tradeVehicleYear} onChange={handleChange} isCurrency={false} className={vinFieldErrors.tradeVehicleYear ? 'border-red-500' : ''} />
                        <InputField label="Make" name="tradeVehicleMake" value={dealData.tradeVehicleMake} onChange={handleChange} className={vinFieldErrors.tradeVehicleMake ? 'border-red-500' : ''} />
                        <InputField label="Model" name="tradeVehicleModel" value={dealData.tradeVehicleModel} onChange={handleChange} className={vinFieldErrors.tradeVehicleModel ? 'border-red-500' : ''} />
                        <NumberInputField label="Mileage" name="tradeVehicleMileage" value={dealData.tradeVehicleMileage} onChange={handleChange} isCurrency={false} />
                        <NumberInputField label="MPG" name="tradeVehicleMpg" value={dealData.tradeVehicleMpg} onChange={handleChange} isCurrency={false} withIncrement step className={vinFieldErrors.tradeVehicleMpg ? 'border-red-500' : ''} />
								<NumberInputField label="# in Market" name="vehiclesInMarket" value={dealData.vehiclesInMarket} onChange={handleChange} isCurrency={false} withIncrement step />
                        		<NumberInputField label="Avg Days to Sell" name="avgDaysToSell" value={dealData.avgDaysToSell} onChange={handleChange} isCurrency={false} withIncrement step />
                                <div className="flex items-end pb-2">
                                    <Toggle label="Is Trade a Lease?" name="tradeIsLease" checked={dealData.tradeIsLease} onChange={handleChange} />
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-gray-200">
                                <h4 className="text-lg font-semibold mb-4 text-gray-800">Devaluation</h4>
                                {defaultDevalueItems.length > 0 && (
                                    <div className="mb-4">
                                        <h5 className="text-sm font-medium text-gray-600 mb-2">Default Items</h5>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                            {defaultDevalueItems.map((item, index) => (
                                                <label key={index} className="flex items-center space-x-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-300 cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={(dealData.tradeDevalueSelected || []).includes(index)}
                                                        onChange={() => handleDevalueSelection(index)}
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-gray-800">{item.label} ({formatCurrency(item.price)})</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <h5 className="text-sm font-medium text-gray-600 mb-2">Custom Items</h5>
                                <div className="space-y-3">
                                    {(dealData.tradeDevalueItems || []).map((item, index) => (
                                        <div key={index} className="flex gap-2 items-end">
                                            <div className="flex-grow">
                                                <InputField label="Item" name="name" value={item.name} onChange={(e) => handleDevalueItemChange(index, e)} placeholder="e.g. Scratches"/>
                                            </div>
                                            <div className="w-32">
                                                <NumberInputField label="Value" name="value" value={item.value} onChange={(e) => handleDevalueItemChange(index, e)} />
                                            </div>
                                            <button onClick={() => handleRemoveDevalueItem(index)} className="bg-white text-gray-500 p-2 rounded-md shadow-sm hover:bg-red-50 hover:text-red-600 border border-gray-300 transition-colors">
                                                <Trash2 className="h-5 w-5"/>
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={handleAddDevalueItem} className="mt-2 bg-gray-200 text-gray-700 font-semibold py-1.5 px-3 rounded-lg hover:bg-gray-300 transition-colors text-xs shadow-sm">
                                        + Add Item
                                    </button>
                                </div>
                                <div className="border-t-2 border-dashed border-gray-300 pt-4 mt-6 space-y-2.5">
                                    <div className="flex justify-between items-center text-md font-bold">
                                        <span className="text-gray-800">Net Trade Value (ACV):</span>
                                        <span className="text-green-600">{formatCurrency(calculatedTradeValue)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mt-2 bg-yellow-100/60 p-2 rounded-md">
                                        <span className="font-semibold text-yellow-800">Reconditioning:</span>
                                        <span className="font-bold text-yellow-900">{formatCurrency(totalDevaluation)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm bg-orange-100/60 p-2 rounded-md">
                                        <span className="font-semibold text-orange-800">Payoff:</span>
                                        <span className="font-bold text-orange-900">{formatCurrency(tradePayOff)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-bold pt-2">
                                        <span className="text-gray-800">Net Equity:</span>
                                        <span className={netTradeEquity >= 0 ? 'text-sky-600' : 'text-red-600'}>{formatCurrency(netTradeEquity)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Fees & Taxes */}
                <Card>
                    <CardHeader title="Fees & Taxes" icon={<Banknote className="h-6 w-6 text-indigo-600" />} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <NumberInputField label="Doc Fee" name="docFee" value={dealData.docFee} onChange={handleChange} />
                        <NumberInputField label="License Estimate" name="licenseEstimate" value={dealData.licenseEstimate} onChange={handleChange} />
                        <NumberInputField label="Title Fee" name="titleFee" value={dealData.titleFee} onChange={handleChange} />
                        <NumberInputField label="Other Fees" name="otherFee" value={dealData.otherFee} onChange={handleChange} />
                        <NumberInputField label="Tire Fee" name="tireFee" value={dealData.tireFee} onChange={handleChange} />
                        <NumberInputField label="Tax Rate (%)" name="taxRate" value={dealData.taxRate} onChange={handleChange} isCurrency={false} withIncrement={true} step={0.1} roundToHundredth={true} />
                    </div>
                </Card>

                {/* Finance Options */}
                <Card>
                    <CardHeader title="Finance Options" icon={<Banknote className="h-6 w-6 text-indigo-600" />} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                        {/* Down Payments Column */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-800">Down Payments</h4>
                            <div className="flex flex-wrap gap-2">
                                {downPaymentOptions.map(dp => (
                                    <button key={dp} onClick={() => handleDownPaymentChange(dp)} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${ (dealData.downPayment || []).includes(dp) ? 'bg-indigo-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300' }`}>
                                        {formatCurrency(dp)}
                                    </button>
                                ))}
                            </div>
                            <NumberInputField label="Custom Down Payment" name="customDownPayment" value={dealData.customDownPayment} onChange={handleChange} />
                        </div>
                        {/* Finance Terms Column */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-800">Finance Terms (Months)</h4>
                            <div className="flex flex-wrap gap-2">
                                {financeTermOptions.map(term => (
                                    <button key={term} onClick={() => handleFinanceTermChange(term)} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${ (dealData.financeTerm || []).includes(term) ? 'bg-indigo-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300' }`}>
                                        {term}
                                    </button>
                                ))}
                            </div>
							<NumberInputField label="Default APR (%)" name="interestRate" value={dealData.interestRate} onChange={handleChange} isCurrency={false} withIncrement={true} step={0.1} roundToHundredth={true} />
                        </div>
                    </div>
					{/* Payment Matrix */}
								
                    <details className="group pt-6 border-t border-gray-200">
                        <summary className="flex justify-between items-center cursor-pointer list-none">
                                <h4 className="text-lg font-semibold mb-4 text-gray-800">Payment Matrix</h4>
                            <div className="mr-2">
                                <ChevronDown className="h-6 w-6 text-gray-500 transition-transform duration-300 group-open:rotate-180" />
                            </div>
                        </summary>
                        <div className="pt-4">
                            {renderPaymentTable()}
                        </div>
                    </details>
           
                </Card>

				{/* Offer Sheet Display Options */}
				<Card>
					<CardHeader title="Offer Sheet Display Options" icon={<Banknote className="h-6 w-6 text-indigo-600" />} />
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
						<Toggle label="Show Interest Rate" name="showInterestRateOnOfferSheet" checked={dealData.showInterestRateOnOfferSheet} onChange={handleChange} withWrapper={true} />
						<Toggle label="Show License Fee" name="showLicenseFeeOnOfferSheet" checked={dealData.showLicenseFeeOnOfferSheet} onChange={handleChange} withWrapper={true} />
						<Toggle label="Show Tax Rate" name="showTaxRateOnOfferSheet" checked={dealData.showTaxRateOnOfferSheet} onChange={handleChange} withWrapper={true} />
						<Toggle label="Show Amount Financed" name="showAmountFinancedOnOfferSheet" checked={dealData.showAmountFinancedOnOfferSheet} onChange={handleChange} withWrapper={true} />
					</div>
				</Card>
			</div>

			

			<div className="flex justify-end mt-8">
				<button
					onClick={() => navigate('/offer')}
					className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300 flex items-center gap-2"
				>
					View Offer Sheet
					<ArrowRight className="h-5 w-5" />
				</button>
			</div>
		</div>
	);
};

export default QuickEntryPage;
