import { roundToHundredth } from './roundToHundredth';
import { BO_TAX_RATE } from './constants';

export function calculateOffer(dealData, settings) {
	const newDealData = { ...dealData };

	const reconditioningCost = newDealData.isNewVehicle ? 0 : newDealData.reconditioningCost || 0;
	const baseInvestment = roundToHundredth(
		(newDealData.acquisitionCost || 0) +
			reconditioningCost +
			(newDealData.advertisingCost || 0) +
			(newDealData.flooringCost || 0)
	);
	newDealData.baseInvestment = baseInvestment;

	const sellingPrice = newDealData.sellingPrice || 0;
	const boTax = roundToHundredth(sellingPrice * BO_TAX_RATE);
	newDealData.boTax = boTax;

	const dealershipInvestment = roundToHundredth(baseInvestment + boTax);
	newDealData.dealershipInvestment = dealershipInvestment;

	const profit = roundToHundredth(sellingPrice - dealershipInvestment);
	newDealData.profit = profit;

	const roiPercentage = baseInvestment > 0 ? roundToHundredth((profit / baseInvestment) * 100) : 0;
	// Only update ROI if it's not the source of the change
	if (newDealData.lastChanged !== 'roi') {
		newDealData.roiPercentage = roiPercentage;
	}

	// Trade Devalue
	let totalTradeDevalue = 0;
	if (newDealData.tradeDevalueSelected && settings && settings.tradeDevalueItems) {
		totalTradeDevalue = newDealData.tradeDevalueSelected.reduce(
			(sum, idx) => sum + (settings.tradeDevalueItems[idx]?.price || 0),
			0
		);
	}
	newDealData.totalTradeDevalue = totalTradeDevalue;

	const netTrade = roundToHundredth((newDealData.tradeValue || 0) - (newDealData.tradePayOff || 0));
	newDealData.netTrade = netTrade;

	const getAddon = (key, fallback = 0) => {
		const val = newDealData[key];
		return val !== undefined && val !== '' ? Number(val) : fallback;
	};

	const totalAddons = roundToHundredth(
		(settings?.showProtectionPackage ? getAddon('protectionPackage', 0) : 0) +
			(settings?.showGapInsurance ? getAddon('gapInsurance', 0) : 0) +
			(settings?.showServiceContract ? getAddon('serviceContract', 0) : 0) +
			getAddon('brakePlus', 499) +
			getAddon('safeGuard', 249)
	);
	newDealData.totalAddons = totalAddons;

	let taxableAmount;
	if (newDealData.tradeIsLease) {
		taxableAmount = sellingPrice + totalAddons;
	} else {
		taxableAmount = sellingPrice + totalAddons - (newDealData.tradeValue || 0);
	}
	newDealData.taxableAmount = taxableAmount;

	const difference = roundToHundredth(taxableAmount);
	const salesTax = difference > 0 ? roundToHundredth(difference * ((newDealData.taxRate || 0) / 100)) : 0;
	newDealData.salesTax = salesTax;

	const licenseEstimate = Number(newDealData.licenseEstimate) || 0;
	const totalAmountFinanced = roundToHundredth(
		Number(difference) +
			(Number(newDealData.tradePayOff) || 0) +
			(Number(newDealData.docFee) || 0) +
			(Number(licenseEstimate) || 0) +
			(Number(salesTax) || 0)
	);
	newDealData.totalAmountFinanced = totalAmountFinanced;

	// Finance Options
	const selectedTerms = Array.isArray(newDealData.financeTerm)
		? newDealData.financeTerm.filter((t) => !isNaN(Number(t))).map(Number)
		: [Number(newDealData.financeTerm)].filter((t) => !isNaN(t));
	const selectedDowns = Array.isArray(newDealData.downPayment)
		? newDealData.downPayment.filter((d) => !isNaN(Number(d))).map(Number)
		: [Number(newDealData.downPayment)].filter((d) => !isNaN(d));
	const financeRate = newDealData.interestRate || 6.99;
	const financeTableRows = [];

	const calculateMonthlyPayment = (amount, rate, termMonths) => {
		if (!amount || !rate || !termMonths) return 0;
		const monthlyRate = rate / 12 / 100;
		return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
	};

	const sortedTerms = [...selectedTerms].sort((a, b) => a - b);
	const sortedDowns = [...selectedDowns].sort((a, b) => a - b);
	sortedDowns.forEach((down) => {
		sortedTerms.forEach((term) => {
			const amountFinancedForOption = totalAmountFinanced - down;
			const payment = calculateMonthlyPayment(amountFinancedForOption, financeRate, term);
			financeTableRows.push({
				down,
				term,
				amountFinanced: amountFinancedForOption,
				payment,
			});
		});
	});
	newDealData.financeTableRows = financeTableRows;

	return newDealData;
}

export function calculateSellingPriceFromROI(dealData) {
	const { baseInvestment, roiPercentage } = dealData;
	if (baseInvestment > 0) {
		const newSellingPrice = roundToHundredth((baseInvestment * (1 + (roiPercentage || 0) / 100)) / (1 - BO_TAX_RATE));
		return { ...dealData, sellingPrice: newSellingPrice, lastChanged: 'roi' };
	}
	return { ...dealData, sellingPrice: 0, lastChanged: 'roi' };
}
